import { useState } from 'react'

function EditorialLeadVisual({ issue, size }) {
  const [imageFailed, setImageFailed] = useState(false)
  const media = issue.media?.[0]

  if (media?.kind === 'image' && !imageFailed) {
    return (
      <a
        className={`wonder-visual editorial-lead-image visual-${size}`}
        href={media.sourceUrl}
        rel="noreferrer"
        target="_blank"
        aria-label={`查看 ${issue.title} 的核心图像原件`}
      >
        <img
          alt={media.alt || issue.title}
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={media.src}
        />
      </a>
    )
  }

  return (
    <div className={`wonder-visual editorial-lead-placeholder visual-${size}`}>
      <span className="editorial-lead-kicker">
        {media?.kind === 'audio' ? 'AUDIO / CLOSE LISTEN' : issue.issueTypeLabel}
      </span>
      <strong>{issue.coreQuestion || issue.title}</strong>
      <span className="editorial-lead-note">
        {imageFailed
          ? '核心图像当前未能加载；详情页保留原件出口。'
          : '这一期从对象、来源与证据边界出发，不使用固定栏目模板。'}
      </span>
    </div>
  )
}

export function WonderVisual({ issue, size = 'default' }) {
  if (issue.schemaVersion === 2) {
    return <EditorialLeadVisual issue={issue} size={size} />
  }

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
