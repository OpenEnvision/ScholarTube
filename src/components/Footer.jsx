import Brand from './Brand'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main shell">
        <div className="footer-branding">
          <a href="#top" aria-label="ScholarTube home"><Brand inverse /></a>
          <p>A curated video knowledge index maintained by OpenEnvision.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#library">Library</a>
          <a href="#scholartubers">ScholarTubers</a>
          <a href="#curation">Curation</a>
          <a href="#top">About</a>
          <a href="https://github.com/OpenEnvision" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
      <div className="footer-bottom shell">
        <span>© 2026 OpenEnvision / ScholarTube</span>
        <span>Open access. Canonical sources preserved.</span>
      </div>
    </footer>
  )
}
