import { isPodcastResource } from './resource-detail-utils.js'

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

// Each goal carries a summary the workbench can show when the goal is chosen,
// and a stage trail naming the pedagogical arc its path tries to follow. The
// summaries describe what the catalog actually holds for that direction — no
// promises about material the index does not have.
export const PATH_GOALS = [
  {
    value: 'World Model',
    label: 'Build World Models intuition',
    summary: 'Models that learn the dynamics of an environment and plan inside their own predictions. Lectures define and build world models; the talks and interviews that follow are the researchers behind Dreamer, Genie, and their successors arguing about what scaling them can and cannot deliver.',
    stages: ['Dynamics & simulators', 'Video & world models', 'Planning in imagination'],
  },
  {
    value: 'Agent',
    label: 'Learn agents and planning',
    summary: 'How a language model becomes a system that acts: tool use, memory, multi-step orchestration, and the evaluation needed to tell whether any of it works. Course lectures from the Berkeley agent MOOCs and Stanford CS329A set the architecture; talks and conversations show how labs measure agents in practice.',
    stages: ['Tool use & memory', 'Orchestration & reasoning', 'Evaluation'],
  },
  {
    value: 'Vision',
    label: 'Strengthen computer vision',
    summary: 'From how images are represented to the models that now detect, reconstruct, and generate the visual world. Stanford CS231N carries the representation-to-recognition groundwork; diffusion and multimodal lectures plus conference keynotes connect it to current research.',
    stages: ['Representation', 'Recognition & 3D', 'Multimodal & generation'],
  },
  {
    value: 'Robotics',
    label: 'Start robot learning',
    summary: 'Learning-based control first, then imitation and manipulation, then the embodied foundation models meant to generalize across robots. Lectures from Stanford AA203 and ETH Zürich supply the control and reinforcement-learning groundwork; seminars and interviews track what actually transfers to hardware.',
    stages: ['Control & RL', 'Imitation & manipulation', 'Embodied foundation models'],
  },
  {
    value: 'Math',
    label: 'Build AI mathematics',
    summary: 'The linear algebra, probability, and optimization that machine-learning papers take for granted, taught through worked problems rather than abstract definitions. MIT 18.065 matrix methods form the backbone, with Boyd’s convex optimization short course and Tübingen’s Mathematics for ML alongside.',
    stages: ['Matrix methods', 'Optimization', 'Probability in practice'],
  },
  {
    value: 'How to Research',
    label: 'Improve research practice',
    summary: 'The craft around the papers: finding problems worth working on, reading and reviewing well, designing experiments, and writing and presenting results. Most sessions are short and direct — working researchers on their own methods, from Hamming to Simon Peyton Jones to 李沐 — rather than a semester course.',
    stages: ['Problem finding & reading', 'Experiments & writing', 'Review & presenting'],
  },
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

function bySeriesOrder(a, b) {
  return (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER) ||
    a.id.localeCompare(b.id)
}

export function goalMatches(resource, goal) {
  if (goal === 'Math') return mathPattern.test(resource.domain || '')
  return resource.focusArea === goal
}

// Support material is what fills a sparse direction: mathematics for every
// technical goal, research craft for the research-practice goal.
export function isSupportResource(resource, goal) {
  const supportPattern = goal === 'How to Research' ? researchPattern : mathPattern
  return supportPattern.test(resource.domain || '')
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
      a.durationMinutes - b.durationMinutes || b.viewCount - a.viewCount ||
      a.id.localeCompare(b.id)
  }
}

