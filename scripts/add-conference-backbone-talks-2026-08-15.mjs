import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const auditReportPath = path.join(projectDirectory, 'data', 'talks_backbone_expansion_2026-08-15.md')
const collectedOn = '2026-08-15'
const sourceTierA = 'A | Official / Original Creator / Organizer'

function conferenceSet({ channel, year, baseUrl, rows }) {
  return rows.map(([
    eventId, title, speaker, publishedAt, durationMinutes, focusArea, domain, keywords,
    recommendation = 'Core', format = 'Conference Keynote',
  ]) => ({
    videoId: `${channel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${year}-${eventId}`,
    title,
    speaker,
    channel,
    format,
    durationMinutes,
    url: `${baseUrl}${eventId}`,
    platform: 'Conference Site',
    publishedAt,
    focusArea,
    domain,
    keywords,
    recommendation,
  }))
}

const conferenceTalks = [
  ...conferenceSet({
    channel: 'ICLR', year: 2025, baseUrl: 'https://iclr.cc/virtual/2025/invited-talk/',
    rows: [
      [36782, 'Building Safe and Robust AI Systems', 'Zico Kolter', '2025-04-24', 60, 'Other', 'AI Safety / Alignment / Oversight', 'AI Safety; Robustness; Adversarial Machine Learning; Reliable AI; Foundation Models'],
      [36781, 'Framework, Prototype, Definition and Benchmark', 'Song-Chun Zhu', '2025-04-24', 60, 'Other', 'Machine Learning Foundations', 'Artificial Intelligence; Cognitive Architecture; Prototypes; Benchmarks; Machine Learning Foundations'],
      [36785, 'Pursuing the Nature of Intelligence', 'Yi Ma', '2025-04-25', 60, 'Other', 'Machine Learning Foundations', 'Intelligence; Representation Learning; Learning Theory; Machine Learning Foundations; AI Research'],
      [36783, 'Towards Building Safe and Secure AI: Lessons and Open Challenges', 'Dawn Song', '2025-04-25', 60, 'Other', 'AI Privacy / Security / Law', 'AI Safety; AI Security; Privacy; Foundation Models; Trustworthy AI'],
      [36784, 'Training Language Models in Academia: Challenge or Calling?', 'Danqi Chen', '2025-04-26', 60, 'Other', 'Natural Language Processing', 'Language Models; Academic Research; Model Training; Open Science; Natural Language Processing'],
      [36780, 'Open-Endedness, World Models, and the Automation of Innovation', 'Tim Rocktäschel', '2025-04-26', 60, 'World Model', 'World Models / Predictive Intelligence', 'Open-Endedness; World Models; Foundation Models; AI Agents; Automated Innovation'],
    ],
  }),
  ...conferenceSet({
    channel: 'ICML', year: 2025, baseUrl: 'https://icml.cc/virtual/2025/invited-talk/',
    rows: [
      [39862, "AI's Models of the World, and Ours", 'Jon Kleinberg', '2025-07-15', 60, 'Other', 'AI and Society', 'AI Models; Human Decision-Making; Social Systems; Prediction; Societal Impact'],
      [39865, "Generative AI's Collision with Copyright Law", 'Pamela Samuelson', '2025-07-15', 60, 'Other', 'AI Privacy / Security / Law', 'Generative AI; Copyright; Law; Training Data; AI Policy', 'Recommended'],
      [39871, 'Adaptive Alignment: Designing AI for a Changing World', 'Frauke Kreuter', '2025-07-16', 60, 'Agent', 'AI Safety / Alignment / Oversight', 'Adaptive Alignment; Human Feedback; Social Systems; Evaluation; AI Governance'],
      [39874, 'What to Optimize For — From Robot Arms to Frontier AI', 'Anca Dragan', '2025-07-17', 60, 'Robotics', 'Robotics / Embodied AI', 'Robotics; Optimization; Human-Robot Interaction; AI Alignment; Frontier AI'],
      [39878, 'Closing the Loop: Machine Learning for Optimization and Discovery', 'Andreas Krause', '2025-07-17', 60, 'Other', 'AI for Science', 'Machine Learning; Optimization; Scientific Discovery; Active Learning; Experimental Design'],
    ],
  }),
  ...conferenceSet({
    channel: 'NeurIPS', year: 2024, baseUrl: 'https://neurips.cc/virtual/2024/invited-talk/',
    rows: [
      [101128, 'The Golem vs. Stone Soup: Understanding How Children Learn Can Help Us Understand and Improve AI', 'Alison Gopnik', '2024-12-10', 45, 'Other', 'AI Evaluation / Cognitive Science', 'Cognitive Science; Child Learning; Artificial Intelligence; Causal Learning; Human Development'],
      [101129, 'Toward Industrial Artificial Intelligence', 'Sepp Hochreiter', '2024-12-11', 60, 'Other', 'Machine Learning Frontiers', 'Industrial AI; Deep Learning; Foundation Models; Machine Learning; AI Systems'],
      [101127, 'From Seeing to Doing: Ascending the Ladder of Visual Intelligence', 'Fei-Fei Li', '2024-12-11', 60, 'Vision', 'Computer Vision / 3D Vision', 'Visual Intelligence; Spatial Intelligence; Computer Vision; Robotics; Embodied AI'],
      [101132, 'A Match Made in Silicon: The Co-Evolution of Systems and AI', 'Lidong Zhou', '2024-12-12', 60, 'Other', 'AI Systems / Infrastructure', 'AI Systems; Distributed Systems; Hardware; Model Training; Inference'],
      [101133, 'From Diffusion Models to Schrödinger Bridges', 'Arnaud Doucet', '2024-12-12', 60, 'Other', 'Diffusion Models / Generative AI', 'Diffusion Models; Schrödinger Bridges; Generative Modeling; Optimal Transport; Sampling'],
      [101131, 'Learning for Interaction and Interaction for Learning', 'Danica Kragic', '2024-12-13', 60, 'Robotics', 'Robotics / Embodied AI', 'Robot Learning; Interaction; Embodied AI; Manipulation; Human-Robot Interaction'],
      [101130, 'How to Optimize What Matters Most?', 'Rosalind Picard', '2024-12-13', 60, 'Other', 'AI and Society', 'Human-Centered AI; Wellbeing; Affective Computing; Responsible AI; Optimization', 'Recommended'],
    ],
  }),
  ...conferenceSet({
    channel: 'MLSys', year: 2024, baseUrl: 'https://mlsys.org/virtual/2024/invited-talk/',
    rows: [
      [2592, 'Exciting Directions in Systems for Machine Learning', 'Jeff Dean', '2024-05-16', 60, 'Other', 'AI Systems / Infrastructure', 'Machine Learning Systems; Distributed Training; Accelerators; Inference; AI Infrastructure'],
      [2590, 'Possible Impossibilities and Impossible Possibilities', 'Yejin Choi', '2024-05-14', 60, 'Other', 'Natural Language Processing', 'Language Models; Reasoning; Commonsense; AI Research; Model Evaluation'],
      [2593, 'AI Robustness and Security in the Age of LLMs', 'Zico Kolter', '2024-05-15', 60, 'Other', 'AI Privacy / Security / Law', 'AI Robustness; AI Security; Large Language Models; Adversarial Machine Learning; Safety'],
      [2668, 'GenAI Efficiency Is About More Than Models', 'Kurt Keutzer', '2024-05-13', 60, 'Other', 'AI Systems / Energy Efficiency', 'Generative AI; Efficiency; Hardware; Systems Optimization; Sustainable AI'],
    ],
  }),
  ...conferenceSet({
    channel: 'ICLR', year: 2024, baseUrl: 'https://iclr.cc/virtual/2024/invited-talk/',
    rows: [
      [21797, 'Why Your Work Matters for Climate in More Ways Than You Think', 'Priya Donti', '2024-05-07', 60, 'Other', 'AI for Science', 'Climate Change; Machine Learning; Energy Systems; Responsible AI; Sustainability'],
      [21804, 'Copyright Fundamentals for AI Researchers', 'Kate Downing', '2024-05-07', 60, 'Other', 'AI Privacy / Security / Law', 'Copyright; Generative AI; Training Data; AI Law; Research Practice', 'Recommended'],
      [21798, "Learning Through AI's Winters and Springs: Unexpected Truths on the Road to AGI", 'Raia Hadsell', '2024-05-08', 60, 'Other', 'Machine Learning Frontiers', 'AGI; Reinforcement Learning; Representation Learning; AI Research; Scaling'],
      [21803, 'Stories from My Life', 'Devi Parikh', '2024-05-09', 60, 'Vision', 'Computer Vision', 'Computer Vision; Visual Question Answering; Human-AI Interaction; Research Practice; Responsible AI', 'Recommended'],
      [21802, "The ChatGLM's Road to AGI", 'Jie Tang', '2024-05-09', 60, 'Other', 'Natural Language Processing', 'ChatGLM; Large Language Models; AGI; Model Training; Natural Language Processing'],
      [21799, 'The Emerging Science of Benchmarks', 'Moritz Hardt', '2024-05-10', 60, 'Other', 'AI Evaluation / Benchmarking', 'Benchmarks; Evaluation; Machine Learning Science; Generalization; Measurement'],
      [21801, "Machine Learning in Prescient Design's Lab-in-the-Loop Antibody Design", 'Kyunghyun Cho', '2024-05-10', 55, 'Other', 'AI for Science', 'Antibody Design; Machine Learning; Lab-in-the-Loop; Biology; Scientific Discovery'],
    ],
  }),
  ...conferenceSet({
    channel: 'ICML', year: 2024, baseUrl: 'https://icml.cc/virtual/2024/invited-talk/',
    rows: [
      [35249, 'Unapologetically Open Science — The Complexity and Challenges of Making Openness Win!', 'Soumith Chintala', '2024-07-23', 60, 'Other', 'Machine Learning / Engineering Practice', 'Open Science; Open Source; Machine Learning; Research Infrastructure; Reproducibility'],
      [35667, 'The Effects of Digital Technology on Youth Development in Low-and-Middle-Income Countries', 'Lucía Magis-Weinberg', '2024-07-23', 60, 'Other', 'AI and Society', 'Digital Technology; Youth Development; Global South; Social Impact; Research Methods', 'Recommended'],
      [35251, 'Gondzo — Charting a Path for African Low-Resource Languages', 'Vukosi Marivate', '2024-07-24', 60, 'Other', 'Natural Language Processing', 'Low-Resource Languages; African Languages; Natural Language Processing; Datasets; Open Science'],
      [35254, 'Machine Learning Opportunities for the Next Generation of Particle Physics', 'Javier Duarte', '2024-07-24', 60, 'Other', 'AI for Science', 'Particle Physics; Machine Learning; Scientific Discovery; Accelerated Computing; Simulation'],
      [35253, 'What Robots Have Taught Me About Machine Learning', 'Chelsea Finn', '2024-07-25', 60, 'Robotics', 'Robotics / Embodied AI', 'Robot Learning; Meta-Learning; Reinforcement Learning; Generalization; Embodied AI'],
    ],
  }),
  ...conferenceSet({
    channel: 'CVPR', year: 2025, baseUrl: 'https://cvpr.thecvf.com/virtual/2025/invited-talk/',
    rows: [
      [35402, 'Exploring the Low Altitude Airspace: From Natural Resource to Economic Engine', 'Harry Shum', '2025-06-13', 60, 'Robotics', 'Robotics', 'Autonomous Systems; Drones; Airspace; Robotics; Infrastructure', 'Recommended'],
      [35403, 'The Llama Herd of Models: System 1, 2, 3 Go!', 'Laurens van der Maaten', '2025-06-14', 60, 'Other', 'Natural Language Processing / Transformers', 'Llama; Foundation Models; Reasoning; Agents; Multimodal Models'],
      [35404, 'Gemini Robotics, Bringing AI to the Physical World', 'Carolina Parada', '2025-06-15', 60, 'Robotics', 'Robotics / Embodied AI', 'Gemini Robotics; Embodied AI; Vision-Language-Action Models; Robot Learning; Physical AI'],
    ],
  }),
  ...conferenceSet({
    channel: 'ICCV', year: 2025, baseUrl: 'https://iccv.thecvf.com/virtual/2025/invited-talk/',
    rows: [
      [2718, 'Taking Pictures and Making Movies of Black Holes', 'Sheperd Doeleman', '2025-10-21', 60, 'Vision', 'AI for Science', 'Black Holes; Computational Imaging; Astronomy; Scientific Visualization; Computer Vision'],
      [2719, 'On Perseverance: Virtually Unwrapping the Herculaneum Scrolls', 'Brent Seales', '2025-10-22', 60, 'Vision', 'Computer Vision / 3D Vision', 'Computational Imaging; 3D Reconstruction; Cultural Heritage; Computer Vision; Scientific Discovery'],
      [2720, 'The Efficiency of Learner-Generated Experiences', 'Linda B. Smith', '2025-10-23', 60, 'Other', 'AI Evaluation / Cognitive Science', 'Cognitive Science; Child Learning; Embodied Learning; Development; Artificial Intelligence'],
    ],
  }),
  ...conferenceSet({
    channel: 'CVPR', year: 2024, baseUrl: 'https://cvpr.thecvf.com/virtual/2024/invited-talk/',
    rows: [
      [32077, 'The Tip and the Iceberg: Deep Learning and Embodiment', 'Joshua Bongard', '2024-06-19', 60, 'Robotics', 'Robotics / Embodied AI', 'Embodiment; Evolutionary Robotics; Deep Learning; Morphology; Artificial Life'],
      [32078, 'Design of New Protein Functions Using Deep Learning', 'David Baker', '2024-06-20', 60, 'Other', 'AI for Science', 'Protein Design; Deep Learning; Biology; Generative Models; Scientific Discovery'],
      [32079, 'Entanglements, Exploring Artificial Biodiversity', 'Sofia Crespo', '2024-06-21', 60, 'Vision', 'Representation Learning / Generative Models', 'Generative Art; Artificial Biodiversity; Computer Vision; Generative Models; Visual Culture', 'Recommended'],
    ],
  }),
  ...conferenceSet({
    channel: 'ECCV', year: 2024, baseUrl: 'https://eccv.ecva.net/virtual/2024/invited-talk/',
    rows: [
      [2703, 'Synthesia: From Computer Vision Research to Real-World AI Avatars', 'Lourdes Agapito and Vittorio Ferrari', '2024-10-01', 60, 'Vision', 'Representation Learning / Generative Models', 'AI Avatars; Computer Vision; Video Generation; Generative Models; Research Translation'],
      [2702, 'Fair, Transparent, and Accountable AI: What Is Legally Required, What Is Ethically Desired, and What Is Technically Feasible?', 'Sandra Wachter', '2024-10-02', 60, 'Other', 'AI and Society', 'AI Fairness; Transparency; Accountability; AI Law; Responsible AI', 'Recommended'],
      [2701, 'Is Distribution Shift Still an AI Problem?', 'Sanmi Koyejo', '2024-10-03', 60, 'Other', 'Machine Learning Research', 'Distribution Shift; Robustness; Generalization; Foundation Models; Trustworthy AI'],
    ],
  }),
  ...conferenceSet({
    channel: 'ICML', year: 2023, baseUrl: 'https://icml.cc/virtual/2023/invited-talk/',
    rows: [
      [21544, 'Taking the Pulse of Ethical ML in Health', 'Marzyeh Ghassemi', '2023-07-25', 75, 'Other', 'AI and Society', 'Machine Learning in Health; Ethics; Bias; Clinical AI; Responsible AI'],
      [21547, 'Machine Learning with Social Purpose', 'Shakir Mohamed', '2023-07-25', 60, 'Other', 'AI and Society', 'Social Purpose; Responsible AI; Machine Learning; Global South; Societal Impact'],
      [21546, 'The Future of ML in Biology: CRISPR for Health and Climate', 'Jennifer Doudna', '2023-07-26', 60, 'Other', 'AI for Science', 'CRISPR; Biology; Machine Learning; Health; Climate'],
      [21549, 'Proxy Objectives in Reinforcement Learning from Human Feedback', 'John Schulman', '2023-07-27', 60, 'Agent', 'Agents / Reinforcement Learning', 'RLHF; Proxy Objectives; Reinforcement Learning; Alignment; Reward Modeling'],
    ],
  }),
  ...conferenceSet({
    channel: 'NeurIPS', year: 2023, baseUrl: 'https://neurips.cc/virtual/2023/invited-talk/',
    rows: [
      [73988, 'NextGenAI: The Delusion of Scaling and the Future of Generative AI', 'Björn Ommer', '2023-12-11', 50, 'Other', 'Foundation Models / AI Frontiers', 'Generative AI; Scaling; Foundation Models; Efficiency; AI Research'],
      [73993, 'The Many Faces of Responsible AI', 'Lora Aroyo', '2023-12-12', 50, 'Other', 'AI and Society', 'Responsible AI; Data Quality; Human-Centered AI; Evaluation; Governance'],
      [73992, 'Coherence Statistics, Self-Generated Experience, and Why Young Humans Are Much Smarter Than Current AI', 'Linda B. Smith', '2023-12-12', 50, 'Other', 'AI Evaluation / Cognitive Science', 'Cognitive Science; Development; Self-Supervised Learning; Embodied Learning; AI Evaluation'],
      [73987, 'Sketching: Core Tools, Learning-Augmentation, and Adaptive Robustness', 'Jelani Nelson', '2023-12-13', 50, 'Other', 'Machine Learning Foundations', 'Sketching Algorithms; Learning-Augmented Algorithms; Robustness; Streaming; Theoretical Computer Science'],
      [73994, 'Beyond Scaling Panel', 'Alexander Rush, Aakanksha Chowdhery, Angela Fan, Percy Liang, and Jie Tang', '2023-12-13', 60, 'Other', 'Foundation Models / AI Frontiers', 'Scaling Laws; Foundation Models; Language Models; AI Research; Panel', 'Core', 'Conference Panel'],
      [73990, 'Systems for Foundation Models, and Foundation Models for Systems', 'Christopher Ré', '2023-12-14', 50, 'Other', 'AI Systems / Infrastructure', 'Foundation Models; AI Systems; Data Systems; Model Serving; Systems Research'],
      [73989, 'Online Reinforcement Learning in Digital Health Interventions', 'Susan Murphy', '2023-12-14', 50, 'Agent', 'Agents / Reinforcement Learning', 'Online Reinforcement Learning; Digital Health; Contextual Bandits; Personalization; Clinical AI'],
    ],
  }),
  ...conferenceSet({
    channel: 'MLSys', year: 2023, baseUrl: 'https://mlsys.org/virtual/2023/invited-talk/',
    rows: [
      [2482, 'Improving the Quality and Factuality of Large Language Model Applications', 'Matei Zaharia', '2023-06-05', 60, 'Other', 'Large-Model Systems', 'Large Language Models; Factuality; Retrieval; Evaluation; ML Systems'],
      [2483, 'Do We Need Attention?', 'Alexander Rush', '2023-06-06', 60, 'Other', 'Natural Language Processing / Transformers', 'Attention; Transformers; Sequence Models; Language Models; Efficient Architectures'],
    ],
  }),
]

