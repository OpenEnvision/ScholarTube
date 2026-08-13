import { ArrowIcon } from '../icons'

const directionDefinitions = [
  {
    id: 'World Model',
    number: '01',
    label: 'World Models',
    copy: 'Learned simulators, temporal dynamics, planning, and spatial reasoning.',
  },
  {
    id: 'Agent',
    number: '02',
    label: 'Agents',
    copy: 'Tool use, memory, orchestration, autonomy, and agent evaluation.',
  },
  {
    id: 'Vision',
    number: '03',
    label: 'Vision',
    copy: 'Perception, multimodal understanding, generation, and video systems.',
  },
  {
    id: 'Robotics',
    number: '04',
    label: 'Robotics',
    copy: 'Embodied intelligence where perception becomes grounded action.',
  },
  {
    id: 'Other',
    number: '05',
    label: 'Broader AI',
    copy: 'Foundations, AI systems, NLP, industry, social impact, and research frontiers.',
  },
]

export default function Directions({ setFocus, resources }) {
  const directions = directionDefinitions.map((direction) => {
    const matching = resources.filter((resource) => resource.focusArea === direction.id)
    return {
      ...direction,
      count: matching.length,
      breakdown: ['Interview', 'Course', 'Talk'].map((section) => (
        matching.filter((resource) => resource.section === section).length
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
          <p>Five directions form a path into the index, with Broader AI refined into six focused secondary topics.</p>
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
              <span className="direction-breakdown" aria-label={`${direction.breakdown[0]} interviews, ${direction.breakdown[1]} courses, ${direction.breakdown[2]} talks`}>
                {direction.breakdown.map((value, index) => (
                  <i key={index} style={{ '--bar': `${Math.max(24, value * 3)}%` }} />
                ))}
                <em>I / C / T</em>
              </span>
              <span className="direction-arrow"><ArrowIcon /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
