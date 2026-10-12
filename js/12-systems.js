// The Letter — Sound effects, townsfolk daily routines, achievements and drawing inside buildings.
'use strict';

// ================= sound effects =================
let NOISE=null;
function noiseBuf(ac){ if (NOISE) return NOISE; const n=Math.floor(ac.sampleRate*.6), b=ac.createBuffer(1,n,ac.sampleRate), d=b.getChannelData(0); for (let i=0;i<n;i++) d[i]=Math.random()*2-1; return NOISE=b; }
function sfxNoise(dur, type, freq, q, vol, when=0){
  const ac=Music.ctx(); if (!ac || SETTINGS.muted) return;
  try { const t=ac.currentTime+when, s=ac.createBufferSource(); s.buffer=noiseBuf(ac); const f=ac.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q;
    const g=ac.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur); s.connect(f); f.connect(g); g.connect(Music.sfx()); s.start(t, Math.random()*.4); s.stop(t+dur+.02); } catch(e){}
}
function sfxStep(surf){
  if (surf==='snow'){ sfxNoise(.09,'lowpass',1100,.8,.06); sfxNoise(.05,'highpass',2600,.6,.02,.02); return; }
  if (surf==='grass') sfxNoise(.07,'lowpass',850,.7,.045);
  else if (surf==='dirt') sfxNoise(.06,'bandpass',1300,1.2,.05);
  else if (surf==='wood'){ sfxNoise(.05,'bandpass',650,2,.05); beep(135+Math.random()*25,.05,'sine',.03); }
  else { sfxNoise(.04,'highpass',2300,.8,.035); beep(300+Math.random()*50,.025,'triangle',.014); }
}
function sfxDoor(){
  const ac=Music.ctx(); if (!ac || SETTINGS.muted) return;
  try { const t=ac.currentTime, o=ac.createOscillator(), f=ac.createBiquadFilter(), g=ac.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(260,t); o.frequency.linearRampToValueAtTime(170,t+.28); o.frequency.linearRampToValueAtTime(225,t+.36);
    f.type='bandpass'; f.frequency.value=900; f.Q.value=6; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.045,t+.04); g.gain.linearRampToValueAtTime(0,t+.38);
    o.connect(f); f.connect(g); g.connect(Music.sfx()); o.start(t); o.stop(t+.4); } catch(e){}
  beep(90,.12,'sine',.08,.36); sfxNoise(.08,'lowpass',300,1,.06,.36);
}
function sfxWhistle(){
  const ac=Music.ctx(); if (!ac || SETTINGS.muted) return;
  try { const t=ac.currentTime;
    for (const [f0,v] of [[740,.03],[932,.026],[1110,.013]]){ const o=ac.createOscillator(), g=ac.createGain(), lfo=ac.createOscillator(), lg=ac.createGain();
      o.type='triangle'; o.frequency.value=f0; lfo.frequency.value=6; lg.gain.value=f0*.008; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.08); g.gain.setValueAtTime(v,t+.55); g.gain.linearRampToValueAtTime(v*.6,t+.65); g.gain.linearRampToValueAtTime(v,t+.75); g.gain.linearRampToValueAtTime(0,t+1.6);
      o.connect(g); g.connect(Music.sfx()); o.start(t); lfo.start(t); o.stop(t+1.7); lfo.stop(t+1.7); }
    sfxNoise(1.2,'bandpass',2500,.6,.01); } catch(e){}
}
function sfxBell(){
  const ac=Music.ctx(); if (!ac || SETTINGS.muted) return;
  try { const t=ac.currentTime; for (const [m,v] of [[1,.05],[2.01,.025],[2.76,.018],[5.4,.008]]){ const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=196*m; g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+3); o.connect(g); g.connect(Music.sfx()); o.start(t); o.stop(t+3.1); } } catch(e){}
}
function sfxClunk(){ beep(70,.25,'square',.06); beep(110,.15,'triangle',.05,.05); sfxNoise(.2,'lowpass',500,1,.08); }
function surfaceHere(){
  if (typeof ATM!=='undefined' && ATM.snow>.5 && outdoorsNow()) return 'snow';
  const tx=Math.floor(P.x/T), ty=Math.floor(P.y/T);
  if (IN){ const sc=SCN[IN]; if (sc.outdoor){ const g=sc.glyph[ty] && sc.glyph[ty][tx]; return g==='"' ? 'grass' : g==='+' ? 'wood' : 'stone'; }
    return sc.floor==='wood' ? 'wood' : sc.floor==='charred' ? 'dirt' : 'stone'; }
  const t=at(tx,ty); return t===GRASS ? 'grass' : (t===PATH||t===FPATH||t===FIELD) ? 'dirt' : t===BRIDGE ? 'wood' : 'stone';
}
let whistleT=20;

