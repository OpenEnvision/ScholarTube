import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { buildConceptMap } from '../concept-map'
import { formatDuration } from '../resource-utils'

const HUB_RADIUS = 320
const TIER_BASE = 660
const TIER_STEP = 275
const ZOOM_RANGE = [0.08, 3.2]
const CLICK_SLOP = 4
const DEFAULT_ZOOM = 0.6
const FOCUS_ZOOM = 1.05
const FLIGHT_MS = 620

const CLUSTER_KEY = (id) => id.replace(/\s+/g, '-')

function conceptDotSize(count) {
  return Math.min(19, 7 + Math.sqrt(count) * 1.15)
}

function layoutSkillTree(map, offsets) {
  const nodes = []
  const byId = new Map()
  const shift = (id) => offsets[id] || { dx: 0, dy: 0 }

  const root = { id: 'index', kind: 'index', label: 'ScholarTube', total: map.total, x: shift('index').dx, y: shift('index').dy, angle: 0 }
  nodes.push(root)
  byId.set(root.id, root)

  const slice = (Math.PI * 2) / map.clusters.length
  map.clusters.forEach((cluster, index) => {
    const axis = -Math.PI / 2 + slice * index
    const hubShift = shift(`cluster:${cluster.id}`)
    const hub = {
      id: `cluster:${cluster.id}`,
      kind: 'cluster',
      cluster,
      clusterId: cluster.id,
      label: cluster.label,
      x: root.x + Math.cos(axis) * HUB_RADIUS + hubShift.dx,
      y: root.y + Math.sin(axis) * HUB_RADIUS + hubShift.dy,
      angle: axis,
    }
    nodes.push(hub)
    byId.set(hub.id, hub)

    const rows = new Map()
    cluster.concepts.forEach((concept) => {
      const tier = concept.tier || 0
      if (!rows.has(tier)) rows.set(tier, [])
      rows.get(tier).push(concept)
    })

    const span = slice * 0.92
    ;[...rows.keys()].sort((a, b) => a - b).forEach((tier) => {
      const row = rows.get(tier)
      // Order each ring by where its parents sit, so the branch fans out
      // without its own links crossing each other.
      row.sort((a, b) => parentAngle(a, byId, axis) - parentAngle(b, byId, axis))
      const radius = TIER_BASE + tier * TIER_STEP
      row.forEach((concept, position) => {
        const angle = row.length === 1 ? axis : axis - span / 2 + (span * (position + 0.5)) / row.length
        const own = shift(concept.id)
        const node = {
          id: concept.id,
          kind: 'concept',
          concept,
          cluster,
          clusterId: cluster.id,
          label: concept.label,
          tier,
          angle,
          x: root.x + Math.cos(angle) * radius + own.dx,
          y: root.y + Math.sin(angle) * radius + own.dy,
        }
        nodes.push(node)
        byId.set(node.id, node)
      })
    })
  })

  const links = []
  map.clusters.forEach((cluster) => {
    const hub = byId.get(`cluster:${cluster.id}`)
    links.push({ id: `index->${cluster.id}`, kind: 'spine', from: byId.get('index'), to: hub, clusterId: cluster.id })
    cluster.concepts.forEach((concept) => {
      const node = byId.get(concept.id)
      const insideParents = (concept.after || []).filter((id) => byId.get(id)?.clusterId === cluster.id)
      if (!insideParents.length) links.push({ id: `${cluster.id}->${concept.id}`, kind: 'start', from: hub, to: node, clusterId: cluster.id })
    })
  })
  map.links.forEach((link) => {
    const from = byId.get(link.from)
    const to = byId.get(link.to)
    if (!from || !to) return
    links.push({
      id: link.id,
      kind: from.clusterId === to.clusterId ? 'next' : 'bridge',
      from,
      to,
      clusterId: to.clusterId,
    })
  })

  return { nodes, links }
}

