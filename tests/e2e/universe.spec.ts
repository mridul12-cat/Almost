import { test, expect, type Page, type Locator } from '@playwright/test';
import type { Exhibit } from '../../src/model/types';
import type { UniverseMap } from '../../src/model/universe';

const KEY = 'almost:observatory:universe';
const PREFIX = 'almost:exhibit:';
const id = (index: number) => `00000000-0000-4000-8000-${String(index + 401).padStart(12, '0')}`;
const record = (index: number): Exhibit => ({ schemaVersion:1,id:id(index),title:`Beginning ${index + 1}`,description:'  A synthetic unfinished idea.\nMy exact words 🌿  ',artifactType:'book',lightOn:index % 2 === 0,createdAt:new Date(Date.parse('2026-10-24T00:00:00.000Z') + index * 1000).toISOString() });
const pair = (a: string, b: string) => { const [first, second] = [a, b].sort(); return { id:`${first}:${second}`,a:first,b:second }; };
declare global { interface Window { universeFaults: { skyWrite: boolean; exhibitWrite: boolean; skyReadbackOnce: boolean }; universeWrites: string[] } }
async function faults(page: Page) {
  await page.addInitScript(() => {
    window.universeFaults = {skyWrite:false,exhibitWrite:false,skyReadbackOnce:false};
    window.universeWrites = [];
    const original = Storage.prototype.setItem;
    const originalRead = Storage.prototype.getItem;
    const local = localStorage;
    let failNextSkyRead = false;
    Storage.prototype.getItem = function(key) {
      if (this === local && key === 'almost:observatory:universe' && failNextSkyRead) { failNextSkyRead = false; throw new DOMException('Synthetic acknowledgement failure','SecurityError'); }
      return originalRead.call(this,key);
    };
    Storage.prototype.setItem = function(key, value) {
      if (this === local && key === 'almost:observatory:universe') {
        window.universeWrites.push(value);
        if (window.universeFaults.skyWrite) throw new DOMException('Synthetic sky quota failure','QuotaExceededError');
      }
      if (this === local && key.startsWith('almost:exhibit:') && window.universeFaults.exhibitWrite) throw new DOMException('Synthetic exhibit quota failure','QuotaExceededError');
      original.call(this,key,value);
      if (this === local && key === 'almost:observatory:universe' && window.universeFaults.skyReadbackOnce) { window.universeFaults.skyReadbackOnce = false; failNextSkyRead = true; }
    };
  });
}
async function seed(page: Page, count = 5, sky?: UniverseMap | string) {
  await page.goto('/');
  await page.evaluate(({records,key,raw}) => {
    for (const item of records) localStorage.setItem('almost:exhibit:'+item.id,JSON.stringify(item,null,2));
    localStorage.setItem('almost:journal:entry:unrelated-fixture','Untouched journal namespace bytes.');
    if (raw !== undefined) localStorage.setItem(key,raw);
  },{records:Array.from({length:count},(_,index)=>record(index)),key:KEY,raw:typeof sky === 'string' ? sky : sky && JSON.stringify(sky,null,2)});
  await page.reload();
  return protectedBytes(page);
}
async function protectedBytes(page: Page) {
  return page.evaluate(() => Object.keys(localStorage).filter(key => key !== 'almost:observatory:universe').sort().map(key=>[key,localStorage.getItem(key)]));
}
async function skyBytes(page: Page) { return page.evaluate(key=>localStorage.getItem(key),KEY); }
async function storedSky(page: Page): Promise<UniverseMap> { return JSON.parse((await skyBytes(page))!); }
async function observatory(page: Page) {
  await page.getByRole('button',{name:'Visit Pocket-Sky Observatory',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Every beginning becomes a star.',exact:true})).toBeVisible();
}
function star(page: Page, index: number) { return page.getByRole('button',{name:`Star: Beginning ${index+1}`,exact:true}); }
async function connect(page: Page, a: number, b: number) {
  await star(page,a).click();
  await page.getByRole('button',{name:'Connect to another star',exact:true}).click();
  await star(page,b).click();
  await page.getByRole('button',{name:'Tie a golden thread',exact:true}).click();
}
async function keepName(page: Page, value: string) {
  await page.getByLabel('Name this constellation',{exact:false}).fill(value);
  await page.getByRole('button',{name:'Keep constellation name',exact:true}).click();
}
async function create(page: Page, title: string) {
  await page.getByRole('button',{name:/^(Create your first star|\+ Add an Exhibit|Create your first exhibit)/}).click();
  await page.getByLabel('Something you never quite finished').fill('A real UI beginning. Exact words ✨');
  await page.getByRole('dialog').getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByLabel('Exhibit title',{exact:true}).fill(title);
  await page.getByRole('dialog').getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('radio',{name:'Book',exact:true}).check();
  await page.getByRole('button',{name:'Preview its place',exact:true}).click();
  await page.getByRole('button',{name:'Place in Museum',exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:title,exact:true})).toBeVisible();
}
async function tabTo(page: Page, target: Locator) {
  for (let index=0;index<130;index++) {
    if (await target.evaluate(element=>document.activeElement===element)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

test('real Main Hall creation becomes a star and exploring or connecting never changes exhibit lights',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const external: string[]=[];
  page.on('request',request=>{if (/^https?:/.test(request.url()) && new URL(request.url()).hostname!=='127.0.0.1') external.push(request.url());});
  await page.goto('/');
  await observatory(page);
  await expect(page.locator('.exhibit-star')).toHaveCount(0);
  await expect(page.locator('.empty-sky')).toContainText('waiting for your first beginning');
  const title='  A paper moon & a beginning ✨  ';
  await create(page,title.trim());
  await expect(page.getByRole('checkbox',{name:'Light off',exact:true})).not.toBeChecked();
  await page.getByRole('button',{name:'Close panel',exact:true}).click();
  await observatory(page);
  const first=page.getByRole('button',{name:`Star: ${title.trim()}`,exact:true});
  await first.click();
  await expect(page.locator('.selected-star-title')).toHaveText(title.trim());
  await expect(page.getByRole('button',{name:'Connect to another star',exact:true})).toBeDisabled();
  const position=await first.getAttribute('style');
  await page.getByRole('button',{name:'Visit Hall of Beginnings',exact:true}).click();
  await create(page,'A second real beginning');
  await page.getByRole('button',{name:'Close panel',exact:true}).click();
  const before=await protectedBytes(page);
  await observatory(page);
  await expect(page.locator('.exhibit-star')).toHaveCount(2);
  expect(await first.getAttribute('style')).toBe(position);
  await first.click();
  await page.getByRole('button',{name:'Connect to another star',exact:true}).click();
  await page.getByRole('button',{name:'Star: A second real beginning',exact:true}).click();
  expect(await skyBytes(page)).toBeNull();
  await page.getByRole('button',{name:'Tie a golden thread',exact:true}).evaluate(button=>{(button as HTMLButtonElement).click();(button as HTMLButtonElement).click();});
  expect((await storedSky(page)).edges).toHaveLength(1);
  expect(await protectedBytes(page)).toEqual(before);
  await page.getByRole('button',{name:'Connect to another star',exact:true}).click();
  await first.click();
  await expect(page.getByRole('button',{name:'Tie a golden thread',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Cancel connection',exact:true}).click();
  await page.reload();
  await observatory(page);
  await expect(page.locator('.exhibit-star')).toHaveCount(2);
  expect((await storedSky(page)).edges).toHaveLength(1);
  expect(await protectedBytes(page)).toEqual(before);
  expect(external).toEqual([]);
});

test('separate named groups merge without discarding words and untied stars stay visible',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const before=await seed(page);
  await observatory(page);
  await star(page,0).click();
  await star(page,1).click();
  expect(await skyBytes(page)).toBeNull();
  await connect(page,0,1);
  const literal='  The Things <script>Almost</script> 🌿  ';
  await keepName(page,literal);
  await connect(page,2,3);
  await keepName(page,'Little Universes');
  await expect(page.getByRole('navigation',{name:'Your constellations'}).getByRole('button')).toHaveCount(2);
  await star(page,0).click();
  await page.getByLabel('Name this constellation',{exact:false}).fill('A name still taking shape ✨');
  await page.getByRole('button',{name:'Visit Moonseed Conservatory',exact:true}).click();
  await observatory(page);
  await star(page,1).click();
  await expect(page.getByLabel('Name this constellation',{exact:false})).toHaveValue('A name still taking shape ✨');
  await connect(page,1,2);
  await expect(page.locator('.constellation-name-panel')).toContainText('This joined constellation keeps both names.');
  expect((await storedSky(page)).names.map(name=>name.text)).toEqual([literal,'Little Universes']);
  await page.getByLabel('Name this constellation',{exact:false}).fill('🌟'.repeat(101));
  await expect(page.getByRole('button',{name:'Keep constellation name',exact:true})).toBeDisabled();
  expect(await page.getByLabel('Name this constellation',{exact:false}).inputValue()).toBe('🌟'.repeat(101));
  await keepName(page,'  A universe of my own ✨  ');
  expect((await storedSky(page)).names.map(name=>name.text)).toEqual(['  A universe of my own ✨  ']);
  await page.locator('.thread-index summary').click();
  await page.getByRole('button',{name:'Untie thread: Beginning 2 and Beginning 3',exact:true}).click();
  await expect(page.locator('.exhibit-star')).toHaveCount(5);
  await expect(page.getByRole('navigation',{name:'Your constellations'}).getByRole('button')).toHaveCount(2);
  expect((await storedSky(page)).edges).toHaveLength(2);
  expect(await protectedBytes(page)).toEqual(before);
});

test('failed writes retain latest threads and exact names across room visits before same-map retry',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await faults(page);
  const before=await seed(page,3);
  await page.evaluate(()=>{window.universeFaults.skyWrite=true;});
  await observatory(page);
  await connect(page,0,1);
  await expect(page.locator('.sky-warning')).toContainText('may disappear after a reload');
  const name='  A name kept here for now 🌿  ';
  await keepName(page,name);
  await page.getByRole('button',{name:'Visit Hall of Beginnings',exact:true}).click();
  await observatory(page);
  await star(page,0).click();
  await expect(page.getByLabel('Name this constellation',{exact:false})).toHaveValue(name);
  expect(await skyBytes(page)).toBeNull();
  await connect(page,1,2);
  await page.evaluate(()=>{window.universeFaults.skyWrite=false;});
  await page.getByRole('button',{name:'Retry saving sky',exact:true}).click();
  await expect(page.locator('.sky-save-state')).toHaveText('Your sky is saved in this browser.');
  expect((await storedSky(page)).edges).toHaveLength(2);
  expect((await storedSky(page)).names.map(item=>item.text)).toEqual([name]);
  expect(await protectedBytes(page)).toEqual(before);
  await page.reload();
  await observatory(page);
  await star(page,0).click();
  await expect(page.getByLabel('Name this constellation',{exact:false})).toHaveValue(name);
  await page.evaluate(()=>{window.universeFaults.skyReadbackOnce=true;});
  await keepName(page,'A write whose acknowledgement was lost');
  await expect(page.locator('.sky-warning')).toContainText('could not save its latest changes');
  expect((await storedSky(page)).names[0].text).toBe('A write whose acknowledgement was lost');
  await page.evaluate(()=>{window.universeFaults.skyWrite=true;});
  const latest='  Newer words after the uncertain write ✨  ';
  await keepName(page,latest);
  await expect(page.locator('.sky-warning')).not.toContainText('changed elsewhere');
  await page.evaluate(()=>{window.universeFaults.skyWrite=false;});
  await page.getByRole('button',{name:'Retry saving sky',exact:true}).click();
  expect((await storedSky(page)).names[0].text).toBe(latest);
  expect((await storedSky(page)).edges).toHaveLength(2);
  expect(await protectedBytes(page)).toEqual(before);
});

test('corrupt and unsupported skies stay untouched until external resolution and explicit recheck',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await faults(page);
  for(const raw of ['{ a sky that cannot be parsed',JSON.stringify({schemaVersion:99,edges:[],names:[]})]) {
    const before=await seed(page,2,raw);
    await observatory(page);
    await expect(page.locator('.sky-warning')).toContainText('stored threads and names have been left untouched');
    await connect(page,0,1);
    await keepName(page,'A temporary constellation');
    await page.getByRole('button',{name:'Retry saving sky',exact:true}).click();
    await page.getByRole('button',{name:'Check saved sky',exact:true}).click();
    expect(await skyBytes(page)).toBe(raw);
    expect(await page.evaluate(()=>window.universeWrites)).toEqual([]);
    expect(await protectedBytes(page)).toEqual(before);
    await expect(page.locator('.exhibit-star')).toHaveCount(2);
    // External resolution is explicit test setup; the application never deletes a sky.
    await page.evaluate(key=>localStorage.removeItem(key),KEY);
    await page.getByRole('button',{name:'Check saved sky',exact:true}).click();
    await expect(page.getByRole('button',{name:'Retry saving sky',exact:true})).toBeVisible();
    expect(await skyBytes(page)).toBeNull();
    await page.getByRole('button',{name:'Retry saving sky',exact:true}).click();
    expect((await storedSky(page)).edges).toHaveLength(1);
    expect((await storedSky(page)).names[0].text).toBe('A temporary constellation');
    expect(await protectedBytes(page)).toEqual(before);
  }
});

test('a stale saved sky is never overwritten by local naming or read-only recheck',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const old: UniverseMap={schemaVersion:1,edges:[pair(id(0),id(1))],names:[{anchorId:id(0),text:'An earlier sky'}]};
  const before=await seed(page,4,old);
  await observatory(page);
  await star(page,0).click();
  const elsewhere: UniverseMap={schemaVersion:1,edges:[...old.edges,pair(id(2),id(3))],names:[{anchorId:id(0),text:'New words from another tab'}]};
  const raw=JSON.stringify(elsewhere,null,3);
  await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:KEY,value:raw});
  await keepName(page,'My open naming choice');
  await expect(page.locator('.sky-warning')).toContainText('changed elsewhere');
  await page.getByRole('button',{name:'Check saved sky',exact:true}).click();
  await expect(page.locator('.sky-warning')).toContainText('will not overwrite the saved version');
  await expect(page.getByLabel('Name this constellation',{exact:false})).toHaveValue('My open naming choice');
  expect(await skyBytes(page)).toBe(raw);
  expect(await protectedBytes(page)).toEqual(before);
  await page.reload();
  await observatory(page);
  await star(page,0).click();
  await expect(page.getByLabel('Name this constellation',{exact:false})).toHaveValue('New words from another tab');
  await expect(page.getByRole('navigation',{name:'Your constellations'}).getByRole('button')).toHaveCount(2);
});

