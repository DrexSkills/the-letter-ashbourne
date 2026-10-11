// The Letter — Tutorial, the main game loop, drawing the world, menus and starting the game.
'use strict';

// ================= tutorial =================
let tutT=0, tutMoved=0;
const TUT = [
  null,
  { t: () => IS_TOUCH ? 'Drag your thumb on the <b>left side</b> of the screen to walk.' : 'Walk with <b>WASD</b> or the <b>arrow keys</b>. Hold <b>Shift</b> to run.', s:'Step 1 of 5 · Getting started', done: () => tutMoved > 50 },
  { t: () => 'See the yellow <b>!</b> above Walt? Walk next to him and ' + (IS_TOUCH ? 'tap <b>E</b>' : 'press <b>E</b>') + ' to talk.', s:'Step 2 of 5 · A yellow ! always marks who to talk to next', done: () => F().walt },
  { t: () => IS_TOUCH ? 'When <b>night</b> falls, ash monsters called the <b>Ashen</b> come out. Tap the red <b>attack button</b> to fight.' : 'When <b>night</b> falls, ash monsters called the <b>Ashen</b> come out. Press <b>Space</b> to attack. <b>E</b> still talks.', s:'Step 3 of 5 · Town and station are always safe — you heal there', done: () => C.swings>0 || tutT>12 },
  { t: () => 'Your current goal is always in the <b>top-left box</b>. The <b>pink arrow</b> points the way.', s:'Step 4 of 5 · Follow it to Hale’s bookshop', done: () => tutT > 8 },
  { t: () => IS_TOUCH ? 'Stuck? Tap <b>✎</b> for your journal — it has the story so far — or <b>⌖</b> for the map.' : 'Stuck? Press <b>J</b> for your journal — it has the story so far — and <b>M</b> for the map.', s:'Step 5 of 5 · That’s everything. Good luck, Noah.', done: () => tutT > 9 },
];
function tickTut(dt){
  const el=$('#tut'), st=S0.tut||0;
  if (!st || st>=TUT.length || mode!=='play'){ el.classList.remove('on'); return; }
  tutT += dt;
  const step=TUT[st];
  if (!el.classList.contains('on') || el.dataset.step!==String(st)){ el.dataset.step=String(st); $('#tut .n').textContent=st; $('#tut .t').innerHTML=step.t(); $('#tut .s').textContent=step.s; el.classList.add('on'); }
  if (step.done()){ S0.tut = st+1>=TUT.length ? 0 : st+1; tutT=0; el.classList.remove('on'); }
}

// ================= main loop =================
let last=performance.now(), time=0, titlePan=0;
function step(now){
  document.body.classList.toggle('inmenu', ['inv','journal','map','pause','settings','ending','ach','how'].includes(mode));
  const dt=Math.min(.05,(now-last)/1000); last=now; time+=dt;
  tickDialog(dt); tickCut(dt); tickTut(dt); updateFX(dt); updateAtmos(dt);
  if (mode!=='title'){ const ct=clockText() + (F().lantern && LOOK()===2 ? ' · lantern lit' : ''); if (ct!==lastClock){ lastClock=ct; $('#timeLbl').textContent=ct; } }
  Music.setMood(mode==='title' ? 'title' : forestF>.5 ? 'forest' : ['day','dusk','night','dawn'][LOOK()]);

  if (mode==='play'){
    let dx=0, dy=0; if(keys.left)dx--; if(keys.right)dx++; if(keys.up)dy--; if(keys.down)dy++;
    let run = !!keys.run;
    const jm = Math.hypot(joy.x, joy.y);
    if (joy.active && jm>.22){ dx=joy.x; dy=joy.y; if (jm>.92) run=true; }
    $('#joybase').classList.toggle('run', joy.active && jm>.92);
    P.moving = dx!==0||dy!==0;
    if (P.moving){
      if (Math.abs(dx)>=Math.abs(dy)) P.dir = dx<0?'left':'right'; else P.dir = dy<0?'up':'down';
      const len=Math.hypot(dx,dy); dx/=len; dy/=len;
      const sp = run ? 108 : 64;
      const nx=P.x+dx*sp*dt; if (!blocked(nx,P.y)) P.x=nx;
      const ny=P.y+dy*sp*dt; if (!blocked(P.x,ny)) P.y=ny;
      // forest needs light
      if (!IN && !F().lantern && isForest(Math.floor(P.x/T), Math.floor((P.y-4)/T))){
        P.y = 27*T+6; if (gateCool<=0){ gateCool=3; dialog([{s:'noah', t:'It’s already pitch dark under those trees. I’m not going in there without a light.'}]); }
      }
      P.anim += dt*(run?11:7); tutMoved += sp*dt;
      C.stepT=(C.stepT||0)-dt; if (C.stepT<=0){ C.stepT = run ? .24 : .34; sfxStep(surfaceHere()); if (run) dustPuff(); }
      checkSceneExit();
    } else P.anim=0;
    gateCool-=dt;
    // Silas encounter
    if (!IN && F().lantern && !F().silas && Math.hypot(P.x-(12*T+8), P.y-(13*T+10))<44){ const s=npcs.find(n=>n.id==='silas'); s.dir = P.x<s.x?'left':'right'; talkSilas(); }
    tickClock(dt); updateCombat(dt); updatePet(dt); try { updateRoutines(dt); } catch(e){} try { checkAchs(dt); } catch(e){} whistleT-=dt;
    updateZone(dt);
    const nt=nearest(); const pr=$('#prompt');
    if (nt){ pr.style.display='block'; pr.querySelector('span').textContent=nt.label; } else pr.style.display='none';
  } else { P.moving=false; $('#prompt').style.display='none'; if (mode==='title') titlePan += dt*12; }

  // NPC idle turning
  for (const n of npcs){ n.turnT-=dt; if (n.turnT<0){ n.turnT=3+rng()*5; n.dir = rng()<.6 ? n.home : pick(['down','left','right','up']); } }
  // cat
  cat.anim+=dt;
  if (cat.follow){ const bx=P.x-(P.dir==='left'?-14:P.dir==='right'?14:0), by=P.y-(P.dir==='up'?-12:P.dir==='down'?12:0);
    const d=Math.hypot(bx-cat.x,by-cat.y); if (d>8){ cat.x+=(bx-cat.x)*Math.min(1,dt*4); cat.y+=(by-cat.y)*Math.min(1,dt*4); cat.dir = bx<cat.x?-1:1; } }
  else if (!F().catHome){ cat.wait-=dt; if (cat.wait<0){ cat.tx=(74+rng()*7)*T; cat.ty=(42+rng()*10)*T; cat.wait=3+rng()*4; }
    const d=Math.hypot(cat.tx-cat.x,cat.ty-cat.y); if (d>2){ cat.x+=(cat.tx-cat.x)/d*18*dt; cat.y+=(cat.ty-cat.y)/d*18*dt; cat.dir=cat.tx<cat.x?-1:1; } }

  // camera
  let tx, ty;
  if (mode==='title'){ tx = 52*T + Math.sin(titlePan*.01)*30*T - VW/2; ty = 22*T - VH/2 + Math.sin(titlePan*.007)*6*T; }
  else { tx=P.x-VW/2; ty=P.y-12-VH/2; }
  camX += (tx-camX)*Math.min(1,dt*(mode==='title'?1:8)); camY += (ty-camY)*Math.min(1,dt*(mode==='title'?1:8));
  camX=Math.max(0,Math.min(mapW()-VW,camX)); camY=Math.max(0,Math.min(mapH()-VH,camY));
  if (mapW()<VW) camX=(mapW()-VW)/2; if (mapH()<VH) camY=(mapH()-VH)/2;
  const cx=Math.round(camX), cy=Math.round(camY);
  const sh = C.shake>0 && !reduceMotion ? 3 : 0;
  render(cx+Math.round((Math.random()-.5)*sh), cy+Math.round((Math.random()-.5)*sh), dt);
  if (mode!=='title') drawMini();
  requestAnimationFrame(step);
}

