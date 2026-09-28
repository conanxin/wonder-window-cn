import { allIssues } from '../src/data/issues.js'
import { validateIssue } from './publication-contract.mjs'

const publishedIssues = allIssues.filter(
  (issue) => issue.publicationStatus === 'PUBLISHED',
)

const errors = publishedIssues.flatMap((issue) =>
  validateIssue(issue, { requirePublishedAt: true }),
)

const seenSlugs = new Set()
for (const issue of publishedIssues) {
  if (seenSlugs.has(issue.slug)) {
    errors.push(`${issue.slug}: duplicate published slug`)
  }
  seenSlugs.add(issue.slug)
}

if (errors.length) {
  throw new Error(`Publication contract failed:\n- ${errors.join('\n- ')}`)
}

console.log(
  `Publication contract OK: ${publishedIssues.length} published issues`,
)
