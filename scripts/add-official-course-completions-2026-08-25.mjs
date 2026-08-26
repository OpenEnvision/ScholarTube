import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Completes incomplete official course series already in the ScholarTube
// catalog (Stanford CS234 2024, MIT 6.5940 EfficientML.ai Fall 2023, CS50 AI
// with Python 2020, Full Stack Deep Learning 2022, Karpathy Neural Networks:
// Zero to Hero, MIT 6.S191 editions, NYU Deep Learning 2026, and CMU 11-785
// Fall 2025). Every row was verified against public metadata on 2026-08-25:
// the official course playlist inventory (membership, order, exact runtime),
// the public YouTube watch-page data (exact title, channel, view count, and
// publish date), and YouTube oEmbed where embedding is enabled. Durations,
// dates, and view counts are recorded values, never invented. IDs are pinned
// to the ST-1200+ block so this expansion can be unioned with sibling
// expansions (ST-1027+) without collisions. The script is idempotent: rows
// whose id, videoId, or URL already exist in the catalog are skipped, so a
// second run adds nothing. Run `npm run series:apply` and `npm run
// notes:apply` afterwards so new rows receive final series placement and
// generated editorial notes.
//
// Full audit (per-series before/after, skip list, verification method, merge
// recipe): data/official_course_completions_2026-08-25.md

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const collectedOn = '2026-08-25'

const tierA = 'A | Official / Original Creator / Organizer'
const playlistAndWatchPage =
  'YouTube oEmbed, public watch-page metadata, and the official course playlist inventory'
const watchPageOnly =
  'Public YouTube watch-page metadata and the official course playlist inventory (embedding is disabled for this video, so oEmbed is unavailable)'

const seriesDefaults = {
  cs234: {
    seriesId: 'stanford-cs234-2024',
    seriesTitle: 'Stanford CS234: Reinforcement Learning — 2024',
    channel: 'Stanford Online',
    speaker: 'Emma Brunskill',
    domain: 'Reinforcement Learning',
    metadataVerifiedVia: watchPageOnly,
  },
  effml: {
    seriesId: 'mit-6-5940-efficientml-fall-2023',
    seriesTitle: 'MIT 6.5940: EfficientML.ai — Fall 2023',
    channel: 'MIT HAN Lab',
    speaker: 'Song Han',
    domain: 'Efficient Deep Learning / AI Systems',
  },
  cs50: {
    seriesId: 'cs50-ai-python-2020',
    seriesTitle: "CS50's Introduction to Artificial Intelligence with Python — 2020",
    channel: 'CS50',
    speaker: 'Brian Yu',
    domain: 'AI Foundations',
  },
  fsdl: {
    seriesId: 'full-stack-deep-learning-2022',
    seriesTitle: 'Full Stack Deep Learning — 2022',
    channel: 'The Full Stack',
    speaker: 'Full Stack Deep Learning team',
    domain: 'MLOps / AI Product Engineering',
  },
  karpathy: {
    seriesId: 'karpathy-neural-networks-zero-to-hero',
    seriesTitle: 'Andrej Karpathy: Neural Networks — Zero to Hero',
    channel: 'Andrej Karpathy',
    speaker: 'Andrej Karpathy',
    domain: 'Neural Network Foundations',
    format: 'Specialized Course',
  },
  mit6s191: {
    seriesId: 'mit-6s191-introduction-to-deep-learning',
    seriesTitle: 'MIT 6.S191: Introduction to Deep Learning — Editions',
    channel: 'Alexander Amini',
    speaker: 'Alexander Amini',
    domain: 'Deep Learning Foundations',
  },
  nyu: {
    seriesId: 'nyu-deep-learning-2026',
    seriesTitle: 'NYU Deep Learning — 2026',
    channel: 'Alfredo Canziani (冷在)',
    speaker: 'Alfredo Canziani',
    domain: 'Deep Learning Foundations',
  },
  cmu: {
    seriesId: 'cmu-11-785-fall-2025',
    seriesTitle: 'CMU 11-785: Introduction to Deep Learning — Fall 2025',
    channel: 'Carnegie Mellon University Deep Learning',
    speaker: 'Bhiksha Raj / CMU course team',
    domain: 'Deep Learning Foundations',
  },
}

