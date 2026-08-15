import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const auditReportPath = path.join(projectDirectory, 'data', 'latest_gap_audit_2026-08-15.md')
const collectedOn = '2026-08-15'
const sourceTierA = 'A | Official / Original Creator / Organizer'

const requestHeaders = {
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
}

function courseSeries({ seriesId, seriesTitle, videoIds, orders, speaker, classify, keywords, domain, focusArea = 'Other' }) {
  return {
    seriesId,
    seriesTitle,
    videoIds,
    orders,
    speaker,
    section: 'Course',
    format: 'Course Lecture',
    recommendation: 'Core',
    classify: classify ?? (() => ({ focusArea, domain, keywords })),
  }
}

const seriesDefinitions = [
  courseSeries({
    seriesId: 'stanford-aa203-spring-2026',
    seriesTitle: 'Stanford AA203: Optimal and Learning-Based Control — Spring 2026',
    videoIds: [
      'Au2stLALZew', 'FbkNYklySak', 'duZJ2_ajLso', '7rejaoMWviw', 'R4_fHzTo0IM',
      'zX8raxUa2DE', 'hy-e9g4nugE', '1YdgSwEtf_s', 'C9mLpI8Td9g', 'Fl5EjGhQjgs',
      '3_gxaB_Pp3k', '8Elrw30y0tg', 'RtJSHiqOdgQ', '7YdOx-ih0II', 'udHX5Auj7ik',
      'cqPbt3OfRK4', 'zanXSI7zSws', 'a1g9U_5zO54', 'ZXMThMHFD_w',
    ],
    speaker: 'Stanford AA203 course team',
    focusArea: 'Robotics',
    domain: 'Robotics',
    keywords: 'Optimal Control; Model Predictive Control; Reinforcement Learning; Imitation Learning',
  }),
  courseSeries({
    seriesId: 'stanford-cs329a-self-improving-ai-agents-2026',
    seriesTitle: 'Stanford CS329A: Self-Improving AI Agents — 2026',
    videoIds: ['-Ggc37xLj_Y', 'p7TdPUcPoik', 'Lxh9RF5S-K0', 'Ml_fp9XkB8Y', 'yVnmHSAy3ck', 'Uni9dqyuuDM', '8JAqLnTaZu4', 'AyO6wyu4DEg'],
    orders: [2, 3, 4, 5, 6, 7, 8, 9],
    speaker: 'Stanford CS329A course team',
    focusArea: 'Agent',
    domain: 'Agents / Tool Use / Reasoning',
    keywords: 'Self-Improving Agents; Tool Use; Reasoning; Agent Training; Agent Evaluation',
  }),
  courseSeries({
    seriesId: 'stanford-cs229-spring-2026',
    seriesTitle: 'Stanford CS229: Machine Learning — Spring 2026',
    videoIds: [
      'DATnpGoGhM8', 'cmNIMjPYdgM', 'uJF_gL3jhxI', '8gVi4Rk21Eg', 'zRdE8A4UZes',
      'llnEgyyuYkQ', 'fRM41w9jzQo', 'ne2ngVAoMG8', 'bSmIGBCoffA', 'sUS-eTa0l6s',
      'dqUMCzWjZSI', '_kREM2UAiJ8', 'lNTajqxxOn4', 'pwQ0l4hFCVI', 'hHC-SF3utxg',
      'xveNBYVTrqw', 'J7CossjMvEg',
    ],
    orders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20],
    speaker: 'Stanford CS229 course team',
    focusArea: 'Other',
    domain: 'Machine Learning Foundations',
    keywords: 'Machine Learning; Supervised Learning; Unsupervised Learning; Deep Learning',
  }),
  courseSeries({
    seriesId: 'stanford-cs336-spring-2026',
    seriesTitle: 'Stanford CS336: Language Modeling from Scratch — Spring 2026',
    videoIds: [
      'JuoVZkPBiKk', 'kuYAsz7zspQ', 'lVynu4bo1rY', 'cKSwj_qZ8Jg', 'izZba4UA7iY',
      'xnDHaNUvHBg', 'SzpOcwdIL0Y', '6-cXp-aOmdg', 'Q15rhEWZPQ4', 'EfM546A79aM',
      'vTfEyOyzV9E', 'JpAxdTWQJxM', '-qm0ln33G24', '5sxHosTLPF8', '2oH6PWPrYFo',
      'dIFAi87Ws4E', '26FtD08ZpOU', '9EEm4iMAF5s',
    ],
    speaker: 'Stanford CS336 course team',
    classify: (videoId) => ['2oH6PWPrYFo', 'dIFAi87Ws4E', '26FtD08ZpOU'].includes(videoId)
      ? {
          focusArea: 'Agent',
          domain: 'Agents / Tool Use / Reasoning',
          keywords: 'Language Models; Post-Training; Alignment; Reinforcement Learning; RLVR',
        }
      : {
          focusArea: 'Other',
          domain: 'Deep Learning Foundations',
          keywords: 'Language Models; Model Training; Scaling Laws; AI Systems',
        },
  }),
  courseSeries({
    seriesId: 'stanford-cs221-autumn-2025',
    seriesTitle: 'Stanford CS221: Artificial Intelligence — Autumn 2025',
    videoIds: [
      'yaLEGZuIIgE', 'ypZJaTqrNdk', 'Mbe5ICIUw5Q', '89NND-Ca0yY', 'fPESauMaJYA',
      '4Iu4KPVbnAY', '2ZtF1j3n6XE', '34Hk2v2kwg4', 'lOMNskWVeD8', 'SMOD_GiRzb8',
      '9CKRoKFdS5Y', 'ec2rCf4iIqU', 'Dk7Kqqehzjk', '4d9V6Sxa6gU', 'Q7V13XriJEc',
      'x9Mbqu06OVo', '3orP3u2-jcg', '071zJXhvNfM', 'lPx5PF1ttkc', '5u5I5jvWR5k',
    ],
    speaker: 'Stanford CS221 course team',
    focusArea: 'Other',
    domain: 'Artificial Intelligence Foundations',
    keywords: 'Artificial Intelligence; Search; Logic; Probabilistic Models; Machine Learning',
  }),
  courseSeries({
    seriesId: 'stanford-cs25-transformers-united',
    seriesTitle: 'Stanford CS25: Transformers United',
    videoIds: ['OyimE74UMF8', 'I5BKi32IEa8', 'e_H_tkpCAK4', 'dJtHauhRasc', 'jFdH7n6BAl0', 'ZUdIsRZhWXI'],
    orders: [603, 604, 605, 606, 607, 609],
    speaker: 'Stanford CS25 guest speakers',
    classify: (videoId) => videoId === 'jFdH7n6BAl0'
      ? {
          focusArea: 'Agent',
          domain: 'Agents / Tool Use / Reasoning',
          keywords: 'Collaborative AI Agents; Science; Medicine; Multi-Agent Systems',
        }
      : {
          focusArea: 'Other',
          domain: 'Transformers / Large Models',
          keywords: 'Transformers; State Space Models; Scaling; Generalization; Inference Systems',
        },
  }),
  courseSeries({
    seriesId: 'nathan-lambert-post-training-course-2026',
    seriesTitle: 'Post-Training Course for The RLHF Book — 2026',
    videoIds: [
      'MMDNaeIFVy8', 'o6l6tJQgUg4', '4gIwiSPmQkU', 'K_Sj_-1BUMM', 'i-AIMpZHgeg',
      'o4AB5xHIDdM', '6g6b4gvO-y0', '6nyJ8y8ghsE', 'Y2tv5vuaxFs', 'y04JhXpiI4s',
      'IwpYxANrpUs', 'dFafQmClYq4', 'xECWRYBxq1E',
    ],
    orders: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13],
    speaker: 'Nathan Lambert',
    focusArea: 'Agent',
    domain: 'Agents / Tool Use / Reasoning',
    keywords: 'Post-Training; RLHF; Preference Optimization; Reasoning; Tool Use; Agents',
  }),
]

