import { useState } from 'react'
import { PlayIcon } from '../icons'
import { formatDuration, formatViews, getThumbnail } from '../resource-utils'

function uniqueValues(resources, field) {
  return [...new Set(resources.map((resource) => resource[field]).filter(Boolean))]
}

export default function CourseSeriesCard({ series, index, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false)
  const representative = series.resources.find((resource) => getThumbnail(resource)) ?? series.resources[0]
  const thumbnail = getThumbnail(representative)
  const totalDuration = series.resources.reduce((total, resource) => total + resource.durationMinutes, 0)
  const totalViews = series.resources.reduce((total, resource) => total + resource.viewCount, 0)
  const channels = uniqueValues(series.resources, 'channel')
  const platforms = uniqueValues(series.resources, 'platform')
  const focusAreas = uniqueValues(series.resources, 'focusArea').map((area) => area === 'Other' ? 'Other' : area)
  const sourceLabel = channels.length === 1 ? channels[0] : `${channels.length} publishers`
  const videoLabel = `${series.resources.length} ${series.resources.length === 1 ? 'video' : 'videos'}`

  return (
    <article className="resource-card series-card">
      <button
        type="button"
        className={`resource-thumb resource-thumb--series ${!thumbnail || imageFailed ? 'resource-thumb--editorial' : ''}`}
        onClick={() => onOpen(series)}
        aria-label={`Browse course series ${series.title}`}
      >
        {thumbnail && !imageFailed ? (
          <img src={thumbnail} alt={`${series.title} course series thumbnail`} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <span className="editorial-cover editorial-cover--series" aria-hidden="true">
            <b>{String(index + 1).padStart(2, '0')}</b>
            <span>Course series</span>
            <i />
          </span>
        )}
        <span className="resource-play" aria-hidden="true"><PlayIcon /></span>
        <span className="series-count">{videoLabel}</span>
        <span className="resource-duration">{formatDuration(totalDuration)}</span>
      </button>

      <div className="resource-meta-top">
        <span>Course series</span>
        <span>{platforms.join(' + ')}</span>
      </div>
      <h3>
        <button type="button" onClick={() => onOpen(series)}>{series.title}</button>
      </h3>
      <p className="resource-byline">{sourceLabel} <span>·</span> {videoLabel}</p>
      <div className="resource-footer">
        <span>{focusAreas.join(' + ')}</span>
        <span>{formatViews(totalViews)} views</span>
        <button type="button" className="series-browse" onClick={() => onOpen(series)} aria-label={`Browse ${series.title}`}>Browse</button>
      </div>
    </article>
  )
}