test('keyboard, reduced motion and responsive browsing keep a 24-star sky accessible',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const before=await seed(page,24);
  await observatory(page);
  for(const viewport of [{width:320,height:700},{width:390,height:844},{width:768,height:1024},{width:1440,height:900},{width:1920,height:1080}]) {
    await page.setViewportSize(viewport);
    const geometry=await page.locator('.observatory-universe').evaluate(root=>{
      const buttons=[...root.querySelectorAll('.exhibit-star')].map(element=>element.getBoundingClientRect());
      const overlap=(a:DOMRect,b:DOMRect)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
      return {overflow:document.documentElement.scrollWidth>innerWidth,smallTargets:buttons.some(rect=>rect.width<44||rect.height<44),overlap:buttons.some((rect,index)=>buttons.slice(index+1).some(other=>overlap(rect,other)))};
    });
    expect(geometry,`Star map at ${viewport.width}×${viewport.height}`).toEqual({overflow:false,smallTargets:false,overlap:false});
  }
  await tabTo(page,star(page,0));
  await page.keyboard.press('Enter');
  await expect(page.locator('.selected-star-title')).toHaveText('Beginning 1');
  await tabTo(page,page.getByRole('button',{name:'Connect to another star',exact:true}));
  await page.keyboard.press('Enter');
  await tabTo(page,star(page,1));
  await page.keyboard.press('Space');
  await tabTo(page,page.getByRole('button',{name:'Tie a golden thread',exact:true}));
  await page.keyboard.press('Enter');
  expect((await storedSky(page)).edges).toHaveLength(1);
  const moving=await page.locator('.observatory-universe *').evaluateAll(elements=>elements.flatMap(element=>element.getAnimations()).filter(animation=>animation.playState==='running').length);
  expect(moving).toBe(0);
  await page.locator('.star-index summary').click();
  await page.getByRole('button',{name:'Find star: Beginning 24',exact:true}).click();
  await expect(page.locator('.selected-star-title')).toHaveText('Beginning 24');
  expect(await protectedBytes(page)).toEqual(before);
});

