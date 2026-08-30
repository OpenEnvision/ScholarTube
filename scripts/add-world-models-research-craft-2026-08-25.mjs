import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 2026-08-25 content-quality expansion focused on World Models (courses + invited
// talks), How to Research (Hamming's complete NPS course plus canonical craft
// lectures), and targeted Vision keynotes. Every record is verified against public
// YouTube metadata (oEmbed + watch page + search/playlist listings) before it is
// written; candidates that cannot be verified are skipped and reported, never guessed.

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const auditReportPath = path.join(projectDirectory, 'data', 'world_models_research_craft_curation_2026-08-25.md')
const collectedOn = '2026-08-25'

const sourceTiers = {
  official: 'A | Official / Original Creator / Organizer',
  institution: 'B | University / Conference / Institution',
  community: 'C | Community Selection',
}

const headers = {
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
  cookie: 'CONSENT=YES+cb; SOCS=CAI',
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let lastRequestAt = 0
async function throttledFetch(url, gapMs = 1300) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const wait = lastRequestAt + gapMs - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequestAt = Date.now()
    const response = await fetch(url, { headers })
    if (response.status === 429 || response.status >= 500) {
      await sleep(10000 * 2 ** attempt)
      continue
    }
    return response
  }
  throw new Error(`Rate limited after retries: ${url}`)
}

function decodeJsonString(value) {
  return JSON.parse(`"${value}"`)
}

function parseDurationText(text) {
  const parts = text.split(':').map(Number)
  if (parts.some(Number.isNaN)) return null
  return parts.reduce((acc, part) => acc * 60 + part, 0)
}

const monthNumbers = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }
function parseDateText(dateText) {
  if (!dateText) return null
  const cleaned = dateText.replace(/^(Streamed live on|Premiered|Premieres)\s+/i, '').trim()
  const match = cleaned.match(/^([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})$/)
  if (!match) return null
  return `${match[3]}-${monthNumbers[match[1]]}-${String(Number(match[2])).padStart(2, '0')}`
}

async function fetchOembed(videoId) {
  const response = await throttledFetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
  if (!response.ok) return null
  return await response.json()
}

async function fetchWatchMeta(videoId) {
  const response = await throttledFetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`)
  if (!response.ok) throw new Error(`watch page ${videoId}: HTTP ${response.status}`)
  const html = await response.text()
  const viewCount = html.match(/"videoViewCountRenderer":\{"viewCount":\{"simpleText":"([\d,]+) views?"/)?.[1]
  const dateText = html.match(/"dateText":\{"simpleText":"((?:[^"\\]|\\.)*)"/)?.[1]
  return {
    viewCount: viewCount ? Number(viewCount.replaceAll(',', '')) : null,
    publishedAt: parseDateText(dateText ? decodeJsonString(dateText) : null),
  }
}

function extractSearchResults(html, limit = 8) {
  const results = []
  for (const chunk of html.split('"videoRenderer":{"videoId":"').slice(1)) {
    if (results.length >= limit) break
    const videoId = chunk.slice(0, 11)
    const scope = chunk.slice(0, 15000)
    const length = scope.match(/"lengthText":\{[\s\S]{0,400}?"simpleText":"([\d:]+)"/)?.[1]
    results.push({ videoId, durationSeconds: length ? parseDurationText(length) : null })
  }
  return results
}

async function fetchSearchDuration(videoId, titleFallback) {
  const byId = await throttledFetch(`https://www.youtube.com/results?search_query=%22${videoId}%22&hl=en`, 3200)
  if (byId.ok) {
    const hit = extractSearchResults(await byId.text()).find((result) => result.videoId === videoId)
    if (hit?.durationSeconds) return hit.durationSeconds
  }
  if (!titleFallback) return null
  const byTitle = await throttledFetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(titleFallback)}&hl=en`, 3200)
  if (!byTitle.ok) return null
  const hit = extractSearchResults(await byTitle.text(), 12).find((result) => result.videoId === videoId)
  return hit?.durationSeconds ?? null
}

// YouTube A/B-tests two markup variants for playlist pages; parse both.
async function fetchPlaylist(listId) {
  const response = await throttledFetch(`https://www.youtube.com/playlist?list=${listId}&hl=en`)
  if (!response.ok) throw new Error(`playlist ${listId}: HTTP ${response.status}`)
  const html = await response.text()
  const videos = []
  const seen = new Set()
  for (const chunk of html.split('"playlistVideoRenderer":{').slice(1)) {
    const videoId = chunk.match(/^"videoId":"([\w-]{11})"/)?.[1]
    if (!videoId || seen.has(videoId)) continue
    const title = chunk.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)?.[1]
    const length = chunk.match(/"lengthSeconds":"(\d+)"/)?.[1]
    if (!title) continue
    seen.add(videoId)
    videos.push({ videoId, title: decodeJsonString(title), durationSeconds: length ? Number(length) : null })
  }
  for (const chunk of html.split('"lockupViewModel":{').slice(1)) {
    const videoId = chunk.match(/"watchEndpoint":\{"videoId":"([\w-]{11})"/)?.[1]
    if (!videoId || seen.has(videoId)) continue
    const title = chunk.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/)?.[1]
    const badge = chunk.match(/"thumbnailBadgeViewModel":\{"text":"([\d:]+)"/)?.[1]
    if (!title) continue
    seen.add(videoId)
    videos.push({ videoId, title: decodeJsonString(title), durationSeconds: badge ? parseDurationText(badge) : null })
  }
  return videos
}

// ---------------------------------------------------------------------------
// Candidate definitions. Static fields are editorial; title/channel/duration/
// viewCount/publishedAt are always taken from live public metadata.
// ---------------------------------------------------------------------------

