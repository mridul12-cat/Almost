import { test, expect, type Page, type Locator } from '@playwright/test';
import type { JournalEntry } from '../../src/model/journal';

const PREFIX = 'almost:journal:entry:';
const DRAFT_KEY = 'almost:journal:draft';
const ENTRY_ID = '00000000-0000-4000-8000-000000000071';
const EXHIBIT_ID = '00000000-0000-4000-8000-000000000072';
const EXHIBIT_DRAFT_ID = '00000000-0000-4000-8000-000000000073';
const existing: JournalEntry = { schemaVersion:1,id:ENTRY_ID,title:'A remembered garden',body:'  Original memory.\nKept exactly 🌿  ',createdAt:'2026-10-20T09:15:00.000Z',updatedAt:'2026-10-20T09:15:00.000Z',timeZone:'Asia/Kolkata' };
const exhibit = { schemaVersion:1,id:EXHIBIT_ID,title:'An unfinished moon',description:'  An exhibit, not a journal entry.\nKeep my words.  ',artifactType:'spaceship',lightOn:true,createdAt:'2026-10-20T00:00:00.000Z' };
const exhibitDraft = { schemaVersion:1,id:EXHIBIT_DRAFT_ID,step:'name',title:'Still an open idea',description:'My unfinished project draft.',titleInitialized:true,artifactType:'plant',phase:'creating',placedAt:null };
declare global { interface Window { journalFaults: { localWrite: boolean; sessionWrite: boolean; cleanup: boolean }; journalAllocatedIds: string[] } }
async function faults(page: Page, flags: Partial<Window['journalFaults']>) {
  await page.addInitScript(initial => {
    window.journalFaults = {localWrite:false,sessionWrite:false,cleanup:false,...initial};
    const original = Storage.prototype.setItem;
    const originalRemove = Storage.prototype.removeItem;
    const local = localStorage, session = sessionStorage;
    Storage.prototype.setItem = function(key,value) {
      if ((this === local && key.startsWith('almost:journal:entry:') && window.journalFaults.localWrite) || (this === session && key === 'almost:journal:draft' && window.journalFaults.sessionWrite)) throw new DOMException('Simulated journal storage failure','QuotaExceededError');
      return original.call(this,key,value);
    };
    Storage.prototype.removeItem = function(key) {
      if (this === session && key === 'almost:journal:draft' && window.journalFaults.cleanup) throw new DOMException('Simulated journal cleanup failure','SecurityError');
      return originalRemove.call(this,key);
    };
  }, flags);
}
async function unrelated(page: Page) {
  return page.evaluate(() => ({ exhibit:localStorage.getItem('almost:exhibit:00000000-0000-4000-8000-000000000072'),draft:sessionStorage.getItem('almost:draft') }));
}
async function seed(page: Page, entries: JournalEntry[] = []) {
  await page.goto('/');
  await page.evaluate(({record,unfinished,memories}) => {
    localStorage.setItem('almost:exhibit:'+record.id,JSON.stringify(record,null,2));
    sessionStorage.setItem('almost:draft',JSON.stringify(unfinished,null,3));
    for (const entry of memories) localStorage.setItem('almost:journal:entry:'+entry.id,JSON.stringify(entry,null,2));
  },{record:exhibit,unfinished:exhibitDraft,memories:entries});
  await page.reload();
  return unrelated(page);
}
async function openJournal(page: Page) {
  await page.getByRole('button',{name:'Visit Moonseed Conservatory',exact:true}).click();
  await page.getByRole('button',{name:'Open the memory journal',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('The Memory Journal');
}
async function memories(page: Page): Promise<JournalEntry[]> {
  return page.evaluate(prefix => Object.keys(localStorage).filter(key => key.startsWith(prefix)).map(key => JSON.parse(localStorage.getItem(key)!)),PREFIX);
}
async function newPage(page: Page) {
  await page.getByRole('button',{name:/^(Write a memory|New memory)/}).first().click();
  await expect(page.getByLabel('Your memory',{exact:true})).toBeVisible();
}
async function tabTo(page: Page, target: Locator) {
  for (let index=0;index<55;index++) {
    if (await target.evaluate(element=>document.activeElement===element)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

test('journal records exact words and original date/time, saves once and survives room changes and reload',async({page})=>{
  const external: string[]=[];
  page.on('request',request=>{if (/^https?:/.test(request.url()) && new URL(request.url()).hostname!=='127.0.0.1') external.push(request.url());});
  const before=await seed(page);
  await openJournal(page);
  await expect(page.getByRole('dialog').getByRole('heading',{name:'The Memory Journal',exact:true})).toBeFocused();
  await newPage(page);
  const duplicateIds=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(element=>element.id);return ids.filter((id,index)=>ids.indexOf(id)!==index);});
  expect(duplicateIds).toEqual([]);
  const title='  A little memory & a moon ✨  ';
  const body='  Paper flowers by the window.\n<script>Literal words, never code</script> 🌿\n  ';
  await page.getByLabel('A name for this memory',{exact:false}).fill(title);
  await page.getByLabel('Your memory',{exact:true}).fill(body);
  const draftId=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!).id,DRAFT_KEY);
  const earliest=await page.evaluate(()=>Date.now());
  await page.getByRole('button',{name:'Keep this memory',exact:false}).evaluate(button=>{(button as HTMLButtonElement).click();(button as HTMLButtonElement).click();});
  await expect(page.locator('.journal-save-label')).toHaveText('Saved in this browser');
  const [entry]=await memories(page);
  expect(entry).toMatchObject({id:draftId,title,body});
  expect(entry.createdAt).toBe(entry.updatedAt);
  expect(Date.parse(entry.createdAt)).toBeGreaterThanOrEqual(earliest);
  expect(Date.parse(entry.createdAt)).toBeLessThanOrEqual(await page.evaluate(()=>Date.now()));
  expect(entry.timeZone.length).toBeGreaterThan(0);
  expect(await page.locator('.journal-entry-body').textContent()).toBe(body);
  expect(await page.locator('.journal-entry-title').textContent()).toBe(title);
  await expect(page.locator('.journal-paper .journal-date time')).toHaveAttribute('datetime',entry.createdAt);
  const formatted=await page.evaluate(item=>new Intl.DateTimeFormat(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short',timeZone:item.timeZone}).format(new Date(item.createdAt)),entry);
  await expect(page.locator('.journal-paper .journal-date')).toContainText(formatted);
  expect(await page.evaluate(key=>sessionStorage.getItem(key),DRAFT_KEY)).toBeNull();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Open the memory journal',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Visit Pocket-Sky Observatory',exact:true}).click();
  await openJournal(page);
  await expect(page.locator('.journal-entry-body')).toHaveText(body.trim());
  await page.reload();
  await openJournal(page);
  expect(await memories(page)).toEqual([entry]);
  expect(await page.locator('.journal-entry-body').textContent()).toBe(body);
  expect(await unrelated(page)).toEqual(before);
  expect(external).toEqual([]);
  await expect(page.locator('audio,video')).toHaveCount(0);
});

test('editing keeps the stable ID, original recording time and zone with a separate updated timestamp',async({page})=>{
  const before=await seed(page,[existing]);
  await openJournal(page);
  await expect(page.locator('.journal-paper .journal-date time')).toHaveAttribute('datetime',existing.createdAt);
  await page.getByRole('button',{name:'Edit this memory',exact:true}).click();
  const body='  More of the same memory.\nA detail I remembered later ✨  ';
  await page.getByLabel('Your memory',{exact:true}).fill(body);
  await page.getByRole('button',{name:'Save changes',exact:false}).click();
  await expect(page.locator('.journal-save-label')).toHaveText('Saved in this browser');
  const [entry]=await memories(page);
  expect(entry).toMatchObject({id:existing.id,createdAt:existing.createdAt,timeZone:existing.timeZone,title:existing.title,body});
  expect(Date.parse(entry.updatedAt)).toBeGreaterThan(Date.parse(existing.updatedAt));
  await expect(page.locator('.journal-updated time')).toHaveAttribute('datetime',entry.updatedAt);
  await expect(page.locator('.journal-paper .journal-date').first()).toContainText('October 20, 2026');
  await expect(page.locator('.journal-paper .journal-date').first()).toContainText('2:45');
  expect(await unrelated(page)).toEqual(before);
  await page.reload();await openJournal(page);
  expect(await memories(page)).toEqual([entry]);
  expect(await page.locator('.journal-entry-body').textContent()).toBe(body);
});

test('closing and leaving retain an unfinished page and recover its exact optional title after reload',async({page})=>{
  const before=await seed(page);
  await openJournal(page);await newPage(page);
  const body='  An open memory.\nStill mine to change 🌱  ';
  await page.getByLabel('A name for this memory',{exact:false}).fill('  Not quite named  ');
  await page.getByLabel('Your memory',{exact:true}).fill(body);
  const draft=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DRAFT_KEY);
  await page.getByRole('button',{name:'Close for now',exact:true}).click();
  await page.getByRole('button',{name:'Visit Hall of Beginnings',exact:true}).click();
  await openJournal(page);
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue(body);
  await expect(page.getByLabel('A name for this memory',{exact:false})).toHaveValue('  Not quite named  ');
  await page.reload();await openJournal(page);
  expect(await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DRAFT_KEY)).toEqual(draft);
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue(body);
  expect(await memories(page)).toEqual([]);
  expect(await unrelated(page)).toEqual(before);
});

