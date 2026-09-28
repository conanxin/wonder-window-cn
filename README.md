# 万物小窗 / wonder-window-cn

《万物小窗》是一份策展式中文通讯，也是一套面向书、图像、档案、地图、照片与声音的轻量数字出版系统。

当前进入 **v0.2 Editorial Architecture Migration**：从早期“固定栏目模板”迁移到由对象、阅读路径、来源与证据边界驱动的编辑模型。

## 当前架构

- 技术栈：Vite + React + React Router
- 后端：无
- 数据库：无
- 正式订阅服务：尚未接入
- 公开内容：只读取 publicationStatus = PUBLISHED 的 issue
- v0.2 候选：保存在 src/data/editorialIssues.js
- 开发预览：/editorial-preview/:slug，仅在 Vite DEV 模式注册
- RSS / sitemap：继续只读取公开 issues 导出
- 公网部署：当前未确认存在；src/siteConfig.js 中的 Vercel URL 仍是部署目标/占位配置

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

开发预览路由不会在生产环境注册。

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
