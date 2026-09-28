import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  buildProposalSnapshot,
  buildReviewSnapshot,
  candidateFingerprint,
  proposalFingerprint,
  publicIssuesFingerprint,
  reviewSnapshotFingerprint,
} from './release-manifest-fingerprint.mjs'
import { editorialCandidates } from '../src/data/editorialCandidates.js'
import { issues } from '../src/data/issues.js'
import { absoluteUrl } from '../src/siteConfig.js'

function fail(message) {
  throw new Error(message)
}

function parseArgs(argv) {
  const [slug, publishedAt, ...rest] = argv

  if (!slug || !publishedAt) {
    fail(
      'Usage: npm run release:manifest -- <candidate-slug> <YYYY-MM-DD> [--output <path>]',
    )
  }

  const outputIndex = rest.indexOf('--output')
  const output =
    outputIndex >= 0 && rest[outputIndex + 1] ? rest[outputIndex + 1] : null

  return { slug, publishedAt, output }
}

function runRehearsal(slug, publishedAt) {
  const rehearsal = spawnSync(
    process.execPath,
    ['scripts/rehearse-release.mjs', slug, publishedAt],
    { encoding: 'utf8' },
  )

  if (rehearsal.status !== 0) {
    fail(
      `Release manifest blocked by rehearsal:\n${rehearsal.stderr || rehearsal.stdout}`,
    )
  }

  return rehearsal.stdout.trim()
}

function buildManifest(candidate, publishedAt, rehearsalOutput) {
  const projectedIssues = [
    ...issues,
    {
      ...candidate,
      publicationStatus: 'PUBLISHED',
      publishedAt,
    },
  ].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))

  const projectedArchivePosition =
    projectedIssues.findIndex((issue) => issue.slug === candidate.slug) + 1

  const candidateFingerprintSha256 = candidateFingerprint(candidate)
  const reviewSnapshot = buildReviewSnapshot(candidate)
  const reviewSnapshotFingerprintSha256 =
    reviewSnapshotFingerprint(reviewSnapshot)
  const publicIssuesFingerprintSha256 = publicIssuesFingerprint(issues)
  const proposedPublication = {
    publicationStatus: 'PUBLISHED',
    publishedAt,
    canonicalUrl: absoluteUrl(`/issues/${candidate.slug}`),
    projectedArchivePosition,
    publicIssueCountBefore: issues.length,
    publicIssueCountAfter: issues.length + 1,
    publicIssuesFingerprintSha256,
  }
  const syndication = {
    rssPubDate: new Date(`${publishedAt}T08:00:00+08:00`).toUTCString(),
    sitemapLastmod: publishedAt,
  }
  const migrationPlan = {
    sourceRegistry: 'src/data/editorialCandidates.js',
    targetRegistry: 'src/data/publishedEditorialIssues.js',
    removeCandidateRecord: true,
    addPublishedRecord: true,
    setPublicationStatus: 'PUBLISHED',
    setPublishedAt: publishedAt,
  }
  const proposalSnapshot = buildProposalSnapshot({
    candidateFingerprintSha256,
    proposedPublication,
    syndication,
    migrationPlan,
    publicIssuesFingerprintSha256,
    reviewSnapshotFingerprintSha256,
  })

  return {
    manifestVersion: 1,
    action: 'PUBLICATION_DECISION_ONLY',
    mutatesRepository: false,
    sendsNewsletter: false,
    candidate: {
      ...reviewSnapshot.candidate,
      contentFingerprintSha256: candidateFingerprintSha256,
    },
    decision: {
      requiresExplicitApproval: true,
      approvalStatus: 'PENDING',
      approvedBy: null,
      approvedAt: null,
      approvedProposal: null,
    },
    reviewSnapshotFingerprintSha256,
    proposalFingerprintSha256: proposalFingerprint(proposalSnapshot),
    proposedPublication,
    syndication,
    editorial: reviewSnapshot.editorial,
    evidenceBoundary: reviewSnapshot.evidenceBoundary,
    media: reviewSnapshot.media,
    sources: reviewSnapshot.sources,
    migrationPlan,
    rehearsal: {
      passed: true,
      output: rehearsalOutput,
    },
    unresolvedExternalVerification:
      reviewSnapshot.unresolvedExternalVerification,
  }
}

const { slug, publishedAt, output } = parseArgs(process.argv.slice(2))
const candidate = editorialCandidates.find((item) => item.slug === slug)

if (!candidate) {
  fail(`Editorial candidate not found: ${slug}`)
}

const rehearsalOutput = runRehearsal(slug, publishedAt)
const manifest = buildManifest(candidate, publishedAt, rehearsalOutput)
const json = `${JSON.stringify(manifest, null, 2)}\n`

if (output) {
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, json, 'utf8')
  console.log(`Release decision manifest written: ${output}`)
} else {
  process.stdout.write(json)
}
