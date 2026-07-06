import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { issues } from '../src/data/issues.js'
import { absoluteUrl, siteConfig } from '../src/siteConfig.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const rssPath = resolve(rootDir, `public${siteConfig.rssPath}`)

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function itemXml(issue) {
  const link = absoluteUrl(`/issues/${issue.slug}`)

  return `    <item>
      <title>${escapeXml(`${issue.number} ${issue.title}`)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(issue.summary)}</description>
      <pubDate>${new Date(`${issue.publishedAt}T08:00:00+08:00`).toUTCString()}</pubDate>
      <author>${escapeXml(siteConfig.author)}</author>
    </item>`
}

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.siteName)}</title>
    <link>${escapeXml(siteConfig.siteUrl)}</link>
    <description>${escapeXml(siteConfig.siteDescription)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${issues.map(itemXml).join('\n')}
  </channel>
</rss>
`

await mkdir(dirname(rssPath), { recursive: true })
await writeFile(rssPath, rss, 'utf8')
console.log(`Generated ${rssPath}`)
