import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Idempotent catalog hygiene: speakers, formats, domains, keywords, and
// recommendation tiers. Does not add/remove rows and never changes id / videoId / url.
// Full rationale: data/metadata_hygiene_2026-08-25.md

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')

const personStop = new Set(
  `podcast seminar keynote lecture course webinar tutorial workshop conference university
   stanford nvidia google deepmind openai microsoft institute official live full interview
   revolution breakthrough panel forum session edition introduction playlist subscribe
   presenting opening distinguished impact future understanding boring problems
   fireside chat models intelligence embodied agentic robotics vision world
   invited talk host hosted episode season winter spring autumn fall
   cvpr icml iclr neurips eccv iccv kdd waic wad refai icon scipy medai twiml
   creators the a an`.trim().split(/\s+/),
)

const knownNames = [
  'Jensen Huang', 'David Ricks', 'Andrej Karpathy', 'Ilya Sutskever', 'Fei-Fei Li',
  'Geoff Hinton', 'Geoffrey Hinton', 'Yann LeCun', 'Yoshua Bengio', 'Demis Hassabis',
  'David Silver', 'Shane Legg', 'Sergey Levine', 'Chelsea Finn', 'Pieter Abbeel',
  'Andrew Ng', 'Christopher Manning', 'Emma Brunskill', 'Percy Liang', 'Song Han',
  'Alexander Amini', 'Gilbert Strang', 'Stephen Boyd', 'Brian Yu', 'Bhiksha Raj',
  'Chip Huyen', 'Denny Zhou', 'Been Kim', 'Nick Bostrom', 'Manuela Veloso',
  'Connor Leahy', 'Greg Brockman', 'Jonathan Frankle', 'Drago Anguelov',
  'Blaise Agüera y Arcas', 'Kenneth Stanley', 'Andrea Thomaz', 'Peter Puchwein',
  'Karl Friston', 'Manuel Haug', 'Richard Liaw', 'Chaoyang He', 'Daniel Jackson',
  'Jason Ma', 'Adrien Gaidon', 'Philipp Krähenbühl', 'Deva Ramanan', 'Deepak Pathak',
  'Rachel Thomas', 'Ray Kurzweil', 'Rosalind Picard', 'Michael Bronstein',
  'Alejandro Saucedo', 'Pierre-Yves Oudeyer', 'Richard Zhang', 'Viraj Prabhu',
  'Raquel Urtasun', 'Matthias Niessner', 'Ruqi Zhang', 'Tony Hey', 'Graeme Day',
  'Kai Chen', 'Alan Yuille', 'Kaiming He', 'Satya Nadella', 'Yannic Kilcher',
  'Simon Peyton Jones', 'Philipp Hennig', 'Afshine Amidi', 'Sergey Karayev',
  'Tian Yuandong', 'Yuandong Tian', 'Danfei Xu', 'Ravi Shankar', 'Hyungjin Chung',
  'Julia Wolleb', 'Tiange Xiang',
  '李飞飞', '何恺明', '谢赛宁', '罗福莉', '肖弘', '张亚勤', '朱松纯', '沈向洋',
  '梅涛', '黄青虬', '田渊栋', '柯丽一鸣', '稚晖君', '萨提亚·纳德拉', '姚期智',
  '俞舟', '张伟楠', '鲁鹏', '牛建伟', '李沐',
]

const bilingualPairs = [
  ['Tian Yuandong', '田渊栋'],
  ['Yuandong Tian', '田渊栋'],
  ['Fei-Fei Li', '李飞飞'],
  ['Kaiming He', '何恺明'],
  ['Satya Nadella', '萨提亚·纳德拉'],
]

