import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const auditReportPath = path.join(projectDirectory, 'data', 'talks_expansion_2026-08-15.md')
const collectedOn = '2026-08-15'
const sourceTierA = 'A | Official / Original Creator / Organizer'

const talks = [
  {
    videoId: 'neurips-2025-109601', title: 'The Oak Architecture: A Vision of SuperIntelligence from Experience',
    speaker: 'Rich Sutton', channel: 'NeurIPS', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://neurips.cc/virtual/2025/invited-talk/109601', publishedAt: '2025-12-03',
    focusArea: 'Agent', domain: 'Agents / Reinforcement Learning',
    keywords: 'Continual Learning; World Models; Planning; Reinforcement Learning; Meta-Learning', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109606', title: 'Are We Having the Wrong Nightmares About AI?',
    speaker: 'Zeynep Tufekci', channel: 'NeurIPS', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://neurips.cc/virtual/2025/invited-talk/109606', publishedAt: '2025-12-03',
    focusArea: 'Other', domain: 'AI Safety / Governance / Society',
    keywords: 'AI Governance; Societal Impact; Generative AI; Risk; Technology Policy', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109603', title: 'The Art of (Artificial) Reasoning',
    speaker: 'Yejin Choi', channel: 'NeurIPS', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://neurips.cc/virtual/2025/invited-talk/109603', publishedAt: '2025-12-04',
    focusArea: 'Agent', domain: 'Agents / Tool Use / Reasoning',
    keywords: 'Reasoning; Reinforcement Learning; Small Language Models; Scaling Laws; Robustness', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109607', title: 'On the Science of “Alien Intelligences”: Evaluating Cognitive Capabilities in Babies, Animals, and AI',
    speaker: 'Melanie Mitchell', channel: 'NeurIPS', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://neurips.cc/virtual/2025/invited-talk/109607', publishedAt: '2025-12-04',
    focusArea: 'Other', domain: 'AI Evaluation / Cognitive Science',
    keywords: 'AI Evaluation; Cognitive Science; Analogy; Visual Abstraction; Experimental Methods', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109605', title: 'From Benchmarks to Problems — A Perspective on Problem Finding in AI',
    speaker: 'Kyunghyun Cho', channel: 'NeurIPS', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://neurips.cc/virtual/2025/invited-talk/109605', publishedAt: '2025-12-05',
    focusArea: 'Other', domain: 'AI Research / Evaluation',
    keywords: 'Problem Finding; Benchmarks; Machine Learning Research; Scientific Discovery; Evaluation', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109602', title: 'Demystifying Depth: Principles of Learning in Deep Neural Networks',
    speaker: 'Andrew Saxe', channel: 'NeurIPS', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://neurips.cc/virtual/2025/invited-talk/109602', publishedAt: '2025-12-05',
    focusArea: 'Other', domain: 'Deep Learning Foundations',
    keywords: 'Deep Learning Theory; Learning Dynamics; Representation Learning; Generalization; Transfer Learning', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-128328', title: 'Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks — Test of Time Award',
    speaker: 'Shaoqing Ren, Kaiming He, Ross Girshick, and Jian Sun', channel: 'NeurIPS', format: 'Test of Time Talk', durationMinutes: 30,
    url: 'https://neurips.cc/virtual/2025/test-of-time/128328', publishedAt: '2025-12-03',
    focusArea: 'Vision', domain: 'Computer Vision / Object Detection',
    keywords: 'Faster R-CNN; Object Detection; Region Proposal Networks; Computer Vision; Test of Time', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109599', title: 'Explain AI Models: Explainable AI, Data-Centric AI, and Mechanistic Interpretability',
    speaker: 'Shichang (Ray) Zhang, Himabindu Lakkaraju, and Julius Adebayo', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/109599', publishedAt: '2025-12-02',
    focusArea: 'Other', domain: 'Interpretability / Explainable AI',
    keywords: 'Explainable AI; Data Attribution; Mechanistic Interpretability; Feature Attribution; Model Understanding', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109588', title: 'Data Privacy, Memorization, and Legal Implications in Generative AI: A Practical Guide',
    speaker: 'Pratyush Maini, Joseph C. Gratz, and A. Feder Cooper', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/109588', publishedAt: '2025-12-02',
    focusArea: 'Other', domain: 'AI Privacy / Security / Law',
    keywords: 'Data Privacy; Memorization; Generative AI; Copyright; Security; Law', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109598', title: 'The Science of Benchmarking: What’s Measured, What’s Missed, and What’s Next',
    speaker: 'Ziqiao Ma, Michael Saxon, and Xiang Yue', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/109598', publishedAt: '2025-12-02',
    focusArea: 'Other', domain: 'AI Evaluation / Benchmarking',
    keywords: 'Benchmarking; Evaluation; Measurement; Dataset Design; Foundation Models', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109587', title: 'Autoregressive Models Beyond Language',
    speaker: 'Tianhong Li, Huiwen Chang, and Kaiming He', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/tutorial/109587', publishedAt: '2025-12-02',
    focusArea: 'World Model', domain: 'Multimodal Generation / World Models',
    keywords: 'Autoregressive Models; World Models; Vision; Video; Robotics; Scientific Data', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109597', title: 'Theoretical Insights on Training Instability in Deep Learning',
    speaker: 'Jingfeng Wu, Yu-Xiang Wang, and Maryam Fazel', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/tutorial/109597', publishedAt: '2025-12-02',
    focusArea: 'Other', domain: 'Deep Learning Optimization',
    keywords: 'Training Instability; Optimization; Large Stepsizes; Generalization; Deep Learning Theory', recommendation: 'Recommended',
  },
  {
    videoId: 'neurips-2025-109596', title: 'Planning in the Era of Language Models',
    speaker: 'Michael Katz, Harsha Kokel, and Christian Muise', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/109596', publishedAt: '2025-12-02',
    focusArea: 'Agent', domain: 'Agents / Planning / Reasoning',
    keywords: 'Automated Planning; Language Models; Agents; Reasoning; Planning Evaluation', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109592', title: 'Human-AI Alignment: Foundations, Methods, Practice, and Challenges',
    speaker: 'Hua Shen, Mitchell Gordon, Adam Tauman Kalai, and Yoshua Bengio', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/109592', publishedAt: '2025-12-02',
    focusArea: 'Agent', domain: 'AI Safety / Alignment / Oversight',
    keywords: 'Human-AI Alignment; Value Alignment; Oversight; Pluralism; Scientist AI', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-109589', title: 'Energy and Power as First-Class ML Design Metrics',
    speaker: 'Jae-Won Chung, Ahmet Inci, and Ruofan Wu', channel: 'NeurIPS', format: 'Conference Tutorial', durationMinutes: 150,
    url: 'https://neurips.cc/virtual/2025/tutorial/109589', publishedAt: '2025-12-02',
    focusArea: 'Other', domain: 'AI Systems / Energy Efficiency',
    keywords: 'AI Systems; Energy; Power; Performance; Benchmarking; Sustainable AI', recommendation: 'Recommended',
  },
  {
    videoId: 'mlsys-2025-2886', title: 'Extreme PyTorch: Inside the Most Demanding ML Workloads—and the Open Challenges in Building AI Agents to Democratize Them',
    speaker: 'Soumith Chintala', channel: 'MLSys', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://mlsys.org/virtual/2025/2886', publishedAt: '2025-05-12',
    focusArea: 'Other', domain: 'AI Systems / Frameworks',
    keywords: 'PyTorch; ML Systems; Training; Inference; Systems Agents', recommendation: 'Core',
  },
  {
    videoId: 'mlsys-2025-3013', title: 'An AI Stack: From Scaling AI Workloads to Evaluating LLMs',
    speaker: 'Ion Stoica', channel: 'MLSys', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://mlsys.org/virtual/2025/3013', publishedAt: '2025-05-13',
    focusArea: 'Other', domain: 'AI Systems / Serving / Evaluation',
    keywords: 'Ray; vLLM; SGLang; Chatbot Arena; Distributed Systems; LLM Evaluation', recommendation: 'Core',
  },
  {
    videoId: 'mlsys-2025-2887', title: 'Hardware-Aware Training and Inference for Large-Scale AI',
    speaker: 'Animashree Anandkumar', channel: 'MLSys', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://mlsys.org/virtual/2025/2887', publishedAt: '2025-05-14',
    focusArea: 'Other', domain: 'AI Systems / Hardware Efficiency',
    keywords: 'Hardware-Aware ML; Quantization; Gradient Compression; KV Cache; Large-Scale AI', recommendation: 'Core',
  },
  {
    videoId: 'mlsys-2025-3012', title: 'Responsible Finetuning of Large Language Models',
    speaker: 'Ling Liu', channel: 'MLSys', format: 'Conference Keynote', durationMinutes: 60,
    url: 'https://mlsys.org/virtual/2025/3012', publishedAt: '2025-05-15',
    focusArea: 'Other', domain: 'AI Safety / Security / Finetuning',
    keywords: 'Responsible Finetuning; Safety Alignment; Privacy; Security; Robustness; LLMs', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-136232', title: 'VideoLLMs Are Lost in Time',
    speaker: 'Cees Snoek', channel: 'NeurIPS', format: 'Workshop Invited Talk', durationMinutes: 30,
    url: 'https://neurips.cc/virtual/2025/136232', publishedAt: '2025-12-01',
    focusArea: 'Vision', domain: 'Video Understanding / Multimodal Models',
    keywords: 'VideoLLMs; Temporal Reasoning; Video Benchmarks; Multimodal Models; Evaluation', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-136233', title: 'Generating and Understanding the 3D World',
    speaker: 'Roozbeh Mottaghi', channel: 'NeurIPS', format: 'Workshop Invited Talk', durationMinutes: 30,
    url: 'https://neurips.cc/virtual/2025/136233', publishedAt: '2025-12-01',
    focusArea: 'Vision', domain: '3D Vision / World Models',
    keywords: '3D World; Generative Models; Video Understanding; Spatial Intelligence; World Models', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-136235', title: 'What Do Large Models Really Know About the World?',
    speaker: 'Shiry Ginosar', channel: 'NeurIPS', format: 'Workshop Invited Talk', durationMinutes: 30,
    url: 'https://neurips.cc/virtual/2025/136235', publishedAt: '2025-12-01',
    focusArea: 'World Model', domain: 'World Models / Multimodal Understanding',
    keywords: 'World Knowledge; Large Models; Multimodal Understanding; Video; Evaluation', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-131810', title: 'From Video Generation to Video World Models',
    speaker: 'Xun Huang', channel: 'NeurIPS', format: 'Workshop Invited Talk', durationMinutes: 35,
    url: 'https://neurips.cc/virtual/2025/131810', publishedAt: '2025-12-06',
    focusArea: 'World Model', domain: 'Video Generation / World Models',
    keywords: 'Video Generation; World Models; Simulation; Evaluation; Generative Models', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-130646', title: 'Multi-Turn Reinforcement Learning for LLMs: User Curiosity and Adversarially Ensured Realism',
    speaker: 'Natasha Jaques', channel: 'NeurIPS', format: 'Workshop Invited Talk', durationMinutes: 30,
    url: 'https://neurips.cc/virtual/2025/130646', publishedAt: '2025-12-06',
    focusArea: 'Agent', domain: 'Agents / Multi-Turn Reinforcement Learning',
    keywords: 'Multi-Turn RL; LLM Agents; Personalization; Reward Hacking; Long-Horizon Interaction', recommendation: 'Core',
  },
  {
    videoId: 'neurips-2025-136287', title: 'New Mathematical Approaches to Interpretability and Robustness of Neural Representations',
    speaker: 'Surya Ganguli', channel: 'NeurIPS', format: 'Workshop Invited Talk', durationMinutes: 30,
    url: 'https://neurips.cc/virtual/2025/136287', publishedAt: '2025-12-07',
    focusArea: 'Other', domain: 'Interpretability / Robustness / Representation Geometry',
    keywords: 'Interpretability; Robustness; Neural Representations; Geometry; High-Dimensional Learning', recommendation: 'Core',
  },
]

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const existingResources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (existingResources.length !== 773) throw new Error(`Expected 773 resources, found ${existingResources.length}`)
if (talks.length !== 25) throw new Error(`Expected 25 talks, found ${talks.length}`)

