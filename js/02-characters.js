// The Letter — Character looks, the pixel sprite drawer and dialogue portraits.
'use strict';

// ================= characters =================
const CH = {
  noah:  { name:'Noah',  skin:'#c98f6b', skin2:'#a9724f', hair:'#17141a', style:'curly', top:'#2c2f3a', top2:'#20222c', pants:'#3b4a6b', pants2:'#2d3a55', pack:true, pitch:330 },
  walt:  { name:'Walt Pryce', skin:'#d9a27e', skin2:'#b8815f', hair:'#9a9a9a', style:'short', hat:{c:'#26324f',s:'cap'}, top:'#2f3d63', top2:'#243050', pants:'#2a2a33', pants2:'#1f1f27', mustache:'#b0aca6', pitch:190 },
  hale:  { name:'Edmund Hale', skin:'#e0b394', skin2:'#c08f70', hair:'#e8e4dc', style:'bald', glasses:true, beard:'#e8e4dc', top:'#6b4a2f', top2:'#523822', shirt:'#d8d0c0', pants:'#4a3f36', pants2:'#3a3029', pitch:220 },
  clara: { name:'Clara Wynn', skin:'#e3b08f', skin2:'#c48f70', hair:'#5a3424', style:'long', top:'#3f5f4a', top2:'#2f4a39', pants:'#3a3540', pants2:'#2c2832', scarf:'#c8a24a', pitch:420 },
  tom:   { name:'Tom Barrow', skin:'#c48a62', skin2:'#a26c48', hair:'#9c958a', style:'short', hat:{c:'#d9b35e',s:'straw'}, beard:'#a39c90', top:'#3d5a8a', top2:'#2e466e', shirt:'#b84a3a', pants:'#3d5a8a', pants2:'#2e466e', pitch:160 },
  silas: { name:'Silas Voss', skin:'#b88264', skin2:'#966447', hair:'#2a201c', style:'short', hat:{c:'#1d1a1c',s:'brim'}, stubble:'#4a3a32', top:'#2b2826', top2:'#1f1c1b', pants:'#1f1d1f', pants2:'#171517', pitch:140 },
  june:  { name:'June', skin:'#a86b4f', skin2:'#8a5238', hair:'#2a1a14', style:'bun', top:'#b0574a', top2:'#8e4237', apron:'#efe6d4', pants:'#3a2f2a', pants2:'#2c231f', pitch:380 },
  ashcombe: { name:'Victor Ashcombe', role:'landowner', skin:'#e2b896', skin2:'#c4967a', hair:'#cfcac2', style:'short', top:'#2e3346', top2:'#232838', shirt:'#e8e4dc', pants:'#2a2e3e', pants2:'#20232f', mustache:'#bdb8b0', pitch:175 },
  rosa:  { name:'Rosa Marsh', role:'postmistress', skin:'#d9a07c', skin2:'#b8805e', hair:'#b9a27a', style:'bun', glasses:true, top:'#8a2e2e', top2:'#6e2424', scarf:'#e8c46a', pants:'#2f3446', pants2:'#252a38', pitch:400 },
  bennet: { name:'Reverend Bennet', role:'vicar', skin:'#e8c0a0', skin2:'#c99e80', hair:'#8a8478', style:'bald', glasses:true, top:'#1d1d24', top2:'#141418', shirt:'#f2f2f2', pants:'#1d1d24', pants2:'#141418', pitch:205 },
  elias: { name:'Elias Vale', role:'your father', skin:'#c48a66', skin2:'#a26e4e', hair:'#77727c', style:'curly', beard:'#6a656e', top:'#6e6a66', top2:'#555150', pants:'#3a3a44', pants2:'#2c2c34', pitch:250 },
  greta: { name:'Greta Holloway', role:'blacksmith', skin:'#c48a62', skin2:'#a26c48', hair:'#7a3a1a', style:'bun', top:'#5a4a42', top2:'#463a34', apron:'#3a2a22', pants:'#2f2a2a', pants2:'#241f1f', pitch:240 },
  marlowe: { name:'Inspector Marlowe', role:'county police', skin:'#d9a27e', skin2:'#b8815f', hair:'#5a5450', style:'short', hat:{c:'#3a3a40',s:'brim'}, mustache:'#6a6460', top:'#4a4440', top2:'#3a3430', pants:'#2a2a30', pants2:'#202026', pitch:180 },
  nell:  { name:'Nell Crane', role:'night clerk', skin:'#f0c8a8', skin2:'#d0a888', hair:'#b84a2a', style:'short', glasses:true, top:'#2f5a5a', top2:'#244848', scarf:'#d8d0c0', pants:'#2f3446', pants2:'#252a38', pitch:430 },
  agnes: { name:'Agnes Mott', role:'the miller', skin:'#e2b896', skin2:'#c4967a', hair:'#d8d0c0', style:'bun', top:'#6a7a4a', top2:'#55623a', apron:'#efe6d4', pants:'#4a3f36', pants2:'#3a3029', pitch:330 },
  ned:   { name:'Old Ned', role:'the fisherman', skin:'#c48a62', skin2:'#a26c48', hair:'#b8b2aa', style:'short', hat:{c:'#d9b35e',s:'brim'}, beard:'#c9c4bc', top:'#d9a03a', top2:'#b8822a', pants:'#3a4a5a', pants2:'#2c3846', pitch:150 },
  pip:   { name:'Pip', skin:'#e8b896', skin2:'#c99474', hair:'#c46a2a', style:'short', hat:{c:'#c0392b',s:'cap'}, top:'#e0a040', top2:'#b88030', pants:'#4a5a7a', pants2:'#3a4862', kid:true, pitch:520 },
};

