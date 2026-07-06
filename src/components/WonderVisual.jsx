export function WonderVisual({ issue, size = 'default' }) {
  const variant = issue.visual.variant

  return (
    <div className={`wonder-visual visual-${variant} visual-${size}`}>
      <div className="visual-orbit" aria-hidden="true"></div>
      <div className="visual-window" aria-hidden="true">
        <span></span>
        <span></span>
      </div>
      <svg viewBox="0 0 360 240" role="img" aria-label={`${issue.title} 的原创抽象视觉`}>
        <path className="line line-a" d="M38 176 C98 102 142 92 184 128 S264 184 322 82" />
        <path className="line line-b" d="M54 68 C114 116 178 44 232 86 S288 154 330 130" />
        <path className="line line-c" d="M86 206 C128 156 156 152 190 172 S244 214 292 178" />
        <circle className="dot dot-a" cx="110" cy="98" r="5" />
        <circle className="dot dot-b" cx="236" cy="86" r="4" />
        <circle className="dot dot-c" cx="284" cy="176" r="6" />
      </svg>
    </div>
  )
}
