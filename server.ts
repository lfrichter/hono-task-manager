// server.ts
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import apiApp from './index';
const app = new Hono();

// 1. Rotas da API: Prioridade máxima.
// O Hono tentará corresponder a estas rotas primeiro.
app.route('/', apiApp);

// 2. Roteamento de Arquivos Estáticos: Fallback para o que não for API.
// Se nenhuma rota da API corresponder, o Hono passa para este middleware.
// `serveStatic` servirá o `index.html` na raiz e outros assets como CSS e imagens.
app.use('/*', serveStatic({
  root: './public',
}));

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

// Usando o servidor nativo do Bun em vez do adaptador Node.js.
// É mais performático e a forma idiomática de rodar Hono com Bun.
export default {
  port,
  fetch: app.fetch,
};
