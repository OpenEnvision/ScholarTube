import { useState } from 'react'
import Brand from './Brand'
import { MenuIcon, SearchIcon } from '../icons'

const formatLinks = [
  ['Interviews', 'Interview'],
  ['Podcasts', 'Podcast'],
  ['Courses', 'Course'],
  ['Talks', 'Talk'],
]

export default function Header({ query, setQuery, onFormatSelect }) {
  const [open, setOpen] = useState(false)

  function goToLibrary() {
    setOpen(false)
    document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
  }

  function goToScholarTubers() {
    setOpen(false)
    requestAnimationFrame(() => {
      document.querySelector('#scholartubers')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <a className="brand-link" href="#top" aria-label="ScholarTube home">
          <Brand />
        </a>

        <nav className={`main-nav ${open ? 'main-nav--open' : ''}`} aria-label="Primary navigation">
          <a href="#library" onClick={() => setOpen(false)}>Discover</a>
          <a href="#learning" onClick={() => setOpen(false)}>My learning</a>
          {formatLinks.map(([label, value]) => (
            <a
              href="#library"
              key={value}
              onClick={() => {
                onFormatSelect(value)
                setOpen(false)
              }}
            >
              {label}
            </a>
          ))}
          <a href="#scholartubers" onClick={goToScholarTubers}>ScholarTubers</a>
          <a href="#curation" onClick={() => setOpen(false)}>Curation</a>
          <div className="mobile-nav-tools">
            <label className="mobile-nav-search">
              <SearchIcon />
              <span className="sr-only">Search the index</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') goToLibrary()
                }}
                placeholder="Search talks, speakers, topics"
              />
            </label>
            <a className="mobile-nav-submit" href="#contribute" onClick={() => setOpen(false)}>Submit a resource</a>
          </div>
        </nav>

        <div className="header-tools">
          <label className="header-search">
            <SearchIcon />
            <span className="sr-only">Search the index</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={goToLibrary}
              placeholder="Search the index"
            />
          </label>
          <a className="header-submit" href="#contribute">Submit a resource</a>
          <button
            className="menu-button"
            type="button"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>
    </header>
  )
}
