const recommendationRank = { Core: 0, Recommended: 1, Reserve: 2 }

const broaderTopicRules = [
  {
    id: 'Foundations',
    label: 'Foundations',
    pattern: /foundations|reinforcement learning|neural network|representation learning|graph machine|multimodal learning|generative models|machine learning research|diffusion|optimization|probabilistic|bayesian|causal inference/i,
  },
  {
    id: 'AI Systems',
    label: 'AI Systems',
    pattern: /systems|infrastructure|mlops|engineering practice|developers|edge ai|tinyml|accelerated computing|product engineering|hardware|compilers|serving/i,
  },
  {
    id: 'NLP',
    label: 'NLP',
    pattern: /natural language|transformer|large models|foundation models|language model|speech|llm/i,
  },
  {
    id: 'Industry',
    label: 'Industry',
    pattern: /industry|startup|people|chinese ai researchers|entrepreneur|venture|business/i,
  },
  {
    id: 'Social Impact',
    label: 'Social Impact',
    pattern: /social impact|society|safety|trustworthy|alignment|privacy|security|governance|policy|ethics|law\b/i,
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

// Raw `format` labels are messy (60+ variants), so podcasts are detected in
// code rather than rewritten in the catalog JSON.
export function isPodcastResource(resource) {
  return (
    /podcast/i.test(resource.format || '') ||
    /podcast/i.test(resource.seriesTitle || '') ||
    /podcast/i.test(resource.channel || '') ||
    /播客/.test(resource.title || '') ||
    /播客/.test(resource.channel || '')
  )
}

export function getFormatFamily(resource) {
  return isPodcastResource(resource) ? 'Podcast' : resource.section
}

// Podcast is a lens over the catalog: the Podcast tab collects podcast shows
// from every section, and the Interview tab keeps the conversations that are
// not podcast shows, so nothing is double-counted between the two.
export function matchesFormat(resource, format) {
  if (format === 'All') return true
  if (format === 'Podcast') return isPodcastResource(resource)
  if (format === 'Interview') return resource.section === 'Interview' && !isPodcastResource(resource)
  return resource.section === format
}

export function getPodcastShow(resource) {
  return resource.seriesTitle || resource.channel || ''
}

export function getPodcastShows(resources, { limit = 8, minCount = 2 } = {}) {
  const counts = new Map()

  resources.filter(isPodcastResource).forEach((resource) => {
    const show = getPodcastShow(resource)
    if (show) counts.set(show, (counts.get(show) || 0) + 1)
  })

  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'en'))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
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
    getFormatFamily(resource),
    resource.language,
    resource.focusArea,
    getDisplayTopic(resource),
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
