import { readFile, writeFile } from 'node:fs/promises'

const CANDIDATE_FILE = 'src/data/editorialCandidates.js'
const PUBLISHED_FILE = 'src/data/publishedEditorialIssues.js'
const TRIAL_ID = 'trial-03-utamaro'

function fail(message) {
  throw new Error(message)
}

function findObjectChunk(source, id) {
  const marker = `id: '${id}'`
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) {
    fail(`Fixture source object not found: ${id}`)
  }

  const start = source.lastIndexOf('  {', markerIndex)
  if (start < 0) {
    fail(`Fixture object start not found: ${id}`)
  }

  let depth = 0
  let quote = null
  let escaped = false

  for (let index = start; index < source.length; index += 1) {
    const char = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }

    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        let end = index + 1
        if (source[end] === ',') end += 1
        if (source[end] === '\n') end += 1
        return {
          start,
          end,
          chunk: source.slice(start, end),
        }
      }
    }
  }

  fail(`Fixture object end not found: ${id}`)
}

export async function withTrial03ReadyFixture(callback) {
  const [candidateBefore, publishedBefore] = await Promise.all([
    readFile(CANDIDATE_FILE, 'utf8'),
    readFile(PUBLISHED_FILE, 'utf8'),
  ])

  const publishedObject = findObjectChunk(publishedBefore, TRIAL_ID)

  if (
    !publishedObject.chunk.includes("publicationStatus: 'PUBLISHED'") ||
    !publishedObject.chunk.includes("publishedAt: '2026-09-28'")
  ) {
    fail('Published trial-03 fixture does not match the approved published state')
  }

  const readyChunk = publishedObject.chunk
    .replace("publicationStatus: 'PUBLISHED'", "publicationStatus: 'READY'")
    .replace("publishedAt: '2026-09-28'", 'publishedAt: null')

  const candidateHeader = 'export const editorialCandidates = [\n'
  if (!candidateBefore.startsWith(candidateHeader)) {
    fail('Candidate registry header changed; update the test fixture helper')
  }

  if (candidateBefore.includes(`id: '${TRIAL_ID}'`)) {
    fail('trial-03 unexpectedly remains in the real candidate registry')
  }

  const candidateFixture =
    candidateHeader +
    readyChunk +
    candidateBefore.slice(candidateHeader.length)

  const publishedFixture =
    publishedBefore.slice(0, publishedObject.start) +
    publishedBefore.slice(publishedObject.end)

  try {
    await Promise.all([
      writeFile(CANDIDATE_FILE, candidateFixture, 'utf8'),
      writeFile(PUBLISHED_FILE, publishedFixture, 'utf8'),
    ])

    return await callback()
  } finally {
    await Promise.all([
      writeFile(CANDIDATE_FILE, candidateBefore, 'utf8'),
      writeFile(PUBLISHED_FILE, publishedBefore, 'utf8'),
    ])
  }
}