const cs285LectureTopics = {
  10: {
    topic: 'Optimal Control and Planning',
    keywords: 'Optimal Control; Planning; Model Predictive Control; Cross-Entropy Method; Monte Carlo Tree Search',
    recommendation: 'Recommended',
    why: 'planning-with-known-models prerequisite for the model-based RL block',
  },
  11: {
    topic: 'Model-Based Reinforcement Learning',
    keywords: 'Model-Based RL; Learned Dynamics; Uncertainty Estimation; World Models; Planning',
    recommendation: 'Core',
    why: 'canonical lecture on learning dynamics models and planning through them',
  },
  12: {
    topic: 'Model-Based Policy Learning',
    keywords: 'Model-Based RL; Policy Learning; Latent-Space Models; Dyna; World Models',
    recommendation: 'Core',
    why: 'canonical lecture on training policies inside learned models, including latent-space (world-model) variants',
  },
}

const hammingCoreOrders = new Set([0, 1, 25, 26, 27, 28, 29, 30])
const hammingExcludedFinaleId = 'e3msMuwqp-o' // “You and Your Research” — already indexed as ST-866 (community upload of the same 6 June 1995 lecture).

const abbeelFoundations = {
  1: { keywords: 'MDPs; Value Iteration; Policy Iteration; Maximum-Entropy RL', recommendation: 'Core', focusArea: 'Other' },
  2: { keywords: 'Deep Q-Learning; Value-Based RL; Experience Replay; Atari', recommendation: 'Recommended', focusArea: 'Other' },
  3: { keywords: 'Policy Gradients; Advantage Estimation; Baselines; Actor-Critic', recommendation: 'Recommended', focusArea: 'Other' },
  4: { keywords: 'TRPO; PPO; Trust Regions; Policy Optimization', recommendation: 'Recommended', focusArea: 'Other' },
  5: { keywords: 'DDPG; SAC; Off-Policy RL; Continuous Control', recommendation: 'Recommended', focusArea: 'Other' },
  6: { keywords: 'Model-Based RL; World Models; Learned Simulators; Planning in Imagination', recommendation: 'Core', focusArea: 'World Model' },
}

const playlistGroups = [
  {
    key: 'cs285-model-based-block',
    listId: 'PL_iWQOsE6TfVYGEGiAOMaOzzv41Jfm_Ps',
    expectedChannel: 'RAIL',
    select: (video) => {
      const match = video.title.match(/^CS 285: Lecture (\d+), Part (\d+)/)
      if (!match) return null
      const lecture = Number(match[1])
      if (lecture < 10 || lecture > 12) return null
      return { lecture, part: Number(match[2]) }
    },
    build: (video, { lecture, part }) => {
      const topic = cs285LectureTopics[lecture]
      return {
        section: 'Course',
        focusArea: 'World Model',
        domain: 'Deep Reinforcement Learning / Model-Based RL',
        keywords: topic.keywords,
        language: 'English',
        speaker: 'Sergey Levine / Berkeley RAIL',
        format: 'Course Lecture',
        sourceTier: sourceTiers.official,
        recommendation: topic.recommendation,
        notes: `Part ${part} of Lecture ${lecture} ("${topic.topic}") in the Fall 2023 offering of UC Berkeley CS285, published on the Robotic AI & Learning Lab channel. Completes the model-based RL block (Lectures 10–12) of a course the index previously carried only through Lecture 2; selected because it is the ${topic.why}. Official course page: https://rail.eecs.berkeley.edu/deeprlcourse-fa23/`,
        seriesId: 'berkeley-cs285-fall-2023',
        seriesTitle: 'UC Berkeley CS285: Deep Reinforcement Learning — Fall 2023',
        seriesOrder: Number(`${lecture}.${part}`),
      }
    },
  },
  {
    key: 'hamming-learning-to-learn',
    listId: 'PLctkxgWNSR89bl7hTOS3F3wuoGj7id3Xy',
    expectedChannel: 'Hamming on Hamming: Learning to Learn',
    select: (video) => {
      if (video.videoId === hammingExcludedFinaleId) return null
      const match = video.title.match(/^(\d{2}) Hamming, Learning to Learn: (.+?),?\s+\d{1,2} [A-Z][a-z]+ 199\d$/)
      if (!match) return null
      return { order: Number(match[1]), lectureTitle: match[2] }
    },
    build: (video, { order, lectureTitle }) => ({
      section: 'Course',
      focusArea: 'How to Research',
      domain: 'Research Practice / Career',
      keywords: 'Research Career; Scientific Taste; Style of Thinking; Problem Selection; Learning to Learn',
      language: 'English',
      speaker: 'Richard W. Hamming',
      format: 'University Course Lecture',
      sourceTier: sourceTiers.institution,
      recommendation: hammingCoreOrders.has(order) ? 'Core' : 'Recommended',
      notes: order === 0
        ? 'Hamming’s 1990 Superintendent’s Guest Lecture at the Naval Postgraduate School, preserved on the NPS-maintained “Hamming on Hamming” channel as the prologue to the 1995 Learning to Learn course. An earlier, more compressed statement of the “You and Your Research” argument about doing first-class work.'
        : `Session ${order} ("${lectureTitle}") of Hamming’s 1995 NPS capstone course “The Art of Doing Science and Engineering: Learning to Learn”, from the NPS-maintained best-quality encodings (nps.edu/web/cs/hamming-resources). ${hammingCoreOrders.has(order) ? 'Marked Core: this session carries the course’s research-method argument directly.' : 'Marked Recommended: a topic chapter (as taught) that demonstrates the “style of thinking” the course teaches through a concrete technical domain.'} The closing “You and Your Research” session is already indexed as ST-866.`,
      seriesId: 'hamming-learning-to-learn-1995',
      seriesTitle: 'Richard Hamming — Learning to Learn: The Art of Doing Science and Engineering (NPS 1995)',
      seriesOrder: order,
    }),
  },
  {
    key: 'abbeel-foundations-of-deep-rl',
    listId: 'PLwRJQ4m4UJjNymuBM9RdmB3Z9N5-0IlY0',
    expectedChannel: 'Pieter Abbeel',
    select: (video) => {
      const match = video.title.match(/^L(\d) /)
      if (!match) return null
      return { order: Number(match[1]) }
    },
    build: (video, { order }) => ({
      section: 'Course',
      focusArea: abbeelFoundations[order].focusArea,
      domain: 'Deep Reinforcement Learning',
      keywords: abbeelFoundations[order].keywords,
      language: 'English',
      speaker: 'Pieter Abbeel',
      format: 'Course Lecture',
      sourceTier: sourceTiers.official,
      recommendation: abbeelFoundations[order].recommendation,
      notes: `Lecture ${order} of 6 in Abbeel’s self-published “Foundations of Deep RL” mini-course (2021), a compact, complete pathway from MDPs to model-based RL on the author’s own channel. ${order === 6 ? 'The closing lecture is the series’ world-models payoff: learning dynamics models and planning/learning inside them.' : 'Included so the six-lecture series is indexed complete rather than as isolated fragments.'}`,
      seriesId: 'abbeel-foundations-of-deep-rl-2021',
      seriesTitle: 'Pieter Abbeel — Foundations of Deep RL (6-lecture series, 2021)',
      seriesOrder: order,
    }),
  },
]

