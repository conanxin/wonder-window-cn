import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero.jsx'
import { IssueCard } from '../components/IssueCard.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { Seo } from '../components/Seo.jsx'
import { SubscribeBox } from '../components/SubscribeBox.jsx'
import { WonderVisual } from '../components/WonderVisual.jsx'
import { issueTypeDefinitions } from '../data/issueTypes.js'
import { issues } from '../data/issues.js'
import { getIssueDisplayDate } from '../data/issueDisplay.js'

const latestIssue = issues[0]

export function HomePage() {
  return (
    <>
      <Seo
        title="万物小窗"
        description="从书、图像、档案、地方与声音中选择少量对象，建立关系、提供语境，并保留证据与原件出口。"
      />
      <Hero latestIssue={latestIssue} />

      <section className="section issue-feature" id="latest">
        <div className="container feature-grid">
          <div className="feature-copy">
            <SectionTitle
              label="最新一期"
              title={`${latestIssue.number} ${latestIssue.title}`}
              intro={latestIssue.summary}
            />
            <div className="feature-meta">
              <span>{getIssueDisplayDate(latestIssue)}</span>
              <span>{latestIssue.readingTime}</span>
              {latestIssue.schemaVersion === 2 ? (
                <span>{latestIssue.issueTypeLabel}</span>
              ) : null}
            </div>
            <Link className="text-button" to={`/issues/${latestIssue.slug}`}>
              阅读这一期
            </Link>
          </div>
          <WonderVisual issue={latestIssue} size="large" />
        </div>
      </section>

      <section className="section why-section">
        <div className="container why-grid">
          <SectionTitle
            label="编辑方法"
            title="不是多收集，而是建立值得看的关系"
            intro="《万物小窗》不以链接数量证明丰富。每一期先找到一个具体入口，再决定它需要一件对象，还是几件对象互相照亮。"
          />
          <div className="why-list">
            <article>
              <span>回到原件</span>
              <p>
                每期至少保留一个可以重新定位的核心对象：书页、图像、地图、档案、照片、声音或文章，并给出稳定的来源出口。
              </p>
            </article>
            <article>
              <span>编辑贡献</span>
              <p>
                不只摘要“它讲了什么”，而是指出一个值得注意的细节、差别、关系或疑问，让材料在重新观看后产生新的理解。
              </p>
            </article>
            <article>
              <span>证据边界</span>
              <p>
                已知与未知同时保留。会改变对象身份、版本、日期、解释或使用状态的问题，在公开前必须解决或明确删去相关论断。
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section columns-section" id="columns">
        <div className="container">
          <SectionTitle
            label="Issue Types"
            title="三种期型，不设固定栏目"
            intro="栏目服从对象。每期只选择最适合这一组材料的观看方法，不为了填满模板继续增加内容。"
          />
          <div className="column-grid">
            {issueTypeDefinitions.map((type) => (
              <article className="column-card" key={type.id}>
                <span>{type.label}</span>
                <p>{type.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section archive-section" id="archive">
        <div className="container">
          <div className="section-row">
            <SectionTitle
              label="往期"
              title={`已发布的 ${issues.length} 篇小窗`}
              intro="早期栏目制内容作为出版历史保留；新的 v0.2 期型会在通过 Publication Gate 后进入同一档案。"
            />
            <Link className="text-button" to="/issues">
              查看全部
            </Link>
          </div>
          <div className="issue-grid">
            {issues.map((issue) => (
              <IssueCard issue={issue} key={issue.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section subscribe-section" id="subscribe">
        <div className="container">
          <SubscribeBox />
        </div>
      </section>

      <section className="section about-section">
        <div className="container about-grid">
          <SectionTitle
            label="About"
            title="Archive × Reading × Curation"
            intro="《万物小窗》把个人档案、开放馆藏和持续阅读变成可以进入、可以复核、也可以重新回看的微型展览。"
          />
          <div className="about-body">
            <p>
              Conan Xin Archive 负责保存对象、来源与证据；《万物小窗》负责选择、建立关系、提供语境并形成一期。二者彼此连接，但不合并成同一个产品。
            </p>
            <Link className="text-button" to="/about">
              了解编辑方法
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
