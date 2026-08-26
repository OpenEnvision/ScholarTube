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

// Official Stanford Online playlist order for CS234 Spring 2024 (16 lectures,
// playlist position == lecture number). An explicit map is needed because the
// Lecture 9 guest session on DPO carries no "2024" or course-season tag in
// its title.
const stanfordCs2342024 = orderedVideoIds([
  'WsvFL-LjA6U', 'gHdsUUGcBC0', 'jjq51TRNVvk', 'b_wvosA70f8', 'L6OVEmV3NcE',
  '8PwvNQ5WS-o', '4ngb0IZTg8I', 'IEbuJtjqtMU', 'Q7rl8ovBWwQ', 'F6APGIAm5fw',
  'sqYii3nd78w', 'gFJNsfg_35E', 'pc7oayCSZmQ', 'UgANzoWc0nc', 'FOlPpjNbHjE',
  'eenJzay5aLo',
])

// Andrej Karpathy's official "Neural Networks: Zero to Hero" playlist,
// excluding the Microsoft-hosted "State of GPT" conference talk. Ordering
// stays chronological (upload order == playlist order).
const karpathyZeroToHero = new Set([
  'VMj-3S1tku0', 'PaCmpygFfXo', 'TCH_1BHY58I', 'P6sfmUTpUmc', 'q8SA3rM6ckI',
  't3YJ5hKiMQ0', 'kCc8FmEb1nY', 'zduSFxRajkE', 'l8pRSuU81PU',
])

// Official CMU 11-785 Fall 2025 lecture playlist mapped to lecture numbers.
// An explicit map is needed because several uploads drop "11-785" or
// "Fall 2025" from their titles, lectures 5, 7, 14, and 20 were never made
// public, and the duplicate re-upload of Lecture 9 (vFCeU6IhxDQ) is excluded.
const cmu11785Fall2025 = new Map(Object.entries({
  qQtfKayFdfM: 1, 'gUt3rsT5_-8': 2, j0as9k7qnck: 3, OJpR7J8MPgA: 4,
  'I3BjsU-QukA': 6, '2RdQ7kiJgIo': 8, qt5r69AIIKE: 9, oNu0KCzjc9I: 10,
  TR_ovddIwCU: 11, bPzYScY3CHM: 12, DHSQ0RYdab8: 13, j78_efCyMxU: 15,
  '1KRcs8XYUWo': 16, RMBXmlot6Jo: 17, RjI7bGMJZV0: 18, 'oB6Vbk3-Hao': 19,
  '1EoMZNywIR8': 21, '2MWWkJVF7bQ': 22, mN3c7_E524w: 23, wrwYoiqyn68: 24,
  B7hu_r3TgP0: 25, 'JVeCYzQAO-E': 26, V4coYgcdIuE: 27, WkLKBkozoII: 28,
}))

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

// Same-day event recordings need explicit program order (publishedAt ties).
const kdd2025Keynotes = orderedVideoIds([
  'd6XBrx_7rIE', '38H-GfiVHvg', 'BZMlKOICg6c', 'oKCbgurfb6M',
])

const cvpr2021VocvalcKeynotes = orderedVideoIds([
  'prC9MJNZmTI', 'RTspF8gxJDE', '6eaGjvwzCfI',
])

const ethCvgInvitedTalks2026 = orderedVideoIds([
  '72Xj8k5WQX4', 'HvDU7Vk4pbc', 'yzcokjCa18s',
])

const baaiConference2026Forums = orderedVideoIds([
  'BV16Yji65Ez1', 'BV1m7ji6sEeT', 'BV1onjq63EJ9',
])

