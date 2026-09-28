import { Link, useParams } from 'react-router-dom'
import { IssueDetail } from '../components/IssueDetail.jsx'
import { Seo } from '../components/Seo.jsx'
import { getEditorialIssueBySlug } from '../data/issues.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function EditorialPreviewPage() {
  const { slug } = useParams()
  const issue = getEditorialIssueBySlug(slug)

  if (!issue) {
    return <NotFoundPage />
  }

  return (
    <>
      <Seo
        title={'编辑预览｜' + issue.title}
        description={issue.summary}
        type="article"
      />
      <section className="section preview-banner-section">
        <div className="container">
          <div className="preview-banner">
            <strong>编辑预览｜{issue.publicationStatus}</strong>
            <span>仅在 Vite DEV 模式开放；不会进入生产路由、RSS 或 sitemap。</span>
            {issue.notionUrl ? (
              <a href={issue.notionUrl} rel="noreferrer" target="_blank">
                查看 Notion 研究记录
              </a>
            ) : null}
            <Link to="/issues">返回公开往期</Link>
          </div>
          <IssueDetail issue={issue} />
        </div>
      </section>
    </>
  )
}
