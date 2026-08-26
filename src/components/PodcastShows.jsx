import { useMemo } from 'react'
import { ArrowIcon } from '../icons'
import { formatDuration, formatViews, getDisplayTopic } from '../resource-utils'
import { buildSeriesIntro } from '../resource-detail-utils'

// Local copy of the podcast heuristic, duplicated from resource-detail-utils.js
// on purpose so resource-utils.js stays untouched. Keep both copies aligned:
// podcast if format/seriesTitle/channel matches /podcast/i, or title/channel contains 播客.
function isPodcastResource(resource) {
  return (
    /podcast/i.test(resource.format || '') ||
    /podcast/i.test(resource.seriesTitle || '') ||
    /podcast/i.test(resource.channel || '') ||
    (resource.title || '').includes('播客') ||
    (resource.channel || '').includes('播客')
  )
}

// Hand-written introductions for the shows the index knows well. Everything
// else falls back to the generated series introduction.
const knownShows = [
  {
    match: /lex fridman podcast/i,
    host: 'Lex Fridman',
    intro: 'Multi-hour conversations in which researchers and lab leaders reason from first principles — careers, failed bets, and where their views split from the field’s. The ScholarTube selection favors working scientists over celebrity rounds: Karpathy on autonomy, Hassabis on simulation, vision and robotics researchers on their own subfields. Long enough that positions get tested, not just stated.',
  },
  {
    match: /robot brains/i,
    host: 'Pieter Abbeel',
    intro: 'Pieter Abbeel — a robot-learning researcher himself — interviews the people building embodied AI, so the questions come from inside the field. Guests range from Ilya Sutskever and Geoffrey Hinton to founders shipping warehouse robots. The strongest episodes double as an oral history of the last decade of robot learning.',
  },
  {
    match: /twiml/i,
    host: 'Sam Charrington',
    intro: 'Sam Charrington’s long-running interview series treats machine learning as a working discipline: one guest, one body of research, an hour of specifics. The indexed episodes go deep on robot foundation models, self-driving stacks, and interpretability with the researchers responsible for them. A reliable way to hear how published work actually gets built and evaluated.',
  },
  {
    match: /no priors/i,
    host: 'Sarah Guo & Elad Gil',
    intro: 'Sarah Guo and Elad Gil interview researchers and founders at the frontier of AI, with an investor’s instinct for the questions that decide what gets built next. Episodes run tighter than most research podcasts, but with guests like Andrej Karpathy the density holds. Useful for calibrating where research and industry actually meet.',
  },
  {
    match: /latent space/i,
    host: 'swyx & Alessio Fanelli',
    intro: 'An AI-engineering show aimed at the people wiring models into real products. Conversations stay concrete — evaluations, infrastructure, agent scaffolding, and what changed since the last model release. Indexed for the episodes where the technical detail outlives the news cycle.',
  },
  {
    match: /十字路口/,
    host: null,
    intro: 'A Chinese-language video podcast interviewing the founders and researchers building China’s AI companies, from frontier-model labs to infrastructure startups. Conversations run technical and candid: model road maps, compute constraints, and where the bets diverge. One of the better first-person records of China’s AI ecosystem in motion.',
  },
  {
    match: /张小珺/,
    host: '张小珺',
    intro: 'Zhang Xiaojun’s interview program is known for preparation and patience: single conversations that can run from three to seven hours and read like oral histories of AI research. The indexed marathon with Saining Xie covers world models, representation learning, and research taste in unusual depth. Chinese-language, and worth the runtime for anyone studying how researchers actually think.',
  },
  {
    match: /漫谈播客集/,
    host: '卫诗婕',
    intro: 'Wei Shijie’s long-form Chinese interviews sit with one researcher at a time — Yuandong Tian on the real problems of large models, embodied-AI researchers on why current recipes are not the answer. The show favors people mid-career and mid-decision, which keeps the reasoning fresher than retrospectives. Episodes routinely pass the two-hour mark and earn it.',
  },
  {
    match: /硅谷101/,
    host: null,
    intro: 'A Chinese-language conversation series from Silicon Valley 101 that pairs journalists with the engineers and researchers inside frontier AI companies. The indexed episodes dig into infrastructure, open source, and lab culture with practitioners speaking from direct experience. A useful bridge between the English-language discourse and China’s reading of it.',
  },
]

