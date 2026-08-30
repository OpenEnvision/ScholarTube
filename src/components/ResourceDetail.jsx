import { useEffect, useMemo, useRef, useState } from 'react'
import { CloseIcon, ExternalIcon, SearchIcon } from '../icons'
import { companionFor, nextRecommendations } from '../learning-utils'
import { formatDuration, formatViews, getDisplayTopic, getThumbnail } from '../resource-utils'
import { formatDate, getResourceDetail, getResourceTopics, isPodcastResource, showNameFor } from '../resource-detail-utils'

const progressOptions = [['not-started', 'Not started'], ['in-progress', 'In progress'], ['completed', 'Completed']]

export default function ResourceDetail({ resource, resources, workspace, actions, onClose, onOpenResource }) {
  const closeRef = useRef(null)
  const [noteText, setNoteText] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [transcriptText, setTranscriptText] = useState(() => workspace.transcripts[resource.id] || '')
  const detail = getResourceDetail(resource)
  const thumbnail = getThumbnail(resource)
  const topic = getDisplayTopic(resource)
  const sourceTier = resource.sourceTier?.split('|')[0]?.trim()
  const isPodcast = isPodcastResource(resource)
  const formatLine = isPodcast
    ? `Podcast · ${showNameFor(resource)} · ${formatDuration(resource.durationMinutes)}`
    : `${resource.section} · ${formatDuration(resource.durationMinutes)}`
  const detailTopics = getResourceTopics(resource)
  const companion = useMemo(() => companionFor(resource, resources), [resource, resources])
  const next = useMemo(() => nextRecommendations(resource, resources, workspace), [resource, resources, workspace])
  const notes = workspace.notes[resource.id] || []
  const progress = workspace.progress[resource.id] || 'not-started'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKeyDown) }
  }, [onClose])

  function saveNote() {
    if (!noteText.trim()) return
    actions.saveNote(resource.id, { timestamp: timestamp.trim(), text: noteText.trim() })
    setNoteText('')
    setTimestamp('')
  }

  return (
    <div className="resource-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="resource-detail resource-detail--workspace" role="dialog" aria-modal="true" aria-labelledby="resource-detail-title">
        <button className="resource-detail__close" type="button" onClick={onClose} ref={closeRef} aria-label="Close resource details"><CloseIcon /></button>
        <div className="resource-detail__media">
          {thumbnail ? <img src={thumbnail} alt={`${resource.title} video thumbnail`} /> : <div className="resource-detail__placeholder">{topic}</div>}
        </div>
        <div className="resource-detail__body">
          <div className="resource-detail__eyebrow"><span>{resource.id}</span><span>{resource.recommendation}</span>{sourceTier ? <span>{sourceTier}</span> : null}</div>
          <h2 id="resource-detail-title">{resource.title}</h2>
          <p className="resource-detail__byline">{resource.speaker !== 'To be added' ? resource.speaker : resource.channel}{resource.speaker !== 'To be added' && resource.speaker !== resource.channel ? ` / ${resource.channel}` : ''}</p>
          {detailTopics.length ? <div className="resource-detail__topics" aria-label="Topics">{detailTopics.map((entry) => <span key={entry}>{entry}</span>)}</div> : null}
          <div className="resource-detail__actions resource-detail__actions--main"><a className="button button--primary" href={resource.url} target="_blank" rel="noreferrer">Watch at source <ExternalIcon /></a><button className={workspace.saved.includes(resource.id) ? 'button button--selected' : 'button button--outline'} type="button" onClick={() => actions.toggleSaved(resource.id)}>{workspace.saved.includes(resource.id) ? 'Saved' : 'Save'}</button><button className={workspace.queue.includes(resource.id) ? 'button button--selected' : 'button button--outline'} type="button" onClick={() => actions.toggleQueue(resource.id)}>{workspace.queue.includes(resource.id) ? 'Queued' : 'Add to queue'}</button></div>

          <div className="resource-detail__summary"><article><p className="resource-detail__label">Why it is worth watching</p><p>{detail.whyWatch}</p></article><article><p className="resource-detail__label">Who it is for</p><p>{detail.audience}</p></article></div>
          <div className="progress-picker"><p className="resource-detail__label">Your progress</p><div>{progressOptions.map(([value, label]) => <button type="button" className={progress === value ? 'is-active' : ''} onClick={() => actions.setProgress(resource.id, value)} key={value}>{label}</button>)}</div></div>

          <dl className="resource-detail__facts"><div><dt>Format</dt><dd>{formatLine}</dd></div><div><dt>Topic</dt><dd>{topic}</dd></div><div><dt>Spoken language</dt><dd>{resource.language}</dd></div><div><dt>Published</dt><dd>{formatDate(detail.publishedAt)}</dd></div><div><dt>Last verified</dt><dd>{formatDate(detail.lastVerifiedAt)}</dd></div><div><dt>Source and subtitles</dt><dd>{sourceTier || 'Unrated'} · {resource.subtitlesVerified ? 'subtitle track recorded' : 'no subtitle track recorded'}</dd></div><div><dt>Platform</dt><dd>{resource.platform}</dd></div><div><dt>Views at verification</dt><dd>{formatViews(resource.viewCount)}</dd></div></dl>

          <section className="personal-notes"><div className="notes-heading"><div><p className="resource-detail__label">Your notes</p><p>Add optional timestamps such as 12:34; they become searchable in My learning.</p></div><SearchIcon /></div><div className="note-editor"><input value={timestamp} onChange={(event) => setTimestamp(event.target.value)} placeholder="Timestamp" aria-label="Timestamp" /><textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Write a note, question, or research lead…" /><button className="button button--outline" type="button" onClick={saveNote}>Save note</button></div>{notes.length ? <ul className="saved-notes">{notes.map((note) => <li key={note.id}><b>{note.timestamp || 'Note'}</b><span>{note.text}</span><button type="button" onClick={() => actions.removeNote(resource.id, note.id)} aria-label="Delete note">×</button></li>)}</ul> : null}<details className="transcript-import"><summary>Import a personal transcript for local search</summary><p>Paste text only if you have the right to save it. ScholarTube never uploads it.</p><textarea value={transcriptText} onChange={(event) => setTranscriptText(event.target.value)} placeholder="Paste transcript text here…" /><button type="button" className="button button--outline" onClick={() => actions.setTranscript(resource.id, transcriptText)}>Save local transcript</button></details></section>
        </div>
        <aside className="resource-detail__aside">
          <section><p className="mini-label">Continue with</p><h3>Next best steps</h3>{next.map((candidate) => <button type="button" className="aside-resource" onClick={() => onOpenResource(candidate)} key={candidate.id}><span>{candidate.section} · {formatDuration(candidate.durationMinutes)}</span><strong>{candidate.title}</strong><small>{candidate.speaker}</small></button>)}</section>
          {companion ? <section className="companion-card"><p className="mini-label">Chinese / English companion</p><h3>Study the same theme in another language</h3><button type="button" onClick={() => onOpenResource(companion)}><span>{companion.language}</span><strong>{companion.title}</strong><small>{companion.speaker}</small></button></section> : null}
          <button className="button button--text" type="button" onClick={onClose}>Back to results</button>
        </aside>
      </section>
    </div>
  )
}
