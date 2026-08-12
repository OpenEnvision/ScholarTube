import { ArrowIcon } from '../icons'

const directions = [
  {
    id: 'World Model',
    number: '01',
    label: 'World Models',
    count: 52,
    copy: 'Learned simulators, temporal dynamics, planning, and spatial reasoning.',
    breakdown: [15, 18, 19],
  },
  {
    id: 'Agent',
    number: '02',
    label: 'Agents',
    count: 42,
    copy: 'Tool use, memory, orchestration, autonomy, and agent evaluation.',
    breakdown: [12, 14, 16],
  },
  {
    id: 'Vision',
    number: '03',
    label: 'Vision',
    count: 57,
    copy: 'Perception, multimodal understanding, generation, and video systems.',
    breakdown: [13, 24, 20],
  },
  {
    id: 'Robotics',
    number: '04',
    label: 'Robotics',
    count: 53,
    copy: 'Embodied intelligence where perception becomes grounded action.',
    breakdown: [17, 18, 18],
  },
]

export default function Directions({ setFocus }) {
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
          <p>Four priority areas form a path into the index. The remaining collection stays searchable across broader AI domains.</p>
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
