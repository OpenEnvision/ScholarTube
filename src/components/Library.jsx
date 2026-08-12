import { useEffect, useMemo, useState } from 'react'
import { ChevronIcon, GlobeIcon, SearchIcon, SortIcon } from '../icons'
import { matchesSearch, sortResources } from '../resource-utils'
import ResourceCard from './ResourceCard'

const formats = ['All', 'Interview', 'Course', 'Talk']
const focusAreas = ['All', 'World Model', 'Agent', 'Vision', 'Robotics']

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
}

export default function Library({ resources, query, setQuery, format, setFormat, focus, setFocus }) {
  const [language, setLanguage] = useState('All')
  const [sort, setSort] = useState('curated')
  const [visible, setVisible] = useState(10)

  const filtered = useMemo(() => {
    const matches = resources.filter((resource) => (
      (format === 'All' || resource.section === format) &&
      (focus === 'All' || resource.focusArea === focus) &&
      (language === 'All' || resource.language === language) &&
      matchesSearch(resource, query)
    ))
    return sortResources(matches, sort)
  }, [resources, format, focus, language, query, sort])

  useEffect(() => setVisible(10), [format, focus, language, query, sort])

  function resetFilters() {
    setQuery('')
    setFormat('All')
    setFocus('All')
    setLanguage('All')
    setSort('curated')
  }

  return (
    <section className="library" id="library">
      <div className="shell">
        <div className="section-heading section-heading--row">
          <div>
            <p className="section-kicker">The index</p>
            <h2>Explore 379 resources</h2>
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
              <label className="filter-select">
                <span className="sr-only">Language</span>
                <span className="filter-select__icon" aria-hidden="true"><GlobeIcon /></span>
                <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                  <option value="All">All languages</option>
                  <option value="English">English</option>
                  <option value="Chinese">Chinese</option>
                </select>
                <span className="filter-select__chevron" aria-hidden="true"><ChevronIcon /></span>
              </label>
              <label className="filter-select">
                <span className="sr-only">Sort resources</span>
                <span className="filter-select__icon" aria-hidden="true"><SortIcon /></span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="curated">Curated first</option>
                  <option value="popular">Most viewed</option>
                  <option value="shortest">Shortest first</option>
                  <option value="longest">Longest first</option>
                </select>
                <span className="filter-select__chevron" aria-hidden="true"><ChevronIcon /></span>
              </label>
            </div>
          </div>
        </div>

        <div className="results-bar" aria-live="polite">
          <span>{filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}</span>
          {(query || format !== 'All' || focus !== 'All' || language !== 'All') && (
            <button type="button" onClick={resetFilters}>Clear filters</button>
          )}
        </div>

        {filtered.length ? (
          <>
            <div className="resource-grid">
              {filtered.slice(0, visible).map((resource, index) => (
                <ResourceCard resource={resource} index={index} key={resource.id} />
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
    </section>
  )
}