const youtubeTalks = [
  {
    videoId: '38H-GfiVHvg', title: 'KDD 2025 - Keynote Speakers: Caroline Uhler / Causality from Multi-Modal Data',
    speaker: 'Caroline Uhler', channel: 'Association for Computing Machinery (ACM)', format: 'Conference Keynote',
    durationMinutes: 46, url: 'https://www.youtube.com/watch?v=38H-GfiVHvg', platform: 'YouTube',
    publishedAt: '2025-09-09', focusArea: 'Other', domain: 'AI for Science',
    keywords: 'Causal Inference; Multimodal Data; Genomics; Representation Learning; Scientific Discovery', recommendation: 'Core',
  },
  {
    videoId: 'BZMlKOICg6c', title: 'KDD 2025 - Keynote Speakers: Jason Cong / Deep Learning Meets Chip Design',
    speaker: 'Jason Cong', channel: 'Association for Computing Machinery (ACM)', format: 'Conference Keynote',
    durationMinutes: 50, url: 'https://www.youtube.com/watch?v=BZMlKOICg6c', platform: 'YouTube',
    publishedAt: '2025-09-09', focusArea: 'Other', domain: 'AI Systems / Accelerated Computing',
    keywords: 'Chip Design; Deep Learning; EDA; Hardware Acceleration; AI Systems', recommendation: 'Core',
  },
  {
    videoId: 'oKCbgurfb6M', title: 'KDD 2025 - Keynote Speakers: Dan Roth / On Reasoning LLMs: Myths, Merits, and How to Move Forward',
    speaker: 'Dan Roth', channel: 'Association for Computing Machinery (ACM)', format: 'Conference Keynote',
    durationMinutes: 70, url: 'https://www.youtube.com/watch?v=oKCbgurfb6M', platform: 'YouTube',
    publishedAt: '2025-09-09', focusArea: 'Agent', domain: 'Natural Language Processing',
    keywords: 'Reasoning; Large Language Models; Natural Language Processing; Evaluation; Knowledge Representation', recommendation: 'Core',
  },
]

