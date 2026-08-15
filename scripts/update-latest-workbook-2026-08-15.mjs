import fs from 'node:fs/promises'
import path from 'node:path'
import { FileBlob, SpreadsheetFile } from '/private/tmp/scholartube-artifact/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'

const projectDirectory = '/Users/tianjuanxi/Downloads/ScholarTube-main-2'
const inputPath = path.join(projectDirectory, 'data', 'scholar_tube_seed_list.xlsx')
const dataPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const outputDirectory = path.join(projectDirectory, 'outputs', '01a00325-7131-7af2-866d-5d6590401d71')
const outputPath = path.join(outputDirectory, 'scholar_tube_seed_list.xlsx')
const previewDirectory = '/private/tmp/scholartube-artifact'
const previousFinalRow = 799
const finalRow = 861

function countBy(rows, field) {
  return Object.entries(rows.reduce((counts, row) => {
    const key = row[field] || 'Unknown'
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function excelDate(value) {
  return value ? new Date(`${value}T00:00:00Z`) : null
}

function rowForWorkbook(resource) {
  return [
    resource.id,
    resource.section,
    resource.focusArea,
    resource.domain,
    resource.keywords,
    resource.language,
    resource.title,
    resource.speaker,
    resource.channel,
    resource.format,
    resource.durationMinutes,
    resource.url,
    resource.platform,
    resource.viewCount,
    resource.sourceTier,
    resource.recommendation,
    resource.status,
    excelDate(resource.collectedOn),
    resource.notes,
    resource.videoId,
    resource.seriesTitle || '',
    resource.seriesOrder ?? null,
    resource.seriesId || '',
  ]
}

function columnLabel(index) {
  let value = index + 1
  let label = ''
  while (value > 0) {
    value -= 1
    label = String.fromCharCode(65 + (value % 26)) + label
    value = Math.floor(value / 26)
  }
  return label
}

function updateFormulaBounds(sheet) {
  const usedRange = sheet.getUsedRange(false)
  const formulas = usedRange.formulas
  for (let row = 0; row < formulas.length; row += 1) {
    for (let column = 0; column < formulas[row].length; column += 1) {
      const formula = formulas[row][column]
      if (typeof formula !== 'string' || !formula.startsWith('=')) continue
      const updated = formula.replaceAll(String(previousFinalRow), String(finalRow))
      if (updated !== formula) sheet.getRange(`${columnLabel(column)}${row + 1}`).formulas = [[updated]]
    }
  }
}

async function savePreview(workbook, sheetName, range, filename) {
  const preview = await workbook.render({ sheetName, range, scale: 1.5, format: 'png' })
  await fs.writeFile(path.join(previewDirectory, filename), new Uint8Array(await preview.arrayBuffer()))
}

const resources = JSON.parse(await fs.readFile(dataPath, 'utf8'))
if (resources.length !== 860) throw new Error(`Expected 860 resources, found ${resources.length}`)

const input = await FileBlob.load(inputPath)
const workbook = await SpreadsheetFile.importXlsx(input)
const overview = workbook.worksheets.getItem('Overview')
const resourcesSheet = workbook.worksheets.getItem('Resources')
const priorityAreas = workbook.worksheets.getItem('Priority Areas')
const domainIndex = workbook.worksheets.getItem('Domain Index')
const fieldGuide = workbook.worksheets.getItem('Field Guide')
const resourceTable = resourcesSheet.tables.items.find((table) => table.name === 'ScholarTubeResources')
if (!resourceTable) throw new Error('ScholarTubeResources table was not found')

const workbookRows = resources.map(rowForWorkbook)
const existingTableRows = resourceTable.getDataRows().values.length
if (existingTableRows > resources.length) throw new Error(`Workbook table has ${existingTableRows} rows, more than the source data`)
if (existingTableRows < resources.length) resourceTable.rows.add(null, workbookRows.slice(existingTableRows))
resourcesSheet.getRange(`A2:W${finalRow}`).values = workbookRows
resourcesSheet.getRange(`K2:K${finalRow}`).setNumberFormat('0')
resourcesSheet.getRange(`N2:N${finalRow}`).setNumberFormat('#,##0')
resourcesSheet.getRange(`R2:R${finalRow}`).setNumberFormat('yyyy-mm-dd')
resourcesSheet.getRange(`V2:V${finalRow}`).setNumberFormat('0')

for (const sheet of [overview, priorityAreas, domainIndex]) updateFormulaBounds(sheet)

const domainCounts = countBy(resources, 'domain')
const channelCounts = countBy(resources, 'channel')
overview.getRange('A13:A24').values = domainCounts.slice(0, 12).map(([label]) => [label])
overview.getRange('E13:E24').values = channelCounts.slice(0, 12).map(([label]) => [label])
overview.getRange('J15').values = [['Conference Site']]
overview.getRange('K15').formulas = [[`=COUNTIF('Resources'!$M$2:$M$${finalRow},J15)`]]

const priorityCount = resources.filter((resource) => ['World Model', 'Agent', 'Vision', 'Robotics'].includes(resource.focusArea)).length
const courseSeries = new Set(resources.filter((resource) => resource.section === 'Course' && resource.seriesId).map((resource) => resource.seriesId))
const interviewSeries = new Set(resources.filter((resource) => resource.section === 'Interview' && resource.seriesId).map((resource) => resource.seriesId))
const courseSeriesVideos = resources.filter((resource) => resource.section === 'Course' && resource.seriesId).length
const interviewSeriesVideos = resources.filter((resource) => resource.section === 'Interview' && resource.seriesId).length
const courseEntries = resources.filter((resource) => resource.section === 'Course').length - courseSeriesVideos + courseSeries.size
const interviewEntries = resources.filter((resource) => resource.section === 'Interview').length - interviewSeriesVideos + interviewSeries.size

overview.getRange('A2:L2').clear({ applyTo: 'contents' })
overview.getRange('A2').values = [[`${resources.length} direct videos · ${priorityCount} priority-area resources · ${courseSeries.size + interviewSeries.size} explicit series`]]
overview.getRange('H18:L18').clear({ applyTo: 'contents' })
overview.getRange('H18').values = [[`${courseSeries.size} course series (${courseSeriesVideos} videos → ${courseEntries} entries) · ${interviewSeries.size} interview series (${interviewSeriesVideos} videos → ${interviewEntries} entries)`]]
priorityAreas.getRange('H4').values = [['Conference Site']]
priorityAreas.getRange('H5:H9').formulas = ['World Model', 'Agent', 'Vision', 'Robotics', 'Other'].map((focusArea, index) => [
  `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${index + 5},'Resources'!$M$2:$M$${finalRow},H$4)`,
])
fieldGuide.getRange('D12').values = [['This batch was verified against public conference metadata on 2026-08-15; official short demos, lightning talks, and paper spotlights remain excluded.']]
fieldGuide.getRange('A22').values = [[5]]
fieldGuide.getRange('B22').values = [['YouTube, Bilibili, and official conference recording sites are included. Add Xiaohongshu only after account verification and sign-in.']]

const existingDomainLabels = new Set(domainIndex.getRange('A2:A100').values.flat().filter(Boolean))
const missingDomains = domainCounts.map(([domain]) => domain).filter((domain) => !existingDomainLabels.has(domain))
const sortedDomains = domainCounts.map(([domain]) => domain).sort((a, b) => a.localeCompare(b))
const domainLastRow = sortedDomains.length + 1
domainIndex.getRange(`A2:A${domainLastRow}`).values = sortedDomains.map((domain) => [domain])
domainIndex.getRange(`B2:E${domainLastRow}`).formulas = sortedDomains.map((_, index) => {
  const row = index + 2
  return [
    `=COUNTIF('Resources'!$D$2:$D$${finalRow},$A${row})`,
    `=COUNTIFS('Resources'!$D$2:$D$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},C$1)`,
    `=COUNTIFS('Resources'!$D$2:$D$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},D$1)`,
    `=COUNTIFS('Resources'!$D$2:$D$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},E$1)`,
  ]
})
for (let row = 2; row <= domainLastRow; row += 1) {
  const rowRange = domainIndex.getRange(`A${row}:E${row}`)
  rowRange.format.fill = row % 2 === 0 ? '#C6EFCE' : '#FFFFFF'
  rowRange.format.font = { color: '#17324D', size: 10 }
  domainIndex.getRange(`A${row}`).format.horizontalAlignment = 'left'
  domainIndex.getRange(`B${row}:E${row}`).format.horizontalAlignment = 'center'
  rowRange.format.rowHeight = 22
}

const overviewCheck = await workbook.inspect({ kind: 'table', range: 'Overview!A1:L24', include: 'values,formulas', tableMaxRows: 24, tableMaxCols: 12, maxChars: 6500 })
const resourceCheck = await workbook.inspect({ kind: 'table', range: `Resources!A773:W${finalRow}`, include: 'values,formulas', tableMaxRows: 28, tableMaxCols: 23, maxChars: 12000 })
const domainCheck = await workbook.inspect({ kind: 'table', range: `Domain Index!A1:E${domainLastRow}`, include: 'values,formulas', tableMaxRows: 50, tableMaxCols: 5, maxChars: 6500 })
const formulaErrors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 300 },
  summary: 'final formula error scan',
  maxChars: 3000,
})
console.log(overviewCheck.ndjson)
console.log(resourceCheck.ndjson)
console.log(domainCheck.ndjson)
console.log(formulaErrors.ndjson)

await fs.mkdir(previewDirectory, { recursive: true })
await savePreview(workbook, 'Overview', 'A1:L24', 'after-Overview.png')
await savePreview(workbook, 'Resources', 'A1:W18', 'after-Resources-top.png')
await savePreview(workbook, 'Resources', `A773:W${finalRow}`, 'after-Resources-bottom.png')
await savePreview(workbook, 'Priority Areas', 'A1:H12', 'after-Priority-Areas.png')
await savePreview(workbook, 'Domain Index', `A1:E${domainLastRow}`, 'after-Domain-Index.png')
await savePreview(workbook, 'Field Guide', 'A1:D22', 'after-Field-Guide.png')

await fs.mkdir(outputDirectory, { recursive: true })
const output = await SpreadsheetFile.exportXlsx(workbook)
await output.save(outputPath)
await fs.copyFile(outputPath, inputPath)

console.log(JSON.stringify({ outputPath, repositoryPath: inputPath, finalRow, domainLastRow, missingDomains }, null, 2))
