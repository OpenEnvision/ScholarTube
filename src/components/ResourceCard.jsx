import { useState } from 'react'
import { ExternalIcon, PlayIcon } from '../icons'
import { formatDuration, formatViews, getCoverTheme, getDisplayTopic, getThumbnail } from '../resource-utils'
import { isPodcastResource } from '../resource-detail-utils'

export default function ResourceCard({ resource, index, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false)
  const thumbnail = getThumbnail(resource)
  const displayTopic = getDisplayTopic(resource)
  const isPodcast = isPodcastResource(resource)

  return (
    <article className="resource-card">
      <button
        type="button"
        className={`resource-thumb ${!thumbnail || imageFailed ? 'resource-thumb--editorial' : ''}`}
        data-theme={getCoverTheme(resource)}
        onClick={() => onOpen(resource)}
        aria-label={`View details for ${resource.title}`}
      >
        {thumbnail && !imageFailed ? (
          <img src={thumbnail} alt={`${resource.title} video thumbnail`} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <span className="editorial-cover" aria-hidden="true">
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>{displayTopic}</span>
            <i />
          </span>
        )}
        <span className="cover-accent" aria-hidden="true" />
        <span className="cover-source">{resource.platform}</span>
        <span className="resource-play" aria-hidden="true"><PlayIcon /></span>
        <span className="resource-duration">{formatDuration(resource.durationMinutes)}</span>
      </button>

      <div className="resource-meta-top">
        <span title={resource.recommendation === 'Core' ? 'Core: a suggested starting point in the index' : undefined}>
          {isPodcast ? 'Podcast' : resource.section}
          {resource.recommendation === 'Core' ? ' · Core' : ''}
        </span>
        <span>{resource.language}</span>
      </div>
      <h3>
        <button type="button" onClick={() => onOpen(resource)}>{resource.title}</button>
      </h3>
      <p className="resource-byline">
        {resource.speaker !== 'To be added' ? resource.speaker : resource.channel}
        {resource.speaker !== 'To be added' && resource.speaker !== resource.channel && <><span> / </span>{resource.channel}</>}
      </p>
      <div className="resource-footer">
        <span>{displayTopic}</span>
        <span>{formatViews(resource.viewCount)} views</span>
        <a
          className="resource-source-link"
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Watch ${resource.title} at source`}
        >
          Watch at source <ExternalIcon />
        </a>
      </div>
    </article>
  )
}
