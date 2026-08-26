import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Adds the 2026-08-25 research-podcast expansion, fixes placeholder speaker
// names on existing podcast rows, and backfills series metadata on podcast
// channels that previously had no series grouping. The script is idempotent:
// additions already present (by URL or videoId) are skipped, ids are assigned
// from the current maximum, and the speaker/series updates converge to the
// same values on re-runs.

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const collectedOn = '2026-08-25'
const firstNewIdNumber = 1027

const sourceTiers = {
  official: 'A | Official / Original Creator / Organizer',
  institution: 'B | University / Conference / Institution',
}

const youtubeDefaults = {
  section: 'Interview',
  language: 'English',
  format: 'Podcast Interview',
  platform: 'YouTube',
  sourceTier: sourceTiers.official,
  status: 'Verified',
  collectedOn,
  subtitleLanguages: [],
  subtitleTracks: [],
  subtitlesVerified: false,
  subtitleVerificationScope: 'blocked by YouTube anti-bot verification on this network',
  metadataVerifiedVia: 'YouTube oEmbed endpoint, watch-page metadata, and the canonical channel listing',
  metadataVerificationStatus: 'Partial',
  lastVerifiedAt: collectedOn,
  lastVerificationAttemptAt: collectedOn,
  metadataVerificationError: '',
  publishedAtVerified: true,
}

const bilibiliDefaults = {
  ...youtubeDefaults,
  language: 'Chinese',
  format: 'Video Podcast',
  platform: 'Bilibili',
  subtitlesVerified: true,
  subtitleVerificationScope: 'all 1 part; no public subtitle track was listed',
  metadataVerifiedVia: 'Bilibili public view/player APIs',
  metadataVerificationStatus: 'Verified',
}

// Series metadata applied to new rows and backfilled onto existing rows.
// Matching definitions live in scripts/apply-course-series.mjs so that
// `npm run series:apply` keeps producing the same grouping.
const podcastSeriesByChannel = new Map(Object.entries({
  'Dwarkesh Patel': { id: 'dwarkesh-patel-interviews', title: 'Dwarkesh Patel Interviews' },
  'Machine Learning Street Talk': { id: 'machine-learning-street-talk-interviews', title: 'Machine Learning Street Talk Interviews' },
  'Latent Space': { id: 'latent-space-interviews', title: 'Latent Space Interviews' },
  'No Priors: AI, Machine Learning, Tech, & Startups': { id: 'no-priors-podcast', title: 'No Priors' },
  'The TWIML AI Podcast with Sam Charrington': { id: 'twiml-ai-podcast', title: 'The TWIML AI Podcast' },
  'The Robot Brains Podcast': { id: 'robot-brains-podcast', title: 'The Robot Brains Podcast' },
  'Lex Fridman': { id: 'lex-fridman-podcast', title: 'Lex Fridman Podcast' },
  'Sequoia Capital': { id: 'sequoia-training-data', title: 'Training Data — Sequoia Capital' },
  a16z: { id: 'a16z-ai-interviews', title: 'a16z AI Interviews' },
  'Cognitive Revolution "How AI Changes Everything"': { id: 'cognitive-revolution-podcast', title: 'The Cognitive Revolution Podcast' },
  'Google DeepMind': { id: 'google-deepmind-podcast', title: 'Google DeepMind: The Podcast' },
  'The Gradient': { id: 'the-gradient-podcast', title: 'The Gradient Podcast' },
  '80,000 Hours': { id: 'eighty-thousand-hours-podcast', title: 'The 80,000 Hours Podcast' },
  'Y Combinator': { id: 'y-combinator-ai-interviews', title: 'Y Combinator AI Interviews' },
  'Hugging Face': { id: 'hugging-face-podcast', title: 'Hugging Face Podcast & ML Club' },
  NVIDIA: { id: 'nvidia-ai-podcast', title: 'NVIDIA AI Podcast & Official Interviews' },
  // The YouTube uploads of 张小珺商业访谈录 join the existing Bilibili series.
  '张小珺 Podcast': { id: 'zhang-xiaojun-business-interviews', title: '张小珺商业访谈录' },
  // 卫诗婕 renamed the channel; new episodes join the existing series.
  '卫诗婕_漫谈Light the Star': { id: 'wei-shijie-mantan-podcast', title: '卫诗婕｜漫谈播客集' },
  WhynotTV: { id: 'whynottv-podcast', title: 'WhynotTV Podcast' },
  硅基聊天室: { id: 'silicon-based-chatroom', title: '硅基聊天室' },
  'Koji杨远骋at十字路口': { id: 'crossroads-video-podcast', title: '十字路口｜视频播客' },
}))

// The MAD Podcast channel label varies between episodes, so it is matched by prefix.
const madPodcastSeries = { id: 'mad-podcast', title: 'The MAD Podcast with Matt Turck' }

function seriesForChannel(channel) {
  if (channel?.startsWith('The MAD Podcast with Matt Turck')) return madPodcastSeries
  return podcastSeriesByChannel.get(channel) ?? null
}

function publishedOrder(publishedAt) {
  return Number(publishedAt?.replaceAll('-', '')) || null
}

