import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const reportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const verifiedOn = new Date().toISOString().slice(0, 10)
const concurrency = Math.max(1, Number(process.env.SCHOLARTUBE_VERIFY_CONCURRENCY || 5))

const requestHeaders = {
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
}

let youtubeClient = null

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
  let latestError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...requestHeaders, ...options.headers },
        signal: AbortSignal.timeout(25000),
      })
      if (response.ok) return response
      await response.arrayBuffer()
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`HTTP ${response.status}`)
      }
      latestError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      latestError = error
    }

    if (attempt < attempts) await delay(500 * (2 ** (attempt - 1)))
  }

  throw latestError
}

function extractJsonArray(text, property) {
  const marker = `"${property}":`
  const markerIndex = text.indexOf(marker)
  if (markerIndex < 0) return null
  const start = text.indexOf('[', markerIndex + marker.length)
  if (start < 0) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < text.length; index += 1) {
    const character = text[index]
    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }
    if (character === '"') inString = true
    else if (character === '[') depth += 1
    else if (character === ']') {
      depth -= 1
      if (depth === 0) return JSON.parse(text.slice(start, index + 1))
    }
  }

  return null
}

function textFromRuns(value) {
  if (!value) return ''
  if (value.simpleText) return value.simpleText
  return value.runs?.map((run) => run.text).join('') || ''
}

function uniqueTracks(tracks) {
  const seen = new Set()
  return tracks.filter((track) => {
    const key = `${track.languageCode}:${track.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function verifyYouTube(resource) {
  if (!youtubeClient) throw new Error('YouTube embed client was not initialized')
  const response = await fetchWithRetry(`https://www.youtube-nocookie.com/youtubei/v1/player?key=${encodeURIComponent(youtubeClient.apiKey)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      referer: `https://www.youtube-nocookie.com/embed/${resource.videoId}`,
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: youtubeClient.clientVersion,
          hl: 'en',
        },
      },
      videoId: resource.videoId,
    }),
  })
  const player = await response.json()
  const microformat = player.microformat?.playerMicroformatRenderer
  const publishDate = microformat?.publishDate || microformat?.uploadDate
  if (!publishDate) throw new Error(`YouTube publish date unavailable (${player.playabilityStatus?.status || 'unknown player status'})`)

  const rawTracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
  const subtitleTracks = uniqueTracks(rawTracks.map((track) => {
    const baseName = textFromRuns(track.name) || track.languageCode || 'Unknown language'
    const automatic = track.kind === 'asr' || track.vssId?.startsWith('a.') || /auto-generated/i.test(baseName)
    return {
      languageCode: track.languageCode || '',
      name: automatic && !/auto-generated/i.test(baseName) ? `${baseName} (auto-generated)` : baseName,
      automatic,
    }
  }))

  return {
    publishedAt: new Date(publishDate).toISOString().slice(0, 10),
    publishedAtVerified: true,
    subtitleLanguages: subtitleTracks.map((track) => track.name),
    subtitleTracks,
    subtitlesVerified: subtitleTracks.length > 0,
    subtitleVerificationScope: subtitleTracks.length
      ? 'video'
      : 'blocked by YouTube anti-bot verification on this network',
    metadataVerifiedVia: 'YouTube privacy-enhanced embed player metadata',
    metadataVerificationStatus: subtitleTracks.length ? 'Verified' : 'Partial',
  }
}

async function verifyBilibili(resource) {
  const referer = `https://www.bilibili.com/video/${resource.videoId}`
  const viewResponse = await fetchWithRetry(`https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(resource.videoId)}`, {
    headers: { referer },
  })
  const view = await viewResponse.json()
  if (view.code !== 0 || !view.data) throw new Error(`Bilibili view API code ${view.code}: ${view.message || 'unknown error'}`)

  const pages = view.data.pages?.length ? view.data.pages : [{ cid: view.data.cid }]
  const subtitleTracks = []
  let verifiedParts = 0

  for (const page of pages) {
    try {
      const playerResponse = await fetchWithRetry(`https://api.bilibili.com/x/player/v2?bvid=${encodeURIComponent(resource.videoId)}&cid=${encodeURIComponent(page.cid)}`, {
        headers: { referer },
      })
      const player = await playerResponse.json()
      if (player.code !== 0 || !player.data) throw new Error(`player API code ${player.code}`)
      verifiedParts += 1
      for (const track of player.data.subtitle?.subtitles || []) {
        subtitleTracks.push({
          languageCode: track.lan || '',
          name: track.lan_doc || track.lan || 'Unknown language',
          automatic: false,
        })
      }
      await delay(80)
    } catch {
      // The final scope records whether all parts or only a subset were checked.
    }
  }

  if (!verifiedParts) throw new Error('Bilibili subtitle metadata could not be read for any video part')
  const uniqueSubtitleTracks = uniqueTracks(subtitleTracks)

  return {
    publishedAt: new Date(view.data.pubdate * 1000).toISOString().slice(0, 10),
    publishedAtVerified: true,
    subtitleLanguages: uniqueSubtitleTracks.map((track) => track.name),
    subtitleTracks: uniqueSubtitleTracks,
    subtitlesVerified: true,
    subtitleVerificationScope: verifiedParts === pages.length ? `all ${pages.length} part${pages.length === 1 ? '' : 's'}` : `${verifiedParts} of ${pages.length} parts`,
    metadataVerifiedVia: 'Bilibili public view/player APIs',
    metadataVerificationStatus: 'Verified',
  }
}

