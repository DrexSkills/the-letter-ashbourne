// The Letter — New creatures (Forest Archer, Goblin Warrior, Forest Spirit, Shadow Stalker, Stone Golem, Crystal Wisp),
// their arrows and orbs, plus survival gear: the shield, healing potions, hunger and June's food counter.
'use strict';

// ================= the creatures =================
Object.assign(ETYPES, {
  archer:   { name:'Forest Archer',  hp:3,  speed:34, r:6,  dmg:1, aggro:210, shards:3, xp:7,  ai:'archer',  barY:26 },
  goblin:   { name:'Goblin Warrior', hp:5,  speed:40, r:7,  dmg:2, aggro:170, shards:3, xp:8,  lunge:true, barY:26 },
  spirit:   { name:'Forest Spirit',  hp:6,  speed:28, r:8,  dmg:0, aggro:230, shards:5, xp:10, ai:'spirit',  barY:32 },
  sprite:   { name:'Little spirit',  hp:1,  speed:52, r:4,  dmg:1, aggro:200, shards:1, xp:2,  fly:true,   barY:22 },
  stalker:  { name:'Shadow Stalker', hp:5,  speed:58, r:7,  dmg:3, aggro:230, shards:4, xp:12, lunge:true, ai:'stalker', barY:22 },
  golem:    { name:'Stone Golem',    hp:16, speed:16, r:12, dmg:3, aggro:170, shards:8, xp:25, ai:'golem',   heavy:true, barY:42 },
  crystal:  { name:'Crystal Wisp',   hp:4,  speed:36, r:6,  dmg:1, aggro:210, shards:4, xp:9,  fly:true,   ai:'crystal', barY:30 },
  crystalS: { name:'Crystal shard',  hp:1,  speed:58, r:4,  dmg:1, aggro:210, shards:1, xp:2,  fly:true,   barY:24 },
});

