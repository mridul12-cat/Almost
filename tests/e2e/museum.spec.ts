/// <reference lib="dom" />
import { test, expect, type Page, type Locator } from '@playwright/test';

const PREFIX = 'almost:exhibit:';
const FIRST_ID = '00000000-0000-4000-8000-000000000001';
const existing = { schemaVersion: 1, id: FIRST_ID, title: 'An earlier beginning', description: 'Words that must remain untouched.', artifactType: 'book', lightOn: false, createdAt: '2026-10-24T00:00:00.000Z' };
declare global { interface Window { almostFaults: { localWrite: boolean; sessionWrite: boolean; cleanup: boolean; localRead: boolean } } }
async function installFaults(page: Page, faults: Partial<Window['almostFaults']>) {
  await page.addInitScript(flags => {
    window.almostFaults = { localWrite: false, sessionWrite: false, cleanup: false, localRead: false, ...flags };
    const local = window.localStorage;
    const session = window.sessionStorage;
    const originalWrite = Storage.prototype.setItem;
    const originalRead = Storage.prototype.getItem;
    const originalRemove = Storage.prototype.removeItem;
    Storage.prototype.setItem = function(key, value) {
      if ((this === local && window.almostFaults.localWrite && key.startsWith('almost:')) || (this === session && window.almostFaults.sessionWrite && key === 'almost:draft')) throw new DOMException('Simulated quota failure', 'QuotaExceededError');
      return originalWrite.call(this, key, value);
    };
    Storage.prototype.getItem = function(key) {
      if (this === local && window.almostFaults.localRead && key.startsWith('almost:')) throw new DOMException('Simulated read denial', 'SecurityError');
      return originalRead.call(this, key);
    };
    Storage.prototype.removeItem = function(key) {
      if (this === session && window.almostFaults.cleanup && key === 'almost:draft') throw new DOMException('Simulated cleanup denial', 'SecurityError');
      return originalRemove.call(this, key);
    };
  }, faults);
}
async function savedRecords(page: Page) {
  return page.evaluate(prefix => Object.keys(localStorage).filter(key => key.startsWith(prefix)).map(key => JSON.parse(localStorage.getItem(key)!)), PREFIX);
}
async function create(page: Page, title = 'The paper moon', description = 'A paper garden\nWaiting beside a window 🌿', form = 'Plant') {
  await page.getByRole('button', { name: /^(Create your first exhibit|\+ Add an Exhibit|Continue where you left off)/ }).click();
  await page.getByLabel('Something you never quite finished').fill(description);
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Exhibit title', { exact: true }).fill(title);
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('radio', { name: form, exact: true }).check();
  // Two synchronous events model repeated activation before React can disable/unmount it.
  await page.getByRole('button', { name: 'Place in Museum' }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.getByRole('dialog').getByRole('heading', { name: title.trim(), exact: true })).toBeVisible();
}
async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 30; i++) {
    if (await target.evaluate(element => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

test('authored words, duplicate prevention, reveal independence, lights and reload', async ({ page }) => {
  await page.goto('/');
  await create(page, '  A moon & a beginning ✨  ', 'My paper moon.\n<script>Just literal words</script> 🌿', 'Spaceship');
  await expect(page.getByRole('checkbox', { name: 'Light off' })).not.toBeChecked();
  let records = await savedRecords(page);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ title: '  A moon & a beginning ✨  ', description: 'My paper moon.\n<script>Just literal words</script> 🌿', artifactType: 'spaceship', lightOn: false });
  const id = records[0].id;
  await page.reload();
  await page.getByRole('button', { name: /View exhibit:/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Light off' })).not.toBeChecked();
  await page.getByRole('button', { name: 'Leave a little light on' }).click();
  await expect(page.getByRole('checkbox', { name: 'Light on' })).toBeChecked();
  await expect.poll(async () => (await savedRecords(page))[0].lightOn).toBe(true);
  await expect(page.getByRole('button', { name: 'Relive the moment' })).toBeEnabled();
  await page.getByRole('checkbox', { name: 'Light on' }).uncheck();
  await page.getByRole('button', { name: 'Relive the moment' }).click();
  await expect(page.getByRole('checkbox', { name: 'Light off' })).not.toBeChecked();
  await page.reload();
  records = await savedRecords(page);
  expect(records).toHaveLength(1); expect(records[0].id).toBe(id); expect(records[0].lightOn).toBe(false);
  await page.getByRole('button', { name: /View exhibit:/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Light off' })).not.toBeChecked();
});

test('failed placement retains editable words and retries one ID without replacing other records', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installFaults(page, { localWrite: false });
  await page.goto('/');
  const original = JSON.stringify(existing, null, 2);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: PREFIX + FIRST_ID, raw: original });
  await page.reload();
  await page.evaluate(() => { window.almostFaults.localWrite = true; });
  await create(page);
  await expect(page.getByText('Temporary · not saved for your next visit', { exact: true })).toBeVisible();
  await expect(page.getByText('Your exhibit has found its place.', { exact: true })).toHaveCount(0);
  const pendingId = await page.evaluate(() => JSON.parse(sessionStorage.getItem('almost:draft')!).id);
  await page.getByRole('button', { name: 'Continue editing' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByLabel('Exhibit title', { exact: true }).fill('A revised beginning');
  await page.getByLabel('Your exhibit description').fill('My revised words\nRemain exact.');
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.evaluate(() => { window.almostFaults.localWrite = false; });
  await page.getByRole('button', { name: 'Update & retry' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A revised beginning' })).toBeVisible();
  await expect(page.getByText('Saved in this browser', { exact: true })).toBeVisible();
  const records = await savedRecords(page);
  expect(records).toHaveLength(2);
  expect(records.find(record => record.id === pendingId)).toMatchObject({ title: 'A revised beginning', description: 'My revised words\nRemain exact.' });
  expect(await page.evaluate(key => localStorage.getItem(key), PREFIX + FIRST_ID)).toBe(original);
  await page.reload();
  await page.getByRole('button', { name: 'View exhibit: A revised beginning', exact: true }).click();
  await expect(page.getByText('My revised words\nRemain exact.', { exact: true })).toBeVisible();
});

test('draft retains words, edited title, step and choice across close and reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create your first exhibit' }).click();
  await page.getByLabel('Something you never quite finished').fill('  A book\nWith unfinished pages 📖');
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Exhibit title', { exact: true }).fill('My own title');
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('radio', { name: 'Book', exact: true }).check();
  const id = await page.evaluate(() => JSON.parse(sessionStorage.getItem('almost:draft')!).id);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Continue where you left off' }).click();
  await expect(page.getByRole('radio', { name: 'Book', exact: true })).toBeChecked();
  await page.reload();
  await page.getByRole('button', { name: 'Continue where you left off' }).click();
  await expect(page.getByRole('radio', { name: 'Book', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Exhibit title', { exact: true })).toHaveValue('My own title');
  await expect(page.getByLabel('Your exhibit description')).toHaveValue('  A book\nWith unfinished pages 📖');
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('almost:draft')!).id)).toBe(id);
});

test('both storage failures keep the current page usable and disclose reload limitations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installFaults(page, { localWrite: true, sessionWrite: true });
  await page.goto('/');
  await create(page);
  await expect(page.getByText(/draft remains here while this page is open/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue editing' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Your exhibit description')).toHaveValue('A paper garden\nWaiting beside a window 🌿');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'View exhibit: The paper moon' })).toBeVisible();
  expect(await savedRecords(page)).toHaveLength(0);
});

