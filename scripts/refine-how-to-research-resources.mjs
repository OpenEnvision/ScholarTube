import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const jsonPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.json')
const csvPath = path.join(projectDirectory, 'data', 'scholar_tube_resources.csv')

const excludedIds = ['ST-800', 'ST-803', 'ST-822', 'ST-828', 'ST-870', 'ST-882']

function csvCell(value) {
  const normalized = Array.isArray(value)
    ? value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : value ?? ''
  const text = String(normalized)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const resources = JSON.parse(await readFile(jsonPath, 'utf8'))
if (resources.length !== 889) throw new Error(`Expected 889 resources; found ${resources.length}.`)
const initialHowToResearchCount = resources.filter((resource) => resource.focusArea === 'How to Research').length
if (![30, 36].includes(initialHowToResearchCount)) {
  throw new Error(`Expected 30 or 36 How to Research resources; found ${initialHowToResearchCount}.`)
}

for (const id of excludedIds) {
  const resource = resources.find((item) => item.id === id)
  if (!resource) throw new Error(`Cannot refine missing resource ${id}.`)
  resource.focusArea = 'Other'
}

const excludedWorkshopPart = resources.find((item) => item.id === 'ST-870')
excludedWorkshopPart.seriesId = ''
excludedWorkshopPart.seriesTitle = ''
excludedWorkshopPart.seriesOrder = null

for (const [id, order] of [['ST-871', 1], ['ST-872', 2]]) {
  const resource = resources.find((item) => item.id === id)
  if (!resource) throw new Error(`Cannot update missing series resource ${id}.`)
  resource.seriesId = 'good-citizen-cvpr-2018-research-practice'
  resource.seriesTitle = 'Good Citizen of CVPR 2018 — Research Practice Sessions'
  resource.seriesOrder = order
}

const headers = Object.keys(resources[0])
const ids = resources.map((resource) => resource.id)
const urls = resources.map((resource) => resource.url)
if (new Set(ids).size !== resources.length) throw new Error('Resource IDs are not unique.')
if (new Set(urls).size !== resources.length) throw new Error('Resource URLs are not unique.')
if (resources.some((resource) => headers.some((header) => !(header in resource)))) {
  throw new Error('Resource schemas do not match the canonical header set.')
}

const focusCounts = Object.fromEntries([...new Set(resources.map((resource) => resource.focusArea))].map((focusArea) => [
  focusArea,
  resources.filter((resource) => resource.focusArea === focusArea).length,
]))
if (focusCounts['How to Research'] !== 30 || focusCounts.Other !== 321) {
  throw new Error(`Unexpected refined focus counts: ${JSON.stringify(focusCounts)}`)
}

await writeFile(jsonPath, `${JSON.stringify(resources, null, 2)}\n`)
const csv = [headers.join(','), ...resources.map((resource) => headers.map((header) => csvCell(resource[header])).join(','))].join('\n')
await writeFile(csvPath, `${csv}\n`)

console.log(JSON.stringify({ total: resources.length, excludedIds, focusCounts }, null, 2))