// Every row below was verified live on 2026-08-25:
// - YouTube: the oEmbed endpoint confirmed the video and canonical channel;
//   the public watch page supplied the exact publish date and view count;
//   the canonical channel listing / search result supplied the runtime.
// - Bilibili: the public view API supplied title, owner, runtime, publish
//   date, and view count; the player API confirmed subtitle metadata.
const additions = [
  // ─── Dwarkesh Podcast ─────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Demis Hassabis; DeepMind; Scaling; AlphaZero; AlphaFold; AGI',
    title: 'Demis Hassabis — Scaling, superhuman AIs, AlphaZero atop LLMs, AlphaFold',
    speaker: 'Demis Hassabis', channel: 'Dwarkesh Patel', durationMinutes: 62,
    url: 'https://www.youtube.com/watch?v=qTogNUV3CAI', viewCount: 216698, recommendation: 'Core',
    videoId: 'qTogNUV3CAI', focusArea: 'Other', publishedAt: '2024-02-28',
    notes: 'Canonical Dwarkesh Podcast upload. Hassabis maps the limits of scaling, tree search atop LLMs, AlphaZero-style planning, and what AlphaFold implies about AI for science.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Interpretability; Long Context; LLM Internals; Superposition; Anthropic; Scaling',
    title: 'Sholto Douglas & Trenton Bricken — How LLMs actually think',
    speaker: 'Sholto Douglas and Trenton Bricken', channel: 'Dwarkesh Patel', format: 'Marathon Research Interview', durationMinutes: 193,
    url: 'https://www.youtube.com/watch?v=UTuuTTnjxMQ', viewCount: 195653, recommendation: 'Core',
    videoId: 'UTuuTTnjxMQ', focusArea: 'Other', publishedAt: '2024-03-28',
    notes: 'Canonical Dwarkesh Podcast upload. A three-hour mechanism-level walk through long-context attention, superposition, feature circuits, and how frontier-lab researchers actually reason about LLM internals.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Reinforcement Learning; LLMs; AGI; Reward; Frontier Labs; Research Progress',
    title: 'Is RL + LLMs enough for AGI? — Sholto Douglas & Trenton Bricken',
    speaker: 'Sholto Douglas and Trenton Bricken', channel: 'Dwarkesh Patel', durationMinutes: 144,
    url: 'https://www.youtube.com/watch?v=64lXQP6cs5M', viewCount: 206670, recommendation: 'Recommended',
    videoId: '64lXQP6cs5M', focusArea: 'Other', publishedAt: '2025-05-22',
    notes: 'Canonical Dwarkesh Podcast upload. The follow-up conversation on whether RL on top of language models closes the gap to AGI, with concrete detail on reward design and capability evaluations.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'John Schulman; RLHF; Reasoning; OpenAI; Post-training; AGI Plans',
    title: 'John Schulman (OpenAI Cofounder) — Reasoning, RLHF, & plan for 2027 AGI',
    speaker: 'John Schulman', channel: 'Dwarkesh Patel', durationMinutes: 96,
    url: 'https://www.youtube.com/watch?v=Wo95ob_s_NI', viewCount: 190997, recommendation: 'Core',
    videoId: 'Wo95ob_s_NI', focusArea: 'Other', publishedAt: '2024-05-15',
    notes: 'Canonical Dwarkesh Podcast upload. The co-inventor of PPO and RLHF explains post-training mechanics, why reasoning improves with RL, and how capability milestones are planned inside a frontier lab.',
  },
  {
    ...youtubeDefaults,
    domain: 'AI Systems / Infrastructure', keywords: 'Jeff Dean; Noam Shazeer; Google; Transformers; MoE; Systems for ML',
    title: 'Jeff Dean & Noam Shazeer — 25 years at Google: from PageRank to AGI',
    speaker: 'Jeff Dean and Noam Shazeer', channel: 'Dwarkesh Patel', durationMinutes: 136,
    url: 'https://www.youtube.com/watch?v=v0gjI__RyCY', viewCount: 335558, recommendation: 'Core',
    videoId: 'v0gjI__RyCY', focusArea: 'Other', publishedAt: '2025-02-12',
    notes: 'Canonical Dwarkesh Podcast upload. Two of the most influential systems and architecture researchers trace the path from MapReduce to Transformers, Mixture-of-Experts, and Gemini-scale infrastructure.',
  },
  {
    ...youtubeDefaults,
    domain: 'AI Research / Social Impact', keywords: 'Leopold Aschenbrenner; Situational Awareness; AGI Forecast; Compute; Geopolitics; Superintelligence',
    title: 'Leopold Aschenbrenner — 2027 AGI, China/US super-intelligence race, & the return of history',
    speaker: 'Leopold Aschenbrenner', channel: 'Dwarkesh Patel', format: 'Marathon Research Interview', durationMinutes: 272,
    url: 'https://www.youtube.com/watch?v=zdbVtZIn9IM', viewCount: 649417, recommendation: 'Core',
    videoId: 'zdbVtZIn9IM', focusArea: 'Other', publishedAt: '2024-06-04',
    notes: 'Canonical Dwarkesh Podcast upload. The four-and-a-half-hour conversation behind the Situational Awareness essays: compute build-outs, algorithmic progress accounting, and the security dynamics of a superintelligence race.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'François Chollet; ARC; Program Synthesis; Generalization; Abstraction; Benchmarks',
    title: "Francois Chollet — Why the biggest AI models can't solve simple puzzles",
    speaker: 'François Chollet', channel: 'Dwarkesh Patel', durationMinutes: 95,
    url: 'https://www.youtube.com/watch?v=UakqL6Pj9xo', viewCount: 183869, recommendation: 'Core',
    videoId: 'UakqL6Pj9xo', focusArea: 'Other', publishedAt: '2024-06-11',
    notes: 'Canonical Dwarkesh Podcast upload. Chollet defends the ARC benchmark, distinguishes skill from intelligence, and argues for program synthesis as the missing ingredient beyond scaling.',
  },
  {
    ...youtubeDefaults,
    domain: 'AI Safety / Alignment / Oversight', keywords: 'Paul Christiano; Alignment; AI Takeover; RLHF; Scalable Oversight; Safety Research',
    title: 'Paul Christiano — Preventing an AI takeover',
    speaker: 'Paul Christiano', channel: 'Dwarkesh Patel', format: 'Marathon Research Interview', durationMinutes: 187,
    url: 'https://www.youtube.com/watch?v=9AAhTLa0dT0', viewCount: 82605, recommendation: 'Core',
    videoId: '9AAhTLa0dT0', focusArea: 'Other', publishedAt: '2023-10-31',
    notes: 'Canonical Dwarkesh Podcast upload. The inventor of RLHF lays out concrete takeover threat models, scalable-oversight research directions, and how alignment work is prioritized — a technical safety reference conversation.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Shane Legg; DeepMind; AGI Timelines; Alignment; Architectures; Measurement',
    title: 'Shane Legg (DeepMind Founder) — 2028 AGI, superhuman alignment, new architectures',
    speaker: 'Shane Legg', channel: 'Dwarkesh Patel', durationMinutes: 44,
    url: 'https://www.youtube.com/watch?v=Kc1atfJkiJU', viewCount: 127001, recommendation: 'Recommended',
    videoId: 'Kc1atfJkiJU', focusArea: 'Other', publishedAt: '2023-10-26',
    notes: 'Canonical Dwarkesh Podcast upload. The DeepMind co-founder who coined the modern AGI definition discusses measurement of general intelligence, timeline reasoning, and alignment beyond human level.',
  },
  {
    ...youtubeDefaults,
    domain: 'AI Systems / Infrastructure', keywords: 'LLM Training; Inference Serving; Hardware; Compilers; Frontier Models; Systems',
    title: 'How GPT, Claude, and Gemini are actually trained and served – Reiner Pope',
    speaker: 'Reiner Pope', channel: 'Dwarkesh Patel', durationMinutes: 134,
    url: 'https://www.youtube.com/watch?v=xmkSf5IS-zw', viewCount: 450016, recommendation: 'Recommended',
    videoId: 'xmkSf5IS-zw', focusArea: 'Other', publishedAt: '2026-04-29',
    notes: 'Canonical Dwarkesh Podcast upload. A former Google PaLM inference lead walks through the full frontier-model systems stack — parallelism, quantization, serving economics — at whiteboard depth.',
  },

  // ─── Machine Learning Street Talk ─────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'AI for Science', keywords: 'John Jumper; AlphaFold; Nobel Prize; Protein Structure; AI for Science; DeepMind',
    title: 'He won a Nobel here for AlphaFold. Then he left. - John Jumper',
    speaker: 'John Jumper', channel: 'Machine Learning Street Talk', durationMinutes: 53,
    url: 'https://www.youtube.com/watch?v=e3gBwLWAerw', viewCount: 38149, recommendation: 'Core',
    videoId: 'e3gBwLWAerw', focusArea: 'Other', publishedAt: '2026-06-22',
    notes: 'Canonical MLST upload. The AlphaFold Nobel laureate on what made the protein-structure breakthrough work, evaluation discipline in scientific ML, and his next research bets.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Yi Ma; Compression; Rate Reduction; White-box Models; Representation Learning; Intelligence',
    title: 'The Mathematical Foundations of Intelligence [Professor Yi Ma]',
    speaker: 'Yi Ma', channel: 'Machine Learning Street Talk', durationMinutes: 65,
    url: 'https://www.youtube.com/watch?v=QWidx8cYVRs', viewCount: 36060, recommendation: 'Recommended',
    videoId: 'QWidx8cYVRs', focusArea: 'Other', publishedAt: '2025-12-13',
    notes: 'Canonical MLST upload. Yi Ma presents his compression-and-rate-reduction account of intelligence and argues for white-box alternatives to purely empirical deep learning.',
  },
  {
    ...youtubeDefaults,
    domain: 'World Models', keywords: 'Genie; World Models; Interactive Environments; Video Generation; DeepMind; Simulation',
    title: 'Type a Sentence, Get a Playable 3D World in 3 Seconds - Shlomi Fuchter & Jack Parker-Holder',
    speaker: 'Shlomi Fruchter and Jack Parker-Holder', channel: 'Machine Learning Street Talk', durationMinutes: 58,
    url: 'https://www.youtube.com/watch?v=ekgvWeHidJs', viewCount: 57101, recommendation: 'Core',
    videoId: 'ekgvWeHidJs', focusArea: 'World Model', publishedAt: '2025-08-05',
    notes: 'Canonical MLST upload. The Genie research leads explain how promptable, playable world models are trained, what breaks at scale, and how generative environments feed agent research.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Sepp Hochreiter; LSTM; xLSTM; Recurrence; Sequence Models; Architectures',
    title: 'LSTM: The Comeback Story? [Prof. Sepp Hochreiter]',
    speaker: 'Sepp Hochreiter', channel: 'Machine Learning Street Talk', durationMinutes: 67,
    url: 'https://www.youtube.com/watch?v=8u2pW2zZLCs', viewCount: 27644, recommendation: 'Recommended',
    videoId: '8u2pW2zZLCs', focusArea: 'Other', publishedAt: '2025-02-11',
    notes: 'Canonical MLST upload. The LSTM inventor explains xLSTM, exponential gating, and where recurrent architectures still beat attention on memory and efficiency.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Jürgen Schmidhuber; History of AI; Meta-learning; Compression; Curiosity; AGI',
    title: 'SCHMIDHUBER: HOW WE WILL LIVE WITH AIs',
    speaker: 'Jürgen Schmidhuber', channel: 'Machine Learning Street Talk', durationMinutes: 73,
    url: 'https://www.youtube.com/watch?v=fZYUqICYCAk', viewCount: 24696, recommendation: 'Recommended',
    videoId: 'fZYUqICYCAk', focusArea: 'Other', publishedAt: '2025-01-16',
    notes: 'Canonical MLST upload. Schmidhuber connects his compression-driven theory of curiosity and decades of meta-learning research to how humans and increasingly capable AIs will coexist.',
  },

  // ─── Latent Space ──────────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Agents / Tool Use / Reasoning', keywords: 'Generative Agents; Social Simulation; Digital Twins; Stanford; Human Behavior; Agents',
    title: 'Simulating Humanity: from Generative Agents to 8 Billion Digital Twins — Joon Sung Park, Simile AI',
    speaker: 'Joon Sung Park', channel: 'Latent Space', durationMinutes: 71,
    url: 'https://www.youtube.com/watch?v=KpOW9Pk4BUs', viewCount: 11960, recommendation: 'Recommended',
    videoId: 'KpOW9Pk4BUs', focusArea: 'Agent', publishedAt: '2026-08-21',
    notes: 'Canonical Latent Space upload. The author of the generative-agents paper explains the architecture behind believable simulated humans and what scaling behavioral simulation requires.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Mark Chen; OpenAI; Reasoning Models; Evals; Scaling Laws; Research Leadership',
    title: 'Cooking with OpenAI’s Research Chief: AGI, o1, Evals, and Scaling Laws — Mark Chen',
    speaker: 'Mark Chen', channel: 'Latent Space', durationMinutes: 41,
    url: 'https://www.youtube.com/watch?v=fpAthTtha8c', viewCount: 93296, recommendation: 'Core',
    videoId: 'fpAthTtha8c', focusArea: 'Other', publishedAt: '2026-06-25',
    notes: 'Canonical Latent Space upload. OpenAI’s chief research officer on how reasoning models were developed, what evals actually drive research decisions, and where scaling laws still hold.',
  },
  {
    ...youtubeDefaults,
    domain: 'World Models', keywords: 'World Models; Interactive Simulation; Multimodal; Chris Manning; Spatial Intelligence; Startups',
    title: 'Moonlake: Interactive, Multimodal World Models — with Chris Manning and Fan-yun Sun',
    speaker: 'Chris Manning and Fan-yun Sun', channel: 'Latent Space', durationMinutes: 67,
    url: 'https://www.youtube.com/watch?v=oBWRHnggscM', viewCount: 8170, recommendation: 'Core',
    videoId: 'oBWRHnggscM', focusArea: 'World Model', publishedAt: '2026-04-02',
    notes: 'Canonical Latent Space upload. Chris Manning and Fan-yun Sun lay out the research agenda for interactive multimodal world models and the data and evaluation problems specific to them.',
  },
  {
    ...youtubeDefaults,
    domain: 'World Models', keywords: 'Video Generation; World Models; Grok Imagine; xAI; Video Agents; Diffusion',
    title: 'Inside xAI: Building Grok Imagine in 3 Months, Videogen vs World Models, and Video Agents— Ethan He',
    speaker: 'Ethan He', channel: 'Latent Space', durationMinutes: 105,
    url: 'https://www.youtube.com/watch?v=jPtQlILfkhA', viewCount: 12381, recommendation: 'Recommended',
    videoId: 'jPtQlILfkhA', focusArea: 'World Model', publishedAt: '2026-06-01',
    notes: 'Canonical Latent Space upload. A frontier video-generation researcher contrasts video generation with world modeling and details the training system behind a production videogen model.',
  },

  // ─── No Priors ─────────────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Agents / Tool Use / Reasoning', keywords: 'Noam Brown; Test-Time Compute; Reasoning; Benchmarks; Safety; OpenAI',
    title: "Really Big Test-Time Compute in AI Changes Benchmarks, Safety and Research with OpenAI's Noam Brown",
    speaker: 'Noam Brown', channel: 'No Priors: AI, Machine Learning, Tech, & Startups', durationMinutes: 36,
    url: 'https://www.youtube.com/watch?v=AZrU6y3pUcU', viewCount: 13879, recommendation: 'Core',
    videoId: 'AZrU6y3pUcU', focusArea: 'Agent', publishedAt: '2026-06-26',
    notes: 'Canonical No Priors upload. The researcher behind Libratus, Cicero, and o-series reasoning explains what massive test-time compute changes for benchmarks, safety cases, and research planning.',
  },
  {
    ...youtubeDefaults,
    domain: 'Robotics / Embodied AI', keywords: 'Robot Learning; Imitation Learning; ALOHA; Diffusion Policy; Home Robots; Startups',
    title: 'No Priors Ep. 141 | With Sunday Robotics Co-Founders Tony Zhao and Cheng Chi',
    speaker: 'Tony Zhao and Cheng Chi', channel: 'No Priors: AI, Machine Learning, Tech, & Startups', durationMinutes: 39,
    url: 'https://www.youtube.com/watch?v=4-VzXoZqAH0', viewCount: 19568, recommendation: 'Recommended',
    videoId: '4-VzXoZqAH0', focusArea: 'Robotics', publishedAt: '2025-11-19',
    notes: 'Canonical No Priors upload. The researchers behind ALOHA and Diffusion Policy discuss translating manipulation research into a home-robot product and the data engine that requires.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Eric Zelikman; STaR; Reasoning; Self-Improvement; Language Models; Research',
    title: 'No Priors Ep. 135 | With Humans& Founder Eric Zelikman',
    speaker: 'Eric Zelikman', channel: 'No Priors: AI, Machine Learning, Tech, & Startups', durationMinutes: 37,
    url: 'https://www.youtube.com/watch?v=Oh0oQnKn9dw', viewCount: 5256, recommendation: 'Recommended',
    videoId: 'Oh0oQnKn9dw', focusArea: 'Other', publishedAt: '2025-10-09',
    notes: 'Canonical No Priors upload. The author of STaR — a foundation for modern self-taught reasoning — on bootstrapped reasoning research and models built around people.',
  },
  {
    ...youtubeDefaults,
    domain: 'Agents / Tool Use / Reasoning', keywords: 'Misha Laskin; Reinforcement Learning; Agents; Gemini; ReflectionAI; Post-training',
    title: 'No Priors Ep. 123 | With ReflectionAI Co-Founder and CEO Misha Laskin',
    speaker: 'Misha Laskin', channel: 'No Priors: AI, Machine Learning, Tech, & Startups', durationMinutes: 63,
    url: 'https://www.youtube.com/watch?v=xqyy_Zs8Fgw', viewCount: 4900, recommendation: 'Recommended',
    videoId: 'xqyy_Zs8Fgw', focusArea: 'Agent', publishedAt: '2025-07-17',
    notes: 'Canonical No Priors upload. A former Gemini RL researcher on building autonomous coding agents, what RL contributes beyond imitation, and open agent-research problems.',
  },

  // ─── The TWIML AI Podcast ──────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Stefano Ermon; Diffusion Models; Diffusion LLMs; Generative Modeling; Inference; Stanford',
    title: 'The Race to Production-Grade Diffusion LLMs [Stefano Ermon] - 764',
    speaker: 'Stefano Ermon', channel: 'The TWIML AI Podcast with Sam Charrington', durationMinutes: 63,
    url: 'https://www.youtube.com/watch?v=UDNDOf5hT-A', viewCount: 2130, recommendation: 'Recommended',
    videoId: 'UDNDOf5hT-A', focusArea: 'Other', publishedAt: '2026-03-26',
    notes: 'Canonical TWIML upload. The Stanford professor behind foundational diffusion work explains how diffusion language models train, sample, and compare against autoregressive systems in production.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Yejin Choi; Reasoning; Small Language Models; Distillation; Commonsense; NLP',
    title: 'The Evolution of Reasoning in Small Language Models [Yejin Choi] - 761',
    speaker: 'Yejin Choi', channel: 'The TWIML AI Podcast with Sam Charrington', durationMinutes: 66,
    url: 'https://www.youtube.com/watch?v=-_x7lhhZK7M', viewCount: 4166, recommendation: 'Core',
    videoId: '-_x7lhhZK7M', focusArea: 'Other', publishedAt: '2026-01-29',
    notes: 'Canonical TWIML upload. The MacArthur-winning NLP researcher on distilling reasoning into small models, what commonsense benchmarks still expose, and the science of data quality.',
  },
  {
    ...youtubeDefaults,
    domain: 'Robotics / Embodied AI', keywords: 'Nikita Rudin; Legged Robots; Reinforcement Learning; Sim-to-Real; Locomotion; ETH Zürich',
    title: 'Intelligent Robots in 2026: Are We There Yet? [Nikita Rudin] - 760',
    speaker: 'Nikita Rudin', channel: 'The TWIML AI Podcast with Sam Charrington', durationMinutes: 66,
    url: 'https://www.youtube.com/watch?v=346Enb7CUfQ', viewCount: 2038, recommendation: 'Recommended',
    videoId: '346Enb7CUfQ', focusArea: 'Robotics', publishedAt: '2026-01-08',
    notes: 'Canonical TWIML upload. The researcher behind massively parallel legged-locomotion RL assesses what actually works in robot learning today: sim-to-real, data, and hardware constraints.',
  },
  {
    ...youtubeDefaults,
    domain: 'World Models', keywords: 'Genie 3; World Models; Interactive Environments; DeepMind; Agents; Simulation',
    title: 'Genie 3: A New Frontier for World Models [Jack Parker-Holder and Shlomi Fruchter] - 743',
    speaker: 'Jack Parker-Holder and Shlomi Fruchter', channel: 'The TWIML AI Podcast with Sam Charrington', durationMinutes: 61,
    url: 'https://www.youtube.com/watch?v=1igh4oas1Ls', viewCount: 1461, recommendation: 'Recommended',
    videoId: '1igh4oas1Ls', focusArea: 'World Model', publishedAt: '2025-08-19',
    notes: 'Canonical TWIML upload. A researcher-level hour on Genie 3 internals — consistency over long horizons, promptable events, and using generated worlds to train agents.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Interpretability; Circuit Tracing; Attribution Graphs; Anthropic; LLM Biology; Safety',
    title: 'Inside the “Neurons” of LLMs: Circuit Tracing Their Hidden Biology [Emmanuel Ameisen] - 727',
    speaker: 'Emmanuel Ameisen', channel: 'The TWIML AI Podcast with Sam Charrington', durationMinutes: 94,
    url: 'https://www.youtube.com/watch?v=PL0j6fy3hkY', viewCount: 1729, recommendation: 'Recommended',
    videoId: 'PL0j6fy3hkY', focusArea: 'Other', publishedAt: '2025-04-15',
    notes: 'Canonical TWIML upload. An Anthropic interpretability engineer walks through circuit tracing and attribution graphs — one of the clearest podcast treatments of mechanistic interpretability methods.',
  },

  // ─── The Robot Brains Podcast ──────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Agents / Tool Use / Reasoning', keywords: 'Noam Brown; Poker; Diplomacy; Game Theory; Search; Multi-agent',
    title: 'S3 E14 OpenAI Research Scientist Noam Brown on Solving Poker and Diplomacy with AI',
    speaker: 'Noam Brown', channel: 'The Robot Brains Podcast', durationMinutes: 85,
    url: 'https://www.youtube.com/watch?v=ceCg90Q9N6Y', viewCount: 6273, recommendation: 'Core',
    videoId: 'ceCg90Q9N6Y', focusArea: 'Agent', publishedAt: '2023-06-28',
    notes: 'Canonical Robot Brains upload with Pieter Abbeel. Noam Brown details the search and equilibrium techniques behind Libratus and Cicero — the intellectual lineage of today’s test-time-compute reasoning.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'John Schulman; ChatGPT; RLHF; Capabilities; Limitations; OpenAI',
    title: 'S3 E18 John Schulman of OpenAI on ChatGPT: invention, capabilities and limitations',
    speaker: 'John Schulman', channel: 'The Robot Brains Podcast', durationMinutes: 57,
    url: 'https://www.youtube.com/watch?v=nM_3d37lmcM', viewCount: 7830, recommendation: 'Recommended',
    videoId: 'nM_3d37lmcM', focusArea: 'Other', publishedAt: '2023-08-02',
    notes: 'Canonical Robot Brains upload. Schulman recounts how ChatGPT was actually assembled from RLHF research and gives a sober account of its failure modes.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Geoffrey Hinton; Deep Learning; Forward-Forward; Brain; Neural Networks; History',
    title: 'Season 2 Ep 22 Geoff Hinton on revolutionizing artificial intelligence... again',
    speaker: 'Geoffrey Hinton', channel: 'The Robot Brains Podcast', durationMinutes: 88,
    url: 'https://www.youtube.com/watch?v=2EDP4v-9TUA', viewCount: 184764, recommendation: 'Core',
    videoId: '2EDP4v-9TUA', focusArea: 'Other', publishedAt: '2022-06-01',
    notes: 'Canonical Robot Brains upload. A research-dense Hinton conversation on alternatives to backpropagation, biological plausibility, and where deep learning goes next.',
  },
  {
    ...youtubeDefaults,
    domain: 'Robotics / Embodied AI', keywords: 'Chelsea Finn; Meta-learning; Robot Learning; Adaptation; Stanford; Generalization',
    title: 'S3 E2 Stanford Prof Chelsea Finn: How to build AI that can keep up with an always changing world',
    speaker: 'Chelsea Finn', channel: 'The Robot Brains Podcast', durationMinutes: 67,
    url: 'https://www.youtube.com/watch?v=ZD15OtMbaNw', viewCount: 6677, recommendation: 'Core',
    videoId: 'ZD15OtMbaNw', focusArea: 'Robotics', publishedAt: '2023-03-22',
    notes: 'Canonical Robot Brains upload. Chelsea Finn on meta-learning, robot adaptation, and the data problems that separate lab demos from robust embodied learning.',
  },

  // ─── Training Data — Sequoia Capital ───────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Deep Reinforcement Learning', keywords: 'Richard Sutton; Continual Learning; Plasticity; Reinforcement Learning; Alberta Plan; OaK',
    title: 'Rich Sutton and Khurram Javed: Why AI Models Stop Learning, and How to Start It Again',
    speaker: 'Richard Sutton and Khurram Javed', channel: 'Sequoia Capital', durationMinutes: 54,
    url: 'https://www.youtube.com/watch?v=xH7U7w9Qzlo', viewCount: 53195, recommendation: 'Core',
    videoId: 'xH7U7w9Qzlo', focusArea: 'Other', publishedAt: '2026-08-18',
    notes: 'Official Training Data upload on the Sequoia Capital channel. The father of RL and his collaborator explain loss of plasticity and their continual-learning research agenda beyond static pretraining.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Jerry Tworek; Rohan Anil; Automated Research; AGI Labs; RL; Training',
    title: "Building the Automated AGI Lab: Core Automation's Jerry Tworek and Rohan Anil",
    speaker: 'Jerry Tworek and Rohan Anil', channel: 'Sequoia Capital', durationMinutes: 49,
    url: 'https://www.youtube.com/watch?v=2RJiaf0SY8s', viewCount: 32616, recommendation: 'Recommended',
    videoId: '2RJiaf0SY8s', focusArea: 'Other', publishedAt: '2026-07-29',
    notes: 'Official Training Data upload. Two veteran frontier-lab researchers describe what it takes to automate model research itself — infrastructure, evaluation loops, and taste.',
  },
  {
    ...youtubeDefaults,
    domain: 'Robotics / Embodied AI', keywords: 'Thomas Wolf; Hugging Face; Open Robotics; LeRobot; Physical AI; Ecosystems',
    title: 'Building the "App Store" for Robots: Hugging Face\'s Thomas Wolf on Physical AI',
    speaker: 'Thomas Wolf', channel: 'Sequoia Capital', durationMinutes: 43,
    url: 'https://www.youtube.com/watch?v=RFKFaJfvBqE', viewCount: 108743, recommendation: 'Recommended',
    videoId: 'RFKFaJfvBqE', focusArea: 'Robotics', publishedAt: '2025-09-09',
    notes: 'Official Training Data upload. Hugging Face’s chief scientist lays out the open-source robotics stack — affordable hardware, shared datasets, and community policies — as a research ecosystem play.',
  },
  {
    ...youtubeDefaults,
    domain: 'Agents / Tool Use / Reasoning', keywords: 'Andrej Karpathy; Agentic Engineering; Coding Agents; Software 2.0; AI Ascent; Developer Tools',
    title: 'Andrej Karpathy: From Vibe Coding to Agentic Engineering w/ Stephanie Zhan',
    speaker: 'Andrej Karpathy', channel: 'Sequoia Capital', durationMinutes: 30,
    url: 'https://www.youtube.com/watch?v=96jN2OCOfLs', viewCount: 1486351, recommendation: 'Recommended',
    videoId: '96jN2OCOfLs', focusArea: 'Agent', publishedAt: '2026-04-29',
    notes: 'Official Sequoia AI Ascent conversation. Karpathy on how coding agents change engineering practice and what remains hard about autonomy in software work.',
  },

  // ─── a16z ──────────────────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'World Models', keywords: 'Fei-Fei Li; Spatial Intelligence; World Models; World Labs; Robotics; 3D',
    title: 'Fei-Fei Li is Solving the Hardest Problem in Robotics | World Labs with a16z',
    speaker: 'Fei-Fei Li', channel: 'a16z', durationMinutes: 42,
    url: 'https://www.youtube.com/watch?v=-tabaM5l3s0', viewCount: 51694, recommendation: 'Core',
    videoId: '-tabaM5l3s0', focusArea: 'World Model', publishedAt: '2026-07-28',
    notes: 'Official a16z upload. Fei-Fei Li explains why spatial intelligence and generative world models are the bottleneck for robotics and how World Labs is attacking it.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Mark Chen; Jakub Pachocki; OpenAI; Research Taste; Automated Research; Scaling',
    title: 'From Vibe Coding to Vibe Researching: OpenAI’s Mark Chen and Jakub Pachocki',
    speaker: 'Mark Chen and Jakub Pachocki', channel: 'a16z', durationMinutes: 53,
    url: 'https://www.youtube.com/watch?v=KSgPNVmZ8jQ', viewCount: 30305, recommendation: 'Core',
    videoId: 'KSgPNVmZ8jQ', focusArea: 'How to Research', publishedAt: '2025-09-25',
    notes: 'Official a16z upload. OpenAI’s chief scientist and chief research officer on research taste, how projects get chosen at a frontier lab, and what “vibe researching” with AI assistance actually looks like.',
  },
  {
    ...youtubeDefaults,
    domain: 'World Models', keywords: 'Genie 3; World Models; DeepMind; Interactive Worlds; Video Generation; Agents',
    title: 'Google DeepMind Lead Researchers on Genie 3 & the Future of World-Building',
    speaker: 'Jack Parker-Holder and Shlomi Fruchter', channel: 'a16z', durationMinutes: 42,
    url: 'https://www.youtube.com/watch?v=tWgjhC7dJRo', viewCount: 10323, recommendation: 'Recommended',
    videoId: 'tWgjhC7dJRo', focusArea: 'World Model', publishedAt: '2025-08-16',
    notes: 'Official a16z upload; the guests are named in the episode description. A complementary industry-facing conversation on Genie 3, world-building, and downstream agent training.',
  },

  // ─── The Cognitive Revolution ──────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Nathan Lambert; Post-training; RLHF; DPO; Open Models; Ai2',
    title: 'Everything You Wanted to Know About LLM Post-Training, with Nathan Lambert of Allen Institute for AI',
    speaker: 'Nathan Lambert', channel: 'Cognitive Revolution "How AI Changes Everything"', durationMinutes: 110,
    url: 'https://www.youtube.com/watch?v=LVXtFnEbNU0', viewCount: 9172, recommendation: 'Core',
    videoId: 'LVXtFnEbNU0', focusArea: 'Other', publishedAt: '2024-11-21',
    notes: 'Canonical Cognitive Revolution upload. A systematic, mechanism-level tour of the post-training stack — SFT, RLHF, DPO, evaluation — from the researcher behind the open Tülu recipes.',
  },
  {
    ...youtubeDefaults,
    domain: 'Robotics / Embodied AI', keywords: 'Gemini Robotics; VLA Models; Embodied AI; Google DeepMind; Manipulation; Generalization',
    title: 'Gemini Robotics – AI for the Physical World, with Keerthana and Ted of Google DeepMind',
    speaker: 'Keerthana Gopalakrishnan and Ted Xiao', channel: 'Cognitive Revolution "How AI Changes Everything"', durationMinutes: 108,
    url: 'https://www.youtube.com/watch?v=8burcVPvRjU', viewCount: 25769, recommendation: 'Recommended',
    videoId: '8burcVPvRjU', focusArea: 'Robotics', publishedAt: '2025-05-17',
    notes: 'Canonical Cognitive Revolution upload. Two Gemini Robotics researchers explain vision-language-action training, embodied reasoning, and how web-scale priors transfer to manipulation.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Mechanistic Interpretability; Goodfire; Features; Model Editing; Safety; Sparse Autoencoders',
    title: "Mechanistic Interpretability: Philosophy, Practice & Progress with Goodfire's Daniel & Tom",
    speaker: 'Dan Balsam and Tom McGrath', channel: 'Cognitive Revolution "How AI Changes Everything"', durationMinutes: 114,
    url: 'https://www.youtube.com/watch?v=Ap8YSyUdafM', viewCount: 188994, recommendation: 'Recommended',
    videoId: 'Ap8YSyUdafM', focusArea: 'Other', publishedAt: '2025-05-29',
    notes: 'Canonical Cognitive Revolution upload. Goodfire’s CTO and chief scientist survey the state of mechanistic interpretability, from sparse autoencoders to intervention-based model editing.',
  },

  // ─── Google DeepMind: The Podcast ──────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'AI for Science', keywords: 'John Jumper; AlphaFold; Protein Folding; Nobel Prize; AI for Science; DeepMind',
    title: 'AlphaFold: Grand challenge to Nobel Prize | John Jumper',
    speaker: 'John Jumper', channel: 'Google DeepMind', durationMinutes: 48,
    url: 'https://www.youtube.com/watch?v=-pGs0btGmgY', viewCount: 264464, recommendation: 'Core',
    videoId: '-pGs0btGmgY', focusArea: 'Other', publishedAt: '2025-11-28',
    notes: 'Official Google DeepMind podcast episode with Hannah Fry. Jumper reconstructs the AlphaFold research arc from grand challenge to Nobel Prize, including the evaluation discipline that made it credible.',
  },
  {
    ...youtubeDefaults,
    domain: 'Agents / Tool Use / Reasoning', keywords: 'Oriol Vinyals; Gemini; Agents; Multimodal Models; Post-training; DeepMind',
    title: 'Gemini 2.0 and the evolution of agentic AI | Oriol Vinyals',
    speaker: 'Oriol Vinyals', channel: 'Google DeepMind', durationMinutes: 52,
    url: 'https://www.youtube.com/watch?v=78mEYaztGaw', viewCount: 98790, recommendation: 'Core',
    videoId: '78mEYaztGaw', focusArea: 'Agent', publishedAt: '2024-12-12',
    notes: 'Official Google DeepMind podcast episode with Hannah Fry. Gemini co-lead Oriol Vinyals explains the pre-training/post-training split and how single-task models became general agentic systems.',
  },
  {
    ...youtubeDefaults,
    domain: 'Robotics / Embodied AI', keywords: 'Carolina Parada; Robotics; Embodied Reasoning; Gemini Robotics; Multimodal; DeepMind',
    title: 'Redefining robotics | Carolina Parada',
    speaker: 'Carolina Parada', channel: 'Google DeepMind', durationMinutes: 46,
    url: 'https://www.youtube.com/watch?v=Rgwty6dGsYI', viewCount: 375104, recommendation: 'Core',
    videoId: 'Rgwty6dGsYI', focusArea: 'Robotics', publishedAt: '2025-05-22',
    notes: 'Official Google DeepMind podcast episode with Hannah Fry. DeepMind’s head of robotics on multimodal understanding and embodied reasoning as the foundation of the new robotics stack.',
  },

  // ─── The Gradient Podcast ──────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Yann LeCun; Self-Supervised Learning; Research Career; ConvNets; Energy-Based Models; Meta AI',
    title: 'Yann LeCun on his Start in Research and Self-Supervised Learning',
    speaker: 'Yann LeCun', channel: 'The Gradient', durationMinutes: 56,
    url: 'https://www.youtube.com/watch?v=YdzXtm2URTE', viewCount: 873, recommendation: 'Recommended',
    videoId: 'YdzXtm2URTE', focusArea: 'How to Research', publishedAt: '2021-09-01',
    notes: 'Canonical Gradient Podcast upload. LeCun on how he found his research direction, the years ConvNets were unfashionable, and why he bets on self-supervised learning — a research-taste conversation.',
  },
  {
    ...youtubeDefaults,
    domain: 'World Models / Representation Learning', keywords: 'Jacob Andreas; Language Grounding; World Models; Compositionality; NLP; MIT',
    title: 'The Gradient Podcast - Jacob Andreas: Language, Grounding, and World Models',
    speaker: 'Jacob Andreas', channel: 'The Gradient', durationMinutes: 113,
    url: 'https://www.youtube.com/watch?v=k5N2n21L7ak', viewCount: 362, recommendation: 'Recommended',
    videoId: 'k5N2n21L7ak', focusArea: 'World Model', publishedAt: '2024-10-10',
    notes: 'Canonical Gradient Podcast upload. A deep treatment of whether and how language models build internal world models, from a leading researcher on grounding and compositionality.',
  },
  {
    ...youtubeDefaults,
    domain: 'AI Systems / Infrastructure', keywords: 'Soumith Chintala; PyTorch; Open Source; ML Systems; Frameworks; Meta',
    title: 'The Gradient Podcast - Soumith Chintala: PyTorch',
    speaker: 'Soumith Chintala', channel: 'The Gradient', durationMinutes: 68,
    url: 'https://www.youtube.com/watch?v=4LwaaW_pfaM', viewCount: 237, recommendation: 'Recommended',
    videoId: '4LwaaW_pfaM', focusArea: 'Other', publishedAt: '2024-03-10',
    notes: 'Canonical Gradient Podcast upload. The PyTorch creator on framework design trade-offs, open-source governance, and how tooling decisions shape research culture.',
  },

  // ─── The 80,000 Hours Podcast ──────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'AI Safety / Alignment / Oversight', keywords: 'Neel Nanda; Mechanistic Interpretability; Chain of Thought; Safety; DeepMind; Monitoring',
    title: "We Can Monitor AI’s Thoughts… For Now | Google DeepMind's Neel Nanda",
    speaker: 'Neel Nanda', channel: '80,000 Hours', format: 'Marathon Research Interview', durationMinutes: 183,
    url: 'https://www.youtube.com/watch?v=5FdO1MEumbI', viewCount: 36900, recommendation: 'Core',
    videoId: '5FdO1MEumbI', focusArea: 'Other', publishedAt: '2025-09-08',
    notes: 'Canonical 80,000 Hours upload. A three-hour technical interview with DeepMind’s mechanistic interpretability lead on what interpretability can and cannot guarantee for safety.',
  },
  {
    ...youtubeDefaults,
    domain: 'Research Practice / Career', keywords: 'Neel Nanda; Research Career; Mentorship; AI Labs; Interpretability; Advice',
    title: 'I lead a Google DeepMind team at 26. If you want to work at an AI company... | Neel Nanda (Part 2)',
    speaker: 'Neel Nanda', channel: '80,000 Hours', durationMinutes: 109,
    url: 'https://www.youtube.com/watch?v=MfMq4sVJSFc', viewCount: 157984, recommendation: 'Recommended',
    videoId: 'MfMq4sVJSFc', focusArea: 'How to Research', publishedAt: '2025-09-15',
    notes: 'Canonical 80,000 Hours upload. The companion career episode: how Nanda built a research team, what he looks for in junior researchers, and concrete advice on developing research taste.',
  },
  {
    ...youtubeDefaults,
    domain: 'AI Safety / Alignment / Oversight', keywords: 'Yoshua Bengio; Safe AI; Scientist AI; Non-agentic Systems; Guardrails; LawZero',
    title: 'Godfather of AI: How To Make Safe Superintelligent AI – Yoshua Bengio',
    speaker: 'Yoshua Bengio', channel: '80,000 Hours', durationMinutes: 155,
    url: 'https://www.youtube.com/watch?v=PZqDFs2sbiY', viewCount: 25330, recommendation: 'Core',
    videoId: 'PZqDFs2sbiY', focusArea: 'Other', publishedAt: '2026-05-07',
    notes: 'Canonical 80,000 Hours upload. Bengio presents his non-agentic “Scientist AI” research program in technical detail — the most complete long-form statement of his safety agenda.',
  },

  // ─── Y Combinator ──────────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'François Chollet; ARC-AGI; Program Synthesis; Test-Time Adaptation; Ndea; AGI',
    title: 'François Chollet: Why Scaling Alone Isn’t Enough for AGI',
    speaker: 'François Chollet', channel: 'Y Combinator', durationMinutes: 57,
    url: 'https://www.youtube.com/watch?v=k2ZLQC8P7dc', viewCount: 45491, recommendation: 'Recommended',
    videoId: 'k2ZLQC8P7dc', focusArea: 'Other', publishedAt: '2026-03-27',
    notes: 'Official Y Combinator upload. Chollet updates his abstraction-and-reasoning argument for the ARC-AGI-2 era and describes the program-synthesis research bet behind Ndea.',
  },
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Demis Hassabis; DeepMind; Agents; AGI; AI for Science; Research Strategy',
    title: 'Demis Hassabis: Agents, AGI & The Next Big Scientific Breakthrough',
    speaker: 'Demis Hassabis', channel: 'Y Combinator', durationMinutes: 41,
    url: 'https://www.youtube.com/watch?v=JNyuX1zoOgU', viewCount: 299477, recommendation: 'Recommended',
    videoId: 'JNyuX1zoOgU', focusArea: 'Other', publishedAt: '2026-04-29',
    notes: 'Official Y Combinator upload. Hassabis on agentic systems, what remains between current models and AGI, and where he expects the next AlphaFold-scale scientific result.',
  },

  // ─── Hugging Face ──────────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: 'Sara Hooker; Scaling Limits; Adaptive Compute; Efficiency; Research Labs; Cohere',
    title: 'On the slow death of Scaling (birth of Adaption Labs) | Sara Hooker | HF ML Club India EP2',
    speaker: 'Sara Hooker', channel: 'Hugging Face', durationMinutes: 60,
    url: 'https://www.youtube.com/watch?v=7knwihgj0fU', viewCount: 2598, recommendation: 'Recommended',
    videoId: '7knwihgj0fU', focusArea: 'Other', publishedAt: '2026-05-20',
    notes: 'Official Hugging Face upload. Sara Hooker argues the hardware-lottery case that brute-force scaling is hitting diminishing returns and describes the adaptive-computation research behind her new lab.',
  },
  {
    ...youtubeDefaults,
    domain: 'Computer Vision', keywords: 'Vision Language Models; Multimodal; Open Source; Smol Models; Hugging Face; Perception',
    title: 'The Future of Vision in ML | Merve Noyan | HF Podcast #1',
    speaker: 'Merve Noyan', channel: 'Hugging Face', durationMinutes: 51,
    url: 'https://www.youtube.com/watch?v=SjjCpeTjXIY', viewCount: 5474, recommendation: 'Recommended',
    videoId: 'SjjCpeTjXIY', focusArea: 'Vision', publishedAt: '2026-03-27',
    notes: 'Official Hugging Face podcast opener. A field map of open vision-language models — architectures, evaluation gaps, and where small multimodal models are heading.',
  },

  // ─── NVIDIA AI Podcast ─────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Robotics / Embodied AI', keywords: 'Deepak Pathak; Abhinav Gupta; Skild AI; Robot Foundation Models; Generalization; Embodied AI',
    title: "One Brain, Any Robot: Skild AI's Skild Brain Explained | NVIDIA AI Podcast Ep. 295",
    speaker: 'Deepak Pathak and Abhinav Gupta', channel: 'NVIDIA', durationMinutes: 30,
    url: 'https://www.youtube.com/watch?v=9YyS1R4xZ0M', viewCount: 5574, recommendation: 'Recommended',
    videoId: '9YyS1R4xZ0M', focusArea: 'Robotics', publishedAt: '2026-04-22',
    notes: 'Official NVIDIA AI Podcast episode; the guests are named in the episode description. Two leading embodied-AI researchers explain the cross-embodiment robot foundation model behind Skild Brain.',
  },

  // ─── The MAD Podcast ───────────────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'AI Frontiers / Industry', keywords: 'Thomas Wolf; Hugging Face; Open Science; Security; Open Models; Ecosystem',
    title: '“OpenAI’s Model Hacked Us” - Hugging Face’s Thomas Wolf',
    speaker: 'Thomas Wolf', channel: 'The MAD Podcast with Matt Turck', durationMinutes: 58,
    url: 'https://www.youtube.com/watch?v=FU9A481E2W8', viewCount: 6764, recommendation: 'Recommended',
    videoId: 'FU9A481E2W8', focusArea: 'Other', publishedAt: '2026-08-07',
    notes: 'Canonical MAD Podcast upload. Hugging Face’s chief scientist dissects an agentic-model security incident and makes the research case for open science in the frontier era.',
  },

  // ─── Lex Fridman Podcast (missing research-dense episodes) ─────────────
  {
    ...youtubeDefaults,
    domain: 'General AI / People', keywords: 'Yann LeCun; JEPA; World Models; Limits of LLMs; Open Source; Meta AI',
    title: 'Yann Lecun: Meta AI, Open Source, Limits of LLMs, AGI & the Future of AI | Lex Fridman Podcast #416',
    speaker: 'Yann LeCun', channel: 'Lex Fridman', durationMinutes: 167,
    url: 'https://www.youtube.com/watch?v=5t1vTLU7s40', viewCount: 1276707, recommendation: 'Core',
    videoId: '5t1vTLU7s40', focusArea: 'Other', publishedAt: '2024-03-07',
    notes: 'Canonical Lex Fridman upload. LeCun’s definitive long-form statement on why autoregressive LLMs are insufficient, the JEPA world-model program, and the case for open research.',
  },
  {
    ...youtubeDefaults,
    domain: 'Agents / Tool Use / Reasoning', keywords: 'Noam Brown; Poker; Diplomacy; Search; Strategic Reasoning; Game AI',
    title: 'Noam Brown: AI vs Humans in Poker and Games of Strategic Negotiation | Lex Fridman Podcast #344',
    speaker: 'Noam Brown', channel: 'Lex Fridman', durationMinutes: 149,
    url: 'https://www.youtube.com/watch?v=2oHH4aClJQs', viewCount: 460697, recommendation: 'Core',
    videoId: '2oHH4aClJQs', focusArea: 'Agent', publishedAt: '2022-12-06',
    notes: 'Canonical Lex Fridman upload. Two and a half hours on imperfect-information game solving, search plus learning, and Cicero-style negotiation — foundational background for reasoning-model research.',
  },

  // ─── 张小珺 Podcast (YouTube channel of 张小珺商业访谈录) ──────────────
  {
    ...youtubeDefaults,
    domain: 'Robotics', keywords: '谭捷; Gemini Robotics; 跨本体; 世界模型; Google DeepMind; 机器人基座模型',
    language: 'Chinese', format: 'Video Podcast',
    title: '121. 对DeepMind谭捷的访谈：机器人、跨本体、世界模型、Gemini Robotics 1.5和Google',
    speaker: '谭捷', channel: '张小珺 Podcast', durationMinutes: 126,
    url: 'https://www.youtube.com/watch?v=2o281Zy5aZE', viewCount: 4507, recommendation: 'Core',
    videoId: '2o281Zy5aZE', focusArea: 'Robotics', publishedAt: '2025-11-28',
    notes: 'Original Zhang Xiaojun Podcast upload. Google DeepMind robotics researcher Jie Tan on cross-embodiment learning, world models for robots, and the Gemini Robotics 1.5 stack.',
  },
  {
    ...youtubeDefaults,
    domain: 'Agents', keywords: '姚顺雨; Agent研究; ReAct; 语言智能体; OpenAI; 研究品味',
    language: 'Chinese', format: 'Video Podcast',
    title: '115. 对OpenAI姚顺雨3小时访谈：6年Agent研究、人与系统、吞噬的边界、既单极又多元的世界',
    speaker: '姚顺雨', channel: '张小珺 Podcast', durationMinutes: 152,
    url: 'https://www.youtube.com/watch?v=gQgKkUsx5q0', viewCount: 28710, recommendation: 'Core',
    videoId: 'gQgKkUsx5q0', focusArea: 'Agent', publishedAt: '2025-09-11',
    notes: 'Original Zhang Xiaojun Podcast upload. Shunyu Yao — author of ReAct, Tree of Thoughts, and SWE-bench — retraces six years of language-agent research and where the field boundary dissolves.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: '刘子鸣; 机制可解释性; KAN; AI for AI; Max Tegmark; 科学智能',
    language: 'Chinese', format: 'Video Podcast',
    title: '149. 亲历中美neo labs资本狂潮，和清华刘子鸣聊：AI for AI、机制可解释性和Max Tegmark',
    speaker: '刘子鸣', channel: '张小珺 Podcast', durationMinutes: 101,
    url: 'https://www.youtube.com/watch?v=H3Gs4QUHvA4', viewCount: 4160, recommendation: 'Recommended',
    videoId: 'H3Gs4QUHvA4', focusArea: 'Other', publishedAt: '2026-07-30',
    notes: 'Original Zhang Xiaojun Podcast upload. KAN author Ziming Liu on mechanistic interpretability, AI-for-AI research, and lessons from working with Max Tegmark.',
  },
  {
    ...youtubeDefaults,
    domain: 'Deep Learning / Research Trends', keywords: '杨松琳; 线性注意力; Kimi Linear; MiniMax M2; 架构演化; 序列建模',
    language: 'Chinese', format: 'Video Podcast',
    title: '119. Kimi Linear、Minimax M2？和杨松琳考古算法变种史，并预演未来架构改进方案',
    speaker: '杨松琳', channel: '张小珺 Podcast', durationMinutes: 103,
    url: 'https://www.youtube.com/watch?v=858HR43pegk', viewCount: 2219, recommendation: 'Recommended',
    videoId: '858HR43pegk', focusArea: 'Other', publishedAt: '2025-11-03',
    notes: 'Original Zhang Xiaojun Podcast upload. MIT researcher Songlin Yang walks through the lineage of linear-attention variants behind Kimi Linear and MiniMax M2 and sketches future architecture directions. Distinct from the earlier attention-papers read-through indexed as ST-945.',
  },

  // ─── 卫诗婕｜漫谈 Light the Star ────────────────────────────────────────
  {
    ...youtubeDefaults,
    domain: 'Robotics', keywords: '王兴兴; 宇树科技; 人形机器人; 春晚武BOT; 强化学习; 硬件',
    language: 'Chinese', format: 'Video Podcast',
    title: "A Conversation with Xingxing Wang on Unitree's Journey 除夕夜，与王兴兴的对谈：揭秘春晚《武BOT》，与宇树这一年",
    speaker: '王兴兴', channel: '卫诗婕_漫谈Light the Star', durationMinutes: 46,
    url: 'https://www.youtube.com/watch?v=-UjPHfJk96Y', viewCount: 111, recommendation: 'Recommended',
    videoId: '-UjPHfJk96Y', focusArea: 'Robotics', publishedAt: '2026-02-28',
    notes: 'Original Light the Star upload. Unitree founder Wang Xingxing on the Spring Festival Gala robot performance and the engineering trade-offs behind Unitree’s humanoid line.',
  },
  {
    ...youtubeDefaults,
    domain: 'Robotics', keywords: '姚卯青; 智元机器人; 具身智能; 数据飞轮; 人形机器人; 量产',
    language: 'Chinese', format: 'Video Podcast',
    title: '有关智元、觅蜂的愿景与野心，和具身智能的竞速之旅｜与姚卯青的对谈',
    speaker: '姚卯青', channel: '卫诗婕_漫谈Light the Star', durationMinutes: 177,
    url: 'https://www.youtube.com/watch?v=609MBVXMzWI', viewCount: 324, recommendation: 'Recommended',
    videoId: '609MBVXMzWI', focusArea: 'Robotics', publishedAt: '2026-08-02',
    notes: 'Original Light the Star upload. A nearly three-hour conversation with AgiBot’s embodied-AI lead on data engines, embodied foundation models, and the competitive landscape of Chinese humanoids.',
  },

  // ─── WhynotTV Podcast (Bilibili) ───────────────────────────────────────
  {
    ...bilibiliDefaults,
    domain: 'Robotics', keywords: '杨硕; 妙动科技; Tesla Optimus; 人形机器人; 无人机; CMU',
    title: '杨硕：妙动科技，特斯拉Optimus，CMU，大疆，无人机，人形机器人｜WhynotTV Podcast #1',
    speaker: '杨硕', channel: 'WhynotTV', durationMinutes: 90,
    url: 'https://www.bilibili.com/video/BV1em3XznEFx', viewCount: 450620, recommendation: 'Recommended',
    videoId: 'BV1em3XznEFx', focusArea: 'Robotics', publishedAt: '2025-07-05',
    notes: 'Original WhynotTV upload, episode 1. A former Tesla Optimus engineer traces the path from DJI drones to humanoid actuation and startup robotics.',
  },
  {
    ...bilibiliDefaults,
    domain: 'Computer Vision / 3D Vision', keywords: '胡渊鸣; 太极Taichi; Meshy; 图形学; 物理仿真; 3D生成',
    format: 'Marathon Research Interview',
    title: '胡渊鸣：Meshy AI，太极，MIT，清华姚班，图形学，物理仿真模拟，开源，商业化，勇气 ，智慧 ｜ WhynotTV Podcast #2',
    speaker: '胡渊鸣', channel: 'WhynotTV', durationMinutes: 184,
    url: 'https://www.bilibili.com/video/BV1XmtyzKEzQ', viewCount: 1559552, recommendation: 'Core',
    videoId: 'BV1XmtyzKEzQ', focusArea: 'Vision', publishedAt: '2025-08-08',
    notes: 'Original WhynotTV upload, episode 2. Taichi creator Yuanming Hu spends three hours on differentiable physics simulation, graphics systems research, and building Meshy for 3D generation.',
  },
  {
    ...bilibiliDefaults,
    domain: 'AI Systems / Infrastructure', keywords: '陈天奇; XGBoost; TVM; MLC LLM; 机器学习系统; 编译器',
    title: '陈天奇：机器学习系统，长期主义，初心，XGBoost，MXNet，TVM，MLC LLM，OctoML｜WhynotTV Podcast #3',
    speaker: '陈天奇', channel: 'WhynotTV', durationMinutes: 160,
    url: 'https://www.bilibili.com/video/BV1s6pgzLE3y', viewCount: 232850, recommendation: 'Core',
    videoId: 'BV1s6pgzLE3y', focusArea: 'Other', publishedAt: '2025-09-12',
    notes: 'Original WhynotTV upload, episode 3. Tianqi Chen connects XGBoost, MXNet, TVM, and MLC LLM into one long-termist account of machine-learning systems research.',
  },
  {
    ...bilibiliDefaults,
    domain: 'Deep Reinforcement Learning', keywords: '翁家翌; OpenAI; 强化学习; 后训练; Tianshou天授; Infra',
    title: '翁家翌：OpenAI，GPT，强化学习，Infra，后训练，天授，tuixue，开源，CMU，清华｜WhynotTV Podcast #4',
    speaker: '翁家翌', channel: 'WhynotTV', durationMinutes: 123,
    url: 'https://www.bilibili.com/video/BV1darmBcE4A', viewCount: 1204782, recommendation: 'Core',
    videoId: 'BV1darmBcE4A', focusArea: 'Other', publishedAt: '2026-01-17',
    notes: 'Original WhynotTV upload, episode 4. The Tianshou author and OpenAI engineer explains RL infrastructure and post-training systems for GPT-scale models from the inside.',
  },

  // ─── 十字路口｜视频播客 (Bilibili) ─────────────────────────────────────
  {
    ...bilibiliDefaults,
    domain: 'Robotics', keywords: '黄一; 萝博派对; 具身智能; 机器人创业; 融资; 硬件迭代',
    title: '【十字路口】22 岁的具身 CEO、5 轮融资、过亿美元、“不知天有多高”、“一年吃了十年的苦”｜对谈黄一：萝博派对创始人/CEO【视频播客】',
    speaker: '黄一', channel: 'Koji杨远骋at十字路口', durationMinutes: 63,
    url: 'https://www.bilibili.com/video/BV1yS8x6fEmi', viewCount: 1667, recommendation: 'Reserve',
    videoId: 'BV1yS8x6fEmi', focusArea: 'Robotics', publishedAt: '2026-08-23',
    notes: 'Original 十字路口 video-podcast upload. A young embodied-AI founder on compressing hardware iteration cycles and building a robotics company at speed; narrower than the show’s researcher episodes, kept as a Reserve entry.',
  },

  // ─── 硅基聊天室 (Bilibili) ─────────────────────────────────────────────
  {
    ...bilibiliDefaults,
    domain: 'Robotics', keywords: '硅基聊天室; 人机对谈; 具身智能; 教育; 蒋昌建; 黄执中',
    title: 'To人类老师：【我们】确实还不太行丨硅基聊天室 EP04【视频播客】',
    speaker: '蒋昌建与黄执中', channel: '硅基聊天室', durationMinutes: 56,
    url: 'https://www.bilibili.com/video/BV17Sba6cE4c', viewCount: 134249, recommendation: 'Reserve',
    videoId: 'BV17Sba6cE4c', focusArea: 'Robotics', publishedAt: '2026-08-21',
    notes: 'Official 硅基聊天室 upload, episode 4. The robot-hosted video podcast puts embodied conversational agents in a live debate on education with 蒋昌建 and 黄执中 — a human-robot interaction showcase rather than a mechanism deep-dive, kept as Reserve.',
  },
]

