import { Link } from 'react-router-dom'

export function Hero({ latestIssue }) {
  return (
    <section className="hero-section" id="top">
      <div className="container hero-layout">
        <div className="hero-copy">
          <h1>万物小窗</h1>
          <p className="hero-subtitle">
            每周打开一扇通往惊奇、自然、思想与生活智慧的窗。
          </p>
          <p className="hero-positioning">
            这是一份写给好奇心、注意力和内在生活的中文周刊。
          </p>
          <div className="hero-actions">
            <Link className="button primary" to={`/issues/${latestIssue.slug}`}>
              开始阅读
            </Link>
            <Link className="button secondary" to="/issues">
              查看往期
            </Link>
          </div>
        </div>
        <Link
          className="hero-panel"
          to={`/issues/${latestIssue.slug}`}
          aria-label={`阅读最新一期：${latestIssue.title}`}
        >
          <span className="panel-number">{latestIssue.number}</span>
          <h2>{latestIssue.title}</h2>
          <p>{latestIssue.summary}</p>
          <div className="panel-lines" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </Link>
      </div>
    </section>
  )
}
