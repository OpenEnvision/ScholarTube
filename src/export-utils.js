import { formatDuration, getFormatFamily } from './resource-utils.js'
import { formatDate, getResourceDetail } from './resource-detail-utils.js'

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function fileStamp() {
  return new Date().toISOString().slice(0, 10)
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function buildMarkdown(resources) {
  const lines = [
    '# ScholarTube export',
    '',
    `Exported ${resources.length} resources on ${fileStamp()}.`,
    '',
  ]

  resources.forEach((resource) => {
    const detail = getResourceDetail(resource)
    const family = getFormatFamily(resource)
    lines.push(
      `## ${resource.title}`,
      '',
      `- Source: [${resource.platform}](${resource.url})`,
      `- Speaker / channel: ${resource.speaker === 'To be added' ? resource.channel : resource.speaker} / ${resource.channel}`,
      `- Format: ${family === resource.section ? resource.section : `${resource.section} (${family})`}`,
      ...(resource.seriesTitle ? [`- Series: ${resource.seriesTitle} (#${resource.seriesOrder})`] : []),
      `- Topic: ${resource.focusArea === 'Other' ? resource.domain : resource.focusArea}`,
      `- Language: ${resource.language}`,
      `- Duration: ${formatDuration(resource.durationMinutes)}`,
      `- Published: ${formatDate(detail.publishedAt)}`,
      `- Last verified: ${formatDate(detail.lastVerifiedAt)}`,
      `- Why watch: ${detail.whyWatch}`,
      '',
    )
  })

  return lines.join('\n')
}

export function exportMarkdown(resources) {
  downloadFile(`scholartube-${fileStamp()}.md`, buildMarkdown(resources), 'text/markdown;charset=utf-8')
}

export function buildCsv(resources) {
  const headers = [
    'id', 'title', 'url', 'platform', 'format', 'formatFamily', 'series', 'seriesOrder', 'speaker', 'channel', 'topic',
    'language', 'duration', 'publishedAt', 'lastVerifiedAt', 'recommendation', 'whyWatch',
  ]
  const rows = resources.map((resource) => {
    const detail = getResourceDetail(resource)
    return [
      resource.id,
      resource.title,
      resource.url,
      resource.platform,
      resource.section,
      getFormatFamily(resource),
      resource.seriesTitle,
      resource.seriesOrder,
      resource.speaker === 'To be added' ? '' : resource.speaker,
      resource.channel,
      resource.focusArea === 'Other' ? resource.domain : resource.focusArea,
      resource.language,
      formatDuration(resource.durationMinutes),
      detail.publishedAt === 'Not yet verified' ? '' : detail.publishedAt,
      detail.lastVerifiedAt === 'Not yet verified' ? '' : detail.lastVerifiedAt,
      resource.recommendation,
      detail.whyWatch,
    ].map(csvCell).join(',')
  })

  return `\ufeff${headers.join(',')}\r\n${rows.join('\r\n')}`
}

export function exportCsv(resources) {
  downloadFile(`scholartube-${fileStamp()}.csv`, buildCsv(resources), 'text/csv;charset=utf-8')
}
