import { allIssues } from '../src/data/issues.js'

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

for (const issue of allIssues) {
  if (issue.publicationStatus !== 'PUBLISHED') {
    continue
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

if (errors.length) {
  throw new Error(`Publication contract failed:\n- ${errors.join('\n- ')}`)
}

console.log(
  `Publication contract OK: ${allIssues.filter((issue) => issue.publicationStatus === 'PUBLISHED').length} published issues`,
)
