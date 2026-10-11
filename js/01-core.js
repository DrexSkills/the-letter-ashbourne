// The Letter — Core constants, helpers, the Ashbourne world map, ground drawing, houses and trees.
'use strict';

const T = 16, W = 96, H = 96;
const OLD_H = 60;   // the original map was 60 rows tall; rows below are the southern lands
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const $ = s => document.querySelector(s);

// ================= utilities =================
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
// the south has its own random sequence, so Ashbourne's trees and ground look exactly as before
const _rngMain = mulberry32(2006), _rngSouth = mulberry32(7777);
let _rngCur = _rngMain;
const rng = () => _rngCur();
const useSouthRng = on => { _rngCur = on ? _rngSouth : _rngMain; };
const pick = a => a[Math.floor(rng()*a.length)];
const hash = (a,b,c) => { let h = a*374761393 + b*668265263 + c*2147483647; h = (h^(h>>>13))*1274126177; return (h^(h>>>16))>>>0; };
const mk = (w,h) => { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
const hex = s => { const n=parseInt(s.slice(1),16); return [n>>16,n>>8&255,n&255]; };
const shade = (h,f) => { const [r,g,b]=hex(h); return `rgb(${Math.min(255,r*f|0)},${Math.min(255,g*f|0)},${Math.min(255,b*f|0)})`; };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function disc(g,cx,cy,r,col){ g.fillStyle=col; for(let y=-r;y<=r;y++){ const w=Math.floor(Math.sqrt(r*r-y*y+r*.8)); g.fillRect(cx-w,cy+y,w*2+1,1);} }

// ================= world map =================
const GRASS=0, PATH=1, WATER=2, BRIDGE=3, FIELD=4, PLAZA=5, FPATH=6, RAIL=7;
const tiles = new Uint8Array(W*H), solid = new Uint8Array(W*H), reserved = new Uint8Array(W*H);
const at = (x,y) => (x<0||y<0||x>=W||y>=H) ? -1 : tiles[y*W+x];
const set = (x,y,v) => { if (x>=0&&y>=0&&x<W&&y<H) tiles[y*W+x]=v; };
const rect = (x0,y0,w,h,v) => { for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)set(x,y,v); };
const isForest = (tx,ty) => tx<36 && ty<27;
const reserve = (x,y,r=1) => { for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const xx=x+i,yy=y+j; if(xx>=0&&yy>=0&&xx<W&&yy<H) reserved[yy*W+xx]=1;} };

const riverX = y => 70 + Math.round(Math.sin(y*0.2)*2 + Math.sin(y*0.05)*2);
for (let y=0;y<H;y++){ const cx=riverX(y); for(let x=cx-1;x<=cx+2;x++) set(x,y,WATER); }
rect(0,30,82,2,PATH);
{ const a=Math.min(riverX(30),riverX(31))-1, b=Math.max(riverX(30),riverX(31))+2; rect(a,30,b-a+1,2,BRIDGE); }
rect(46,12,2,34,PATH);           // Main Street
rect(40,26,14,10,PLAZA);         // the square
rect(82,24,8,14,PLAZA);          // station platform
rect(90,0,3,H,RAIL);             // railway
rect(51,24,2,2,PATH); rect(40,24,2,2,PATH);
rect(40,41,7,2,PATH); rect(48,42,11,1,PATH); rect(57,41,2,1,PATH);
rect(59,27,2,3,PATH); rect(48,18,11,1,PATH); rect(41,17,5,1,PATH); rect(48,11,3,1,PATH);
rect(25,32,2,7,PATH); rect(21,38,6,1,PATH); rect(21,39,2,1,PATH);   // Hollow Farm lane
rect(12,41,17,12,FIELD);
rect(81,15,2,9,PATH); rect(81,15,5,1,PATH);   // track-side path to the engine shed
rect(79,9,10,5,PATH);                          // shed yard (boss arena)