function drawChar(g, px, py, dir, frame, c, holdLight){
  const r=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(px+x,py+y,w,h); };
  const step = frame===1?1:frame===3?-1:0;
  const b = (frame===1||frame===3)?1:0;
  const rh=(x,y,w,h,col)=>r(x,y+b,w,h,col);
  r(3,22,10,2,'rgba(20,15,40,.3)');
  const E='#1a1418';
  const hc = c.hat && c.hat.c, hc2 = c.hat && shade(c.hat.c,.7);
  if (dir==='down'||dir==='up'){
    const lL=step>0?4:5, rL=step<0?4:5;
    r(5,15+b,3,lL,c.pants); r(8,15+b,3,rL,c.pants2);
    r(5,15+b+lL,3,2,'#18181d'); r(8,15+b+rL,3,2,'#18181d');
    rh(4,9,8,7,c.top); rh(4,14,8,1,c.top2);
    if (c.coat){ rh(4,14,8,4,c.top); rh(4,17,8,1,c.top2); if (dir==='down') rh(7,10,1,7,c.top2); }
    if (c.shirt && dir==='down') rh(7,9,2,5,c.shirt);
    if (c.apron && dir==='down') rh(5,11,6,5,c.apron);
    if (c.scarf) rh(5,9,6,2,c.scarf);
    r(3,10+b+(step>0?1:0),1,5,c.top2); r(12,10+b+(step<0?1:0),1,5,c.top2);
    r(3,15+b+(step>0?1:0),1,1,c.skin); r(12,15+b+(step<0?1:0),1,1,c.skin);
    if (dir==='down'){
      if (c.pack){ rh(5,9,1,5,'#6b4a2f'); rh(10,9,1,5,'#6b4a2f'); }
      rh(5,3,6,6,c.skin); rh(5,8,6,1,c.skin2);
      if (blinkNow(c)){ rh(6,6,1,1,c.skin2); rh(9,6,1,1,c.skin2); } else { rh(6,6,1,1,E); rh(9,6,1,1,E); }
      const hh=c.hair;
      if (c.style==='curly'){ rh(4,1,8,3,hh); rh(3,2,1,4,hh); rh(12,2,1,4,hh); rh(5,0,6,1,hh); rh(5,4,2,1,hh); rh(8,4,3,1,hh); rh(6,1,2,1,'#2a2430'); }
      else if (c.style==='short'||c.style==='bun'){ rh(5,1,6,3,hh); rh(4,2,1,4,hh); rh(11,2,1,4,hh); if (c.style==='bun') rh(6,-1,4,2,hh); }
      else if (c.style==='long'){ rh(5,1,6,3,hh); rh(4,2,1,9,hh); rh(11,2,1,9,hh); rh(3,4,1,7,hh); rh(12,4,1,7,hh); rh(5,4,2,1,hh); }
      else if (c.style==='bald'){ rh(4,4,1,3,hh); rh(11,4,1,3,hh); rh(7,3,2,1,shade(c.skin,1.12)); }
      if (c.beard){ rh(5,7,6,2,c.beard); rh(6,9,4,1,c.beard); }
      if (c.mustache) rh(6,7,4,1,c.mustache);
      if (c.stubble) { rh(5,7,6,2,c.stubble); rh(6,7,4,1,c.skin2); }
      if (c.glasses){ rh(5,6,6,1,'#2a2a2a'); rh(6,6,1,1,'#bfe0f0'); rh(9,6,1,1,'#bfe0f0'); }
      if (c.hat){ if (c.hat.s==='beanie'){ rh(4,0,8,4,hc); rh(4,3,8,1,hc2); rh(5,1,1,2,shade(hc,1.25)); rh(7,-2,2,2,'#efe3c8'); } else if (c.hat.s==='cap'){ rh(4,0,8,3,hc); rh(4,3,8,1,hc2);} else if (c.hat.s==='straw'){ rh(4,-1,8,3,hc); rh(2,2,12,1,hc2);} else { rh(5,-1,6,3,hc); rh(3,2,10,1,hc2);} }
      if (holdLight){ r(12,14+b,2,3,'#3a2a1a'); r(12,15+b,2,1,'#ffd88a'); }
    } else {
      if (c.pack){ rh(4,9,8,6,'#6b4a2f'); rh(5,10,6,2,'#563a24'); rh(7,12,2,1,'#c9a46a'); }
      rh(5,3,6,6,c.skin);
      const hh=c.hair;
      if (c.style==='curly'){ rh(4,0,8,8,hh); rh(3,2,1,5,hh); rh(12,2,1,5,hh); rh(6,1,2,1,'#2a2430'); }
      else if (c.style==='long'){ rh(4,1,8,10,hh); rh(3,3,1,8,hh); rh(12,3,1,8,hh); }
      else if (c.style==='bald'){ rh(5,4,6,4,hh); rh(6,3,4,1,shade(c.skin,1.1)); }
      else { rh(4,1,8,6,hh); if (c.style==='bun') rh(6,-1,4,3,hh); }
      if (c.hat){ if (c.hat.s==='beanie'){ rh(4,0,8,4,hc); rh(4,3,8,1,hc2); rh(5,1,1,2,shade(hc,1.25)); rh(7,-2,2,2,'#efe3c8'); } else if (c.hat.s==='cap'){ rh(4,0,8,3,hc);} else if (c.hat.s==='straw'){ rh(4,-1,8,3,hc); rh(2,2,12,1,hc2);} else { rh(5,-1,6,3,hc); rh(3,2,10,1,hc2);} }
      if (holdLight){ r(2,14+b,2,3,'#3a2a1a'); r(2,15+b,2,1,'#ffd88a'); }
    }
  } else {
    if (step!==0){ r(5,15+b,2,4,c.pants2); r(9,15+b,2,4,c.pants); r(4,19+b,3,2,'#18181d'); r(9,19+b,3,2,'#18181d'); }
    else { r(6,15,4,5,c.pants); r(6,20,5,2,'#18181d'); }
    rh(5,9,6,7,c.top); rh(5,14,6,1,c.top2);
    if (c.coat){ rh(5,14,6,4,c.top); rh(5,17,6,1,c.top2); }
    if (c.apron) rh(9,10,2,6,c.apron);
    if (c.scarf) rh(5,9,6,2,c.scarf);
    if (c.pack){ rh(2,9,4,6,'#6b4a2f'); rh(2,10,3,2,'#563a24'); }
    const sw = step>0?2:step<0?-1:0;
    r(8+sw,10+b,2,5,c.top2); r(8+sw,15+b,2,1,c.skin);
    if (holdLight){ r(9+sw,16+b,3,4,'#3a2a1a'); r(10+sw,17+b,1,2,'#ffd88a'); }
    rh(5,3,6,6,c.skin); rh(5,8,6,1,c.skin2); rh(11,6,1,1,c.skin);
    const hh=c.hair;
    if (c.style==='curly'){ rh(4,1,8,3,hh); rh(4,3,4,4,hh); rh(5,0,6,1,hh); rh(10,4,2,1,hh); rh(3,2,1,4,hh); rh(6,1,2,1,'#2a2430'); }
    else if (c.style==='long'){ rh(5,1,6,3,hh); rh(4,2,4,9,hh); rh(3,4,1,6,hh); }
    else if (c.style==='bald'){ rh(5,4,2,3,hh); }
    else { rh(5,1,6,3,hh); rh(4,2,3,4,hh); if (c.style==='bun') rh(2,2,3,3,hh); }
    rh(9,6,1,1, blinkNow(c) ? c.skin2 : E);
    if (c.beard){ rh(7,7,5,2,c.beard); rh(8,9,3,1,c.beard); }
    if (c.mustache) rh(9,7,3,1,c.mustache);
    if (c.stubble) rh(8,8,4,1,c.stubble);
    if (c.glasses){ rh(7,6,5,1,'#2a2a2a'); rh(9,6,1,1,'#bfe0f0'); }
    if (c.hat){ if (c.hat.s==='beanie'){ rh(4,0,8,4,hc); rh(4,3,8,1,hc2); rh(5,1,1,2,shade(hc,1.25)); rh(7,-2,2,2,'#efe3c8'); } else if (c.hat.s==='cap'){ rh(4,0,8,3,hc); rh(10,3,4,1,hc2);} else if (c.hat.s==='straw'){ rh(4,-1,8,3,hc); rh(2,2,12,1,hc2);} else { rh(5,-1,6,3,hc); rh(3,2,10,1,hc2);} }
  }
}
// characters blink now and then, each on their own rhythm
function blinkNow(c){ if (typeof time==='undefined' || reduceMotion) return false; const t=time*0.8 + (c.pitch||300)*0.0137; return (t % 3.7) < 0.12; }
// In the snow, everyone outdoors wears a warm coat, a scarf and a woolly hat.
const WINTER_COATS = { Noah:'#3a3f52', 'Walt Pryce':'#2a2f45', 'Edmund Hale':'#5a4636', June:'#7a3a32', 'Clara Wynn':'#3a4a3a', 'Tom Barrow':'#5a4a32', Pip:'#c0392b',
  'Rosa Marsh':'#6a2a2a', 'Reverend Bennet':'#1a1a22', 'Greta Holloway':'#4a3a32', 'Agnes Mott':'#5a6a4a', 'Old Ned':'#d9a03a', 'Silas Voss':'#2b2826', 'Victor Ashcombe':'#2a2e3e', 'Elias Vale':'#5a5650' };