C.eproj = [];
function fireAt(e, kind, speed, dmg){
  const sx=e.x, sy=e.y-(e.def.fly?20:14), a=Math.atan2((P.y-10)-sy, P.x-sx);
  C.eproj.push({ x:sx, y:sy, vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, life:2.2, dmg, kind });
  if (kind==='arrow'){ beep(640,.04,'triangle',.03); sfxNoise(.06,'highpass',3000,.7,.03); } else { beep(980,.08,'sine',.04); beep(1310,.06,'sine',.025,.04); }
}
// each special creature has its own behaviour; returning true means "handled, skip the default chase"
const CREATURE_AI = {
  // keeps its distance and shoots arrows
  archer(e, dt, dx, dy, dist, safe){
    if (safe || dist>e.def.aggro){ return false; }
    if (e.state==='aim'){ e.st-=dt; if (e.st<=0){ fireAt(e,'arrow',165,2); e.state='move'; e.cd=2.1+Math.random()*.6; } return true; }
    const sp=e.def.speed*(e.hit>0?.3:1);
    if (dist<70) tryMove(e, -dx/dist*sp*dt, -dy/dist*sp*dt);
    else if (dist>125) tryMove(e, dx/dist*sp*dt, dy/dist*sp*dt);
    else tryMove(e, -dy/dist*sp*.5*dt*(Math.sin(e.anim*.7)>0?1:-1), dx/dist*sp*.5*dt*(Math.sin(e.anim*.7)>0?1:-1));
    if (e.cd<=0 && dist<180){ e.state='aim'; e.st=.55; }
    if (dist < e.def.r+6) hurtPlayer(1, e.x, e.y);
    return true;
  },
  // heals nearby monsters, calls little spirits, and never fights directly
  spirit(e, dt, dx, dy, dist, safe){
    if (safe || dist>e.def.aggro) return false;
    const sp=e.def.speed*(e.hit>0?.3:1);
    if (dist<95) tryMove(e, -dx/dist*sp*dt, -dy/dist*sp*dt); else if (dist>150) tryMove(e, dx/dist*sp*.6*dt, dy/dist*sp*.6*dt);
    e.healT=(e.healT??2.5)-dt; e.sumT2=(e.sumT2??4)-dt;
    if (e.state==='heal'){ e.st-=dt; if (e.st<=0) e.state='move'; }
    if (e.healT<=0){ e.healT=3.4; e.state='heal'; e.st=.7; let healed=0;
      for (const o of C.enemies){ if (o!==e && o.hp<o.def.hp && Math.hypot(o.x-e.x,o.y-e.y)<110){ o.hp=Math.min(o.def.hp, o.hp+2); healed++; floatText(o.x, o.y-o.def.r*2-10, '+2', '#9fe07a'); burst(o.x,o.y-o.def.r,6,['#9fe07a','#d8ffb0']); } }
      burst(e.x,e.y-16,10,['#9fe07a','#d8ffb0']); if (healed) beep(660,.12,'sine',.03); }
    if (e.sumT2<=0 && C.enemies.filter(o=>o.t==='sprite').length<3){ e.sumT2=6; for (let i=0;i<2;i++){ const s=spawnEnemy('sprite', e.x+(i?14:-14), e.y-14, e.wave); s.cd=1; } burst(e.x,e.y-18,10,['#9fe07a']); }
    return true;
  },
  // nearly invisible until it's close — then it pounces
  stalker(e, dt, dx, dy, dist){
    if (e.hit>0) e.reveal=1.6; e.reveal=(e.reveal||0)-dt;
    const target = (dist<72 || e.reveal>0 || e.state==='wind' || e.state==='lunge') ? 1 : .08;
    e.vis = (e.vis ?? .08) + (target-(e.vis ?? .08))*Math.min(1,dt*6);
    return false;
  },
  // slow and heavy: raises its fists, then smashes the ground with a shockwave
  golem(e, dt, dx, dy, dist, safe){
    if (e.state==='smash'){ e.st-=dt; if (e.st<=0){ e.state='move'; e.cd=2.3; C.shake=.35; beep(60,.35,'sawtooth',.07); sfxNoise(.3,'lowpass',300,1,.1);
        burst(e.x,e.y-2,26,['#857f6c','#5f5a4c','#c9b28a']); C.cracks.push({x:e.x,y:e.y,t:0}); if (!safe && Math.hypot(P.x-e.x,P.y-e.y)<46) hurtPlayer(e.def.dmg, e.x, e.y); } return true; }
    if (safe || dist>e.def.aggro) return false;
    if (dist>24) tryMove(e, dx/dist*e.def.speed*dt, dy/dist*e.def.speed*dt);
    if (dist<40 && e.cd<=0){ e.state='smash'; e.st=.95; }
    if (dist < e.def.r+6) hurtPlayer(2, e.x, e.y);
    return true;
  },
  // floats unpredictably and fires crystal orbs
  crystal(e, dt, dx, dy, dist, safe){
    if (safe || dist>e.def.aggro) return false;
    e.orb=(e.orb ?? Math.random()*6)+dt*(0.9+Math.sin(e.anim*.37)*.5);
    const ox=P.x+Math.cos(e.orb)*80, oy=P.y+Math.sin(e.orb)*55-10, mx=ox-e.x, my=oy-e.y, md=Math.hypot(mx,my)||1;
    const sp=e.def.speed*(e.hit>0?.3:1); tryMove(e, mx/md*sp*dt + Math.sin(e.anim*5)*14*dt, my/md*sp*dt);
    if (e.cd<=0 && dist<190){ fireAt(e,'orb',115,2); e.cd=2.4+Math.random()*.8; }
    if (dist < e.def.r+6) hurtPlayer(1, e.x, e.y);
    return true;
  },
};
// crystal wisps split into smaller shards the first time they're hurt
function onCreatureHit(e){
  if (e.t==='crystal' && !e.split && e.hp>0){ e.split=true; for (let i=0;i<2;i++){ const s=spawnEnemy('crystalS', e.x+(i?12:-12), e.y-6, e.wave); s.cd=1.2; } burst(e.x,e.y-18,14,['#9fd6ff','#3a8ad8','#ffffff']); beep(1500,.08,'triangle',.03); }
  if (e.t==='stalker') e.reveal=1.6;
}
C.cracks = [];