// ---- the southern lands: Willow Lake, the Old Mill and the Abbey ruins ----
rect(46,OLD_H,2,72-OLD_H,PATH);                // south road (the part through old Ashbourne is carved later, see carveSouthRoad)
const SOUTH_ROAD = { x:46, y:46, w:2, h:OLD_H-46 };
rect(6,72,84,2,PATH);                          // the long southern road
{ const a=Math.min(riverX(72),riverX(73))-1, b=Math.max(riverX(72),riverX(73))+2; rect(a,72,b-a+1,2,BRIDGE); }
for (let y=74;y<=91;y++) for (let x=8;x<=40;x++){ const dx=(x-24)/13.5, dy=(y-83)/7.6; if (dx*dx+dy*dy<=1) set(x,y,WATER); }   // Willow Lake
for (let y=84;y<=86;y++) for (let x=29;x<=31;x++) set(x,y,GRASS);  // a little island
rect(23,74,2,6,BRIDGE);                        // fishing pier
rect(63,66,2,6,PATH);                          // lane to the Old Mill
rect(77,79,11,11,PLAZA); rect(81,74,2,5,PATH); // the abbey's old floor and its path

// forest trail
const trail = [[30,29],[30,22],[25,22],[25,17],[28,17],[28,12],[20,12],[20,9],[14,9],[14,15],[9,15],[9,10],[7,10],[7,8]];
for (let i=0;i<trail.length-1;i++){
  const [x0,y0]=trail[i],[x1,y1]=trail[i+1];
  for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++) for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++){
    for (const [dx,dy] of [[0,0],[1,0],[0,1],[1,1]]) if (at(x+dx,y+dy)===GRASS) set(x+dx,y+dy,FPATH);
  }
}
const clear = (cx,cy,r,v) => { for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++) if(x*x+y*y<=r*r+1 && at(cx+x,cy+y)===GRASS) set(cx+x,cy+y,v); };
clear(26,15,2,FPATH); clear(12,13,2,FPATH);
for (let y=1;y<27;y++) for (let x=1;x<36;x++) if (at(x,y)===FPATH) for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (rng()<.12 && at(x+dx,y+dy)===GRASS) set(x+dx,y+dy,FPATH);
for (let y=1;y<10;y++) for (let x=2;x<13;x++) reserved[y*W+x]=1;  // workshop clearing

// buildings
const houses = [
  { id:'church',   x:44, y:5,  w:5, h:7, church:true },
  { id:'cafe',     x:38, y:20, w:6, h:4, roof:'#a04a3a', wall:'#e0cba6', awning:true },
  { id:'books',    x:49, y:20, w:6, h:4, roof:'#4f4a72', wall:'#cdb48c', sign:true },
  { id:'records',  x:38, y:37, w:6, h:4, roof:'#3e4a5a', wall:'#b9a888', brick:true },
  { id:'forge', x:55, y:37, w:5, h:4, roof:'#3a3a40', wall:'#8d8577', brick:true, forge:true },
  { id:'post', x:57, y:23, w:5, h:4, roof:'#7a2e2e', wall:'#d8c3a0', post:true },
  { x:56, y:14, w:5, h:4, roof:'#3e5a4a', wall:'#d8c3a0' },
  { x:36, y:13, w:5, h:4, roof:'#7a5a3a', wall:'#d2bd98' },
  { id:'farm',     x:19, y:34, w:6, h:4, roof:'#7a3a2a', wall:'#c4a782', barn:true },
  { id:'station',  x:83, y:19, w:7, h:5, roof:'#2f5d63', wall:'#a8644a', brick:true, station:true },
  { id:'workshop', x:4,  y:3,  w:7, h:5, workshop:true },
  { id:'mill', x:61, y:61, w:6, h:5, roof:'#5a4a3a', wall:'#c9b28a', mill:true },
  { id:'shed', x:80, y:4, w:8, h:5, shed:true, roof:'#2a2624', wall:'#5a4038' },
];
for (const h of houses){ for (let y=h.y;y<h.y+h.h;y++) for (let x=h.x;x<h.x+h.w;x++){ solid[y*W+x]=1; if(at(x,y)!==PATH) set(x,y,GRASS);} reserveRect(h.x-1,h.y-1,h.w+2,h.h+3); }
function reserveRect(x0,y0,w,h){ for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++) if(x>=0&&y>=0&&x<W&&y<H) reserved[y*W+x]=1; }
for (let i=0;i<W*H;i++) if (tiles[i]===WATER || tiles[i]===RAIL) solid[i]=1;