const BEANIES = ['#a33a2e','#2f5a7a','#c9a046','#3a6a3a','#6a3a6e','#d8d0c0'];
const _winterCache = new WeakMap();
function winterOn(){ return typeof ATM!=='undefined' && ATM.snow>.35 && !(IN && SCN[IN] && !SCN[IN].outdoor); }
function winterize(c){
  if (_winterCache.has(c)) return _winterCache.get(c);
  const coat = WINTER_COATS[c.name] || shade(c.top||'#3a3f52', .8), k=(c.name||'x').length;
  const w = { ...c, top:coat, top2:shade(coat,.74), coat:true, scarf: c.scarf || ['#c94a2a','#e8c46a','#f2f2f2','#4a7ad8'][k%4], apron:undefined, shirt:undefined,
    hat: c.hat || { c:BEANIES[k%BEANIES.length], s:'beanie' } };
  _winterCache.set(c, w); return w;
}
function drawCharAt(g, sx, sy, dir, frame, c, holdLight){
  if (winterOn()) c=winterize(c);
  const kid = c.kid ? 3 : 0;
  const px=Math.round(sx-8), py=Math.round(sy-23+kid);
  if (dir==='left'){ g.save(); g.translate(px+16,py); g.scale(-1,1); drawChar(g,0,0,'right',frame,c,holdLight); g.restore(); }
  else drawChar(g,px,py,dir,frame,c,holdLight);
}

