import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

const dir = 'tmp-approved-manifest-test'
const pendingPath = `${dir}/pending.json`
const approvedPath = `${dir}/approved.json`
const stalePath = `${dir}/stale.json`
const wrongUrlPath = `${dir}/wrong-url.json`

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
approved.decision.approvedAt = '2099-12-01T00:00:00Z'
approved.decision.approvedProposal = {
  contentFingerprintSha256: approved.candidate.contentFingerprintSha256,
  publishedAt: approved.proposedPublication.publishedAt,
  canonicalUrl: approved.proposedPublication.canonicalUrl,
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

await rm(dir, { recursive: true, force: true })

console.log(
  'Approved manifest verification contract PASS: PENDING rejected; approved current manifest accepted; stale fingerprint and URL rejected',
)
