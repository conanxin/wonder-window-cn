const SUPPORTED_SCHEMA_VERSIONS = new Set([1, 2])

function issueLabel(issue) {
  return issue.slug || issue.id || 'unknown-issue'
}

function requireString(errors, issue, field) {
  if (typeof issue[field] !== 'string' || !issue[field].trim()) {
    errors.push(`${issueLabel(issue)}: missing ${field}`)
  }
}

function requireArray(errors, issue, field, { allowEmpty = false } = {}) {
  if (!Array.isArray(issue[field]) || (!allowEmpty && issue[field].length === 0)) {
    errors.push(`${issueLabel(issue)}: invalid ${field}`)
  }
}

function requireValidPublishedAt(errors, issue) {
  requireString(errors, issue, 'publishedAt')

  if (typeof issue.publishedAt !== 'string' || !issue.publishedAt.trim()) {
    return
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(issue.publishedAt)) {
    errors.push(
      `${issueLabel(issue)}: publishedAt must use YYYY-MM-DD`,
    )
    return
  }

  const [year, month, day] = issue.publishedAt.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    errors.push(`${issueLabel(issue)}: publishedAt is not a real calendar date`)
  }
}

export function validateIssue(issue, { requirePublishedAt = false } = {}) {
  const errors = []

  for (const field of ['id', 'slug', 'number', 'title', 'date', 'summary', 'readingTime']) {
    requireString(errors, issue, field)
  }

  requireArray(errors, issue, 'tags', { allowEmpty: true })

  if (
    typeof issue.slug === 'string' &&
    issue.slug.trim() &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(issue.slug)
  ) {
    errors.push(
      `${issueLabel(issue)}: slug must use lowercase URL-safe kebab-case`,
    )
  }

  if (!SUPPORTED_SCHEMA_VERSIONS.has(issue.schemaVersion)) {
    errors.push(
      `${issueLabel(issue)}: unsupported schemaVersion ${String(issue.schemaVersion)}`,
    )
    return errors
  }

  if (requirePublishedAt) {
    requireValidPublishedAt(errors, issue)
  }

  if (issue.schemaVersion === 2) {
    for (const field of [
      'issueType',
      'issueTypeLabel',
      'coreQuestion',
      'editorialPoint',
      'closingQuestion',
    ]) {
      requireString(errors, issue, field)
    }

    requireArray(errors, issue, 'editorialPath')
    requireArray(errors, issue, 'sections')
    requireArray(errors, issue, 'sources')
    requireArray(errors, issue, 'evidenceBoundary', { allowEmpty: true })
    requireArray(errors, issue, 'media', { allowEmpty: true })

    for (const [index, section] of (issue.sections || []).entries()) {
      if (!section?.title || !Array.isArray(section?.paragraphs) || section.paragraphs.length === 0) {
        errors.push(`${issueLabel(issue)}: invalid sections[${index}]`)
      }
    }

    for (const [index, source] of (issue.sources || []).entries()) {
      if (!source?.title || !source?.url || !source?.role) {
        errors.push(`${issueLabel(issue)}: invalid sources[${index}]`)
      }
    }

    for (const [index, media] of (issue.media || []).entries()) {
      if (!media?.kind || !media?.sourceUrl || !media?.rightsStatus) {
        errors.push(`${issueLabel(issue)}: invalid media[${index}]`)
      }
    }
  }

  if (issue.schemaVersion === 1) {
    requireArray(errors, issue, 'lightning')

    if (!issue.visual?.variant) {
      errors.push(`${issueLabel(issue)}: legacy issue missing visual.variant`)
    }

    if (!issue.word?.term) {
      errors.push(`${issueLabel(issue)}: legacy issue missing word.term`)
    }
  }

  return errors
}
