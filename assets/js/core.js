/* global module, globalThis */
/**
 * SLTCore — regras de negócio puras do Equilibra (ISEP Study-Life Balance Tracker).
 *
 * Este ficheiro não depende do DOM nem do Bootstrap. É usado pela interface
 * (window.SLTCore) e pelos testes automatizados (module.exports).
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SLTCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULTS = Object.freeze({
    ectsHours: 27,
    semesterWeeks: 20,
    restWeeklyTargetHours: 14,
  });

  const TYPE_META = Object.freeze({
    aula: { label: 'Aula', short: 'Aulas', icon: 'bi-easel2', accent: '#2563eb' },
    estudo: { label: 'Estudo autónomo', short: 'Estudo', icon: 'bi-book', accent: '#0f9d8a' },
    projeto: { label: 'Projeto / reunião', short: 'Projeto', icon: 'bi-people', accent: '#7c3aed' },
    descanso: { label: 'Descanso / lazer', short: 'Descanso', icon: 'bi-cup-hot', accent: '#16a34a' },
  });

  const STUDY_TYPES = Object.freeze(['aula', 'estudo', 'projeto']);
  const AUTONOMOUS_TYPES = Object.freeze(['estudo', 'projeto']);

  const LEVELS = Object.freeze({
    low: {
      key: 'low',
      label: 'Baixo',
      color: '#0f9d8a',
      tone: 'success',
      message: 'Ritmo sustentável. Mantém as pausas e o descanso.',
    },
    moderate: {
      key: 'moderate',
      label: 'Moderado',
      color: '#f59e0b',
      tone: 'warning',
      message: 'Há sinais de desgaste acumulado. Vale a pena abrandar nas próximas 48 horas.',
    },
    high: {
      key: 'high',
      label: 'Elevado',
      color: '#f97316',
      tone: 'danger',
      message: 'A carga está acima do sustentável. Reduz o ritmo e protege o descanso.',
    },
    critical: {
      key: 'critical',
      label: 'Crítico',
      color: '#dc2626',
      tone: 'danger',
      message: 'Sinal de alerta elevado. Faz uma pausa real e procura apoio se este padrão continuar.',
    },
  });

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function parseDateKey(key) {
    const parts = String(key).split('-').map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, amount) {
    const next = startOfDay(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function lastNDays(count, now) {
    const base = now ? new Date(now) : new Date();
    const days = [];
    for (let i = count - 1; i >= 0; i -= 1) {
      const date = addDays(base, -i);
      days.push({ key: dateKey(date), date });
    }
    return days;
  }

  function round1(value) {
    return Math.round((Number(value) || 0) * 10) / 10;
  }

  function round2(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function sumMinutes(logs, types) {
    return (logs || [])
      .filter((log) => log && types.includes(log.type))
      .reduce((total, log) => total + (Number(log.minutes) || 0), 0);
  }

  function courseById(courses, id) {
    return (courses || []).find((course) => course.id === id) || null;
  }

  function courseTotalWeeklyHours(course, settings) {
    const config = { ...DEFAULTS, ...(settings || {}) };
    return round2(((Number(course && course.ects) || 0) * config.ectsHours) / config.semesterWeeks);
  }

  function courseAutonomousTarget(course, settings) {
    return Math.max(0, round2(courseTotalWeeklyHours(course, settings) - (Number(course && course.contactHours) || 0)));
  }

  function totalEcts(courses) {
    return (courses || []).reduce((total, course) => total + (Number(course.ects) || 0), 0);
  }

  function weeklyContactHours(courses) {
    return round1((courses || []).reduce((total, course) => total + (Number(course.contactHours) || 0), 0));
  }

  function weeklyTargetHours(courses, settings) {
    return round1((courses || []).reduce((total, course) => total + courseAutonomousTarget(course, settings), 0));
  }

  function formatHours(minutes) {
    return round1((Number(minutes) || 0) / 60);
  }

  /**
   * Calcula todos os indicadores usados pelo dashboard e pelo motor de risco.
   * A janela principal é móvel: hoje + os seis dias anteriores. Esta decisão
   * evita que o risco pareça artificialmente baixo à segunda-feira.
   */
  function metrics(state, now) {
    const settings = { ...DEFAULTS, ...((state && state.settings) || {}) };
    const courses = (state && state.courses) || [];
    const logs = (state && state.logs) || [];
    const base = now ? new Date(now) : new Date();
    const todayKey = dateKey(base);
    const days = lastNDays(7, base);
    const startKey = days[0].key;
    const endKey = days[days.length - 1].key;
    const windowLogs = logs.filter((log) => log && log.date >= startKey && log.date <= endKey);

    const daily = days.map((day) => {
      const dayLogs = windowLogs.filter((log) => log.date === day.key);
      return {
        ...day,
        logs: dayLogs,
        autonomousMinutes: sumMinutes(dayLogs, AUTONOMOUS_TYPES),
        classMinutes: sumMinutes(dayLogs, ['aula']),
        studyMinutes: sumMinutes(dayLogs, STUDY_TYPES),
        restMinutes: sumMinutes(dayLogs, ['descanso']),
      };
    });

    const autonomousMinutes = daily.reduce((total, day) => total + day.autonomousMinutes, 0);
    const classMinutes = daily.reduce((total, day) => total + day.classMinutes, 0);
    const restMinutes = daily.reduce((total, day) => total + day.restMinutes, 0);

    const perCourse = courses.map((course) => {
      const courseLogs = windowLogs.filter((log) => log.courseId === course.id);
      const targetHours = courseAutonomousTarget(course, settings);
      const targetMinutes = Math.round(targetHours * 60);
      const courseAutonomousMinutes = sumMinutes(courseLogs, AUTONOMOUS_TYPES);
      return {
        course,
        autonomousMinutes: courseAutonomousMinutes,
        classMinutes: sumMinutes(courseLogs, ['aula']),
        targetHours,
        targetMinutes,
        ratio: targetMinutes ? courseAutonomousMinutes / targetMinutes : 0,
      };
    });

    const targetHours = weeklyTargetHours(courses, settings);
    const targetMinutes = Math.round(targetHours * 60);
    const restTargetMinutes = Math.round(Number(settings.restWeeklyTargetHours) * 60);
    const longestSessionMinutes = windowLogs
      .filter((log) => AUTONOMOUS_TYPES.includes(log.type))
      .reduce((longest, log) => Math.max(longest, Number(log.minutes) || 0), 0);

    return {
      settings,
      todayKey,
      windowStartKey: startKey,
      windowEndKey: endKey,
      days: daily,
      logs: windowLogs,
      courses,
      autonomousMinutes,
      autonomousHours: formatHours(autonomousMinutes),
      classMinutes,
      classHours: formatHours(classMinutes),
      workloadMinutes: autonomousMinutes + classMinutes,
      workloadHours: formatHours(autonomousMinutes + classMinutes),
      restMinutes,
      restHours: formatHours(restMinutes),
      restTargetMinutes,
      targetHours,
      targetMinutes,
      restTargetHours: Number(settings.restWeeklyTargetHours),
      ratio: targetMinutes ? autonomousMinutes / targetMinutes : 0,
      restRatio: restTargetMinutes ? restMinutes / restTargetMinutes : 0,
      perCourse,
      consecutiveDays: consecutiveAutonomousDays(logs, todayKey),
      longestSessionMinutes,
      dailyAvgAutonomousMinutes: autonomousMinutes / 7,
      totalEcts: totalEcts(courses),
      contactHours: weeklyContactHours(courses),
      totalWeeklyHours: round1(targetHours + weeklyContactHours(courses)),
    };
  }

  function consecutiveAutonomousDays(logs, todayKey) {
    const studyDays = new Set(
      (logs || [])
        .filter(
          (log) =>
            log &&
            AUTONOMOUS_TYPES.includes(log.type) &&
            log.date <= todayKey &&
            (Number(log.minutes) || 0) > 0
        )
        .map((log) => log.date)
    );

    let cursor = parseDateKey(todayKey);
    if (!studyDays.has(dateKey(cursor))) cursor = addDays(cursor, -1);

    let count = 0;
    while (studyDays.has(dateKey(cursor))) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  }

  function severityFor(points) {
    if (!points) return 'success';
    if (points <= 6) return 'info';
    if (points <= 15) return 'warning';
    return 'danger';
  }

  function buildRecommendations(factors) {
    const factor = Object.fromEntries(factors.map((item) => [item.key, item]));
    const recommendations = [];

    if (factor.streak && factor.streak.points > 0) {
      recommendations.push('Agenda um dia sem estudo autónomo nas próximas 48 horas.');
    }
    if (factor.rest && factor.rest.points > 0) {
      recommendations.push('Protege pelo menos 2 horas por dia de descanso longe de ecrãs.');
    }
    if (factor.load && factor.load.points > 0) {
      recommendations.push('Reduz a carga de estudo da próxima semana em pelo menos 20%.');
    }
    if (factor.average && factor.average.points > 0) {
      recommendations.push('Limita o estudo autónomo a 5 horas por dia e faz pausas de 10 minutos a cada 90.');
    }
    if (factor.longest && factor.longest.points > 0) {
      recommendations.push('Divide sessões longas em blocos de 90 minutos com pausas reais.');
    }
    if (!recommendations.length) {
      recommendations.push('Mantém o ritmo atual: pausas regulares, sono e um dia de descanso por semana.');
      recommendations.push('Continua a registar as horas para detetar desvios cedo.');
    }
    return recommendations.slice(0, 4);
  }

  /**
   * Motor anti-burnout: cinco fatores com pesos distintos, pontuação de 0 a 100.
   * É uma heurística de bem-estar, não um instrumento clínico.
   */
  function risk(state, now) {
    const m = metrics(state, now);
    const factors = [];

    let points = 0;
    if (m.consecutiveDays >= 10) points = 30;
    else if (m.consecutiveDays >= 7) points = 22;
    else if (m.consecutiveDays >= 5) points = 12;
    else if (m.consecutiveDays >= 3) points = 4;
    factors.push({
      key: 'streak',
      label: 'Dias consecutivos de estudo',
      points,
      maxPoints: 30,
      severity: severityFor(points),
      value: `${m.consecutiveDays} ${m.consecutiveDays === 1 ? 'dia' : 'dias'}`,
      detail: `${m.consecutiveDays} ${m.consecutiveDays === 1 ? 'dia consecutivo' : 'dias consecutivos'} com estudo autónomo ou de projeto.`,
    });

    points = 0;
    if (m.ratio >= 1.5) points = 30;
    else if (m.ratio >= 1.25) points = 20;
    else if (m.ratio >= 1.1) points = 10;
    factors.push({
      key: 'load',
      label: 'Carga face à meta semanal',
      points,
      maxPoints: 30,
      severity: severityFor(points),
      value: `${Math.round(m.ratio * 100)}%`,
      detail: `${m.autonomousHours} h de ${m.targetHours} h recomendadas (${Math.round(m.ratio * 100)}%).`,
    });

    points = 0;
    if (m.restMinutes < m.restTargetMinutes * 0.25) points = 20;
    else if (m.restMinutes < m.restTargetMinutes * 0.5) points = 12;
    else if (m.restMinutes < m.restTargetMinutes * 0.75) points = 6;
    factors.push({
      key: 'rest',
      label: 'Descanso registado',
      points,
      maxPoints: 20,
      severity: severityFor(points),
      value: `${Math.round(m.restRatio * 100)}%`,
      detail: `${m.restHours} h de ${m.restTargetHours} h recomendadas nos últimos 7 dias.`,
    });

    points = 0;
    const averageHours = m.dailyAvgAutonomousMinutes / 60;
    if (averageHours >= 7) points = 15;
    else if (averageHours >= 5) points = 8;
    factors.push({
      key: 'average',
      label: 'Média diária de estudo autónomo',
      points,
      maxPoints: 15,
      severity: severityFor(points),
      value: `${round1(averageHours)} h/dia`,
      detail: `${round1(averageHours)} h por dia, em média, nos últimos 7 dias.`,
    });

    points = 0;
    const longestHours = m.longestSessionMinutes / 60;
    if (longestHours >= 4) points = 10;
    else if (longestHours >= 3) points = 5;
    factors.push({
      key: 'longest',
      label: 'Sessão mais longa',
      points,
      maxPoints: 10,
      severity: severityFor(points),
      value: `${round1(longestHours)} h`,
      detail: `${round1(longestHours)} h na sessão mais longa dos últimos 7 dias.`,
    });

    const score = clamp(
      factors.reduce((total, factor) => total + factor.points, 0),
      0,
      100
    );

    let levelKey = 'low';
    if (score >= 75) levelKey = 'critical';
    else if (score >= 50) levelKey = 'high';
    else if (score >= 25) levelKey = 'moderate';

    return {
      score,
      levelKey,
      level: LEVELS[levelKey],
      factors,
      recommendations: buildRecommendations(factors),
      metrics: m,
    };
  }

  return {
    DEFAULTS,
    TYPE_META,
    STUDY_TYPES,
    AUTONOMOUS_TYPES,
    LEVELS,
    dateKey,
    parseDateKey,
    startOfDay,
    addDays,
    lastNDays,
    round1,
    clamp,
    sumMinutes,
    courseById,
    courseTotalWeeklyHours,
    courseAutonomousTarget,
    totalEcts,
    weeklyContactHours,
    weeklyTargetHours,
    formatHours,
    metrics,
    consecutiveAutonomousDays,
    severityFor,
    risk,
  };
});