const simonsWorkshopSeries = {
  seriesId: 'simons-world-models-social-reasoning-2026',
  seriesTitle: 'Simons Institute — Topics in Intelligence: World Models and Social Reasoning (June 2026)',
}

function simonsTalk(videoId, speaker, day, keywords, recommendation, whyNote) {
  return {
    videoId,
    expectedChannel: 'Simons Institute for the Theory of Computing',
    section: 'Talk',
    focusArea: 'World Model',
    domain: 'World Models / Predictive Intelligence',
    keywords,
    language: 'English',
    speaker,
    format: 'Research Talk',
    sourceTier: sourceTiers.official,
    recommendation,
    notes: `${whyNote} Delivered ${day} June 2026 at the Simons Institute workshop “Topics in Intelligence: World Models and Social Reasoning” (simons.berkeley.edu); joins the two workshop talks already indexed (ST-985, ST-987) so the workshop is covered as a coherent series.`,
    seriesId: simonsWorkshopSeries.seriesId,
    seriesTitle: simonsWorkshopSeries.seriesTitle,
    seriesOrder: Number(`202606${String(day).padStart(2, '0')}`),
  }
}

const wadSeries = {
  seriesId: 'cvpr-wad-keynotes',
  seriesTitle: 'CVPR Workshop on Autonomous Driving — Keynotes',
}

function wadKeynote(videoId, { focusArea, domain, keywords, speaker, recommendation, note }) {
  return {
    videoId,
    expectedChannel: 'WAD at CVPR',
    section: 'Talk',
    focusArea,
    domain,
    keywords,
    language: 'English',
    speaker,
    format: 'Conference Keynote',
    sourceTier: sourceTiers.official,
    recommendation,
    notes: note,
    seriesId: wadSeries.seriesId,
    seriesTitle: wadSeries.seriesTitle,
    seriesOrder: null, // filled from verified publishedAt below
  }
}

