import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const auditReportPath = path.join(projectDirectory, 'data', 'math_and_researcher_curation_2026-08-17.md')
const collectedOn = '2026-08-17'

const sourceTiers = {
  official: 'A | Official / Original Creator / Organizer',
  institution: 'B | University / Conference / Institution',
  community: 'C | Community Selection',
}

const youtubeHeaders = {
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function partialYoutubeMetadata(videoId, extra = {}) {
  return {
    platform: 'YouTube',
    language: 'English',
    status: 'Verified',
    collectedOn,
    subtitleLanguages: [],
    subtitleTracks: [],
    subtitlesVerified: false,
    subtitleVerificationScope: 'YouTube player metadata exposed no public subtitle track during verification.',
    metadataVerifiedVia: 'YouTube privacy-enhanced player metadata plus the original publisher or course page',
    metadataVerificationStatus: 'Partial',
    lastVerifiedAt: collectedOn,
    lastVerificationAttemptAt: collectedOn,
    metadataVerificationError: '',
    publishedAtVerified: true,
    videoId,
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
    ...extra,
  }
}

function officialPageMetadata(extra = {}) {
  return {
    platform: 'Official Site',
    language: 'English',
    status: 'Verified',
    collectedOn,
    subtitleLanguages: [],
    subtitleTracks: [],
    subtitlesVerified: false,
    subtitleVerificationScope: 'The official page embeds the recording but does not publish subtitle-track metadata.',
    metadataVerifiedVia: 'Official publisher page and embedded YouTube player metadata',
    metadataVerificationStatus: 'Partial',
    lastVerifiedAt: collectedOn,
    lastVerificationAttemptAt: collectedOn,
    metadataVerificationError: '',
    publishedAtVerified: true,
    seriesId: '',
    seriesTitle: '',
    seriesOrder: null,
    ...extra,
  }
}

async function fetchYouTubePlayer(videoId) {
  const embedResponse = await fetch(`https://www.youtube-nocookie.com/embed/${videoId}?hl=en`, { headers: youtubeHeaders })
  if (!embedResponse.ok) throw new Error(`YouTube embed request failed for ${videoId}: ${embedResponse.status}`)
  const embedHtml = await embedResponse.text()
  const apiKey = embedHtml.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1]
  const clientVersion = embedHtml.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1]
  if (!apiKey || !clientVersion) throw new Error(`YouTube client configuration unavailable for ${videoId}`)
  const response = await fetch(`https://www.youtube-nocookie.com/youtubei/v1/player?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { ...youtubeHeaders, 'content-type': 'application/json', referer: `https://www.youtube-nocookie.com/embed/${videoId}` },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion, hl: 'en' } }, videoId }),
  })
  if (!response.ok) throw new Error(`YouTube player request failed for ${videoId}: ${response.status}`)
  const player = await response.json()
  const details = player.videoDetails
  if (!details?.lengthSeconds) throw new Error(`YouTube runtime unavailable for ${videoId}`)
  const microformat = player.microformat?.playerMicroformatRenderer
  return {
    durationMinutes: Math.max(1, Math.round(Number(details.lengthSeconds) / 60)),
    viewCount: Number(details.viewCount || 0),
    publishedAt: microformat?.publishDate || microformat?.uploadDate || '',
  }
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length)
  let next = 0
  async function worker() {
    while (next < values.length) {
      const index = next
      next += 1
      results[index] = await mapper(values[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker))
  return results
}

async function buildMitMatrixMethodsLectures() {
  const courseUrl = 'https://ocw.mit.edu/courses/18-065-matrix-methods-in-data-analysis-signal-processing-and-machine-learning-spring-2018/video_galleries/video-lectures/'
  const response = await fetch(courseUrl, { headers: youtubeHeaders })
  if (!response.ok) throw new Error(`MIT course listing failed: ${response.status}`)
  const html = await response.text()
  const pattern = /<a class="video-link" href="([^"]+)">[\s\S]*?https:\/\/img\.youtube\.com\/vi\/([\w-]{11})\/default\.jpg[\s\S]*?<h5 class="video-title">([\s\S]*?)<\/h5>/g
  const entries = [...html.matchAll(pattern)].map((match) => ({
    url: new URL(match[1], courseUrl).href,
    videoId: match[2],
    title: decodeHtml(match[3]),
  }))
  if (entries.length !== 34) throw new Error(`Expected 34 MIT 18.065 recordings, found ${entries.length}`)
  const metadata = await mapWithConcurrency(entries, 4, async (entry) => ({ ...entry, ...await fetchYouTubePlayer(entry.videoId) }))
  return metadata.map((entry) => {
    const order = Number(entry.title.match(/^Lecture\s+(\d+):/i)?.[1])
    if (!Number.isInteger(order)) throw new Error(`Could not find lecture number in ${entry.title}`)
    return {
      ...partialYoutubeMetadata(entry.videoId, {
        section: 'Course',
        focusArea: 'Other',
        domain: 'Mathematical Foundations for AI / Matrix Methods',
        keywords: 'Linear Algebra; Matrix Methods; Optimization; Probability; Statistics; Deep Learning',
        title: `MIT 18.065 — ${entry.title}`,
        speaker: 'Gilbert Strang',
        channel: 'MIT OpenCourseWare',
        format: 'University Course Lecture',
        durationMinutes: entry.durationMinutes,
        url: `https://www.youtube.com/watch?v=${entry.videoId}`,
        viewCount: entry.viewCount,
        sourceTier: sourceTiers.official,
        recommendation: 'Core',
        notes: `One of the 34 recorded lectures listed by MIT OpenCourseWare for 18.065. The official course connects linear algebra, probability/statistics, optimization, and deep learning. Canonical MIT course page: ${courseUrl}`,
        publishedAt: entry.publishedAt,
        seriesId: 'mit-18-065-matrix-methods-2018',
        seriesTitle: 'MIT 18.065 — Matrix Methods for Data Analysis, Signal Processing, and Machine Learning',
        seriesOrder: order,
      }),
    }
  })
}