function render(cx,cy,dt){
  if (IN){ renderScene(cx,cy,dt); return; }
  const phase=LOOK();
  ctx.fillStyle='#1d3320'; ctx.fillRect(0,0,VW,VH);
  ctx.drawImage(ground,-cx,-cy);

  // water shimmer
  const t0=Math.max(0,Math.floor(cx/T)), t1=Math.min(W-1,Math.ceil((cx+VW)/T)), r0=Math.max(0,Math.floor(cy/T)), r1=Math.min(H-1,Math.ceil((cy+VH)/T));
  const tick=reduceMotion?0:Math.floor(time*3);
  for (let y=r0;y<=r1;y++) for (let x=t0;x<=t1;x++){ if (at(x,y)!==WATER) continue;
    for (let k=0;k<2;k++){ const h=hash(x,y,tick+k*97); if (h%3) continue;
      ctx.globalAlpha=.75; ctx.fillStyle = k?'#9cc9dc':(phase===2?'#c9d6ff':'#f3c48a'); ctx.fillRect(x*T+(h>>>4)%11+2-cx, y*T+(h>>>9)%14+1-cy, 3+(h%2),1); ctx.globalAlpha=1; } }

  const items=[];
  const inV=(x,y,m)=> x>cx-m && x<cx+VW+m && y>cy-m && y<cy+VH+m+40;
  for (const tr of trees) if (inV(tr.x,tr.y,40)) items.push({k:tr.y, d:()=>{ const s=tr.pine?pines[tr.v]:roundTrees[tr.v]; const x=Math.round(tr.x-s.width/2-cx), y=Math.round(tr.y-s.height+3-cy); ctx.drawImage(s,x,y);
    if (tr.mark){ ctx.fillStyle='#d8c8a8'; ctx.fillRect(x+13,y+24,1,3); ctx.fillRect(x+15,y+24,1,3); } }});
  for (const h of houses) items.push({k:(h.y+h.h)*T, d:()=>ctx.drawImage(h.spr, h.x*T-cx, h.y*T-h.extra-cy)});
  for (const f of fences) if (inV(f.x*T,f.y*T,20)) items.push({k:f.y*T+11, d:()=>{ const x=f.x*T-cx, y=f.y*T-cy;
    ctx.fillStyle='#5a3d26';
    if (f.h){ ctx.fillRect(x+1,y+4,2,9); ctx.fillRect(x+13,y+4,2,9); ctx.fillStyle='#8a6240'; ctx.fillRect(x,y+6,T,2); ctx.fillRect(x,y+10,T,2); ctx.fillStyle='#a77d55'; ctx.fillRect(x,y+6,T,1); }
    else { ctx.fillRect(x+6,y-3,4,15); ctx.fillStyle='#8a6240'; ctx.fillRect(x+6,y-3,4,1); if (f.x===29&&f.y===46){ ctx.fillStyle='#c9b08a'; ctx.fillRect(x+7,y+1,2,1); ctx.fillRect(x+7,y+3,1,2); ctx.fillRect(x+8,y+5,1,1);} } }});
  for (const gv of graves) if (inV(gv.x*T,gv.y*T,20)) items.push({k:gv.y*T+12, d:()=>{ const x=gv.x*T-cx, y=gv.y*T-cy;
    ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x+2,y+12,12,2);
    const big=gv.mara; ctx.fillStyle='#5f5c66'; ctx.fillRect(x+3,y+(big?-2:1),10,big?14:11); ctx.fillStyle='#8a8794'; ctx.fillRect(x+4,y+(big?-1:2),8,big?12:9); ctx.fillStyle='#6f6c78'; ctx.fillRect(x+5,y+(big?2:4),6,1); ctx.fillRect(x+5,y+(big?4:6),6,1);
    if (big){ ctx.fillStyle='#e98ca0'; ctx.fillRect(x+3,y+12,2,2); ctx.fillStyle='#f2d36b'; ctx.fillRect(x+6,y+12,2,2); ctx.fillStyle='#f5f0e6'; ctx.fillRect(x+10,y+12,2,2); ctx.fillStyle='#3c6a2e'; ctx.fillRect(x+5,y+13,1,1); ctx.fillRect(x+9,y+13,1,1); } }});
  for (const p of props){ if (p.dup || !inV(p.x*T,p.y*T,30)) continue; items.push({k:p.y*T+12, d:()=>drawProp(p,p.x*T-cx,p.y*T-cy)}); }
  for (const [lx,ly] of lamps) items.push({k:ly*T+13, d:()=>{ const x=lx*T+7-cx, y=ly*T-cy;
    ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x-3,y+12,8,2); ctx.fillStyle='#22252f'; ctx.fillRect(x,y-10,2,23); ctx.fillRect(x-2,y+11,6,2); ctx.fillRect(x-2,y-15,6,6);
    ctx.fillStyle=phase>0?'#ffd88a':'#c9b88a'; ctx.fillRect(x-1,y-14,4,4); }});
  // train
  items.push({k:42*T, d:()=>drawTrain(90*T-cx, 14*T-cy)});
  for (const n of npcs){ if (!vis(n)) continue; if (!inV(n.x,n.y,30)) continue;
    items.push({k:n.y, d:()=>drawCharAt(ctx, n.x-cx+Math.round(n.bx||0), n.y-cy+Math.round(n.by||0)+(reduceMotion?0:(Math.sin(time*2+n.x)>.95?-1:0)), n.dir, n.walking ? [0,1,0,3][Math.floor(time*7)%4] : 0, CH[n.id])}); }
  if (!F().catHome || true) items.push({k:cat.y, d:()=>drawCat(Math.round(cat.x-cx), Math.round(cat.y-cy))});
  const frame = P.moving ? [0,1,0,3][Math.floor(P.anim)%4] : 0;
  if (mode!=='title' && !(C.invul>0 && Math.floor(time*16)%2)) items.push({k:P.y, d:()=>drawCharAt(ctx, P.x-cx, P.y-cy, P.dir, frame, CH.noah, F().lantern)});
  if (mode!=='title') pushCombatItems(items, cx, cy);
  items.sort((a,b)=>a.k-b.k);
  for (const it of items) it.d();
  drawSwing(cx,cy);
  if (mode==='play' || mode==='dialog'){
    const ob=objective(), tgt=ob.at && ob.at.npc;
    for (const n of npcs){ if (!vis(n)) continue;
      const x=Math.round(n.x-cx), y=Math.round(n.y-cy-36+(reduceMotion?0:Math.sin(time*4+n.x)*1.5));
      if (x<-12||y<-12||x>VW+12||y>VH+12) continue;
      if ((C.says||[]).some(sy => sy.ref===n)) continue;
      if (n.id===tgt) bubble(x,y,true); else if (!S0.met.includes(n.id)) bubble(x,y,false); }
  }

  // sparkles for memories and the watch
  const tw = reduceMotion?1:(Math.sin(time*4)+1)/2;
  for (const o of objects){ if (!(o.mem && !S0.mems.includes(o.mem)) && !(o.sparkle && (!o.when||o.when()))) continue;
    const x=o.x*T+8-cx, y=o.y*T+2-cy - (o.mem==='coat'||o.mem==='tree'?8:0); if (x<-10||y<-10||x>VW+10||y>VH+10) continue;
    ctx.globalAlpha=.4+.6*tw; ctx.fillStyle='#fff6c8'; ctx.fillRect(x,y-2,1,5); ctx.fillRect(x-2,y,5,1); ctx.globalAlpha=1; }
  // carving hint once Hale asks
  if (F().hale1 && !has('carving')){ const x=29*T+8-cx, y=46*T-6-cy; ctx.globalAlpha=.3+.6*tw; ctx.fillStyle='#fff6c8'; ctx.fillRect(x,y-2,1,5); ctx.fillRect(x-2,y,5,1); ctx.globalAlpha=1; }

  // smoke
  if (!reduceMotion){ for (const h of houses) if (h.chimney && rng()<dt*(h.workshop?(phase===2?2:0):2.2)) smoke.push({x:h.x*T+h.chimney.x,y:h.y*T-h.extra+h.chimney.y,life:0,max:2.5+rng()*1.5,vx:6+rng()*4});
    if (rng()<dt*4) smoke.push({x:91.5*T, y:15*T, life:0, max:3, vx:-4+rng()*3, big:true}); }
  for (let i=smoke.length-1;i>=0;i--){ const p=smoke[i]; p.life+=dt; p.x+=p.vx*dt; p.y-=(p.big?14:9)*dt; if (p.life>p.max){ smoke.splice(i,1); continue; }
    const a=.45*(1-p.life/p.max), r=(p.big?2:1)+Math.floor(p.life*(p.big?2.4:1.4)); ctx.fillStyle=`rgba(200,195,210,${a})`; ctx.fillRect(Math.round(p.x-cx-r/2),Math.round(p.y-cy-r/2),r+1,r+1); }

  drawGroundAtmos(cx,cy);
  // tint
  const g=ctx.createLinearGradient(0,0,0,VH);
  if (phase===0){ g.addColorStop(0,'rgba(255,150,90,.16)'); g.addColorStop(.6,'rgba(255,170,110,.05)'); g.addColorStop(1,'rgba(70,50,120,.14)'); }
  else if (phase===1){ g.addColorStop(0,'rgba(255,110,80,.24)'); g.addColorStop(.5,'rgba(190,80,130,.14)'); g.addColorStop(1,'rgba(50,40,120,.26)'); }
  else if (phase===3){ g.addColorStop(0,'rgba(255,140,170,.32)'); g.addColorStop(.5,'rgba(190,150,225,.18)'); g.addColorStop(1,'rgba(70,100,175,.32)'); }
  else { g.addColorStop(0,'rgba(40,50,130,.22)'); g.addColorStop(1,'rgba(20,20,70,.28)'); }
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);

  // darkness with light cut-outs
  const inF = mode!=='title' && isForest(Math.floor(P.x/T), Math.floor(P.y/T)) ? 1 : 0;
  forestF += (inF-forestF)*Math.min(1,dt*2);
  const base=darkAmt() + (phase===3?.08:0) + forestF*.4;
  if (base>.01){
    dctx.globalCompositeOperation='source-over'; dctx.clearRect(0,0,VW,VH);
    dctx.fillStyle=`rgba(8,10,30,${Math.min(.93,base)})`; dctx.fillRect(0,0,VW,VH);
    dctx.globalCompositeOperation='destination-out';
    const cut=(x,y,r,a)=>{ if (x<-r||y<-r||x>VW+r||y>VH+r) return; const gg=dctx.createRadialGradient(x,y,0,x,y,r); gg.addColorStop(0,`rgba(0,0,0,${a})`); gg.addColorStop(.6,`rgba(0,0,0,${a*.5})`); gg.addColorStop(1,'rgba(0,0,0,0)'); dctx.fillStyle=gg; dctx.fillRect(x-r,y-r,r*2,r*2); };
    for (const h of houses) for (const [gx,gy] of h.glows){ if (h.workshop && phase!==2) continue; cut(h.x*T+gx-cx, h.y*T-h.extra+gy-cy+6, 26, .9); }
    if (phase>0) for (const [lx,ly] of lamps) cut(lx*T+8-cx, ly*T-6-cy, 46, .95);
    if (F().lantern && mode!=='title'){ const fl=reduceMotion?0:Math.sin(time*9)*2+Math.sin(time*23); cut(P.x-cx, P.y-10-cy, 78+fl, 1); }
    dctx.globalCompositeOperation='source-over';
    ctx.drawImage(dark,0,0);
  }

  // warm glows
  ctx.globalCompositeOperation='lighter';
  const glow=(x,y,r,a,col='255,190,100')=>{ if (x<-r||y<-r||x>VW+r||y>VH+r) return; const gg=ctx.createRadialGradient(x,y,0,x,y,r); gg.addColorStop(0,`rgba(${col},${a})`); gg.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=gg; ctx.fillRect(x-r,y-r,r*2,r*2); };
  for (const h of houses) for (const [gx,gy] of h.glows){ if (h.workshop && phase!==2) continue; glow(h.x*T+gx-cx, h.y*T-h.extra+gy-cy, 14, phase===2?.32:.2); }
  const flick=reduceMotion?0:Math.sin(time*7)*.02;
  if (phase>0) for (const [lx,ly] of lamps) glow(lx*T+8-cx, ly*T-12-cy, 30, .22+flick);
  if (F().lantern && mode!=='title') glow(P.x-cx+(P.dir==='left'?-4:4), P.y-8-cy, 34, .22+flick);
  if (!reduceMotion && (phase===1 || phase===2 || forestF>.3)){
    for (const list of [flies, rflies]) for (const f of list){ f.p+=dt*f.s; const x=f.x+Math.sin(f.p)*10-cx, y=f.y+Math.cos(f.p*.7)*8-cy; if (x<0||y<0||x>VW||y>VH) continue;
      const a=.5+.5*Math.sin(f.p*3); ctx.fillStyle=`rgba(230,255,150,${a*.9})`; ctx.fillRect(Math.round(x),Math.round(y),1,1); glow(x,y,4,a*.25,'200,255,120'); }
  }
  ctx.globalCompositeOperation='source-over';

  drawSkyAtmos(cx,cy,dt);
  drawCombatFX(cx,cy);
  // objective marker
  if (mode==='play' && SETTINGS.marker){
    const o=objective(); if (o.at && !o.at.scene){ const x=o.at.x-cx, y=o.at.y-cy, bob=reduceMotion?0:Math.sin(time*4)*2;
      const onScreen = x>8&&y>8&&x<VW-8&&y<VH-8;
      if (onScreen && o.at.npc){ /* the ! bubble marks it */ } else if (onScreen){ ctx.fillStyle='#070a12'; ctx.fillRect(x-4,y-6+bob,9,6); ctx.fillStyle='#e98c7a'; ctx.fillRect(x-3,y-5+bob,7,2); ctx.fillRect(x-2,y-3+bob,5,1); ctx.fillRect(x-1,y-2+bob,3,1); ctx.fillRect(x,y-1+bob,1,1); }
      else { const ang=Math.atan2(y-VH/2, x-VW/2); const rx=VW/2-14, ry=VH/2-14; const k=Math.min(Math.abs(rx/Math.cos(ang)), Math.abs(ry/Math.sin(ang)));
        const ax=VW/2+Math.cos(ang)*k, ay=VH/2+Math.sin(ang)*k;
        ctx.save(); ctx.translate(Math.round(ax),Math.round(ay)); ctx.rotate(ang);
        ctx.fillStyle='#070a12'; ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(-6,-7); ctx.lineTo(-3,0); ctx.lineTo(-6,7); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#e98c7a'; ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(-4,-5); ctx.lineTo(-2,0); ctx.lineTo(-4,5); ctx.closePath(); ctx.fill(); ctx.restore(); }
    }
  }
}

