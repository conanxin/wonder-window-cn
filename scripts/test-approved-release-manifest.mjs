import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import {
  buildProposalSnapshot,
  proposalFingerprint,
  reviewSnapshotFingerprint,
} from './release-manifest-fingerprint.mjs'

const dir = 'tmp-approved-manifest-test'
const pendingPath = `${dir}/pending.json`
const approvedPath = `${dir}/approved.json`
const stalePath = `${dir}/stale.json`
const wrongUrlPath = `${dir}/wrong-url.json`
const invalidApprovedAtPath = `${dir}/invalid-approved-at.json`
const staleProposalPath = `${dir}/stale-proposal.json`
const stalePublicSetPath = `${dir}/stale-public-set.json`
const tamperedReviewPath = `${dir}/tampered-review.json`
const tamperedCandidatePath = `${dir}/tampered-candidate.json`
const futureApprovedAtPath = `${dir}/future-approved-at.json`
const tamperedWarningsPath = `${dir}/tampered-warnings.json`

await mkdir(dir, { recursive: true })

function runVerifier(path) {
  return spawnSync(
    process.execPath,
    ['scripts/verify-approved-release-manifest.mjs', path],
    { encoding: 'utf8' },
  )
}

const generated = spawnSync(
  process.execPath,
  [
    'scripts/generate-release-manifest.mjs',
    'trial-03-utamaro-butterfly-dragonfly',
    '2099-12-31',
    '--output',
    pendingPath,
  ],
  { encoding: 'utf8' },
)

if (generated.status !== 0) {
  throw new Error(generated.stderr || generated.stdout)
}

const pending = JSON.parse(await readFile(pendingPath, 'utf8'))

if (runVerifier(pendingPath).status === 0) {
  throw new Error('PENDING manifest must not pass approved-manifest verifier')
}

const approved = structuredClone(pending)
approved.decision.approvalStatus = 'APPROVED'
approved.decision.approvedBy = 'p12-contract-test'
approved.decision.approvedAt = '2026-09-28T00:00:00Z'
approved.decision.approvedProposal = {
  contentFingerprintSha256: approved.candidate.contentFingerprintSha256,
  reviewSnapshotFingerprintSha256:
    approved.reviewSnapshotFingerprintSha256,
  publishedAt: approved.proposedPublication.publishedAt,
  canonicalUrl: approved.proposedPublication.canonicalUrl,
  proposalFingerprintSha256: approved.proposalFingerprintSha256,
}
await writeFile(approvedPath, JSON.stringify(approved, null, 2))

const verified = runVerifier(approvedPath)
if (verified.status !== 0) {
  throw new Error(verified.stderr || verified.stdout)
}

const verifiedResult = JSON.parse(verified.stdout)
if (
  verifiedResult.status !== 'PROMOTION_PLAN_VERIFIED' ||
  verifiedResult.mutatesRepository !== false
) {
  throw new Error('Approved manifest verifier returned an invalid result')
}

const stale = structuredClone(approved)
stale.candidate.contentFingerprintSha256 =
  '0'.repeat(64)
await writeFile(stalePath, JSON.stringify(stale, null, 2))

if (runVerifier(stalePath).status === 0) {
  throw new Error('Stale candidate fingerprint must fail verification')
}

const wrongUrl = structuredClone(approved)
wrongUrl.proposedPublication.canonicalUrl =
  'https://example.invalid/issues/trial-03-utamaro-butterfly-dragonfly'
await writeFile(wrongUrlPath, JSON.stringify(wrongUrl, null, 2))

if (runVerifier(wrongUrlPath).status === 0) {
  throw new Error('Stale canonical URL must fail verification')
}

const invalidApprovedAt = structuredClone(approved)
invalidApprovedAt.decision.approvedAt = '2099-02-31T00:00:00Z'
await writeFile(
  invalidApprovedAtPath,
  JSON.stringify(invalidApprovedAt, null, 2),
)

if (runVerifier(invalidApprovedAtPath).status === 0) {
  throw new Error('Impossible approval timestamp must fail verification')
}

const staleProposal = structuredClone(approved)
staleProposal.decision.approvedProposal.proposalFingerprintSha256 =
  '0'.repeat(64)
await writeFile(staleProposalPath, JSON.stringify(staleProposal, null, 2))

if (runVerifier(staleProposalPath).status === 0) {
  throw new Error('Stale approved proposal fingerprint must fail verification')
}

