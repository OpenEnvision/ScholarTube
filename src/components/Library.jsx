import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { CheckIcon, ChevronIcon, ClockIcon, DownloadIcon, GlobeIcon, GridIcon, ListIcon, PageArrowIcon, PlatformIcon, SearchIcon, SortIcon } from '../icons'
import { exportCsv, exportMarkdown } from '../export-utils'
import { broaderTopics, getBroaderTopic, getPodcastShow, getPodcastShows, groupResourceSeries, matchesFormat, matchesSearch, sortResources } from '../resource-utils'
import CourseSeriesCard from './CourseSeriesCard'
import CourseSeriesDetail from './CourseSeriesDetail'
import ResourceCard from './ResourceCard'
import ResourceDetail from './ResourceDetail'

const formats = ['All', 'Interview', 'Podcast', 'Course', 'Talk']
const focusAreas = ['All', 'World Model', 'Agent', 'Vision', 'Robotics', 'Other', 'How to Research']

const formatLabels = {
  All: 'All',
  Interview: 'Interviews',
  Podcast: 'Podcasts',
  Course: 'Courses',
  Talk: 'Talks',
}

const focusLabels = {
  All: 'All directions',
  'World Model': 'World Models',
  Agent: 'Agents',
  Vision: 'Vision',
  Robotics: 'Robotics',
  Other: 'Broader AI',
  'How to Research': 'How to Research',
}

// Category introductions. `copy` stands alone; `brief` composes with a focus
// intro when both a format and a direction are active.
const formatIntros = {
  Interview: {
    title: 'Interviews',
    copy: 'Sit-down conversations with researchers — the reasoning behind the work, career context, and how ideas actually formed. Podcast shows have a tab of their own.',
    brief: 'Researcher conversations outside the podcast shows.',
  },
  Podcast: {
    title: 'Podcasts',
    copy: 'Long-form researcher conversations from shows such as the Lex Fridman Podcast, The Robot Brains Podcast, and The TWIML AI Podcast. ScholarTube indexes and annotates the episodes; the original platforms remain the source of truth.',
    brief: 'Long-form podcast conversations; the original platforms remain the source of truth.',
  },
  Course: {
    title: 'Courses',
    copy: 'University courses and structured tutorials, grouped into series where lectures belong together. The place to build a topic from first principles.',
    brief: 'Structured courses and tutorials, grouped into series.',
  },
  Talk: {
    title: 'Talks',
    copy: 'Conference keynotes, research seminars, and invited talks — the format researchers use to present finished work and defend a position.',
    brief: 'Keynotes, seminars, and invited talks.',
  },
}

const focusIntros = {
  'World Model': {
    title: 'World Models',
    copy: 'Learned simulators and predictive models of environments — temporal dynamics, planning through imagination, and spatial reasoning.',
    brief: 'Scoped to world models: learned simulators, dynamics, and planning.',
  },
  Agent: {
    title: 'Agents',
    copy: 'Systems that act — tool use, memory, orchestration, multi-agent coordination, and the evaluations that keep them honest.',
    brief: 'Scoped to agents: tool use, memory, orchestration, and evaluation.',
  },
  Vision: {
    title: 'Vision',
    copy: 'Perception and generation across images and video — multimodal understanding, visual representation, and generative systems.',
    brief: 'Scoped to vision: perception, multimodal understanding, and generation.',
  },
  Robotics: {
    title: 'Robotics',
    copy: 'Embodied intelligence — manipulation, locomotion, sim-to-real transfer, and policies that turn perception into physical action.',
    brief: 'Scoped to robotics: embodied learning from perception to action.',
  },
  Other: {
    title: 'Broader AI',
    copy: 'The wider field beyond the four named directions — foundations, AI systems, NLP, industry, social impact, and research frontiers. Use the broader-topic chips to refine.',
    brief: 'Scoped to broader AI: foundations, systems, NLP, industry, and social impact.',
  },
  'How to Research': {
    title: 'How to Research',
    copy: 'The craft itself — finding problems, reading literature, running rigorous experiments, writing, peer review, and presenting work.',
    brief: 'Scoped to the craft of research itself.',
  },
}

