import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const reportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const collectedOn = '2026-08-15'
const sourceTierA = 'A | Official / Original Creator / Organizer'

const requestHeaders = {
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
}

const seriesDefinitions = [
  {
    seriesId: 'stanford-cs231n-spring-2025',
    seriesTitle: 'Stanford CS231N: Deep Learning for Computer Vision — Spring 2025',
    videoIds: [
      'pdqofxJeBN8', '25zD5qJHYsk', 'f3g1zGdxptI', 'kG2lAPBF7zA', 'wElqklprhPE',
      '9MvD-XsowsE', 'zbHXQRUNlH0', 'Edr4uZFh4EE', 'mQOK0Mfyrkk', 'XSfmOH_xVSU',
      'g8UaBfj6Sh8',
    ],
    orders: [2, 4, 5, 7, 10, 11, 13, 14, 16, 17, 18],
    speaker: 'Stanford Online course team',
    recommendation: 'Core',
    classify: () => ({
      focusArea: 'Vision',
      domain: 'Computer Vision',
      keywords: 'Computer Vision; Deep Learning; Vision-Language Models; Video Understanding',
    }),
  },
  {
    seriesId: 'stanford-cme296-spring-2026',
    seriesTitle: 'Stanford CME296: Diffusion & Large Vision Models — Spring 2026',
    videoIds: ['_WaR2fjZpEQ', 'agN3AlfGFrk', 'WUUq6TVAu8U', 'IvXTl3yj-4Y', 'iNaRBp4T57Q', 'oyLUvz9nR6E'],
    orders: [2, 3, 4, 6, 7, 8],
    speaker: 'Stanford Online course team',
    recommendation: 'Core',
    classify: (videoId) => videoId === 'oyLUvz9nR6E'
      ? {
          focusArea: 'World Model',
          domain: 'World Models',
          keywords: 'Generative Models; Video Generation; World Models; Diffusion Models',
        }
      : {
          focusArea: 'Vision',
          domain: 'Computer Vision / 3D Vision',
          keywords: 'Diffusion Models; Flow Matching; Generative Models; Computer Vision',
        },
  },
  {
    seriesId: 'stanford-cme295-autumn-2025',
    seriesTitle: 'Stanford CME295: Transformers & LLMs — Autumn 2025',
    videoIds: ['yT84Y5zCnaA', 'Q5baLehv5So', 'VlA_jt_3Qc4', 'PmW_TMQ3l0I', 'k5Fh-UgTuCo', '8fNP4N46RRo', 'Q86qzJ1K1Ss'],
    orders: [2, 3, 4, 5, 6, 8, 9],
    speaker: 'Stanford Online course team',
    recommendation: 'Core',
    classify: (videoId) => ['k5Fh-UgTuCo', '8fNP4N46RRo', 'Q86qzJ1K1Ss'].includes(videoId)
      ? {
          focusArea: 'Agent',
          domain: 'Agents / Tool Use / Reasoning',
          keywords: 'Large Language Models; Reasoning; Evaluation; Agents',
        }
      : {
          focusArea: 'Other',
          domain: 'Natural Language Processing',
          keywords: 'Large Language Models; Transformers; Model Training; Model Tuning',
        },
  },
  {
    seriesId: 'stanford-cs336-spring-2025',
    seriesTitle: 'Stanford CS336: Language Modeling from Scratch — Spring 2025',
    videoIds: [
      'SQ3fZ1sAqXI', 'msHyYioAyNE', 'ptFiH_bHnJw', 'LPv1KfUXLCo', '6OBtO9niT00',
      'E8Mju53VB00', 'l1RJcDjzK8M', 'LHpr5ytssLo', '6Q-ESEmDf4Q', 'fcgPYo3OtV0',
      'OSYuUqGBQxw', 'x-R5l2HsXqM', 'WePxmeXU1xg', '9Cd0THLS1t0', 'Dfu7vC9jo4w',
      '46f2QTDB08Q', 'JdGFdViaOJk',
    ],
    speaker: 'Stanford Online course team',
    recommendation: 'Core',
    classify: (videoId) => ['Dfu7vC9jo4w', '46f2QTDB08Q', 'JdGFdViaOJk'].includes(videoId)
      ? {
          focusArea: 'Agent',
          domain: 'Agents / Tool Use / Reasoning',
          keywords: 'Language Models; Alignment; Reinforcement Learning; RLHF',
        }
      : {
          focusArea: 'Other',
          domain: 'Deep Learning Foundations',
          keywords: 'Language Models; Model Training; Scaling Laws; AI Systems',
        },
  },
  {
    seriesId: 'berkeley-llm-agents-mooc-fall-2024',
    seriesTitle: 'UC Berkeley LLM Agents MOOC — Fall 2024',
    videoIds: ['QAgR4uQ15rc', '6y2AnWol7oo', 'f3KKx9LWntQ', '-yf-e-9FvOc', 'JEMYuzrKLUw', 'Sy1psHS3w3I', 'QL-FS_Zcmyo'],
    speakers: ['Dawn Song', 'Ben Mann', 'Percy Liang', 'Nicolas Chapados', 'Omar Khattab', 'Burak Gokturk', 'Denny Zhou'],
    recommendation: 'Core',
    classify: () => ({
      focusArea: 'Agent',
      domain: 'Agents / Tool Use / Reasoning',
      keywords: 'Agents; Large Language Models; Reasoning; Agent Safety; Compound AI Systems',
    }),
  },
  {
    seriesId: 'berkeley-agentic-ai-mooc-fall-2025',
    seriesTitle: 'UC Berkeley Agentic AI MOOC — Fall 2025',
    videoIds: [
      'CvZDJxd4LKM', 'iDhzzugMOLA', 'ntjOxjZMaac', 'sfJM4LaiYsM', 'yqPIsTTdUkc',
      'HV8pugcFVO0', 'SrLcGdVOb9w', 'xNxrBHZPDvM', '3l0Zxus34es', 'xqRAS6rAouo',
      'r1qZpYAmqmg',
    ],
    speakers: [
      'Dawn Song', 'Peter Stone', 'Oriol Vinyals', 'Clay Bavor', 'James Zou', 'Sida Wang',
      'Noam Brown', 'Weizhu Chen', 'Jiantao Jiao', 'Yangqing Jia', 'Yann Dubois',
    ],
    recommendation: 'Core',
    classify: () => ({
      focusArea: 'Agent',
      domain: 'Agents / Tool Use / Reasoning',
      keywords: 'Agentic AI; Multi-Agent Systems; Reasoning; Agent Training; Agent Evaluation',
    }),
  },
  {
    seriesId: 'eth-robot-learning-spring-2026',
    seriesTitle: 'ETH Zürich Robot Learning: From Fundamentals to Foundation Models — Spring 2026',
    videoIds: [
      '5-Bb84eTTqQ', 'Ef4R5s1LqoQ', '90raNpc11tQ', 'AdTGz8YnnlE', 'qd6Ldsuu46I',
      'imSTfMJjp7M', 'cTTmUZlOF2s', 'dtofzDY9zuo', 'CxhrjQuGEuE', 'eL4lcy1KNzE',
    ],
    orders: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    speaker: 'Oier Mees',
    recommendation: 'Core',
    classify: (videoId) => videoId === 'cTTmUZlOF2s'
      ? {
          focusArea: 'World Model',
          domain: 'World Models',
          keywords: 'World Models; Robot Learning; Planning; Embodied AI',
        }
      : videoId === 'CxhrjQuGEuE'
        ? {
            focusArea: 'Agent',
            domain: 'Agents / Tool Use / Reasoning',
            keywords: 'Embodied Reasoning; Test-time Scaling; Robot Learning; Agents',
          }
        : {
            focusArea: 'Robotics',
            domain: 'Robotics',
            keywords: 'Robot Learning; Embodied AI; Reinforcement Learning; Robot Policies',
          },
  },
  {
    seriesId: 'deepmind-ucl-rl-2021',
    seriesTitle: 'DeepMind × UCL Reinforcement Learning Lecture Series — 2021',
    videoIds: [
      'TCCjZe0y4Qc', 'aQJP3Z2Ho8U', 'zSOMeug_i_M', 'XpbLq7rIJAA', 'eaWfWoVUTEw',
      't9uf9cuogBo', 'ook46h2Jfb4', 'FKl8kM4finE', 'y3oqOjHilio', 'AJejcug2brU',
      'u84MFu1nG4g', 'cVzvNZOBaJ4', 'siDtNqlPoLk',
    ],
    speaker: 'DeepMind and UCL course team',
    recommendation: 'Recommended',
    classify: (videoId) => videoId === 'FKl8kM4finE'
      ? {
          focusArea: 'World Model',
          domain: 'World Models',
          keywords: 'Reinforcement Learning; Planning; Models; World Models',
        }
      : {
          focusArea: 'Other',
          domain: 'Deep Reinforcement Learning',
          keywords: 'Reinforcement Learning; Dynamic Programming; Policy Learning; Deep Learning',
        },
  },
  {
    seriesId: 'mit-6-8210-underactuated-robotics-spring-2024',
    seriesTitle: 'MIT 6.8210: Underactuated Robotics — Spring 2024',
    videoIds: [
      'uyyBT-MHhLE', 'l2CwE3Wf7ww', 'GPvw92IKO44', 'GElVy0WTOys', 'UBPL0IbyJy4',
      'ZBS9-4LkSIQ', 'qbuyy7ZcP9M', 'ywFpp1dy0zQ', 'e1BXMe64xJ8', 'wND0k16gCdk',
      'IQlwn9wLnJs', 'j0Phrs3ATK0', 'N37FMfOioK0', 'P64JhXLsjwY', 'LF6IkHSRtaY',
      'mqyAs9CKVGw', 'ChiQgvVvgKM', 'Nj8FvDZ4d9I', 'QYDsB0qs_x8', 'eEOmmpA1GAw',
      'QIDisUxobFk', '5fYG1JLwBSc', 'ww1flzLixHo',
    ],
    orders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24],
    speaker: 'Russ Tedrake',
    recommendation: 'Recommended',
    classify: () => ({
      focusArea: 'Robotics',
      domain: 'Robotics',
      keywords: 'Robotics; Control; Dynamics; Motion Planning; Robot Learning',
    }),
  },
]

