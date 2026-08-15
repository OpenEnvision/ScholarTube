# ScholarTube 候选资源增补清单（2026-08-15）

> **执行状态（2026-08-15）：** 已将 P0 的 69 个、P1 的 36 个和 P2 中 5 个非短演示资源写入正式数据，共新增 **110 个**，当时资源库增至 **656 条**。随后完成第二轮查缺补漏，补入 117 条长内容，增至 **773 条**；再完成两轮 Talks 扩充，先加入 25 场 NeurIPS 与 MLSys 长演讲，再加入 62 场经逐页播放器验证和严格去重的主会 keynote / invited talk。当前总数为 **860 条**，其中 Talks **312 条**。详见 [`latest_gap_audit_2026-08-15.md`](latest_gap_audit_2026-08-15.md)、[`talks_expansion_2026-08-15.md`](talks_expansion_2026-08-15.md) 与 [`talks_backbone_expansion_2026-08-15.md`](talks_backbone_expansion_2026-08-15.md)。包括 Genie 3 两分钟展示在内的官方短演示仍未录入。

## 结论

当前 546 条资源里，访谈类已经不少，真正明显的缺口是：**权威课程没有补全、近两年的 Agent / World Model / Robot Learning 主线覆盖不成体系**。

本清单共整理出 **116 个候选视频**：

- **P0：69 个**——建议优先录入；补齐 7 组当前最关键、且仓库中缺失或残缺的官方课程。
- **P1：36 个**——第二批录入；补齐强化学习与欠驱动机器人两套基础主干。
- **P2：11 个**——前沿官方演讲、教程或短演示；其中 5 个已收录，6 个官方短演示按最终决定排除。

其中 **P0 + P1 的 105 个视频均已按 YouTube video ID 与原有 546 条资源去重**。本文件保留研究与筛选依据；正式数据已按上述执行状态更新。

## 一、P0：优先补齐的 69 个视频

### 1. Stanford CS231N: Deep Learning for Computer Vision, Spring 2025

- 官方系列：[Stanford CS231N 2025 playlist](https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16)
- 当前覆盖：7 / 18
- 建议补录：11 个
- 建议字段：`section=Course`，`focusArea=Vision`，`sourceTier=A`，`recommendation=Core`