const fixedAdditions = [
  {
    platform: 'Bilibili', language: 'Chinese', status: 'Verified', collectedOn,
    section: 'Talk', focusArea: 'Other', domain: 'Chinese AI Researchers / AI Futures',
    keywords: 'Artificial Intelligence; Beneficial AI; Superintelligence; AI Futures; Governance',
    title: '「湖心讲堂」图灵奖得主姚期智——人工智能的未来', speaker: '姚期智', channel: '西湖大学',
    format: 'University Public Talk', durationMinutes: 9, url: 'https://www.bilibili.com/video/BV1me4y1g7Pp',
    viewCount: 1485, sourceTier: sourceTiers.institution, recommendation: 'Recommended',
    notes: 'Official Westlake University upload. This is a concise 9:13 public segment on the future of AI, deliberately labelled Recommended rather than treated as a full-length lecture.',
    videoId: 'BV1me4y1g7Pp', publishedAt: '2022-11-29', subtitleLanguages: [], subtitleTracks: [], subtitlesVerified: false,
    subtitleVerificationScope: 'The Bilibili public view API did not enumerate a subtitle track for this one-part recording.',
    metadataVerifiedVia: 'Bilibili public view API and official Westlake University channel page', metadataVerificationStatus: 'Verified',
    lastVerifiedAt: collectedOn, lastVerificationAttemptAt: collectedOn, metadataVerificationError: '', publishedAtVerified: true,
    seriesId: '', seriesTitle: '', seriesOrder: null,
  },
  {
    platform: 'Bilibili', language: 'Chinese', status: 'Verified', collectedOn,
    section: 'Course', focusArea: 'Other', domain: 'Chinese AI Researchers / AI Strategy',
    keywords: 'Artificial Intelligence; AI Strategy; AGI; AI Education; Computer Vision',
    title: '中学生 AI 微课十讲：人工智能的现状、趋势与战略', speaker: '朱松纯', channel: '北京大学',
    format: 'University Public Lecture', durationMinutes: 53, url: 'https://www.bilibili.com/video/BV1wX4y1t7Sw',
    viewCount: 35346, sourceTier: sourceTiers.institution, recommendation: 'Core',
    notes: 'Official Peking University upload. The opening lecture frames current AI, future trajectories, strategy, and AGI for a broad audience.',
    videoId: 'BV1wX4y1t7Sw', publishedAt: '2023-06-20', subtitleLanguages: [], subtitleTracks: [], subtitlesVerified: false,
    subtitleVerificationScope: 'The Bilibili public view API did not enumerate a subtitle track for this one-part recording.',
    metadataVerifiedVia: 'Bilibili public view API and official Peking University channel page', metadataVerificationStatus: 'Verified',
    lastVerifiedAt: collectedOn, lastVerificationAttemptAt: collectedOn, metadataVerificationError: '', publishedAtVerified: true,
    seriesId: '', seriesTitle: '', seriesOrder: null,
  },
  {
    platform: 'Bilibili', language: 'Chinese', status: 'Verified', collectedOn,
    section: 'Course', focusArea: 'Other', domain: 'Machine Learning Foundations / Chinese AI Researchers',
    keywords: 'Machine Learning; Theory; Generalization; Representation Learning; Research Progress',
    title: '《机器学习进步》', speaker: '周志华', channel: 'yxl-bili',
    format: 'Authorized Multi-Part Course', durationMinutes: 380, url: 'https://www.bilibili.com/video/BV1H356zME2Z',
    viewCount: 92195, sourceTier: sourceTiers.community, recommendation: 'Core',
    notes: 'A 45-part, roughly 6h20m series whose uploader states it is uniquely authorised. It is retained as a carefully labelled community-hosted copy rather than presented as a university-owned upload.',
    videoId: 'BV1H356zME2Z', publishedAt: '2025-04-18', subtitleLanguages: [], subtitleTracks: [], subtitlesVerified: false,
    subtitleVerificationScope: '45-part course; subtitle tracks were not enumerated, so none are inferred.',
    metadataVerifiedVia: 'Bilibili public view API; uploader description reviewed for the stated authorization', metadataVerificationStatus: 'Verified',
    lastVerifiedAt: collectedOn, lastVerificationAttemptAt: collectedOn, metadataVerificationError: '', publishedAtVerified: true,
    seriesId: '', seriesTitle: '', seriesOrder: null,
  },
  {
    ...officialPageMetadata({ videoId: 'XDE9DjpcSdI' }),
    section: 'Talk', focusArea: 'Other', domain: 'AI Foundations / Deep Learning',
    keywords: 'Boltzmann Machines; Deep Learning; Neural Networks; Statistical Physics; Turing Award',
    title: 'Boltzmann Machines', speaker: 'Geoffrey Hinton', channel: 'Nobel Prize', format: 'Nobel Prize Lecture', durationMinutes: 32,
    url: 'https://www.nobelprize.org/prizes/physics/2024/hinton/lecture/', viewCount: 94710, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2025-01-31',
    notes: 'Official Nobel Prize recording of the 2024 Physics laureate’s lecture, delivered on 8 December 2024; title, embedded video, and runtime cross-checked.',
  },
  {
    ...officialPageMetadata({ videoId: '8SffhDk4mdU' }),
    section: 'Talk', focusArea: 'Other', domain: 'AI Foundations / Associative Memory',
    keywords: 'Associative Memory; Hopfield Networks; Neural Networks; Energy Landscape; Physics',
    title: 'Physics Is a Point of View', speaker: 'John J. Hopfield', channel: 'Nobel Prize', format: 'Nobel Prize Lecture', durationMinutes: 40,
    url: 'https://www.nobelprize.org/prizes/physics/2024/hopfield/lecture/', viewCount: 19821, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2025-02-09',
    notes: 'Official Nobel Prize recording of the 2024 Physics laureate’s lecture, delivered on 8 December 2024; title, embedded video, and runtime cross-checked.',
  },
  {
    ...officialPageMetadata({ videoId: 'YtPaZsasmNA', subtitleLanguages: ['English'], subtitleTracks: [{ languageCode: 'en', name: 'English (auto-generated)', automatic: true }], subtitlesVerified: true, subtitleVerificationScope: 'One auto-generated English subtitle track was exposed by the embedded YouTube player during verification.' }),
    section: 'Talk', focusArea: 'Other', domain: 'AI for Science / Protein Structure Prediction',
    keywords: 'AlphaFold; Protein Structure; AI for Science; Scientific Discovery; DeepMind',
    title: 'Accelerating Scientific Discovery with AI', speaker: 'Demis Hassabis', channel: 'Nobel Prize', format: 'Nobel Prize Lecture', durationMinutes: 29,
    url: 'https://www.nobelprize.org/prizes/chemistry/2024/hassabis/lecture/', viewCount: 201168, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2025-01-17',
    notes: 'Official Nobel Prize recording of the 2024 Chemistry laureate’s lecture; connects AI methods to scientific discovery and AlphaFold.',
  },
  {
    ...officialPageMetadata({ videoId: 'qX1aYUckvnY' }),
    section: 'Talk', focusArea: 'Other', domain: 'AI for Science / Protein Structure Prediction',
    keywords: 'AlphaFold; Protein Structure; Computational Biology; AI for Science; Deep Learning',
    title: 'Building Chemical and Biological Intuition into Protein Structure Prediction', speaker: 'John Jumper', channel: 'Nobel Prize', format: 'Nobel Prize Lecture', durationMinutes: 30,
    url: 'https://www.nobelprize.org/prizes/chemistry/2024/jumper/lecture/', viewCount: 22208, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2025-01-24',
    notes: 'Official Nobel Prize recording of the 2024 Chemistry laureate’s lecture on the design thinking behind protein structure prediction.',
  },
  {
    ...officialPageMetadata({ videoId: 'KbDvQgsOI-E' }),
    section: 'Talk', focusArea: 'Other', domain: 'AI for Science / Protein Design',
    keywords: 'Protein Design; Generative Design; AI for Science; Computational Biology; Rosetta',
    title: 'De Novo Protein Design', speaker: 'David Baker', channel: 'Nobel Prize', format: 'Nobel Prize Lecture', durationMinutes: 39,
    url: 'https://www.nobelprize.org/prizes/chemistry/2024/baker/lecture/', viewCount: 19540, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2025-02-14',
    notes: 'Official Nobel Prize recording of the 2024 Chemistry laureate’s lecture on computational protein design.',
  },
  {
    ...partialYoutubeMetadata('iNm4nFBFmvo'),
    section: 'Talk', focusArea: 'Other', domain: 'Causal Inference / AI Foundations',
    keywords: 'Causality; Causal Inference; Structural Causal Models; Counterfactuals; Turing Award',
    title: 'The Mechanization of Causal Inference', speaker: 'Judea Pearl', channel: 'Association for Computing Machinery (ACM)', format: 'Turing Award Lecture', durationMinutes: 61,
    url: 'https://www.youtube.com/watch?v=iNm4nFBFmvo', viewCount: 37708, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2013-01-29',
    notes: 'Official ACM upload of Judea Pearl’s 2012 A.M. Turing Award lecture; essential for causal reasoning and the limits of purely associational learning.',
  },
  {
    ...partialYoutubeMetadata('VsnQf7exv5I'),
    section: 'Talk', focusArea: 'Other', domain: 'AI Foundations / Deep Learning',
    keywords: 'Deep Learning; Backpropagation; Representation Learning; Neural Networks; Turing Award',
    title: 'The Deep Learning Revolution', speaker: 'Geoffrey Hinton and Yann LeCun', channel: 'Association for Computing Machinery (ACM)', format: 'Turing Award Lecture', durationMinutes: 92,
    url: 'https://www.youtube.com/watch?v=VsnQf7exv5I', viewCount: 86495, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2019-06-23',
    notes: 'Full official ACM recording of the 2018 A.M. Turing Award lecture, including both Hinton and LeCun; selected in place of short award-highlight clips.',
  },
  {
    ...partialYoutubeMetadata('SYqVKrY8XpA'),
    section: 'Talk', focusArea: 'Other', domain: 'AI Safety / Alignment / Oversight',
    keywords: 'Beneficial AI; Alignment; Control; AI Safety; Provable Guarantees',
    title: 'Provably Beneficial Artificial Intelligence', speaker: 'Stuart Russell', channel: 'ACM SIGCHI', format: 'Conference Keynote', durationMinutes: 109,
    url: 'https://www.youtube.com/watch?v=SYqVKrY8XpA', viewCount: 1076, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2022-03-26',
    notes: 'Official ACM SIGCHI recording of the IUI 2022 keynote. A long-form statement of Russell’s approach to beneficial AI and formal control objectives.',
  },
  {
    ...officialPageMetadata({ platform: 'Official Site', videoId: 'schmidhuber-ei-2013', publishedAtVerified: true }),
    section: 'Talk', focusArea: 'Other', domain: 'AI Foundations / Intrinsic Motivation',
    keywords: 'Intrinsic Motivation; Curiosity; Neural Networks; Compression Progress; Reinforcement Learning',
    title: 'Optimal AI — Neural Network ReNNaissance — Theory of Fun', speaker: 'Jürgen Schmidhuber', channel: 'Max Planck Institute for Intelligent Systems', format: 'Research Lecture', durationMinutes: 60,
    url: 'https://media.mis.mpg.de/conference-ei-2013/2013-03-01-schmidhuber/', viewCount: 0, sourceTier: sourceTiers.institution,
    recommendation: 'Core', publishedAt: '2013-03-01',
    notes: 'Direct MP4 recording hosted by the Max Planck Institute for Intelligent Systems. The conference programme scheduled this session from 09:00 to 10:00.',
  },
  {
    ...partialYoutubeMetadata('hC_qASRcBhU'),
    section: 'Talk', focusArea: 'Other', domain: 'Transformers / Foundation Models',
    keywords: 'Transformers; Attention; Foundation Models; Scaling; AI Research History',
    title: 'Transforming AI', speaker: 'Jensen Huang with Ashish Vaswani, Noam Shazeer, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, and Illia Polosukhin', channel: 'NVIDIA Developer', format: 'Conference Panel', durationMinutes: 54,
    url: 'https://www.youtube.com/watch?v=hC_qASRcBhU', viewCount: 116726, sourceTier: sourceTiers.official,
    recommendation: 'Core', publishedAt: '2024-04-08',
    notes: 'Official NVIDIA GTC 2024 panel with seven available original Transformer authors. Added as the verifiable full panel rather than relying on an unavailable individual 2017 spotlight recording.',
  },
  {
    ...partialYoutubeMetadata('9sDidkln7R0'),
    section: 'Course', focusArea: 'Other', domain: 'Mathematical Foundations for AI / Convex Optimization',
    keywords: 'Convex Optimization; Optimization; Machine Learning; CVXPY; Regularization',
    title: 'Convex Optimization Short Course — Part I', speaker: 'Stephen Boyd', channel: 'Max Planck Institute for Intelligent Systems', format: 'University Course Lecture', durationMinutes: 59,
    url: 'https://www.youtube.com/watch?v=9sDidkln7R0', viewCount: 17983, sourceTier: sourceTiers.institution,
    recommendation: 'Core', publishedAt: '2016-04-29',
    notes: 'Part I of the three-video course linked from Stephen Boyd’s Stanford course page, with slides, notebooks, and exercises.',
    seriesId: 'boyd-convex-optimization-short-course-2015', seriesTitle: 'Stanford Convex Optimization Short Course', seriesOrder: 1,
  },
  {
    ...partialYoutubeMetadata('PFVOTBQJvSE'),
    section: 'Course', focusArea: 'Other', domain: 'Mathematical Foundations for AI / Convex Optimization',
    keywords: 'Convex Optimization; Optimization; Machine Learning; CVXPY; Regularization',
    title: 'Convex Optimization Short Course — Part II', speaker: 'Stephen Boyd', channel: 'Max Planck Institute for Intelligent Systems', format: 'University Course Lecture', durationMinutes: 91,
    url: 'https://www.youtube.com/watch?v=PFVOTBQJvSE', viewCount: 7877, sourceTier: sourceTiers.institution,
    recommendation: 'Core', publishedAt: '2016-04-29',
    notes: 'Part II of the three-video course linked from Stephen Boyd’s Stanford course page, with slides, notebooks, and exercises.',
    seriesId: 'boyd-convex-optimization-short-course-2015', seriesTitle: 'Stanford Convex Optimization Short Course', seriesOrder: 2,
  },
  {
    ...partialYoutubeMetadata('IlC7WvfdByo'),
    section: 'Course', focusArea: 'Other', domain: 'Mathematical Foundations for AI / Convex Optimization',
    keywords: 'Convex Optimization; Optimization; Machine Learning; CVXPY; Regularization',
    title: 'Convex Optimization Short Course — Part III', speaker: 'Stephen Boyd', channel: 'Max Planck Institute for Intelligent Systems', format: 'University Course Lecture', durationMinutes: 87,
    url: 'https://www.youtube.com/watch?v=IlC7WvfdByo', viewCount: 5459, sourceTier: sourceTiers.institution,
    recommendation: 'Core', publishedAt: '2016-04-29',
    notes: 'Part III of the three-video course linked from Stephen Boyd’s Stanford course page, with slides, notebooks, and exercises.',
    seriesId: 'boyd-convex-optimization-short-course-2015', seriesTitle: 'Stanford Convex Optimization Short Course', seriesOrder: 3,
  },
  {
    ...partialYoutubeMetadata('pD6HHyhbGCI'),
    section: 'Course', focusArea: 'Other', domain: 'Mathematical Foundations for AI / Convex Optimization',
    keywords: 'Convex Optimization; Statistical Machine Learning; Lagrangian; Constraints; Duality',
    title: 'What Is a Convex Optimization Problem?', speaker: 'Ulrike von Luxburg', channel: 'Tübingen Machine Learning', format: 'University Course Lecture', durationMinutes: 20,
    url: 'https://www.youtube.com/watch?v=pD6HHyhbGCI&list=PL05umP7R6ij1a6KdEy8PVE9zoCv6SlHRS&index=87', viewCount: 7306, sourceTier: sourceTiers.institution,
    recommendation: 'Recommended', publishedAt: '2020-04-28',
    notes: 'Part of the University of Tübingen Mathematics for Machine Learning playlist, which also covers linear algebra, multivariate analysis, probability, and statistics.',
    seriesId: 'tuebingen-mathematics-for-ml-optimization', seriesTitle: 'University of Tübingen — Mathematics for Machine Learning (Optimization unit)', seriesOrder: 1,
  },
  {
    ...partialYoutubeMetadata('wtpHmTSLZ4c'),
    section: 'Course', focusArea: 'Other', domain: 'Mathematical Foundations for AI / Convex Optimization',
    keywords: 'Convex Optimization; Lagrangian; Duality; Statistical Machine Learning; Constraints',
    title: 'Convex Optimization, Lagrangian, Dual Problem', speaker: 'Ulrike von Luxburg', channel: 'Tübingen Machine Learning', format: 'University Course Lecture', durationMinutes: 60,
    url: 'https://www.youtube.com/watch?v=wtpHmTSLZ4c&list=PL05umP7R6ij1a6KdEy8PVE9zoCv6SlHRS&index=88', viewCount: 9770, sourceTier: sourceTiers.institution,
    recommendation: 'Recommended', publishedAt: '2020-05-10',
    notes: 'Part of the University of Tübingen Mathematics for Machine Learning playlist, which also covers linear algebra, multivariate analysis, probability, and statistics.',
    seriesId: 'tuebingen-mathematics-for-ml-optimization', seriesTitle: 'University of Tübingen — Mathematics for Machine Learning (Optimization unit)', seriesOrder: 2,
  },
]

