import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleGeneratePhoto, handleSuggestPrompt } from './src/server/geminiHandler.ts';

function apiPlugin(): Plugin {
  return {
    name: 'api-server-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const sendJson = (status: number, data: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        if (req.url === '/api/health' && req.method === 'GET') {
          return sendJson(200, {
            status: 'ok',
            hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
          });
        }

        if (req.url === '/api/generate-photo' && req.method === 'POST') {
          try {
            const chunks: Uint8Array[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            const body = bodyStr ? JSON.parse(bodyStr) : {};

            const result = await handleGeneratePhoto(body);
            return sendJson(200, result);
          } catch (err: any) {
            console.error('API Error /api/generate-photo:', err);
            return sendJson(500, { error: err?.message || 'Gagal membuat gambar dengan AI.' });
          }
        }

        if (req.url === '/api/suggest-prompts' && req.method === 'POST') {
          try {
            const chunks: Uint8Array[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            const body = bodyStr ? JSON.parse(bodyStr) : {};

            const suggestions = await handleSuggestPrompt(body.characterName, body.epithet);
            return sendJson(200, { suggestions });
          } catch (err: any) {
            console.error('API Error /api/suggest-prompts:', err);
            return sendJson(500, { error: err?.message || 'Gagal memuat saran ide prompt.' });
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
