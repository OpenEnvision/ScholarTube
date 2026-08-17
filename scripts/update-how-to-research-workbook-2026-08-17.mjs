import fs from 'node:fs/promises'
import path from 'node:path'
import { FileBlob, SpreadsheetFile } from '/Users/tianjuanxi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'

const projectDirectory = '/Users/tianjuanxi/Downloads/ScholarTube-main'
const inputPath = path.join(projectDirectory, 'data', 'scholar_tube_seed_list.xlsx')
const dataPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const outputDirectory = path.join(projectDirectory, 'outputs', '01a00e0e-36f0-77d1-86e9-b03c354c865e')
const outputPath = path.join(outputDirectory, 'scholar_tube_seed_list.xlsx')
const previewDirectory = '/private/tmp/scholartube-math-and-researcher-after'
const previousFinalRow = 942

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

function updateFormulaBounds(sheet, finalRow) {
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
  const preview = await workbook.render({ sheetName, range, scale: 1.35, format: 'png' })
  await fs.writeFile(path.join(previewDirectory, filename), new Uint8Array(await preview.arrayBuffer()))
}

const resources = JSON.parse(await fs.readFile(dataPath, 'utf8'))
if (resources.length !== 942) throw new Error(`Expected 942 resources, found ${resources.length}`)
if (resources.filter((resource) => resource.focusArea === 'How to Research').length !== 30) {
  throw new Error('Expected 30 How to Research resources.')
}

const finalRow = resources.length + 1
const input = await FileBlob.load(inputPath)
const workbook = await SpreadsheetFile.importXlsx(input)
const overview = workbook.worksheets.getItem('Overview')
const resourcesSheet = workbook.worksheets.getItem('Resources')
const priorityAreas = workbook.worksheets.getItem('Priority Areas')
const domainIndex = workbook.worksheets.getItem('Domain Index')
const fieldGuide = workbook.worksheets.getItem('Field Guide')

const existingTable = resourcesSheet.tables.items.find((table) => table.name === 'ScholarTubeResources')
if (!existingTable) throw new Error('ScholarTubeResources table was not found')
existingTable.delete()
resourcesSheet.getRange('A2:W4776').clear({ applyTo: 'contents' })
resourcesSheet.getRange('A1:W1').values = [[
  'ID', 'Section', 'Research Direction', 'AI Domain', 'Topics / Keywords', 'Language', 'Title',
  'Speaker / Guest / Instructor', 'Publisher / Channel', 'Format', 'Duration (min)', 'Video URL',
  'Platform', 'Views (at collection)', 'Source Tier', 'Recommendation', 'Link Status', 'Collected On',
  'Notes', 'Video ID', 'Series', 'Series Order', 'Series ID',
]]
resourcesSheet.getRange(`A2:W${finalRow}`).values = resources.map(rowForWorkbook)
resourcesSheet.getRange(`K2:K${finalRow}`).setNumberFormat('0')
resourcesSheet.getRange(`N2:N${finalRow}`).setNumberFormat('#,##0')
resourcesSheet.getRange(`R2:R${finalRow}`).setNumberFormat('yyyy-mm-dd')
resourcesSheet.getRange(`V2:V${finalRow}`).setNumberFormat('0')
resourcesSheet.getRange(`C1:C${finalRow}`).format.columnWidth = 20
const resourceTable = resourcesSheet.tables.add(`A1:W${finalRow}`, true, 'ScholarTubeResources')
resourceTable.style = 'TableStyleMedium2'
resourceTable.showBandedRows = true
resourceTable.showFilterButton = true
resourcesSheet.getRange(`B2:B${finalRow}`).dataValidation = { rule: { type: 'list', values: ['Interview', 'Course', 'Talk'] } }
resourcesSheet.getRange(`C2:C${finalRow}`).dataValidation = { rule: { type: 'list', values: ['World Model', 'Agent', 'Vision', 'Robotics', 'Other', 'How to Research'] } }
resourcesSheet.getRange(`F2:F${finalRow}`).dataValidation = { rule: { type: 'list', values: ['English', 'Chinese'] } }
resourcesSheet.getRange(`M2:M${finalRow}`).dataValidation = { rule: { type: 'list', values: ['YouTube', 'Bilibili', 'Conference Site', 'Official Site'] } }
resourcesSheet.getRange(`O2:O${finalRow}`).dataValidation = { rule: { type: 'list', values: [
  'A | Official / Original Creator / Organizer',
  'B | University / Conference / Institution',
  'C | Community Selection',
] } }
resourcesSheet.getRange(`P2:P${finalRow}`).dataValidation = { rule: { type: 'list', values: ['Core', 'Recommended', 'Reserve'] } }
resourcesSheet.getRange(`Q2:Q${finalRow}`).dataValidation = { rule: { type: 'list', values: ['Verified', 'Pending Verification', 'Periodic Review', 'Inactive'] } }

for (const sheet of [overview, priorityAreas, domainIndex]) updateFormulaBounds(sheet, finalRow)