// Placeholder or title-fragment speaker values on existing podcast rows,
// replaced with guest names verified from the episode title or the canonical
// episode description.
const speakerFixes = {
  'ST-016': 'Jensen Huang and David Ricks',
  'ST-018': 'Andrea Thomaz',
  'ST-020': 'Satya Nadella',
  'ST-024': 'Peter Puchwein',
  'ST-028': 'Simon Last',
  'ST-031': 'Andrej Karpathy',
  'ST-033': 'Connor Leahy',
  'ST-034': 'Blaise Agüera y Arcas',
  'ST-035': 'Geoffrey Hinton',
  'ST-037': 'Karl Friston',
  'ST-038': 'Ilya Sutskever',
  'ST-039': 'Llion Jones and Luke Darlow',
  'ST-044': 'Michael I. Jordan',
  'ST-045': 'Yann LeCun',
  'ST-046': 'Jensen Huang',
  'ST-047': 'Kenneth Stanley',
  'ST-048': 'Lip-Bu Tan',
  'ST-050': 'Bryan Catanzaro',
  'ST-052': 'Alexandr Wang',
  'ST-053': 'Andrej Karpathy',
  'ST-054': 'Bill McDermott',
  'ST-055': 'Fei-Fei Li',
  'ST-056': 'Greg Brockman',
  'ST-059': 'Drago Anguelov',
  'ST-060': 'David Soria Parra and Justin Spahr-Summers',
  'ST-066': 'Manuel Haug',
  'ST-061': 'Yoshua Bengio',
  'ST-062': 'Nick Bostrom',
  'ST-064': 'Jonathan Frankle',
  'ST-065': 'Been Kim',
  'ST-069': 'Joon Sung Park',
  'ST-071': 'Jensen Huang',
  'ST-072': 'Jensen Huang',
  'ST-073': '田渊栋',
  'ST-075': '俞舟',
  'ST-226': '谢赛宁',
  'ST-227': '梅涛',
  'ST-231': '李飞飞',
  'ST-234': '张亚勤',
  'ST-235': '罗福莉',
  'ST-236': '肖弘',
  'ST-241': '肖弘',
  'ST-242': '李飞飞',
  'ST-244': '何恺明',
  'ST-245': '李飞飞',
  'ST-246': '李飞飞',
  'ST-247': '李飞飞',
  'ST-248': '朱松纯',
  'ST-249': '萨提亚·纳德拉与沈向洋',
  'ST-250': '刘擎',
  'ST-251': 'Danfei Xu',
  'ST-252': '柯丽一鸣',
  'ST-253': '黄青虬',
  'ST-254': '稚晖君与王闯',
  'ST-316': 'Peter Steinberger',
  'ST-317': 'Nathan Lambert and Sebastian Raschka',
  'ST-318': 'Ravi Shankar',
  'ST-319': 'Michele Catasta and Shunyu Yao',
  'ST-320': 'Ishan Misra',
  'ST-321': 'Jitendra Malik',
  'ST-322': 'Dmytro Mishkin',
  'ST-324': 'William Hannas and Hugh Grant-Chapman',
  'ST-325': 'Andrew Kang',
  'ST-326': 'Peter Corke, Witek Jachimczyk, and Remo Pillat',
  'ST-327': 'Jamie Palmer',
  'ST-328': 'Patricia Shaw',
}

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (resources.length < 1025) throw new Error(`Expected at least the 1,025-resource baseline; found ${resources.length}.`)

