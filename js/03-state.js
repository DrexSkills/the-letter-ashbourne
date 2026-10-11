// The Letter — Save state, clues, memories, people, the townsfolk list and things you can examine.
'use strict';

// ================= state =================
const NEW_STATE = () => ({ f:{ phase:0, chap:1 }, clues:[], mems:[], met:[], x:86*T+8, y:30*T+10, dir:'left', tut:1, dlgCount:0, hp:10, maxhp:10, shards:0, lvl:1, xp:0, weapons:[], weapon:'stick', tod:10, day:1 });
let S0 = NEW_STATE();
const F = () => S0.f;
const chap = () => F().chap || 1;
const PHASE_NAMES = ['Late afternoon','Dusk','Night','Dawn','Morning','Evening','Night'];
const LOOK = () => { const t=(S0 && S0.tod!=null) ? S0.tod : 10; if (t>=7&&t<17) return 0; if (t>=17&&t<19.5) return 1; if (t>=5&&t<7) return 3; return 2; };
const SAVE_KEY = 'the-letter-ch1-v1';
function save(){ try { S0.scene=IN; S0.x=P.x; S0.y=P.y; S0.dir=P.dir; S0.cat={x:cat.x,y:cat.y,follow:cat.follow}; localStorage.setItem(SAVE_KEY, JSON.stringify(S0)); } catch(e){} }
function loadSave(){ try { const s=localStorage.getItem(SAVE_KEY); return s?JSON.parse(s):null; } catch(e){ return null; } }