// fences around the field
const fences = [];
for (let x=11;x<=29;x++){ if (x!==21 && x!==22) fences.push({x,y:40,h:true}); fences.push({x,y:53,h:true}); }
for (let y=41;y<=52;y++){ fences.push({x:11,y,h:false}); fences.push({x:29,y,h:false}); }
// fence around the engine shed yard (gate at 83-84 south, culvert grate at 78,9 west)
for (let x=78;x<=89;x++){ fences.push({x,y:3,h:true}); if (x!==83 && x!==84) fences.push({x,y:14,h:true}); }
for (let y=4;y<=13;y++){ if (y!==9) fences.push({x:78,y,h:false}); fences.push({x:89,y,h:false}); }
reserveRect(75,2,16,15);
for (const f of fences){ solid[f.y*W+f.x]=1; reserved[f.y*W+f.x]=1; }

// props
const lamps = [[40,26],[53,26],[40,35],[53,35],[45,15],[48,43],[82,25],[82,36],[64,32],[80,16]];
for (const [x,y] of lamps){ solid[y*W+x]=1; reserve(x,y); }
const graves = [];
for (const gx of [52,54,56,58]) for (const gy of [6,8,10]) { graves.push({x:gx,y:gy,mara:gx===56&&gy===8}); solid[gy*W+gx]=1; }
reserveRect(51,5,9,7);
const props = [
  { kind:'bench', x:84, y:34 }, { kind:'bench', x:87, y:34 },
  { kind:'sign',  x:64, y:29 },
  { kind:'scarecrow', x:16, y:46 },
  { kind:'well', x:46, y:32 },
  { kind:'gate', x:83, y:14 }, { kind:'gate', x:84, y:14 }, { kind:'grate', x:78, y:9 }, { kind:'postbox', x:62, y:27 }, { kind:'anvil', x:61, y:41 },
];
// the abbey ruins: broken walls, columns, an altar and an old chest
for (let x=76;x<=88;x++) for (const y of [78,90]){ if (y===78 && (x===81||x===82)) continue; if ((hash(x,y,3)%5)===0) continue; props.push({ kind:'ruin', x, y, v:hash(x,y,1)%3 }); }
for (let y=79;y<=89;y++) for (const x of [76,88]){ if (y===84||y===85) continue; if ((hash(x,y,4)%4)===0) continue; props.push({ kind:'ruin', x, y, v:hash(x,y,2)%3 }); }
for (const [x,y] of [[79,82],[85,82],[79,86],[85,86]]) props.push({ kind:'ruincol', x, y });
props.push({ kind:'altar', x:82, y:81 }, { kind:'chest', x:86, y:88 }, { kind:'wheel', x:68, y:63 }, { kind:'bench', x:20, y:73 });
reserveRect(75,77,15,15); reserveRect(60,60,10,12); reserveRect(21,73,6,8);
for (const p of props){ solid[p.y*W+p.x]=1; reserve(p.x,p.y); }