const existingIds = new Set(existingResources.map((resource) => resource.videoId))
const duplicates = talks.filter((talk) => existingIds.has(talk.videoId))
if (duplicates.length) throw new Error(`Already present: ${duplicates.map((talk) => talk.videoId).join(', ')}`)
if (talks.some((talk) => talk.durationMinutes < 25)) throw new Error('A short talk or demo entered the candidate set')
if (talks.some((talk) => !talk.url.startsWith('https://neurips.cc/') && !talk.url.startsWith('https://mlsys.org/'))) {
  throw new Error('A non-official conference URL entered the candidate set')
}

const nextId = Math.max(...existingResources.map((resource) => Number(resource.id.replace(/^ST-/, '')) || 0)) + 1
const additions = talks.map((talk, index) => ({
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
  platform: 'Conference Site',
  viewCount: 0,
  sourceTier: sourceTierA,
  recommendation: talk.recommendation,
  status: 'Verified',
  collectedOn,
  notes: 'Added from the official conference recording page after verifying the title, speaker, date, scheduled duration, and public Video section; short demos and lightning talks excluded.',
  videoId: talk.videoId,
  focusArea: talk.focusArea,
  publishedAt: talk.publishedAt,
  subtitleLanguages: [],
  subtitleTracks: [],
  subtitlesVerified: false,
  subtitleVerificationScope: 'Official conference page exposes the recording but does not publish subtitle-track metadata.',
  metadataVerifiedVia: 'Official NeurIPS or MLSys public recording page',
  metadataVerificationStatus: 'Verified',
  lastVerifiedAt: collectedOn,
  lastVerificationAttemptAt: collectedOn,
  metadataVerificationError: '',
  publishedAtVerified: true,
  seriesId: '',
  seriesTitle: '',
  seriesOrder: null,
}))

