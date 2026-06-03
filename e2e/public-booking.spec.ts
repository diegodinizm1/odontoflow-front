import { test, expect, request as playwrightRequest } from '@playwright/test';

const API = 'http://localhost:8080/api';

/** Registers a clinic via the API and returns its public booking slug + dentist name. */
async function createClinic(): Promise<{ slug: string; dentistName: string }> {
  const ctx = await playwrightRequest.newContext();
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const dentistName = 'Dra. Pública';

  const reg = await ctx.post(`${API}/auth/tenant`, {
    data: {
      clinicName: 'Clínica Online E2E',
      document: `90.${id.slice(-6)}/0001-00`,
      fullName: dentistName,
      email: `online${id}@clinic.com`,
      password: 'senha1234',
    },
  });
  expect(reg.ok()).toBeTruthy();
  const token = (await reg.json()).token;

  const dash = await ctx.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
  const slug = (await dash.json()).publicSlug;
  await ctx.dispose();
  return { slug, dentistName };
}

test('a patient books an appointment online without logging in', async ({ page }) => {
  const { slug, dentistName } = await createClinic();

  await page.goto(`/agendar/${slug}`);
  await expect(page.getByRole('heading', { name: 'Clínica Online E2E' })).toBeVisible();

  // pick the dentist
  await page.locator('mat-select').click();
  await page.getByRole('option', { name: dentistName }).click();

  // pick a future date: open the calendar, jump to next month, choose day 15
  await page.locator('mat-datepicker-toggle button').click();
  await page.locator('.mat-calendar-next-button').click();
  await page.locator('.mat-calendar').getByText('15', { exact: true }).click();

  // pick a slot
  const slot = page.locator('.slot-chip').first();
  await expect(slot).toBeVisible();
  await slot.click();

  // contact details + confirm
  await page.fill('input[formcontrolname=patientName]', 'Paciente Internet');
  await page.fill('input[formcontrolname=patientPhone]', '11999998888');
  await page.getByRole('button', { name: /Solicitar/ }).click();

  await expect(page.getByText('Solicitação enviada!')).toBeVisible();
});

test('shows a friendly message for an unknown clinic slug', async ({ page }) => {
  await page.goto('/agendar/clinica-que-nao-existe');
  await expect(page.getByText('Clínica não encontrada')).toBeVisible();
});
