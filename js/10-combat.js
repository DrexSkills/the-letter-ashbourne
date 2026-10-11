// The Letter — The Ashen: enemies, fighting, bosses, weapons, levels, day and night, Scout and Greta.
'use strict';

// ================= combat: the Ashen =================
// Since the fire, ash creatures ("the Ashen") crawl out of the fields and woods.
// The village and the station are safe; everywhere else they roam, more after dark.
const ETYPES = {
  crawler: { name:'Ash crawler', hp:1,  speed:48, r:6,  dmg:2, aggro:105, shards:1 },
  wisp:    { name:'Ember wisp',  hp:2,  speed:30, r:6,  dmg:2, aggro:135, shards:1, fly:true },
  wolf:    { name:'Shade hound', hp:4,  speed:40, r:8,  dmg:3, aggro:150, shards:3, lunge:true },
  warden:  { name:'The Cinder Warden', hp:22, speed:17, r:14, dmg:4, aggro:999, shards:15, boss:true },
};
const SAFE = [[34,5,65,47],[79,16,91,38],[17,32,29,40]];
const inSafe = (tx,ty) => SAFE.some(([a,b,c,d]) => tx>=a && tx<c && ty>=b && ty<d);
const C = { enemies:[], fx:[], texts:[], pickups:[], arrows:[], says:[], cd:0, swing:0, invul:0, flash:0, shake:0, spawnT:0, regenT:0, wave:null, swings:0, lastSafe:{x:86*T+8,y:30*T+10} };
const canFight = () => !!F().stick || chap()>=2;
const DIFF = () => ({ story:{dmg:.5, cap:.6}, normal:{dmg:1, cap:1}, hard:{dmg:1.5, cap:1.4} })[SETTINGS.diff||'normal'];
function hpInit(){ if (S0.maxhp==null) S0.maxhp=10; if (S0.hp==null) S0.hp=S0.maxhp; if (S0.shards==null) S0.shards=0; }

function spawnEnemy(t, x, y, wave){
  const d=ETYPES[t]; const e={ t, def:d, scene:IN, x, y, hp:d.hp, hit:0, kbx:0, kby:0, cd:1+Math.random(), state:'move', st:0, anim:Math.random()*9, wx:x, wy:y, wt:0, wave:wave||null, face:1, slamT:2.5, sumT:6 };
  C.enemies.push(e); return e;
}
function eBlocked(e,x,y){
  const tx=Math.floor(x/T), ty=Math.floor(y/T);
  if (IN){ const sc=SCN[IN]; if (tx<0||ty<0||tx>=sc.w||ty>=sc.h) return true; if (!e.wave && sc.outdoor && sceneSafeAt(tx,ty)) return true; if (e.def.fly) return false; return sceneSolidAt(tx,ty); }
  if (tx<0||ty<0||tx>=W||ty>=H) return true;
  if (!e.wave && inSafe(tx,ty)) return true;
  if (e.def.fly) return false;
  return solid[ty*W+tx]===1;
}
function tryMove(e, dx, dy){ if (!eBlocked(e, e.x+dx, e.y)) e.x+=dx; if (!eBlocked(e, e.x, e.y+dy)) e.y+=dy; }

function pickSpawnType(tx,ty){
  const look=LOOK(), r=Math.random();
  if (IN==='harlow') return r<.45?'crow':r<.75?'crawler':'wisp';
  if (tx>=72 && ty>=74) return r<.5?'wolf':r<.8?'wisp':'crow';          // the Abbey ruins are the most dangerous place
  if (ty>=OLD_H) return r<.35?'crawler':r<.6?'wisp':r<.8?'crow':'wolf';  // the southern lands
  if (isForest(tx,ty)) return look===2 ? (r<.45?'wolf':r<.8?'wisp':'crawler') : (r<.25?'wolf':r<.6?'wisp':'crawler');
  if (look===0 || look===4) return r<.85?'crawler':'wisp';
  if (look===2) return r<.35?'crawler':r<.7?'wisp':'wolf';
  return r<.55?'crawler':r<.85?'wisp':'wolf';
}
function trySpawn(){
  if (IN){ const sc=SCN[IN]; if (!sc.spawns) return; if (C.enemies.filter(e=>!e.wave).length >= Math.round(7*DIFF().cap)) return;
    for (let k=0;k<8;k++){ const a=Math.random()*Math.PI*2, d=150+Math.random()*80, x=P.x+Math.cos(a)*d, y=P.y+Math.sin(a)*d, tx=Math.floor(x/T), ty=Math.floor(y/T);
      if (sceneSolidAt(tx,ty) || sceneSafeAt(tx,ty)) continue; spawnEnemy(pickSpawnType(tx,ty), tx*T+8, ty*T+12); return; }
    return; }
  const look=LOOK();
  const cap = Math.round(([3,6,9,5][look] ?? 4) * DIFF().cap);
  const roaming = C.enemies.filter(e=>!e.wave).length;
  if (roaming >= cap) return;
  for (let k=0;k<8;k++){
    const a=Math.random()*Math.PI*2, d=170+Math.random()*80;
    const x=P.x+Math.cos(a)*d, y=P.y+Math.sin(a)*d, tx=Math.floor(x/T), ty=Math.floor(y/T);
    if (tx<1||ty<1||tx>=W-1||ty>=H-1 || inSafe(tx,ty) || solid[ty*W+tx]) continue;
    if (isForest(tx,ty) && !F().lantern) continue;
    if (tx>=78 && tx<=89 && ty>=3 && ty<=14) continue;   // never inside the shed yard
    spawnEnemy(pickSpawnType(tx,ty), tx*T+8, ty*T+12); return;
  }
}

function burst(x,y,n,cols){ for (let i=0;i<n;i++){ const a=Math.random()*6.28, s=20+Math.random()*60; C.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life:.5+Math.random()*.6,col:cols[i%cols.length]}); } }
function floatText(x,y,t,col){ C.texts.push({x,y,t,col:col||'#f2c27a',life:1}); }