// ================= drawing the creatures =================
const CREATURE_DRAW = {
  archer(e,x,y,R,t){
    const mv=Math.hypot(e.kbx||0,e.kby||0)>0 || true, lg=Math.floor(t*8)%2, aim=e.state==='aim';
    R(-6,-1,12,2,'rgba(20,15,40,.3)');
    R(-3,-6,2,6-lg,'#3a3020'); R(1,-6,2,5+lg,'#3a3020'); R(-3,-1,2,1,'#2a2014'); R(1,-1,2,1,'#2a2014');
    R(-5,-15,10,10,'#3f5a32'); R(-5,-15,10,2,'#4f6a3e'); R(-6,-7,2,2,'#33482a'); R(4,-7,2,2,'#33482a'); R(-1,-12,2,6,'#33482a');
    R(-7,-17,2,8,'#6b4a2f'); R(-7,-19,1,2,'#c9b28a'); R(-6,-19,1,2,'#c9b28a');
    R(-4,-22,8,8,'#33482a'); R(-3,-23,6,2,'#3f5a32'); R(-2,-20,5,4,'#0e0c10'); R(-1,-19,1,1,'#d8f0a0'); R(2,-19,1,1,'#d8f0a0');
    if (aim){ const pull=Math.round((1-Math.max(0,e.st)/.55)*3);
      R(5,-20,2,10,'#8a6240'); R(7,-21,1,2,'#8a6240'); R(7,-11,1,2,'#8a6240'); R(4-pull,-19,1,8,'#efe3c8'); R(2-pull,-15,8,1,'#c9b28a'); R(9,-15,2,1,'#dfe6f2'); R(3,-15,3,2,'#3f5a32'); }
    else { R(4,-15,1,10,'#8a6240'); R(5,-16,1,2,'#8a6240'); R(5,-6,1,2,'#8a6240'); R(3,-15,1,9,'#efe3c8'); }
  },
  goblin(e,x,y,R,t){
    const lg=Math.floor(t*10)%2, wind=e.state==='wind', lunge=e.state==='lunge';
    R(-7,-1,14,2,'rgba(20,15,40,.3)');
    R(-4,-6,3,6-lg,'#4a3a26'); R(1,-6,3,5+lg,'#4a3a26');
    R(-5,-14,10,9,'#6b4a2f'); R(-5,-8,10,1,'#3a2a1a'); R(-3,-13,2,4,'#8a6240');
    R(-7,-13,2,6,'#6a8a3a'); R(5,-13,2,6,'#6a8a3a');
    R(-4,-20,8,7,'#7a9a44'); R(-6,-19,2,2,'#7a9a44'); R(4,-19,2,2,'#7a9a44'); R(-2,-18,1,1,'#ffcf6a'); R(1,-18,1,1,'#ffcf6a'); R(-1,-15,3,1,'#efe3c8'); R(-3,-21,6,1,'#5a7a34');
    R(-10,-14,4,8,'#8a5a32'); R(-10,-12,4,3,'#6b4a2f'); R(-9,-11,2,1,'#b8c2d0');
    if (wind){ R(5,-27,2,12,'#8a6240'); R(4,-30,5,4,'#6b4a2f'); R(5,-31,1,1,'#b8c2d0'); }
    else if (lunge){ R(7,-12,10,2,'#8a6240'); R(16,-14,4,5,'#6b4a2f'); }
    else { R(6,-13,2,10,'#8a6240'); R(5,-5,4,4,'#6b4a2f'); }
  },
  spirit(e,x,y,R,t){
    const lg=Math.floor(t*6)%2, by=Math.round(Math.sin(t*2)*1);
    R(-9,-1,18,2,'rgba(20,15,40,.25)');
    R(-6,-8+lg,1,8-lg,'#d8cbb0'); R(-3,-8,1,8,'#d8cbb0'); R(3,-8+lg,1,8-lg,'#d8cbb0'); R(6,-8,1,8,'#d8cbb0');
    R(-7,-13+by,14,6,'#e8dcc0'); R(-6,-8+by,12,1,'#d0c2a4'); R(-3,-12+by,2,1,'#7ad86a'); R(1,-11+by,1,1,'#7ad86a'); R(-5,-10+by,1,1,'#9fe07a');
    R(-9,-13+by,2,2,'#efe3c8');
    R(4,-18+by,3,6,'#e8dcc0'); R(5,-21+by,5,4,'#e8dcc0'); R(9,-20+by,1,1,'#3a2a22'); R(7,-20+by,1,1,'#2a3a2a');
    R(5,-26+by,1,5,'#c9b28a'); R(3,-27+by,1,3,'#c9b28a'); R(7,-27+by,1,3,'#c9b28a'); R(8,-25+by,2,1,'#c9b28a'); R(2,-25+by,2,1,'#c9b28a');
    R(3,-28+by,1,1,'#9fe07a'); R(7,-28+by,1,1,'#9fe07a'); R(9,-26+by,1,1,'#9fe07a'); R(1,-26+by,1,1,'#9fe07a');
    if (e.state==='heal'){ const k=1-Math.max(0,e.st)/.7; ctx.strokeStyle=`rgba(159,224,122,${1-k})`; ctx.strokeRect(x-6-k*16, y-14-k*10, 12+k*32, 8+k*20); }
  },
  sprite(e,x,y,R,t){ const by=Math.round(Math.sin(t*6)*2)-14; R(-3,-1,6,1,'rgba(20,15,40,.2)'); R(-2,by-3,4,4,'#9fe07a'); R(-1,by-4,2,6,'#d8ffb0'); R(-3,by-1,1,1,'#7ad86a'); R(2,by-2,1,1,'#7ad86a'); },
  stalker(e,x,y,R,t){
    ctx.save(); ctx.globalAlpha *= (e.vis ?? 1);
    const lg=Math.floor(t*12)%2, crouch=e.state==='wind'?2:0, jit=e.state==='wind'&&!reduceMotion?(Math.floor(t*30)%2):0;
    R(-10,-1,20,2,'rgba(20,15,40,.35)');
    R(-8+jit,-5+crouch,2,5-crouch-lg,'#1a1426'); R(-4+jit,-5+crouch,2,5-crouch,'#1a1426'); R(3+jit,-5+crouch,2,5-crouch-lg,'#1a1426'); R(6+jit,-5+crouch,2,5-crouch,'#1a1426');
    R(-9+jit,-12+crouch,16,7,'#2a1f3a'); R(-8+jit,-13+crouch,12,2,'#3a2a52'); R(-6+jit,-11+crouch,3,1,'#6a4a9a'); R(-1+jit,-12+crouch,2,1,'#6a4a9a'); R(-3+jit,-9+crouch,1,2,'#4a3a6a');
    R(5+jit,-15+crouch,7,6,'#2a1f3a'); R(10+jit,-12+crouch,4,3,'#1e1628'); R(6+jit,-17+crouch,2,3,'#2a1f3a'); R(9+jit,-17+crouch,1,2,'#2a1f3a'); R(9+jit,-13+crouch,2,1,'#c08aff');
    R(-13+jit,-13+crouch,4,2,'#2a1f3a'); R(-14+jit,-14+crouch,2,1,'#6a4a9a');
    ctx.restore();
  },
  golem(e,x,y,R,t){
    const smash=e.state==='smash', k=smash ? 1-Math.max(0,e.st)/.95 : 0, arm = smash ? -Math.round(Math.min(1,k*1.5)*12) : Math.round(Math.sin(t*2)*1), lg=Math.floor(t*4)%2;
    if (smash){ ctx.fillStyle=`rgba(200,170,110,${.12+.3*k})`; ctx.beginPath(); ctx.ellipse(x, y-2, 44*k+6, 20*k+3, 0, 0, Math.PI*2); ctx.fill(); }
    R(-14,-1,28,3,'rgba(20,15,40,.4)');
    R(-9,-9,7,9-lg,'#5f5a4c'); R(2,-9,7,9,'#5f5a4c');
    R(-12,-26,24,18,'#6f6a5a'); R(-11,-26,10,4,'#857f6c'); R(-8,-24,5,2,'#5a7a3a'); R(4,-14,4,2,'#5a7a3a'); R(6,-22,3,1,'#5a7a3a'); R(-2,-20,1,6,'#4a463c'); R(3,-18,4,1,'#4a463c');
    R(-6,-34,12,9,'#6f6a5a'); R(-5,-34,6,2,'#857f6c'); R(-3,-30,2,1,'#e8d070'); R(2,-30,2,1,'#e8d070'); R(-4,-35,3,1,'#5a7a3a');
    R(-18,-25+arm,6,16,'#665f50'); R(12,-25+arm,6,16,'#665f50'); R(-19,-11+arm,8,6,'#5f5a4c'); R(11,-11+arm,8,6,'#5f5a4c'); R(-17,-24+arm,2,3,'#5a7a3a');
  },
  crystal(e,x,y,R,t){ drawCrystal(e,x,y,R,t,1); },
  crystalS(e,x,y,R,t){ drawCrystal(e,x,y,R,t,.6); },
};
function drawCrystal(e,x,y,R,t,s){
  const by=Math.round(Math.sin(t*3)*2)-(s<1?12:16), q=v=>Math.round(v*s);
  R(-q(5),-1,q(10),1,'rgba(20,15,40,.25)');
  R(-q(1),by-q(9),Math.max(1,q(2)),q(2),'#cfeaff'); R(-q(3),by-q(7),q(6),q(2),'#6ab4ff'); R(-q(4),by-q(5),q(8),q(4),'#3a8ad8'); R(-q(3),by-q(1),q(6),q(2),'#2a6ab8'); R(-q(1),by+q(1),Math.max(1,q(2)),q(2),'#2a4a98'); R(-q(2),by-q(6),1,q(3),'#ffffff');
  for (let i=0;i<3;i++){ const a=t*2.2+i*2.09, ox=Math.round(Math.cos(a)*q(9)), oy=Math.round(Math.sin(a)*q(4)); R(ox-1, by-q(3)+oy, 2, Math.max(2,q(3)), i===1?'#9fd6ff':'#6a7ad8'); }
}
function drawCreatureBar(e,x,y){
  if (e.hp>=e.def.hp || e.hp<=0 || (e.vis!==undefined && e.vis<.5)) return;
  const w=12, yy=y-(e.def.barY||16); ctx.fillStyle='#070a12'; ctx.fillRect(x-w/2-1, yy, w+2, 3); ctx.fillStyle='#e86a6a'; ctx.fillRect(x-w/2, yy+1, Math.max(1,Math.round(w*e.hp/e.def.hp)), 1);
}
// soft glows at night for the magical creatures
function creatureGlow(e,x,y){
  const g=(cx_,cy_,r,col)=>{ const gr=ctx.createRadialGradient(cx_,cy_,0,cx_,cy_,r); gr.addColorStop(0,col); gr.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=gr; ctx.fillRect(cx_-r,cy_-r,r*2,r*2); };
  if (e.t==='crystal'||e.t==='crystalS'){ g(x, y-(e.t==='crystal'?18:13), e.t==='crystal'?20:12, 'rgba(110,180,255,.55)'); return true; }
  if (e.t==='spirit'){ g(x, y-14, 26, 'rgba(140,230,110,.32)'); return true; }
  if (e.t==='sprite'){ g(x, y-14, 10, 'rgba(160,240,120,.5)'); return true; }
  if (e.t==='stalker'){ if ((e.vis??1)>.5){ ctx.fillStyle='rgba(192,138,255,.8)'; ctx.fillRect(Math.round(x+(e.face>0?9:-11)), Math.round(y-13), 2, 1); } return true; }
  if (e.t==='archer'){ ctx.fillStyle='rgba(216,240,160,.7)'; ctx.fillRect(Math.round(x+(e.face>0?-1:-2)), Math.round(y-19), 4, 1); return true; }
  if (e.t==='golem'){ ctx.fillStyle='rgba(232,208,112,.7)'; ctx.fillRect(Math.round(x-3), Math.round(y-30), 7, 1); return true; }
  if (e.t==='goblin'){ ctx.fillStyle='rgba(255,207,106,.6)'; ctx.fillRect(Math.round(x-2), Math.round(y-18), 4, 1); return true; }
  return false;
}

