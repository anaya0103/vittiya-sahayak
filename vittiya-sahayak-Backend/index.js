const express = require('express');
const cors = require('cors');
const { resolve } = require('path');

const app = express();
const port = process.env.PORT || 3010;

// Allow the Vite dev server (and production origin if you set FRONTEND_ORIGIN)
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:8080';
app.use(
  cors({
    origin: [frontendOrigin, /^http:\/\/localhost:\d+$/],
    credentials: true,
  })
);
app.use(express.json());

app.use(express.static('static'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'vittiya-sahayak-backend' });
});

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port} (CORS for ${frontendOrigin})`);
});
