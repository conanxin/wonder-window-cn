import { LegacyIssueDetail } from './LegacyIssueDetail.jsx'

function EditorialMedia({ media }) {
  if (media.kind === 'audio') {
    return (
      <figure className="editorial-media editorial-media-audio">
        <audio controls preload="metadata" src={media.src}>
          你的浏览器不支持音频播放。可以直接打开来源链接。
        </audio>
        <figcaption>
          <span>{media.caption}</span>
          <a href={media.sourceUrl} rel="noreferrer" target="_blank">
            回到原件
          </a>
          <span className="rights-chip">{media.rightsStatus}</span>
        </figcaption>
      </figure>
    )
  }

  return (
    <figure className="editorial-media">
      <a href={media.sourceUrl} rel="noreferrer" target="_blank">
        <img alt={media.alt} loading="lazy" src={media.src} />
      </a>
      <figcaption>
        <span>{media.caption}</span>
        <a href={media.sourceUrl} rel="noreferrer" target="_blank">
          回到原件
        </a>
        <span className="rights-chip">{media.rightsStatus}</span>
      </figcaption>
    </figure>
  )
}

function EditorialIssueDetail({ issue }) {
  return (
    <article className="issue-detail editorial-issue">
      <header className="issue-detail-header editorial-header">
        <div>
          <div className="editorial-kickers">
            <span className="issue-number">{issue.number}</span>
            <span className="issue-type-chip">{issue.issueTypeLabel}</span>
            {issue.publicationStatus !== 'PUBLISHED' ? (
              <span className="status-chip">{issue.publicationStatus}</span>
            ) : null}
          </div>
          <h1>{issue.title}</h1>
          <div className="detail-meta">
            <span>{issue.date}</span>
            <span>{issue.readingTime}</span>
          </div>
        </div>
        <div>
          <p>{issue.summary}</p>
          <p className="core-question">{issue.coreQuestion}</p>
        </div>
      </header>

      <section className="editorial-path" aria-label="本期观看路径">
        {issue.editorialPath.map((step, index) => (
          <span key={step}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            {step}
          </span>
        ))}
      </section>

      {issue.media.map((media) => (
        <EditorialMedia key={media.kind + '-' + media.sourceUrl} media={media} />
      ))}

      {issue.sections.map((section, index) => (
        <section className="detail-block editorial-section" key={section.title}>
          <div className="block-heading">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{section.title}</h2>
          </div>
          {section.quote ? <blockquote>{section.quote}</blockquote> : null}
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}

      <section className="detail-block evidence-block">
        <div className="block-heading">
          <span>↳</span>
          <h2>证据边界</h2>
        </div>
        <ul>
          {issue.evidenceBoundary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="detail-block source-block">
        <div className="block-heading">
          <span>↗</span>
          <h2>来源出口</h2>
        </div>
        <div className="source-list">
          {issue.sources.map((source) => (
            <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
              <strong>{source.title}</strong>
              <span>{source.role}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="detail-block closing-question">
        <span>带走一个问题</span>
        <p>{issue.closingQuestion}</p>
      </section>
    </article>
  )
}

export function IssueDetail({ issue }) {
  if (issue.schemaVersion !== 2) {
    return <LegacyIssueDetail issue={issue} />
  }

  return <EditorialIssueDetail issue={issue} />
}
