import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildProposalSnapshot,
  buildReviewSnapshot,
  candidateFingerprint,
  proposalFingerprint,
  publicIssuesFingerprint,
  reviewSnapshotFingerprint,
} from './release-manifest-fingerprint.mjs'
import { spawnSync } from 'node:child_process'
import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { issues } from '../src/data/issues.js'
import { absoluteUrl } from '../src/siteConfig.js'
import { validateIssue } from './publication-contract.mjs'

function fail(message) {
  throw new Error(message)
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    fail(`Approved manifest missing ${label}`)
  }
}

function requireApprovedDecision(manifest) {
  if (Object.prototype.hasOwnProperty.call(manifest, 'sourceContext')) {
    fail('Approved manifest must not contain unverifiable sourceContext provenance')
  }

  if (manifest.manifestVersion !== 1) {
    fail(`Unsupported manifestVersion: ${String(manifest.manifestVersion)}`)
  }

  if (manifest.action !== 'PUBLICATION_DECISION_ONLY') {
    fail('Manifest action must remain PUBLICATION_DECISION_ONLY')
  }

  if (manifest.mutatesRepository !== false || manifest.sendsNewsletter !== false) {
    fail('Approved manifest must remain non-mutating and must not send newsletter')
  }

  if (manifest.decision?.requiresExplicitApproval !== true) {
    fail('Manifest must require explicit approval')
  }

  if (manifest.decision?.approvalStatus !== 'APPROVED') {
    fail(
      `Manifest is not approved: ${String(manifest.decision?.approvalStatus)}`,
    )
  }

  requireString(manifest.decision.approvedBy, 'decision.approvedBy')
  requireString(manifest.decision.approvedAt, 'decision.approvedAt')

  if (!manifest.decision.approvedProposal) {
    fail('Approved manifest missing decision.approvedProposal snapshot')
  }

  const approvedAt = manifest.decision.approvedAt
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(
      approvedAt,
    )
  ) {
    fail('decision.approvedAt must be a valid UTC ISO-8601 timestamp')
  }

  const approvedDate = new Date(approvedAt)
  const normalizedApprovedAt = approvedAt.includes('.')
    ? approvedAt
    : approvedAt.replace(/Z$/, '.000Z')

  if (
    Number.isNaN(approvedDate.getTime()) ||
    approvedDate.toISOString() !== normalizedApprovedAt
  ) {
    fail('decision.approvedAt must be a real UTC calendar timestamp')
  }

  const maxClockSkewMs = 5 * 60 * 1000
  if (approvedDate.getTime() > Date.now() + maxClockSkewMs) {
    fail('decision.approvedAt cannot be in the future')
  }
}

function runCurrentRehearsal(slug, publishedAt) {
  const rehearsal = spawnSync(
    process.execPath,
    ['scripts/rehearse-release.mjs', slug, publishedAt],
    { encoding: 'utf8' },
  )

  if (rehearsal.status !== 0) {
    fail(
      `Approved manifest no longer passes current release rehearsal:\n${rehearsal.stderr || rehearsal.stdout}`,
    )
  }
}

