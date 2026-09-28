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
const markers = editorialCandidates.flatMap((issue) => [
  issue.id,
  issue.slug,
  issue.title,
])

const found = markers.filter((marker) => haystack.includes(marker))

if (previewEnabled) {
  if (found.length === 0) {
    throw new Error(
      'Editorial preview bundle check failed: preview build does not contain any candidate marker',
    )
  }

  console.log(
    `Editorial preview bundle OK: candidate content present for preview review (${found.length} markers found)`,
  )
} else {
  if (found.length > 0) {
    throw new Error(
      `Production publication-surface isolation failed: unpublished candidate markers found: ${found.join(', ')}`,
    )
  }

  console.log(
    `Production publication-surface isolation OK: ${editorialCandidates.length} unpublished candidates absent from dist`,
  )
}
