/// <reference lib="dom" />
import { test, expect, type Page, type Locator } from '@playwright/test';

const PREFIX = 'almost:exhibit:';
const FIRST_ID = '00000000-0000-4000-8000-000000000001';
const existing = { schemaVersion: 1, id: FIRST_ID, title: 'An earlier beginning', description: 'Words that must remain untouched.', artifactType: 'book', lightOn: false, createdAt: '2026-10-24T00:00:00.000Z' };
declare global { interface Window { almostExhibitWrites: string[]; almostFaults: { localWrite: boolean; sessionWrite: boolean; cleanup: boolean; localRead: boolean } } }
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
  await page.getByRole('button', { name: 'Preview its place', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A little place for it.', exact: true })).toBeVisible();
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
  await tabTo(page, page.getByRole('button', { name: 'Preview its place', exact: true })); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A little place for it.' })).toBeFocused();
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
  await page.getByRole('button', { name: 'Preview its place', exact: true }).click();
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
  await page.getByRole('button', { name: 'Preview its place', exact: true }).click();
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

async function preparePreview(page: Page, title = 'A previewed beginning', form = 'Book') {
  await page.getByRole('button', { name: /^(Create your first exhibit|\+ Add an Exhibit|Continue where you left off)/ }).click();
  await page.getByLabel('Something you never quite finished').fill('An idea that is still mine to place.');
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Exhibit title', { exact: true }).fill(title);
  await page.getByRole('dialog').getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('radio', { name: form, exact: true }).check();
  await page.getByRole('button', { name: 'Preview its place', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A little place for it.', exact: true })).toBeVisible();
}

test('placement preview remains reversible and never writes or creates a phantom exhibit', async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 700 });
  const longTitle = 'A softly remembered beginning with a place among the stars. '.repeat(2).slice(0, 100);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    const local = window.localStorage;
    window.almostExhibitWrites = [];
    Storage.prototype.setItem = function(key, value) {
      if (this === local && key.startsWith('almost:exhibit:')) window.almostExhibitWrites.push(key);
      return original.call(this, key, value);
    };
  });
  await page.goto('/');
  await preparePreview(page, longTitle, 'Music box');
  const previewScene = await page.locator('.placement-preview-scene').boundingBox();
  const previewArtifact = await page.locator('.preview-keepsake .artifact').boundingBox();
  const previewTag = await page.locator('.preview-tag').boundingBox();
  expect(previewScene).not.toBeNull(); expect(previewArtifact).not.toBeNull(); expect(previewTag).not.toBeNull();
  for (const part of [previewArtifact!, previewTag!]) {
    expect(part.x).toBeGreaterThanOrEqual(previewScene!.x - 1);
    expect(part.y).toBeGreaterThanOrEqual(previewScene!.y - 1);
    expect(part.x + part.width).toBeLessThanOrEqual(previewScene!.x + previewScene!.width + 1);
    expect(part.y + part.height).toBeLessThanOrEqual(previewScene!.y + previewScene!.height + 1);
  }
  await expect(page.getByText('Preview only · not placed yet', { exact: true })).toBeVisible();
  expect(await savedRecords(page)).toEqual([]);
  expect(await page.evaluate(() => window.almostExhibitWrites)).toEqual([]);
  await expect(page.getByRole('button', { name: /View exhibit:/ })).toHaveCount(0);
  await expect(page.getByRole('dialog').locator('.artifact.is-lit')).toHaveCount(0);
  const draftId = await page.evaluate(() => JSON.parse(sessionStorage.getItem('almost:draft')!).id);
  await page.getByRole('button', { name: /Back to vessel$/ }).click();
  await expect(page.getByRole('radio', { name: 'Music box', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Preview its place', exact: true }).click();
  await page.keyboard.press('Escape');
  expect(await savedRecords(page)).toEqual([]);
  await page.getByRole('button', { name: 'Continue where you left off' }).click();
  await expect(page.getByRole('radio', { name: 'Music box', exact: true })).toBeChecked();
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('almost:draft')!).id)).toBe(draftId);
  await page.getByRole('button', { name: 'Preview its place', exact: true }).click();
  await page.getByRole('button', { name: 'Place in Museum', exact: true }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.getByRole('dialog').getByRole('heading', { name: longTitle.trim(), exact: true })).toBeVisible();
  expect(await savedRecords(page)).toMatchObject([{ id: draftId, lightOn: false, artifactType: 'music-box' }]);
  expect(await page.evaluate(() => window.almostExhibitWrites)).toEqual([PREFIX + draftId]);
});

test('the placement ceremony can be skipped by keyboard without a second write or light change', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await preparePreview(page, 'A moment I can skip', 'Spaceship');
  await tabTo(page, page.getByRole('button', { name: 'Place in Museum', exact: true }));
  await page.keyboard.press('Enter');
  const skip = page.getByRole('button', { name: 'Open its keepsake card', exact: true });
  await expect(skip).toBeVisible();
  await tabTo(page, skip);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A moment I can skip' })).toBeFocused();
  await expect(page.locator('.placement-ceremony')).toHaveCount(0);
  const records = await savedRecords(page);
  expect(records).toHaveLength(1);
  expect(records).toMatchObject([{ title: 'A moment I can skip', lightOn: false }]);
});