const CLUES = {
  letter:  { t:'The letter', d:'Dad’s handwriting — the first thing he’s ever sent me. Go to Ashbourne. Find the bookseller near the station. Trust no one until I know who is safe.' },
  photo:   { t:'Photograph from the train', d:'Dad beside a woman and two men, outside a brick building. Back reads: “Ashbourne, spring 2009.” He vanished in 2006 — so someone photographed him three years after he supposedly disappeared.' },
  hand:    { t:'The bookseller — Edmund Hale', d:'Hale recognised Dad’s handwriting. He won’t help me until I prove I’m really Elias’s son: I need to find the word Dad carved into things he built. Hale says to try Tom Barrow’s farm south of the road.' },
  news:    { t:'Ashbourne Gazette, June 2006', d:'Fire at the railway office. Mara Voss — the railway clerk — died inside. Elias Vale, signal engineer, went missing and was “sought for questioning.” The town still thinks he started the fire.' },
  carving: { t:'The fence post carving', d:'East fence at Hollow Farm: “E.V. + T.B. — LANTERN”. E.V. is Elias Vale. T.B. is Tom Barrow, the farmer. They were close friends. LANTERN is the word Hale was asking about.' },
  grave:   { t:'Mara Voss’s grave', d:'1974–2006. Fresh wildflowers at the stone — someone still visits. Mara is the woman standing next to Dad in the 2009 photograph, even though she’s supposed to have died in 2006.' },
  key:     { t:'Brass key — from Hale', d:'Opens Dad’s workshop, hidden beyond Ashwood forest. Hale said: “He didn’t run, Noah. He was pushed.” To get through the forest safely, I need the lantern from Tom Barrow at Hollow Farm.' },
  lantern: { t:'Dad’s old lantern', d:'Tom Barrow kept it for twenty years. He confessed: men came to his door after the fire and told him what to say. He signed a false witness statement against Dad — out of fear.' },
  silas:   { t:'Silas Voss', d:'Mara’s brother. He waits in Ashwood at night, watching the old trail. He believes Dad let Mara die and ran — and he wants answers. He’s not dangerous, just grieving.' },
  watch:   { t:'Mara’s pocket watch', d:'Half-buried in the forest moss. Engraved: “E — keep time for me. M.” Mara gave this to Dad. Silas said it was never found in the fire’s ashes — because it was never in the building.' },
  postcard:{ t:'Postcard, 2009', d:'Hidden behind June’s café counter for years. Postmarked Harlow Cross, three years after Dad vanished: “Still keeping left. — E.” He was alive, and he was writing to people in Ashbourne.' },
  note:    { t:'Dad’s note at dawn', d:'He didn’t come. Walt passed on a note from “a man in a grey coat”: they’re watching the platform. Get the ledger first — old engine shed, north along the tracks, under the inspection pit.' },
  ashcombe:{ t:'Victor Ashcombe', d:'Owns the old branch line and the engine shed — Ashcombe Holdings bought it in 2007, right after the fire. Keeps the shed gate locked and knew exactly who I was.' },
  ledger:  { t:'Mara’s ledger', d:'Hidden in the inspection pit. The branch-line land was undervalued from £410,000 to £38,000. Ashcombe Holdings paid £27,000 to someone signed “W.P.” — who was told to “clear the office records” two days before the fire.' },
  staff:   { t:'Railway staff list, 2006', d:'From Clara’s archive. Signal box keeper, 2006: Walter Pryce. W.P. is Walt — the friendly railway worker who greeted me on day one.' },
  letters: { t:'Walt’s monthly letters', d:'Rosa at the post office: for twenty years Walt has posted a letter every month to Ashcombe Holdings, Harlow Cross. He’s been reporting to them all along.' },
  confession:{ t:'Walt’s confession', d:'Walt set the fire to destroy the records for Ashcombe’s money. He was told the office was empty. Mara had come back for her copy of the books. He let them blame Dad — and told Ashcombe the moment Dad came back.' },
  reunion: { t:'The end of the platform', d:'Twenty years, three days, one letter. Dad was waiting where he said he would be.' },
  halephoto:{ t:'The picnic photo', d:'Behind Hale’s counter: Hale, Tom, Mara and Dad at a railway picnic in 2005. They were all friends once.' },
  returned:{ t:'Letters returned to sender', d:'At the post office: Dad’s letters to Mum, all sent back. “Tell Noah I think of him every time a train goes by.”' },
  nell:    { t:'Nell Crane’s story', d:'Daughter of Hugh Crane, the railway manager Ashcombe forced to sign the false valuation. She gave me the office key and the safe combination: 12 · 06 · 06.' },
  original:{ t:'The original ledger', d:'From Ashcombe’s safe, untouched by the fire. Every falsified figure, with Ashcombe’s own signature beside it.' },
  workshop:{ t:'Dad’s second letter — the truth', d:'Mara discovered the railway’s financial records had been falsified — money was being moved and land was being sold illegally. Someone killed her to keep it quiet, then framed Dad because he asked too many questions. Dad fled to protect me. The evidence ledger is hidden “where the trains used to sleep” — the old engine shed. Meet him at the old platform at dawn.' },
};
const MEMS = {
  ticket: { t:'Ticket stub', d:'Wedged under the bench: Ashbourne → City, single, 13 June 2006. The night before the fire. One way.' },
  stones: { t:'Skipping stones', d:'A little cairn of flat stones by the water. Someone taught me: five bounces and you get a wish. I never got past three.' },
  train:  { t:'Toy train', d:'A rusted tin engine by the graves, painted red like mine. Mum always said mine came from nowhere.' },
  coat:   { t:'The scarecrow’s coat', d:'Brown corduroy, elbow patches. Dad’s coat, from the photo on Mum’s dresser. Tom couldn’t throw it away.' },
  tree:   { t:'Initials in the bark', d:'E.V., and under it a tiny lantern scratched into the oak. He walked this path. Maybe many times.' },
};
const PEOPLE = {
  walt:  () => 'Railway worker at Ashbourne station.' + (F().toldWalt ? ' Went quiet when I said the name Vale.' : ' Knows everyone who comes and goes.'),
  hale:  () => F().key ? 'Bookseller. Gave me Dad’s workshop key. Swears Dad was framed.' : 'Bookseller on Main Street. Recognised Dad’s handwriting, but won’t say more.',
  clara: () => 'Town historian. Keeps Ashbourne’s archive in the records office.',
  tom:   () => F().lantern ? 'Dad’s oldest friend. Signed a false statement against him in 2006 and has regretted it since.' : 'Farmer at Hollow Farm. Unfriendly. Watches the road.',
  june:  () => F().catHome ? 'Runs the café. Gave me Dad’s old postcard for bringing Biscuit home.' : 'Runs the café on the square. Hears every rumour first.',
  pip:   () => 'Kid who fishes by the river. Believes in the ghost light in Ashwood.',
  greta: () => 'Blacksmith south-east of the square. Trades ember shards for weapons.',
  agnes: () => 'Runs the Old Mill on the river. Bakes a loaf that heals you, once a day.',
  ned:   () => F().lureDone ? 'Fishes off the pier at Willow Lake. Got his lucky lure back, thanks to me.' : 'Fishes off the pier at Willow Lake. Lost his lucky lure at the Abbey ruins.',
  marlowe: () => 'County police inspector in Harlow Cross. Needs the original ledger to arrest Ashcombe.',
  nell:  () => 'Ashcombe’s night clerk, and Hugh Crane’s daughter. She chose to help.',
  rosa:  () => F().letters ? 'Postmistress. Told me about Walt’s monthly letters to Ashcombe Holdings.' : 'Runs the post office east of the square. Remembers every postmark.',
  bennet:() => 'Vicar of St. Aldric’s. Buried Mara Voss in 2006 and still tends her grave.',
  ashcombe:() => 'Owner of the old branch line. Polite, careful, and very interested in my father.',
  elias: () => 'My father. He waited twenty years to write, and three days for me to find him.',
  silas: () => F().kindSilas ? 'Mara’s brother. Angry, grieving. Softened when I said her name.' : 'Mara’s brother. Angry. Blames Dad for her death.',
};

