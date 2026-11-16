/* global window, document, SLTWorkspace */
(function () {
  'use strict';

  const { client, requireSession, loadCourses, setStatus, esc } = SLTWorkspace;
  const status = document.getElementById('semesterStatus');
  const list = document.getElementById('semesterCourses');
  const save = document.getElementById('saveSemester');
  const radios = document.querySelectorAll('input[name="semester"]');

  let user = null;
  let courses = [];
  let selected = new Set();
  let semester = 1;

  function render() {
    list.innerHTML = '';

    const semesterCourses = courses.filter((course) => course.semester === semester);

    if (!semesterCourses.length) {
      list.innerHTML =
        '<p class="empty-note">Ainda não existem UCs para este semestre na base de dados.</p>';
      return;
    }

    for (const course of semesterCourses) {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" value="${esc(course.id)}" ${
        selected.has(course.id) ? 'checked' : ''
      } /> <span>${esc(course.code)} — ${esc(course.name)}</span>`;
      label.querySelector('input').addEventListener('change', (event) => {
        if (event.target.checked) selected.add(course.id);
        else selected.delete(course.id);
      });
      list.appendChild(label);
    }
  }

  async function saveSelection() {
    save.disabled = true;
    setStatus(status, 'A guardar…', 'info');

    const { error: profileError } = await client.from('profiles').upsert({
      id: user.id,
      degree_code: 'LEI',
      year: 1,
      semester,
    });

    if (profileError) {
      save.disabled = false;
      setStatus(status, profileError.message, 'error');
      return;
    }

    const { error: removeError } = await client
      .from('user_courses')
      .delete()
      .eq('user_id', user.id);

    if (removeError) {
      save.disabled = false;
      setStatus(status, removeError.message, 'error');
      return;
    }

    const rows = [...selected].map((courseId) => ({ user_id: user.id, course_id: courseId }));
    if (rows.length) {
      const { error: insertError } = await client.from('user_courses').insert(rows);
      if (insertError) {
        save.disabled = false;
        setStatus(status, insertError.message, 'error');
        return;
      }
    }

    save.disabled = false;
    setStatus(
      status,
      selected.size
        ? `Semestre ${semester} guardado com ${selected.size} UC(s).`
        : `Semestre ${semester} guardado sem UCs selecionadas.`,
      'success'
    );
  }

  requireSession(async (sessionUser) => {
    user = sessionUser;
    courses = await loadCourses();

    const [{ data: profile }, { data: links }] = await Promise.all([
      client.from('profiles').select('semester').eq('id', user.id).maybeSingle(),
      client.from('user_courses').select('course_id').eq('user_id', user.id),
    ]);

    semester = Number(profile && profile.semester) || 1;

    if (links && links.length) {
      selected = new Set(links.map((link) => link.course_id));
    } else {
      selected = new Set(
        courses.filter((course) => course.semester === semester).map((course) => course.id)
      );
    }

    radios.forEach((radio) => {
      radio.checked = Number(radio.value) === semester;
      radio.addEventListener('change', () => {
        semester = Number(radio.value);
        render();
      });
    });

    save.addEventListener('click', saveSelection);
    render();
  });
})();
