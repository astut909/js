const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 3000;

app.use(express.static('.'));

app.post('/recognize', upload.single('audio'), async (req, res) => {
  try {
    if (!process.env.AUDD_API_TOKEN) {
      return res.status(500).json({ error: 'Missing AUDD_API_TOKEN environment variable.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const form = new FormData();
    form.append('api_token', process.env.AUDD_API_TOKEN);
    form.append('return', 'apple_music,spotify,youtube');
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'sample.webm',
      contentType: req.file.mimetype || 'audio/webm',
    });

    const { data } = await axios.post('https://api.audd.io/', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    if (!data || data.status !== 'success' || !data.result) {
      return res.status(404).json({ error: 'No match found.' });
    }

    const result = data.result;
    return res.json({
      title: result.title || '',
      artist: result.artist || '',
      preview_url: result.apple_music?.preview_url || result.spotify?.preview_url || '',
      youtube_link: result.song_link || result.youtube?.url || '',
    });
  } catch (error) {
    const message = error.response?.data?.error?.error_message || error.message || 'Recognition request failed.';
    return res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Voice Song Starter running at http://localhost:${PORT}`);
});
