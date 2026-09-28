import { readFile, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const output = 'tmp-release-manifest/trial-03.json'
const run = spawnSync(
  process.execPath,
  [
    'scripts/generate-release-manifest.mjs',
    'trial-03-utamaro-butterfly-dragonfly',
    '2099-12-31',
    '--output',
    output,
  ],
  { encoding: 'utf8' },
)

if (run.status !== 0) {
  throw new Error(run.stderr || run.stdout)
}

const manifest = JSON.parse(await readFile(output, 'utf8'))

if (manifest.action !== 'PUBLICATION_DECISION_ONLY') {
  throw new Error('Manifest must remain a decision-only artifact')
}
if (manifest.mutatesRepository !== false || manifest.sendsNewsletter !== false) {
  throw new Error('Manifest must explicitly remain non-publishing')
}
if (manifest.candidate.currentStatus !== 'READY') {
  throw new Error('Manifest candidate must be READY')
}
if (!/^[a-f0-9]{64}$/.test(manifest.candidate.contentFingerprintSha256)) {
  throw new Error('Manifest must bind to an exact candidate SHA-256 fingerprint')
}
if (
  manifest.decision?.requiresExplicitApproval !== true ||
  manifest.decision?.approvalStatus !== 'PENDING' ||
  manifest.decision?.approvedBy !== null ||
  manifest.decision?.approvedAt !== null ||
  manifest.decision?.approvedProposal !== null
) {
  throw new Error('Manifest must preserve an explicit pending publication decision')
}
if (manifest.proposedPublication.publicationStatus !== 'PUBLISHED') {
  throw new Error('Manifest must describe the proposed PUBLISHED state')
}
if (manifest.proposedPublication.projectedArchivePosition !== 1) {
  throw new Error('trial-03 should project to archive position #1 for the test date')
}
if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
  throw new Error('Manifest must preserve source exits')
}
if (
  !Array.isArray(manifest.evidenceBoundary) ||
  manifest.evidenceBoundary.length === 0
) {
  throw new Error('Manifest must preserve evidence boundaries')
}
if (!manifest.rehearsal?.passed) {
  throw new Error('Manifest must be gated by a passed rehearsal')
}

const blocked = spawnSync(
  process.execPath,
  [
    'scripts/generate-release-manifest.mjs',
    'w40-victor-7127f-voices-without-names',
    '2099-12-31',
  ],
  { encoding: 'utf8' },
)

if (blocked.status === 0) {
  throw new Error('Non-READY W40 must not receive a release decision manifest')
}

await rm('tmp-release-manifest', { recursive: true, force: true })
console.log('Release decision manifest contract PASS')
