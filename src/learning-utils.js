const mathPattern = /mathematical|matrix|linear algebra|probability|optimization|calculus/i
const researchPattern = /research practice|research methods|scientific writing|literature/i
const pathTerms = {
  'World Model': /world models?|world-model|spatial intelligence|physical ai|dreamer|learned simulators?|temporal dynamics/i,
  Agent: /\bagents?\b|tool use|planning|memory|multi-agent|agentic/i,
  Vision: /computer vision|\bvision\b|image|video|visual|perception|segmentation|multimodal/i,
  Robotics: /robot|robotics|embodied|manipulation|locomotion|physical ai/i,
  Math: mathPattern,
  'How to Research': /research|literature|paper|writing|experiment|scientific|peer review/i,
}

export const PATH_GOALS = [
  { value: 'World Model', label: 'Build World Models intuition' },
  { value: 'Agent', label: 'Learn agents and planning' },
  { value: 'Vision', label: 'Strengthen computer vision' },
  { value: 'Robotics', label: 'Start robot learning' },
  { value: 'Math', label: 'Build AI mathematics' },
  { value: 'How to Research', label: 'Improve research practice' },
]

function searchable(resource) {
  return `${resource.title} ${resource.speaker} ${resource.domain} ${resource.keywords}`.toLocaleLowerCase()
}

function pathRelevance(resource, goal) {
  const pattern = pathTerms[goal]
  if (!pattern) return 0
  const titleScore = pattern.test(resource.title || '') ? 5 : 0
  const contextScore = pattern.test(`${resource.domain || ''} ${resource.keywords || ''}`) ? 2 : 0
  return titleScore + contextScore
}

function uniqueById(entries) {
  return [...new Map(entries.map((entry) => [entry.id, entry])).values()]
}

export function goalMatches(resource, goal) {
  if (goal === 'Math') return mathPattern.test(resource.domain || '')
  return resource.focusArea === goal
}

// The path list and the knowledge tree rank sources the same way, so the two
// views never disagree about what the strongest source for a goal is.
export function pathOrderComparator(goal, minutes) {
  return (a, b) => {
    const pathPriority = (resource) => (
      pathRelevance(resource, goal) * 3 +
      (resource.recommendation === 'Core' ? 2 : 0) +
      (resource.sourceTier?.startsWith('A') ? 1 : 0) +
      (resource.speaker === 'To be added' ? -5 : 1)
    )
    const aPriority = pathPriority(a)
    const bPriority = pathPriority(b)
    const aFitsSession = a.durationMinutes <= minutes ? 0 : 1
    const bFitsSession = b.durationMinutes <= minutes ? 0 : 1
    return bPriority - aPriority ||
      aFitsSession - bFitsSession ||
      Math.abs(a.durationMinutes - minutes) - Math.abs(b.durationMinutes - minutes) ||
      a.durationMinutes - b.durationMinutes || b.viewCount - a.viewCount
  }
}

export function buildLearningPath(resources, goal, preferences = {}) {
  const language = preferences.language || 'All'
  const minutes = Number(preferences.minutes) || 45
  const matchesLanguage = (resource) => language === 'All' || resource.language === language
  const comparePathOrder = pathOrderComparator(goal, minutes)
  const goalResources = resources.filter((resource) => goalMatches(resource, goal) && matchesLanguage(resource))
  const orderedGoalResources = uniqueById([
    ...goalResources.filter((resource) => resource.section === 'Course' && resource.recommendation === 'Core'),
    ...goalResources.filter((resource) => resource.section === 'Talk' && resource.recommendation === 'Core'),
    ...goalResources,
  ]).sort(comparePathOrder)
  const selected = orderedGoalResources.filter((resource) => resource.durationMinutes <= minutes)

  // If a narrow language/topic combination has no source that fits the chosen
  // session length, show its best available source rather than an empty path.
  if (!selected.length) selected.push(...orderedGoalResources.slice(0, 1))

  // A chosen direction should remain the center of its path. Foundation material
  // only fills a genuinely sparse direction; it never pushes the topic aside.
  if (selected.length < 6) {
    const supportPattern = goal === 'How to Research' ? researchPattern : mathPattern
    const supportive = resources.filter((resource) => (
      resource.recommendation === 'Core' &&
      resource.durationMinutes <= minutes &&
      matchesLanguage(resource) &&
      supportPattern.test(resource.domain || '')
    )).sort(comparePathOrder)
    selected.push(...uniqueById(supportive).filter((resource) => !selected.some((item) => item.id === resource.id)))
  }

  return selected.slice(0, 6)
}