const existingResources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (existingResources.length !== 889) throw new Error(`Expected 889 baseline resources, found ${existingResources.length}`)

const mitLectures = await buildMitMatrixMethodsLectures()
const pendingAdditions = [...fixedAdditions, ...mitLectures]
if (pendingAdditions.length !== 52) throw new Error(`Expected 52 additions, found ${pendingAdditions.length}`)

const existingIds = new Set(existingResources.map((resource) => resource.id))
const existingUrls = new Set(existingResources.map((resource) => resource.url))
const existingVideoIds = new Set(existingResources.map((resource) => resource.videoId).filter(Boolean))
for (const addition of pendingAdditions) {
  if (existingUrls.has(addition.url)) throw new Error(`Duplicate URL already exists: ${addition.url}`)
  if (addition.videoId && existingVideoIds.has(addition.videoId)) throw new Error(`Duplicate video ID already exists: ${addition.videoId}`)
  if (!addition.title || !addition.speaker || !addition.durationMinutes || !addition.url) throw new Error(`Incomplete addition: ${addition.title || addition.videoId}`)
}

const firstId = Math.max(...existingResources.map((resource) => Number(resource.id.replace(/^ST-/, '')) || 0)) + 1
const additions = pendingAdditions.map((addition, index) => ({
  id: `ST-${String(firstId + index).padStart(3, '0')}`,
  ...addition,
}))
if (additions.some((addition) => existingIds.has(addition.id))) throw new Error('Generated an existing resource id')

