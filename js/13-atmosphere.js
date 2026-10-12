// The Letter — Atmosphere: drifting cloud shadows, leaves, birds, sun rays, fog, rain (with sound) and dust puffs.
'use strict';

const ATM = { leaves:[], birds:[], birdT:12, puffs:[], drops:[], flakes:[], rain:0, rainTarget:0, snow:0, snowTarget:0, shelter:false, weatherT:90, rainSnd:null, inited:false };

// soft cloud-shadow and fog textures, drawn once
function softBlobTexture(w, h, blobs, alpha, col){
  const c=mk(w,h), g=c.getContext('2d'), r=mulberry32(w*7+h*3+blobs);
  for (let i=0;i<blobs;i++){ const x=w*(.15+r()*.7), y=h*(.2+r()*.6), rad=Math.min(w,h)*(.18+r()*.3);
    const gr=g.createRadialGradient(x,y,0,x,y,rad); gr.addColorStop(0,`rgba(${col},${alpha})`); gr.addColorStop(1,`rgba(${col},0)`); g.fillStyle=gr; g.fillRect(0,0,w,h); }
  return c;
}
const CLOUD_TEX = [0,1,2].map(i => softBlobTexture(170+i*30, 90+i*14, 6+i, .55, '20,24,48'));
// fog tiles seamlessly: every blob is also drawn wrapped around the edges, so there are no visible seams
function seamlessFog(w, h, blobs, alpha, col){
  const c=mk(w,h), g=c.getContext('2d'), r=mulberry32(4242+blobs);
  for (let i=0;i<blobs;i++){ const x=r()*w, y=r()*h, rad=Math.min(w,h)*(.16+r()*.22);
    for (const ox of [-w,0,w]) for (const oy of [-h,0,h]){ const gr=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,rad); gr.addColorStop(0,`rgba(${col},${alpha})`); gr.addColorStop(1,`rgba(${col},0)`); g.fillStyle=gr; g.fillRect(x+ox-rad,y+oy-rad,rad*2,rad*2); } }
  return c;
}
const FOG_DAY = seamlessFog(256, 160, 16, .42, '226,230,242');
const FOG_NIGHT = seamlessFog(256, 160, 16, .42, '110,122,160');
const CLOUDS = Array.from({length:6}, (_,i) => ({ x:i*300-200, y:(i*173)%900, v:i%3, s:5+(i%3)*2 }));

function atmosInit(){
  if (ATM.inited) return; ATM.inited=true;
  for (let i=0;i<26;i++) ATM.leaves.push(newLeaf(true));
  for (let i=0;i<140;i++) ATM.drops.push(newDrop(true));
  for (let i=0;i<130;i++) ATM.flakes.push({ x:Math.random()*VW, y:Math.random()*VH, v:12+Math.random()*16, p:Math.random()*6.28, s:Math.random()<.25?2:1 });
}
function newLeaf(anywhere){
  const cols=['#d9823a','#c94a2a','#e8c46a','#7aa64a','#f2b6c6','#e8a050'];
  return { x: anywhere ? Math.random()*VW : -10 - Math.random()*40, y: Math.random()*VH*(anywhere?1:.9) - (anywhere?0:20),
           vx: 10+Math.random()*12, vy: 7+Math.random()*7, p: Math.random()*6.28, col: cols[Math.floor(Math.random()*cols.length)] };
}
function newDrop(anywhere){ return { x: Math.random()*(VW+60), y: anywhere ? Math.random()*VH : -10-Math.random()*40, v: 240+Math.random()*90, len: 4+Math.floor(Math.random()*3), splash:0 }; }