// ================= player, NPCs, cat =================
const P = { x:86*T+8, y:30*T+10, dir:'left', moving:false, anim:0 };
const tpos = (tx,ty) => ({ x:tx*T+8, y:ty*T+12 });
const npcs = [
  { id:'walt',  ...tpos(86,27), dir:'down', talk: () => chap()>=2 ? talkWalt2() : talkWalt(), when: () => !(chap()===3 && F().confess && !F().gameEnd) },
  { id:'hale',  ...tpos(52,25), dir:'down', talk: () => chap()>=2 ? talkHale2() : talkHale() },
  { id:'june',  ...tpos(43,25), dir:'down', talk: () => (F().scoutSeen && !F().pie && !F().pet && !(cat.follow && !F().catHome)) ? talkJunePie() : (chap()>=2 ? talkJune2() : talkJune()) },
  { id:'clara', ...tpos(44,36), dir:'down', talk: () => chap()>=2 ? talkClara2() : talkClara() },
  { id:'tom',   ...tpos(27,38), dir:'left', talk: () => chap()>=2 ? talkTom2() : talkTom() },
  { id:'pip',   ...tpos(riverX(46)-2,46), dir:'right', talk: () => chap()>=2 ? talkPip2() : talkPip() },
  { id:'rosa',  ...tpos(61,28), dir:'down', talk: () => talkRosa() },
  { id:'bennet',...tpos(48,13), dir:'down', talk: () => talkBennet() },
  { id:'agnes', ...tpos(66,67), dir:'down', talk: () => talkAgnes() },
  { id:'ned',   ...tpos(24,78), dir:'down', talk: () => talkNed() },
  { id:'greta', ...tpos(59,41), dir:'down', talk: () => talkGreta() },
  { id:'silas', ...tpos(11,13), dir:'right', talk: () => chap()>=2 ? talkSilas2() : talkSilas(), when: () => (F().lantern && !F().silasGone) || chap()>=2 },
  { id:'ashcombe', ...tpos(86,15), dir:'down', talk: () => talkAshcombe(), when: () => chap()===2 && !F().ch2end },
  { id:'elias', ...tpos(88,36), dir:'left', talk: () => talkElias(), when: () => F().eliasHere },
];
const SILAS_POS = [tpos(11,13), tpos(57,9)];
reserve(57,9);
for (const n of npcs){ const tx=Math.floor(n.x/T), ty=Math.floor(n.y/T); reserve(tx,ty); n.home=n.dir; n.turnT=2+((n.id==='agnes'||n.id==='ned') ? Math.random() : rng())*4; }   // newer characters don't touch the map's random sequence
const cat = { x:78*T, y:47*T, tx:78*T, ty:47*T, follow:false, dir:1, wait:0, anim:0 };