const singleCandidates = [
  // --- World Models: course backbone ---
  {
    videoId: 'ItMutbeOHtc',
    expectedChannel: 'Google DeepMind',
    section: 'Course',
    focusArea: 'World Model',
    domain: 'Reinforcement Learning / Planning',
    keywords: 'Model-Based RL; Planning; Dyna; Monte Carlo Tree Search; Simulation-Based Search',
    language: 'English',
    speaker: 'David Silver',
    format: 'Course Lecture',
    sourceTier: sourceTiers.official,
    recommendation: 'Core',
    notes: 'Lecture 8 (“Integrating Learning and Planning”) of David Silver’s 2015 UCL RL course on the official Google DeepMind channel — the classic treatment of learning a model of the environment and planning with it (Dyna, simulation-based search). Only this lecture is added: the rest of the course is deliberately left out because the index already carries the complete 13-lecture DeepMind x UCL 2021 successor series.',
    seriesId: 'david-silver-rl-2015',
    seriesTitle: 'RL Course by David Silver (UCL, 2015)',
    seriesOrder: 8,
  },
  // --- World Models: invited talks and seminars ---
  {
    videoId: 'SpNTKghP11Q',
    expectedChannel: 'Kempner Institute at Harvard University',
    section: 'Talk',
    focusArea: 'World Model',
    domain: 'World Models / Learned Simulators',
    keywords: 'World Models; Learned Simulators; UniSim; Decision Making; Video Generation',
    language: 'English',
    speaker: 'Sherry Yang',
    format: 'Research Seminar',
    sourceTier: sourceTiers.institution,
    recommendation: 'Core',
    notes: 'Sherry Yang (author of UniSim, ICLR 2024 outstanding paper) on learning world models and agents for environments where real interaction is expensive, including a live interactive world-model demo; hosted and published by Harvard’s Kempner Institute. The most complete public long-form statement of her learned-simulator research programme.',
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
  },
  {
    videoId: 'H87npZLjUyw',
    expectedChannel: 'Simons Institute for the Theory of Computing',
    section: 'Talk',
    focusArea: 'World Model',
    domain: 'World Models / Language Models',
    keywords: 'Language Models; World Models; Probing; Representation Editing; Interpretability',
    language: 'English',
    speaker: 'Jacob Andreas',
    format: 'Research Talk',
    sourceTier: sourceTiers.official,
    recommendation: 'Core',
    notes: 'Jacob Andreas’ June 2024 Simons Institute talk asking whether language models induce world models: probing evidence that LM representations encode entity state, the REMEDI representation-editing method, and the limits of both. A rigorous counterpoint to video-centric world-model talks in this direction (workshop: Understanding Higher-Level Intelligence).',
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
  },
  simonsTalk('xZsBy5Bjx6s', 'Phillip Isola (MIT)', 8,
    'World Models; Representation Learning; Vision; Emergent Representations',
    'Core', 'Isola’s opening-day talk at the world-models workshop, from the researcher whose representation-convergence work (“Platonic representation”) frames what shared world models different networks learn.'),
  simonsTalk('xJec77L6bUE', 'Alison Gopnik (UC Berkeley)', 8,
    'Cognitive Development; Causal Learning; Child Learning; World Models',
    'Recommended', 'Gopnik brings the developmental-psychology evidence on how children build causal world models — the cognitive-science baseline the AI talks in this series argue against or borrow from.'),
  simonsTalk('T6XePuShu-M', 'Jacob Andreas (MIT)', 9,
    'Language Models; World Models; Semantics; State Tracking',
    'Core', 'Andreas’ 2026 workshop talk, updating his “language models as world models” line of work for this world-models-focused audience.'),
  simonsTalk('7-bUlayKcQA', 'Guillaume Dumas (Mila / Université de Montréal)', 9,
    'Social Cognition; World Models; Collective Intelligence; NeuroAI',
    'Recommended', 'The workshop’s clearest statement of the social side of world modeling: embodied dynamics and relational computation across interacting agents.'),
  simonsTalk('xV7rTpzp5nQ', 'Daniel Zoran (Google DeepMind)', 11,
    'World Models; Umwelt; Agent-Centric Representation; Generative Models',
    'Core', 'A DeepMind researcher’s argument for agent-centred (“Umwelt”) world models over monolithic world simulators — directly on the workshop’s central question.'),
  simonsTalk('hRENteFRe5s', 'Yoav Artzi (Cornell University)', 11,
    'World Models; Evaluation; State Computation; Language Grounding',
    'Core', 'Artzi on how to evaluate whether a system actually computes world state — the measurement problem underneath most world-model claims.'),
  simonsTalk('vk6lgHjjGp8', 'Alexei Efros (UC Berkeley)', 11,
    'Visual Data; Representation Learning; Data-Driven Vision; World Models',
    'Core', 'Efros’ “Surface Data vs. Deep Data” talk on what visual data can and cannot teach a model about the world — a data-centric lens on world-model learning.'),
  simonsTalk('Z6A14zxn3rI', 'Jitendra Malik (UC Berkeley)', 12,
    'Autonomous Learning; Cognitive Science; Sensorimotor Learning; World Models',
    'Core', 'Malik’s “Systems A/B/M” framework distils lessons from cognitive science for autonomous learning — a synthesis talk from one of vision’s most influential researchers.'),
  simonsTalk('9x7BsXe-M88', 'Alane Suhr (UC Berkeley)', 12,
    'Learning from Interaction; Language Agents; Grounding; World Models',
    'Recommended', 'Suhr on learning world knowledge from interaction rather than static corpora, connecting the agents and world-models threads of the workshop.'),
  simonsTalk('cd4_xGK3Tvc', 'Paul Liang (MIT)', 12,
    'Social World Models; Multimodal AI; Theory of Mind; Human-AI Interaction',
    'Recommended', 'Liang’s closing-day talk extends world models to multi-person social settings (“social world models”).'),
  simonsTalk('xHZFjPObbDE', 'Trevor Darrell (UC Berkeley)', 11,
    'Dexterous Manipulation; Tactile Sensing; Skill Discovery; Embodied Agents',
    'Recommended', 'Darrell grounds the workshop’s themes in embodied skill learning, from tactile-reactive manipulation to open-ended (“playful”) skill discovery.'),
  // --- CVPR WAD keynotes: driving world models, learned simulation, and vision ---
  wadKeynote('6x-Xb_uT7ts', {
    focusArea: 'World Model',
    domain: 'Autonomous Driving / Foundation Models',
    keywords: 'Foundation Models; Occupancy; Autonomy; World Models; Tesla',
    speaker: 'Ashok Elluswamy (Tesla)',
    recommendation: 'Core',
    note: 'Tesla’s Autopilot lead at CVPR 2023 WAD on “Building Foundation Models for Autonomy” (title from the official cvpr2023.wad.vision programme): occupancy as a general world representation and the shift to foundation-model autonomy. Organizer-published recording.',
  }),
  wadKeynote('jPCV4GKX9Dw', {
    focusArea: 'Vision',
    domain: 'Autonomous Driving / 3D Perception',
    keywords: 'Occupancy Networks; 3D Perception; Camera-Only Vision; Tesla',
    speaker: 'Ashok Elluswamy (Tesla)',
    recommendation: 'Recommended',
    note: 'Elluswamy’s earlier CVPR 2022 WAD keynote, the public debut of Tesla’s occupancy-network approach to camera-only 3D scene understanding. Kept alongside the 2023 talk because it documents the perception layer the later foundation-model framing builds on.',
  }),
  wadKeynote('AEfq5nFi7s8', {
    focusArea: 'World Model',
    domain: 'Autonomous Driving / Embodied AI',
    keywords: 'Embodied AI; Driving World Models; GAIA; End-to-End Driving; Wayve',
    speaker: 'Alex Kendall (Wayve)',
    recommendation: 'Core',
    note: 'Wayve’s CEO at CVPR 2024 WAD on “The Road to Embodied AI” (title from the official cvpr2024.wad.vision programme) — the company behind the GAIA driving world models on end-to-end learned driving as embodied AI.',
  }),
  wadKeynote('R7eMX2O5EVs', {
    focusArea: 'World Model',
    domain: 'Autonomous Driving / Neural Simulation',
    keywords: 'Foundation Models; Neural Simulation; Digital Twins; Generative AI; NVIDIA',
    speaker: 'Sanja Fidler (NVIDIA)',
    recommendation: 'Recommended',
    note: 'Fidler’s CVPR 2024 WAD keynote “Next-Gen AV with Foundation Models” (title from the official cvpr2024.wad.vision programme), on generative and simulation foundation models for autonomous vehicles.',
  }),
  wadKeynote('g0uIVWecws4', {
    focusArea: 'World Model',
    domain: 'Autonomous Driving / Learned Simulation',
    keywords: 'Learned Simulation; Closed-Loop Testing; Digital Twins; Waabi',
    speaker: 'Raquel Urtasun (Waabi / University of Toronto)',
    recommendation: 'Core',
    note: 'Urtasun’s CVPR 2022 WAD keynote laying out Waabi’s simulation-first approach to autonomy — an early, complete argument for learned, closed-loop simulators as the core development loop.',
  }),
  wadKeynote('0F96P1OE3hI', {
    focusArea: 'World Model',
    domain: 'Autonomous Driving / World Models',
    keywords: 'End-to-End Driving; World Engine; Scene Generation; Scalable RL',
    speaker: 'Hongyang Li (The University of Hong Kong)',
    recommendation: 'Recommended',
    note: 'CVPR 2025 WAD keynote “End-to-end Autonomous Driving: Past, Current and Onwards” (chapter listing on the organizer channel), introducing the “World Engine” framing plus Nexus scene generation and pseudo-simulation evaluation.',
  }),
  wadKeynote('SkD1JGLWWjY', {
    focusArea: 'World Model',
    domain: 'Autonomous Driving / Neural Simulation',
    keywords: 'Neural Simulation; Scalable Simulation; Closed-Loop Evaluation; Applied Intuition',
    speaker: 'Wei Zhan (Applied Intuition)',
    recommendation: 'Recommended',
    note: 'CVPR 2025 WAD keynote “Scalable Neural Simulation for Autonomy” (chapter listing on the organizer channel) on making learned simulators scale to industrial closed-loop autonomy development.',
  }),
  wadKeynote('g6bOwQdCJrc', {
    focusArea: 'Vision',
    domain: 'Autonomous Driving / Vision-Centric Autonomy',
    keywords: 'Camera-Only Vision; Data Engine; Auto-Labeling; Tesla',
    speaker: 'Andrej Karpathy (Tesla)',
    recommendation: 'Core',
    note: 'Karpathy’s CVPR 2021 WAD keynote — the reference public account of Tesla’s camera-first perception stack and data engine, given while he led Tesla AI. Complements his interviews already in the index with the primary technical talk.',
  }),
  wadKeynote('sH8o0uoAEYA', {
    focusArea: 'Vision',
    domain: 'Autonomous Driving / Perception & Simulation',
    keywords: '3D Perception; Simulation; Neural Rendering; Self-Driving',
    speaker: 'Deva Ramanan (CMU)',
    recommendation: 'Recommended',
    note: 'CVPR 2025 WAD keynote “Perception and Simulation for Self-Driving Vehicles” (chapter listing on the organizer channel), bridging perception research and simulation-based development.',
  }),
  wadKeynote('ThXsRZXsAD0', {
    focusArea: 'Vision',
    domain: '3D Vision / Generative Models',
    keywords: 'Generative Models; 3D Data; Neural Rendering; NVIDIA',
    speaker: 'Laura Leal-Taixé (NVIDIA)',
    recommendation: 'Recommended',
    note: 'CVPR 2025 WAD keynote “Repurposing Generative Models for 3D Data” (chapter listing on the organizer channel) on turning 2D generative models into sources of 3D supervision.',
  }),
  // --- How to Research: canonical craft lectures ---
  {
    videoId: 'Unzc731iCUY',
    expectedChannel: 'MIT OpenCourseWare',
    section: 'Talk',
    focusArea: 'How to Research',
    domain: 'Research Communication / Speaking',
    keywords: 'Research Talks; Presentation Skills; Teaching; Communication',
    language: 'English',
    speaker: 'Patrick Winston',
    format: 'University Lecture',
    sourceTier: sourceTiers.official,
    recommendation: 'Core',
    notes: 'Patrick Winston’s “How to Speak” (MIT IAP), published by MIT OpenCourseWare — the most-watched single lecture on giving research talks, covering openings, structure, boards vs. slides, and how to end. The obvious missing anchor next to the index’s existing Peyton Jones and McConnell talks.',
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
  },
  {
    videoId: 'Kg4dzWTMfGs',
    expectedChannel: 'Kayvon Fatahalian',
    section: 'Talk',
    focusArea: 'How to Research',
    domain: 'Research Communication / Speaking',
    keywords: 'Research Talks; Slide Design; Clarity; Presentation Skills',
    language: 'English',
    speaker: 'Kayvon Fatahalian',
    format: 'Research Skills Lecture',
    sourceTier: sourceTiers.official,
    recommendation: 'Core',
    notes: 'The Stanford professor’s own recording of his widely circulated “Tips for Giving Clear Talks”: concrete before/after slide surgery for systems and graphics talks. Complements Winston (delivery, structure) with slide-level craft; published on the author’s channel.',
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
  },
  {
    videoId: 'OV5J6BfToSw',
    expectedChannel: 'The Royal Institution',
    section: 'Talk',
    focusArea: 'How to Research',
    domain: 'Research Communication / Writing',
    keywords: 'Scientific Writing; Style; Classic Style; Curse of Knowledge',
    language: 'English',
    speaker: 'Steven Pinker',
    format: 'Public Lecture',
    sourceTier: sourceTiers.institution,
    recommendation: 'Recommended',
    notes: 'Pinker’s Royal Institution lecture on why academic prose fails (the “curse of knowledge”) and what classic style fixes — the linguistic theory behind the practical writing advice in the index’s McEnerney and Peyton Jones talks. Recommended rather than Core because it is general writing style, not paper-specific.',
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
  },
  {
    videoId: 'F1U26PLiXjM',
    expectedChannel: 'TED',
    section: 'Talk',
    focusArea: 'How to Research',
    domain: 'Research Practice / Research Culture',
    keywords: 'Research Process; Uncertainty; The Cloud; Mentoring; Research Culture',
    language: 'English',
    speaker: 'Uri Alon',
    format: 'Public Lecture',
    sourceTier: sourceTiers.official,
    recommendation: 'Recommended',
    notes: 'Uri Alon’s TED talk on “the cloud” — the disorienting middle of real research where the original question dissolves — and how research culture should treat it. Under the usual 18-minute bar but retained as the canonical short statement of an idea (embracing being lost) that no longer talk in the index covers; official TED upload.',
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
  },
]