// trees (generated after NPCs and objects reserve their tiles)
const trees = [];
const treeAt = new Uint8Array(W*H);
function addTree(x,y,pine,force){ treeAt[y*W+x]=1; solid[y*W+x]=1; trees.push({ x:x*T+8+Math.floor(rng()*5-2), y:y*T+13, pine, v:Math.floor(rng()*3), mark: force==='mark' }); }
function genTrees(){
addTree(22, 11, false, 'mark');
addTree(31,44,false);
useSouthRng(true); addTree(30,85,false); useSouthRng(false);   // the island's willow
function nearNon(x,y,r){ for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){ const t=at(x+i,y+j); if(t!==GRASS || (t!==-1 && solid[(y+j)*W+x+i] && !treeAt[(y+j)*W+x+i])) return true; } return false; }
for (let y=0;y<H;y++) for (let x=0;x<W;x++){
  if (x===0 && y===OLD_H) useSouthRng(true);
  const i=y*W+x;
  if (at(x,y)!==GRASS || treeAt[i] || reserved[i] || solid[i]) continue;
  const forest = isForest(x,y);
  if (forest){ if (rng()<.9) addTree(x,y, rng()<.7); continue; }
  if (nearNon(x,y,1)) continue;
  const border = x<3||y<2||x>W-4||y>H-4 || (y>OLD_H-4 && y<OLD_H) || (x>=36 && y<4);
  const p = border ? .6 : (x<11 && y>27) ? .2 : .03;
  if (rng()<p){
    let crowded=false; if (!border) for(let j=-2;j<=2;j++)for(let k=-2;k<=2;k++) if(treeAt[(y+j)*W+(x+k)]) crowded=true;
    if (!crowded) addTree(x,y, rng()<.25);
  }
}
useSouthRng(false);
carveSouthRoad();
}
// The road south is cut through the old treeline after everything else is generated,
// so the rest of Ashbourne keeps exactly the same trees and ground as before.
function carveSouthRoad(){
  const R=SOUTH_ROAD, onRoad=(tx,ty)=> tx>=R.x-1 && tx<R.x+R.w+1 && ty>=R.y && ty<R.y+R.h;
  for (let y=R.y;y<R.y+R.h;y++) for (let x=R.x;x<R.x+R.w;x++) set(x,y,PATH);
  for (let i=trees.length-1;i>=0;i--){ const tx=Math.floor(trees[i].x/T), ty=Math.floor((trees[i].y-13)/T); if (onRoad(tx,ty)){ treeAt[ty*W+tx]=0; solid[ty*W+tx]=0; trees.splice(i,1); } }
  const g=ground.getContext('2d'), sr=_rngSouth, cols=['#b08a5a','#a8814f','#b9946a','#a17a4c'], grass=['#4f7a3a','#56833f','#4b7437','#5a8842','#527d3c'];
  for (let ty=R.y;ty<R.y+R.h;ty++) for (let tx=R.x;tx<R.x+R.w;tx++) for (let y=0;y<T;y++) for (let x=0;x<T;x++){
    const edge=(x<2 && at(tx-1,ty)===GRASS)||(x>13 && at(tx+1,ty)===GRASS);
    g.fillStyle = edge && sr()<.55 ? grass[Math.floor(sr()*grass.length)] : cols[Math.floor(sr()*cols.length)];
    g.fillRect(tx*T+x, ty*T+y, 1, 1);
  }
}

