/* global window, document */
/**
 * Autenticação do equilibr.io: login e criação de conta com Supabase.
 */
(function () {
  'use strict';

  const config = window.SLT_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const client =
    configured && window.supabase && typeof window.supabase.createClient === 'function'
      ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
      : null;

  function setStatus(element, message, kind) {
    if (!element) return;
    element.textContent = message;
    element.dataset.kind = kind || 'info';
    element.hidden = !message;
  }

  function friendlyError(message) {
    const text = String(message || '').toLowerCase();

    if (text.includes('invalid login credentials')) return 'Email ou palavra-passe incorretos.';
    if (text.includes('already registered')) return 'Já existe uma conta com este email.';
    if (text.includes('email not confirmed')) return 'Confirma o email antes de entrares.';
    if (text.includes('rate limit')) return 'Demasiadas tentativas. Tenta novamente mais tarde.';
    if (text.includes('email_address_invalid') || text.includes('invalid email')) {
      return 'Email inválido.';
    }
    if (text.includes('password')) return 'A palavra-passe não cumpre os requisitos mínimos.';
    if (text.includes('email')) return 'Verifica o endereço de email.';

    return message || 'Não foi possível concluir a operação.';
  }

  function authUnavailable(status) {
    setStatus(status, 'Serviço de autenticação indisponível. Tenta mais tarde.', 'error');
  }

  function disable(button, disabled) {
    if (button) button.disabled = disabled;
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const status = document.getElementById('authStatus');
    const submit = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      if (!client) return authUnavailable(status);

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      disable(submit, true);
      setStatus(status, 'A entrar…', 'info');

      try {
        const { error } = await client.auth.signInWithPassword({ email, password });

        if (error) {
          setStatus(status, friendlyError(error.message), 'error');
          return;
        }

        window.location.href = 'app.html#dashboard';
      } catch (error) {
        setStatus(status, friendlyError(error.message), 'error');
      } finally {
        disable(submit, false);
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const status = document.getElementById('authStatus');
    const submit = registerForm.querySelector('button[type="submit"]');
    const password = document.getElementById('registerPassword');
    const confirm = document.getElementById('registerConfirm');

    function validateConfirmation() {
      const matches = !confirm.value || confirm.value === password.value;
      confirm.setCustomValidity(matches ? '' : 'As palavras-passe não coincidem.');
    }

    password.addEventListener('input', validateConfirmation);
    confirm.addEventListener('input', validateConfirmation);

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      validateConfirmation();
      if (!registerForm.reportValidity()) return;
      if (!client) return authUnavailable(status);

      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const redirectTo = new URL('login.html', window.location.href).href;

      disable(submit, true);
      setStatus(status, 'A criar conta…', 'info');

      try {
        const { data, error } = await client.auth.signUp({
          email,
          password: password.value,
          options: {
            data: { full_name: name },
            emailRedirectTo: redirectTo,
          },
        });

        if (error) {
          setStatus(status, friendlyError(error.message), 'error');
          return;
        }

        if (data.user && Array.isArray(data.user.identities) && !data.user.identities.length) {
          setStatus(status, 'Já existe uma conta com este email.', 'error');
          return;
        }

        if (data.session) {
          window.location.href = 'app.html#dashboard';
          return;
        }

        registerForm.reset();
        setStatus(
          status,
          'Conta criada. Confirma o email para poderes entrar.',
          'success'
        );
      } catch (error) {
        setStatus(status, friendlyError(error.message), 'error');
      } finally {
        disable(submit, false);
      }
    });
  }
})();