function buildShows(resources) {
  const groups = new Map()
  resources.filter(isPodcastResource).forEach((resource) => {
    const key = resource.seriesId || resource.channel
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(resource)
  })

  const shows = [...groups.values()].map((episodes) => {
    const title = episodes[0].seriesTitle || episodes[0].channel
    const known = knownShows.find((entry) => entry.match.test(title))
    const channels = [...new Set(episodes.map((resource) => resource.channel).filter(Boolean))]
    const focusCounts = new Map()
    episodes.forEach((resource) => {
      const topic = getDisplayTopic(resource)
      focusCounts.set(topic, (focusCounts.get(topic) || 0) + 1)
    })

    return {
      title,
      isKnown: Boolean(known),
      host: known?.host || (channels.length === 1 && channels[0] !== title ? channels[0] : null),
      intro: known?.intro || buildSeriesIntro({ title, resources: episodes }),
      episodes,
      languages: [...new Set(episodes.map((resource) => resource.language).filter(Boolean))],
      focusAreas: [...focusCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([topic]) => topic),
      totalViews: episodes.reduce((total, resource) => total + (resource.viewCount || 0), 0),
      totalMinutes: episodes.reduce((total, resource) => total + resource.durationMinutes, 0),
    }
  })

  const featured = shows
    .filter((show) => show.episodes.length >= 2 || show.isKnown)
    .sort((a, b) => b.episodes.length - a.episodes.length || b.totalViews - a.totalViews)

  return {
    featured,
    singleShowCount: shows.length - featured.length,
    episodeCount: shows.reduce((total, show) => total + show.episodes.length, 0),
  }
}

export default function PodcastShows({ resources, onExplore }) {
  const { featured, singleShowCount, episodeCount } = useMemo(() => buildShows(resources), [resources])

  if (!featured.length) return null

  return (
    <section className="podcast-shows" id="podcast-shows" aria-labelledby="podcast-shows-title">
      <div className="shell">
        <div className="podcast-shows-heading">
          <div>
            <p className="section-kicker">Podcast shows</p>
            <h2 id="podcast-shows-title">Shows worth subscribing to.</h2>
          </div>
          <div className="podcast-shows-heading__copy">
            <p>
              Research often surfaces in conversation years before it reaches textbooks.
              ScholarTube indexes podcasts the way it indexes lectures: researcher guests,
              long-form formats, canonical uploads — selected for what they teach, not for
              release-week noise.
            </p>
            <small>{featured.length} shows · {episodeCount} episodes indexed · every link points to the original host</small>
          </div>
        </div>

        <div className="podcast-show-grid">
          {featured.map((show, index) => (
            <article className="podcast-show-card" key={show.title}>
              <div className="podcast-show-card__top">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{show.episodes.length} {show.episodes.length === 1 ? 'episode' : 'episodes'} · {formatDuration(show.totalMinutes)}</span>
              </div>
              <h3>
                <button type="button" onClick={() => onExplore(show.title)}>{show.title}</button>
              </h3>
              {show.host ? <p className="podcast-show-card__host">Hosted by {show.host}</p> : null}
              <p className="podcast-show-card__intro">{show.intro}</p>
              <div className="podcast-show-card__facts">
                <span>{show.languages.join(' + ')}</span>
                <span>{show.focusAreas.join(' · ')}</span>
                <span>{formatViews(show.totalViews)} views</span>
              </div>
              <button type="button" className="podcast-show-card__action" onClick={() => onExplore(show.title)}>
                Browse episodes in the library <ArrowIcon />
              </button>
            </article>
          ))}
        </div>

        {singleShowCount > 0 ? (
          <p className="podcast-shows-foot">
            Plus {singleShowCount} more {singleShowCount === 1 ? 'show' : 'shows'} indexed as single
            episodes — search the library by show or guest name to find them.
          </p>
        ) : null}
      </div>
    </section>
  )
}
