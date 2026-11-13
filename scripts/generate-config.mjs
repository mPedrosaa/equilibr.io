#!/usr/bin/env node
/**
 * Gera assets/js/config.js a partir de variáveis de ambiente.
 *
 * Uso:
 *   cp .env.example .env
 *   # preencher SUPABASE_URL e SUPABASE_ANON_KEY
 *   npm run config
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const envPath = resolve(root, '.env');
const outputPath = resolve(root, 'assets/js/config.js');

function loadEnvFile(file) {
  if (!existsSync(file)) return;

  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(envPath);

const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Aviso: SUPABASE_URL e/ou SUPABASE_ANON_KEY não estão definidos. ' +
      'O ficheiro será gerado com placeholders.'
  );
}

const content = `/**
 * Configuração pública do Supabase.
 *
 * Gerado por scripts/generate-config.mjs. Não colocar aqui a service role key.
 */
window.SLT_CONFIG = {
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseAnonKey: ${JSON.stringify(supabaseAnonKey)},
};
`;

writeFileSync(outputPath, content, 'utf8');
console.log(`Configuração escrita em ${outputPath}`);