const talks = [...conferenceTalks, ...youtubeTalks]

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function canonicalUrl(value) {
  try {
    const url = new URL(value)
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (!['v'].includes(key)) url.searchParams.delete(key)
    }
    return url.toString().replace(/\/$/, '').toLowerCase()
  } catch {
    return String(value ?? '').trim().toLowerCase().replace(/\/$/, '')
  }
}

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const existingResources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (existingResources.length !== 798) throw new Error(`Expected 798 resources, found ${existingResources.length}`)
if (talks.length !== 62) throw new Error(`Expected 62 talks, found ${talks.length}`)
if (talks.some((talk) => talk.durationMinutes < 30)) throw new Error('A short talk or demo entered the candidate set')

const duplicateFields = [
  ['video ID', (resource) => normalizeText(resource.videoId)],
  ['canonical URL', (resource) => canonicalUrl(resource.url)],
  ['normalized title', (resource) => normalizeText(resource.title)],
  ['title and speaker', (resource) => `${normalizeText(resource.title)}|${normalizeText(resource.speaker)}`],
]

for (const [label, keyFor] of duplicateFields) {
  const existingKeys = new Map(existingResources.map((resource) => [keyFor(resource), resource]))
  const candidateKeys = new Map()
  for (const talk of talks) {
    const key = keyFor(talk)
    if (!key) throw new Error(`Missing ${label} for ${talk.title}`)
    if (existingKeys.has(key)) {
      throw new Error(`Duplicate ${label}: ${talk.title} conflicts with ${existingKeys.get(key).id} ${existingKeys.get(key).title}`)
    }
    if (candidateKeys.has(key)) throw new Error(`Candidate duplicate ${label}: ${talk.title} and ${candidateKeys.get(key).title}`)
    candidateKeys.set(key, talk)
  }
}