test('failed draft cleanup cannot reintroduce a successfully placed exhibit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installFaults(page, { cleanup: true });
  await page.goto('/');
  await create(page, 'The tiny canvas', 'A painting I once started.', 'Canvas');
  expect(await page.evaluate(() => sessionStorage.getItem('almost:draft'))).not.toBeNull();
  await page.reload();
  await expect(page.getByRole('button', { name: '+ Add an Exhibit', exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue where you left off' })).toHaveCount(0);
  expect(await savedRecords(page)).toHaveLength(1);
});

test('corrupt data is preserved, valid exhibits remain visible, and explicit recheck alone unlocks writes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(({ key, record }) => { localStorage.setItem(key, JSON.stringify(record)); localStorage.setItem('almost:exhibit:broken', '{unreadable'); }, { key: PREFIX + FIRST_ID, record: existing });
  await page.reload();
  await expect(page.getByText(/saved collection could not be loaded fully/)).toBeVisible();
  await expect(page.getByRole('button', { name: `View exhibit: ${existing.title}`, exact: true })).toBeVisible();
  await create(page, 'A temporary star', 'A story about a star.', 'Music box');
  await expect(page.getByRole('button', { name: 'Retry saving' })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('almost:exhibit:broken'))).toBe('{unreadable');
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('almost:exhibit:')).length)).toBe(2);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Check again' }).click();
  await expect(page.getByText(/saved collection could not be loaded fully/)).toBeVisible();
  // External/manual resolution only: the application must never remove these bytes itself.
  await page.evaluate(() => localStorage.removeItem('almost:exhibit:broken'));
  await page.getByRole('button', { name: 'Check again' }).click();
  await page.getByRole('button', { name: 'View exhibit: A temporary star' }).click();
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByText('Saved in this browser', { exact: true })).toBeVisible();
  expect(await savedRecords(page)).toHaveLength(2);
});