// ================= interactables =================
const objects = [
  { id:'sign', x:64, y:29, label:'Read sign', act: () => dialog([{s:'narr', t:'“Ashbourne. Est. 1847.” Someone has scratched underneath: “Some of us remember.”'}]) },
  { id:'carving', x:29, y:46, label:'Examine fence post', act: () => actCarving() },
  { id:'grave', x:56, y:8, label:'Read gravestone', act: () => actGrave() },
  { id:'door', x:7, y:7, label:'Workshop door', act: () => actDoor() },
  { id:'watch', x:26, y:14, label:'Something glints', when: () => !F().watch, act: () => actWatch(), sparkle:true },
  { id:'well', x:46, y:32, label:'Look into the well', act: () => dialog([{s:'noah', t:'A coin glints at the bottom. Somebody made a wish here and meant it.'}]) },
  { id:'cafeDoor', x:41, y:23, label:'Enter June’s café', act: () => enterScene('cafe') },
  { id:'booksDoor', x:52, y:23, label:'Enter Hale’s Books', act: () => enterScene('books') },
  { id:'postDoor', x:59, y:26, label:'Enter the post office', act: () => enterScene('post') },
  { id:'forgeDoor', x:57, y:40, label:'Enter the forge', act: () => enterScene('forge') },
  { id:'churchDoor', x:46, y:11, label:'Enter St. Aldric’s', act: () => enterScene('church') },
  { id:'records', x:41, y:40, label:'Records office', act: () => dialog([{s:'narr', t: F().news ? 'The archive is locked for the night. Clara has the key.' : 'Locked. A note: “Archive by appointment. Ask Clara — usually by the square.”'}]) },
  { id:'stationDoor', x:86, y:23, label:'Ticket office', act: () => dialog([{s:'narr', t:'Timetable: one train in, one train out. The last one leaves at nine.'}]) },
  { id:'waitBench', x:87, y:34, label:'Sit and wait for Dad', when: () => chap()===2 && !F().note, act: () => actWait() },
  { id:'shedGate', x:83, y:14, label:'Engine shed gate', when: () => chap()>=2, act: () => actGate() },
  { id:'culvert', x:78, y:9, label:'Rusty grate', when: () => chap()>=2 && !F().culvert, act: () => actGrate() },
  { id:'pit', x:83, y:8, label:'Enter the engine shed', when: () => chap()>=2 && F().culvert && F().bossDown, act: () => enterScene('shed') },
  { id:'postbox', x:62, y:27, label:'Post box', act: () => dialog([{s:'narr', t:'A red pillar box. Last collection 5:30 pm. Someone has polished the brass plate until it shines.'}]) },
  { id:'altar', x:82, y:81, label:'The broken altar', act: () => actAltar() },
  { id:'chest', x:86, y:88, label:'An old chest', act: () => actChest() },
  { id:'lure',  x:78, y:88, label:'Something shiny in the grass', when: () => F().lureQuest && !F().lureFound, sparkle:true, act: () => actLure() },
  { id:'wheel', x:68, y:63, label:'The water wheel', act: () => dialog([{s:'narr', t:'The old wheel turns slowly, creaking with every turn, the way it has for two hundred years.'}]) },
  { id:'lakebench', x:20, y:73, label:'A bench by the lake', act: () => dialog([{s:'noah', t:'(Willow Lake. Dad used to bring me fishing somewhere like this. I think. Or maybe I just wish he had.)'}]) },
  { id:'m_ticket', x:84, y:34, mem:'ticket', label:'Look under the bench' },
  { id:'m_stones', x:riverX(52)-2, y:52, mem:'stones', label:'Flat stones' },
  { id:'m_train',  x:58, y:11, mem:'train', label:'Something small and red' },
  { id:'m_coat',   x:16, y:46, mem:'coat', label:'Look at the scarecrow' },
  { id:'m_tree',   x:22, y:11, mem:'tree', label:'Marks on the bark' },
];
for (const o of objects){ reserve(o.x,o.y,0); if (o.mem) o.act = () => takeMemory(o.mem); }
genTrees();
