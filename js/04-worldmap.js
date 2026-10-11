// The Letter — The world map screen, the minimap and the phone joystick.
'use strict';

// ================= world map =================
const MS = 4;
const mapBase = mk(W*MS, H*MS);
(function buildMap(){
  const g = mapBase.getContext('2d');
  const R=(x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(x,y,w,h); };
  for (let y=0;y<H;y++) for (let x=0;x<W;x++){
    const t=at(x,y), px=x*MS, py=y*MS, fr=isForest(x,y);
    let c = fr ? '#2c4a2e' : ((x*7+y*13)%5===0 ? '#628a4a' : '#5b8245');
    if (t===PATH) c='#c9a46a'; else if (t===FPATH) c='#9a7848'; else if (t===WATER) c='#4a7fa6'; else if (t===BRIDGE) c='#8a6240';
    else if (t===FIELD) c = y%2 ? '#8a7a3e' : '#6e8a34'; else if (t===PLAZA) c='#a29a8a'; else if (t===RAIL) c='#6f6a66';
    R(px,py,MS,MS,c);
    if (t===WATER && (x+y*3)%5===0) R(px+1,py+1,2,1,'#7fb2c9');
    if (t===RAIL){ R(px+1,py,1,MS,'#b8bbc4'); if (y%2===0) R(px,py+1,MS,1,'#4a3426'); }
  }
  for (const tr of trees){ const x=Math.round(tr.x/T*MS)-2, y=Math.round(tr.y/T*MS)-3; const fr=isForest(Math.floor(tr.x/T),Math.floor(tr.y/T));
    R(x,y,4,4, tr.pine?'#1a3322':(fr?'#20402a':'#2f5a2a')); R(x+1,y,2,1, tr.pine?'#2e5a3a':'#4f8a3e'); }
  for (const f of fences) R(f.x*MS+(f.h?0:1), f.y*MS+(f.h?1:0), f.h?MS:1, f.h?1:MS, '#5a3d26');
  for (const gv of graves) R(gv.x*MS+1, gv.y*MS, 2, 3, gv.mara?'#d0cbd8':'#8a8794');
  for (const h of houses){ const x=h.x*MS, y=h.y*MS, w=h.w*MS, hh=h.h*MS;
    const roof = h.workshop?'#3b3530':h.church?'#4a4e66':h.roof;
    R(x-1,y-1,w+2,hh+2,'#1a1208'); R(x,y,w,hh,roof); R(x,y,w,2,shade(roof,1.3)); R(x,y+hh-3,w,3,h.workshop?'#6a5d50':h.church?'#a39b8d':h.wall);
    R(x+Math.floor(w/2)-1, y+hh-3, 2, 3, '#3a2416');
    if (h.church){ R(x+w/2-2, y-4, 4, 6, '#9b9385'); R(x+w/2-1,y-6,2,2,'#e8c46a'); } }
  // train
  R(90*MS+2, 14*MS, 8, 51, '#6b2a2a'); R(90*MS+3, 14*MS, 6, 2, '#2b2f3a');
  // paper edge vignette
  const vg=g.createRadialGradient(W*MS/2,H*MS/2,H*MS*.35,W*MS/2,H*MS/2,W*MS*.62); vg.addColorStop(0,'rgba(60,40,20,0)'); vg.addColorStop(1,'rgba(60,40,20,.35)');
  g.fillStyle=vg; g.fillRect(0,0,W*MS,H*MS);
})();

