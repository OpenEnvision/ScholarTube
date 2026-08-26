import { useEffect, useRef } from 'react'
import { CloseIcon, ExternalIcon } from '../icons'
import { formatDuration, getThumbnail } from '../resource-utils'
import { buildSeriesIntro, isPodcastResource } from '../resource-detail-utils'

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
  const sections = uniqueValues(series.resources, 'section')
  const isPodcast = series.resources.some(isPodcastResource)
  const videoLabel = isPodcast
    ? `${series.resources.length} ${series.resources.length === 1 ? 'episode' : 'episodes'}`
    : `${series.resources.length} ${series.resources.length === 1 ? 'video' : 'videos'}`
  const isCourse = sections.length === 1 && sections[0] === 'Course'
  const isInterview = !isPodcast && sections.length === 1 && sections[0] === 'Interview'
  const seriesLabel = isPodcast ? 'Podcast series' : sections.length === 1 ? `${sections[0]} series` : 'Program series'
  const seriesIntro = buildSeriesIntro(series)

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

          <div className="series-intro">
            <p className="resource-detail__label">{isPodcast ? 'About this show' : 'About this series'}</p>
            <p>{seriesIntro}</p>
          </div>

          <div className="resource-detail__summary">
            <article>
              <p className="resource-detail__label">{isCourse ? 'One course, one place' : isPodcast ? 'One show, one place' : 'One program, one place'}</p>
              <p>{isCourse
                ? 'The full lecture sequence is indexed as a single entry, in teaching order, so the course reads as a course rather than as scattered uploads. Each lecture keeps its canonical video link and verified metadata on the original host.'
                : isPodcast
                  ? 'Selected episodes of the show are indexed as a single entry so its conversations can be read as a body of work. Each episode keeps its canonical upload — the grouping is an editorial selection, not a feed of everything the show publishes.'
                  : isInterview
                    ? 'Conversations from the same interview program are indexed as a single entry, ordered by publication, so one interviewer’s line of questioning can be followed across guests. Each episode keeps its canonical video link and verified metadata.'
                    : 'Recordings from the same program are indexed as a single entry, in publication order, so the venue’s or channel’s output can be compared side by side. Each video keeps its canonical link and verified metadata on the original host.'}</p>
            </article>
            <article>
              <p className="resource-detail__label">How to use it</p>
              <p>{isCourse
                ? 'Follow the numbered order to build the subject from first principles, or jump to the lecture that covers the problem in front of you — every entry opens at the source.'
                : isPodcast
                  ? 'Pick the episode whose guest matches your research question; long conversations reward timestamped notes over background listening.'
                  : isInterview
                    ? 'Read the episode list as a map of the program: browse in publication order, or open the conversation whose guest and topic match your question.'
                    : 'Browse the ordered list for the program’s range, or open the session closest to your question — every entry opens at the source.'}</p>
            </article>
          </div>

          <dl className="resource-detail__facts">
            <div><dt>{isPodcast || isInterview ? 'Episodes' : isCourse ? 'Lectures' : 'Videos'}</dt><dd>{series.resources.length}</dd></div>
            <div><dt>Total runtime</dt><dd>{formatDuration(totalDuration)}</dd></div>
            <div><dt>Platform</dt><dd>{platforms.join(' + ')}</dd></div>
            <div><dt>Language</dt><dd>{languages.join(' + ')}</dd></div>
            <div><dt>Directions</dt><dd>{directions.join(' + ')}</dd></div>
          </dl>

          <div className="series-detail__episodes">
            <p className="resource-detail__label">{isCourse ? 'Lectures in this series' : isPodcast ? 'Episodes in this show' : isInterview ? 'Episodes in this series' : 'Videos in this series'}</p>
            <ol>
              {series.resources.map((resource, index) => (
                <li key={resource.id}>
                  <span className="series-detail__number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{resource.title}</strong>
                    <small>{resource.speaker === 'To be added' ? resource.channel : resource.speaker} · {formatDuration(resource.durationMinutes)}</small>
                  </div>
                  <a href={resource.url} target="_blank" rel="noreferrer" aria-label={`Watch ${resource.title} at source`}>
                    Watch at source <ExternalIcon />
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
