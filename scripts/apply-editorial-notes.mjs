import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Replaces provenance boilerplate in `notes` with a short editorial note built
// deterministically from already-verified fields (speaker, channel, format,
// domain/keywords, recommendation, focusArea, series placement, publishedAt,
// durationMinutes, viewCount). No new facts are introduced. Hand-written notes
// are never touched: a note is only rewritten when it is (a) one of the known
// boilerplate strings, (b) empty, or (c) exactly what this generator produces
// (which makes the script idempotent). Run AFTER apply-course-series.mjs so
// series placement is final. Provenance itself is preserved in the dedicated
// metadataVerifiedVia / metadataVerificationStatus / sourceTier fields.

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')

const refinedSuffix = ' Metadata and series placement refined in the 2026-08-15 latest-gap audit.'
const boilerplateBases = [
  'Matched to the target official channel; public metadata accessible.',
  'Added in the latest gap audit from an official institution or original creator; public YouTube metadata verified; short demos excluded.',
  'Added from an official university, research institution, conference, or original creator source; public YouTube metadata verified.',
  'Discovered through public Bilibili search; title, creator, and accessibility verified through the official video endpoint.',
  'Curated in the targeted ScholarTube expansion; official institution, conference, lab, course, or creator source.',
  'Curated in the targeted ScholarTube expansion; public metadata accessible and editorially reviewed.',
  'Official conference detail page returned HTTP 200 and exposed an actual public SlidesLive or YouTube player; title, speaker, event date, and scheduled duration cross-checked. Short demos and duplicate overflow rooms excluded.',
  'Curated for the 2026-08-24 ScholarTube weekly update; recent public metadata and canonical video URL verified.',
  'Targeted addition for the four priority areas; public YouTube result verified as accessible.',
  'Title, channel, and public metadata reviewed.',
  'One of the 34 recorded lectures listed by MIT OpenCourseWare for 18.065. The official course connects linear algebra, probability/statistics, optimization, and deep learning. Canonical MIT course page: https://ocw.mit.edu/courses/18-065-matrix-methods-in-data-analysis-signal-processing-and-machine-learning-spring-2018/video_galleries/video-lectures/',
  'Included from the official 张小珺商业访谈录 Bilibili inventory; title, creator, and public metadata verified through official endpoints.',
  'Added from the official conference recording page after verifying the title, speaker, date, scheduled duration, and public Video section; short demos and lightning talks excluded.',
]
const boilerplateNotes = new Set([
  ...boilerplateBases,
  ...boilerplateBases.map((base) => `${base}${refinedSuffix}`),
])

const keepCasedTokens = new Set([
  'AI', 'ML', 'NLP', 'LLM', 'LLMs', 'RL', 'RLHF', 'AGI', 'GPU', 'TPU', '3D', '4D',
  'MLOps', 'TinyML', 'MoE', 'VLA', 'VLM', 'Chinese', 'Schrödinger',
])

function lowercaseTopicPart(part) {
  return part
    .split(' ')
    .map((word) => {
      const clean = word.replace(/[^A-Za-z0-9]/g, '')
      if (!clean || keepCasedTokens.has(clean) || /^[A-Z0-9]{2,}$/.test(clean)) return word
      return word.toLowerCase()
    })
    .join(' ')
}

const vagueDomains = new Set(['General AI / People'])

