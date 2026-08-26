# ScholarTube content expansion — World Models, research craft, and Vision keynotes — 2026-08-25

## Result

- Baseline at re-run: 1096 resources (main + PR #3 podcast catalog)
- Added: 79 resources (ST-1098 … ST-1176; remapped from PR #6’s original ST-1027 … ST-1105 to avoid colliding with podcast IDs)
- New total: 1175 resources
- By focus area: World Model +35, How to Research +35, Other +5, Vision +4
- By section: Course +52, Talk +27
- Existing entries attached to now-complete series (no other fields touched): ST-866, ST-985, ST-987

## What was added and why

### World Models — course backbone

- **UC Berkeley CS285 Fall 2023, Lectures 10–12 (14 part-videos, RAIL channel).** The index carried CS285 F23 only through Lecture 2; this adds the complete model-based block — Lecture 10 “Optimal Control and Planning”, Lecture 11 “Model-Based Reinforcement Learning”, Lecture 12 “Model-Based Policy Learning” — the canonical university treatment of learning dynamics models, planning through them, and training policies inside them.
- **David Silver’s RL Course (UCL 2015), Lecture 8 “Integrating Learning and Planning” (Google DeepMind channel).** The classic Dyna / simulation-based-search lecture. Lectures 1–7 and 9–10 were deliberately excluded: the complete DeepMind x UCL 2021 successor series is already indexed.
- **Pieter Abbeel, “Foundations of Deep RL” (6 lectures, author’s channel, 2021).** A compact complete pathway ending in L6 “Model-based RL”. L1–L5 are general deep-RL foundations and are filed under Broader AI; L6 under World Models.

### World Models — invited talks

- **Simons Institute workshop “Topics in Intelligence: World Models and Social Reasoning” (June 2026), 11 talks** (Isola, Gopnik, Andreas, Dumas, Zoran, Artzi, Efros, Malik, Suhr, Liang, Darrell) joining the two talks already indexed (ST-985 Lenore Blum, ST-987 Shiry Ginosar), which were also attached to the new series id. Titles, speakers, and dates cross-checked against the official schedule (simons.berkeley.edu).
- **Jacob Andreas, “Language Models as World Models?” (Simons, June 2024)** — the language-side counterpoint, verified against the Simons talk page.
- **Sherry Yang, “Learning World Models and Agents for High-Cost Environments” (Kempner Institute at Harvard)** — long-form seminar from the UniSim (ICLR 2024 outstanding paper) author, with a live interactive world-model demo.
- **CVPR Workshop on Autonomous Driving keynotes (organizer channel “WAD at CVPR”), 6 world-model keynotes**: Elluswamy CVPR’23 (foundation models for autonomy), Kendall CVPR’24 (road to embodied AI / GAIA lineage), Fidler CVPR’24 (next-gen AV with foundation models), Urtasun CVPR’22 (learned closed-loop simulation), Hongyang Li CVPR’25 (world engine), Wei Zhan CVPR’25 (scalable neural simulation). Keynote titles were taken from the official wad.vision programmes or the organizer’s own chapter listings, not inferred.

### How to Research

- **Richard Hamming, “Learning to Learn: The Art of Doing Science and Engineering” — the complete 1995 NPS capstone course (31 sessions incl. the 1990 SGL prologue)** from the NPS-maintained “Hamming on Hamming” channel (linked as the best-quality encodings at nps.edu/web/cs/hamming-resources). The task brief names Hamming as the style exemplar for this direction; the course is its systematic long form. The closing “You and Your Research” session was **not** re-added: the same lecture is already indexed as ST-866, which was attached to the series instead. Meta-sessions (Orientation, Creativity, Experts, Unreliable Data, Systems Engineering, You Get What You Measure, How Do We Know What We Know, SGL) are Core; topic chapters are Recommended.
- **Patrick Winston, “How to Speak” (MIT OpenCourseWare)** — the missing anchor lecture on research talks.
- **Kayvon Fatahalian, “Kayvon’s Tips for Giving Clear Talks”** (author’s channel) — slide-level craft complementing Winston.
- **Steven Pinker, “Linguistics, Style and Writing in the 21st Century” (The Royal Institution)** — the theory behind the index’s practical writing talks.
- **Uri Alon’s TED talk on “the cloud”** — under the 18-minute bar but retained as the canonical short statement of embracing the disoriented middle of research; official TED upload, labelled Recommended.

### Vision

- **4 authoritative long keynotes from the WAD organizer channel**: Karpathy CVPR’21 (Tesla’s camera-first stack and data engine — the primary technical talk behind interviews already indexed), Elluswamy CVPR’22 (occupancy networks debut), Ramanan CVPR’25 (perception and simulation), Leal-Taixé CVPR’25 (repurposing generative models for 3D data).
- **Stanford CME296 (Diffusion & Large Vision Models, Spring 2026) was checked for missing lectures: the official Stanford Online listing currently ends at Lecture 8, which the index already carries.** No residual gap to fill; the series remains complete as published.
- Stanford CS231n Spring 2025 was re-checked and is complete in the index at 18 lectures.

## Deliberate exclusions

- **Hamming “You and Your Research” (official-channel upload, e3msMuwqp-o)** — content-duplicate of ST-866; the index prefers one canonical copy per lecture.
- **David Silver course lectures other than Lecture 8** — superseded by the complete DeepMind x UCL 2021 series already indexed.
- **Remaining WAD keynotes** (Waymo/Zoox/Cruise deployment and dataset-challenge talks, Levine CVPR’22, Finn CVPR’23, Chitta/Zhou/Pavlakos CVPR’24, Burgard/Wu/Liu CVPR’25, full-day stream) — deployment- or dataset-focused rather than world-model/vision mechanism talks, or robotics-oriented overlap with existing coverage.
- **UMich EECS 498 “Deep Learning for Computer Vision”** — high quality but largely duplicates the complete CS231n Spring 2025 series already indexed.
- **NeurIPS/ICML world-model tutorials hosted on SlidesLive** — registration-gated, no public canonical recording to verify.
- **Agents direction: no additions in this batch.** The remaining budget was spent on the two named priority gaps; Agents already stands at ~201 entries with complete Berkeley LLM-Agents and Agentic-AI MOOC series, and sibling PRs are expanding adjacent podcast coverage. Candidates reviewed (product launch talks, framework demos) did not clear the mechanism-over-marketing bar.
- **Additional Chinese-language world-model material** — the index already carries the BAAI 2026 and WAIC 2026 world-model forum sessions and several long Chinese interviews; no verified official-channel candidate added new coverage.

## Verification method

- Every record was verified live against public YouTube metadata at collection time: **oEmbed** for canonical title and channel (with an expected-channel assertion per candidate), the **public watch page** for view-count snapshot and exact publish date, and **playlist badges or public search listings** for duration.
- YouTube's player API (innertube) returns LOGIN_REQUIRED from this network, so subtitle tracks could not be enumerated; `metadataVerificationStatus` is recorded as **Partial** for the batch, consistent with existing YouTube entries in the corpus.
- Candidates that failed any check were skipped, never estimated: none failed in the final run.
- Candidates already present in the corpus at run time (idempotency guard): none.

## Series added or completed

- berkeley-cs285-fall-2023: 14 new items
- hamming-learning-to-learn-1995: 31 new items
- abbeel-foundations-of-deep-rl-2021: 6 new items
- david-silver-rl-2015: 1 new item
- (standalone): 6 new items
- simons-world-models-social-reasoning-2026: 11 new items
- cvpr-wad-keynotes: 10 new items
