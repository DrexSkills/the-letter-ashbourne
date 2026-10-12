// The Letter — the opening scene: the night of the fire in 2006, then twenty years later, the train arrives.
'use strict';

const CINE = { active:false, t:0, actors:[], lights:[], fire:0, flames:[], smoke:[], trainY:0, showPlayer:false, cam:{x:0,y:0}, done:null, events:[], cap:'' };

// villagers of 2006 (plain townsfolk, nobody you'll recognise yet)
const V = (top,pants,hair,style,skin) => ({ name:'', skin:skin||'#d9a27e', skin2:shade(skin||'#d9a27e',.84), hair, style, top, top2:shade(top,.74), pants, pants2:shade(pants,.78), pitch:260 });
const SHADOW = { name:'', skin:'#3a3438', skin2:'#2a2528', hair:'#141216', style:'short', hat:{c:'#141216',s:'brim'}, top:'#1c1a20', top2:'#141216', pants:'#141216', pants2:'#0c0b0e', pitch:120 };

// an actor walks between timed points: path = [[time, tileX, tileY], ...]
function actor(c, path, opts={}){ return { c, path, x:path[0][1]*T+8, y:path[0][2]*T+12, dir:opts.dir||'down', moving:false, lantern:!!opts.lantern, from:opts.from??-1, to:opts.to??999, anim:0, said:{} }; }

function startPrologue(done){
  CINE.active=true; CINE.t=0; CINE.done=done; CINE.fire=0; CINE.flames=[]; CINE.smoke=[]; CINE.trainY=-560; CINE.showPlayer=false; CINE.cap='';
  todInit(); S0.tod=23.2; ATM.rain=0; ATM.rainTarget=0;
  const tom = { ...CH.tom, beard:undefined, hair:'#6a5a4a' };          // Tom, twenty years younger
  const eli = { ...CH.elias, hair:'#2a2430', beard:undefined };          // Elias before the grey
  CINE.actors = [
    actor(V('#7a3a32','#3a3a44','#4a2c1c','short'),          [[7,70,30],[11,80,30],[13,82,27]], {from:7, dir:'right'}),
    actor(V('#3e5a4a','#2a2a33','#17141a','long','#c98f6b'), [[8,68,31],[12.5,79,31],[14,81,29]], {from:8, dir:'right'}),
    actor(V('#5a4a42','#3a4a6b','#b8b2aa','bald','#e2b896'), [[9.5,69,30],[14,80,29],[15.5,80,27]], {from:9.5, dir:'right'}),
    actor(V('#8a6a3a','#2f3446','#8a4a22','bun','#a86b4f'),   [[10,70,31],[14.5,83,31],[16,84,28]], {from:10, dir:'right'}),
    actor(SHADOW, [[9,84,18],[12,82,16],[16,81,8]], {from:9, to:16, dir:'up'}),                 // someone slipping away along the tracks…
    actor(tom, [[18,79,31],[21,83,28],[24,84,26],[25.5,84,26]], {from:18, dir:'right'}),
    actor(eli, [[19,88,36],[22,86,28],[23.6,86,25.2],[24.6,86,25.2],[25.6,85.5,26.4],[30,85.5,26.6],[31,84,28],[34,76,30.5],[38,58,30.5],[43,31,29],[45.5,30,25]], {from:19, to:46, dir:'up', lantern:true}),
  ];
  CINE.events = [
    [3,  () => { CINE.cap='Ashbourne. The night of 14 June, 2006.'; }],
    [5.5,() => { CINE.fire=.35; crackle(); }],
    [7,  () => { CINE.cap=''; }],
    [8.5,() => { CINE.fire=1; }],
    [11.2,() => say(0, 'FIRE! The railway office!')],
    [13.4,() => say(1, 'Get water from the river!')],
    [15.2,() => say(2, 'Is anyone inside?!')],
    [16.8,() => say(3, 'Mara! Mara’s still in there!')],
    [21.2,() => say(6, 'MARA!')],
    [23.4,() => { say(5, 'Elias, NO! The roof!'); }],
    [24.8,() => { CINE.fire=1.6; C.shake=.6; sfxClunk(); burst(86*T,20*T,70,['#ffcf6a','#e8763a','#8a8494']); }],
    [27,  () => say(2, 'It was him… Vale was in there!')],
    [28.6,() => say(0, 'Vale did this!')],
    [30,  () => say(5, 'Elias — run!')],
    [33,  () => { CINE.cap='That night, Elias Vale vanished into Ashwood forest.'; }],
    [44.5,() => { CINE.cap=''; fadeTo(true); }],
    [45.6,() => { bigCap('Twenty years later…'); S0.tod=10; CINE.fire=0; CINE.flames=[]; CINE.smoke=[]; CINE.actors=[]; P.x=86*T+8; P.y=30*T+10; }],
    [48.5,() => { bigCap(''); fadeTo(false); sfxWhistle(); }],
    [53.2,() => { CINE.showPlayer=true; P.dir='left'; }],
    [55.5,() => endPrologue()],
  ];
  document.body.classList.add('cine'); mode='cine';
  CINE.cam={x:47*T, y:28*T};
}
function say(i, text){ const a=CINE.actors[i]; if (a) npcSay(a, text, i===5||i===6 ? '#ff9a8a' : undefined); }
function bigCap(t){ const el=$('#cineBig'); el.textContent=t; el.classList.toggle('on', !!t); }
function fadeTo(dark){ $('#fade').classList.toggle('on', dark); }
let crackleT=0;
function crackle(){ /* fire sound is driven from updatePrologue */ }