const excluded = [
  {
    title: 'Lucilla Sioli',
    reason: 'The official ICML 2024 page contains a Video heading but explicitly states “No SlidesLive embed found for this event.”',
    url: 'https://icml.cc/virtual/2024/invited-talk/37570',
  },
  {
    title: 'Overflow copies of the six ICLR 2025 invited talks',
    reason: 'Duplicate rooms/streams for the same title, speaker, time, and talk.',
    url: 'https://iclr.cc/virtual/2025/events/invited%20talk',
  },
  {
    title: 'ICLR 2023 — Entanglements, Exploring Artificial Biodiversity',
    reason: 'Same speaker and talk title as the retained CVPR 2024 official recording.',
    url: 'https://iclr.cc/virtual/2023/events/invited%20talk',
  },
]

const nextId = Math.max(...existingResources.map((resource) => Number(resource.id.replace(/^ST-/, '')) || 0)) + 1
const additions = talks.map((talk, index) => {
  const conferenceSite = talk.platform === 'Conference Site'
  return {
    id: `ST-${String(nextId + index).padStart(3, '0')}`,
    section: 'Talk',
    domain: talk.domain,
    keywords: talk.keywords,
    language: 'English',
    title: talk.title,
    speaker: talk.speaker,
    channel: talk.channel,
    format: talk.format,
    durationMinutes: talk.durationMinutes,
    url: talk.url,
    platform: talk.platform,
    viewCount: 0,
    sourceTier: sourceTierA,
    recommendation: talk.recommendation,
    status: 'Verified',
    collectedOn,
    notes: conferenceSite
      ? 'Official conference detail page returned HTTP 200 and exposed an actual public SlidesLive or YouTube player; title, speaker, event date, and scheduled duration cross-checked. Short demos and duplicate overflow rooms excluded.'
      : 'Official ACM YouTube upload cross-checked against the KDD 2025 keynote program; title, speaker, channel, upload date, and runtime verified.',
    videoId: talk.videoId,
    focusArea: talk.focusArea,
    publishedAt: talk.publishedAt,
    subtitleLanguages: [],
    subtitleTracks: [],
    subtitlesVerified: false,
    subtitleVerificationScope: conferenceSite
      ? 'Official conference page exposes the recording but does not publish subtitle-track metadata.'
      : 'blocked by YouTube anti-bot verification on this network',
    metadataVerifiedVia: conferenceSite
      ? 'Official public conference detail page with embedded recording'
      : 'Official ACM YouTube page and KDD keynote program',
    metadataVerificationStatus: conferenceSite ? 'Verified' : 'Partial',
    lastVerifiedAt: collectedOn,
    lastVerificationAttemptAt: collectedOn,
    metadataVerificationError: '',
    publishedAtVerified: true,
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
  }
})