const standaloneDefinitions = [
  ...[
    ['RKFRO_G4YkA', 'Ahmed H. Qureshi'],
    ['PYh9k4cy25w', 'Sebastian Scherer'],
    ['o5bW3C5OD6U', 'Jing Liang and Yao Feng'],
    ['NMFyMlwmwP8', 'Madhur Behl'],
    ['b6uxaRL_ipw', 'Baxi Chong'],
    ['r3x_w3tEmB4', 'Michael Yip'],
    ['dI8pLC1BLSM', 'Negar Mehr'],
    ['3W36pd50Wqw', 'Jiayuan Mao'],
    ['NiRXiuWwrps', 'Rohan Sinha'],
    ['8hohrUYuyx4', 'Rob Platt'],
  ].map(([videoId, speaker]) => ({
    videoId,
    section: 'Talk',
    speaker,
    format: 'Research Seminar',
    focusArea: 'Robotics',
    domain: 'Robotics / Embodied AI',
    keywords: 'Robotics; Embodied AI; Robot Learning; Planning; Control',
    recommendation: 'Recommended',
  })),
  {
    videoId: 'V04bm-3d6EQ', section: 'Talk', speaker: 'Google DeepMind research team', format: 'Research Talk',
    focusArea: 'Agent', domain: 'Agents / Tool Use / Reasoning',
    keywords: 'Multi-Agent Systems; Agent Simulation; Emergent Behavior; AI Research', recommendation: 'Core',
  },
  {
    videoId: 'qoinGjj60Fo', section: 'Interview', speaker: 'Thore Graepel and Pushmeet Kohli', format: 'Research Interview',
    focusArea: 'Other', domain: 'Deep Reinforcement Learning',
    keywords: 'AlphaGo; Reinforcement Learning; Scientific Discovery; AI History', recommendation: 'Recommended',
  },
  {
    videoId: 'PLyCki2K0Lg', section: 'Talk', speaker: 'Anthropic MCP team', format: 'Engineering Talk',
    focusArea: 'Agent', domain: 'Agents / Tool Use / Reasoning',
    keywords: 'Model Context Protocol; Tool Use; Agents; Open Standards', recommendation: 'Core',
  },
  ...[
    ['r1oAw_KWLWg', 'Leslie Kaelbling', 'Rationality; Planning; Robotics; Decision Making'],
    ['gthXSFhDt8Q', 'Hadas Kress-Gazit', 'Formal Methods; Robot Planning; Verification; Robotics'],
    ['ry8itipzBFE', 'Jitendra Malik', 'Robot Learning; Child Development; Computer Vision; Embodied AI'],
  ].map(([videoId, speaker, keywords]) => ({
    videoId,
    section: 'Talk',
    speaker,
    format: 'Research Seminar',
    focusArea: 'Robotics',
    domain: 'Robotics / Embodied AI',
    keywords,
    recommendation: 'Recommended',
  })),
]

