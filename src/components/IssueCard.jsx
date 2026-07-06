import { Link } from 'react-router-dom'

export function IssueCard({ issue, variant = 'default' }) {
  return (
    <Link className={`issue-card issue-card-${variant}`} to={`/issues/${issue.slug}`}>
      <span className="issue-number">{issue.number}</span>
      <h3>{issue.title}</h3>
      <p>{issue.summary}</p>
      <div className="issue-card-meta">
        <span>{issue.date}</span>
        <span>{issue.readingTime}</span>
      </div>
      {variant === 'archive' ? (
        <>
          <div className="issue-card-word">本周一词：{issue.word.term}</div>
          <div className="tag-row" aria-label="主题标签">
            {issue.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </Link>
  )
}
