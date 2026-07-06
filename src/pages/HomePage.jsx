import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero.jsx'
import { IssueCard } from '../components/IssueCard.jsx'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { Seo } from '../components/Seo.jsx'
import { SubscribeBox } from '../components/SubscribeBox.jsx'
import { WonderVisual } from '../components/WonderVisual.jsx'
import { issues } from '../data/issues.js'

const latestIssue = issues[0]

export function HomePage() {
  return (
    <>
      <Seo
        title="万物小窗"
        description="每周打开一扇通往惊奇、自然、思想与生活智慧的窗。"
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
              <span>{latestIssue.date}</span>
              <span>{latestIssue.readingTime}</span>
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
            label="慢周刊"
            title="为什么需要一份慢周刊"
            intro="当信息流不断替我们决定看什么，慢下来就不只是审美选择，也是一种重新取回注意力的方式。"
          />
          <div className="why-list">
            <article>
              <span>反信息流</span>
              <p>
                不追逐即时热点，不把世界压缩成连续刷新。每一期只保留少量材料，让读者有时间咀嚼，而不是被下一条内容推走。
              </p>
            </article>
            <article>
              <span>反焦虑</span>
              <p>
                这里不承诺效率跃迁，也不制造落后感。它更像一处安静的边桌，让你把散乱的一天放下来，重新听见自己的节奏。
              </p>
            </article>
            <article>
              <span>重新训练注意力</span>
              <p>
                注意力不是要被榨干的资源，而是可以被温柔使用的能力。自然、词语、图像和日常动作，都是练习观看的入口。
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section columns-section" id="columns">
        <div className="container">
          <SectionTitle
            label="栏目结构"
            title="每周收集五种慢下来的材料"
            intro="它们不追逐热点，只把分散的注意力重新放回世界的纹理里。"
          />
          <div className="column-grid">
            {[
              ['三道闪电', '三个短小而明亮的发现，来自自然、互联网、书页或街角。'],
              ['本周图像', '一张原创抽象视觉，给无法立刻说清的感受留一个形状。'],
              ['本周短文', '一篇温柔、清醒、诗性的沉思，把经验慢慢展开。'],
              ['本周一词', '从词语进入生活，学习给隐约的感受命名。'],
              ['本周深潜', '为一个主题留下入口，让好奇心继续往下走。'],
              ['带走一个问题', '给日记、散步和睡前十分钟使用的小问题。'],
            ].map(([title, text]) => (
              <article className="column-card" key={title}>
                <span>{title}</span>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section archive-section" id="archive">
        <div className="container">
          <div className="section-row">
            <SectionTitle
              label="精选往期"
              title="三篇小窗"
              intro="从重新观看、城市漫游，到日常仪式。每一期都可以独立阅读。"
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
            title="不是信息简报，而是一份慢下来的练习。"
            intro="《万物小窗》相信，世界并不缺少奇迹，缺少的是我们停下来观看的能力。"
          />
          <div className="about-body">
            <p>
              我们每周收集三道闪电、一张图像、一个词、一篇短文和一个问题。它们来自互联网的边角、自然的变化、旧书的页缝、城市的细部，以及日常生活里那些差点被效率抹平的瞬间。
            </p>
            <Link className="text-button" to="/about">
              了解它为什么存在
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