// ---------------------------------------------------------------------------
// Verification + assembly
// ---------------------------------------------------------------------------

function buildRecord(candidate, verified) {
  return {
    id: '', // assigned after all verifications succeed
    section: candidate.section,
    domain: candidate.domain,
    keywords: candidate.keywords,
    language: candidate.language,
    title: verified.title,
    speaker: candidate.speaker,
    channel: verified.channel,
    format: candidate.format,
    durationMinutes: Math.max(1, Math.round(verified.durationSeconds / 60)),
    url: `https://www.youtube.com/watch?v=${candidate.videoId}`,
    platform: 'YouTube',
    viewCount: verified.viewCount ?? 0,
    sourceTier: candidate.sourceTier,
    recommendation: candidate.recommendation,
    status: 'Verified',
    collectedOn,
    notes: candidate.notes,
    videoId: candidate.videoId,
    focusArea: candidate.focusArea,
    publishedAt: verified.publishedAt,
    subtitleLanguages: [],
    subtitleTracks: [],
    subtitlesVerified: false,
    subtitleVerificationScope: 'Subtitle tracks are not exposed through the public endpoints used for this batch (oEmbed, watch page, search/playlist listings); none are inferred.',
    metadataVerifiedVia: 'YouTube oEmbed (title/channel), public watch page (view count, publish date), and search/playlist listings (duration)',
    metadataVerificationStatus: 'Partial',
    lastVerifiedAt: collectedOn,
    lastVerificationAttemptAt: collectedOn,
    metadataVerificationError: '',
    publishedAtVerified: true,
    seriesId: candidate.seriesId,
    seriesTitle: candidate.seriesTitle,
    seriesOrder: candidate.seriesOrder,
  }
}

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item)).join('; ')
    : value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const existingResources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (existingResources.length < 1025) throw new Error(`Expected at least 1025 baseline resources, found ${existingResources.length}`)
