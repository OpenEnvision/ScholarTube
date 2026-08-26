import { matchesSearch } from './resource-utils'

// ---------------------------------------------------------------------------
// Concept map
//
// The nodes on the graph are topics, not resources. Each one carries the exact
// query the index will run when it is clicked, so the count on the dot and the
// result list below can never drift apart. A concept whose query finds nothing
// is dropped rather than drawn as an empty promise.
// ---------------------------------------------------------------------------

export const CONCEPT_CLUSTERS = [
  {
    id: 'Math',
    label: 'Foundations',
    focus: 'Other',
    blurb: 'The mathematics and learning theory everything else stands on.',
    concepts: [
      { id: 'linear-algebra', label: 'Linear algebra', query: 'linear algebra', blurb: 'Vectors, matrices, and the decompositions behind every model.' },
      { id: 'probability', label: 'Probability', query: 'probability', blurb: 'Distributions, inference, and uncertainty.' },
      { id: 'statistics', label: 'Statistics', query: 'statistics', blurb: 'Estimation, hypothesis testing, and reading results honestly.', after: ['probability'] },
      { id: 'bayesian', label: 'Bayesian methods', query: 'bayesian', blurb: 'Graphical models and inference that keep uncertainty explicit.', after: ['probability'] },
      { id: 'optimization', label: 'Optimization', query: 'optimization', blurb: 'Gradient descent and the machinery that fits parameters.', after: ['linear-algebra'] },
      { id: 'neural-networks', label: 'Neural networks', query: 'neural network', blurb: 'Layers, activations, and backpropagation.', after: ['linear-algebra', 'optimization'] },
      { id: 'attention', label: 'Attention', query: 'attention', blurb: 'The mechanism that lets a model choose which context to read.', after: ['neural-networks'] },
      { id: 'graph-learning', label: 'Graph learning', query: 'graph', blurb: 'Message passing over nodes and edges: learning on relations, not grids.', after: ['neural-networks'] },
      { id: 'representation', label: 'Representation learning', query: 'representation learning', blurb: 'What a model learns to encode, and why it transfers.', after: ['neural-networks'] },
      { id: 'transformers', label: 'Transformers', query: 'transformer', blurb: 'Attention stacked into the architecture under most large models.', after: ['attention'] },
    ],
  },
  {
    id: 'Agent',
    label: 'Agents & Planning',
    focus: 'Agent',
    blurb: 'Models that decide, call tools, and act over many steps.',
    concepts: [
      { id: 'foundation-models', label: 'Foundation models', query: 'foundation model', blurb: 'Large pretrained models used as a general substrate.', after: ['transformers'] },
      { id: 'llm', label: 'Large language models', query: 'llm', blurb: 'Training, prompting, and serving language models.', after: ['transformers'] },
      { id: 'reasoning', label: 'Reasoning', query: 'reasoning', blurb: 'Multi-step inference, verification, and test-time compute.', after: ['foundation-models'] },
      { id: 'post-training', label: 'Post-training', query: 'post-training', blurb: 'Instruction tuning and preference optimization: shaping a pretrained model into a useful one.', after: ['llm'] },
      { id: 'retrieval', label: 'Retrieval & RAG', query: 'rag', blurb: 'Grounding generation in retrieved sources instead of parametric memory alone.', after: ['llm'] },
      { id: 'tool-use', label: 'Tool use', query: 'tool use', blurb: 'Function calling, environments, and acting through APIs.', after: ['reasoning'] },
      { id: 'coding-agents', label: 'Coding agents', query: 'coding agent', blurb: 'Agents whose action space is writing, running, and debugging code.', after: ['tool-use'] },
      { id: 'planning', label: 'Planning', query: 'planning', blurb: 'Search, decomposition, and long-horizon task structure.', after: ['reasoning'] },
      { id: 'multi-agent', label: 'Multi-agent systems', query: 'multi-agent', blurb: 'Coordination, roles, and communication between agents.', after: ['planning'] },
      { id: 'evaluation', label: 'Evaluation', query: 'evaluation', blurb: 'Benchmarks, judges, and knowing whether it actually works.', after: ['llm'] },
      { id: 'benchmarks', label: 'Benchmark design', query: 'benchmark', blurb: 'What a benchmark measures, what it misses, and how it steers a field.', after: ['evaluation'] },
      { id: 'alignment', label: 'Alignment', query: 'alignment', blurb: 'Preference learning, oversight, and safety of capable models.', after: ['llm'] },
      { id: 'rlhf', label: 'RLHF', query: 'rlhf', blurb: 'Learning from human feedback and preference optimization.', after: ['alignment', 'post-training'] },
      { id: 'interpretability', label: 'Interpretability', query: 'interpretability', blurb: 'Opening the black box: training dynamics, circuits, and mechanistic explanation.', after: ['llm'] },
      { id: 'scaling-laws', label: 'Scaling laws', query: 'scaling law', blurb: 'How loss moves with data, parameters, and compute.', after: ['foundation-models'] },
    ],
  },
  {
    id: 'World Model',
    label: 'World Models',
    focus: 'World Model',
    blurb: 'Learned simulators that predict how a world unfolds.',
    concepts: [
      { id: 'generative', label: 'Generative models', query: 'generative', blurb: 'Learning to sample from what the data could have been.', after: ['representation'] },
      { id: 'diffusion', label: 'Diffusion models', query: 'diffusion', blurb: 'Denoising as a generative process for images and video.', after: ['generative'] },
      { id: 'video-generation', label: 'Video generation', query: 'video generation', blurb: 'Generating temporally coherent motion, not just frames.', after: ['diffusion'] },
      { id: 'world-models', label: 'World models', query: 'world model', blurb: 'Predicting dynamics well enough to plan inside the prediction.', after: ['video-generation', 'reinforcement-learning'] },
      { id: 'simulation', label: 'Learned simulation', query: 'simulation', blurb: 'Using a learned model as the simulator: closed-loop testing and synthetic experience.', after: ['world-models'] },
      { id: 'spatial', label: 'Spatial intelligence', query: 'spatial', blurb: 'Reasoning about space, layout, and physical structure.', after: ['world-models'] },
    ],
  },
  {
    id: 'Vision',
    label: 'Computer Vision',
    focus: 'Vision',
    blurb: 'Perception: from pixels to structure and meaning.',
    concepts: [
      { id: 'vision-3d', label: '3D vision', query: '3d', blurb: 'Depth, geometry, reconstruction, and neural scene representations.', after: ['representation'] },
      { id: 'splatting', label: 'Gaussian splatting', query: 'splatting', blurb: 'Explicit radiance fields fast enough to render reconstructed scenes in real time.', after: ['vision-3d'] },
      { id: 'detection', label: 'Detection', query: 'detection', blurb: 'Finding and localizing objects in a scene.', after: ['neural-networks'] },
      { id: 'segmentation', label: 'Segmentation', query: 'segmentation', blurb: 'Grouping pixels into things: masks, parts, and open-vocabulary labels.', after: ['detection'] },
      { id: 'video-understanding', label: 'Video understanding', query: 'video understanding', blurb: 'Recognition and reasoning over time: motion, events, and 4D structure.', after: ['detection'] },
      { id: 'self-supervised', label: 'Self-supervised learning', query: 'self-supervised', blurb: 'Learning visual features without labels.', after: ['representation'] },
      { id: 'multimodal', label: 'Multimodal models', query: 'multimodal', blurb: 'Models trained across images, video, audio, and text at once.', after: ['foundation-models'] },
      { id: 'vision-language', label: 'Vision–language models', query: 'vision language', blurb: 'Joint image–text models, from contrastive pretraining to instruction-following VLMs.', after: ['multimodal'] },
    ],
  },
  {
    id: 'Robotics',
    label: 'Robot Learning',
    focus: 'Robotics',
    blurb: 'Turning perception and policy into physical action.',
    concepts: [
      { id: 'reinforcement-learning', label: 'Reinforcement learning', query: 'reinforcement learning', blurb: 'Learning behaviour from reward and interaction.', after: ['optimization', 'probability'] },
      { id: 'policy', label: 'Policy learning', query: 'policy', blurb: 'The mapping from observation to action, and how it is trained.', after: ['reinforcement-learning'] },
      { id: 'imitation', label: 'Imitation learning', query: 'imitation learning', blurb: 'Learning from demonstration instead of reward.', after: ['policy'] },
      { id: 'control', label: 'Control', query: 'control', blurb: 'Classical and learned control of physical systems.', after: ['optimization'] },
      { id: 'motion-planning', label: 'Motion planning', query: 'motion planning', blurb: 'Finding feasible, safe trajectories through space.', after: ['control'] },
      { id: 'manipulation', label: 'Manipulation', query: 'manipulation', blurb: 'Grasping and dexterous interaction with objects.', after: ['imitation', 'motion-planning'] },
      { id: 'robot-learning', label: 'Robot learning', query: 'robot learning', blurb: 'End-to-end learned robots and embodied foundation models.', after: ['manipulation', 'multimodal'] },
      { id: 'vla', label: 'Vision-language-action', query: 'vla', blurb: 'Putting an action head on a vision–language model so it can drive a robot.', after: ['imitation', 'vision-language'] },
      { id: 'humanoid', label: 'Humanoid robots', query: 'humanoid', blurb: 'Whole-body control and generalist skills on human-shaped hardware.', after: ['robot-learning'] },
      { id: 'autonomous-driving', label: 'Autonomous driving', query: 'autonomous driving', blurb: 'Perception, prediction, and planning under real traffic — robotics at fleet scale.', after: ['detection', 'control'] },
    ],
  },
  {
    id: 'How to Research',
    label: 'Research Practice',
    focus: 'How to Research',
    blurb: 'The craft around the work: reading, writing, and presenting.',
    concepts: [
      { id: 'papers', label: 'Reading papers', query: 'paper', blurb: 'Getting through a paper quickly without losing the argument.' },
      { id: 'literature', label: 'Literature review', query: 'literature', blurb: 'Mapping a field before adding to it.', after: ['papers'] },
      { id: 'problem-finding', label: 'Problem finding', query: 'problem finding', blurb: 'Choosing a problem that matters before optimizing how you solve it.', after: ['literature'] },
      { id: 'research-taste', label: 'Research taste', query: 'research taste', blurb: 'The judgment for which directions and results are worth your years.', after: ['problem-finding'] },
      { id: 'writing', label: 'Scientific writing', query: 'writing', blurb: 'Saying what you did so a reader can use it.', after: ['literature'] },
      { id: 'peer-review', label: 'Peer review', query: 'peer review', blurb: 'Reviewing, rebutting, and surviving the process.', after: ['writing'] },
      { id: 'presentation', label: 'Talks & presenting', query: 'presentation', blurb: 'Delivering the work to a room.', after: ['writing'] },
      { id: 'career', label: 'Research careers', query: 'career', blurb: 'Hamming, Patterson, and honest advice on building a research life.', after: ['peer-review'] },
    ],
  },
]

