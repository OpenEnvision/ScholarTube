import { ArrowIcon } from '../icons'
import { isPodcastResource } from '../resource-detail-utils'

export default function Hero({ children, resources }) {
  const countBySection = (section) => resources.filter((resource) => resource.section === section).length
  const podcastCount = resources.filter(isPodcastResource).length

  return (
    <section className="hero" id="top">
      <div className={`hero-grid shell${children ? '' : ' hero-grid--compact'}`}>
        <div className="hero-copy">
          <h1>Watch the ideas shaping intelligent systems.</h1>
          <p className="hero-description">
            A hand-curated video index for AI researchers: source-linked interviews,
            long-form podcasts, complete course runs, and talks that stay useful long after the release cycle.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#library">
              Explore the library <ArrowIcon />
            </a>
            <a className="button button--text" href="#curation">How we curate</a>
          </div>
          <p className="hero-facts">
            <span><b>{resources.length}</b> verified resources</span>
            <span><b>{countBySection('Interview')}</b> interviews</span>
            <span><b>{podcastCount}</b> podcast episodes</span>
            <span><b>{countBySection('Course')}</b> courses</span>
            <span><b>{countBySection('Talk')}</b> talks</span>
          </p>
        </div>

        {children}
      </div>

      <div className="format-rail" aria-hidden="true">
        <div className="shell">
          <span>INTERVIEWS</span><i />
          <span>PODCASTS</span><i />
          <span>COURSES</span><i />
          <span>TALKS</span><i />
          <span>CANONICAL SOURCES</span>
        </div>
      </div>
    </section>
  )
}