function attack(){
  if (C.cd>0 || !canFight() || mode!=='play') return;
  wInit(); const w=curW(); C.cd=w.cd; C.swing=.18; C.swings++;
  const lan=!!F().lantern, v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir];
  const dmg=(w.dmg+(lan?1:0))*dmgMult();
  if (w.ranged){ C.swing=0; C.arrows.push({x:P.x+v[0]*8, y:P.y-10+v[1]*6, vx:v[0]*290, vy:v[1]*290, life:.8, dmg, fire:lan}); beep(520,.05,'triangle',.05); beep(300,.08,'triangle',.03,.02); return; }
  beep(S0.weapon==='axe'?160:260,.07,'triangle',.05); beep(180,.05,'triangle',.03,.03);
  const reach=w.reach+(lan?3:0), hx=P.x+v[0]*13, hy=P.y-9+v[1]*13;
  for (const e of C.enemies.slice()){ const ey=e.y-e.def.r-(e.def.fly?8:0); if (Math.hypot(e.x-hx, ey-hy) < reach + e.def.r*.6) damageEnemy(e, dmg, v); }
  let hitN=null, hd=reach;
  for (const n of (IN ? sceneNPCs() : npcs.filter(vis))){ const d=Math.hypot(n.x-hx, (n.y-10)-hy); if (d < hd){ hd=d; hitN=n; } }
  if (hitN) bonkNPC(hitN, v);
  else if (!IN && Math.hypot(cat.x-hx, cat.y-6-hy) < reach-4) bonkCat(v);
}
function damageEnemy(e, dmg, v){
  e.hp-=dmg; e.hit=.15; const kb=e.def.boss?40:150; e.kbx=v[0]*kb; e.kby=v[1]*kb;
  if (e.state==='wind'||e.state==='lunge'){ e.state='move'; e.cd=1.2; }
  beep(e.def.boss?110:150,.07,'square',.05);
  burst(e.x, e.y-e.def.r, 5, ['#ffcf6a','#e8763a']);
  C.shake=Math.max(C.shake,.08);
  if (e.hp<=0) killEnemy(e);
}
function killEnemy(e){
  C.enemies.splice(C.enemies.indexOf(e),1); S0.kills=(S0.kills||0)+1;
  burst(e.x, e.y-e.def.r, e.def.boss?60:14, ['#ffcf6a','#e8763a','#8a8494','#c94a2a']);
  beep(90,.18,'sawtooth',.04); beep(60,.25,'triangle',.04,.05);
  addShards(e.def.shards, e.x, e.y-20); addXP(e.def.xp||2, e.x, e.y-20);
  if (Math.random() < (e.def.boss?1:.18)) C.pickups.push({x:e.x, y:e.y, t:'heart', life:14});
  if (e.def.boss){ C.shake=.5; $('#bossbar').classList.remove('on'); }
}
function addShards(n,x,y){
  hpInit(); const before=Math.floor(S0.shards/10); S0.shards+=n; floatText(x,y,'+'+n+' ✦');
  refreshHearts();
}
function hurtPlayer(raw, fromX, fromY){
  if (C.invul>0 || mode!=='play') return;
  hpInit(); C.noHit=false;
  const dmg=Math.max(1, Math.round(raw*DIFF().dmg));
  S0.hp=Math.max(0,S0.hp-dmg); C.invul=1.1; C.flash=.35; C.shake=.25;
  const a=Math.atan2(P.y-fromY, P.x-fromX); C.pkx=Math.cos(a)*170; C.pky=Math.sin(a)*170;
  beep(120,.18,'sawtooth',.06); beep(80,.22,'square',.03,.04);
  refreshHearts();
  if (S0.hp<=0) blackout();
}
function blackout(){
  mode='dialog'; const fd=$('#fade'); fd.classList.add('on');
  setTimeout(() => {
    for (const e of C.enemies.slice()) if (!e.wave || true) C.enemies.splice(C.enemies.indexOf(e),1);
    if (C.wave){ const w=C.wave; C.wave=null; $('#bossbar').classList.remove('on'); if (w==='ws') F().wsWave=0; if (w==='boss') F().bossStarted=0; if (w==='pf') F().pfStarted=0; if (w==='heart'){ F().heartStarted=0; F().safeOpen=0; } }
    if (IN && SCN[IN].ch4){ enterScene('harlow', {x:4, y:10, dir:'right'}, true); } else { if (IN){ IN=null; } P.x=C.lastSafe.x; P.y=C.lastSafe.y; } S0.hp=S0.maxhp; C.invul=2; refreshHearts();
    camX=P.x-VW/2; camY=P.y-VH/2;
    fd.classList.remove('on'); mode='play';
    dialog([{s:'narr', t:'Everything goes dark. You wake up later, aching, somewhere safe. The Ashen never follow anyone into town.'}, {s:'noah', t:'(Rest in the village to heal. Then try again — maybe with a different approach.)'}]);
  }, 700);
}

// scripted fights
const WAVES = {
  heart:{ start: () => { F().heartStarted=1; $('#bossbar').classList.add('on'); return [['heart',7,3]]; },
        done: () => { F().heartDown=1; save(); dialog([{s:'narr', t:'The Ashen Heart bursts into a harmless shower of grey flakes.'}, {s:'narr', t:'At the very back of the safe, untouched by fire: a heavy leather book. The original branch-line ledger, 2006 — every page signed by Victor Ashcombe.'}, () => addClue('original'), {s:'noah', t:'(This is it. Now upstairs — and out.)'}]); } },
  ws: { start: () => { F().wsWave=1; return [['wolf',3,8],['wolf',11,8],['wisp',12,2]]; },
        done: () => { F().wsDone=1; dialog([{s:'narr', t:'The last hound crumbles into a drift of grey ash, still warm.'}, {s:'noah', t:'(Like the fire never really went out out here. The workshop door — now.)'}]); } },
  boss:{ start: () => { F().bossStarted=1; $('#bossbar').classList.add('on'); return [['warden',84,11]]; },
        done: () => { F().bossDown=1; if (C.noHit) unlockAch('untouchable'); save(); dialog([{s:'narr', t:'The Cinder Warden folds in on itself and collapses into a heap of cold ash.'}, {s:'narr', t:'Behind where it stood, the engine shed’s doorway is clear.'}, {s:'noah', t:'(The inspection pit. The ledger has to be in there.)'}]); } },
  pf:  { start: () => { F().pfStarted=1; return [['wolf',83,25],['wolf',88,27],['wisp',85,37],['wolf',83,35],['wisp',89,31],['crawler',86,24]]; },
        done: () => { F().pfDone=1; F().eliasHere=1; save(); dialog([{s:'narr', t:'The last of them falls apart in a swirl of embers. The platform lamps steady.'}, {s:'narr', t:'At the far end of the platform, someone lifts a lantern.'}]); } },
};
function startWave(id){
  const list=WAVES[id].start(); C.wave=id; if (ETYPES[list[0][0]].boss){ $('#bossbar .bn').textContent=ETYPES[list[0][0]].name; C.noHit=true; }
  for (const [t,tx,ty] of list){ const e=spawnEnemy(t, tx*T+8, ty*T+12, id); e.cd=1.2; }
  if (id==='boss') refreshBoss();
}
function checkWaveTriggers(){
  if (C.wave || mode!=='play') return;
  if (IN){ if (IN==='archive' && F().safeOpen && !F().heartDown) startWave('heart'); return; }
  const f=F(), tx=P.x/T, ty=P.y/T;
  if (chap()===1 && f.key && f.lantern && !f.wsDone && !f.end && Math.hypot(P.x-(7*T+8), P.y-(9*T)) < 95){
    dialog([{s:'narr', t:'Shapes slide out from between the trees — low, black, with eyes like coals.'}, {s:'noah', t:'(Shade hounds. They’re guarding the workshop. Here goes.)'}], () => startWave('ws')); return; }
  if (chap()===2 && f.culvert && !f.bossDown && tx>=79 && tx<89 && ty>=9 && ty<14){
    dialog([{s:'narr', t:'The ash in the yard begins to move. It pours together, piece by piece, into something huge.'}, {s:'noah', t:'(Whatever the fire left behind, it’s guarding the shed.)'}], () => startWave('boss')); return; }
  if (chap()===3 && f.confess && !f.pfDone){
    dialog([{s:'narr', t:'The platform lamps flicker. Shapes climb up out of the dark between the rails — more Ashen than you’ve ever seen.'}, {s:'noah', t:'(Dad is out there somewhere. I have to hold the platform.)'}], () => startWave('pf')); return; }
}
function refreshBoss(){ const b=C.enemies.find(e=>e.def.boss); if (!b) return; $('#bossbar .fill').style.width = Math.max(0,b.hp/b.def.hp*100)+'%'; }