const MAP_LABELS = [
  { t:'Ashwood Forest', x:20, y:21, big:true },
  { t:'Father’s workshop', x:7.5, y:1.2, unk:'???', when: () => F().key },
  { t:'Hollow Farm', x:20, y:55, big:true },
  { t:'Ashbourne', x:47, y:47.5, big:true },
  { t:'The square', x:47, y:34.4 },
  { t:'Café', x:41, y:19 },
  { t:'Bookshop', x:52, y:19 },
  { t:'Records', x:41, y:36 },
  { t:'St. Aldric’s', x:46.5, y:2.6 },
  { t:'Cemetery', x:55.5, y:4.2 },
  { t:'River Ash', x:66, y:6 },
  { t:'Station', x:86.5, y:17 },
  { t:'Engine shed', x:84, y:1.6, when: () => chap()>=2, unk:'???' },
  { t:'Post office', x:59.5, y:21.6 },
  { t:'Blacksmith', x:57.5, y:36.3 },
  { t:'Meadows', x:79, y:50 },
];
function openMap(){
  if (mode!=='play') return;
  if (IN){ toast('No map in here', 'You’re in '+SCN[IN].name); return; }
  mode='map'; for (const k in keys) keys[k]=false; joyReset();
  const c=$('#mapc'); c.width=W*MS; c.height=H*MS; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(mapBase,0,0);
  if (LOOK()>0){ g.fillStyle = LOOK()===1 ? 'rgba(120,60,90,.18)' : LOOK()===3 ? 'rgba(170,110,150,.16)' : 'rgba(20,25,70,.32)'; g.fillRect(0,0,c.width,c.height); }
  const marks=$('#mapmarks'); marks.innerHTML='';
  const place=(el,x,y)=>{ el.style.left=(x/W*100)+'%'; el.style.top=(y/H*100)+'%'; marks.appendChild(el); };
  for (const L of MAP_LABELS){ const el=document.createElement('div'); el.className='mlabel'+(L.big?' big':''); const known = !L.when || L.when(); el.textContent = known ? L.t : L.unk; if (!known) el.classList.add('unk'); place(el,L.x,L.y); }
  for (const n of npcs){ if (!S0.met.includes(n.id) || !vis(n)) continue; const cv=document.createElement('canvas'); cv.width=24; cv.height=24; cv.className='mmark mm-face'; cv.title=CH[n.id].name; drawPortrait(cv.getContext('2d'), CH[n.id]); place(cv, n.x/T, n.y/T-1.2); }
  const o=objective(); if (o.at){ const el=document.createElement('div'); el.className='mmark mm-obj'; place(el, o.at.x/T, o.at.y/T+1); }
  const you=document.createElement('div'); you.className='mmark mm-you'; you.innerHTML='<i></i>';
  you.querySelector('i').style.transform = 'rotate(' + ({up:0,right:90,down:180,left:270}[P.dir]) + 'deg)';
  place(you, P.x/T, P.y/T);
  $('#mapObj').textContent = o.t;
  $('#mapov').classList.add('on');
  // scroll so the player is visible on narrow screens
  requestAnimationFrame(() => { const sc=$('#mapscroll'), wr=$('#mapwrap'); sc.scrollLeft = Math.max(0, wr.offsetWidth*(P.x/(W*T)) - sc.clientWidth/2); });
}
function closeMap(){ $('#mapov').classList.remove('on'); mode='play'; }
$('#mapBtn').addEventListener('click', () => { if (mode==='play') openMap(); else if (mode==='map') closeMap(); $('#mapBtn').blur(); });
$('#mapClose').addEventListener('click', closeMap);
$('#mapov').addEventListener('click', e => { if (e.target.id==='mapov') closeMap(); });
$('#mini').addEventListener('click', () => { if (mode==='play') openMap(); });

