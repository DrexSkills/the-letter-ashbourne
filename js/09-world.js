// The Letter — Area names, collisions, interacting with things, the camera view and phone extras.
'use strict';

// ================= zones =================
const zones = [
  { n:'Willow Lake', x0:6, y0:73, x1:42, y1:94 },
  { n:'The Old Mill', x0:58, y0:58, x1:69, y1:71 },
  { n:'Abbey ruins', x0:74, y0:74, x1:90, y1:94 },
  { n:'Old engine shed', x0:76, y0:2, x1:90, y1:15 },
  { n:'Post office', x0:56, y0:22, x1:64, y1:30 },
  { n:'Father’s workshop', x0:2, y0:1, x1:13, y1:10 },
  { n:'Ashwood forest', x0:0, y0:0, x1:36, y1:27 },
  { n:'St. Aldric’s churchyard', x0:43, y0:2, x1:60, y1:12 },
  { n:'Hollow Farm', x0:8, y0:31, x1:33, y1:56 },
  { n:'Ashbourne Station', x0:80, y0:16, x1:96, y1:40 },
  { n:'The river Ash', x0:66, y0:0, x1:76, y1:60 },
  { n:'Main Street', x0:34, y0:12, x1:64, y1:46 },
];
let curZone='', zoneT=0;
function showZone(n, sub){ const z=$('#zone'); z.innerHTML=''; z.appendChild(document.createTextNode(n)); if (sub){ const s=document.createElement('small'); s.textContent=sub; z.appendChild(s);} z.classList.add('show'); zoneT=2.6; }
function updateZone(dt){
  const tx=P.x/T, ty=P.y/T; let z = ty>=OLD_H-2 ? 'Southern meadows' : 'Ashbourne meadows';
  for (const q of zones) if (tx>=q.x0&&tx<q.x1&&ty>=q.y0&&ty<q.y1){ z=q.n; break; }
  if (IN) z=SCN[IN].name;
  else if (z==='Ashbourne Station' && curZone && curZone!==z && whistleT<=0){ sfxWhistle(); whistleT=45; }
  if (['Willow Lake','The Old Mill','Abbey ruins'].includes(z)){ S0.zonesSeen=S0.zonesSeen||[]; if (!S0.zonesSeen.includes(z)) S0.zonesSeen.push(z); }
  if (z!==curZone){ if (curZone) showZone(z); curZone=z; }
  if (zoneT>0){ zoneT-=dt; if (zoneT<=0) $('#zone').classList.remove('show'); }
  if (toastT>0){ toastT-=dt; if (toastT<=0) $('#toast').classList.remove('show'); }
}

// ================= collision & interaction =================
function blocked(x,y){
  if (IN) return sceneBlocked(x,y);
  for (const [px,py] of [[x-4,y-3],[x+3,y-3],[x-4,y],[x+3,y]]){
    const tx=Math.floor(px/T), ty=Math.floor(py/T);
    if (tx<0||ty<0||tx>=W||ty>=H||solid[ty*W+tx]) return true;
  }
  for (const n of npcs){ if (!vis(n)) continue; if (Math.abs(n.x-x)<9 && Math.abs(n.y-y)<6) return true; }
  return false;
}
function nearest(){
  if (IN) return sceneNearest();
  let best=null, bd=26;
  for (const n of npcs){ if (!vis(n)) continue; const d=Math.hypot(n.x-P.x,n.y-P.y); if (d<bd){bd=d; best={kind:'npc',n,label:'Talk to '+CH[n.id].name.split(' ')[0]};} }
  for (const o of objects){ if (o.when && !o.when()) continue; const d=Math.hypot(o.x*T+8-P.x, o.y*T+10-P.y); if (d<bd){bd=d; best={kind:'obj',o,label: o.mem && S0.mems.includes(o.mem) ? 'Remember' : o.label};} }
  if (!F().pet){ const d=Math.hypot(scout.x-P.x, scout.y-P.y); if (d<bd){ bd=d; best={kind:'scout', label:'Scruffy dog'}; } }
  if (!cat.follow && !F().catHome){ const d=Math.hypot(cat.x-P.x,cat.y-P.y); if (d<bd){bd=d; best={kind:'cat',label:'Ginger cat'};} }
  return best;
}
function interact(){
  const t=nearest(); if (!t) return;
  if (t.kind==='npc'){ const n=t.n; const dx=P.x-n.x, dy=P.y-n.y; n.dir = Math.abs(dx)>Math.abs(dy) ? (dx<0?'left':'right') : (dy<0?'up':'down'); n.turnT=6; n.talk(); }
  else if (t.kind==='obj') t.o.act();
  else if (t.kind==='scout') talkScout();
  else if (t.kind==='cat'){
    if (F().june) dialog([{s:'narr', t:'A ginger cat with a bent ear. Biscuit. She considers you, then decides you’ll do.'}, {s:'noah', t:'Come on, Biscuit. June’s waiting.'}], () => { cat.follow=true; });
    else dialog([{s:'narr', t:'A ginger cat with a bent ear. She ignores you magnificently, as only cats can.'}]);
  }
}
let gateCool=0;

