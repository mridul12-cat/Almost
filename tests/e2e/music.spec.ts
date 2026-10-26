import { test, expect, type Page } from '@playwright/test';

async function visit(page: Page, name: string) {
  await page.getByRole('button', { name: `Visit ${name}`, exact: true }).click();
}
const audioState = (page: Page) => page.locator('.room-music audio').evaluate((audio: HTMLAudioElement) => ({ paused: audio.paused, source: audio.currentSrc || audio.src, volume: audio.volume, loop: audio.loop, time: audio.currentTime }));

test('local tracks start only by choice, switch with rooms, pause and stay off after reload', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().includes('/music/')) requests.push(request.url()); });
  await page.goto('/');
  const originalStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  await expect(page.getByRole('button', { name: 'Play Main Hall music', exact: true })).toHaveAttribute('aria-pressed', 'false');
  expect((await audioState(page)).paused).toBe(true);
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Play Main Hall music', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause Main Hall music', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(0);
  expect(await audioState(page)).toMatchObject({ paused: false, volume: 0.35, loop: true });
  expect((await audioState(page)).source).toContain('/music/main-hall.mp3');
  expect(await page.locator('.music-box-body').evaluate(el => getComputedStyle(el).animationName)).toBe('music-box-sway');

  for (const [room, label, file] of [['Moonseed Conservatory', 'Conservatory', 'conservatory'], ['Pocket-Sky Observatory', 'Observatory', 'observatory'], ['Hall of Beginnings', 'Main Hall', 'main-hall']]) {
    await visit(page, room);
    await expect(page.getByRole('button', { name: `Pause ${label} music`, exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect((await audioState(page)).source).toContain(`/music/${file}.mp3`);
    await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(0);
    await expect(page.locator('audio')).toHaveCount(1);
  }
  await page.getByRole('button', { name: 'Pause Main Hall music', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play Main Hall music', exact: true })).toHaveAttribute('aria-pressed', 'false');
  const pausedAt = (await audioState(page)).time;
  await page.waitForTimeout(250);
  expect((await audioState(page)).time).toBe(pausedAt);
  expect(await page.locator('.music-box-body').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await visit(page, 'Moonseed Conservatory');
  await expect(page.getByRole('button', { name: 'Play Conservatory music', exact: true })).toHaveAttribute('aria-pressed', 'false');
  expect((await audioState(page)).paused).toBe(true);
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(originalStorage);
  await page.reload();
  expect((await audioState(page)).paused).toBe(true);
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('music box is keyboard accessible, fits narrow rooms and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const button = page.locator('.music-box-control');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(await button.evaluate(el => ({ focused: el.matches(':focus-visible'), outline: getComputedStyle(el).outlineWidth }))).toEqual({ focused: true, outline: '3px' });
  expect(await page.locator('.little-music-box').evaluate(el => el.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const room of ['Moonseed Conservatory', 'Pocket-Sky Observatory', 'Hall of Beginnings']) {
      await visit(page, room);
      expect(await page.locator('.music-box-control').evaluate(el => {
        const box = el.getBoundingClientRect();
        return { width: box.width >= 44, height: box.height >= 44, contained: box.left >= 0 && box.right <= innerWidth, overflow: document.documentElement.scrollWidth > innerWidth };
      })).toEqual({ width: true, height: true, contained: true, overflow: false });
    }
  }
  await page.locator('.music-box-control').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'false');
  expect((await audioState(page)).paused).toBe(true);
});

test('blocked playback and failed local audio can be retried without losing the room', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let first = true;
    HTMLMediaElement.prototype.play = function () {
      if (first) { first = false; return Promise.reject(new DOMException('Synthetic blocked playback', 'NotAllowedError')); }
      return original.call(this);
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Main Hall music', exact: true }).click();
  await expect(page.locator('#room-music-feedback')).toContainText('Tap the music box to try again');
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Play Main Hall music', exact: true }).click();
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'true');
  await page.route('**/music/observatory.mp3', route => route.abort());
  await visit(page, 'Pocket-Sky Observatory');
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#room-music-feedback')).toContainText(/retry|try again/);
  await page.unroute('**/music/observatory.mp3');
  await page.getByRole('button', { name: 'Play Observatory music', exact: true }).click();
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(0);
});

test('quick pause cancels pending playback and an old room rejection cannot stop the next track', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let first = true;
    HTMLMediaElement.prototype.play = function () {
      if (first) {
        first = false;
        return new Promise<void>((_resolve, reject) => setTimeout(() => reject(new DOMException('Old request cancelled', 'AbortError')), 900));
      }
      return original.call(this);
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Main Hall music', exact: true }).click();
  await visit(page, 'Moonseed Conservatory');
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(1000);
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#room-music-feedback')).toContainText('Conservatory music is playing.');
  await page.locator('.music-box-control').evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.locator('.music-box-control')).toHaveAttribute('aria-pressed', 'false');
  expect((await audioState(page)).paused).toBe(true);
});
