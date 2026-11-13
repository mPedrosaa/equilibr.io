import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Carrega pares KEY=VALUE de um ficheiro .env simples, sem dependências.
 * Valores já definidos no ambiente têm precedência.
 */
export function loadEnvFile(file = resolve(process.cwd(), '.env')) {
  if (!existsSync(file)) return false;

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

  return true;
}

export function requireEnv(keys) {
  const missing = keys.filter((key) => !String(process.env[key] || '').trim());
  if (missing.length) {
    throw new Error(`Variáveis de ambiente em falta: ${missing.join(', ')}`);
  }
}
