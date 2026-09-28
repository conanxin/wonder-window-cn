import { Link } from 'react-router-dom'
import { SectionTitle } from '../components/SectionTitle.jsx'
import { Seo } from '../components/Seo.jsx'

export function AboutPage() {
  return (
    <>
      <Seo
        title="关于"
        description="了解《万物小窗》的策展式编辑方法、三种期型，以及它与 Conan Xin Archive 的关系。"
      />
      <section className="page-hero about-page-hero">
        <div className="container about-page-grid">
          <SectionTitle
            label="About"
            level="h1"
            title="关于《万物小窗》"
            intro="一份从书、图像、档案、地方、文章与声音中寻找关系的策展式中文通讯。"
          />
          <div className="about-note">
            <p>
              不是“本周十大链接”，而是每次打开一扇足够具体的小窗。
            </p>
          </div>
        </div>
      </section>

      <section className="section about-prose-section">
        <div className="container prose-layout">
          <article className="prose-card">
            <h2>它是什么</h2>
            <p>
              《万物小窗》是一份策展式中文通讯，也是一套轻量数字出版方法。每一期从一个具体对象或一组真正产生关系的材料出发，说明它们是什么、哪里值得看，以及我们仍然不知道什么。
            </p>
            <h2>为什么不再固定栏目</h2>
            <p>
              早期版本用“三道闪电／图像／短文／一词／深潜”等固定栏目组织内容。继续实作以后，一个更稳定的原则浮现出来：品牌的一致性应该来自“怎样看”，而不是“每期填同样的格子”。因此 v0.2 让栏目服从对象。
            </p>
            <h2>三种期型</h2>
            <p>
              Constellation｜星座式对读，让两到四件材料互相照亮；Sequence｜序列式观看，从一本书、一组图或一份档案内部的排列建立阅读路径；Close Look｜单对象深看，让一件足够复杂的对象独立成期。声音可以采用 Close Listen 的方式执行，但不另设第四种期型。
            </p>
            <h2>证据为什么也属于正文结构</h2>
            <p>
              每一期都区分 Reader Layer 与 Evidence Layer。读者层保留对象、必要背景、编辑观察和会改变理解的限定；证据层记录版本、已读范围、来源、权利状态、未解决问题与更正历史。读者随时可以回到原件。
            </p>
            <h2>它和 Conan Xin Archive 的关系</h2>
            <p>
              Conan Xin Archive 保存对象、元数据、来源与证据；《万物小窗》负责选择、建立关系、提供语境并把材料组织成一期。可以把它理解成 Archive 的 Editorial Interface，但它也持续吸收外部公版资源和当代文章。
            </p>
            <h2>什么时候一篇可以结束</h2>
            <p>
              当核心对象、定位、实际阅读范围、编辑观点、关键边界和原件出口都已经明确，就从研究进入编辑。“还能找到更多相关资料”本身不是继续搜索的理由；只有会改变对象身份、版本、关键解释或使用状态的缺口才重新打开研究。
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
