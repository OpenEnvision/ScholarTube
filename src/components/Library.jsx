import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { CheckIcon, ChevronIcon, ClockIcon, DownloadIcon, GlobeIcon, PlatformIcon, SearchIcon, SortIcon } from '../icons'
import { exportCsv, exportMarkdown } from '../export-utils'
import { matchesSearch, sortResources } from '../resource-utils'
import ResourceCard from './ResourceCard'
import ResourceDetail from './ResourceDetail'

const formats = ['All', 'Interview', 'Course', 'Talk']
const focusAreas = ['All', 'World Model', 'Agent', 'Vision', 'Robotics', 'Other']

const formatLabels = {
  All: 'All',
  Interview: 'Interviews',
  Course: 'Courses',
  Talk: 'Talks',
}

const focusLabels = {
  All: 'All directions',
  'World Model': 'World Models',
  Agent: 'Agents',
  Vision: 'Vision',
  Robotics: 'Robotics',
  Other: 'Other',
}

const languageOptions = [
  { value: 'All', label: 'All languages' },
  { value: 'English', label: 'English' },
  { value: 'Chinese', label: 'Chinese' },
]

const sortOptions = [
  { value: 'curated', label: 'Curated first' },
  { value: 'popular', label: 'Most viewed' },
  { value: 'shortest', label: 'Shortest first' },
  { value: 'longest', label: 'Longest first' },
]

