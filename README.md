<p align="center">
  <img src="./assets/scholartube_new.png" width="112" alt="ScholarTube logo" />
</p>

<h1 align="center">ScholarTube</h1>

<p align="center">
  <strong>Research knowledge, in motion.</strong><br />
  A curated, source-linked video knowledge index for AI researchers.
</p>

<p align="center">
  <a href="https://openenvision.github.io/ScholarTube/"><strong>Explore the live index</strong></a>
  ·
  <a href="./data/scholar_tube_resources.csv">Browse the data</a>
  ·
  <a href="https://github.com/OpenEnvision/ScholarTube/issues/new">Submit a resource</a>
</p>

![ScholarTube interface showing the ScholarTube resource index](./assets/scholartube-preview.png)

## Abstract

ScholarTube is an editorially curated index of high-value AI interviews, complete courses, and research talks. It is designed for researchers, engineers, students, and technical leaders who learn from long-form video but need a more deliberate discovery layer than a general-purpose video platform can provide.

The project treats research video as part of the modern technical record: a place where researchers explain mechanisms, lecturers build ideas step by step, and practitioners preserve the context behind systems and results. ScholarTube keeps the original host canonical while adding a consistent taxonomy, verified metadata, explicit series structure, and tools for searching, filtering, reviewing, and exporting the collection.

## Contents

