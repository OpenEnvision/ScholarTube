import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Idempotent, evidence-backed taxonomy corrections for existing resources.
// Each fix only applies when the current value still equals `from` (or already
// equals `to`, in which case it is a no-op). Anything else is reported and
// skipped so manual re-curation is never silently overwritten.
// Full rationale lives in data/series_and_notes_quality_2026-08-25.md.

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')

const taxonomyFixes = [
  {
    id: 'ST-158',
    field: 'section',
    from: 'Talk',
    to: 'Course',
    evidence:
      'Numbered lecture ("Lecture 7.2") from the Stanford CS224W 2021 course playlist; every other numbered university lecture in the catalog sits in Course.',
  },
  {
    id: 'ST-165',
    field: 'section',
    from: 'Talk',
    to: 'Course',
    evidence:
      'Stanford CS25 V5 session; the other 11 "Stanford CS25:" sessions are classified as Course and grouped under stanford-cs25-transformers-united.',
  },
  {
    id: 'ST-168',
    field: 'section',
    from: 'Talk',
    to: 'Course',
    evidence:
      'Stanford CS25 V3 session; same course seminar playlist as the existing stanford-cs25-transformers-united Course series.',
  },
  {
    id: 'ST-394',
    field: 'section',
    from: 'Course',
    to: 'Talk',
    evidence:
      'One-off "Stanford Seminar - ..." research talk; the three sibling "Stanford Seminar - ..." recordings (ST-373/376/378) are classified as Talk.',
  },
  {
    id: 'ST-398',
    field: 'section',
    from: 'Course',
    to: 'Talk',
    evidence:
      'CMU "RI Seminar:" invited research talk; the other 13 RI Seminar recordings in the catalog are classified as Talk.',
  },
  {
    id: 'ST-399',
    field: 'section',
    from: 'Course',
    to: 'Talk',
    evidence:
      'CMU "RI Seminar:" invited research talk; the other 13 RI Seminar recordings in the catalog are classified as Talk.',
  },
  {
    id: 'ST-870',
    field: 'focusArea',
    from: 'Other',
    to: 'How to Research',
    evidence:
      'Part 1 of the CVPR18 "How to be a Good Citizen of the CVPR Community" workshop; Parts 2 and 3 (ST-871/872) carry focusArea "How to Research" and the domain is Research Practice / Research Community.',
  },
  {
    id: 'ST-882',
    field: 'focusArea',
    from: 'Other',
    to: 'How to Research',
    evidence:
      'Research-wellbeing lecture (domain Research Practice / Wellbeing); the three sibling 小博士Awake research-method lectures (ST-879/880/881) carry focusArea "How to Research".',
  },
  {
    id: 'ST-048',
    field: 'focusArea',
    from: 'World Model',
    to: 'Other',
    evidence:
      'Interview with Intel CEO Lip-Bu Tan about the semiconductor supply chain; title, domain (AI Startups / Foundation Models), and keywords carry no world-model content.',
  },
  {
    id: 'ST-052',
    field: 'focusArea',
    from: 'World Model',
    to: 'Other',
    evidence:
      'Interview with Scale AI CEO Alexandr Wang about data infrastructure and the AI industry; no world-model content in title, domain, or keywords.',
  },
  {
    id: 'ST-054',
    field: 'focusArea',
    from: 'World Model',
    to: 'Other',
    evidence:
      'Interview with ServiceNow CEO Bill McDermott about scaling enterprises with AI; no world-model content in title, domain, or keywords.',
  },
  {
    id: 'ST-049',
    field: 'focusArea',
    from: 'World Model',
    to: 'Robotics',
    evidence:
      'π0 robot foundation model interview with Sergey Levine; keywords lead with "Robotics / Embodied AI" and the subject is a robotics policy model.',
  },
  {
    id: 'ST-059',
    field: 'focusArea',
    from: 'World Model',
    to: 'Robotics',
    evidence:
      'Waymo self-driving foundation model interview with Drago Anguelov; keywords lead with "Robotics / Embodied AI" and the subject is autonomous driving.',
  },
]

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item)).join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
const byId = new Map(resources.map((resource) => [resource.id, resource]))

const applied = []
const alreadyApplied = []
const skipped = []

for (const fix of taxonomyFixes) {
  const resource = byId.get(fix.id)
  if (!resource) {
    skipped.push({ ...fix, reason: 'resource not found' })
    continue
  }
  if (resource[fix.field] === fix.to) {
    alreadyApplied.push(fix.id)
    continue
  }
  if (resource[fix.field] !== fix.from) {
    skipped.push({ ...fix, reason: `current value "${resource[fix.field]}" differs from expected "${fix.from}"` })
    continue
  }
  resource[fix.field] = fix.to
  applied.push({ id: fix.id, field: fix.field, from: fix.from, to: fix.to })
}

const fields = Object.keys(resources[0])
const csv = [
  fields.join(','),
  ...resources.map((resource) => fields.map((field) => csvCell(resource[field])).join(',')),
].join('\r\n')

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')

console.log(JSON.stringify({ applied, alreadyApplied, skipped }, null, 2))
if (skipped.length > 0) process.exitCode = 1
