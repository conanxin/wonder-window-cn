# 万物小窗 / wonder-window-cn

《万物小窗》是一份策展式中文通讯，也是一套面向书、图像、档案、地图、照片与声音的轻量数字出版系统。

当前进入 **P12｜Approved Manifest Verification Gate**：架构、Preview gate、release rehearsal 与 decision manifest 已进入 main；当前新增的是“批准后的 manifest 是否仍对应当前候选内容和发布提案”的只读验证层。验证通过也不会自动刊发。

## 当前架构

- 技术栈：Vite + React + React Router
- 后端：无
- 数据库：无
- 正式订阅服务：尚未接入
- 公开内容：只读取 publicationStatus = PUBLISHED 的 issue
- 未发布候选：保存在 src/data/editorialCandidates.js；Production bundle 不得包含这些正文。**注意：仓库本身是 public，因此这里的“未发布”指未进入正式网站／RSS／sitemap，不表示源码机密。**
- 已发布 v0.2 内容：进入 src/data/publishedEditorialIssues.js
- 编辑预览：/editorial-preview/:slug 仅在本地 DEV、Vercel Preview 或非 Vercel 构建显式 VITE_EDITORIAL_PREVIEW=true 时注册；VERCEL_ENV=production 时该 flag 不可覆盖
- RSS / sitemap：继续只读取公开 issues 导出
- Public consumers：Home / Archive / lead visual 已同时兼容 Legacy 与 v0.2 schema
- Release guard：prebuild 先执行 publication contract，PUBLISHED issue 缺少必要字段时构建直接失败
- 外部媒体：加载失败时保留显式 fallback 与原件出口，不生成替代内容冒充原件
- Vercel：GitHub Preview integration 已确认可用；PR Preview 会生成独立预览地址。Production canonical URL 仍以 src/siteConfig.js 与实际域名核验结果为准

## v0.2 的三种期型

- Constellation｜星座式对读：两到四件材料互相照亮。
- Sequence｜序列式观看：从一本书、一组图或一份档案内部的排列建立观看路径。
- Close Look｜单对象深看：一件足够复杂的对象独立成期；声音可用 Close Listen 执行。

## v0.2 issue 字段

- publicationStatus
- issueType / issueTypeLabel
- coreQuestion
- editorialPoint
- editorialPath
- media
- sections
- sources
- evidenceBoundary
- closingQuestion

只有 PUBLISHED 才进入公开站点。READY、ISSUE_CANDIDATE 等状态可以进入代码与本地预览，但不会自动进入公开 Archive、RSS 或 sitemap。

### READY 候选发布前预检

结构预检：

    npm run check:release -- trial-03-utamaro-butterfly-dragonfly

完整 release rehearsal：

    npm run rehearse:release -- trial-03-utamaro-butterfly-dragonfly 2026-09-28

rehearsal 会在内存中把 READY 候选投影为 PUBLISHED，并检查：
- schema / 必需字段；
- id / slug 与现有公开 issue 的冲突；
- publishedAt 格式与真实日历日期；
- 公开 issue 的发布日期排序；
- canonical issue URL；
- RSS pubDate；
- sitemap lastmod；
- 从 candidate registry 迁移到 published registry 时必须完成的编辑动作。

它不会修改源文件、不会改变 publicationStatus、不会发送邮件，也不会公开内容。

CI 还执行 `npm run rehearse:ready`，持续验证所有 READY 候选仍能通过发布路径。GitHub Actions 的 `release-rehearsal` workflow 可以手动输入 slug 和日期做同样的非发布演练。

### Publication Decision Manifest

真正做发布决定之前，可以生成只读 JSON 决策包：

    npm run release:manifest -- trial-03-utamaro-butterfly-dragonfly 2026-09-28

或者写入临时文件：

    npm run release:manifest -- trial-03-utamaro-butterfly-dragonfly 2026-09-28 --output release-manifest/trial-03.json

manifest 会先调用同一 release rehearsal；只有 READY 候选通过后才输出。内容包括候选身份、**候选正文 SHA-256 fingerprint**、拟定发布日期和公开 URL、RSS / sitemap 影响、来源、媒体权利状态、证据边界、registry 迁移计划，以及仍需外部核验的 Production URL / public route。决策字段默认保持 `requiresExplicitApproval=true` 与 `approvalStatus=PENDING`，用于防止把“生成决策包”误当成“已经批准发布”。

manifest 是 **decision-only artifact**：不会修改 registry、不会把状态改成 PUBLISHED、不会发送 newsletter。

GitHub Actions 的 `release-decision-manifest` workflow 可以手动生成该 JSON 并作为 artifact 下载审阅。

### Approved Manifest Verification

批准动作仍由人完成；仓库**不提供自动批准命令**。批准后的 manifest 至少需要把：

