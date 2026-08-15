# ScholarTube conference-talk backbone expansion — 2026-08-15

## Result

- Baseline: 798 resources, including 250 talks
- Added: 62 official, publicly playable, long-form conference talks
- New total: 860 resources, including 312 talks
- Added duration range: 45–75 minutes; no official short demos, lightning talks, paper spotlights, or marketing launches were added
- Every conference-site URL returned HTTP 200 and contained an actual SlidesLive or YouTube player; a Video heading without a player was not sufficient
- Deduplicated by resource ID, platform video ID, canonical URL, normalized title, and normalized title + speaker
- Corrected the existing KDD 2025 Christopher Manning speaker/title metadata without creating a new row

## Added by source

- Association for Computing Machinery (ACM): 3
- CVPR: 6
- ECCV: 3
- ICCV: 3
- ICLR: 13
- ICML: 14
- MLSys: 6
- NeurIPS: 14

## Deliberately excluded

- Lucilla Sioli: The official ICML 2024 page contains a Video heading but explicitly states “No SlidesLive embed found for this event.” https://icml.cc/virtual/2024/invited-talk/37570
- Overflow copies of the six ICLR 2025 invited talks: Duplicate rooms/streams for the same title, speaker, time, and talk. https://iclr.cc/virtual/2025/events/invited%20talk
- ICLR 2023 — Entanglements, Exploring Artificial Biodiversity: Same speaker and talk title as the retained CVPR 2024 official recording. https://iclr.cc/virtual/2023/events/invited%20talk

## Continuing inclusion rule

Add official keynotes, invited talks, Test of Time talks, full tutorials, and research seminars that are normally at least 25 minutes. Require a durable public recording, not merely an agenda entry or empty Video section. Deduplicate by canonical URL, platform identifier, normalized title, and speaker. Continue excluding short demonstrations, lightning talks, paper spotlights, and launch/marketing clips.