const standaloneDefinitions = [
  {
    videoId: 'EvSe0ktD95k', section: 'Talk', speaker: 'Yann LeCun', format: 'Research Talk',
    focusArea: 'World Model', domain: 'World Models / Predictive Intelligence',
    keywords: 'World Models; JEPA; Predictive Intelligence; Autonomous Machine Intelligence', recommendation: 'Core',
  },
  {
    videoId: 'kChwwFb5gMU', section: 'Talk', speaker: 'NVIDIA Developer team', format: 'Technical Talk',
    focusArea: 'World Model', domain: 'World Models / Predictive Intelligence',
    keywords: 'World Foundation Models; Physical AI; Video Generation; NVIDIA Cosmos', recommendation: 'Core',
  },
  {
    videoId: 'n5x6yXDj0uo', section: 'Interview', speaker: 'Shlomi Fruchter and Jack Parker-Holder', format: 'Research Interview',
    focusArea: 'World Model', domain: 'World Models / Predictive Intelligence',
    keywords: 'World Models; Interactive Environments; Simulation; Google DeepMind Genie', recommendation: 'Core',
  },
  {
    videoId: 'jIB_joS7ww8', section: 'Course', speaker: 'RSS 2024 tutorial team', format: 'Technical Tutorial',
    focusArea: 'Robotics', domain: 'Robotics / Embodied AI',
    keywords: 'Robot Learning; Supervised Policy Learning; Imitation Learning; Real Robots', recommendation: 'Recommended',
  },
  {
    videoId: 'LP5OCa20Zpg', section: 'Talk', speaker: 'Anthropic team', format: 'Engineering Talk',
    focusArea: 'Agent', domain: 'Agents / Tool Use / Reasoning',
    keywords: 'AI Agents; Tool Use; Agent Design; Engineering Practice', recommendation: 'Recommended',
  },
]

