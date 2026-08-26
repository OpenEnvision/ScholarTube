// Assertion suite for the resource detail copy engine and editorial overrides.
// Run with: npm run test:detail

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildAudience, buildWhyWatch, getResourceDetail } from '../src/resource-detail-utils.js'
import { editorialOverrides } from '../src/editorial-overrides.js'
import { formatDuration } from '../src/resource-utils.js'

const resources = JSON.parse(
  readFileSync(new URL('../data/scholar_tube_resources.json', import.meta.url), 'utf8'),
)
const byId = new Map(resources.map((resource) => [resource.id, resource]))

let checks = 0
function check(condition, message) {
  checks += 1
  assert.ok(condition, message)
}

// --- Editorial overrides stay wired to real catalog entries -------------------

const overrideIds = Object.keys(editorialOverrides)
check(overrideIds.length >= 15, `expected at least 15 overrides, found ${overrideIds.length}`)

for (const id of overrideIds) {
  const entry = editorialOverrides[id]
  check(byId.has(id), `override ${id} does not exist in the catalog`)
  for (const field of ['whyWatch', 'audience']) {
    const text = entry[field]
    check(typeof text === 'string' && text.trim().length > 0, `override ${id} is missing ${field}`)
    check(
      text.length >= 200 && text.length <= 1000,
      `override ${id} ${field} length ${text.length} outside 200–1000 chars`,
    )
  }
}

// getResourceDetail must prefer the hand-written copy.
const anchor = byId.get(overrideIds[0])
const anchorDetail = getResourceDetail(anchor)
check(
  anchorDetail.whyWatch === editorialOverrides[anchor.id].whyWatch &&
    anchorDetail.audience === editorialOverrides[anchor.id].audience,
  'getResourceDetail must prefer editorial overrides',
)

// --- Generated copy: determinism, key entities, sane length -------------------

for (const resource of resources) {
  const whyWatch = buildWhyWatch(resource)
  const audience = buildAudience(resource)

  check(whyWatch === buildWhyWatch(resource), `${resource.id}: whyWatch is not deterministic`)
  check(audience === buildAudience(resource), `${resource.id}: audience is not deterministic`)

  check(whyWatch.includes(resource.title), `${resource.id}: whyWatch must quote the title`)
  const channel = resource.channel.trim().replace(/\s+/g, ' ')
  check(whyWatch.includes(channel), `${resource.id}: whyWatch must credit the channel`)
  check(
    audience.includes(formatDuration(resource.durationMinutes)),
    `${resource.id}: audience must state the duration`,
  )
  check(
    whyWatch.includes(resource.recommendation),
    `${resource.id}: whyWatch must state the ${resource.recommendation} placement`,
  )

  check(
    whyWatch.length >= 200 && whyWatch.length <= 1000,
    `${resource.id}: whyWatch length ${whyWatch.length} outside 200–1000 chars`,
  )
  check(
    audience.length >= 150 && audience.length <= 900,
    `${resource.id}: audience length ${audience.length} outside 150–900 chars`,
  )

  if (resource.language === 'Chinese') {
    check(audience.includes('Chinese'), `${resource.id}: Chinese resources must flag the language`)
  }
}

// --- Variation: same-shaped resources must not all share one template ----------

function canonicalize(resource, text) {
  let canonical = text
    .replaceAll(resource.title, '«title»')
    .replaceAll(resource.channel, '«channel»')
    .replaceAll(formatDuration(resource.durationMinutes), '«duration»')
  if (resource.speaker && resource.speaker !== 'To be added') {
    canonical = canonical.replaceAll(resource.speaker, '«speaker»')
  }
  if (resource.seriesTitle) canonical = canonical.replaceAll(resource.seriesTitle, '«series»')
  return canonical.replace(/\b(19|20)\d{2}\b/g, '«year»')
}

const whyWatchShapes = new Set()
const audienceShapes = new Set()
const courseShapes = new Set()
for (const resource of resources) {
  whyWatchShapes.add(canonicalize(resource, buildWhyWatch(resource)))
  audienceShapes.add(canonicalize(resource, buildAudience(resource)))
  if (resource.section === 'Course') {
    courseShapes.add(canonicalize(resource, buildWhyWatch(resource)))
  }
}

check(
  whyWatchShapes.size >= 40,
  `expected at least 40 distinct whyWatch templates in use, found ${whyWatchShapes.size}`,
)
check(
  audienceShapes.size >= 40,
  `expected at least 40 distinct audience templates in use, found ${audienceShapes.size}`,
)
check(
  courseShapes.size >= 6,
  `expected Course resources to rotate across at least 6 whyWatch shapes, found ${courseShapes.size}`,
)

console.log(`resource-detail tests passed: ${checks} assertions across ${resources.length} resources, ${overrideIds.length} editorial overrides.`)
