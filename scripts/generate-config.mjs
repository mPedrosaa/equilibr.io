#!/usr/bin/env node
/**
 * Gera assets/js/config.js a partir de variáveis de ambiente.
 *
 * Uso:
 *   cp .env.example .env
 *   # preencher SUPABASE_URL e SUPABASE_ANON_KEY
 *   npm run config
 */
import { resolve } from 'node:path';
import { writeConfig } from './config.mjs';

const outputPath = resolve(process.cwd(), 'assets/js/config.js');
writeConfig(outputPath);
console.log(`Configuração escrita em ${outputPath}`);
