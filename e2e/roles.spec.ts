import { test, expect, request as playwrightRequest, Page } from '@playwright/test';

const API = 'http://localhost:8080/api';
const PWD = 'senha1234';

/** Registers a clinic and invites a receptionist; returns the receptionist's credentials. */
async function clinicWithReceptionist(): Promise<{ email: string }> {
  const ctx = await playwrightRequest.newContext();
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const reg = await ctx.post(`${API}/auth/tenant`, {
    data: {
      clinicName: 'Clínica Papéis E2E', document: `40.${id.slice(-6)}/0001-00`,
      fullName: 'Dra. Dona', email: `dona${id}@clinic.com`, password: PWD,
    },
  });
  expect(reg.ok()).toBeTruthy();
  const token = (await reg.json()).token;

  const recEmail = `rita${id}@clinic.com`;
  const invite = await ctx.post(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { fullName: 'Recep Rita', email: recEmail, role: 'RECEPTIONIST', password: PWD },
  });
  expect(invite.ok()).toBeTruthy();
  await ctx.dispose();
  return { email: recEmail };
}

async function login(page: Page, email: string): Promise<void> {
  await page.goto('/auth/login');
  await page.waitForSelector('input[formcontrolname=email]');
  await page.fill('input[formcontrolname=email]', email);
  await page.fill('input[formcontrolname=password]', PWD);
  await page.getByRole('button', { name: /Entrar/ }).click();
  await page.waitForURL(/\/inicio/);
}

test('receptionist cannot see or reach finances, team or billing', async ({ page }) => {
  const { email } = await clinicWithReceptionist();
  await login(page, email);

  // sidebar hides the dentist-only sections
  const nav = page.locator('aside nav');
  await expect(nav.getByText('Agenda')).toBeVisible();
  await expect(nav.getByText('Financeiro')).toHaveCount(0);
  await expect(nav.getByText('Equipe')).toHaveCount(0);
  await expect(nav.getByText('Assinatura')).toHaveCount(0);

  // direct navigation is guarded → redirected home
  await page.goto('/financeiro');
  await expect(page).toHaveURL(/\/inicio/);
  await page.goto('/equipe');
  await expect(page).toHaveURL(/\/inicio/);
});

test('receptionist sees name + role and the user menu, and uses the Cobranças page', async ({ page }) => {
  const { email } = await clinicWithReceptionist();
  await login(page, email);

  // sidebar shows the name and the correct role
  await expect(page.locator('aside').getByText('Recep Rita')).toBeVisible();
  await expect(page.locator('aside').getByText('Recepcionista')).toBeVisible();

  // user menu opens with profile/settings/logout
  await page.locator('aside button[aria-expanded]').click();
  await expect(page.getByRole('link', { name: 'Meu perfil' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();

  // a patient to charge
  await page.goto('/patients/new');
  await page.fill('input[formcontrolname=fullName]', 'Paciente Balcão');
  await page.getByRole('button', { name: 'Cadastrar paciente' }).click();
  await page.waitForURL(/\/patients$/);

  // create a charge from the dedicated Cobranças page
  await page.goto('/cobrancas');
  await page.getByRole('button', { name: 'Nova cobrança' }).first().click();
  await page.locator('app-select .ui-select-trigger').click();
  await page.getByRole('option', { name: 'Paciente Balcão' }).click();
  await page.fill('input[formcontrolname=description]', 'Limpeza');
  await page.fill('input[formcontrolname=amount]', '150');
  await page.getByRole('button', { name: 'Criar cobrança' }).click();
  await expect(page.getByText('Limpeza')).toBeVisible();
});

test('receptionist can still create a charge from a patient record', async ({ page }) => {
  const { email } = await clinicWithReceptionist();
  await login(page, email);

  // create a patient and open the record
  await page.goto('/patients/new');
  await page.fill('input[formcontrolname=fullName]', 'Paciente Caixa');
  await page.getByRole('button', { name: 'Cadastrar paciente' }).click();
  await page.waitForURL(/\/patients$/);
  await page.getByText('Paciente Caixa').first().click();

  await page.getByRole('button', { name: 'Nova cobrança' }).click();
  await page.fill('input[formcontrolname=description]', 'Consulta de avaliação');
  await page.fill('input[formcontrolname=amount]', '120');
  await page.getByRole('button', { name: 'Criar cobrança' }).click();
  await expect(page.getByText('Cobrança criada.')).toBeVisible();
});