test('twenty-four keepsakes retain predictable pagination and remain selectable', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const fixture = Array.from({ length: 24 }, (_, index) => ({ ...existing, id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, title: `Little beginning ${String(index + 1).padStart(2, '0')}`, lightOn: index % 3 === 0, createdAt: new Date(Date.parse(existing.createdAt) + index * 1000).toISOString() }));
  await page.evaluate(({ prefix, records }) => { for (const record of records) localStorage.setItem(prefix + record.id, JSON.stringify(record)); }, { prefix: PREFIX, records: fixture });
  await page.reload();
  if (isMobile) {
    for (let step = 1; step < 24; step++) {
      await page.getByRole('button', { name: 'Next exhibit', exact: true }).click();
      await expect(page.getByRole('navigation', { name: 'Mobile collection browsing' })).toContainText(`${step + 1} of 24`);
    }
    await expect(page.getByRole('button', { name: 'Next exhibit', exact: true })).toBeDisabled();
  } else {
    for (let step = 1; step < 4; step++) {
      await page.getByRole('button', { name: 'Next exhibits', exact: true }).click();
      await expect(page.getByRole('navigation', { name: 'Collection browsing', exact: true })).toContainText(`${step * 6 + 1}–${(step + 1) * 6}`);
    }
    await expect(page.getByRole('button', { name: 'Next exhibits', exact: true })).toBeDisabled();
  }
  await page.getByRole('button', { name: 'View exhibit: Little beginning 24', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Little beginning 24' })).toBeVisible();
  await page.keyboard.press('Escape');
  expect((await savedRecords(page)).sort((a, b) => a.id.localeCompare(b.id))).toEqual(fixture);
});

test('five responsive layouts keep primary actions discoverable and clear of exhibit labels', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const viewports = [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 700 }];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    // Isolate the first-use composition from the prior viewport's seeded collection.
    await page.evaluate(prefix => { for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key); }, PREFIX);
    await page.reload();
    const createButton = page.getByRole('button', { name: 'Create your first exhibit', exact: true });
    await expect(createButton).toBeVisible();
    if (viewport.width >= 960) await expect(createButton).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `empty-room overflow at ${viewport.width}`).toBe(true);
    const fixture = Array.from({ length: 6 }, (_, index) => ({ ...existing, id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, title: `A kept beginning ${index + 1} with a longer label`, createdAt: new Date(Date.parse(existing.createdAt) + index * 1000).toISOString() }));
    await page.evaluate(({ prefix, records }) => { for (const record of records) localStorage.setItem(prefix + record.id, JSON.stringify(record)); }, { prefix: PREFIX, records: fixture });
    await page.reload();
    const add = page.getByRole('button', { name: '+ Add an Exhibit', exact: true });
    await expect(add).toBeVisible();
    if (viewport.width >= 960) await expect(add).toBeInViewport({ ratio: 1 });
    const geometry = await page.evaluate(() => {
      const primary = document.querySelector('.museum-create')!.getBoundingClientRect();
      const overlap = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
      const labels = [...document.querySelectorAll('.keepsake-tag')].filter(element => element.getClientRects().length).map(element => element.getBoundingClientRect());
      const nav = [...document.querySelectorAll('.desktop-browse, .mobile-browse')].filter(element => element.getClientRects().length).map(element => element.getBoundingClientRect());
      return { overflow: document.documentElement.scrollWidth > innerWidth, labelCollisions: labels.filter(label => overlap(label, primary) || nav.some(controls => overlap(label, controls))).length, labelsOverlap: labels.some((label, index) => labels.slice(index + 1).some(other => overlap(label, other))) };
    });
    expect(geometry, `collection geometry at ${viewport.width}x${viewport.height}`).toEqual({ overflow: false, labelCollisions: 0, labelsOverlap: false });
  }
});

test('Pip acknowledges a light briefly then returns to a quiet pose without writing again', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await create(page, 'A little light for Pip', 'A beginning with room to stay.', 'Plant');
  await page.getByRole('button', { name: 'Leave a little light on' }).click();
  await expect(page.locator('.keeper-corner .pip-note')).toContainText('A little light? Good idea.');
  const [record] = await savedRecords(page);
  expect(record.lightOn).toBe(true);
  await expect(page.locator('.keeper-corner .pip-note')).toHaveCount(0, { timeout: 8000 });
  expect(await savedRecords(page)).toEqual([record]);
});

async function storageBytes(page: Page) {
  return page.evaluate(() => ({
    local: Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]),
    session: Object.keys(sessionStorage).sort().map(key => [key, sessionStorage.getItem(key)]),
  }));
}

async function seedEnvironmentVisit(page: Page) {
  await page.goto('/');
  const draft = { schemaVersion: 1, id: '00000000-0000-4000-8000-000000000002', step: 'name', title: '  My own words ✨  ', description: 'A beginning\nWith room to change.', titleInitialized: true, artifactType: 'canvas', phase: 'creating', placedAt: null };
  await page.evaluate(({ record, unfinished }) => {
    localStorage.setItem('almost:exhibit:' + record.id, JSON.stringify(record, null, 2));
    sessionStorage.setItem('almost:draft', JSON.stringify(unfinished, null, 3));
  }, { record: existing, unfinished: draft });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue where you left off', exact: true })).toBeVisible();
  return storageBytes(page);
}

