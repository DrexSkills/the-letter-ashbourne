// The Letter — Keyboard and touch input, settings, generated music and basic sounds.
'use strict';

// ================= input =================
const keys = {};
let mode = 'title';
const kmap = { Space:'atk', KeyK:'atk', ArrowUp:'up', KeyW:'up', ArrowDown:'down', KeyS:'down', ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right', ShiftLeft:'run', ShiftRight:'run' };
addEventListener('keydown', e => {
  if (kmap[e.code]) { keys[kmap[e.code]]=true; if (mode!=='title') e.preventDefault(); }
  if (e.repeat) return;
  const act = e.code==='KeyE'||e.code==='Space'||e.code==='Enter';
  if (e.code==='Escape' || (e.code==='KeyP' && (mode==='play'||mode==='pause'))){
    if (mode==='play') openPause(); else if (mode==='ach') closeAch(); else if (mode==='how') closeHow(); else if (mode==='dialog') skipDialog(); else if (mode==='cut') skipCut(); else if (mode==='pause') closePause(); else if (mode==='settings') closeSettings(); else if (mode==='journal') closeJournal(); else if (mode==='map') closeMap(); else if (mode==='inv') closeInv();
    e.preventDefault(); return;
  }
  if (mode==='dialog'){
    if (D.choices){ const n=parseInt(e.key,10); if (n>=1&&n<=D.choices.length){ choose(n-1); e.preventDefault(); return; }
      if (e.code==='ArrowUp'||e.code==='KeyW'){ D.sel=(D.sel+D.choices.length-1)%D.choices.length; renderChoices(); }
      if (e.code==='ArrowDown'||e.code==='KeyS'){ D.sel=(D.sel+1)%D.choices.length; renderChoices(); }
      if (act){ choose(D.sel); e.preventDefault(); } return; }
    if (act){ advance(); e.preventDefault(); } return;
  }
  if (mode==='cut'){ if (act){ cutNext(); e.preventDefault(); } return; }
  if (mode==='card'){ if (act){ closeCard(); e.preventDefault(); } return; }
  if (mode==='journal'){ if (e.code==='KeyJ'||e.code==='Escape') closeJournal(); return; }
  if (mode==='map'){ if (e.code==='KeyM') closeMap(); return; }
  if (mode==='inv'){ if (e.code==='KeyI'||e.code==='Escape') closeInv(); return; }
  if (mode==='play'){
    if (act && e.code!=='Space'){ interact(); e.preventDefault(); }
    if (e.code==='Space' || e.code==='KeyK'){ e.preventDefault(); if (!canFight()) interact(); else attack(); }
    if (e.code==='KeyJ') openJournal();
    if (e.code==='KeyM') openMap();
    if (e.code==='KeyI') openInv();
    if (e.code==='KeyQ') cycleWeapon();
    if (/^Digit[1-4]$/.test(e.code)) selectWeapon(+e.code.slice(5)-1);
    if (e.code==='KeyH') openHow('play');
    if (e.code==='KeyU') toggleUI();
  }
});
addEventListener('keyup', e => { if (kmap[e.code]) keys[kmap[e.code]]=false; });
addEventListener('blur', () => { for (const k in keys) keys[k]=false; });
document.querySelectorAll('#touch button').forEach(b => {
  const k=b.dataset.k;
  const on = e => { e.preventDefault(); b.classList.add('on');
    if (k==='act'){ if (mode==='dialog'){ if (!D.choices) advance(); } else if (mode==='cut') cutNext(); else if (mode==='card') closeCard(); else if (mode==='play') interact(); }
    else if (k==='swap'){ if (mode==='play') cycleWeapon(); }
    else { keys[k]=true; if (k==='atk' && mode==='play') attack(); } };
  const off = e => { e.preventDefault(); b.classList.remove('on'); if (k!=='act') keys[k]=false; };
  b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off); b.addEventListener('pointercancel',off); b.addEventListener('pointerleave',off);
});
$('#dialog').addEventListener('click', e => { if (mode==='dialog' && !D.choices && !e.target.closest('#choices')) advance(); });
$('#cut').addEventListener('click', () => { if (mode==='cut') cutNext(); });

// ================= settings =================
const SET_KEY = 'the-letter-settings-v1';
const SETTINGS = Object.assign({ music:.6, sfx:.7, text:'normal', zoom:0, marker:true, minimap:true, diff:'normal', muted:false }, (() => { try { return JSON.parse(localStorage.getItem(SET_KEY))||{}; } catch(e){ return {}; } })());
const saveSettings = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(SETTINGS)); } catch(e){} };
const TEXT_CPS = { slow:30, normal:58, fast:120, instant:1e6 };

