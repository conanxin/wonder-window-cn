import { Link } from 'react-router-dom'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { Seo } from '../components/Seo.jsx'

export function AboutPage() {
  return (
    <>
      <Seo
        title="关于"
        description="了解《万物小窗》是什么、为什么存在，以及它如何帮助读者重新训练注意力。"
      />
      <section className="page-hero about-page-hero">
        <div className="container about-page-grid">
          <SectionTitle
            label="About"
            level="h1"
            title="关于《万物小窗》"
            intro="一份写给好奇心、注意力和内在生活的中文周刊。"
          />
          <div className="about-note">
            <p>
              它不催促你知道更多，而是陪你把已经在眼前的东西重新看清楚。
            </p>
          </div>
        </div>
      </section>

      <section className="section about-prose-section">
        <div className="container prose-layout">
          <article className="prose-card">
            <h2>它是什么</h2>
            <p>
              《万物小窗》是一份每周更新的中文 newsletter，也是一只数字珍奇柜。它收集来自自然、词语、图像、互联网边角和日常经验里的微小发现，把它们整理成可以慢慢阅读的一期。每期都有三道闪电、一张原创图像、一篇短文、一个词、一个深潜主题，以及几个留给读者的问题。
            </p>
            <h2>为什么做它</h2>
            <p>
              因为很多时候，我们并不是缺少信息，而是缺少安静地观看信息以外事物的能力。信息流不断制造紧迫感，让每一次停顿都显得像落后。但人真正恢复清醒，往往发生在很小的地方：看见树叶背面的纹路，听见房间里的声音，意识到自己正在急着给生活下结论。
            </p>
            <h2>它和普通信息简报有什么不同</h2>
            <p>
              普通简报通常帮助你更快追上世界，《万物小窗》更愿意帮助你慢一点回到世界。它不以“必须知道”为口吻，不堆链接，不追逐热点，也不把每件事都转化成效率建议。它保留一些无用、迟疑和空白，因为这些东西有时比结论更能保护一个人的内在生活。
            </p>
            <h2>适合什么读者</h2>
            <p>
              它适合仍然想保持好奇的人，适合被信息流消耗却还不想变麻木的人，适合喜欢自然、散步、阅读、词语和微小观察的人。它也适合那些不想再把生活只理解为任务清单的人。
            </p>
            <h2>每期如何阅读</h2>
            <p>
              不必一次读完。你可以先看三道闪电，挑一个条目在当天留意；也可以只读本周一词，把它当作观察生活的新镜片；如果有时间，再读短文和问题。最好的读法不是收藏，而是在读完后走开一会儿，让其中一个细节回到真实生活里。
            </p>
            <Link className="button primary prose-action" to="/issues">
              从往期开始
            </Link>
          </article>
        </div>
      </section>
    </>
  )
}