test('failed journal writes retain an editable page and retry the same ID and recording timestamp',async({page})=>{
  await faults(page,{localWrite:true});
  const before=await seed(page);
  await openJournal(page);await newPage(page);
  await page.getByLabel('Your memory',{exact:true}).fill('A memory worth keeping.');
  const id=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!).id,DRAFT_KEY);
  await page.getByRole('button',{name:'Keep this memory',exact:false}).click();
  await expect(page.getByRole('button',{name:'Retry saving',exact:false})).toBeVisible();
  await expect(page.locator('.journal-paper .journal-warning')).toContainText('could not save it for your next visit');
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue('A memory worth keeping.');
  expect(await memories(page)).toEqual([]);
  const pending=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DRAFT_KEY);
  expect(pending.id).toBe(id);expect(pending.createdAt).not.toBeNull();
  await page.evaluate(()=>{window.journalFaults.localWrite=false;});
  await page.getByRole('button',{name:'Retry saving',exact:false}).click();
  await expect(page.locator('.journal-save-label')).toHaveText('Saved in this browser');
  expect(await memories(page)).toMatchObject([{id,createdAt:pending.createdAt,updatedAt:pending.modifiedAt,body:pending.body}]);
  expect(await unrelated(page)).toEqual(before);
  await page.reload();await openJournal(page);
  expect(await memories(page)).toHaveLength(1);
  await expect(page.locator('.journal-entry-body')).toHaveText(pending.body);
});

