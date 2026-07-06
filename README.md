# 万物小窗 / wonder-window-cn

《万物小窗》是一个原创中文版 newsletter / 数字珍奇柜网站。它每周打开一扇通往惊奇、自然、思想与生活智慧的窗，收集三道闪电、一张图像、一个词、一篇短文和一个问题。

项目使用 Vite + React 构建，不包含后端、不连接外部 API、不依赖数据库。所有期刊内容都保存在本地 JS 数据文件中，适合部署为静态网站。

## 如何运行

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 路由说明

- `/`：首页
- `/issues`：往期档案，可按标签筛选
- `/issues/:slug`：单期期刊详情页
- `/about`：关于页面
- `*`：404 页面
- `/rss.xml`：RSS feed
- `/sitemap.xml`：sitemap
- `/robots.txt`：robots

当前三期 slug：

- `/issues/001-see-the-world-again`
- `/issues/002-learn-to-wander`
- `/issues/003-rituals-of-everyday-life`

## 发布前修改站点 URL

站点基础信息位于 `src/siteConfig.js`。正式发布前请把：

```js
siteUrl: 'https://wonder-window-cn.vercel.app'
```

改成你的正式域名。RSS、sitemap 和页面动态 meta 会统一读取这里的配置。

如果修改了站点 URL 或新增内容，请重新运行：

```bash
npm run build
```

`prebuild` 会自动生成 `public/rss.xml` 和 `public/sitemap.xml`。

## 如何新增一期内容

所有期刊数据位于 `src/data/issues.js`。

新增一期时，把新对象放到 `issues` 数组最前面。建议包含：

- `id`：内部唯一 ID
- `slug`：公开 URL 片段
- `number`、`title`、`date`、`publishedAt`
- `readingTime`、`tags`、`summary`
- `visual`：本周图像类型和说明
- `lightning`：三道闪电条目
- `essayTitle`、`essay`
- `word`
- `deepDive`
- `questions`

首页会自动把 `issues[0]` 作为最新一期展示；RSS 和 sitemap 也会从同一份数据生成。

## RSS 与 Sitemap

手动生成 RSS：

```bash
npm run rss
```

手动生成 sitemap：

```bash
npm run sitemap
```

生产构建前会自动执行：

```bash
npm run rss && npm run sitemap
```

## Vercel 最简部署

- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## Cloudflare Pages 最简部署

- Build command: `npm run build`
- Build output directory: `dist`

项目已包含 `public/_redirects`，用于支持 Cloudflare Pages 的 SPA 路由回退。

## 发布后检查

部署后至少打开以下路径确认返回正常：

- `/`
- `/issues`
- `/about`
- `/rss.xml`
- `/sitemap.xml`
- `/robots.txt`

## 后续可以扩展的功能

- 将期刊内容迁移到 Markdown 或 MDX。
- 增加站内搜索。
- 增加真实订阅服务，例如 Buttondown、Resend、ConvertKit 或自有后端。
- 增加深色阅读模式。
- 自动生成每期独立 OG 图片。
