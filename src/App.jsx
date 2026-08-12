import { useMemo, useState } from 'react'
import resources from '../data/scholar_tube_resources.json'
import Header from './components/Header'
import Hero from './components/Hero'
import Library from './components/Library'
import Directions from './components/Directions'
import Curation from './components/Curation'
import Contribute from './components/Contribute'
import Footer from './components/Footer'

export default function App() {
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState('All')
  const [focus, setFocus] = useState('All')

  const featured = useMemo(
    () => resources.find((resource) => resource.id === 'ST-008') ?? resources[0],
    [],
  )

  function selectFormat(nextFormat) {
    setFormat(nextFormat)
    requestAnimationFrame(() => {
      document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <>
      <Header query={query} setQuery={setQuery} onFormatSelect={selectFormat} />
      <main>
        <Hero featured={featured} />
        <Library
          resources={resources}
          query={query}
          setQuery={setQuery}
          format={format}
          setFormat={setFormat}
          focus={focus}
          setFocus={setFocus}
        />
        <Directions setFocus={setFocus} />
        <Curation />
        <Contribute />
      </main>
      <Footer />
    </>
  )
}