async function initializeYouTubeClient(resource) {
  const response = await fetchWithRetry(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(resource.videoId)}?hl=en`)
  const html = await response.text()
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1]
  const clientVersion = html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1]
  if (!apiKey || !clientVersion) throw new Error('YouTube embed client configuration was unavailable')
  return { apiKey, clientVersion }
}

async function verifyResource(resource) {
  const verifier = resource.platform === 'YouTube'
    ? verifyYouTube
    : resource.platform === 'Bilibili'
      ? verifyBilibili
      : null

  if (!verifier) throw new Error(`Unsupported platform: ${resource.platform}`)
  return verifier(resource)
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let nextIndex = 0
  let completed = 0

  async function run() {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= items.length) return
      results[index] = await worker(items[index], index)
      completed += 1
      if (completed % 20 === 0 || completed === items.length) {
        console.log(`Verified ${completed}/${items.length}`)
      }
      await delay(100)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
const firstYouTubeResource = resources.find((resource) => resource.platform === 'YouTube')
if (firstYouTubeResource) youtubeClient = await initializeYouTubeClient(firstYouTubeResource)
const failures = []
const updatedResources = await mapWithConcurrency(resources, concurrency, async (resource) => {
  try {
    const metadata = await verifyResource(resource)
    return {
      ...resource,
      ...metadata,
      metadataVerificationStatus: metadata.metadataVerificationStatus || 'Verified',
      lastVerifiedAt: verifiedOn,
      lastVerificationAttemptAt: verifiedOn,
      metadataVerificationError: '',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push({ id: resource.id, platform: resource.platform, url: resource.url, error: message })
    return {
      ...resource,
      metadataVerificationStatus: 'Failed',
      lastVerificationAttemptAt: verifiedOn,
      metadataVerificationError: message,
    }
  }
})

const originalFields = Object.keys(resources[0])
const metadataFields = [
  'publishedAt',
  'publishedAtVerified',
  'subtitleLanguages',
  'subtitleTracks',
  'subtitlesVerified',
  'subtitleVerificationScope',
  'metadataVerifiedVia',
  'metadataVerificationStatus',
  'lastVerifiedAt',
  'lastVerificationAttemptAt',
  'metadataVerificationError',
]
const fields = [...originalFields, ...metadataFields.filter((field) => !originalFields.includes(field))]
const csv = [
  fields.join(','),
  ...updatedResources.map((resource) => fields.map((field) => csvCell(resource[field])).join(',')),
].join('\r\n')

const report = {
  verifiedOn,
  total: updatedResources.length,
  verified: updatedResources.filter((resource) => resource.metadataVerificationStatus === 'Verified').length,
  partial: updatedResources.filter((resource) => resource.metadataVerificationStatus === 'Partial').length,
  failed: failures.length,
  byPlatform: Object.groupBy(updatedResources, (resource) => resource.platform),
  failures,
}
report.byPlatform = Object.fromEntries(Object.entries(report.byPlatform).map(([platform, items]) => [platform, {
  total: items.length,
  verified: items.filter((item) => item.metadataVerificationStatus === 'Verified').length,
  partial: items.filter((item) => item.metadataVerificationStatus === 'Partial').length,
  failed: items.filter((item) => item.metadataVerificationStatus === 'Failed').length,
}]))

await writeFile(jsonPath, `${JSON.stringify(updatedResources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

console.log(JSON.stringify({
  verifiedOn,
  total: report.total,
  verified: report.verified,
  failed: report.failed,
  byPlatform: report.byPlatform,
  reportPath,
}, null, 2))

if (failures.length) process.exitCode = 2