const updatedResources = [...existingResources, ...additions]
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

const auditReport = `# ScholarTube Talks expansion — 2026-08-15

## Result

- Baseline: 773 resources, including 225 talks
- Added: 25 official, publicly accessible, long-form talks
- New total: 798 resources, including 250 talks
- Minimum added duration: 30 minutes; no official short demos, lightning talks, paper spotlights, or marketing launches were added
- Sources: 21 NeurIPS recordings and 4 MLSys recordings

## Added set

### NeurIPS 2025 main program

- 6 invited talks: Rich Sutton, Zeynep Tufekci, Yejin Choi, Melanie Mitchell, Kyunghyun Cho, and Andrew Saxe
- Faster R-CNN Test of Time Award talk
- 8 full tutorials covering interpretability, privacy, benchmarking, autoregressive models, optimization, planning, alignment, and energy-aware ML

### MLSys 2025

- Soumith Chintala — Extreme PyTorch
- Ion Stoica — AI systems stack, serving, and evaluation
- Animashree Anandkumar — hardware-aware training and inference
- Ling Liu — responsible LLM finetuning

### NeurIPS 2025 workshops

- Cees Snoek — temporal reasoning in VideoLLMs
- Roozbeh Mottaghi — generating and understanding the 3D world
- Shiry Ginosar — what large models know about the world
- Xun Huang — video generation to video world models
- Natasha Jaques — multi-turn reinforcement learning for LLMs
- Surya Ganguli — mathematical approaches to interpretability and robustness

## Public-release watchlist

The following high-priority official programs were reviewed but not added because public video access was not yet available without conference login, or a public recording link was not yet exposed:

- ICLR 2026 invited talks
- ICML 2026 invited talks
- CVPR 2026 keynotes
- MLSys 2026 keynotes
- RSS 2025 standalone keynote recordings

These remain candidates for the recurring audit. They should be added only when an official, public, durable recording is available.

## Continuing inclusion rule

Add official keynotes, invited talks, Test of Time talks, full tutorials, and research seminars that are normally at least 25 minutes. Deduplicate by canonical URL, platform identifier, normalized title, and speaker. Continue excluding short demonstrations, lightning talks, paper spotlights, and launch/marketing clips.
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
  platformCounts: Object.fromEntries(Object.entries(byPlatform).map(([platform, counts]) => [platform, counts.total])),
}, null, 2))
