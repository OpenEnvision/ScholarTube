// Unit-style checks for the learning-path builder. For every goal and a grid
// of language/duration preferences, a path must be non-empty, capped at six,
// duplicate-free, drawn from the catalog, majority-on-goal (with documented
// foundation fill), and stable across runs and input shuffles.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  PATH_GOALS,
  buildLearningPath,
  goalMatches,
  isSupportResource,
  prerequisiteNodes,
  topResearchers,
} from '../src/learning-utils.js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const resources = JSON.parse(readFileSync(join(root, 'data', 'scholar_tube_resources.json'), 'utf8'))
const catalogIds = new Set(resources.map((resource) => resource.id))

let checks = 0
let failures = 0

function assert(condition, message) {
  checks += 1
  if (condition) return
  failures += 1
  console.error(`  FAIL ${message}`)
}

const languages = ['All', 'English', 'Chinese']
const durations = [20, 45, 90]

// A fixed pseudo-shuffle: the path must not depend on catalog file order.
function shuffled(list) {
  const copy = [...list]
  let seed = 2026
  for (let i = copy.length - 1; i > 0; i -= 1) {
    seed = (seed * 48271) % 2147483647
    const j = seed % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const shuffledResources = shuffled(resources)

for (const goal of PATH_GOALS) {
  console.log(`Goal: ${goal.value}`)
  assert(typeof goal.summary === 'string' && goal.summary.length > 80, `${goal.value}: summary reads as a real description`)
  assert(Array.isArray(goal.stages) && goal.stages.length >= 3, `${goal.value}: has a stage trail`)
  assert(prerequisiteNodes(goal.value).length >= 3, `${goal.value}: prerequisite chain has at least three stages`)

  for (const language of languages) {
    for (const minutes of durations) {
      const label = `${goal.value} / ${language} / ${minutes}min`
      const path = buildLearningPath(resources, goal.value, { language, minutes })

      assert(path.length >= 1 && path.length <= 6, `${label}: path length 1–6 (got ${path.length})`)
      assert(new Set(path.map((r) => r.id)).size === path.length, `${label}: no duplicate ids`)
      assert(path.every((r) => catalogIds.has(r.id)), `${label}: every item exists in the catalog`)

      const onGoal = path.filter((r) => goalMatches(r, goal.value))
      const offGoal = path.filter((r) => !goalMatches(r, goal.value))
      assert(onGoal.length >= 1, `${label}: at least one on-goal item`)
      assert(
        onGoal.length * 2 >= path.length || offGoal.every((r) => isSupportResource(r, goal.value)),
        `${label}: majority on goal, or every extra item is documented foundation support`,
      )
      // Support material never displaces the goal: goal items come first.
      const firstOffGoal = path.findIndex((r) => !goalMatches(r, goal.value))
      if (firstOffGoal >= 0) {
        assert(
          path.slice(firstOffGoal).every((r) => !goalMatches(r, goal.value)),
          `${label}: foundation support sits after the goal items`,
        )
      }

      const rerun = buildLearningPath(resources, goal.value, { language, minutes })
      assert(
        rerun.map((r) => r.id).join() === path.map((r) => r.id).join(),
        `${label}: identical output across two runs`,
      )
      const reordered = buildLearningPath(shuffledResources, goal.value, { language, minutes })
      assert(
        reordered.map((r) => r.id).join() === path.map((r) => r.id).join(),
        `${label}: output independent of catalog file order`,
      )
    }
  }
}

// The documented hard edge: a Chinese-only, 20-minute Math session has no
// exact match in the catalog and must still produce a usable path.
const edge = buildLearningPath(resources, 'Math', { language: 'Chinese', minutes: 20 })
assert(edge.length >= 1, 'Chinese/20min/Math: still shows the best available sources')

// Researcher view: split multi-speaker credits, drop placeholder and junk
// entries, and only keep people the index can actually follow.
const researchers = topResearchers(resources)
assert(researchers.length > 0, 'topResearchers: returns entries')
assert(researchers.every((entry) => entry.resources.length >= 2), 'topResearchers: every entry has at least two indexed resources')
assert(researchers.every((entry) => !entry.name.includes(',')), 'topResearchers: comma lists are split into people')
assert(researchers.every((entry) => entry.name !== 'To be added' && !/\d/.test(entry.name)), 'topResearchers: no placeholders, years, or episode labels')

console.log(`\n${checks} checks, ${failures} failures`)
if (failures > 0) process.exit(1)
