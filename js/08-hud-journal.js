// The Letter — Goals, the top-left goal box, the journal (story, clues, people, memories) and items.
'use strict';

// ================= objectives & HUD =================
function objective(){
  const f=F(), c=chap();
  if (c===4) return objective4();
  const N = id => ({ ...npcPos(id), npc:id });
  if (c===1){
    if (!f.walt) return { t:'Ask the railway worker (Walt) where the bookseller is', at:N('walt') };
    if (!f.hale1) return { t:'Find Edmund Hale’s bookshop — west over the bridge, purple roof', at:N('hale') };
    if (!f.key){
      if (has('carving')) return { t:'Go back to Hale and tell him the word: LANTERN', at:N('hale') };
      if (!f.news) return { t:'Talk to Clara Wynn in the square — she has the old newspapers', at:N('clara') };
      return { t:'Find the carved fence post at Hollow Farm (east fence, south of the road)', at:{x:29*T+8,y:46*T+6} };
    }
    if (!f.lantern) return { t:'Get Dad’s lantern from Tom Barrow at Hollow Farm', at:N('tom') };
    if (f.wsWave && !f.wsDone) return { t:'Fight off the Ashen around the workshop!', at:null };
    if (!f.end) return { t:'Follow the forest trail north to Dad’s workshop — keep left', at: P.y>27*T ? {x:30*T+16,y:28*T} : {x:7*T+8,y:8*T} };
    return { t:'Continue to Chapter Two', at:null };
  }
  if (c===2){
    if (!f.note) return { t:'Sit on the platform bench and wait for Dad', at:{x:87*T+8,y:34*T-6} };
    if (!f.ash1) return { t:'Find the old engine shed — north of the station, along the tracks', at:N('ashcombe') };
    if (!f.culvertKnown) return { t:'Find another way into the shed yard — ask Silas at Mara’s grave', at:N('silas') };
    if (!f.culvert) return { t:'Open the rusty grate under the shed yard’s west fence (by the river)', at:{x:78*T+8,y:9*T-4} };
    if (!f.bossDown) return { t: f.bossStarted ? 'Defeat the Cinder Warden!' : 'Slip through the culvert into the shed yard', at: f.bossStarted ? null : {x:81*T+8,y:11*T} };
    if (!has('ledger')) return { t:'Search the engine shed’s inspection pit for the ledger', at:{x:83*T+8,y:8*T} };
    return { t:'Continue to Chapter Three', at:null };
  }
  if (!f.wp) return { t:'Ask Clara who “W.P.” was — she has the 2006 railway staff records', at:N('clara') };
  if (!f.confess) return { t:'Confront Walt at the station' + (f.letters ? '' : ' (Rosa at the post office may know more)'), at:N('walt') };
  if (!f.pfDone) return { t:'Defend the platform from the Ashen!', at:null };
  if (!f.gameEnd) return { t:'Meet your father at the far end of the platform', at:N('elias') };
  return { t:'The story is complete. Explore Ashbourne freely', at:null };
}
function npcPos(id){ const n=npcs.find(n=>n.id===id); return {x:n.x,y:n.y-28}; }
let lastObj='';
function refreshHUD(){
  try { refreshHearts(); } catch(e){}
  const o=objective(); $('#objLbl').textContent=o.t; $('#jObj').textContent=o.t;
  lastClock='';
  $('#chapLbl').textContent = ['','Chapter One · The Letter','Chapter Two · The Ledger','Chapter Three · Keeping Left','Chapter Four · Harlow Cross'][chap()];
  if (o.t !== lastObj){ if (lastObj && mode!=='title'){ const h=$('#hud'); h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash'); } lastObj=o.t; }
}

// ================= journal =================
function bigQuestions(){
  // each question only appears once the story has raised it, so nothing is spoiled early
  const f=F(), q=[];
  q.push([f.news, 'What happened twenty years ago?', 'The railway office burned down in 2006, and the clerk Mara Voss died inside.', true]);
  q.push([f.lantern, 'Did Dad really start the fire?', 'No. He was framed — Tom was frightened into lying about seeing him.', true]);
  q.push([f.gameEnd || f.ch3end, 'Where is Dad now?', 'Back in Ashbourne. He was waiting at the end of the platform.', true]);
  q.push([f.end, 'Why was Mara killed?', 'She found proof that the railway’s books were faked so the land could be sold cheaply.', f.news]);
  q.push([has('ledger'), 'Who was behind it?', 'Victor Ashcombe, who bought the land. He paid someone called “W.P.”', f.end]);
  q.push([f.wp, 'Who is “W.P.”?', 'Walter Pryce — Walt, the railway worker at the station.', has('ledger')]);
  q.push([f.confess, 'Who actually lit the fire?', 'Walt, for Ashcombe’s money. He didn’t know Mara was inside.', has('ledger')]);
  q.push([f.ch4end, 'Will Ashcombe be stopped?', 'Yes — arrested in Harlow Cross with the original ledger.', f.ash1]);
  return q;
}
function storySoFar(){
  const f=F(), out=[];
  const c1=['My father, Elias Vale, vanished when I was six. Three days ago he wrote to me and told me to come to Ashbourne and find Edmund Hale, the bookseller.'];
  if (f.hale1) c1.push('Hale recognised Dad’s handwriting, but wanted proof I’m his son: the word Dad carved into everything he built.');
  if (f.news) c1.push('Clara showed me the 2006 newspaper: a fire at the railway office killed a clerk, Mara Voss. Dad vanished that night, and the town blamed him.');
  if (has('carving')) c1.push('The word was LANTERN, carved into Tom Barrow’s fence beside Dad’s initials.');
  if (f.key) c1.push('Hale gave me the key to Dad’s workshop, hidden beyond Ashwood forest.');
  if (f.lantern) c1.push('Tom admitted he was frightened into lying about Dad after the fire, and gave me Dad’s lantern.');
  if (f.end) c1.push('In the workshop, Dad’s letter said Mara had found the railway’s books were falsified. She was killed to keep it quiet, and Dad was framed. The proof, her ledger, is in the old engine shed.');
  out.push(['Chapter One — The Letter', c1]);
  if (chap()>=2){
    const c2=['At dawn I waited on the platform. Dad didn’t come.'];
    if (f.note) c2.push('Walt gave me a note from Dad: the platform is being watched. Get the ledger from the engine shed first.');
    if (f.ash1) c2.push('Victor Ashcombe, who bought the railway land after the fire, keeps the shed locked.');
    if (f.culvertKnown) c2.push('Silas showed me a hidden way in: a culvert under the west fence.');
    if (has('ledger')) c2.push('Mara’s ledger shows Ashcombe paid someone called “W.P.” to clear the office records two days before the fire.');
    out.push(['Chapter Two — The Ledger', c2]);
  }
  if (chap()>=3){
    const c3=['I need to find out who “W.P.” was.'];
    if (f.wp) c3.push('Clara’s staff records: W.P. is Walter Pryce. Walt, the railway worker.');
    if (f.letters) c3.push('Rosa says Walt has written to Ashcombe Holdings every month for twenty years.');
    if (f.confess) c3.push('Walt confessed: he set the fire for Ashcombe’s money, not knowing Mara was inside, and let Dad take the blame.');
    if (f.gameEnd) c3.push('Dad was waiting at the end of the platform.');
    out.push(['Chapter Three — Keeping Left', c3]);
  }
  if (chap()>=4){
    const c4=['That night, Dad and I took the train to Harlow Cross to find the original ledger in Ashcombe’s safe.'];
    if (f.marlowe) c4.push('Inspector Marlowe can arrest Ashcombe — but only with the original ledger.');
    if (f.nell) c4.push('Nell Crane, Hugh Crane’s daughter, gave me the office key and the safe combination: 12 · 06 · 06.');
    if (f.heartDown) c4.push('In the archive, the ash of the burned records rose up as the Ashen Heart. I beat it and took the original ledger.');
    if (f.ch4end) c4.push('Marlowe arrested Victor Ashcombe in his own lobby. It’s over.');
    out.push(['Chapter Four — Harlow Cross', c4]);
  }
  const side=['At night the Ashen come out. The village and station are safe. Sleep at June’s café to skip to morning.'];
  side.push(F().pet ? 'Scout the dog is with you now, fighting at your side.' : F().pie ? 'You have a meat pie. Take it to the stray dog by the bridge, east of the village.' : 'A stray dog hides near the bridge, east of the village. A meat pie from June’s café (5 ✦) might win him over.');
  side.push('Greta the blacksmith, south-east of the square, trades ember shards ✦ for a sword, bow and axe.');
  out.push(['Side quests & tips', side]);
  return out;
}

let jTab='story';
function openJournal(){ mode='journal'; $('#journal').classList.add('on'); renderJournal(); for (const k in keys) keys[k]=false; }
function closeJournal(){ $('#journal').classList.remove('on'); mode='play'; }
$('#jBtn').addEventListener('click', () => { if (mode==='play') openJournal(); else if (mode==='journal') closeJournal(); $('#jBtn').blur(); });
$('#jClose').addEventListener('click', closeJournal);
$('#journal').addEventListener('click', e => { if (e.target.id==='journal') closeJournal(); });
document.querySelectorAll('#journal .tabs button[data-tab]').forEach(b => b.addEventListener('click', () => {
  jTab=b.dataset.tab; document.querySelectorAll('#journal .tabs button[data-tab]').forEach(x=>x.classList.toggle('on',x===b)); renderJournal(); }));
const CLUE_ICON = { halephoto:'▣', returned:'✉', nell:'⚷', original:'▤', note:'✉', ashcombe:'☗', ledger:'▤', staff:'▦', letters:'✉', confession:'✝', reunion:'♥', letter:'✉', photo:'▣', hand:'✎', news:'▤', carving:'⌗', grave:'✝', key:'⚷', lantern:'♨', silas:'☗', watch:'◷', postcard:'▭', workshop:'✉' };
function renderJournal(){
  const body=$('#jbody'); body.innerHTML=''; refreshHUD();
  const entry=(icon,title,text,locked)=>{ const e=document.createElement('div'); e.className='entry'+(locked?' locked':'');
    const ic = typeof icon==='string' ? Object.assign(document.createElement('div'),{className:'ic',textContent:icon}) : icon;
    e.appendChild(ic); const t=document.createElement('div'); t.innerHTML=`<h3></h3><p></p>`; t.querySelector('h3').textContent=title; t.querySelector('p').textContent=text; e.appendChild(t); body.appendChild(e); };
  if (jTab==='story'){
    const box=document.createElement('div'); box.className='story'; body.appendChild(box);
    { const h4=document.createElement('h4'); h4.textContent='The big questions'; box.appendChild(h4);
      const bq=bigQuestions(); for (const [done,qq,a,shown] of bq){ if (!shown) continue; const p=document.createElement('p'); p.className='bq'+(done?' done':''); p.innerHTML='<span class="mk"></span><b></b> <span class="ans"></span>'; p.querySelector('.mk').textContent = done ? '✓' : '?'; p.querySelector('b').textContent=qq; p.querySelector('.ans').textContent = done ? a : 'Not solved yet.'; box.appendChild(p); }
      if (bq.some(x=>!x[3])){ const p=document.createElement('p'); p.textContent='More questions will appear as you uncover the story.'; p.style.color='var(--dim)'; p.style.fontStyle='italic'; box.appendChild(p); } }
    for (const [h,lines] of storySoFar()){ const h4=document.createElement('h4'); h4.textContent=h; box.appendChild(h4); for (const l of lines){ const p=document.createElement('p'); p.textContent=l; box.appendChild(p);} }
    const n=document.createElement('p'); n.className='next'; n.textContent='What to do next: '+objective().t; box.appendChild(n);
    const tip=document.createElement('p'); tip.textContent = IS_TOUCH ? 'Tip: tap E next to people and sparkles. The ⌖ button shows the map.' : 'Tip: press E next to people and sparkles. Press M for the map, I for your items.'; tip.style.color='var(--dim)'; box.appendChild(tip);
  } else if (jTab==='clues'){
    const ids=Object.keys(CLUES); const c=document.createElement('div'); c.className='count'; c.textContent=`${S0.clues.length} of ${ids.length} clues`; body.appendChild(c);
    for (const id of S0.clues.slice().reverse()) entry(CLUE_ICON[id]||'?', CLUES[id].t, CLUES[id].d);
    const left=ids.length-S0.clues.length; if (left) entry('?', `${left} more to find`, 'Talk to everyone. Examine anything that looks out of place.', true);
  } else if (jTab==='people'){
    if (!S0.met.length) entry('?','Nobody yet','Start with the railway worker on the platform.',true);
    for (const id of S0.met){ const cv=document.createElement('canvas'); cv.width=24; cv.height=24; cv.className='ic'; drawPortrait(cv.getContext('2d'), CH[id]); entry(cv, CH[id].name, PEOPLE[id]()); }
  } else {
    const c=document.createElement('div'); c.className='count'; c.textContent=`${S0.mems.length} of 5 memories — small sparkles around Ashbourne`; body.appendChild(c);
    for (const id of Object.keys(MEMS)){ if (S0.mems.includes(id)) entry('✦', MEMS[id].t, MEMS[id].d); else entry('·','Not yet remembered','Somewhere in Ashbourne.',true); }
  }
}

// ================= inventory =================
const ITEMS = {
  sword:   { name:"Iron sword", key:false, src:'weapon', desc:"From Greta the blacksmith. Fast and sharp — double the stick’s damage." },
  bow:     { name:"Hunting bow", key:false, src:'weapon', desc:"From Greta. Shoots arrows — hit the Ashen from a distance." },
  axe:     { name:"Woodsman’s axe", key:false, src:'weapon', desc:"From Greta. Slow and heavy, with a wide swing that hits everything nearby." },
  scout:   { name:"Scout", key:true, src:'pet', desc:"A scruffy stray with a torn ear and a big heart. He follows you and bites any Ashen that comes close." },
  stick:   { name:"Walking stick", key:true, src:'flag', desc:"From Walt. Heavy and worn smooth. Swing it at the Ashen — Space or K on a keyboard, ⚔ on a phone." },
  letter:  { name:"Dad’s letter",       key:false, src:'clue', desc:"The letter that started everything. Elias Vale’s handwriting — the first thing he’s ever sent you." },
  photo:   { name:"Photograph",          key:false, src:'clue', desc:"Your father, spring 2009. On the back: Ashbourne. Three years after he disappeared." },
  key:     { name:"Brass key",           key:true,  src:'clue', desc:"Heavy, warm. From Edmund Hale. Opens your father’s workshop beyond Ashwood forest." },
  lantern: { name:"Dad’s lantern",       key:true,  src:'clue', desc:"A dented brass lantern Tom Barrow kept for twenty years. Lights Ashwood — and your swings hit the Ashen twice as hard." },
  watch:   { name:"Mara’s pocket watch", key:false, src:'clue', desc:"Stopped at 2:14. Engraved: ‘E — keep time for me. M.’ Found half-buried in forest moss." },
  postcard:{ name:"Postcard, 2009",      key:false, src:'clue', desc:"Postmarked Harlow Cross. ‘Still keeping left. — E.’ He was alive and writing to Ashbourne." },
  ticket:  { name:"Train ticket stub",   key:false, src:'mem',  desc:"Ashbourne → City, single, 13 June 2006. One way. The night before the fire." },
};

function drawItemIcon(ctx, id){
  const g = ctx; const W=32, H=32;
  g.clearRect(0,0,W,H);
  if (id==='sword'||id==='bow'||id==='axe'){ g.save(); g.scale(2,2); drawWeaponIcon(g,id); g.restore(); return; }
  if (id==='scout'){ const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);}; R(7,9,18,15,'#8a5a32'); R(5,6,6,10,'#5a3a20'); R(21,6,6,10,'#5a3a20'); R(11,17,10,7,'#efe3c8'); R(11,13,3,3,'#1a1418'); R(18,13,3,3,'#1a1418'); R(14,19,4,3,'#1a1418'); R(14,24,4,3,'#e86a6a'); return; }
  if (id==='stick'){ for (let i=0;i<20;i++){ g.fillStyle=i%5===0?'#5a3d26':'#8a6240'; g.fillRect(7+i,25-i,3,3); } g.fillStyle='#6b4a2f'; g.fillRect(24,4,6,6); g.fillStyle='#a77d55'; g.fillRect(25,5,3,2); return; }
  if (id==='letter'){
    g.fillStyle='#e9dcbc'; g.fillRect(4,8,24,18);
    g.fillStyle='#c4a96e'; g.fillRect(4,8,24,1); g.fillRect(4,25,24,1); g.fillRect(4,8,1,18); g.fillRect(27,8,1,18);
    g.fillStyle='#b39a6e'; g.beginPath(); g.moveTo(4,8); g.lineTo(16,18); g.lineTo(28,8); g.stroke();
    g.strokeStyle='#b39a6e'; g.lineWidth=1; g.beginPath(); g.moveTo(4,8); g.lineTo(16,18); g.lineTo(28,8); g.stroke();
    g.fillStyle='#c0341a'; g.beginPath(); g.arc(16,18,4,0,Math.PI*2); g.fill();
  } else if (id==='photo'){
    g.fillStyle='#f0e8d0'; g.fillRect(5,4,22,24);
    g.fillStyle='#d4c8a8'; g.fillRect(5,4,22,1); g.fillRect(5,27,22,1); g.fillRect(5,4,1,24); g.fillRect(26,4,1,24);
    g.fillStyle='#7a9ec0'; g.fillRect(8,8,16,12);
    g.fillStyle='#5a7ea0'; g.fillRect(8,8,16,6);
    g.fillStyle='#e8c870'; g.beginPath(); g.arc(19,13,3,0,Math.PI*2); g.fill();
    g.fillStyle='#3a3028'; g.fillRect(8,22,16,2);
    g.fillStyle='#5a4838'; g.fillRect(8,20,5,2); g.fillRect(15,20,3,2);
  } else if (id==='key'){
    g.fillStyle='#c8a040'; g.beginPath(); g.arc(10,16,6,0,Math.PI*2); g.fill();
    g.fillStyle='#0a0f1e'; g.beginPath(); g.arc(10,16,3,0,Math.PI*2); g.fill();
    g.fillStyle='#c8a040'; g.fillRect(15,15,12,3);
    g.fillRect(23,12,3,3); g.fillRect(19,12,3,3);
    g.fillStyle='#e0c060'; g.fillRect(15,15,12,1); g.beginPath(); g.arc(10,16,6,Math.PI,Math.PI*1.5); g.strokeStyle='#e0c060'; g.lineWidth=1; g.stroke();
  } else if (id==='lantern'){
    g.fillStyle='#8a6a30'; g.fillRect(12,3,8,3);
    g.fillStyle='#c09040'; g.fillRect(10,6,12,2);
    g.fillStyle='rgba(255,200,80,.18)'; g.beginPath(); g.arc(16,18,9,0,Math.PI*2); g.fill();
    g.fillStyle='#c09040'; g.fillRect(10,8,2,18); g.fillRect(20,8,2,18);
    g.fillRect(10,8,12,2); g.fillRect(10,24,12,2);
    g.fillStyle='rgba(40,28,12,.7)'; g.fillRect(12,10,8,14);
    g.fillStyle='#ffe090'; g.beginPath(); g.arc(16,17,4,0,Math.PI*2); g.fill();
    g.fillStyle='#ffb030'; g.beginPath(); g.arc(16,17,2,0,Math.PI*2); g.fill();
    g.fillStyle='#c09040'; g.fillRect(13,26,6,3);
  } else if (id==='watch'){
    g.fillStyle='#b8963c'; g.beginPath(); g.arc(16,16,10,0,Math.PI*2); g.fill();
    g.fillStyle='#e8e0c8'; g.beginPath(); g.arc(16,16,8,0,Math.PI*2); g.fill();
    g.fillStyle='#3a2a18'; g.beginPath(); g.arc(16,16,7,0,Math.PI*2); g.fill();
    g.fillStyle='#e8d090'; g.fillRect(15,10,2,7); g.fillRect(16,16,5,1);
    g.fillStyle='#b8963c'; g.fillRect(14,4,4,4); g.fillRect(14,24,4,4);
    g.fillStyle='#c8a848'; g.beginPath(); g.arc(16,16,1,0,Math.PI*2); g.fill();
  } else if (id==='postcard'){
    g.fillStyle='#f0e8d8'; g.fillRect(3,7,26,18);
    g.fillStyle='#c8b898'; g.fillRect(3,7,26,1); g.fillRect(3,24,26,1); g.fillRect(3,7,1,18); g.fillRect(28,7,1,18);
    g.fillStyle='#7a9ec0'; g.fillRect(17,9,10,8);
    g.strokeStyle='#c8b898'; g.lineWidth=1;
    for(let y=10;y<24;y+=3){ g.beginPath(); g.moveTo(5,y); g.lineTo(14,y); g.stroke(); }
    g.fillStyle='#c03020'; g.fillRect(24,9,4,5);
  } else if (id==='ticket'){
    g.fillStyle='#f5e8c0'; g.fillRect(3,10,26,14);
    g.fillStyle='#c8a860'; g.fillRect(3,10,26,1); g.fillRect(3,23,26,1); g.fillRect(3,10,1,14); g.fillRect(28,10,1,14);
    g.fillStyle='#c8a860'; g.fillRect(13,10,1,14);
    g.fillStyle='#2a1e0e'; g.font='bold 5px monospace'; g.fillText('ASH',4,18); g.fillText('CTY',16,18);
    g.fillStyle='#a06030'; for(let y=11;y<23;y+=3){ g.fillRect(14,y,1,2); }
    g.fillStyle='#e09040'; g.beginPath(); g.arc(7,17,2,0,Math.PI*2); g.fill();
  }
}

