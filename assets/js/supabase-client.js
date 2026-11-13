/* global window */
/**
 * Cliente Supabase partilhado pelas páginas de autenticação e pela aplicação.
 * Fica em `null` quando a configuração pública não está preenchida.
 */
window.SLT_CLIENT = (function () {
  'use strict';

  const config = window.SLT_CONFIG || {};

  if (
    !config.supabaseUrl ||
    !config.supabaseAnonKey ||
    !window.supabase ||
    typeof window.supabase.createClient !== 'function'
  ) {
    return null;
  }

  try {
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.warn('Não foi possível inicializar o cliente Supabase.', error);
    return null;
  }
})();