function parentAngle(concept, byId, fallback) {
  const parents = (concept.after || []).map((id) => byId.get(id)).filter(Boolean)
  if (!parents.length) return fallback
  return parents.reduce((total, parent) => total + parent.angle, 0) / parents.length
}

function radiusOf(node) {
  if (node.kind === 'index') return 22
  if (node.kind === 'cluster') return 17
  return conceptDotSize(node.concept.count)
}

// Every link ends in an arrowhead, so the picture states a direction rather
// than leaving the reader to guess what a line between two dots means.
function linkPath(link) {
  const { from, to } = link
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const control = link.kind === 'bridge'
    ? { x: midX - (to.y - from.y) * 0.16, y: midY + (to.x - from.x) * 0.16 }
    : { x: midX * 1.05, y: midY * 1.05 }

  const gap = radiusOf(to) + 11
  const tx = to.x - control.x
  const ty = to.y - control.y
  const length = Math.hypot(tx, ty) || 1
  const endX = to.x - (tx / length) * gap
  const endY = to.y - (ty / length) * gap
  return `M${from.x} ${from.y} Q${control.x} ${control.y} ${endX} ${endY}`
}

export default function PathGraph({ resources, activeCluster, onConcept, onCluster, onIndex, onOpen }) {
  const svgRef = useRef(null)
  const frameRef = useRef(null)
  const gestureRef = useRef(null)
  const flightRef = useRef(0)
  const fitted = useRef(false)
  const [selectedId, setSelectedId] = useState(null)
  const [offsets, setOffsets] = useState({})
  const [view, setView] = useState({ x: 0, y: 0, k: DEFAULT_ZOOM })
  const [hover, setHover] = useState(null)
  const [size, setSize] = useState({ width: 1200, height: 700 })

  // One graph unit must stay one screen pixel at zoom 1: a viewBox that does
  // not match the frame silently shrinks every dot and label to fit.
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined
    const measure = () => {
      const rect = frame.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      setSize((current) => (
        Math.abs(current.width - rect.width) < 1 && Math.abs(current.height - rect.height) < 1
          ? current
          : { width: rect.width, height: rect.height }
      ))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const map = useMemo(() => buildConceptMap(resources), [resources])
  const { nodes, links } = useMemo(() => layoutSkillTree(map, offsets), [map, offsets])
  const conceptCount = nodes.filter((node) => node.kind === 'concept').length
  const selected = useMemo(() => nodes.find((node) => node.id === selectedId) || null, [nodes, selectedId])
  const steps = useMemo(() => {
    if (!selected) return { before: [], after: [] }
    return {
      before: links.filter((link) => link.to.id === selected.id && link.kind !== 'spine').map((link) => link.from),
      after: links.filter((link) => link.from.id === selected.id && link.kind !== 'spine').map((link) => link.to),
    }
  }, [links, selected])
  const neighbourIds = useMemo(() => new Set([...steps.before, ...steps.after].map((node) => node.id)), [steps])

  const toGraphPoint = useCallback((event) => {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (!matrix) return { x: 0, y: 0 }
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const local = point.matrixTransform(matrix.inverse())
    return { x: local.x, y: local.y }
  }, [])

  // Travelling between topics is the point of the map, so the camera moves
  // rather than cutting: you watch which way you went and how far.
  function flyView(target, duration = FLIGHT_MS) {
    cancelAnimationFrame(flightRef.current)
    const start = view
    const instant = duration === 0 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (instant) {
      setView(target)
      return
    }
    const startedAt = performance.now()
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
      setView({
        x: start.x + (target.x - start.x) * eased,
        y: start.y + (target.y - start.y) * eased,
        k: start.k + (target.k - start.k) * eased,
      })
      if (progress < 1) flightRef.current = requestAnimationFrame(step)
    }
    flightRef.current = requestAnimationFrame(step)
  }

  function flyToNode(node, zoom = FOCUS_ZOOM) {
    const k = Math.max(zoom, ZOOM_RANGE[0])
    flyView({ k, x: -node.x * k, y: -node.y * k })
    setSelectedId(node.id)
    setHover(null)
  }

  function flyToId(id) {
    const node = nodes.find((entry) => entry.id === id)
    if (node) flyToNode(node)
  }

  useEffect(() => () => cancelAnimationFrame(flightRef.current), [])

  function beginGesture(event, node) {
    if (event.button === 2) return
    if (node) event.stopPropagation()
    cancelAnimationFrame(flightRef.current)
    const point = toGraphPoint(event)
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // A synthetic pointer that never had capture is fine to drag without it.
    }
    gestureRef.current = {
      pointerId: event.pointerId,
      node: node || null,
      startClient: { x: event.clientX, y: event.clientY },
      startPoint: point,
      startView: view,
      startOffset: node ? offsets[node.id] || { dx: 0, dy: 0 } : null,
      moved: false,
    }
  }

  function moveGesture(event) {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    if (!gesture.moved && Math.hypot(event.clientX - gesture.startClient.x, event.clientY - gesture.startClient.y) < CLICK_SLOP) return
    gesture.moved = true
    const point = toGraphPoint(event)

    if (gesture.node) {
      const scale = gesture.startView.k || 1
      setOffsets((current) => ({
        ...current,
        [gesture.node.id]: {
          dx: gesture.startOffset.dx + (point.x - gesture.startPoint.x) / scale,
          dy: gesture.startOffset.dy + (point.y - gesture.startPoint.y) / scale,
        },
      }))
      return
    }

    setView({
      ...gesture.startView,
      x: gesture.startView.x + (point.x - gesture.startPoint.x),
      y: gesture.startView.y + (point.y - gesture.startPoint.y),
    })
  }

  function endGesture(event) {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    gestureRef.current = null
    if (!gesture.moved && gesture.node) flyToNode(gesture.node)
  }

  // Wheel zoom needs a non-passive listener, which React's onWheel is not.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return undefined
    const listener = (event) => {
      event.preventDefault()
      const anchor = toGraphPoint(event)
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
      setView((current) => {
        const k = Math.min(ZOOM_RANGE[1], Math.max(ZOOM_RANGE[0], current.k * factor))
        if (k === current.k) return current
        return {
          k,
          x: anchor.x - ((anchor.x - current.x) * k) / current.k,
          y: anchor.y - ((anchor.y - current.y) * k) / current.k,
        }
      })
    }
    svg.addEventListener('wheel', listener, { passive: false })
    return () => svg.removeEventListener('wheel', listener)
  }, [toGraphPoint])

  function fitView() {
    const spanX = Math.max(...nodes.map((node) => Math.abs(node.x)), 1) * 2 + 320
    const spanY = Math.max(...nodes.map((node) => Math.abs(node.y)), 1) * 2 + 160
    const fit = Math.min(size.width / spanX, size.height / spanY, 1)
    flyView({ x: 0, y: 0, k: Math.max(ZOOM_RANGE[0], fit) }, 760)
    setOffsets({})
  }

  // A branch is far wider than the frame on purpose, so give the reader a way
  // to fly to one instead of hunting for it by dragging.
  function flyToBranch(clusterId) {
    const branch = nodes.filter((node) => node.clusterId === clusterId)
    if (!branch.length) return
    const cx = branch.reduce((total, node) => total + node.x, 0) / branch.length
    const cy = branch.reduce((total, node) => total + node.y, 0) / branch.length
    const k = 0.5
    flyView({ k, x: -cx * k, y: -cy * k }, 760)
    setSelectedId(`cluster:${clusterId}`)
  }

  useEffect(() => {
    if (fitted.current || !nodes.length) return
    fitted.current = true
    setView({ x: 0, y: 0, k: DEFAULT_ZOOM })
  }, [nodes])

  function showHover(node, event) {
    const frame = frameRef.current
    if (!frame) return
    const box = frame.getBoundingClientRect()
    const anchor = event.clientX ? { x: event.clientX, y: event.clientY } : (() => {
      const rect = event.currentTarget.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    })()
    setHover({ node, x: anchor.x - box.left, y: anchor.y - box.top })
  }

  const hasHover = Boolean(hover)
  useEffect(() => {
    if (!hasHover) return undefined
    const clear = () => setHover(null)
    window.addEventListener('scroll', clear, true)
    return () => window.removeEventListener('scroll', clear, true)
  }, [hasHover])

  return (
    <div className="path-graph">
      <div className="path-graph__bar">
        <div>
          <p className="mini-label">Skill tree</p>
          <p className="path-graph__lede">{conceptCount} topics, with prerequisites nearer the centre. Click a dot and the map travels to it; then follow an arrow outward to what builds on it.</p>
        </div>
        <div className="path-graph__legend">
          <span className="is-next"><svg viewBox="0 0 44 12" aria-hidden="true"><path d="M2 6h30" /><path d="m32 2 8 4-8 4z" className="head" /></svg> Then learn</span>
          <span className="is-bridge"><svg viewBox="0 0 44 12" aria-hidden="true"><path d="M2 6h30" strokeDasharray="5 4" /><path d="m32 2 8 4-8 4z" className="head" /></svg> From another branch</span>
          <span className="is-size">Dot size = sources in the index</span>
        </div>
      </div>

      <div className="path-graph__branches" role="group" aria-label="Jump to a branch">
        <button type="button" onClick={() => { flyView({ x: 0, y: 0, k: DEFAULT_ZOOM }); setSelectedId(null) }}>Centre</button>
        {map.clusters.map((cluster) => (
          <button
            key={cluster.id}
            type="button"
            className={cluster.id === activeCluster ? 'is-active' : ''}
            style={{ '--branch': `var(--branch-${CLUSTER_KEY(cluster.id)})` }}
            onClick={() => flyToBranch(cluster.id)}
          >
            <i aria-hidden="true" />{cluster.label}<small>{cluster.concepts.length}</small>
          </button>
        ))}
        <span className="path-graph__zoom">
          <button type="button" aria-label="Zoom out" onClick={() => setView((current) => ({ ...current, k: Math.max(ZOOM_RANGE[0], current.k / 1.25) }))}>−</button>
          <button type="button" aria-label="Zoom in" onClick={() => setView((current) => ({ ...current, k: Math.min(ZOOM_RANGE[1], current.k * 1.25) }))}>+</button>
          <button type="button" onClick={fitView}>Whole tree</button>
        </span>
      </div>

      <div className="path-graph__frame" ref={frameRef}>
        <svg
          ref={svgRef}
          className="path-graph__svg"
          viewBox={`${-size.width / 2} ${-size.height / 2} ${size.width} ${size.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="application"
          aria-label="Skill tree of the topics in the index"
          onPointerDown={(event) => beginGesture(event, null)}
          onPointerMove={moveGesture}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
        >
          <defs>
            {map.clusters.map((cluster) => (
              <marker key={cluster.id} id={`arrow-${CLUSTER_KEY(cluster.id)}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M0 0.5 L10 5 L0 9.5 z" fill={`var(--branch-${CLUSTER_KEY(cluster.id)})`} />
              </marker>
            ))}
          </defs>
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {links.map((link) => {
              const linked = selectedId && (link.from.id === selectedId || link.to.id === selectedId)
              return (
                <path
                  key={link.id}
                  d={linkPath(link)}
                  className={`graph-link graph-link--${link.kind} ${linked ? 'is-linked' : ''} ${link.clusterId === activeCluster ? 'is-active' : ''}`}
                  style={{
                    stroke: `var(--branch-${CLUSTER_KEY(link.clusterId)})`,
                    markerEnd: link.kind === 'spine' ? undefined : `url(#arrow-${CLUSTER_KEY(link.clusterId)})`,
                  }}
                />
              )
            })}
            {nodes.map((node) => (
              <GraphNode
                key={node.id}
                node={node}
                zoom={view.k}
                isSelected={node.id === selectedId}
                isNeighbour={Boolean(selectedId) && neighbourIds.has(node.id)}
                isActive={node.kind === 'index' || node.clusterId === activeCluster}
                onPointerDown={(event) => beginGesture(event, node)}
                onPointerMove={(event) => { event.stopPropagation(); moveGesture(event) }}
                onPointerUp={(event) => { event.stopPropagation(); endGesture(event) }}
                onEnter={(event) => showHover(node, event)}
                onLeave={() => setHover(null)}
                onActivate={() => flyToNode(node)}
              />
            ))}
          </g>
        </svg>

        {hover && hover.node.id !== selectedId ? <GraphTooltip node={hover.node} x={hover.x} y={hover.y} /> : null}

        {selected ? (
          <SelectedCard
            node={selected}
            steps={steps}
            onTravel={flyToId}
            onOpen={onOpen}
            onIndex={() => (selected.kind === 'concept' ? onConcept(selected.concept) : selected.kind === 'cluster' ? onCluster(selected.cluster) : onIndex())}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </div>
    </div>
  )
}