function bubble(x,y,main){
  if (main){
    ctx.fillStyle='#070a12'; ctx.fillRect(x-5,y-6,11,13); ctx.fillRect(x-1,y+7,3,2);
    ctx.fillStyle='#f6c56a'; ctx.fillRect(x-4,y-5,9,11); ctx.fillRect(x,y+6,1,2);
    ctx.fillStyle='#fff3c4'; ctx.fillRect(x-4,y-5,9,1);
    ctx.fillStyle='#3a2416'; ctx.fillRect(x-1,y-3,3,5); ctx.fillRect(x-1,y+3,3,2);
  } else {
    ctx.fillStyle='#070a12'; ctx.fillRect(x-6,y-1,13,8); ctx.fillStyle='#c9cfe3'; ctx.fillRect(x-5,y,11,6); ctx.fillRect(x-1,y+6,2,2);
    ctx.fillStyle='#3a4872'; ctx.fillRect(x-3,y+2,2,2); ctx.fillRect(x,y+2,2,2); ctx.fillRect(x+3,y+2,2,2);
  }
}
function drawProp(p,x,y){
  if (p.kind==='ruin'){ const hgt=[10,16,6][p.v]; ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x,y+12,16,3);
    ctx.fillStyle='#6f6a62'; ctx.fillRect(x,y+14-hgt,16,hgt+2); ctx.fillStyle='#8d877d'; ctx.fillRect(x,y+14-hgt,16,3);
    ctx.fillStyle='#5a554e'; for (let j=y+17-hgt;j<y+16;j+=4) ctx.fillRect(x,j,16,1); ctx.fillRect(x+7,y+14-hgt,1,hgt);
    ctx.fillStyle='#3f6630'; if (p.v!==2) ctx.fillRect(x+2+p.v*5,y+14-hgt,4,2); return; }
  if (p.kind==='ruincol'){ ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x+2,y+12,12,3); ctx.fillStyle='#7d776d'; ctx.fillRect(x+4,y-14,8,28); ctx.fillStyle='#9a948a'; ctx.fillRect(x+4,y-14,2,28); ctx.fillRect(x+2,y-16,12,3); ctx.fillStyle='#5a554e'; ctx.fillRect(x+3,y-12,10,1); ctx.fillStyle='#3f6630'; ctx.fillRect(x+9,y-3,3,6); return; }
  if (p.kind==='altar'){ ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x,y+12,16,3); ctx.fillStyle='#8d877d'; ctx.fillRect(x,y+2,16,12); ctx.fillStyle='#b8b2a6'; ctx.fillRect(x,y+2,16,3); ctx.fillStyle='#5a554e'; ctx.fillRect(x+5,y+7,6,1); ctx.fillRect(x+7,y+5,2,5); ctx.fillStyle='#ffcf6a'; ctx.fillRect(x+7,y,2,2); return; }
  if (p.kind==='chest'){ const open=F().abbeyChest; ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x+1,y+12,14,3); ctx.fillStyle='#5a3a24'; ctx.fillRect(x+2,y+4,12,10); ctx.fillStyle='#8a8478'; ctx.fillRect(x+2,y+7,12,1); ctx.fillRect(x+7,y+6,2,3);
    if (open){ ctx.fillStyle='#3a2416'; ctx.fillRect(x+2,y,12,4); } else { ctx.fillStyle='#6b4a2f'; ctx.fillRect(x+2,y+2,12,3); } return; }
  if (p.kind==='wheel'){ const a=reduceMotion?0:time*1.2; ctx.fillStyle='#4a321f'; ctx.fillRect(x+6,y-8,4,22);
    for (let k=0;k<8;k++){ const an=a+k*Math.PI/4; ctx.fillStyle='#6b4a2f'; for (let r=2;r<12;r+=2) ctx.fillRect(Math.round(x+8+Math.cos(an)*r), Math.round(y+2+Math.sin(an)*r), 2, 2); }
    ctx.fillStyle='#8a6240'; ctx.fillRect(x+6,y,4,4); ctx.fillStyle='rgba(180,210,235,.5)'; if (!reduceMotion && Math.floor(time*6)%2) ctx.fillRect(x+12,y+12,3,2); return; }
  if (p.kind==='gate'){ ctx.fillStyle='#22252f'; ctx.fillRect(x,y-6,16,2); ctx.fillRect(x,y+8,16,2); for (let i=1;i<16;i+=3) ctx.fillRect(x+i,y-6,1,16);
    if (p.x===83){ ctx.fillStyle='#8a8478'; ctx.fillRect(x+12,y+1,8,2); ctx.fillStyle='#c9b46a'; ctx.fillRect(x+14,y+2,4,4); } return; }
  if (p.kind==='grate'){ const open=F().culvert; ctx.fillStyle='#1d2a3a'; ctx.fillRect(x+3,y+2,10,10);
    if (open){ ctx.fillStyle='#6b4a2f'; ctx.fillRect(x-2,y+3,4,9); for (let i=0;i<4;i++) ctx.fillRect(x-3+i,y+3+i*2,1,1); ctx.fillStyle='#3a2a1a'; ctx.fillRect(x+3,y+2,10,1); }
    else { ctx.fillStyle='#6b4a2f'; for (let i=4;i<14;i+=3) ctx.fillRect(x+i,y+2,1,10); ctx.fillRect(x+3,y+6,10,1); ctx.fillStyle='#a7aab4'; ctx.fillRect(x+7,y+5,3,3); ctx.fillStyle='#2f5a2a'; ctx.fillRect(x+1,y,4,3); ctx.fillRect(x+11,y+9,4,3); } return; }
  if (p.kind==='anvil'){ ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x+2,y+11,12,2); ctx.fillStyle='#3a3a40'; ctx.fillRect(x+5,y+5,6,7); ctx.fillStyle='#5a5c66'; ctx.fillRect(x+1,y+1,14,4); ctx.fillRect(x+12,y+2,4,2); ctx.fillStyle='#8a8c96'; ctx.fillRect(x+1,y+1,14,1); return; }
  if (p.kind==='postbox'){ ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x+3,y+12,10,2); ctx.fillStyle='#a3241e'; ctx.fillRect(x+4,y-4,8,16); ctx.fillStyle='#c83a2e'; ctx.fillRect(x+4,y-6,8,3); ctx.fillRect(x+5,y-4,2,15); ctx.fillStyle='#1a1418'; ctx.fillRect(x+5,y,6,1); ctx.fillStyle='#e8c46a'; ctx.fillRect(x+7,y+3,2,2); return; }
  ctx.fillStyle='rgba(20,15,40,.3)'; ctx.fillRect(x+1,y+12,14,2);
  if (p.kind==='bench'){ ctx.fillStyle='#4a321f'; ctx.fillRect(x-6,y+4,2,8); ctx.fillRect(x+20,y+4,2,8); ctx.fillStyle='#8a6240'; ctx.fillRect(x-7,y+2,30,3); ctx.fillRect(x-7,y+7,30,2); ctx.fillStyle='#a77d55'; ctx.fillRect(x-7,y+2,30,1); }
  else if (p.kind==='sign'){ ctx.fillStyle='#4a321f'; ctx.fillRect(x+7,y+2,2,11); ctx.fillStyle='#3a2416'; ctx.fillRect(x,y-4,16,8); ctx.fillStyle='#8a6240'; ctx.fillRect(x+1,y-3,14,6); ctx.fillStyle='#3a2416'; for(let i=0;i<5;i++) ctx.fillRect(x+3+i*2,y-1,1,2); }
  else if (p.kind==='scarecrow'){ ctx.fillStyle='#5a3d26'; ctx.fillRect(x+7,y-8,2,20); ctx.fillRect(x+1,y-4,14,2); ctx.fillStyle='#7a5a3a'; ctx.fillRect(x+3,y-5,10,9); ctx.fillStyle='#5e4430'; ctx.fillRect(x+3,y+1,2,2); ctx.fillRect(x+11,y+1,2,2); ctx.fillStyle='#e0c890'; ctx.fillRect(x+5,y-12,6,6); ctx.fillStyle='#3a2a1a'; ctx.fillRect(x+6,y-10,1,1); ctx.fillRect(x+9,y-10,1,1); ctx.fillStyle='#d9b35e'; ctx.fillRect(x+3,y-13,10,2); ctx.fillRect(x+5,y-15,6,2); }
  else if (p.kind==='well'){ ctx.fillStyle='#5f5a57'; ctx.fillRect(x,y,16,12); ctx.fillStyle='#8d8577'; ctx.fillRect(x+1,y+1,14,4); ctx.fillStyle='#1d2a3a'; ctx.fillRect(x+3,y+2,10,3); ctx.fillStyle='#4a321f'; ctx.fillRect(x+1,y-10,2,12); ctx.fillRect(x+13,y-10,2,12); ctx.fillStyle='#6d4b34'; ctx.fillRect(x-1,y-13,18,4); ctx.fillStyle='#8a3b2e'; ctx.fillRect(x-1,y-13,18,1); }
}
function drawTrain(x,y){
  const cars=[[0,40],[44,56],[104,56],[164,56]];
  for (const [o,len] of cars){ const yy=y+o;
    ctx.fillStyle='rgba(20,15,40,.35)'; ctx.fillRect(x+6,yy+3,40,len);
    ctx.fillStyle='#3a1c1c'; ctx.fillRect(x+4,yy,40,len); ctx.fillStyle=o===0?'#2b2f3a':'#6b2a2a'; ctx.fillRect(x+5,yy+1,38,len-2);
    ctx.fillStyle=o===0?'#3a404e':'#7f3434'; ctx.fillRect(x+9,yy+2,30,len-4);
    if (o){ ctx.fillStyle='#d9b35e'; ctx.fillRect(x+5,yy+1,38,1); for (let w=yy+6; w<yy+len-6; w+=9){ ctx.fillStyle='#f6c56a'; ctx.fillRect(x+4,w,2,5); ctx.fillRect(x+42,w,2,5);} }
    else { ctx.fillStyle='#1d1f26'; ctx.fillRect(x+19,yy+4,10,8); ctx.fillStyle='#d9b35e'; ctx.fillRect(x+12,yy+20,24,2); ctx.fillStyle='#ffe2a0'; ctx.fillRect(x+21,yy+1,6,2); }
  }
}
function drawCat(x,y){
  const f=cat.dir<0; const s=(dx,dy,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(f? x-dx-w : x+dx, y+dy, w, h); };
  const moving = cat.follow ? Math.hypot(P.x-cat.x,P.y-cat.y)>16 : Math.hypot(cat.tx-cat.x,cat.ty-cat.y)>2;
  const leg = moving && !reduceMotion && Math.floor(cat.anim*8)%2 ? 1 : 0;
  s(-5,0,10,2,'rgba(20,15,40,.3)');
  s(-5,-6,8,4,'#d9823a'); s(-4,-6,2,4,'#b8662a'); s(0,-6,1,4,'#b8662a');
  s(-5,-2,1,2+leg,'#b8662a'); s(1,-2,1,2+(1-leg),'#b8662a');
  s(2,-9,5,5,'#d9823a'); s(2,-10,1,2,'#d9823a'); s(6,-10,1,1,'#b8662a'); s(5,-7,1,1,'#1a1418'); s(6,-6,1,1,'#f5c0b0');
  s(-8,-8+(Math.floor(cat.anim*2)%2),3,1,'#d9823a'); s(-6,-7,1,2,'#d9823a');
}