test('both storage failures preserve the current open words and honestly disclose reload limitations',async({page})=>{
  await faults(page,{localWrite:true,sessionWrite:true});
  const before=await seed(page);
  await openJournal(page);await newPage(page);
  await page.getByLabel('Your memory',{exact:true}).fill('Words that remain on this page for now.');
  await expect(page.getByRole('dialog')).toContainText('could not be saved for a reload');
  await page.getByRole('button',{name:'Keep this memory',exact:false}).click();
  await expect(page.getByRole('dialog')).toContainText('could not save it for your next visit');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Visit Pocket-Sky Observatory',exact:true}).click();
  await openJournal(page);
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue('Words that remain on this page for now.');
  expect(await memories(page)).toEqual([]);
  expect(await page.evaluate(key=>sessionStorage.getItem(key),DRAFT_KEY)).toBeNull();
  expect(await unrelated(page)).toEqual(before);
});

test('corrupt and future journal records stay untouched until an explicit readable-storage recheck',async({page})=>{
  const before=await seed(page,[existing]);
  const badKey=PREFIX+'00000000-0000-4000-8000-000000000074';
  const futureKey=PREFIX+'00000000-0000-4000-8000-000000000075';
  const future=JSON.stringify({...existing,id:'00000000-0000-4000-8000-000000000075',schemaVersion:99},null,2);
  await page.evaluate(({bad,futureKey,future})=>{localStorage.setItem(bad,'{unreadable');localStorage.setItem(futureKey,future);},{bad:badKey,futureKey,future});
  await page.reload();await openJournal(page);
  await expect(page.getByRole('dialog')).toContainText('stored pages have been left untouched');
  await page.getByRole('button',{name:'New memory',exact:false}).click();
  await page.getByLabel('Your memory',{exact:true}).fill('A temporary page beside the unreadable ones.');
  await page.getByRole('button',{name:'Keep this memory',exact:false}).click();
  await expect(page.getByRole('button',{name:'Retry saving',exact:false})).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),badKey)).toBe('{unreadable');
  expect(await page.evaluate(key=>localStorage.getItem(key),futureKey)).toBe(future);
  expect(await page.evaluate(key=>localStorage.getItem(key),PREFIX+existing.id)).toBe(JSON.stringify(existing,null,2));
  // Simulate the visitor resolving only the isolated test corruption outside the app.
  await page.evaluate(keys=>{for(const key of keys)localStorage.removeItem(key);},[badKey,futureKey]);
  await page.getByRole('button',{name:'Retry saving',exact:false}).click();
  expect(await memories(page)).toHaveLength(1);
  await page.getByRole('button',{name:'Check saved pages',exact:true}).click();
  await page.getByRole('button',{name:'Retry saving',exact:false}).click();
  await expect(page.locator('.journal-save-label')).toHaveText('Saved in this browser');
  expect(await memories(page)).toHaveLength(2);
  expect(await page.evaluate(key=>localStorage.getItem(key),PREFIX+existing.id)).toBe(JSON.stringify(existing,null,2));
  expect(await unrelated(page)).toEqual(before);
});