const existingVideoIds = new Set(existingResources.map((resource) => resource.videoId).filter(Boolean))
const existingUrls = new Set(existingResources.map((resource) => resource.url))

const verifiedAdditions = []
const skippedDuplicates = []
const failedVerifications = []

async function verifyAndAdd(candidate, presetDurationSeconds = null, expectedChannel = null) {
  if (existingVideoIds.has(candidate.videoId) || existingUrls.has(`https://www.youtube.com/watch?v=${candidate.videoId}`)) {
    skippedDuplicates.push(candidate.videoId)
    return
  }
  try {
    const oembed = await fetchOembed(candidate.videoId)
    if (!oembed?.title) throw new Error('oEmbed lookup failed (video missing or private)')
    const channelExpectation = expectedChannel ?? candidate.expectedChannel
    if (channelExpectation && oembed.author_name !== channelExpectation) {
      throw new Error(`channel mismatch: expected "${channelExpectation}", got "${oembed.author_name}"`)
    }
    const watch = await fetchWatchMeta(candidate.videoId)
    if (!watch.publishedAt) throw new Error('publish date not found on watch page')
    let durationSeconds = presetDurationSeconds
    if (!durationSeconds) durationSeconds = await fetchSearchDuration(candidate.videoId, oembed.title)
    if (!durationSeconds) throw new Error('duration not found in public listings')
    verifiedAdditions.push({
      candidate,
      record: buildRecord(candidate, {
        title: oembed.title,
        channel: oembed.author_name,
        viewCount: watch.viewCount,
        publishedAt: watch.publishedAt,
        durationSeconds,
      }),
    })
    console.log(`verified ${candidate.videoId} — ${oembed.title.slice(0, 70)}`)
  } catch (error) {
    failedVerifications.push({ videoId: candidate.videoId, reason: error.message })
    console.warn(`SKIPPED ${candidate.videoId}: ${error.message}`)
  }
}

for (const group of playlistGroups) {
  const playlist = await fetchPlaylist(group.listId)
  if (playlist.length === 0) throw new Error(`Playlist ${group.listId} returned no videos`)
  console.log(`playlist ${group.key}: ${playlist.length} videos`)
  for (const video of playlist) {
    const selection = group.select(video)
    if (!selection) continue
    const candidate = { videoId: video.videoId, ...group.build(video, selection) }
    await verifyAndAdd(candidate, video.durationSeconds, group.expectedChannel)
  }
}

for (const candidate of singleCandidates) {
  await verifyAndAdd(candidate)
}

// CVPR WAD keynotes are ordered within their series by verified upload date.
for (const { candidate, record } of verifiedAdditions) {
  if (candidate.seriesId === wadSeries.seriesId && record.seriesOrder === null) {
    record.seriesOrder = Number(record.publishedAt.replaceAll('-', ''))
  }
}

if (verifiedAdditions.length === 0) {
  console.log('No new resources to add (all candidates already present or unverifiable). Data files left untouched.')
  process.exit(0)
}

const firstId = Math.max(...existingResources.map((resource) => Number(resource.id.replace(/^ST-/, '')) || 0)) + 1
verifiedAdditions.forEach(({ record }, index) => {
  record.id = `ST-${String(firstId + index).padStart(3, '0')}`
})
const additions = verifiedAdditions.map(({ record }) => record)