function updateCombat(dt){
  hpInit();
  C.cd-=dt; C.swing-=dt; C.invul-=dt; C.flash-=dt; C.shake-=dt;
  // player knockback
  if (C.pkx||C.pky){ const nx=P.x+C.pkx*dt, ny=P.y+C.pky*dt; if (!blocked(nx,P.y)) P.x=nx; if (!blocked(P.x,ny)) P.y=ny; C.pkx*=.82; C.pky*=.82; if (Math.abs(C.pkx)+Math.abs(C.pky)<5) C.pkx=C.pky=0; }
  if (keys.atk) attack();
  for (const a of C.arrows.slice()){
    a.life-=dt; a.x+=a.vx*dt; a.y+=a.vy*dt; const tx=Math.floor(a.x/T), ty=Math.floor((a.y+8)/T);
    let gone = a.life<=0 || arrowBlocked(tx,ty);
    if (!gone) for (const e of C.enemies){ const ey=e.y-e.def.r-(e.def.fly?8:0); if (Math.hypot(e.x-a.x, ey-a.y) < e.def.r+6){ damageEnemy(e, a.dmg, [Math.sign(a.vx), Math.sign(a.vy)]); gone=true; break; } }
    if (!gone) for (const n of (IN ? sceneNPCs() : npcs.filter(vis))){ if (Math.hypot(n.x-a.x, (n.y-12)-a.y) < 8){ bonkNPC(n, [Math.sign(a.vx), Math.sign(a.vy)]); gone=true; break; } }
    if (gone){ C.arrows.splice(C.arrows.indexOf(a),1); burst(a.x,a.y,3,['#c9b28a']); }
  }
  const ptx=Math.floor(P.x/T), pty=Math.floor(P.y/T);
  if (safeAt(ptx,pty)){ if (!IN) C.lastSafe={x:P.x,y:P.y}; C.regenT+=dt; if (C.regenT>2.5 && S0.hp<S0.maxhp){ C.regenT=0; S0.hp++; refreshHearts(); } } else C.regenT=0;
  if (canFight() && !C.wave && LOOK()===2){ C.spawnT-=dt; if (C.spawnT<=0){ C.spawnT=.9; trySpawn(); } }
  checkWaveTriggers();
  for (const e of C.enemies.slice()){
    const d=e.def; e.anim+=dt; e.hit-=dt;
    if (!e.wave && (LOOK()===0||LOOK()===3) && Math.random()<dt*.9){ burst(e.x,e.y-e.def.r,12,['#ffcf6a','#e8763a']); C.enemies.splice(C.enemies.indexOf(e),1); continue; }
    if (!e.wave && Math.hypot(e.x-P.x,e.y-P.y)>380){ C.enemies.splice(C.enemies.indexOf(e),1); continue; }
    if (e.kbx||e.kby){ tryMove(e, e.kbx*dt, e.kby*dt); e.kbx*=.8; e.kby*=.8; if (Math.abs(e.kbx)+Math.abs(e.kby)<4) e.kbx=e.kby=0; }
    const dx=P.x-e.x, dy=P.y-e.y, dist=Math.hypot(dx,dy)||1;
    const playerSafe = safeAt(ptx,pty) && !e.wave;
    e.face = dx<0?-1:1;
    e.cd-=dt;
    if (d.boss){
      e.slamT-=dt; e.sumT-=dt;
      if (e.state==='slam'){ e.st-=dt; if (e.st<=0){ e.state='move'; C.shake=.3; beep(70,.3,'sawtooth',.06); burst(e.x,e.y-4,24,['#e8763a','#8a8494']); if (Math.hypot(P.x-e.x,P.y-e.y)<46) hurtPlayer(d.dmg, e.x, e.y); } }
      else {
        if (dist>20) tryMove(e, dx/dist*d.speed*dt, dy/dist*d.speed*dt);
        if (e.slamT<=0){ e.state='slam'; e.st=.85; e.slamT=2.6+Math.random(); }
        const sumT_=e.t==='heart'?'crow':'wisp'; if (e.sumT<=0 && C.enemies.filter(x=>x.t===sumT_).length<4){ e.sumT=7; for (let i=0;i<2;i++){ const w=spawnEnemy(sumT_, e.x+(i?24:-24), e.y-10, e.wave); w.cd=1; } burst(e.x,e.y-20,12,['#ffcf6a']); }
      }
      if (dist < d.r+7) hurtPlayer(d.dmg-1, e.x, e.y);
      refreshBoss(); continue;
    }
    if (d.lunge && e.state==='wind'){ e.st-=dt; if (e.st<=0){ e.state='lunge'; e.st=.32; } continue; }
    if (d.lunge && e.state==='lunge'){ e.st-=dt; tryMove(e, e.lx*175*dt, e.ly*175*dt); if (e.st<=0){ e.state='move'; e.cd=1.5; } }
    else if (!playerSafe && dist < d.aggro){
      if (d.lunge && dist<62 && e.cd<=0){ e.state='wind'; e.st=.45; e.lx=dx/dist; e.ly=dy/dist; continue; }
      const sp = d.speed * (d.fly ? 1 : 1) * (e.hit>0?.3:1);
      tryMove(e, dx/dist*sp*dt + (d.fly?Math.sin(e.anim*3)*8*dt:0), dy/dist*sp*dt);
    } else {
      e.wt-=dt; if (e.wt<=0){ e.wt=1.5+Math.random()*2; e.wx=e.x+(Math.random()-.5)*80; e.wy=e.y+(Math.random()-.5)*80; }
      const wx=e.wx-e.x, wy=e.wy-e.y, wd=Math.hypot(wx,wy); if (wd>3) tryMove(e, wx/wd*d.speed*.35*dt, wy/wd*d.speed*.35*dt);
    }
    if (!playerSafe && dist < d.r+6) hurtPlayer(d.dmg, e.x, e.y);
  }
  if (C.wave && !C.enemies.some(e=>e.wave===C.wave)){ const w=C.wave; C.wave=null; WAVES[w].done(); refreshHUD(); }
  // pickups
  for (const p of C.pickups.slice()){ p.life-=dt; if (p.life<=0){ C.pickups.splice(C.pickups.indexOf(p),1); continue; }
    if (Math.hypot(p.x-P.x,p.y-P.y)<14){ C.pickups.splice(C.pickups.indexOf(p),1); S0.hp=Math.min(S0.maxhp,S0.hp+2); refreshHearts(); beep(880,.08,'triangle',.05); beep(1175,.1,'triangle',.04,.06); floatText(P.x,P.y-26,'+♥','#e86a6a'); } }
}