function GraphNode({ node, zoom, isActive, isSelected, isNeighbour, onPointerDown, onPointerMove, onPointerUp, onEnter, onLeave, onActivate }) {
  const radius = radiusOf(node)
  const flip = Math.cos(node.angle ?? 0) < 0 && node.kind !== 'index'
  // Zoomed far out the whole tree fits but its text would not be readable, so
  // topic labels step aside and the branch names hold their size instead.
  const showLabel = node.kind !== 'concept' || zoom >= 0.34 || isSelected || isNeighbour
  // Labels keep roughly their own size as you zoom out, until they are dropped.
  const labelScale = Math.min(1 / zoom, node.kind === 'concept' ? 1.9 : 3)
  const describe = node.kind === 'concept'
    ? `${node.label}, ${node.concept.count} sources. Press enter to show them in the index.`
    : node.kind === 'cluster'
      ? `${node.label} branch. Press enter to show it in the index.`
      : 'The whole index. Press enter to browse everything.'

  return (
    <g
      className={`graph-node graph-node--${node.kind} ${isActive ? 'is-active-branch' : 'is-dim'} ${isSelected ? 'is-selected' : ''} ${isNeighbour ? 'is-neighbour' : ''}`}
      style={node.clusterId ? { '--branch': `var(--branch-${CLUSTER_KEY(node.clusterId)})` } : undefined}
      transform={`translate(${node.x} ${node.y})`}
      tabIndex={0}
      role="button"
      aria-label={describe}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onActivate()
      }}
    >
      <circle className="graph-node__hit" r={Math.max(radius + 12, 20)} />
      {isSelected ? <circle className="graph-node__halo" r={radius + 13} /> : null}
      <circle className="graph-node__dot" r={radius} />
      {node.kind !== 'concept' ? <circle className="graph-node__core" r={radius / 2.8} /> : null}
      {node.kind === 'concept' && (zoom >= 0.42 || isSelected || isNeighbour) ? <text className="graph-node__count" y={4} textAnchor="middle">{node.concept.count}</text> : null}
      {showLabel ? (
        <text
          className="graph-node__label"
          transform={labelScale === 1 ? undefined : `scale(${labelScale})`}
          x={(node.kind === 'index' ? 0 : flip ? -(radius + 11) : radius + 11) / labelScale}
          y={(node.kind === 'index' ? -radius - 14 : 5) / labelScale}
          textAnchor={node.kind === 'index' ? 'middle' : flip ? 'end' : 'start'}
        >
          {node.label}
        </text>
      ) : null}
    </g>
  )
}

