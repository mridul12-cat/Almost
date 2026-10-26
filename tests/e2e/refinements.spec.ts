import { test, expect, type Page, type Locator } from '@playwright/test';

const entryId = '00000000-0000-4000-8000-000000000091';
const memory = {schemaVersion:1,id:entryId,title:'A little summer memory',body:'  The first paper boat.\nExactly these words 🌿  ',createdAt:'2026-10-20T09:15:12.000Z',updatedAt:'2026-10-20T09:15:12.000Z',timeZone:'Asia/Kolkata'};
async function visit(page: Page, name: string) {
  await page.getByRole('navigation',{name:'Museum rooms'}).getByRole('button',{name:`Visit ${name}`,exact:true}).click();
  await expect(page.locator('#museum-room-title')).toBeFocused();
}
async function seedCollection(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    for(let i=0;i<7;i++) {
      const id=`00000000-0000-4000-8000-${String(i+101).padStart(12,'0')}`;
      localStorage.setItem('almost:exhibit:'+id,JSON.stringify({schemaVersion:1,id,title:`A beginning ${i+1}`,description:'A synthetic exhibit for layout verification.',artifactType:['book','spaceship','plant','music-box','canvas','book','plant'][i],lightOn:i%2===0,createdAt:new Date(Date.parse('2026-10-20T09:15:00.000Z')+i*1000).toISOString()}));
    }
  });
  await page.reload();
}
async function tabTo(page: Page, target: Locator) {
  for(let i=0;i<60;i++) {
    if(await target.evaluate(element=>document.activeElement===element)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

test('hall keeps creation and exhibits clear of discoveries and browsing controls in eight layouts',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await seedCollection(page);
  for(const viewport of [{width:320,height:700},{width:390,height:844},{width:600,height:900},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:1920,height:900},{width:1920,height:1080}]) {
    await page.setViewportSize(viewport);
    const geometry=await page.evaluate(()=>{
      const rect=(selector:string)=>document.querySelector(selector)!.getBoundingClientRect();
      const overlap=(a:DOMRect,b:DOMRect)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
      const visible=(element:Element)=>getComputedStyle(element).display!=='none'&&element.getBoundingClientRect().width>0;
      const tags=[...document.querySelectorAll('.exhibit-position.on-page .keepsake-tag')].filter(visible).map(element=>element.getBoundingClientRect());
      const discoveries=[...document.querySelectorAll('.museum-hall .room-object,.museum-hall .pip-greeting')].map(element=>element.getBoundingClientRect());
      const controls=[...document.querySelectorAll('.museum-hall .desktop-browse,.museum-hall .mobile-browse')].filter(visible).map(element=>element.getBoundingClientRect());
      const desk=rect('.writing-desk');
      return {overflow:document.documentElement.scrollWidth>innerWidth,deskCollisions:discoveries.filter(item=>overlap(item,desk)).length,discoveryCollisions:discoveries.filter((item,index)=>discoveries.slice(index+1).some(other=>overlap(item,other))).length,discoveryControlCollisions:discoveries.filter(item=>controls.some(control=>overlap(item,control))).length,controlsClipped:controls.some(control=>control.bottom>rect('.museum-hall').bottom),tagControlCollisions:tags.filter(tag=>controls.some(control=>overlap(tag,control))).length,mobileCoreFirst:innerWidth>=600||discoveries.every(item=>item.top>rect('.collection-stage').top&&item.top>desk.bottom)};
    });
    expect(geometry,`Hall at ${viewport.width}×${viewport.height}`).toEqual({overflow:false,deskCollisions:0,discoveryCollisions:0,discoveryControlCollisions:0,controlsClipped:false,tagControlCollisions:0,mobileCoreFirst:true});
  }
});

test('clickable room objects have visible keyboard focus, brass labels and hover feedback',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const names=['Look through the twilight window','Ask Pip for a little thought','Desk lamp','Ring the museum bell','Open the guestbook','Read the curator’s note','Read the empty pedestal inscription'];
  for(const name of names) {
    const button=page.getByRole('button',{name,exact:true});
    await tabTo(page,button);
    await expect(button).toBeFocused();
    expect(await button.evaluate(element=>{const style=getComputedStyle(element);return {visible:element.matches(':focus-visible'),outline:style.outlineStyle,width:style.outlineWidth};})).toEqual({visible:true,outline:'solid',width:'3px'});
    expect(await button.locator('.object-label').evaluate(element=>getComputedStyle(element,'::after').content)).toBe('""');
  }
  const bell=page.getByRole('button',{name:'Ring the museum bell',exact:true});
  await bell.hover();
  expect(await bell.evaluate(element=>getComputedStyle(element).filter)).toBe('brightness(1.06)');
  await visit(page,'Moonseed Conservatory');
  for(const name of ['Open the memory journal','Little rain cloud','Paper flower','Open the seed drawer']) {
    const button=page.getByRole('button',{name,exact:true});
    await tabTo(page,button);
    expect(await button.evaluate(element=>element.matches(':focus-visible')&&getComputedStyle(element).outlineWidth==='3px')).toBe(true);
  }
  await visit(page,'Pocket-Sky Observatory');
  for(const name of ['Look through the telescope','Turn the constellation wheel','Wake the clockwork comet']) {
    const button=page.getByRole('button',{name,exact:true});
    await tabTo(page,button);
    expect(await button.evaluate(element=>element.matches(':focus-visible')&&getComputedStyle(element).outlineWidth==='3px')).toBe(true);
  }
});

