import { test, expect, Page } from '@playwright/test';

async function registerClinic(page: Page): Promise<void> {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  await page.goto('/auth/register');
  await page.waitForSelector('input[formcontrolname=clinicName]');
  await page.fill('input[formcontrolname=clinicName]', 'E2E Clinic');
  await page.fill('input[formcontrolname=document]', `98.${id.slice(-6)}/0001-00`);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.fill('input[formcontrolname=fullName]', 'Dr. E2E');
  await page.fill('input[formcontrolname=email]', `e2e${id}@clinic.com`);
  await page.fill('input[formcontrolname=password]', 'senha1234');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await page.waitForURL(/\/bem-vindo/);
}

test('creates a patient and shows it in the list', async ({ page }) => {
  await registerClinic(page);

  await page.goto('/patients/new');
  await page.fill('input[formcontrolname=fullName]', 'Paciente E2E');
  await page.getByRole('button', { name: 'Cadastrar paciente' }).click();

  await expect(page).toHaveURL(/\/patients$/);
  await expect(page.getByText('Paciente E2E')).toBeVisible();
});