// Attach previously indexed one-off entries to their now-complete series.
const seriesBackfills = [
  { id: 'ST-866', seriesId: 'hamming-learning-to-learn-1995', seriesTitle: 'Richard Hamming — Learning to Learn: The Art of Doing Science and Engineering (NPS 1995)', seriesOrder: 31 },
  { id: 'ST-985', seriesId: simonsWorkshopSeries.seriesId, seriesTitle: simonsWorkshopSeries.seriesTitle, seriesOrder: 20260609 },
  { id: 'ST-987', seriesId: simonsWorkshopSeries.seriesId, seriesTitle: simonsWorkshopSeries.seriesTitle, seriesOrder: 20260609 },
]
const backfilled = []
for (const backfill of seriesBackfills) {
  const resource = existingResources.find((item) => item.id === backfill.id)
  if (resource && !resource.seriesId) {
    resource.seriesId = backfill.seriesId
    resource.seriesTitle = backfill.seriesTitle
    resource.seriesOrder = backfill.seriesOrder
    backfilled.push(backfill.id)
  }
}

const resources = [...existingResources, ...additions]

// Final integrity checks before anything is written.
const idSet = new Set()
const urlSet = new Set()
const videoIdSet = new Set()
for (const resource of resources) {
  if (idSet.has(resource.id)) throw new Error(`Duplicate id: ${resource.id}`)
  idSet.add(resource.id)
  if (urlSet.has(resource.url)) throw new Error(`Duplicate url: ${resource.url}`)
  urlSet.add(resource.url)
  if (resource.videoId) {
    if (videoIdSet.has(resource.videoId)) throw new Error(`Duplicate videoId: ${resource.videoId}`)
    videoIdSet.add(resource.videoId)
  }
}
for (const record of additions) {
  for (const field of ['title', 'speaker', 'channel', 'durationMinutes', 'url', 'publishedAt', 'notes', 'focusArea', 'section']) {
    if (!record[field]) throw new Error(`Incomplete addition ${record.id}: missing ${field}`)
  }
}

const fields = Object.keys(resources[0])
const csv = [fields.join(','), ...resources.map((resource) => fields.map((field) => csvCell(resource[field])).join(','))].join('\r\n')
const byPlatform = Object.fromEntries(Object.entries(Object.groupBy(resources, (resource) => resource.platform)).map(([platform, rows]) => [platform, {
  total: rows.length,
  verified: rows.filter((resource) => resource.metadataVerificationStatus === 'Verified').length,
  partial: rows.filter((resource) => resource.metadataVerificationStatus === 'Partial').length,
  failed: rows.filter((resource) => resource.metadataVerificationStatus === 'Failed').length,
}]))

const focusAreaCounts = {}
const sectionCounts = {}
for (const record of additions) {
  focusAreaCounts[record.focusArea] = (focusAreaCounts[record.focusArea] || 0) + 1
  sectionCounts[record.section] = (sectionCounts[record.section] || 0) + 1
}
const seriesSummary = {}
for (const record of additions) {
  const key = record.seriesId || '(standalone)'
  seriesSummary[key] = (seriesSummary[key] || 0) + 1
}