const stalePublicSet = structuredClone(approved)
stalePublicSet.proposedPublication.publicIssuesFingerprintSha256 =
  '0'.repeat(64)
const stalePublicProposalSnapshot = buildProposalSnapshot({
  candidateFingerprintSha256:
    stalePublicSet.candidate.contentFingerprintSha256,
  proposedPublication: stalePublicSet.proposedPublication,
  syndication: stalePublicSet.syndication,
  migrationPlan: stalePublicSet.migrationPlan,
  publicIssuesFingerprintSha256:
    stalePublicSet.proposedPublication.publicIssuesFingerprintSha256,
  reviewSnapshotFingerprintSha256:
    stalePublicSet.reviewSnapshotFingerprintSha256,
})
stalePublicSet.proposalFingerprintSha256 = proposalFingerprint(
  stalePublicProposalSnapshot,
)
stalePublicSet.decision.approvedProposal.proposalFingerprintSha256 =
  stalePublicSet.proposalFingerprintSha256
await writeFile(
  stalePublicSetPath,
  JSON.stringify(stalePublicSet, null, 2),
)

if (runVerifier(stalePublicSetPath).status === 0) {
  throw new Error('Stale public issue set must fail verification')
}

const tamperedReview = structuredClone(approved)
tamperedReview.sources = []
const tamperedReviewSnapshot = {
  candidate: {
    id: tamperedReview.candidate.id,
    slug: tamperedReview.candidate.slug,
    title: tamperedReview.candidate.title,
    currentStatus: tamperedReview.candidate.currentStatus,
    schemaVersion: tamperedReview.candidate.schemaVersion,
    issueType: tamperedReview.candidate.issueType,
    issueTypeLabel: tamperedReview.candidate.issueTypeLabel,
    notionUrl: tamperedReview.candidate.notionUrl,
  },
  editorial: tamperedReview.editorial,
  evidenceBoundary: tamperedReview.evidenceBoundary,
  media: tamperedReview.media,
  sources: tamperedReview.sources,
  unresolvedExternalVerification:
    tamperedReview.unresolvedExternalVerification,
}
tamperedReview.reviewSnapshotFingerprintSha256 =
  reviewSnapshotFingerprint(tamperedReviewSnapshot)
const tamperedProposalSnapshot = buildProposalSnapshot({
  candidateFingerprintSha256:
    tamperedReview.candidate.contentFingerprintSha256,
  proposedPublication: tamperedReview.proposedPublication,
  syndication: tamperedReview.syndication,
  migrationPlan: tamperedReview.migrationPlan,
  publicIssuesFingerprintSha256:
    tamperedReview.proposedPublication.publicIssuesFingerprintSha256,
  reviewSnapshotFingerprintSha256:
    tamperedReview.reviewSnapshotFingerprintSha256,
})
tamperedReview.proposalFingerprintSha256 =
  proposalFingerprint(tamperedProposalSnapshot)
tamperedReview.decision.approvedProposal.reviewSnapshotFingerprintSha256 =
  tamperedReview.reviewSnapshotFingerprintSha256
tamperedReview.decision.approvedProposal.proposalFingerprintSha256 =
  tamperedReview.proposalFingerprintSha256
await writeFile(
  tamperedReviewPath,
  JSON.stringify(tamperedReview, null, 2),
)

if (runVerifier(tamperedReviewPath).status === 0) {
  throw new Error('Tampered human review packet must fail verification')
}

const tamperedCandidate = structuredClone(approved)
tamperedCandidate.candidate.notionUrl =
  'https://app.notion.com/p/not-the-approved-candidate'
tamperedCandidate.candidate.currentStatus = 'PUBLISHED'
const tamperedCandidateSnapshot = {
  candidate: {
    id: tamperedCandidate.candidate.id,
    slug: tamperedCandidate.candidate.slug,
    title: tamperedCandidate.candidate.title,
    currentStatus: tamperedCandidate.candidate.currentStatus,
    schemaVersion: tamperedCandidate.candidate.schemaVersion,
    issueType: tamperedCandidate.candidate.issueType,
    issueTypeLabel: tamperedCandidate.candidate.issueTypeLabel,
    notionUrl: tamperedCandidate.candidate.notionUrl,
  },
  editorial: tamperedCandidate.editorial,
  evidenceBoundary: tamperedCandidate.evidenceBoundary,
  media: tamperedCandidate.media,
  sources: tamperedCandidate.sources,
  unresolvedExternalVerification:
    tamperedCandidate.unresolvedExternalVerification,
}
tamperedCandidate.reviewSnapshotFingerprintSha256 =
  reviewSnapshotFingerprint(tamperedCandidateSnapshot)
