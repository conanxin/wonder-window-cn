import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo.jsx'

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="页面未找到"
        description="这扇小窗暂时不存在。回到《万物小窗》首页继续阅读。"
      />
      <section className="page-hero not-found-page">
        <div className="container not-found-card">
          <span className="issue-number">404</span>
          <h1>这扇小窗暂时不存在</h1>
          <p>
            也许链接写错了，也许这期还在路上。先回到首页，或者去往期档案里找一扇已经打开的窗。
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/">
              回到首页
            </Link>
            <Link className="button secondary" to="/issues">
              查看往期
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
