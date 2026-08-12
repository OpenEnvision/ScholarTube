import { useState } from 'react'
import Brand from './Brand'
import { MenuIcon, SearchIcon } from '../icons'

const formatLinks = [
  ['Interviews', 'Interview'],
  ['Courses', 'Course'],
  ['Talks', 'Talk'],
]

export default function Header({ query, setQuery, onFormatSelect }) {
  const [open, setOpen] = useState(false)

  function goToLibrary() {
    setOpen(false)
    document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <a className="brand-link" href="#top" aria-label="ScholarTube home">
          <Brand />
        </a>

        <nav className={`main-nav ${open ? 'main-nav--open' : ''}`} aria-label="Primary navigation">
          <a href="#library" onClick={() => setOpen(false)}>Discover</a>
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
          <a href="#curation" onClick={() => setOpen(false)}>About</a>
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
