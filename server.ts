import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleGeneratePhoto, handleSuggestPrompt } from './src/server/geminiHandler.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/generate-photo', async (req, res) => {
  try {
    const result = await handleGeneratePhoto(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/generate-photo:', err);
    res.status(500).json({ error: err?.message || 'Gagal menghasilkan gambar AI.' });
  }
});

app.post('/api/suggest-prompts', async (req, res) => {
  try {
    const { characterName, epithet } = req.body;
    const suggestions = await handleSuggestPrompt(characterName, epithet);
    res.json({ suggestions });
  } catch (err: any) {
    console.error('Error in /api/suggest-prompts:', err);
    res.status(500).json({ error: err?.message || 'Gagal memuat ide prompt.' });
  }
});

// Serve frontend assets in production using process.cwd()
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
