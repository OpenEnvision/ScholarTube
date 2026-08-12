const standards = [
  ['01', 'Source fidelity', 'Link to the original host.'],
  ['02', 'Technical value', 'Teach beyond the announcement.'],
  ['03', 'Durable signal', 'Stay useful after the release cycle.'],
]

export default function Curation() {
  return (
    <section className="curation" id="curation">
      <div className="curation-grid shell">
        <div className="curation-intro">
          <p className="section-kicker">Selection protocol</p>
          <h2>Curation over aggregation.</h2>
          <p>Every resource should help a researcher understand a mechanism, method, system behavior, or research lesson.</p>
        </div>
        <ol className="standard-list">
          {standards.map(([number, title, copy]) => (
            <li key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
