import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { verifyManifest } from './verify-approved-release-manifest.mjs'

const SLUG = 'trial-03-utamaro-butterfly-dragonfly'
const PUBLISHED_AT = '2026-09-28'
const APPROVED_BY = 'conanxin'
const APPROVED_AT = '2026-09-28T08:05:00Z'

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

manifest.decision.approvalStatus = 'APPROVED'
manifest.decision.approvedBy = APPROVED_BY
manifest.decision.approvedAt = APPROVED_AT
manifest.decision.approvedProposal = {
  contentFingerprintSha256:
    manifest.candidate.contentFingerprintSha256,
  reviewSnapshotFingerprintSha256:
    manifest.reviewSnapshotFingerprintSha256,
  publishedAt: manifest.proposedPublication.publishedAt,
  canonicalUrl: manifest.proposedPublication.canonicalUrl,
  proposalFingerprintSha256:
    manifest.proposalFingerprintSha256,
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
    contentFingerprintSha256:
      verification.contentFingerprintSha256,
    reviewSnapshotFingerprintSha256:
      verification.reviewSnapshotFingerprintSha256,
    proposalFingerprintSha256:
      verification.proposalFingerprintSha256,
    publicIssuesFingerprintSha256:
      verification.publicIssuesFingerprintSha256,
    p12Status: verification.status,
    p13Readiness: preview.readiness,
    blockers: preview.blockers,
  }

  console.log(JSON.stringify(summary, null, 2))
} finally {
  await rm(dir, { recursive: true, force: true })
}