// ================= music & sound =================
const Music = (() => {
  let ac=null, mus, sfx, verb, delay, nextBar=0, bar=0, mood='title', note=2, timer=null;
  const BPM=64, beat=60/BPM;
  const hz = n => 440*Math.pow(2,(n-69)/12);
  const MOODS = {
    dawn:   { chords:[[43,55,59,62,66],[40,55,59,64,67],[36,55,60,64,67],[38,57,62,66,69]], scale:[67,69,71,74,76,79,81], p:.34, bright:1300, amb:'birds' },
    title:  { chords:[[45,57,60,64,67],[41,53,57,60,64],[36,55,60,64,67],[40,55,59,62,67]], scale:[69,72,74,76,79,81,84], p:.38, bright:1500, amb:'none' },
    day:    { chords:[[36,55,60,64,71],[45,57,60,64,67],[41,57,60,64,69],[43,55,59,62,67]], scale:[72,74,76,79,81,84,86], p:.46, bright:2100, amb:'birds' },
    dusk:   { chords:[[45,57,60,64,71],[41,57,60,65,69],[36,55,60,64,67],[40,55,59,62,67]], scale:[69,72,74,76,79,81,84], p:.36, bright:1400, amb:'birds' },
    night:  { chords:[[38,57,60,62,65],[34,53,58,62,65],[41,57,60,64,67],[45,57,60,64,67]], scale:[62,64,65,69,72,74,77], p:.28, bright:950, amb:'crickets' },
    forest: { chords:[[40,59,62,64,66],[36,55,59,64,66],[40,59,62,67,71],[38,57,62,66,69]], scale:[64,67,69,71,74,76,79], p:.18, bright:750, amb:'crickets' },
  };
  function init(){
    if (ac){ if (ac.state==='suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){ return; }
    const master=ac.createGain(); master.connect(ac.destination);
    mus=ac.createGain(); sfx=ac.createGain(); mus.connect(master); sfx.connect(master);
    verb=ac.createConvolver();
    const len=Math.floor(ac.sampleRate*3.4), buf=ac.createBuffer(2,len,ac.sampleRate);
    for (let ch=0; ch<2; ch++){ const d=buf.getChannelData(ch); for (let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.8); }
    verb.buffer=buf; const vg=ac.createGain(); vg.gain.value=.6; verb.connect(vg); vg.connect(mus);
    delay=ac.createDelay(2); delay.delayTime.value=beat*.75;
    const fb=ac.createGain(); fb.gain.value=.3; const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1700;
    delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(verb); lp.connect(mus);
    apply();
    nextBar=ac.currentTime+.3; timer=setInterval(sched,150);
    document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else ac.resume(); });
    const h=$('#soundHint'); if (h) h.classList.add('gone');
  }
  function apply(){
    if (!ac) return; const t=ac.currentTime;
    mus.gain.setTargetAtTime(SETTINGS.muted?0:SETTINGS.music*.85, t, .3);
    sfx.gain.setTargetAtTime(SETTINGS.muted?0:SETTINGS.sfx*1.3, t, .05);
  }
  function env(g,t,a,peak,dur,rel){ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+a); g.gain.setValueAtTime(peak,t+dur); g.gain.linearRampToValueAtTime(0,t+dur+rel); }
  function pad(notes,t,dur,bright){
    const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(bright*.6,t); f.frequency.linearRampToValueAtTime(bright,t+dur*.5); f.frequency.linearRampToValueAtTime(bright*.6,t+dur);
    const g=ac.createGain(); env(g,t,1.6,.05,dur,2.2); f.connect(g); g.connect(mus); const s=ac.createGain(); s.gain.value=.7; g.connect(s); s.connect(verb);
    notes.slice(1).forEach((n,i) => { for (const det of [-6,6]){ const o=ac.createOscillator(); o.type=i%2?'sine':'triangle'; o.frequency.value=hz(n); o.detune.value=det; const og=ac.createGain(); og.gain.value=.22; o.connect(og); og.connect(f); o.start(t); o.stop(t+dur+2.4); } });
  }
  function bass(n,t,dur){ const o=ac.createOscillator(); o.type='sine'; o.frequency.value=hz(n); const g=ac.createGain(); env(g,t,.25,.09,dur*.6,dur*.5); o.connect(g); g.connect(mus); o.start(t); o.stop(t+dur*1.2+.1); }
  function pluck(n,t,vel){
    const g=ac.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.075*vel,t+.012); g.gain.exponentialRampToValueAtTime(.0005,t+2.2);
    const o1=ac.createOscillator(); o1.type='sine'; o1.frequency.value=hz(n);
    const o2=ac.createOscillator(); o2.type='triangle'; o2.frequency.value=hz(n)*2; const g2=ac.createGain(); g2.gain.value=.18;
    o1.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(mus); const sv=ac.createGain(); sv.gain.value=.55; g.connect(sv); sv.connect(verb); const sd=ac.createGain(); sd.gain.value=.35; g.connect(sd); sd.connect(delay);
    o1.start(t); o2.start(t); o1.stop(t+2.3); o2.stop(t+2.3);
  }
  function bird(t){ for (let k=0;k<2+Math.floor(Math.random()*3);k++){ const tt=t+k*.11, o=ac.createOscillator(), g=ac.createGain(); const f0=2600+Math.random()*900;
    o.type='sine'; o.frequency.setValueAtTime(f0,tt); o.frequency.exponentialRampToValueAtTime(f0*1.35,tt+.07);
    g.gain.setValueAtTime(0,tt); g.gain.linearRampToValueAtTime(.012,tt+.01); g.gain.exponentialRampToValueAtTime(.0003,tt+.09); o.connect(g); g.connect(mus); const sv=ac.createGain(); sv.gain.value=.6; g.connect(sv); sv.connect(verb); o.start(tt); o.stop(tt+.1); } }
  function cricket(t){ const o=ac.createOscillator(), g=ac.createGain(); o.type='square'; o.frequency.value=4300+Math.random()*300; const f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=4400; f.Q.value=8;
    g.gain.setValueAtTime(0,t); for (let i=0;i<6;i++){ g.gain.setValueAtTime(.006,t+i*.05); g.gain.setValueAtTime(0,t+i*.05+.025); }
    o.connect(f); f.connect(g); g.connect(mus); o.start(t); o.stop(t+.35); }
  function playBar(t){
    const m=MOODS[mood], ch=m.chords[bar%4], bd=beat*4;
    pad(ch,t,bd+.4,m.bright);
    bass(ch[0]-12+12, t, bd*.5); if (mood!=='forest') bass(ch[0], t+bd*.5, bd*.5);
    const sparse = bar%8===7;
    for (let i=0;i<8;i++){
      if (Math.random() > (sparse?m.p*.3:m.p)) continue;
      const r=Math.random(); note += r<.35?1:r<.7?-1:r<.85?2:-2;
      note = Math.max(0, Math.min(m.scale.length-1, note));
      const tt = t + i*beat/2 + (Math.random()-.5)*.03;
      pluck(m.scale[note], tt, i%4===0?1:.65+Math.random()*.25);
    }
    if (bar%8===3 && mood!=='forest'){ ch.slice(1).forEach((n,i) => pluck(n+12, t+bd*.5+i*beat*.25, .35)); }
    if (m.amb==='birds' && Math.random()<.55) bird(t+Math.random()*bd);
    if (m.amb==='crickets'){ cricket(t+Math.random()*bd); if (Math.random()<.6) cricket(t+Math.random()*bd); }
  }
  function sched(){ if (!ac || ac.state!=='running') return; while (nextBar < ac.currentTime+.8){ playBar(nextBar); nextBar += beat*4; bar++; } }
  return { init, apply, setMood:m => { if (MOODS[m]) mood=m; }, ctx:()=>ac, sfx:()=>sfx };
})();
// Phones only allow sound after a real tap, and an iPhone's silent switch mutes
// web audio unless a normal <audio> element is playing. So on every tap we
// (1) create/resume the audio engine, (2) play a tiny empty sound inside the tap,
// and (3) keep a silent looping <audio> element running so the music isn't muted.
const SILENT_WAV = 'data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
let silentEl = null;
function ensureAudio(){
  Music.init();
  const ac = Music.ctx(); if (!ac) return;
  if (ac.state !== 'running') { try { ac.resume(); } catch(e){} }
  try { const b=ac.createBuffer(1,1,22050), src=ac.createBufferSource(); src.buffer=b; src.connect(ac.destination); src.start(0); } catch(e){}
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch(e){}
  if (IS_TOUCH_DEVICE){
    if (!silentEl){ silentEl = new Audio(SILENT_WAV); silentEl.loop = true; silentEl.setAttribute('playsinline',''); silentEl.preload='auto'; }
    if (silentEl.paused) { const p = silentEl.play(); if (p && p.catch) p.catch(()=>{}); }
  }
  const ok = ac.state === 'running'; const h=$('#soundHint'); if (h && ok) h.classList.add('gone');
}
const IS_TOUCH_DEVICE = matchMedia('(hover: none) and (pointer: coarse)').matches || 'ontouchend' in window;
for (const ev of ['touchstart','touchend','pointerdown','click','keydown']) addEventListener(ev, ensureAudio, { passive:true, capture:true });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { const ac=Music.ctx(); if (ac && ac.state!=='running') { try { ac.resume(); } catch(e){} } if (silentEl && silentEl.paused && Music.ctx()) silentEl.play().catch(()=>{}); } else if (silentEl) silentEl.pause(); });

function beep(f, d=.04, type='square', vol=.03, when=0){
  const ac=Music.ctx(); if (!ac || SETTINGS.muted) return;
  try { const t=ac.currentTime+when, o=ac.createOscillator(), g=ac.createGain();
    o.type=type; o.frequency.value=f; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g); g.connect(Music.sfx()); o.start(t); o.stop(t+d+.02);
  } catch(e){}
}
const chime = () => { beep(660,.18,'triangle',.06); beep(880,.25,'triangle',.06,.12); beep(1320,.35,'triangle',.04,.24); };
const syncMute = () => { $('#sBtn').classList.toggle('muted', !!SETTINGS.muted); };
$('#sBtn').addEventListener('click', () => { SETTINGS.muted=!SETTINGS.muted; saveSettings(); Music.apply(); syncMute(); $('#sBtn').blur(); });
syncMute();
