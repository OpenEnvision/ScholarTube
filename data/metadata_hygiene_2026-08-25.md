# Catalog metadata hygiene — 2026-08-25

In-place quality pass over the existing 1,025 resources. No rows added or
removed; `id`, `videoId`, and `url` are untouched. All transforms are
idempotent:

```bash
npm run hygiene:apply    # speakers, formats, domains, keywords, re-tiering
npm run notes:apply      # refresh generated notes from the new fields
```

`npm run curation:apply` now runs taxonomy → series → hygiene → notes.

## Summary

| Metric | Before | After |
| --- | ---: | ---: |
| Resources | 1025 | 1025 |
| `speaker = "To be added"` | 231 | 102 (−129 filled from title/channel/series evidence) |
| Junk speakers (episode labels, years, `MedAI #n`) | 11 | 0 |
| Distinct `format` values | 62 | 15 |
| Distinct `domain` values | 101 | 86 |
| Keywords using ` / ` as delimiter | 248 | 0 (normalized to `; `) |
| Core / Recommended / Reserve | 698 / 256 / 71 (68% Core) | 459 / 495 / 71 (44.8% Core) |
| Hand-written notes | 83 | 83 (untouched) |

## 1. Speakers

Only two classes of speaker values are rewritten:

1. **Placeholder** — `To be added`.
2. **Junk** — episode labels (`MedAI #92`, `Nick Bostrom - TWiML Talk #181`,
   `青稞Talk 144期`), bare years (`2026`), conference tags (`2021-CVPR`), and a
   handful of non-name fragments (`中字`, `Talk`, `Graphs`, `Fireside Chat`).

Existing editorial strings are kept even when they are not a personal name
(`Stanford Online course team`, `Wenfeng Liang and the High-Flyer team`,
`Stanford CS25 guest speakers`). Guessing an instructor over those labels
would erase curation.

Fill sources, in order: title patterns (brackets, `Speaker:`, `RI Seminar:`,
keynote credits, episode guest, `feat.`, bilingual `与X的` / `对X的` /
`X教授访谈`), a conservative known-name list, person-like channels, then a
series-instructor map used **only** for remaining TBA course rows.

Host credits in parentheses (`Host: Pieter Abbeel`) are stripped so the guest
wins (ST-035 → Geoff Hinton, not the show host). Names that cannot be
evidenced stay `To be added`.

## 2. Format vocabulary

62 overlapping labels collapse to 15 canonical formats. Podcast detection in
`src/resource-utils.js` still keys off `/podcast/i`, so `Podcast Interview`
keeps the word `Podcast`. Nobel and Turing lectures stay distinct.

| Canonical format | Role |
| --- | --- |
| Course Lecture · Course Tutorial · Specialized Course | instruction |
| Conference Keynote · Research Seminar · Research Talk · Workshop Talk · Public Lecture | talks |
| Panel Discussion | multi-speaker |
| Nobel Prize Lecture · Turing Award Lecture | named awards |
| In-depth Interview · Podcast Interview · Fireside Chat · Profile Interview | conversations |

## 3. Domains and keywords

High-count duplicates are merged only when the label pair is synonymous:

- `Robotics` → `Robotics / Embodied AI`
- `Vision` → `Computer Vision`
- `Agents` → `Agents / Tool Use / Reasoning`
- `World Models` → `World Models / Predictive Intelligence`

Distinctive 1-count research-practice stages (`Research Practice / Writing`,
`Peer Review`, …) are kept. Keywords are split on `/`, `;`, and commas and
rejoined with `; ` (max six tokens, de-duplicated).

## 4. Recommendation re-tiering

Core had become the default (Broader AI was 84% Core), which flattened the
tier signal. Rules, encoded in the script:

- Featured ids stay Core: ST-001, ST-008, ST-083, ST-175, ST-942 (plus ST-890).
- Course series with ≥ 4 members: the first two `seriesOrder` lectures stay
  Core; remaining Core lectures in that series become Recommended.
- Source-tier C Core items become Recommended (Reserve if they are also
  industry/profile interviews).
- Broader-AI (`Other`) profile/industry interviews that are not flagship
  named researchers become Recommended.
- Reserve is never promoted in this pass.

| Direction | Core before | Core after |
| --- | ---: | ---: |
| World Models | 51.2% | 46.5% |
| Agents | 64.7% | 39.3% |
| Vision | 60.6% | 43.3% |
| Robotics | 52.5% | 39.5% |
| Broader AI | 84.4% | 49.9% |
| How to Research | 68.8% | 53.1% |
| **Overall** | **68.0%** | **44.8%** |

## 5. Notes

`scripts/apply-editorial-notes.mjs` now treats the 942 field-driven notes as
regenerable (they match `Core selection|Recommended pick|Reserve item` +
shelf/catalog). After hygiene, 654 of them were rewritten to quote the new
speaker/format/domain/tier. The 83 handwritten notes (Nobel, ACM, Moonshot,
DeepSeek, MIT OCW, …) remain untouched.

## 6. Verification

- 1025 rows; unique `id` and `videoId`; no URL changes.
- `npm run hygiene:apply` then `npm run notes:apply` twice: second pair is a
  no-op (`speakerFilled: 0`, `rewritten: 0`).
- JSON parses; 15 formats; 0 remaining junk speakers.

## Merge guidance

This branch only edits fields in place. Sibling catalog expansions (#3
podcasts ST-1027+, #6 world-models/research-craft ST-1027+, and the official
course-completion agent using ST-1200+) should be unioned by `id`, then:

```bash
npm run curation:apply
```

Hygiene will fill TBA / collapse formats on the new rows without touching
their identities.
