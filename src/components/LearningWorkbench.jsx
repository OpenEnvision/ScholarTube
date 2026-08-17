import { useMemo, useState } from 'react'
import { ArrowIcon, BookmarkIcon, ListIcon, QueueIcon, SearchIcon, TreeIcon } from '../icons'
import { buildLearningPath, PATH_GOALS, prerequisiteNodes, searchStudyRecords, topResearchers } from '../learning-utils'
import { formatDuration } from '../resource-utils'
import PathGraph from './PathGraph'

const progressOptions = [
  ['not-started', 'Not started'],
  ['in-progress', 'In progress'],
  ['completed', 'Completed'],
]

const learningPanes = [
  ['path', 'Learning path'],
  ['library', 'Saved & queue'],
  ['researchers', 'Researcher view'],
  ['notes', 'Notes & transcript search'],
]

function resourceByIds(resources, ids) {
  const byId = new Map(resources.map((resource) => [resource.id, resource]))
  return ids.map((id) => byId.get(id)).filter(Boolean)
}

export default function LearningWorkbench({ resources, workspace, actions, onOpen, onExplore, onFocus, onTopic, onBrowse }) {
  const [activePane, setActivePane] = useState('path')
  const [pathView, setPathView] = useState('graph')
  const [studyQuery, setStudyQuery] = useState('')
  const [selectedResearcher, setSelectedResearcher] = useState(null)
  const path = useMemo(() => buildLearningPath(resources, workspace.goal.focus, workspace.goal), [resources, workspace.goal])
  const queued = useMemo(() => resourceByIds(resources, workspace.queue), [resources, workspace.queue])
  const saved = useMemo(() => resourceByIds(resources, workspace.saved), [resources, workspace.saved])
  const researchers = useMemo(() => topResearchers(resources), [resources])
  const studyMatches = useMemo(() => searchStudyRecords(resources, workspace, studyQuery), [resources, workspace, studyQuery])
  const activeResearcher = researchers.find((entry) => entry.name === selectedResearcher) || researchers[0]
  const next = path.find((resource) => workspace.progress[resource.id] !== 'completed') || path[0]
  const completedInPath = path.filter((resource) => workspace.progress[resource.id] === 'completed').length
  const totalPathMinutes = path.reduce((total, resource) => total + resource.durationMinutes, 0)
  const progressPercent = path.length ? (completedInPath / path.length) * 100 : 0
  const noteCount = Object.values(workspace.notes).reduce((total, notes) => total + notes.length, 0)
  const transcriptCount = Object.values(workspace.transcripts).filter((text) => text?.trim()).length
  const tabCounts = {
    path: path.length,
    library: saved.length + queued.length,
    researchers: researchers.length,
    notes: noteCount + transcriptCount,
  }

  function setGoalField(field, value) {
    actions.setGoal({ [field]: value })
  }

  function focusLibrary(value) {
    onFocus(value)
    document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="learning-workbench" id="learning" aria-labelledby="learning-title">
      <div className="shell">
        <div className="learning-heading">
          <div>
            <p className="section-kicker">Your local workspace</p>
            <h2 id="learning-title">My learning</h2>
            <p>Paths, notes, saved sources, and progress stay in this browser.</p>
          </div>
          <div className="learning-stats" aria-label="Your learning stats">
            <span><b>{saved.length}</b> saved</span>
            <span><b>{queued.length}</b> in queue</span>
            <span><b>{noteCount}</b> notes</span>
          </div>
        </div>

        <div className="learning-tabs" role="tablist" aria-label="Learning workspace views">
          {learningPanes.map(([value, label]) => <button key={value} id={`learning-tab-${value}`} type="button" role="tab" aria-controls={`learning-panel-${value}`} aria-selected={activePane === value} className={activePane === value ? 'is-active' : ''} onClick={() => setActivePane(value)}><span>{label}</span><small>{tabCounts[value]}</small></button>)}
        </div>

        {activePane === 'path' ? (
          <div className="learning-pane path-pane" id="learning-panel-path" role="tabpanel" aria-labelledby="learning-tab-path">
            <div className="path-pane__controls">
              <div className="goal-form">
                <label>My goal
                  <select value={workspace.goal.focus} onChange={(event) => setGoalField('focus', event.target.value)}>
                    {PATH_GOALS.map((goal) => <option key={goal.value} value={goal.value}>{goal.label}</option>)}
                  </select>
                </label>
                <label>Preferred language
                  <select value={workspace.goal.language} onChange={(event) => setGoalField('language', event.target.value)}>
                    <option value="All">Any language</option><option value="English">English</option><option value="Chinese">Chinese</option>
                  </select>
                </label>
                <label>One sitting
                  <select value={workspace.goal.minutes} onChange={(event) => setGoalField('minutes', Number(event.target.value))}>
                    <option value={20}>20 minutes</option><option value={45}>45 minutes</option><option value={90}>90 minutes</option>
                  </select>
                </label>
              </div>
              <div className="path-pulse" aria-label={`${path.length} selected, ${formatDuration(totalPathMinutes)} total, ${completedInPath} of ${path.length} complete`}>
                <p><strong>{path.length} selected</strong><i>·</i><span>{formatDuration(totalPathMinutes)} total</span><i>·</i><span>{completedInPath} / {path.length} complete</span></p>
                <div className="path-pulse__rail" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
              </div>
              <div className="path-view-switch" role="group" aria-label="Path view">
                <button type="button" className={pathView === 'graph' ? 'is-active' : ''} aria-pressed={pathView === 'graph'} onClick={() => setPathView('graph')}><TreeIcon /> Graph</button>
                <button type="button" className={pathView === 'list' ? 'is-active' : ''} aria-pressed={pathView === 'list'} onClick={() => setPathView('list')}><ListIcon /> List</button>
              </div>
            </div>

            {pathView === 'graph' ? (
              <div className="path-graph-layout">
                <PathGraph
                  resources={resources}
                  activeCluster={workspace.goal.focus}
                  onConcept={(concept) => onTopic({ query: concept.query })}
                  onCluster={(cluster) => onTopic({ focus: cluster.focus })}
                  onIndex={() => onTopic()}
                  onOpen={onOpen}
                />
                <aside className="learning-side learning-side--row">
                  <NextStep next={next} workspace={workspace} actions={actions} onOpen={onOpen} />
                  <section className="prerequisite-map">
                    <div className="map-heading"><p className="mini-label">How to read it</p><span>tree legend</span></div>
                    <ul className="tree-guide">
                      <li><b>Click a dot and the map flies to it</b> — the card that opens carries you on to whatever comes next.</li>
                      <li><b>Rings grow outward</b> — the centre is the whole index, then each branch, then its basics, then what builds on them.</li>
                      <li><b>Arrows point the way</b> — solid inside a branch, dashed when the prerequisite comes from another branch.</li>
                      <li><b>Dot size and its number</b> are how many sources the index holds on that topic; the card opens them below.</li>
                    </ul>
                    <button type="button" className="button button--outline" onClick={onBrowse}>Browse the whole index <ArrowIcon /></button>
                  </section>
                </aside>
              </div>
            ) : (
            <div className="learning-grid">
            <div className="learning-path-panel">
              <div className="path-title-row"><div><p className="mini-label">A curated first pass</p><h3>{PATH_GOALS.find((goal) => goal.value === workspace.goal.focus)?.label}</h3></div><span>{path.length} steps</span></div>
              <ol className="path-list">
                {path.map((resource, index) => {
                  const progress = workspace.progress[resource.id] || 'not-started'
                  const isSaved = workspace.saved.includes(resource.id)
                  const isQueued = workspace.queue.includes(resource.id)
                  return <li key={resource.id} className={`path-row is-${progress} ${resource.id === next?.id ? 'is-current' : ''}`}>
                    <span className="path-order">{String(index + 1).padStart(2, '0')}</span>
                    <div className="path-content">
                      <button type="button" className="path-resource" onClick={() => onOpen(resource)}><strong>{resource.title}</strong><span>{resource.speaker} · {formatDuration(resource.durationMinutes)}</span></button>
                      <div className="path-quick-actions" aria-label={`Quick actions for ${resource.title}`}>
                        <button type="button" className={isSaved ? 'is-active' : ''} aria-pressed={isSaved} onClick={() => actions.toggleSaved(resource.id)}><BookmarkIcon />{isSaved ? 'Saved' : 'Save'}</button>
                        <button type="button" className={isQueued ? 'is-active' : ''} aria-pressed={isQueued} onClick={() => actions.toggleQueue(resource.id)}><QueueIcon />{isQueued ? 'Queued' : 'Queue'}</button>
                      </div>
                    </div>
                    <select aria-label={`Progress for ${resource.title}`} value={progress} onChange={(event) => actions.setProgress(resource.id, event.target.value)}>
                      {progressOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </li>
                })}
              </ol>
            </div>
            <aside className="learning-side">
              <NextStep next={next} workspace={workspace} actions={actions} onOpen={onOpen} />
              <section className="prerequisite-map"><div className="map-heading"><p className="mini-label">Prerequisite map</p><span>click to explore</span></div><div className="map-flow">{prerequisiteNodes(workspace.goal.focus).map((node, index) => <div key={node.id} className="map-node-wrap"><button type="button" className={index === 2 ? 'map-node is-target' : 'map-node'} onClick={() => focusLibrary(node.focus)}>{node.label}</button>{index < 2 ? <i aria-hidden="true" /> : null}</div>)}</div><p>Use the map as a learning order, not a claim that every topic has only one prerequisite.</p></section>
            </aside>
            </div>
            )}
          </div>
        ) : null}

        {activePane === 'library' ? <div className="workspace-collections learning-pane" id="learning-panel-library" role="tabpanel" aria-labelledby="learning-tab-library"><Collection title="Saved sources" resources={saved} empty="Keep the sources you want to return to in one calm, local shelf." action="Save a source" icon={<BookmarkIcon />} onOpen={onOpen} onRemove={actions.toggleSaved} onBrowse={onBrowse} /><Collection title="Watch later queue" resources={queued} empty="Queue the next source you want to watch, then resume it from here." action="Add to queue" icon={<QueueIcon />} onOpen={onOpen} onRemove={actions.toggleQueue} onBrowse={onBrowse} /></div> : null}

        {activePane === 'researchers' ? <div className="researcher-workspace learning-pane" id="learning-panel-researchers" role="tabpanel" aria-labelledby="learning-tab-researchers"><div className="researcher-rail" aria-label="Researchers">{researchers.map((researcher) => <button type="button" className={activeResearcher?.name === researcher.name ? 'is-active' : ''} onClick={() => setSelectedResearcher(researcher.name)} key={researcher.name}><span>{researcher.name}</span><small>{researcher.resources.length} sources</small></button>)}</div>{activeResearcher ? <article className="researcher-profile"><p className="mini-label">Researcher view</p><h3>{activeResearcher.name}</h3><p>{activeResearcher.resources.length} indexed resources across courses, talks, and interviews. Use this as a source trail, not a biography.</p><button type="button" onClick={() => onExplore(activeResearcher.name)}>Show all {activeResearcher.name} resources <ArrowIcon /></button><div>{activeResearcher.resources.slice(0, 4).map((resource) => <button type="button" className="researcher-resource" onClick={() => onOpen(resource)} key={resource.id}><span>{resource.section}</span><strong>{resource.title}</strong><small>{formatDuration(resource.durationMinutes)}</small></button>)}</div></article> : null}</div> : null}

        {activePane === 'notes' ? <div className="study-finder learning-pane" id="learning-panel-notes" role="tabpanel" aria-labelledby="learning-tab-notes"><div><p className="mini-label">Search your study record</p><h3>Find timestamps, imported transcript text, and notes.</h3><p>Transcript search is local: paste a transcript in a resource detail panel, then it becomes searchable on this device.</p></div><label className="study-search"><SearchIcon /><span className="sr-only">Search your notes and transcripts</span><input value={studyQuery} onChange={(event) => setStudyQuery(event.target.value)} placeholder="Try ‘representation’, ‘12:34’, or a phrase from a note" /></label><div className="study-results">{studyQuery ? (studyMatches.length ? studyMatches.map(({ resource, noteMatches, transcriptExcerpt, metadataMatch }) => <button type="button" key={resource.id} onClick={() => onOpen(resource)}><strong>{resource.title}</strong><span>{noteMatches.map((note) => `${note.timestamp || 'note'} · ${note.text}`).join(' ') || transcriptExcerpt || (metadataMatch ? 'Matched in indexed title, speaker, topic, or editorial notes.' : '')}</span></button>) : <p className="study-result-message">No local study records matched yet. Try a shorter phrase, a speaker name, or an exact timestamp.</p>) : noteCount || transcriptCount ? <p className="study-result-message">Ready to search {noteCount ? `${noteCount} note${noteCount === 1 ? '' : 's'}` : ''}{noteCount && transcriptCount ? ' and ' : ''}{transcriptCount ? `${transcriptCount} transcript${transcriptCount === 1 ? '' : 's'}` : ''} stored in this browser.</p> : <div className="study-empty"><BookmarkIcon /><div><strong>Your study record starts in a resource.</strong><p>Save a source, then add timestamped notes or a transcript whenever you are ready.</p><button type="button" className="button button--outline" onClick={onBrowse}>Explore library <ArrowIcon /></button></div></div>}</div></div> : null}
      </div>
    </section>
  )
}

function NextStep({ next, workspace, actions, onOpen }) {
  if (!next) return null
  const isSaved = workspace.saved.includes(next.id)
  return <section className="next-step"><p className="mini-label">Continue with</p><h3>{next.title}</h3><p className="next-step__meta">{next.speaker} · {formatDuration(next.durationMinutes)}</p><p>{workspace.progress[next.id] === 'in-progress' ? 'Pick up the resource already in motion.' : `A high-signal step that fits your ${workspace.goal.minutes}-minute study session.`}</p><div className="next-step__actions"><button type="button" className="button button--primary" onClick={() => onOpen(next)}>Open resource <ArrowIcon /></button><button type="button" className={isSaved ? 'next-step__save is-active' : 'next-step__save'} aria-label={`${isSaved ? 'Remove' : 'Save'} ${next.title}`} aria-pressed={isSaved} onClick={() => actions.toggleSaved(next.id)}><BookmarkIcon /><span>{isSaved ? 'Saved' : 'Save'}</span></button></div></section>
}

function Collection({ title, resources, empty, action, icon, onOpen, onRemove, onBrowse }) {
  return <section className="workspace-collection"><div className="collection-heading"><div><p className="mini-label">Personal collection</p><h3>{title}</h3></div><span className="collection-count"><b>{resources.length}</b> {resources.length === 1 ? 'source' : 'sources'}</span></div>{resources.length ? <div className="collection-list">{resources.map((resource, index) => <div className="collection-row" key={resource.id}><span className="collection-index">{String(index + 1).padStart(2, '0')}</span><button type="button" className="collection-resource" onClick={() => onOpen(resource)}><strong>{resource.title}</strong><small>{resource.speaker} · {formatDuration(resource.durationMinutes)}</small></button><div className="collection-actions"><button type="button" onClick={() => onOpen(resource)}>Open <ArrowIcon /></button><button type="button" onClick={() => onRemove(resource.id)}>Remove</button></div></div>)}</div> : <div className="collection-empty">{icon}<div><strong>{empty}</strong><p>{action} from any resource detail, or browse the curated index to find your next source.</p><button type="button" className="button button--outline" onClick={onBrowse}>Explore library <ArrowIcon /></button></div></div>}</section>
}
