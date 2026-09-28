export function formatPublishedAtDate(publishedAt) {
  if (
    typeof publishedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)
  ) {
    return null
  }

  const [year, month, day] = publishedAt.split('-').map(Number)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null
  }

  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return `${year}年${month}月${day}日`
}

export function getIssueDisplayDate(issue) {
  if (
    issue?.schemaVersion === 2 &&
    issue?.publicationStatus === 'PUBLISHED'
  ) {
    return formatPublishedAtDate(issue.publishedAt) || issue.date || ''
  }

  return issue?.date || ''
}
