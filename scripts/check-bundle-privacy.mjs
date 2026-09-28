import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { editorialCandidates } from '../src/data/editorialCandidates.js'

const previewEnabled =
  process.env.VERCEL_ENV === 'preview' ||
  (!process.env.VERCEL_ENV &&
    process.env.VITE_EDITORIAL_PREVIEW === 'true')

const searchableExtensions = new Set([
  '.html',
  '.js',
  '.css',
  '.json',
  '.xml',
  '.txt',
  '.map',
])

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)))
    } else if (searchableExtensions.has(extname(entry.name))) {
      files.push(path)
    }
  }

  return files
}

const files = await collectFiles('dist')
const contents = await Promise.all(files.map((file) => readFile(file, 'utf8')))
const haystack = contents.join('\n')

const candidateChecks = editorialCandidates.map((issue) => {
  const markers = [issue.id, issue.slug, issue.title]
  const found = markers.filter((marker) => haystack.includes(marker))

  return {
    issue,
    markers,
    found,
    missing: markers.filter((marker) => !found.includes(marker)),
  }
})

const allFound = candidateChecks.flatMap(({ found }) => found)

if (previewEnabled) {
  const incomplete = candidateChecks.filter(({ missing }) => missing.length > 0)

  if (incomplete.length > 0) {
    const details = incomplete
      .map(
        ({ issue, missing }) =>
          `${issue.slug}: missing preview markers [${missing.join(', ')}]`,
      )
      .join('; ')

    throw new Error(
      `Editorial preview bundle check failed: every candidate must be present. ${details}`,
    )
  }

  console.log(
    `Editorial preview bundle OK: all ${editorialCandidates.length} candidates present (${allFound.length} markers found)`,
  )
} else {
  if (allFound.length > 0) {
    throw new Error(
      `Production publication-surface isolation failed: unpublished candidate markers found: ${allFound.join(', ')}`,
    )
  }

  console.log(
    `Production publication-surface isolation OK: ${editorialCandidates.length} unpublished candidates absent from dist`,
  )
}