const resources = [...existingResources, ...additions]
const fields = Object.keys(resources[0])
const csv = [fields.join(','), ...resources.map((resource) => fields.map((field) => csvCell(resource[field])).join(','))].join('\r\n')
const byPlatform = Object.fromEntries(Object.entries(Object.groupBy(resources, (resource) => resource.platform)).map(([platform, rows]) => [platform, {
  total: rows.length,
  verified: rows.filter((resource) => resource.metadataVerificationStatus === 'Verified').length,
  partial: rows.filter((resource) => resource.metadataVerificationStatus === 'Partial').length,
  failed: rows.filter((resource) => resource.metadataVerificationStatus === 'Failed').length,
}]))

const auditReport = `# ScholarTube mathematics and researcher-talk curation — ${collectedOn}

## Result

- Baseline: ${existingResources.length} resources
- Added: ${additions.length} resources (${mitLectures.length} MIT 18.065 course lectures, 5 further mathematics-course lectures, and 13 carefully sourced researcher talks/courses)
- New total: ${resources.length} resources
- New mathematical pathway: MIT 18.065 full recorded course (matrix methods, probability/statistics, optimization, and deep learning), Stephen Boyd's convex optimization short course, and the University of Tübingen's ML optimization unit

## Curation decisions

- Included a short 9-minute Yao Qizhi segment only as **Recommended**, clearly labelled as a concise official university recording rather than a long-form lecture.
- Kept Zhou Zhihua's 45-part Bilibili course clearly marked as a community-hosted, uploader-claimed authorized copy (Tier C), not as a university source.
- Replaced short/indirect candidates with the complete 92-minute ACM Hinton–LeCun lecture and NVIDIA's official 54-minute GTC 2024 Transformer-author panel.
- Did not add the archival Ian Goodfellow NIPS tutorial because its official Channel 9 video link is no longer a usable recording, the original Attention is All You Need spotlight because it points only to a session-level Facebook video, or Dacheng Tao's ICCPS keynote because the page provides an abstract but no direct public recording.
- Did not add Qiang Yang's NeurIPS page in this batch because its static official event page did not expose a direct playable video or a defensible runtime.

## Verification basis

- MIT 18.065 titles and membership came from the official MIT OpenCourseWare Video Lectures page; video runtimes, upload dates, and view snapshots came from public YouTube player metadata.
- The Nobel lectures link to the official Nobel Prize pages that embed the verified recordings.
- ACM, NVIDIA, Max Planck, Stanford, Tübingen, Peking University, and Westlake resources are tied to their original organizer, institution, or official channel pages.
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
  failures: [],
}, null, 2)}\n`, 'utf8')
await writeFile(auditReportPath, auditReport, 'utf8')

console.log(JSON.stringify({
  baseline: existingResources.length,
  added: additions.length,
  total: resources.length,
  mathAdditions: mitLectures.length + 5,
  researcherAdditions: 13,
  firstId: additions[0].id,
  lastId: additions.at(-1).id,
}, null, 2))