function outdoorsNow(){ return !IN || (SCN[IN] && SCN[IN].outdoor); }
function updateAtmos(dt){
  atmosInit();
  const look=LOOK();
  // weather: now and then a rain shower rolls in (Harlow Cross is always drizzly)
  if (mode==='play'){ ATM.weatherT-=dt;
    if (ATM.weatherT<=0){
      if (ATM.rainTarget>0 || ATM.snowTarget>0){ ATM.rainTarget=0; ATM.snowTarget=0; ATM.weatherT=70+Math.random()*100; }   // the weather clears
      else { const r=Math.random();
        if (r<.4) ATM.weatherT=60+Math.random()*80;                                                                   // stays clear a while longer
        else if (r<.75){ ATM.rainTarget=.6+Math.random()*.4; ATM.weatherT=110+Math.random()*120; }                     // a rain shower
        else { ATM.snowTarget=.6+Math.random()*.4; ATM.weatherT=130+Math.random()*120; } } } }                        // snowfall
  let target = SETTINGS.weather===false ? 0 : (IN==='harlow' && !ATM.snowTarget ? Math.max(.45, ATM.rainTarget) : ATM.rainTarget);
  if (mode==='title' || mode==='cine') target=0;
  ATM.rain += (target-ATM.rain)*Math.min(1,dt*.35);
  const snowTarget = (SETTINGS.weather===false || mode==='title' || mode==='cine') ? 0 : ATM.snowTarget;
  ATM.snow += (snowTarget-ATM.snow)*Math.min(1,dt*.25);
  // townsfolk shelter indoors when it rains
  if (!ATM.shelter && ATM.rain>.3 && ATM.rainTarget>0 && IN!=='harlow'){ ATM.shelter=true; if (mode==='play') toast('It’s raining', 'Townsfolk are sheltering indoors'); }
  if (ATM.shelter && ATM.rain<.08) ATM.shelter=false;
  if (ATM.snowTarget>0 && ATM.snow>.35 && !ATM.snowTip && mode==='play'){ ATM.snowTip=true; toast('It’s snowing', 'Everyone’s wrapped up warm'); }
  if (ATM.snowTarget===0) ATM.snowTip=false;
  rainSound();
  if (reduceMotion) return;
  for (const c of CLOUDS){ c.x += c.s*dt; if (c.x > W*T+200) { c.x=-260; c.y=Math.random()*H*T; } }
  for (const l of ATM.leaves){ l.p+=dt*2.2; l.x+=(l.vx+Math.sin(l.p)*8)*dt; l.y+=l.vy*dt; if (l.x>VW+10 || l.y>VH+10) Object.assign(l, newLeaf(false)); }
  ATM.birdT-=dt;
  if (ATM.birdT<=0 && look===0 && ATM.rain<.2 && outdoorsNow()){ ATM.birdT=25+Math.random()*30;
    const n=3+Math.floor(Math.random()*3), y0=20+Math.random()*(VH*.5), dir=Math.random()<.5?1:-1;
    for (let i=0;i<n;i++) ATM.birds.push({ x: dir>0 ? -20-i*9 : VW+20+i*9, y: y0+(i%2?1:-1)*Math.ceil(i/2)*6, vx: dir*(34+Math.random()*4), p: Math.random()*6 }); }
  for (const b of ATM.birds){ b.x+=b.vx*dt; b.p+=dt*9; }
  ATM.birds = ATM.birds.filter(b => b.x>-60 && b.x<VW+60);
  for (const d of ATM.drops){ if (d.splash>0){ d.splash-=dt; if (d.splash<=0) Object.assign(d, newDrop(false)); continue; }
    d.y+=d.v*dt; d.x-=d.v*.18*dt; if (d.y > d.land){ d.splash=.14; } if (!d.land) d.land = 20+Math.random()*(VH-20); }
  for (const f of ATM.flakes){ f.p+=dt*1.3; f.y+=f.v*dt; f.x+=(Math.sin(f.p)*7 - 4)*dt; if (f.y>VH+4){ f.y=-4; f.x=Math.random()*(VW+20); } if (f.x<-4) f.x=VW+4; }
  for (const p of ATM.puffs){ p.t+=dt; p.y-=6*dt; }
  ATM.puffs = ATM.puffs.filter(p => p.t<.45);
}
function dustPuff(){ if (reduceMotion) return; ATM.puffs.push({ x:P.x+(Math.random()*6-3), y:P.y-1, t:0 }); }