const seriesInstructors = {
  'stanford-cs229-autumn-2018': 'Andrew Ng',
  'stanford-cs229-spring-2026': 'Andrew Ng',
  'stanford-cs231n-spring-2025': 'Fei-Fei Li',
  'stanford-cs224n-editions': 'Christopher Manning',
  'stanford-cs234-winter-2019': 'Emma Brunskill',
  'stanford-cs234-2024': 'Emma Brunskill',
  'stanford-cs230-editions': 'Andrew Ng',
  'stanford-cs221-autumn-2025': 'Percy Liang',
  'cs50-ai-python-2020': 'Brian Yu',
  'mit-18-065-matrix-methods-2018': 'Gilbert Strang',
  'karpathy-neural-networks-zero-to-hero': 'Andrej Karpathy',
  'boyd-convex-optimization-short-course-2015': 'Stephen Boyd',
  'mit-6s191-introduction-to-deep-learning': 'Alexander Amini',
  'mit-6-5940-efficientml-fall-2023': 'Song Han',
  'berkeley-cs285-fall-2020': 'Sergey Levine',
  'berkeley-cs285-fall-2023': 'Sergey Levine',
  'nyu-deep-learning-2020': 'Yann LeCun',
  'nyu-deep-learning-2026': 'Yann LeCun',
  'cmu-11-785-spring-editions': 'Bhiksha Raj',
  'cmu-11-785-fall-2025': 'Bhiksha Raj',
  'full-stack-deep-learning-2022': 'Sergey Karayev',
  'stanford-cme295-autumn-2025': 'Afshine Amidi',
  'stanford-cme296-spring-2026': 'Afshine Amidi',
  'yannic-kilcher-paper-explained': 'Yannic Kilcher',
  'simon-peyton-jones-research-skills': 'Simon Peyton Jones',
  'tuebingen-mathematics-for-ml-optimization': 'Philipp Hennig',
  'limu-research-advice': '李沐',
}

const formatMap = {
  'Course Lecture': 'Course Lecture',
  'University Course Lecture': 'Course Lecture',
  'Graduate Course Lecture': 'Course Lecture',
  'University Lecture': 'Course Lecture',
  'University Video Course': 'Course Lecture',
  'Course / Tutorial': 'Course Tutorial',
  'Open Course / Tutorial': 'Course Tutorial',
  'Hands-on Tutorial': 'Course Tutorial',
  'Technical Tutorial': 'Course Tutorial',
  'Conference Tutorial': 'Course Tutorial',
  'Practical Tutorial': 'Course Tutorial',
  'Research Skills Tutorial': 'Course Tutorial',
  'Library Research Tutorial': 'Course Tutorial',
  'Specialized Course': 'Specialized Course',
  'Course Series': 'Specialized Course',
  'Full Course / Tutorial Series': 'Specialized Course',
  'Modular Online Course': 'Specialized Course',
  'Authorized Multi-Part Course': 'Specialized Course',
  'Conference Keynote': 'Conference Keynote',
  'Technical Keynote': 'Conference Keynote',
  'Research Keynote': 'Conference Keynote',
  'Executive Talk': 'Conference Keynote',
  'Technical and Strategy Talk': 'Conference Keynote',
  'Product and Technical Launch': 'Conference Keynote',
  'Research Seminar': 'Research Seminar',
  'Academic Talk / Research Seminar': 'Research Seminar',
  'Academic Talk': 'Research Talk',
  'Research Talk': 'Research Talk',
  'Technical Talk': 'Research Talk',
  'Invited Talk': 'Research Talk',
  'Conference Talk / Forum': 'Research Talk',
  'Conference Talk': 'Research Talk',
  'Engineering Talk': 'Research Talk',
  'Research Lecture': 'Research Talk',
  'Research Skills Lecture': 'Research Talk',
  'Archival Research Lecture': 'Research Talk',
  'Research Career Talk': 'Research Talk',
  'Research Career Lecture': 'Research Talk',
  'Test of Time Talk': 'Research Talk',
  'Workshop Invited Talk': 'Workshop Talk',
  'Conference Workshop': 'Workshop Talk',
  'University Public Talk': 'Public Lecture',
  'University Public Lecture': 'Public Lecture',
  'Public Lecture': 'Public Lecture',
  'Scientific Communication Lecture': 'Public Lecture',
  'Panel Discussion': 'Panel Discussion',
  'Conference Panel': 'Panel Discussion',
  'Executive Panel': 'Panel Discussion',
  'Nobel Prize Lecture': 'Nobel Prize Lecture',
  'Turing Award Lecture': 'Turing Award Lecture',
  'In-depth Interview': 'In-depth Interview',
  'Research Interview': 'In-depth Interview',
  'Long-form Video Interview': 'In-depth Interview',
  'Technical Interview': 'In-depth Interview',
  'Early Team Interview': 'In-depth Interview',
  'Interview Adaptation': 'In-depth Interview',
  'Broadcast Interview': 'In-depth Interview',
  'Marathon Research Interview': 'In-depth Interview',
  'Profile Interview': 'Profile Interview',
  'Podcast Interview': 'Podcast Interview',
  'Video Podcast': 'Podcast Interview',
  'Fireside Chat': 'Fireside Chat',
  'Course Tutorial': 'Course Tutorial',
  'Workshop Talk': 'Workshop Talk',
}

