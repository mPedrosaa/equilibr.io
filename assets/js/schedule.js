/* global window, document, SLTWorkspace */
(function () {
  'use strict';

  const {
    client,
    requireSession,
    loadCourses,
    fillCourseSelect,
    setStatus,
    esc,
    friendlyError,
    formatTime,
    dayName,
    courseLabel,
    dayOptions,
  } = SLTWorkspace;

  const classForm = document.getElementById('classForm');
  const studyForm = document.getElementById('studyForm');
  const classStatus = document.getElementById('classStatus');
  const studyStatus = document.getElementById('studyStatus');
  const classGrid = document.getElementById('classGrid');
  const studyGrid = document.getElementById('studyGrid');

  let user = null;
  let courses = [];

  const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

  document.getElementById('classDay').innerHTML = dayOptions();
  document.getElementById('studyDay').innerHTML = dayOptions();

  function slotMarkup(row, type) {
    const course = courses.find((item) => item.id === row.course_id);
    const isClass = type === 'class';
    const color = course ? course.color : '#000080';
    const label = isClass
      ? `${esc(course ? course.code : 'UC')} · ${esc(course ? course.name : '')}`
      : 'Estudo autónomo';

    return `
      <div class="slot ${isClass ? 'class-slot' : 'study-slot'}" style="--course-color:${esc(color)}">
        <button class="slot-remove" type="button" data-type="${type}" data-id="${esc(row.id)}" title="Remover">×</button>
        <strong>${formatTime(row.start_time)}–${formatTime(row.end_time)}</strong>
        <span>${label}</span>
      </div>
    `;
  }

  function renderWeek(grid, rows, type) {
    const byDay = new Map(Array.from({ length: 7 }, (_, index) => [index + 1, []]));
    for (const row of rows) {
      if (byDay.has(Number(row.day_of_week))) byDay.get(Number(row.day_of_week)).push(row);
    }

    grid.innerHTML = Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;
      const items = byDay.get(day).sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
      return `
        <div class="week-day">
          <h3>${dayName(day)}</h3>
          <div class="slot-list">
            ${items.length ? items.map((row) => slotMarkup(row, type)).join('') : '<p class="empty-note">—</p>'}
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadRows() {
    const [classResult, studyResult] = await Promise.all([
      client
        .from('class_sessions')
        .select('id, course_id, day_of_week, start_time, end_time')
        .eq('user_id', user.id),
      client
        .from('study_blocks')
        .select('id, day_of_week, start_time, end_time')
        .eq('user_id', user.id),
    ]);

    if (classResult.error || studyResult.error) {
      setStatus(classStatus, friendlyError((classResult.error || studyResult.error).message), 'error');
      return;
    }

    renderWeek(classGrid, classResult.data || [], 'class');
    renderWeek(studyGrid, studyResult.data || [], 'study');
  }

  async function removeBlock(type, id) {
    const table = type === 'class' ? 'class_sessions' : 'study_blocks';
    const { error } = await client.from(table).delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      setStatus(type === 'class' ? classStatus : studyStatus, friendlyError(error.message), 'error');
      return;
    }
    await loadRows();
  }

  classGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-type="class"]');
    if (button) removeBlock('class', button.dataset.id);
  });

  studyGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-type="study"]');
    if (button) removeBlock('study', button.dataset.id);
  });

  classForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!classForm.reportValidity()) return;

    const start = document.getElementById('classStart').value;
    const end = document.getElementById('classEnd').value;
    if (!TIME_PATTERN.test(start) || !TIME_PATTERN.test(end) || end <= start) {
      setStatus(classStatus, 'Usa o formato 24h HH:MM e garante que o fim é depois do início.', 'error');
      return;
    }

    const { error } = await client.from('class_sessions').insert({
      user_id: user.id,
      course_id: document.getElementById('classCourse').value,
      day_of_week: Number(document.getElementById('classDay').value),
      start_time: start,
      end_time: end,
    });

    if (error) {
      setStatus(classStatus, friendlyError(error.message), 'error');
      return;
    }

    classForm.reset();
    document.getElementById('classDay').innerHTML = dayOptions();
    setStatus(classStatus, 'Aula adicionada.', 'success');
    await loadRows();
  });

  studyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!studyForm.reportValidity()) return;

    const start = document.getElementById('studyStart').value;
    const end = document.getElementById('studyEnd').value;
    if (!TIME_PATTERN.test(start) || !TIME_PATTERN.test(end) || end <= start) {
      setStatus(studyStatus, 'Usa o formato 24h HH:MM e garante que o fim é depois do início.', 'error');
      return;
    }

    const { error } = await client.from('study_blocks').insert({
      user_id: user.id,
      day_of_week: Number(document.getElementById('studyDay').value),
      start_time: start,
      end_time: end,
    });

    if (error) {
      setStatus(studyStatus, friendlyError(error.message), 'error');
      return;
    }

    studyForm.reset();
    document.getElementById('studyDay').innerHTML = dayOptions();
    setStatus(studyStatus, 'Bloco de estudo adicionado.', 'success');
    await loadRows();
  });

  requireSession(async (sessionUser) => {
    user = sessionUser;
    courses = await loadCourses();
    fillCourseSelect(document.getElementById('classCourse'), courses);
    await loadRows();
  });
})();
