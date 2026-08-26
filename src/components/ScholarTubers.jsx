import { useMemo, useState } from 'react'
import { ArrowIcon, ExternalIcon, PlayIcon } from '../icons'
import { formatViews, getThumbnail } from '../resource-utils'

// Every name must actually resolve against the index: a profile with no
// indexed entries is dropped by buildProfiles rather than shown empty.
const profileDefinitions = [
  { name: 'Jensen Huang', role: 'NVIDIA CEO; GTC keynotes on accelerated computing', topic: 'AI Systems' },
  { name: 'Andrej Karpathy', role: 'Deep learning educator & builder', topic: 'Foundations' },
  { name: 'Lex Fridman', role: 'Long-form research interviewer', topic: 'Long-form interviews' },
  { name: 'Demis Hassabis', role: 'DeepMind co-founder & research lead', topic: 'World Models' },
  { name: 'Andrew Ng', role: 'Machine learning educator & researcher', topic: 'Foundations' },
  { name: 'Ilya Sutskever', role: 'Deep learning researcher', topic: 'Research Frontiers' },
  { name: 'Yann LeCun', role: 'Representation learning researcher', topic: 'Foundations' },
  { name: 'Sergey Levine', role: 'Robot learning researcher (Berkeley RAIL)', topic: 'Robotics' },
  { name: 'Alexander Amini', role: 'MIT 6.S191 deep learning lecturer', topic: 'Foundations' },
  { name: 'Brian Yu', role: 'CS50 AI educator (Harvard)', topic: 'Foundations' },
  { name: 'Christopher Manning', role: 'NLP researcher & CS224N lecturer', topic: 'NLP' },
  { name: 'Emma Brunskill', role: 'Reinforcement learning researcher (CS234)', topic: 'Agents' },
  { name: 'Russ Tedrake', role: 'Underactuated robotics educator (MIT)', topic: 'Robotics' },
  { name: 'Fei-Fei Li', role: 'Computer vision & spatial intelligence researcher', topic: 'Vision' },
  { name: 'Yuandong Tian', role: 'AI researcher; interpretability & training dynamics', topic: 'Research Frontiers' },
  { name: 'Kai-Fu Lee', role: 'AI author, investor & industry leader', topic: 'Industry' },
  { name: 'Song Han', role: 'Efficient ML researcher (MIT HAN Lab)', topic: 'AI Systems' },
  { name: 'Chelsea Finn', role: 'Robot learning researcher', topic: 'Robotics' },
  { name: 'Harrison Chase', role: 'LangChain founder; agent tooling', topic: 'Agents' },
  { name: 'Kaiming He', role: 'Computer vision researcher', topic: 'Vision' },
  { name: 'Gilbert Strang', role: 'MIT linear algebra lecturer (18.06 / 18.065)', topic: 'Foundations' },
  { name: '张小珺', role: 'Research interviewer & podcast host', topic: 'Long-form interviews' },
  { name: 'Nathan Lambert', role: 'RLHF & post-training researcher', topic: 'Agents' },
  { name: 'Oier Mees', role: 'Robot learning lecturer (ETH Zürich)', topic: 'Robotics' },
  { name: '李沐', role: 'Paper-reading series host & ML systems researcher', topic: 'How to Research' },
  { name: 'Jitendra Malik', role: 'Computer vision researcher (Berkeley)', topic: 'Vision' },
  { name: 'Pieter Abbeel', role: 'Robot learning researcher & podcast host', topic: 'Robotics' },
  { name: 'Shunyu Yao', role: 'Language agents researcher', topic: 'Agents' },
  { name: 'Richard Sutton', role: 'Reinforcement learning pioneer', topic: 'Foundations' },
  { name: 'Yuke Zhu', role: 'Generalist humanoid robotics researcher', topic: 'Robotics' },
  { name: 'Simon Peyton Jones', role: 'Research writing & talks educator', topic: 'How to Research' },
  { name: 'Omar Khattab', role: 'Retrieval & LM programming researcher (DSPy)', topic: 'Agents' },
  { name: '谢赛宁', role: 'Visual representation learning researcher', topic: 'World Models' },
  { name: 'Stephen Boyd', role: 'Convex optimization lecturer (Stanford)', topic: 'Foundations' },
  { name: 'Geoffrey Hinton', role: 'Deep learning pioneer', topic: 'Foundations' },
  { name: 'Yoshua Bengio', role: 'Deep learning researcher & safety advocate', topic: 'Research Frontiers' },
  { name: 'Dawn Song', role: 'AI security & safe agents researcher', topic: 'Agents' },
  { name: 'David Ha', role: 'World models pioneer; Sakana AI co-founder', topic: 'World Models' },
  { name: 'Danijar Hafner', role: 'World models researcher (Dreamer)', topic: 'World Models' },
]

const formatOrder = ['Interview', 'Course', 'Talk']
const defaultVisibleProfiles = 8

function referencesPerson(resource, name) {
  const needle = name.toLocaleLowerCase()
  return [resource.speaker, resource.channel, resource.title]
    .filter(Boolean)
    .some((value) => value.toLocaleLowerCase().includes(needle))
}

function summarizeFormats(entries) {
  return formatOrder
    .map((format) => {
      const count = entries.filter((resource) => resource.section === format).length
      return count ? `${count} ${format.toLocaleLowerCase()}${count === 1 ? '' : 's'}` : null
    })
    .filter(Boolean)
    .join(' · ')
}

