// The Letter — The dialogue box: typing text, choices, skipping, clues and memories.
'use strict';

// ================= dialogue engine =================
const IS_TOUCH = matchMedia('(hover: none) and (pointer: coarse)').matches;
const D = { queue:[], cur:null, shown:0, full:'', typing:false, choices:null, sel:0, done:null, speaker:null };
const dlg=$('#dialog'), pctx=$('#portrait').getContext('2d');
function dialog(lines, done){
  D.queue = lines.slice(); D.done = done||null; mode='dialog'; document.body.classList.add('indialog');
  dlg.classList.add('on'); $('#prompt').style.display='none';
  for (const k in keys) if (k!=='run') keys[k]=false;
  next();
  if (SETTINGS.skipStory) skipDialog();
}
function next(){
  while (D.queue.length && typeof D.queue[0]==='function'){ D.queue.shift()(); }
  if (!D.queue.length){ endDialog(); return; }
  const item = D.queue.shift();
  if (item.choice){ showChoices(item.choice, item.s); return; }
  D.choices=null; $('#choices').innerHTML='';
  const c = CH[item.s];
  let text = item.t;
  const think = item.s==='noah' && /^\(.*\)$/.test(text.trim());
  if (think) text = text.trim().slice(1,-1);
  const keyLine = item.s==='key' || item.s==='recap';
  dlg.classList.toggle('noport', !c); dlg.classList.toggle('narr', item.s==='narr'); dlg.classList.toggle('think', think); dlg.classList.toggle('keypt', keyLine);
  const who = dlg.querySelector('.who');
  who.textContent = c ? c.name : keyLine ? (item.s==='key' ? '★ Key point' : '★ The story so far') : '';
  if (c && (think || c.role)){ const r=document.createElement('span'); r.className='role'; r.textContent = think ? '(thinking)' : c.role; who.appendChild(r); }
  who.style.display = (c || keyLine) ? '' : 'none';
  if (c) drawPortrait(pctx, c);
  S0.dlgCount = (S0.dlgCount||0) + 1;
  dlg.querySelector('.more .tip').textContent = S0.dlgCount <= 6 ? (IS_TOUCH ? 'Tap here or E to continue' : 'Press E or click to continue') : '';
  D.speaker=c; D.full=text; D.shown=0; D.typing=true;
  dlg.querySelector('.line').textContent=''; dlg.querySelector('.more').style.visibility='hidden';
}
function advance(){
  if (D.typing){ D.shown=D.full.length; dlg.querySelector('.line').textContent=D.full; D.typing=false; dlg.querySelector('.more').style.visibility='visible'; return; }
  next();
}
function showChoices(opts, s){
  const c = CH[s||'noah'];
  dlg.classList.remove('noport','narr'); dlg.querySelector('.who').style.display='';
  dlg.querySelector('.who').textContent = c.name; drawPortrait(pctx,c);
  dlg.querySelector('.line').textContent=''; dlg.querySelector('.more').style.visibility='hidden';
  D.choices = opts.filter(o => !o.when || o.when()); D.sel=0; D.typing=false;
  renderChoices();
}
function renderChoices(){
  const box=$('#choices'); box.innerHTML='';
  const ask=document.createElement('div'); ask.className='ask'; ask.textContent = IS_TOUCH ? 'Choose what to say:' : 'Choose what to say — press 1, 2, 3 or click:'; box.appendChild(ask);
  D.choices.forEach((o,i) => { const b=document.createElement('button'); b.innerHTML=`<span class="n">${i+1}</span>`; b.appendChild(document.createTextNode(o.t));
    if (i===D.sel) b.classList.add('sel'); b.addEventListener('click', ev => { ev.stopPropagation(); choose(i); }); box.appendChild(b); });
}
function choose(i){
  const o=D.choices[i]; if (!o) return; beep(520,.05,'square',.03);
  D.choices=null; $('#choices').innerHTML='';
  const extra = typeof o.then==='function' ? o.then() : (o.then||[]);
  D.queue = [...extra, ...D.queue];
  next();
  if (SETTINGS.skipStory) skipDialog();
}
function endDialog(){
  dlg.classList.remove('on'); document.body.classList.remove('indialog');
  if (mode==='dialog') mode='play';
  const d=D.done; D.done=null; if (d) d();
  save(); refreshHUD();
}
function tickDialog(dt){
  if (!D.typing) return;
  const before=Math.floor(D.shown); D.shown += dt*TEXT_CPS[SETTINGS.text];
  const n=Math.min(D.full.length, Math.floor(D.shown));
  if (n!==before){ dlg.querySelector('.line').textContent = D.full.slice(0,n);
    if (n%3===0 && D.full[n-1] && D.full[n-1]!==' ') beep((D.speaker?D.speaker.pitch:280)+(n%5)*12,.03,'square',.018); }
  if (n>=D.full.length){ D.typing=false; dlg.querySelector('.more').style.visibility='visible'; }
}

// ================= clue / memory / toast =================
let toastT=0;
function toast(lbl,val){ $('#toast .lbl').textContent=lbl; $('#toast .val').textContent=val; $('#toast').classList.add('show'); toastT=3.2; }
function addClue(id){ if (S0.clues.includes(id)) return; S0.clues.push(id); toast('New clue — open journal (J)', CLUES[id].t); chime(); save(); }
function meet(id){ if (!S0.met.includes(id)) S0.met.push(id); }
function takeMemory(id){
  if (S0.mems.includes(id)){ dialog([{s:'noah', t:'I remember. ' + MEMS[id].t + '.'}]); return; }
  S0.mems.push(id);
  dialog([{s:'noah', t:MEMS[id].d}], () => { toast(`Memory ${S0.mems.length}/5`, MEMS[id].t); chime(); });
}
const has = id => S0.clues.includes(id);