// ================= enemy arrows and crystal orbs =================
function updateEnemyProjectiles(dt){
  for (const p of C.eproj.slice()){
    p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    const tx=Math.floor(p.x/T), ty=Math.floor((p.y+8)/T);
    let gone = p.life<=0 || arrowBlocked(tx,ty);
    if (!gone && Math.hypot(p.x-P.x, p.y-(P.y-10))<8){
      gone=true;
      if (shieldBlocks(p.x-p.vx, p.y-p.vy)) blockedFX(p.x,p.y);
      else if (!(safeAt(Math.floor(P.x/T), Math.floor(P.y/T)) && !C.wave)) hurtPlayer(p.dmg, p.x-p.vx*.1, p.y-p.vy*.1);
    }
    if (gone){ C.eproj.splice(C.eproj.indexOf(p),1); burst(p.x,p.y,4, p.kind==='orb' ? ['#9fd6ff','#3a8ad8'] : ['#c9b28a']); }
  }
  for (const c of C.cracks) c.t+=dt; C.cracks = C.cracks.filter(c=>c.t<2.5);
}
function drawEnemyProjectiles(cx,cy){
  for (const c of C.cracks){ const a=Math.max(0,1-c.t/2.5)*.6, x=Math.round(c.x-cx), y=Math.round(c.y-cy); ctx.fillStyle=`rgba(40,34,28,${a})`; for (let i=0;i<6;i++){ const an=i*1.05+.3; for (let d=4;d<22;d+=2) ctx.fillRect(Math.round(x+Math.cos(an)*d), Math.round(y+Math.sin(an)*d*.5), 2, 1); } }
  for (const p of C.eproj){ const x=Math.round(p.x-cx), y=Math.round(p.y-cy);
    if (p.kind==='orb'){ ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(x,y,0,x,y,8); g.addColorStop(0,'rgba(140,200,255,.8)'); g.addColorStop(1,'rgba(80,140,255,0)'); ctx.fillStyle=g; ctx.fillRect(x-8,y-8,16,16); ctx.globalCompositeOperation='source-over'; ctx.fillStyle='#cfeaff'; ctx.fillRect(x-1,y-1,3,3); ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,1,1); }
    else { const a=Math.atan2(p.vy,p.vx); for (let i=0;i<8;i++){ ctx.fillStyle = i<2 ? '#dfe6f2' : i>5 ? '#a7d08a' : '#8a6240'; ctx.fillRect(Math.round(x-Math.cos(a)*i), Math.round(y-Math.sin(a)*i), 1, 1); } }
  }
}