function updateFX(dt){
  for (const n of [...npcs, ...sceneNPCs()]){ if (n.bx) n.bx*=.8; if (n.by) n.by*=.8; }
  for (const sy of C.says.slice()){ sy.life-=dt; if (sy.life<=0) C.says.splice(C.says.indexOf(sy),1); }
  for (const p of C.fx.slice()){ p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=60*dt; p.vx*=.96; if (p.life<=0) C.fx.splice(C.fx.indexOf(p),1); }
  for (const t of C.texts.slice()){ t.life-=dt; t.y-=18*dt; if (t.life<=0) C.texts.splice(C.texts.indexOf(t),1); }
}

// drawing
function drawEnemy(e, x, y){
  const W_=e.hit>0, c = col => W_ ? '#fff4e0' : col, f=e.face;
  const R=(dx,dy,w,h,col)=>{ ctx.fillStyle=c(col); ctx.fillRect(f<0 ? x-dx-w : x+dx, y+dy, w, h); };
  const t=e.anim;
  if (e.t==='crawler'){
    R(-7,-1,14,2,'rgba(20,15,40,.35)');
    const lg=Math.floor(t*12)%2;
    R(-6,-7,11,6,'#3a3438'); R(-5,-8,8,2,'#4a4448'); R(-4,-5,3,1,'#e8763a'); R(1,-6,2,1,'#e8763a');
    R(4,-6,3,4,'#2e292c'); R(6,-5,1,1,'#ffcf6a');
    R(-6,-2+lg,1,2,'#2e292c'); R(-2,-2+(1-lg),1,2,'#2e292c'); R(2,-2+lg,1,2,'#2e292c');
  } else if (e.t==='wisp'){
    const by=Math.round(Math.sin(t*4)*2)-12;
    R(-4,0,8,2,'rgba(20,15,40,.25)');
    R(-4,by-3,8,8,'#c94a2a'); R(-3,by-4,6,10,'#e8763a'); R(-2,by-2,4,5,'#ffcf6a'); R(-1,by-1,2,2,'#fff4d0');
    R(-2,by+6+Math.floor(t*8)%2,2,2,'#e8763a'); R(1,by+8,1,1,'#c94a2a');
  } else if (e.t==='wolf'){
    const lg=Math.floor(t*10)%2, sh = e.state==='wind' ? (Math.floor(t*30)%2?1:-1) : 0;
    x+=sh;
    R(-11,-1,22,3,'rgba(20,15,40,.35)');
    R(-10,-11,15,8,'#2a2528'); R(-9,-12,12,2,'#3a3438'); R(-12,-12,3,2,'#2a2528'); R(-14,-14,3,3,'#2a2528');
    R(-6,-9,4,1,'#c94a2a'); R(-1,-8,3,1,'#c94a2a');
    R(4,-14,7,7,'#2a2528'); R(5,-16,2,2,'#2a2528'); R(8,-16,2,2,'#2a2528'); R(10,-11,3,3,'#221e20');
    R(8,-12,2,1, e.state==='wind' ? '#ffffff' : '#ff5a3a');
    R(-9,-4,2,4-lg,'#221e20'); R(-5,-4,2,3+lg,'#221e20'); R(1,-4,2,4-lg,'#221e20'); R(5,-4,2,3+lg,'#221e20');
  } else if (e.t==='crow'){
    const by=Math.round(Math.sin(t*6)*2)-14, flap=Math.floor(t*10)%2;
    R(-5,-1,10,2,'rgba(20,15,40,.25)');
    R(-4,by-3,8,5,'#1e1a1e'); R(3,by-5,4,4,'#1e1a1e'); R(7,by-4,2,1,'#c9a046'); R(5,by-4,1,1,'#ff5a3a');
    if (flap){ R(-8,by-7,6,3,'#2a2528'); R(-1,by-8,5,3,'#2a2528'); } else { R(-8,by-1,6,3,'#2a2528'); R(-1,by,5,3,'#2a2528'); }
    R(-7,by-2,3,2,'#2a2528'); R(-2,by-2,2,1,'#e8763a');
  } else if (e.t==='heart'){
    const by=Math.round(Math.sin(t*2)*3)-26;
    if (e.state==='slam'){ const k=1-e.st/.85; ctx.fillStyle=`rgba(232,90,58,${.15+.35*k})`; ctx.beginPath(); ctx.ellipse(x, y-2, 46*k+6, 22*k+3, 0, 0, Math.PI*2); ctx.fill(); }
    R(-18,-2,36,4,'rgba(20,15,40,.4)');
    for (let i=0;i<10;i++){ const a=t*1.5+i*.628; R(Math.round(Math.cos(a)*19)-2, by+Math.round(Math.sin(a)*8)-1, 4,3, i%2?'#3a3438':'#4a4448'); }
    R(-10,by-10,20,20,'#2e292c'); R(-8,by-12,16,24,'#3a3236'); R(-6,by-6,12,12,'#c94a2a'); R(-4,by-4,8,8,'#e8763a'); R(-2,by-2,4,4,'#ffcf6a'); R(-1,by-1,2,2,'#fff4d0');
    R(-12,by-4,3,1,'#e8763a'); R(9,by+3,3,1,'#e8763a'); R(-5,by-13,2,2,'#ffcf6a'); R(3,by-13,2,2,'#ffcf6a');
  } else if (e.t==='warden'){
    if (e.state==='slam'){ const k=1-e.st/.85; ctx.fillStyle=`rgba(232,90,58,${.15+.35*k})`; ctx.beginPath(); ctx.ellipse(x, y-2, 46*k+6, 22*k+3, 0, 0, Math.PI*2); ctx.fill(); }
    R(-16,-2,32,4,'rgba(20,15,40,.4)');
    const bob = e.state==='slam' ? -Math.round((1-e.st/.85)*4) : Math.round(Math.sin(t*2));
    R(-10,-12,7,12,'#2e292c'); R(3,-12,7,12,'#2e292c');
    R(-14,-36+bob,28,26,'#3a3236'); R(-12,-38+bob,24,4,'#4a4448');
    R(-4,-30+bob,8,8,'#c94a2a'); R(-3,-29+bob,6,6,'#e8763a'); R(-1,-27+bob,2,2,'#fff4d0');
    R(-12,-24+bob,3,1,'#e8763a'); R(8,-32+bob,4,1,'#e8763a'); R(-8,-16+bob,1,4,'#e8763a');
    R(-22,-34+bob,8,20,'#2e292c'); R(14,-34+bob,8,20,'#2e292c'); R(-23,-16+bob,10,6,'#3a3236'); R(13,-16+bob,10,6,'#3a3236');
    R(-6,-46+bob,12,10,'#3a3236'); R(-4,-42+bob,2,2,'#ffcf6a'); R(2,-42+bob,2,2,'#ffcf6a');
  }
  if (!e.def.boss && e.hp<e.def.hp && e.hp>0){ const w=12; ctx.fillStyle='#070a12'; ctx.fillRect(x-w/2-1, y-((e.t==='wisp'||e.t==='crow')?28:e.t==='wolf'?22:14), w+2, 3); ctx.fillStyle='#e86a6a'; ctx.fillRect(x-w/2, y-((e.t==='wisp'||e.t==='crow')?27:e.t==='wolf'?21:13), Math.round(w*e.hp/e.def.hp), 1); }
}
function pushCombatItems(items, cx, cy){
  for (const e of C.enemies){ const x=Math.round(e.x-cx), y=Math.round(e.y-cy); if (x<-40||y<-60||x>VW+40||y>VH+40) continue; items.push({k:e.y, d:()=>drawEnemy(e,x,y)}); }
  if (!IN || F().pet) { const sc=scout, x=Math.round(sc.x-cx), y=Math.round(sc.y-cy); if (x>-30&&y>-30&&x<VW+30&&y<VH+40) items.push({k:sc.y, d:()=>drawDog(x,y,sc.dir,sc.moving,sc.anim)}); }
  for (const p of C.pickups){ const x=Math.round(p.x-cx), y=Math.round(p.y-cy); if (p.life<3 && Math.floor(p.life*8)%2) continue;
    items.push({k:p.y-1, d:()=>{ const b=Math.round(Math.sin(time*5)*1.5); ctx.fillStyle='#070a12'; ctx.fillRect(x-4,y-11+b,9,8); heartPix(ctx,x-3,y-10+b,'#e84a4a'); }}); }
}
function heartPix(g,x,y,col){ g.fillStyle=col; g.fillRect(x+1,y,2,1); g.fillRect(x+4,y,2,1); g.fillRect(x,y+1,7,2); g.fillRect(x+1,y+3,5,1); g.fillRect(x+2,y+4,3,1); g.fillRect(x+3,y+5,1,1); }
function drawSwing(cx,cy){
  drawArrows(cx,cy); drawSays(cx,cy);
  if (C.swing<=0 || !canFight()) return;
  const k=1-C.swing/.18, base={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0}[P.dir];
  const lan=!!F().lantern, w=curW(), r=(w.reach||23)-7+(lan?2:0), wide=S0.weapon==='axe'?1.6:1.1, sz=S0.weapon==='axe'?3:2;
  for (let i=0;i<9;i++){ const a=base-wide+2*wide*(i/8); if (i/8>k+.2) continue;
    const px=Math.round(P.x-cx+Math.cos(a)*r), py=Math.round(P.y-9-cy+Math.sin(a)*r);
    ctx.fillStyle = i/8>k-.25 ? (lan?'#fff1b8':w.col) : (lan?'rgba(255,200,110,.6)':'rgba(220,210,190,.45)'); ctx.fillRect(px-1,py-1,sz,sz); }
}
function drawCombatFX(cx,cy){
  ctx.globalCompositeOperation='lighter';
  for (const e of C.enemies){ const x=e.x-cx, y=e.y-cy; if (x<-30||y<-50||x>VW+30||y>VH+30) continue;
    if (e.t==='wisp'){ const by=Math.sin(e.anim*4)*2-10; const g=ctx.createRadialGradient(x,y+by,0,x,y+by,16); g.addColorStop(0,'rgba(255,170,80,.55)'); g.addColorStop(1,'rgba(255,170,80,0)'); ctx.fillStyle=g; ctx.fillRect(x-16,y+by-16,32,32); }
    else if (e.t==='warden'||e.t==='heart'){ const g=ctx.createRadialGradient(x,y-26,0,x,y-26,30); g.addColorStop(0,'rgba(255,120,60,.45)'); g.addColorStop(1,'rgba(255,120,60,0)'); ctx.fillStyle=g; ctx.fillRect(x-30,y-56,60,60); }
    else { ctx.fillStyle='rgba(255,90,58,.6)'; ctx.fillRect(Math.round(x+(e.face>0?(e.t==='wolf'?8:6):-(e.t==='wolf'?10:7))), Math.round(y-(e.t==='wolf'?12:6)), 2, 1); } }
  for (const p of C.fx){ ctx.fillStyle=p.col; ctx.globalAlpha=Math.max(0,Math.min(1,p.life*1.6)); ctx.fillRect(Math.round(p.x-cx),Math.round(p.y-cy),2,2); }
  ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  // floating numbers are drawn as crisp text in syncWorldText()
  ctx.globalAlpha=1;
  if (C.flash>0){ ctx.fillStyle=`rgba(200,30,30,${C.flash*.6})`; ctx.fillRect(0,0,VW,VH); }
}