const domainMap = {
  Robotics: 'Robotics / Embodied AI',
  Vision: 'Computer Vision',
  Agents: 'Agents / Tool Use / Reasoning',
  'World Models': 'World Models / Predictive Intelligence',
  'AI Foundations': 'Artificial Intelligence Foundations',
  'Deep Learning / Research Trends': 'AI Research Frontiers',
  'Machine Learning Frontiers': 'AI Research Frontiers',
  'AI Frontiers / Industry': 'AI Industry / Startups',
  'Chinese AI Researchers / Industry': 'Chinese AI Researchers',
  'Chinese AI Researchers / AI Futures': 'Chinese AI Researchers',
  'Chinese AI Researchers / AI Strategy': 'Chinese AI Researchers',
  'Machine Learning Foundations / Chinese AI Researchers': 'Machine Learning Foundations',
  'AI Foundations / Deep Learning': 'Deep Learning Foundations',
  'Computer Vision / Object Detection': 'Computer Vision',
  'AI Research / Research Process': 'Research Practice / Problem Selection',
  'AI Research / Research Practice': 'Research Practice / Problem Selection',
}

const alwaysCoreIds = new Set([
  'ST-001', 'ST-008', 'ST-083', 'ST-175', 'ST-942',
  'ST-890',
])

const flagshipSpeaker = /karpathy|hinton|lecun|lecun|hassabis|andrew ng|jensen huang|fei-fei|sutskever|bengio|ilya|李飞飞|谢赛宁|姚期智|hamming|peyton jones|geoffrey|yann lecun|demis/i

const industryDomain = /industry|startup|people|general ai \/ people/i

const particle = /^(?:van|von|de|da|di|del|della|der|den|y|la|le|bin|al)$/i
const given = /^(?:Prof\.?|Dr\.?|Sir|Ms\.?|Mr\.?|Mrs\.?)$/i
const orgChannel = /社区|官方|大学|大会|频道|实验室|程序员|institute|university|official|labs?|seminar|podcast|studio|news|tv\b/i

function titleCaseCaps(name) {
  return name.replace(/\b([A-Z])([A-Z]+)\b/g, (_, a, b) => (b.length <= 1 ? a + b : a + b.toLowerCase()))
}

