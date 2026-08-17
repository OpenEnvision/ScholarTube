# How to Research curation note

**Collection date:** 2026-08-17  
**Final scope:** 30 resources: 27 newly collected and 3 reclassified from Broader AI

## Strict inclusion rule

A resource remains in How to Research only when the recording as a whole primarily teaches a transferable research task: finding a problem, reading and synthesizing literature, designing or evaluating experiments, writing, reviewing, presenting, or executing research. It must be substantive, actionable, traceable to a credible source, and clearly distinguishable from a short clip, promotion, or duplicate upload.

High-quality material was still excluded when research method appeared only in one segment or when the main subject was career inspiration, legal background, community culture, open-science advocacy, wellbeing, or a particular research result.

## Coverage

| Stage | Representative coverage |
| --- | --- |
| Problem finding and research taste | Simon Peyton Jones, Richard Hamming, 李沐, Kyunghyun Cho, NC State Libraries |
| Literature search, reading, and synthesis | Stanford CS230, 跟李沐学AI, 小博士Awake, NC State Libraries |
| Experimental design and evaluation | MIT OpenCourseWare, NeurIPS benchmarking tutorials, ICLR benchmark talks |
| Scientific writing and presentation | Simon Peyton Jones, Larry McEnerney, Susan McConnell, Mike Morrison, TU Wien |
| Peer review and research execution | CVPR review tutorials, selected Good Citizen of CVPR sessions, Nature Masterclasses, David Patterson |

## Retained new-resource audit

| IDs | Platform | Retained | Verification approach |
| --- | --- | ---: | --- |
| ST-861–ST-874 except ST-870 | YouTube | 13 | Title, channel, runtime, upload date, public view snapshot, and an official or original-source page were cross-checked. Caption discovery was blocked by YouTube anti-bot verification on this network and is marked `Partial`. |
| ST-875–ST-882 except ST-882 | Bilibili | 7 | Title, owner, runtime, publication date, view snapshot, and part-level player metadata were checked with Bilibili’s public view/player APIs. |
| ST-883–ST-889 | Official university or publisher sites | 7 | Official publisher or university pages were used. Public transcripts, dates, licenses, module structure, and runtimes were recorded only where the source exposed them. |

The retained set is deliberately multilingual and multi-platform: 13 YouTube videos, 7 Bilibili videos, 3 conference-site videos, and 7 official-site courses or talks. Long multi-part offerings are represented as series or coherent courses rather than fragmented clips.

## Reclassified resources retained

These existing records moved from Broader AI to How to Research because their primary value is methodological rather than field-specific:

- ST-778 — problem finding in AI
- ST-783 — the science of benchmarking
- ST-826 — the emerging science of benchmarks

## Strict second-pass exclusions

These records remain in the library but were returned to Broader AI (`focusArea: Other`) because the full recording does not meet the primary-method criterion:

- ST-800 — presents an AGI framework, prototype, definitions, and benchmarks; it is a research contribution rather than a general research-method lesson.
- ST-803 — discusses training language models under academic constraints; useful field experience, but not a transferable research-process tutorial throughout.
- ST-822 — teaches copyright law and risk awareness, not how to conduct research.
- ST-828 — argues for open science and research infrastructure, but is primarily advocacy rather than procedural instruction.
- ST-870 — only one portion covers research papers; most of the workshop concerns CVPR community rights, culture, inclusion, and mentorship. Parts 2 and 3 remain as a selected two-part research-practice series.
- ST-882 — addresses stress and mental wellbeing rather than the research process itself.

## Data integrity checks

- Canonical JSON and CSV contain 889 records with matching field schemas.
- Resource IDs and canonical URLs are unique.
- `How to Research` contains 30 records; Broader AI contains 321.
- Missing or inaccessible metadata was left empty and explained in the verification fields instead of being inferred.
