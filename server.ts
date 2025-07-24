// server.ts
import { serve } from '@hono/node-server';
import { readFileSync } from 'fs';
import { Hono } from 'hono';
import { resolve } from 'path';


import apiApp from './index';
const app = new Hono();

// Serve the HTML at the root
app.get('/', (c) => {
  const filePath = resolve('./public/index.html');
  const html = readFileSync(filePath, 'utf-8');
  return c.html(html);
});

// Serve static files (optional)
app.get('/public/*', (c) => {
  const filePath = resolve('./public', c.req.path.replace('/public/', ''));
  try {
    const file = readFileSync(filePath);
    const ext = filePath.split('.').pop();
    const type = {
      js: 'text/javascript',
      css: 'text/css',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
    }[ext] || 'text/plain';
    return c.newResponse(file, { headers: { 'Content-Type': type } });
  } catch {
    return c.text('Not Found', 404);
  }
});

app.route('/', apiApp);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