function topicPhrase(resource) {
  const source =
    resource.domain && !vagueDomains.has(resource.domain) ? resource.domain : resource.keywords || resource.domain
  const seen = new Set()
  const parts = String(source || '')
    .split(/[;/]/)
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false
      const key = part.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 3)
    .map(lowercaseTopicPart)
  if (parts.length === 0) return 'its focus area'
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`
}

const unusableSpeakers = new Set([
  '', 'To be added', '中英', 'Quantum Computing', 'AI and the Economy', '硅谷101', '张小珺商业访谈录',
])

// Keeps real names, drops episode labels / event tags that sometimes fill the
// speaker column (e.g. "MedAI #92", "2021-CVPR", "青稞Talk 144期").
function usableSpeaker(resource) {
  let speaker = (resource.speaker || '').trim().replace(/\s*[-–—][^-–—]*#\d+$/, '')
  if (unusableSpeakers.has(speaker)) return null
  if (speaker.length > 60) return null
  if (/[:：|#]/.test(speaker)) return null
  if (/^\d|^S\d+\s*E\d+/i.test(speaker)) return null
  if (/\d+\s*期$/.test(speaker)) return null
  if (/invited talk|^talk$/i.test(speaker)) return null
  if (/\b(teams?|guests?)\b/i.test(speaker)) return null
  if (/公开课|更新$|项目实战|双版/.test(speaker)) return null
  return speaker
}

function formatPhrase(resource) {
  const phrase = (resource.format || 'recording').trim().toLowerCase()
  return phrase.replace(/\bnobel prize\b/g, 'Nobel Prize').replace(/\bturing award\b/g, 'Turing Award')
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function leadSentence(resource) {
  const topic = topicPhrase(resource)
  const speaker = usableSpeaker(resource)
  const channel = resource.channel
  const fmt = formatPhrase(resource)
  if (resource.section === 'Interview') {
    const duration = resource.durationMinutes ? `${resource.durationMinutes}-minute ` : ''
    return speaker
      ? `${speaker} — ${duration}${fmt} on ${channel}, centered on ${topic}.`
      : `${capitalize(`${duration}${fmt}`)} on ${channel}, centered on ${topic}.`
  }
  const verb = resource.section === 'Course' ? 'covering' : 'on'
  if (speaker) {
    const channelPart = speaker === channel ? '' : ` (${channel})`
    return `${capitalize(fmt)} by ${speaker}${channelPart} ${verb} ${topic}.`
  }
  return `${capitalize(fmt)} from ${channel} ${verb} ${topic}.`
}

function seriesClause(resource) {
  if (!resource.seriesId || !resource.seriesTitle) return ''
  const order = resource.seriesOrder
  if (typeof order === 'number' && order >= 19000101) {
    return resource.publishedAt
      ? `part of ${resource.seriesTitle}, published ${resource.publishedAt}`
      : `part of ${resource.seriesTitle}`
  }
  if (typeof order === 'number' && order >= 1990 && order <= 2100) {
    return `the ${Math.trunc(order)} edition entry in ${resource.seriesTitle}`
  }
  if (typeof order === 'number' && Number.isInteger(order) && order >= 1 && order < 100) {
    const noun = resource.section === 'Course' ? 'lecture' : 'entry'
    return `${noun} ${order} in ${resource.seriesTitle}`
  }
  return `part of ${resource.seriesTitle}`
}

function formatViews(viewCount) {
  if (viewCount >= 1e6) {
    const millions = viewCount / 1e6
    return `${millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10}M`
  }
  return `${Math.round(viewCount / 1e3)}k`
}

function tailSentence(resource) {
  const tier =
    { Core: 'Core selection', Recommended: 'Recommended pick', Reserve: 'Reserve item' }[resource.recommendation] ??
    'Catalog entry'
  const shelf =
    resource.focusArea && resource.focusArea !== 'Other'
      ? ` for the ${resource.focusArea} shelf`
      : ' in the ScholarTube catalog'
  let sentence = `${tier}${shelf}`
  const series = seriesClause(resource)
  if (series) sentence += `; ${series}`
  if (typeof resource.viewCount === 'number' && resource.viewCount >= 100000) {
    sentence += ` (~${formatViews(resource.viewCount)} views)`
  }
  return `${sentence}.`
}

const mitOcwAppendix =
  ' Canonical MIT OCW course page: https://ocw.mit.edu/courses/18-065-matrix-methods-in-data-analysis-signal-processing-and-machine-learning-spring-2018/video_galleries/video-lectures/'

function generateNote(resource) {
  let note = `${leadSentence(resource)} ${tailSentence(resource)}`
  if (resource.seriesId === 'mit-18-065-matrix-methods-2018') note += mitOcwAppendix
  return note
}

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item)).join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))

let rewritten = 0
let regenerated = 0
const rewrittenByTier = {}
let untouched = 0

for (const resource of resources) {
  const current = (resource.notes || '').trim()
  const generated = generateNote(resource)
  if (current === generated) {
    regenerated += 1
    continue
  }
  const generatedShape =
    /(Core selection|Recommended pick|Reserve item|Catalog entry)( for the .+ shelf| in the ScholarTube catalog)/.test(
      current,
    )
  // Hygiene may change speaker/format/domain/tier; rewrite generated notes
  // so they stay field-driven, but never touch handwritten ones.
  if (current && !boilerplateNotes.has(current) && !generatedShape) {
    untouched += 1
    continue
  }
  resource.notes = generated
  rewritten += 1
  rewrittenByTier[resource.recommendation] = (rewrittenByTier[resource.recommendation] ?? 0) + 1
}

const fields = Object.keys(resources[0])
const csv = [
  fields.join(','),
  ...resources.map((resource) => fields.map((field) => csvCell(resource[field])).join(',')),
].join('\r\n')

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      rewritten,
      rewrittenByTier,
      alreadyGenerated: regenerated,
      untouchedBespokeNotes: untouched,
      remainingBoilerplate: resources.filter((resource) => boilerplateNotes.has((resource.notes || '').trim())).length,
    },
    null,
    2,
  ),
)
