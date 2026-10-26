import { test, expect, type Page, type Locator } from '@playwright/test';

const PREFIX = 'almost:exhibit:';
const EXISTING_ID = '00000000-0000-4000-8000-000000000011';
const DRAFT_ID = '00000000-0000-4000-8000-000000000012';
const existing = { schemaVersion: 1, id: EXISTING_ID, title: 'An earlier beginning', description: '  My exact saved words.\nStill here 🌿  ', artifactType: 'canvas', lightOn: true, createdAt: '2026-10-26T00:00:00.000Z' };
const draft = { schemaVersion: 1, id: DRAFT_ID, step: 'form', title: '  A beginning kept in my own words ✨  ', description: 'An unfinished story.\nNot an interpretation.', titleInitialized: true, artifactType: 'book', phase: 'creating', placedAt: null };
const destinations = [
  { name: 'Moonseed Conservatory', heading: 'A quiet place to just be.', story: 'The seed that could wait.' },
  { name: 'Pocket-Sky Observatory', heading: 'For all the places imagined.', story: 'The map with an empty route.' },
];
async function storageBytes(page: Page) {
  return page.evaluate(() => ({ local: Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]), session: Object.keys(sessionStorage).sort().map(key => [key, sessionStorage.getItem(key)]) }));
}
async function seed(page: Page) {
  await page.goto('/');
  await page.evaluate(({ record, unfinished }) => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('almost:exhibit:' + record.id, JSON.stringify(record, null, 2));
    sessionStorage.setItem('almost:draft', JSON.stringify(unfinished, null, 3));
  }, { record: existing, unfinished: draft });
  await page.reload();
  return storageBytes(page);
}
async function tabTo(page: Page, target: Locator) {
  for (let index = 0; index < 55; index++) {
    if (await target.evaluate(element => document.activeElement === element)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}
async function visit(page: Page, name: string) {
  await page.getByRole('navigation', { name: 'Museum rooms' }).getByRole('button', { name: `Visit ${name}`, exact: true }).click();
}

test('three room signposts navigate by keyboard, name the current room and focus its main heading', async ({ page }) => {
  const before = await seed(page);
  const nav = page.getByRole('navigation', { name: 'Museum rooms' });
  await expect(nav.getByRole('button')).toHaveCount(3);
  await expect(nav.getByRole('button', { name: 'Visit Hall of Beginnings' })).toHaveAttribute('aria-current', 'page');
  for (const destination of destinations) {
    const trigger = nav.getByRole('button', { name: `Visit ${destination.name}`, exact: true });
    await tabTo(page, trigger);
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { level: 1, name: destination.heading, exact: true })).toBeFocused();
    await expect(page.getByRole('region', { name: destination.name, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue where you left off', exact: true })).toHaveCount(0);
    expect(await storageBytes(page)).toEqual(before);
  }
  await tabTo(page, nav.getByRole('button', { name: 'Visit Hall of Beginnings', exact: true }));
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { level: 1, name: 'A whole world of almost.', exact: true })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Continue where you left off', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: `View exhibit: ${existing.title}`, exact: true })).toBeVisible();
  expect(await storageBytes(page)).toEqual(before);
});

test('six room discoveries provide distinct reversible feedback and preserve all saved and draft bytes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const before = await seed(page);
  await visit(page, 'Moonseed Conservatory');
  const rain = page.getByRole('button', { name: 'Little rain cloud', exact: true });
  await expect(rain).toHaveAttribute('aria-pressed', 'false');
  await rain.click();
  await expect(rain).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.story-room-feedback')).toHaveText('A little rain. Nothing here has to grow.');
  await rain.click();
  await expect(rain).toHaveAttribute('aria-pressed', 'false');
  const flower = page.getByRole('button', { name: 'Paper flower', exact: true });
  await flower.click();
  await expect(flower).toHaveAttribute('aria-pressed', 'true');
  await expect(flower).toContainText('Petals open');
  await flower.click();
  await expect(flower).toHaveAttribute('aria-pressed', 'false');
  const drawer = page.getByRole('button', { name: 'Open the seed drawer', exact: true });
  await drawer.click();
  await expect(drawer).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.seed-drawer-caption')).toBeVisible();
  await expect(page.locator('.seed-drawer-caption')).toContainText('For another season.');
  await drawer.click();
  await expect(page.locator('.seed-drawer-caption')).toBeHidden();
  expect(await storageBytes(page)).toEqual(before);
  await visit(page, 'Pocket-Sky Observatory');
  const telescope = page.getByRole('button', { name: 'Look through the telescope', exact: true });
  await telescope.click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'A sky with room in it.', exact: true })).toBeFocused();
  await expect(page.locator('.telescope-view')).toContainText('The sky has left the route up to you.');
  await page.keyboard.press('Escape');
  await expect(telescope).toBeFocused();
  const wheel = page.getByRole('button', { name: 'Turn the constellation wheel', exact: true });
  await expect(wheel).toContainText('A paper boat');
  for (const constellation of ['A little kite', 'A sleeping fox', 'A paper boat']) {
    await wheel.click();
    await expect(wheel).toContainText(constellation);
    await expect(page.locator('.story-room-feedback')).toContainText('No destination required.');
  }
  const comet = page.getByRole('button', { name: 'Wake the clockwork comet', exact: true });
  await comet.click();
  await expect(comet).toHaveClass(/comet-awake/);
  await expect(page.locator('.story-room-feedback')).toHaveText('A tiny journey, around and home again.');
  const moving = await page.locator('.story-room *').evaluateAll(elements => elements.flatMap(element => element.getAnimations()).filter(animation => animation.playState === 'running').length);
  expect(moving).toBe(0);
  expect(await storageBytes(page)).toEqual(before);
  await visit(page, 'Moonseed Conservatory');
  await expect(page.getByRole('button', { name: 'Little rain cloud', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Paper flower', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Open the seed drawer', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await page.reload();
  expect(await storageBytes(page)).toEqual(before);
});

test('each room has its own readable story with keyboard dismissal and focus return', async ({ page }) => {
  const before = await seed(page);
  for (const destination of destinations) {
    await visit(page, destination.name);
    const read = page.getByRole('button', { name: 'Read this room’s story', exact: false });
    await tabTo(page, read);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAccessibleName(destination.story);
    await expect(dialog.getByRole('heading', { name: destination.story, exact: true })).toBeFocused();
    await expect(dialog).toContainText('A little story from the museum’s imagined history');
    await page.keyboard.press('Escape');
    await expect(read).toBeFocused();
    expect(await storageBytes(page)).toEqual(before);
  }
});

test('creation from either story room resumes one stable draft in the hall and saves only its own exhibit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const destination of destinations) {
    const before = await seed(page);
    await visit(page, destination.name);
    await page.getByRole('button', { name: 'Continue your beginning', exact: false }).click();
    await expect(page.locator('#museum')).toHaveAttribute('data-room', 'hall');
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Choose a little vessel.', exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Book', exact: true })).toBeChecked();
    expect(await storageBytes(page)).toEqual(before);
    await page.getByRole('button', { name: 'Preview its place', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText(draft.title.trim());
    expect(await storageBytes(page)).toEqual(before);
    await page.getByRole('button', { name: 'Place in Museum', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: draft.title.trim(), exact: true })).toBeVisible();
    const after = await storageBytes(page);
    expect(after.local.find(([key]) => key === PREFIX + EXISTING_ID)).toEqual(before.local.find(([key]) => key === PREFIX + EXISTING_ID));
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), PREFIX + DRAFT_ID);
    expect(saved).toMatchObject({ id: DRAFT_ID, title: draft.title, description: draft.description, artifactType: 'book', lightOn: false });
    expect(after.local.filter(([key]) => key?.startsWith(PREFIX))).toHaveLength(2);
    expect(after.session).toEqual([]);
    await page.reload();
    await expect(page.getByRole('button', { name: `View exhibit: ${draft.title.trim()}`, exact: true })).toBeVisible();
    expect((await storageBytes(page)).local).toEqual(after.local);
  }
});

