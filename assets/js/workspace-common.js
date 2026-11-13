/* global window, document */
/**
 * Utilitários comuns das páginas de planeamento.
 */
window.SLTWorkspace = (function () {
  'use strict';

  const client = window.SLT_CLIENT || null;
  const fallbackCourses =
    window.SLTData && Array.isArray(window.SLTData.BASE_COURSES)
      ? window.SLTData.BASE_COURSES.map((course) => ({ ...course, semester: 1 }))
      : [];

  function setStatus(element, message, kind) {
    if (!element) return;
    element.textContent = message;
    element.dataset.kind = kind || 'info';
    element.hidden = !message;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function friendlyError(message) {
    const text = String(message || '').toLowerCase();
    if (text.includes('rate limit')) return 'Demasiadas tentativas. Tenta novamente mais tarde.';
    if (text.includes('row-level security') || text.includes('permission')) {
      return 'Sem permissão para alterar estes dados.';
    }
    return message || 'Não foi possível concluir a operação.';
  }

  function requireSession(onUser) {
    const content = document.getElementById('workspace');
    const prompt = document.getElementById('authPrompt');

    if (!client) {
      if (content) content.hidden = true;
      if (prompt) prompt.hidden = false;
      return;
    }

    client.auth.getSession().then(({ data, error }) => {
      const session = data && data.session;
      if (error || !session || !session.user) {
        if (content) content.hidden = true;
        if (prompt) prompt.hidden = false;
        return;
      }

      if (content) content.hidden = false;
      if (prompt) prompt.hidden = true;
      onUser(session.user);
    });
  }

  async function loadCourses() {
    if (!client) return fallbackCourses;

    const { data, error } = await client
      .from('courses')
      .select('id, code, name, ects, contact_hours, color, semester')
      .eq('degree_code', 'LEI')
      .eq('year', 1)
      .eq('active', true)
      .order('semester')
      .order('code');

    if (error || !data || !data.length) return fallbackCourses;

    return data.map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
      ects: Number(course.ects),
      contactHours: Number(course.contact_hours),
      color: course.color,
      semester: Number(course.semester),
    }));
  }

  function fillCourseSelect(select, courses) {
    if (!select) return;
    select.innerHTML =
      '<option value="">Seleciona uma UC</option>' +
      courses
        .map(
          (course) =>
            `<option value="${esc(course.id)}">${esc(course.code)} — ${esc(course.name)}</option>`
        )
        .join('');
  }

  function formatTime(value) {
    return String(value || '').slice(0, 5);
  }

  function dayName(day) {
    return ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][Number(day)] || '';
  }

  function courseLabel(courses, courseId) {
    const course = courses.find((item) => item.id === courseId);
    return course ? course.code : 'UC';
  }

  function dayOptions() {
    return Array.from({ length: 7 }, (_, index) => {
      const value = index + 1;
      return `<option value="${value}">${dayName(value)}</option>`;
    }).join('');
  }

  return {
    client,
    setStatus,
    esc,
    friendlyError,
    requireSession,
    loadCourses,
    fillCourseSelect,
    formatTime,
    dayName,
    courseLabel,
    dayOptions,
  };
})();