function looksLikePerson(value) {
  const name = (value || '').trim().replace(/\s+/g, ' ')
  if (!name || name.length < 4 || name.length > 64) return false
  if (/[0-9/#]/.test(name)) return false
  if (/[|:]/.test(name)) return false
  if (/[\u4e00-\u9fff]/.test(name)) {
    if (orgChannel.test(name)) return false
    return /^[\u4e00-\u9fff·]{2,4}$/.test(name) || /^[\u4e00-\u9fff]{1,3}·[\u4e00-\u9fff]{1,4}$/.test(name)
  }
  const words = name.replace(/,/g, ' ').split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 6) return false
  for (const word of words) {
    const token = word.replace(/[.'’]/g, '')
    if (given.test(word) || particle.test(word)) continue
    if (personStop.has(token.toLowerCase())) return false
    if (!/^[A-ZÀ-Ÿ][a-zà-ÿA-ZÀ-ÿ'’.-]+$/.test(word) && !/^[A-Z]\.$/.test(word)) return false
  }
  return true
}

function cleanPerson(value) {
  return titleCaseCaps(
    value
      .replace(/\s*\([^)]{0,80}\)\s*/g, ' ')
      .replace(/^Prof\.?\s+/i, '')
      .replace(/\s*[,，]\s*(?:Ph\.?D\.?|Professor|Prof\.?).*$/i, '')
      .replace(/\s+of\s+[A-Z].*$/, '')
      .replace(/\s*[-–—]\s*(?:TWiML Talk.*|#\d+.*|INTELLIGENCE.*)$/i, '')
      .replace(/\s*#\d+\s*$/, '')
      .replace(/\s*\d+\s*期$/, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

function hostStripped(text) {
  return (text || '').replace(/\(Host(?:ed)?(?:\s*by)?:[^)]+\)/gi, ' ').replace(/Host(?:ed)? by [^|]+/gi, ' ')
}

function dedupeBilingual(hits, language) {
  const names = [...hits]
  for (const [en, zh] of bilingualPairs) {
    if (names.includes(en) && names.includes(zh)) {
      const drop = language === 'Chinese' ? en : zh
      return names.filter((name) => name !== drop)
    }
  }
  return names
}

function knownFrom(text, language) {
  if (!text) return null
  const haystack = hostStripped(text)
  const hits = dedupeBilingual(
    knownNames.filter((name) => haystack.includes(name)),
    language,
  )
  if (hits.length === 1) return hits[0]
  if (hits.length === 2 && /&| and |与/.test(haystack)) return hits.join(' & ')
  if (hits.length > 1) return [...hits].sort((a, b) => b.length - a.length)[0]
  return null
}

function fromTitle(title, channel, language) {
  if (!title) return null
  const known = knownFrom(title, language)
  if (known) return known

  const chinese =
    title.match(/与\s*([\u4e00-\u9fff·]{2,8})(?:院士)?的/) ||
    title.match(/对\s*([\u4e00-\u9fff·]{2,8})的/) ||
    title.match(/([\u4e00-\u9fff]{2,4})教授访谈/) ||
    title.match(/图灵奖得主([\u4e00-\u9fff]{2,4})/) ||
    title.match(/对话(?:人工智能专家)?([\u4e00-\u9fff·]{2,8})/) ||
    title.match(/创始人([\u4e00-\u9fff]{2,4})/)
  if (chinese && looksLikePerson(chinese[1])) return chinese[1]

  const speakerLabel = title.match(/Speaker[：:]\s*([A-Za-z][^|（(]+)/i)
  if (speakerLabel && looksLikePerson(cleanPerson(speakerLabel[1]))) return cleanPerson(speakerLabel[1])

  const ri = title.match(/RI Seminar:\s*([A-Za-z][^:|]+)\s*:/i)
  if (ri && looksLikePerson(cleanPerson(ri[1]))) return cleanPerson(ri[1])

  const keynote = title.match(/Keynote\s*[-–—:]\s*([A-Za-z][^,|[0-9]+)/i)
  if (keynote && looksLikePerson(cleanPerson(keynote[1]))) return cleanPerson(keynote[1])

  const episode = title.match(/(?:Season\s*\d+\s*Ep\.?\s*\d+|S\d+\s*E\d+)\s+(?:OpenAI'?s\s+)?([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,4})/)
  if (episode && looksLikePerson(cleanPerson(episode[1]))) return cleanPerson(episode[1])

  const epColon = title.match(/Episode\s+\d+:\s*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,4})/i)
  if (epColon && looksLikePerson(cleanPerson(epColon[1]))) return cleanPerson(epColon[1])

  const feat = title.match(/\bfeat\.?\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,4})/i)
  if (feat && looksLikePerson(cleanPerson(feat[1]))) return cleanPerson(feat[1])

  const ei = title.match(/EI Seminar\s*[-–—]\s*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})/i)
  if (ei && looksLikePerson(cleanPerson(ei[1]))) return cleanPerson(ei[1])

  const withName = title.match(/\bw\/\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,4})/i)
  if (withName && looksLikePerson(cleanPerson(withName[1]))) return cleanPerson(withName[1])

  const ofName = title.match(/^([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){1,4})\s+of\s+/)
  if (ofName && looksLikePerson(cleanPerson(ofName[1]))) return cleanPerson(ofName[1])

  const pipes = title.split('|').map((part) => part.trim()).filter(Boolean)
  if (pipes.length >= 2) {
    const last = cleanPerson(pipes[pipes.length - 1].replace(/^Host(?:ed)? by\s+/i, ''))
    if (looksLikePerson(last) && last.toLowerCase() !== (channel || '').toLowerCase()) return last
  }

  const bracket = title.match(/\[([A-Za-zÀ-ÿ][^\]|]{2,50})\]/)
  if (bracket && looksLikePerson(cleanPerson(bracket[1]))) return cleanPerson(bracket[1])

  const onTalk = title.match(/^((?:NVIDIA(?:’s|\'s)\s+)?[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){1,4})\s+on\s+/)
  if (onTalk) {
    const cleaned = cleanPerson(onTalk[1].replace(/^NVIDIA(?:’s|\'s)\s+/i, ''))
    if (looksLikePerson(cleaned)) return cleaned
  }

  const leading = title.match(/^([A-Z][a-zÀ-ÿ.'-]+(?:\s+[A-Z][a-zÀ-ÿ.'-]+){1,3})\s+(?:Unveils|Discusses|Explains|Shows)\b/)
  if (leading && looksLikePerson(leading[1])) return leading[1]

  const dashCaps = title.match(/^([A-Z][A-Z .'-]{4,40})\s+[-–—]/)
  if (dashCaps) {
    const cleaned = cleanPerson(dashCaps[1])
    if (looksLikePerson(cleaned)) return cleaned
  }

  const seriesName = title.match(/Lecture Series:\s*([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){1,3})\s+[-–—]/)
  if (seriesName && looksLikePerson(seriesName[1])) return seriesName[1]

  const trailing = title.match(/[-–—:]\s*((?:Dr|Professor|Prof\.?)\s+[A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){0,3})\s*$/)
  if (trailing && looksLikePerson(cleanPerson(trailing[1]))) return cleanPerson(trailing[1])

  const keynoteEnd = title.match(/Keynote\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+){1,3})\s*$/i)
  if (keynoteEnd && looksLikePerson(cleanPerson(keynoteEnd[1]))) return cleanPerson(keynoteEnd[1])

  const paren = title.match(/([A-Z][a-zA-ZÀ-ÿ.'-]+(?:\s+[A-Z][a-zA-ZÀ-ÿ.'-]+){1,3})\s*\((?:Purdue|MIT|CMU|Google|DeepMind|OpenAI|Stanford)/)
  if (paren && looksLikePerson(paren[1])) return paren[1]

  const leadingZhEn = title.match(/^([A-Z][a-zA-ZÀ-ÿ.'-]+(?:\s+[A-Z][a-zA-ZÀ-ÿ.'-]+){0,3})\s*[：:]/)
  if (leadingZhEn && looksLikePerson(leadingZhEn[1])) return leadingZhEn[1]

  return null
}

function channelAsPerson(channel) {
  if (!channel || orgChannel.test(channel)) return null
  const strippedOrg = channel.replace(/SJTU|MIT|CMU|ETH|NPR|PBS/g, '').trim()
  const cjkLead = strippedOrg.match(/^([\u4e00-\u9fff]{2,4})/)
  if (cjkLead && looksLikePerson(cjkLead[1])) return cjkLead[1]
  const cleaned = cleanPerson(channel.split('(')[0])
  return looksLikePerson(cleaned) ? cleaned : null
}

function isJunkSpeaker(value) {
  const speaker = (value || '').trim()
  if (!speaker || speaker === 'To be added') return true
  if (/^MedAI\s*#\d+$/i.test(speaker)) return true
  if (/(?:TWiML Talk|#)\s*\d+$/i.test(speaker)) return true
  if (/Talk\s*\d+期/.test(speaker) || /^\d+\s*期$/.test(speaker)) return true
  if (/^20\d{2}$/.test(speaker) || /^20\d{2}-[A-Z]/.test(speaker)) return true
  if (/^(中字|Talk|Graphs|Fireside Chat)$/i.test(speaker)) return true
  return false
}

function recoverSpeaker(resource) {
  const current = (resource.speaker || '').trim()
  // Existing editorial speaker strings are kept unless they are placeholder/junk.
  if (!isJunkSpeaker(current)) {
    const stripped = cleanPerson(current)
    if (looksLikePerson(stripped) && /(?:TWiML Talk|#)\s*\d+|Talk\s*\d+期/.test(current)) return stripped
    return current
  }
  return (
    fromTitle(resource.title, resource.channel, resource.language) ||
    channelAsPerson(resource.channel) ||
    (resource.seriesId && seriesInstructors[resource.seriesId]) ||
    'To be added'
  )
}

function normalizeKeywords(value) {
  const seen = new Set()
  return String(value || '')
    .split(/[;/／,，、]+/)
    .flatMap((part) => part.split(/\s+\/\s+/))
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 6)
    .join('; ')
}

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item)).join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))

const stats = {
  speakerFilled: 0,
  speakerCleaned: 0,
  speakerStillTba: 0,
  formatChanged: 0,
  domainChanged: 0,
  keywordsChanged: 0,
  tierDemoted: 0,
  unmappedFormats: {},
}

for (const resource of resources) {
  const previousSpeaker = resource.speaker
  const nextSpeaker = recoverSpeaker(resource)
  if (nextSpeaker !== previousSpeaker) {
    if (previousSpeaker === 'To be added' && nextSpeaker !== 'To be added') stats.speakerFilled += 1
    else stats.speakerCleaned += 1
    resource.speaker = nextSpeaker
  }
  if (resource.speaker === 'To be added') stats.speakerStillTba += 1

  const nextFormat = formatMap[resource.format]
  if (!nextFormat) {
    stats.unmappedFormats[resource.format] = (stats.unmappedFormats[resource.format] || 0) + 1
  } else if (nextFormat !== resource.format) {
    resource.format = nextFormat
    stats.formatChanged += 1
  }

  const nextDomain = domainMap[resource.domain]
  if (nextDomain && nextDomain !== resource.domain) {
    resource.domain = nextDomain
    stats.domainChanged += 1
  }

  const nextKeywords = normalizeKeywords(resource.keywords)
  if (nextKeywords && nextKeywords !== resource.keywords) {
    resource.keywords = nextKeywords
    stats.keywordsChanged += 1
  }
}

const courseSeries = new Map()
for (const resource of resources) {
  if (resource.section !== 'Course' || !resource.seriesId) continue
  if (!courseSeries.has(resource.seriesId)) courseSeries.set(resource.seriesId, [])
  courseSeries.get(resource.seriesId).push(resource)
}

const courseCoreKeep = new Set(alwaysCoreIds)
for (const members of courseSeries.values()) {
  if (members.length < 4) {
    for (const resource of members) {
      if (resource.recommendation === 'Core') courseCoreKeep.add(resource.id)
    }
    continue
  }
  const ordered = [...members].sort((a, b) => (a.seriesOrder ?? 9999) - (b.seriesOrder ?? 9999) || a.id.localeCompare(b.id))
  for (const resource of ordered.slice(0, 2)) courseCoreKeep.add(resource.id)
}

for (const resource of resources) {
  if (alwaysCoreIds.has(resource.id)) {
    if (resource.recommendation !== 'Core') resource.recommendation = 'Core'
    continue
  }
  if (resource.recommendation !== 'Core') continue

  let next = resource.recommendation
  if (resource.section === 'Course' && resource.seriesId && !courseCoreKeep.has(resource.id)) {
    next = 'Recommended'
  } else if (String(resource.sourceTier || '').startsWith('C')) {
    next = industryDomain.test(resource.domain || '') ? 'Reserve' : 'Recommended'
  } else if (
    resource.focusArea === 'Other' &&
    resource.section === 'Interview' &&
    (resource.format === 'Profile Interview' || industryDomain.test(resource.domain || '')) &&
    !flagshipSpeaker.test(`${resource.speaker} ${resource.title}`)
  ) {
    next = 'Recommended'
  }

  if (next !== resource.recommendation) {
    resource.recommendation = next
    stats.tierDemoted += 1
  }
}

const fields = Object.keys(resources[0])
const csv = [
  fields.join(','),
  ...resources.map((resource) => fields.map((field) => csvCell(resource[field])).join(',')),
].join('\r\n')

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')

const rec = resources.reduce((counts, resource) => {
  counts[resource.recommendation] = (counts[resource.recommendation] || 0) + 1
  return counts
}, {})
const formats = new Set(resources.map((resource) => resource.format)).size
const domains = new Set(resources.map((resource) => resource.domain)).size
const coreByFocus = {}
for (const resource of resources) {
  const key = resource.focusArea
  coreByFocus[key] ??= { core: 0, n: 0 }
  coreByFocus[key].n += 1
  if (resource.recommendation === 'Core') coreByFocus[key].core += 1
}

console.log(JSON.stringify({
  ...stats,
  recommendation: rec,
  formatCardinality: formats,
  domainCardinality: domains,
  corePercent: Number(((rec.Core / resources.length) * 100).toFixed(1)),
  coreByFocus: Object.fromEntries(
    Object.entries(coreByFocus).map(([key, value]) => [key, `${value.core}/${value.n} (${((value.core / value.n) * 100).toFixed(1)}%)`]),
  ),
  unmappedFormats: stats.unmappedFormats,
}, null, 2))