- `decision.approvalStatus` 改为 `APPROVED`
- `decision.approvedBy` 写为非空批准人
- `decision.approvedAt` 写为 UTC ISO-8601 时间
- `decision.approvedProposal` 固定当时批准的 candidate fingerprint、**human review snapshot fingerprint**、`publishedAt`、canonical URL 与完整 `proposalFingerprintSha256`

然后执行只读验证：

    npm run verify:approved-manifest -- path/to/approved-manifest.json

verifier 会重新读取当前 `editorialCandidates.js`、重算 SHA-256、重跑 release rehearsal、复核当前 publication contract、公开 issue 数量/排序、canonical URL、RSS / sitemap 与 registry migration plan。

manifest 还会单独计算 `reviewSnapshotFingerprintSha256`，覆盖人实际审阅的 candidate 摘要（包括 currentStatus / issueTypeLabel / notionUrl）、editorial、media、sources 与 evidenceBoundary；verifier 会从当前 candidate 重新生成同一 review snapshot 并逐项比对。完整 `proposalFingerprintSha256` 同时覆盖 candidate fingerprint、review snapshot fingerprint、发布时间、canonical URL、archive position、公开 issue 数量、**按当前顺序排列的 public issue set 内容指纹**、RSS、sitemap 与 registry migration plan。只要候选、人类审阅包或现有公开 issue 集发生变化，旧 approved manifest 就会失败并要求重新生成/重新批准。验证成功只输出 `PROMOTION_PLAN_VERIFIED`，**不会修改源码、不会移动 registry、不会发布、不会发 newsletter**。

### Publication Patch Preview

P12 verifier 通过后，可以生成下一步的只读 publication patch preview：

    npm run preview:publication-patch -- path/to/approved-manifest.json

或保存 JSON：

    npm run preview:publication-patch -- path/to/approved-manifest.json --output publication-patch/preview.json

preview 只描述两条允许的 registry 变化：
1. 从 `editorialCandidates.js` 按 slug 移除被批准的 READY candidate；
2. 向 `publishedEditorialIssues.js` 增加同一 issue，并只把 `publicationStatus` 改为 `PUBLISHED`、`publishedAt` 改为批准 manifest 中的 exact date。

同时记录：
- 两个目标源码文件当前 SHA-256；
- 变更前/后的 registry semantic-state SHA-256；
- approved candidate / review / proposal / public-set fingerprints；
- RSS / sitemap 预期 delta；
- human-readable change summary；
- 仍未关闭的 external verification blockers。

它固定声明 `mutatesRepository=false`、`createsPullRequest=false`、`sendsNewsletter=false`。当前两条 Production domain / public route 外部验收尚未关闭时，readiness 必须保持 `PATCH_PREVIEW_READY_PUBLICATION_BLOCKED`。


## 当前编辑候选

- 试刊03｜《读到那两首诗，蝴蝶就不只是蝴蝶了》｜READY
- 2026-W40｜《声音还在，名字没了》｜ISSUE_CANDIDATE

旧版 #001–#003 暂时作为 Legacy 保留，不在本轮强制重写。

## 运行

    npm install
    npm run dev

生产构建：

    npm run build

本地预览构建结果：

    npm run preview

## 路由

公开：

- /
- /issues
- /issues/:slug
- /about
- /rss.xml
- /sitemap.xml
- /robots.txt

开发环境额外提供：

- /editorial-preview/trial-03-utamaro-butterfly-dragonfly
- /editorial-preview/w40-victor-7127f-voices-without-names

Production 不注册编辑预览路由；CI 会扫描 dist，若发现候选标题／slug 泄漏进 Production bundle，构建直接失败。Preview build 则反向验证候选内容确实存在。

## 内容工作流

    Source Pool
      ↓
    Curatorial Inbox
      ↓
    Object / Locator / Read Scope
      ↓
    Relation / Editorial Point
      ↓
    Evidence Boundary
      ↓
    Publication Gate
      ↓
    PUBLISHED
      ↓
    Archive / RSS

Conan Xin Archive 负责对象、证据、来源与元数据；《万物小窗》负责选择、建立关系、提供语境并形成一期。

## RSS 与 Sitemap

    npm run rss
    npm run sitemap

prebuild 会自动执行二者。生成脚本读取公开 issues 导出，因此未发布的 editorial candidates 不会出现在 feed 或 sitemap。

## 部署

项目仍适合静态部署。

Vercel：

- Framework: Vite
- Build Command: npm run build
- Output Directory: dist

Cloudflare Pages：

- Build command: npm run build
- Build output directory: dist

正式发布前应确认 src/siteConfig.js 的 siteUrl 与实际公网域名一致。

## License

项目代码与原创文档使用 MIT License。馆藏图像、录音及其他外部素材继续遵循各自来源页标注的权利状态；仓库中的 rightsStatus 字段用于记录编辑层的使用判断，不改变上游素材的权利状态。
