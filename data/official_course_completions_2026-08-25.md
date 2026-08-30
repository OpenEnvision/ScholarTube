# Official course-series completions — 2026-08-25

## Result

- Baseline at merge: 1,175 resources (max id ST-1176, after podcast + world-models expansions)
- Added: **77 resources**, all `section=Course`, all sourceTier A (official / original creator)
- New total: 1,252 resources
- ID range: **ST-1200 – ST-1276** (deliberately reserved so this expansion unions cleanly with the sibling expansions that started at ST-1027; ST-1027–ST-1199 were never used here)
- Add script: `scripts/add-official-course-completions-2026-08-25.mjs` (`npm run courses:complete`, idempotent — a second run adds 0)

## Series completed (before → after)

| seriesId | Series | Before | After | Added | Coverage after this change |
| --- | --- | ---: | ---: | ---: | --- |
| `stanford-cs234-2024` | Stanford CS234: Reinforcement Learning — 2024 | 4 | 16 | 12 | Complete: all 16 lectures of the official Stanford Online Spring 2024 playlist |
| `mit-6-5940-efficientml-fall-2023` | MIT 6.5940: EfficientML.ai — Fall 2023 | 4 | 24 | 20 | Complete: all 23 lectures (in-person recordings) plus the pre-existing Lecture 1 Zoom variant |
| `cs50-ai-python-2020` | CS50's Introduction to AI with Python — 2020 | 4 | 7 | 3 | Complete: all 7 numbered lectures (0–6) |
| `full-stack-deep-learning-2022` | Full Stack Deep Learning — 2022 | 5 | 9 | 4 | Complete: all 9 numbered lectures |
| `karpathy-neural-networks-zero-to-hero` | Andrej Karpathy: Neural Networks — Zero to Hero | 3 | 9 | 6 | Complete: all 9 builder lectures on Karpathy's own channel |
| `mit-6s191-introduction-to-deep-learning` | MIT 6.S191 — Editions | 4 | 7 | 3 | Gapless modern edition run 2020–2026 (intro lecture per year) |
| `nyu-deep-learning-2026` | NYU Deep Learning — 2026 | 2 | 9 | 7 | Complete as published: Lessons 01–09 are all the 2026 lessons public so far |
| `cmu-11-785-fall-2025` | CMU 11-785: Introduction to Deep Learning — Fall 2025 | 2 | 24 | 22 | Complete as published: every distinct public lecture in the official Fall 2025 playlist |

## Verification method

Every row was verified on 2026-08-25 against public metadata; no duration, date, or view count was invented.

1. **Official playlist inventories** — each course's official YouTube playlist page was fetched and parsed for membership, ordering, and exact per-video runtimes:
   - Stanford CS234 Spring 2024: `PLoROMvodv4rN4wG6Nk6sNpTEbuOSosZdX` (Stanford Online, 16 videos)
   - MIT 6.5940 Fall 2023: `PL80kAHvQbh-pT4lCkDT53zT8DKmhE0idB` (MIT HAN Lab, 45 videos incl. Zoom duplicates)
   - CS50 AI 2020: `PLhQjrBD2T382Nz7z1AEXmioc27axa19Kv` (CS50, 8 videos)
   - FSDL 2022: `PL1T8fO7ArWleMMI8KPJ_5D5XSlovTW_Ur` (The Full Stack, 18 videos incl. labs)
   - Neural Networks: Zero to Hero: `PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ` (10 videos)
   - MIT 6.S191: `PLtBw6njQRU-rwp5__7C0oIVt26ZgjG9NI` (Alexander Amini, 90 videos, all editions)
   - CMU 11-785 Fall 2025: `PLp-0K3kfddPxpDVLFdFwXzAS2TH-f-QX8` (Carnegie Mellon University Deep Learning, 26 entries)
   - NYU 2026 has no playlist yet; membership was verified from the numbered `Lesson NN` uploads on Alfredo Canziani's official channel (the same source the two pre-existing 2026 rows use).