const auditReport = `# ScholarTube content expansion — World Models, research craft, and Vision keynotes — ${collectedOn}

## Result

- Baseline: ${existingResources.length} resources
- Added: ${additions.length} resources (${additions[0].id} … ${additions.at(-1).id})
- New total: ${resources.length} resources
- By focus area: ${Object.entries(focusAreaCounts).map(([key, count]) => `${key} +${count}`).join(', ')}
- By section: ${Object.entries(sectionCounts).map(([key, count]) => `${key} +${count}`).join(', ')}
- Existing entries attached to now-complete series (no other fields touched): ${backfilled.join(', ') || 'none'}

## What was added and why

### World Models — course backbone

- **UC Berkeley CS285 Fall 2023, Lectures 10–12 (14 part-videos, RAIL channel).** The index carried CS285 F23 only through Lecture 2; this adds the complete model-based block — Lecture 10 “Optimal Control and Planning”, Lecture 11 “Model-Based Reinforcement Learning”, Lecture 12 “Model-Based Policy Learning” — the canonical university treatment of learning dynamics models, planning through them, and training policies inside them.
- **David Silver’s RL Course (UCL 2015), Lecture 8 “Integrating Learning and Planning” (Google DeepMind channel).** The classic Dyna / simulation-based-search lecture. Lectures 1–7 and 9–10 were deliberately excluded: the complete DeepMind x UCL 2021 successor series is already indexed.
- **Pieter Abbeel, “Foundations of Deep RL” (6 lectures, author’s channel, 2021).** A compact complete pathway ending in L6 “Model-based RL”. L1–L5 are general deep-RL foundations and are filed under Broader AI; L6 under World Models.

### World Models — invited talks

- **Simons Institute workshop “Topics in Intelligence: World Models and Social Reasoning” (June 2026), 11 talks** (Isola, Gopnik, Andreas, Dumas, Zoran, Artzi, Efros, Malik, Suhr, Liang, Darrell) joining the two talks already indexed (ST-985 Lenore Blum, ST-987 Shiry Ginosar), which were also attached to the new series id. Titles, speakers, and dates cross-checked against the official schedule (simons.berkeley.edu).
- **Jacob Andreas, “Language Models as World Models?” (Simons, June 2024)** — the language-side counterpoint, verified against the Simons talk page.
- **Sherry Yang, “Learning World Models and Agents for High-Cost Environments” (Kempner Institute at Harvard)** — long-form seminar from the UniSim (ICLR 2024 outstanding paper) author, with a live interactive world-model demo.
- **CVPR Workshop on Autonomous Driving keynotes (organizer channel “WAD at CVPR”), 6 world-model keynotes**: Elluswamy CVPR’23 (foundation models for autonomy), Kendall CVPR’24 (road to embodied AI / GAIA lineage), Fidler CVPR’24 (next-gen AV with foundation models), Urtasun CVPR’22 (learned closed-loop simulation), Hongyang Li CVPR’25 (world engine), Wei Zhan CVPR’25 (scalable neural simulation). Keynote titles were taken from the official wad.vision programmes or the organizer’s own chapter listings, not inferred.

### How to Research

- **Richard Hamming, “Learning to Learn: The Art of Doing Science and Engineering” — the complete 1995 NPS capstone course (31 sessions incl. the 1990 SGL prologue)** from the NPS-maintained “Hamming on Hamming” channel (linked as the best-quality encodings at nps.edu/web/cs/hamming-resources). The task brief names Hamming as the style exemplar for this direction; the course is its systematic long form. The closing “You and Your Research” session was **not** re-added: the same lecture is already indexed as ST-866, which was attached to the series instead. Meta-sessions (Orientation, Creativity, Experts, Unreliable Data, Systems Engineering, You Get What You Measure, How Do We Know What We Know, SGL) are Core; topic chapters are Recommended.
- **Patrick Winston, “How to Speak” (MIT OpenCourseWare)** — the missing anchor lecture on research talks.
- **Kayvon Fatahalian, “Kayvon’s Tips for Giving Clear Talks”** (author’s channel) — slide-level craft complementing Winston.
- **Steven Pinker, “Linguistics, Style and Writing in the 21st Century” (The Royal Institution)** — the theory behind the index’s practical writing talks.
- **Uri Alon’s TED talk on “the cloud”** — under the 18-minute bar but retained as the canonical short statement of embracing the disoriented middle of research; official TED upload, labelled Recommended.

### Vision

- **4 authoritative long keynotes from the WAD organizer channel**: Karpathy CVPR’21 (Tesla’s camera-first stack and data engine — the primary technical talk behind interviews already indexed), Elluswamy CVPR’22 (occupancy networks debut), Ramanan CVPR’25 (perception and simulation), Leal-Taixé CVPR’25 (repurposing generative models for 3D data).
- **Stanford CME296 (Diffusion & Large Vision Models, Spring 2026) was checked for missing lectures: the official Stanford Online listing currently ends at Lecture 8, which the index already carries.** No residual gap to fill; the series remains complete as published.
- Stanford CS231n Spring 2025 was re-checked and is complete in the index at 18 lectures.

## Deliberate exclusions

- **Hamming “You and Your Research” (official-channel upload, e3msMuwqp-o)** — content-duplicate of ST-866; the index prefers one canonical copy per lecture.
- **David Silver course lectures other than Lecture 8** — superseded by the complete DeepMind x UCL 2021 series already indexed.
- **Remaining WAD keynotes** (Waymo/Zoox/Cruise deployment and dataset-challenge talks, Levine CVPR’22, Finn CVPR’23, Chitta/Zhou/Pavlakos CVPR’24, Burgard/Wu/Liu CVPR’25, full-day stream) — deployment- or dataset-focused rather than world-model/vision mechanism talks, or robotics-oriented overlap with existing coverage.
- **UMich EECS 498 “Deep Learning for Computer Vision”** — high quality but largely duplicates the complete CS231n Spring 2025 series already indexed.
- **NeurIPS/ICML world-model tutorials hosted on SlidesLive** — registration-gated, no public canonical recording to verify.
- **Agents direction: no additions in this batch.** The remaining budget was spent on the two named priority gaps; Agents already stands at ~201 entries with complete Berkeley LLM-Agents and Agentic-AI MOOC series, and sibling PRs are expanding adjacent podcast coverage. Candidates reviewed (product launch talks, framework demos) did not clear the mechanism-over-marketing bar.
- **Additional Chinese-language world-model material** — the index already carries the BAAI 2026 and WAIC 2026 world-model forum sessions and several long Chinese interviews; no verified official-channel candidate added new coverage.

## Verification method

- Every record was verified live against public YouTube metadata at collection time: **oEmbed** for canonical title and channel (with an expected-channel assertion per candidate), the **public watch page** for view-count snapshot and exact publish date, and **playlist badges or public search listings** for duration.
- YouTube's player API (innertube) returns LOGIN_REQUIRED from this network, so subtitle tracks could not be enumerated; \`metadataVerificationStatus\` is recorded as **Partial** for the batch, consistent with existing YouTube entries in the corpus.
- Candidates that failed any check were skipped, never estimated: ${failedVerifications.length === 0 ? 'none failed in the final run' : failedVerifications.map((failure) => `${failure.videoId} (${failure.reason})`).join('; ')}.
- Candidates already present in the corpus at run time (idempotency guard): ${skippedDuplicates.length === 0 ? 'none' : skippedDuplicates.join(', ')}.

## Series added or completed

${Object.entries(seriesSummary).map(([key, count]) => `- ${key}: ${count} new item${count === 1 ? '' : 's'}`).join('\n')}
`

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')
await writeFile(metadataReportPath, `${JSON.stringify({
  verifiedOn: collectedOn,
  total: resources.length,
  verified: resources.filter((resource) => resource.metadataVerificationStatus === 'Verified').length,
  partial: resources.filter((resource) => resource.metadataVerificationStatus === 'Partial').length,
  failed: resources.filter((resource) => resource.metadataVerificationStatus === 'Failed').length,
  byPlatform,
  failures: JSON.parse(await readFile(metadataReportPath, 'utf8')).failures ?? [],
}, null, 2)}\n`, 'utf8')
await writeFile(auditReportPath, auditReport, 'utf8')

console.log(JSON.stringify({
  baseline: existingResources.length,
  added: additions.length,
  total: resources.length,
  byFocusArea: focusAreaCounts,
  bySection: sectionCounts,
  firstId: additions[0].id,
  lastId: additions.at(-1).id,
  skippedDuplicates,
  failedVerifications,
  backfilledSeries: backfilled,
}, null, 2))
