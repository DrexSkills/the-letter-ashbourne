// The Letter — Building interiors and Chapter Four (Harlow Cross).
'use strict';

// ================= scenes: building interiors & Harlow Cross =================
// A scene is a small map of its own (a room, or the town of Harlow Cross).
// While IN is set, movement, collisions, combat and drawing all use the scene instead of Ashbourne.
let IN = null;
const mapW = () => IN ? SCN[IN].w*T : W*T;
const mapH = () => IN ? SCN[IN].h*T : H*T;
const vis = n => (!n.when || n.when()) && !n.inside;

const SCN = {
  books: { name:'Hale’s Books', floor:'wood', wall:'#4f4a72', out:[52,24], residents:{ hale:[8,4] }, public:true, map:[
    "##W###M##W##",
    "|SSSS.SSSSS|",
    "|..........|",
    "|.rrr..CCC.|",
    "|.rrr......|",
    "|A.T......P|",
    "|..........|",
    "_____D______" ],
    objs:[ {x:2,y:1,label:'Browse the shelves', act: () => browseBooks()},
           {x:7,y:3,label:'Look behind the counter', act: () => actHalePhoto()},
           {x:1,y:5,label:'Sit in the armchair', act: () => dialog([{s:'noah', t:'(The leather is worn into the shape of one particular person. Hale has sat here a long time, waiting for something.)'}])} ] },
  cafe: { name:'June’s Café', floor:'wood', wall:'#a04a3a', out:[41,24], residents:{ june:[6,2] }, public:true, map:[
    "##W##K###W##",
    "|F.CCCCC..P|",
    "|A.........|",
    "|..T.c..T.c|",
    "|..........|",
    "|.cT....cT.|",
    "|B........B|",
    "_____D______" ],
    objs:[ {x:1,y:2,label:'Armchair by the stove', act: () => actCafeChair()},
           {x:4,y:1,label:'Pies under glass', act: () => dialog([{s:'narr', t:'Meat pies, apple pies, and one very suspicious-looking eel pie. A card says: “5 ✦ each. Ask June.”'}])},
           {x:2,y:3,label:'Biscuit', when: () => F().catHome, act: () => dialog([{s:'narr', t: LOOK()===2 ? 'Biscuit is curled up by the stove, fast asleep. One ear twitches when you say her name.' : 'Biscuit opens one eye, purrs like a little engine, and goes straight back to sleep by the warm stove.'}]) },
           {x:5,y:0,label:'The café clock', act: () => dialog([{s:'narr', t:'The clock runs five minutes fast. A note underneath: “So nobody is ever late for tea. — J.”'}])} ] },
  post: { name:'Ashbourne Post Office', floor:'tile', wall:'#7a2e2e', out:[59,27], residents:{ rosa:[5,2] }, public:true, map:[
    "#W##ZZZ##W#",
    "|ZZZ...ZZZ|",
    "|.........|",
    "|.CCCCCCC.|",
    "|.........|",
    "|B.......Y|",
    "____D______" ],
    objs:[ {x:2,y:1,label:'Dead letter shelf', act: () => actReturned()},
           {x:1,y:5,label:'Mail sacks', act: () => dialog([{s:'narr', t:'Sacks of parcels waiting for the morning train. One is labelled, hopefully, “NOT EELS”.'}])} ] },
  forge: { name:'Holloway Forge', floor:'stone', wall:'#5a4a42', out:[57,41], residents:{ greta:[5,3] }, public:true, map:[
    "##OO###QQ##",
    "|.OO....QQ|",
    "|.........|",
    "|...V.....|",
    "|.........|",
    "|B.....w..|",
    "____D______" ],
    objs:[ {x:8,y:1,label:'Greta’s weapon rack', act: () => talkGreta()},
           {x:2,y:1,label:'The furnace', act: () => dialog([{s:'narr', t:'Heat rolls off the furnace like a wall. Somewhere inside, a new blade is turning orange.'}])},
           {x:4,y:3,label:'The anvil', act: () => dialog([{s:'narr', t:'Scarred by a thousand hammer blows. Someone has scratched a tiny heart into one corner.'}])} ] },
  church: { name:'St. Aldric’s Church', floor:'stone', wall:'#857e72', out:[46,12], residents:{ bennet:[6,2] }, public:true, map:[
    "###W#####W###",
    "|...NLLLN...|",
    "|...........|",
    "|.XXXX.XXXX.|",
    "|...........|",
    "|.XXXX.XXXX.|",
    "|...........|",
    "|.XXXX.XXXX.|",
    "|Y.........P|",
    "______D______" ],
    objs:[ {x:4,y:1,label:'Light a candle', act: () => actCandle()}, {x:8,y:1,label:'Light a candle', act: () => actCandle()},
           {x:1,y:8,label:'The memorial book', act: () => dialog([{s:'narr', t:'A book of names, one per page. Near the back: “Mara Voss, 1974–2006. She kept the books, and the books kept her.”'}])} ] },
  workshop: { name:'Dad’s workshop', floor:'wood', wall:'#6a5d50', out:[7,9], map:[
    "##W###M##W##",
    "|wwww...Y..|",
    "|..........|",
    "|.T....B..B|",
    "|..........|",
    "|Q.....wwww|",
    "|P.........|",
    "_____D______" ],
    objs:[ {x:2,y:1,label:'Dad’s workbench', act: () => F().end ? dialog([{s:'noah', t:'(The workbench, the letter, the dust. He worked here for twenty years, alone.)'}]) : runEnding()},
           {x:6,y:0,label:'Map on the wall', act: () => dialog([{s:'narr', t:'A hand-drawn map of Ashbourne. The old branch line is circled in pencil, again and again.'}])},
           {x:8,y:1,label:'Cabinet', act: () => dialog([{s:'narr', t:'Lantern oil, spare wicks, a child’s drawing of a train. It’s signed, badly: NOAH, AGE 5.'}])} ] },
  shed: { name:'Inside the engine shed', floor:'charred', wall:'#3a2a24', out:[83,10], map:[
    "##############",
    "|uu....u...uu|",
    "|............|",
    "|....JJJJ....|",
    "|....JJJJ....|",
    "|u...........|",
    "|..B.......u.|",
    "______D_______" ],
    objs:[ {x:6,y:4,label:'The inspection pit', act: () => actPit()} ] },
  records: { name:'The Records Office', floor:'wood', wall:'#3e4a5a', out:[41,41], residents:{ clara:[5,3] }, map:[
    "#W##YYY##W#",
    "|YYY...YYY|",
    "|.........|",
    "|..EEE....|",
    "|.........|",
    "|Y...T...P|",
    "____D______" ],
    objs:[ {x:2,y:1,label:'Archive boxes', act: () => dialog([{s:'narr', t:'Cardboard boxes labelled by year, all the way back to 1952. The box for 2006 is much thinner than the others.'}])} ] },
  farm: { name:'Tom’s farmhouse', floor:'wood', wall:'#7a5a3a', out:[22,38], residents:{ tom:[6,3] }, map:[
    "##W##K##W##",
    "|F.......B|",
    "|A..T.....|",
    "|...c.....|",
    "|.........|",
    "|B......PB|",
    "____D______" ],
    objs:[ {x:5,y:0,label:'A photo on the wall', act: () => dialog([{s:'narr', t:'Two young men grinning beside a half-built fence, covered in mud. Written on the frame: “E. and T. — Lantern, 1998.”'}])},
           {x:1,y:1,label:'The stove', act: () => dialog([{s:'narr', t:'A pot of stew bubbles on the stove. It smells better than anything you’ve eaten in days.'}])} ] },
  mill: { name:'Inside the Old Mill', floor:'wood', wall:'#6a5a4a', out:[63,66], residents:{ agnes:[4,3] }, map:[
    "##W##W##W##",
    "|BB...mm..|",
    "|.....mm..|",
    "|.........|",
    "|.T.c.....|",
    "|B.......F|",
    "____D______" ],
    objs:[ {x:6,y:2,label:'The millstones', act: () => dialog([{s:'narr', t:'Two great stones grind slowly, turned by the wheel outside. Flour dust hangs gold in the lamplight.'}])} ] },
  hut: { name:'Ned’s fishing hut', floor:'wood', wall:'#5a6a7a', out:[13,72], residents:{ ned:[4,2] }, map:[
    "#W##K##W#",
    "|B..T..P|",
    "|.......|",
    "|A.....B|",
    "___D_____" ],
    objs:[ {x:3,y:1,label:'Fishing rods', act: () => dialog([{s:'narr', t:'A dozen rods, each with a name painted on the handle. The newest one just says “LUCKY”.'}])} ] },
  station: { name:'The ticket office', floor:'tile', wall:'#2f5d63', out:[86,24], residents:{ walt:[3,2] }, map:[
    "##W##K##W##",
    "|E.EE...YY|",
    "|.........|",
    "|c..c..c..|",
    "|.........|",
    "|B.....P..|",
    "____D______" ],
    objs:[ {x:9,y:1,label:'The timetable', act: () => dialog([{s:'narr', t:'Timetable: one train in, one train out. The last one leaves at nine. Someone has written in pencil underneath: “Keep left.”'}])} ] },
  harlow: { name:'Harlow Cross', outdoor:true, ch4:true, spawns:true, safe:[[0,0,8,24]], floor:'cobble', map:[
    "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    "==p%%%%%%%%%%%%%%,,%%%%%%%%%%%%%%%%%%%%%",
    "==p%%%%%%%%%%%%%%,,%%%%%%%%%%%%%%%%%%%%%",
    "==pp%%%%%%%%%%%%%,,%%%%%%%%%%%%%%%%%%%%%",
    "==ppp%%%%%%%%%%%%,,%%%%%%%%%%%%%%%%%%%%%",
    "==ppp%%%%%%%%%%%%,,%%%%%%%%%%%%%%%%%%%%%",
    "==ppp%%%%%%%%%%%%,,%%%%%%%%%%%%%%1%%%%%%",
    "==ppp,,l,,,,,l,,,,,,,,,l,,,,,,,,,,,,,l,,",
    "==ppp,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "==pppb,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "==ppp,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
    "==pppb,,l,,,,,l,,,,,,,,,l,,,,,,,,,,,,l,,",
    "==ppp\"\"\"\"\"\"t\"\"\"\"\"\"\"\"b\"\"\"\"\"\"t\"\"\"\"\"\"\"b\"\"\"",
    "==ppp\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"",
    "==ppp~~~~~~~~~~~~~~~~~+++~~~~~~~~~~~~~~~",
    "==ppp~~~~~~~~~~~~~~~~~+++~~~~~~~~~~~~~~~",
    "==ppp~~~~~~~~~~~~~~~~~+++~~~~~~~~~~~~~~~",
    "==ppp\"\"\"\"t\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"t\"\"\"\"\"\"\"\"\"",
    "==ppp\"\"\"\"\"\"\"\"t\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"t\"\"\"\"\"",
    "==ppp%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    "==ppp%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%" ],
    objs:[ {x:33,y:6,label:'Ashcombe Holdings', act: () => actOfficeDoor()},
           {x:5,y:9,label:'Platform bench', act: () => dialog([{s:'noah', t:'(The last train back to Ashbourne leaves at dawn. I’m not leaving without that ledger.)'}])} ] },
  office: { name:'Ashcombe Holdings', floor:'tile', wall:'#2e3346', ch4:true, map:[
    "##W##MM##W####",
    "|Y.Y......EEE|",
    "|............|",
    "|..rrrrrr....|",
    "|..rrrrrr..P.|",
    "|..rrrrrr....|",
    "|Y.........H.|",
    "|A..........A|",
    "______D_______" ],
    exitTo:{ scene:'harlow', x:33, y:7 },
    objs:[ {x:11,y:6,label:'Stairs down to the archive', act: () => enterScene('archive', {x:6, y:7})},
           {x:12,y:1,label:'Ashcombe’s desk', act: () => dialog([{s:'narr', t:'A desk the size of a boat. A single framed photograph: Ashcombe, shaking hands with a railway board, 2007. Everyone is smiling except the man signing.'}])} ] },
  archive: { name:'The archive', floor:'stone', wall:'#3a3a40', ch4:true, map:[
    "##############",
    "|YYYYY..YYYYY|",
    "|............|",
    "|.Y..........|",
    "|......G.....|",
    "|..........Y.|",
    "|.Y..........|",
    "|............|",
    "______D_______" ],
    exitTo:{ scene:'office', x:11, y:7 },
    objs:[ {x:6,y:4,label:'The safe', act: () => actSafe()} ] },
};
const LIGHT_GLYPHS = { F:'255,140,60', O:'255,120,40', N:'255,210,120', E:'255,220,150', l:'255,200,110' };
const SOLID_GLYPHS = new Set('#W M K|_ S C A T c F P B V O Q X L N Y w G E Z J u % = ~ l b t 1 m'.replace(/ /g,''));

function buildScene(id){
  const sc=SCN[id]; if (sc.base) return sc;
  sc.h=sc.map.length; sc.w=sc.map[0].length; sc.grid=new Uint8Array(sc.w*sc.h); sc.glyph=sc.map.map(r=>r.split(''));
  sc.lights=[]; sc.windows=[];
  const base=mk(sc.w*T, sc.h*T), g=base.getContext('2d');
  const R=(x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(x,y,w,h); };
  const rr=mulberry32(id.length*977+sc.w*31);
  const gl=(x,y)=> (sc.glyph[y]&&sc.glyph[y][x]) || ' ';
  // floors
  for (let y=0;y<sc.h;y++) for (let x=0;x<sc.w;x++){
    const ox=x*T, oy=y*T, ch=gl(x,y);
    if (sc.floor==='wood'){ for (let r=0;r<4;r++){ R(ox,oy+r*4,T,4, ((x+r*3+y)%5===0)?'#7a5636':(r%2?'#8a6240':'#93694a')); R(ox+((x*7+r*5+y)%12),oy+r*4,1,4,'#5e4129'); } R(ox,oy+15,T,1,'#5e4129'); }
    else if (sc.floor==='stone'){ R(ox,oy,T,T,'#7d776d'); R(ox,oy,T,1,'#625d55'); R(ox,oy,1,T,'#625d55'); R(ox+8,oy+8,8,1,'#625d55'); R(ox+8,oy,1,8,'#625d55'); if (rr()<.3) R(ox+3+Math.floor(rr()*8),oy+3+Math.floor(rr()*8),2,1,'#8d877d'); }
    else if (sc.floor==='tile'){ R(ox,oy,T,T,'#d8d0c0'); R(ox,oy,8,8,'#3a3a44'); R(ox+8,oy+8,8,8,'#3a3a44'); }
    else if (sc.floor==='charred'){ R(ox,oy,T,T,'#2e2a28'); for (let k=0;k<6;k++) R(ox+Math.floor(rr()*15),oy+Math.floor(rr()*15),2,1, rr()<.5?'#4a4440':'#1e1a18'); }
    else { // outdoor
      if (ch==='"'||ch==='t'){ for (let k=0;k<T;k+=2) for (let j=0;j<T;j+=2) R(ox+k,oy+j,2,2, rr()<.5?'#3c5a34':'#45663a'); }
      else if (ch==='~'){ R(ox,oy,T,T,'#2c4e6e'); if (rr()<.5) R(ox+Math.floor(rr()*10),oy+Math.floor(rr()*14),4,1,'#4a7296'); }
      else if (ch==='+'){ for (let k=0;k<T;k+=4) R(ox+k,oy,3,T,'#8a6240'); R(ox,oy,T,1,'#4a321f'); }
      else if (ch==='='){ R(ox,oy,T,T,'#5f5a57'); if (y%1===0){ R(ox,oy+4,T,2,'#4a3426'); R(ox,oy+11,T,2,'#4a3426'); } R(ox+3,oy,2,T,'#a7aab4'); R(ox+11,oy,2,T,'#a7aab4'); }
      else if (ch==='p'||ch==='b'&&x<6){ R(ox,oy,T,T,'#8d8577'); R(ox,oy,T,1,'#6f685d'); R(ox,oy,1,T,'#6f685d'); if (gl(x-1,y)==='=') R(ox,oy,2,T,'#d9c25a'); }
      else { R(ox,oy,T,T,'#55524e'); for (let k=0;k<4;k++) for (let j=0;j<4;j++) R(ox+k*4+(j%2?2:0),oy+j*4,3,3, rr()<.5?'#6a665f':'#625e58'); }
    }
    if (ch==='r'){ R(ox,oy,T,T,'#8a2e2e'); R(ox+2,oy+2,T-4,T-4,'#a03a34'); if (gl(x-1,y)!=='r') R(ox,oy,2,T,'#e8c46a'); if (gl(x+1,y)!=='r') R(ox+14,oy,2,T,'#e8c46a'); if (gl(x,y-1)!=='r') R(ox,oy,T,2,'#e8c46a'); if (gl(x,y+1)!=='r') R(ox,oy+14,T,2,'#e8c46a'); }
    if (ch==='D'){ R(ox+2,oy+4,12,10,'#6b4a2f'); R(ox+3,oy+5,10,8,'#8a6240'); }
    if (ch==='H'){ for (let k=0;k<4;k++) R(ox+1,oy+k*4,14,3, ['#4a4448','#3a3438','#2a2528','#1a1618'][k]); }
  }
  // walls
  const wallC=sc.wall||'#5a4a42';
  for (let y=0;y<sc.h;y++) for (let x=0;x<sc.w;x++){
    const ch=gl(x,y), ox=x*T, oy=y*T;
    if (sc.outdoor){
      if (ch==='%'){
        const front = gl(x,y+1)!=='%' && gl(x,y+1)!==' ';
        if (front || ch==='1'){ R(ox,oy,T,T,'#6a3a2e'); for (let j=0;j<T;j+=4){ R(ox,oy+j,T,1,'#4a2820'); R(ox+((j/4)%2?0:8),oy+j,1,4,'#4a2820'); }
          if ((x*3+y)%3!==0){ R(ox+4,oy+3,8,8,'#2a2228'); R(ox+5,oy+4,6,6,'#1a1e2e'); sc.windows.push([x,y]); } R(ox,oy+T-2,T,2,'#2a1814'); }
        else { R(ox,oy,T,T,'#3a3a46'); for (let j=2;j<T;j+=4) R(ox,oy+j,T,1,'#2e2e38'); for (let k=(y%2?0:4);k<T;k+=8) R(ox+k,oy,1,T,'#2e2e38'); if ((x*7+y*3)%23===0){ R(ox+5,oy+2,6,9,'#5a3a2e'); R(ox+4,oy+1,8,2,'#3a2a24'); } }
      }
      continue;
    }
    if (ch==='#'||ch==='W'||ch==='M'||ch==='K'||(y===0 && 'SZOQL'.includes(ch))){
      R(ox,oy,T,T,wallC); for (let k=2;k<T;k+=6) R(ox+k,oy,1,T,shade(wallC,.85));
      R(ox,oy,T,3,'#1a1420'); R(ox,oy+11,T,5,'#4a321f'); R(ox,oy+11,T,1,'#6b4a2f');
      if (ch==='W'){ R(ox+2,oy+3,12,8,'#3a2a1a'); sc.windows.push([x,y]); }
      if (ch==='M'){ R(ox+3,oy+3,10,7,'#c9a046'); R(ox+4,oy+4,8,5,'#4a6a4a'); R(ox+4,oy+7,8,2,'#3a5a3a'); R(ox+9,oy+5,2,2,'#e8c46a'); }
      if (ch==='K'){ R(ox+5,oy+3,6,6,'#efe3c8'); R(ox+5,oy+3,6,1,'#3a2a1a'); R(ox+7,oy+4,1,3,'#1a1418'); R(ox+8,oy+6,2,1,'#1a1418'); }
    }
    if (ch==='|'){ R(ox,oy,T,T,'#1a1420'); R(x===0?ox+T-3:ox,oy,3,T,'#2e2638'); }
    if (ch==='_'){ R(ox,oy,T,T,'#1a1420'); R(ox,oy,T,3,'#2e2638'); }
  }
  // furniture strips (one strip per row so the player can stand in front of / behind things)
  sc.strips=[];
  for (let y=0;y<sc.h;y++){
    const st=mk(sc.w*T, T+14), s2=st.getContext('2d'); let any=false;
    const P2=(x,yy,w,h,c)=>{ s2.fillStyle=c; s2.fillRect(x,yy+14,w,h); };
    for (let x=0;x<sc.w;x++){
      const ch=gl(x,y), ox=x*T; any = drawGlyph(P2, ch, ox, x, y, sc, gl, rr) || any;
      if (LIGHT_GLYPHS[ch]) sc.lights.push([x,y,LIGHT_GLYPHS[ch]]);
    }
    sc.strips.push(any ? st : null);
  }
  for (let y=0;y<sc.h;y++) for (let x=0;x<sc.w;x++){ const ch=gl(x,y); if (SOLID_GLYPHS.has(ch) || ch===' ') sc.grid[y*sc.w+x]=1; }
  sc.base=base;
  return sc;
}
function drawGlyph(R, ch, ox, x, y, sc, gl, rr){
  const books=['#8a2e2e','#2f5a3a','#2f3d63','#c9a046','#6a3a6e','#d8d0c0','#5a4a42'];
  switch(ch){
    case 'S': R(ox,-10,T,26,'#3a2416'); R(ox+1,-9,T-2,24,'#5a3a24'); for (const sy of [-8,-1,6]){ for (let k=0;k<7;k++) R(ox+2+k*2,sy,2,6, books[(x*3+k+sy+20)%books.length]); R(ox+1,sy+6,T-2,1,'#3a2416'); } return true;
    case 'Z': R(ox,-10,T,26,'#4a321f'); for (let j=0;j<3;j++) for (let k=0;k<3;k++){ R(ox+1+k*5,-9+j*8,4,7,'#2a1c14'); if ((x+j+k)%2) R(ox+2+k*5,-6+j*8,3,2,'#efe3c8'); } return true;
    case 'C': R(ox,0,T,16,'#5a3a24'); R(ox,0,T,4,'#a77d55'); R(ox,4,T,1,'#3a2416'); R(ox+3,7,10,6,'#6b4a2f'); return true;
    case 'A': R(ox+1,2,14,13,'#7a2a2a'); R(ox+1,-4,14,8,'#8a2e2e'); R(ox,2,3,12,'#6a2424'); R(ox+13,2,3,12,'#6a2424'); R(ox+4,6,8,6,'#a03a34'); return true;
    case 'T': R(ox+1,4,14,8,'#6b4a2f'); R(ox+1,3,14,3,'#a77d55'); R(ox+3,12,2,4,'#4a321f'); R(ox+11,12,2,4,'#4a321f'); R(ox+6,1,4,3,'#efe3c8'); return true;
    case 'c': R(ox+4,4,8,8,'#8a6240'); R(ox+4,0,8,4,'#6b4a2f'); R(ox+5,12,1,3,'#4a321f'); R(ox+10,12,1,3,'#4a321f'); return true;
    case 'F': R(ox+1,-6,14,22,'#2a2626'); R(ox+3,4,10,8,'#1a1616'); R(ox+4,6,8,6,'#e8763a'); R(ox+5,8,6,3,'#ffcf6a'); R(ox+6,-14,4,8,'#3a3636'); return true;
    case 'O': R(ox,-8,T,24,'#6a3a2e'); for (let j=-8;j<16;j+=4) R(ox,j,T,1,'#4a2820'); R(ox+3,4,10,10,'#2a1814'); R(ox+4,6,8,8,'#e8763a'); R(ox+5,9,6,4,'#ffcf6a'); return true;
    case 'Q': R(ox+1,-6,14,20,'#4a321f'); R(ox+3,-4,2,16,'#b8c2d0'); R(ox+7,-4,2,16,'#8a6240'); R(ox+6,-5,4,4,'#b8c2d0'); R(ox+11,-4,2,16,'#dfe6f2'); R(ox+10,-1,4,1,'#c9a046'); return true;
    case 'V': R(ox+5,6,6,9,'#3a3a40'); R(ox+1,2,14,5,'#5a5c66'); R(ox+12,3,4,2,'#5a5c66'); R(ox+1,2,14,1,'#8a8c96'); return true;
    case 'X': R(ox,2,T,10,'#6b4a2f'); R(ox,2,T,3,'#8a6240'); R(ox,-3,T,5,'#5a3a24'); if (gl(x-1,y)!=='X') R(ox,-3,2,15,'#3a2416'); if (gl(x+1,y)!=='X') R(ox+14,-3,2,15,'#3a2416'); return true;
    case 'L': R(ox,0,T,14,'#efe3c8'); R(ox,0,T,3,'#ffffff'); R(ox,10,T,2,'#c9a046'); if (gl(x-1,y)==='N'||gl(x+1,y)==='N'||x%2) R(ox+6,-4,4,4,'#c9a046'); return true;
    case 'N': R(ox+6,0,4,14,'#c9a046'); R(ox+4,12,8,3,'#a07a30'); R(ox+7,-4,2,4,'#efe3c8'); R(ox+7,-7,2,3,'#ffcf6a'); return true;
    case 'Y': R(ox+1,-6,14,21,'#3a2a22'); for (const j of [-4,2,8]){ R(ox+2,j,12,5,'#4a3a2e'); R(ox+7,j+2,2,1,'#c9a046'); } return true;
    case 'w': R(ox,2,T,10,'#6b4a2f'); R(ox,2,T,3,'#a77d55'); R(ox+2,-1,4,3,'#8a8c96'); R(ox+9,0,5,2,'#c9a046'); R(ox+1,12,2,4,'#4a321f'); R(ox+13,12,2,4,'#4a321f'); return true;
    case 'G': R(ox,-6,T,22,'#2a2c34'); R(ox+1,-5,14,20,'#3a3d48'); R(ox+5,1,6,6,'#c9a046'); R(ox+7,3,2,2,'#2a2c34'); R(ox+12,4,2,4,'#8a8c96'); return true;
    case 'E': R(ox,2,T,12,'#5a3a24'); R(ox,2,T,3,'#8a6240'); R(ox+3,-1,5,3,'#efe3c8'); if (x%3===0){ R(ox+11,-4,2,6,'#3a3a40'); R(ox+9,-6,6,3,'#c9a046'); } return true;
    case 'P': R(ox+4,9,8,6,'#a0503a'); R(ox+5,8,6,2,'#b8603a'); R(ox+3,0,10,9,'#3f7434'); R(ox+6,-4,4,5,'#5a9443'); R(ox+2,3,3,3,'#5a9443'); return true;
    case 'B': R(ox+3,1,10,14,'#7a5a3a'); R(ox+3,4,10,2,'#4a3a2a'); R(ox+3,10,10,2,'#4a3a2a'); R(ox+4,1,8,2,'#9a7a5a'); return true;
    case 'm': { const cx=ox+8, cy2=4; for (let yy=-6;yy<=6;yy++){ const ww=Math.floor(Math.sqrt(36-yy*yy)); R(cx-ww,cy2+yy,ww*2,1, yy<-2?'#a8a296':'#8d877d'); } R(cx-1,cy2-1,2,2,'#5a554e'); return true; }
    case 'J': R(ox,0,T,16,'#120d0b'); R(ox,0,T,2,'#3a2a24'); if (x%2) R(ox+2,6,12,2,'#4a3426'); return true;
    case 'u': R(ox+1,5,14,10,'#2a2220'); R(ox+3,2,6,5,'#1a1614'); R(ox+9,4,5,3,'#3a302a'); R(ox+5,8,2,1,'#c94a2a'); return true;
    case 'l': R(ox+7,-12,2,26,'#22252f'); R(ox+5,-17,6,6,'#22252f'); R(ox+6,-16,4,4,'#ffd88a'); R(ox+5,13,6,2,'#22252f'); return true;
    case 'b': R(ox,4,T,3,'#8a6240'); R(ox,9,T,2,'#8a6240'); R(ox+1,7,2,7,'#4a321f'); R(ox+13,7,2,7,'#4a321f'); return true;
    case 't': { const s=roundTrees[(x+y)%3]; R(0,0,0,0,'#000'); return 'tree'; }
    case '1': R(ox,-2,T,18,'#6a3a2e'); R(ox+3,2,10,14,'#2a1814'); R(ox+4,3,8,13,'#5a3a24'); R(ox+10,9,1,1,'#e8c46a'); R(ox-14,-10,44,7,'#1d2a2e'); for (let k=0;k<10;k++) R(ox-11+k*4,-8,2,3,'#efe3c8'); return true;
  }
  return false;
}
// trees in outdoor scenes are drawn as sprites
function sceneTrees(sc){ if (sc._trees) return sc._trees; sc._trees=[]; for (let y=0;y<sc.h;y++) for (let x=0;x<sc.w;x++) if (sc.glyph[y][x]==='t') sc._trees.push({x:x*T+8, y:y*T+13, v:(x+y)%3}); return sc._trees; }

function sceneSolidAt(tx,ty){ const sc=SCN[IN]; if (tx<0||ty<0||tx>=sc.w||ty>=sc.h) return true; return sc.grid[ty*sc.w+tx]===1; }
function sceneSafeAt(tx,ty){ const sc=SCN[IN]; if (!sc.outdoor) return true; return (sc.safe||[]).some(([a,b,c,d]) => tx>=a&&tx<c&&ty>=b&&ty<d); }
function sceneBlocked(x,y){
  for (const [px,py] of [[x-4,y-3],[x+3,y-3],[x-4,y],[x+3,y]]) if (sceneSolidAt(Math.floor(px/T), Math.floor(py/T))) return true;
  for (const n of sceneNPCs()) if (Math.abs(n.x-x)<9 && Math.abs(n.y-y)<6) return true;
  return false;
}
// people in the current scene: townsfolk who are "inside" by their routine, or chapter-four characters
const SCENE_PROXY = {};
function sceneNPCs(){
  if (!IN) return [];
  const sc=SCN[IN], out=[];
  for (const [id,[tx,ty]] of Object.entries(sc.residents||{})){
    const n=npcs.find(q=>q.id===id); if (!n || n.inside!==IN || (n.when && !n.when())) continue;
    const key=IN+':'+id; const p = SCENE_PROXY[key] || (SCENE_PROXY[key]={ id, x:tx*T+8, y:ty*T+12, dir:'down', home:'down', turnT:3, talk: () => n.talk() });
    out.push(p);
  }
  for (const n of (CH4_NPCS[IN]||[])) if (!n.when || n.when()) out.push(n);
  return out;
}
function sceneNearest(){
  let best=null, bd=26;
  for (const n of sceneNPCs()){ const d=Math.hypot(n.x-P.x,n.y-P.y); if (d<bd){ bd=d; best={kind:'npc', n, label:'Talk to '+CH[n.id].name.split(' ')[0]}; } }
  for (const o of (SCN[IN].objs||[])){ if (o.when && !o.when()) continue; const d=Math.hypot(o.x*T+8-P.x, o.y*T+12-P.y); if (d<bd){ bd=d; best={kind:'obj', o, label:o.label}; } }
  return best;
}
function enterScene(id, at, silent){
  const sc=buildScene(id);
  if (!IN) { sceneReturn = { x:P.x, y:P.y }; }
  IN=id; C.enemies=C.enemies.filter(e=>e.wave && e.scene===id); C.arrows=[]; C.pickups=[];
  let sx, sy;
  if (at){ sx=at.x; sy=at.y; } else { const dy=sc.map.findIndex(r=>r.includes('D')); if (dy<0){ sx=4; sy=10; /* no door (Harlow Cross): start on the platform */ } else { sx=sc.map[dy].indexOf('D'); sy=dy-1; } }
  P.x = (at && at.px!=null) ? at.px : sx*T+8; P.y = (at && at.py!=null) ? at.py : sy*T+10; P.dir = at && at.dir || 'up';
  if (F().pet){ scout.x=P.x; scout.y=P.y+8; }
  camX=P.x-VW/2; camY=P.y-VH/2; curZone=sc.name;
  if (!silent){ sfxDoor(); doorBlink(); showZone(sc.name); if (id==='church') sfxBell(); }
  if (sc.public){ S0.visited=S0.visited||[]; if (!S0.visited.includes(id)) S0.visited.push(id); }
  if (id==='office' && !F().officeIn){ F().officeIn=1; setTimeout(() => dialog([{s:'narr', t:'Ashcombe Holdings. Marble floors, mahogany desks, and the smell of money. A staircase leads down to the archive.'}]), 400); }
  save(); refreshHUD();
}
let sceneReturn=null;
function leaveScene(silent){
  if (!IN) return;
  const sc=SCN[IN];
  if (sc.exitTo){ const e=sc.exitTo; enterScene(e.scene, {x:e.x, y:e.y, dir:'down'}, silent); return; }
  const o=sc.out; IN=null; C.enemies=C.enemies.filter(e=>!e.scene); C.arrows=[];
  P.x=o[0]*T+8; P.y=o[1]*T+10; P.dir='down'; if (F().pet){ scout.x=P.x; scout.y=P.y-10; }
  camX=P.x-VW/2; camY=P.y-VH/2; curZone='';
  if (!silent){ sfxDoor(); doorBlink(); }
  save(); refreshHUD();
}
function doorBlink(){ const f=$('#fade'); f.classList.remove('blink'); void f.offsetWidth; f.classList.add('blink'); }
function checkSceneExit(){
  if (!IN) return; const sc=SCN[IN]; if (sc.outdoor) return;
  const tx=Math.floor(P.x/T), ty=Math.floor((P.y+2)/T);
  if (sc.glyph[ty] && sc.glyph[ty][tx]==='D') leaveScene();
}

// ---- interior actions ----
const BOOK_BLURBS = ['“A History of the Ashbourne Branch Line, 1847–1960.” Someone has underlined the word “profitable” three times.', '“Signals and Their Keepers.” A bookmark at the chapter on signal-box fires.', '“Lanterns: A Practical Guide.” The margins are full of a familiar handwriting.'];
function browseBooks(){ S0.bookI=((S0.bookI||0)+1)%BOOK_BLURBS.length; dialog([{s:'narr', t:BOOK_BLURBS[S0.bookI]}]); }
function actHalePhoto(){
  if (has('halephoto')){ dialog([{s:'narr', t:'The old picnic photo. Four friends, one summer, before everything.'}]); return; }
  dialog([{s:'narr', t:'Pinned behind the till, half hidden by receipts: a faded photo. Four young people at a railway picnic, 2005.'},
          {s:'narr', t:'Hale. Tom. A woman with a pocket watch on a chain. And your father — laughing, mid-sentence, a lantern at his feet.'},
          {s:'noah', t:'(Mara. They were all friends once. Every one of them.)'}, () => addClue('halephoto')]);
}
function actReturned(){
  if (has('returned')){ dialog([{s:'narr', t:'The bundle of returned letters. You leave them where they are, for now.'}]); return; }
  dialog([{s:'narr', t:'A bundle of letters, tied with string, each stamped RETURN TO SENDER. All in the same handwriting.'},
          {s:'narr', t:'The top one is addressed to your mother, 2007: “Tell Noah I think of him every time a train goes by.”'},
          {s:'noah', t:'(She never opened them. Or she did, and couldn’t bear to keep them.)'}, () => addClue('returned')]);
}
function actCafeChair(){
  if (LOOK()===2||LOOK()===1) dialog([{s:'narr', t:'The armchair by the stove. The café is quiet and warm.'}, {choice:[{t:'Sleep here until morning', then: () => { setTimeout(restUntilMorning, 60); return []; }}, {t:'Not yet.', then:[]}]}]);
  else dialog([{s:'narr', t:'A deep armchair by the stove. At night you can sleep here until morning.'}]);
}
function actCandle(){
  if (F().candle){ dialog([{s:'narr', t:'Your candle is still burning, perfectly still.'}]); return; }
  dialog([{s:'narr', t:'You light a candle for Mara Voss. The flame stands perfectly still, as if the church is holding its breath.'}], () => { F().candle=1; unlockAch('candle'); });
}

// ================= Chapter Four: Harlow Cross =================
const CH4_NPCS = {
  harlow: [
    { id:'elias', x:4*T+8, y:12*T+12, dir:'right', home:'right', turnT:4, talk: () => talkElias4() },
    { id:'marlowe', x:4*T+8, y:6*T+12, dir:'down', home:'down', turnT:4, talk: () => talkMarlowe() },
    { id:'nell', x:23*T+8, y:13*T+12, dir:'down', home:'down', turnT:4, talk: () => talkNell(), when: () => !F().ch4end },
  ],
  office: [ { id:'ashcombe', x:7*T+8, y:4*T+12, dir:'down', home:'down', turnT:4, talk: () => talkAshcombe4(), when: () => F().heartDown && !F().ch4end } ],
};
function talkElias4(){
  const f=F();
  dialog([{s:'elias', t: !f.marlowe ? 'Talk to the inspector first, Noah. Then we’ll know what we’re walking into.' : !f.heartDown ? 'I’ll keep watch on the platform. If anything comes out of that building, I want to see it first.' : f.ch4end ? 'It’s over. It’s really over.' : 'You found it? Then finish it, son. I’m right behind you.'}]);
}
function talkMarlowe(){
  meet('marlowe'); const f=F();
  if (f.marlowe){ dialog([{s:'marlowe', t: !f.nell ? 'Nell Crane is waiting by the canal bridge. South of the street.' : !f.heartDown ? 'Ashcombe Holdings, east end of the street. I can’t go in without a warrant — you, apparently, can.' : 'Get that ledger to the lobby. I’ll be there before he can call his lawyers.'}]); return; }
  dialog([
    {s:'marlowe', t:'Inspector Marlowe, county police. Walt Pryce rang me two hours ago and confessed to arson and manslaughter. Took me forty minutes to believe him.'},
    {s:'marlowe', t:'I can arrest Walt. I can’t touch Ashcombe without the original ledger — and no judge will sign a warrant for his safe tonight.'},
    {choice:[
      {t:'Then I’ll get it myself.', then:[ {s:'marlowe', t:'I didn’t hear that. But if a ledger were to find its way into my hands…'} ]},
      {t:'How do we get into his office?', then:[ {s:'marlowe', t:'We don’t. But his night clerk might help you. Nell Crane.'} ]},
    ]},
    {s:'marlowe', t:'Nell rang me too. She’s waiting by the canal bridge, south of the street. And mind yourself — the Ashen are thick tonight.'},
    () => { f.marlowe=1; },
    {s:'key', t:'The police can only arrest Ashcombe with the ORIGINAL ledger — and it’s locked in his office safe. Find Nell Crane by the canal bridge.'},
  ]);
}
function talkNell(){
  meet('nell'); const f=F();
  if (f.nell){ dialog([{s:'nell', t:'Side door at the east end. The safe is in the basement archive. 12, 06, 06. Go — before he burns it.'}]); return; }
  dialog([
    {s:'nell', t:'You’re Elias Vale’s son. I’m Nell Crane. My father was Hugh Crane — the railway manager who signed the land valuation.'},
    {s:'nell', t:'Ashcombe made him sign it. Dad drank himself into the ground over it. Before he died, he told me everything. Including the combination of the safe.'},
    {choice:[
      {t:'I’m sorry about your father.', then:[ {s:'nell', t:'So am I. He wasn’t brave. But at the very end, he was honest. That has to count for something.'} ]},
      {t:'Why help me now?', then:[ {s:'nell', t:'Because I’ve typed Ashcombe’s letters for six years, and I’m tired of pretending I can’t read them.'} ]},
    ]},
    {s:'nell', t:'Here — my key to the side door. The safe is in the basement archive. The combination is the date of the fire: 12, 06, 06.'},
    {s:'narr', t:'She presses a cold brass key into your hand.'},
    () => { f.nell=1; addClue('nell'); },
    {s:'key', t:'Nell gave me the key to Ashcombe’s office and the safe code: 12 · 06 · 06 — the date of the fire. The office is at the east end of the street.'},
  ]);
}
function actOfficeDoor(){
  if (!F().nell){ dialog([{s:'narr', t:'ASHCOMBE HOLDINGS, in gold letters. The door is locked, and the lock is expensive.'}, {s:'noah', t:'(I need a way in. Maybe the inspector knows someone.)'}]); return; }
  enterScene('office');
}
function actSafe(){
  const f=F();
  if (f.heartDown){ dialog([{s:'narr', t:'The safe stands open and empty, except for a fine grey dust.'}]); return; }
  if (f.safeOpen) return;
  dialog([
    {s:'narr', t:'A steel safe as big as a wardrobe. You turn the dial. 12… 06… 06.'},
    {s:'narr', t:'Something deep inside clunks. The door swings open — and a cloud of black ash pours out, swirling, burning, gathering itself into a shape.'},
    {s:'noah', t:'(He burned the old records in here, again and again. The ash remembers.)'},
  ], () => { sfxClunk(); f.safeOpen=1; });
}
function talkAshcombe4(){
  meet('ashcombe');
  dialog([
    {s:'ashcombe', t:'Mr. Vale. You have something of mine.'},
    {s:'ashcombe', t:'Do you know what that book is worth? Name a figure. Any figure. Your father could finally have the life he lost.'},
    {choice:[
      {t:'He lost twenty years. You can’t buy them back.', then:[]},
      {t:'Mara Voss can’t name a figure.', then:[]},
      {t:'(Say nothing.)', then:[]},
    ]},
    {s:'ashcombe', t:'Then you’ve made the same mistake he did.'},
    {s:'narr', t:'The lobby doors bang open. Inspector Marlowe, two constables — and behind them, your father.'},
    {s:'marlowe', t:'Victor Ashcombe, I’m arresting you for conspiracy to commit arson, for fraud, and for the death of Mara Voss.'},
    {s:'narr', t:'You hand Marlowe the ledger. Ashcombe doesn’t look at it. He looks at Elias.'},
    {s:'ashcombe', t:'Twenty years, Elias. You should have stayed gone.'},
    {s:'elias', t:'I did, Victor. My son didn’t.'},
    () => { F().ch4end=1; unlockAch('ch4'); save(); },
  ], () => setTimeout(runFinale, 300));
}