test('room discoveries offer visible feedback and preserve exact saved and unfinished words', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    let calls = 0;
    for (const key of ['Audio', 'AudioContext', 'webkitAudioContext']) {
      const constructor = Reflect.get(window, key);
      if (typeof constructor === 'function') Reflect.set(window, key, new Proxy(constructor, { construct(target, argumentsList) { calls++; return Reflect.construct(target, argumentsList); } }));
    }
    Reflect.defineProperty(window, 'almostSoundCalls', { get: () => calls });
  });
  const before = await seedEnvironmentVisit(page);
  await page.getByRole('button', { name: 'Look through the twilight window', exact: true }).click();
  await expect(page.locator('.window-discovery')).toHaveClass(/is-twinkling/);
  await expect(page.getByRole('status').filter({ hasText: 'Somewhere, the night is still full of possibilities.' })).toBeVisible();
  expect(await storageBytes(page)).toEqual(before);
  const lamp = page.getByRole('button', { name: 'Desk lamp', exact: true });
  await expect(lamp).toHaveAttribute('aria-pressed', 'true');
  await lamp.click();
  await expect(lamp).toHaveAttribute('aria-pressed', 'false');
  await expect(lamp).toContainText('Lamp off');
  await lamp.click();
  await expect(lamp).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Ring the museum bell', exact: true }).click();
  await expect(page.locator('.bell-touch')).toHaveClass(/is-ringing/);
  await expect(page.getByRole('status').filter({ hasText: 'A little ring, seen rather than heard. Nothing here is late.' })).toBeVisible();
  await expect(page.locator('audio,video')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'almostSoundCalls'))).toBe(0);
  expect(await storageBytes(page)).toEqual(before);
  await expect(page.locator('.bell-touch')).not.toHaveClass(/is-ringing/, { timeout: 5000 });
  await expect(page.locator('.environment-whisper')).toBeEmpty();
  expect(await storageBytes(page)).toEqual(before);
});

test('every room story is keyboard accessible and Escape restores its own trigger without changing storage', async ({ page }) => {
  const before = await seedEnvironmentVisit(page);
  const stories = [
    { trigger: 'Open the guestbook', title: 'The guestbook, left open.', text: 'You do not need a finished thing to belong here.' },
    { trigger: 'Read the curator’s note', title: 'A note from the curator.', text: 'We keep beginnings here.' },
    { trigger: 'Read the empty pedestal inscription', title: 'A place for what might have been.', text: 'An empty pedestal is not a missing story.' },
    { trigger: 'Ask Pip for a little thought', title: 'A word from Pip.', text: 'I keep the lamps company.' },
  ];
  // Move to each real tab stop; do not invoke the onClick handler directly.
  for (const [index, story] of stories.entries()) {
    const trigger = page.getByRole('button', { name: story.trigger, exact: true });
    await tabTo(page, trigger);
    await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAccessibleName(story.title);
    await expect(dialog.getByRole('heading', { name: story.title, exact: true })).toBeFocused();
    await expect(dialog).toContainText(story.text);
    if (index === 0) await expect(dialog.locator('.open-guestbook')).toBeVisible();
    expect(await storageBytes(page)).toEqual(before);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  expect(await storageBytes(page)).toEqual(before);
  await page.reload();
  expect(await storageBytes(page)).toEqual(before);
  await expect(page.getByRole('button', { name: `View exhibit: ${existing.title}`, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue where you left off', exact: true })).toBeVisible();
});

test('reduced motion keeps room discoveries immediate and keyboard usable without animating or persisting them', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const before = await seedEnvironmentVisit(page);
  const windowButton = page.getByRole('button', { name: 'Look through the twilight window', exact: true });
  await tabTo(page, windowButton);
  await page.keyboard.press('Enter');
  await expect(page.locator('.environment-whisper')).toContainText('Somewhere, the night is still full of possibilities.');
  const lamp = page.getByRole('button', { name: 'Desk lamp', exact: true });
  await tabTo(page, lamp);
  await page.keyboard.press('Space');
  await expect(lamp).toHaveAttribute('aria-pressed', 'false');
  const bell = page.getByRole('button', { name: 'Ring the museum bell', exact: true });
  await tabTo(page, bell);
  await page.keyboard.press('Enter');
  await expect(page.locator('.environment-whisper')).toContainText('A little ring, seen rather than heard.');
  const animations = await page.locator('.window-stars, .window-stars i, .bell-touch, .bell-touch svg').evaluateAll(elements => elements.flatMap(element => element.getAnimations()).filter(animation => animation.playState === 'running').length);
  expect(animations).toBe(0);
  expect(await storageBytes(page)).toEqual(before);
  // Transient lamp state resets on return, while authored content remains byte-for-byte unchanged.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Desk lamp', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await storageBytes(page)).toEqual(before);
});
