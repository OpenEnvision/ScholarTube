import { formatDuration } from './resource-utils.js'

function topicFor(resource) {
  if (resource.focusArea && resource.focusArea !== 'Other') return resource.focusArea
  const keyword = resource.keywords?.split(';').map((value) => value.trim()).find(Boolean)
  return keyword || resource.domain || 'this research area'
}

function presenterFor(resource) {
  return resource.speaker && resource.speaker !== 'To be added'
    ? resource.speaker
    : resource.channel
}

function angleFor(resource) {
  const title = resource.title.toLocaleLowerCase()

  if (/from scratch|let['’]s build|implementation|in code|coding/.test(title)) {
    return 'an implementation-level walkthrough that connects the ideas to working systems'
  }
  if (/\bintro\b|introduction|\b101\b|crash course|foundation|explained/.test(title)) {
    return 'clear conceptual framing and a practical entry point'
  }
  if (/keynote/.test(title)) {
    return 'the original keynote framing of system direction, priorities, and supporting examples'
  }
  if (/panel|debate|roundtable/.test(title)) {
    return 'multiple viewpoints and points of disagreement preserved in their original context'
  }
  if (/tutorial|lecture|course|class|lesson/.test(title) || resource.section === 'Course') {
    return 'structured instruction that can be followed, paused, and revisited'
  }
  if (/paper|cvpr|neurips|icml|research/.test(title)) {
    return 'the research claims, evidence, and limitations as presented by the source'
  }
  if (/demo|live|workshop/.test(title)) {
    return 'direct demonstrations and concrete system behavior rather than a second-hand summary'
  }
  if (/future|roadmap|state of|next generation/.test(title)) {
    return 'a forward-looking account of the field’s priorities and unresolved questions'
  }
  if (/interview|podcast|fireside|conversation/.test(title) || resource.section === 'Interview') {
    return 'first-person reasoning, assumptions, and trade-offs that short summaries often flatten'
  }
  return 'the original argument, examples, and technical context in one source-linked recording'
}

function curationSentence(resource) {
  if (resource.recommendation === 'Core') {
    return 'Its Core placement makes it one of the stronger starting points in this part of the index.'
  }
  if (resource.recommendation === 'Reserve') {
    return 'Its Reserve placement makes it most useful as a specialized or alternative angle after the main references.'
  }
  return 'Its Recommended placement makes it a focused complement to the Core material.'
}

function levelFor(resource) {
  const title = resource.title.toLocaleLowerCase()

  if (/\bintro\b|introduction|\b101\b|crash course|foundation|explained|beginner/.test(title)) {
    return 'newcomers, students, and cross-disciplinary researchers building a reliable mental model'
  }
  if (/from scratch|tutorial|lecture|course|class|coding|implementation/.test(title) || resource.section === 'Course') {
    return 'students, engineers, and researchers ready to follow technical material step by step'
  }
  if (/paper|cvpr|neurips|icml|research/.test(title)) {
    return 'readers who already know the fundamentals and want to evaluate a research contribution closely'
  }
  if (/keynote|panel|debate|roadmap|future/.test(title)) {
    return 'researchers and technical leads comparing field direction, priorities, and competing viewpoints'
  }
  if (resource.section === 'Interview') {
    return 'researchers and practitioners looking for the speaker’s reasoning and decision context'
  }
  return 'researchers and practitioners exploring the topic beyond a surface-level overview'
}

function timeCommitmentFor(minutes) {
  if (minutes < 20) return 'a quick orientation or refresher'
  if (minutes < 45) return 'a focused session that fits into a short study block'
  if (minutes <= 90) return 'a complete study session with room for notes'
  if (minutes <= 150) return 'a long-form session for careful note-taking'
  return 'a deep reference to work through in sections'
}

export function buildWhyWatch(resource) {
  const topic = topicFor(resource)
  const presenter = presenterFor(resource)
  const sourceContext = presenter === resource.channel
    ? `It keeps ${resource.channel}’s original framing intact, making the argument easier to assess than a retelling.`
    : `It preserves ${presenter}’s perspective through ${resource.channel}, so the claims can be assessed in the context of the original ${resource.section.toLowerCase()}.`

  return `“${resource.title}” is worth watching for ${angleFor(resource)} on ${topic}. ${sourceContext} ${curationSentence(resource)}`
}

export function buildAudience(resource) {
  const topic = topicFor(resource)
  const presenter = presenterFor(resource)
  const duration = formatDuration(resource.durationMinutes)

  return `Best for ${levelFor(resource)}. It is especially relevant to work on ${topic}. Choose this ${duration} ${resource.section.toLowerCase()} when you want ${timeCommitmentFor(resource.durationMinutes)} and the specific perspective of ${presenter} in “${resource.title}”.`
}

export function getResourceDetail(resource) {
  return {
    whyWatch: resource.whyWatch || buildWhyWatch(resource),
    audience: resource.audience || buildAudience(resource),
    publishedAt: resource.publishedAt || 'Not yet verified',
    lastVerifiedAt: resource.lastVerifiedAt || resource.collectedOn || 'Not yet verified',
  }
}

export function formatDate(value) {
  if (!value || value === 'Not yet verified') return 'Not yet verified'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}
