import { WonderVisual } from './WonderVisual.jsx'

export function LegacyIssueDetail({ issue }) {
  return (
    <article className="issue-detail">
      <header className="issue-detail-header">
        <div>
          <span className="issue-number">{issue.number}</span>
          <h1>{issue.title}</h1>
          <div className="detail-meta">
            <span>{issue.date}</span>
            <span>{issue.readingTime}</span>
          </div>
        </div>
        <p>{issue.summary}</p>
      </header>

      <section className="detail-block">
        <div className="block-heading">
          <span>01</span>
          <h2>三道闪电</h2>
        </div>
        <div className="lightning-grid">
          {issue.lightning.map((item) => (
            <article className="lightning-card" key={item.title}>
              <span>{item.type}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-block visual-block">
        <div className="block-heading">
          <span>02</span>
          <h2>本周图像</h2>
        </div>
        <WonderVisual issue={issue} />
        <p className="visual-caption">{issue.visual.caption}</p>
      </section>

      <section className="detail-block essay-block">
        <div className="block-heading">
          <span>03</span>
          <h2>本周短文</h2>
        </div>
        <h3>{issue.essayTitle}</h3>
        {issue.essay.split('\n\n').map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="detail-split">
        <div className="detail-block word-block">
          <div className="block-heading">
            <span>04</span>
            <h2>本周一词</h2>
          </div>
          <h3>{issue.word.term}</h3>
          <p className="muted">{issue.word.origin}</p>
          <p>{issue.word.meaning}</p>
          <p>{issue.word.practice}</p>
        </div>

        <div className="detail-block dive-block">
          <div className="block-heading">
            <span>05</span>
            <h2>本周深潜</h2>
          </div>
          <h3>{issue.deepDive.title}</h3>
          <p>{issue.deepDive.text}</p>
        </div>
      </section>

      <section className="detail-block question-block">
        <div className="block-heading">
          <span>06</span>
          <h2>带走一个问题</h2>
        </div>
        <ol>
          {issue.questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>
    </article>
  )
}