test('a failed initial read never silently replaces a saved collection', async ({ page }) => {
  await installFaults(page, {});
  await page.goto('/');
  await page.evaluate(({ key, record }) => localStorage.setItem(key, JSON.stringify(record)), { key: PREFIX + FIRST_ID, record: existing });
  await page.evaluate(() => { window.almostFaults.localRead = true; });
  // Keep the denial across initialization without introducing an application test route.
  await page.addInitScript(() => { window.almostFaults.localRead = true; });
  await page.reload();
  await expect(page.getByText(/saved collection could not be loaded fully/)).toBeVisible();
  await page.evaluate(() => { window.almostFaults.localRead = false; });
  await page.getByRole('button', { name: 'Check again' }).click();
  await expect(page.getByRole('button', { name: `View exhibit: ${existing.title}` })).toBeVisible();
  expect(await savedRecords(page)).toHaveLength(1);
});

test('seven exhibits remain reachable with explicit desktop and mobile browsing', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const forms = ['Book', 'Spaceship', 'Plant', 'Music box', 'Canvas', 'Book', 'Plant'];
  for (let index = 0; index < 7; index++) {
    await create(page, `Beginning ${index + 1}`, `The story of beginning ${index + 1}.`, forms[index]);
    await page.keyboard.press('Escape');
  }
  expect(await savedRecords(page)).toHaveLength(7);
  await page.reload();
  if (isMobile) {
    for (let index = 0; index < 6; index++) await page.getByRole('button', { name: 'Next exhibit', exact: true }).click();
  } else await page.getByRole('button', { name: 'Next exhibits', exact: true }).click();
  await page.getByRole('button', { name: 'View exhibit: Beginning 7', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Beginning 7' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('keyboard-only creation, validation, focus return and reduced-motion interactions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await tabTo(page, page.getByRole('button', { name: 'Create your first exhibit' }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('heading')).toBeFocused();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await tabTo(page, page.getByLabel('Something you never quite finished'));
  await page.keyboard.type('A song from a summer afternoon.');
  await tabTo(page, page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true })); await page.keyboard.press('Enter');
  await tabTo(page, page.getByLabel('Exhibit title', { exact: true }));
  await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('A summer song');
  await tabTo(page, page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true })); await page.keyboard.press('Enter');
  await tabTo(page, page.getByRole('radio', { name: 'Book', exact: true })); await page.keyboard.press('Space');
  await tabTo(page, page.getByRole('button', { name: 'Place in Museum' })); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A summer song' })).toBeFocused();
  await tabTo(page, page.getByRole('button', { name: 'Leave a little light on' })); await page.keyboard.press('Enter');
  await expect(page.getByRole('checkbox', { name: 'Light on' })).toBeChecked();
  await expect(page.locator('.artifact.is-playing, .artifact.is-revealing, .being-revealed')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'View exhibit: A summer song' })).toBeFocused();
});