const platformOptions = [
  { value: 'All', label: 'All platforms' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Bilibili', label: 'Bilibili' },
]

const durationOptions = [
  { value: 'All', label: 'Any duration' },
  { value: 'short', label: 'Under 30 min' },
  { value: 'medium', label: '30–90 min' },
  { value: 'long', label: 'Over 90 min' },
]

function initialOption(name, options, fallback = 'All') {
  const value = new URLSearchParams(window.location.search).get(name)
  return options.some((option) => option.value === value) ? value : fallback
}

function matchesDuration(resource, duration) {
  if (duration === 'short') return resource.durationMinutes < 30
  if (duration === 'medium') return resource.durationMinutes >= 30 && resource.durationMinutes <= 90
  if (duration === 'long') return resource.durationMinutes > 90
  return true
}

function FilterMenu({ label, icon: Icon, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const listboxId = useId()
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selectedOption = options[selectedIndex]

  useEffect(() => {
    if (!open) return undefined

    function handleOutsidePress(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handleOutsidePress)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePress)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function focusOption(index) {
    optionRefs.current[index]?.focus()
  }

  function openAndFocus(index = selectedIndex) {
    setOpen(true)
    window.requestAnimationFrame(() => focusOption(index))
  }

  function selectOption(nextValue) {
    onChange(nextValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const index = event.key === 'ArrowUp' ? options.length - 1 : selectedIndex
      openAndFocus(index)
    }
  }

  function handleOptionKeyDown(event, index) {
    let nextIndex = index

    if (event.key === 'ArrowDown') nextIndex = (index + 1) % options.length
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + options.length) % options.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = options.length - 1
    else if (event.key === 'Tab') {
      setOpen(false)
      return
    } else return

    event.preventDefault()
    focusOption(nextIndex)
  }

  return (
    <div className={`filter-dropdown${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        className="filter-dropdown__trigger"
        type="button"
        ref={triggerRef}
        aria-label={`${label}: ${selectedOption.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openAndFocus())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="filter-dropdown__icon" aria-hidden="true"><Icon /></span>
        <span className="filter-dropdown__value">{selectedOption.label}</span>
        <span className="filter-dropdown__chevron" aria-hidden="true"><ChevronIcon /></span>
      </button>

      <div
        className="filter-dropdown__menu"
        id={listboxId}
        role="listbox"
        aria-label={label}
        aria-hidden={!open}
      >
        {options.map((option, index) => (
          <button
            className="filter-dropdown__option"
            type="button"
            role="option"
            aria-selected={option.value === value}
            tabIndex={open ? 0 : -1}
            key={option.value}
            ref={(element) => { optionRefs.current[index] = element }}
            onClick={() => selectOption(option.value)}
            onKeyDown={(event) => handleOptionKeyDown(event, index)}
          >
            <span>{option.label}</span>
            <span className="filter-dropdown__check" aria-hidden="true"><CheckIcon /></span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Library({ resources, query, setQuery, format, setFormat, focus, setFocus }) {
  const [language, setLanguage] = useState(() => initialOption('language', languageOptions))
  const [platform, setPlatform] = useState(() => initialOption('platform', platformOptions))
  const [duration, setDuration] = useState(() => initialOption('duration', durationOptions))
  const [sort, setSort] = useState(() => initialOption('sort', sortOptions, 'curated'))
  const [visible, setVisible] = useState(10)
  const [selectedResource, setSelectedResource] = useState(null)

  const filtered = useMemo(() => {
    const matches = resources.filter((resource) => (
      (format === 'All' || resource.section === format) &&
      (focus === 'All' || resource.focusArea === focus) &&
      (language === 'All' || resource.language === language) &&
      (platform === 'All' || resource.platform === platform) &&
      matchesDuration(resource, duration) &&
      matchesSearch(resource, query)
    ))
    return sortResources(matches, sort)
  }, [resources, duration, format, focus, language, platform, query, sort])

  useEffect(() => setVisible(10), [duration, format, focus, language, platform, query, sort])

  useEffect(() => {
    const url = new URL(window.location.href)
    const values = { q: query, format, focus, language, platform, duration, sort }

    Object.entries(values).forEach(([key, value]) => {
      const isDefault = value === 'All' || (key === 'sort' && value === 'curated') || !value
      if (isDefault) url.searchParams.delete(key)
      else url.searchParams.set(key, value)
    })

    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [duration, format, focus, language, platform, query, sort])

  function resetFilters() {
    setQuery('')
    setFormat('All')
    setFocus('All')
    setLanguage('All')
    setPlatform('All')
    setDuration('All')
    setSort('curated')
  }

  return (
    <section className="library" id="library">
      <div className="shell">
        <div className="section-heading section-heading--row">
          <div>
            <p className="section-kicker">The index</p>
            <h2>Explore 546 resources</h2>
          </div>
          <p>Find the right depth, format, and research direction without losing the source.</p>
        </div>

        <div className="library-controls">
          <label className="library-search">
            <SearchIcon />
            <span className="sr-only">Search talks, speakers, and topics</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search talks, speakers, topics"
            />
          </label>

          <div className="format-tabs" aria-label="Resource format">
            {formats.map((item) => (
              <button
                type="button"
                key={item}
                className={format === item ? 'is-active' : ''}
                onClick={() => setFormat(item)}
              >
                {formatLabels[item]}
              </button>
            ))}
          </div>

          <div className="filter-row">
            <div className="direction-filters" aria-label="Research direction">
              {focusAreas.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={focus === item ? 'is-active' : ''}
                  onClick={() => setFocus(item)}
                >
                  {focusLabels[item]}
                </button>
              ))}
            </div>

            <div className="select-group">
              <FilterMenu
                label="Language"
                icon={GlobeIcon}
                options={languageOptions}
                value={language}
                onChange={setLanguage}
              />
              <FilterMenu
                label="Platform"
                icon={PlatformIcon}
                options={platformOptions}
                value={platform}
                onChange={setPlatform}
              />
              <FilterMenu
                label="Duration"
                icon={ClockIcon}
                options={durationOptions}
                value={duration}
                onChange={setDuration}
              />
              <FilterMenu
                label="Sort resources"
                icon={SortIcon}
                options={sortOptions}
                value={sort}
                onChange={setSort}
              />
            </div>
          </div>
        </div>

        <div className="results-bar" aria-live="polite">
          <span>{filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}</span>
          <div className="results-actions">
            {(query || format !== 'All' || focus !== 'All' || language !== 'All' || platform !== 'All' || duration !== 'All') && (
              <button type="button" onClick={resetFilters}>Clear filters</button>
            )}
            <button type="button" onClick={() => exportMarkdown(filtered)} disabled={!filtered.length} aria-label={`Export ${filtered.length} results as Markdown`}>
              <DownloadIcon /> Markdown
            </button>
            <button type="button" onClick={() => exportCsv(filtered)} disabled={!filtered.length} aria-label={`Export ${filtered.length} results as CSV`}>
              <DownloadIcon /> CSV
            </button>
          </div>
        </div>

        {filtered.length ? (
          <>
            <div className="resource-grid" key={`${language}-${platform}-${duration}-${sort}`}>
              {filtered.slice(0, visible).map((resource, index) => (
                <ResourceCard resource={resource} index={index} key={resource.id} onOpen={setSelectedResource} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="load-more">
                <button className="button button--outline" type="button" onClick={() => setVisible((value) => value + 10)}>
                  View more resources
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No resource matches this combination yet.</p>
            <button type="button" onClick={resetFilters}>Reset the index</button>
          </div>
        )}
      </div>
      {selectedResource && <ResourceDetail resource={selectedResource} onClose={() => setSelectedResource(null)} />}
    </section>
  )
}
