import { formatDuration, getBroaderTopic, getDisplayTopic } from './resource-utils.js'
import { editorialOverrides } from './editorial-overrides.js'

// Local podcast heuristic, duplicated in PodcastShows.jsx on purpose so that
// resource-utils.js stays untouched. Keep both copies aligned:
// podcast if format/seriesTitle/channel matches /podcast/i, or title/channel contains 播客.
export function isPodcastResource(resource) {
  return (
    /podcast/i.test(resource.format || '') ||
    /podcast/i.test(resource.seriesTitle || '') ||
    /podcast/i.test(resource.channel || '') ||
    (resource.title || '').includes('播客') ||
    (resource.channel || '').includes('播客')
  )
}

export function showNameFor(resource) {
  return resource.seriesTitle || resource.channel
}

// Verification bookkeeping that should never leak into editorial copy.
const verificationBoilerplate = new RegExp(
  [
    'matched to the target',
    'public metadata',
    'metadata accessible',
    'metadata reviewed',
    'player metadata',
    'verified as accessible',
    'accessibility verified',
    'editorially reviewed',
    'discovered through public',
    'official video endpoint',
    'title, channel',
    'title, creator',
    'targeted addition',
    'curated in the targeted',
    'curated for the',
    'weekly update',
    'canonical video url',
    'official institution, conference',
    'public youtube result',
    'original .{0,60} upload',
    'priority areas',
  ].join('|'),
  'i',
)

// Keeps the substantive sentences of a verification note and drops the audit trail.
export function distillNotes(resource) {
  if (!resource.notes?.trim()) return ''
  return resource.notes
    .split(/(?<=[.!?;。！？；])\s*/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24 && !verificationBoilerplate.test(sentence))
    .slice(0, 2)
    .map((sentence) => sentence.charAt(0).toLocaleUpperCase() + sentence.slice(1))
    .map((sentence) => (/[.!?。！？]$/.test(sentence) ? sentence : `${sentence}.`))
    .join(' ')
}

// --- Deterministic variation -------------------------------------------------
// Copy is assembled from small sentence banks. The variant for each slot is
// chosen with a stable FNV-1a hash of the resource identity plus a per-slot
// salt, so the same resource always renders the same copy while resources that
// share a shape (same section, same focus area) still read differently.