function invHas(id){ const it=ITEMS[id]; if (!it) return false; if (it.src==='flag') return !!F()[id]; if (it.src==='weapon') return (S0.weapons||[]).includes(id); if (it.src==='pet') return !!F().pet; return it.src==='clue' ? S0.clues.includes(id) : S0.mems.includes(id); }

function openInv(){ mode='inv'; $('#inv').classList.add('on'); renderInv(); for (const k in keys) keys[k]=false; }
function closeInv(){ $('#inv').classList.remove('on'); mode='play'; }
$('#invBtn').addEventListener('click', () => { if (mode==='play') openInv(); else if (mode==='inv') closeInv(); $('#invBtn').blur(); });
$('#invClose').addEventListener('click', closeInv);
$('#inv').addEventListener('click', e => { if (e.target.id==='inv') closeInv(); });

function renderInv(){
  const body=$('#invbody'); body.innerHTML='';
  const owned = Object.keys(ITEMS).filter(id => invHas(id));
  if (!owned.length){
    const e=document.createElement('div'); e.className='inv-empty';
    e.textContent="Noah’s pockets are empty. Start by talking to the railway worker.";
    body.appendChild(e); return;
  }
  for (const id of owned){
    const it = ITEMS[id];
    const card = document.createElement('div');
    card.className = 'inv-item' + (it.key ? ' key-item' : '');
    const cv = document.createElement('canvas'); cv.width=32; cv.height=32;
    drawItemIcon(cv.getContext('2d'), id);
    card.appendChild(cv);
    const nm = document.createElement('div'); nm.className='iname'; nm.textContent=it.name; card.appendChild(nm);
    const ds = document.createElement('div'); ds.className='idesc'; ds.textContent=it.desc; card.appendChild(ds);
    if (it.key){ const b=document.createElement('div'); b.className='ibadge'; b.textContent='KEY ITEM'; card.appendChild(b); }
    body.appendChild(card);
  }
}
