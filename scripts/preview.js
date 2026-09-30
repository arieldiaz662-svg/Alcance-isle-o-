// Sirve dist/ en http://localhost:4000 para revisar la web estática antes de publicarla.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';

const port = Number(process.env.PORT || 4000);
const app = Fastify();
await app.register(fastifyStatic, { root: join(dirname(fileURLToPath(import.meta.url)), '..', 'dist') });
app.setNotFoundHandler((request, reply) => reply.code(404).sendFile('404.html'));
await app.listen({ port, host: '0.0.0.0' });
console.log(`Vista previa en http://localhost:${port}`);