// hearts HUD
const heartc = () => $('#heartc');
function refreshHearts(){
  hpInit(); const cv=heartc(); if (!cv) return;
  const n=S0.maxhp/2; cv.width=n*9; cv.height=7; const g=cv.getContext('2d'); g.clearRect(0,0,cv.width,7);
  for (let i=0;i<n;i++){ const v=S0.hp-i*2; heartPix(g,i*9,0,'#3a2a36'); if (v>=2) heartPix(g,i*9,0,'#e84a4a'); else if (v===1){ g.save(); g.beginPath(); g.rect(i*9,0,4,7); g.clip(); heartPix(g,i*9,0,'#e84a4a'); g.restore(); } }
  cv.style.width=(cv.width*2)+'px'; cv.style.height='14px';
  $('#shardLbl').textContent = canFight() ? '✦ '+S0.shards : '';
  try { wInit(); $('#lvlN').textContent=S0.lvl; $('#xpFill').style.width=Math.min(100,S0.xp/xpNeed(S0.lvl)*100)+'%';
    for (const id of ['#wpnIcon','#atkIcon']){ const g=$(id).getContext('2d'); g.clearRect(0,0,16,16); drawWeaponIcon(g, S0.weapon||'stick'); }
    document.body.classList.toggle('multiw', S0.weapons.length>1); } catch(e){}
  $('#hpRow').style.display = canFight() ? '' : 'none';
}