// ================= the shield =================
// Hold B (or the shield button on a phone) to raise it. It stops attacks and arrows from the front.
function isBlocking(){ return !!(S0.shield && (keys.block) && mode==='play' && canFight()); }
function shieldBlocks(fx, fy){
  if (!isBlocking()) return false;
  const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir], ax=fx-P.x, ay=fy-P.y, d=Math.hypot(ax,ay)||1;
  return (ax*v[0]+ay*v[1])/d > .15;
}
function blockedFX(x,y){
  beep(1200,.05,'square',.04); beep(700,.08,'triangle',.04,.03); C.shake=Math.max(C.shake,.1);
  burst(x,y,8,['#dfe6f2','#ffffff','#c9a046']); floatText(P.x,P.y-30,'Blocked!','#dfe6f2'); C.blocks=(C.blocks||0)+1;
}
function drawShield(cx,cy){
  if (!isBlocking()) return;
  const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir], x=Math.round(P.x-cx+v[0]*7), y=Math.round(P.y-cy-11+v[1]*5);
  const R=(dx,dy,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+dx,y+dy,w,h); };
  if (P.dir==='up') return;     // facing away: the shield is on the far side
  R(-5,-6,10,12,'#c9a046'); R(-4,-5,8,10,'#8a6240'); R(-4,-5,8,1,'#a77d55'); R(-1,-3,2,6,'#b8c2d0'); R(-3,-1,6,2,'#b8c2d0'); R(-1,-1,2,2,'#ffffff');
}

