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
  } = SLTWorkspace;

  const form = document.getElementById('assessmentForm');
  const status = document.getElementById('assessmentStatusMessage');
  const list = document.getElementById('assessmentList');
  const statusSelect = document.getElementById('assessmentStatus');
  const fields = document.querySelectorAll('.assessment-fields');
  const minInput = document.getElementById('assessmentMin');
  const maxInput = document.getElementById('assessmentMax');
  const confidenceInput = document.getElementById('assessmentConfidence');

  let user = null;
  let courses = [];

  function updateFields() {
    const completed = statusSelect.value === 'completed';
    fields.forEach((field) => {
      field.hidden = !completed;
    });
    [minInput, maxInput, confidenceInput].forEach((field) => {
      field.required = completed;
    });
  }

  function courseText(courseId) {
    const course = courses.find((item) => item.id === courseId);
    return course ? `${course.code} — ${course.name}` : 'UC removida';
  }

  function confidenceLabel(value) {
    return { baixa: 'Baixa', media: 'Média', alta: 'Alta' }[value] || '—';
  }

  function kindLabel(value) {
    return { teste: 'Teste', avaliacao: 'Avaliação', exame: 'Exame' }[value] || value;
  }

  function statusLabel(value) {
    return value === 'completed' ? 'Realizado' : 'Agendado';
  }

  function render(rows) {
    if (!rows.length) {
      list.innerHTML = '<p class="empty-note">Ainda não há avaliações registadas.</p>';
      return;
    }

    list.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>UC</th>
            <th>Avaliação</th>
            <th>Estado</th>
            <th>Nota esperada</th>
            <th>Confiança</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>${esc(row.assessment_date)}</td>
                  <td>${esc(courseText(row.course_id))}</td>
                  <td>${esc(row.title)} <span class="small">(${esc(kindLabel(row.kind))})</span></td>
                  <td>${esc(statusLabel(row.status))}</td>
                  <td>${
                    row.status === 'completed'
                      ? `${esc(row.expected_min)}–${esc(row.expected_max)}`
                      : '—'
                  }</td>
                  <td>${row.status === 'completed' ? esc(confidenceLabel(row.confidence)) : '—'}</td>
                  <td class="row-actions">
                    <button type="button" data-delete-assessment="${esc(row.id)}">Eliminar</button>
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  async function loadRows() {
    const { data, error } = await client
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('assessment_date', { ascending: false });

    if (error) {
      setStatus(status, friendlyError(error.message), 'error');
      return;
    }

    render(data || []);
  }

  statusSelect.addEventListener('change', updateFields);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateFields();
    if (!form.reportValidity()) return;

    const completed = statusSelect.value === 'completed';
    const min = completed ? Number(minInput.value) : null;
    const max = completed ? Number(maxInput.value) : null;

    if (completed && (min < 0 || max > 20 || min > max)) {
      setStatus(status, 'O intervalo de notas deve estar entre 0 e 20 e a nota mínima não pode exceder a máxima.', 'error');
      return;
    }

    const { error } = await client.from('assessments').insert({
      user_id: user.id,
      course_id: document.getElementById('assessmentCourse').value,
      title: document.getElementById('assessmentTitle').value.trim(),
      kind: document.getElementById('assessmentKind').value,
      assessment_date: document.getElementById('assessmentDate').value,
      status: statusSelect.value,
      expected_min: completed ? min : null,
      expected_max: completed ? max : null,
      confidence: completed ? confidenceInput.value : null,
      note: document.getElementById('assessmentNote').value.trim() || null,
    });

    if (error) {
      setStatus(status, friendlyError(error.message), 'error');
      return;
    }

    form.reset();
    updateFields();
    setStatus(status, 'Avaliação registada.', 'success');
    await loadRows();
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-assessment]');
    if (!button) return;

    const { error } = await client
      .from('assessments')
      .delete()
      .eq('id', button.dataset.deleteAssessment)
      .eq('user_id', user.id);

    if (error) {
      setStatus(status, friendlyError(error.message), 'error');
      return;
    }

    await loadRows();
  });

  requireSession(async (sessionUser) => {
    user = sessionUser;
    courses = await loadCourses();
    fillCourseSelect(document.getElementById('assessmentCourse'), courses);
    updateFields();
    document.getElementById('assessmentDate').value = new Date().toISOString().slice(0, 10);
    await loadRows();
  });
})();