// ================= levels & weapons =================
const WEAPONS = {
  stick: { name:'Walking stick', dmg:1,   cd:.36, reach:23, col:'#f4ead2', price:0 },
  sword: { name:'Iron sword',    dmg:2,   cd:.28, reach:26, col:'#e8f0ff', price:15, desc:'Fast and sharp — double the stick’s damage.' },
  bow:   { name:'Hunting bow',   dmg:2,   cd:.48, ranged:true, col:'#f2c27a', price:20, desc:'Shoots arrows across the field. Hit the Ashen before they reach you.' },
  axe:   { name:'Woodsman’s axe',dmg:3.5, cd:.62, reach:30, col:'#ffb070', price:30, desc:'Slow and heavy. One wide swing hits everything around you.' },
};
function wInit(){
  if (!S0.weapons) S0.weapons=[];
  if (F().stick && !S0.weapons.includes('stick')) S0.weapons.unshift('stick');
  if (!S0.weapon || !S0.weapons.includes(S0.weapon)) S0.weapon = S0.weapons[S0.weapons.length-1] || 'stick';
  if (!S0.lvl) S0.lvl=1; if (S0.xp==null) S0.xp=0;
}
const curW = () => WEAPONS[S0.weapon] || WEAPONS.stick;
const dmgMult = () => 1 + .2*((S0.lvl||1)-1);
const xpNeed = l => 8 + l*8;
function addXP(n,x,y){
  wInit(); S0.xp+=n; floatText(x,y-10,'+'+n+' XP','#9fd6ff');
  while (S0.xp >= xpNeed(S0.lvl)){ S0.xp-=xpNeed(S0.lvl); S0.lvl++; S0.maxhp=Math.min(30,S0.maxhp+2); S0.hp=S0.maxhp;
    toast('Level up! You are level '+S0.lvl, '+1 heart · stronger attacks'); chime(); burst(P.x,P.y-12,40,['#ffe9a0','#f2c27a','#9fd6ff']); C.lvlGlow=1.2; }
  refreshHearts();
}
function cycleWeapon(dir=1){ wInit(); if (S0.weapons.length<2) return; const i=S0.weapons.indexOf(S0.weapon);
  S0.weapon=S0.weapons[(i+dir+S0.weapons.length)%S0.weapons.length]; beep(600,.05,'square',.03); floatText(P.x,P.y-30,curW().name,'#f2c27a'); refreshHearts(); }
function selectWeapon(i){ wInit(); if (S0.weapons[i]){ S0.weapon=S0.weapons[i]; beep(600,.05,'square',.03); floatText(P.x,P.y-30,curW().name,'#f2c27a'); refreshHearts(); } }
function giveWeapon(id){ wInit(); if (!S0.weapons.includes(id)) S0.weapons.push(id); S0.weapon=id; refreshHearts(); }
function drawWeaponIcon(g,id){
  const R=(x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(x,y,w,h); };
  if (id==='sword'){ for (let i=0;i<9;i++){ R(5+i,10-i,2,2,'#dfe6f2'); R(6+i,10-i,1,1,'#ffffff'); } R(3,10,6,2,'#c9a046'); R(5,8,2,6,'#c9a046'); R(2,13,3,2,'#6b4a2f'); R(1,14,2,2,'#c9a046'); }
  else if (id==='axe'){ for (let i=0;i<11;i++) R(3+i,13-i,2,2,'#8a6240'); R(9,1,6,7,'#b8c2d0'); R(10,2,4,5,'#e2e8f0'); R(14,2,1,5,'#ffffff'); R(8,3,2,3,'#6f6a66'); }
  else if (id==='bow'){ for (let y=2;y<14;y++){ const x=Math.round(4+Math.sin((y-2)/12*Math.PI)*-0+((y-8)*(y-8))/9); R(x,y,2,1,'#a77d55'); } R(3,2,2,2,'#6b4a2f'); R(3,13,2,2,'#6b4a2f'); R(3,3,1,11,'#efe3c8'); R(4,7,10,1,'#c9b28a'); R(13,6,2,3,'#dfe6f2'); }
  else { for (let i=0;i<12;i++) R(2+i,14-i,2,2, i%4===0?'#5a3d26':'#8a6240'); R(12,1,3,3,'#6b4a2f'); }
}

// ================= day & night =================
// A full day lasts about 11 real minutes. The Ashen only come out at night.
function todInit(){ if (S0.tod==null) S0.tod = [10,17.5,21,5.5,9,17.5,21][F().phase] ?? 10; if (!S0.day) S0.day=1; }
function tickClock(dt){ todInit(); const L=LOOK(); S0.tod += dt * (L===0 ? 1/28 : 1/22); if (S0.tod>=24){ S0.tod-=24; S0.day++; } }
function darkAmt(){ const t=S0.tod ?? 10; if (t>=7&&t<17) return 0; if (t>=17&&t<19.5) return .58*(t-17)/2.5; if (t>=5&&t<7) return .58*(1-(t-5)/2); return .58; }
function clockText(){ todInit(); const t=S0.tod, h=Math.floor(t), m=Math.floor((t-h)*60/10)*10; const hh=((h+11)%12)+1, ap=h<12?'am':'pm';
  const L=LOOK(); const name = L===0 ? (t<12?'Morning':'Afternoon') : ['','Dusk','Night','Dawn'][L];
  return `Day ${S0.day} · ${hh}:${String(m).padStart(2,'0')} ${ap} · ${name}`; }
function jumpTime(p){
  todInit(); const L=LOOK();
  if (p===1 && L===0) S0.tod=17.2;
  else if ((p===2||p===6) && L!==2) S0.tod = 19.6;
  else if (p===3){ S0.tod=5.3; S0.day++; }
  else if (p===5 && S0.tod<17) S0.tod=17.2;
}
function restUntilMorning(){
  unlockAch('rest');
  const fd=$('#fade'); fd.classList.add('on'); mode='dialog';
  setTimeout(() => { todInit(); if (S0.tod>=7) S0.day++; S0.tod=7.2; C.enemies=C.enemies.filter(e=>e.wave); S0.hp=S0.maxhp; refreshHearts(); fd.classList.remove('on'); mode='play';
    dialog([{s:'narr', t:'June lends you the armchair by the stove. You sleep better than you have in years.'}, {s:'narr', t:'Morning. Fully rested — and the Ashen have crumbled away in the sunlight.'}]); }, 800);
}