// ================= daily routines =================
// Townsfolk move around during the day and go indoors at night (you can visit them inside).
// Whoever your current goal needs always waits at their usual spot.
const ROUTINE = {
  // m = morning, a = afternoon, e = evening, n = night (from dusk, before the Ashen come out)
  hale:  { m:[[52,25]], a:'books', e:[[50,30]], n:'books' },
  june:  { m:[[43,25]], a:'cafe',  e:[[44,29]], n:'cafe' },
  clara: { m:[[44,36]], a:[[43,42]], e:[[44,36]], n:'records' },
  tom:   { m:[[22,39],[22,44],[24,44]], a:[[22,39],[22,47],[19,48]], e:[[22,44],[22,39],[27,38]], n:'farm' },
  pip:   { m:[[riverX(46)-2,46]], a:[[58,40],[50,34]], e:[[58,40],[riverX(46)-2,46]], n:'away' },
  rosa:  { m:[[61,28]], a:'post',  e:[[61,28]], n:'post' },
  greta: { m:[[59,41]], a:[[59,41]], e:'forge', n:'forge' },
  bennet:{ m:[[48,13]], a:[[50,12],[54,12]], e:[[50,12],[48,13]], n:'church' },
  walt:  { m:[[86,27]], a:[[86,27]], e:[[86,27]], n:'station' },
  agnes: { m:[[66,67]], a:[[66,67]], e:[[66,67]], n:'mill' },
  ned:   { m:[[24,78]], a:[[24,78]], e:[[24,78]], n:'hut' },
};
const period = () => { const t=S0.tod ?? 10; return t>=7&&t<12 ? 'm' : t>=12&&t<17 ? 'a' : t>=17&&t<19 ? 'e' : 'n'; };   // everyone heads home at 7pm, before the Ashen appear at 7:30
function worldSolid(px,py){ const tx=Math.floor(px/T), ty=Math.floor(py/T); return tx<0||ty<0||tx>=W||ty>=H||solid[ty*W+tx]; }
function updateRoutines(dt){
  const per = (period()==='n' || ATM.shelter) ? 'n' : period(), ob=objective(), pin=ob.at && !ob.at.scene && ob.at.npc;   // rain sends everyone indoors too
  for (const n of npcs){
    const R=ROUTINE[n.id]; if (!R) continue;
    if (n.hx==null){ n.hx=n.x; n.hy=n.y; }
    const pinned = n.id===pin && !(IN && n.inside===IN) && per!=='n';
    let plan = pinned ? [[(n.hx-8)/T, (n.hy-12)/T]] : R[per];
    const key = per + (pinned ? '!' : '');
    const far = IN || Math.hypot(n.x-P.x, n.y-P.y) > 300;
    if (n.plan !== key){
      n.plan = key; n.stuck=0;
      if (typeof plan === 'string'){ n.goIn = plan; const d = SCN[plan] ? SCN[plan].out : [(n.hx-8)/T,(n.hy-12)/T]; n.path = far ? [] : [d]; if (far){ n.inside=plan; } }
      else { if (n.inside){ const d = SCN[n.inside] ? SCN[n.inside].out : null; n.inside=null; if (d){ n.x=d[0]*T+8; n.y=d[1]*T+12; } }
             n.goIn=null; n.path = plan.map(([x,y]) => [x,y]);
             if (far){ const last=n.path[n.path.length-1]; n.x=last[0]*T+8; n.y=last[1]*T+12; n.path=[]; } }
    }
    n.walking=false;
    if (n.inside) continue;
    if (n.path && n.path.length){
      const [tx,ty]=n.path[0], gx=tx*T+8, gy=ty*T+12, dx=gx-n.x, dy=gy-n.y, d=Math.hypot(dx,dy);
      if (d<2){ n.path.shift(); if (!n.path.length && n.goIn){ n.inside=n.goIn; } continue; }
      const sp=30*dt, mx=dx/d*sp, my=dy/d*sp, bx=n.x, by=n.y;
      if (!worldSolid(n.x+mx, n.y)) n.x+=mx; if (!worldSolid(n.x, n.y+my)) n.y+=my;
      if (Math.hypot(n.x-bx,n.y-by)<sp*.3){ n.stuck+=dt; if (n.stuck>2.5){ n.x=gx; n.y=gy; n.stuck=0; } } else n.stuck=0;
      n.walking=true; n.dir = Math.abs(dx)>Math.abs(dy) ? (dx<0?'left':'right') : (dy<0?'up':'down'); n.turnT=2;
    }
  }
}

