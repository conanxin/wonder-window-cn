import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { issues } from '../src/data/issues.js'
import { absoluteUrl } from '../src/siteConfig.js'
import { validateIssue } from './publication-contract.mjs'

function fail(message) {
  throw new Error(message)
}

function rehearseCandidate(candidate, publishedAt) {
  if (candidate.publicationStatus !== 'READY') {
    fail(
      `${candidate.slug}: release rehearsal requires READY, found ${candidate.publicationStatus}`,
    )
  }

  const collision = issues.find(
    (issue) => issue.slug === candidate.slug || issue.id === candidate.id,
  )

  if (collision) {
    fail(
      `${candidate.slug}: id/slug already exists in public issues as ${collision.slug}`,
    )
  }

  const projectedIssue = {
    ...candidate,
    publicationStatus: 'PUBLISHED',
    publishedAt,
  }

  const errors = validateIssue(projectedIssue, { requirePublishedAt: true })

  if (errors.length) {
    fail(`${candidate.slug}: release rehearsal failed:\n- ${errors.join('\n- ')}`)
  }

  const projectedIssues = [...issues, projectedIssue].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  )
  const projectedIndex = projectedIssues.findIndex(
    (issue) => issue.slug === candidate.slug,
  )

  if (projectedIndex < 0) {
    fail(`${candidate.slug}: projected issue missing after public ordering`)
  }

  const canonicalUrl = absoluteUrl(`/issues/${candidate.slug}`)
  if (!canonicalUrl.startsWith('https://')) {
    fail(`${candidate.slug}: canonical URL must be https: ${canonicalUrl}`)
  }

  const rssDate = new Date(`${publishedAt}T08:00:00+08:00`)
  if (Number.isNaN(rssDate.getTime())) {
    fail(`${candidate.slug}: RSS publication date would be invalid`)
  }

  return {
    slug: candidate.slug,
    title: candidate.title,
    sourceStatus: candidate.publicationStatus,
    projectedStatus: projectedIssue.publicationStatus,
    publishedAt,
    projectedArchivePosition: projectedIndex + 1,
    canonicalUrl,
    rssPubDate: rssDate.toUTCString(),
    sitemapLastmod: publishedAt,
    sourceRegistry: 'src/data/editorialCandidates.js',
    targetRegistry: 'src/data/publishedEditorialIssues.js',
    requiredReleaseEdits: [
      'remove the candidate from editorialCandidates',
      'add the complete issue to publishedEditorialIssues',
      'set publicationStatus to PUBLISHED',
      `set publishedAt to ${publishedAt}`,
    ],
  }
}

function printResult(result) {
  console.log('')
  console.log(`Release rehearsal OK: ${result.slug}`)
  console.log(`  title: ${result.title}`)
  console.log(`  status: ${result.sourceStatus} -> ${result.projectedStatus}`)
  console.log(`  publishedAt: ${result.publishedAt}`)
  console.log(`  projected archive position: #${result.projectedArchivePosition}`)
  console.log(`  route: ${result.canonicalUrl}`)
  console.log(`  RSS pubDate: ${result.rssPubDate}`)
  console.log(`  sitemap lastmod: ${result.sitemapLastmod}`)
  console.log('  release edits:')
  for (const edit of result.requiredReleaseEdits) {
    console.log(`    - ${edit}`)
  }
}

const args = process.argv.slice(2)
const allReady = args[0] === '--all-ready'

if (allReady) {
  const dateIndex = args.indexOf('--date')
  const publishedAt =
    dateIndex >= 0 && args[dateIndex + 1] ? args[dateIndex + 1] : '2099-12-31'
  const readyCandidates = editorialCandidates.filter(
    (candidate) => candidate.publicationStatus === 'READY',
  )

  if (readyCandidates.length === 0) {
    console.log('Release rehearsal: no READY editorial candidates; nothing to check')
    process.exit(0)
  }

  for (const candidate of readyCandidates) {
    printResult(rehearseCandidate(candidate, publishedAt))
  }

  console.log(
    `\nRelease path rehearsal PASS: ${readyCandidates.length} READY candidate(s)`,
  )
  process.exit(0)
}

const [slug, publishedAt] = args

if (!slug || !publishedAt) {
  fail(
    'Usage: npm run rehearse:release -- <candidate-slug> <YYYY-MM-DD>\n' +
      '   or: npm run rehearse:ready',
  )
}

const candidate = editorialCandidates.find((item) => item.slug === slug)

if (!candidate) {
  fail(`Editorial candidate not found: ${slug}`)
}

printResult(rehearseCandidate(candidate, publishedAt))
