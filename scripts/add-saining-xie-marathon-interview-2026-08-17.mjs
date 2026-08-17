import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')
const metadataReportPath = path.join(projectDirectory, 'data', 'metadata_verification_report.json')
const auditReportPath = path.join(projectDirectory, 'data', 'saining_xie_marathon_interview_2026-08-17.md')
const collectedOn = '2026-08-17'

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''
  const text = String(normalized)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (resources.length !== 941) throw new Error(`Expected 941 resources, found ${resources.length}`)

const addition = {
  id: 'ST-942',
  section: 'Interview',
  domain: 'World Models / Representation Learning',
  keywords: 'World Models; Representation Learning; Research Taste; Computer Vision; AMI Labs; AI Research',
  language: 'Chinese',
  title: '对谢赛宁的 7 小时马拉松访谈：世界模型、AMI Labs、表示学习与 AI 研究',
  speaker: '谢赛宁',
  channel: '张小珺 Podcast',
  format: 'Marathon Research Interview',
  durationMinutes: 405,
  url: 'https://www.youtube.com/watch?v=rIwgZWzUKm8',
  platform: 'YouTube',
  viewCount: 103006,
  sourceTier: 'A | Official / Original Creator / Organizer',
  recommendation: 'Core',
  status: 'Verified',
  collectedOn,
  notes: 'Original Zhang Xiaojun Podcast upload. Public player metadata verifies a 24,278-second (6h45m) recording; the programme presents it as a seven-hour marathon interview. It covers Saining Xie’s research trajectory, representation learning, world models, AMI Labs, and research taste.',
  videoId: 'rIwgZWzUKm8',
  focusArea: 'World Model',
  publishedAt: '2026-03-15',
  subtitleLanguages: [],
  subtitleTracks: [],
  subtitlesVerified: false,
  subtitleVerificationScope: 'YouTube player metadata exposed no public subtitle track during verification.',
  metadataVerifiedVia: 'YouTube privacy-enhanced player metadata and the original Zhang Xiaojun Podcast upload',
  metadataVerificationStatus: 'Partial',
  lastVerifiedAt: collectedOn,
  lastVerificationAttemptAt: collectedOn,
  metadataVerificationError: '',
  publishedAtVerified: true,
  seriesId: '',
  seriesTitle: '',
  seriesOrder: null,
}

if (resources.some((resource) => resource.id === addition.id || resource.url === addition.url || resource.videoId === addition.videoId)) {
  throw new Error('Saining Xie interview is already present in the catalog')
}

const updatedResources = [...resources, addition]
const fields = Object.keys(updatedResources[0])
const csv = [fields.join(','), ...updatedResources.map((resource) => fields.map((field) => csvCell(resource[field])).join(','))].join('\r\n')
const byPlatform = Object.fromEntries(Object.entries(Object.groupBy(updatedResources, (resource) => resource.platform)).map(([platform, rows]) => [platform, {
  total: rows.length,
  verified: rows.filter((resource) => resource.metadataVerificationStatus === 'Verified').length,
  partial: rows.filter((resource) => resource.metadataVerificationStatus === 'Partial').length,
  failed: rows.filter((resource) => resource.metadataVerificationStatus === 'Failed').length,
}]))

await writeFile(jsonPath, `${JSON.stringify(updatedResources, null, 2)}\n`, 'utf8')
await writeFile(csvPath, `\ufeff${csv}\r\n`, 'utf8')
await writeFile(metadataReportPath, `${JSON.stringify({
  verifiedOn: collectedOn,
  total: updatedResources.length,
  verified: updatedResources.filter((resource) => resource.metadataVerificationStatus === 'Verified').length,
  partial: updatedResources.filter((resource) => resource.metadataVerificationStatus === 'Partial').length,
  failed: updatedResources.filter((resource) => resource.metadataVerificationStatus === 'Failed').length,
  byPlatform,
  failures: [],
}, null, 2)}\n`, 'utf8')
await writeFile(auditReportPath, `# Saining Xie marathon interview verification — ${collectedOn}\n\n- Canonical original-host upload: https://www.youtube.com/watch?v=rIwgZWzUKm8\n- Channel: Zhang Xiaojun Podcast\n- Verified player runtime: 24,278 seconds = 6h45m\n- The video title and programme description call it a seven-hour marathon interview; the catalog records the exact player runtime rather than rounding it to seven hours.\n- Included as a Core World Models interview, not as a conference lecture.\n`, 'utf8')

console.log(JSON.stringify({ added: addition.id, total: updatedResources.length, durationMinutes: addition.durationMinutes }, null, 2))