// ================= ground prerender =================
const ground = mk(W*T, H*T);
(function paintGround(){
  const g = ground.getContext('2d');
  const img = g.createImageData(W*T, H*T), d = img.data;
  const pal = {
    grass: ['#4f7a3a','#56833f','#4b7437','#5a8842','#527d3c'].map(hex),
    fgrass: ['#2f4f2a','#34572d','#2b4827','#385c30'].map(hex),
    path: ['#b08a5a','#a8814f','#b9946a','#a17a4c'].map(hex),
    fpath: ['#6e5236','#765a3c','#634a31','#5d6b34'].map(hex),
    plaza: ['#8d8577','#968e80','#847c6f'].map(hex), mortar: hex('#6f685d'),
    w1: hex('#3c6e91'), w2: hex('#386689'), foam: hex('#7fb2c9'), foam2: hex('#5d8fae'),
    plank: hex('#8a6240'), plank2: hex('#93694a'), plankL: hex('#5e4129'),
    soil: hex('#6b4a30'), soil2: hex('#5e4029'), crop: hex('#7e9a3a'), crop2: hex('#6b8a32'),
    gravel: ['#6f6a66','#7b7671','#5f5a57'].map(hex), steel: hex('#a7aab4'), sleeper: hex('#4a3426'),
  };
  const put = (x,y,c) => { const o=(y*W*T+x)*4; d[o]=c[0]; d[o+1]=c[1]; d[o+2]=c[2]; d[o+3]=255; };
  for (let ty=0;ty<H;ty++) for (let tx=0;tx<W;tx++){
    if (tx===0 && ty===OLD_H) useSouthRng(true);
    const t=at(tx,ty), ox=tx*T, oy=ty*T, fr=isForest(tx,ty);
    for (let y=0;y<T;y++) for (let x=0;x<T;x++){
      let c;
      if (t===GRASS) c = pick(fr?pal.fgrass:pal.grass);
      else if (t===PATH || t===FPATH){
        c = pick(t===PATH?pal.path:pal.fpath);
        const nb = (dx,dy) => { const n=at(tx+dx,ty+dy); return n===GRASS; };
        const edge = (x<2&&nb(-1,0))||(x>13&&nb(1,0))||(y<2&&nb(0,-1))||(y>13&&nb(0,1));
        if (edge && rng()<.55) c = pick(fr?pal.fgrass:pal.grass);
      }
      else if (t===WATER){ c = rng()<.5?pal.w1:pal.w2; const sh=(x<2&&at(tx-1,ty)!==WATER)||(x>13&&at(tx+1,ty)!==WATER); if (sh) c = rng()<.6?pal.foam:pal.foam2; }
      else if (t===BRIDGE) c = (x%4===0)?pal.plankL:(rng()<.5?pal.plank:pal.plank2);
      else if (t===FIELD) c = (y%4<2)?(rng()<.7?pal.soil:pal.soil2):(rng()<.55?pal.crop:pal.crop2);
      else if (t===PLAZA) c = ((x%8===0)||(y%6===0)||(((x+(Math.floor((oy+y)/6)%2)*4)%8===0)&&y%6===3)) ? pal.mortar : pick(pal.plaza);
      else if (t===RAIL){ const lx=(tx-90)*T+x; c = pick(pal.gravel); if ((oy+y)%8<2 && lx>3 && lx<44) c = pal.sleeper; if (lx===10||lx===11||lx===36||lx===37) c = pal.steel; }
      put(ox+x,oy+y,c);
    }
  }
  useSouthRng(false);
  g.putImageData(img,0,0);
  for (let ty=0;ty<H;ty++) for (let tx=0;tx<W;tx++){
    if (tx===0 && ty===OLD_H) useSouthRng(true);
    const t=at(tx,ty), ox=tx*T, oy=ty*T, fr=isForest(tx,ty);
    if (t===GRASS){
      for (let k=0;k<3;k++) if (rng()<.5){ const x=ox+1+Math.floor(rng()*13), y=oy+2+Math.floor(rng()*12); g.fillStyle=fr?'#24402a':'#3f6630'; g.fillRect(x,y,1,2); g.fillRect(x+2,y,1,2); g.fillStyle=fr?'#3e6a3a':'#6e9c4f'; g.fillRect(x+1,y-1,1,3); }
      if (!fr && rng()<.09){ const fc=pick(['#f2d36b','#e98ca0','#f5f0e6','#b9a2e8','#f29a5b']);
        for (let k=0;k<2+Math.floor(rng()*3);k++){ const x=ox+2+Math.floor(rng()*12), y=oy+2+Math.floor(rng()*12); g.fillStyle='#3c6a2e'; g.fillRect(x,y+1,1,2); g.fillStyle=fc; g.fillRect(x-1,y,3,1); g.fillRect(x,y-1,1,3); g.fillStyle='#fff3c4'; g.fillRect(x,y,1,1);} }
      if (fr && rng()<.05){ const x=ox+3+Math.floor(rng()*9), y=oy+4+Math.floor(rng()*8); g.fillStyle='#e6dccb'; g.fillRect(x,y+2,1,2); g.fillStyle=pick(['#c0473a','#d9a75a']); g.fillRect(x-1,y,3,2); g.fillStyle='#fff'; g.fillRect(x,y,1,1); }
    }
    if (t===FPATH && rng()<.25){ g.fillStyle='#4a3a26'; g.fillRect(ox+Math.floor(rng()*12)+2, oy+Math.floor(rng()*12)+2, 3, 1); }
    if (t===PATH && rng()<.4){ g.fillStyle='#8e6c45'; g.fillRect(ox+Math.floor(rng()*14)+1, oy+Math.floor(rng()*14)+1, 2, 1); }
    if (t===BRIDGE){
      if (at(tx,ty-1)!==BRIDGE){ g.fillStyle='#4a321f'; g.fillRect(ox,oy,T,2); g.fillStyle='#a77d55'; g.fillRect(ox,oy+2,T,1); }
      if (at(tx,ty+1)!==BRIDGE){ g.fillStyle='#4a321f'; g.fillRect(ox,oy+T-2,T,2); }
    }
  }
  useSouthRng(false);
  g.fillStyle='rgba(20,15,40,.28)';
  for (const h of houses) g.fillRect(h.x*T+3,(h.y+h.h)*T,h.w*T,4);
  // platform edge
  g.fillStyle='#d9c25a'; g.fillRect(89*T+12,24*T,2,14*T);
})();

