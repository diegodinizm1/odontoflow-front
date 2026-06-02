import { test, expect, Page } from '@playwright/test';

/** Registers a brand-new clinic via the 2-step stepper; leaves the session authenticated. */
async function registerClinic(page: Page): Promise<void> {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await page.goto('/auth/register');
  await page.waitForSelector('input[formcontrolname=clinicName]');
  await page.fill('input[formcontrolname=clinicName]', 'E2E Clinic');
  await page.fill('input[formcontrolname=document]', `99.${id.slice(-6)}/0001-00`);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.fill('input[formcontrolname=fullName]', 'Dr. E2E');
  await page.fill('input[formcontrolname=email]', `e2e${id}@clinic.com`);
  await page.fill('input[formcontrolname=password]', 'senha1234');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await page.waitForURL(/\/bem-vindo/); // wait until registration completes and the session is set
}

test('registers a clinic and lands on the onboarding checklist', async ({ page }) => {
  await registerClinic(page);
  await expect(page).toHaveURL(/\/bem-vindo/);
  await expect(page.getByText('Bem-vindo(a) ao OdontoFlow')).toBeVisible();
});

test('shows the dashboard with KPI cards for an authenticated user', async ({ page }) => {
  await registerClinic(page);
  await page.goto('/inicio');
  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible();
  await expect(page.getByText('Pacientes')).toBeVisible();
  await expect(page.getByText('Consultas hoje')).toBeVisible();
});

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/inicio');
  await expect(page).toHaveURL(/\/auth\/login/);
});