const excludedShortDemoIds = new Set(['PDKhUknuQDg', '5Jx2QgEUZUI', 'OVX-eTLyA9g', '9Uch931cDx8', '4MvGnmmP3c0', 'UObzWjPb6XM'])

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchWithRetry(url, options = {}, attempts = 4) {
  let latestError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...requestHeaders, ...options.headers },
        signal: AbortSignal.timeout(30000),
      })
      if (response.ok) return response
      await response.arrayBuffer()
      latestError = new Error(`HTTP ${response.status}`)
      if (![429, 500, 502, 503, 504].includes(response.status)) throw latestError
    } catch (error) {
      latestError = error
    }
    if (attempt < attempts) await delay(800 * (2 ** (attempt - 1)))
  }
  throw latestError
}

function textFromRuns(value) {
  if (!value) return ''
  if (value.simpleText) return value.simpleText
  return value.runs?.map((run) => run.text).join('') || ''
}

function subtitleMetadata(player) {
  const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  const seen = new Set()
  const subtitleTracks = tracks.map((track) => {
    const baseName = textFromRuns(track.name) || track.languageCode || 'Unknown language'
    const automatic = track.kind === 'asr' || track.vssId?.startsWith('a.') || /auto-generated/i.test(baseName)
    return {
      languageCode: track.languageCode || '',
      name: automatic && !/auto-generated/i.test(baseName) ? `${baseName} (auto-generated)` : baseName,
      automatic,
    }
  }).filter((track) => {
    const key = `${track.languageCode}:${track.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return {
    subtitleLanguages: subtitleTracks.map((track) => track.name),
    subtitleTracks,
    subtitlesVerified: subtitleTracks.length > 0,
    subtitleVerificationScope: subtitleTracks.length
      ? 'video'
      : 'blocked by YouTube anti-bot verification on this network',
    metadataVerificationStatus: subtitleTracks.length ? 'Verified' : 'Partial',
  }
}

async function initializeYouTubeClient(videoId) {
  const response = await fetchWithRetry(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?hl=en`)
  const html = await response.text()
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1]
  const clientVersion = html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1]
  if (!apiKey || !clientVersion) throw new Error('YouTube embed client configuration was unavailable')
  return { apiKey, clientVersion }
}