// ================= achievements =================
const ACH = [
  ['first','First steps','Arrive in Ashbourne.'], ['ch1','The Letter','Finish Part One (chapters 1–5).'], ['ch2','The Ledger','Finish Part Two (chapters 6–8).'],
  ['ch3','Keeping Left','Finish Part Three (chapters 9–11).'], ['ch4','Some letters take twenty years','Finish all 14 chapters.'],
  ['memories','Remembering','Find all 5 hidden memories.'], ['detective','Detective','Find every clue in the game.'],
  ['bonk','Nobody’s safe','Bonk every townsperson in Ashbourne.'], ['untouchable','Untouchable','Defeat the Cinder Warden without getting hit.'],
  ['heart','Heartbreaker','Defeat the Ashen Heart.'], ['lvl5','Seasoned','Reach level 5.'], ['lvl10','Ember-forged','Reach level 10.'],
  ['arsenal','Full arsenal','Own all four weapons.'], ['goodboy','Good boy','Befriend Scout.'], ['biscuit','Cat herder','Bring Biscuit home to June.'],
  ['ash50','Night watch','Defeat 50 Ashen.'], ['ash200','Ashbreaker','Defeat 200 Ashen.'], ['rest','Well rested','Sleep at June’s café.'],
  ['candle','For Mara','Light a candle in St. Aldric’s.'], ['openhouse','Open house','Visit every building in Ashbourne.'], ['mercy','Mercy','Show Silas kindness.'], ['explorer','Explorer','Visit Willow Lake, the Old Mill and the Abbey ruins.'], ['angler','Lucky lure','Return Old Ned’s lucky lure.'],
];
const ACH_KEY='the-letter-ach-v1';
let ACHS = (() => { try { return JSON.parse(localStorage.getItem(ACH_KEY))||[]; } catch(e){ return []; } })();
let achQueue=[], achBusy=false;
function unlockAch(id){
  if (ACHS.includes(id) || !ACH.find(a=>a[0]===id)) return;
  ACHS.push(id); try { localStorage.setItem(ACH_KEY, JSON.stringify(ACHS)); } catch(e){}
  achQueue.push(id); showNextAch();
}
function showNextAch(){
  if (achBusy || !achQueue.length) return; achBusy=true;
  const nextId=achQueue.shift(), a=ACH.find(x=>x[0]===nextId), el=$('#achToast'); if (!a){ achBusy=false; return; }
  el.querySelector('.an').textContent=a[1]; el.querySelector('.ad').textContent=a[2];
  el.classList.add('on'); beep(784,.12,'triangle',.06); beep(988,.12,'triangle',.06,.1); beep(1319,.3,'triangle',.05,.2);
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => { achBusy=false; showNextAch(); }, 400); }, 3200);
}
let achT=0;
function checkAchs(dt){
  achT-=dt; if (achT>0) return; achT=1;
  const f=F(); wInit();
  if (mode==='play') unlockAch('first');
  if (f.end) unlockAch('ch1'); if (f.ch2end) unlockAch('ch2'); if (f.ch3end || f.gameEnd) unlockAch('ch3'); if (f.ch4end) unlockAch('ch4');
  if (S0.mems.length>=5) unlockAch('memories');
  if (Object.keys(CLUES).every(k => S0.clues.includes(k))) unlockAch('detective');
  if (['walt','hale','june','clara','tom','pip','rosa','bennet','greta'].every(id => (S0.bonked||[]).includes(id))) unlockAch('bonk');
  if (f.heartDown) unlockAch('heart');
  if (S0.lvl>=5) unlockAch('lvl5'); if (S0.lvl>=10) unlockAch('lvl10');
  if (S0.weapons.length>=4) unlockAch('arsenal'); if (f.pet) unlockAch('goodboy'); if (f.catHome) unlockAch('biscuit');
  if ((S0.kills||0)>=50) unlockAch('ash50'); if ((S0.kills||0)>=200) unlockAch('ash200');
  if (f.candle) unlockAch('candle'); if (f.kindSilas) unlockAch('mercy');
  if (['Willow Lake','The Old Mill','Abbey ruins'].every(z => (S0.zonesSeen||[]).includes(z))) unlockAch('explorer');
  if (f.lureDone) unlockAch('angler');
  if (['books','cafe','post','forge','church'].every(id => (S0.visited||[]).includes(id))) unlockAch('openhouse');
}
function openAch(from){
  achFrom=from; const box=$('#achGrid'); box.innerHTML='';
  $('#achCount').textContent = `${ACHS.length} of ${ACH.length} unlocked`;
  for (const [id,name,desc] of ACH){ const got=ACHS.includes(id); const d=document.createElement('div'); d.className='acard'+(got?' got':'');
    d.innerHTML=`<div class="ai">${got?'★':'?'}</div><div><h3></h3><p></p></div>`; d.querySelector('h3').textContent=name; d.querySelector('p').textContent=desc; box.appendChild(d); }
  $('#title').classList.remove('on'); $('#pause').classList.remove('on'); $('#achov').classList.add('on'); mode='ach';
}
let achFrom='title';
function closeAch(){ $('#achov').classList.remove('on'); if (achFrom==='pause'){ mode='pause'; $('#pause').classList.add('on'); } else { mode='title'; $('#title').classList.add('on'); } }
$('#achClose').addEventListener('click', closeAch);
$('#achBtn').addEventListener('click', () => openAch('title'));
$('#pAch').addEventListener('click', () => openAch('pause'));