function getLibraryIntro(format, focus) {
  const formatIntro = formatIntros[format]
  const focusIntro = focusIntros[focus]

  if (formatIntro && focusIntro) {
    return {
      title: `${formatIntro.title} in ${focusIntro.title}`,
      copy: `${formatIntro.brief} ${focusIntro.brief}`,
    }
  }
  if (formatIntro) return formatIntro
  if (focusIntro) return focusIntro
  return {
    title: 'The full index',
    copy: 'Every interview, podcast, course, and talk in the collection — Core selections first, lecture and episode series grouped into single entries, every link kept on its canonical host. Pick a format tab or a research direction to narrow the slice.',
  }
}

const broaderTopicOptions = [{ value: 'All', label: 'All broader topics' }, ...broaderTopics]

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
  { value: 'Conference Site', label: 'Conference sites' },
  { value: 'Official Site', label: 'Official sites' },
]

const durationOptions = [
  { value: 'All', label: 'Any duration' },
  { value: 'short', label: 'Under 30 min' },
  { value: 'medium', label: '30–90 min' },
  { value: 'long', label: 'Over 90 min' },
]

const pageSizeOptions = [
  { value: 20, label: '20 per page' },
  { value: 40, label: '40 per page' },
  { value: 80, label: '80 per page' },
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

export default function Library({ resources, query, setQuery, format, setFormat, focus, setFocus, workspace, actions }) {
  const [language, setLanguage] = useState(() => initialOption('language', languageOptions))
  const [platform, setPlatform] = useState(() => initialOption('platform', platformOptions))
  const [duration, setDuration] = useState(() => initialOption('duration', durationOptions))
  const [sort, setSort] = useState(() => initialOption('sort', sortOptions, 'curated'))
  const [broaderTopic, setBroaderTopic] = useState(() => initialOption('topic', broaderTopicOptions))
  const [podcastShow, setPodcastShow] = useState(() => new URLSearchParams(window.location.search).get('show') || 'All')
  const [pageSize, setPageSize] = useState(() => {
    const value = Number(new URLSearchParams(window.location.search).get('pageSize'))
    return pageSizeOptions.some((option) => option.value === value) ? value : 20
  })
  const [page, setPage] = useState(() => Math.max(1, Number(new URLSearchParams(window.location.search).get('page')) || 1))
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get('view') === 'list' ? 'list' : 'grid')
  const [selectedResource, setSelectedResource] = useState(null)
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [researchOnly, setResearchOnly] = useState(false)
  const [tierAOnly, setTierAOnly] = useState(false)
  const [subtitleOnly, setSubtitleOnly] = useState(false)
  const resultsRef = useRef(null)

  const podcastShows = useMemo(() => getPodcastShows(resources), [resources])
  // A shared URL can point at a show outside the top chips; surface it so the
  // active selection stays visible.
  const visibleShows = useMemo(() => {
    if (podcastShow === 'All' || podcastShows.some((show) => show.name === podcastShow)) return podcastShows
    const count = resources.filter((resource) => matchesFormat(resource, 'Podcast') && getPodcastShow(resource) === podcastShow).length
    return [...podcastShows, { name: podcastShow, count }]
  }, [podcastShow, podcastShows, resources])

  const filtered = useMemo(() => {
    const matches = resources.filter((resource) => (
      matchesFormat(resource, format) &&
      (format !== 'Podcast' || podcastShow === 'All' || getPodcastShow(resource) === podcastShow) &&
      (focus === 'All' || resource.focusArea === focus) &&
      (focus !== 'Other' || broaderTopic === 'All' || getBroaderTopic(resource) === broaderTopic) &&
      (language === 'All' || resource.language === language) &&
      (platform === 'All' || resource.platform === platform) &&
      matchesDuration(resource, duration) &&
      (!researchOnly || resource.recommendation === 'Core') &&
      (!tierAOnly || resource.sourceTier?.startsWith('A |')) &&
      (!subtitleOnly || resource.subtitlesVerified) &&
      matchesSearch(resource, query)
    ))
    return sortResources(matches, sort)
  }, [resources, broaderTopic, duration, format, focus, language, platform, podcastShow, query, researchOnly, sort, subtitleOnly, tierAOnly])
  const entries = useMemo(() => groupResourceSeries(filtered), [filtered])
  const intro = getLibraryIntro(format, focus)
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageEntries = entries.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const filterState = `${duration}-${format}-${focus}-${broaderTopic}-${podcastShow}-${language}-${platform}-${query}-${sort}-${researchOnly}-${tierAOnly}-${subtitleOnly}`
  const previousFilterState = useRef(filterState)

  useEffect(() => {
    if (previousFilterState.current !== filterState) {
      previousFilterState.current = filterState
      setPage(1)
    }
  }, [filterState])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    if (format !== 'Podcast') setPodcastShow('All')
  }, [format])

  useEffect(() => {
    const url = new URL(window.location.href)
    const values = { q: query, format, focus, topic: broaderTopic, show: podcastShow, language, platform, duration, sort, page: currentPage, pageSize, view }

    Object.entries(values).forEach(([key, value]) => {
      const isDefault = value === 'All' ||
        (key === 'sort' && value === 'curated') ||
        (key === 'page' && value === 1) ||
        (key === 'pageSize' && value === 20) ||
        (key === 'view' && value === 'grid') || !value
      if (isDefault) url.searchParams.delete(key)
      else url.searchParams.set(key, value)
    })

    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [broaderTopic, currentPage, duration, format, focus, language, pageSize, platform, podcastShow, query, sort, view])

  function resetFilters() {
    setQuery('')
    setFormat('All')
    setFocus('All')
    setLanguage('All')
    setPlatform('All')
    setDuration('All')
    setSort('curated')
    setBroaderTopic('All')
    setPodcastShow('All')
    setResearchOnly(false)
    setTierAOnly(false)
    setSubtitleOnly(false)
    setPage(1)
  }

  function selectFocus(nextFocus) {
    setFocus(nextFocus)
    if (nextFocus !== 'Other') setBroaderTopic('All')
  }

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(1, nextPage), totalPages))
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section className="library" id="library">
      <div className="shell">
        <div className="section-heading section-heading--row">
          <div>
            <p className="section-kicker">The index</p>
            <h2>Explore {resources.length} resources</h2>
          </div>
          <p>Find the right depth, format, and research direction without losing the source.</p>
        </div>

        <div className="library-intro" role="note" aria-label="About the current selection">
          <h3 className="library-intro__title">{intro.title}</h3>
          <p className="library-intro__copy">{intro.copy}</p>
          <p className="library-intro__count">
            {filtered.length} {filtered.length === 1 ? 'resource' : 'resources'} in this view
          </p>
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
                aria-pressed={format === item}
                aria-label={`Show ${formatLabels[item] === 'All' ? 'all formats' : formatLabels[item].toLocaleLowerCase()}`}
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
                  onClick={() => selectFocus(item)}
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

            {focus === 'Other' && (
              <div className="topic-filters" aria-label="Broader AI topic">
                <span>Refine broader AI</span>
                <div>
                  {broaderTopicOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={broaderTopic === option.value ? 'is-active' : ''}
                      onClick={() => setBroaderTopic(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {format === 'Podcast' && podcastShows.length > 0 && (
              <div className="topic-filters show-filters" aria-label="Podcast show">
                <span>Filter by show</span>
                <div>
                  <button
                    type="button"
                    className={podcastShow === 'All' ? 'is-active' : ''}
                    aria-pressed={podcastShow === 'All'}
                    aria-label="All podcast shows"
                    onClick={() => setPodcastShow('All')}
                  >
                    All shows
                  </button>
                  {visibleShows.map((show) => (
                    <button
                      type="button"
                      key={show.name}
                      className={podcastShow === show.name ? 'is-active' : ''}
                      aria-pressed={podcastShow === show.name}
                      aria-label={`${show.name}, ${show.count} ${show.count === 1 ? 'episode' : 'episodes'}`}
                      onClick={() => setPodcastShow(show.name)}
                    >
                      {show.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="research-mode" aria-label="Researcher mode filters">
            <span>Researcher mode</span>
            <button type="button" className={researchOnly ? 'is-active' : ''} aria-pressed={researchOnly} title="Only Core recommendations — the suggested starting points" onClick={() => setResearchOnly((value) => !value)}>Core only</button>
            <button type="button" className={tierAOnly ? 'is-active' : ''} aria-pressed={tierAOnly} title="Only Tier A sources — original and official uploads" onClick={() => setTierAOnly((value) => !value)}>Tier A</button>
            <button type="button" className={subtitleOnly ? 'is-active' : ''} aria-pressed={subtitleOnly} title="Only recordings with verified subtitles" onClick={() => setSubtitleOnly((value) => !value)}>Subtitles</button>
          </div>
        </div>

        <div className="results-bar" aria-live="polite" ref={resultsRef}>
          <span>
            {filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}
            {entries.length !== filtered.length && ` · ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} after series grouping`}
          </span>
          <div className="results-actions">
            {(query || format !== 'All' || focus !== 'All' || broaderTopic !== 'All' || podcastShow !== 'All' || language !== 'All' || platform !== 'All' || duration !== 'All' || researchOnly || tierAOnly || subtitleOnly) && (
              <button type="button" onClick={resetFilters}>Clear filters</button>
            )}
            <button type="button" onClick={() => exportMarkdown(filtered)} disabled={!filtered.length} aria-label={`Export ${filtered.length} results as Markdown`} title="Download the current results as a Markdown reading list with source links">
              <DownloadIcon /> Markdown
            </button>
            <button type="button" onClick={() => exportCsv(filtered)} disabled={!filtered.length} aria-label={`Export ${filtered.length} results as CSV`} title="Download the current results as a CSV table for analysis or import">
              <DownloadIcon /> CSV
            </button>
            <span className="view-switcher" aria-label="Results view">
              <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><GridIcon /></button>
              <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="Compact list view" aria-pressed={view === 'list'}><ListIcon /></button>
            </span>
          </div>
        </div>

        {filtered.length ? (
          <>
            <div className={`resource-grid resource-grid--${view}`} key={`${language}-${platform}-${duration}-${sort}-${view}-${currentPage}`}>
              {pageEntries.map((entry, index) => entry.kind === 'series' ? (
                <CourseSeriesCard series={entry} index={(currentPage - 1) * pageSize + index} key={entry.id} onOpen={setSelectedSeries} />
              ) : (
                <ResourceCard resource={entry.resource} index={(currentPage - 1) * pageSize + index} key={entry.id} onOpen={setSelectedResource} />
              ))}
            </div>
            <nav className="pagination" aria-label="Resource pages">
              <div className="page-size">
                <span>Show</span>
                <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} aria-label="Resources per page">
                  {pageSizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="page-jump">
                <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"><PageArrowIcon direction="previous" /></button>
                <label>
                  <span>Page</span>
                  <select value={currentPage} onChange={(event) => goToPage(Number(event.target.value))} aria-label="Jump to page">
                    {Array.from({ length: totalPages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                  </select>
                  <span>of {totalPages}</span>
                </label>
                <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page"><PageArrowIcon /></button>
              </div>
              <span className="page-range">
                {Math.min((currentPage - 1) * pageSize + 1, entries.length)}–{Math.min(currentPage * pageSize, entries.length)} of {entries.length} entries
              </span>
            </nav>
          </>
        ) : (
          <div className="empty-state">
            <p>No indexed resource matches this combination. Duration, platform, and the researcher-mode toggles cut deepest — loosen one of those, or start again from the full index.</p>
            <button type="button" onClick={resetFilters}>Reset the index</button>
          </div>
        )}
      </div>
      {selectedResource && <ResourceDetail resource={selectedResource} resources={resources} workspace={workspace} actions={actions} onClose={() => setSelectedResource(null)} onOpenResource={setSelectedResource} />}
      {selectedSeries && <CourseSeriesDetail series={selectedSeries} onClose={() => setSelectedSeries(null)} />}
    </section>
  )
}
