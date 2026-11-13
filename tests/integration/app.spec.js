'use strict';

const { test, expect } = require('@playwright/test');

test.describe('equilibr.io', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app.html#dashboard');
  });

  test('apresenta a marca e os indicadores base no dashboard', async ({ page }) => {
    await expect(page).toHaveTitle('Visão geral · equilibr.io');
    await expect(page.locator('.brand')).toContainText('equilibr.io');
    await expect(page.locator('#heroRiskScore')).toHaveText('39');
    await expect(page.locator('#heroRiskBadge')).toHaveText('Moderado');
    await expect(page.locator('#kpiAutonomousMeta')).toHaveText('21,5 h');
    await expect(page.locator('#kpiRestMeta')).toHaveText('14,0 h');
    await expect(page.locator('#kpiStreak')).toHaveText('7');
  });

  test('navega pelas vistas principais e mostra os totais das UCs', async ({ page }) => {
    await page.locator('[data-route="ects"]').first().click();
    await expect(page).toHaveTitle('Gestão de ECTS · equilibr.io');
    await expect(page.locator('#ectsStatTotal')).toHaveText('30');
    await expect(page.locator('#ectsStatContact')).toHaveText('19');
    await expect(page.locator('#ectsStatAutonomous')).toHaveText('21,5');
    await expect(page.locator('#courseCountBadge')).toHaveText('5');

    await page.locator('[data-route="registo"]').first().click();
    await expect(page).toHaveTitle('Registo de atividade · equilibr.io');
    await expect(page.locator('#logForm')).toBeVisible();

    await page.locator('[data-route="burnout"]').first().click();
    await expect(page).toHaveTitle('Bem-estar · equilibr.io');
    await expect(page.locator('#riskScore')).toHaveText('39');
    await expect(page.locator('#riskFactorsList .factor-item')).toHaveCount(5);
  });

  test('adiciona um registo e mantém-no após recarregar', async ({ page }) => {
    await page.locator('[data-route="registo"]').first().click();
    await page.locator('#logMinutes').fill('45');
    await page.locator('#logCourse').selectOption('alga');
    await page.locator('#logNote').fill('teste de integração');
    await page.locator('#logForm button[type="submit"]').click();

    await expect(page.locator('#logsTableBody')).toContainText('teste de integração');

    await page.reload();
    await expect(page.locator('#logsTableBody')).toContainText('teste de integração');
  });

  test('aplica o cenário de sobrecarga e atualiza o risco', async ({ page }) => {
    await page.locator('[data-route="burnout"]').first().click();
    await page.locator('[data-scenario="overload"]').click();
    await expect(page.locator('#confirmModal')).toBeVisible();
    await page.locator('#confirmOkBtn').click();

    await expect(page.locator('#riskScore')).toHaveText('90');
    await expect(page.locator('#riskLevelBadge')).toHaveText('Crítico');
  });
});
