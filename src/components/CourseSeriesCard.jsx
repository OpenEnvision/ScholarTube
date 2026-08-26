import { useState } from 'react'
import { ExternalIcon, PlayIcon } from '../icons'
import { formatDuration, formatViews, getCoverTheme, getDisplayTopic, getThumbnail } from '../resource-utils'
import { isPodcastResource } from '../resource-detail-utils'

function uniqueValues(resources, field) {
  return [...new Set(resources.map((resource) => resource[field]).filter(Boolean))]
}

export default function CourseSeriesCard({ series, index, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false)
  const representative = series.resources.find((resource) => getThumbnail(resource)) ?? series.resources[0]
  const sourceResource = series.resources[0] ?? representative
  const thumbnail = getThumbnail(representative)
  const totalDuration = series.resources.reduce((total, resource) => total + resource.durationMinutes, 0)
  const totalViews = series.resources.reduce((total, resource) => total + resource.viewCount, 0)
  const channels = uniqueValues(series.resources, 'channel')
  const platforms = uniqueValues(series.resources, 'platform')
  const languages = uniqueValues(series.resources, 'language')
  const sections = uniqueValues(series.resources, 'section')
  const focusAreas = [...new Set(series.resources.map(getDisplayTopic))]
  const isPodcast = series.resources.some(isPodcastResource)
  const isCourse = !isPodcast && sections.length === 1 && sections[0] === 'Course'
  const sourceLabel = channels.length === 1 ? channels[0] : `${channels.length} publishers`
  const episodeWord = isPodcast ? 'episode' : isCourse ? 'lecture' : 'video'
  const videoLabel = `${series.resources.length} ${series.resources.length === 1 ? episodeWord : `${episodeWord}s`}`
  const seriesLabel = isPodcast ? 'Podcast series' : sections.length === 1 ? `${sections[0]} series` : 'Program series'

  return (
    <article className="resource-card series-card">
      <button
        type="button"
        className={`resource-thumb resource-thumb--series ${!thumbnail || imageFailed ? 'resource-thumb--editorial' : ''}`}
        data-theme={getCoverTheme(representative)}
        onClick={() => onOpen(series)}
        aria-label={`Browse ${seriesLabel.toLocaleLowerCase()} ${series.title}`}
      >
        {thumbnail && !imageFailed ? (
          <img src={thumbnail} alt={`${series.title} ${seriesLabel.toLocaleLowerCase()} thumbnail`} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <span className="editorial-cover editorial-cover--series" aria-hidden="true">
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>{seriesLabel}</span>
            <i />
          </span>
        )}
        <span className="cover-accent" aria-hidden="true" />
        <span className="cover-source">{platforms.join(' + ')}</span>
        <span className="resource-play" aria-hidden="true"><PlayIcon /></span>
        <span className="series-count">{videoLabel}</span>
        <span className="resource-duration">{formatDuration(totalDuration)}</span>
      </button>

      <div className="resource-meta-top">
        <span>{seriesLabel}</span>
        <span>{languages.join(' + ')}</span>
      </div>
      <h3>
        <button type="button" onClick={() => onOpen(series)}>{series.title}</button>
      </h3>
      <p className="resource-byline">{sourceLabel} <span>·</span> {videoLabel}</p>
      <div className="resource-footer">
        <span>{focusAreas.join(' + ')}</span>
        <span>{formatViews(totalViews)} views</span>
        <a
          className="resource-source-link"
          href={sourceResource.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Watch the first ${episodeWord} in ${series.title} on its canonical host`}
        >
          Watch at source <ExternalIcon />
        </a>
      </div>
    </article>
  )
}
