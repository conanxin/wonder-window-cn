import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { verifyManifest } from './verify-approved-release-manifest.mjs'

const SLUG = 'trial-03-utamaro-butterfly-dragonfly'
const PUBLISHED_AT = '2026-09-28'
const APPROVED_BY = 'conanxin'
const APPROVED_AT = '2026-09-28T08:05:00Z'
const APPROVED_CANONICAL_URL =
  'https://wonder-window-cn.vercel.app/issues/trial-03-utamaro-butterfly-dragonfly'
const APPROVED_CONTENT_FINGERPRINT =
  '7ef2a3a9342e5b777f9c3a5f72d6421db7e050ba72d7541c916beed5e5f07241'
const APPROVED_REVIEW_FINGERPRINT =
  '133daf5759e5f9a8aa8dc6997e0e8fc5008165f8b1d887838d3924d796cc0a3f'
const APPROVED_PROPOSAL_FINGERPRINT =
  '486faa5157136dd160bcf768f1eb0ecb63b5ddab94f306940bc890455c578dbd'
const APPROVED_PUBLIC_ISSUES_FINGERPRINT =
  'c5f74268b8f93a9d36f4019d69f5d9e2ea70faba6638067b71e77eeddedfe957'

function fail(message) {
  throw new Error(message)
}

function runNode(args) {
  const run = spawnSync(process.execPath, args, {
    encoding: 'utf8',
  })

  if (run.status !== 0) {
    fail(run.stderr || run.stdout || `Command failed: node ${args.join(' ')}`)
  }

  return run.stdout
}

const manifest = JSON.parse(
  runNode([
    'scripts/generate-release-manifest.mjs',
    SLUG,
    PUBLISHED_AT,
  ]),
)

if (
  manifest.candidate.contentFingerprintSha256 !==
  APPROVED_CONTENT_FINGERPRINT
) {
  fail('Candidate fingerprint drifted from the human-approved proposal')
}

if (
  manifest.reviewSnapshotFingerprintSha256 !==
  APPROVED_REVIEW_FINGERPRINT
) {
  fail('Human review snapshot drifted from the approved proposal')
}

if (
  manifest.proposalFingerprintSha256 !==
  APPROVED_PROPOSAL_FINGERPRINT
) {
  fail('Full proposal fingerprint drifted from the human-approved proposal')
}

if (
  manifest.proposedPublication.publicIssuesFingerprintSha256 !==
  APPROVED_PUBLIC_ISSUES_FINGERPRINT
) {
  fail('Public issue set drifted from the human-approved proposal')
}

if (
  manifest.proposedPublication.canonicalUrl !==
  APPROVED_CANONICAL_URL
) {
  fail('Canonical URL drifted from the human-approved proposal')
}

if (manifest.proposedPublication.publishedAt !== PUBLISHED_AT) {
  fail('Publication date drifted from the human-approved proposal')
}

manifest.decision.approvalStatus = 'APPROVED'
manifest.decision.approvedBy = APPROVED_BY
manifest.decision.approvedAt = APPROVED_AT
manifest.decision.approvedProposal = {
  contentFingerprintSha256: APPROVED_CONTENT_FINGERPRINT,
  reviewSnapshotFingerprintSha256: APPROVED_REVIEW_FINGERPRINT,
  publishedAt: PUBLISHED_AT,
  canonicalUrl: APPROVED_CANONICAL_URL,
  proposalFingerprintSha256: APPROVED_PROPOSAL_FINGERPRINT,
}

const verification = verifyManifest(manifest)

if (verification.status !== 'PROMOTION_PLAN_VERIFIED') {
  fail(
    `Expected PROMOTION_PLAN_VERIFIED, found ${verification.status}`,
  )
}

const dir = await mkdtemp(join(tmpdir(), 'wonder-window-trial03-approval-'))
const manifestPath = join(dir, 'approved-manifest.json')

try {
  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )

  const preview = JSON.parse(
    runNode([
      'scripts/generate-publication-patch-preview.mjs',
      manifestPath,
    ]),
  )

  if (
    preview.action !== 'PUBLICATION_PATCH_PREVIEW_ONLY' ||
    preview.mutatesRepository !== false ||
    preview.createsPullRequest !== false ||
    preview.sendsNewsletter !== false
  ) {
    fail('Publication patch preview crossed the non-mutating boundary')
  }

  if (
    preview.approvedManifestVerification.status !==
    'PROMOTION_PLAN_VERIFIED'
  ) {
    fail('Patch preview is not gated by the exact approved manifest')
  }

  if (
    preview.proposedPublication.slug !== SLUG ||
    preview.proposedPublication.publishedAt !== PUBLISHED_AT
  ) {
    fail('Patch preview diverges from the approved slug/date')
  }

  if (preview.operations.length !== 2) {
    fail('Approved patch preview must contain exactly two registry operations')
  }

  if (
    preview.readiness !==
    'PATCH_PREVIEW_READY_PUBLICATION_BLOCKED'
  ) {
    fail(
      `Expected external verification blockers to remain open, found ${preview.readiness}`,
    )
  }

  const summary = {
    status: 'TRIAL03_APPROVAL_LOCK_VERIFIED',
    slug: SLUG,
    publishedAt: PUBLISHED_AT,
    approvedBy: APPROVED_BY,
    approvedAt: APPROVED_AT,
    canonicalUrl: verification.canonicalUrl,
    contentFingerprintSha256: APPROVED_CONTENT_FINGERPRINT,
    reviewSnapshotFingerprintSha256: APPROVED_REVIEW_FINGERPRINT,
    proposalFingerprintSha256: APPROVED_PROPOSAL_FINGERPRINT,
    publicIssuesFingerprintSha256:
      APPROVED_PUBLIC_ISSUES_FINGERPRINT,
    p12Status: verification.status,
    p13Readiness: preview.readiness,
    blockers: preview.blockers,
  }

  console.log(JSON.stringify(summary, null, 2))
} finally {
  await rm(dir, { recursive: true, force: true })
}
