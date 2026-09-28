import { spawnSync } from 'node:child_process'

function run(args) {
  return spawnSync(process.execPath, ['scripts/rehearse-release.mjs', ...args], {
    encoding: 'utf8',
  })
}

const ready = run([
  'trial-03-utamaro-butterfly-dragonfly',
  '2099-12-31',
])

if (ready.status !== 0) {
  throw new Error(
    `READY candidate should rehearse successfully:\n${ready.stderr || ready.stdout}`,
  )
}

const notReady = run([
  'w40-victor-7127f-voices-without-names',
  '2099-12-31',
])

if (notReady.status === 0) {
  throw new Error('ISSUE_CANDIDATE must not pass release rehearsal')
}

const invalidDate = run([
  'trial-03-utamaro-butterfly-dragonfly',
  '2099-02-31',
])

if (invalidDate.status === 0) {
  throw new Error('Invalid calendar date must not pass release rehearsal')
}

console.log('Release rehearsal contract PASS: READY accepted; non-READY and invalid date rejected')