function hashText(text) {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function pickFor(resource, salt, variants) {
  return variants[hashText(`${resource.id}|${resource.title}|${salt}`) % variants.length]
}

// --- Signal extraction --------------------------------------------------------

// Some catalog rows carry noisy speaker and channel fields (truncated titles,
// emoji prefixes, stray whitespace). Normalize and fall back to the channel
// rather than amplifying bad data.
function channelFor(resource) {
  return (resource.channel || '').trim().replace(/\s+/g, ' ')
}

function presenterFor(resource) {
  const speaker = resource.speaker?.trim().replace(/\s+/g, ' ')
  if (!speaker || speaker === 'To be added') return channelFor(resource)
  if (!/^[\p{L}\p{N}]/u.test(speaker)) return channelFor(resource)
  if (speaker.length > 40 && resource.title.includes(speaker)) return channelFor(resource)
  return speaker
}

function publishedYearFor(resource) {
  const year = Number.parseInt(resource.publishedAt, 10)
  return Number.isInteger(year) && year > 1900 ? year : null
}

function primaryKeywordFor(resource, topic) {
  const keyword = resource.keywords
    ?.split(';')
    .map((value) => value.trim())
    .find(Boolean)
  if (!keyword) return null
  if (/[\u3400-\u9fff]/.test(keyword)) return null
  const normalized = keyword.replace(/\s*\/\s*/g, ' and ')
  const a = normalized.toLocaleLowerCase()
  const b = topic.toLocaleLowerCase()
  if (a.includes(b) || b.includes(a)) return null
  return normalized
}

// The delivery form drives most of the framing: a follow-along build session,
// a lecture, a keynote, a panel, a research talk, or a conversation all promise
// the viewer different things.
function formProfileFor(resource) {
  const title = resource.title.toLocaleLowerCase()
  const format = (resource.format || '').toLocaleLowerCase()
  const series = (resource.seriesTitle || '').toLocaleLowerCase()

  if (/keynote/.test(format) || /keynote/.test(title)) return 'keynote'
  if (/panel|debate|roundtable|forum/.test(format) || /panel|debate|roundtable/.test(title)) return 'panel'
  if (
    /podcast|fireside/.test(format) ||
    /podcast|fireside/.test(title) ||
    /podcast/.test(series) ||
    isPodcastResource(resource)
  ) {
    return 'podcast'
  }
  if (resource.section === 'Interview') return 'interview'
  if (
    /from scratch|let['\u2019]s build|spelled-out|spelled out|in code|implementation|hands-on|coding|build your own|实战/.test(title) ||
    /hands-on/.test(format)
  ) {
    return 'build'
  }
  if (resource.section === 'Course') return 'course'
  if (
    /seminar|research talk|academic|invited|nobel|thesis|dissertation/.test(format) ||
    /\bpaper\b|cvpr|neurips|icml|iclr|siggraph|acl\b|emnlp/.test(title)
  ) {
    return 'research-talk'
  }
  return 'talk'
}

// --- Topic profiles -----------------------------------------------------------
// Each research direction gets its own phrasing and a small set of "stakes"
// lines describing why material in that direction earns attention, so the copy
// carries some domain texture instead of a generic topic slug.

const focusProfiles = {
  'World Model': {
    topic: 'world models',
    persona: 'researchers mapping the world-model literature and engineers experimenting with learned simulators',
    stakes: [
      'how far predictive models of environments can carry planning, video, and embodied reasoning',
      'whether learned simulators can replace hand-built environments as the substrate for training and evaluation',
      'what it takes to get from next-frame prediction to models that support counterfactuals and control',
    ],
  },
  Agent: {
    topic: 'AI agents',
    persona: 'engineers wiring up agent stacks and researchers studying planning, memory, and tool use',
    stakes: [
      'what actually makes agent systems dependable once tool use, memory, and long horizons enter the loop',
      'how the gap between impressive agent demos and reliable deployments is being closed',
      'where the real difficulty in agents sits: orchestration, evaluation, and recovering from failure',
    ],
  },
  Vision: {
    topic: 'computer vision',
    persona: 'vision researchers and engineers who build on these models downstream',
    stakes: [
      'how visual representations are built, evaluated, and pushed toward 3D and video understanding',
      'what recognition, segmentation, and generation now share once large models enter the pipeline',
      'how benchmarks and architectures keep reshaping each other in modern vision work',
    ],
  },
  Robotics: {
    topic: 'robotics and embodied AI',
    persona: 'robotics students, embodied-AI researchers, and engineers who ship on real hardware',
    stakes: [
      'how learned policies survive contact with hardware, latency, and an unforgiving physical world',
      'what actually closes the gap between simulation and a robot that works',
      'how perception, control, and data collection have to fit together in embodied systems',
    ],
  },
  'How to Research': {
    topic: 'the craft of research',
    persona: 'graduate students and early-career researchers investing in how they work, not just what they work on',
    nonTechnical: true,
    stakes: [
      'habits that compound across a research career: choosing problems, reading, writing, and presenting',
      'the unglamorous skills that separate productive researchers from merely busy ones',
      'advice that transfers across fields because it is about how research actually gets done',
    ],
  },
}

const broaderProfiles = {
  Foundations: {
    topic: 'machine learning foundations',
    persona: 'students and self-taught practitioners laying durable foundations',
    stakes: [
      'the fundamentals that every newer result quietly assumes',
      'the base layer — optimization, representations, learning dynamics — that the rest of the field stands on',
      'first principles that stay true across model generations',
    ],
  },
  'AI Systems': {
    topic: 'AI systems and infrastructure',
    persona: 'engineers who train, serve, and scale models for a living',
    stakes: [
      'the unglamorous machinery — compute, data pipelines, serving — that decides what actually ships',
      'how models meet hardware, cost, and reliability constraints outside the lab',
      'the systems layer where research ideas either scale or stall',
    ],
  },
  NLP: {
    topic: 'language models and NLP',
    persona: 'practitioners who work with language models day to day',
    stakes: [
      'how language models are built, adapted, and honestly evaluated',
      'what the transformer era has settled in language processing and what it has left open',
      'the road from word vectors to instruction-following models, and what carried over',
    ],
  },
  Industry: {
    topic: 'the AI industry',
    persona: 'founders, product leads, and researchers who need to read the industry\u2019s direction',
    nonTechnical: true,
    stakes: [
      'the strategy, capital, and personalities steering the field from outside the lab',
      'how research priorities and business pressure are currently shaping each other',
      'the industrial context that decides which research directions get resourced',
    ],
  },
  'Social Impact': {
    topic: 'AI safety and social impact',
    persona: 'researchers, builders, and policy-minded readers weighing AI\u2019s societal stakes',
    nonTechnical: true,
    stakes: [
      'the safety, governance, and societal questions that capability growth keeps raising',
      'where technical progress collides with alignment, policy, and public trust',
    ],
  },
  'Research Frontiers': {
    topic: 'frontier AI research',
    persona: 'researchers scanning for the next problem worth years of their time',
    stakes: [
      'questions the field has not settled yet — which is exactly why they deserve attention',
      'early signals about where serious research energy is heading next',
    ],
  },
}

function topicProfileFor(resource) {
  const profile = focusProfiles[resource.focusArea]
  if (profile) return profile
  return broaderProfiles[getBroaderTopic(resource)] || broaderProfiles['Research Frontiers']
}

// --- Why watch ----------------------------------------------------------------

const hookBanks = {
  build: [
    (r, p) => `In \u201c${r.title}\u201d, ${p} builds the thing on screen instead of describing it, so every claim stays attached to code you can run and break.`,
    (r, p) => `\u201c${r.title}\u201d is a follow-along session: ${p} works the implementation out step by step, which keeps the ideas honest in a way slides never do.`,
    (r, p) => `${p} spells the material out in working code here, and \u201c${r.title}\u201d rewards pausing, retyping, and checking your version against the original.`,
  ],
  course: [
    (r, p) => `\u201c${r.title}\u201d is built as teaching, not as a highlights reel: ${p} sequences the material so that each step earns the next.`,
    (r, p) => `${p} delivers \u201c${r.title}\u201d at lecture pace — definitions before results, examples before abstractions — which makes it dependable to study from.`,
    (r, p) => `\u201c${r.title}\u201d gives you structured instruction to pause, rewind, and take notes against, with ${p} doing the sequencing for you.`,
  ],
  keynote: [
    (r, p) => `\u201c${r.title}\u201d is the agenda stated in public: ${p} committing to claims, demos, and a roadmap that the field then spends months reacting to.`,
    (r, p) => `Keynotes are where positions become commitments, and in \u201c${r.title}\u201d ${p} lays out the priorities and the bets in primary-source form.`,
    (r, p) => `In \u201c${r.title}\u201d, ${p} makes the case directly — the framing, the numbers, the demos — rather than filtered through coverage of it.`,
  ],
  panel: [
    (r, p) => `\u201c${r.title}\u201d keeps the disagreement intact: positions, objections, and hedges from ${p} and the other participants survive here in a way summaries flatten.`,
    (r, p) => `The value of \u201c${r.title}\u201d is friction — you watch positions collide and see which of the arguments hold up under pushback in real time.`,
  ],
  'research-talk': [
    (r, p) => `\u201c${r.title}\u201d is the work presented by the people who did it: ${p} walks through the claims, the evidence, and — if you listen for them — the limitations.`,
    (r, p) => `In \u201c${r.title}\u201d, ${p} presents the research the way it should be judged: what was tried, what the results actually show, and what remains open.`,
  ],
  podcast: [
    (r, p) => `Long-form audio does something papers cannot: in \u201c${r.title}\u201d, ${p} thinks out loud, and the hesitations and revisions are part of the signal.`,
    (r, p) => `\u201c${r.title}\u201d gives ${p} room to reason in the first person — how decisions were actually made, what was uncertain at the time, and what they would now do differently.`,
    (r, p) => `The format matters here: across a long conversation, ${p} gets past rehearsed answers and into the trade-offs behind them — that is what \u201c${r.title}\u201d is for.`,
  ],
  interview: [
    (r, p) => `\u201c${r.title}\u201d captures ${p} explaining decisions in their own words — the constraints, the alternatives considered, and the reasoning that summaries strip away.`,
    (r, p) => `Interviews earn a place in the index when the guest gets candid, and in \u201c${r.title}\u201d ${p} gets specific about judgment calls rather than staying at press-release altitude.`,
  ],
  talk: [
    (r, p) => `\u201c${r.title}\u201d preserves the argument as ${p} chose to make it — the framing, the examples, and the emphasis are all primary source.`,
    (r, p) => `In \u201c${r.title}\u201d, ${p} makes the case directly, which lets you judge the argument on its own terms instead of through a retelling.`,
  ],
}

// Used when the speaker is unknown and only the channel is credited, so the
// copy never presents the hosting channel as the guest.
const channelHookBanks = {
  podcast: [
    (r) => `Long-form audio does something papers cannot, and \u201c${r.title}\u201d uses it: the guest thinks out loud, and the hesitations and revisions are part of the signal.`,
    (r) => `\u201c${r.title}\u201d runs long enough to get past rehearsed answers and into the trade-offs behind them — that is what the format is for.`,
  ],
  interview: [
    (r) => `\u201c${r.title}\u201d catches its guest explaining decisions in their own words — the constraints, the alternatives considered, and the reasoning that summaries strip away.`,
    (r) => `Interviews earn a place in the index when the questions draw out real candor, and \u201c${r.title}\u201d is one of those sessions.`,
  ],
  talk: [
    (r) => `\u201c${r.title}\u201d preserves the argument exactly as it was delivered — the framing, the examples, and the emphasis are all primary source.`,
    (r) => `\u201c${r.title}\u201d lets you judge the case on its own terms: no summary sits between you and the original delivery.`,
  ],
  'research-talk': [
    (r) => `\u201c${r.title}\u201d is the research presented first-hand: the claims, the evidence, and — if you listen for them — the limitations.`,
    (r) => `\u201c${r.title}\u201d presents the work the way it should be judged: what was tried, what the results actually show, and what remains open.`,
  ],
}

function stakesSentenceFor(resource, profile) {
  const stake = pickFor(resource, 'stake', profile.stakes)
  const keyword = primaryKeywordFor(resource, profile.topic)
  const shelf = profile.topic.replace(/^the /, '')
  const base = pickFor(resource, 'stake-frame', [
    `Within the ${shelf} shelf of this index, it earns its slot by engaging with ${stake}`,
    `It matters for ${profile.topic} because it bears directly on ${stake}`,
    `For anyone working on ${profile.topic}, the draw is ${stake}`,
  ])
  return keyword ? `${base}, with ${keyword} as the running thread.` : `${base}.`
}

function eraSentenceFor(resource) {
  const year = publishedYearFor(resource)
  if (!year) return ''
  if (year <= 2015) {
    return pickFor(resource, 'era', [
      `It was recorded in ${year}, and that is part of its value: this is the source framing, not a retrospective.`,
      `The ${year} recording date is a feature — it has had time to age into a reference point, and it holds up.`,
    ])
  }
  if (year <= 2021) {
    return pickFor(resource, 'era', [
      `Recorded in ${year}, it predates the current model generation, so watch it for the reasoning rather than the state of the art.`,
      `It dates from ${year} — early enough that you can see which of its bets the field went on to take.`,
    ])
  }
  if (year >= 2025) {
    return pickFor(resource, 'era', [
      `Published in ${year}, it reflects where the conversation actually stands rather than where it stood two hype cycles ago.`,
      `The ${year} recording is fresh enough to double as a current-state snapshot of the field.`,
    ])
  }
  return ''
}

const platformPhrases = {
  Bilibili: ' on Bilibili',
  'Conference Site': ' on the conference\u2019s own site',
  'Official Site': ' on the official site',
}

function curationSentenceFor(resource, presenter) {
  const platformBit = platformPhrases[resource.platform] || ''
  const channel = channelFor(resource)
  const sourceBit = presenter === channel
    ? pickFor(resource, 'source', [
        `The recording sits on ${channel}\u2019s own channel${platformBit}`,
        `It comes straight from ${channel}${platformBit}`,
      ])
    : pickFor(resource, 'source', [
        `${channel} carries the original recording${platformBit}`,
        `The full session is preserved by ${channel}${platformBit}`,
      ])

  if (resource.recommendation === 'Core') {
    return sourceBit + pickFor(resource, 'curation', [
      ', and its Core placement marks it as one of the anchors for this corner of the index.',
      ', and it holds Core status here — a defensible first stop on this shelf.',
      '; we rank it Core, which makes it one of the stronger starting points for the topic.',
    ])
  }
  if (resource.recommendation === 'Reserve') {
    return sourceBit + pickFor(resource, 'curation', [
      ', and its Reserve placement is deliberate: a specialist angle to pull once the mainline references are done.',
      '; we hold it in Reserve — most useful when your own work touches this exact ground.',
    ])
  }
  return sourceBit + pickFor(resource, 'curation', [
    ', and its Recommended placement makes it a strong second step once the Core anchors are in place.',
    '; it is Recommended here — a focused complement rather than the first thing to watch.',
  ])
}

export function buildWhyWatch(resource) {
  const presenter = presenterFor(resource)
  const profile = topicProfileFor(resource)
  const form = formProfileFor(resource)

  const bank = presenter === channelFor(resource) && channelHookBanks[form]
    ? channelHookBanks[form]
    : hookBanks[form]
  const hook = pickFor(resource, 'hook', bank)(resource, presenter)
  const stakes = stakesSentenceFor(resource, profile)
  const era = eraSentenceFor(resource)
  const curation = curationSentenceFor(resource, presenter)

  return [hook, stakes, era, curation].filter(Boolean).join(' ')
}

// --- Audience -----------------------------------------------------------------

function levelFor(resource) {
  const title = resource.title.toLocaleLowerCase()
  if (/\bintro\b|introduction|\b101\b|beginner|crash course|clearly explained|foundation|explained|入门/.test(title)) {
    return 'intro'
  }
  if (/advanced|graduate|phd|research seminar/.test(title)) return 'advanced'
  return 'default'
}

function whoSentenceFor(resource, profile, form, presenter) {
  const level = levelFor(resource)

  if (form === 'build') {
    return pickFor(resource, 'who', [
      `Best for ${profile.persona} — people who will actually type along; come comfortable with Python, because the payoff is in following the code, not watching it.`,
      `This is for ${profile.persona} willing to build alongside the video; passive viewing wastes what makes it good.`,
    ])
  }
  if (form === 'course') {
    if (level === 'intro') {
      return pickFor(resource, 'who', [
        `A genuine on-ramp: it suits ${profile.persona} and assumes little beyond general programming and curiosity.`,
        `Start here if you are new — it is pitched at ${profile.persona} without demanding prior depth in the area.`,
      ])
    }
    if (profile.nonTechnical) {
      return pickFor(resource, 'who', [
        `Made for ${profile.persona}; it asks for no technical prerequisites, only real work in progress to apply it to.`,
        `It suits ${profile.persona} — no mathematical background required, just the willingness to change how you work.`,
      ])
    }
    return pickFor(resource, 'who', [
      `Made for ${profile.persona}, with the standard prerequisites — linear algebra, probability, some programming — already in place.`,
      `It suits ${profile.persona} who can meet lecture-level material head on; if the prerequisites are shaky, take an intro entry first.`,
    ])
  }
  if (form === 'research-talk') {
    return pickFor(resource, 'who', [
      `Aimed at ${profile.persona} — viewers who already know the subfield\u2019s main results, since the talk cites them as shared context.`,
      `Best once you know the fundamentals: ${profile.persona} will get the most from how the evidence is argued.`,
    ])
  }
  if (form === 'keynote' || form === 'panel') {
    return pickFor(resource, 'who', [
      `No prerequisites beyond context: it serves ${profile.persona} who want to hear the agenda argued first-hand.`,
      `It rewards ${profile.persona} — especially anyone tracking where the field is being steered rather than hunting for technique.`,
    ])
  }
  if (form === 'podcast' || form === 'interview') {
    if (presenter === channelFor(resource)) {
      return pickFor(resource, 'who', [
        `Most valuable to ${profile.persona}, and it pays extra if you arrive already knowing the guest\u2019s broader work.`,
        `Watch it as ${profile.persona} would: for the reasoning and the decision context, not for a tutorial.`,
      ])
    }
    return pickFor(resource, 'who', [
      `Most valuable to ${profile.persona}, and it pays extra if you already know ${presenter}\u2019s work well enough to notice what is new here.`,
      `Watch it as ${profile.persona} would: for the reasoning and the decision context, not for a tutorial.`,
    ])
  }
  return pickFor(resource, 'who', [
    `It serves ${profile.persona} — people after the primary-source version of the argument rather than a summary of it.`,
    `Best for ${profile.persona} — it offers more than a surface pass over the topic, and it rewards full attention.`,
  ])
}

function timingSentenceFor(resource) {
  const minutes = resource.durationMinutes
  const duration = formatDuration(minutes)

  if (minutes < 20) {
    return pickFor(resource, 'timing', [
      `At ${duration}, it costs almost nothing to watch — use it as a scout before committing to the long-form material nearby.`,
      `It runs just ${duration}; watch it as a primer and decide afterwards how much deeper to go.`,
    ])
  }
  if (minutes < 45) {
    return pickFor(resource, 'timing', [
      `The ${duration} runtime fits one focused sitting — a commute, a lunch break, or the gap between two meetings.`,
      `At ${duration} it is a single-session watch; take it whole rather than in fragments.`,
    ])
  }
  if (minutes <= 90) {
    return pickFor(resource, 'timing', [
      `Budget ${duration} plus note-taking time and treat it as one full study block.`,
      `It wants a proper ${duration} sitting — schedule it like a seminar, not background listening.`,
    ])
  }
  if (minutes <= 180) {
    return pickFor(resource, 'timing', [
      `At ${duration}, plan one long sitting or two halves with notes in between; it is structured enough to survive the split.`,
      `The ${duration} length is a real commitment — block an evening for it, or split it at a natural chapter break.`,
    ])
  }
  if (minutes <= 600) {
    return pickFor(resource, 'timing', [
      `At ${duration} this is reference material: work through it in sections and return to the parts your own work touches.`,
      `It runs ${duration}, so treat it as a mini-curriculum rather than a single viewing.`,
    ])
  }
  return `At ${duration}, this is a full course commitment — schedule it across weeks the way you would a real class, not a watchlist item.`
}

function selectionSentenceFor(resource, profile) {
  const sectionNoun = resource.section.toLocaleLowerCase()

  if (resource.seriesTitle) {
    if (resource.recommendation === 'Core') {
      return `It belongs to ${resource.seriesTitle}, and as a Core pick it is the right place to decide whether the whole sequence deserves a slot in your plan.`
    }
    if (resource.recommendation === 'Reserve') {
      return `It sits at the Reserve end of ${resource.seriesTitle} — worth pulling when your work touches this exact ground.`
    }
    return `It sits inside ${resource.seriesTitle}; reach for it after the Core entries when you want the sequence\u2019s next angle.`
  }
  if (resource.recommendation === 'Core') {
    return pickFor(resource, 'selection', [
      `If you watch one ${sectionNoun} on ${profile.topic} this month, this is a defensible choice.`,
      `Treat it as an anchor: watch it early and let it set the bar for everything else on this shelf.`,
    ])
  }
  if (resource.recommendation === 'Reserve') {
    return pickFor(resource, 'selection', [
      `Skip it on a first pass through ${profile.topic}; come back when your own work runs into exactly this territory.`,
      `It is a specialist detour — valuable when you need this precise angle, safely skippable otherwise.`,
    ])
  }
  return pickFor(resource, 'selection', [
    `Slot it in after the Core anchors — it sharpens the picture rather than starting it.`,
    `It works best as a second pass on ${profile.topic}, once the anchors have set the frame.`,
  ])
}

function languageSentenceFor(resource) {
  if (resource.language !== 'Chinese') return ''
  return pickFor(resource, 'language', [
    `The session is delivered in Chinese, which makes it one of the stronger first-language entries on this topic in the index.`,
    `It is taught in Chinese — a real advantage if that is your first language, and worth pairing with an English companion piece otherwise.`,
  ])
}

export function buildAudience(resource) {
  const presenter = presenterFor(resource)
  const profile = topicProfileFor(resource)
  const form = formProfileFor(resource)

  return [
    whoSentenceFor(resource, profile, form, presenter),
    timingSentenceFor(resource),
    selectionSentenceFor(resource, profile),
    languageSentenceFor(resource),
  ].filter(Boolean).join(' ')
}

// --- Detail resolution ----------------------------------------------------------

export function getResourceDetail(resource) {
  const override = editorialOverrides[resource.id]
  return {
    whyWatch: override?.whyWatch || resource.whyWatch || buildWhyWatch(resource),
    audience: override?.audience || resource.audience || buildAudience(resource),
    publishedAt: resource.publishedAt || 'Not yet verified',
    lastVerifiedAt: resource.lastVerifiedAt || resource.collectedOn || 'Not yet verified',
  }
}

function uniqueSeriesValues(resources, getter) {
  return [...new Set(resources.map(getter).filter(Boolean))]
}

function listTopics(topics) {
  if (topics.length <= 1) return topics[0] || 'its research area'
  if (topics.length === 2) return `${topics[0]} and ${topics[1]}`
  return `${topics.slice(0, -1).join(', ')}, and ${topics[topics.length - 1]}`
}

// Editorial introduction for a grouped series: what it is, who it is for,
// and how much of it the index holds. Used by CourseSeriesDetail and PodcastShows.
export function buildSeriesIntro(series) {
  const episodes = series.resources
  const count = episodes.length
  const totalMinutes = episodes.reduce((total, resource) => total + resource.durationMinutes, 0)
  const runtime = formatDuration(totalMinutes)
  const topics = listTopics(uniqueSeriesValues(episodes, getDisplayTopic).slice(0, 3))
  const languages = uniqueSeriesValues(episodes, (resource) => resource.language).join(' and ')
  const channels = uniqueSeriesValues(episodes, (resource) => resource.channel)
  const sections = uniqueSeriesValues(episodes, (resource) => resource.section)
  const isPodcast = episodes.some(isPodcastResource)
  const isCourse = sections.length === 1 && sections[0] === 'Course'
  const episodeWord = count === 1 ? 'episode' : 'episodes'

  if (isPodcast) {
    return `${series.title} is a long-form ${languages} podcast whose episodes are selected here for guests who do the research or build the systems they discuss. ScholarTube indexes ${count} ${episodeWord} (${runtime} of conversation) covering ${topics}, each linked to its canonical upload. It suits listeners who want first-person reasoning — lab context, disagreements, and research taste — rather than a news summary.`
  }
  if (isCourse) {
    return `${series.title} is a complete course indexed as ${count} ${count === 1 ? 'lecture' : 'lectures'} (${runtime} of teaching) from ${channels.join(' and ')}. Follow the listed order for a structured path through ${topics}, or jump straight to the lecture that matches the problem in front of you. It suits students and researchers who want the primary teaching material, not a compressed retelling.`
  }
  return `${series.title} groups ${count} ${episodeWord} from the same program (${runtime} in total) spanning ${topics}. Every entry keeps its canonical link and verified metadata, so the videos can be watched, cited, and compared without leaving the source. Use it when you want one program’s perspective across guests and topics rather than a single conversation.`
}

export function getResourceTopics(resource, limit = 5) {
  const keywords = (resource.keywords || '')
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean)
  if (keywords.length) return [...new Set(keywords)].slice(0, limit)
  return (resource.domain || '')
    .split('/')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, limit)
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