const fieldOrder = Object.keys(resources[0])

for (const [id, speaker] of Object.entries(speakerFixes)) {
  const resource = resources.find((item) => item.id === id)
  if (!resource) throw new Error(`Cannot fix the speaker of missing resource ${id}.`)
  resource.speaker = speaker
}

// Backfill series metadata on existing Interview rows for the podcast
// channels above (e.g. 张小珺 Podcast ST-942, 硅基聊天室 ST-250, the MAD
// Podcast ST-50, WhynotTV ST-251, Light the Star ST-73, Google DeepMind
// podcast conversations ST-654/ST-769, NVIDIA official interviews).
let backfilled = 0
for (const resource of resources) {
  if (resource.section !== 'Interview') continue
  const series = seriesForChannel(resource.channel)
  if (!series) continue
  const order = publishedOrder(resource.publishedAt)
  if (resource.seriesId !== series.id || resource.seriesTitle !== series.title || resource.seriesOrder !== order) {
    resource.seriesId = series.id
    resource.seriesTitle = series.title
    resource.seriesOrder = order
    backfilled += 1
  }
}

const knownUrls = new Set(resources.map((resource) => resource.url))
const knownVideoIds = new Set(resources.map((resource) => resource.videoId))
let nextIdNumber = Math.max(firstNewIdNumber - 1, ...resources.map((resource) => Number(resource.id.replace('ST-', '')) || 0)) + 1