const updatedResources = [...existingResources, ...additions]

const existingManning = updatedResources.find((resource) => resource.videoId === 'd6XBrx_7rIE')
if (!existingManning) throw new Error('Existing KDD 2025 Chris Manning keynote was not found')
existingManning.speaker = 'Christopher Manning'
existingManning.title = 'KDD 2025 - Keynote Speakers: Christopher Manning / Meaning and Intelligence in Language Models'
existingManning.notes = 'Official ACM YouTube upload; speaker name and title spacing corrected during the 2026-08-15 conference-talk deduplication pass.'

const finalChecks = [
  ['ID', (resource) => normalizeText(resource.id)],
  ['video ID', (resource) => normalizeText(resource.videoId)],
  ['canonical URL', (resource) => canonicalUrl(resource.url)],
  ['normalized title', (resource) => normalizeText(resource.title)],
]
for (const [label, keyFor] of finalChecks) {
  const seen = new Map()
  for (const resource of updatedResources) {
    const key = keyFor(resource)
    if (!key) continue
    if (seen.has(key)) throw new Error(`Final duplicate ${label}: ${resource.id} and ${seen.get(key).id}`)
    seen.set(key, resource)
  }
}

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

const countsByChannel = additions.reduce((counts, talk) => {
  counts[talk.channel] = (counts[talk.channel] ?? 0) + 1
  return counts
}, {})
const auditReport = `# ScholarTube conference-talk backbone expansion — 2026-08-15

## Result

- Baseline: 798 resources, including 250 talks
- Added: 62 official, publicly playable, long-form conference talks
- New total: 860 resources, including 312 talks
- Added duration range: 45–75 minutes; no official short demos, lightning talks, paper spotlights, or marketing launches were added
- Every conference-site URL returned HTTP 200 and contained an actual SlidesLive or YouTube player; a Video heading without a player was not sufficient
- Deduplicated by resource ID, platform video ID, canonical URL, normalized title, and normalized title + speaker
- Corrected the existing KDD 2025 Christopher Manning speaker/title metadata without creating a new row

## Added by source

${Object.entries(countsByChannel).sort((a, b) => a[0].localeCompare(b[0])).map(([channel, count]) => `- ${channel}: ${count}`).join('\n')}

## Deliberately excluded

${excluded.map((item) => `- ${item.title}: ${item.reason} ${item.url}`).join('\n')}

## Continuing inclusion rule

Add official keynotes, invited talks, Test of Time talks, full tutorials, and research seminars that are normally at least 25 minutes. Require a durable public recording, not merely an agenda entry or empty Video section. Deduplicate by canonical URL, platform identifier, normalized title, and speaker. Continue excluding short demonstrations, lightning talks, paper spotlights, and launch/marketing clips.
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
  talks: updatedResources.filter((resource) => resource.section === 'Talk').length,
  addedByChannel: countsByChannel,
  excluded,
  platformCounts: Object.fromEntries(Object.entries(byPlatform).map(([platform, counts]) => [platform, counts.total])),
}, null, 2))
