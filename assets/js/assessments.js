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
  const receivedList = document.getElementById('receivedGradeList');
  const statusSelect = document.getElementById('assessmentStatus');
  const fields = document.querySelectorAll('.assessment-fields');
  const expectedInput = document.getElementById('assessmentExpected');
  const confidenceInput = document.getElementById('assessmentConfidence');
  const confidenceValue = document.getElementById('assessmentConfidenceValue');

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

  function expectedOptionsMarkup(row) {
    const selectedValue =
      row.expected_min != null && row.expected_max != null
        ? `${Number(row.expected_min)}-${Number(row.expected_max)}`
        : '';

    return (
      '<option value="">Seleciona</option>' +
      GRADE_RANGES.map(
        (range) =>
          `<option value="${range.min}-${range.max}" ${
            `${range.min}-${range.max}` === selectedValue ? 'selected' : ''
          }>${range.label}</option>`
      ).join('')
    );
  }

  function render(rows) {
    const scheduled = rows.filter((row) => row.status === 'scheduled');

    if (!scheduled.length) {
      list.innerHTML = '<p class="empty-note">Não há avaliações agendadas.</p>';
      return;
    }

    list.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>UC</th>
            <th>Avaliação</th>
            <th>Nota esperada</th>
            <th>Confiança</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${scheduled
            .map(
              (row) => `
                <tr>
                  <td>${esc(row.assessment_date)}</td>
                  <td>${esc(courseText(row.course_id))}</td>
                  <td>${esc(row.title)} <span class="small">(${esc(kindLabel(row.kind))})</span></td>
                  <td>
                    <select data-complete-expected="${esc(row.id)}" aria-label="Nota esperada em ${esc(row.title)}">
                      ${expectedOptionsMarkup(row)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value="${row.confidence == null ? 5 : esc(row.confidence)}"
                      data-complete-confidence="${esc(row.id)}"
                      aria-label="Confiança em ${esc(row.title)}"
                    />
                  </td>
                  <td class="row-actions">
                    <button type="button" data-complete-assessment="${esc(row.id)}">Marcar como realizado</button>
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

  function renderReceived(rows) {
    const completed = rows.filter((row) => row.status === 'completed');

    if (!completed.length) {
      receivedList.innerHTML =
        '<p class="empty-note">Ainda não há avaliações realizadas para registar nota.</p>';
      return;
    }

    receivedList.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>UC</th>
            <th>Avaliação</th>
            <th>Nota recebida</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${completed
            .map(
              (row) => `
                <tr>
                  <td>${esc(row.assessment_date)}</td>
                  <td>${esc(courseText(row.course_id))}</td>
                  <td>${esc(row.title)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value="${row.received_grade == null ? '' : esc(row.received_grade)}"
                      data-grade-input="${esc(row.id)}"
                      aria-label="Nota recebida em ${esc(row.title)}"
                    />
                  </td>
                  <td class="row-actions">
                    <button type="button" data-save-received="${esc(row.id)}">Guardar</button>
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
    renderReceived(data || []);
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
    const completeButton = event.target.closest('[data-complete-assessment]');
    const deleteButton = event.target.closest('[data-delete-assessment]');

    if (completeButton) {
      const row = completeButton.closest('tr');
      const expectedValue = row.querySelector('[data-complete-expected]').value;
      const confidence = Number(row.querySelector('[data-complete-confidence]').value);
      const selectedRange = GRADE_RANGES.find(
        (range) => `${range.min}-${range.max}` === expectedValue
      );

      if (!selectedRange) {
        setStatus(status, 'Seleciona a nota esperada antes de concluir.', 'error');
        return;
      }

      if (!Number.isInteger(confidence) || confidence < 0 || confidence > 10) {
        setStatus(status, 'A confiança deve estar entre 0 e 10.', 'error');
        return;
      }

      const { error } = await client
        .from('assessments')
        .update({
          status: 'completed',
          expected_min: selectedRange.min,
          expected_max: selectedRange.max,
          confidence,
        })
        .eq('id', completeButton.dataset.completeAssessment)
        .eq('user_id', user.id);

      if (error) {
        setStatus(status, friendlyError(error.message), 'error');
        return;
      }

      setStatus(status, 'Avaliação marcada como realizada.', 'success');
      await loadRows();
      return;
    }

    if (!deleteButton) return;

    const { error } = await client
      .from('assessments')
      .delete()
      .eq('id', deleteButton.dataset.deleteAssessment)
      .eq('user_id', user.id);

    if (error) {
      setStatus(status, friendlyError(error.message), 'error');
      return;
    }

    await loadRows();
  });

  receivedList.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-save-received]');
    if (!button) return;

    const id = button.dataset.saveReceived;
    const input = receivedList.querySelector(`[data-grade-input="${id}"]`);
    const value = Number(input.value);

    if (!Number.isFinite(value) || value < 0 || value > 20) {
      setStatus(status, 'A nota recebida deve estar entre 0 e 20.', 'error');
      return;
    }

    const { error } = await client
      .from('assessments')
      .update({ received_grade: value })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      setStatus(status, friendlyError(error.message), 'error');
      return;
    }

    setStatus(status, 'Nota recebida guardada.', 'success');
    await loadRows();
  });

  requireSession(async (sessionUser) => {
    user = sessionUser;
    courses = await loadCourses();
    fillCourseSelect(document.getElementById('assessmentCourse'), courses);
    fillExpectedOptions();
    updateFields();
    document.getElementById('assessmentDate').value = new Date().toISOString().slice(0, 10);
    await loadRows();
  });
})();
