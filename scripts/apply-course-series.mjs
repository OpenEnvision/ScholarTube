import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')

function publishedYear(resource) {
  return Number(resource.publishedAt?.slice(0, 4)) || 9999
}

function publishedOrder(resource) {
  return Number(resource.publishedAt?.replaceAll('-', '')) || 99999999
}

function numberedOrder(resource) {
  const title = resource.title
  const main =
    title.match(/\b(?:lecture|lesson|week)\s*#?\s*(\d+(?:\.\d+)?)/i) ??
    title.match(/^DL1:\s*(\d+(?:\.\d+)?)/i) ??
    title.match(/coding session\s*#?\s*(\d+(?:\.\d+)?)/i) ??
    title.match(/第\s*(\d+)\s*(?:讲|课)/)
  const part = title.match(/\bpart\s*(\d+)/i)
  const base = main ? Number(main[1]) : publishedOrder(resource)
  if (/practicum/i.test(title)) return base + 0.5
  if (/zoom recording/i.test(title)) return base + 0.1
  return part && main ? base + Number(part[1]) / 10 : base
}

function orderedVideoIds(ids) {
  return new Map(ids.map((videoId, index) => [videoId, index + 1]))
}

const stanfordCs336Spring2025 = orderedVideoIds([
  'SQ3fZ1sAqXI', 'msHyYioAyNE', 'ptFiH_bHnJw', 'LPv1KfUXLCo', '6OBtO9niT00',
  'E8Mju53VB00', 'l1RJcDjzK8M', 'LHpr5ytssLo', '6Q-ESEmDf4Q', 'fcgPYo3OtV0',
  'OSYuUqGBQxw', 'x-R5l2HsXqM', 'WePxmeXU1xg', '9Cd0THLS1t0', 'Dfu7vC9jo4w',
  '46f2QTDB08Q', 'JdGFdViaOJk',
])

const berkeleyAgenticAiFall2025 = orderedVideoIds([
  'CvZDJxd4LKM', 'iDhzzugMOLA', 'ntjOxjZMaac', 'sfJM4LaiYsM', 'yqPIsTTdUkc',
  'HV8pugcFVO0', 'SrLcGdVOb9w', 'xNxrBHZPDvM', '3l0Zxus34es', 'xqRAS6rAouo',
  'r1qZpYAmqmg',
])

const ethRobotLearningSpring2026 = orderedVideoIds([
  'X0k14u6pSxw', '5-Bb84eTTqQ', 'Ef4R5s1LqoQ', '90raNpc11tQ', 'AdTGz8YnnlE',
  'qd6Ldsuu46I', 'imSTfMJjp7M', 'cTTmUZlOF2s', 'dtofzDY9zuo', 'CxhrjQuGEuE',
  'eL4lcy1KNzE',
])

const deepMindUclRl2021 = orderedVideoIds([
  'TCCjZe0y4Qc', 'aQJP3Z2Ho8U', 'zSOMeug_i_M', 'XpbLq7rIJAA', 'eaWfWoVUTEw',
  't9uf9cuogBo', 'ook46h2Jfb4', 'FKl8kM4finE', 'y3oqOjHilio', 'AJejcug2brU',
  'u84MFu1nG4g', 'cVzvNZOBaJ4', 'siDtNqlPoLk',
])

const mitUnderactuatedSpring2024 = orderedVideoIds([
  'uyyBT-MHhLE', 'l2CwE3Wf7ww', 'GPvw92IKO44', 'GElVy0WTOys', 'UBPL0IbyJy4',
  'ZBS9-4LkSIQ', 'qbuyy7ZcP9M', 'ywFpp1dy0zQ', 'e1BXMe64xJ8', 'wND0k16gCdk',
  'IQlwn9wLnJs', 'j0Phrs3ATK0', 'N37FMfOioK0', 'P64JhXLsjwY', 'LF6IkHSRtaY',
  'cRu4EqBswbk', 'mqyAs9CKVGw', 'ChiQgvVvgKM', 'Nj8FvDZ4d9I', 'QYDsB0qs_x8',
  'eEOmmpA1GAw', 'QIDisUxobFk', '5fYG1JLwBSc', 'ww1flzLixHo',
])

const courseSeriesDefinitions = [
  {
    id: 'stanford-cs229-autumn-2018',
    title: 'Stanford CS229: Machine Learning — Autumn 2018',
    test: (resource) => /stanford cs229/i.test(resource.title) && /autumn 2018/i.test(resource.title),
  },
  {
    id: 'stanford-cs234-winter-2019',
    title: 'Stanford CS234: Reinforcement Learning — Winter 2019',
    test: (resource) => /stanford cs234/i.test(resource.title) && /winter 2019/i.test(resource.title),
  },
  {
    id: 'stanford-cs234-2024',
    title: 'Stanford CS234: Reinforcement Learning — 2024',
    test: (resource) => /stanford cs234/i.test(resource.title) && /\b2024\b/i.test(resource.title),
  },
  {
    id: 'stanford-cs231n-spring-2025',
    title: 'Stanford CS231N: Deep Learning for Computer Vision — Spring 2025',
    test: (resource) => /stanford cs231n/i.test(resource.title) && /spring 2025/i.test(resource.title),
  },
  {
    id: 'stanford-cs25-transformers-united',
    title: 'Stanford CS25: Transformers United',
    test: (resource) => /stanford cs25:/i.test(resource.title),
    order: (resource) => {
      const version = Number(resource.title.match(/\bV(\d+)\b/i)?.[1] ?? 0)
      const topicOrder = /overview/i.test(resource.title)
        ? 1
        : /representation learning/i.test(resource.title)
          ? 2
          : /native multimodal/i.test(resource.title)
            ? 3
            : 0
      return version * 100 + topicOrder
    },
  },
  {
    id: 'stanford-cme295-autumn-2025',
    title: 'Stanford CME295: Transformers & LLMs — Autumn 2025',
    test: (resource) => /stanford cme295/i.test(resource.title) && /autumn 2025/i.test(resource.title),
  },
  {
    id: 'stanford-cme296-spring-2026',
    title: 'Stanford CME296: Diffusion & Large Vision Models — Spring 2026',
    test: (resource) => /stanford cme296/i.test(resource.title) && /spring 2026/i.test(resource.title),
  },
  {
    id: 'cs50-ai-python-2020',
    title: "CS50's Introduction to Artificial Intelligence with Python — 2020",
    test: (resource) => /CS50's Introduction to Artificial Intelligence with Python 2020/i.test(resource.title),
  },
  {
    id: 'mit-6s191-introduction-to-deep-learning',
    title: 'MIT 6.S191: Introduction to Deep Learning — Editions',
    test: (resource) => /6\.S191/i.test(resource.title),
    order: publishedYear,
  },
  {
    id: 'mit-6-5940-efficientml-fall-2023',
    title: 'MIT 6.5940: EfficientML.ai — Fall 2023',
    test: (resource) => /MIT 6\.5940, Fall 2023/i.test(resource.title),
  },
  {
    id: 'berkeley-cs285-fall-2020',
    title: 'UC Berkeley CS285: Deep Reinforcement Learning — Fall 2020',
    test: (resource) => resource.channel === 'RAIL' && /^CS 285:/i.test(resource.title) && publishedYear(resource) === 2020,
  },
  {
    id: 'berkeley-cs285-fall-2023',
    title: 'UC Berkeley CS285: Deep Reinforcement Learning — Fall 2023',
    test: (resource) => resource.channel === 'RAIL' && /^CS 285:/i.test(resource.title) && publishedYear(resource) === 2023,
  },
  {
    id: 'full-stack-deep-learning-2022',
    title: 'Full Stack Deep Learning — 2022',
    test: (resource) => /\(FSDL 2022\)/i.test(resource.title),
  },
  {
    id: 'nyu-deep-learning-2020',
    title: 'NYU Deep Learning — 2020',
    test: (resource) => resource.channel.startsWith('Alfredo Canziani') && publishedYear(resource) === 2020,
  },
  {
    id: 'nyu-deep-learning-2026',
    title: 'NYU Deep Learning — 2026',
    test: (resource) => resource.channel.startsWith('Alfredo Canziani') && publishedYear(resource) === 2026,
  },
  {
    id: 'cmu-11-785-fall-2025',
    title: 'CMU 11-785: Introduction to Deep Learning — Fall 2025',
    test: (resource) => /11-785/i.test(resource.title) && publishedYear(resource) === 2025,
  },
  {
    id: 'dive-into-deep-learning-2021',
    title: 'Dive into Deep Learning: Coding Sessions — 2021',
    test: (resource) => /Dive into Deep Learning: Coding Session/i.test(resource.title),
  },
  {
    id: 'dl1-deep-learning',
    title: 'DL1: Deep Learning',
    test: (resource) => resource.channel === 'Yuki Asano' && /^DL1:/i.test(resource.title),
  },
  {
    id: 'hugging-face-course-workshops',
    title: 'Hugging Face Course Workshops',
    test: (resource) => /^Hugging Face Course Workshops:/i.test(resource.title),
  },
  {
    id: 'deep-rl-marl-course',
    title: 'Deep Reinforcement Learning and Multi-Agent Reinforcement Learning',
    test: (resource) => resource.channel === '-xurunnan-',
  },
  {
    id: 'ai2-embodied-ai-lecture-series',
    title: 'Embodied AI Lecture Series at AI2',
    test: (resource) => /Embodied AI Lecture Series at AI2/i.test(resource.title),
  },
  {
    id: 'tum-ai-lecture-series',
    title: 'TUM AI Lecture Series',
    test: (resource) => /^TUM AI Lecture Series/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'openmmlab-cvpr-2021-tutorial',
    title: 'OpenMMLab Tutorial at CVPR 2021',
    test: (resource) => /2021-CVPR/i.test(resource.title) && /OpenMMLab Tutorial/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'cvpr-2018-interpretable-ml-tutorial',
    title: 'CVPR 2018 Tutorial: Interpretable Machine Learning for Computer Vision',
    test: (resource) => /^CVPR18: Tutorial: Part/i.test(resource.title),
  },
  {
    id: 'berkeley-llm-agents-mooc-fall-2024',
    title: 'UC Berkeley LLM Agents MOOC — Fall 2024',
    test: (resource) => /^LLM Agents MOOC \| UC Berkeley/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'stanford-cs336-spring-2025',
    title: 'Stanford CS336: Language Modeling from Scratch — Spring 2025',
    test: (resource) => stanfordCs336Spring2025.has(resource.videoId),
    order: (resource) => stanfordCs336Spring2025.get(resource.videoId),
  },
  {
    id: 'berkeley-agentic-ai-mooc-fall-2025',
    title: 'UC Berkeley Agentic AI MOOC — Fall 2025',
    test: (resource) => berkeleyAgenticAiFall2025.has(resource.videoId),
    order: (resource) => berkeleyAgenticAiFall2025.get(resource.videoId),
  },
  {
    id: 'eth-robot-learning-spring-2026',
    title: 'ETH Zürich Robot Learning: From Fundamentals to Foundation Models — Spring 2026',
    test: (resource) => ethRobotLearningSpring2026.has(resource.videoId),
    order: (resource) => ethRobotLearningSpring2026.get(resource.videoId),
  },
  {
    id: 'deepmind-ucl-rl-2021',
    title: 'DeepMind × UCL Reinforcement Learning Lecture Series — 2021',
    test: (resource) => deepMindUclRl2021.has(resource.videoId),
    order: (resource) => deepMindUclRl2021.get(resource.videoId),
  },
  {
    id: 'mit-6-8210-underactuated-robotics-spring-2024',
    title: 'MIT 6.8210: Underactuated Robotics — Spring 2024',
    test: (resource) => mitUnderactuatedSpring2024.has(resource.videoId),
    order: (resource) => mitUnderactuatedSpring2024.get(resource.videoId),
  },
]

const interviewSeriesDefinitions = [
  {
    id: 'lex-fridman-podcast',
    title: 'Lex Fridman Podcast',
    test: (resource) => resource.channel === 'Lex Fridman',
    order: publishedOrder,
  },
  {
    id: 'dwarkesh-patel-interviews',
    title: 'Dwarkesh Patel Interviews',
    test: (resource) => resource.channel === 'Dwarkesh Patel',
    order: publishedOrder,
  },
  {
    id: 'machine-learning-street-talk-interviews',
    title: 'Machine Learning Street Talk Interviews',
    test: (resource) => resource.channel === 'Machine Learning Street Talk',
    order: publishedOrder,
  },
  {
    id: 'robot-brains-podcast',
    title: 'The Robot Brains Podcast',
    test: (resource) => resource.channel === 'The Robot Brains Podcast',
    order: publishedOrder,
  },
  {
    id: 'no-priors-podcast',
    title: 'No Priors',
    test: (resource) => resource.channel === 'No Priors: AI, Machine Learning, Tech, & Startups',
    order: publishedOrder,
  },
  {
    id: 'twiml-ai-podcast',
    title: 'The TWIML AI Podcast',
    test: (resource) => resource.channel === 'The TWIML AI Podcast with Sam Charrington',
    order: publishedOrder,
  },
  {
    id: 'latent-space-interviews',
    title: 'Latent Space Interviews',
    test: (resource) => resource.channel === 'Latent Space',
    order: publishedOrder,
  },
  {
    id: 'weights-and-biases-interviews',
    title: 'Weights & Biases Interviews',
    test: (resource) => resource.channel === 'Weights & Biases',
    order: publishedOrder,
  },
  {
    id: 'eye-on-ai-podcast',
    title: 'Eye on AI',
    test: (resource) => resource.channel === 'Eye on AI',
    order: publishedOrder,
  },
  {
    id: 'zhang-xiaojun-business-interviews',
    title: '张小珺商业访谈录',
    test: (resource) => resource.channel === '张小珺商业访谈录',
    order: publishedOrder,
  },
  {
    id: 'wei-shijie-mantan-podcast',
    title: '卫诗婕｜漫谈播客集',
    test: (resource) => resource.channel === '卫诗婕_漫谈播客集',
    order: publishedOrder,
  },
  {
    id: 'silicon-valley-101-ai-conversations',
    title: '硅谷101｜AI Conversations',
    test: (resource) => resource.channel === '硅谷101',
    order: publishedOrder,
  },
  {
    id: 'crossroads-video-podcast',
    title: '十字路口｜视频播客',
    test: (resource) => resource.channel === 'Koji杨远骋at十字路口',
    order: publishedOrder,
  },
  {
    id: 'robot-talk-interviews',
    title: 'Robot Talk Interviews',
    test: (resource) => resource.channel === 'Robot Talk',
    order: publishedOrder,
  },
  {
    id: 'stanford-medicine-ai-life-sciences-symposium',
    title: 'Stanford Medicine AI in Life Sciences Symposium',
    test: (resource) => resource.channel === 'Stanford Medicine' && /AI in Life Sciences Symposium/i.test(resource.title),
    order: publishedOrder,
  },
]

const seriesDefinitionsBySection = {
  Course: courseSeriesDefinitions,
  Interview: interviewSeriesDefinitions,
}

const seriesDefinitions = Object.entries(seriesDefinitionsBySection).flatMap(([section, definitions]) =>
  definitions.map((definition) => ({ ...definition, section })),
)

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
const assignments = new Map()

for (const resource of resources) {
  const definitions = seriesDefinitionsBySection[resource.section] ?? []
  const matches = definitions.filter((definition) => definition.test(resource))
  if (matches.length > 1) {
    throw new Error(`${resource.id} matched multiple series: ${matches.map(({ id }) => id).join(', ')}`)
  }
  if (matches.length === 1) assignments.set(resource.id, matches[0])
}

const updated = resources.map((resource) => {
  const series = assignments.get(resource.id)
  const { seriesId: _oldId, seriesTitle: _oldTitle, seriesOrder: _oldOrder, ...base } = resource
  return {
    ...base,
    seriesId: series?.id ?? '',
    seriesTitle: series?.title ?? '',
    seriesOrder: series ? (series.order?.(resource) ?? numberedOrder(resource)) : null,
  }
})

const seriesSummary = seriesDefinitions.map((definition) => {
  const members = updated.filter((resource) => resource.seriesId === definition.id)
  if (members.length < 2) throw new Error(`${definition.id} has only ${members.length} matching resource(s)`)
  return { id: definition.id, title: definition.title, section: definition.section, resources: members.length }
})

const fields = Object.keys(updated[0])
const csv = [
  fields.join(','),
  ...updated.map((resource) => fields.map((field) => csvCell(resource[field])).join(',')),
].join('\r\n')

await writeFile(jsonPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')

console.log(JSON.stringify({
  series: seriesSummary.length,
  groupedResources: assignments.size,
  standaloneCourseResources: updated.filter((resource) => resource.section === 'Course' && !resource.seriesId).length,
  standaloneInterviewResources: updated.filter((resource) => resource.section === 'Interview' && !resource.seriesId).length,
  seriesSummary,
}, null, 2))