- [Why ScholarTube](#why-scholartube)
- [Research coverage](#research-coverage)
- [Discovery experience](#discovery-experience)
- [Editorial standard](#editorial-standard)
- [Data artifacts](#data-artifacts)
- [Repository structure](#repository-structure)
- [Local development](#local-development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Attribution and ethics](#attribution-and-ethics)
- [Governance](#governance)
- [Citation](#citation)
- [Acknowledgment](#acknowledgment)

## Why ScholarTube

Important AI knowledge increasingly appears in formats that sit around the paper: university lectures, conference keynotes, research seminars, technical interviews, tutorials, and extended conversations with the people building the field.

These recordings are valuable but difficult to revisit systematically. They are distributed across platforms, described with inconsistent metadata, mixed with short announcements and promotional clips, and often disconnected from the research questions they help answer. ScholarTube addresses that discovery problem with a curated, searchable, and source-faithful index.

The goal is not to replace papers, course pages, conference archives, or video platforms. It is to provide a durable path into the most useful long-form material around them.

## Research coverage

ScholarTube organizes the index around the question a researcher is working on, rather than around the platform that hosts the video.

The current release contains 1,252 direct videos across six research directions.

| Direction | Scope | Resources |
| --- | --- | ---: |
| World Models | Learned simulators, temporal dynamics, planning, spatial reasoning, and video world models | 128 |
| Agents | Tool use, memory, orchestration, autonomy, reasoning, and agent evaluation | 209 |
| Vision | Perception, multimodal understanding, generation, 3D vision, and video systems | 133 |
| Robotics | Robot learning, control, manipulation, embodied intelligence, and grounded action | 213 |
| Broader AI | Foundations, AI systems, NLP, industry, social impact, and research frontiers | 499 |
| How to Research | Problem finding, literature review, experimental design, evaluation, writing, peer review, and research communication | 70 |

The four priority areas are intentionally complemented by Broader AI and How to Research. This keeps foundational, cross-cutting, and research-method material discoverable without forcing it into an inaccurate specialist category.

## Discovery experience

The web interface is built for both focused retrieval and open-ended exploration:

- Full-text search across titles, speakers, channels, domains, keywords, formats, languages, and series.
- Filters for format, research direction, broader topic, language, platform (including official course sites), and duration.
- Curated, popularity, and duration-based sorting.
- Grid and compact-list views with paginated results.
- Explicit course, talk, and interview series, with ordered episode-level detail.
- Resource detail panels showing audience, rationale, provenance, dates, metadata status, and view-count snapshots.
- ScholarTuber profiles for exploring researchers, educators, builders, and interviewers represented in the index.
- One-click export of the current result set to Markdown or CSV.
- URL-backed search and filter state for shareable discovery views.

## Editorial standard

ScholarTube favors curation over aggregation. A resource should satisfy at least one of the following criteria:

- Explain a mechanism, method, system behavior, empirical result, or research lesson.
- Provide structured instruction or implementation detail that remains useful after the release cycle.
- Preserve first-person technical reasoning, assumptions, trade-offs, or disagreement.
- Connect academic research and engineering practice without reducing the content to product marketing.
- Offer an authoritative conference, university, institutional, or original-creator source.

Candidate resources are reviewed along five dimensions:

| Dimension | Guiding question |
| --- | --- |
| Technical value | Does the recording teach something that changes or deepens technical understanding? |
| Source fidelity | Is the canonical host, speaker, channel, institution, or venue identifiable? |
| Durability | Will the material remain useful beyond the immediate announcement cycle? |
| Completeness | Is it a substantive recording or coherent series rather than a fragment, teaser, or short demo? |
| Taxonomic fit | Can the resource be placed in a meaningful direction, domain, and keyword set? |

Short promotional launches, duplicated uploads, paper spotlights without substantive explanation, inaccessible sources, and low-information summaries are deliberately excluded. Popularity can surface candidates, but it is never sufficient for inclusion.

### Source and recommendation tiers

Each entry carries two distinct editorial signals:

| Field | Values | Meaning |
| --- | --- | --- |
| Source tier | A · B · C | Original/official sources, institutional sources, or carefully selected community sources |
| Recommendation | Core · Recommended · Reserve | Suggested starting point, focused complement, or specialized alternative |

These labels describe the role of a resource inside the index. They are not rankings of people, organizations, or research agendas.

## Data artifacts

The [`data`](./data) directory contains the same collection in three working formats:

| File | Purpose |
| --- | --- |
| [`scholar_tube_resources.json`](./data/scholar_tube_resources.json) | Structured source consumed by the React application |
| [`scholar_tube_resources.csv`](./data/scholar_tube_resources.csv) | Flat, portable table for analysis and import |
| [`scholar_tube_seed_list.xlsx`](./data/scholar_tube_seed_list.xlsx) | Formatted workbook with overview, filters, indexes, and editorial guidance |
| [`metadata_verification_report.json`](./data/metadata_verification_report.json) | Machine-readable verification summary |
| [`how_to_research_curation_2026-08-17.md`](./data/how_to_research_curation_2026-08-17.md) | Source mix, coverage map, reclassifications, and verification notes for the How to Research direction |

Interface labels, taxonomy, and editorial metadata are written in English. Original titles, channel names, and personal names remain in their source language to preserve searchability and provenance.

## Repository structure

```text
ScholarTube/
├── src/                         React interface and discovery logic
│   ├── components/              Library, series, detail, curation, and contribution UI
│   ├── resource-utils.js        Search, sorting, taxonomy, grouping, and formatting
│   └── export-utils.js          Markdown and CSV exports
├── data/                        Canonical JSON, CSV, XLSX, and audit artifacts
├── public/assets/               Runtime brand and feature imagery
├── assets/                      Standalone-site and README imagery
├── scripts/                     Data maintenance, verification, and publishing utilities
├── dist/                        Vite build output
└── index.html                   Self-contained published application
```

## Local development

ScholarTube is a React application built with Vite. Use Node.js `20.19+` or `22.12+`.

```bash
git clone https://github.com/OpenEnvision/ScholarTube.git
cd ScholarTube
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173/`.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the Vite application and publish a self-contained root `index.html` |
| `npm run preview` | Preview the production build locally |
| `npm run series:apply` | Recompute explicit course, talk, and interview series metadata |
| `npm run taxonomy:apply` | Apply the evidence-backed section/focusArea corrections |
| `npm run notes:apply` | Replace provenance boilerplate in `notes` with field-driven editorial notes |
| `npm run curation:apply` | Run taxonomy, series, and notes maintenance in the correct order |
| `npm run verify:metadata` | Recheck supported platform metadata and rewrite the verification artifacts |

The maintenance commands modify canonical data files. Review their output and diff before committing the result. Metadata verification also requires network access to the relevant public platforms.

## Deployment

Run:

```bash
npm run build
```

The build produces both a conventional Vite bundle in `dist/` and a self-contained `index.html` at the repository root with its required images in `assets/`. The published site is currently available at:

```text
https://openenvision.github.io/ScholarTube/
```

The application has no server-side runtime, authentication layer, database dependency, or client-side secret. The JSON corpus is bundled into the static application at build time.

## Contributing

Found an interview, course, or talk worth preserving? Use the [submission form in ScholarTube](https://openenvision.github.io/ScholarTube/#contribute) or [open a resource submission issue](https://github.com/OpenEnvision/ScholarTube/issues/new).

A useful proposal includes:

1. The canonical public video URL.
2. A short explanation of what a researcher will learn.
3. Enough source context to verify the speaker, channel, institution, or venue.

The web form checks canonical YouTube and Bilibili identifiers against the current corpus before preparing a GitHub issue. Every accepted resource remains subject to editorial review, metadata verification, deduplication, and taxonomy placement.

## Attribution and ethics

ScholarTube indexes external media and does not claim ownership of the original recordings. Videos remain on their canonical platforms, and each record preserves an outbound source link and available attribution.

Editorial summaries and generated “why watch” guidance are discovery aids, not substitutes for the source. View counts are snapshots captured during collection and should not be treated as permanent quality scores. Platform names and trademarks belong to their respective owners; inclusion does not imply endorsement by a speaker, institution, venue, or platform.

## Governance

ScholarTube is maintained by [OpenEnvision](https://github.com/OpenEnvision). Editorial changes should preserve four invariants:

1. Technical value over undifferentiated volume.
2. Canonical sources over duplicated media.
3. Transparent metadata over hidden ranking signals.
4. Searchable research structure over platform-driven discovery.

## Citation

If ScholarTube is useful in academic, educational, or technical work, please cite the project as:

```bibtex
@misc{openenvision_scholartube_2026,
  title        = {ScholarTube: Research Knowledge, in Motion},
  author       = {{OpenEnvision}},
  year         = {2026},
  howpublished = {\url{https://github.com/OpenEnvision/ScholarTube}},
  note         = {Curated, source-linked AI video knowledge index}
}
```

## Acknowledgment

ScholarTube recognizes the researchers, educators, interviewers, universities, conferences, laboratories, and technical communities that make substantive research video publicly available. The project exists to make that record easier to discover, compare, and revisit while keeping credit and context with the original source.
