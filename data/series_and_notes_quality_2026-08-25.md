# Series & Notes Quality Pass — 2026-08-25

Structural and metadata quality upgrade for the existing catalog (no resources
added or removed; `id`, `videoId`, and `url` untouched on every entry). All
changes are produced by idempotent scripts so the pass can be re-run safely
after merges:

```bash
npm run curation:apply   # = taxonomy:apply → series:apply → notes:apply
```

## Summary

| Metric | Before | After |
| --- | --- | --- |
| Resources | 1025 | 1025 (unchanged) |
| Series | 57 | 99 (+42) |
| Resources with a `seriesId` | 452 | 681 (+229) |
| Un-seried Talk / Course / Interview | 353 / 139 / 81 | 163 / 109 / 72 |
| Boilerplate `notes` | 942 | 0 |
| Editorial `notes` rewritten | — | 942 (Core 644 · Recommended 228 · Reserve 70) |
| Taxonomy corrections | — | 13 (6 `section`, 7 `focusArea`) |

## 1. Series consolidation

`scripts/apply-course-series.mjs` gained a `Talk` definition group (previously
only `Course` and `Interview` were matched, which is why every Talk was
un-seried) plus new Course/Interview definitions. Grouping principles:

- **Same conference** → one cross-edition series ordered by date
  (`YYYYMMDD`), following the existing `mit-6s191 — Editions` precedent. This
  keeps single-talk editions (e.g. the lone ICLR 2014 talk) inside a useful
  shelf instead of forcing per-year singletons.
- **Same institutional seminar** (CMU RI Seminar, Stanford ENGR319, Stanford
  HAI Seminar, MIT Robotics/EI seminars, VALSE Webinar, …) → one series
  ordered by date or episode number.
- **Same course playlist / creator series** (CS224N editions, Karpathy
  Zero-to-Hero, 跟李沐学AI 科研经验, Yannic Kilcher paper explainers, …).
- **Same interview program** (机器之心访谈, Stanford HAI fireside chats,
  Google DeepMind official conversations).
- **Single events with same-day uploads** (KDD 2025, CVPR 2021 VOCVALC, ETH
  CVG June 2026, BAAI 2026 forums) use explicit program-order `videoId` maps.
- Equal `seriesOrder` values inside one series are now tie-broken
  deterministically (stable id order, `+0.01` steps) so display order never
  depends on file order.

### New series (42)

| Series id | Title | Section | Members |
| --- | --- | --- | --- |
| `neurips-invited-talks` | NeurIPS Invited Talks & Keynotes | Talk | 35 |
| `cmu-ri-seminar` | CMU Robotics Institute Seminar (RI Seminar) | Talk | 15 |
| `iclr-invited-talks` | ICLR Invited Talks & Keynotes | Talk | 14 |
| `icml-invited-talks` | ICML Invited Talks | Talk | 14 |
| `stanford-robotics-seminar-engr319` | Stanford Robotics Seminar (ENGR319) | Talk | 13 |
| `mlsys-conference-talks` | MLSys Keynotes & Invited Talks | Talk | 10 |
| `google-deepmind-conversations` | Google DeepMind: Conversations & Research Films | Talk + Interview | 7 |
| `cvpr-keynotes` | CVPR Keynotes & Invited Talks | Talk | 6 |
| `nvidia-executive-keynotes` | NVIDIA Executive Keynotes | Talk | 5 |
| `stanford-hai-seminar` | Stanford HAI Seminar | Talk | 5 |
| `nobel-prize-lectures-2024` | Nobel Prize Lectures — 2024 Physics & Chemistry Laureates | Talk | 5 |
| `stanford-mlsys-seminar` | Stanford MLSys Seminar | Talk | 4 |
| `kdd-2025-keynotes` | KDD 2025 Keynotes | Talk | 4 |
| `jiqizhixin-interviews` | 机器之心访谈 | Interview | 4 |
| `valse-webinar` | VALSE Webinar | Talk | 4 |
| `stanford-seminar-series` | Stanford Seminar (Stanford Online) | Talk | 4 |
| `aishwarya-srinivasan-agentic-ai-explainers` | Aishwarya Srinivasan: Agentic AI Explainers | Course | 4 |
| `limu-research-advice` | 跟李沐学AI：论文精读·科研经验 | Course | 4 |
| `xiaoboshi-awake-research-methods` | 小博士Awake：科研方法系列 | Course | 4 |
| `stanford-hai-conversations` | Stanford HAI Fireside Chats & Conversations | Interview | 3 |
| `stanford-cs224n-editions` | Stanford CS224N: NLP with Deep Learning — Editions | Course | 3 |
| `karpathy-neural-networks-zero-to-hero` | Andrej Karpathy: Neural Networks — Zero to Hero | Course | 3 |
| `cvpr-wad-keynotes` | CVPR Workshop on Autonomous Driving — Keynotes | Talk | 3 |
| `mit-embodied-intelligence-seminar` | MIT Embodied Intelligence Seminar | Talk | 3 |
| `talks-at-google` | Talks at Google | Talk | 3 |
| `prcv-conference-sessions` | 中国模式识别与计算机视觉大会（PRCV）— 会议实录 | Talk | 3 |
| `yannic-kilcher-paper-explained` | Yannic Kilcher: ML Research Papers Explained | Course | 3 |
| `cvpr-2021-vocvalc-workshop` | CVPR 2021 VOCVALC Workshop — Keynotes | Talk | 3 |
| `eth-cvg-invited-talks-2026` | ETH Zürich CVG Invited Talks — June 2026 | Talk | 3 |
| `mit-robotics-seminar` | MIT Robotics Seminar | Talk | 3 |
| `iccv-keynotes` | ICCV Keynotes & Invited Talks | Talk | 3 |
| `eccv-keynotes` | ECCV Keynotes & Invited Talks | Talk | 3 |
| `ibm-technology-ai-explainers` | IBM Technology: Agentic AI Explainers | Talk | 3 |
| `cmu-11-785-spring-editions` | CMU 11-785: Introduction to Deep Learning — Spring Editions | Course | 2 |
| `ai3sd-seminar-series` | AI3SD Seminar Series | Talk | 2 |
| `qingke-talk` | 青稞Talk | Talk | 2 |
| `stanford-cs230-editions` | Stanford CS230: Deep Learning — Editions | Course | 2 |
| `icra-legged-robots-workshop` | ICRA Workshop on Legged Robots | Talk | 2 |
| `cvpr-2021-embodied-ai-workshop` | CVPR 2021 Embodied AI Workshop | Course | 2 |
| `agi-next-summit-2026` | AGI Next 前沿峰会 — 2026 | Talk | 2 |
| `simon-peyton-jones-research-skills` | Simon Peyton Jones: Research Skills Lectures (Microsoft Research) | Talk | 2 |
| `acm-turing-award-lectures` | ACM Turing Award Lectures | Talk | 2 |