test('saving a light after recovery edits preserves the latest authored words', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installFaults(page, { localWrite: true });
  await page.goto('/');
  await create(page);
  await page.getByRole('button', { name: 'Continue editing' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByLabel('Exhibit title', { exact: true }).fill('Latest pending words');
  await page.getByLabel('Your exhibit description').fill('These words were edited after a failed placement.');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'View exhibit: The paper moon' }).click();
  await page.evaluate(() => { window.almostFaults.localWrite = false; });
  await page.getByRole('button', { name: 'Leave a little light on' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Latest pending words' })).toBeVisible();
  expect(await savedRecords(page)).toMatchObject([{ title: 'Latest pending words', description: 'These words were edited after a failed placement.', lightOn: true }]);
  expect(await page.evaluate(() => sessionStorage.getItem('almost:draft'))).toBeNull();
});

test('a conflicting recovered draft never replaces the saved version in memory or storage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(({ key, record }) => {
    localStorage.setItem(key, JSON.stringify(record));
    sessionStorage.setItem('almost:draft', JSON.stringify({ schemaVersion: 1, id: record.id, step: 'form', title: 'Conflicting words', description: 'A distinct unsaved version.', titleInitialized: true, artifactType: 'canvas', phase: 'pending-save', placedAt: record.createdAt }));
  }, { key: PREFIX + FIRST_ID, record: existing });
  await page.reload();
  await expect(page.getByText(/earlier draft differs from its saved exhibit/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue where you left off' }).click();
  await page.getByRole('button', { name: 'Update & retry' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: `View exhibit: ${existing.title}` })).toBeVisible();
  expect(await savedRecords(page)).toEqual([existing]);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('almost:draft')!).title)).toBe('Conflicting words');
});

test('failed light writes keep session feedback honest and retry the same saved exhibit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installFaults(page, {});
  await page.goto('/');
  await create(page, 'A quiet book', 'A few pages that mattered.', 'Book');
  const [before] = await savedRecords(page);
  await page.evaluate(() => { window.almostFaults.localWrite = true; });
  await page.getByRole('button', { name: 'Leave a little light on' }).click();
  await expect(page.getByRole('checkbox', { name: 'Light on' })).toBeChecked();
  await expect(page.getByText('Temporary · not saved for your next visit', { exact: true })).toBeVisible();
  expect((await savedRecords(page))[0].lightOn).toBe(false);
  await page.evaluate(() => { window.almostFaults.localWrite = false; });
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByText('Saved in this browser', { exact: true })).toBeVisible();
  const [after] = await savedRecords(page);
  expect(after).toEqual({ ...before, lightOn: true });
  await page.reload();
  await page.getByRole('button', { name: 'View exhibit: A quiet book' }).click();
  await expect(page.getByRole('checkbox', { name: 'Light on' })).toBeChecked();
});

test('Pip is an accessible local illustration through arrival and the creation ritual', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: /Pip/i }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Create your first exhibit' }).click();
  await expect(page.getByRole('dialog').getByRole('img', { name: /Pip/i })).toBeVisible();
  await page.getByLabel('Something you never quite finished').fill('A small paper observatory.');
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('img', { name: /Pip/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('img', { name: /Pip/i }).first()).toBeVisible();
});