// Verified row data. seriesOrder mirrors what scripts/apply-course-series.mjs
// recomputes (lecture/lesson number, publish order for the Karpathy playlist,
// edition year for MIT 6.S191).
const additionSpecs = [
  {
    id: 'ST-1200', series: 'cs234', videoId: "jjq51TRNVvk", seriesOrder: 3,
    title: 'Stanford CS234 Reinforcement Learning I Policy Evaluation I 2024 I Lecture 3',
    durationMinutes: 80, viewCount: 29221, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Policy Evaluation; Monte Carlo Methods; Temporal Difference Learning',
  },
  {
    id: 'ST-1201', series: 'cs234', videoId: "L6OVEmV3NcE", seriesOrder: 5,
    title: 'Stanford CS234 Reinforcement Learning I Policy Search 1 I 2024 I Lecture 5',
    durationMinutes: 68, viewCount: 15982, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Policy Search; Policy Gradient; REINFORCE',
  },
  {
    id: 'ST-1202', series: 'cs234', videoId: "8PwvNQ5WS-o", seriesOrder: 6,
    title: 'Stanford CS234 Reinforcement Learning I Policy Search 2 I 2024 I Lecture 6',
    durationMinutes: 79, viewCount: 12814, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Policy Search; Policy Gradient; Actor-Critic',
  },
  {
    id: 'ST-1203', series: 'cs234', videoId: "4ngb0IZTg8I", seriesOrder: 7,
    title: 'Stanford CS234 Reinforcement Learning I Policy Search 3 I 2024 I Lecture 7',
    durationMinutes: 79, viewCount: 12556, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Policy Search; Policy Optimization',
  },
  {
    id: 'ST-1204', series: 'cs234', videoId: "IEbuJtjqtMU", seriesOrder: 8,
    title: 'Stanford CS234 Reinforcement Learning I Offline RL 1 I 2024 I Lecture 8',
    durationMinutes: 74, viewCount: 9442, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Offline RL; Batch RL',
  },
  {
    id: 'ST-1205', series: 'cs234', videoId: "Q7rl8ovBWwQ", seriesOrder: 9,
    title: 'Stanford CS234 I Guest Lecture on DPO: Rafael Rafailov, Archit Sharma, Eric Mitchell I Lecture 9',
    durationMinutes: 79, viewCount: 13826, publishedAt: '2024-10-30', recommendation: 'Recommended',
    speaker: 'Rafael Rafailov, Archit Sharma, and Eric Mitchell',
    keywords: 'Reinforcement Learning; DPO; RLHF; Preference Learning; Language Models',
  },
  {
    id: 'ST-1206', series: 'cs234', videoId: "F6APGIAm5fw", seriesOrder: 10,
    title: 'Stanford CS234 Reinforcement Learning I Offline RL 3 I 2024 I Lecture 10',
    durationMinutes: 80, viewCount: 7209, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Offline RL; Off-Policy Evaluation',
  },
  {
    id: 'ST-1207', series: 'cs234', videoId: "sqYii3nd78w", seriesOrder: 11,
    title: 'Stanford CS234 Reinforcement Learning I Exploration 1 I 2024 I Lecture 11',
    durationMinutes: 75, viewCount: 7666, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Exploration; Bandits',
  },
  {
    id: 'ST-1208', series: 'cs234', videoId: "gFJNsfg_35E", seriesOrder: 12,
    title: 'Stanford CS234 Reinforcement Learning I Exploration 2 I 2024 I Lecture 12',
    durationMinutes: 78, viewCount: 5957, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Exploration; Sequential Decision Making',
  },
  {
    id: 'ST-1209', series: 'cs234', videoId: "pc7oayCSZmQ", seriesOrder: 13,
    title: 'Stanford CS234 Reinforcement Learning I Exploration 3 I 2024 I Lecture 13',
    durationMinutes: 70, viewCount: 5211, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Exploration; Markov Decision Processes',
  },
  {
    id: 'ST-1210', series: 'cs234', videoId: "FOlPpjNbHjE", seriesOrder: 15,
    title: 'Stanford CS234 Reinforcement Learning I Emma Brunskill & Dan Webber I 2024 I Lecture 15',
    durationMinutes: 74, viewCount: 7594, publishedAt: '2024-10-30', recommendation: 'Recommended',
    speaker: 'Emma Brunskill and Dan Webber',
    keywords: 'Reinforcement Learning; AI Education',
  },
  {
    id: 'ST-1211', series: 'cs234', videoId: "eenJzay5aLo", seriesOrder: 16,
    title: 'Stanford CS234 Reinforcement Learning I Value Alignment I 2024 I Lecture 16',
    durationMinutes: 70, viewCount: 10684, publishedAt: '2024-10-30',
    keywords: 'Reinforcement Learning; Value Alignment; RLHF; AI Safety',
  },
  {
    id: 'ST-1212', series: 'effml', videoId: "w5WiUcDJosM", seriesOrder: 3,
    title: 'EfficientML.ai Lecture 3 - Pruning and Sparsity (Part I) (MIT 6.5940, Fall 2023)',
    durationMinutes: 69, viewCount: 20443, publishedAt: '2023-09-14',
    keywords: 'Model Compression; Pruning; Sparsity; Efficient Deep Learning',
  },
  {
    id: 'ST-1213', series: 'effml', videoId: "3t9aGLLaCqs", seriesOrder: 4,
    title: 'EfficientML.ai Lecture 4 - Pruning and Sparsity (Part II) (MIT 6.5940, Fall 2023)',
    durationMinutes: 78, viewCount: 12943, publishedAt: '2023-09-19',
    keywords: 'Model Compression; Pruning; Sparsity; Efficient Inference',
  },
  {
    id: 'ST-1214', series: 'effml', videoId: "TSc_BibWRhM", seriesOrder: 5,
    title: 'EfficientML.ai Lecture 5 - Quantization (Part I) (MIT 6.5940, Fall 2023)',
    durationMinutes: 75, viewCount: 18927, publishedAt: '2023-09-21',
    keywords: 'Quantization; Model Compression; Low-Precision Inference; Efficient Deep Learning',
  },
  {
    id: 'ST-1215', series: 'effml', videoId: "g-TzDApaE88", seriesOrder: 6,
    title: 'EfficientML.ai Lecture 6 - Quantization (Part II) (MIT 6.5940, Fall 2023)',
    durationMinutes: 75, viewCount: 11617, publishedAt: '2023-09-26',
    keywords: 'Quantization; Quantization-Aware Training; Post-Training Quantization; Model Compression',
  },
  {
    id: 'ST-1216', series: 'effml', videoId: "gFi29IEHRGc", seriesOrder: 7,
    title: 'EfficientML.ai Lecture 7 - Neural Architecture Search (Part I) (MIT 6.5940, Fall 2023)',
    durationMinutes: 74, viewCount: 8379, publishedAt: '2023-09-28',
    keywords: 'Neural Architecture Search; AutoML; Efficient Model Design',
  },
  {
    id: 'ST-1217', series: 'effml', videoId: "EFpGQoDQ7JI", seriesOrder: 8,
    title: 'EfficientML.ai Lecture 8 - Neural Architecture Search (Part II) (MIT 6.5940, Fall 2023)',
    durationMinutes: 75, viewCount: 4412, publishedAt: '2023-10-03',
    keywords: 'Neural Architecture Search; Hardware-Aware NAS; Efficient Model Design',
  },
  {
    id: 'ST-1218', series: 'effml', videoId: "l7RdJRYl7ZY", seriesOrder: 10,
    title: 'EfficientML.ai Lecture 10 - MCUNet: TinyML on Microcontrollers (MIT 6.5940, Fall 2023)',
    durationMinutes: 61, viewCount: 4771, publishedAt: '2023-10-12',
    keywords: 'TinyML; Microcontrollers; MCUNet; Edge AI',
  },
  {
    id: 'ST-1219', series: 'effml', videoId: "HGsvWHqU29Y", seriesOrder: 11,
    title: 'EfficientML.ai Lecture 11 - TinyEngine and Parallel Processing (MIT 6.5940, Fall 2023)',
    durationMinutes: 76, viewCount: 3716, publishedAt: '2023-10-17',
    keywords: 'TinyEngine; Parallel Processing; Inference Optimization; Edge AI',
  },
  {
    id: 'ST-1220', series: 'effml', videoId: "A12m85vbZro", seriesOrder: 12,
    title: 'EfficientML.ai Lecture 12 - Transformer and LLM (Part I) (MIT 6.5940, Fall 2023)',
    durationMinutes: 78, viewCount: 11645, publishedAt: '2023-10-19',
    keywords: 'Transformers; Large Language Models; Efficient Inference',
  },
  {
    id: 'ST-1221', series: 'effml', videoId: "7WeraZ0LLlg", seriesOrder: 13,
    title: 'EfficientML.ai Lecture 13 - Transformer and LLM (Part II) (MIT 6.5940, Fall 2023)',
    durationMinutes: 77, viewCount: 7166, publishedAt: '2023-10-24',
    keywords: 'Transformers; Large Language Models; Efficiency; Model Compression',
  },
  {
    id: 'ST-1222', series: 'effml', videoId: "QQY24LLww1A", seriesOrder: 14,
    title: 'EfficientML.ai Lecture 14 - Vision Transformer (MIT 6.5940, Fall 2023)',
    durationMinutes: 74, viewCount: 9579, publishedAt: '2023-10-26',
    keywords: 'Vision Transformers; Efficient Attention; Model Compression',
  },
  {
    id: 'ST-1223', series: 'effml', videoId: "W3WwxI0M-hI", seriesOrder: 15,
    title: 'EfficientML.ai Lecture 15 - GAN, Video, and Point Cloud (MIT 6.5940, Fall 2023)',
    durationMinutes: 68, viewCount: 2590, publishedAt: '2023-10-31',
    keywords: 'GANs; Video Recognition; Point Cloud; Efficient Deep Learning',
  },
  {
    id: 'ST-1224', series: 'effml', videoId: "nFE1euQ_Wtw", seriesOrder: 16,
    title: 'EfficientML.ai Lecture 16 - Diffusion Model (MIT 6.5940, Fall 2023)',
    durationMinutes: 76, viewCount: 9471, publishedAt: '2023-11-02',
    keywords: 'Diffusion Models; Efficient Generation; Generative AI',
  },
  {
    id: 'ST-1225', series: 'effml', videoId: "0vdzBAms8mE", seriesOrder: 17,
    title: 'EfficientML.ai Lecture 17: Distributed Training (Part I) (MIT 6.5940, Fall 2023)',
    durationMinutes: 61, viewCount: 4336, publishedAt: '2023-11-07',
    keywords: 'Distributed Training; Data Parallelism; Model Parallelism',
  },
  {
    id: 'ST-1226', series: 'effml', videoId: "mP4BL6URdxc", seriesOrder: 18,
    title: 'EfficientML.ai Lecture 18: Distributed Training (Part II) (MIT 6.5940, Fall 2023)',
    durationMinutes: 55, viewCount: 2346, publishedAt: '2023-11-09',
    keywords: 'Distributed Training; Parallelism; Communication Efficiency',
  },
  {
    id: 'ST-1227', series: 'effml', videoId: "PArGX623PvA", seriesOrder: 19,
    title: 'EfficientML.ai Lecture 19: On-Device Training and Transfer Learning (MIT 6.5940, Fall 2023)',
    durationMinutes: 77, viewCount: 2354, publishedAt: '2023-11-14',
    keywords: 'On-Device Training; Transfer Learning; Edge AI; Memory Efficiency',
  },
  {
    id: 'ST-1228', series: 'effml', videoId: "vOPwwRCZ8q8", seriesOrder: 20,
    title: 'EfficientML.ai Lecture 20: Efficient Fine-tuning and Prompt Engineering (MIT 6.5940, Fall 2023)',
    durationMinutes: 78, viewCount: 3164, publishedAt: '2023-11-18',
    keywords: 'Efficient Fine-Tuning; Prompt Engineering; Parameter-Efficient Fine-Tuning; Large Language Models',
  },
  {
    id: 'ST-1229', series: 'effml', videoId: "Z8GKkgE2840", seriesOrder: 21,
    title: 'EfficientML.ai Lecture 21: Basics of Quantum Computing (MIT 6.5940, Fall 2023)',
    durationMinutes: 76, viewCount: 2880, publishedAt: '2023-11-21',
    keywords: 'Quantum Computing; Qubits; Quantum Circuits',
  },
  {
    id: 'ST-1230', series: 'effml', videoId: "eDtzfMRJg_Y", seriesOrder: 22,
    title: 'EfficientML.ai Lecture 22: Quantum Machine Learning (MIT 6.5940, Fall 2023)',
    durationMinutes: 73, viewCount: 1784, publishedAt: '2023-11-28',
    keywords: 'Quantum Machine Learning; Quantum Computing; Variational Circuits',
  },
  {
    id: 'ST-1231', series: 'effml', videoId: "kCTzlodCZII", seriesOrder: 23,
    title: 'EfficientML.ai Lecture 23: Noise Robust Quantum ML (MIT 6.5940, Fall 2023)',
    durationMinutes: 75, viewCount: 1793, publishedAt: '2023-11-30',
    keywords: 'Quantum Machine Learning; Noise Robustness; Quantum Computing',
  },
  {
    id: 'ST-1232', series: 'cs50', videoId: "qK46ET1xk2A", seriesOrder: 3,
    title: 'Optimization - Lecture 3 - CS50\'s Introduction to Artificial Intelligence with Python 2020',
    durationMinutes: 105, viewCount: 183558, publishedAt: '2023-07-24',
    keywords: 'Optimization; Local Search; Hill Climbing; Constraint Satisfaction; AI Foundations',
  },
  {
    id: 'ST-1233', series: 'cs50', videoId: "-g0iJjnO2_w", seriesOrder: 4,
    title: 'Learning - Lecture 4 - CS50\'s Introduction to Artificial Intelligence with Python 2020',
    durationMinutes: 106, viewCount: 184448, publishedAt: '2023-07-24',
    keywords: 'Machine Learning; Supervised Learning; Reinforcement Learning; Unsupervised Learning; AI Foundations',
  },
  {
    id: 'ST-1234', series: 'cs50', videoId: "55tRetTTrdQ", seriesOrder: 6,
    title: 'Language - Lecture 6 - CS50\'s Introduction to Artificial Intelligence with Python 2020',
    durationMinutes: 115, viewCount: 40161, publishedAt: '2020-04-27',
    keywords: 'Natural Language Processing; Language Models; Context-Free Grammar; Word Embeddings; AI Foundations',
  },
  {
    id: 'ST-1235', series: 'fsdl', videoId: "Jlm4oqW41vY", seriesOrder: 4,
    title: 'Lecture 04: Data Management (FSDL 2022)',
    durationMinutes: 35, viewCount: 6078, publishedAt: '2022-08-29', recommendation: 'Recommended',
    speaker: 'Sergey Karayev',
    keywords: 'Data Management; Data Labeling; Data Versioning; MLOps',
  },
  {
    id: 'ST-1236', series: 'fsdl', videoId: "nra0Tt3a-Oc", seriesOrder: 6,
    title: 'Lecture 06: Continual Learning (FSDL 2022)',
    durationMinutes: 65, viewCount: 9370, publishedAt: '2022-09-12', recommendation: 'Recommended',
    speaker: 'Josh Tobin',
    keywords: 'Continual Learning; Model Monitoring; Retraining; MLOps',
  },
  {
    id: 'ST-1237', series: 'fsdl', videoId: "Rm11UeGwGgk", seriesOrder: 7,
    title: 'Lecture 07: Foundation Models (FSDL 2022)',
    durationMinutes: 60, viewCount: 7349, publishedAt: '2022-09-19', recommendation: 'Recommended',
    speaker: 'Sergey Karayev',
    keywords: 'Foundation Models; Large Language Models; Transfer Learning; Prompt Engineering',
  },
  {
    id: 'ST-1238', series: 'fsdl', videoId: "a54xH6nT4Sw", seriesOrder: 8,
    title: 'Lecture 08: ML Teams and Project Management (FSDL 2022)',
    durationMinutes: 64, viewCount: 4309, publishedAt: '2022-09-26', recommendation: 'Recommended',
    speaker: 'Josh Tobin',
    keywords: 'ML Teams; Project Management; Hiring; MLOps',
  },
  {
    id: 'ST-1239', series: 'karpathy', videoId: "TCH_1BHY58I", seriesOrder: 20220912,
    title: 'Building makemore Part 2: MLP',
    durationMinutes: 76, viewCount: 580303, publishedAt: '2022-09-12',
    keywords: 'Language Modeling; Multilayer Perceptron; Neural Networks; PyTorch',
  },
  {
    id: 'ST-1240', series: 'karpathy', videoId: "P6sfmUTpUmc", seriesOrder: 20221004,
    title: 'Building makemore Part 3: Activations & Gradients, BatchNorm',
    durationMinutes: 116, viewCount: 540291, publishedAt: '2022-10-04',
    keywords: 'Neural Networks; Activations; Gradients; Batch Normalization',
  },
  {
    id: 'ST-1241', series: 'karpathy', videoId: "q8SA3rM6ckI", seriesOrder: 20221011,
    title: 'Building makemore Part 4: Becoming a Backprop Ninja',
    durationMinutes: 115, viewCount: 369641, publishedAt: '2022-10-11',
    keywords: 'Backpropagation; Manual Gradients; Neural Networks; PyTorch',
  },
  {
    id: 'ST-1242', series: 'karpathy', videoId: "t3YJ5hKiMQ0", seriesOrder: 20221120,
    title: 'Building makemore Part 5: Building a WaveNet',
    durationMinutes: 56, viewCount: 291213, publishedAt: '2022-11-20',
    keywords: 'WaveNet; Convolutional Architecture; Language Modeling; Neural Networks',
  },
  {
    id: 'ST-1243', series: 'karpathy', videoId: "zduSFxRajkE", seriesOrder: 20240220,
    title: 'Let\'s build the GPT Tokenizer',
    durationMinutes: 134, viewCount: 1174845, publishedAt: '2024-02-20',
    keywords: 'Tokenization; Byte Pair Encoding; GPT; Large Language Models',
  },
  {
    id: 'ST-1244', series: 'karpathy', videoId: "l8pRSuU81PU", seriesOrder: 20240609,
    title: 'Let\'s reproduce GPT-2 (124M)',
    durationMinutes: 241, viewCount: 1150396, publishedAt: '2024-06-09', recommendation: 'Core',
    keywords: 'GPT-2; Pretraining; Large Language Models; Distributed Training; PyTorch',
  },
  {
    id: 'ST-1245', series: 'mit6s191', videoId: "5tvmMX8r_OM", seriesOrder: 2021,
    title: 'MIT 6.S191 (2021): Introduction to Deep Learning',
    durationMinutes: 57, viewCount: 567027, publishedAt: '2021-02-05',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1246', series: 'mit6s191', videoId: "7sB052Pz0sQ", seriesOrder: 2022,
    title: 'MIT Introduction to Deep Learning (2022) | 6.S191',
    durationMinutes: 49, viewCount: 632307, publishedAt: '2022-03-11',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1247', series: 'mit6s191', videoId: "II4giR4vOOo", seriesOrder: 2026,
    title: 'MIT Introduction to Deep Learning | 6.S191',
    durationMinutes: 56, viewCount: 255152, publishedAt: '2026-03-30', recommendation: 'Core',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1248', series: 'nyu', videoId: "8WDOAXaxwlU", seriesOrder: 3,
    title: 'Lesson 03 – Wiener’s cybernetics, Hebbian plasticity, and Rosenblatt’s perceptron',
    durationMinutes: 53, viewCount: 2915, publishedAt: '2026-02-27',
    keywords: 'Neural Networks; Perceptron; Hebbian Learning; History of AI',
  },
  {
    id: 'ST-1249', series: 'nyu', videoId: "DtP2HYp9cNM", seriesOrder: 4,
    title: 'Lesson 04 – Bias, perceptron’s properties, and multi-class classification',
    durationMinutes: 62, viewCount: 2203, publishedAt: '2026-03-06',
    keywords: 'Perceptron; Classification; Multi-Class Classification; Neural Networks',
  },
  {
    id: 'ST-1250', series: 'nyu', videoId: "DYtEA4FTCgE", seriesOrder: 5,
    title: 'Lesson 05 – A softer perceptron, part I: probabilities',
    durationMinutes: 47, viewCount: 1472, publishedAt: '2026-03-11',
    keywords: 'Perceptron; Probability; Classification; Neural Networks',
  },
  {
    id: 'ST-1251', series: 'nyu', videoId: "6urnjbulYt0", seriesOrder: 6,
    title: 'Lesson 06 – A softer perceptron, part II: likelihood and loss',
    durationMinutes: 60, viewCount: 2875, publishedAt: '2026-05-15',
    keywords: 'Likelihood; Loss Functions; Classification; Neural Networks',
  },
  {
    id: 'ST-1252', series: 'nyu', videoId: "2PlFRMWDQmQ", seriesOrder: 7,
    title: 'Lesson 07 – A softer perceptron, part III: gradient descent',
    durationMinutes: 59, viewCount: 2711, publishedAt: '2026-07-01',
    keywords: 'Gradient Descent; Optimization; Classification; Neural Networks',
  },
  {
    id: 'ST-1253', series: 'nyu', videoId: "-5CbEost-0E", seriesOrder: 8,
    title: 'Lesson 08 – A softer perceptron, part IV: hardening and multi-class',
    durationMinutes: 62, viewCount: 2064, publishedAt: '2026-07-21',
    keywords: 'Classification; Multi-Class Classification; Logistic Regression; Neural Networks',
  },
  {
    id: 'ST-1254', series: 'nyu', videoId: "QJJGDtiR6bw", seriesOrder: 9,
    title: 'Lesson 09 – A softer perceptron, part V: multi-class likelihood and loss',
    durationMinutes: 34, viewCount: 903, publishedAt: '2026-07-27',
    keywords: 'Multi-Class Classification; Likelihood; Loss Functions; Neural Networks',
  },
  {
    id: 'ST-1255', series: 'cmu', videoId: "qQtfKayFdfM", seriesOrder: 1,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 1',
    durationMinutes: 83, viewCount: 5134, publishedAt: '2025-08-25', recommendation: 'Core',
    keywords: 'Deep Learning; Neural Networks; Perceptron; AI Education',
  },
  {
    id: 'ST-1256', series: 'cmu', videoId: "gUt3rsT5_-8", seriesOrder: 2,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 2',
    durationMinutes: 86, viewCount: 3070, publishedAt: '2025-08-27',
    keywords: 'Neural Networks; Multilayer Perceptrons; Universal Approximation',
  },
  {
    id: 'ST-1257', series: 'cmu', videoId: "j0as9k7qnck", seriesOrder: 3,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 3',
    durationMinutes: 87, viewCount: 1877, publishedAt: '2025-09-05',
    keywords: 'Neural Networks; Training; Empirical Risk Minimization',
  },
  {
    id: 'ST-1258', series: 'cmu', videoId: "OJpR7J8MPgA", seriesOrder: 4,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 4',
    durationMinutes: 85, viewCount: 1627, publishedAt: '2025-09-05',
    keywords: 'Multivariate Calculus; Activation Functions; Neural Networks',
  },
  {
    id: 'ST-1259', series: 'cmu', videoId: "I3BjsU-QukA", seriesOrder: 6,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 6',
    durationMinutes: 84, viewCount: 1289, publishedAt: '2025-09-10',
    keywords: 'Optimization; Gradient Descent; Training; Neural Networks',
  },
  {
    id: 'ST-1260', series: 'cmu', videoId: "2RdQ7kiJgIo", seriesOrder: 8,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 8',
    durationMinutes: 84, viewCount: 844, publishedAt: '2025-09-20',
    keywords: 'Optimization; Optimizers; Training; Neural Networks',
  },
  {
    id: 'ST-1261', series: 'cmu', videoId: "qt5r69AIIKE", seriesOrder: 9,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 9',
    durationMinutes: 84, viewCount: 825, publishedAt: '2025-09-23',
    keywords: 'Convolutional Neural Networks; Computer Vision; Deep Learning',
  },
  {
    id: 'ST-1262', series: 'cmu', videoId: "oNu0KCzjc9I", seriesOrder: 10,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 10',
    durationMinutes: 84, viewCount: 714, publishedAt: '2025-09-26',
    keywords: 'Convolutional Neural Networks; Deep Learning; Model Architectures',
  },
  {
    id: 'ST-1263', series: 'cmu', videoId: "TR_ovddIwCU", seriesOrder: 11,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 11',
    durationMinutes: 77, viewCount: 612, publishedAt: '2025-10-02',
    keywords: 'Convolutional Neural Networks; Deep Learning; Model Architectures',
  },
  {
    id: 'ST-1264', series: 'cmu', videoId: "bPzYScY3CHM", seriesOrder: 12,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 12',
    durationMinutes: 92, viewCount: 650, publishedAt: '2025-10-02',
    keywords: 'Convolutional Neural Networks; Architectures; Applications',
  },
  {
    id: 'ST-1265', series: 'cmu', videoId: "DHSQ0RYdab8", seriesOrder: 13,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 13',
    durationMinutes: 74, viewCount: 1151, publishedAt: '2025-10-06',
    keywords: 'Recurrent Neural Networks; Sequence Modeling; Deep Learning',
  },
  {
    id: 'ST-1266', series: 'cmu', videoId: "j78_efCyMxU", seriesOrder: 15,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 15',
    durationMinutes: 82, viewCount: 500, publishedAt: '2025-10-20',
    keywords: 'Recurrent Neural Networks; Sequence Modeling; Deep Learning',
  },
  {
    id: 'ST-1267', series: 'cmu', videoId: "RMBXmlot6Jo", seriesOrder: 17,
    title: '11-785 CMU Intro to Deep Learning - Lec 17: Language Models & Translation',
    durationMinutes: 82, viewCount: 489, publishedAt: '2025-10-29',
    keywords: 'Language Models; Machine Translation; Sequence-to-Sequence; Deep Learning',
  },
  {
    id: 'ST-1268', series: 'cmu', videoId: "RjI7bGMJZV0", seriesOrder: 18,
    title: '11-785 CMU Intro to Deep Learning - Lec 18: Attention Models & Transformers',
    durationMinutes: 82, viewCount: 1114, publishedAt: '2025-10-29',
    keywords: 'Attention; Transformers; Sequence Modeling; Deep Learning',
  },
  {
    id: 'ST-1269', series: 'cmu', videoId: "oB6Vbk3-Hao", seriesOrder: 19,
    title: 'CMU Introduction To Deep Learning, Fall 2025: Lecture 19, Transformers and Newer Architectures',
    durationMinutes: 88, viewCount: 1339, publishedAt: '2025-11-05',
    keywords: 'Transformers; Model Architectures; Deep Learning',
  },
  {
    id: 'ST-1270', series: 'cmu', videoId: "2MWWkJVF7bQ", seriesOrder: 22,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 22',
    durationMinutes: 85, viewCount: 508, publishedAt: '2025-11-12',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1271', series: 'cmu', videoId: "mN3c7_E524w", seriesOrder: 23,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 23',
    durationMinutes: 82, viewCount: 599, publishedAt: '2025-11-17',
    keywords: 'Diffusion Models; Generative Models; Deep Learning',
  },
  {
    id: 'ST-1272', series: 'cmu', videoId: "wrwYoiqyn68", seriesOrder: 24,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 24',
    durationMinutes: 89, viewCount: 346, publishedAt: '2025-11-25',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1273', series: 'cmu', videoId: "B7hu_r3TgP0", seriesOrder: 25,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 25',
    durationMinutes: 89, viewCount: 502, publishedAt: '2025-11-25',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1274', series: 'cmu', videoId: "JVeCYzQAO-E", seriesOrder: 26,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 26',
    durationMinutes: 77, viewCount: 674, publishedAt: '2025-11-26',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1275', series: 'cmu', videoId: "V4coYgcdIuE", seriesOrder: 27,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 27',
    durationMinutes: 85, viewCount: 406, publishedAt: '2025-12-02',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
  {
    id: 'ST-1276', series: 'cmu', videoId: "WkLKBkozoII", seriesOrder: 28,
    title: 'CMU Introduction To Deep Learning 11-785, Fall 2025: Lecture 28',
    durationMinutes: 84, viewCount: 685, publishedAt: '2025-12-03',
    keywords: 'Deep Learning; Neural Networks; AI Education',
  },
]

function buildRow(spec) {
  const { series, ...row } = spec
  const defaults = seriesDefaults[series]
  if (!defaults) throw new Error(`Unknown series key: ${series}`)
  return {
    id: row.id,
    section: 'Course',
    domain: row.domain ?? defaults.domain,
    keywords: row.keywords,
    language: 'English',
    title: row.title,
    speaker: row.speaker ?? defaults.speaker,
    channel: defaults.channel,
    format: defaults.format ?? 'Course Lecture',
    durationMinutes: row.durationMinutes,
    url: `https://www.youtube.com/watch?v=${row.videoId}`,
    platform: 'YouTube',
    viewCount: row.viewCount,
    sourceTier: tierA,
    recommendation: row.recommendation ?? 'Recommended',
    status: 'Verified',
    collectedOn,
    // Left empty on purpose: `npm run notes:apply` generates the editorial
    // note from the verified fields after series placement is final.
    notes: '',
    videoId: row.videoId,
    focusArea: 'Other',
    publishedAt: row.publishedAt,
    subtitleLanguages: [],
    subtitleTracks: [],
    subtitlesVerified: false,
    subtitleVerificationScope: 'blocked by YouTube anti-bot verification on this network',
    metadataVerifiedVia: defaults.metadataVerifiedVia ?? playlistAndWatchPage,
    metadataVerificationStatus: 'Partial',
    lastVerifiedAt: collectedOn,
    lastVerificationAttemptAt: collectedOn,
    metadataVerificationError: '',
    publishedAtVerified: true,
    seriesId: defaults.seriesId,
    seriesTitle: defaults.seriesTitle,
    seriesOrder: row.seriesOrder,
  }
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

const additions = additionSpecs.map(buildRow)

// Internal consistency: the ST-1200+ block must be collision-free in itself.
for (const key of ['id', 'videoId', 'url']) {
  const values = additions.map((row) => row[key])
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${key} inside the additions block`)
}
for (const row of additions) {
  const idNumber = Number(row.id.replace('ST-', ''))
  if (!(idNumber >= 1200)) throw new Error(`${row.id} is outside the reserved ST-1200+ block`)
  for (const field of ['title', 'speaker', 'channel', 'durationMinutes', 'url', 'keywords', 'publishedAt', 'seriesId', 'seriesTitle', 'seriesOrder', 'recommendation', 'focusArea']) {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      throw new Error(`${row.id} is missing ${field}`)
    }
  }
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
const knownIds = new Set(resources.map((resource) => resource.id))
const knownUrls = new Set(resources.map((resource) => resource.url))
const knownVideoIds = new Set(resources.map((resource) => resource.videoId).filter(Boolean))

const fields = Object.keys(resources[0])
const added = []
const skipped = []
for (const row of additions) {
  if (knownIds.has(row.id) || knownVideoIds.has(row.videoId) || knownUrls.has(row.url)) {
    skipped.push(row.id)
    continue
  }
  const missing = fields.filter((field) => !(field in row))
  if (missing.length) throw new Error(`${row.id} is missing schema fields: ${missing.join(', ')}`)
  resources.push(row)
  knownIds.add(row.id)
  knownUrls.add(row.url)
  knownVideoIds.add(row.videoId)
  added.push(row.id)
}

const csv = [
  fields.join(','),
  ...resources.map((resource) => fields.map((field) => csvCell(resource[field])).join(',')),
].join('\r\n')

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')

// Fold the newly added rows into the verification report as a delta (every
// added row is a Partial-verified YouTube resource), preserving the report's
// own semantics for the platforms its verifier cannot check and keeping the
// recorded failure list intact.
if (added.length > 0) {
  const report = JSON.parse(await readFile(metadataReportPath, 'utf8'))
  report.verifiedOn = collectedOn
  report.total += added.length
  report.partial += added.length
  report.byPlatform.YouTube.total += added.length
  report.byPlatform.YouTube.partial += added.length
  await writeFile(metadataReportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

const seriesCounts = Object.fromEntries(
  Object.values(seriesDefaults).map(({ seriesId }) => [
    seriesId,
    resources.filter((resource) => resource.seriesId === seriesId).length,
  ]),
)
console.log(JSON.stringify({
  total: resources.length,
  added: added.length,
  skippedExisting: skipped.length,
  idRange: added.length ? `${added[0]}–${added.at(-1)}` : 'none',
  seriesCounts,
}, null, 2))