// ================= start, menus, settings =================
const hasSave = () => { const s=loadSave(); return !!(s && s.f && (s.f.walt || (s.clues&&s.clues.length))); };
function refreshTitle(){ const h=hasSave(); $('#playBtn').textContent = h ? 'Continue' : 'Play'; $('#newBtn').style.display = h ? '' : 'none'; $('#newBtn').textContent='New game'; newArmed=false; }
let newArmed=false;
function continueGame(){
  const s=loadSave(); if (!s) return startNew();
  S0=s; delete S0.look; P.x=s.x; P.y=s.y; P.dir=s.dir||'down';
  if (s.cat){ cat.x=s.cat.x; cat.y=s.cat.y; cat.follow=s.cat.follow; cat.tx=cat.x; cat.ty=cat.y; }
  if (F().catHome){ cat.x=40*T; cat.y=25*T; cat.tx=cat.x; cat.ty=cat.y; }
  applyWorldState(); resetCombat(); lastObj=''; S0.tut=0;
  camX=P.x-VW/2; camY=P.y-VH/2; curZone='';
  $('#title').classList.remove('on');
  IN=null;
  if (S0.scene && SCN[S0.scene]){ if (SCN[S0.scene].ch4 && chap()===4) enterScene(S0.scene, {px:S0.x, py:S0.y, dir:S0.dir}, true); else if (SCN[S0.scene].out){ const o=SCN[S0.scene].out; P.x=o[0]*T+8; P.y=o[1]*T+10; } }
  if (F().end && chap()===1) return startChapter(2);
  if ((F().ch3end || F().gameEnd) && chap()===3) return startChapter(4);
  if (F().ch2end && chap()===2) return startChapter(3);
  beginPlay(); showZone('Welcome back', PHASE_NAMES[F().phase]);
  { const so=storySoFar(), cur=so.filter(x=>!x[0].startsWith('Side'))[so.filter(x=>!x[0].startsWith('Side')).length-1], last=cur ? cur[1][cur[1].length-1] : '';
    if (last) setTimeout(() => { if (mode==='play') dialog([{s:'recap', t:'Last time: '+last}, {s:'key', t:'Next: '+objective().t+'.'}]); }, 900); }
}
$('#playBtn').addEventListener('click', () => { ensureAudio(); if (IS_TOUCH_DEVICE) enterFullscreen(); hasSave() ? continueGame() : startNew(); });
$('#newBtn').addEventListener('click', () => {
  if (!newArmed){ newArmed=true; $('#newBtn').textContent='Erase save and start over?'; return; }
  startNew();
});
$('#setBtn').addEventListener('click', () => openSettings('title'));