const added = []
const skipped = []
for (const addition of additions) {
  if (knownUrls.has(addition.url) || knownVideoIds.has(addition.videoId)) {
    skipped.push(addition.videoId)
    continue
  }
  const series = seriesForChannel(addition.channel)
  const row = {
    ...addition,
    id: `ST-${nextIdNumber}`,
    seriesId: series?.id ?? '',
    seriesTitle: series?.title ?? '',
    seriesOrder: series ? publishedOrder(addition.publishedAt) : null,
  }
  const ordered = Object.fromEntries(fieldOrder.map((field) => [field, row[field]]))
  const missing = fieldOrder.filter((field) => !(field in row))
  const extra = Object.keys(row).filter((field) => !fieldOrder.includes(field))
  if (missing.length || extra.length) {
    throw new Error(`${row.id} field mismatch — missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`)
  }
  resources.push(ordered)
  knownUrls.add(row.url)
  knownVideoIds.add(row.videoId)
  added.push(row.id)
  nextIdNumber += 1
}

const csv = [fieldOrder.join(','), ...resources.map((resource) => fieldOrder.map((field) => csvCell(resource[field])).join(','))].join('\r\n')

// Recompute the report totals only for the platforms this script adds to
// (YouTube and Bilibili, whose stored statuses match the report semantics).
// Platforms the verifier cannot check (Conference Site, Official Site) keep
// their existing report entries, consistent with the preserved failures list.
const existingReport = JSON.parse(await readFile(metadataReportPath, 'utf8'))
const byPlatform = { ...existingReport.byPlatform }
for (const platform of ['YouTube', 'Bilibili']) {
  const rows = resources.filter((resource) => resource.platform === platform)
  byPlatform[platform] = {
    total: rows.length,
    verified: rows.filter((resource) => resource.metadataVerificationStatus === 'Verified').length,
    partial: rows.filter((resource) => resource.metadataVerificationStatus === 'Partial').length,
    failed: rows.filter((resource) => resource.metadataVerificationStatus === 'Failed').length,
  }
}
const platformTotals = Object.values(byPlatform)

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')
await writeFile(metadataReportPath, `${JSON.stringify({
  ...existingReport,
  verifiedOn: collectedOn,
  total: resources.length,
  verified: platformTotals.reduce((sum, entry) => sum + entry.verified, 0),
  partial: platformTotals.reduce((sum, entry) => sum + entry.partial, 0),
  failed: platformTotals.reduce((sum, entry) => sum + entry.failed, 0),
  byPlatform,
}, null, 2)}\n`, 'utf8')

console.log(JSON.stringify({
  total: resources.length,
  added: added.length,
  addedIds: added.length ? `${added[0]}…${added[added.length - 1]}` : '',
  skippedExisting: skipped.length,
  speakerFixes: Object.keys(speakerFixes).length,
  seriesBackfilled: backfilled,
}, null, 2))
