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

const publicIds = new Set()
const publicSlugs = new Set()

for (const issue of issues) {
  if (publicIds.has(issue.id)) {
    errors.push(`${issue.slug}: duplicate public id ${issue.id}`)
  }
  if (publicSlugs.has(issue.slug)) {
    errors.push(`${issue.slug}: duplicate public slug`)
  }

  publicIds.add(issue.id)
  publicSlugs.add(issue.slug)
}

const candidateIds = new Set()
const candidateSlugs = new Set()

for (const candidate of editorialCandidates) {
  if (candidate.publicationStatus === 'PUBLISHED') {
    errors.push(
      `${candidate.slug}: PUBLISHED content must move out of editorialCandidates into publishedEditorialIssues`,
    )
  }

  if (candidateIds.has(candidate.id)) {
    errors.push(`${candidate.slug}: duplicate candidate id ${candidate.id}`)
  }
  if (candidateSlugs.has(candidate.slug)) {
    errors.push(`${candidate.slug}: duplicate candidate slug`)
  }
  if (publicIds.has(candidate.id)) {
    errors.push(`${candidate.slug}: candidate id already exists in public issues`)
  }
  if (publicSlugs.has(candidate.slug)) {
    errors.push(`${candidate.slug}: candidate slug already exists in public issues`)
  }

  candidateIds.add(candidate.id)
  candidateSlugs.add(candidate.slug)
}

if (errors.length) {
  throw new Error(`Publication contract failed:\n- ${errors.join('\n- ')}`)
}

console.log(
  `Publication contract OK: ${issues.length} public issues, ${editorialCandidates.length} unpublished editorial candidates`,
)
