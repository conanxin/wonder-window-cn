import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { issues } from '../src/data/issues.js'
import { absoluteUrl } from '../src/siteConfig.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const sitemapPath = resolve(rootDir, 'public/sitemap.xml')

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

const staticPages = [
  { path: '/', priority: '1.0' },
  { path: '/issues', priority: '0.9' },
  { path: '/about', priority: '0.7' },
]

const issuePages = issues.map((issue) => ({
  path: `/issues/${issue.slug}`,
  lastmod: issue.publishedAt,
  priority: '0.8',
}))

const pages = [...staticPages, ...issuePages]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${escapeXml(absoluteUrl(page.path))}</loc>
    ${page.lastmod ? `<lastmod>${escapeXml(page.lastmod)}</lastmod>` : ''}
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

await mkdir(dirname(sitemapPath), { recursive: true })
await writeFile(sitemapPath, sitemap, 'utf8')
console.log(`Generated ${sitemapPath} (${pages.length} URLs)`)