const deliberatelyExcluded = {
  shortDemos: 'Official product/demo clips below 18 minutes were excluded, including the latest Gemini Robotics 2 showcase clips.',
  duplicateTalk: 'Stanford upload D7e7oUbtkFM was excluded because the same talk is already represented by CMU upload UX1YXcRnFbs.',
  notPublic: 'Stanford CS229 Spring 2026 lecture numbers 15, 17, and 19 were not publicly available in the official channel audit.',
}

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
    subtitleVerificationScope: subtitleTracks.length ? 'video' : 'blocked by YouTube anti-bot verification on this network',
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
    headers: { 'content-type': 'application/json', referer: `https://www.youtube-nocookie.com/embed/${videoId}` },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: client.clientVersion, hl: 'en' } }, videoId }),
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
    : value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''
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
      section: series.section,
      speaker: series.speaker,
      format: series.format,
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
if (candidateIds.length !== 117 || new Set(candidateIds).size !== 117) {
  throw new Error(`Expected 117 unique candidate IDs, found ${candidateIds.length}/${new Set(candidateIds).size}`)
}

const existingResources = JSON.parse(await readFile(jsonPath, 'utf8'))
const existingIds = new Set(existingResources.map((resource) => resource.videoId))
const overlaps = candidateIds.filter((videoId) => existingIds.has(videoId))
if (overlaps.length) throw new Error(`Candidate IDs already exist: ${overlaps.join(', ')}`)

const client = await initializeYouTubeClient(candidateIds[0])
const metadataRows = await mapWithConcurrency(candidateIds, 4, (videoId) => fetchYouTubeMetadata(videoId, client))
const shortCandidates = candidateIds.filter((videoId, index) => metadataRows[index].durationMinutes < 18)
if (shortCandidates.length) throw new Error(`Short/demo candidates were rejected: ${shortCandidates.join(', ')}`)

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
    title: metadata.title
      .replace(/^AStanford /, 'Stanford ')
      .replace('Reachibility Analysis', 'Reachability Analysis'),
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
    notes: 'Added in the latest gap audit from an official institution or original creator; public YouTube metadata verified; short demos excluded.',
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

