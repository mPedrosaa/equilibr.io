#!/usr/bin/env node
/**
 * Aplica as migrations SQL do repositório no projeto Supabase.
 *
 * Requer SUPABASE_URL e SUPABASE_ACCESS_TOKEN (personal access token `sbp_...`).
 * O token é usado apenas contra a Management API e nunca vai para o frontend.
 *
 * Uso:
 *   npm run db:migrate
 */
import { readFileSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { loadEnvFile, requireEnv } from './env.mjs';

loadEnvFile();

try {
  requireEnv(['SUPABASE_URL', 'SUPABASE_ACCESS_TOKEN']);
} catch (error) {
  console.error(error.message);
  console.error(
    'Cria um personal access token em https://supabase.com/dashboard/account/tokens,\n' +
      'adiciona SUPABASE_ACCESS_TOKEN=sbp_... ao .env e volta a executar npm run db:migrate.'
  );
  process.exit(1);
}

const projectUrl = process.env.SUPABASE_URL.trim().replace(/\/+$/, '');
const accessToken = process.env.SUPABASE_ACCESS_TOKEN.trim();
const projectRef = new URL(projectUrl).host.split('.')[0];
const migrationsDir = resolve(process.cwd(), 'supabase/migrations');

const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

if (!files.length) {
  console.error(`Não foram encontradas migrations em ${migrationsDir}.`);
  process.exit(1);
}

for (const file of files) {
  const query = readFileSync(resolve(migrationsDir, file), 'utf8');
  console.log(`A aplicar ${basename(file)}…`);

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/migrations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: basename(file, '.sql'), query }),
    }
  );

  const body = await response.text();
  if (!response.ok) {
    console.error(`Falha em ${file} (HTTP ${response.status}):`);
    console.error(body.slice(0, 2000));
    process.exit(1);
  }

  console.log(`OK: ${file}`);
}

console.log(`\n${files.length} migration(s) aplicada(s) com sucesso.`);
