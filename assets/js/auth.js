/* global window, document */
/**
 * Autenticação mínima do equilibr.io.
 *
 * Com Supabase configurado, usa `signInWithPassword`. Sem configuração,
 * apresenta uma mensagem clara e mantém disponível o modo de demonstração.
 */
(function () {
  'use strict';

  const form = document.getElementById('loginForm');
  if (!form) return;

  const status = document.getElementById('authStatus');
  const submit = form.querySelector('button[type="submit"]');
  const config = window.SLT_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const client =
    configured && window.supabase && typeof window.supabase.createClient === 'function'
      ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
      : null;

  function show(message) {
    if (status) status.textContent = message;
  }

  if (!configured) {
    show(
      'Supabase ainda não está configurado. Define SUPABASE_URL e SUPABASE_ANON_KEY, executa npm run config ou usa a demonstração local.'
    );
  } else if (!client) {
    show('O cliente Supabase não carregou. Verifica a ligação à Internet e recarrega a página.');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (!client) {
      show('Não é possível iniciar sessão sem uma configuração Supabase válida.');
      return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (submit) submit.disabled = true;
    show('A iniciar sessão…');

    try {
      const { error } = await client.auth.signInWithPassword({ email, password });

      if (error) {
        show(`Não foi possível entrar: ${error.message}`);
        return;
      }

      window.location.href = 'app.html#dashboard';
    } catch (error) {
      show(`Erro inesperado ao iniciar sessão: ${error.message}`);
    } finally {
      if (submit) submit.disabled = false;
    }
  });
})();
