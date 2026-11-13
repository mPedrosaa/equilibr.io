#!/usr/bin/env node
/**
 * Build estático para Vercel/GitHub Pages.
 * Copia apenas os ficheiros públicos para dist/ e gera a configuração
 * do Supabase a partir das variáveis de ambiente.
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeConfig } from './config.mjs';

const root = process.cwd();
const dist = resolve(root, 'dist');
const files = [
  'index.html',
  'login.html',
  'register.html',
  'profile.html',
  'semester.html',
  'schedule.html',
  'assessments.html',
  'app.html',
];
const directories = ['assets'];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of files) {
  cpSync(resolve(root, file), resolve(dist, file));
}

for (const directory of directories) {
  cpSync(resolve(root, directory), resolve(dist, directory), { recursive: true });
}

const values = writeConfig(resolve(dist, 'assets/js/config.js'));
console.log(
  `Build estático criado em ${dist}` +
    (values.supabaseUrl && values.supabaseAnonKey ? ' (Supabase configurado).' : ' (sem Supabase).')
);