// pause menu
function openPause(){ mode='pause'; $('#pause').classList.add('on'); for (const k in keys) keys[k]=false; $('#prompt').style.display='none'; setTimeout(()=>$('#pResume').focus(),0); }
function closePause(){ $('#pause').classList.remove('on'); mode='play'; }
$('#mBtn').addEventListener('click', () => { if (mode==='play') openPause(); else if (mode==='pause') closePause(); $('#mBtn').blur(); });
$('#pResume').addEventListener('click', closePause);
$('#pMap').addEventListener('click', () => { $('#pause').classList.remove('on'); mode='play'; openMap(); });
$('#pJournal').addEventListener('click', () => { $('#pause').classList.remove('on'); mode='play'; openJournal(); });
$('#pInv').addEventListener('click', () => { $('#pause').classList.remove('on'); mode='play'; openInv(); });
$('#pSettings').addEventListener('click', () => { $('#pause').classList.remove('on'); openSettings('pause'); });
$('#pQuit').addEventListener('click', () => {
  save(); $('#pause').classList.remove('on'); mode='title';
  document.body.classList.remove('playing'); $('#hud').style.display='none'; $('#topbtns').style.display='none';
  $('#zone').classList.remove('show'); $('#toast').classList.remove('show');
  refreshTitle(); $('#title').classList.add('on');
});

