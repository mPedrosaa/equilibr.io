'use strict';

const { test, expect } = require('@playwright/test');

test.describe('landing e acesso', () => {
  test('a landing page apresenta a marca e o botão de entrada', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('equilibr.io · equilíbrio entre estudo e descanso');
    await expect(page.locator('.brand')).toContainText('equilibr.io');
    await expect(page.locator('h1')).toHaveText('equilibr.io');
    await expect(page.locator('a.button', { hasText: 'Entrar' }).first()).toHaveAttribute(
      'href',
      'login.html'
    );
  });

  test('o ecrã de login permite seguir para a demonstração local', async ({ page }) => {
    await page.goto('/login.html');

    await expect(page).toHaveTitle('Entrar · equilibr.io');
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#authStatus')).toContainText('Supabase ainda não está configurado');

    await page.locator('a', { hasText: 'Entrar em modo de demonstração' }).click();
    await expect(page).toHaveURL(/\/app\.html#dashboard$/);
  });
});
