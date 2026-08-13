import { useEffect, useRef } from 'react'
import { CloseIcon, ExternalIcon } from '../icons'
import { formatDuration, getThumbnail } from '../resource-utils'

function uniqueValues(resources, field) {
  return [...new Set(resources.map((resource) => resource[field]).filter(Boolean))]
}

export default function CourseSeriesDetail({ series, onClose }) {
  const closeRef = useRef(null)
  const representative = series.resources.find((resource) => getThumbnail(resource)) ?? series.resources[0]
  const thumbnail = getThumbnail(representative)
  const totalDuration = series.resources.reduce((total, resource) => total + resource.durationMinutes, 0)
  const platforms = uniqueValues(series.resources, 'platform')
  const languages = uniqueValues(series.resources, 'language')
  const directions = uniqueValues(series.resources, 'focusArea')
  const channels = uniqueValues(series.resources, 'channel')
  const videoLabel = `${series.resources.length} ${series.resources.length === 1 ? 'video' : 'videos'}`
  const isCourse = representative.section === 'Course'
  const seriesLabel = `${representative.section} series`

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="resource-detail-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="resource-detail series-detail" role="dialog" aria-modal="true" aria-labelledby="series-detail-title">
        <button className="resource-detail__close" type="button" onClick={onClose} ref={closeRef} aria-label={`Close ${seriesLabel.toLocaleLowerCase()}`}>
          <CloseIcon />
        </button>

        <div className="resource-detail__media series-detail__media">
          {thumbnail ? <img src={thumbnail} alt={`${series.title} ${seriesLabel.toLocaleLowerCase()} thumbnail`} /> : <div className="resource-detail__placeholder">{seriesLabel}</div>}
          <div className="series-detail__media-label">
            <span>{videoLabel}</span>
            <strong>{formatDuration(totalDuration)}</strong>
          </div>
        </div>

        <div className="resource-detail__body">
          <div className="resource-detail__eyebrow">
            <span>{seriesLabel}</span>
            <span>{videoLabel}</span>
          </div>
          <h2 id="series-detail-title">{series.title}</h2>
          <p className="resource-detail__byline">{channels.join(' / ')}</p>

          <div className="resource-detail__summary">
            <article>
              <p className="resource-detail__label">{isCourse ? 'One course, one place' : 'One program, one place'}</p>
              <p>{isCourse
                ? 'Lectures from the same course are grouped here while each canonical video link and its metadata remain intact.'
                : 'Episodes from the same interview program are grouped here while each canonical video link and its metadata remain intact.'}</p>
            </article>
            <article>
              <p className="resource-detail__label">How to use it</p>
              <p>{isCourse
                ? 'Follow the listed sequence for structured study, or open the lecture that matches the topic you need.'
                : 'Browse the conversations in publication order, or open the episode with the guest and topic you need.'}</p>
            </article>
          </div>

          <dl className="resource-detail__facts">
            <div><dt>Videos</dt><dd>{series.resources.length}</dd></div>
            <div><dt>Total runtime</dt><dd>{formatDuration(totalDuration)}</dd></div>
            <div><dt>Platform</dt><dd>{platforms.join(' + ')}</dd></div>
            <div><dt>Language</dt><dd>{languages.join(' + ')}</dd></div>
            <div><dt>Directions</dt><dd>{directions.join(' + ')}</dd></div>
          </dl>

          <div className="series-detail__episodes">
            <p className="resource-detail__label">{isCourse ? 'Lectures in this series' : 'Episodes in this series'}</p>
            <ol>
              {series.resources.map((resource, index) => (
                <li key={resource.id}>
                  <span className="series-detail__number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{resource.title}</strong>
                    <small>{resource.speaker === 'To be added' ? resource.channel : resource.speaker} · {formatDuration(resource.durationMinutes)}</small>
                  </div>
                  <a href={resource.url} target="_blank" rel="noreferrer" aria-label={`Watch ${resource.title} at source`}>
                    Watch <ExternalIcon />
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className="resource-detail__actions">
            <button className="button button--text" type="button" onClick={onClose}>Back to results</button>
          </div>
        </div>
      </section>
    </div>
  )
}