const upgrades = new Map([
  ['6YnLB0XbTnI', {
    speaker: 'Stanford CS329A course team', format: 'Course Lecture', domain: 'Agents / Tool Use / Reasoning',
    keywords: 'Self-Improving Agents; Tool Use; Reasoning; Agent Training; Agent Evaluation',
    seriesId: 'stanford-cs329a-self-improving-ai-agents-2026', seriesTitle: 'Stanford CS329A: Self-Improving AI Agents — 2026', seriesOrder: 1,
  }],
  ['GMry2DzC304', {
    speaker: 'Nathan Lambert', format: 'Course Lecture', sourceTier: sourceTierA,
    keywords: 'Post-Training; RLHF; Preference Optimization; Reasoning; Tool Use; Agents',
    seriesId: 'nathan-lambert-post-training-course-2026', seriesTitle: 'Post-Training Course for The RLHF Book — 2026', seriesOrder: 11,
  }],
  ['bHSDPgZYie0', { speaker: 'Stanford CS25 guest speakers', seriesOrder: 601 }],
  ['GBd7iuJkW08', { speaker: 'Stanford CS25 guest speakers', seriesOrder: 602 }],
  ['NDdc39KYqDU', { speaker: 'Stanford CS25 guest speakers', seriesOrder: 608 }],
  ['popjDuA-whA', { speaker: 'Yue Wang', domain: 'Robotics / Embodied AI', keywords: 'Foundation Models; Robot Learning; Embodied AI; Generalist Robot Policies' }],
  ['NUtaN10cVDc', { speaker: 'Danfei Xu', domain: 'Robotics / Embodied AI', keywords: 'Robot Learning; Human Experience; Imitation Learning; Embodied AI' }],
])

const upgradedExistingResources = existingResources.map((resource) => upgrades.has(resource.videoId)
  ? {
      ...resource,
      ...upgrades.get(resource.videoId),
      notes: `${resource.notes.replace(/\s+$/, '')} Metadata and series placement refined in the 2026-08-15 latest-gap audit.`,
    }
  : resource)

const updatedResources = [...upgradedExistingResources, ...additions]
const fields = Object.keys(updatedResources[0])
const csv = [fields.join(','), ...updatedResources.map((resource) => fields.map((field) => csvCell(resource[field])).join(','))].join('\r\n')

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

const additionCounts = Object.fromEntries(['Course', 'Talk', 'Interview'].map((section) => [section, additions.filter((resource) => resource.section === section).length]))
const focusCounts = Object.fromEntries(['Agent', 'Robotics', 'World Model', 'Vision', 'Other'].map((focusArea) => [focusArea, additions.filter((resource) => resource.focusArea === focusArea).length]))
const auditReport = `# ScholarTube latest gap audit — 2026-08-15

## Result

- Baseline: ${existingResources.length} resources
- Added: ${additions.length} verified long-form resources
- New total: ${updatedResources.length} resources
- Added mix: ${additionCounts.Course} courses, ${additionCounts.Talk} talks, ${additionCounts.Interview} interview
- Focus mix: ${Object.entries(focusCounts).map(([key, value]) => `${key} ${value}`).join(', ')}
- All additions are from official institutional or original-creator YouTube channels and are at least 18 minutes long.

## Major gaps filled

- Stanford AA203 Optimal and Learning-Based Control — 19 lectures
- Stanford CS329A Self-Improving AI Agents — 8 missing lectures; 9/9 now represented
- Stanford CS229 Machine Learning Spring 2026 — 17 public lectures
- Stanford CS336 Language Modeling from Scratch Spring 2026 — 17 numbered lectures plus one guest lecture
- Stanford CS221 Artificial Intelligence Autumn 2025 — 20 lectures
- Stanford CS25 Transformers United V6 — 6 missing talks; 9/9 now represented
- Nathan Lambert Post-Training Course — 13 missing formal lectures; 14/14 formal lectures now represented
- Stanford Robotics Seminar 2026 — 10 unique long seminars
- Google DeepMind, Anthropic, and CMU Robotics — 6 recent long-form research items

## Deliberate exclusions and watchlist

- ${deliberatelyExcluded.shortDemos}
- ${deliberatelyExcluded.duplicateTalk}
- ${deliberatelyExcluded.notPublic}

## Primary official sources audited

- Stanford Online public channel and course uploads
- Stanford CS25 official course schedule and recordings
- Stanford Robotics Seminar current schedule and archive
- Nathan Lambert Post-Training Course official playlist
- Google DeepMind, Anthropic, and CMU Robotics Institute official channels
`

await writeFile(jsonPath, `${JSON.stringify(updatedResources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')
await writeFile(metadataReportPath, `${JSON.stringify(metadataReport, null, 2)}\n`, 'utf8')
await writeFile(auditReportPath, auditReport, 'utf8')

console.log(JSON.stringify({
  added: additions.length,
  firstId: additions[0].id,
  lastId: additions.at(-1).id,
  total: updatedResources.length,
  additionCounts,
  focusCounts,
  latestPublishedAt: additions.map((resource) => resource.publishedAt).sort().at(-1),
  metadataStatuses: additions.reduce((counts, resource) => ({ ...counts, [resource.metadataVerificationStatus]: (counts[resource.metadataVerificationStatus] ?? 0) + 1 }), {}),
}, null, 2))