test('a recovered stale edit never overwrites a newer saved memory',async({page})=>{
  const before=await seed(page,[existing]);
  await openJournal(page);
  await page.getByRole('button',{name:'Edit this memory',exact:true}).click();
  await page.getByLabel('Your memory',{exact:true}).fill('My unfinished local revision.');
  await page.keyboard.press('Escape');
  const newer={...existing,body:'A newer saved version from elsewhere.',updatedAt:'2026-10-25T09:15:00.000Z'};
  const raw=JSON.stringify(newer,null,2);
  await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:PREFIX+ENTRY_ID,value:raw});
  await page.reload();await openJournal(page);
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue('My unfinished local revision.');
  await page.getByRole('button',{name:'Save changes',exact:false}).click();
  await expect(page.locator('.journal-paper .journal-warning')).toContainText('changed elsewhere');
  expect(await page.evaluate(key=>localStorage.getItem(key),PREFIX+ENTRY_ID)).toBe(raw);
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue('My unfinished local revision.');
  expect((await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)!),DRAFT_KEY)).body).toBe('My unfinished local revision.');
  expect(await unrelated(page)).toEqual(before);
});

test('optional names and validation keep raw input without inventing a memory title',async({page})=>{
  await seed(page);await openJournal(page);await newPage(page);
  const save=page.getByRole('button',{name:'Keep this memory',exact:false});
  await expect(save).toBeDisabled();
  await page.getByLabel('Your memory',{exact:true}).fill(' \n  ');
  await expect(save).toBeDisabled();
  await page.getByLabel('Your memory',{exact:true}).fill('An ordinary little moment.');
  await page.getByLabel('A name for this memory',{exact:false}).fill('x'.repeat(101));
  await expect(save).toBeDisabled();
  await expect(page.getByLabel('A name for this memory',{exact:false})).toHaveValue('x'.repeat(101));
  await page.getByLabel('A name for this memory',{exact:false}).fill('');
  await save.click();
  await expect(page.locator('.journal-entry-title')).toHaveText('An untitled memory');
  expect(await memories(page)).toMatchObject([{title:'',body:'An ordinary little moment.'}]);
});