test('room introductions stay connected to focused headings and transitions respect reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  await expect(page.locator('#museum-room-title')).toHaveAccessibleDescription('A museum for your unfinished ideas. Give something you once started a place to exist.');
  for(const [name,description] of [['Moonseed Conservatory','Not every seed needs a season. Some beginnings are beautiful company.'],['Pocket-Sky Observatory','A journey can matter before its first step. There is a little sky for that here.'],['Hall of Beginnings','A museum for your unfinished ideas. Give something you once started a place to exist.']]) {
    await visit(page,name);
    await expect(page.locator('#museum-room-title')).toHaveAccessibleDescription(description);
    expect(await page.locator(name==='Hall of Beginnings'?'.museum-hall':'.story-room').evaluate(element=>getComputedStyle(element).animationName)).toContain('room-arrival');
    await expect(page.getByRole('navigation',{name:'Museum rooms'}).locator('[aria-current="page"]')).toHaveAccessibleName(`Visit ${name}`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const name of ['Pocket-Sky Observatory','Moonseed Conservatory','Hall of Beginnings']) {
    await visit(page,name);
    const motion=await page.locator('#museum .museum-hall,#museum .story-room,#museum .room-introduction').evaluateAll(elements=>elements.flatMap(element=>element.getAnimations()).filter(animation=>animation.playState==='running').length);
    expect(motion).toBe(0);
  }
  await expect(page.getByRole('button',{name:'Create your first exhibit',exact:true})).toBeEnabled();
});

test('optional journal purpose keeps dated memories and open words intact across rooms',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const original=JSON.stringify(memory,null,2);
  await page.evaluate(({id,value})=>localStorage.setItem('almost:journal:entry:'+id,value),{id:entryId,value:original});
  await page.reload();
  await visit(page,'Moonseed Conservatory');
  await expect(page.getByRole('button',{name:'Open the memory journal',exact:true})).toContainText('An optional little keepsake');
  await page.getByRole('button',{name:'Open the memory journal',exact:true}).click();
  await expect(page.locator('.journal-purpose')).toHaveText('A place for memories that don’t need a pedestal.');
  await expect(page.locator('.journal-entry-body')).toHaveText(memory.body);
  await expect(page.locator('.journal-paper time')).toHaveAttribute('datetime',memory.createdAt);
  await page.getByRole('button',{name:'New memory',exact:false}).click();
  const words='  A memory still unfolding.\nOnly my own words ✨  ';
  await page.getByLabel('Your memory',{exact:true}).fill(words);
  const draft=await page.evaluate(()=>sessionStorage.getItem('almost:journal:draft'));
  await page.keyboard.press('Escape');
  await visit(page,'Pocket-Sky Observatory');
  await expect(page.getByRole('button',{name:'Open the memory journal',exact:true})).toHaveCount(0);
  await visit(page,'Hall of Beginnings');
  await expect(page.getByRole('button',{name:'Create your first exhibit',exact:true})).toBeEnabled();
  await visit(page,'Moonseed Conservatory');
  await page.getByRole('button',{name:'Open the memory journal',exact:true}).click();
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue(words);
  expect(await page.evaluate(id=>localStorage.getItem('almost:journal:entry:'+id),entryId)).toBe(original);
  expect(await page.evaluate(()=>sessionStorage.getItem('almost:journal:draft'))).toBe(draft);
  await page.reload();
  await visit(page,'Moonseed Conservatory');
  await page.getByRole('button',{name:'Open the memory journal',exact:true}).click();
  await expect(page.getByLabel('Your memory',{exact:true})).toHaveValue(words);
});