// A path should read like a study plan, not a ranked list: a coherent course
// backbone first, then a research talk, then a conversation. Every stage is
// deterministic and derived from catalog fields (section, series, duration).
export function buildLearningPath(resources, goal, preferences = {}) {
  const language = preferences.language || 'All'
  const minutes = Number(preferences.minutes) || 45
  const matchesLanguage = (resource) => language === 'All' || resource.language === language
  const compare = pathOrderComparator(goal, minutes)
  const fitsSession = (resource) => resource.durationMinutes <= minutes

  // A language preference narrows the pool but should never empty the path:
  // when a direction has no source in the chosen language, fall back to its
  // strongest sources in any language rather than rendering nothing.
  let pool = resources.filter((resource) => goalMatches(resource, goal) && matchesLanguage(resource))
  if (!pool.length) pool = resources.filter((resource) => goalMatches(resource, goal))

  const chosen = new Set()
  const courses = []
  const talks = []
  const conversations = []
  const buckets = { Course: courses, Talk: talks, Interview: conversations }
  const pathSize = () => courses.length + talks.length + conversations.length
  const take = (resource) => {
    if (!resource || chosen.has(resource.id)) return
    chosen.add(resource.id)
    ;(buckets[resource.section] || talks).push(resource)
  }

  // 1. Course backbone: one coherent series read in lecture order beats six
  //    unrelated videos. Two lectures — the opening one plus the strongest
  //    later one — sketch the arc of a course without swallowing the path.
  const fittingLectures = pool.filter((resource) => (
    resource.section === 'Course' && resource.recommendation === 'Core' && fitsSession(resource)
  ))
  const seriesGroups = new Map()
  fittingLectures.forEach((lecture) => {
    if (!lecture.seriesId) return
    if (!seriesGroups.has(lecture.seriesId)) seriesGroups.set(lecture.seriesId, [])
    seriesGroups.get(lecture.seriesId).push(lecture)
  })
  const seriesStrength = (group) => group.reduce((total, lecture) => total + pathRelevance(lecture, goal) + 1, 0)
  const backbone = [...seriesGroups.values()]
    .filter((group) => group.length >= 2)
    .sort((a, b) => seriesStrength(b) - seriesStrength(a) || a[0].seriesId.localeCompare(b[0].seriesId))
    .at(0) || null
  const backboneOrdered = backbone ? [...backbone].sort(bySeriesOrder) : []
  if (backbone) {
    take(backboneOrdered[0])
    take([...backboneOrdered.slice(1)].sort((a, b) => (
      pathRelevance(b, goal) - pathRelevance(a, goal) ||
      (b.seriesOrder ?? 0) - (a.seriesOrder ?? 0) ||
      a.id.localeCompare(b.id)
    )).at(0))
  } else {
    take([...fittingLectures].sort(compare).at(0))
  }

  // 2. One research talk, then one interview or podcast conversation, so a
  //    path reads Course → Talk → Conversation instead of six lectures.
  take(pool.filter((resource) => resource.section === 'Talk' && fitsSession(resource)).sort(compare).at(0))
  take(pool.filter((resource) => resource.section === 'Interview' && fitsSession(resource)).sort(compare).at(0))

  // 3. Deepen towards six items while keeping the mix: at most three course
  //    sessions, two talks, and two conversations, and the backbone series
  //    contributes exactly its two lectures so no single course floods the path.
  const sectionCaps = { Course: 3, Talk: 2, Interview: 2 }
  pool
    .filter((resource) => (
      fitsSession(resource) &&
      !chosen.has(resource.id) &&
      !(backbone && resource.seriesId === backboneOrdered[0]?.seriesId)
    ))
    .sort(compare)
    .forEach((resource) => {
      if (pathSize() >= 6) return
      const bucket = buckets[resource.section] || talks
      if (bucket.length >= (sectionCaps[resource.section] || 2)) return
      take(resource)
    })

  // 3b. A direction that is genuinely course-shaped (Math, mostly) may still
  //     have room: continue the backbone in lecture order before reaching for
  //     anything unrelated.
  backboneOrdered.forEach((lecture) => {
    if (pathSize() < 6) take(lecture)
  })

  // Keep backbone lectures in course order at the front of the course block,
  // so the path opens as a sequence a reader can actually follow.
  const backboneId = backboneOrdered[0]?.seriesId
  courses.sort((a, b) => {
    const aBackbone = backboneId && a.seriesId === backboneId ? 0 : 1
    const bBackbone = backboneId && b.seriesId === backboneId ? 0 : 1
    if (aBackbone !== bBackbone) return aBackbone - bBackbone
    return aBackbone === 0 ? bySeriesOrder(a, b) : 0
  })

  const path = [...courses, ...talks, ...conversations]

  // 4. Duration is a preference, not a wall. If the sitting length excludes
  //    nearly everything, close the gap with the closest-length goal sources
  //    rather than showing a one-item path.
  if (path.length < 3) {
    pool.filter((resource) => !chosen.has(resource.id)).sort(compare).forEach((resource) => {
      if (path.length >= 3) return
      chosen.add(resource.id)
      path.push(resource)
    })
  }

  // 5. A chosen direction should remain the center of its path. Foundation
  //    material only fills a genuinely sparse direction; it never pushes the
  //    topic aside.
  if (path.length < 6) {
    const supportive = resources.filter((resource) => (
      resource.recommendation === 'Core' &&
      fitsSession(resource) &&
      matchesLanguage(resource) &&
      isSupportResource(resource, goal) &&
      !chosen.has(resource.id)
    )).sort(compare)
    supportive.forEach((resource) => {
      if (path.length >= 6) return
      chosen.add(resource.id)
      path.push(resource)
    })
  }

  return path.slice(0, 6)
}

