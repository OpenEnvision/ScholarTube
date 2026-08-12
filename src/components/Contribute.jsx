import { useState } from 'react'
import { ArrowIcon, CheckIcon } from '../icons'

export default function Contribute() {
  const [url, setUrl] = useState('')
  const [reason, setReason] = useState('')
  const [prepared, setPrepared] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setPrepared(true)
  }

  return (
    <section className="contribute" id="contribute">
      <div className="contribute-grid shell">
        <div className="contribute-intro">
          <p className="section-kicker">Open index</p>
          <h2>A lecture worth preserving?</h2>
          <p>Recommend a public interview, course, or talk with enough context for editorial review.</p>
        </div>

        <form className="contribute-form" onSubmit={handleSubmit}>
          <label>
            <span>Video URL</span>
            <input
              type="url"
              required
              value={url}
              onChange={(event) => { setUrl(event.target.value); setPrepared(false) }}
              placeholder="https://youtube.com/..."
            />
          </label>
          <label>
            <span>Why it belongs</span>
            <textarea
              required
              value={reason}
              onChange={(event) => { setReason(event.target.value); setPrepared(false) }}
              placeholder="What will researchers learn?"
            />
          </label>
          <button className="button button--primary" type="submit">
            {prepared ? <><CheckIcon /> Submission prepared</> : <>Prepare submission <ArrowIcon /></>}
          </button>
          {prepared && (
            <p className="form-success" role="status">
              Your recommendation is prepared locally. Connect a project issue tracker when ScholarTube is published to send it for review.
            </p>
          )}
        </form>

        <div className="source-fidelity">
          <h3>Built for source fidelity.</h3>
          <ul>
            <li><span>01</span> Original hosts stay canonical.</li>
            <li><span>02</span> Metadata stays searchable.</li>
            <li><span>03</span> Editorial judgment stays visible.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
