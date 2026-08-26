import { useEffect, useState } from 'react'
import resources from '../data/scholar_tube_resources.json'
import Header from './components/Header'
import Hero from './components/Hero'
import Library from './components/Library'
import Directions from './components/Directions'
import Curation from './components/Curation'
import Contribute from './components/Contribute'
import Footer from './components/Footer'
import FeaturedCarousel from './components/FeaturedCarousel'
import ScholarTubers from './components/ScholarTubers'
import PodcastShows from './components/PodcastShows'
import LearningWorkbench from './components/LearningWorkbench'
import ResourceDetail from './components/ResourceDetail'
import { useLearningWorkspace } from './learning-workspace'

// ST-001 (Karpathy on Lex Fridman) and ST-942 (Saining Xie marathon on 张小珺 Podcast)
// keep flagship podcasts in the featured rotation alongside a talk, course, and interview.
const FEATURED_IDS = ['ST-008', 'ST-001', 'ST-175', 'ST-083', 'ST-942']
const featuredResources = FEATURED_IDS.map((id) => resources.find((resource) => resource.id === id)).filter(Boolean)

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState(() => params.get('q') || '')
  const [format, setFormat] = useState(() => ['Interview', 'Podcast', 'Course', 'Talk'].includes(params.get('format')) ? params.get('format') : 'All')
  const [focus, setFocus] = useState(() => ['World Model', 'Agent', 'Vision', 'Robotics', 'Other', 'How to Research'].includes(params.get('focus')) ? params.get('focus') : 'All')
  const [workspaceResource, setWorkspaceResource] = useState(null)
  const isMobile = useMediaQuery('(max-width: 600px)')
  const { workspace, actions } = useLearningWorkspace()

  function selectFormat(nextFormat) {
    setFormat(nextFormat)
    requestAnimationFrame(() => {
      document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  function exploreScholarTuber(name) {
    setQuery(name)
    setFormat('All')
    setFocus('All')
    requestAnimationFrame(() => {
      document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  // The topic map navigates the index: a dot sets the filter the index runs.
  function exploreTopic({ query = '', focus = 'All' } = {}) {
    setQuery(query)
    setFormat('All')
    setFocus(focus)
    requestAnimationFrame(() => {
      document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  function browseLibrary() {
    setQuery('')
    setFormat('All')
    setFocus('All')
    requestAnimationFrame(() => {
      document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <>
      <Header query={query} setQuery={setQuery} onFormatSelect={selectFormat} />
      <main>
        <Hero resources={resources}>
          {!isMobile ? <FeaturedCarousel resources={featuredResources} totalCount={resources.length} /> : null}
        </Hero>
        <LearningWorkbench
          resources={resources}
          workspace={workspace}
          actions={actions}
          onOpen={setWorkspaceResource}
          onExplore={exploreScholarTuber}
          onFocus={setFocus}
          onTopic={exploreTopic}
          onBrowse={browseLibrary}
        />
        <Library
          resources={resources}
          query={query}
          setQuery={setQuery}
          format={format}
          setFormat={setFormat}
          focus={focus}
          setFocus={setFocus}
          workspace={workspace}
          actions={actions}
        />
        {isMobile ? (
          <section className="mobile-featured" aria-label="Featured resources">
            <div className="shell"><FeaturedCarousel resources={featuredResources} totalCount={resources.length} /></div>
          </section>
        ) : null}
        <PodcastShows resources={resources} onExplore={exploreScholarTuber} />
        <ScholarTubers resources={resources} onExplore={exploreScholarTuber} />
        <Directions setFocus={setFocus} resources={resources} />
        <Curation />
        <Contribute resources={resources} />
      </main>
      <Footer />
      {workspaceResource && (
        <ResourceDetail
          resource={workspaceResource}
          resources={resources}
          workspace={workspace}
          actions={actions}
          onClose={() => setWorkspaceResource(null)}
          onOpenResource={setWorkspaceResource}
        />
      )}
    </>
  )
}
