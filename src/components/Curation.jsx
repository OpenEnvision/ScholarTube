// The on-page version of the editorial protocol documented in README.md.
// It must stand alone for a visitor who never opens GitHub.
const standards = [
  [
    '01',
    'Technical value',
    'A recording earns its place by teaching something that changes or deepens technical understanding — a mechanism, a method, an empirical result, or a lesson about doing research — not by announcing one.',
  ],
  [
    '02',
    'Source fidelity',
    'The speaker, channel, institution, or venue must be identifiable, and every link points to the original host. ScholarTube never re-uploads media; videos stay on their canonical platforms.',
  ],
  [
    '03',
    'Durability',
    'Material should remain worth the hour after the release cycle that produced it. Commentary that only tracks the week’s news does not survive review.',
  ],
  [
    '04',
    'Completeness',
    'The index holds substantive recordings and coherent series, not fragments. Teasers, short demos, and clipped highlights are out of scope by design.',
  ],
  [
    '05',
    'Taxonomic fit',
    'Every entry must sit meaningfully in a research direction, domain, and keyword set, so it can be found again by the question it answers rather than by the platform that happens to host it.',
  ],
  [
    '06',
    'Podcast selection',
    'Podcasts are held to the same bar: researcher guests, long-form conversation, and the canonical upload — chosen for what an episode teaches, not for release-week reach.',
  ],
]

const signals = [
  [
    'Source tier',
    'A · B · C',
    'Where a recording comes from: original and official uploads (A), institutional sources such as universities and conferences (B), or carefully selected community sources (C).',
  ],
  [
    'Recommendation',
    'Core · Recommended · Reserve',
    'The role a resource plays in the index: a suggested starting point, a focused complement, or a specialized alternative for readers who need it.',
  ],
]

export default function Curation() {
  return (
    <section className="curation" id="curation">
      <div className="curation-grid shell">
        <div className="curation-intro">
          <p className="section-kicker">Selection protocol</p>
          <h2>Curation over aggregation.</h2>
          <p className="curation-lede">
            ScholarTube is built for researchers who learn from long-form video but need a more
            deliberate discovery layer than a general-purpose platform provides. Every candidate —
            interview, course, talk, or podcast episode — is reviewed against the dimensions listed
            here before it enters the index. Popularity can surface a candidate; it is never
            sufficient for inclusion.
          </p>

          <div className="curation-signals">
            <h3>Two signals, not one score</h3>
            <dl>
              {signals.map(([name, values, meaning]) => (
                <div key={name}>
                  <dt>{name} <span>{values}</span></dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
            <p>
              The two labels are independent: a Tier A source can be a Reserve pick, and both
              describe the role of a resource inside the index — never a ranking of people,
              organizations, or research agendas.
            </p>
          </div>

          <p className="curation-exclusions">
            <strong>Deliberately excluded:</strong> teasers and announcement clips, duplicate
            re-uploads, short promotional launches, inaccessible sources, and low-information
            summaries.
          </p>
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