// drawn on the ground, under the darkness: cloud shadows and dust
function drawGroundAtmos(cx,cy){
  const look=LOOK();
  if (!IN && (look===0||look===1) && !reduceMotion){
    ctx.globalAlpha = (look===0 ? .13 : .07) * (1 - ATM.rain*.7);
    for (const c of CLOUDS){ const t=CLOUD_TEX[c.v]; const x=Math.round(c.x-cx), y=Math.round(c.y-cy); if (x>VW||y>VH||x+t.width<0||y+t.height<0) continue; ctx.drawImage(t, x, y); }
    ctx.globalAlpha=1;
  }
  for (const p of ATM.puffs){ const k=p.t/.45, r=1+Math.floor(k*3); ctx.fillStyle=`rgba(210,196,170,${.5*(1-k)})`; ctx.fillRect(Math.round(p.x-cx-r/2), Math.round(p.y-cy-r/2), r+1, r); }
}
// drawn on top of everything in the world: leaves, birds, fog, rain, sun rays
function drawSkyAtmos(cx,cy,dt){
  const look=LOOK(), out=outdoorsNow();
  if (!out) return;
  // fog: in the forest, at dawn, and in the rain
  const night = look===2, FOG_TEX = night ? FOG_NIGHT : FOG_DAY;
  const fogA = Math.min(.42, (IN ? 0 : forestF*(night ? .2 : .26)) + (look===3 ? .2 : 0) + ATM.rain*.1 + (IN==='harlow' ? .08 : 0));
  if (fogA>.02 && !reduceMotion){
    ctx.globalAlpha=fogA; const t=time;
    for (const [sp,oy] of [[7,0],[13,60]]){ const ox=-((cx*.6 + t*sp) % FOG_TEX.width); for (let x=ox-FOG_TEX.width; x<VW; x+=FOG_TEX.width) for (let y=-((cy*.6+oy)%FOG_TEX.height)-FOG_TEX.height; y<VH; y+=FOG_TEX.height) ctx.drawImage(FOG_TEX, Math.round(x), Math.round(y)); }
    ctx.globalAlpha=1;
  }
  // falling leaves and petals (day and dusk, not in heavy rain)
  if ((look===0||look===1||look===3) && ATM.rain<.4 && ATM.snow<.2 && !reduceMotion){
    for (const l of ATM.leaves){ ctx.fillStyle=l.col; const flip=Math.sin(l.p)>0; ctx.fillRect(Math.round(l.x), Math.round(l.y), flip?2:1, flip?1:2); }
  }
  // birds, with their shadows far below
  for (const b of ATM.birds){ const x=Math.round(b.x), y=Math.round(b.y), up=Math.sin(b.p)>0;
    ctx.fillStyle='rgba(20,15,40,.18)'; ctx.fillRect(x+6, y+26, 3, 1);
    ctx.fillStyle='#2a2430'; ctx.fillRect(x,y,1,1); ctx.fillRect(x-1,y+(up?-1:1),1,1); ctx.fillRect(x+1,y+(up?-1:1),1,1); ctx.fillRect(x-2,y+(up?-2:1),1,1); ctx.fillRect(x+2,y+(up?-2:1),1,1); }
  // golden sun rays at dawn and dusk
  if ((look===1||look===3) && ATM.rain<.3 && !reduceMotion){
    ctx.globalCompositeOperation='lighter';
    for (let i=0;i<4;i++){ const x0=VW*(.1+i*.27)+Math.sin(time*.2+i)*14, w=18+i*6;
      const gr=ctx.createLinearGradient(0,0,0,VH); gr.addColorStop(0, look===1?'rgba(255,170,100,.09)':'rgba(255,190,210,.08)'); gr.addColorStop(1,'rgba(255,170,100,0)');
      ctx.fillStyle=gr; ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0+w,0); ctx.lineTo(x0+w-VH*.45,VH); ctx.lineTo(x0-VH*.45,VH); ctx.closePath(); ctx.fill(); }
    ctx.globalCompositeOperation='source-over';
  }
  // snow
  if (ATM.snow>.02){
    ctx.fillStyle=`rgba(200,215,240,${.08*ATM.snow})`; ctx.fillRect(0,0,VW,VH);
    if (!reduceMotion){ const n=Math.floor(ATM.flakes.length*ATM.snow); ctx.fillStyle='rgba(248,250,255,.9)';
      for (let i=0;i<n;i++){ const f=ATM.flakes[i]; ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s); } }
  }
  // rain
  if (ATM.rain>.02){
    ctx.fillStyle=`rgba(20,30,55,${.16*ATM.rain})`; ctx.fillRect(0,0,VW,VH);
    const n=Math.floor(ATM.drops.length*ATM.rain);
    for (let i=0;i<n;i++){ const d=ATM.drops[i];
      if (d.splash>0){ ctx.fillStyle='rgba(190,210,235,.45)'; ctx.fillRect(Math.round(d.x)-1, Math.round(d.land), 1,1); ctx.fillRect(Math.round(d.x)+1, Math.round(d.land), 1,1); continue; }
      ctx.fillStyle='rgba(180,200,230,.55)'; for (let k=0;k<d.len;k++) ctx.fillRect(Math.round(d.x+k*.18), Math.round(d.y-k), 1, 1); }
  }
}
// soft rain sound that follows the weather
function rainSound(){
  const ac=Music.ctx(); if (!ac) return;
  const want = SETTINGS.muted ? 0 : ATM.rain * (IN && !(SCN[IN]&&SCN[IN].outdoor) ? .3 : 1) * SETTINGS.sfx * .18;
  if (!ATM.rainSnd){ if (want<.002) return;
    try { const s=ac.createBufferSource(); s.buffer=noiseBuf(ac); s.loop=true; const f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1800; f.Q.value=.6;
      const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5000; const g=ac.createGain(); g.gain.value=0; s.connect(f); f.connect(lp); lp.connect(g); g.connect(ac.destination); s.start();
      ATM.rainSnd={g}; } catch(e){ return; } }
  ATM.rainSnd.g.gain.setTargetAtTime(want, ac.currentTime, .4);
}

// a soft white frost over the ground while it snows (trees and houses stay drawn on top)
function drawSnowGround(cx,cy){
  if (ATM.snow<=.02 || (IN && !(SCN[IN] && SCN[IN].outdoor))) return;
  ctx.fillStyle=`rgba(236,242,255,${.42*ATM.snow})`; ctx.fillRect(0,0,VW,VH);
  if (!reduceMotion){ ctx.fillStyle=`rgba(255,255,255,${.5*ATM.snow})`; for (let i=0;i<60;i++){ const h=hash(i, Math.floor(cx/97), Math.floor(cy/97)); ctx.fillRect((h%VW), ((h>>>11)%VH), 1, 1); } }
}
