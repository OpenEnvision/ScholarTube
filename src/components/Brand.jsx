export default function Brand({ inverse = false }) {
  return (
    <span className={`brand ${inverse ? 'brand--inverse' : ''}`}>
      <img className="brand__mark" src="./assets/scholartube-logo.png" alt="" aria-hidden="true" />
      <span className="brand__word">ScholarTube</span>
    </span>
  )
}