async function fetchYouTubeMetadata(videoId, client) {
  const response = await fetchWithRetry(`https://www.youtube-nocookie.com/youtubei/v1/player?key=${encodeURIComponent(client.apiKey)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      referer: `https://www.youtube-nocookie.com/embed/${videoId}`,
    },
    body: JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion: client.clientVersion, hl: 'en' } },
      videoId,
    }),
  })
  const player = await response.json()
  const details = player.videoDetails
  const microformat = player.microformat?.playerMicroformatRenderer
  const publishedAt = microformat?.publishDate || microformat?.uploadDate
  if (!details?.title || !details.author || !details.lengthSeconds || !publishedAt) {
    throw new Error(`${videoId}: incomplete public metadata (${player.playabilityStatus?.status || 'unknown status'})`)
  }
  return {
    title: details.title,
    channel: details.author,
    durationMinutes: Math.max(1, Math.round(Number(details.lengthSeconds) / 60)),
    viewCount: Number(details.viewCount || 0),
    publishedAt: publishedAt.slice(0, 10),
    ...subtitleMetadata(player),
  }
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
      if (completed % 10 === 0 || completed === items.length) console.log(`Fetched ${completed}/${items.length}`)
      await delay(120)
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

function editorialDefinition(videoId) {
  const standalone = standaloneDefinitions.find((definition) => definition.videoId === videoId)
  if (standalone) return { ...standalone, seriesId: '', seriesTitle: '', seriesOrder: null }
  for (const series of seriesDefinitions) {
    const index = series.videoIds.indexOf(videoId)
    if (index < 0) continue
    return {
      videoId,
      section: 'Course',
      speaker: series.speakers?.[index] ?? series.speaker,
      format: 'Course Lecture',
      recommendation: series.recommendation,
      ...series.classify(videoId),
      seriesId: series.seriesId,
      seriesTitle: series.seriesTitle,
      seriesOrder: series.orders?.[index] ?? index + 1,
    }
  }
  throw new Error(`No editorial definition for ${videoId}`)
}

const candidateIds = [
  ...seriesDefinitions.flatMap((series) => series.videoIds),
  ...standaloneDefinitions.map((definition) => definition.videoId),
]
if (candidateIds.length !== 110 || new Set(candidateIds).size !== 110) {
  throw new Error(`Expected 110 unique candidate IDs, found ${candidateIds.length}/${new Set(candidateIds).size}`)
}
if (candidateIds.some((videoId) => excludedShortDemoIds.has(videoId))) {
  throw new Error('An excluded official short demo was included in the candidate list')
}

const existingResources = JSON.parse(await readFile(jsonPath, 'utf8'))
const existingIds = new Set(existingResources.map((resource) => resource.videoId))
const overlaps = candidateIds.filter((videoId) => existingIds.has(videoId))
if (overlaps.length) throw new Error(`Candidate IDs already exist: ${overlaps.join(', ')}`)

