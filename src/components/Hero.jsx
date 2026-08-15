import { ArrowIcon } from '../icons'

export default function Hero({ children }) {
  return (
    <section className="hero" id="top">
      <div className={`hero-grid shell${children ? '' : ' hero-grid--compact'}`}>
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
            <span><b>860</b> verified resources</span>
            <span><b>149</b> interviews</span>
            <span><b>399</b> courses</span>
            <span><b>312</b> talks</span>
          </p>
        </div>

        {children}
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
