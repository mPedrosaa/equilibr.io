'use strict';

const assert = require('node:assert/strict');
const core = require('../assets/js/core.js');
const data = require('../assets/js/data.js');

const NOW = new Date(2026, 10, 2, 12, 0, 0); // 2 de novembro de 2026

let passed = 0;

function test(name, callback) {
  try {
    callback();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log('\nSLTCore · testes de regras de negócio\n');

test('dateKey e lastNDays usam datas locais e terminam hoje', () => {
  assert.equal(core.dateKey(new Date(2026, 10, 2)), '2026-11-02');
  const days = core.lastNDays(7, NOW);
  assert.equal(days.length, 7);
  assert.equal(days[0].key, '2026-10-27');
  assert.equal(days[6].key, '2026-11-02');
});

test('1 ECTS = 27 h e a meta autónoma desconta as horas de contacto', () => {
  const course = { ects: 6, contactHours: 4 };
  assert.equal(core.courseTotalWeeklyHours(course, core.DEFAULTS), 8.1);
  assert.equal(core.courseAutonomousTarget(course, core.DEFAULTS), 4.1);
});

test('metas das UCs mock somam 30 ECTS e 22,5 h autónomas', () => {
  const state = data.seedState(NOW);
  const metrics = core.metrics(state, NOW);
  assert.equal(metrics.totalEcts, 30);
  assert.equal(metrics.contactHours, 18);
  assert.equal(metrics.targetHours, 22.5);
  assert.equal(metrics.totalWeeklyHours, 40.5);
});

test('dados de demonstração produzem os indicadores esperados', () => {
  const state = data.seedState(NOW);
  const metrics = core.metrics(state, NOW);
  assert.equal(metrics.autonomousMinutes, 1260);
  assert.equal(metrics.restMinutes, 390);
  assert.equal(metrics.consecutiveDays, 7);
  assert.equal(metrics.longestSessionMinutes, 180);
  assert.equal(metrics.autonomousHours, 21);
  assert.equal(metrics.restHours, 6.5);
});

test('a soma das metas por UC coincide com a meta global', () => {
  const state = data.seedState(NOW);
  const metrics = core.metrics(state, NOW);
  const sumMinutes = metrics.perCourse.reduce((total, row) => total + row.autonomousMinutes, 0);
  const sumTargets = metrics.perCourse.reduce((total, row) => total + row.targetMinutes, 0);
  assert.equal(sumMinutes, metrics.autonomousMinutes);
  assert.equal(sumTargets, metrics.targetMinutes);
});

test('cenário base tem risco moderado (39/100)', () => {
  const state = data.seedState(NOW);
  const risk = core.risk(state, NOW);
  assert.equal(risk.score, 39);
  assert.equal(risk.levelKey, 'moderate');
  assert.equal(risk.factors.find((factor) => factor.key === 'streak').points, 22);
  assert.equal(risk.factors.find((factor) => factor.key === 'rest').points, 12);
});

test('cenário de sobrecarga atinge risco crítico', () => {
  const state = data.seedState(NOW);
  state.logs = data.buildScenarioLogs('overload', NOW);
  const risk = core.risk(state, NOW);
  assert.equal(risk.score, 90);
  assert.equal(risk.levelKey, 'critical');
  assert.ok(risk.recommendations.length > 0);
});

test('cenários equilibrado e recuperação ficam em risco baixo', () => {
  const state = data.seedState(NOW);

  state.logs = data.buildScenarioLogs('balanced', NOW);
  const balanced = core.risk(state, NOW);
  assert.equal(balanced.levelKey, 'low');
  assert.ok(balanced.score < 25);

  state.logs = data.buildScenarioLogs('recovery', NOW);
  const recovery = core.risk(state, NOW);
  assert.equal(recovery.levelKey, 'low');
  assert.equal(recovery.score, 0);
});

test('registos fora da janela de 7 dias não contam para as métricas', () => {
  const state = data.seedState(NOW);
  const before = core.metrics(state, NOW).autonomousMinutes;
  state.logs.push({
    id: 'old-log',
    date: '2026-10-20',
    courseId: 'lapr1',
    type: 'estudo',
    minutes: 600,
    note: 'Fora da janela',
    createdAt: '2026-10-20T18:00:00',
  });
  assert.equal(core.metrics(state, NOW).autonomousMinutes, before);
});

test('a sequência começa ontem quando ainda não há estudo hoje', () => {
  const state = data.seedState(NOW);
  state.logs = [
    {
      id: 'yesterday',
      date: '2026-11-01',
      courseId: 'lapr1',
      type: 'estudo',
      minutes: 60,
      note: '',
      createdAt: '2026-11-01T18:00:00',
    },
    {
      id: 'day-before',
      date: '2026-10-31',
      courseId: 'lapr1',
      type: 'estudo',
      minutes: 60,
      note: '',
      createdAt: '2026-10-31T18:00:00',
    },
  ];
  assert.equal(core.metrics(state, NOW).consecutiveDays, 2);
});

test('a pontuação de risco é limitada a 100', () => {
  const state = data.seedState(NOW);
  state.logs = [];
  for (let offset = 0; offset < 10; offset += 1) {
    state.logs.push({
      id: `extreme-${offset}`,
      date: core.dateKey(core.addDays(NOW, -offset)),
      courseId: 'lapr1',
      type: 'estudo',
      minutes: 720,
      note: 'Sem descanso',
      createdAt: `${core.dateKey(core.addDays(NOW, -offset))}T18:00:00`,
    });
  }
  const risk = core.risk(state, NOW);
  assert.equal(risk.score, 100);
  assert.equal(risk.levelKey, 'critical');
});

test('uma UC sem horas autónomas disponíveis tem meta zero', () => {
  const course = { ects: 3, contactHours: 10 };
  assert.equal(core.courseAutonomousTarget(course, core.DEFAULTS), 0);
});

test('a taxa de conclusão de cada cenário está dentro de limites', () => {
  ['default', 'balanced', 'overload', 'recovery'].forEach((scenario) => {
    const state = data.seedState(NOW);
    state.logs = data.buildScenarioLogs(scenario, NOW);
    const metrics = core.metrics(state, NOW);
    assert.ok(metrics.ratio >= 0);
    assert.ok(metrics.perCourse.every((row) => row.ratio >= 0));
  });
});

console.log(`\n${passed} testes concluídos com sucesso.\n`);