const tamperedCandidateProposalSnapshot = buildProposalSnapshot({
  candidateFingerprintSha256:
    tamperedCandidate.candidate.contentFingerprintSha256,
  proposedPublication: tamperedCandidate.proposedPublication,
  syndication: tamperedCandidate.syndication,
  migrationPlan: tamperedCandidate.migrationPlan,
  publicIssuesFingerprintSha256:
    tamperedCandidate.proposedPublication.publicIssuesFingerprintSha256,
  reviewSnapshotFingerprintSha256:
    tamperedCandidate.reviewSnapshotFingerprintSha256,
})
tamperedCandidate.proposalFingerprintSha256 =
  proposalFingerprint(tamperedCandidateProposalSnapshot)
tamperedCandidate.decision.approvedProposal.reviewSnapshotFingerprintSha256 =
  tamperedCandidate.reviewSnapshotFingerprintSha256
tamperedCandidate.decision.approvedProposal.proposalFingerprintSha256 =
  tamperedCandidate.proposalFingerprintSha256
await writeFile(
  tamperedCandidatePath,
  JSON.stringify(tamperedCandidate, null, 2),
)

if (runVerifier(tamperedCandidatePath).status === 0) {
  throw new Error('Tampered displayed candidate fields must fail verification')
}

const futureApprovedAt = structuredClone(approved)
futureApprovedAt.decision.approvedAt = '2099-12-01T00:00:00Z'
await writeFile(
  futureApprovedAtPath,
  JSON.stringify(futureApprovedAt, null, 2),
)

if (runVerifier(futureApprovedAtPath).status === 0) {
  throw new Error('Future approval timestamp must fail verification')
}

const tamperedWarnings = structuredClone(approved)
tamperedWarnings.unresolvedExternalVerification = []
const tamperedWarningsSnapshot = {
  candidate: {
    id: tamperedWarnings.candidate.id,
    slug: tamperedWarnings.candidate.slug,
    title: tamperedWarnings.candidate.title,
    currentStatus: tamperedWarnings.candidate.currentStatus,
    schemaVersion: tamperedWarnings.candidate.schemaVersion,
    issueType: tamperedWarnings.candidate.issueType,
    issueTypeLabel: tamperedWarnings.candidate.issueTypeLabel,
    notionUrl: tamperedWarnings.candidate.notionUrl,
  },
  editorial: tamperedWarnings.editorial,
  evidenceBoundary: tamperedWarnings.evidenceBoundary,
  media: tamperedWarnings.media,
  sources: tamperedWarnings.sources,
  unresolvedExternalVerification:
    tamperedWarnings.unresolvedExternalVerification,
}
tamperedWarnings.reviewSnapshotFingerprintSha256 =
  reviewSnapshotFingerprint(tamperedWarningsSnapshot)
const tamperedWarningsProposalSnapshot = buildProposalSnapshot({
  candidateFingerprintSha256:
    tamperedWarnings.candidate.contentFingerprintSha256,
  proposedPublication: tamperedWarnings.proposedPublication,
  syndication: tamperedWarnings.syndication,
  migrationPlan: tamperedWarnings.migrationPlan,
  publicIssuesFingerprintSha256:
    tamperedWarnings.proposedPublication.publicIssuesFingerprintSha256,
  reviewSnapshotFingerprintSha256:
    tamperedWarnings.reviewSnapshotFingerprintSha256,
})
tamperedWarnings.proposalFingerprintSha256 =
  proposalFingerprint(tamperedWarningsProposalSnapshot)
tamperedWarnings.decision.approvedProposal.reviewSnapshotFingerprintSha256 =
  tamperedWarnings.reviewSnapshotFingerprintSha256
tamperedWarnings.decision.approvedProposal.proposalFingerprintSha256 =
  tamperedWarnings.proposalFingerprintSha256
await writeFile(
  tamperedWarningsPath,
  JSON.stringify(tamperedWarnings, null, 2),
)

if (runVerifier(tamperedWarningsPath).status === 0) {
  throw new Error(
    'Tampered external verification warnings must fail verification',
  )
}

await rm(dir, { recursive: true, force: true })

console.log(
  'Approved manifest verification contract PASS: PENDING rejected; approved current manifest accepted; stale fingerprint, URL, impossible/future approval timestamps, proposal fingerprint, public issue set, tampered review packet, candidate display fields, and external verification warnings rejected',
)
