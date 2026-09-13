import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const artifactTool = await import(pathToFileURL('C:/Users/dyden/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'))
const { FileBlob, SpreadsheetFile } = artifactTool
const projectDirectory = process.cwd()
const inputPath = path.join(projectDirectory, 'data', 'scholar_tube_seed_list.xlsx')
const dataPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const outputDirectory = path.join(projectDirectory, 'outputs', 'main-sync-2026-09-13')
const outputPath = path.join(outputDirectory, 'scholar_tube_seed_list.xlsx')
const previewDirectory = path.join(outputDirectory, 'previews')

function countBy(rows, field) {
  return Object.entries(rows.reduce((counts, row) => {
    const key = row[field] || 'Unknown'
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function excelDate(value) { return value ? new Date(`${value}T00:00:00Z`) : null }

function rowForWorkbook(resource) {
  return [resource.id, resource.section, resource.focusArea, resource.domain, resource.keywords,
    resource.language, resource.title, resource.speaker, resource.channel, resource.format,
    resource.durationMinutes, resource.url, resource.platform, resource.viewCount, resource.sourceTier,
    resource.recommendation, resource.status, excelDate(resource.collectedOn), resource.notes,
    resource.videoId, resource.seriesTitle || '', resource.seriesOrder ?? null, resource.seriesId || '']
}

function updateFormulaBounds(sheet, finalRow) {
  const used = sheet.getUsedRange(false)
  const formulas = used.formulas
  for (let r = 0; r < formulas.length; r += 1) {
    for (let c = 0; c < formulas[r].length; c += 1) {
      const formula = formulas[r][c]
      if (typeof formula !== 'string' || !formula.startsWith('=')) continue
      const updated = formula.replace(/(Resources'!\$[A-Z]+\$2:\$[A-Z]+\$)\d+/g, `$1${finalRow}`)
      if (updated !== formula) {
        let col = c + 1; let label = ''
        while (col > 0) { col -= 1; label = String.fromCharCode(65 + (col % 26)) + label; col = Math.floor(col / 26) }
        sheet.getRange(`${label}${r + 1}`).formulas = [[updated]]
      }
    }
  }
}

async function savePreview(workbook, sheetName, range, filename) {
  const preview = await workbook.render({ sheetName, range, scale: 1.25, format: 'png' })
  await fs.writeFile(path.join(previewDirectory, filename), new Uint8Array(await preview.arrayBuffer()))
}

const resources = JSON.parse(await fs.readFile(dataPath, 'utf8'))
if (resources.length < 1300) throw new Error(`Unexpected resource count: ${resources.length}`)
const finalRow = resources.length + 1
const domainCounts = countBy(resources, 'domain')
const channelCounts = countBy(resources, 'channel')
const directions = ['World Model', 'Agent', 'Vision', 'Robotics', 'Other', 'How to Research']
const platforms = ['YouTube', 'Bilibili', 'Conference Site', 'Official Site']
const tiers = [...new Set(resources.map((resource) => resource.sourceTier).filter(Boolean))]
const courseSeries = new Set(resources.filter((r) => r.section === 'Course' && r.seriesId).map((r) => r.seriesId))
const interviewSeries = new Set(resources.filter((r) => r.section === 'Interview' && r.seriesId).map((r) => r.seriesId))
const courseSeriesVideos = resources.filter((r) => r.section === 'Course' && r.seriesId).length
const interviewSeriesVideos = resources.filter((r) => r.section === 'Interview' && r.seriesId).length
const courseEntries = resources.filter((r) => r.section === 'Course').length - courseSeriesVideos + courseSeries.size
const interviewEntries = resources.filter((r) => r.section === 'Interview').length - interviewSeriesVideos + interviewSeries.size

await fs.mkdir(outputDirectory, { recursive: true })
await fs.mkdir(previewDirectory, { recursive: true })
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath))
const overview = workbook.worksheets.getItem('Overview')
const resourcesSheet = workbook.worksheets.getItem('Resources')
const priorityAreas = workbook.worksheets.getItem('Priority Areas')
const domainIndex = workbook.worksheets.getItem('Domain Index')
const fieldGuide = workbook.worksheets.getItem('Field Guide')

const existingTable = resourcesSheet.tables.items.find((table) => table.name === 'ScholarTubeResources')
if (!existingTable) throw new Error('ScholarTubeResources table was not found')
existingTable.delete()
resourcesSheet.getRange('A2:W5000').clear({ applyTo: 'contents' })
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
resourcesSheet.getRange(`V2:V${finalRow}`).setNumberFormat('0.00')
resourcesSheet.getRange('C1:C5000').format.columnWidth = 20
const resourceTable = resourcesSheet.tables.add(`A1:W${finalRow}`, true, 'ScholarTubeResources')
resourceTable.style = 'TableStyleMedium2'
resourceTable.showBandedRows = true
resourceTable.showFilterButton = true
resourcesSheet.getRange(`B2:B${finalRow}`).dataValidation = { rule: { type: 'list', values: ['Interview', 'Course', 'Talk'] } }
resourcesSheet.getRange(`C2:C${finalRow}`).dataValidation = { rule: { type: 'list', values: directions } }
resourcesSheet.getRange(`F2:F${finalRow}`).dataValidation = { rule: { type: 'list', values: ['English', 'Chinese'] } }
resourcesSheet.getRange(`M2:M${finalRow}`).dataValidation = { rule: { type: 'list', values: platforms } }
resourcesSheet.getRange(`O2:O${finalRow}`).dataValidation = { rule: { type: 'list', values: tiers } }
resourcesSheet.getRange(`P2:P${finalRow}`).dataValidation = { rule: { type: 'list', values: ['Core', 'Recommended', 'Reserve'] } }
resourcesSheet.getRange(`Q2:Q${finalRow}`).dataValidation = { rule: { type: 'list', values: ['Verified', 'Pending Verification', 'Periodic Review', 'Inactive'] } }

for (const sheet of [overview, priorityAreas, domainIndex]) updateFormulaBounds(sheet, finalRow)
overview.getRange('A2:L2').clear({ applyTo: 'contents' })
overview.getRange('A2').values = [[`${resources.length} direct videos · ${resources.filter((r) => r.focusArea !== 'Other').length} focused-direction resources · ${courseSeries.size + interviewSeries.size} explicit series`]]
overview.getRange('A5').formulas = [[`=COUNTA('Resources'!$A$2:$A$${finalRow})`]]
overview.getRange('D5').formulas = [[`=COUNTIF('Resources'!$B$2:$B$${finalRow},D4)`]]
overview.getRange('G5').formulas = [[`=COUNTIF('Resources'!$B$2:$B$${finalRow},G4)`]]
overview.getRange('J5').formulas = [[`=COUNTIF('Resources'!$B$2:$B$${finalRow},J4)`]]
overview.getRange('A8').formulas = [[`=COUNTIF('Resources'!$O$2:$O$${finalRow},"A | Official / Original Creator / Organizer")`]]
overview.getRange('D7:F7').clear({ applyTo: 'contents' }); overview.getRange('D7').values = [['Focused Directions']]
overview.getRange('D8').formulas = [[`=COUNTIF('Resources'!$C$2:$C$${finalRow},"<>Other")`]]
overview.getRange('G8').formulas = [[`=COUNTIF('Resources'!$F$2:$F$${finalRow},"Chinese")`]]
overview.getRange('J8').formulas = [[`=COUNTIF('Resources'!$Q$2:$Q$${finalRow},"Verified")`]]
overview.getRange('A10:L10').clear({ applyTo: 'contents' }); overview.getRange('A10').values = [['Filtering recommendation: enter through six research directions. Use Broader AI for cross-cutting field knowledge and How to Research for the craft of problem finding, evidence, writing, review, and communication.']]
overview.getRange('A13:A24').values = domainCounts.slice(0, 12).map(([label]) => [label])
overview.getRange('B13:B24').formulas = domainCounts.slice(0, 12).map((_, i) => [[`=COUNTIF('Resources'!$D$2:$D$${finalRow},A${i + 13})`]][0])
overview.getRange('C13:C24').formulas = domainCounts.slice(0, 12).map((_, i) => [[`=B${i + 13}/$A$5`]][0])
overview.getRange('E13:E24').values = channelCounts.slice(0, 12).map(([label]) => [label])
overview.getRange('F13:F24').formulas = channelCounts.slice(0, 12).map((_, i) => [[`=COUNTIF('Resources'!$I$2:$I$${finalRow},E${i + 13})`]][0])
overview.getRange('J13:J16').values = platforms.map((platform) => [platform])
overview.getRange('K13:K16').formulas = platforms.map((_, i) => [`=COUNTIF('Resources'!$M$2:$M$${finalRow},J${i + 13})`])
overview.getRange('H18:L18').clear({ applyTo: 'contents' }); overview.getRange('H18').values = [[`${courseSeries.size} course series (${courseSeriesVideos} videos → ${courseEntries} entries) · ${interviewSeries.size} interview series (${interviewSeriesVideos} videos → ${interviewEntries} entries)`]]

priorityAreas.getRange('A1:I1').unmerge(); priorityAreas.getRange('A1:I1').merge(); priorityAreas.getRange('A1:I1').clear({ applyTo: 'contents' }); priorityAreas.getRange('A1').values = [['Six Research Directions']]
priorityAreas.getRange('A2:I2').unmerge(); priorityAreas.getRange('A2:I2').merge(); priorityAreas.getRange('A2:I2').clear({ applyTo: 'contents' }); priorityAreas.getRange('A2').values = [['Each resource uses one primary direction. Broader AI holds cross-cutting field knowledge; How to Research holds research method and practice.']]
priorityAreas.getRange('A4:I4').values = [['Direction', 'Total', 'Interview', 'Course', 'Talk', 'YouTube', 'Bilibili', 'Conference Site', 'Official Site']]
priorityAreas.getRange('A5:I10').values = directions.map((direction) => [direction, null, null, null, null, null, null, null, null])
priorityAreas.getRange('B5:I10').formulas = directions.map((_, i) => { const row = i + 5; return [`=COUNTIF('Resources'!$C$2:$C$${finalRow},$A${row})`,`=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},C$4)`,`=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},D$4)`,`=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},E$4)`,`=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},F$4)`,`=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},G$4)`,`=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},H$4)`,`=COUNTIFS('Resources'!$C$2:$C$${finalRow},$A${row},'Resources'!$M$2:$M$${finalRow},I$4)`] })

const sortedDomains = domainCounts.map(([domain]) => domain).sort((a, b) => a.localeCompare(b))
const domainLastRow = sortedDomains.length + 1
domainIndex.getRange('A2:E250').clear({ applyTo: 'contents' })
domainIndex.getRange(`A2:A${domainLastRow}`).values = sortedDomains.map((domain) => [domain])
domainIndex.getRange(`B2:E${domainLastRow}`).formulas = sortedDomains.map((_, i) => { const row = i + 2; return [`=COUNTIF('Resources'!$D$2:$D$${finalRow},$A${row})`,`=COUNTIFS('Resources'!$D$2:$D$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},C$1)`,`=COUNTIFS('Resources'!$D$2:$D$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},D$1)`,`=COUNTIFS('Resources'!$D$2:$D$${finalRow},$A${row},'Resources'!$B$2:$B$${finalRow},E$1)`] })

fieldGuide.getRange('D12').values = [['The catalog was source-audited through 2026-09-13. Public metadata is recorded conservatively; unavailable subtitle tracks remain unverified and YouTube metadata may be Partial when anti-bot checks block direct access.']]
await workbook.recalculate()
const checks = [
  await workbook.inspect({ kind: 'table', range: 'Overview!A1:L24', include: 'values,formulas', tableMaxRows: 24, tableMaxCols: 12, maxChars: 7500 }),
  await workbook.inspect({ kind: 'table', range: 'Priority Areas!A1:I12', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 9, maxChars: 7500 }),
  await workbook.inspect({ kind: 'table', range: `Resources!A${Math.max(2, finalRow - 20)}:W${finalRow}`, include: 'values,formulas', tableMaxRows: 24, tableMaxCols: 23, maxChars: 16000 }),
  await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: { useRegex: true, maxResults: 300 }, summary: 'final formula error scan', maxChars: 3500 }),
]
for (const check of checks) console.log(check.ndjson)
await savePreview(workbook, 'Overview', 'A1:L24', 'Overview.png')
await savePreview(workbook, 'Resources', 'A1:W18', 'Resources-top.png')
await savePreview(workbook, 'Resources', `A${Math.max(2, finalRow - 20)}:W${finalRow}`, 'Resources-bottom.png')
await savePreview(workbook, 'Priority Areas', 'A1:I12', 'Priority-Areas.png')
await savePreview(workbook, 'Domain Index', `A1:E${domainLastRow}`, 'Domain-Index.png')
await savePreview(workbook, 'Field Guide', 'A1:D22', 'Field-Guide.png')
const output = await SpreadsheetFile.exportXlsx(workbook)
await output.save(outputPath)
await fs.copyFile(outputPath, inputPath)
console.log(JSON.stringify({ repositoryPath: inputPath, outputPath, finalRow, domainLastRow, tableRange: resourceTable.getRange().address, previews: previewDirectory }, null, 2))
