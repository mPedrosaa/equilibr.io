#!/usr/bin/env node
/**
 * Semeia o catálogo de UCs de LEI — 1.º ano, 1.º semestre.
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (nunca a anon key).
 * A service role key só deve ser usada localmente ou em CI controlado.
 *
 * Uso:
 *   npm run db:seed
 */
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';
import { loadEnvFile, requireEnv } from './env.mjs';

const require = createRequire(import.meta.url);
const { BASE_COURSES } = require('../assets/js/data.js');

loadEnvFile();

try {
  requireEnv(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
} catch (error) {
  console.error(error.message);
  console.error('Copia .env.example para .env e preenche as variáveis do Supabase.');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL.trim().replace(/\/+$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = BASE_COURSES.map((course) => ({
  id: course.id,
  code: course.code,
  name: course.name,
  ects: course.ects,
  contact_hours: course.contactHours,
  color: course.color,
  degree_code: 'LEI',
  year: 1,
  semester: 1,
  active: true,
}));

const { data, error } = await client
  .from('courses')
  .upsert(rows, { onConflict: 'id' })
  .select('id, code, name, ects, contact_hours');

if (error) {
  console.error('Falha ao semear as UCs:', error.message);
  process.exit(1);
}

console.log(`Semeado(s) ${data.length} registo(s) em public.courses:`);
for (const course of data) {
  console.log(
    `- ${course.code.padEnd(6)} ${course.name} (${course.ects} ECTS, ${course.contact_hours} h contacto)`
  );
}