// ================= Scout the dog (pet) =================
const scout = { x:77*T+8, y:33*T+12, anim:0, cd:0, dir:-1, moving:false };
function talkScout(){
  const f=F();
  if (!f.pie){
    dialog([
      {s:'narr', t:'A scruffy brown dog with a torn ear. He backs away, growling — but his nose keeps twitching toward the village.'},
      {s:'noah', t:'(He’s starving. I bet he’d trust me if I brought him something to eat. June’s café sells meat pies.)'},
      () => { f.scoutSeen=1; },
    ]); return;
  }
  dialog([
    {s:'narr', t:'You crouch and hold out the meat pie. He looks at it. Then at you. Then the pie is gone, and so is the growl.'},
    {s:'narr', t:'His tag is half rusted away. You can just read one word: SCOUT.'},
    {s:'noah', t:'(Scout. Alright, boy. Let’s go.)'},
    () => { f.pet=1; toast('New companion!', 'Scout the dog fights the Ashen with you'); chime(); },
  ]);
}
function talkJunePie(){
  dialog([
    {s:'june', t:'Scout? That stray by the bridge. He’d follow anyone for a meat pie, that one.'},
    {s:'june', t:'Pie’s 5 ember shards, love. Since the Ashen came, shards are the only coin worth anything round here.'},
    {choice:[
      {t:'Buy a meat pie (5 ✦)', then: () => { if (S0.shards>=5){ S0.shards-=5; F().pie=1; refreshHearts(); return [{s:'june', t:'Fresh from the oven. Mind it doesn’t get eaten before it reaches him.'}, {s:'noah', t:'(Now back to the bridge — east of the village, south of the road.)'}]; }
        return [{s:'june', t:`That’s 5 shards — you’ve got ${S0.shards}. The Ashen drop them when you knock them down at night.`}]; } },
      {t:'Maybe later.', then:[ {s:'june', t:'He’s not going anywhere. Neither am I.'} ]},
    ]},
  ]);
}
function updatePet(dt){
  const s=scout; s.anim+=dt; s.cd-=dt; if (!F().pet) return;
  let target=null, bd=135;
  for (const e of C.enemies){ const d=Math.hypot(e.x-P.x, e.y-P.y); if (d<bd){ bd=d; target=e; } }
  s.moving=false;
  if (target){
    const dx=target.x-s.x, dy=target.y-s.y, d=Math.hypot(dx,dy)||1; s.dir=dx<0?-1:1;
    if (d>11){ s.x+=dx/d*125*dt; s.y+=dy/d*125*dt; s.moving=true; }
    else if (s.cd<=0){ s.cd=.7; damageEnemy(target, 1+.25*((S0.lvl||1)-1), [Math.sign(dx)||1,0]); beep(420,.05,'square',.03); beep(360,.05,'square',.03,.06); floatText(s.x,s.y-18,'Woof!','#f2c27a'); }
  } else {
    const bx=P.x-({left:-16,right:16}[P.dir]||10), by=P.y-({up:-12,down:12}[P.dir]||0);
    const dx=bx-s.x, dy=by-s.y, d=Math.hypot(dx,dy);
    if (d>200){ s.x=bx; s.y=by; }
    else if (d>10){ const sp=Math.min(140, d*4); s.x+=dx/d*sp*dt; s.y+=dy/d*sp*dt; s.moving=true; s.dir=dx<0?-1:1; }
  }
}
function drawDog(x,y,dir,moving,t){
  const R=(dx,dy,w,h,col)=>{ ctx.fillStyle=col; ctx.fillRect(dir<0 ? x-dx-w : x+dx, y+dy, w, h); };
  const lg = moving && !reduceMotion ? Math.floor(t*10)%2 : 0, wag = Math.floor(t*(moving?12:5))%2;
  R(-8,-1,16,2,'rgba(20,15,40,.3)');
  R(-7,-9,12,6,'#8a5a32'); R(-6,-10,9,2,'#a06a3c'); R(-1,-7,4,4,'#efe3c8');
  R(-9,-11+wag,3,2,'#8a5a32'); R(-10,-12+wag,2,2,'#a06a3c');
  R(4,-13,6,6,'#8a5a32'); R(5,-15,2,3,'#5a3a20'); R(9,-11,3,3,'#a06a3c'); R(11,-10,1,1,'#1a1418'); R(7,-12,1,1,'#1a1418');
  R(-6,-3,2,3-lg,'#5a3a20'); R(-2,-3,2,2+lg,'#5a3a20'); R(1,-3,2,3-lg,'#5a3a20'); R(4,-3,2,2+lg,'#5a3a20');
}

// ================= Greta the blacksmith =================
function talkGreta(){
  meet('greta'); wInit();
  const intro = F().greta1 ? [] : [
    {s:'greta', t:'Greta Holloway, blacksmith. You’re the Vale boy, swinging Walt’s old walking stick at the Ashen. Brave. Daft, but brave.'},
    {s:'greta', t:'Bring me ember shards — the Ashen drop them when they crumble — and I’ll make you something with an edge.'},
    () => { F().greta1=1; },
  ];
  const left = ['sword','bow','axe'].filter(id => !S0.weapons.includes(id));
  if (!left.length){ dialog([...intro, {s:'greta', t:'You’ve bought my whole stock. Look after that axe — I’ll want to hear stories.'}]); return; }
  dialog([...intro,
    {s:'greta', t:`What’ll it be? You’ve got ${S0.shards} ✦.`},
    {choice:[
      ...left.map(id => ({ t:`${WEAPONS[id].name} — ${WEAPONS[id].price} ✦`, then: () => buyWeapon(id) })),
      {t:'Just looking.', then:[ {s:'greta', t:'Looking’s free. Hitting things costs extra.'} ]},
    ]},
  ]);
}
function buyWeapon(id){
  const w=WEAPONS[id];
  if (S0.shards < w.price) return [{s:'greta', t:`That’s ${w.price} shards — you’ve got ${S0.shards}. Go knock a few more Ashen down after dark.`}];
  S0.shards-=w.price; giveWeapon(id); chime(); toast('New weapon!', w.name);
  return [{s:'greta', t: id==='bow' ? 'Pull, aim, let go. Try not to shoot the vicar.' : id==='axe' ? 'Heavy, isn’t it? Let the weight do the work.' : 'Balanced it myself. Point the sharp end at the problem.'},
          {s:'narr', t:`You got the ${w.name}! ${w.desc} ${IS_TOUCH ? 'Tap the weapon button to switch.' : 'Press Q or 1–4 to switch weapons.'}`}];
}

