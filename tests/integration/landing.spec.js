'use strict';

const { test, expect } = require('@playwright/test');

test.describe('landing e acesso', () => {
  test('a landing page apresenta a marca e as entradas', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('equilibr.io · equilíbrio entre estudo e descanso');
    await expect(page.locator('.brand')).toContainText('equilibr.io');
    await expect(page.locator('h1')).toHaveText('equilibr.io');
    await expect(page.locator('a.button', { hasText: 'Entrar' }).first()).toHaveAttribute(
      'href',
      'login.html'
    );
    await expect(page.locator('a.button', { hasText: 'Criar conta' }).first()).toHaveAttribute(
      'href',
      'register.html'
    );
  });

  test('o ecrã de login não mostra logs de configuração', async ({ page }) => {
    await page.goto('/login.html');

    await expect(page).toHaveTitle('Entrar · equilibr.io');
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#authStatus')).toBeHidden();
    await expect(page.locator('a', { hasText: 'Criar conta' })).toHaveAttribute(
      'href',
      'register.html'
    );

    await page.locator('a', { hasText: 'Entrar em modo de demonstração' }).click();
    await expect(page).toHaveURL(/\/app\.html#dashboard$/);
  });



  test('as páginas de planeamento pedem sessão', async ({ page }) => {
    for (const path of ['/semester.html', '/schedule.html', '/assessments.html']) {
      await page.goto(path);
      await expect(page.locator('#authPrompt')).toBeVisible();
      await expect(page.locator('#workspace')).toBeHidden();
    }
  });

  test('a página de perfil pede sessão quando não há utilizador autenticado', async ({ page }) => {
    await page.goto('/profile.html');

    await expect(page).toHaveTitle('Perfil · equilibr.io');
    await expect(page.locator('#profileLoginPrompt')).toBeVisible();
    await expect(page.locator('#profileForms')).toBeHidden();
  });

  test('o ecrã de registo valida a confirmação da palavra-passe', async ({ page }) => {
    await page.goto('/register.html');

    await expect(page).toHaveTitle('Criar conta · equilibr.io');
    await expect(page.locator('#registerForm')).toBeVisible();

    await page.locator('#registerName').fill('Teste');
    await page.locator('#registerEmail').fill('teste@example.com');
    await page.locator('#registerPassword').fill('12345678');
    await page.locator('#registerConfirm').fill('87654321');
    await page.locator('#registerForm button[type="submit"]').click();

    await expect(page.locator('#registerConfirm')).toHaveJSProperty(
      'validationMessage',
      'As palavras-passe não coincidem.'
    );
    await expect(page).toHaveURL(/\/register\.html$/);
  });
});
