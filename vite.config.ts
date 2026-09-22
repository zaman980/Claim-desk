import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handlePolishRequest } from './server/polish-claim.ts'

const POLISH_PATH = '/api/polish-claim-description'

function createPolishMiddleware(apiKey: string | undefined) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.method !== 'POST') return next()
    try {
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
      }
      const response = await handlePolishRequest(
        new Request(`http://localhost${POLISH_PATH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: Buffer.concat(chunks).toString('utf8'),
        }),
        apiKey,
      )
      res.statusCode = response.status
      res.setHeader('Content-Type', 'application/json')
      res.end(await response.text())
    } catch (err) {
      console.error('polish-claim-description failed:', err)
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'The AI assistant is temporarily unavailable.' }))
    }
  }
}

function polishApiPlugin(): Plugin {
  return {
    name: 'claimdesk-polish-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      server.middlewares.use(
        POLISH_PATH,
        createPolishMiddleware(env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY),
      )
    },
    configurePreviewServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      server.middlewares.use(
        POLISH_PATH,
        createPolishMiddleware(env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY),
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), polishApiPlugin()],
})