// ================= sprites =================
function makeRoundTree(v){
  const c=mk(28,34), g=c.getContext('2d');
  g.fillStyle='rgba(20,15,40,.3)'; g.fillRect(6,31,16,3);
  g.fillStyle='#4a321f'; g.fillRect(12,20,5,13); g.fillStyle='#6b4a2f'; g.fillRect(13,20,2,12);
  const dk=['#2d5228','#2f5a2a','#294d2a'][v], md=['#3f7434','#467c36','#3b6e35'][v], lt=['#5e9443','#6aa04a','#58904a'][v];
  disc(g,14,13,12,dk); disc(g,13,11,10,md); disc(g,10,8,5,lt); disc(g,18,10,3,lt);
  g.globalAlpha=.25; disc(g,8,7,3,'#f0b46a'); g.globalAlpha=1;
  for(let i=0;i<14;i++){ g.fillStyle=rng()<.5?dk:lt; g.fillRect(4+Math.floor(rng()*20),3+Math.floor(rng()*18),1,1); }
  return c;
}
function makePine(v){
  const c=mk(24,40), g=c.getContext('2d');
  g.fillStyle='rgba(20,15,40,.3)'; g.fillRect(5,37,14,3);
  g.fillStyle='#4a321f'; g.fillRect(10,30,4,9);
  const d=['#1f4029','#22462e','#1c3b27'][v], m=['#2c5a38','#30603d','#285336'][v], l=['#417a4a','#4a8452','#3c7046'][v];
  [[2,10],[10,18],[18,30]].forEach(([y0,y1],i)=>{ for(let y=y0;y<y1;y++){ const w=Math.floor((y-y0+2)*(0.9+i*.08)); g.fillStyle=d; g.fillRect(12-w,y,w*2,1); g.fillStyle=m; g.fillRect(12-w+1,y,w,1); if(y%3===0){g.fillStyle=l; g.fillRect(12-Math.floor(w/2),y,2,1);} } });
  g.globalAlpha=.2; g.fillStyle='#f0b46a'; g.fillRect(9,2,3,10); g.globalAlpha=1;
  return c;
}
const roundTrees=[0,1,2].map(makeRoundTree), pines=[0,1,2].map(makePine);

