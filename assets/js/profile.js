/* global window, document */
/**
 * Edição do perfil autenticado: nome, email e palavra-passe.
 */
(function () {
  'use strict';

  const client = window.SLT_CLIENT || null;
  const status = document.getElementById('profileStatus');
  const forms = document.getElementById('profileForms');
  const prompt = document.getElementById('profileLoginPrompt');
  const who = document.getElementById('profileWho');
  const nameForm = document.getElementById('profileNameForm');
  const emailForm = document.getElementById('profileEmailForm');
  const passwordForm = document.getElementById('profilePasswordForm');
  const logout = document.getElementById('logoutBtn');

  function show(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.dataset.kind = kind || 'info';
    status.hidden = !message;
  }

  function friendlyError(message) {
    const text = String(message || '').toLowerCase();

    if (text.includes('rate limit')) return 'Demasiadas tentativas. Tenta novamente mais tarde.';
    if (text.includes('already registered')) return 'Já existe uma conta com este email.';
    if (text.includes('password')) return 'A palavra-passe não cumpre os requisitos mínimos.';
    if (text.includes('email')) return 'Verifica o endereço de email.';

    return message || 'Não foi possível concluir a operação.';
  }

  function disable(button, disabled) {
    if (button) button.disabled = disabled;
  }

  function setUser(user) {
    const metadata = user.user_metadata || {};
    const email = user.email || '';
    const name = metadata.full_name || metadata.name || email.split('@')[0] || '';

    document.getElementById('profileName').value = name;
    document.getElementById('profileEmail').value = email;
    who.textContent = email ? `Sessão iniciada como ${email}.` : 'Sessão ativa.';
    forms.hidden = false;
    prompt.hidden = true;
  }

  function noSession(message) {
    forms.hidden = true;
    prompt.hidden = false;
    who.textContent = message || 'Sem sessão ativa.';
  }

  if (!client) {
    noSession('Autenticação indisponível. Verifica a configuração do Supabase.');
    return;
  }

  client.auth.getSession().then(({ data, error }) => {
    if (error || !data.session || !data.session.user) {
      noSession('Sem sessão ativa.');
      return;
    }
    setUser(data.session.user);
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) setUser(session.user);
  });

  nameForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!nameForm.reportValidity()) return;

    const button = nameForm.querySelector('button[type="submit"]');
    const name = document.getElementById('profileName').value.trim();

    disable(button, true);
    show('A guardar nome…', 'info');

    const { data, error } = await client.auth.updateUser({ data: { full_name: name } });
    disable(button, false);

    if (error) {
      show(friendlyError(error.message), 'error');
      return;
    }

    if (data.user) setUser(data.user);
    show('Nome atualizado.', 'success');
  });

  emailForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!emailForm.reportValidity()) return;

    const button = emailForm.querySelector('button[type="submit"]');
    const email = document.getElementById('profileEmail').value.trim();

    disable(button, true);
    show('A atualizar email…', 'info');

    const { error } = await client.auth.updateUser({ email });
    disable(button, false);

    if (error) {
      show(friendlyError(error.message), 'error');
      return;
    }

    show('Pedido enviado. Confirma o novo email para concluir a alteração.', 'success');
  });

  const password = document.getElementById('profileNewPassword');
  const confirm = document.getElementById('profileConfirmPassword');

  function validatePassword() {
    const matches = !confirm.value || confirm.value === password.value;
    confirm.setCustomValidity(matches ? '' : 'As palavras-passe não coincidem.');
  }

  password.addEventListener('input', validatePassword);
  confirm.addEventListener('input', validatePassword);

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    validatePassword();
    if (!passwordForm.reportValidity()) return;

    const button = passwordForm.querySelector('button[type="submit"]');
    disable(button, true);
    show('A alterar palavra-passe…', 'info');

    const { error } = await client.auth.updateUser({ password: password.value });
    disable(button, false);

    if (error) {
      show(friendlyError(error.message), 'error');
      return;
    }

    passwordForm.reset();
    show('Palavra-passe atualizada.', 'success');
  });

  logout.addEventListener('click', async () => {
    disable(logout, true);
    await client.auth.signOut();
    window.location.href = 'login.html';
  });
})();