test('a failed save skips the placement ceremony and never celebrates durable success', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await installFaults(page, { localWrite: true });
  await page.goto('/');
  await page.getByRole('button', { name: 'Create your first exhibit' }).click();
  await page.getByLabel('Something you never quite finished').fill('A little observatory.');
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Exhibit title', { exact: true }).fill('A temporary observatory');
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('radio', { name: 'Spaceship', exact: true }).check();
  await page.getByRole('button', { name: 'Place in Museum' }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  // Assertions run immediately, before a normal ceremony could have finished.
  await expect(page.locator('.being-revealed, .artifact.is-revealing, .placement-ceremony')).toHaveCount(0);
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A temporary observatory' })).toBeVisible();
  await expect(page.getByText('Your exhibit has found its place.', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Temporary · not saved for your next visit', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue editing' })).toBeVisible();
  expect(await savedRecords(page)).toHaveLength(0);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('almost:draft')!).title)).toBe('A temporary observatory');
});

test('twelve existing keepsakes retain stable IDs, exact bytes, ordering and independent lights', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const forms = ['book', 'spaceship', 'plant', 'music-box', 'canvas'];
  const fixture = Array.from({ length: 12 }, (_, index) => ({ ...existing, id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, title: `Kept beginning ${String(index + 1).padStart(2, '0')}`, description: `  Original words ${index + 1}.\nA little story ✨`, artifactType: forms[index % forms.length], lightOn: index % 2 === 0, createdAt: new Date(Date.parse(existing.createdAt) + index * 1000).toISOString() }));
  const bytes = fixture.map(record => ({ key: PREFIX + record.id, raw: JSON.stringify(record, null, 2) }));
  await page.evaluate(entries => { for (const entry of entries) localStorage.setItem(entry.key, entry.raw); }, bytes);
  await page.reload();
  expect(await savedRecords(page)).toHaveLength(12);
  if (isMobile) {
    for (let step = 1; step < 12; step++) {
      await page.getByRole('button', { name: 'Next exhibit', exact: true }).click();
      await expect(page.getByRole('navigation', { name: 'Mobile collection browsing' })).toContainText(`${step + 1} of 12`);
    }
  } else await page.getByRole('button', { name: 'Next exhibits', exact: true }).click();
  await page.getByRole('button', { name: 'View exhibit: Kept beginning 12', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Light off' })).not.toBeChecked();
  await page.getByRole('button', { name: 'Relive the moment' }).click();
  await expect(page.getByRole('checkbox', { name: 'Light off' })).not.toBeChecked();
  await page.keyboard.press('Escape');
  await page.reload();
  const after = await page.evaluate(entries => entries.map(entry => ({ key: entry.key, raw: localStorage.getItem(entry.key) })), bytes);
  expect(after).toEqual(bytes);
  expect((await savedRecords(page)).sort((a, b) => a.id.localeCompare(b.id))).toEqual(fixture);
});

test('the complete keepsake journey makes no external network request', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== 'http://127.0.0.1:4173') externalRequests.push(url.href);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await create(page, 'Local little story', 'A story kept entirely in this browser.', 'Canvas');
  await page.getByRole('button', { name: 'Leave a little light on' }).click();
  await page.getByRole('button', { name: 'Relive the moment' }).click();
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(externalRequests).toEqual([]);
});

test('320px short viewports keep creation and long plaque bottom actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Create your first exhibit' }).click();
  const longWords = 'A little unfinished beginning.\n'.repeat(29);
  await page.getByLabel('Something you never quite finished').fill(longWords);
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Exhibit title', { exact: true }).fill('A very small room for a long story');
  // A short layout approximates the available space above a mobile software keyboard.
  await page.setViewportSize({ width: 320, height: 360 });
  const next = page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true });
  await next.scrollIntoViewIfNeeded();
  await expect(next).toBeInViewport();
  await next.click();
  await page.getByRole('radio', { name: 'Canvas', exact: true }).check();
  const place = page.getByRole('button', { name: 'Place in Museum' });
  await place.scrollIntoViewIfNeeded();
  await expect(place).toBeInViewport();
  await place.click();
  const toggle = page.getByRole('checkbox', { name: 'Light off' });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toBeInViewport();
  await toggle.check();
  await expect(page.getByRole('checkbox', { name: 'Light on' })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'View exhibit: A very small room for a long story' })).toBeFocused();
});