// settings
let settingsFrom='title', resetArmed=false;
function syncSettings(){
  $('#setMusic').value=Math.round(SETTINGS.music*100); $('#oMusic').textContent=Math.round(SETTINGS.music*100);
  $('#setSfx').value=Math.round(SETTINGS.sfx*100); $('#oSfx').textContent=Math.round(SETTINGS.sfx*100);
  const seg=(id,v)=>document.querySelectorAll(id+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===String(v)));
  seg('#setText',SETTINGS.text); seg('#setZoom',SETTINGS.zoom); seg('#setMarker',SETTINGS.marker?1:0); seg('#setMini',SETTINGS.minimap?1:0); seg('#setDiff',SETTINGS.diff||'normal'); seg('#setWeather', SETTINGS.weather===false ? 0 : 1);
  $('#resetRow').style.display = settingsFrom==='title' && hasSave() ? '' : 'none';
  $('#resetBtn').textContent='Erase save'; $('#resetBtn').classList.remove('armed'); resetArmed=false;
}
function openSettings(from){ settingsFrom=from; if (from==='title') $('#title').classList.remove('on'); mode='settings'; syncSettings(); $('#settings').classList.add('on'); }
function closeSettings(){ $('#settings').classList.remove('on');
  if (settingsFrom==='title'){ mode='title'; refreshTitle(); $('#title').classList.add('on'); } else { mode='pause'; $('#pause').classList.add('on'); } }