export function companionFor(resource, resources) {
  const oppositeLanguage = resource.language === 'Chinese' ? 'English' : 'Chinese'
  const tokens = new Set(searchable(resource).split(/[^a-z0-9\u4e00-\u9fff]+/i).filter((token) => token.length > 3))
  return resources
    .filter((candidate) => candidate.id !== resource.id && candidate.language === oppositeLanguage)
    .map((candidate) => ({ candidate, score: [...tokens].filter((token) => searchable(candidate).includes(token)).length + (candidate.focusArea === resource.focusArea ? 4 : 0) }))
    .filter(({ score }) => score > 3)
    .sort((a, b) => b.score - a.score || (a.candidate.recommendation === 'Core' ? -1 : 1))
    .at(0)?.candidate || null
}

export function nextRecommendations(resource, resources, workspace) {
  const excluded = new Set([resource.id, ...workspace.saved, ...workspace.queue])
  return resources
    .filter((candidate) => !excluded.has(candidate.id) && candidate.focusArea === resource.focusArea)
    .map((candidate) => ({
      candidate,
      score: (candidate.recommendation === 'Core' ? 8 : 0) +
        (candidate.section === 'Course' ? 3 : 0) +
        (candidate.language === resource.language ? 2 : 0) +
        Math.min(candidate.viewCount / 1000000, 2),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate)
}

export function topResearchers(resources) {
  const counts = new Map()
  resources.forEach((resource) => {
    if (!resource.speaker || resource.speaker === 'To be added' || resource.speaker.includes(',')) return
    const current = counts.get(resource.speaker) || { name: resource.speaker, resources: [], views: 0 }
    current.resources.push(resource)
    current.views += resource.viewCount || 0
    counts.set(resource.speaker, current)
  })
  return [...counts.values()].filter((entry) => entry.resources.length >= 2).sort((a, b) => b.views - a.views).slice(0, 14)
}

export function searchStudyRecords(resources, workspace, query) {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return []
  return resources.flatMap((resource) => {
    const notes = workspace.notes[resource.id] || []
    const transcript = workspace.transcripts[resource.id] || ''
    const noteMatches = notes.filter((note) => `${note.timestamp} ${note.text}`.toLocaleLowerCase().includes(needle))
    const transcriptIndex = transcript.toLocaleLowerCase().indexOf(needle)
    const metadataMatch = searchable(resource).includes(needle)
    if (!noteMatches.length && transcriptIndex < 0 && !metadataMatch) return []
    return [{ resource, noteMatches, transcriptExcerpt: transcriptIndex >= 0 ? transcript.slice(Math.max(0, transcriptIndex - 56), transcriptIndex + needle.length + 110) : '', metadataMatch }]
  }).slice(0, 12)
}

export function prerequisiteNodes(goal) {
  const shared = [
    { id: 'Math', label: 'Math foundations', focus: 'Other' },
    { id: 'Foundations', label: 'ML foundations', focus: 'Other' },
  ]
  const end = { id: goal, label: goal === 'Math' ? 'AI mathematics' : goal === 'How to Research' ? 'Research practice' : `${goal}s`, focus: goal === 'Math' ? 'Other' : goal }
  return [...shared, end]
}
