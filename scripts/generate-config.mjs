#!/usr/bin/env node
/**
 * Gera assets/js/config.js a partir de variáveis de ambiente.
 *
 * Uso:
 *   cp .env.example .env
 *   # preencher SUPABASE_URL e SUPABASE_ANON_KEY
 *   npm run config
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from './env.mjs';

const root = process.cwd();
const outputPath = resolve(root, 'assets/js/config.js');

loadEnvFile();

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