$('#setBack').addEventListener('click', closeSettings);
$('#setMusic').addEventListener('input', e => { SETTINGS.music=e.target.value/100; if (SETTINGS.muted && SETTINGS.music>0){ SETTINGS.muted=false; syncMute(); } $('#oMusic').textContent=e.target.value; Music.apply(); saveSettings(); });
$('#setSfx').addEventListener('input', e => { SETTINGS.sfx=e.target.value/100; $('#oSfx').textContent=e.target.value; Music.apply(); saveSettings(); });
$('#setSfx').addEventListener('change', () => chime());
document.querySelectorAll('#setText button').forEach(b => b.addEventListener('click', () => { SETTINGS.text=b.dataset.v; saveSettings(); syncSettings(); }));
document.querySelectorAll('#setZoom button').forEach(b => b.addEventListener('click', () => { SETTINGS.zoom=+b.dataset.v; saveSettings(); syncSettings(); resize(); }));
document.querySelectorAll('#setWeather button').forEach(b => b.addEventListener('click', () => { SETTINGS.weather = b.dataset.v==='1'; saveSettings(); syncSettings(); }));
document.querySelectorAll('#setDiff button').forEach(b => b.addEventListener('click', () => { SETTINGS.diff=b.dataset.v; saveSettings(); syncSettings(); }));
document.querySelectorAll('#setMini button').forEach(b => b.addEventListener('click', () => { SETTINGS.minimap=b.dataset.v==='1'; saveSettings(); syncSettings(); applyMini(); }));
document.querySelectorAll('#setMarker button').forEach(b => b.addEventListener('click', () => { SETTINGS.marker=b.dataset.v==='1'; saveSettings(); syncSettings(); }));
$('#resetBtn').addEventListener('click', () => {
  if (!resetArmed){ resetArmed=true; $('#resetBtn').textContent='Click again to erase'; $('#resetBtn').classList.add('armed'); return; }
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  syncSettings();
});
refreshTitle();
applyMini();
setInterval(() => { if (mode==='play') save(); }, 8000);

