import { useState } from 'react'
import { ArrowIcon, CheckIcon, ExternalIcon } from '../icons'

const issueBaseUrl = 'https://github.com/OpenEnvision/ScholarTube/issues/new'

function getResourceKey(value) {
  try {
    const parsed = new URL(value)
    const hostname = parsed.hostname.replace(/^www\./, '')
    if (hostname === 'youtu.be') return `youtube:${parsed.pathname.split('/').filter(Boolean)[0] || ''}`
    if (hostname.endsWith('youtube.com')) return `youtube:${parsed.searchParams.get('v') || parsed.pathname}`
    const bilibiliId = parsed.pathname.match(/\/(BV[a-zA-Z0-9]+)/)?.[1]
    if (bilibiliId) return `bilibili:${bilibiliId}`
    return `${hostname}${parsed.pathname}`.replace(/\/$/, '').toLowerCase()
  } catch {
    return value.trim().toLowerCase()
  }
}

export default function Contribute({ resources }) {
  const [url, setUrl] = useState('')
  const [reason, setReason] = useState('')
  const [issueUrl, setIssueUrl] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const duplicate = resources.find((resource) => getResourceKey(resource.url) === getResourceKey(url))

    if (duplicate) {
      setIssueUrl('')
      setError(`This source is already indexed as ${duplicate.id}: ${duplicate.title}`)
      return
    }

    const body = [
      '## Resource',
      '',
      `- URL: ${url.trim()}`,
      '',
      '## Why it belongs',
      '',
      reason.trim(),
      '',
      '## Review checklist',
      '',
      '- [ ] Source is publicly accessible on its canonical host',
      '- [ ] Speaker, channel, institution, or venue verified',
      '- [ ] Technical value reviewed: teaches a mechanism, method, result, or research lesson',
      '- [ ] Durability and completeness confirmed (substantive recording, not a teaser or clip)',
      '- [ ] Direction, domain, and keywords assigned',
      '',
      '_Submitted from the ScholarTube contribution form after an automatic duplicate check._',
    ].join('\n')
    const params = new URLSearchParams({
      title: `[Resource submission] ${url.trim()}`,
      body,
    })

    setError('')
    setIssueUrl(`${issueBaseUrl}?${params.toString()}`)
  }

  function resetPrepared() {
    setIssueUrl('')
    setError('')
  }

  return (
    <section className="contribute" id="contribute">
      <div className="contribute-grid shell">
        <div className="contribute-intro">
          <p className="section-kicker">Open index</p>
          <h2>A recording worth preserving?</h2>
          <p>
            Recommend a public interview, podcast episode, course, or talk. The form checks the
            canonical YouTube or Bilibili identifier against the current corpus — duplicates are
            caught before a GitHub issue is prepared — and every submission is reviewed on the
            same five dimensions as the rest of the index: technical value, source fidelity,
            durability, completeness, and taxonomic fit.
          </p>
        </div>

        <form className="contribute-form" onSubmit={handleSubmit}>
          <label>
            <span>Video URL</span>
            <input
              type="url"
              required
              value={url}
              onChange={(event) => { setUrl(event.target.value); resetPrepared() }}
              placeholder="https://youtube.com/... or https://bilibili.com/..."
            />
          </label>
          <label>
            <span>Why it belongs</span>
            <textarea
              required
              value={reason}
              minLength={30}
              onChange={(event) => { setReason(event.target.value); resetPrepared() }}
              placeholder="What will a researcher learn — a mechanism, method, result, or research lesson?"
            />
          </label>
          <button className="button button--primary" type="submit">
            {issueUrl ? <><CheckIcon /> Review ready</> : <>Check & prepare review <ArrowIcon /></>}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          {issueUrl && (
            <div className="submission-ready" role="status">
              <p>No duplicate found in the current corpus. Review the prefilled issue and submit it to enter the editorial queue in OpenEnvision/ScholarTube.</p>
              <a className="button button--outline" href={issueUrl} target="_blank" rel="noreferrer">
                Continue on GitHub <ExternalIcon />
              </a>
            </div>
          )}
        </form>

        <div className="source-fidelity">
          <h3>Built for source fidelity.</h3>
          <ul>
            <li><span>01</span> Videos stay on their canonical hosts; ScholarTube never re-uploads media.</li>
            <li><span>02</span> Titles, speakers, durations, and links are verified against the source and kept searchable.</li>
            <li><span>03</span> Editorial judgment stays visible: every entry carries a source tier and a recommendation.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