const courseSeriesDefinitions = [
  {
    id: 'baai-conference-2026',
    title: 'Beijing Academy of Artificial Intelligence Conference — 2026',
    test: (resource) => resource.channel === '智源社区' && /2026北京智源大会/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'zhang-xiaojun-business-interviews',
    title: '张小珺商业访谈录',
    test: (resource) => resource.channel === '张小珺商业访谈录',
    order: publishedOrder,
  },
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
    test: (resource) => stanfordCs2342024.has(resource.videoId),
    order: (resource) => stanfordCs2342024.get(resource.videoId),
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
    test: (resource) => cmu11785Fall2025.has(resource.videoId),
    order: (resource) => cmu11785Fall2025.get(resource.videoId),
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
  {
    id: 'stanford-cs224n-editions',
    title: 'Stanford CS224N: NLP with Deep Learning — Editions',
    test: (resource) => /^Stanford CS224N/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'stanford-cs230-editions',
    title: 'Stanford CS230: Deep Learning — Editions',
    test: (resource) => /^Stanford CS230/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'karpathy-neural-networks-zero-to-hero',
    title: 'Andrej Karpathy: Neural Networks — Zero to Hero',
    test: (resource) => resource.channel === 'Andrej Karpathy' && karpathyZeroToHero.has(resource.videoId),
    order: publishedOrder,
  },
  {
    id: 'limu-research-advice',
    title: '跟李沐学AI：论文精读·科研经验',
    test: (resource) => resource.channel === '跟李沐学AI',
    order: publishedOrder,
  },
  {
    id: 'xiaoboshi-awake-research-methods',
    title: '小博士Awake：科研方法系列',
    test: (resource) => resource.channel === '小博士Awake',
    order: publishedOrder,
  },
  {
    id: 'aishwarya-srinivasan-agentic-ai-explainers',
    title: 'Aishwarya Srinivasan: Agentic AI Explainers',
    test: (resource) => resource.channel === 'Aishwarya Srinivasan',
    order: publishedOrder,
  },
  {
    id: 'cmu-11-785-spring-editions',
    title: 'CMU 11-785: Introduction to Deep Learning — Spring Editions',
    test: (resource) => /^11-785 Spring/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'yannic-kilcher-paper-explained',
    title: 'Yannic Kilcher: ML Research Papers Explained',
    test: (resource) => resource.channel === 'Yannic Kilcher',
    order: publishedOrder,
  },
  {
    id: 'cvpr-2021-embodied-ai-workshop',
    title: 'CVPR 2021 Embodied AI Workshop',
    test: (resource) => resource.channel === 'Embodied AI' && /CVPR 2021/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'good-citizen-cvpr-2018-research-practice',
    title: 'Good Citizen of CVPR 2018 — Research Practice Sessions',
    test: (resource) =>
      resource.channel === 'ComputerVisionFoundation Videos' && /Good Citizen of the CVPR Community/i.test(resource.title),
    order: (resource) => Number(resource.title.match(/\bPart\s*(\d+)/i)?.[1]) || publishedOrder(resource),
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
    // The same show publishes on Bilibili as 张小珺商业访谈录 and on YouTube as 张小珺 Podcast.
    test: (resource) => resource.channel === '张小珺商业访谈录' || resource.channel === '张小珺 Podcast',
    order: publishedOrder,
  },
  {
    id: 'wei-shijie-mantan-podcast',
    title: '卫诗婕｜漫谈播客集',
    // The channel was renamed from 卫诗婕_漫谈播客集 to 卫诗婕_漫谈Light the Star.
    test: (resource) => resource.channel === '卫诗婕_漫谈播客集' || resource.channel === '卫诗婕_漫谈Light the Star',
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
    id: 'sequoia-training-data',
    title: 'Training Data — Sequoia Capital',
    test: (resource) => resource.channel === 'Sequoia Capital',
    order: publishedOrder,
  },
  {
    id: 'a16z-ai-interviews',
    title: 'a16z AI Interviews',
    test: (resource) => resource.channel === 'a16z',
    order: publishedOrder,
  },
  {
    id: 'cognitive-revolution-podcast',
    title: 'The Cognitive Revolution Podcast',
    test: (resource) => resource.channel === 'Cognitive Revolution "How AI Changes Everything"',
    order: publishedOrder,
  },
  {
    id: 'google-deepmind-podcast',
    title: 'Google DeepMind: The Podcast',
    test: (resource) => resource.channel === 'Google DeepMind',
    order: publishedOrder,
  },
  {
    id: 'the-gradient-podcast',
    title: 'The Gradient Podcast',
    test: (resource) => resource.channel === 'The Gradient',
    order: publishedOrder,
  },
  {
    id: 'eighty-thousand-hours-podcast',
    title: 'The 80,000 Hours Podcast',
    test: (resource) => resource.channel === '80,000 Hours',
    order: publishedOrder,
  },
  {
    id: 'y-combinator-ai-interviews',
    title: 'Y Combinator AI Interviews',
    test: (resource) => resource.channel === 'Y Combinator',
    order: publishedOrder,
  },
  {
    id: 'hugging-face-podcast',
    title: 'Hugging Face Podcast & ML Club',
    test: (resource) => resource.channel === 'Hugging Face',
    order: publishedOrder,
  },
  {
    id: 'nvidia-ai-podcast',
    title: 'NVIDIA AI Podcast & Official Interviews',
    test: (resource) => resource.channel === 'NVIDIA',
    order: publishedOrder,
  },
  {
    // The channel label varies between episodes (e.g. a co-branded NVIDIA episode).
    id: 'mad-podcast',
    title: 'The MAD Podcast with Matt Turck',
    test: (resource) => resource.channel.startsWith('The MAD Podcast with Matt Turck'),
    order: publishedOrder,
  },
  {
    id: 'silicon-based-chatroom',
    title: '硅基聊天室',
    test: (resource) => resource.channel === '硅基聊天室',
    order: publishedOrder,
  },
  {
    id: 'whynottv-podcast',
    title: 'WhynotTV Podcast',
    test: (resource) => resource.channel === 'WhynotTV',
    order: publishedOrder,
  },
  {
    id: 'stanford-medicine-ai-life-sciences-symposium',
    title: 'Stanford Medicine AI in Life Sciences Symposium',
    test: (resource) => resource.channel === 'Stanford Medicine' && /AI in Life Sciences Symposium/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'jiqizhixin-interviews',
    title: '机器之心访谈',
    test: (resource) => resource.channel === '机器之心官方',
    order: publishedOrder,
  },
  {
    id: 'stanford-hai-conversations',
    title: 'Stanford HAI Fireside Chats & Conversations',
    test: (resource) => resource.channel === 'Stanford HAI',
    order: publishedOrder,
  },
  {
    // Interview rows on the exact 'Google DeepMind' channel belong to the
    // podcast series above; this catches co-branded channels only.
    id: 'google-deepmind-conversations',
    title: 'Google DeepMind: Conversations & Research Films',
    test: (resource) => resource.channel.startsWith('Google DeepMind') && resource.channel !== 'Google DeepMind',
    order: publishedOrder,
  },
]