// ================= title screen atmosphere =================
(function(){
  const bg = document.getElementById('titleBg');
  if (!bg) return;
  const gc = bg.getContext('2d');
  let W2, H2, particles, stars;
  function resize2(){ W2=bg.width=window.innerWidth; H2=bg.height=window.innerHeight; }
  function initParticles(){
    stars = Array.from({length:90}, () => ({
      x: Math.random()*W2, y: Math.random()*H2,
      r: Math.random()*1.2+0.3,
      a: Math.random(), da: (Math.random()-.5)*.006,
      blink: Math.random()*Math.PI*2
    }));
    particles = Array.from({length:28}, () => mkFirefly());
  }
  function mkFirefly(){
    return {
      x: Math.random()*W2, y: Math.random()*H2*.9+H2*.05,
      vx: (Math.random()-.5)*.28, vy: -(Math.random()*.18+.06),
      a: 0, maxA: Math.random()*.72+.18,
      r: Math.random()*2.2+1.2,
      life: 0, maxLife: 180+Math.random()*260,
      hue: Math.random()<.6 ? 46 : (Math.random()<.5 ? 38 : 200)
    };
  }
  let raf2, t2=0;
  function frame2(){
    if (mode !== 'title' && mode !== 'settings'){ gc.clearRect(0,0,W2,H2); raf2=requestAnimationFrame(frame2); return; }
    t2++;
    gc.clearRect(0,0,W2,H2);
    // deep sky gradient
    const sky = gc.createRadialGradient(W2*.5,H2*.3,0, W2*.5,H2*.3,H2*.9);
    sky.addColorStop(0,'rgba(28,18,58,.55)');
    sky.addColorStop(.5,'rgba(10,10,28,.38)');
    sky.addColorStop(1,'rgba(2,3,10,.0)');
    // (sky wash removed so the live village shows through behind the title)
    // stars
    for (const s of (mode==='title' ? [] : stars)){
      s.blink += s.da;
      const a = s.a * (.55 + .45*Math.sin(s.blink));
      gc.beginPath(); gc.arc(s.x,s.y,s.r,0,Math.PI*2);
      gc.fillStyle=`rgba(220,225,255,${a})`; gc.fill();
    }
    // fireflies
    for (let i=0;i<particles.length;i++){
      const p = particles[i];
      p.life++; p.x+=p.vx; p.y+=p.vy;
      p.vx += (Math.random()-.5)*.04;
      if (p.life < 40) p.a = p.maxA * (p.life/40);
      else if (p.life > p.maxLife-40) p.a = p.maxA * ((p.maxLife-p.life)/40);
      else p.a = p.maxA * (.8+.2*Math.sin(p.life*.08));
      if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > W2+10){ particles[i]=mkFirefly(); particles[i].x=Math.random()*W2; particles[i].y=H2*.8+Math.random()*H2*.2; continue; }
      const grd = gc.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
      grd.addColorStop(0,`hsla(${p.hue},90%,78%,${p.a})`);
      grd.addColorStop(.4,`hsla(${p.hue},80%,60%,${p.a*.5})`);
      grd.addColorStop(1,`hsla(${p.hue},70%,50%,0)`);
      gc.beginPath(); gc.arc(p.x,p.y,p.r*5,0,Math.PI*2);
      gc.fillStyle=grd; gc.fill();
      gc.beginPath(); gc.arc(p.x,p.y,p.r*.7,0,Math.PI*2);
      gc.fillStyle=`hsla(${p.hue},100%,92%,${p.a})`; gc.fill();
    }
    raf2=requestAnimationFrame(frame2);
  }
  resize2(); initParticles();
  window.addEventListener('resize', () => { resize2(); initParticles(); });
  raf2 = requestAnimationFrame(frame2);
})();
window.__game = { ATM, bigQuestions: () => bigQuestions(), sceneNPCs: () => sceneNPCs(), cam: () => ({x:Math.round(camX), y:Math.round(camY)}), npcs, nearestT: () => { const t=nearest(); return t ? t.label : null; }, SCN, IN: () => IN, enterScene, leaveScene, ACHS: () => ACHS, CH, scout, greta: () => talkGreta(), C: () => C, killAll: () => C.enemies.slice().forEach(killEnemy), attack: () => attack(), Music, SETTINGS, P, S0: () => S0, F, mode: () => mode, interact, advance, choose, D, objective, teleport:(tx,ty)=>{P.x=tx*T+8;P.y=ty*T+10;}, cutNext };
requestAnimationFrame(step);