test('narrow long pages remain usable and a seventh memory is reachable through the page index',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.emulateMedia({reducedMotion:'reduce'});
  const longTitle='A'.repeat(100), longBody='🌿'.repeat(5000);
  const entries=Array.from({length:7},(_,index)=>({...existing,id:`00000000-0000-4000-8000-${String(index+81).padStart(12,'0')}`,title:index===6?longTitle:`Memory ${index+1}`,body:index===6?longBody:`Little memory ${index+1}.`,createdAt:new Date(Date.parse(existing.createdAt)+index*1000).toISOString(),updatedAt:new Date(Date.parse(existing.createdAt)+index*1000).toISOString()}));
  const before=await seed(page,entries);await openJournal(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('.journal .dialog-content').evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
  await page.getByRole('button',{name:'Edit this memory',exact:true}).click();
  await page.getByLabel('Your memory',{exact:true}).fill(longBody+'x');
  await expect(page.getByRole('button',{name:'Save changes',exact:false})).toBeDisabled();
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue(longBody+'x');
  await page.getByLabel('Your memory',{exact:true}).fill(longBody);
  await page.setViewportSize({width:320,height:360});
  const save=page.getByRole('button',{name:'Save changes',exact:false});
  await save.scrollIntoViewIfNeeded();await expect(save).toBeInViewport();await save.click();
  await expect(page.locator('.journal-save-label')).toHaveText('Saved in this browser');
  expect(await page.locator('.journal-entry-body').textContent()).toBe(longBody);
  await page.setViewportSize({width:320,height:700});
  await page.getByRole('button',{name:'Browse memories (7)',exact:false}).click();
  await page.getByRole('button',{name:'Next memory pages',exact:true}).click();
  await expect(page.getByRole('navigation',{name:'Journal page browsing'})).toContainText('6–7 of 7');
  const oldest=page.getByRole('button',{name:'Read memory: Memory 1',exact:true});
  await tabTo(page,oldest);await page.keyboard.press('Enter');
  await expect(page.locator('.journal-entry-title')).toHaveText('Memory 1');
  await expect(page.locator('.journal-entry-body')).toHaveText('Little memory 1.');
  expect(await unrelated(page)).toEqual(before);
  expect((await memories(page))).toHaveLength(7);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  const journalButton=await page.getByRole('button',{name:'Open the memory journal',exact:true}).boundingBox();
  const cloudButton=await page.getByRole('button',{name:'Little rain cloud',exact:true}).boundingBox();
  expect(journalButton).not.toBeNull();expect(cloudButton).not.toBeNull();
  expect(journalButton!.y+journalButton!.height).toBeLessThanOrEqual(cloudButton!.y+1);
});


test('failed completed-draft cleanup cannot reintroduce a saved memory or reuse its ID for a new page',async({page})=>{
  await faults(page,{cleanup:true});
  await page.addInitScript(()=>{
    const allocate=crypto.randomUUID.bind(crypto);
    window.journalAllocatedIds=[];
    crypto.randomUUID=()=>{const id=allocate();window.journalAllocatedIds.push(id);return id;};
  });
  const before=await seed(page);
  await openJournal(page);await newPage(page);
  const body='A memory saved even though its open-page copy stays behind.';
  await page.getByLabel('Your memory',{exact:true}).fill(body);
  await page.getByRole('button',{name:'Keep this memory',exact:false}).click();
  await expect(page.locator('.journal-save-label')).toHaveText('Saved in this browser');
  await expect(page.getByRole('dialog')).toContainText('open-page copy could not be cleared');
  const [entry]=await memories(page);
  const raw=await page.evaluate(key=>localStorage.getItem(key),PREFIX+entry.id);
  const completed=await page.evaluate(key=>sessionStorage.getItem(key),DRAFT_KEY);
  expect(completed).not.toBeNull();
  expect(JSON.parse(completed!).id).toBe(entry.id);
  await page.reload();await openJournal(page);
  await expect(page.locator('.journal-entry-body')).toHaveText(body);
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'New memory',exact:false})).toBeVisible();
  expect(await page.evaluate(()=>window.journalAllocatedIds)).toEqual([]);
  expect(await memories(page)).toEqual([entry]);
  await page.getByRole('button',{name:'New memory',exact:false}).click();
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue('');
  await expect(page.getByLabel('A name for this memory',{exact:false})).toHaveValue('');
  const allocated=await page.evaluate(()=>window.journalAllocatedIds);
  expect(allocated).toHaveLength(1);expect(allocated[0]).not.toBe(entry.id);
  await expect(page.getByRole('button',{name:'Keep this memory',exact:false})).toBeDisabled();
  expect(await page.evaluate(key=>localStorage.getItem(key),PREFIX+entry.id)).toBe(raw);
  expect(await memories(page)).toHaveLength(1);
  // Cleanup denial still protects the completed stored copy rather than silently replacing it.
  expect(await page.evaluate(key=>sessionStorage.getItem(key),DRAFT_KEY)).toBe(completed);
  expect(await unrelated(page)).toEqual(before);
});
