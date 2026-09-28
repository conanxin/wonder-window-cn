import {
  formatPublishedAtDate,
  getIssueDisplayDate,
} from '../src/data/issueDisplay.js'

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`,
    )
  }
}

assertEqual(
  formatPublishedAtDate('2026-09-28'),
  '2026年9月28日',
  'publishedAt formatter',
)

assertEqual(
  getIssueDisplayDate({
    schemaVersion: 2,
    publicationStatus: 'READY',
    date: '2026年9月27日',
    publishedAt: null,
  }),
  '2026年9月27日',
  'READY preview keeps editorial display date',
)

assertEqual(
  getIssueDisplayDate({
    schemaVersion: 2,
    publicationStatus: 'PUBLISHED',
    date: '2026年9月27日',
    publishedAt: '2026-09-28',
  }),
  '2026年9月28日',
  'published v2 issue displays approved publication date',
)

assertEqual(
  getIssueDisplayDate({
    schemaVersion: 1,
    publicationStatus: 'PUBLISHED',
    date: '2026年7月5日',
    publishedAt: '2026-07-05',
  }),
  '2026年7月5日',
  'legacy issue keeps historical date field',
)

assertEqual(
  getIssueDisplayDate({
    schemaVersion: 2,
    publicationStatus: 'PUBLISHED',
    date: '备用日期',
    publishedAt: 'invalid',
  }),
  '备用日期',
  'invalid publishedAt falls back to date',
)

console.log(
  'Issue display date contract PASS: READY uses editorial date; PUBLISHED v2 uses exact publishedAt; legacy behavior preserved',
)