2. **Per-video public watch-page metadata** — exact title, channel, exact view count, and publish date for each of the 77 videos.
3. **YouTube oEmbed cross-check** of title and channel where embedding is enabled. Stanford disabled embedding for CS234 2024 lectures 3–16, so those rows record the watch-page/playlist verification path in `metadataVerifiedVia` instead.
4. **Official course pages** — FSDL lecture instructors (Sergey Karayev for Lectures 04/07, Josh Tobin for Lectures 06/08) and publish dates were confirmed on fullstackdeeplearning.com lecture pages (page dates match the YouTube premiere dates exactly); CMU 11-785 Fall 2025 instructors (Bhiksha Raj, Rita Singh) were confirmed on deeplearning.cs.cmu.edu/F25.
5. **Subtitle tracks could not be enumerated** (YouTube's player endpoint is bot-gated on this network), so all new rows carry `metadataVerificationStatus: "Partial"` with the same `subtitleVerificationScope` wording as the catalog's existing YouTube rows. Everything else (title, channel, runtime, views, date, playlist membership) is verified.
6. **Dedupe** — all 77 video ids were checked against the live catalog's `videoId`/`url` sets and against the resources added by sibling PR #3 (podcast catalog) and PR #6 (world-models expansion): zero collisions.

## Skipped candidates and why

| Candidate | Decision |
| --- | --- |
| MIT 6.5940 Zoom re-recordings (19 videos, Lectures 2–22 “Zoom recording” variants) | Skipped: duplicate uploads of the same lectures; the in-person recording of each lecture was kept. The pre-existing Lecture 1 Zoom row (ST-115) was left untouched. |
| CS50 AI “Introduction” (gR8QvFmNuLE, 1:53) | Skipped: course teaser, below the substantive-recording bar. |
| FSDL 2022 labs (Lab Intro + Labs 01–08, 7–32 min) | Skipped: short hands-on companion videos; the nine numbered lectures form the course spine. |
| Karpathy “State of GPT” (bZQun8Y4L2A) | Skipped: it sits in the Zero to Hero playlist but is a 42-minute Microsoft Build talk hosted on the Microsoft Developer channel, not an original-channel builder lecture; the series matcher deliberately excludes it. |
| CMU 11-785 F25 Lecture 0 (w8h_AWHTcK4, 30 min) | Skipped: course-logistics session, not a mechanism/method lecture. |
| CMU 11-785 F25 duplicate Lecture 9 (vFCeU6IhxDQ) | Skipped: same runtime (1:24:24) as the Sep 23 Lecture 9 upload (qt5r69AIIKE); it is a re-upload, and the earlier upload was kept. |
| CMU 11-785 F25 Lectures 5, 7, 14, 20 | Not addable: never made public on the official playlist. |
| MIT 6.S191 2018/2019 edition intros | Skipped: available and official, but the editions series was completed as a gapless modern 2020–2026 run; pre-2020 editions add near-duplicate intro material and were left for a future pass. Edition guest lectures (e.g. “The Three Laws of AI”) were skipped because the series is intentionally one intro lecture per year. |
| `stanford-cs229-autumn-2018` completion | Skipped: the catalog already carries the complete 17-lecture CS229 Spring 2026 series (ST-684–ST-700) covering the same curriculum; completing 2018 would add ~17 near-duplicate lectures. No distinctive guest/special 2018 lectures beyond the already-indexed rows were identified. Documented instead of dumped. |
| `stanford-cs234-winter-2019` completion | Skipped: the 2024 edition is now complete (16/16); completing the older edition would duplicate the same course. |
| `berkeley-cs285-fall-2020` completion | Skipped: sibling PR #6 adds the CS285 Fall 2023 model-based RL block; completing the 2020 edition here would create cross-PR duplication of the same course material. |
| `nyu-deep-learning-2020` completion | Deliberately left sparse: the newer 2026 edition was completed instead, per the newer-edition rule. |
| `stanford-cs230-editions` completion | Skipped: the series is a cross-year editions pattern (Lecture 8 from Autumn 2018 and Autumn 2025); pulling in more Autumn 2018 lectures would not produce one coherent course, and no missing lecture was clearly “the same course” across editions. |
| `tuebingen-mathematics-for-ml-optimization` completion | Verified already complete as published: the official Tübingen Machine Learning channel exposes exactly two public optimization lectures (Statistical Machine Learning Parts 7a and 15, cross-listed in the Mathematics for ML playlist), and both are already in the catalog. No further public optimization-unit lectures exist to add. |

## Editorial choices

- `section=Course` for every row; these are all numbered course lectures, none are seminars.
- `focusArea=Other` (Broader AI) throughout, matching how the catalog shelves these courses' existing members (classic RL foundations, efficiency/systems, DL foundations); no new row evidenced an Agent/Robotics/Vision/World-Model shelf better than its existing series siblings.
- `recommendation`: series openers and unique flagships are Core — CMU 11-785 Lecture 1, MIT 6.S191 2026 edition intro, and Karpathy's “Let's reproduce GPT-2 (124M)”. Everything else is Recommended, since each series' original entry lecture already carries Core.
- Speakers are real people verified from titles and official course pages (Emma Brunskill; Rafailov/Sharma/Mitchell for the CS234 DPO guest lecture; Song Han; Brian Yu; Sergey Karayev / Josh Tobin per FSDL lecture; Andrej Karpathy; Alexander Amini; Alfredo Canziani; Bhiksha Raj / CMU course team).
- Keywords are `; `-delimited and only claim topics evidenced by the lecture title or the channel's own description (CMU lectures whose topic is not published carry course-level keywords instead of invented ones).
- `notes` are generated by `npm run notes:apply` from the verified fields, keeping the catalog's single editorial voice.

## Series-matcher changes (`scripts/apply-course-series.mjs`)

- `stanford-cs234-2024`: switched from a title test to the explicit 16-video playlist map, because the Lecture 9 DPO guest session carries no “2024” tag in its title. Order = playlist position = lecture number.
- `cmu-11-785-fall-2025`: switched from a title/year test to an explicit videoId → lecture-number map, because several uploads drop “11-785”/“Fall 2025” from their titles, lectures 5/7/14/20 are not public, and the Lecture 9 re-upload must stay excluded.
- `karpathy-neural-networks-zero-to-hero`: broadened from a two-title regex to the explicit 9-video playlist set (still excluding “State of GPT”); ordering stays chronological.
- All other completed series required no matcher change (existing lecture-number/edition-year ordering already covers the new rows).

## Merge recipe (for conflicts with PR #3, PR #6, and the metadata-hygiene PR)

Conflicts on `data/scholar_tube_resources.json` / `.csv` are expected and mechanical:

1. Union all resources by `id`. This branch's ids are **ST-1200–ST-1276**; the sibling expansions use ST-1027+ and in-place edits of existing rows. There are no id, videoId, or URL collisions.
2. On the merged tree, re-run this branch's pipeline: `npm run courses:complete` (idempotent; re-adds only whatever the union is missing), then `npm run series:apply`, then `npm run notes:apply`.
3. If the metadata-hygiene sibling ships its cleanup script, run it **last** so the new rows also receive its speaker/format/domain normalization.
4. Rebuild the README coverage table from the merged live JSON (this branch recomputed it from live data: 86 / 201 / 127 / 200 / 456 / 32 across 1,102 resources).
