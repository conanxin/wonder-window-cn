import { siteConfig } from '../src/siteConfig.js'

const checks = [
  {
    path: '/',
    expectedType: 'text/html',
    marker: '万物小窗 | 策展式中文通讯',
  },
  {
    path: '/issues',
    expectedType: 'text/html',
    marker: '万物小窗 | 策展式中文通讯',
  },
  {
    path: '/rss.xml',
    expectedType: 'xml',
    marker: '<rss',
  },
  {
    path: '/sitemap.xml',
    expectedType: 'xml',
    marker: '<urlset',
  },
]

function fail(message) {
  throw new Error(message)
}

const results = []

for (const check of checks) {
  const url = new URL(check.path, siteConfig.siteUrl).toString()
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'wonder-window-production-surface-check/1.0',
      accept: '*/*',
    },
    signal: AbortSignal.timeout(15000),
  })

  const body = await response.text()
  const contentType = response.headers.get('content-type') || ''

  if (!response.ok) {
    fail(`${url}: expected HTTP 2xx, found ${response.status}`)
  }

  if (
    check.expectedType === 'text/html' &&
    !contentType.includes('text/html')
  ) {
    fail(`${url}: expected text/html, found ${contentType || 'no content-type'}`)
  }

  if (
    check.expectedType === 'xml' &&
    !/xml|text\/plain|application\/octet-stream/i.test(contentType)
  ) {
    fail(`${url}: expected XML-compatible content type, found ${contentType || 'no content-type'}`)
  }

  if (!body.includes(check.marker)) {
    fail(`${url}: expected marker not found: ${check.marker}`)
  }

  results.push({
    url,
    status: response.status,
    finalUrl: response.url,
    contentType,
    marker: check.marker,
  })
}

console.log(
  JSON.stringify(
    {
      status: 'PRODUCTION_SURFACE_VERIFIED',
      configuredSiteUrl: siteConfig.siteUrl,
      checks: results,
    },
    null,
    2,
  ),
)