// ================= view =================
let SC=3, VW=0, VH=0, dark=mk(1,1), dctx=dark.getContext('2d');
function resize(){
  const m=Math.min(innerWidth,innerHeight);
  SC=Math.max(2, Math.round(IS_TOUCH_DEVICE ? m/130 : m/230)+SETTINGS.zoom);
  VW=Math.ceil(innerWidth/SC); VH=Math.ceil(innerHeight/SC);
  canvas.width=VW; canvas.height=VH; canvas.style.width=VW*SC+'px'; canvas.style.height=VH*SC+'px';
  ctx.imageSmoothingEnabled=false;
  dark=mk(VW,VH); dctx=dark.getContext('2d');
}
addEventListener('resize', resize); resize();

let camX=P.x-VW/2, camY=P.y-VH/2, forestF=0;
const smoke=[];
const flies=Array.from({length:70},()=>({x:(2+rng()*33)*T, y:(1+rng()*25)*T, p:rng()*6.28, s:.5+rng()}));
const rflies=Array.from({length:25},()=>({x:(60+rng()*20)*T, y:rng()*H*T, p:rng()*6.28, s:.5+rng()}));

// ================= mobile: full screen, rotate, install =================
// inside the Android/iPhone app (Capacitor) the game already runs full screen like an installed app
const IS_APP = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const isStandalone = () => IS_APP || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
const canFS = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen) && !isStandalone();
if (IS_TOUCH_DEVICE) document.body.classList.add('touch');
if (canFS) document.body.classList.add('canfs');
function enterFullscreen(){
  if (!canFS || fsEl()) return;
  const el=document.documentElement, req=el.requestFullscreen || el.webkitRequestFullscreen;
  try { const p=req.call(el, { navigationUI:'hide' }); const lock=()=>{ try { screen.orientation.lock('landscape').catch(()=>{}); } catch(e){} };
    if (p && p.then) p.then(lock).catch(()=>{}); else lock(); } catch(e){}
}
function exitFullscreen(){ const ex=document.exitFullscreen || document.webkitExitFullscreen; if (ex && fsEl()) try { ex.call(document); } catch(e){} }
$('#fsBtn').addEventListener('click', () => { fsEl() ? exitFullscreen() : enterFullscreen(); $('#fsBtn').blur(); });
for (const ev of ['fullscreenchange','webkitfullscreenchange']) document.addEventListener(ev, () => setTimeout(resize, 120));

let portraitOk = false;
function checkOrientation(){
  const portrait = innerHeight > innerWidth * 1.05;
  $('#rotate').classList.toggle('on', IS_TOUCH_DEVICE && portrait && !portraitOk);
}
$('#rotateOk').addEventListener('click', () => { portraitOk=true; checkOrientation(); });
addEventListener('resize', checkOrientation);
addEventListener('orientationchange', () => setTimeout(() => { resize(); checkOrientation(); }, 250));
if (window.visualViewport) visualViewport.addEventListener('resize', () => resize());
checkOrientation();

// "Add to Home Screen" tip
let installEvt = null;
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
function showInstallTip(){
  let hidden=false; try { hidden = localStorage.getItem('the-letter-install-hidden')==='1'; } catch(e){}
  if (!IS_TOUCH_DEVICE || isStandalone() || hidden) return;
  const t=$('#install .it');
  if (installEvt){ t.innerHTML='<b>Play like an app:</b> add The Letter to your home screen for full screen, no browser bars.'; $('#installBtn').style.display=''; }
  else if (IS_IOS) t.innerHTML='<b>Play full screen:</b> tap <b>Share ⬆</b> at the bottom of Safari, then <b>“Add to Home Screen”</b>. Open it from your home screen.';
  else t.innerHTML='<b>Play full screen:</b> tap your browser’s <b>⋮ menu</b>, then <b>“Add to Home screen”</b> or <b>“Install app”</b>.';
  $('#install').classList.add('on');
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt=e; showInstallTip(); });
$('#installBtn').addEventListener('click', async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch(e){} installEvt=null; $('#install').classList.remove('on'); });
$('#installX').addEventListener('click', () => { $('#install').classList.remove('on'); try { localStorage.setItem('the-letter-install-hidden','1'); } catch(e){} });
showInstallTip();
if (IS_TOUCH_DEVICE) { const h=$('#soundHint'); if (h) h.textContent='♪ Tap anywhere to turn on the music'; }
if ('serviceWorker' in navigator && location.protocol==='https:' && /github\.io$/.test(location.hostname)) { navigator.serviceWorker.register('sw.js').catch(()=>{}); }