const talkSeriesDefinitions = [
  {
    id: 'neurips-invited-talks',
    title: 'NeurIPS Invited Talks & Keynotes',
    test: (resource) => resource.channel === 'NeurIPS',
    order: publishedOrder,
  },
  {
    id: 'icml-invited-talks',
    title: 'ICML Invited Talks',
    test: (resource) => resource.channel === 'ICML',
    order: publishedOrder,
  },
  {
    id: 'iclr-invited-talks',
    title: 'ICLR Invited Talks & Keynotes',
    test: (resource) => resource.channel === 'ICLR',
    order: publishedOrder,
  },
  {
    id: 'cvpr-keynotes',
    title: 'CVPR Keynotes & Invited Talks',
    test: (resource) => resource.channel === 'CVPR',
    order: publishedOrder,
  },
  {
    id: 'iccv-keynotes',
    title: 'ICCV Keynotes & Invited Talks',
    test: (resource) => resource.channel === 'ICCV',
    order: publishedOrder,
  },
  {
    id: 'eccv-keynotes',
    title: 'ECCV Keynotes & Invited Talks',
    test: (resource) => resource.channel === 'ECCV',
    order: publishedOrder,
  },
  {
    id: 'mlsys-conference-talks',
    title: 'MLSys Keynotes & Invited Talks',
    test: (resource) => resource.channel === 'MLSys',
    order: publishedOrder,
  },
  {
    id: 'kdd-2025-keynotes',
    title: 'KDD 2025 Keynotes',
    test: (resource) => kdd2025Keynotes.has(resource.videoId),
    order: (resource) => kdd2025Keynotes.get(resource.videoId),
  },
  {
    id: 'acm-turing-award-lectures',
    title: 'ACM Turing Award Lectures',
    test: (resource) =>
      resource.channel === 'Association for Computing Machinery (ACM)' && resource.format === 'Turing Award Lecture',
    order: publishedOrder,
  },
  {
    id: 'nobel-prize-lectures-2024',
    title: 'Nobel Prize Lectures — 2024 Physics & Chemistry Laureates',
    test: (resource) => resource.channel === 'Nobel Prize',
    order: publishedOrder,
  },
  {
    id: 'stanford-robotics-seminar-engr319',
    title: 'Stanford Robotics Seminar (ENGR319)',
    test: (resource) => /Stanford Robotics Seminar ENGR319/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'stanford-seminar-series',
    title: 'Stanford Seminar (Stanford Online)',
    test: (resource) => resource.channel === 'Stanford Online' && /^Stanford Seminar - /i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'cmu-ri-seminar',
    title: 'CMU Robotics Institute Seminar (RI Seminar)',
    test: (resource) => resource.channel === 'CMU Robotics Institute' && /^RI Seminar/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'stanford-hai-seminar',
    title: 'Stanford HAI Seminar',
    test: (resource) => resource.channel === 'Stanford HAI' && /^HAI Seminar/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'stanford-mlsys-seminar',
    title: 'Stanford MLSys Seminar',
    test: (resource) => resource.channel === 'Stanford MLSys Seminars',
    order: (resource) => Number(resource.title.match(/Episode\s*(\d+)/i)?.[1]) || publishedOrder(resource),
  },
  {
    id: 'mit-robotics-seminar',
    title: 'MIT Robotics Seminar',
    test: (resource) => resource.channel === 'MIT Robotics',
    order: publishedOrder,
  },
  {
    id: 'mit-embodied-intelligence-seminar',
    title: 'MIT Embodied Intelligence Seminar',
    test: (resource) => resource.channel === 'MIT Embodied Intelligence',
    order: publishedOrder,
  },
  {
    id: 'cvpr-wad-keynotes',
    title: 'CVPR Workshop on Autonomous Driving — Keynotes',
    test: (resource) => resource.channel === 'WAD at CVPR',
    order: publishedOrder,
  },
  {
    id: 'valse-webinar',
    title: 'VALSE Webinar',
    test: (resource) => resource.channel === 'VALSE_Webinar',
    order: publishedOrder,
  },
  {
    id: 'baai-conference-2026',
    title: 'Beijing Academy of Artificial Intelligence Conference — 2026',
    test: (resource) => resource.channel === '智源社区' && /2026北京智源大会/i.test(resource.title),
    order: (resource) =>
      baaiConference2026Forums.has(resource.videoId)
        ? 20260619 + baaiConference2026Forums.get(resource.videoId) / 10
        : publishedOrder(resource),
  },
  {
    id: 'talks-at-google',
    title: 'Talks at Google',
    test: (resource) => resource.channel === 'Talks at Google',
    order: publishedOrder,
  },
  {
    id: 'tum-ai-lecture-series',
    title: 'TUM AI Lecture Series',
    test: (resource) => /^TUM AI Lecture Series/i.test(resource.title),
    order: publishedOrder,
  },
  {
    id: 'simon-peyton-jones-research-skills',
    title: 'Simon Peyton Jones: Research Skills Lectures (Microsoft Research)',
    test: (resource) => resource.channel === 'Microsoft Research' && resource.format === 'Research Skills Lecture',
    order: (resource) => (/write/i.test(resource.title) ? 1 : 2),
  },
  {
    id: 'agi-next-summit-2026',
    title: 'AGI Next 前沿峰会 — 2026',
    test: (resource) => resource.channel === 'AITIME论道' && /AGI[-\s]?Next 前沿峰会/i.test(resource.title),
    order: (resource) => (/杨植麟/.test(resource.title) ? 1 : 2),
  },
  {
    id: 'google-deepmind-conversations',
    title: 'Google DeepMind: Conversations & Research Films',
    test: (resource) => resource.channel.startsWith('Google DeepMind'),
    order: publishedOrder,
  },
  {
    id: 'qingke-talk',
    title: '青稞Talk',
    test: (resource) => resource.channel === '青稞社区',
    order: (resource) => Number(resource.title.match(/青稞Talk\s*(\d+)\s*期/)?.[1]) || publishedOrder(resource),
  },
  {
    id: 'prcv-conference-sessions',
    title: '中国模式识别与计算机视觉大会（PRCV）— 会议实录',
    test: (resource) => resource.channel === '人工智能前沿讲习' && /PRCV/i.test(resource.title),
    order: (resource) => publishedOrder(resource) + Number(resource.title.match(/展示(\d+)/)?.[1] ?? 0) / 10,
  },
  {
    id: 'ibm-technology-ai-explainers',
    title: 'IBM Technology: Agentic AI Explainers',
    test: (resource) => resource.channel === 'IBM Technology',
    order: publishedOrder,
  },
  {
    id: 'cvpr-2021-vocvalc-workshop',
    title: 'CVPR 2021 VOCVALC Workshop — Keynotes',
    test: (resource) => cvpr2021VocvalcKeynotes.has(resource.videoId),
    order: (resource) => cvpr2021VocvalcKeynotes.get(resource.videoId),
  },
  {
    id: 'eth-cvg-invited-talks-2026',
    title: 'ETH Zürich CVG Invited Talks — June 2026',
    test: (resource) => ethCvgInvitedTalks2026.has(resource.videoId),
    order: (resource) => ethCvgInvitedTalks2026.get(resource.videoId),
  },
  {
    id: 'icra-legged-robots-workshop',
    title: 'ICRA Workshop on Legged Robots',
    test: (resource) => resource.channel === 'Legged Robots',
    order: publishedOrder,
  },
  {
    id: 'ai3sd-seminar-series',
    title: 'AI3SD Seminar Series',
    test: (resource) => resource.channel === 'AI 4 Scientific Discovery',
    order: publishedOrder,
  },
  {
    id: 'nvidia-executive-keynotes',
    title: 'NVIDIA Executive Keynotes',
    test: (resource) => resource.channel === 'NVIDIA' && resource.format === 'Conference Keynote',
    order: publishedOrder,
  },
]

