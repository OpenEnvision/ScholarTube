import Brand from './Brand'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main shell">
        <div className="footer-branding">
          <a href="#top" aria-label="ScholarTube home"><Brand inverse /></a>
          <p>
            A curated, source-linked index of research video — interviews, courses, talks, and
            podcasts, reviewed for technical value and kept on their canonical hosts. Maintained
            by OpenEnvision.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#library">Library</a>
          <a href="#learning">My learning</a>
          <a href="#podcast-shows">Podcasts</a>
          <a href="#scholartubers">ScholarTubers</a>
          <a href="#curation">Curation</a>
          <a href="#contribute">Contribute</a>
          <a href="https://github.com/OpenEnvision" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
      <div className="footer-bottom shell">
        <span>© 2026 OpenEnvision / ScholarTube</span>
        <span>Open access. Videos remain with their original hosts; inclusion is not endorsement.</span>
      </div>
    </footer>
  )
}