const minic=$('#minic').getContext('2d');
function applyMini(){ document.body.classList.toggle('showmini', !!SETTINGS.minimap); }
function drawMini(){
  if (IN) return drawSceneMini();
  if (!SETTINGS.minimap) return;
  const g=minic, S=128; g.imageSmoothingEnabled=false;
  const px=P.x/T*MS, py=P.y/T*MS;
  let sx=Math.round(px-S/2), sy=Math.round(py-S/2);
  sx=Math.max(0,Math.min(W*MS-S,sx)); sy=Math.max(0,Math.min(H*MS-S,sy));
  g.fillStyle='#0e1322'; g.fillRect(0,0,S,S);
  g.drawImage(mapBase, sx, sy, S, S, 0, 0, S, S);
  if (LOOK()>0){ g.fillStyle = LOOK()===1 ? 'rgba(120,60,90,.18)' : LOOK()===3 ? 'rgba(170,110,150,.16)' : 'rgba(20,25,70,.35)'; g.fillRect(0,0,S,S); }
  // people met
  for (const n of npcs){ if (!S0.met.includes(n.id) || !vis(n)) continue; const x=n.x/T*MS-sx, y=n.y/T*MS-sy; if (x<0||y<0||x>S||y>S) continue; g.fillStyle='#070a12'; g.fillRect(x-2,y-2,5,5); g.fillStyle='#e9dcbc'; g.fillRect(x-1,y-1,3,3); }
  // objective
  const o=objective();
  if (o.at && SETTINGS.marker){ let x=o.at.x/T*MS-sx, y=(o.at.y+28)/T*MS-sy; const inside = x>3&&y>3&&x<S-3&&y<S-3;
    const blink = reduceMotion || Math.floor(time*3)%2;
    if (!inside){ const cx=S/2+(px-sx-S/2)*0, ang=Math.atan2(y-(py-sy), x-(px-sx)); x=Math.max(4,Math.min(S-5,(px-sx)+Math.cos(ang)*200)); y=Math.max(4,Math.min(S-5,(py-sy)+Math.sin(ang)*200)); }
    if (blink){ g.fillStyle='#070a12'; g.fillRect(x-3,y-3,7,7); g.fillStyle='#e98c7a'; g.fillRect(x-2,y-2,5,5); } }
  // player
  const x=Math.round(px-sx), y=Math.round(py-sy);
  g.fillStyle='#070a12'; g.fillRect(x-3,y-3,7,7); g.fillStyle='#f2c27a'; g.fillRect(x-2,y-2,5,5);
  g.fillStyle='#fff6c8'; const d={up:[0,-3],down:[0,3],left:[-3,0],right:[3,0]}[P.dir]; g.fillRect(x+d[0],y+d[1],1,1);
}

// ================= joystick =================
const joy = { active:false, x:0, y:0, id:null, cx:0, cy:0 };
const JR = 52;
const jz=$('#joyzone'), jb=$('#joybase'), jk=$('#joyknob');
function joyReset(){ joy.active=false; joy.x=0; joy.y=0; joy.id=null; jk.style.transform=''; jb.style.left=''; jb.style.top=''; jb.style.bottom=''; jb.classList.remove('on','run'); }
function joyMove(e){ let dx=e.clientX-joy.cx, dy=e.clientY-joy.cy; const d=Math.hypot(dx,dy); if (d>JR){ dx*=JR/d; dy*=JR/d; }
  joy.x=dx/JR; joy.y=dy/JR; jk.style.transform=`translate(${dx}px,${dy}px)`; }
jz.addEventListener('pointerdown', e => {
  if (mode==='dialog'){ if (!D.choices) advance(); return; }
  if (mode!=='play') return;
  e.preventDefault(); ensureAudio();
  joy.active=true; joy.id=e.pointerId; try { jz.setPointerCapture(e.pointerId); } catch(_){}
  joy.cx=e.clientX; joy.cy=e.clientY;
  jb.style.left=(e.clientX-64)+'px'; jb.style.top=(e.clientY-64)+'px'; jb.style.bottom='auto'; jb.classList.add('on');
  joyMove(e);
});
jz.addEventListener('pointermove', e => { if (joy.active && e.pointerId===joy.id){ e.preventDefault(); joyMove(e); } });
for (const ev of ['pointerup','pointercancel','lostpointercapture']) jz.addEventListener(ev, e => { if (e.pointerId===joy.id) joyReset(); });
