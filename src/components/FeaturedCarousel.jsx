import { useEffect, useState } from 'react'
import { ArrowIcon, ExternalIcon } from '../icons'
import { formatDuration, getDisplayTopic, getThumbnail } from '../resource-utils'
import Brand from './Brand'

const PROMO_DURATION = 7000
const VIDEO_DURATION = 18000

function getEmbedUrl(resource) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    loop: '1',
    playlist: resource.videoId,
  })

  return `https://www.youtube-nocookie.com/embed/${resource.videoId}?${params}`
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6.5 5.5v9M13.5 5.5v9" />
    </svg>
  )
}

function PlayControlIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m7 5.5 7 4.5-7 4.5v-9Z" />
    </svg>
  )
}

export default function FeaturedCarousel({ resources, totalCount }) {
  const slideCount = resources.length + 1
  const [activeSlide, setActiveSlide] = useState(0)
  const [playingVideo, setPlayingVideo] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const currentVideo = resources[playingVideo]
  const isPromo = activeSlide === 0
  const slideDuration = isPromo ? PROMO_DURATION : VIDEO_DURATION

  function selectSlide(nextSlide) {
    const normalizedSlide = (nextSlide + slideCount) % slideCount
    if (normalizedSlide > 0) setPlayingVideo(normalizedSlide - 1)
    setActiveSlide(normalizedSlide)
  }

  useEffect(() => {
    if (isPaused) return undefined

    const timer = window.setTimeout(() => {
      const nextSlide = (activeSlide + 1) % slideCount
      if (nextSlide > 0) setPlayingVideo(nextSlide - 1)
      setActiveSlide(nextSlide)
    }, slideDuration)

    return () => window.clearTimeout(timer)
  }, [activeSlide, isPaused, slideCount, slideDuration])

  return (
    <article className="featured-media" aria-label="ScholarTube featured stream">
      <div className="featured-topline">
        <span className="featured-live"><i aria-hidden="true" /> Featured now</span>
        <div className="featured-toolbar">
          <span>{isPaused ? 'Rotation paused' : 'Auto-playing'} · {String(activeSlide + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}</span>
          <button type="button" onClick={() => selectSlide(activeSlide - 1)} aria-label="Show previous feature">
            <ArrowIcon />
          </button>
          <button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? 'Resume featured rotation' : 'Pause featured rotation'}>
            {isPaused ? <PlayControlIcon /> : <PauseIcon />}
          </button>
          <button type="button" onClick={() => selectSlide(activeSlide + 1)} aria-label="Show next feature">
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div className={`featured-frame${isPromo ? ' is-promo' : ''}`}>
        <img
          className="featured-video-poster"
          src={getThumbnail(currentVideo)}
          alt=""
          aria-hidden="true"
        />
        <iframe
          key={currentVideo.videoId}
          className="featured-player"
          src={getEmbedUrl(currentVideo)}
          title={`${currentVideo.title} — autoplaying muted preview`}
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="eager"
          tabIndex="-1"
        />
        <span className="featured-shade" aria-hidden="true" />

        <div className="featured-video-copy" aria-live="polite" aria-hidden={isPromo}>
          <div>
            <p>
              {currentVideo.speaker && currentVideo.speaker !== 'To be added' ? currentVideo.speaker : currentVideo.channel}
              {' · '}{currentVideo.section} · {getDisplayTopic(currentVideo)} · {formatDuration(currentVideo.durationMinutes)}
              {currentVideo.recommendation === 'Core' ? ' · Core selection' : ''}
            </p>
            <h2>{currentVideo.title}</h2>
          </div>
          <a href={currentVideo.url} target="_blank" rel="noreferrer" aria-label={`Watch ${currentVideo.title} on ${currentVideo.platform}`}>
            <span>Watch on {currentVideo.platform}</span>
            <ExternalIcon />
          </a>
        </div>

        <div className="featured-promo" aria-hidden={!isPromo}>
          <img src="./assets/scholartube-featured-cover-v2.png" alt="" aria-hidden="true" />
          <span className="featured-promo__shade" aria-hidden="true" />
          <div className="featured-promo__copy">
            <Brand inverse />
            <h2>Research knowledge,<br />in motion.</h2>
            <p>{totalCount} source-linked interviews, courses, talks, and podcasts — hand-reviewed, indexed by the research question they answer, and kept on their canonical hosts.</p>
            <a className="featured-promo__action" href="#library">
              Explore the index <ArrowIcon />
            </a>
          </div>
        </div>

        <div className="featured-status">
          <span>{isPromo ? 'ScholarTube' : 'Playing muted'}</span>
          <div className="featured-dots">
            {Array.from({ length: slideCount }, (_, index) => (
              <button
                key={index}
                type="button"
                className={activeSlide === index ? 'is-active' : ''}
                onClick={() => selectSlide(index)}
                aria-label={index === 0 ? 'Show ScholarTube cover' : `Play featured video: ${resources[index - 1].title}`}
                aria-current={activeSlide === index ? 'true' : undefined}
              />
            ))}
          </div>
        </div>

        <span
          key={`${activeSlide}-${isPaused}`}
          className={`featured-progress${isPaused ? ' is-paused' : ''}`}
          style={{ '--featured-duration': `${slideDuration}ms` }}
          aria-hidden="true"
        />
      </div>
    </article>
  )
}