test('both story rooms stay readable without page overflow or feature/control collisions in seven layouts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const viewport of [{width:320,height:700},{width:390,height:844},{width:600,height:900},{width:768,height:1024},{width:1440,height:900},{width:1920,height:900},{width:1920,height:1080}]) {
    await page.setViewportSize(viewport);
    for (const destination of destinations) {
      await visit(page, destination.name);
      await expect(page.getByRole('button', { name: 'Keep a beginning', exact: false })).toBeVisible();
      const geometry = await page.evaluate(() => {
        const room = document.querySelector('.story-room')!;
        const buttons = [...room.querySelectorAll('.story-object')].map(element => element.getBoundingClientRect());
        const feedback = room.querySelector('.story-room-feedback')!.getBoundingClientRect();
        const invitation = room.querySelector('.story-room-invitation')!.getBoundingClientRect();
        const overlap = (a: DOMRect, b: DOMRect) => Math.min(a.right,b.right) - Math.max(a.left,b.left) > 1 && Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top) > 1;
        return { overflow: document.documentElement.scrollWidth > innerWidth, buttonsOutsidePage: buttons.some(button => button.left < -1 || button.right > innerWidth + 1), buttonsOverlap: buttons.some((button,index) => buttons.slice(index+1).some(other => overlap(button,other))), feedbackCollision: overlap(feedback,invitation), controlCollisions: buttons.filter(button => overlap(button,feedback) || overlap(button,invitation)).length };
      });
      expect(geometry, `${destination.name} at ${viewport.width}×${viewport.height}`).toEqual({ overflow:false,buttonsOutsidePage:false,buttonsOverlap:false,feedbackCollision:false,controlCollisions:0 });
    }
  }
});

test('visiting both story rooms preserves a later collection page or mobile gallery position', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const records = Array.from({ length: 7 }, (_, index) => ({ ...existing, id: `00000000-0000-4000-8000-${String(index+31).padStart(12,'0')}`, title: `A later beginning ${index+1}`, createdAt: new Date(Date.parse(existing.createdAt)+index*1000).toISOString() }));
  await page.evaluate(collection => { for (const record of collection) localStorage.setItem('almost:exhibit:'+record.id,JSON.stringify(record,null,2)); }, records);
  await page.reload();
  const before = await storageBytes(page);
  if (isMobile) {
    for (let index=0;index<6;index++) await page.getByRole('button',{name:'Next exhibit',exact:true}).click();
    await expect(page.getByRole('navigation',{name:'Mobile collection browsing'})).toContainText('7 of 7');
  } else {
    await page.getByRole('button',{name:'Next exhibits',exact:true}).click();
    await expect(page.getByRole('navigation',{name:'Collection browsing',exact:true})).toContainText('7–7 of 7');
  }
  for (const destination of destinations) await visit(page,destination.name);
  await visit(page,'Hall of Beginnings');
  if (isMobile) await expect(page.getByRole('navigation',{name:'Mobile collection browsing'})).toContainText('7 of 7');
  else await expect(page.getByRole('navigation',{name:'Collection browsing',exact:true})).toContainText('7–7 of 7');
  await page.locator('.collection-stage').scrollIntoViewIfNeeded();
  const last = page.getByRole('button',{name:'View exhibit: A later beginning 7',exact:true});
  await expect(last).toBeInViewport();
  await last.click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'A later beginning 7',exact:true})).toBeVisible();
  expect(await storageBytes(page)).toEqual(before);
});
