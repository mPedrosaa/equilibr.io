import { writeFileSync } from 'node:fs';
import { loadEnvFile } from './env.mjs';

loadEnvFile();

function firstEnv(names) {
  for (const name of names) {
    const value = String(process.env[name] || '').trim();
    if (value) return value;
  }
  return '';
}

export function configValues() {
  return {
    supabaseUrl: firstEnv([
      'SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'VITE_SUPABASE_URL',
      'PUBLIC_SUPABASE_URL',
      'SUPABASE_PROJECT_URL',
    ]).replace(/\/+$/, ''),
    supabaseAnonKey: firstEnv([
      'SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_ANON_KEY',
      'PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ]),
  };
}

export function configContent() {
  const values = configValues();
  return `/**
 * Configuração pública do Supabase.
 *
 * Gerado por scripts/config.mjs. Não colocar aqui a service role key.
 */
window.SLT_CONFIG = {
  supabaseUrl: ${JSON.stringify(values.supabaseUrl)},
  supabaseAnonKey: ${JSON.stringify(values.supabaseAnonKey)},
};
`;
}

export function writeConfig(outputPath) {
  const values = configValues();

  if (!values.supabaseUrl || !values.supabaseAnonKey) {
    console.warn(
      'Aviso: URL ou chave pública do Supabase não encontradas. ' +
        'O ficheiro será gerado com placeholders.'
    );
  }

  writeFileSync(outputPath, configContent(), 'utf8');
  return values;
}