// The index counts a hit anywhere in a record — including the focus area — so
// a preview ranked by popularity alone can surface a source that only matched
// on its label. Rank the preview by where the topic actually appears.
function previewRank(resource, query) {
  const words = query.toLocaleLowerCase().split(/\s+/)
  const hits = (text) => words.every((word) => (text || '').toLocaleLowerCase().includes(word))
  return (
    (hits(resource.title) ? 8 : 0) +
    (hits(resource.keywords) ? 4 : 0) +
    (hits(resource.domain) ? 3 : 0) +
    (resource.recommendation === 'Core' ? 2 : 0) +
    (resource.sourceTier?.startsWith('A') ? 1 : 0)
  )
}

export function buildConceptMap(resources) {
  const found = new Map()

  const clusters = CONCEPT_CLUSTERS.map((cluster) => {
    const concepts = cluster.concepts.map((concept) => {
      const matched = resources.filter((resource) => matchesSearch(resource, concept.query))
      const top = [...matched]
        .sort((a, b) => previewRank(b, concept.query) - previewRank(a, concept.query) || b.viewCount - a.viewCount)
        .slice(0, 3)
      return {
        ...concept,
        cluster: cluster.id,
        clusterLabel: cluster.label,
        count: matched.length,
        top,
      }
    }).filter((concept) => concept.count > 0)

    concepts.forEach((concept) => found.set(concept.id, concept))
    return {
      ...cluster,
      concepts,
      count: resources.filter((resource) => (
        cluster.focus === 'Other' ? concepts.some((concept) => matchesSearch(resource, concept.query)) : resource.focusArea === cluster.focus
      )).length,
    }
  }).filter((cluster) => cluster.concepts.length)

  // Only draw a "comes after" edge when both ends actually survived.
  const links = []
  found.forEach((concept) => {
    (concept.after || []).forEach((id) => {
      if (found.has(id)) links.push({ id: `${id}->${concept.id}`, from: id, to: concept.id })
    })
  })

  // One tier scale for the whole map, not per branch: a topic always sits
  // further out than everything it builds on, including prerequisites that
  // live in another branch. That is what lets every arrow point outward.
  const tiers = new Map()
  const tierOf = (concept, guard) => {
    if (tiers.has(concept.id)) return tiers.get(concept.id)
    if (guard.has(concept.id)) return 0
    guard.add(concept.id)
    const parents = (concept.after || []).filter((id) => found.has(id))
    const tier = parents.length ? Math.max(...parents.map((id) => tierOf(found.get(id), guard) + 1)) : 0
    tiers.set(concept.id, tier)
    return tier
  }
  found.forEach((concept) => { concept.tier = tierOf(concept, new Set()) })
  const depth = Math.max(...[...found.values()].map((concept) => concept.tier), 0)

  return { clusters, links, depth, total: resources.length }
}
