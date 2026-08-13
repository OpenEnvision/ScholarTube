const recommendationRank = { Core: 0, Recommended: 1, Reserve: 2 }

const broaderTopicRules = [
  {
    id: 'Foundations',
    label: 'Foundations',
    pattern: /foundations|reinforcement learning|neural network|representation learning|graph machine|multimodal learning|generative models|machine learning research/i,
  },
  {
    id: 'AI Systems',
    label: 'AI Systems',
    pattern: /systems|infrastructure|mlops|engineering practice|developers|edge ai|tinyml|accelerated computing|product engineering/i,
  },
  {
    id: 'NLP',
    label: 'NLP',
    pattern: /natural language|transformer|large models|speech/i,
  },
  {
    id: 'Industry',
    label: 'Industry',
    pattern: /industry|startup|people|chinese ai researchers/i,
  },
  {
    id: 'Social Impact',
    label: 'Social Impact',
    pattern: /social impact|society|safety|trustworthy/i,
  },
]

export const broaderTopics = [
  ...broaderTopicRules.map(({ id, label }) => ({ value: id, label })),
  { value: 'Research Frontiers', label: 'Research Frontiers' },
]

export function getBroaderTopic(resource) {
  if (resource.focusArea !== 'Other') return null
  const domain = resource.domain || ''
  return broaderTopicRules.find((topic) => topic.pattern.test(domain))?.id || 'Research Frontiers'
}

export function getDisplayTopic(resource) {
  if (resource.focusArea === 'Other') return getBroaderTopic(resource)
  if (resource.focusArea === 'World Model') return 'World Models'
  if (resource.focusArea === 'Agent') return 'Agents'
  return resource.focusArea
}

export function getCoverTheme(resource) {
  return getDisplayTopic(resource).toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function formatDuration(minutes = 0) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export function formatViews(count = 0) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(count)
}

export function getThumbnail(resource) {
  if (resource.platform !== 'YouTube' || !resource.videoId) return null
  return `https://i.ytimg.com/vi/${resource.videoId}/hqdefault.jpg`
}

export function sortResources(resources, sort) {
  return [...resources].sort((a, b) => {
    if (sort === 'popular') return b.viewCount - a.viewCount
    if (sort === 'shortest') return a.durationMinutes - b.durationMinutes
    if (sort === 'longest') return b.durationMinutes - a.durationMinutes
    return (
      (recommendationRank[a.recommendation] ?? 9) -
        (recommendationRank[b.recommendation] ?? 9) ||
      b.viewCount - a.viewCount
    )
  })
}

export function groupResourceSeries(resources) {
  const entries = []
  const seriesEntries = new Map()

  resources.forEach((resource) => {
    if (!resource.seriesId) {
      entries.push({ kind: 'resource', id: resource.id, resource })
      return
    }

    let series = seriesEntries.get(resource.seriesId)
    if (!series) {
      series = {
        kind: 'series',
        id: `series:${resource.seriesId}`,
        seriesId: resource.seriesId,
        title: resource.seriesTitle,
        section: resource.section,
        resources: [],
      }
      seriesEntries.set(resource.seriesId, series)
      entries.push(series)
    }
    series.resources.push(resource)
  })

  seriesEntries.forEach((series) => {
    series.resources.sort((a, b) =>
      (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER) ||
      a.title.localeCompare(b.title, 'en'),
    )
  })

  return entries
}

export function matchesSearch(resource, query) {
  if (!query.trim()) return true
  const haystack = [
    resource.title,
    resource.speaker,
    resource.channel,
    resource.domain,
    resource.keywords,
    resource.format,
    resource.language,
    resource.focusArea,
    resource.seriesTitle,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()

  return query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}