// ================= potions, food and hunger =================
function survivalInit(){ if (S0.hunger==null) S0.hunger=100; if (S0.potions==null) S0.potions=0; if (S0.bread==null) S0.bread=1; if (S0.stew==null) S0.stew=0; }
function usePotion(){
  survivalInit();
  if (!S0.potions){ toast('No healing potions', 'Buy them at June’s café counter'); return; }
  if (S0.hp>=S0.maxhp){ toast('Already at full health', 'Save the potion for a fight'); return; }
  S0.potions--; const before=S0.hp; S0.hp=Math.min(S0.maxhp, S0.hp+6);
  floatText(P.x,P.y-28,'+'+(S0.hp-before)+' ♥','#9fe07a'); burst(P.x,P.y-12,18,['#9fe07a','#d8ffb0','#ffffff']); beep(523,.1,'sine',.05); beep(784,.14,'sine',.05,.08); beep(1047,.2,'sine',.04,.16);
  refreshHearts();
}
function eatFood(){
  survivalInit();
  if (S0.hunger>=97){ toast('You’re not hungry', 'Food: '+(S0.bread+S0.stew)); return; }
  const want = 100-S0.hunger;
  let what=null;
  if (S0.stew>0 && (want>=45 || !S0.bread)) what='stew'; else if (S0.bread>0) what='bread'; else if (S0.stew>0) what='stew';
  if (!what){ toast('No food left', 'Buy some at June’s café counter'); return; }
  S0[what]--; const gain = what==='stew' ? 75 : 35; S0.hunger=Math.min(100, S0.hunger+gain);
  floatText(P.x,P.y-28, what==='stew' ? 'Hearty stew!' : 'Bread', '#f2c27a'); sfxNoise(.08,'bandpass',900,2,.05); sfxNoise(.08,'bandpass',800,2,.05,.15);
  refreshHearts(); save();
}
let hungerWarn=0, starveT=0, hungerHudT=0;
function tickHunger(dt){
  survivalInit();
  S0.hunger = Math.max(0, S0.hunger - dt/9);       // full to empty in about 15 minutes of play
  const h=S0.hunger;
  if (h<30 && hungerWarn<1){ hungerWarn=1; toast('You’re getting hungry', 'Eat (F) — buy food at June’s café'); }
  if (h<10 && hungerWarn<2){ hungerWarn=2; toast('Starving!', 'You’ll lose health until you eat'); }
  if (h>40) hungerWarn=0;
  if (h<=0){ starveT+=dt; if (starveT>12){ starveT=0; if (S0.hp>1){ S0.hp--; floatText(P.x,P.y-26,'Hungry…','#e98c7a'); refreshHearts(); } } } else starveT=0;
  hungerHudT-=dt; if (hungerHudT<=0){ hungerHudT=1; refreshHungerHUD(); }
}
function refreshHungerHUD(){
  survivalInit();
  const f=$('#hungerFill'); if (f){ f.style.width=Math.round(S0.hunger)+'%'; f.style.background = S0.hunger<25 ? '#e86a6a' : S0.hunger<50 ? '#e8b04a' : '#9fe07a'; }
  const pc=$('#potN'); if (pc) pc.textContent=S0.potions; const fc=$('#foodN'); if (fc) fc.textContent=S0.bread+S0.stew;
  document.body.classList.toggle('hasshield', !!S0.shield);
}
// June's café counter
function openFoodShop(){
  survivalInit(); const f=F();
  const intro = f.freeMeal ? [] : [{s:'june', t:'Hungry? You look it. First one’s on the house, love — a fresh bread roll.'}, () => { f.freeMeal=1; S0.bread++; refreshHungerHUD(); toast('Got bread', 'Press F (or tap the bread) to eat'); }];
  const buy = (what, price, label) => () => {
    if (S0.shards < price) return [{s:'june', t:`That’s ${price} ember shards, love — you’ve got ${S0.shards}. The Ashen drop them at night.`}];
    S0.shards-=price; if (what==='potion') S0.potions++; else S0[what]++; refreshHearts(); refreshHungerHUD(); beep(880,.06,'triangle',.04); save();
    setTimeout(openFoodShop, 60); return [{s:'narr', t:`You bought ${label}. You have ${S0.shards} ✦ left.`}];
  };
  dialog([...intro,
    {s:'narr', t:`June’s counter. Food: ${S0.bread} bread, ${S0.stew} stew · Potions: ${S0.potions} · You have ${S0.shards} ✦`},
    {choice:[
      {t:'Fresh bread — 2 ✦ (fills a little hunger)', then: buy('bread',2,'a loaf of fresh bread')},
      {t:'Hearty stew — 5 ✦ (fills most of your hunger)', then: buy('stew',5,'a pot of hearty stew')},
      {t:'Healing potion — 6 ✦ (heals 6 hearts)', then: buy('potion',6,'a healing potion')},
      {t:'That’s all, thanks.', then:[{s:'june', t:'Mind how you go. Eat something before dark!'}]},
    ]},
  ]);
}
function buyShield(){
  if (S0.shards < 12) return [{s:'greta', t:`A good shield is 12 shards — you’ve got ${S0.shards}. Bring me more ember from the Ashen.`}];
  S0.shards-=12; S0.shield=1; refreshHearts(); refreshHungerHUD(); chime(); toast('New gear!', 'Oak shield');
  return [{s:'greta', t:'Oak, bound in iron. It won’t stop everything — but hold it up and arrows bounce right off.'},
          {s:'narr', t: `You got the Oak shield! ${IS_TOUCH ? 'Hold the shield button' : 'Hold B'} to raise it and block attacks and arrows from the front. You move slower while blocking.`}];
}