const client = await initializeYouTubeClient(candidateIds[0])
const metadataRows = await mapWithConcurrency(candidateIds, 4, (videoId) => fetchYouTubeMetadata(videoId, client))
const nextId = Math.max(...existingResources.map((resource) => Number(resource.id.replace(/^ST-/, '')) || 0)) + 1

const additions = candidateIds.map((videoId, index) => {
  const editorial = editorialDefinition(videoId)
  const metadata = metadataRows[index]
  return {
    id: `ST-${String(nextId + index).padStart(3, '0')}`,
    section: editorial.section,
    domain: editorial.domain,
    keywords: editorial.keywords,
    language: 'English',
    title: metadata.title,
    speaker: editorial.speaker,
    channel: metadata.channel,
    format: editorial.format,
    durationMinutes: metadata.durationMinutes,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    platform: 'YouTube',
    viewCount: metadata.viewCount,
    sourceTier: sourceTierA,
    recommendation: editorial.recommendation,
    status: 'Verified',
    collectedOn,
    notes: 'Added from an official university, research institution, conference, or original creator source; public YouTube metadata verified.',
    videoId,
    focusArea: editorial.focusArea,
    publishedAt: metadata.publishedAt,
    subtitleLanguages: metadata.subtitleLanguages,
    subtitleTracks: metadata.subtitleTracks,
    subtitlesVerified: metadata.subtitlesVerified,
    subtitleVerificationScope: metadata.subtitleVerificationScope,
    metadataVerifiedVia: 'YouTube privacy-enhanced embed player metadata',
    metadataVerificationStatus: metadata.metadataVerificationStatus,
    lastVerifiedAt: collectedOn,
    lastVerificationAttemptAt: collectedOn,
    metadataVerificationError: '',
    publishedAtVerified: true,
    seriesId: editorial.seriesId,
    seriesTitle: editorial.seriesTitle,
    seriesOrder: editorial.seriesOrder,
  }
})

const upgradedExistingResources = existingResources.map((resource) => {
  if (resource.videoId === 'X0k14u6pSxw') {
    return {
      ...resource,
      speaker: 'Oier Mees',
      sourceTier: sourceTierA,
      recommendation: 'Core',
      notes: 'Official ETH Zürich Robot Learning course lecture published by the course instructor.',
    }
  }
  if (resource.videoId === 'cRu4EqBswbk') {
    return {
      ...resource,
      speaker: 'Russ Tedrake',
      sourceTier: sourceTierA,
      recommendation: 'Recommended',
      notes: 'Official MIT 6.8210 Underactuated Robotics course lecture published by the course instructor.',
    }
  }
  return resource
})

const updatedResources = [...upgradedExistingResources, ...additions]
const fields = Object.keys(updatedResources[0])
const csv = [
  fields.join(','),
  ...updatedResources.map((resource) => fields.map((field) => csvCell(resource[field])).join(',')),
].join('\r\n')

const byPlatform = {}
for (const resource of updatedResources) {
  const platform = byPlatform[resource.platform] ?? { total: 0, verified: 0, partial: 0, failed: 0 }
  platform.total += 1
  const status = resource.metadataVerificationStatus?.toLowerCase()
  if (status === 'verified') platform.verified += 1
  else if (status === 'partial') platform.partial += 1
  else if (status === 'failed') platform.failed += 1
  byPlatform[resource.platform] = platform
}
const metadataReport = {
  verifiedOn: collectedOn,
  total: updatedResources.length,
  verified: Object.values(byPlatform).reduce((sum, platform) => sum + platform.verified, 0),
  partial: Object.values(byPlatform).reduce((sum, platform) => sum + platform.partial, 0),
  failed: Object.values(byPlatform).reduce((sum, platform) => sum + platform.failed, 0),
  byPlatform,
  failures: [],
}

await writeFile(jsonPath, `${JSON.stringify(updatedResources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')
await writeFile(reportPath, `${JSON.stringify(metadataReport, null, 2)}\n`, 'utf8')

console.log(JSON.stringify({
  added: additions.length,
  firstId: additions[0].id,
  lastId: additions.at(-1).id,
  excludedShortDemos: excludedShortDemoIds.size,
  metadataStatuses: Object.groupBy(additions, (resource) => resource.metadataVerificationStatus),
}, null, 2))
