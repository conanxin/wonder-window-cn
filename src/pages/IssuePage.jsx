import { Link, useParams } from 'react-router-dom'
import { IssueDetail } from '../components/IssueDetail.jsx'
import { Seo } from '../components/Seo.jsx'
import { getAdjacentIssues, getIssueBySlug } from '../data/issues.js'
import { NotFoundPage } from './NotFoundPage.jsx'

export function IssuePage() {
  const { slug } = useParams()
  const issue = getIssueBySlug(slug)

  if (!issue) {
    return <NotFoundPage />
  }

  const { previousIssue, nextIssue } = getAdjacentIssues(issue.slug)

  return (
    <>
      <Seo
        title={`${issue.number} ${issue.title}`}
        description={issue.summary}
        type="article"
      />
      <section className="section issue-page-section">
        <div className="container">
          <IssueDetail issue={issue} />

          <nav className="issue-nav" aria-label="上一篇和下一篇">
            {previousIssue ? (
              <Link to={`/issues/${previousIssue.slug}`}>
                <span>上一篇</span>
                <strong>
                  {previousIssue.number} {previousIssue.title}
                </strong>
              </Link>
            ) : (
              <span className="issue-nav-empty">已经是第一期</span>
            )}
            {nextIssue ? (
              <Link to={`/issues/${nextIssue.slug}`}>
                <span>下一篇</span>
                <strong>
                  {nextIssue.number} {nextIssue.title}
                </strong>
              </Link>
            ) : (
              <span className="issue-nav-empty">已经是最新一期</span>
            )}
          </nav>
        </div>
      </section>
    </>
  )
}