const seriesDefinitionsBySection = {
  Course: courseSeriesDefinitions,
  Interview: interviewSeriesDefinitions,
  Talk: talkSeriesDefinitions,
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
  if (!series) return resource
  const { seriesId: _oldId, seriesTitle: _oldTitle, seriesOrder: _oldOrder, ...base } = resource
  return {
    ...base,
    seriesId: series?.id ?? '',
    seriesTitle: series?.title ?? '',
    seriesOrder: series ? (series.order?.(resource) ?? numberedOrder(resource)) : null,
  }
})

// Deterministic tie-break for equal orders inside one series (common for
// multi-talk conference days): keep the first item as-is and nudge the rest by
// hundredths, in stable id order, so display order never depends on file order.
function idNumber(resource) {
  return Number(resource.id.match(/(\d+)$/)?.[1]) || 0
}

const assignedBySeries = new Map()
for (const resource of updated) {
  if (!assignments.has(resource.id)) continue
  if (!assignedBySeries.has(resource.seriesId)) assignedBySeries.set(resource.seriesId, [])
  assignedBySeries.get(resource.seriesId).push(resource)
}

for (const members of assignedBySeries.values()) {
  members.sort((a, b) => a.seriesOrder - b.seriesOrder || idNumber(a) - idNumber(b))
  let previousBase = null
  let run = 0
  for (const member of members) {
    if (member.seriesOrder === previousBase) {
      run += 1
      member.seriesOrder = Number((previousBase + run / 100).toFixed(2))
    } else {
      previousBase = member.seriesOrder
      run = 0
    }
  }
}

const seriesSummary = [...new Set(updated.map((resource) => resource.seriesId).filter(Boolean))].map((id) => {
  const members = updated.filter((resource) => resource.seriesId === id)
  if (members.length < 2) throw new Error(`${id} has only ${members.length} matching resource(s)`)
  const sections = [...new Set(members.map((resource) => resource.section))]
  return {
    id,
    title: members[0].seriesTitle,
    section: sections.length === 1 ? sections[0] : 'Mixed',
    resources: members.length,
  }
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
  standaloneTalkResources: updated.filter((resource) => resource.section === 'Talk' && !resource.seriesId).length,
  seriesSummary,
}, null, 2))
