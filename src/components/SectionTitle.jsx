export function SectionTitle({ label, title, intro, level = 'h2' }) {
  const Heading = level

  return (
    <div className="section-title">
      <span>{label}</span>
      <Heading>{title}</Heading>
      {intro ? <p>{intro}</p> : null}
    </div>
  )
}
