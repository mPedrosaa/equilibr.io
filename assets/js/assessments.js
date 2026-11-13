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
  const expectedInput = document.getElementById('assessmentExpected');
  const confidenceInput = document.getElementById('assessmentConfidence');
  const confidenceValue = document.getElementById('assessmentConfidenceValue');
  const confidenceMarks = document.getElementById('confidenceMarks');

  const GRADE_RANGES = [
    { label: '0–5', min: 0, max: 5 },
    { label: '5–7', min: 5, max: 7 },
    { label: '7–9', min: 7, max: 9 },
    { label: '9–11', min: 9, max: 11 },
    { label: '11–14', min: 11, max: 14 },
    { label: '14–16', min: 14, max: 16 },
    { label: '16–18', min: 16, max: 18 },
    { label: '18–20', min: 18, max: 20 },
  ];

  let user = null;
  let courses = [];

  function fillExpectedOptions() {
    expectedInput.innerHTML =
      '<option value="">Seleciona</option>' +
      GRADE_RANGES.map(
        (range) => `<option value="${range.min}-${range.max}">${range.label}</option>`
      ).join('');
  }

  function fillConfidenceMarks() {
    confidenceMarks.innerHTML = Array.from(
      { length: 11 },
      (_, index) => `<span>${index}</span>`
    ).join('');
  }

  function updateFields() {
    const completed = statusSelect.value === 'completed';
    fields.forEach((field) => {
      field.hidden = !completed;
    });
    expectedInput.required = completed;
    confidenceValue.textContent = confidenceInput.value;
  }

  function courseText(courseId) {
    const course = courses.find((item) => item.id === courseId);
    return course ? `${course.code} — ${course.name}` : 'UC removida';
  }

  function confidenceLabel(value) {
    return value == null ? '—' : `${Number(value)}/10`;
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
  confidenceInput.addEventListener('input', updateFields);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateFields();
    if (!form.reportValidity()) return;

    const completed = statusSelect.value === 'completed';
    const selectedRange = completed
      ? GRADE_RANGES.find(
          (range) => `${range.min}-${range.max}` === expectedInput.value
        )
      : null;

    if (completed && !selectedRange) {
      setStatus(status, 'Seleciona a nota esperada.', 'error');
      return;
    }

    const { error } = await client.from('assessments').insert({
      user_id: user.id,
      course_id: document.getElementById('assessmentCourse').value,
      title: document.getElementById('assessmentTitle').value.trim(),
      kind: document.getElementById('assessmentKind').value,
      assessment_date: document.getElementById('assessmentDate').value,
      status: statusSelect.value,
      expected_min: selectedRange ? selectedRange.min : null,
      expected_max: selectedRange ? selectedRange.max : null,
      confidence: completed ? Number(confidenceInput.value) : null,
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
    fillExpectedOptions();
    fillConfidenceMarks();
    updateFields();
    document.getElementById('assessmentDate').value = new Date().toISOString().slice(0, 10);
    await loadRows();
  });
})();
