/* global bootstrap */
/**
 * Interface do protótipo ISEP Study-Life Balance Tracker.
 * Estado em localStorage, renderização declarativa em HTML e Bootstrap 5.
 */
(function () {
  'use strict';

  const CORE = window.SLTCore;
  const DATA = window.SLTData;
  const STORAGE_KEY = 'slbt.state.v1';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const nf1 = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf0 = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const WEEKDAYS_LONG = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const MONTHS_LONG = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  const ROUTES = {
    dashboard: { title: 'Visão geral', breadcrumb: 'Painel' },
    ects: { title: 'Gestão de ECTS', breadcrumb: 'Protótipo · LAPR1' },
    registo: { title: 'Registo de atividade', breadcrumb: 'Protótipo · LAPR1' },
    burnout: { title: 'Bem-estar', breadcrumb: 'Protótipo · LAPR1' },
    sobre: { title: 'Documentação', breadcrumb: 'Protótipo · LAPR1' },
  };

  const SCENARIO_LABELS = {
    default: 'Demonstração base',
    balanced: 'Equilibrado',
    overload: 'Sobrecarga',
    recovery: 'Recuperação',
    custom: 'Personalizado',
  };

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  let state = loadState();
  let logFilters = { period: '7', courseId: 'all', type: 'all' };
  let confirmCallback = null;

  const courseModal = new bootstrap.Modal($('#courseModal'));
  const confirmModal = new bootstrap.Modal($('#confirmModal'));

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ESCAPES[character]);
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function safeColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : '#0f9d8a';
  }

  function hexToSoft(hex, alpha) {
    const color = safeColor(hex).slice(1);
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function courseStyle(course) {
    const color = safeColor(course.color);
    return `--course-color:${color};--course-soft:${hexToSoft(color, 0.12)};`;
  }

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function numberText(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? nf0.format(number) : nf1.format(number);
  }

  function hoursText(minutes) {
    const value = CORE.formatHours(minutes);
    return value === 0 ? '0 h' : `${nf1.format(value)} h`;
  }

  function hoursNumber(minutes) {
    const value = CORE.formatHours(minutes);
    return value === 0 ? '0' : nf1.format(value);
  }

  function durationText(minutes) {
    const value = Math.max(0, Number(minutes) || 0);
    if (value < 60) return `${value} min`;
    const hours = Math.floor(value / 60);
    const remainder = value % 60;
    return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
  }

  function percentText(ratio) {
    return `${nf0.format((Number(ratio) || 0) * 100)}%`;
  }

  function weekdayLabel(date) {
    return WEEKDAYS[date.getDay()];
  }

  function shortDate(date) {
    return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
  }

  function longDate(date) {
    return `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} de ${MONTHS_LONG[date.getMonth()]}`;
  }

  function dateLabel(key) {
    const today = CORE.dateKey(new Date());
    const yesterday = CORE.dateKey(CORE.addDays(new Date(), -1));
    if (key === today) return 'Hoje';
    if (key === yesterday) return 'Ontem';
    return shortDate(CORE.parseDateKey(key));
  }

  function dateTimeLabel(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '—';
    return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)} · ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }

  function typeMeta(type) {
    return CORE.TYPE_META[type] || { label: type, icon: 'bi-dot', accent: '#64748b' };
  }

  function severityIcon(severity) {
    return {
      success: 'bi-check-circle',
      info: 'bi-info-circle',
      warning: 'bi-exclamation-triangle',
      danger: 'bi-exclamation-octagon',
    }[severity] || 'bi-info-circle';
  }

  function loadState() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      raw = null;
    }
    if (!raw) return DATA.seedState(new Date());

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.courses) || !Array.isArray(parsed.logs)) {
        throw new Error('Formato de estado inválido');
      }
      parsed.settings = { ...CORE.DEFAULTS, ...(parsed.settings || {}) };
      parsed.profile = {
        name: 'Nuno Sousa',
        firstName: 'Nuno',
        initials: 'NS',
        degree: 'LEI · 1.º ano',
        semester: '2026/27 · 1.º semestre',
        ...(parsed.profile || {}),
      };
      parsed.meta = parsed.meta || {};
      parsed.logs = parsed.logs.filter(
        (log) => log && log.date && log.type && Number.isFinite(Number(log.minutes))
      );
      return parsed;
    } catch (error) {
      console.warn('Não foi possível ler o estado guardado. A repor demonstração.', error);
      return DATA.seedState(new Date());
    }
  }

  function saveState() {
    state.meta = state.meta || {};
    state.meta.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Não foi possível guardar o estado.', error);
      showToast('Não foi possível guardar', 'O armazenamento local pode estar cheio ou bloqueado.', 'danger');
    }
  }

  function markCustom() {
    state.meta = state.meta || {};
    state.meta.scenario = 'custom';
    state.meta.demo = true;
  }

  function currentRoute() {
    const hash = window.location.hash.replace(/^#/, '');
    return ROUTES[hash] ? hash : 'dashboard';
  }

  function applyRoute() {
    const route = currentRoute();
    $$('[data-view]').forEach((section) => {
      section.hidden = section.dataset.view !== route;
    });
    $$('.sidebar-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.route === route);
    });
    const meta = ROUTES[route];
    $('#pageTitle').textContent = meta.title;
    $('#pageBreadcrumb').textContent = meta.breadcrumb;
    document.title = `${meta.title} · Study-Life Balance Tracker`;
    closeOffcanvas();
    window.scrollTo(0, 0);
  }

  function closeOffcanvas() {
    const sidebar = $('#mobileSidebar');
    if (!sidebar) return;
    const instance = bootstrap.Offcanvas.getInstance(sidebar);
    if (instance) instance.hide();
  }

  function setProgressBar(fillElement, percent, color) {
    if (!fillElement) return;
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    fillElement.style.width = `${value}%`;
    if (color) fillElement.style.backgroundColor = color;
    const track = fillElement.parentElement;
    if (track) {
      track.setAttribute('aria-valuenow', String(Math.round(percent || 0)));
      track.setAttribute('aria-valuetext', `${Math.round(percent || 0)}%`);
    }
  }

  function setRiskBadge(element, level) {
    if (!element) return;
    element.className = `badge risk-badge risk-badge--${level.key}`;
    element.textContent = level.label;
  }

  function showFormError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
  }

  function clearFormError(element) {
    if (!element) return;
    element.textContent = '';
    element.hidden = true;
  }

  function renderProfile() {
    const profile = state.profile;
    $$('.js-profile-name').forEach((element) => {
      element.textContent = profile.name;
    });
    $$('.js-degree').forEach((element) => {
      element.textContent = profile.degree;
    });
    $$('.js-semester').forEach((element) => {
      element.textContent = profile.semester;
    });
    $$('.js-avatar').forEach((element) => {
      element.textContent = profile.initials;
    });
    $$('.js-log-count').forEach((element) => {
      element.textContent = String(state.logs.length);
    });
    $('#topbarDate').innerHTML = `<i class="bi bi-calendar3"></i> ${esc(longDate(new Date()))}`;
  }

  function renderSidebarRisk(risk) {
    $$('.js-risk-dot').forEach((dot) => {
      dot.style.backgroundColor = risk.level.color;
      dot.style.boxShadow = `0 0 0 4px ${hexToSoft(risk.level.color, 0.14)}`;
    });
  }

  function renderDashboard(metrics, risk, now) {
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 20 ? 'Boa tarde' : 'Boa noite';
    $('#heroGreeting').textContent = `${greeting}, ${state.profile.firstName || 'estudante'}.`;
    $('#heroDate').textContent = longDate(now);

    setRiskBadge($('#heroRiskBadge'), risk.level);
    $('#heroRiskScore').textContent = String(risk.score);
    $('#heroRiskMessage').textContent = risk.level.message;
    $('#heroRiskBar').style.backgroundColor = risk.level.color;
    setProgressBar($('#heroRiskBar'), risk.score);

    const autonomousPercent = Math.round(metrics.ratio * 100);
    const restPercent = Math.round(metrics.restRatio * 100);
    $('#kpiAutonomous').innerHTML = `${hoursNumber(metrics.autonomousMinutes)} <small>h</small>`;
    $('#kpiAutonomousMeta').textContent = hoursText(metrics.targetMinutes);
    $('#kpiAutonomousPct').textContent = `${autonomousPercent}%`;
    setProgressBar(
      $('#kpiAutonomousBar'),
      autonomousPercent,
      autonomousPercent > 120 ? '#f59e0b' : '#0f9d8a'
    );

    $('#kpiRest').innerHTML = `${hoursNumber(metrics.restMinutes)} <small>h</small>`;
    $('#kpiRestMeta').textContent = hoursText(metrics.restTargetMinutes);
    $('#kpiRestPct').textContent = `${restPercent}%`;
    setProgressBar(
      $('#kpiRestBar'),
      restPercent,
      restPercent < 50 ? '#f59e0b' : '#22c55e'
    );

    $('#kpiStreak').textContent = String(metrics.consecutiveDays);
    $('#kpiStreakNote').textContent =
      metrics.consecutiveDays >= 7
        ? 'sem pausa dedicada'
        : metrics.consecutiveDays >= 5
          ? 'pausas curtas'
          : 'ritmo equilibrado';
    const streakBadge = $('#kpiStreakBadge');
    streakBadge.textContent = metrics.consecutiveDays >= 5 ? 'Atenção' : 'Em linha';
    streakBadge.className =
      metrics.consecutiveDays >= 5 ? 'metric-chip metric-chip-warning' : 'metric-chip metric-chip-success';

    const activeFactors = risk.factors.filter((factor) => factor.points > 0);
    $('#kpiRisk').textContent = String(risk.score);
    const riskChipTone =
      risk.levelKey === 'low' ? 'success' : risk.levelKey === 'moderate' ? 'warning' : 'danger';
    const riskChip = $('#kpiRiskBadge');
    riskChip.textContent = risk.level.label;
    riskChip.className = `metric-chip metric-chip-${riskChipTone}`;
    $('#kpiRiskNote').textContent =
      activeFactors.length > 0
        ? `${activeFactors.length} ${activeFactors.length === 1 ? 'fator' : 'fatores'} em atenção`
        : 'sem fatores em atenção';
    $('#kpiRiskBar').style.backgroundColor = risk.level.color;
    setProgressBar($('#kpiRiskBar'), risk.score);

    const streakTrack = $('.metric-mini-track');
    if (streakTrack) {
      $$('span', streakTrack).forEach((segment, index) => {
        const active = index < Math.min(7, metrics.consecutiveDays);
        segment.style.backgroundColor = active ? risk.level.color : '#e2e8f0';
        segment.style.opacity = active ? '1' : '0.55';
      });
    }

    renderWeeklyChart(metrics);
    renderSignals(activeFactors);
    renderCourseGoals(metrics);
    renderRecentLogs();

    const signalsCount = $('#signalsCount');
    signalsCount.className =
      activeFactors.length > 0 ? 'badge badge-soft-warning' : 'badge badge-soft-success';
    signalsCount.textContent = String(activeFactors.length);
  }

  function renderWeeklyChart(metrics) {
    const maxDailyHours = Math.max(
      1,
      ...metrics.days.map((day) => Math.max(day.studyMinutes, day.restMinutes) / 60)
    );
    const scale = Math.max(8, Math.ceil(maxDailyHours / 2) * 2);
    $('#chartScaleNote').textContent = `Escala: ${scale} h/dia`;

    $('#weeklyChart').innerHTML = metrics.days
      .map((day) => {
        const studyHours = day.studyMinutes / 60;
        const restHours = day.restMinutes / 60;
        const studyPercent = Math.min(100, (studyHours / scale) * 100);
        const restPercent = Math.min(100, (restHours / scale) * 100);
        const isToday = day.key === metrics.todayKey;
        const dayName = weekdayLabel(day.date);
        return `
          <div class="chart-col" aria-label="${esc(dayName)}: ${esc(hoursText(day.studyMinutes))} de trabalho académico e ${esc(hoursText(day.restMinutes))} de descanso">
            <div class="chart-bars">
              <div class="chart-bar study ${day.studyMinutes ? '' : 'is-zero'}" style="height:${studyPercent}%" title="${esc(dayName)} · ${esc(hoursText(day.studyMinutes))} de trabalho"></div>
              <div class="chart-bar rest ${day.restMinutes ? '' : 'is-zero'}" style="height:${restPercent}%" title="${esc(dayName)} · ${esc(hoursText(day.restMinutes))} de descanso"></div>
            </div>
            <span class="chart-day ${isToday ? 'is-today' : ''}">
              ${esc(dayName)}
              <small>${esc(shortDate(day.date))}</small>
            </span>
          </div>
        `;
      })
      .join('');
  }

  function renderSignals(activeFactors) {
    const list = $('#signalsList');
    if (!activeFactors.length) {
      list.innerHTML = `
        <div class="signal-empty">
          <i class="bi bi-check-circle"></i>
          Sem sinais relevantes. Mantém as pausas e o descanso.
        </div>
      `;
      return;
    }

    list.innerHTML = activeFactors
      .slice(0, 3)
      .map(
        (factor) => `
          <div class="signal-item">
            <span class="signal-icon ${factor.severity}"><i class="bi ${severityIcon(factor.severity)}"></i></span>
            <div class="signal-copy">
              <strong>${esc(factor.label)}</strong>
              <span>${esc(factor.detail)}</span>
            </div>
            <span class="signal-points">+${factor.points}</span>
          </div>
        `
      )
      .join('');

    if (activeFactors.length > 3) {
      list.insertAdjacentHTML(
        'beforeend',
        `<p class="signal-empty mb-0">+${activeFactors.length - 3} fatores na análise completa.</p>`
      );
    }
  }

  function renderCourseGoals(metrics) {
    const list = $('#courseGoalsList');
    if (!metrics.perCourse.length) {
      list.innerHTML = `<p class="recent-empty">Ainda não tens UCs. <a href="#ects" class="panel-link">Criar a primeira</a>.</p>`;
      return;
    }

    const rows = [...metrics.perCourse].sort((a, b) => b.ratio - a.ratio);
    list.innerHTML = rows
      .map((row) => {
        const percent = Math.round(row.ratio * 100);
        const color = safeColor(row.course.color);
        return `
          <div class="goal-row" style="--dot:${color};--bar:${color}">
            <div class="goal-name">
              <span class="course-dot"></span>
              <span title="${esc(row.course.name)}">${esc(row.course.name)}</span>
            </div>
            <div class="goal-value">
              <strong>${esc(hoursText(row.autonomousMinutes))}</strong> / ${esc(hoursText(row.targetMinutes))}
            </div>
            <div class="goal-progress" role="progressbar" aria-label="Meta de ${esc(row.course.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, percent)}" aria-valuetext="${percent}%">
              <span class="${percent > 110 ? 'is-over' : ''}" style="width:${Math.min(100, percent)}%"></span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function renderRecentLogs() {
    const list = $('#recentLogsList');
    const recent = sortLogsDesc(state.logs).slice(0, 5);
    if (!recent.length) {
      list.innerHTML = `<p class="recent-empty">Sem registos. Adiciona as primeiras horas no <a href="#registo" class="panel-link">registo diário</a>.</p>`;
      return;
    }

    list.innerHTML = recent
      .map((log) => {
        const meta = typeMeta(log.type);
        const course = log.type === 'descanso' ? null : CORE.courseById(state.courses, log.courseId);
        const title = log.type === 'descanso' ? 'Bem-estar' : course ? course.name : 'UC removida';
        return `
          <div class="recent-item">
            <span class="recent-icon" style="color:${meta.accent};background:${hexToSoft(meta.accent, 0.12)}">
              <i class="bi ${meta.icon}"></i>
            </span>
            <div class="recent-copy">
              <strong title="${esc(title)}">${esc(title)}</strong>
              <small>${esc(meta.label)} · ${esc(dateLabel(log.date))}</small>
            </div>
            <span class="recent-duration">${esc(durationText(log.minutes))}</span>
          </div>
        `;
      })
      .join('');
  }

  function renderCourses(metrics) {
    $('#ectsStatTotal').textContent = numberText(metrics.totalEcts);
    $('#ectsStatHours').textContent = numberText(metrics.totalWeeklyHours);
    $('#ectsStatContact').textContent = numberText(metrics.contactHours);
    $('#ectsStatAutonomous').textContent = numberText(metrics.targetHours);
    $('#courseCountBadge').textContent = String(state.courses.length);
    $('#courseFormula').textContent = `1 ECTS = ${metrics.settings.ectsHours} h · meta semanal = (ECTS × ${metrics.settings.ectsHours} ÷ ${metrics.settings.semesterWeeks}) − horas de contacto`;

    const grid = $('#coursesGrid');
    if (!state.courses.length) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="panel empty-state">
            <span class="empty-icon"><i class="bi bi-journal-plus"></i></span>
            <h4>Ainda não tens unidades curriculares</h4>
            <p>Cria a primeira UC para calcular a meta semanal de estudo autónomo.</p>
            <button type="button" class="btn btn-primary" data-new-course>
              <i class="bi bi-plus-lg"></i> Criar primeira UC
            </button>
          </div>
        </div>
      `;
    } else {
      grid.innerHTML = metrics.perCourse
        .map((row) => {
          const course = row.course;
          const percent = Math.round(row.ratio * 100);
          const totalWeekly = CORE.courseTotalWeeklyHours(course, metrics.settings);
          const footnote =
            percent > 110
              ? 'Acima da meta — atenção à carga.'
              : row.targetMinutes === 0
                ? 'Sem horas autónomas disponíveis.'
                : row.autonomousMinutes === 0
                  ? 'Ainda sem registos nesta janela.'
                  : 'Dentro da janela móvel de 7 dias.';
          return `
            <div class="col-md-6 col-xl-4">
              <article class="course-card" style="${courseStyle(course)}">
                <div class="course-card-top">
                  <span class="course-code">${esc(course.code)}</span>
                  <span class="course-ects">${esc(numberText(course.ects))} ECTS</span>
                  <span class="course-actions">
                    <button type="button" class="course-action" data-edit-course="${esc(course.id)}" aria-label="Editar ${esc(course.name)}" title="Editar UC">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="course-action danger" data-delete-course="${esc(course.id)}" aria-label="Eliminar ${esc(course.name)}" title="Eliminar UC">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </span>
                </div>
                <h3 title="${esc(course.name)}">${esc(course.name)}</h3>
                <p class="course-meta">${esc(numberText(course.contactHours))} h de contacto / semana</p>
                <div class="course-metrics">
                  <div class="course-metric">
                    <span>Meta autónoma</span>
                    <strong>${esc(hoursText(row.targetMinutes))}</strong>
                  </div>
                  <div class="course-metric">
                    <span>Registado</span>
                    <strong>${esc(hoursText(row.autonomousMinutes))}</strong>
                  </div>
                  <div class="course-metric">
                    <span>Carga total</span>
                    <strong>${esc(nf1.format(totalWeekly))} h</strong>
                  </div>
                </div>
                <div class="course-goal">
                  <div class="course-goal-head">
                    <span>Progresso da meta</span>
                    <span><strong>${percent}%</strong></span>
                  </div>
                  <div class="course-progress" role="progressbar" aria-label="Progresso da meta de ${esc(course.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, percent)}" aria-valuetext="${percent}%">
                    <span class="${percent > 110 ? 'is-over' : ''}" style="width:${Math.min(100, percent)}%"></span>
                  </div>
                  <div class="course-footnote">${esc(footnote)}</div>
                </div>
              </article>
            </div>
          `;
        })
        .join('');
    }

    renderCourseOptions();
  }

  function renderCourseOptions() {
    const options = state.courses
      .map((course) => `<option value="${esc(course.id)}">${esc(course.code)} — ${esc(course.name)}</option>`)
      .join('');

    const courseSelect = $('#logCourse');
    const previousCourse = courseSelect.value;
    courseSelect.innerHTML = state.courses.length
      ? `<option value="" disabled>Seleciona uma UC</option>${options}`
      : '<option value="">Sem UCs criadas</option>';

    if (state.courses.some((course) => course.id === previousCourse)) {
      courseSelect.value = previousCourse;
    } else if (state.courses.length) {
      courseSelect.selectedIndex = 1;
    }

    const filterSelect = $('#logFilterCourse');
    const previousFilter = logFilters.courseId;
    filterSelect.innerHTML = `<option value="all">Todas as UCs</option>${options}`;
    if (previousFilter === 'all' || state.courses.some((course) => course.id === previousFilter)) {
      filterSelect.value = previousFilter;
    } else {
      logFilters.courseId = 'all';
      filterSelect.value = 'all';
    }

    syncLogCourseState();
  }

  function syncLogCourseState() {
    const isRest = $('#logType').value === 'descanso';
    const select = $('#logCourse');
    const help = $('#logCourseHelp');

    if (isRest) {
      select.disabled = true;
      select.required = false;
      select.value = '';
      help.textContent = 'O descanso não está associado a uma UC.';
      return;
    }

    if (!state.courses.length) {
      select.disabled = true;
      select.required = false;
      help.textContent = 'Cria uma UC no módulo ECTS para poderes registar atividade.';
      return;
    }

    select.disabled = false;
    select.required = true;
    if (!select.value) select.selectedIndex = 1;
    help.textContent = 'Associa o registo a uma UC.';
  }

  function sortLogsDesc(logs) {
    return [...logs].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }

  function filteredLogs() {
    let logs = [...state.logs];
    if (logFilters.period !== 'all') {
      const days = CORE.lastNDays(Number(logFilters.period) || 7, new Date());
      const startKey = days[0].key;
      logs = logs.filter((log) => log.date >= startKey);
    }
    if (logFilters.courseId !== 'all') {
      logs = logs.filter((log) => log.courseId === logFilters.courseId);
    }
    if (logFilters.type !== 'all') {
      logs = logs.filter((log) => log.type === logFilters.type);
    }
    return sortLogsDesc(logs);
  }

  function renderLogs() {
    const logs = filteredLogs();
    const workload = CORE.sumMinutes(logs, CORE.STUDY_TYPES);
    const autonomous = CORE.sumMinutes(logs, CORE.AUTONOMOUS_TYPES);
    const rest = CORE.sumMinutes(logs, ['descanso']);

    $('#logSummaryWorkload').textContent = hoursText(workload);
    $('#logSummaryAutonomous').textContent = hoursText(autonomous);
    $('#logSummaryRest').textContent = hoursText(rest);
    $('#logsCount').textContent = String(logs.length);

    const body = $('#logsTableBody');
    const tableWrap = $('#logsTableWrap');
    const empty = $('#logsEmpty');

    if (!logs.length) {
      body.innerHTML = '';
      tableWrap.hidden = true;
      empty.hidden = false;
      return;
    }

    tableWrap.hidden = false;
    empty.hidden = true;

    body.innerHTML = logs
      .map((log) => {
        const meta = typeMeta(log.type);
        const course = log.type === 'descanso' ? null : CORE.courseById(state.courses, log.courseId);
        const courseName = log.type === 'descanso' ? 'Bem-estar' : course ? course.name : 'UC removida';
        const courseColor = log.type === 'descanso' ? '#16a34a' : course ? safeColor(course.color) : '#94a3b8';
        return `
          <tr>
            <td><span class="log-date">${esc(dateLabel(log.date))}</span></td>
            <td>
              <span class="log-course">
                <span class="course-dot" style="--dot:${courseColor}"></span>
                <span title="${esc(courseName)}">${esc(courseName)}</span>
              </span>
            </td>
            <td>
              <span class="type-badge ${esc(log.type)}">
                <i class="bi ${meta.icon}"></i> ${esc(meta.label)}
              </span>
            </td>
            <td>${esc(durationText(log.minutes))}</td>
            <td><span class="log-note" title="${esc(log.note || '')}">${esc(log.note || '—')}</span></td>
            <td class="text-end">
              <button type="button" class="log-delete" data-delete-log="${esc(log.id)}" aria-label="Eliminar registo de ${esc(dateLabel(log.date))}" title="Eliminar registo">
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function renderBurnout(metrics, risk, now) {
    const gauge = $('#riskGauge');
    gauge.style.setProperty('--gauge-value', String(risk.score));
    gauge.style.setProperty('--gauge-color', risk.level.color);
    gauge.setAttribute('aria-label', `Pontuação de risco de burnout: ${risk.score} de 100, risco ${risk.level.label.toLowerCase()}`);
    $('#riskScore').textContent = String(risk.score);

    const levelBadge = $('#riskLevelBadge');
    setRiskBadge(levelBadge, risk.level);
    $('#riskLevelText').textContent = `Risco ${risk.level.label.toLowerCase()}`;
    $('#riskMessage').textContent = risk.level.message;
    $('#riskWindow').textContent = `atualizado às ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    $('#riskRecommendations').innerHTML = risk.recommendations
      .map((recommendation) => `<li>${esc(recommendation)}</li>`)
      .join('');

    const factors = Object.fromEntries(risk.factors.map((factor) => [factor.key, factor]));

    renderHabit('Streak', `${metrics.consecutiveDays} ${metrics.consecutiveDays === 1 ? 'dia' : 'dias'}`, factors.streak.points > 0 ? 'sem pausa dedicada' : 'pausas em dia', factors.streak);
    renderHabit(
      'Load',
      `${Math.round(metrics.ratio * 100)}%`,
      `${hoursText(metrics.autonomousMinutes)} de ${hoursText(metrics.targetMinutes)}`,
      factors.load
    );
    renderHabit(
      'Rest',
      hoursText(metrics.restMinutes),
      `${Math.round(metrics.restRatio * 100)}% da meta`,
      factors.rest
    );
    renderHabit(
      'Longest',
      durationText(metrics.longestSessionMinutes),
      'nos últimos 7 dias',
      factors.longest
    );

    $('#riskFactorsList').innerHTML = risk.factors
      .map((factor) => {
        const pointsClass =
          factor.severity === 'success'
            ? 'is-success'
            : factor.severity === 'warning' || factor.severity === 'info'
              ? 'is-warning'
              : 'is-danger';
        return `
          <div class="factor-item">
            <span class="factor-icon ${factor.severity}"><i class="bi ${severityIcon(factor.severity)}"></i></span>
            <div class="factor-copy">
              <strong>${esc(factor.label)}</strong>
              <span>${esc(factor.detail)}</span>
            </div>
            <span class="factor-points ${pointsClass}">${factor.points > 0 ? `+${factor.points}` : '0'} pts</span>
          </div>
        `;
      })
      .join('');

    renderHeatmap(metrics, now);
  }

  function renderHabit(key, value, note, factor) {
    const valueElement = $(`#habit${key}`);
    const noteElement = $(`#habit${key}Note`);
    const statusElement = $(`#habit${key}Status`);
    if (valueElement) valueElement.textContent = value;
    if (noteElement) noteElement.textContent = note;
    if (!statusElement) return;

    let tone = '';
    let icon = 'bi-check-lg';
    if (factor.severity === 'warning' || factor.severity === 'info') {
      tone = ' is-warning';
      icon = 'bi-exclamation-triangle';
    } else if (factor.severity === 'danger') {
      tone = ' is-danger';
      icon = 'bi-exclamation-octagon';
    }
    statusElement.className = `habit-status${tone}`;
    statusElement.innerHTML = `<i class="bi ${icon}"></i>`;
  }

  function renderHeatmap(metrics, now) {
    const maxHours = Math.max(1, ...metrics.days.map((day) => day.autonomousMinutes / 60));
    const scale = Math.max(4, Math.ceil(maxHours));
    $('#burnoutHeatmap').innerHTML = metrics.days
      .map((day) => {
        const hours = day.autonomousMinutes / 60;
        const height = Math.min(100, (hours / scale) * 100);
        const loadClass =
          hours === 0 ? 'load-0' : hours < 2 ? 'load-1' : hours < 4 ? 'load-2' : hours < 6 ? 'load-3' : 'load-4';
        const isToday = day.key === metrics.todayKey;
        return `
          <div class="heat-day ${isToday ? 'is-today' : ''}" title="${esc(weekdayLabel(day.date))}: ${esc(hoursText(day.autonomousMinutes))} de estudo autónomo + ${esc(hoursText(day.restMinutes))} de descanso">
            <span class="heat-weekday">${esc(weekdayLabel(day.date))}</span>
            <span class="heat-date">${esc(shortDate(day.date))}</span>
            <div class="heat-bar-track">
              <div class="heat-bar ${loadClass}" style="height:${height}%"></div>
            </div>
            <span class="heat-hours">${esc(hoursNumber(day.autonomousMinutes))} h</span>
            <span class="heat-rest">${esc(hoursNumber(day.restMinutes))} h pausa</span>
          </div>
        `;
      })
      .join('');
  }

  function renderAbout() {
    $('#aboutCourses').textContent = String(state.courses.length);
    $('#aboutLogs').textContent = String(state.logs.length);
    $('#aboutScenario').textContent = SCENARIO_LABELS[state.meta.scenario] || 'Personalizado';
    const updatedAt = state.meta.lastUpdated || state.meta.seededAt;
    $('#aboutUpdated').textContent = updatedAt ? dateTimeLabel(updatedAt) : '—';
  }

  function render() {
    const risk = CORE.risk(state, new Date());
    const metrics = risk.metrics;
    renderProfile();
    renderSidebarRisk(risk);
    renderDashboard(metrics, risk, new Date());
    renderCourses(metrics);
    renderLogs();
    renderBurnout(metrics, risk, new Date());
    renderAbout();
    syncLogFilterControls();
  }

  function syncLogFilterControls() {
    $('#logFilterPeriod').value = logFilters.period;
    $('#logFilterType').value = logFilters.type;
    $('#logFilterCourse').value = logFilters.courseId;
  }

  function setLogFormDefaults() {
    const today = CORE.dateKey(new Date());
    $('#logDate').value = today;
    $('#logDate').max = today;
    $('#logMinutes').value = '';
    $('#logNote').value = '';
    $('#logFormError').hidden = true;
    $$('[data-quick-minutes]').forEach((button) => button.classList.remove('is-active'));
    renderCourseOptions();
    syncLogCourseState();
  }

  function openCourseModal(course) {
    const form = $('#courseForm');
    form.reset();
    form.classList.remove('was-validated');
    clearFormError($('#courseFormError'));
    $('#courseId').value = '';
    $('#courseModalTitle').textContent = course ? 'Editar UC' : 'Nova UC';
    $('#courseSubmitBtn').textContent = course ? 'Guardar alterações' : 'Criar UC';

    if (course) {
      $('#courseId').value = course.id;
      $('#courseName').value = course.name;
      $('#courseCode').value = course.code;
      $('#courseEcts').value = course.ects;
      $('#courseContactHours').value = course.contactHours;
      $('#courseColor').value = safeColor(course.color);
    } else {
      $('#courseName').value = '';
      $('#courseCode').value = '';
      $('#courseEcts').value = '6';
      $('#courseContactHours').value = '3';
      const palette = DATA.COURSE_COLORS;
      $('#courseColor').value = palette[state.courses.length % palette.length];
    }

    courseModal.show();
  }

  function saveCourse(event) {
    event.preventDefault();
    const form = $('#courseForm');
    const errorBox = $('#courseFormError');
    clearFormError(errorBox);

    const name = $('#courseName').value.trim();
    const code = $('#courseCode').value.trim().toUpperCase();
    const ects = Number($('#courseEcts').value);
    const contactHours = Number($('#courseContactHours').value);
    const color = safeColor($('#courseColor').value);
    const editingId = $('#courseId').value;

    if (!form.checkValidity() || !name || !code) {
      form.classList.add('was-validated');
      showFormError(errorBox, 'Preenche o nome, o código, os ECTS e as horas de contacto.');
      return;
    }
    if (!Number.isFinite(ects) || ects <= 0) {
      showFormError(errorBox, 'Os ECTS têm de ser um número positivo.');
      return;
    }
    if (!Number.isFinite(contactHours) || contactHours < 0) {
      showFormError(errorBox, 'As horas de contacto não podem ser negativas.');
      return;
    }
    const duplicate = state.courses.some(
      (course) => course.id !== editingId && course.code.toUpperCase() === code
    );
    if (duplicate) {
      showFormError(errorBox, `Já existe uma UC com o código ${code}.`);
      return;
    }

    if (editingId) {
      const course = CORE.courseById(state.courses, editingId);
      if (!course) {
        showFormError(errorBox, 'A UC já não existe. Fecha e tenta novamente.');
        return;
      }
      Object.assign(course, { name, code, ects, contactHours, color });
      showToast('UC atualizada', `${name} foi atualizada.`, 'success');
    } else {
      state.courses.push({
        id: makeId('course'),
        name,
        code,
        ects,
        contactHours,
        color,
      });
      showToast('UC criada', `${name} entrou no teu plano.`, 'success');
    }

    markCustom();
    saveState();
    courseModal.hide();
    render();
  }

  function deleteCourse(courseId) {
    const course = CORE.courseById(state.courses, courseId);
    if (!course) return;
    const linkedLogs = state.logs.filter((log) => log.courseId === courseId).length;
    askConfirm({
      title: 'Eliminar unidade curricular?',
      message: linkedLogs
        ? `“${course.name}” e ${linkedLogs} ${linkedLogs === 1 ? 'registo associado' : 'registos associados'} serão eliminados. Esta ação não pode ser anulada.`
        : `“${course.name}” será removida do plano. Esta ação não pode ser anulada.`,
      confirmLabel: 'Eliminar UC',
      danger: true,
      onConfirm: () => {
        state.courses = state.courses.filter((item) => item.id !== courseId);
        state.logs = state.logs.filter((log) => log.courseId !== courseId);
        if (logFilters.courseId === courseId) logFilters.courseId = 'all';
        markCustom();
        saveState();
        render();
        showToast('UC eliminada', `${course.name} foi removida.`, 'success');
      },
    });
  }

  function addLog(event) {
    event.preventDefault();
    const form = $('#logForm');
    const errorBox = $('#logFormError');
    clearFormError(errorBox);

    const date = $('#logDate').value;
    const type = $('#logType').value;
    const courseId = type === 'descanso' ? null : $('#logCourse').value;
    const minutes = Number($('#logMinutes').value);
    const note = $('#logNote').value.trim();
    const today = CORE.dateKey(new Date());

    if (!form.checkValidity() || !date) {
      form.classList.add('was-validated');
      showFormError(errorBox, 'Preenche a data, o tipo, a duração e a UC quando aplicável.');
      return;
    }
    if (date > today) {
      showFormError(errorBox, 'Não podes registar atividade numa data futura.');
      return;
    }
    if (!Number.isFinite(minutes) || minutes < 5 || minutes > 720) {
      showFormError(errorBox, 'A duração deve estar entre 5 e 720 minutos.');
      return;
    }
    if (type !== 'descanso' && !state.courses.some((course) => course.id === courseId)) {
      showFormError(errorBox, 'Cria uma UC no módulo ECTS antes de registar esta atividade.');
      return;
    }

    state.logs.push({
      id: makeId('log'),
      date,
      courseId,
      type,
      minutes,
      note,
      createdAt: new Date().toISOString(),
    });

    logFilters = { period: '7', courseId: 'all', type: 'all' };
    syncLogFilterControls();
    markCustom();
    saveState();
    setLogFormDefaults();
    render();
    showToast('Registo adicionado', `${durationText(minutes)} de ${typeMeta(type).label.toLowerCase()}.`, 'success');
  }

  function deleteLog(logId) {
    const log = state.logs.find((item) => item.id === logId);
    if (!log) return;
    const course = log.type === 'descanso' ? null : CORE.courseById(state.courses, log.courseId);
    const label = log.type === 'descanso' ? 'Bem-estar' : course ? course.name : 'UC removida';
    askConfirm({
      title: 'Eliminar registo?',
      message: `${typeMeta(log.type).label} · ${durationText(log.minutes)} · ${label} (${dateLabel(log.date)}). Esta ação não pode ser anulada.`,
      confirmLabel: 'Eliminar registo',
      danger: true,
      onConfirm: () => {
        state.logs = state.logs.filter((item) => item.id !== logId);
        markCustom();
        saveState();
        render();
        showToast('Registo eliminado', 'O histórico foi atualizado.', 'success');
      },
    });
  }

  function applyScenario(scenarioKey) {
    const scenario = DATA.SCENARIOS[scenarioKey];
    if (!scenario) return;
    askConfirm({
      title: `Aplicar cenário “${scenario.label}”?`,
      message:
        'Os registos atuais serão substituídos por uma semana de demonstração. As unidades curriculares mantêm-se. Esta ação pode ser revertida com “Repor demo”.',
      confirmLabel: 'Aplicar cenário',
      danger: scenarioKey === 'overload',
      onConfirm: () => {
        state.logs = DATA.buildScenarioLogs(scenarioKey, new Date());
        state.meta.scenario = scenarioKey;
        state.meta.demo = true;
        logFilters = { period: '7', courseId: 'all', type: 'all' };
        saveState();
        render();
        showToast(`Cenário “${scenario.label}” aplicado`, 'O motor de risco foi recalculado.', 'success');
      },
    });
  }

  function resetDemo() {
    askConfirm({
      title: 'Repor demonstração?',
      message:
        'As UCs e os registos atuais serão substituídos pelos dados de demonstração. Esta ação não pode ser anulada.',
      confirmLabel: 'Repor demo',
      danger: true,
      onConfirm: () => {
        state = DATA.seedState(new Date());
        logFilters = { period: '7', courseId: 'all', type: 'all' };
        saveState();
        setLogFormDefaults();
        render();
        showToast('Demonstração reposta', 'Os dados mock voltaram ao estado inicial.', 'success');
      },
    });
  }

  function askConfirm({ title, message, confirmLabel, danger, onConfirm }) {
    $('#confirmTitle').textContent = title;
    $('#confirmMessage').textContent = message;
    const okButton = $('#confirmOkBtn');
    okButton.textContent = confirmLabel || 'Confirmar';
    okButton.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
    const icon = $('#confirmIcon');
    icon.classList.toggle('is-danger', Boolean(danger));
    icon.innerHTML = `<i class="bi ${danger ? 'bi-exclamation-triangle' : 'bi-question-circle'}"></i>`;
    confirmCallback = onConfirm;
    confirmModal.show();
  }

  function showToast(title, message, tone) {
    const tones = {
      success: { icon: 'bi-check-circle-fill', className: 'tone-green' },
      info: { icon: 'bi-info-circle-fill', className: 'tone-blue' },
      warning: { icon: 'bi-exclamation-triangle-fill', className: 'tone-amber' },
      danger: { icon: 'bi-x-circle-fill', className: 'tone-coral' },
    };
    const meta = tones[tone] || tones.success;
    const element = document.createElement('div');
    element.className = 'toast';
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');
    element.innerHTML = `
      <div class="toast-body">
        <span class="toast-icon ${meta.className}"><i class="bi ${meta.icon}"></i></span>
        <div class="toast-content">
          <strong>${esc(title)}</strong>
          <span>${esc(message)}</span>
        </div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
      </div>
    `;
    $('#toastContainer').appendChild(element);
    const toast = new bootstrap.Toast(element, { delay: 3800 });
    toast.show();
    element.addEventListener('hidden.bs.toast', () => element.remove());
  }

  function bindEvents() {
    window.addEventListener('hashchange', applyRoute);

    $$('.sidebar-link, .brand').forEach((link) => {
      link.addEventListener('click', closeOffcanvas);
    });

    $('#resetDemoBtn').addEventListener('click', resetDemo);
    $('#aboutResetBtn').addEventListener('click', resetDemo);
    $('#newCourseBtn').addEventListener('click', () => openCourseModal(null));
    $('#courseForm').addEventListener('submit', saveCourse);

    $('#courseModal').addEventListener('hidden.bs.modal', () => {
      $('#courseForm').classList.remove('was-validated');
      clearFormError($('#courseFormError'));
    });

    $('#coursesGrid').addEventListener('click', (event) => {
      const editButton = event.target.closest('[data-edit-course]');
      if (editButton) {
        openCourseModal(CORE.courseById(state.courses, editButton.dataset.editCourse));
        return;
      }
      const deleteButton = event.target.closest('[data-delete-course]');
      if (deleteButton) {
        deleteCourse(deleteButton.dataset.deleteCourse);
        return;
      }
      if (event.target.closest('[data-new-course]')) {
        openCourseModal(null);
      }
    });

    $('#logType').addEventListener('change', syncLogCourseState);

    $('#logMinutes').addEventListener('input', () => {
      $$('[data-quick-minutes]').forEach((button) => button.classList.remove('is-active'));
    });

    $$('[data-quick-minutes]').forEach((button) => {
      button.addEventListener('click', () => {
        $('#logMinutes').value = button.dataset.quickMinutes;
        $$('[data-quick-minutes]').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
      });
    });

    $('#logForm').addEventListener('submit', addLog);
    $('#newLogBtn').addEventListener('click', () => {
      $('#logDate').value = CORE.dateKey(new Date());
      $('#logFormPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => $('#logMinutes').focus(), 250);
    });

    $('#logFilterPeriod').addEventListener('change', (event) => {
      logFilters.period = event.target.value;
      renderLogs();
    });
    $('#logFilterCourse').addEventListener('change', (event) => {
      logFilters.courseId = event.target.value;
      renderLogs();
    });
    $('#logFilterType').addEventListener('change', (event) => {
      logFilters.type = event.target.value;
      renderLogs();
    });
    $('#logFilterReset').addEventListener('click', () => {
      logFilters = { period: '7', courseId: 'all', type: 'all' };
      syncLogFilterControls();
      renderLogs();
    });
    $('#logsEmptyReset').addEventListener('click', () => {
      logFilters = { period: '7', courseId: 'all', type: 'all' };
      syncLogFilterControls();
      renderLogs();
    });

    $('#logsTableBody').addEventListener('click', (event) => {
      const button = event.target.closest('[data-delete-log]');
      if (button) deleteLog(button.dataset.deleteLog);
    });

    $$('.scenario-option').forEach((button) => {
      button.addEventListener('click', () => applyScenario(button.dataset.scenario));
    });

    $('#confirmOkBtn').addEventListener('click', () => {
      const callback = confirmCallback;
      confirmCallback = null;
      confirmModal.hide();
      if (typeof callback === 'function') callback();
    });

    $('#confirmModal').addEventListener('hidden.bs.modal', () => {
      confirmCallback = null;
    });
  }

  function init() {
    if (!state.meta.lastUpdated) saveState();
    setLogFormDefaults();
    bindEvents();
    syncLogFilterControls();
    applyRoute();
    render();
  }

  init();
})();