### Existing series extended

| Series | Before → After | How |
| --- | --- | --- |
| `baai-conference-2026` | 4 → 7 | The three 智源大会 forum recordings sat in `Talk`, which the matcher previously never scanned; explicit program order added for same-day uploads. |
| `tum-ai-lecture-series` | 2 → 4 | Two "TUM AI Lecture Series - …" talks on the Matthias Niessner channel joined via a Talk-side definition with the same id. |
| `stanford-cs25-transformers-united` | 11 → 13 | ST-165/ST-168 reclassified from Talk to Course (see below) and now match the existing definition. |
| `good-citizen-cvpr-2018-research-practice` | 2 → 3 | ST-870 is literally "Part 1" of the same CVPR18 workshop; series is now ordered by part number (1/2/3). |

### Considered and deliberately skipped

- **freeCodeCamp.org (8 Course)** — independent standalone full courses, not
  one playlist; a channel-level "series" would be navigational noise.
- **Microsoft Research misc (8 Talk)** — heterogeneous keynotes/lectures from
  different events spanning 2016–2022; only the two Simon Peyton Jones
  research-skills lectures form a real series.
- **Y Combinator (Fei-Fei Li / Chelsea Finn, 2025)** — likely the same AI
  Startup School event but the titles/notes do not verify it; left un-seried
  rather than asserting an unverified event linkage.
- **MissGodOne (4 论坛 recordings)** — probably WAIC 2026 forums, but the
  titles never say so; not asserted.
- **Translation/re-upload channels (京口先生, Gelai_AI, 嫣予゜, Steven Van
  Vaerenbergh)** — a translator channel is not a program; grouping would imply
  editorial series identity that does not exist.
- **Stanford Webinar pair, Simons Institute (3), AI开讲啦 (3), OpenMMLab (3),
  Hugging Face (3), Vizuara (3)** — heterogeneous one-offs.
- **Stanford CS229 leftovers (ST-077, ST-085)** — different editions, and
  ST-077 is a guest lecture; an "editions" series with these two would mix a
  full course intro with a topic lecture.

## 2. Editorial notes