function drawPortrait(g, c){
  if (winterOn()) c=winterize(c);
  g.clearRect(0,0,24,24);
  const r=(x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x,y,w,h); };
  r(0,0,24,24, shade(c.top,.5)); r(0,0,24,8, shade(c.top,.62)); r(0,16,24,8, shade(c.top,.38));
  r(3,19,18,5,c.top); r(3,19,18,1,shade(c.top,1.2));
  if (c.shirt) r(10,19,4,5,c.shirt);
  if (c.scarf) r(6,18,12,3,c.scarf);
  if (c.apron) r(7,21,10,3,c.apron);
  if (c.pack){ r(5,19,2,5,'#6b4a2f'); r(17,19,2,5,'#6b4a2f'); }
  r(10,16,4,3,c.skin2);
  r(7,6,10,11,c.skin); r(7,15,10,2,c.skin2); r(6,10,1,3,c.skin2); r(17,10,1,3,c.skin2);
  const E='#1a1418';
  r(9,11,2,1,E); r(13,11,2,1,E); r(9,10,2,1,'#f4ece0'); r(13,10,2,1,'#f4ece0'); r(10,10,1,2,E); r(14,10,1,2,E);
  r(11,12,1,2,c.skin2); r(10,14,4,1,'#8a4a3a');
  const hh=c.hair; const eb = c.style==='bald' ? shade(c.hair,.8) : hh; r(9,9,2,1,eb); r(13,9,2,1,eb);
  if (c.style==='curly'){ r(6,3,12,4,hh); r(5,5,1,6,hh); r(18,5,1,6,hh); r(7,2,4,1,hh); r(12,2,4,1,hh); r(8,7,3,1,hh); r(12,7,2,1,hh); r(15,7,2,2,hh); r(6,7,1,3,hh); r(17,7,1,3,hh); r(9,3,2,1,'#2a2430'); r(14,4,2,1,'#2a2430'); }
  else if (c.style==='short'||c.style==='bun'){ r(7,4,10,3,hh); r(6,5,1,5,hh); r(17,5,1,5,hh); r(7,7,2,1,hh); if (c.style==='bun') r(9,1,6,3,hh); }
  else if (c.style==='long'){ r(6,3,12,4,hh); r(5,5,2,14,hh); r(17,5,2,14,hh); r(7,7,3,1,hh); r(14,7,3,1,hh); }
  else if (c.style==='bald'){ r(6,8,1,4,hh); r(17,8,1,4,hh); r(10,7,3,1,shade(c.skin,1.15)); }
  if (c.beard){ r(7,13,10,4,c.beard); r(8,17,8,1,c.beard); r(10,14,4,1,shade(c.beard,.7)); }
  if (c.mustache){ r(9,13,6,1,c.mustache); }
  if (c.stubble){ r(7,14,10,3,c.stubble); r(10,14,4,1,'#6a3a2a'); r(8,15,8,1,shade(c.stubble,1.2)); }
  if (c.glasses){ const f='#2a2a2a'; for (const gx of [8,12]){ r(gx,10,4,1,f); r(gx,12,4,1,f); r(gx,10,1,3,f); r(gx+3,10,1,3,f);} r(9,11,2,1,'#bfe0f0'); r(13,11,2,1,'#bfe0f0'); r(10,11,1,1,E); r(14,11,1,1,E); }
  if (c.hat){ const hc=c.hat.c, hc2=shade(hc,.7);
    if (c.hat.s==='beanie'){ r(6,1,12,7,hc); r(6,6,12,2,hc2); r(8,2,2,4,shade(hc,1.25)); r(10,-1,4,3,'#efe3c8'); }
    else if (c.hat.s==='cap'){ r(6,2,12,5,hc); r(6,7,13,1,hc2); r(10,3,4,2,'#e8c46a'); }
    else if (c.hat.s==='straw'){ r(7,1,10,5,hc); r(3,6,18,2,hc2); r(7,5,10,1,'#8a3b2e'); }
    else { r(8,1,8,5,hc); r(5,6,14,1,hc2); r(8,5,8,1,'#4a3a32'); } }
}
