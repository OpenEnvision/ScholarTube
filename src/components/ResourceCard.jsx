import { useState } from 'react'
import { ExternalIcon, PlayIcon } from '../icons'
import { formatDuration, formatViews, getThumbnail } from '../resource-utils'

export default function ResourceCard({ resource, index }) {
  const [imageFailed, setImageFailed] = useState(false)
  const thumbnail = getThumbnail(resource)

  return (
    <article className="resource-card">
      <a
        className={`resource-thumb ${!thumbnail || imageFailed ? 'resource-thumb--editorial' : ''}`}
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Watch ${resource.title} on ${resource.platform}`}
      >
        {thumbnail && !imageFailed ? (
          <img src={thumbnail} alt={`${resource.title} video thumbnail`} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <span className="editorial-cover" aria-hidden="true">
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>{resource.focusArea === 'Other' ? resource.domain : resource.focusArea}</span>
            <i />
          </span>
        )}
        <span className="resource-play" aria-hidden="true"><PlayIcon /></span>
        <span className="resource-duration">{formatDuration(resource.durationMinutes)}</span>
      </a>

      <div className="resource-meta-top">
        <span>{resource.section}</span>
        <span>{resource.platform}</span>
      </div>
      <h3>
        <a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a>
      </h3>
      <p className="resource-byline">
        {resource.speaker !== 'To be added' ? resource.speaker : resource.channel}
        <span> / </span>
        {resource.channel}
      </p>
      <div className="resource-footer">
        <span>{resource.focusArea === 'Other' ? resource.domain : resource.focusArea}</span>
        <span>{formatViews(resource.viewCount)} views</span>
        <a href={resource.url} target="_blank" rel="noreferrer" aria-label="Open original video"><ExternalIcon /></a>
      </div>
    </article>
  )
}