// ================= hitting townspeople (just for fun) =================
const BONK = {
  walt:['Mind the stick, lad!','I’ve had worse from the 5:40 express.'], hale:['My spectacles!','That is NOT how you treat a bookseller.'],
  june:['Oi! No tea for you.','That’s a second cup you’re paying for.'], clara:['I’m writing this down.','Assault. Noted. Dated. Filed.'],
  tom:['Ha! Your father hit harder.','Go hit a crawler, not a farmer.'], pip:['Do it again!','MUM! MUUUM!'],
  rosa:['That’s going in the complaints book.','Return to sender!'], bennet:['I forgive you. Probably.','Turn the other cheek? Fine. Ow.'],
  silas:['Careful.','You hit like Elias.'], ashcombe:['I have lawyers for this.','Charming. Truly.'], elias:['…I suppose I deserved that one.','Fair.'],
  greta:['Save it for the Ashen.','Nice swing. Buy a better weapon.'],
};
function npcSay(ref, t, col){ C.says = (C.says||[]).filter(s=>s.ref!==ref); C.says.push({ref, t, col:col||'#efe3c8', life:2}); }
function bonkNPC(n, v){
  S0.bonked=S0.bonked||[]; if (!S0.bonked.includes(n.id)) S0.bonked.push(n.id);
  n.bx=v[0]*7; n.by=v[1]*5; n.bonks=(n.bonks||0)+1;
  beep(330,.06,'square',.04); beep(220,.08,'square',.03,.05);
  if (n.bonks%4===0){ npcSay(n, 'Right, that’s ENOUGH!', '#ff9a8a'); C.pkx=v[0]*-170; C.pky=v[1]*-170; }
  else { const L=BONK[n.id]||['Ow!','Hey!']; npcSay(n, n.bonks===1 ? (['Ow!','Hey!','Oof!'][Math.floor(Math.random()*3)]) : L[Math.floor(Math.random()*L.length)]); }
}
function bonkCat(v){ if (cat.follow){ npcSay(cat,'Mrrrow?!'); return; } npcSay(cat,'HSSSS!','#ffb070'); cat.tx=cat.x+v[0]*120; cat.ty=cat.y+v[1]*120; cat.wait=3; beep(900,.08,'sawtooth',.03); }
// Speech bubbles and floating numbers are real text laid over the canvas, so they stay sharp at any size.
let wtId=0;
function syncWorldText(cx,cy){
  const box=$('#worldtext'); if (!box) return;
  const alive=new Set();
  cx=Math.round(camX); cy=Math.round(camY);
  const c=canvas.getBoundingClientRect(), vw=innerWidth;
  const place=(o, cls, html, wx, wy, alpha) => {
    if (!o.el){ o.el=document.createElement('div'); o.el.className=cls; o.el.innerHTML=html; o.el.dataset.k=String(++wtId); box.appendChild(o.el); }
    alive.add(o.el);
    const sx=c.left+(wx-cx)*SC, sy=c.top+(wy-cy)*SC;
    if (cls.startsWith('wsay')){
      const w=o.el.offsetWidth||80, left=Math.max(6, Math.min(vw-w-6, sx-w/2));
      o.el.style.setProperty('--tail', Math.round(Math.max(10, Math.min(w-10, sx-left)))+'px');
      o.el.style.transform=`translate(${Math.round(left)}px, ${Math.round(sy)}px) translateY(-100%)`;
    } else o.el.style.transform=`translate(${Math.round(sx)}px, ${Math.round(sy)}px) translate(-50%,-100%)`;
    o.el.style.opacity=String(Math.max(0,Math.min(1,alpha)));
  };
  if (mode!=='title'){
    for (const sy of (C.says||[])){ const r=sy.ref; place(sy, 'wsay'+(sy.col==='#ff9a8a'?' angry':sy.col==='#ffb070'?' hiss':''), escapeHTML(sy.t), r.x+(r.bx||0), r.y+(r.by||0)-(r===cat?12:25), sy.life*2); }
    for (const t of (C.texts||[])){ place(t, 'wfloat', escapeHTML(t.t), t.x, t.y, t.life*2); if (!t.colored){ t.el.style.color=t.col; t.colored=1; } }
  }
  for (const el of [...box.children]) if (!alive.has(el)) el.remove();
}
function escapeHTML(t){ return String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function drawSays(cx,cy){ syncWorldText(cx,cy); }

// ================= how to play, play-mode picker, skip story =================
function openHow(from){ howFrom=from; $('#howto').classList.add('on'); if (from==='pause') $('#pause').classList.remove('on'); if (from==='title') $('#title').classList.remove('on'); mode='how'; }
let howFrom='title';
function closeHow(){ $('#howto').classList.remove('on'); if (howFrom==='pause'){ mode='pause'; $('#pause').classList.add('on'); } else if (howFrom==='play') mode='play'; else { mode='title'; $('#title').classList.add('on'); } }
$('#howClose').addEventListener('click', closeHow);
$('#howto').addEventListener('click', e => { if (e.target.id==='howto') closeHow(); });
function openModePick(){ $('#title').classList.remove('on'); $('#modepick').classList.add('on'); mode='modepick'; }
$('#mpStory').addEventListener('click', () => { SETTINGS.skipStory=false; saveSettings(); $('#modepick').classList.remove('on'); startNew(); });
$('#mpAction').addEventListener('click', () => { SETTINGS.skipStory=true; saveSettings(); $('#modepick').classList.remove('on'); startNew(); });
$('#mpBack').addEventListener('click', () => { $('#modepick').classList.remove('on'); mode='title'; refreshTitle(); $('#title').classList.add('on'); });
function skipDialog(){
  // skip ahead, but stop on the gold Key point summary so players who skip still get the story
  for (let i=0;i<400;i++){
    if (mode!=='dialog' || D.choices) return;
    if (dlg.classList.contains('keypt') && D.typing){ D.shown=D.full.length; dlg.querySelector('.line').textContent=D.full; D.typing=false; dlg.querySelector('.more').style.visibility='visible'; return; }
    const nextLine = D.queue.find(x => typeof x!=='function');
    D.typing=false; next();
    if (nextLine && (nextLine.s==='key' || nextLine.s==='recap')){ D.shown=D.full.length; dlg.querySelector('.line').textContent=D.full; D.typing=false; dlg.querySelector('.more').style.visibility='visible'; return; }
  }
}
function skipCut(){ if (mode!=='cut') return; $('#cut').classList.remove('on'); mode='play'; const d=CUT.done; CUT.done=null; if (d) d(); }
$('#dSkip').addEventListener('click', e => { e.stopPropagation(); const first=!S0.skipped; S0.skipped=1; skipDialog(); if (first) toast('Skipped — the story is recommended!', 'Journal (J) → Story has a summary'); });
$('#cSkip').addEventListener('click', e => { e.stopPropagation(); skipCut(); });

ETYPES.crow  = { name:'Ash crow', hp:2, speed:62, r:5, dmg:2, aggro:170, shards:2, fly:true, xp:5 };
ETYPES.heart = { name:'The Ashen Heart', hp:30, speed:12, r:16, dmg:4, aggro:999, shards:25, boss:true, fly:true, xp:90 };
ETYPES.crawler.xp=3; ETYPES.wisp.xp=4; ETYPES.wolf.xp=8; ETYPES.warden.xp=60;
let lastClock='';
function applyHideUI(){ document.body.classList.toggle('hideui', !!SETTINGS.hideUI); }
function toggleUI(){ SETTINGS.hideUI=!SETTINGS.hideUI; saveSettings(); applyHideUI(); }
$('#uiBtn').addEventListener('click', () => { toggleUI(); $('#uiBtn').blur(); });
$('#showUI').addEventListener('click', () => { toggleUI(); });
applyHideUI();
function drawArrows(cx,cy){ for (const a of (C.arrows||[])){ const x=Math.round(a.x-cx), y=Math.round(a.y-cy), dx=Math.sign(a.vx), dy=Math.sign(a.vy);
  for (let i=0;i<8;i++){ ctx.fillStyle = i<2 ? (a.fire?'#ffcf6a':'#dfe6f2') : i>5 ? '#efe3c8' : '#8a6240'; ctx.fillRect(x-dx*i, y-dy*i, 1, 1); } } }
$('#howBtn').addEventListener('click', () => openHow('title'));
$('#pHow').addEventListener('click', () => openHow('pause'));
$('#wpnBtn').addEventListener('click', () => { if (mode==='play') cycleWeapon(); $('#wpnBtn').blur(); });
SETTINGS.skipStory = false;   // the game is always story mode; players can still skip single conversations
