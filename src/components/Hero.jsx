import { ArrowIcon, ExternalIcon, PlayIcon } from '../icons'
import { formatDuration, getThumbnail } from '../resource-utils'

export default function Hero({ featured }) {
  return (
    <section className="hero" id="top">
      <div className="hero-grid shell">
        <div className="hero-copy">
          <h1>Watch the ideas shaping intelligent systems.</h1>
          <p className="hero-description">
            A curated video index for researchers—source-linked interviews,
            complete courses, and talks worth returning to.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#library">
              Explore the library <ArrowIcon />
            </a>
            <a className="button button--text" href="#curation">How we curate</a>
          </div>
          <p className="hero-facts">
            <span><b>558</b> verified resources</span>
            <span><b>147</b> interviews</span>
            <span><b>201</b> courses</span>
            <span><b>210</b> talks</span>
          </p>
        </div>

        <article className="featured-media">
          <div className="featured-topline">
            <span>Featured now</span>
            <span>ST / 008</span>
          </div>
          <div className="featured-frame">
            <img src={getThumbnail(featured)} alt={`${featured.title} video thumbnail`} />
            <a
              className="featured-hit"
              href={featured.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Watch ${featured.title} at source`}
            />
            <span className="featured-play" aria-hidden="true"><PlayIcon /></span>
            <span className="featured-shade" aria-hidden="true" />
            <div className="featured-copy">
              <div>
                <p>{featured.section} · {formatDuration(featured.durationMinutes)} · {featured.channel}</p>
                <h2>{featured.title}</h2>
              </div>
              <a href={featured.url} target="_blank" rel="noreferrer" aria-label={`Watch ${featured.title} at source`}>
                <span>Watch at source</span>
                <ExternalIcon />
              </a>
            </div>
          </div>
        </article>
      </div>

      <div className="format-rail" aria-hidden="true">
        <div className="shell">
          <span>INTERVIEWS</span><i />
          <span>COURSES</span><i />
          <span>TALKS</span><i />
          <span>CANONICAL SOURCES</span>
        </div>
      </div>
    </section>
  )
}
