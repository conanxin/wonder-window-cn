import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { publishedEditorialIssues } from '../src/data/publishedEditorialIssues.js'
import { hashJson } from './release-manifest-fingerprint.mjs'

function fail(message) {
  throw new Error(message)
}

function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex')
}

function parseArgs(argv) {
  const [manifestPath, ...rest] = argv
  if (!manifestPath) {
    fail(
      'Usage: npm run preview:publication-patch -- <approved-manifest.json> [--output <path>]',
    )
  }

  const outputIndex = rest.indexOf('--output')
  const output =
    outputIndex >= 0 && rest[outputIndex + 1] ? rest[outputIndex + 1] : null

  return { manifestPath, output }
}

function verifyApprovedManifest(manifestPath) {
  const verification = spawnSync(
    process.execPath,
    ['scripts/verify-approved-release-manifest.mjs', manifestPath],
    { encoding: 'utf8' },
  )

  if (verification.status !== 0) {
    fail(
      `Publication patch preview blocked by approved-manifest verifier:\n${verification.stderr || verification.stdout}`,
    )
  }

  return JSON.parse(verification.stdout)
}

function summarizeOperations({ slug, publishedAt }) {
  return [
    `Remove READY candidate "${slug}" from src/data/editorialCandidates.js`,
    `Add the same issue to src/data/publishedEditorialIssues.js with publicationStatus=PUBLISHED and publishedAt=${publishedAt}`,
    'Regenerate RSS and sitemap through the existing build/prebuild pipeline',
  ]
}

const { manifestPath, output } = parseArgs(process.argv.slice(2))
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const verification = verifyApprovedManifest(manifestPath)

const slug = verification.slug
const candidate = editorialCandidates.find((item) => item.slug === slug)

if (!candidate) {
  fail(`Current editorial candidate not found: ${slug}`)
}

if (publishedEditorialIssues.some((issue) => issue.slug === slug || issue.id === candidate.id)) {
  fail(`${slug}: issue already exists in publishedEditorialIssues`)
}

const publishedAt = verification.publishedAt
const publishedIssue = {
  ...candidate,
  publicationStatus: 'PUBLISHED',
  publishedAt,
}

const remainingCandidates = editorialCandidates.filter(
  (item) => item.slug !== slug,
)
const nextPublishedEditorialIssues = [
  ...publishedEditorialIssues,
  publishedIssue,
]

const candidateFilePath = 'src/data/editorialCandidates.js'
const publishedFilePath = 'src/data/publishedEditorialIssues.js'
const [candidateFileText, publishedFileText] = await Promise.all([
  readFile(candidateFilePath, 'utf8'),
  readFile(publishedFilePath, 'utf8'),
])

const blockers = (manifest.unresolvedExternalVerification || []).map(
  (message) => ({
    type: 'EXTERNAL_VERIFICATION_REQUIRED',
    message,
  }),
)

const preview = {
  previewVersion: 1,
  action: 'PUBLICATION_PATCH_PREVIEW_ONLY',
  mutatesRepository: false,
  createsPullRequest: false,
  sendsNewsletter: false,
  approvedManifestVerification: {
    status: verification.status,
    slug: verification.slug,
    approvedBy: verification.approvedBy,
    approvedAt: verification.approvedAt,
    contentFingerprintSha256: verification.contentFingerprintSha256,
    reviewSnapshotFingerprintSha256:
      verification.reviewSnapshotFingerprintSha256,
    proposalFingerprintSha256: verification.proposalFingerprintSha256,
    publicIssuesFingerprintSha256:
      verification.publicIssuesFingerprintSha256,
  },
  proposedPublication: {
    slug,
    title: candidate.title,
    publishedAt,
    canonicalUrl: verification.canonicalUrl,
    projectedArchivePosition: verification.projectedArchivePosition,
  },
  targetFiles: [
    {
      path: candidateFilePath,
      sha256Before: sha256Text(candidateFileText),
      semanticStateSha256Before: hashJson(editorialCandidates),
      semanticStateSha256After: hashJson(remainingCandidates),
      operation: 'REMOVE_CANDIDATE_BY_SLUG',
      key: slug,
    },
    {
      path: publishedFilePath,
      sha256Before: sha256Text(publishedFileText),
      semanticStateSha256Before: hashJson(publishedEditorialIssues),
      semanticStateSha256After: hashJson(nextPublishedEditorialIssues),
      operation: 'ADD_PUBLISHED_ISSUE',
      key: slug,
    },
  ],
  operations: [
    {
      operation: 'REMOVE_CANDIDATE_BY_SLUG',
      path: candidateFilePath,
      slug,
      expectedCandidateFingerprintSha256:
        verification.contentFingerprintSha256,
    },
    {
      operation: 'ADD_PUBLISHED_ISSUE',
      path: publishedFilePath,
      issue: publishedIssue,
    },
  ],
  expectedSyndicationDelta: {
    rss: {
      addSlug: slug,
      pubDate: manifest.syndication.rssPubDate,
    },
    sitemap: {
      addPath: `/issues/${slug}`,
      lastmod: manifest.syndication.sitemapLastmod,
    },
  },
  blockers,
  readiness:
    blockers.length > 0
      ? 'PATCH_PREVIEW_READY_PUBLICATION_BLOCKED'
      : 'PATCH_PREVIEW_READY',
  humanSummary: summarizeOperations({ slug, publishedAt }),
  mergeBoundary: {
    requiresHumanReview: true,
    requiresHumanMergeDecision: true,
    mayAutoMerge: false,
    mayAutoPublish: false,
  },
}

const json = `${JSON.stringify(preview, null, 2)}\n`

if (output) {
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, json, 'utf8')
  console.log(`Publication patch preview written: ${output}`)
} else {
  process.stdout.write(json)
}