// ================= drawing scenes =================
function renderScene(cx,cy,dt){
  const sc=SCN[IN], look=LOOK();
  ctx.fillStyle='#05060e'; ctx.fillRect(0,0,VW,VH);
  ctx.drawImage(sc.base,-cx,-cy);
  if (sc.outdoor) drawSnowGround(cx,cy);
  const glass=['#bfe0f0','#e8a070','#1a2850','#e8b0c8'][look];
  for (const [x,y] of sc.windows){
    if (sc.outdoor){ ctx.fillStyle = (look===1||look===2) ? (((x*7+y)%3)?'#f6c56a':'#1a1e2e') : '#4a5a6e'; ctx.fillRect(x*T+5-cx,y*T+4-cy,6,6); }
    else { ctx.fillStyle=glass; ctx.fillRect(x*T+3-cx,y*T+4-cy,10,6); ctx.fillStyle='#3a2a1a'; ctx.fillRect(x*T+7-cx,y*T+4-cy,2,6); }
  }
  if (sc.outdoor){ const tick=reduceMotion?0:Math.floor(time*3); for (let y=0;y<sc.h;y++) for (let x=0;x<sc.w;x++){ if (sc.glyph[y][x]!=='~') continue; const h=hash(x,y,tick); if (h%3) continue; ctx.fillStyle='#8ab4d0'; ctx.globalAlpha=.6; ctx.fillRect(x*T+(h>>>4)%11+2-cx, y*T+(h>>>9)%14+1-cy, 3,1); ctx.globalAlpha=1; } }
  const items=[];
  sc.strips.forEach((st,y) => { if (st) items.push({k:y*T+T-1, d:()=>ctx.drawImage(st,-cx,y*T-14-cy)}); });
  if (sc.outdoor) for (const tr of sceneTrees(sc)) items.push({k:tr.y, d:()=>{ const s=roundTrees[tr.v]; ctx.drawImage(s, Math.round(tr.x-s.width/2-cx), Math.round(tr.y-s.height+3-cy)); }});
  if (IN==='cafe' && F().catHome) items.push({k:3*T+12, d:()=>drawSleepingCat(Math.round(2*T+8-cx), Math.round(3*T+12-cy))});
  for (const n of sceneNPCs()) items.push({k:n.y, d:()=>drawCharAt(ctx, n.x-cx+Math.round(n.bx||0), n.y-cy+Math.round(n.by||0), n.dir, 0, CH[n.id], n.id==='elias' && sc.outdoor)});
  const frame = P.moving ? [0,1,0,3][Math.floor(P.anim)%4] : 0;
  if (!(C.invul>0 && Math.floor(time*16)%2)) items.push({k:P.y, d:()=>drawPlayerSprite(ctx, P.x-cx, P.y-cy, frame, F().lantern && sc.outdoor)});
  pushCombatItems(items,cx,cy);
  items.sort((a,b)=>a.k-b.k); for (const it of items) it.d();
  drawSwing(cx,cy);
  const ob=objective(), tgt=ob.at && (ob.at.npc || ob.at.who);
  for (const n of sceneNPCs()){ if ((C.says||[]).some(s=>s.ref===n)) continue; const x=Math.round(n.x-cx), y=Math.round(n.y-cy-36+(reduceMotion?0:Math.sin(time*4)*1.5)); if (n.id===tgt) bubble(x,y,true); else if (!S0.met.includes(n.id)) bubble(x,y,false); }
  // lighting
  const night=darkAmt()/.58;
  const base = sc.outdoor ? Math.min(.9, .2 + .5*night) : (.1 + .32*night);
  dctx.globalCompositeOperation='source-over'; dctx.clearRect(0,0,VW,VH);
  dctx.fillStyle = sc.outdoor ? `rgba(8,10,30,${base})` : `rgba(24,12,26,${base})`; dctx.fillRect(0,0,VW,VH);
  dctx.globalCompositeOperation='destination-out';
  const cut=(x,y,r,a)=>{ if (x<-r||y<-r||x>VW+r||y>VH+r) return; const gg=dctx.createRadialGradient(x,y,0,x,y,r); gg.addColorStop(0,`rgba(0,0,0,${a})`); gg.addColorStop(.6,`rgba(0,0,0,${a*.5})`); gg.addColorStop(1,'rgba(0,0,0,0)'); dctx.fillStyle=gg; dctx.fillRect(x-r,y-r,r*2,r*2); };
  for (const [x,y] of sc.lights) cut(x*T+8-cx, y*T-cy, sc.outdoor?52:56, .95);
  if (!sc.outdoor) cut(sc.w*T/2-cx, sc.h*T/2-cy, Math.max(sc.w,sc.h)*9, .6);
  if (sc.outdoor && F().lantern) cut(P.x-cx, P.y-10-cy, 74, 1);
  dctx.globalCompositeOperation='source-over'; ctx.drawImage(dark,0,0);
  ctx.globalCompositeOperation='lighter';
  for (const [x,y,col] of sc.lights){ const gx=x*T+8-cx, gy=y*T-cy-(sc.outdoor?12:0); const gg=ctx.createRadialGradient(gx,gy,0,gx,gy,30); gg.addColorStop(0,`rgba(${col},.28)`); gg.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=gg; ctx.fillRect(gx-30,gy-30,60,60); }
  ctx.globalCompositeOperation='source-over';
  if (sc.outdoor) drawSkyAtmos(cx,cy,dt);
  drawCombatFX(cx,cy);
  if (mode==='play' && SETTINGS.marker && ob.at && ob.at.scene===IN && !ob.at.npc){
    const x=ob.at.x-cx, y=ob.at.y-cy, bob=reduceMotion?0:Math.sin(time*4)*2;
    if (x>8&&y>8&&x<VW-8&&y<VH-8){ ctx.fillStyle='#070a12'; ctx.fillRect(x-4,y-6+bob,9,6); ctx.fillStyle='#e98c7a'; ctx.fillRect(x-3,y-5+bob,7,2); ctx.fillRect(x-2,y-3+bob,5,1); ctx.fillRect(x-1,y-2+bob,3,1); ctx.fillRect(x,y-1+bob,1,1); }
    else { const ang=Math.atan2(y-VH/2,x-VW/2), rx=VW/2-14, ry=VH/2-14, k=Math.min(Math.abs(rx/Math.cos(ang)),Math.abs(ry/Math.sin(ang)));
      ctx.save(); ctx.translate(Math.round(VW/2+Math.cos(ang)*k),Math.round(VH/2+Math.sin(ang)*k)); ctx.rotate(ang); ctx.fillStyle='#e98c7a'; ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(-4,-5); ctx.lineTo(-2,0); ctx.lineTo(-4,5); ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
}
function drawSceneMini(){
  if (!SETTINGS.minimap) return;
  const g=minic, S=128, sc=SCN[IN]; g.imageSmoothingEnabled=false; g.fillStyle='#0e1322'; g.fillRect(0,0,S,S);
  const k=Math.min(S/(sc.w*T), S/(sc.h*T)); const w=sc.w*T*k, h=sc.h*T*k, ox=(S-w)/2, oy=(S-h)/2;
  g.drawImage(sc.base, ox, oy, w, h);
  if (LOOK()===2 || LOOK()===1){ g.fillStyle='rgba(20,25,70,.3)'; g.fillRect(ox,oy,w,h); }
  const x=Math.round(ox+P.x*k), y=Math.round(oy+P.y*k); g.fillStyle='#070a12'; g.fillRect(x-3,y-3,7,7); g.fillStyle='#f2c27a'; g.fillRect(x-2,y-2,5,5);
}
function objective4(){
  const f=F(), S=(id,x,y,npc) => ({ x:x*T+8, y:y*T-16, scene:id, npc });
  if (f.ch4end) return { t:'The story is complete. Explore freely', at:null };
  if (!f.marlowe) return { t:'Talk to Inspector Marlowe on the platform', at:S('harlow',4,6,'marlowe') };
  if (!f.nell) return { t:'Find Nell Crane by the canal bridge, south of the street', at:S('harlow',23,13,'nell') };
  if (!f.heartDown){
    if (IN==='archive') return { t: f.safeOpen ? 'Defeat the Ashen Heart!' : 'Open the safe — the combination is 12 · 06 · 06', at: f.safeOpen ? null : S('archive',6,4) };
    if (IN==='office') return { t:'Take the stairs down to the archive', at:S('office',11,6) };
    return { t:'Get into Ashcombe Holdings — the office at the east end of the street', at:S('harlow',33,6) };
  }
  if (IN==='office') return { t:'Confront Ashcombe in the lobby', at:S('office',7,4,'ashcombe') };
  if (IN==='archive') return { t:'Take the ledger upstairs to the lobby', at:S('archive',6,7) };
  return { t:'Go back into Ashcombe Holdings', at:S('harlow',33,6) };
}
const safeAt = (tx,ty) => IN ? sceneSafeAt(tx,ty) : inSafe(tx,ty);
function arrowBlocked(tx,ty){
  if (IN){ const sc=SCN[IN]; if (tx<0||ty<0||tx>=sc.w||ty>=sc.h) return true; const g=sc.glyph[ty][tx]; return sc.grid[ty*sc.w+tx]===1 && g!=='~' && g!=='='; }
  return tx<0||ty<0||tx>=W||ty>=H || (solid[ty*W+tx] && tiles[ty*W+tx]!==WATER && tiles[ty*W+tx]!==RAIL);
}

// Biscuit, curled up asleep by the café stove
function drawSleepingCat(x,y){
  const R=(dx,dy,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+dx,y+dy,w,h); };
  R(-7,-1,14,2,'rgba(20,15,40,.3)');
  R(-6,-6,11,5,'#d9823a'); R(-5,-7,8,2,'#e8964a'); R(-3,-6,1,4,'#b8662a'); R(0,-6,1,4,'#b8662a');
  R(3,-7,5,4,'#d9823a'); R(3,-8,1,2,'#d9823a'); R(6,-8,1,1,'#b8662a'); R(5,-5,2,1,'#5a3a20');
  R(-7,-3,10,2,'#c8742e');
  if (!reduceMotion){ const k=(time*0.6)%1; ctx.globalAlpha=1-k; ctx.fillStyle='#efe3c8'; ctx.font='8px "VT323", monospace'; ctx.fillText('z', x+7+k*3, y-9-k*7); ctx.globalAlpha=1; }
}