export function verifyManifest(manifest) {
  requireApprovedDecision(manifest)

  requireString(manifest.candidate?.slug, 'candidate.slug')
  const candidate = editorialCandidates.find(
    (item) => item.slug === manifest.candidate.slug,
  )

  if (!candidate) {
    fail(`Current editorial candidate not found: ${manifest.candidate.slug}`)
  }

  if (candidate.publicationStatus !== 'READY') {
    fail(
      `${candidate.slug}: current candidate must still be READY, found ${candidate.publicationStatus}`,
    )
  }

  for (const [field, current] of [
    ['id', candidate.id],
    ['title', candidate.title],
    ['schemaVersion', candidate.schemaVersion],
    ['issueType', candidate.issueType],
  ]) {
    if (manifest.candidate[field] !== current) {
      fail(
        `${candidate.slug}: manifest candidate.${field} no longer matches current candidate`,
      )
    }
  }

  const currentFingerprint = candidateFingerprint(candidate)
  if (manifest.candidate.contentFingerprintSha256 !== currentFingerprint) {
    fail(
      `${candidate.slug}: approved manifest fingerprint does not match current candidate`,
    )
  }

  const currentReviewSnapshot = buildReviewSnapshot(candidate)
  const currentReviewSnapshotFingerprint =
    reviewSnapshotFingerprint(currentReviewSnapshot)

  if (
    manifest.reviewSnapshotFingerprintSha256 !==
    currentReviewSnapshotFingerprint
  ) {
    fail(
      `${candidate.slug}: human review snapshot fingerprint does not match current candidate`,
    )
  }

  const manifestReviewSnapshot = {
    candidate: {
      id: manifest.candidate.id,
      slug: manifest.candidate.slug,
      title: manifest.candidate.title,
      currentStatus: manifest.candidate.currentStatus,
      schemaVersion: manifest.candidate.schemaVersion,
      issueType: manifest.candidate.issueType,
      issueTypeLabel: manifest.candidate.issueTypeLabel,
      notionUrl: manifest.candidate.notionUrl,
    },
    editorial: manifest.editorial,
    evidenceBoundary: manifest.evidenceBoundary,
    media: manifest.media,
    sources: manifest.sources,
    unresolvedExternalVerification:
      manifest.unresolvedExternalVerification,
  }

  if (
    reviewSnapshotFingerprint(manifestReviewSnapshot) !==
    currentReviewSnapshotFingerprint
  ) {
    fail(
      `${candidate.slug}: human review fields do not match the current candidate`,
    )
  }

  if (manifest.proposedPublication?.publicationStatus !== 'PUBLISHED') {
    fail('Approved manifest must propose publicationStatus=PUBLISHED')
  }

  requireString(
    manifest.proposedPublication?.publishedAt,
    'proposedPublication.publishedAt',
  )

  const publishedAt = manifest.proposedPublication.publishedAt
  const projectedIssue = {
    ...candidate,
    publicationStatus: 'PUBLISHED',
    publishedAt,
  }
  const contractErrors = validateIssue(projectedIssue, {
    requirePublishedAt: true,
  })

  if (contractErrors.length) {
    fail(
      `${candidate.slug}: approved manifest fails current publication contract:\n- ${contractErrors.join('\n- ')}`,
    )
  }

  runCurrentRehearsal(candidate.slug, publishedAt)

  const canonicalUrl = absoluteUrl(`/issues/${candidate.slug}`)
  if (manifest.proposedPublication.canonicalUrl !== canonicalUrl) {
    fail(
      `${candidate.slug}: canonical URL changed since manifest approval; regenerate manifest`,
    )
  }

  const projectedIssues = [...issues, projectedIssue].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  )
  const projectedArchivePosition =
    projectedIssues.findIndex((issue) => issue.slug === candidate.slug) + 1

  if (
    manifest.proposedPublication.projectedArchivePosition !==
    projectedArchivePosition
  ) {
    fail(
      `${candidate.slug}: projected archive position changed; regenerate manifest`,
    )
  }

  if (manifest.proposedPublication.publicIssueCountBefore !== issues.length) {
    fail(
      `${candidate.slug}: public issue count changed since approval; regenerate manifest`,
    )
  }

  if (
    manifest.proposedPublication.publicIssueCountAfter !==
    issues.length + 1
  ) {
    fail(`${candidate.slug}: invalid projected public issue count`)
  }

  const currentPublicIssuesFingerprint = publicIssuesFingerprint(issues)
  if (
    manifest.proposedPublication.publicIssuesFingerprintSha256 !==
    currentPublicIssuesFingerprint
  ) {
    fail(
      `${candidate.slug}: public issue set changed since approval; regenerate manifest`,
    )
  }

  const rssPubDate = new Date(
    `${publishedAt}T08:00:00+08:00`,
  ).toUTCString()

  if (manifest.syndication?.rssPubDate !== rssPubDate) {
    fail(`${candidate.slug}: RSS pubDate no longer matches approved manifest`)
  }

  if (manifest.syndication?.sitemapLastmod !== publishedAt) {
    fail(`${candidate.slug}: sitemap lastmod no longer matches approved date`)
  }

  const plan = manifest.migrationPlan || {}
  if (
    plan.sourceRegistry !== 'src/data/editorialCandidates.js' ||
    plan.targetRegistry !== 'src/data/publishedEditorialIssues.js' ||
    plan.removeCandidateRecord !== true ||
    plan.addPublishedRecord !== true ||
    plan.setPublicationStatus !== 'PUBLISHED' ||
    plan.setPublishedAt !== publishedAt
  ) {
    fail(`${candidate.slug}: migration plan is incomplete or stale`)
  }

  const currentProposalSnapshot = buildProposalSnapshot({
    candidateFingerprintSha256: currentFingerprint,
    proposedPublication: {
      publicationStatus: 'PUBLISHED',
      publishedAt,
      canonicalUrl,
      projectedArchivePosition,
      publicIssueCountBefore: issues.length,
      publicIssueCountAfter: issues.length + 1,
    },
    syndication: {
      rssPubDate,
      sitemapLastmod: publishedAt,
    },
    migrationPlan: plan,
    publicIssuesFingerprintSha256: currentPublicIssuesFingerprint,
    reviewSnapshotFingerprintSha256:
      currentReviewSnapshotFingerprint,
  })
  const currentProposalFingerprint = proposalFingerprint(
    currentProposalSnapshot,
  )

  if (manifest.proposalFingerprintSha256 !== currentProposalFingerprint) {
    fail(
      `${candidate.slug}: manifest proposal fingerprint is stale; regenerate manifest`,
    )
  }

  const approvedProposal = manifest.decision.approvedProposal
  if (
    approvedProposal.contentFingerprintSha256 !== currentFingerprint ||
    approvedProposal.reviewSnapshotFingerprintSha256 !==
      currentReviewSnapshotFingerprint ||
    approvedProposal.publishedAt !== publishedAt ||
    approvedProposal.canonicalUrl !== canonicalUrl ||
    approvedProposal.proposalFingerprintSha256 !==
      currentProposalFingerprint
  ) {
    fail(
      `${candidate.slug}: approved proposal snapshot does not match current proposal`,
    )
  }

  return {
    status: 'PROMOTION_PLAN_VERIFIED',
    slug: candidate.slug,
    title: candidate.title,
    approvedBy: manifest.decision.approvedBy,
    approvedAt: manifest.decision.approvedAt,
    contentFingerprintSha256: currentFingerprint,
    reviewSnapshotFingerprintSha256:
      currentReviewSnapshotFingerprint,
    publishedAt,
    canonicalUrl,
    projectedArchivePosition,
    publicIssuesFingerprintSha256: currentPublicIssuesFingerprint,
    proposalFingerprintSha256: currentProposalFingerprint,
    mutatesRepository: false,
  }
}

const isDirectInvocation =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isDirectInvocation) {
  const [manifestPath] = process.argv.slice(2)

  if (!manifestPath) {
    fail('Usage: npm run verify:approved-manifest -- <manifest.json>')
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const result = verifyManifest(manifest)

  console.log(JSON.stringify(result, null, 2))
}
