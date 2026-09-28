import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { validateIssue } from './publication-contract.mjs'

const slug = process.argv[2]

if (!slug) {
  throw new Error('Usage: npm run check:release -- <editorial-candidate-slug>')
}

const issue = editorialCandidates.find((candidate) => candidate.slug === slug)

if (!issue) {
  throw new Error(`Release candidate not found: ${slug}`)
}

if (issue.publicationStatus !== 'READY') {
  throw new Error(
    `${slug}: release candidate must be READY, found ${issue.publicationStatus}`,
  )
}

const errors = validateIssue(issue, { requirePublishedAt: false })

if (errors.length) {
  throw new Error(`Release readiness failed:\n- ${errors.join('\n- ')}`)
}

console.log(
  `Release readiness OK: ${slug} (${issue.issueTypeLabel}) is structurally ready for a separate publication decision.`,
)
