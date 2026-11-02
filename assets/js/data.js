/* global module, globalThis */
/**
 * SLTData — dados de demonstração do protótipo.
 *
 * As UCs, notas e horários são ilustrativos: servem para validar os fluxos da
 * interface, não representam o currículo oficial do ISEP.
 */
(function (root, factory) {
  'use strict';
  const core = typeof module === 'object' && module.exports ? require('./core.js') : root.SLTCore;
  const api = factory(core);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SLTData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (SLTCore) {
  'use strict';

  const COURSE_COLORS = [
    '#0f9d8a',
    '#2563eb',
    '#7c3aed',
    '#ea580c',
    '#db2777',
    '#0891b2',
    '#65a30d',
    '#475569',
  ];

  const BASE_COURSES = [
    {
      id: 'lapr1',
      name: 'Laboratório de Engenharia I',
      code: 'LAPR1',
      ects: 6,
      contactHours: 4,
      color: '#0f9d8a',
    },
    {
      id: 'prog1',
      name: 'Programação I',
      code: 'PROG1',
      ects: 6,
      contactHours: 4,
      color: '#2563eb',
    },
    {
      id: 'am',
      name: 'Análise Matemática',
      code: 'AM',
      ects: 6,
      contactHours: 4,
      color: '#7c3aed',
    },
    {
      id: 'md',
      name: 'Matemática Discreta',
      code: 'MD',
      ects: 6,
      contactHours: 3,
      color: '#ea580c',
    },
    {
      id: 'ac',
      name: 'Arquitetura de Computadores',
      code: 'AC',
      ects: 6,
      contactHours: 3,
      color: '#db2777',
    },
  ];

  const CLASS_PLAN = {
    1: [
      { courseId: 'lapr1', minutes: 120, note: 'Aula laboratorial · LAPR1' },
      { courseId: 'prog1', minutes: 120, note: 'Aula teórica · Programação I' },
    ],
    2: [
      { courseId: 'am', minutes: 120, note: 'Aula teórica · Análise Matemática' },
      { courseId: 'md', minutes: 120, note: 'Aula teórica · Matemática Discreta' },
    ],
    3: [
      { courseId: 'prog1', minutes: 120, note: 'Aula laboratorial · Programação I' },
      { courseId: 'ac', minutes: 120, note: 'Aula teórica · Arquitetura de Computadores' },
    ],
    4: [
      { courseId: 'am', minutes: 120, note: 'Aula prática · Análise Matemática' },
      { courseId: 'lapr1', minutes: 120, note: 'Aula de projeto · LAPR1' },
    ],
    5: [
      { courseId: 'md', minutes: 120, note: 'Aula prática · Matemática Discreta' },
      { courseId: 'ac', minutes: 120, note: 'Aula laboratorial · Arquitetura de Computadores' },
    ],
  };

  // Cada padrão tem 7 posições: do dia mais antigo (índice 0) até hoje (índice 6).
  const DAY_PATTERNS = {
    default: [
      {
        autonomy: [
          ['lapr1', 120, 'estudo', 'Revisão dos requisitos do projeto'],
          ['am', 60, 'estudo', 'Fichas de limites e continuidade'],
        ],
        rest: [60, 'Passeio ao ar livre'],
      },
      {
        autonomy: [
          ['prog1', 150, 'estudo', 'Exercícios de programação'],
          ['md', 30, 'estudo', 'Resumo de lógica proposicional'],
        ],
        rest: [90, 'Jantar com amigos'],
      },
      {
        autonomy: [
          ['lapr1', 90, 'projeto', 'Reunião de projeto do quarteto'],
          ['ac', 60, 'estudo', 'Leitura sobre memória e CPU'],
        ],
        rest: [60, 'Caminhada curta'],
      },
      {
        autonomy: [['am', 180, 'estudo', 'Preparação para o mini-teste']],
        rest: [60, 'Série e descanso'],
      },
      {
        autonomy: [
          ['prog1', 120, 'estudo', 'Prática de estruturas de dados'],
          ['lapr1', 60, 'projeto', 'Escrita do relatório'],
        ],
        rest: [60, 'Tempo com a família'],
      },
      {
        autonomy: [
          ['md', 150, 'estudo', 'Exercícios de relações e funções'],
          ['ac', 60, 'estudo', 'Revisão de arquitetura'],
        ],
        rest: [60, 'Pausa sem ecrãs'],
      },
      {
        autonomy: [
          ['lapr1', 120, 'estudo', 'Afinar protótipo e relatório'],
          ['prog1', 60, 'projeto', 'Sessão rápida de projeto'],
        ],
        rest: null,
      },
    ],
    balanced: [
      {
        autonomy: [['lapr1', 120, 'estudo', 'Revisão tranquila da matéria']],
        rest: [120, 'Caminhada e café'],
      },
      {
        autonomy: [['prog1', 150, 'estudo', 'Exercícios ao ritmo próprio']],
        rest: [120, 'Jantar sem pressas'],
      },
      {
        autonomy: [
          ['am', 120, 'estudo', 'Fichas de Análise Matemática'],
          ['md', 60, 'estudo', 'Resumo de Matemática Discreta'],
        ],
        rest: [120, 'Tempo offline'],
      },
      {
        autonomy: [
          ['lapr1', 90, 'projeto', 'Ponto de situação do projeto'],
          ['am', 90, 'estudo', 'Revisão de exercícios'],
        ],
        rest: [120, 'Série e descanso'],
      },
      {
        autonomy: [['prog1', 150, 'estudo', 'Prática de programação']],
        rest: [150, 'Encontro com amigos'],
      },
      {
        autonomy: [
          ['md', 120, 'estudo', 'Exercícios de lógica'],
          ['ac', 60, 'estudo', 'Leitura leve de arquitetura'],
        ],
        rest: [120, 'Passeio ao fim do dia'],
      },
      {
        autonomy: [],
        rest: [180, 'Dia de descanso dedicado'],
      },
    ],
    overload: [
      {
        autonomy: [
          ['lapr1', 180, 'projeto', 'Sessão intensa de projeto'],
          ['am', 120, 'estudo', 'Exercícios até fechar o capítulo'],
        ],
        rest: null,
      },
      {
        autonomy: [
          ['prog1', 180, 'estudo', 'Prática intensiva de programação'],
          ['md', 150, 'estudo', 'Revisão de última hora'],
        ],
        rest: null,
      },
      {
        autonomy: [
          ['lapr1', 180, 'projeto', 'Correr contra o prazo do relatório'],
          ['ac', 120, 'estudo', 'Leitura de véspera'],
        ],
        rest: null,
      },
      {
        autonomy: [['am', 360, 'estudo', 'Maratona de exercícios para o teste']],
        rest: null,
      },
      {
        autonomy: [
          ['lapr1', 180, 'projeto', 'Nova ronda de revisões do projeto'],
          ['md', 120, 'estudo', 'Fichas e mais fichas'],
        ],
        rest: null,
      },
      {
        autonomy: [
          ['prog1', 180, 'estudo', 'Sessão dupla de programação'],
          ['ac', 150, 'estudo', 'Preparar laboratório'],
        ],
        rest: null,
      },
      {
        autonomy: [
          ['am', 180, 'estudo', 'Continuar a maratona'],
          ['lapr1', 120, 'projeto', 'Fechar entregáveis'],
        ],
        rest: null,
      },
    ],
    recovery: [
      {
        autonomy: [['lapr1', 60, 'estudo', 'Retoma suave da matéria']],
        rest: [180, 'Tarde livre sem ecrãs'],
      },
      {
        autonomy: [['prog1', 90, 'estudo', 'Um exercício de cada vez']],
        rest: [150, 'Caminhada longa'],
      },
      {
        autonomy: [],
        rest: [240, 'Dia de pausa real'],
      },
      {
        autonomy: [['am', 120, 'estudo', 'Revisão sem pressão']],
        rest: [120, 'Almoço demorado'],
      },
      {
        autonomy: [['md', 90, 'estudo', 'Resumo leve']],
        rest: [180, 'Tempo com amigos'],
      },
      {
        autonomy: [],
        rest: [240, 'Fim de semana tranquilo'],
      },
      {
        autonomy: [['ac', 60, 'estudo', 'Leitura curta']],
        rest: [120, 'Passeio ao fim do dia'],
      },
    ],
  };

  const SCENARIOS = {
    balanced: {
      key: 'balanced',
      label: 'Equilibrado',
      description: 'Carga moderada e descanso acima da meta.',
      expectation: 'Risco baixo',
      icon: 'bi-flower1',
    },
    overload: {
      key: 'overload',
      label: 'Sobrecarga',
      description: 'Sete dias intensos, sem descanso registado.',
      expectation: 'Risco crítico',
      icon: 'bi-fire',
    },
    recovery: {
      key: 'recovery',
      label: 'Recuperação',
      description: 'Semana leve, com pausas e descanso.',
      expectation: 'Risco baixo',
      icon: 'bi-brightness-high',
    },
  };

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function timeStamp(dayKey, time) {
    return `${dayKey}T${time}:00`;
  }

  function buildClassLogs(scenario, days) {
    const logs = [];
    days.forEach((day) => {
      const plan = CLASS_PLAN[day.date.getDay()] || [];
      plan.forEach((entry, index) => {
        logs.push({
          id: `demo-${scenario}-${day.key}-c${index}`,
          date: day.key,
          courseId: entry.courseId,
          type: 'aula',
          minutes: entry.minutes,
          note: entry.note,
          createdAt: timeStamp(day.key, `${pad2(8 + index * 2)}:30`),
        });
      });
    });
    return logs;
  }

  function buildScenarioLogs(scenario, now) {
    const key = DAY_PATTERNS[scenario] ? scenario : 'default';
    const days = SLTCore.lastNDays(7, now);
    const patterns = DAY_PATTERNS[key];
    const logs = buildClassLogs(key, days);

    days.forEach((day, dayIndex) => {
      const pattern = patterns[dayIndex] || { autonomy: [], rest: null };

      (pattern.autonomy || []).forEach((item, index) => {
        const [courseId, minutes, type, note] = item;
        logs.push({
          id: `demo-${key}-${day.key}-a${index}`,
          date: day.key,
          courseId,
          type,
          minutes,
          note,
          createdAt: timeStamp(day.key, index === 0 ? '17:30' : '19:30'),
        });
      });

      if (pattern.rest) {
        const [minutes, note] = pattern.rest;
        logs.push({
          id: `demo-${key}-${day.key}-r`,
          date: day.key,
          courseId: null,
          type: 'descanso',
          minutes,
          note,
          createdAt: timeStamp(day.key, '21:30'),
        });
      }
    });

    return logs.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }

  function seedState(now) {
    return {
      version: 1,
      settings: { ...SLTCore.DEFAULTS },
      profile: {
        name: 'Nuno Sousa',
        firstName: 'Nuno',
        initials: 'NS',
        degree: 'LEI · 1.º ano',
        semester: '2026/27 · 1.º semestre',
      },
      courses: BASE_COURSES.map((course) => ({ ...course })),
      logs: buildScenarioLogs('default', now),
      meta: {
        demo: true,
        scenario: 'default',
        seededAt: new Date().toISOString(),
      },
    };
  }

  return {
    COURSE_COLORS,
    BASE_COURSES,
    SCENARIOS,
    buildScenarioLogs,
    seedState,
  };
});
