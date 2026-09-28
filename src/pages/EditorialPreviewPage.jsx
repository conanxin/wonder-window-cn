import { Link, useParams } from 'react-router-dom'
import { IssueDetail } from '../components/IssueDetail.jsx'
import { Seo } from '../components/Seo.jsx'
import { getEditorialCandidateBySlug } from '../data/editorialCandidates.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export default function EditorialPreviewPage() {
  const { slug } = useParams()
  const issue = getEditorialCandidateBySlug(slug)

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
            <span>
              当前仅在本地开发或 Vercel Preview 环境启用；Production 不注册此路由，也不打包候选正文。
            </span>
            <span>环境：{import.meta.env.DEPLOYMENT_ENV}</span>
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
