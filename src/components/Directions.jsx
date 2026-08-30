import { ArrowIcon } from '../icons'
import { getFormatFamily } from '../resource-utils'

const breakdownFamilies = ['Interview', 'Course', 'Talk', 'Podcast']

const directionDefinitions = [
  {
    id: 'World Model',
    number: '01',
    label: 'World Models',
    copy: 'Learned simulators and generative video — Genie, Dreamer, driving world models — plus the spatial reasoning needed to plan inside a prediction.',
  },
  {
    id: 'Agent',
    number: '02',
    label: 'Agents',
    copy: 'How language models become systems that act: post-training, tool use, retrieval, planning, multi-agent coordination, and honest evaluation.',
  },
  {
    id: 'Vision',
    number: '03',
    label: 'Vision',
    copy: 'Perception from pixels to 3D and video understanding, and the vision–language models that connect what a system sees to what it knows.',
  },
  {
    id: 'Robotics',
    number: '04',
    label: 'Robotics',
    copy: 'Reinforcement and imitation learning, manipulation, humanoids, and vision-language-action models: perception becoming reliable physical behaviour.',
  },
  {
    id: 'Other',
    number: '05',
    label: 'Broader AI',
    copy: 'The base layer: mathematics, classic courses, ML systems, NLP, and the interviews that explain where the field is actually heading.',
  },
  {
    id: 'How to Research',
    number: '06',
    label: 'How to Research',
    copy: 'The craft itself: finding problems worth years, reading and writing papers, surviving peer review, and giving talks people remember.',
  },
]

export default function Directions({ setFocus, resources }) {
  const directions = directionDefinitions.map((direction) => {
    const matching = resources.filter((resource) => resource.focusArea === direction.id)
    return {
      ...direction,
      count: matching.length,
      breakdown: breakdownFamilies.map((family) => (
        matching.filter((resource) => getFormatFamily(resource) === family).length
      )),
    }
  })

  function chooseDirection(id) {
    setFocus(id)
    document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="directions" id="directions">
      <div className="shell">
        <div className="section-heading section-heading--row">
          <div>
            <p className="section-kicker">Research directions</p>
            <h2>Enter through the question you’re working on.</h2>
          </div>
          <p>Each direction filters the index down to the interviews, courses, and talks that serve it — with the research craft itself as a first-class direction.</p>
        </div>

        <div className="direction-list">
          {directions.map((direction) => (
            <button type="button" className="direction-row" key={direction.id} onClick={() => chooseDirection(direction.id)}>
              <span className="direction-number">{direction.number}</span>
              <span className="direction-main">
                <strong>{direction.label}</strong>
                <span>{direction.copy}</span>
              </span>
              <span className="direction-count">{direction.count}<small> resources</small></span>
              <span className="direction-breakdown" aria-label={`${direction.breakdown[0]} interviews, ${direction.breakdown[1]} courses, ${direction.breakdown[2]} talks, ${direction.breakdown[3]} podcasts`}>
                {direction.breakdown.map((value, index) => (
                  <i key={index} style={{ '--bar': `${Math.max(24, value * 3)}%` }} />
                ))}
                <em>I / C / T / P</em>
              </span>
              <span className="direction-arrow"><ArrowIcon /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
