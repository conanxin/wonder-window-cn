import { readFile } from 'node:fs/promises'

const workflowPath = '.github/workflows/release-decision-manifest.yml'
const workflow = await readFile(workflowPath, 'utf8')

if (!workflow.includes('RELEASE_SLUG: ${{ inputs.slug }}')) {
  throw new Error('workflow must bind slug input through step env')
}

if (!workflow.includes('RELEASE_PUBLISHED_AT: ${{ inputs.published_at }}')) {
  throw new Error('workflow must bind published_at input through step env')
}

const generateStep = workflow.split('      - name: Generate non-publishing decision manifest')[1]
if (!generateStep) {
  throw new Error('manifest generation step not found')
}

const generateBlock = generateStep.split('      - name: Upload decision manifest')[0]

if (generateBlock.includes('${{ inputs.')) {
  throw new Error('workflow dispatch expressions must not be interpolated into the run block')
}

const uploadStep = workflow.split('      - name: Upload decision manifest')[1] || ''
if (uploadStep.includes('${{ inputs.')) {
  throw new Error('workflow dispatch expressions must not be interpolated into artifact names or paths')
}

if (!generateBlock.includes('"$RELEASE_SLUG"')) {
  throw new Error('run block must quote RELEASE_SLUG')
}

if (!generateBlock.includes('"$RELEASE_PUBLISHED_AT"')) {
  throw new Error('run block must quote RELEASE_PUBLISHED_AT')
}

console.log('Release decision workflow input-safety contract PASS')
