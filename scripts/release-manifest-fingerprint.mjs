import { createHash } from 'node:crypto'

export function hashJson(value) {
  return createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex')
}

export function candidateFingerprint(candidate) {
  return hashJson(candidate)
}

export const UNRESOLVED_EXTERNAL_VERIFICATION = [
  'Confirm the canonical Production site URL is the intended public domain before publication.',
  'Confirm the final public issue route is remotely reachable after a real publication deployment.',
]

export function buildReviewSnapshot(candidate) {
  return {
    candidate: {
      id: candidate.id,
      slug: candidate.slug,
      title: candidate.title,
      currentStatus: candidate.publicationStatus,
      schemaVersion: candidate.schemaVersion,
      issueType: candidate.issueType,
      issueTypeLabel: candidate.issueTypeLabel,
      notionUrl: candidate.notionUrl || null,
    },
    editorial: {
      coreQuestion: candidate.coreQuestion,
      editorialPoint: candidate.editorialPoint,
      editorialPath: candidate.editorialPath,
      closingQuestion: candidate.closingQuestion,
    },
    evidenceBoundary: candidate.evidenceBoundary || [],
    media: (candidate.media || []).map((item) => ({
      kind: item.kind,
      assetUrl: item.src || null,
      alt: item.alt || null,
      rightsStatus: item.rightsStatus,
      sourceUrl: item.sourceUrl,
      caption: item.caption || null,
    })),
    sources: candidate.sources || [],
    unresolvedExternalVerification: UNRESOLVED_EXTERNAL_VERIFICATION,
  }
}

export function reviewSnapshotFingerprint(snapshot) {
  return hashJson(snapshot)
}

export function publicIssuesFingerprint(issues) {
  const orderedSnapshot = issues.map((issue) => ({
    id: issue.id,
    slug: issue.slug,
    publishedAt: issue.publishedAt,
    schemaVersion: issue.schemaVersion,
    contentFingerprintSha256: hashJson(issue),
  }))

  return hashJson(orderedSnapshot)
}

export function buildProposalSnapshot({
  candidateFingerprintSha256,
  proposedPublication,
  syndication,
  migrationPlan,
  publicIssuesFingerprintSha256,
  reviewSnapshotFingerprintSha256,
}) {
  return {
    candidateFingerprintSha256,
    publicationStatus: proposedPublication.publicationStatus,
    publishedAt: proposedPublication.publishedAt,
    canonicalUrl: proposedPublication.canonicalUrl,
    projectedArchivePosition: proposedPublication.projectedArchivePosition,
    publicIssueCountBefore: proposedPublication.publicIssueCountBefore,
    publicIssueCountAfter: proposedPublication.publicIssueCountAfter,
    publicIssuesFingerprintSha256,
    reviewSnapshotFingerprintSha256,
    rssPubDate: syndication.rssPubDate,
    sitemapLastmod: syndication.sitemapLastmod,
    migrationPlan: {
      sourceRegistry: migrationPlan.sourceRegistry,
      targetRegistry: migrationPlan.targetRegistry,
      removeCandidateRecord: migrationPlan.removeCandidateRecord,
      addPublishedRecord: migrationPlan.addPublishedRecord,
      setPublicationStatus: migrationPlan.setPublicationStatus,
      setPublishedAt: migrationPlan.setPublishedAt,
    },
  }
}

export function proposalFingerprint(snapshot) {
  return hashJson(snapshot)
}