function camTarget(t){
  // where the camera looks at each moment of the scene
  if (t<6)  return [47+t*5.5, 29];
  if (t<20) return [82, 26];
  if (t<31) return [84, 26];
  if (t<44) { const e=CINE.actors[6]; return e ? [e.x/T, e.y/T] : [60,30]; }
  return [86, 28];
}
function updatePrologue(dt){
  if (!CINE.active) return;
  const prev=CINE.t; CINE.t+=dt; const t=CINE.t;
  for (const [at,fn] of CINE.events) if (prev<at && t>=at) fn();
  // actors move along their timed paths
  for (const a of CINE.actors){
    const p=a.path; let x=p[0][1], y=p[0][2], moving=false;
    for (let i=0;i<p.length-1;i++){ const [t0,x0,y0]=p[i], [t1,x1,y1]=p[i+1];
      if (t>=t0 && t<=t1){ const k=(t-t0)/(t1-t0); x=x0+(x1-x0)*k; y=y0+(y1-y0)*k; moving = Math.hypot(x1-x0,y1-y0)>.05; if (moving) a.dir = Math.abs(x1-x0)>Math.abs(y1-y0) ? (x1>x0?'right':'left') : (y1>y0?'down':'up'); break; }
      if (t>t1){ x=x1; y=y1; } }
    a.x=x*T+8; a.y=y*T+12; a.moving=moving; if (moving) a.anim+=dt*8;
  }
  // after the roof falls, everyone turns to stare at Elias
  if (t>26 && t<31) for (let i=0;i<4;i++){ const a=CINE.actors[i]; if (a) a.dir = 'right'; }
  // the fire: flames, smoke and embers rising from the railway office
  const f=CINE.fire;
  if (f>0 && !reduceMotion){
    for (let i=0;i<Math.floor(f*7);i++){ const roof=Math.random()<.65;
      CINE.flames.push({ x:(83.3+Math.random()*6.4)*T, y: roof ? (19.1+Math.random()*.6)*T : (20.9+Math.random()*.5)*T + 0, vx:(Math.random()-.5)*10, vy:-(roof?26:16)-Math.random()*34*f, life:.55+Math.random()*.55, t:0, s:2+Math.floor(Math.random()*2) }); }
    if (Math.random()<f*.9) CINE.smoke.push({ x:(84+Math.random()*5)*T, y:18.6*T, vx:5+Math.random()*9, vy:-14-Math.random()*10, life:3.5+Math.random()*2, t:0, r:5+Math.random()*4 });
    crackleT-=dt; if (crackleT<=0){ crackleT=.08+Math.random()*.2; sfxNoise(.05,'bandpass',900+Math.random()*1800,2,.03*Math.min(1,f)); }
  }
  for (const p of CINE.flames){ p.t+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; }
  CINE.flames=CINE.flames.filter(p=>p.t<p.life);
  for (const p of CINE.smoke){ p.t+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.r+=dt*4; }
  CINE.smoke=CINE.smoke.filter(p=>p.t<p.life);
  // twenty years later: the train pulls in, letting off steam
  if (t>48.5){ const k=Math.min(1,(t-48.5)/3.4); CINE.trainY = -420*Math.pow(1-k,3); if (!reduceMotion && Math.random()<dt*6) smoke.push({x:91.5*T, y:15*T+CINE.trainY, life:0, max:2.5, vx:-6+Math.random()*4, big:true}); }
  // lights: the fire glow and Elias's lantern
  CINE.lights=[]; if (f>0) CINE.lights.push([86*T, 21*T, 120+f*50+Math.sin(t*13)*8]);
  const e=CINE.actors[6]; if (e && t>=19 && t<46) CINE.lights.push([e.x, e.y-10, 60]);
  // caption and camera
  const cap=$('#cineCap'); if (cap.textContent!==CINE.cap){ cap.textContent=CINE.cap; cap.classList.toggle('on', !!CINE.cap); }
  const [tx,ty]=camTarget(t); CINE.cam.x += (tx*T - CINE.cam.x)*Math.min(1,dt*2.2); CINE.cam.y += (ty*T - CINE.cam.y)*Math.min(1,dt*2.2);
}
function pushCineItems(items, cx, cy){
  for (const a of CINE.actors){ if (CINE.t<a.from || CINE.t>a.to) continue; const x=a.x-cx, y=a.y-cy, fr = a.moving ? [0,1,0,3][Math.floor(a.anim)%4] : 0;
    items.push({k:a.y, d:()=>drawCharAt(ctx, x, y, a.dir, fr, a.c, a.lantern)}); }
}
function drawCineFX(cx,cy){
  if (!CINE.active) return;
  // scorched, smoking building
  if (CINE.fire>0){ ctx.fillStyle=`rgba(25,10,8,${.35*Math.min(1,CINE.fire)})`; ctx.fillRect(83*T-cx, 19*T-cy, 7*T, 5*T); }
  for (const p of CINE.smoke){ const k=p.t/p.life, r=Math.round(p.r); ctx.fillStyle=`rgba(32,28,36,${.55*(1-k)})`; ctx.beginPath(); ctx.arc(Math.round(p.x-cx), Math.round(p.y-cy), r, 0, Math.PI*2); ctx.fill(); }
  ctx.globalCompositeOperation='lighter';
  if (CINE.fire>0){ const gx=86*T-cx, gy=21*T-cy, r=90+CINE.fire*40+Math.sin(CINE.t*11)*6; const g=ctx.createRadialGradient(gx,gy,0,gx,gy,r); g.addColorStop(0,`rgba(255,140,50,${.32*Math.min(1,CINE.fire)})`); g.addColorStop(1,'rgba(255,120,40,0)'); ctx.fillStyle=g; ctx.fillRect(gx-r,gy-r,r*2,r*2); }
  // tongues of flame: white-hot at the base, then yellow, orange and deep red as they rise and fade
  for (const p of CINE.flames){ const k=p.t/p.life, sz=Math.max(1, Math.round(p.s*(k<.3 ? 1+k*2 : 1.6-(k-.3)))), x=Math.round(p.x-cx), y=Math.round(p.y-cy);
    ctx.fillStyle = k<.18 ? 'rgba(255,240,190,.9)' : k<.42 ? 'rgba(255,196,80,.85)' : k<.68 ? 'rgba(255,128,48,.75)' : 'rgba(196,60,32,.5)';
    ctx.fillRect(x-Math.floor(sz/2), y-sz, sz, sz*2); }
  ctx.globalCompositeOperation='source-over';
}
function endPrologue(skipped){
  CINE.active=false; CINE.actors=[]; CINE.flames=[]; CINE.smoke=[]; CINE.lights=[]; CINE.trainY=0;
  document.body.classList.remove('cine'); bigCap(''); $('#cineCap').classList.remove('on'); fadeTo(false); C.says=[];
  S0.tod=10; P.x=86*T+8; P.y=30*T+10; P.dir='left'; camX=P.x-VW/2; camY=P.y-VH/2;
  const d=CINE.done; CINE.done=null; if (d) d(skipped);
}
$('#cineSkip').addEventListener('click', () => { if (CINE.active) endPrologue(true); });
