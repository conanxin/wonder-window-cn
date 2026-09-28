import { createHash } from 'node:crypto'

export function hashJson(value) {
  return createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex')
}

export function candidateFingerprint(candidate) {
  return hashJson(candidate)
}

export function buildProposalSnapshot({
  candidateFingerprintSha256,
  proposedPublication,
  syndication,
  migrationPlan,
}) {
  return {
    candidateFingerprintSha256,
    publicationStatus: proposedPublication.publicationStatus,
    publishedAt: proposedPublication.publishedAt,
    canonicalUrl: proposedPublication.canonicalUrl,
    projectedArchivePosition: proposedPublication.projectedArchivePosition,
    publicIssueCountBefore: proposedPublication.publicIssueCountBefore,
    publicIssueCountAfter: proposedPublication.publicIssueCountAfter,
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