| 课次 | 标题 | 直链 |
|---|---|---|
| L2 | Image Classification with Linear Classifiers | [YouTube](https://www.youtube.com/watch?v=pdqofxJeBN8) |
| L4 | Neural Networks and Backpropagation | [YouTube](https://www.youtube.com/watch?v=25zD5qJHYsk) |
| L5 | Image Classification with CNNs | [YouTube](https://www.youtube.com/watch?v=f3g1zGdxptI) |
| L7 | Recurrent Neural Networks | [YouTube](https://www.youtube.com/watch?v=kG2lAPBF7zA) |
| L10 | Video Understanding | [YouTube](https://www.youtube.com/watch?v=wElqklprhPE) |
| L11 | Large Scale Distributed Training | [YouTube](https://www.youtube.com/watch?v=9MvD-XsowsE) |
| L13 | Generative Models 1 | [YouTube](https://www.youtube.com/watch?v=zbHXQRUNlH0) |
| L14 | Generative Models 2 | [YouTube](https://www.youtube.com/watch?v=Edr4uZFh4EE) |
| L16 | Vision and Language | [YouTube](https://www.youtube.com/watch?v=mQOK0Mfyrkk) |
| L17 | Robot Learning | [YouTube](https://www.youtube.com/watch?v=XSfmOH_xVSU) |
| L18 | Human-Centered AI | [YouTube](https://www.youtube.com/watch?v=g8UaBfj6Sh8) |

### 2. Stanford CME 296: Generative AI and Foundation Models, Spring 2026

- 官方课程页：[CME 296](https://cme296.stanford.edu/)
- 官方系列：[Stanford CME 296 playlist](https://www.youtube.com/playlist?list=PLoROMvodv4rNdy8rt2rZ4T2xM0OjADnfu)
- 当前覆盖：2 / 8
- 建议补录：6 个
- 建议字段：`section=Course`，`focusArea=Vision`；L8 可标 `World Model`，`sourceTier=A`，`recommendation=Core`

| 课次 | 标题 | 直链 |
|---|---|---|
| L2 | Score Matching | [YouTube](https://www.youtube.com/watch?v=_WaR2fjZpEQ) |
| L3 | Flow Matching | [YouTube](https://www.youtube.com/watch?v=agN3AlfGFrk) |
| L4 | Latent Space & Guidance | [YouTube](https://www.youtube.com/watch?v=WUUq6TVAu8U) |
| L6 | Model Training | [YouTube](https://www.youtube.com/watch?v=IvXTl3yj-4Y) |
| L7 | Evaluation | [YouTube](https://www.youtube.com/watch?v=iNaRBp4T57Q) |
| L8 | Trending Topics | [YouTube](https://www.youtube.com/watch?v=oyLUvz9nR6E) |

### 3. Stanford CME 295: Transformers & Large Language Models, Autumn 2025

- 官方系列：[Stanford CME 295 playlist](https://www.youtube.com/playlist?list=PLoROMvodv4rObv1FMizXqumgVVdzX4_05)
- 当前覆盖：2 / 9
- 建议补录：7 个
- 建议字段：`section=Course`，L2–L5 为 `Other`，L6/L8/L9 可归 `Agent`，`sourceTier=A`，`recommendation=Core`

| 课次 | 标题 | 直链 |
|---|---|---|
| L2 | Transformer-Based Models & Tricks | [YouTube](https://www.youtube.com/watch?v=yT84Y5zCnaA) |
| L3 | Transformers & Large Language Models | [YouTube](https://www.youtube.com/watch?v=Q5baLehv5So) |
| L4 | LLM Training | [YouTube](https://www.youtube.com/watch?v=VlA_jt_3Qc4) |
| L5 | LLM Tuning | [YouTube](https://www.youtube.com/watch?v=PmW_TMQ3l0I) |
| L6 | LLM Reasoning | [YouTube](https://www.youtube.com/watch?v=k5Fh-UgTuCo) |
| L8 | LLM Evaluation | [YouTube](https://www.youtube.com/watch?v=8fNP4N46RRo) |
| L9 | Recap & Current Trends | [YouTube](https://www.youtube.com/watch?v=Q86qzJ1K1Ss) |

### 4. Stanford CS336: Language Modeling from Scratch, Spring 2025

- 官方系列：[Stanford CS336 playlist](https://www.youtube.com/playlist?list=PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_)
- 当前覆盖：0 / 17
- 建议补录：17 个
- 建议字段：`section=Course`，基础训练内容归 `Other`；Alignment / RL 课次可归 `Agent`，`sourceTier=A`，`recommendation=Core`

| 课次 | 标题 | 直链 |
|---|---|---|
| L1 | Overview and Tokenization | [YouTube](https://www.youtube.com/watch?v=SQ3fZ1sAqXI) |
| L2 | PyTorch, Resource Accounting | [YouTube](https://www.youtube.com/watch?v=msHyYioAyNE) |
| L3 | Architectures, Hyperparameters | [YouTube](https://www.youtube.com/watch?v=ptFiH_bHnJw) |
| L4 | Mixture of Experts | [YouTube](https://www.youtube.com/watch?v=LPv1KfUXLCo) |
| L5 | GPUs | [YouTube](https://www.youtube.com/watch?v=6OBtO9niT00) |
| L6 | Kernels, Triton | [YouTube](https://www.youtube.com/watch?v=E8Mju53VB00) |
| L7 | Parallelism 1 | [YouTube](https://www.youtube.com/watch?v=l1RJcDjzK8M) |
| L8 | Parallelism 2 | [YouTube](https://www.youtube.com/watch?v=LHpr5ytssLo) |
| L9 | Scaling Laws 1 | [YouTube](https://www.youtube.com/watch?v=6Q-ESEmDf4Q) |
| L10 | Inference | [YouTube](https://www.youtube.com/watch?v=fcgPYo3OtV0) |
| L11 | Scaling Laws 2 | [YouTube](https://www.youtube.com/watch?v=OSYuUqGBQxw) |
| L12 | Evaluation | [YouTube](https://www.youtube.com/watch?v=x-R5l2HsXqM) |
| L13 | Data 1 | [YouTube](https://www.youtube.com/watch?v=WePxmeXU1xg) |
| L14 | Data 2 | [YouTube](https://www.youtube.com/watch?v=9Cd0THLS1t0) |
| L15 | Alignment: SFT / RLHF | [YouTube](https://www.youtube.com/watch?v=Dfu7vC9jo4w) |
| L16 | Alignment: RL 1 | [YouTube](https://www.youtube.com/watch?v=46f2QTDB08Q) |
| L17 | Alignment: RL 2 | [YouTube](https://www.youtube.com/watch?v=JdGFdViaOJk) |

### 5. Berkeley LLM Agents MOOC, Fall 2024

- 官方系列：[Berkeley LLM Agents MOOC 2024 playlist](https://www.youtube.com/playlist?list=PLS01nW3RtgopsNLeM936V4TNSsvvVglLc)
- 当前覆盖：5 / 12
- 建议补录：7 个
- 建议字段：`section=Course`，`focusArea=Agent`，`sourceTier=A`，`recommendation=Core`

| 讲者 | 标题 | 直链 |
|---|---|---|
| Dawn Song | Safe AI Agents + Evidence-based AI Policy | [YouTube](https://www.youtube.com/watch?v=QAgR4uQ15rc) |
| Ben Mann | Measuring Agent Capabilities & Responsible Scaling Policy | [YouTube](https://www.youtube.com/watch?v=6y2AnWol7oo) |
| Percy Liang | Open Source & Science with Foundation Models | [YouTube](https://www.youtube.com/watch?v=f3KKx9LWntQ) |
| Nicolas Chapados | AI Agents for Enterprise Workflows | [YouTube](https://www.youtube.com/watch?v=-yf-e-9FvOc) |
| Omar Khattab | Compound AI Systems & DSPy | [YouTube](https://www.youtube.com/watch?v=JEMYuzrKLUw) |
| Burak Gokturk | Enterprise GenAI Trends & AI Agents | [YouTube](https://www.youtube.com/watch?v=Sy1psHS3w3I) |
| Denny Zhou | LLM Reasoning | [YouTube](https://www.youtube.com/watch?v=QL-FS_Zcmyo) |

### 6. Berkeley Agentic AI MOOC, Fall 2025

- 官方系列：[Berkeley Agentic AI MOOC 2025 playlist](https://www.youtube.com/playlist?list=PLS01nW3RtgoqGkm4UeqNeZLccW-OGc1fJ)
- 当前覆盖：0 / 11
- 建议补录：11 个
- 建议字段：`section=Course`，`focusArea=Agent`，`sourceTier=A`，`recommendation=Core`

| 讲者 | 标题 | 直链 |
|---|---|---|
| Dawn Song | Agentic AI Safety & Security | [YouTube](https://www.youtube.com/watch?v=CvZDJxd4LKM) |
| Peter Stone | Autonomous Agents | [YouTube](https://www.youtube.com/watch?v=iDhzzugMOLA) |
| Oriol Vinyals | Multi-Agent Systems in the Era of LLMs | [YouTube](https://www.youtube.com/watch?v=ntjOxjZMaac) |
| Clay Bavor | Practical Lessons from Deploying Agentic Systems | [YouTube](https://www.youtube.com/watch?v=sfJM4LaiYsM) |
| James Zou | AI Agents to Automate Science | [YouTube](https://www.youtube.com/watch?v=yqPIsTTdUkc) |
| Sida Wang | Predictable Noise in LLM Benchmarks | [YouTube](https://www.youtube.com/watch?v=HV8pugcFVO0) |
| Noam Brown | Multi-Agent AI | [YouTube](https://www.youtube.com/watch?v=SrLcGdVOb9w) |
| Weizhu Chen | Training Agentic Models | [YouTube](https://www.youtube.com/watch?v=xNxrBHZPDvM) |
| Jiantao Jiao | Post-Training Verifiable Agents | [YouTube](https://www.youtube.com/watch?v=3l0Zxus34es) |
| Yangqing Jia | Evolution of System Designs | [YouTube](https://www.youtube.com/watch?v=xqRAS6rAouo) |
| Yann Dubois | LLM Agents Overview | [YouTube](https://www.youtube.com/watch?v=r1qZpYAmqmg) |

### 7. ETH Zürich Robot Learning: From Fundamentals to Foundation Models, Spring 2026

- 官方课程页：[ETH Robot Learning](https://cvg.ethz.ch/lectures/Robot-Learning/)
- 当前覆盖：1 / 11
- 建议补录：10 个
- 建议字段：`section=Course`，主体归 `Robotics`；L8 可归 `World Model`，L10 可归 `Agent` 或 `Robotics`，`sourceTier=A`，`recommendation=Core`

| 课次 | 标题 | 直链 |
|---|---|---|
| L2 | Robot Control & MDPs | [YouTube](https://www.youtube.com/watch?v=5-Bb84eTTqQ) |
| L3 | Imitation Learning | [YouTube](https://www.youtube.com/watch?v=Ef4R5s1LqoQ) |
| L4 | Reinforcement Learning I | [YouTube](https://www.youtube.com/watch?v=90raNpc11tQ) |
| L5 | Reinforcement Learning II | [YouTube](https://www.youtube.com/watch?v=AdTGz8YnnlE) |
| L6 | Generative Models | [YouTube](https://www.youtube.com/watch?v=qd6Ldsuu46I) |
| L7 | Sequence Modeling & Transformers | [YouTube](https://www.youtube.com/watch?v=imSTfMJjp7M) |
| L8 | World Models | [YouTube](https://www.youtube.com/watch?v=cTTmUZlOF2s) |
| L9 | Generalist Robot Policies | [YouTube](https://www.youtube.com/watch?v=dtofzDY9zuo) |
| L10 | Embodied Reasoning and Test-time Scaling | [YouTube](https://www.youtube.com/watch?v=CxhrjQuGEuE) |
| L11 | Frontier & Open Problems | [YouTube](https://www.youtube.com/watch?v=eL4lcy1KNzE) |

## 二、P1：补足基础主干的 36 个视频

### 8. DeepMind × UCL Reinforcement Learning Lecture Series 2021

- 官方系列：[DeepMind × UCL RL playlist](https://www.youtube.com/playlist?list=PLqYmG7hTraZDVH599EItlEWsUOsJbAodm)
- 当前覆盖：0 / 13
- 建议补录：13 个
- 建议字段：`section=Course`，一般归 `Other`；Planning / Models 可归 `World Model`，`sourceTier=A`，`recommendation=Recommended`

| 课次 | 标题 | 直链 |
|---|---|---|
| L1 | Introduction to Reinforcement Learning | [YouTube](https://www.youtube.com/watch?v=TCCjZe0y4Qc) |
| L2 | Exploration and Control | [YouTube](https://www.youtube.com/watch?v=aQJP3Z2Ho8U) |
| L3 | MDPs and Dynamic Programming | [YouTube](https://www.youtube.com/watch?v=zSOMeug_i_M) |
| L4 | Theoretical Foundations of Dynamic Programming | [YouTube](https://www.youtube.com/watch?v=XpbLq7rIJAA) |
| L5 | Model-free Prediction | [YouTube](https://www.youtube.com/watch?v=eaWfWoVUTEw) |
| L6 | Model-free Control | [YouTube](https://www.youtube.com/watch?v=t9uf9cuogBo) |
| L7 | Function Approximation | [YouTube](https://www.youtube.com/watch?v=ook46h2Jfb4) |
| L8 | Planning and Models | [YouTube](https://www.youtube.com/watch?v=FKl8kM4finE) |
| L9 | Policy Gradient and Actor-Critic | [YouTube](https://www.youtube.com/watch?v=y3oqOjHilio) |
| L10 | Approximate Dynamic Programming | [YouTube](https://www.youtube.com/watch?v=AJejcug2brU) |
| L11 | Multi-step and Off-policy Learning | [YouTube](https://www.youtube.com/watch?v=u84MFu1nG4g) |
| L12 | Deep Reinforcement Learning 1 | [YouTube](https://www.youtube.com/watch?v=cVzvNZOBaJ4) |
| L13 | Deep Reinforcement Learning 2 | [YouTube](https://www.youtube.com/watch?v=siDtNqlPoLk) |

### 9. MIT 6.8210 Underactuated Robotics, Spring 2024

- 官方讲义：[Underactuated Robotics](https://underactuated.mit.edu/)
- 官方系列：[MIT Underactuated Robotics playlist](https://www.youtube.com/playlist?list=PLkx8KyIQkMfU5szP43GlE_S1QGSPQfL9s)
- 当前覆盖：1 / 24（L16 已收录）
- 建议补录：23 个
- 说明：官方播放列表为课程教学需要混用了少量往年录制版本，应保留官方标题与年份，不要统一伪标为 2024。
- 建议字段：`section=Course`，`focusArea=Robotics`，`sourceTier=A`，`recommendation=Recommended`

| 课次 | 标题 | 直链 |
|---|---|---|
| L1 | Robot Dynamics and Model-Based Control | [YouTube](https://www.youtube.com/watch?v=uyyBT-MHhLE) |
| L2 | Nonlinear Dynamics | [YouTube](https://www.youtube.com/watch?v=l2CwE3Wf7ww) |
| L3 | Dynamic Programming I | [YouTube](https://www.youtube.com/watch?v=GPvw92IKO44) |
| L4 | Dynamic Programming II | [YouTube](https://www.youtube.com/watch?v=GElVy0WTOys) |
| L5 | Acrobots, Cart-poles, Quadrotors I | [YouTube](https://www.youtube.com/watch?v=UBPL0IbyJy4) |
| L6 | Dynamic Programming III | [YouTube](https://www.youtube.com/watch?v=ZBS9-4LkSIQ) |
| L7 | Lyapunov Analysis I | [YouTube](https://www.youtube.com/watch?v=qbuyy7ZcP9M) |
| L8 | Computing Lyapunov Functions I | [YouTube](https://www.youtube.com/watch?v=ywFpp1dy0zQ) |
| L9 | Computing Lyapunov Functions II | [YouTube](https://www.youtube.com/watch?v=e1BXMe64xJ8) |
| L10 | Trajectory Optimization I | [YouTube](https://www.youtube.com/watch?v=wND0k16gCdk) |
| L11 | Trajectory Optimization II | [YouTube](https://www.youtube.com/watch?v=IQlwn9wLnJs) |
| L12 | Trajectory Stabilization | [YouTube](https://www.youtube.com/watch?v=j0Phrs3ATK0) |
| L13 | Simple Models of Walking | [YouTube](https://www.youtube.com/watch?v=N37FMfOioK0) |
| L14 | Hybrid Trajectory Optimization | [YouTube](https://www.youtube.com/watch?v=P64JhXLsjwY) |
| L15 | Planning and Control Through Contact | [YouTube](https://www.youtube.com/watch?v=LF6IkHSRtaY) |
| L17 | Mixed Discrete / Continuous Optimization | [YouTube](https://www.youtube.com/watch?v=mqyAs9CKVGw) |
| L18 | Sampling-based Motion Planning | [YouTube](https://www.youtube.com/watch?v=ChiQgvVvgKM) |
| L19 | Stochastic Dynamics | [YouTube](https://www.youtube.com/watch?v=Nj8FvDZ4d9I) |
| L20 | Stochastic Control | [YouTube](https://www.youtube.com/watch?v=QYDsB0qs_x8) |
| L21 | Robust Control and Policy Search | [YouTube](https://www.youtube.com/watch?v=eEOmmpA1GAw) |
| L22 | Output Feedback | [YouTube](https://www.youtube.com/watch?v=QIDisUxobFk) |
| L23 | Feedback Motion Planning | [YouTube](https://www.youtube.com/watch?v=5fYG1JLwBSc) |
| L24 | Imitation Learning, Foundation Models, and Wrap-up | [YouTube](https://www.youtube.com/watch?v=ww1flzLixHo) |

## 三、P2：前沿官方内容与 Reserve 候选（11 个）

### 已收录（5 个）

| 优先级 | 方向 | 标题 / 来源 | 建议字段 | 理由 |
|---|---|---|---|---|
| P0 | World Model | [A Path Towards Autonomous Machine Intelligence — Yann LeCun / AFOSR](https://www.youtube.com/watch?v=EvSe0ktD95k) | `Talk · World Model · A · Core` | JEPA / 世界模型路线的代表性完整演讲，来源为美国空军科研机构。 |
| P0 | World Model | [An Introduction to NVIDIA Cosmos World Foundation Models — GTC 2025](https://www.youtube.com/watch?v=kChwwFb5gMU) | `Talk · World Model · A · Core` | 比仓库中第三方 Cosmos 解读更适合作为官方主条目。 |
| P0 | World Model | [Genie 3: An Infinite World Model — Shlomi Fruchter & Jack Parker-Holder](https://www.youtube.com/watch?v=n5x6yXDj0uo) | `Interview · World Model · A · Core` | 来自 Google DeepMind，兼具研究背景和系统解释。 |
| P1 | Robotics | [RSS 2024 Tutorial: Supervised Policy Learning for Real Robots](https://www.youtube.com/watch?v=jIB_joS7ww8) | `Course · Robotics · A · Recommended` | 完整学术教程，覆盖真实机器人策略学习的关键实践。官方教程页见 [RSS tutorial](https://supervised-robot-learning.github.io/)。 |
| P1 | Agent | [Tips for Building AI Agents — Anthropic](https://www.youtube.com/watch?v=LP5OCa20Zpg) | `Talk · Agent · A · Recommended` | 官方、紧凑、工程导向，适合补齐从研究到实现的连接。 |

### 已排除的官方短演示（6 个）

这些视频权威且前沿，但偏短、偏产品演示，不应挤占长课程和完整演讲的主推荐位。

| 方向 | 标题 / 来源 | 建议字段 |
|---|---|---|
| World Model | [Genie 3: Creating Dynamic Worlds in Real Time — Google DeepMind](https://www.youtube.com/watch?v=PDKhUknuQDg) | `Talk · World Model · A · Reserve` |
| World Model | [Introducing GAIA-1 — Wayve](https://www.youtube.com/watch?v=5Jx2QgEUZUI) | `Talk · World Model · A · Reserve` |
| World Model | [Scaling GAIA-1 — Wayve](https://www.youtube.com/watch?v=OVX-eTLyA9g) | `Talk · World Model · A · Reserve` |
| World Model | [NVIDIA Cosmos — Official Demo](https://www.youtube.com/watch?v=9Uch931cDx8) | `Talk · World Model · A · Reserve` |
| Robotics | [Gemini Robotics — Google DeepMind](https://www.youtube.com/watch?v=4MvGnmmP3c0) | `Talk · Robotics · A · Reserve` |
| Robotics | [Gemini Robotics 1.5 — Google DeepMind](https://www.youtube.com/watch?v=UObzWjPb6XM) | `Talk · Robotics · A · Reserve` |

## 四、中文资源候选：严格控制来源

中文搜索结果里，很多“全集”“最新课程”来自 SEO 账号或二次搬运，标题、年份和版权经常不可靠。建议只收官方机构、课程主讲人或活动组织方上传的版本。

目前值得人工复核的一项：

- [具身智能强化营：机器人学基础（清华 AIR × 地瓜机器人，6 讲）](https://www.bilibili.com/video/BV15ptXzxEPh/)：主题和质量匹配，但录入前应核验上传账号是否获得组织方授权；在确认前建议 `sourceTier=B`、`recommendation=Reserve`。

暂不建议收录：来源为课程搬运号的“上海交大大模型智能体课程”、各类“李宏毅 2026 全集”和无机构背书的论文解读合集。它们可能内容不错，但不满足 ScholarTube 的权威来源标准。

## 五、建议观察名单

以下方向非常值得跟踪，但目前没有找到足够权威、完整的长视频，先不要用第三方解说凑数：

- **V-JEPA 2**：Meta 官方将其定位为面向理解、预测、规划以及机器人控制的视频世界模型；等 Meta / FAIR 发布完整研究演讲后再收录。参考：[Meta V-JEPA 2](https://ai.meta.com/research/vjepa/)。
- **GAIA-4**：Wayve 已发布新一代生成式世界模型信息，但目前以网页和短片为主；等待完整 technical talk。参考：[Wayve GAIA-4](https://wayve.ai/thinking/gaia-4/)。
- **Stanford CS329A: Self-Improving AI Agents**：课程覆盖 test-time scaling、verification、RL、coding agents、memory、evaluation 和 robotics，和 ScholarTube 的 Agent 主线高度匹配；目前应持续追踪 Stanford 官方上传。参考：[Stanford CS329A](https://cs329a.stanford.edu/)。
- **Google DeepMind Genie 系列**：继续监控官方研究访谈和技术报告视频，不收无来源的“论文速读”。参考：[Google DeepMind Genie](https://deepmind.google/models/genie/)。

## 六、录入策略建议

1. **先完成系列，再继续增加随机访谈。** 第一批建议直接录入 P0 的 69 个，能立刻把 Vision、Agent、World Model、Robotics 四条主线补成体系。
2. **系列使用稳定 `seriesId`。** 建议分别使用：`stanford-cs231n-2025`、`stanford-cme296-2026`、`stanford-cme295-2025`、`stanford-cs336-2025`、`berkeley-llm-agents-2024`、`berkeley-agentic-ai-2025`、`eth-robot-learning-2026`、`deepmind-ucl-rl-2021`、`mit-underactuated-2024`。
3. **去重以平台 ID 为主。** 标题会有拼写、年份和标点差异，不能只按规范化标题判断；YouTube 用 `videoId`，Bilibili 用 `BV` 号。
4. **短演示默认 Reserve。** 除非它是某项新模型唯一的官方视频，否则完整课程、研究演讲和长访谈应优先。
5. **避免把所有基础 LLM 内容都塞入 Other。** 如果数据结构暂时只能有一个 `focusArea`，建议按该讲的主要用途分类；长期可考虑增加 `topics[]`，例如 `reasoning`、`alignment`、`evaluation`、`world-model`、`robot-policy`、`multimodal`。
6. **推荐位按内容而不是名气。** `Core` 应用于能建立完整知识框架、或代表一条关键技术路线的内容；单纯产品宣传即使来自大厂，也更适合 `Reserve`。

## 七、建议执行批次

| 批次 | 内容 | 数量 | 录入后总量 |
|---|---|---:|---:|
| Batch 1 | P0：7 组课程补全 | 69 | 615 |
| Batch 2 | P1：DeepMind RL + MIT Underactuated | 36 | 651 |
| Batch 3 | P2：非短演示的官方前沿内容 | 5 | 656 |
| Excluded | P2：官方短演示 | 0 / 6 | 656 |

更稳妥的目标不是立刻追求“数量最多”，而是先把 **615 条版本**做成四条主线都可系统学习的资源库；随后再把 36 个基础课程和 11 个前沿条目分批加入。