`scripts/apply-editorial-notes.mjs` replaces 16 known provenance-boilerplate
strings (942 occurrences, e.g. *"Matched to the target official channel;
public metadata accessible."*) with a 1–2 sentence editorial note built only
from already-verified fields: speaker, format, channel, domain/keywords,
recommendation tier, focusArea shelf, series placement, publish date,
duration (interviews), and view-count snapshot. No unverified facts are
introduced. Examples:

> Andrej Karpathy — 209-minute podcast interview on Lex Fridman, centered on
> robotics and embodied AI. Core selection for the Robotics shelf; part of
> Lex Fridman Podcast, published 2022-10-29 (~3.9M views).

> Course lecture from Stanford Online covering computer vision. Core
> selection for the Vision shelf; lecture 3 in Stanford CS231N: Deep Learning
> for Computer Vision — Spring 2025.

Safeguards:

- 83 bespoke, hand-written notes were detected and left untouched (including
  the Nobel/ACM/Moonshot/DeepSeek annotations).
- The MIT 18.065 notes keep the canonical MIT OCW course link that the old
  boilerplate carried.
- Junk speaker values (episode labels like "MedAI #92", "青稞Talk 144期",
  "2021-CVPR", truncated titles) are filtered out instead of being quoted.
- Provenance is not lost: it lives in the dedicated `sourceTier`,
  `metadataVerifiedVia`, and `metadataVerificationStatus` fields.
- Rewrite scope: Core 644, Recommended 228, Reserve 70 (all tiers cleared in
  one pass since generation is scripted).

## 3. Taxonomy corrections (13)

Applied by `scripts/apply-taxonomy-fixes.mjs`; each fix is guarded (applies
only if the current value still matches the expected old value).

| Id | Field | From → To | Evidence |
| --- | --- | --- | --- |
| ST-158 | section | Talk → Course | "Stanford CS224W … Lecture 7.2" is a numbered course-playlist lecture. |
| ST-165 | section | Talk → Course | Stanford CS25 V5 session; the other 11 CS25 sessions are Course (`stanford-cs25-transformers-united`). |
| ST-168 | section | Talk → Course | Stanford CS25 V3 session; same course seminar playlist. |
| ST-394 | section | Course → Talk | One-off "Stanford Seminar - …" research talk; siblings ST-373/376/378 are Talk. |
| ST-398 | section | Course → Talk | CMU "RI Seminar:" invited talk; the other 13 RI Seminars are Talk. |
| ST-399 | section | Course → Talk | Same as ST-398. |
| ST-870 | focusArea | Other → How to Research | Part 1 of the CVPR18 Good-Citizen workshop; Parts 2–3 carry How to Research; domain is Research Practice / Research Community. |
| ST-882 | focusArea | Other → How to Research | Domain Research Practice / Wellbeing; siblings ST-879/880/881 carry How to Research. |
| ST-048 | focusArea | World Model → Other | Intel CEO interview on the semiconductor supply chain; no world-model content in title/domain/keywords. |
| ST-052 | focusArea | World Model → Other | Scale AI CEO interview on data infrastructure/industry. |
| ST-054 | focusArea | World Model → Other | ServiceNow CEO interview on scaling enterprises with AI. |
| ST-049 | focusArea | World Model → Robotics | π0 robot foundation model interview (Sergey Levine); keywords lead with Robotics / Embodied AI. |
| ST-059 | focusArea | World Model → Robotics | Waymo self-driving foundation model interview (Drago Anguelov); same evidence. |

Observation (not changed): 68% of entries are `Core`, which dilutes the tier
signal; re-tiering was out of scope for this pass. The `keywords` column also
mixes two conventions (`A / B` vs `A; B; C`) — harmless for search, left as-is
to avoid churning ~1000 rows.

## 4. Verification

- **Idempotence** — `npm run curation:apply` executed three times in
  sequence; the second and third runs leave `scholar_tube_resources.json` and
  `.csv` byte-identical (md5 verified). Notes pass reports
  `rewritten: 0, alreadyGenerated: 942` on re-run.
- **Integrity** — JSON parses; 1025 rows; `id` and `videoId` unique; every
  series has ≥ 2 members and exactly one title; zero duplicate `seriesOrder`
  values inside any series after tie-breaking; no `NaN`/missing orders.
- **Build** — `npm run build` (Vite + publish-root) succeeds against the
  updated JSON. Built artifacts (`index.html`, `dist/`, `assets/`) were
  intentionally **not** committed so the site can be rebuilt once after all
  parallel content PRs merge.

## 5. Merge guidance vs. the catalog-expansion branch

A parallel agent adds new resources to the same JSON/CSV. If this branch
conflicts with catalog-expansion on `data/scholar_tube_resources.json` or
`.csv`:

1. Keep **both** sides' resources (union of entries; the expansion agent adds,
   this branch only edits fields in place).
2. Re-run `npm run curation:apply` from this branch's scripts. It will
   re-derive series membership/order, regenerate the CSV, and upgrade any
   boilerplate notes the new resources carry — all idempotently.
3. The discovery-layer branch (`cursor/discovery-content-polish-b49a`) only
   touches `src/`; no overlap with this branch (which never touches `src/`).
