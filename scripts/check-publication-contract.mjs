import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { issues } from '../src/data/issues.js'

const errors = []

function requireString(issue, field) {
  if (typeof issue[field] !== 'string' || !issue[field].trim()) {
    errors.push(`${issue.slug || issue.id}: missing ${field}`)
  }
}

function requireArray(issue, field, { allowEmpty = false } = {}) {
  if (!Array.isArray(issue[field]) || (!allowEmpty && issue[field].length === 0)) {
    errors.push(`${issue.slug || issue.id}: invalid ${field}`)
  }
}

for (const issue of issues) {
  if (issue.publicationStatus !== 'PUBLISHED') {
    errors.push(`${issue.slug}: public issue must be PUBLISHED`)
  }

  for (const field of ['id', 'slug', 'number', 'title', 'date', 'summary', 'publishedAt']) {
    requireString(issue, field)
  }

  requireArray(issue, 'tags', { allowEmpty: true })

  if (issue.schemaVersion === 2) {
    for (const field of [
      'issueType',
      'issueTypeLabel',
      'coreQuestion',
      'editorialPoint',
      'closingQuestion',
    ]) {
      requireString(issue, field)
    }

    requireArray(issue, 'editorialPath')
    requireArray(issue, 'sections')
    requireArray(issue, 'sources')
    requireArray(issue, 'evidenceBoundary', { allowEmpty: true })
    requireArray(issue, 'media', { allowEmpty: true })
  }

  if (issue.schemaVersion === 1) {
    if (!issue.visual?.variant) {
      errors.push(`${issue.slug}: legacy issue missing visual.variant`)
    }
    if (!issue.word?.term) {
      errors.push(`${issue.slug}: legacy issue missing word.term`)
    }
  }
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
