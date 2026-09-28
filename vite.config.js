import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const deploymentEnv =
    process.env.VERCEL_ENV || (command === 'serve' ? 'development' : 'production-build')
  const editorialPreviewEnabled =
    command === 'serve' ||
    deploymentEnv === 'preview' ||
    (!process.env.VERCEL_ENV &&
      process.env.VITE_EDITORIAL_PREVIEW === 'true')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.EDITORIAL_PREVIEW_ENABLED': JSON.stringify(
        editorialPreviewEnabled,
      ),
      'import.meta.env.DEPLOYMENT_ENV': JSON.stringify(deploymentEnv),
    },
  }
})