// Why a step is on the path, said from catalog facts only: its recommendation
// grade, its section, and the series it comes from. Nothing invented.
export function pathStepReason(resource, goal) {
  const kind = resource.section === 'Course'
    ? 'course lecture'
    : resource.section === 'Talk'
      ? 'research talk'
      : isPodcastResource(resource)
        ? 'podcast conversation'
        : 'interview'
  const grade = resource.recommendation === 'Core' ? 'Core' : resource.recommendation || 'Indexed'
  const base = `${grade} ${kind}`
  const origin = resource.seriesTitle ? `${base} · ${resource.seriesTitle}` : base
  return goalMatches(resource, goal) ? origin : `Foundations support · ${origin}`
}

export function companionFor(resource, resources) {
  const oppositeLanguage = resource.language === 'Chinese' ? 'English' : 'Chinese'
  const tokens = new Set(searchable(resource).split(/[^a-z0-9\u4e00-\u9fff]+/i).filter((token) => token.length > 3))
  return resources
    .filter((candidate) => candidate.id !== resource.id && candidate.language === oppositeLanguage)
    .map((candidate) => ({
      candidate,
      score: [...tokens].filter((token) => searchable(candidate).includes(token)).length +
        (candidate.focusArea === resource.focusArea ? 4 : 0) +
        (candidate.section === resource.section ? 1 : 0),
    }))
    .filter(({ score }) => score > 3)
    .sort((a, b) => b.score - a.score ||
      (a.candidate.recommendation === 'Core' ? -1 : 1) - (b.candidate.recommendation === 'Core' ? -1 : 1) ||
      a.candidate.id.localeCompare(b.candidate.id))
    .at(0)?.candidate || null
}

// After a recording, the strongest next step is the next lecture of the same
// series; failing that, the same direction seen from a different format —
// a talk after a lecture, a conversation after a talk.
export function nextRecommendations(resource, resources, workspace) {
  const excluded = new Set([resource.id, ...workspace.saved, ...workspace.queue])
  const seriesMates = resource.seriesId
    ? resources.filter((candidate) => candidate.seriesId === resource.seriesId).sort(bySeriesOrder)
    : []
  const position = seriesMates.findIndex((candidate) => candidate.id === resource.id)
  const nextInSeriesId = position >= 0 ? seriesMates[position + 1]?.id : undefined
  return resources
    .filter((candidate) => (
      !excluded.has(candidate.id) &&
      ((resource.seriesId && candidate.seriesId === resource.seriesId) || candidate.focusArea === resource.focusArea)
    ))
    .map((candidate) => ({
      candidate,
      score: (candidate.id === nextInSeriesId ? 24 : 0) +
        (resource.seriesId && candidate.seriesId === resource.seriesId ? 3 : 0) +
        (candidate.focusArea === resource.focusArea ? 6 : 0) +
        (candidate.focusArea === resource.focusArea && candidate.section !== resource.section ? 4 : 0) +
        (candidate.recommendation === 'Core' ? 5 : 0) +
        (candidate.language === resource.language ? 2 : 0) +
        Math.min(candidate.viewCount / 1000000, 2),
    }))
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id))
    .slice(0, 3)
    .map(({ candidate }) => candidate)
}

