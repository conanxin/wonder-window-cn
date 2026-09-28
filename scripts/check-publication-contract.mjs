import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { issues } from '../src/data/issues.js'
import { validateIssue } from './publication-contract.mjs'

const errors = []

for (const issue of issues) {
  if (issue.publicationStatus !== 'PUBLISHED') {
    errors.push(`${issue.slug}: public issue must be PUBLISHED`)
  }

  errors.push(...validateIssue(issue, { requirePublishedAt: true }))
}

const seenSlugs = new Set()
for (const issue of issues) {
  if (seenSlugs.has(issue.slug)) {
    errors.push(`${issue.slug}: duplicate public slug`)
  }
  seenSlugs.add(issue.slug)
}

for (const candidate of editorialCandidates) {
  if (candidate.publicationStatus === 'PUBLISHED') {
    errors.push(
      `${candidate.slug}: PUBLISHED content must move out of editorialCandidates into publishedEditorialIssues`,
    )
  }
}

if (errors.length) {
  throw new Error(`Publication contract failed:\n- ${errors.join('\n- ')}`)
}

console.log(
  `Publication contract OK: ${issues.length} public issues, ${editorialCandidates.length} unpublished editorial candidates`,
)
