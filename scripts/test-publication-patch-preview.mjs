import { mkdir, readFile, rm, writeFile, symlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'

const dir = 'tmp-publication-patch-preview-test'
const pendingPath = `${dir}/pending.json`
const approvedPath = `${dir}/approved.json`
const outputDir = 'publication-patch-preview'
const previewPath = `${outputDir}/contract-preview.json`
const symlinkPreviewPath = `${outputDir}/registry-link.json`

await mkdir(dir, { recursive: true })
await rm(outputDir, { recursive: true, force: true })

const candidateFile = 'src/data/editorialCandidates.js'
const publishedFile = 'src/data/publishedEditorialIssues.js'
const [candidateBefore, publishedBefore] = await Promise.all([
  readFile(candidateFile, 'utf8'),
  readFile(publishedFile, 'utf8'),
])

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

const pendingPreview = spawnSync(
  process.execPath,
  ['scripts/generate-publication-patch-preview.mjs', pendingPath],
  { encoding: 'utf8' },
)

if (pendingPreview.status === 0) {
  throw new Error('PENDING manifest must not generate a publication patch preview')
}

const approved = JSON.parse(await readFile(pendingPath, 'utf8'))
approved.decision.approvalStatus = 'APPROVED'
approved.decision.approvedBy = 'p13-contract-test'
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

const directRegistryOutput = spawnSync(
  process.execPath,
  [
    'scripts/generate-publication-patch-preview.mjs',
    approvedPath,
    '--output',
    candidateFile,
  ],
  { encoding: 'utf8' },
)

if (directRegistryOutput.status === 0) {
  throw new Error('Registry source files must be rejected as preview output paths')
}

await mkdir(outputDir, { recursive: true })
await symlink(resolve(candidateFile), symlinkPreviewPath)

const symlinkOutput = spawnSync(
  process.execPath,
  [
    'scripts/generate-publication-patch-preview.mjs',
    approvedPath,
    '--output',
    symlinkPreviewPath,
  ],
  { encoding: 'utf8' },
)

if (symlinkOutput.status === 0) {
  throw new Error('Symlink preview outputs must not be followed or overwritten')
}

const previewRun = spawnSync(
  process.execPath,
  [
    'scripts/generate-publication-patch-preview.mjs',
    approvedPath,
    '--output',
    previewPath,
  ],
  { encoding: 'utf8' },
)

if (previewRun.status !== 0) {
  throw new Error(previewRun.stderr || previewRun.stdout)
}

const preview = JSON.parse(await readFile(previewPath, 'utf8'))

if (
  preview.action !== 'PUBLICATION_PATCH_PREVIEW_ONLY' ||
  preview.mutatesRepository !== false ||
  preview.createsPullRequest !== false ||
  preview.sendsNewsletter !== false
) {
  throw new Error('Patch preview must remain non-mutating and non-publishing')
}

if (preview.approvedManifestVerification.status !== 'PROMOTION_PLAN_VERIFIED') {
  throw new Error('Patch preview must be gated by P12 verification')
}

if (preview.operations.length !== 2) {
  throw new Error('Patch preview must contain exactly two registry operations')
}

const remove = preview.operations.find(
  (item) => item.operation === 'REMOVE_CANDIDATE_BY_SLUG',
)
const add = preview.operations.find(
  (item) => item.operation === 'ADD_PUBLISHED_ISSUE',
)

if (!remove || !add) {
  throw new Error('Patch preview must remove candidate and add published issue')
}

if (remove.slug !== 'trial-03-utamaro-butterfly-dragonfly') {
  throw new Error('Patch preview targets the wrong candidate')
}

if (
  add.issue.slug !== 'trial-03-utamaro-butterfly-dragonfly' ||
  add.issue.publicationStatus !== 'PUBLISHED' ||
  add.issue.publishedAt !== '2099-12-31'
) {
  throw new Error('Published issue projection is incorrect')
}

if (
  preview.readiness !== 'PATCH_PREVIEW_READY_PUBLICATION_BLOCKED' ||
  preview.blockers.length !== 2
) {
  throw new Error('External verification blockers must remain explicit')
}

const sha256 = (value) =>
  createHash('sha256').update(value).digest('hex')

const candidateTarget = preview.targetFiles.find(
  (item) => item.path === candidateFile,
)
const publishedTarget = preview.targetFiles.find(
  (item) => item.path === publishedFile,
)

if (
  candidateTarget?.sha256Before !== sha256(candidateBefore) ||
  publishedTarget?.sha256Before !== sha256(publishedBefore)
) {
  throw new Error('Target file hashes must bind to the exact registry bytes read by the test')
}

if (
  preview.verificationContext?.issuesFile?.publicIssuesFingerprintSha256 !==
  preview.approvedManifestVerification.publicIssuesFingerprintSha256
) {
  throw new Error('Preview public issue context must match P12 verification')
}

const [candidateAfter, publishedAfter] = await Promise.all([
  readFile(candidateFile, 'utf8'),
  readFile(publishedFile, 'utf8'),
])

if (candidateAfter !== candidateBefore || publishedAfter !== publishedBefore) {
  throw new Error('Patch preview generator must not modify registry source files')
}

await rm(dir, { recursive: true, force: true })
await rm(outputDir, { recursive: true, force: true })

console.log(
  'Publication patch preview contract PASS: PENDING rejected; approved manifest uses one verified snapshot; registry and symlink outputs are rejected; two-operation preview preserves external blockers without source mutation',
)
