import { readFile, mkdir, writeFile, lstat } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { publishedEditorialIssues } from '../src/data/publishedEditorialIssues.js'
import { hashJson } from './release-manifest-fingerprint.mjs'
import { verifyManifest } from './verify-approved-release-manifest.mjs'

function fail(message) {
  throw new Error(message)
}

function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex')
}

const PREVIEW_OUTPUT_ROOT = resolve('publication-patch-preview')

function parseArgs(argv) {
  const [manifestPath, ...rest] = argv
  if (!manifestPath) {
    fail(
      'Usage: npm run preview:publication-patch -- <approved-manifest.json> [--output publication-patch-preview/<name>.json]',
    )
  }

  const outputIndex = rest.indexOf('--output')
  const output =
    outputIndex >= 0 && rest[outputIndex + 1] ? rest[outputIndex + 1] : null

  return { manifestPath, output }
}

async function resolveSafeOutputPath(output) {
  if (!output) {
    return null
  }

  const requested = resolve(output)
  if (dirname(requested) !== PREVIEW_OUTPUT_ROOT) {
    fail(
      'Publication patch preview output must be a direct JSON file inside publication-patch-preview/',
    )
  }

  const name = basename(requested)
  if (!/^[A-Za-z0-9._-]+\.json$/.test(name)) {
    fail('Publication patch preview output filename must be a simple .json filename')
  }

  await mkdir(PREVIEW_OUTPUT_ROOT, { recursive: true })
  const rootStat = await lstat(PREVIEW_OUTPUT_ROOT)
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    fail('publication-patch-preview/ must be a real directory, not a symlink')
  }

  return requested
}

function verifyApprovedManifest(manifest) {
  try {
    return verifyManifest(manifest)
  } catch (error) {
    fail(
      `Publication patch preview blocked by approved-manifest verifier:\n${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function summarizeOperations({ slug, publishedAt }) {
  return [
    `Remove READY candidate "${slug}" from src/data/editorialCandidates.js`,
    `Add the same issue to src/data/publishedEditorialIssues.js with publicationStatus=PUBLISHED and publishedAt=${publishedAt}`,
    'Regenerate RSS and sitemap through the existing build/prebuild pipeline',
  ]
}

const { manifestPath, output } = parseArgs(process.argv.slice(2))
const manifestText = await readFile(manifestPath, 'utf8')
const manifest = JSON.parse(manifestText)
const verification = verifyApprovedManifest(manifest)
const outputPath = await resolveSafeOutputPath(output)

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

if (outputPath) {
  await writeFile(outputPath, json, {
    encoding: 'utf8',
    flag: 'wx',
    mode: 0o600,
  })
  console.log(`Publication patch preview written: ${outputPath}`)
} else {
  process.stdout.write(json)
}
