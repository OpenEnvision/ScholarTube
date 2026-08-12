import { useEffect, useRef } from 'react'
import { CloseIcon, ExternalIcon } from '../icons'
import { formatDuration, formatViews, getThumbnail } from '../resource-utils'
import { formatDate, getResourceDetail } from '../resource-detail-utils'

export default function ResourceDetail({ resource, onClose }) {
  const closeRef = useRef(null)
  const detail = getResourceDetail(resource)
  const thumbnail = getThumbnail(resource)
  const topic = resource.focusArea === 'Other' ? resource.domain : resource.focusArea
  const sourceTier = resource.sourceTier?.split('|')[0]?.trim()

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
      <section className="resource-detail" role="dialog" aria-modal="true" aria-labelledby="resource-detail-title">
        <button className="resource-detail__close" type="button" onClick={onClose} ref={closeRef} aria-label="Close resource details">
          <CloseIcon />
        </button>

        <div className="resource-detail__media">
          {thumbnail ? <img src={thumbnail} alt={`${resource.title} video thumbnail`} /> : <div className="resource-detail__placeholder">{topic}</div>}
        </div>

        <div className="resource-detail__body">
          <div className="resource-detail__eyebrow">
            <span>{resource.id}</span>
            <span>{resource.recommendation}</span>
            {sourceTier && <span>{sourceTier}</span>}
          </div>
          <h2 id="resource-detail-title">{resource.title}</h2>
          <p className="resource-detail__byline">
            {resource.speaker !== 'To be added' ? resource.speaker : resource.channel}
            {resource.speaker !== 'To be added' && resource.speaker !== resource.channel ? ` / ${resource.channel}` : ''}
          </p>

          <div className="resource-detail__summary">
            <article>
              <p className="resource-detail__label">Why it is worth watching</p>
              <p>{detail.whyWatch}</p>
            </article>
            <article>
              <p className="resource-detail__label">Who it is for</p>
              <p>{detail.audience}</p>
            </article>
          </div>

          <dl className="resource-detail__facts">
            <div><dt>Format</dt><dd>{resource.section} · {formatDuration(resource.durationMinutes)}</dd></div>
            <div><dt>Topic</dt><dd>{topic}</dd></div>
            <div><dt>Spoken language</dt><dd>{resource.language}</dd></div>
            <div><dt>Published</dt><dd>{formatDate(detail.publishedAt)}</dd></div>
            <div><dt>Last verified</dt><dd>{formatDate(detail.lastVerifiedAt)}</dd></div>
            <div><dt>Metadata status</dt><dd>{resource.metadataVerificationStatus || 'Not yet verified'}</dd></div>
            <div><dt>Platform</dt><dd>{resource.platform}</dd></div>
            <div><dt>Views at verification</dt><dd>{formatViews(resource.viewCount)}</dd></div>
          </dl>

          <div className="resource-detail__actions">
            <a className="button button--primary" href={resource.url} target="_blank" rel="noreferrer">
              Watch at source <ExternalIcon />
            </a>
            <button className="button button--text" type="button" onClick={onClose}>Back to results</button>
          </div>
          {detail.publishedAt === 'Not yet verified' && (
            <p className="resource-detail__notice">Missing metadata is shown as unverified rather than inferred.</p>
          )}
        </div>
      </section>
    </div>
  )
}
