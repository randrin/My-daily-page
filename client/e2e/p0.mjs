import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { chromium } from "playwright";

dotenv.config({ path: ".env.local", quiet: true });
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const apiURL = process.env.E2E_API_URL ?? process.env.AUTH_API_URL ?? "http://localhost:3001";
const suffix = randomUUID();
const password = `P0-${randomUUID()}!`;
const email = `p0-${suffix}@example.com`;
const output = resolve("test-results/p0");
await mkdir(output, { recursive: true });
const checks = [];
const record = (check) => { checks.push(check); console.log(`✓ ${check}`); };
let taskId;
let token;
let browser;
let page;

async function api(path, { method = "GET", body, accessToken = token } = {}) {
  return fetch(`${apiURL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
async function register(address) {
  const response = await api("/auth/register", { method: "POST", body: { email: address, password, firstName: "Test", lastName: "P0", phoneNumber: `+336${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}` }, accessToken: undefined });
  assert.equal(response.status, 201, "Création du compte de test");
  return response.json();
}
async function waitTask(title) {
  await page.getByRole("button", { name: `Modifier ${title}`, exact: true }).waitFor();
}

try {
  assert.equal((await api("/tasks", { accessToken: undefined })).status, 401);
  record("API protégée sans JWT");
  const account = await register(email);
  token = account.access_token;
  assert.ok(token);
  const other = await register(`p0-other-${suffix}@example.com`);
  browser = await chromium.launch({
    headless: true,
    ...(process.env.E2E_CHROMIUM_EXECUTABLE ? { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE } : {}),
  });
  const context = await browser.newContext();
  await context.tracing.start({ screenshots: true, snapshots: true });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  const hydrationErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|did not match|server rendered/i.test(message.text())) hydrationErrors.push(message.text());
  });
  await page.goto(`${baseURL}/dashboard/tasks`);
  await page.waitForURL(/\/auth\/signin/);
  record("Page tâches protégée sans session");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: /Se connecter/ }).click();
  await page.waitForURL(/\/dashboard/);
  await page.goto(`${baseURL}/dashboard/tasks`);
  await page.getByRole("button", { name: "Nouvelle tâche", exact: true }).click();
  const form = page.getByRole("dialog");
  await form.getByRole("button", { name: /^Créer(?: la tâche)?$/, exact: true }).click();
  await form.getByText("L’échéance est obligatoire", { exact: true }).waitFor();
  record("Validation des champs requis");
  const title = `P0 tâche ${suffix}`;
  await form.getByLabel("Titre", { exact: true }).fill(title);
  await form.locator("#deadline").click();
  const monthSelect = page.locator('[data-slot="popover-content"] button[role="combobox"]').first();
  const yearSelect = page.locator('[data-slot="popover-content"] button[role="combobox"]').nth(1);
  const originalMonth = await monthSelect.textContent();
  const originalYear = await yearSelect.textContent();
  await monthSelect.click();
  await page.getByRole("option", { name: originalMonth.trim(), exact: true }).click();
  await yearSelect.click();
  await page.getByRole("option", { name: originalYear.trim(), exact: true }).click();
  assert.equal(await page.locator('[data-slot="popover-content"]').count(), 1, "Le calendrier reste ouvert après sélection des mois et années");
  record("Sélection des mois et années dans le calendrier");
  const yesterdayKey = await page.evaluate(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString();
  });
  const yesterdayButton = page.locator(`button[data-day="${yesterdayKey}"]`);
  if (await yesterdayButton.count()) assert.equal(await yesterdayButton.first().isDisabled(), true, "Les dates antérieures sont désactivées");
  const todayKey = await page.evaluate(() => new Date().toLocaleDateString());
  const todayButton = page.locator(`button[data-day="${todayKey}"]`);
  await todayButton.first().click();
  assert.equal(await page.locator('[data-slot="sheet-content"] #title').count(), 1, "Le drawer reste ouvert après sélection de date");
  await page.keyboard.press("Escape");
  await form.getByRole("button", { name: /^Créer(?: la tâche)?$/, exact: true }).click();
  await waitTask(title);
  const listResponse = await api("/tasks?page=1&pageSize=100");
  const list = await listResponse.json();
  const task = list.items.find((item) => item.title === title);
  assert.ok(task, "Tâche persistée via API");
  taskId = task.id;
  assert.ok(task.deadline);
  record("Création via formulaire et échéance persistée");
  await page.reload();
  await waitTask(title);
  record("Persistance après rechargement");
  await page.getByRole("button", { name: `Modifier ${title}`, exact: true }).click();
  const updated = `${title} modifiée`;
  await page.getByRole("dialog").getByLabel("Titre", { exact: true }).fill(updated);
  await page.getByRole("dialog").getByRole("button", { name: "Enregistrer", exact: true }).click();
  await waitTask(updated);
  await page.reload();
  await waitTask(updated);
  record("Modification et persistance après rechargement");
  assert.equal((await api(`/tasks/${taskId}`, { accessToken: other.access_token })).status, 404);
  assert.equal((await api(`/tasks/${taskId}`, { method: "PATCH", body: { title: "Interdit" }, accessToken: other.access_token })).status, 404);
  assert.equal((await api(`/tasks/${taskId}`, { method: "DELETE", accessToken: other.access_token })).status, 404);
  record("Isolation lecture, modification et suppression entre deux comptes");
  await page.getByRole("button", { name: `Supprimer ${updated}`, exact: true }).click();
  const deletion = page.waitForResponse((response) => response.request().method() === "DELETE" && response.url().endsWith(`/tasks/${taskId}`));
  await page.getByRole("dialog").getByRole("button", { name: "Supprimer", exact: true }).click();
  assert.equal((await deletion).status(), 200);
  await page.getByRole("button", { name: `Modifier ${updated}`, exact: true }).waitFor({ state: "hidden" });
  assert.equal((await api(`/tasks/${taskId}`)).status, 404);
  taskId = undefined;
  await page.reload();
  assert.equal(await page.getByRole("button", { name: `Modifier ${updated}`, exact: true }).count(), 0);
  record("Suppression via formulaire et après rechargement");
  assert.equal(hydrationErrors.length, 0, "Aucune erreur d’hydratation dans le parcours");
  record("Pas d’erreur d’hydratation détectée");
  await page.screenshot({ path: resolve(output, "success.png"), fullPage: true });
  await context.tracing.stop({ path: resolve(output, "trace.zip") });
  await writeFile(resolve(output, "report.json"), JSON.stringify({ date: new Date().toISOString(), checks }, null, 2));
  console.log("Rapport P0 enregistré dans test-results/p0/report.json");
} catch (error) {
  if (page) {
    await page.screenshot({ path: resolve(output, "failure.png"), fullPage: true }).catch(() => {});
    await writeFile(resolve(output, "failure.txt"), await page.locator("body").innerText()).catch(() => {});
  }
  throw error;
} finally {
  if (taskId && token) await api(`/tasks/${taskId}`, { method: "DELETE" });
  if (browser) await browser.close();
}