const domainCounts = countBy(resources, 'domain')
const channelCounts = countBy(resources, 'channel')
const directions = ['World Model', 'Agent', 'Vision', 'Robotics', 'Other', 'How to Research']
const platforms = ['YouTube', 'Bilibili', 'Conference Site', 'Official Site']
const courseSeries = new Set(resources.filter((resource) => resource.section === 'Course' && resource.seriesId).map((resource) => resource.seriesId))
const interviewSeries = new Set(resources.filter((resource) => resource.section === 'Interview' && resource.seriesId).map((resource) => resource.seriesId))
const courseSeriesVideos = resources.filter((resource) => resource.section === 'Course' && resource.seriesId).length
const interviewSeriesVideos = resources.filter((resource) => resource.section === 'Interview' && resource.seriesId).length
const courseEntries = resources.filter((resource) => resource.section === 'Course').length - courseSeriesVideos + courseSeries.size
const interviewEntries = resources.filter((resource) => resource.section === 'Interview').length - interviewSeriesVideos + interviewSeries.size

overview.getRange('A2:L2').clear({ applyTo: 'contents' })
overview.getRange('A2').values = [[`${resources.length} direct videos · ${resources.filter((resource) => resource.focusArea !== 'Other').length} focused-direction resources · ${courseSeries.size + interviewSeries.size} explicit series`]]
overview.getRange('A5').formulas = [[`=COUNTA('Resources'!$A$2:$A$${finalRow})`]]
overview.getRange('D5').formulas = [[`=COUNTIF('Resources'!$B$2:$B$${finalRow},D4)`]]
overview.getRange('G5').formulas = [[`=COUNTIF('Resources'!$B$2:$B$${finalRow},G4)`]]
overview.getRange('J5').formulas = [[`=COUNTIF('Resources'!$B$2:$B$${finalRow},J4)`]]
overview.getRange('A8').formulas = [[`=COUNTIF('Resources'!$O$2:$O$${finalRow},"A | Official / Original Creator / Organizer")`]]
overview.getRange('D7:F7').clear({ applyTo: 'contents' })
overview.getRange('D7').values = [['Focused Directions']]
overview.getRange('D8').formulas = [[`=COUNTIF('Resources'!$C$2:$C$${finalRow},"<>Other")`]]
overview.getRange('G8').formulas = [[`=COUNTIF('Resources'!$F$2:$F$${finalRow},"Chinese")`]]
overview.getRange('J8').formulas = [[`=COUNTIF('Resources'!$Q$2:$Q$${finalRow},"Verified")`]]
overview.getRange('A10:L10').clear({ applyTo: 'contents' })
overview.getRange('A10').values = [['Filtering recommendation: enter through six research directions. Use Broader AI for cross-cutting field knowledge and How to Research for the craft of problem finding, evidence, writing, review, and communication.']]
overview.getRange('A13:A24').values = domainCounts.slice(0, 12).map(([label]) => [label])
overview.getRange('B13:B24').formulas = domainCounts.slice(0, 12).map((_, index) => [[`=COUNTIF('Resources'!$D$2:$D$${finalRow},A${index + 13})`]][0])
overview.getRange('C13:C24').formulas = domainCounts.slice(0, 12).map((_, index) => [[`=B${index + 13}/$A$5`]][0])
overview.getRange('A13:A24').format.wrapText = true
overview.getRange('A13:A24').format.rowHeight = 26
overview.getRange('E13:E24').values = channelCounts.slice(0, 12).map(([label]) => [label])
overview.getRange('F13:F24').formulas = channelCounts.slice(0, 12).map((_, index) => [[`=COUNTIF('Resources'!$I$2:$I$${finalRow},E${index + 13})`]][0])
overview.getRange('J13:K16').clear({ applyTo: 'contents' })
overview.getRange('J13:J16').values = platforms.map((platform) => [platform])
overview.getRange('K13:K16').formulas = platforms.map((_, index) => [`=COUNTIF('Resources'!$M$2:$M$${finalRow},J${index + 13})`])
overview.getRange('H18:L18').clear({ applyTo: 'contents' })
overview.getRange('H18').values = [[`${courseSeries.size} course series (${courseSeriesVideos} videos → ${courseEntries} entries) · ${interviewSeries.size} interview series (${interviewSeriesVideos} videos → ${interviewEntries} entries)`]]

