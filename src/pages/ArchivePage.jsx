import { useMemo, useState } from 'react'
import { IssueCard } from '../components/IssueCard.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { Seo } from '../components/Seo.jsx'
import { issues, issueTags } from '../data/issues.js'

export function ArchivePage() {
  const [activeTag, setActiveTag] = useState('全部')
  const filteredIssues = useMemo(() => {
    if (activeTag === '全部') {
      return issues
    }

    return issues.filter((issue) => issue.tags.includes(activeTag))
  }, [activeTag])

  return (
    <>
      <Seo
        title="往期档案"
        description="浏览《万物小窗》的全部期刊，并按注意力、自然、城市、仪式、阅读、惊奇筛选。"
      />
      <section className="page-hero archive-hero">
        <div className="container">
          <SectionTitle
            label="Archive"
            level="h1"
            title="往期档案"
            intro="每一期都是一扇小窗。你可以按主题筛选，也可以从最近一期慢慢往回读。"
          />
          <div className="filter-row" aria-label="按主题筛选期刊">
            {issueTags.map((tag) => (
              <button
                className={`filter-chip ${activeTag === tag ? 'is-active' : ''}`}
                key={tag}
                onClick={() => setActiveTag(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section archive-list-section">
        <div className="container">
          <div className="archive-count">
            {activeTag === '全部' ? '全部期刊' : `${activeTag} 主题`} ·{' '}
            {filteredIssues.length} 期
          </div>
          <div className="issue-grid archive-grid">
            {filteredIssues.map((issue) => (
              <IssueCard issue={issue} key={issue.id} variant="archive" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
