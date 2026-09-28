import { Link } from 'react-router-dom'

export function Hero({ latestIssue }) {
  return (
    <section className="hero-section" id="top">
      <div className="container hero-layout">
        <div className="hero-copy">
          <h1>万物小窗</h1>
          <p className="hero-subtitle">
            从书、图像、档案、地方与声音里，打开一扇值得停下来的窗。
          </p>
          <p className="hero-positioning">
            一份策展式中文通讯，也是一座持续生长的微型数字展览。
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
