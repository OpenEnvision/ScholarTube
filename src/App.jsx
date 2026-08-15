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

const FEATURED_IDS = ['ST-008', 'ST-175', 'ST-354', 'ST-083', 'ST-344']
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
  const [format, setFormat] = useState(() => ['Interview', 'Course', 'Talk'].includes(params.get('format')) ? params.get('format') : 'All')
  const [focus, setFocus] = useState(() => ['World Model', 'Agent', 'Vision', 'Robotics', 'Other'].includes(params.get('focus')) ? params.get('focus') : 'All')
  const isMobile = useMediaQuery('(max-width: 600px)')

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

  return (
    <>
      <Header query={query} setQuery={setQuery} onFormatSelect={selectFormat} />
      <main>
        <Hero>
          {!isMobile ? <FeaturedCarousel resources={featuredResources} /> : null}
        </Hero>
        <Library
          resources={resources}
          query={query}
          setQuery={setQuery}
          format={format}
          setFormat={setFormat}
          focus={focus}
          setFocus={setFocus}
        />
        {isMobile ? (
          <section className="mobile-featured" aria-label="Featured resources">
            <div className="shell"><FeaturedCarousel resources={featuredResources} /></div>
          </section>
        ) : null}
        <ScholarTubers resources={resources} onExplore={exploreScholarTuber} />
        <Directions setFocus={setFocus} resources={resources} />
        <Curation />
        <Contribute resources={resources} />
      </main>
      <Footer />
    </>
  )
}