function makeShed(h){
  const extra=12, w=h.w*T, ht=h.h*T+extra, c=mk(w,ht), g=c.getContext('2d');
  const R=(x,y,ww,hh,col)=>{ g.fillStyle=col; g.fillRect(x,y,ww,hh); };
  // blackened brick walls
  R(0,18,w,ht-18,'#5a4038');
  for (let y=18;y<ht;y+=4){ R(0,y,w,1,'#3e2a24'); for (let x=((y/4)%2)*4;x<w;x+=8) R(x,y,1,4,'#3e2a24'); }
  for (let i=0;i<70;i++){ R(Math.floor(rng()*w), 18+Math.floor(rng()*(ht-20)), 2+Math.floor(rng()*4), 1, rng()<.5?'#2a1c18':'#1e1412'); }
  // collapsed roof: charred trusses with open sky gaps
  R(0,4,w,16,'#2a2624');
  for (let x=2;x<w;x+=10){ R(x,0,3,20,'#1a1614'); R(x+1,0,1,20,'#3a302a'); }
  for (let x=6;x<w-6;x+=18){ R(x,6,8,10,'#0f1218'); R(x+1,7,6,8,'#16202c'); }
  R(0,18,w,2,'#1a1614');
  // big arched engine doorway
  const dx=Math.floor(w/2-12); R(dx,ht-30,24,30,'#120d0b'); R(dx-2,ht-32,28,3,'#3e2a24'); R(dx,ht-30,24,2,'#2a1c18');
  R(dx+3,ht-6,18,6,'#1e1614'); R(dx+5,ht-4,14,1,'#6f6a66'); R(dx+5,ht-2,14,1,'#6f6a66');
  // faded sign
  R(6,22,30,7,'#2a2420'); for (let i=0;i<8;i++) R(8+i*3,24,2,3,'#8a7a5a');
  // weeds
  for (let i=0;i<30;i++){ R(Math.floor(rng()*w), ht-2-Math.floor(rng()*6), 1, 2+Math.floor(rng()*3), rng()<.5?'#3f6630':'#2a4a2a'); }
  h.glows=[]; h.spr=c; h.extra=extra; h.door={x:w/2,y:ht};
}
function makeHouse(h){
  if (h.shed) return makeShed(h);
  const extra = h.church ? 30 : 10;
  const w=h.w*T, ht=h.h*T+extra, c=mk(w,ht), g=c.getContext('2d');
  const roofCol = h.workshop ? '#3b3530' : h.church ? '#4a4e66' : h.roof;
  const wallCol = h.workshop ? '#6a5d50' : h.church ? '#a39b8d' : h.wall;
  const bodyTop = h.church ? extra : 0;
  const roofH = Math.floor((ht-bodyTop)*0.52);
  g.fillStyle=wallCol; g.fillRect(1,bodyTop+roofH-2,w-2,ht-bodyTop-roofH+2);
  if (h.church||h.brick||h.workshop){ g.fillStyle=shade(wallCol,.82); for(let y=bodyTop+roofH;y<ht;y+=4){ g.fillRect(1,y,w-2,1); for(let x=((y/4)%2)*4+1;x<w;x+=8) g.fillRect(x,y,1,4);} }
  else { g.fillStyle=shade(wallCol,.72); for(let x=1;x<w;x+=Math.floor(w/h.w)) g.fillRect(x,bodyTop+roofH,2,ht-bodyTop-roofH); g.fillRect(1,bodyTop+roofH+1,w-2,1); }
  g.fillStyle=shade(wallCol,.55); g.fillRect(1,ht-3,w-2,3);
  for (let y=0;y<roofH;y++){ g.fillStyle=(y%4===3)?shade(roofCol,.7):(y<3?shade(roofCol,1.2):roofCol); g.fillRect(0,bodyTop+y,w,1); }
  for (let y=3;y<roofH;y+=4) for (let x=(y%8===3?0:4);x<w;x+=8){ g.fillStyle=shade(roofCol,.78); g.fillRect(x,bodyTop+y-3,1,3); }
  g.fillStyle=shade(roofCol,.45); g.fillRect(0,bodyTop+roofH-2,w,2);
  g.fillStyle=shade(roofCol,1.35); g.fillRect(0,bodyTop,w,1);
  if (!h.church){ const cx=Math.floor(w*.72); g.fillStyle='#6e5246'; g.fillRect(cx,bodyTop-6,6,12); g.fillStyle='#4f3a31'; g.fillRect(cx-1,bodyTop-7,8,2); h.chimney={x:cx+3,y:bodyTop-8}; }
  const dw=8, dh=12, dx=Math.floor(w/2-dw/2), dy=ht-dh-2;
  h.door = {x:dx+dw/2, y:ht};
  g.fillStyle='#3a2416'; g.fillRect(dx-1,dy-1,dw+2,dh+1);
  g.fillStyle=h.workshop?'#3a2a20':'#5a3a24'; g.fillRect(dx,dy,dw,dh);
  g.fillStyle='#704a2e'; g.fillRect(dx+1,dy+1,2,dh-2); g.fillStyle='#e8c46a'; g.fillRect(dx+dw-2,dy+6,1,1);
  const wy=bodyTop+roofH+4; const pos=[6,w-14]; if (h.w>=6) pos.push(dx-12,dx+dw+4);
  const seen=new Set(); h.glows=[];
  for (const wx of pos){ if (seen.has(wx)||wx<3||wx+8>w-2) continue; if (wx<dx+dw+2 && wx+8>dx-2) continue; seen.add(wx);
    g.fillStyle='#3a2a1a'; g.fillRect(wx-1,wy-1,10,10);
    const lit = h.workshop ? '#d9a050' : '#f6c56a';
    g.fillStyle=lit; g.fillRect(wx,wy,8,8); g.fillStyle=h.workshop?'#e8b86a':'#ffe2a0'; g.fillRect(wx+1,wy+1,3,3);
    g.fillStyle='#3a2a1a'; g.fillRect(wx+3,wy,2,8); g.fillRect(wx,wy+3,8,2);
    if (h.workshop){ g.fillStyle='#6b4a2f'; g.fillRect(wx-1,wy+5,10,2); }
    h.glows.push([wx+4,wy+4]);
  }
  if (h.sign){ g.fillStyle='#2b2f4a'; g.fillRect(dx-8,dy-10,dw+16,7); g.fillStyle='#f2c27a'; for(let i=0;i<7;i++) g.fillRect(dx-5+i*3,dy-8,2,3); }
  if (h.forge){ g.fillStyle='#2a2420'; g.fillRect(dx-8,dy-10,dw+16,7); g.fillStyle='#b8c2d0'; g.fillRect(dx-4,dy-8,8,2); g.fillRect(dx-1,dy-6,2,2); g.fillRect(dx-3,dy-5,6,1); g.fillStyle='#ff9a4a'; g.fillRect(dx+6,dy-8,4,3); }
  if (h.post){ g.fillStyle='#7a2e2e'; g.fillRect(dx-8,dy-10,dw+16,7); g.fillStyle='#f2c27a'; g.fillRect(dx-5,dy-8,4,3); for(let i=0;i<4;i++) g.fillRect(dx+1+i*3,dy-8,2,3); g.fillStyle='#efe3c8'; g.fillRect(dx-5,dy-8,4,1); }
  if (h.awning){ for(let x=dx-12;x<dx+dw+12;x++){ g.fillStyle=(Math.floor(x/4)%2)?'#e8e0cc':'#a04a3a'; g.fillRect(x,dy-6,1,4);} g.fillStyle='#6b2e24'; g.fillRect(dx-12,dy-2,dw+24,1); }
  if (h.station){ g.fillStyle='#1d2a2e'; g.fillRect(dx-16,dy-12,dw+32,8); g.fillStyle='#efe3c8'; for(let i=0;i<10;i++) if(i!==4&&i!==5) g.fillRect(dx-12+i*4,dy-10,2,4); g.fillStyle='#efe3c8'; g.fillRect(w/2-4,bodyTop+3,8,8); g.fillStyle='#1d2a2e'; g.fillRect(w/2,bodyTop+4,1,4); g.fillRect(w/2,bodyTop+7,3,1); }
  if (h.barn){ g.fillStyle='#7a3a2a'; g.fillRect(dx-3,dy-1,dw+6,dh+1); g.fillStyle='#e3d3b0'; g.fillRect(dx-3,dy-1,dw+6,1); g.fillRect(dx-3,dy-1,1,dh+1); g.fillRect(dx+dw+2,dy-1,1,dh+1); for(let i=0;i<dh;i++){ g.fillRect(dx-2+Math.floor(i*(dw+4)/dh),dy+i,1,1); g.fillRect(dx+dw+1-Math.floor(i*(dw+4)/dh),dy+i,1,1);} }
  if (h.workshop){ g.fillStyle='#2a4a2a'; for(let i=0;i<40;i++) g.fillRect(Math.floor(rng()*w), ht-3-Math.floor(rng()*12), 1, 2+Math.floor(rng()*3)); g.fillStyle='#d9a050'; g.fillRect(dx+2,ht-3,4,1); }
  if (h.church){
    const sx=Math.floor(w/2)-7; g.fillStyle='#9b9385'; g.fillRect(sx,8,14,extra+4);
    g.fillStyle='#857e72'; for(let y=10;y<extra+8;y+=4) g.fillRect(sx,y,14,1);
    for(let y=0;y<10;y++){ const ww=Math.floor(y*.8)+1; g.fillStyle='#3d4158'; g.fillRect(sx+7-ww,y+1,ww*2,1); }
    g.fillStyle='#e8c46a'; g.fillRect(sx+6,0,2,5); g.fillRect(sx+5,1,4,1);
    g.fillStyle='#f6c56a'; g.fillRect(sx+5,14,4,6); g.fillStyle='#3a2a1a'; g.fillRect(sx+6,14,2,6);
    h.glows.push([sx+7,17]);
  }
  h.spr=c; h.extra=extra;
}
houses.forEach(makeHouse);
const H_ = id => houses.find(h=>h.id===id);
