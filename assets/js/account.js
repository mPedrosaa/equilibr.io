/* global window, document, CustomEvent */
/**
 * Expõe o utilizador autenticado à aplicação.
 * A aplicação continua a funcionar em modo de demonstração quando não há sessão.
 */
(function () {
  'use strict';

  const client = window.SLT_CLIENT;
  if (!client) return;

  function emitUser(user) {
    if (!user) return;
    window.SLT_USER = user;
    document.dispatchEvent(new CustomEvent('slt:user', { detail: { user } }));
  }

  client.auth.getSession().then(({ data }) => {
    if (data && data.session && data.session.user) emitUser(data.session.user);
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) emitUser(session.user);
  });
})();