// The card is where travel continues: it names where you are and offers the
// dots one step back and one step on, each a flight away.
function SelectedCard({ node, steps, onTravel, onOpen, onIndex, onClose }) {
  const concept = node.kind === 'concept' ? node.concept : null
  const kicker = concept
    ? `${concept.clusterLabel} · ring ${node.tier + 1} · ${concept.count} sources`
    : node.kind === 'cluster'
      ? `Branch · ${node.cluster.count} sources`
      : `The whole index · ${node.total} sources`

  return (
    <div className="graph-card">
      <button type="button" className="graph-card__close" onClick={onClose} aria-label="Close">×</button>
      <p className="graph-card__kicker">{kicker}</p>
      <strong>{node.label}</strong>
      <p className="graph-card__blurb">{concept?.blurb || node.cluster?.blurb || 'Every branch of the index grows from this centre. Pick one and follow its rings outward.'}</p>

      {steps.before.length ? (
        <div className="graph-card__row">
          <span>Comes after</span>
          <div>{steps.before.map((step) => <button type="button" key={step.id} onClick={() => onTravel(step.id)}>← {step.label}</button>)}</div>
        </div>
      ) : null}
      {steps.after.length ? (
        <div className="graph-card__row">
          <span>Then</span>
          <div>{steps.after.map((step) => <button type="button" key={step.id} onClick={() => onTravel(step.id)}>{step.label} →</button>)}</div>
        </div>
      ) : null}

      {concept?.top?.length ? (
        <ul className="graph-card__list">
          {concept.top.map((resource) => (
            <li key={resource.id}>
              <button type="button" onClick={() => onOpen(resource)}>
                <b>{resource.title}</b>
                <span>{resource.speaker} · {formatDuration(resource.durationMinutes)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <button type="button" className="graph-card__index" onClick={onIndex}>
        {concept ? `Show all ${concept.count} in the index` : node.kind === 'cluster' ? `Show all ${node.cluster.count} in the index` : 'Browse the whole index'}
      </button>
    </div>
  )
}

function tooltipBody(node) {
  if (node.kind === 'index') {
    return (
      <>
        <p className="graph-tip__kicker">The whole index</p>
        <strong>ScholarTube</strong>
        <p className="graph-tip__meta">{node.total} verified sources.</p>
        <p className="graph-tip__hint">Click to travel back to the centre</p>
      </>
    )
  }

  if (node.kind === 'cluster') {
    return (
      <>
        <p className="graph-tip__kicker">Branch · {node.cluster.count} sources</p>
        <strong>{node.label}</strong>
        <p className="graph-tip__meta">{node.cluster.blurb}</p>
        <p className="graph-tip__meta">{node.cluster.concepts.length} topics grow out of this branch.</p>
        <p className="graph-tip__hint">Click to travel to this branch</p>
      </>
    )
  }

  const concept = node.concept
  return (
    <>
      <p className="graph-tip__kicker">{concept.clusterLabel} · ring {node.tier + 1} · {concept.count} sources</p>
      <strong>{concept.label}</strong>
      <p className="graph-tip__meta">{concept.blurb}</p>
      <p className="graph-tip__hint">Click to travel here</p>
    </>
  )
}

function GraphTooltip({ node, x, y }) {
  const tipRef = useRef(null)
  const [placement, setPlacement] = useState(null)

  // The frame clips its overflow, so the card is measured and pulled back
  // inside it rather than trusting the cursor to be far from an edge.
  useLayoutEffect(() => {
    const tip = tipRef.current
    const frame = tip?.parentElement
    if (!tip || !frame) return
    const width = tip.offsetWidth
    const height = tip.offsetHeight
    const left = x + 20 + width > frame.clientWidth - 10 ? x - 20 - width : x + 20
    setPlacement({
      left: Math.max(10, Math.min(left, frame.clientWidth - width - 10)),
      top: Math.max(10, Math.min(y - height / 2, frame.clientHeight - height - 10)),
    })
  }, [node, x, y])

  return (
    <div
      ref={tipRef}
      className="graph-tip"
      role="tooltip"
      style={placement ? { left: placement.left, top: placement.top } : { left: x + 20, top: y, visibility: 'hidden' }}
    >
      {tooltipBody(node)}
    </div>
  )
}