test('temporary exhibit stars can connect without falsely claiming a persistent sky',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await faults(page);
  const before=await seed(page,1);
  await page.evaluate(()=>{window.universeFaults.exhibitWrite=true;});
  await create(page,'A temporary beginning');
  await expect(page.getByRole('dialog')).toContainText('Temporary');
  await page.getByRole('button',{name:'Close panel',exact:true}).click();
  await observatory(page);
  await star(page,0).click();
  await page.getByRole('button',{name:'Connect to another star',exact:true}).click();
  await page.getByRole('button',{name:'Star: A temporary beginning',exact:true}).click();
  await page.getByRole('button',{name:'Tie a golden thread',exact:true}).click();
  await expect(page.locator('.sky-warning')).toContainText('exhibit that is not saved yet');
  expect(await skyBytes(page)).toBeNull();
  expect(await page.evaluate(()=>window.universeWrites)).toEqual([]);
  expect(await protectedBytes(page)).toEqual(before);
  await page.getByRole('button',{name:'Visit Hall of Beginnings',exact:true}).click();
  await observatory(page);
  await expect(page.locator('.exhibit-star')).toHaveCount(2);
  await expect(page.getByRole('navigation',{name:'Your constellations'}).getByRole('button')).toHaveCount(1);
});

test('dormant threads and names survive unavailable exhibit stars without automatic cleanup',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const sky: UniverseMap={schemaVersion:1,edges:[pair(id(0),id(8))],names:[{anchorId:id(8),text:'A name waiting with its star'}]};
  const before=await seed(page,2,sky);
  const original=await skyBytes(page);
  await observatory(page);
  await expect(page.locator('.exhibit-star')).toHaveCount(2);
  await expect(page.locator('.sky-missing')).toContainText('left untouched');
  expect(await skyBytes(page)).toBe(original);
  await page.evaluate(item=>localStorage.setItem('almost:exhibit:'+item.id,JSON.stringify(item)),record(8));
  await page.reload();
  await observatory(page);
  await expect(page.locator('.exhibit-star')).toHaveCount(3);
  await star(page,8).click();
  await expect(page.getByLabel('Name this constellation',{exact:false})).toHaveValue('A name waiting with its star');
  expect(await skyBytes(page)).toBe(original);
  const after=await protectedBytes(page);
  expect(after.filter(([key])=>key!==PREFIX+id(8))).toEqual(before);
});