function buildProfiles(resources) {
  return profileDefinitions
    .map((definition) => {
      const entries = resources.filter((resource) => referencesPerson(resource, definition.name))
      const highlight = entries.reduce((current, resource) => (
        !current || resource.viewCount > current.viewCount ? resource : current
      ), null)
      const thumbnailResource = entries.reduce((current, resource) => {
        if (!getThumbnail(resource)) return current
        return !current || resource.viewCount > current.viewCount ? resource : current
      }, null)

      return {
        ...definition,
        entries,
        highlight,
        thumbnail: thumbnailResource ? getThumbnail(thumbnailResource) : null,
        totalViews: entries.reduce((sum, resource) => sum + (resource.viewCount || 0), 0),
        formatSummary: summarizeFormats(entries),
      }
    })
    .filter((profile) => profile.highlight)
    .sort((a, b) => b.totalViews - a.totalViews)
}

function ProfileStats({ profile, compact = false }) {
  return (
    <div className={`scholartuber-stats${compact ? ' scholartuber-stats--compact' : ''}`}>
      <span>
        <strong>{formatViews(profile.totalViews)}</strong>
        <small>indexed views</small>
      </span>
      <span>
        <strong>{profile.entries.length}</strong>
        <small>resources</small>
      </span>
    </div>
  )
}

export default function ScholarTubers({ resources, onExplore }) {
  const profiles = useMemo(() => buildProfiles(resources), [resources])
  const [expanded, setExpanded] = useState(false)
  const [featured, ...ranked] = profiles
  const remainingCount = Math.max(0, profiles.length - defaultVisibleProfiles)
  const visibleRanked = expanded ? ranked : ranked.slice(0, defaultVisibleProfiles - 1)

  function toggleDirectory() {
    setExpanded((isExpanded) => !isExpanded)
    if (expanded) {
      requestAnimationFrame(() => {
        document.querySelector('#scholartubers')?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }

  if (!featured) return null

  return (
    <section className="scholartubers" id="scholartubers" aria-labelledby="scholartubers-title">
      <div className="shell">
        <div className="scholartubers-heading">
          <div>
            <p className="section-kicker">ScholarTubers</p>
            <h2 id="scholartubers-title">People worth following.</h2>
          </div>
          <div className="scholartubers-heading__copy">
            <p>The researchers, builders, and interviewers most watched across the ScholarTube index.</p>
            <small>{profiles.length} people · ranked by total indexed views · snapshots vary by source</small>
          </div>
        </div>

        <div className="scholartubers-layout">
          <article className="scholartuber-feature">
            {featured.thumbnail && <img className="scholartuber-feature__image" src={featured.thumbnail} alt="" />}
            <div className="scholartuber-feature__shade" aria-hidden="true" />
            <div className="scholartuber-feature__content">
              <span className="scholartuber-feature__rank">01</span>
              <div>
                <h3>{featured.name}</h3>
                <p className="scholartuber-role">{featured.role}</p>
              </div>
              <ProfileStats profile={featured} />
              <span className="scholartuber-topic">{featured.topic}</span>
              <div className="scholartuber-highlight">
                <span>Most watched in the index</span>
                <strong>{featured.highlight.title}</strong>
                <small>{featured.formatSummary}</small>
              </div>
              <div className="scholartuber-feature__actions">
                <button type="button" onClick={() => onExplore(featured.name)}>
                  Explore {featured.name}<ArrowIcon />
                </button>
                <a href={featured.highlight.url} target="_blank" rel="noreferrer">
                  Watch highlight<ExternalIcon />
                </a>
              </div>
            </div>
          </article>

          <div className="scholartuber-directory">
            <ol className="scholartuber-list" id="scholartuber-directory-list" start="2">
              {visibleRanked.map((profile, index) => (
                <li key={profile.name}>
                  <span className="scholartuber-list__rank">{String(index + 2).padStart(2, '0')}</span>
                  <a
                    className="scholartuber-list__media"
                    href={profile.highlight.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Watch ${profile.name}'s highlighted resource at source`}
                  >
                    {profile.thumbnail && <img src={profile.thumbnail} alt="" loading="lazy" />}
                    <span><PlayIcon /></span>
                  </a>
                  <div className="scholartuber-list__identity">
                    <h3>{profile.name}</h3>
                    <p>{profile.role}</p>
                    <small>{profile.topic} · {profile.formatSummary}</small>
                  </div>
                  <ProfileStats profile={profile} compact />
                  <div className="scholartuber-list__actions">
                    <button type="button" onClick={() => onExplore(profile.name)}>
                      Explore<ArrowIcon />
                    </button>
                    <a href={profile.highlight.url} target="_blank" rel="noreferrer">
                      Watch highlight<ExternalIcon />
                    </a>
                  </div>
                </li>
              ))}
            </ol>
            {remainingCount > 0 && (
              <button
                className={`scholartuber-directory__toggle${expanded ? ' is-expanded' : ''}`}
                type="button"
                aria-expanded={expanded}
                aria-controls="scholartuber-directory-list"
                onClick={toggleDirectory}
              >
                <span>{expanded ? `Showing all ${profiles.length} people` : `${remainingCount} more people in the index`}</span>
                <strong>{expanded ? 'Show fewer' : `Show all ${profiles.length}`}<ArrowIcon /></strong>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