// The speaker field mixes single names, "A, B, and C" lists, "Name / course
// team" credits, and the occasional title fragment. Split it into people and
// keep only strings that plausibly name a person, so a shared appearance
// still counts for everyone in it.
const speakerSeparators = /\s*(?:,|;|、|&|\band\b|\bwith\b|\s\/\s)\s*/

function isPersonName(part) {
  if (!part) return false
  if (/^to be added$/i.test(part)) return false
  if (/\d/.test(part)) return false // years, dates, episode and lecture numbers
  if (/[:：|｜]/.test(part)) return false // a title fragment, not a name
  if (/\b(team|panel|various|multiple|staff|speakers?|guests?|et al\.?)\b/i.test(part)) return false
  if (/(团队|课程|讲师|更新|合集)/.test(part)) return false
  if (/^[a-z]/.test(part)) return false // sentence fragments left by the split
  return part.length >= 2
}

export function topResearchers(resources) {
  const people = new Map()
  resources.forEach((resource) => {
    const names = new Set(
      (resource.speaker || '')
        .split(speakerSeparators)
        .map((part) => part.trim().replace(/^the\s+/i, ''))
        .filter(isPersonName),
    )
    names.forEach((name) => {
      const entry = people.get(name) || { name, resources: [], views: 0 }
      entry.resources.push(resource)
      entry.views += resource.viewCount || 0
      people.set(name, entry)
    })
  })
  return [...people.values()]
    .filter((entry) => entry.resources.length >= 2)
    .sort((a, b) => b.views - a.views || a.name.localeCompare(b.name, 'en'))
    .slice(0, 14)
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

// Each direction gets its own short prerequisite chain instead of one generic
// Math → ML → goal line. Every node's focus is a real library filter, so
// clicking a stage shows the sources that teach it.
const goalPrerequisites = {
  'World Model': [
    { id: 'math', label: 'Math foundations', focus: 'Other' },
    { id: 'foundations', label: 'Deep learning foundations', focus: 'Other' },
    { id: 'vision', label: 'Vision & video models', focus: 'Vision' },
    { id: 'goal', label: 'World models', focus: 'World Model' },
  ],
  Agent: [
    { id: 'math', label: 'Math foundations', focus: 'Other' },
    { id: 'foundations', label: 'Language model foundations', focus: 'Other' },
    { id: 'goal', label: 'Agents & planning', focus: 'Agent' },
  ],
  Vision: [
    { id: 'math', label: 'Linear algebra & probability', focus: 'Other' },
    { id: 'foundations', label: 'Deep learning foundations', focus: 'Other' },
    { id: 'goal', label: 'Computer vision', focus: 'Vision' },
  ],
  Robotics: [
    { id: 'math', label: 'Math foundations', focus: 'Other' },
    { id: 'control', label: 'Control & reinforcement learning', focus: 'Other' },
    { id: 'goal', label: 'Robot learning', focus: 'Robotics' },
  ],
  Math: [
    { id: 'matrix', label: 'Matrix methods', focus: 'Other' },
    { id: 'optimization', label: 'Optimization', focus: 'Other' },
    { id: 'goal', label: 'AI mathematics', focus: 'Other' },
  ],
  'How to Research': [
    { id: 'reading', label: 'Reading & reviewing papers', focus: 'How to Research' },
    { id: 'writing', label: 'Experiments & writing', focus: 'How to Research' },
    { id: 'goal', label: 'Research practice', focus: 'How to Research' },
  ],
}

export function prerequisiteNodes(goal) {
  return goalPrerequisites[goal] || [
    { id: 'math', label: 'Math foundations', focus: 'Other' },
    { id: 'foundations', label: 'ML foundations', focus: 'Other' },
    { id: 'goal', label: goal, focus: goal },
  ]
}