priorityAreas.getRange('A1:I1').unmerge()
priorityAreas.getRange('A1:I1').merge()
priorityAreas.getRange('A1:I1').clear({ applyTo: 'contents' })
priorityAreas.getRange('A1').values = [['Six Research Directions']]
priorityAreas.getRange('A2:I2').unmerge()
priorityAreas.getRange('A2:I2').merge()
priorityAreas.getRange('A2:I2').clear({ applyTo: 'contents' })
priorityAreas.getRange('A2').values = [['Each resource uses one primary direction. Broader AI holds cross-cutting field knowledge; How to Research holds research method and practice.']]
priorityAreas.getRange('A4:I4').values = [['Direction', 'Total', 'Interview', 'Course', 'Talk', 'YouTube', 'Bilibili', 'Conference Site', 'Official Site']]
priorityAreas.getRange('A5:I10').values = directions.map((direction) => [direction, null, null, null, null, null, null, null, null])
priorityAreas.getRange('B5:I10').formulas = directions.map((_, index) => {
  const row = index + 5
  return [
    `=COUNTIF('Resources'!$C$2:$C$${finalRow},$A${row})`,
    `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},C$4)`,
    `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},D$4)`,
    `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},E$4)`,
    `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},F$4)`,
    `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},G$4)`,
    `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},H$4)`,
    `=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},I$4)`,
  ]
})
priorityAreas.getRange('A10').format.fill = '#EDE9FE'
priorityAreas.getRange('B10:I10').format.fill = '#DDD6FE'
priorityAreas.getRange('I1').format.fill = '#102A43'
priorityAreas.getRange('I2').format.fill = '#D9E8F5'
priorityAreas.getRange('I4').format.fill = '#168579'
priorityAreas.getRange('I4').format.font = { bold: true, color: '#FFFFFF' }
priorityAreas.getRange('I4:I10').format.horizontalAlignment = 'center'
priorityAreas.getRange('H4:I12').format.columnWidth = 22
for (let row = 5; row <= 9; row += 1) priorityAreas.getRange(`I${row}`).format.fill = row % 2 === 1 ? '#C6EFCE' : '#FFFFFF'
priorityAreas.getRange('A11:I12').unmerge()
priorityAreas.getRange('A11:I12').merge()
priorityAreas.getRange('A11:I12').clear({ applyTo: 'contents' })
priorityAreas.getRange('A11:I12').format.fill = '#FFF5DE'
priorityAreas.getRange('A11').values = [['Editorial recommendation: expose all six directions in the interface. How to Research should remain method-focused and source-audited; use Broader AI for field material that does not fit a specialist direction.']]

fieldGuide.getRange('A5').values = [['Research Direction']]
fieldGuide.getRange('B5').values = [['World Model / Agent / Vision / Robotics / Other / How to Research']]
fieldGuide.getRange('C5').values = [['Six direction filters and direction collections']]
fieldGuide.getRange('D5').values = [['Assign one primary direction per resource; use How to Research only when the resource primarily teaches research method or practice.']]
fieldGuide.getRange('D12').values = [['The How to Research and mathematics/researcher-talk batches were source-audited on 2026-08-17. Public metadata was recorded conservatively; unavailable dates, views, or subtitle tracks were left empty and marked Partial.']]
fieldGuide.getRange('B22').values = [['YouTube, Bilibili, official conference recording sites, and official publisher or university video pages are included.']]
fieldGuide.getRange('D22').values = [['Add another platform only when its canonical source and stable public metadata can be verified.']]

const sortedDomains = domainCounts.map(([domain]) => domain).sort((a, b) => a.localeCompare(b))
const domainLastRow = sortedDomains.length + 1
domainIndex.getRange('A2:E150').clear({ applyTo: 'contents' })
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

const overviewCheck = await workbook.inspect({ kind: 'table', range: 'Overview!A1:L24', include: 'values,formulas', tableMaxRows: 24, tableMaxCols: 12, maxChars: 7500 })
const priorityCheck = await workbook.inspect({ kind: 'table', range: 'Priority Areas!A1:I12', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 9, maxChars: 7500 })
const resourceCheck = await workbook.inspect({ kind: 'table', range: `Resources!A884:W${finalRow}`, include: 'values,formulas', tableMaxRows: 64, tableMaxCols: 23, maxChars: 18000 })
const domainCheck = await workbook.inspect({ kind: 'table', range: `Domain Index!A1:E${domainLastRow}`, include: 'values,formulas', tableMaxRows: 120, tableMaxCols: 5, maxChars: 7500 })
const formulaErrors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 300 },
  summary: 'final formula error scan',
  maxChars: 3500,
})
console.log(overviewCheck.ndjson)
console.log(priorityCheck.ndjson)
console.log(resourceCheck.ndjson)
console.log(domainCheck.ndjson)
console.log(formulaErrors.ndjson)

await fs.mkdir(previewDirectory, { recursive: true })
await savePreview(workbook, 'Overview', 'A1:L24', 'Overview.png')
await savePreview(workbook, 'Resources', 'A1:W18', 'Resources-top.png')
await savePreview(workbook, 'Resources', `A884:W${finalRow}`, 'Resources-bottom.png')
await savePreview(workbook, 'Priority Areas', 'A1:I12', 'Priority-Areas.png')
await savePreview(workbook, 'Domain Index', `A1:E${domainLastRow}`, 'Domain-Index.png')
await savePreview(workbook, 'Field Guide', 'A1:D22', 'Field-Guide.png')

await fs.mkdir(outputDirectory, { recursive: true })
const output = await SpreadsheetFile.exportXlsx(workbook)
await output.save(outputPath)
await fs.copyFile(outputPath, inputPath)

console.log(JSON.stringify({
  outputPath,
  repositoryPath: inputPath,
  finalRow,
  domainLastRow,
  tableRange: resourceTable.getRange().address,
  previewDirectory,
}, null, 2))
