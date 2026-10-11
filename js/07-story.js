// The Letter — The story: every conversation in chapters one to three, cutscenes and chapter changes.
'use strict';

// ================= story: dialogue scripts =================
function setPhase(p){ if (F().phase>=p) return; F().phase=p; jumpTime(p); const lbl=PHASE_NAMES[p]; showZone(lbl, p===1?'The sun is going down':p===2?'The forest will be dark now':'Ashbourne after dark'); refreshHUD(); }

function talkWalt(){
  meet('walt');
  if (!F().walt){
    dialog([
      {s:'walt', t:'Last train back leaves at nine, if Ashbourne doesn’t suit you. Most folk it doesn’t.'},
      {choice:[
        {t:'I’m looking for a bookshop near the station.', then:[
          {s:'walt', t:'Hale’s place. Head west, over the bridge, into the square. Purple roof, can’t miss it.'},
          {s:'walt', t:'Old Edmund doesn’t sell many books. Mostly he sits there remembering things.'} ]},
        {t:'Did you ever know a man named Vale?', then:[
          () => { F().toldWalt=1; },
          {s:'walt', t:'…Vale.'},
          {s:'walt', t:'Haven’t heard that name said out loud in near twenty years. I’d keep it that way, if I were you.'},
          {s:'walt', t:'You want Hale’s bookshop. West, over the bridge, purple roof. He does more talking than me.'},
          {s:'noah', t:'(The letter said not to tell anyone why I came. Too late for Walt.)'} ]},
      ]},
      {s:'walt', t:'One more thing, lad. Take this.'},
      {s:'narr', t:'He hands you a heavy walking stick, worn smooth at the grip.'},
      {s:'walt', t:'Since the fire, things crawl up out of the ash at night. The Ashen, we call ’em. A good whack sends ’em back to dust — and they drop ember shards. Greta the blacksmith trades shards for proper weapons.'},
      {s:'walt', t:'Town and station are safe — they won’t follow you in. And they burn up at sunrise. Out in the fields after dark, though, you’re on your own.'},
      () => { F().walt=1; F().stick=1; toast('New item — open items (I)', 'Walking stick'); chime(); refreshHearts(); },
    ]);
  } else if (F().end){
    dialog([{s:'walt', t: F().toldWalt ? 'Someone was asking after you, lad. Didn’t give a name. Thought you should know.' : 'Dawn train’s at six. Platform’s quiet that early. Too quiet, some say.'}]);
  } else {
    const p=F().phase;
    dialog([{s:'walt', t: p===0 ? 'Bridge, square, purple roof. You’ll find it.' : p===1 ? 'Sun’s going. Ashbourne gets a different face after dark.' : 'You’re out late. Ashwood’s no place at night — the lights in there aren’t fireflies.'}]);
  }
}

function talkHale(){
  meet('hale');
  if (!F().hale1){
    dialog([
      {s:'hale', t:'We’re closing, young man. Come back tomorrow, or better yet, don’t.'},
      {s:'noah', t:'I got a letter. It says you’d know me.'},
      {s:'narr', t:'You hold out the letter. Hale reads it twice. His hands go very still.'},
      {s:'hale', t:'That’s Elias’s hand. Nobody else crosses their sevens like a railway signal.'},
      {s:'hale', t:'But anyone can copy a hand, and I’ve been fooled before. If you’re truly his son, you’ll know the word Elias carved into everything he built.'},
      {choice:[
        {t:'I was six when he left. I don’t know any word.', then:[ {s:'hale', t:'Then go find it. Elias and Tom Barrow built that east fence at Hollow Farm together — south road, past the old lane. Elias carved something into every post he made. You’ll know it when you see it.'} ]},
        {t:'Why should I have to prove anything to you?', then:[ {s:'hale', t:'A man came here two years ago claiming to be Elias’s son. He wasn’t. It cost someone dearly. East fence at Tom Barrow’s farm, south road. Go look.'} ]},
      ]},
      {s:'hale', t:'While you’re there — stop in the square and find Clara Wynn. She keeps the town’s old newspapers. You should know what happened to this town before you go digging in it.'},
      () => { F().hale1=1; addClue('hand'); },
      {s:'key', t:'Hale was Dad’s friend. Before he helps, I must prove I’m Elias’s son: find the word Dad carved into Tom Barrow’s fence, south of the road.'},
    ]);
  } else if (!F().key){
    if (has('carving')){
      dialog([
        {s:'hale', t:'You’re back. Tom’s fence, was it?'},
        {s:'noah', t:'E.V. plus T.B. The word was Lantern.'},
        ...haleKey(),
      ]);
    } else {
      dialog([{s:'hale', t: has('news') ? 'Good — Clara told you what this town believes. Now find the word carved into Tom Barrow’s east fence. That’s the truth your father left behind.' : 'The east fence at Tom Barrow’s farm, south of the road. Go look at the posts. Then come back.'}]);
    }
  } else if (!F().lantern){
    dialog([{s:'hale', t:'Hollow Farm, south of the road, west of here. Tom Barrow. Ask him about 2006 — and watch his hands when you do.'}]);
  } else if (!F().end){
    dialog([{s:'hale', t:'You have the lantern. Then go. The trail starts north of the road, where the forest comes down to meet it.'}]);
  } else {
    dialog([{s:'hale', t:'“Where the trains used to sleep.” The old engine shed. It burned the same summer, you know. Strange, that.'}]);
  }
}
function haleKey(){
  return [
    {s:'narr', t:'Hale sits down slowly, as if his knees have just remembered how old they are.'},
    {s:'hale', t:'Lantern. He said that’s what a good engineer should be. A small light somebody else can carry.'},
    {s:'hale', t:'Whatever this town told you, your father didn’t run, Noah. He was pushed out. There’s a difference.'},
    {s:'narr', t:'He opens a drawer and places a small brass key on the counter between you.'},
    {s:'hale', t:'His workshop is beyond Ashwood forest. He left this with me twenty years ago. He said: if my son ever comes, and he knows the word, give it to him. Not before.'},
    {s:'noah', t:'He planned this. He always meant for me to come here.'},
    {s:'hale', t:'The forest trail is dark even in the afternoon. You’ll need a light. Tom Barrow kept your father’s old lantern — he won’t mention it, but ask him directly. Tell him Lantern. He’ll understand.'},
    {choice:[
      {t:'Why did Tom keep the lantern all this time?', then:[ {s:'hale', t:'Guilt, mostly. Tom signed a false witness statement against Elias after the fire. Someone frightened him into it. He’s carried that ever since.'} ]},
      {t:'Why didn’t you just tell me all this when I first walked in?', then:[ {s:'hale', t:'Because a man came in two years ago with the same story — said he was Elias’s son. He wasn’t. He was looking for the workshop. I told him nothing, but he found out I had the key. I can’t make that mistake again.'} ]},
    ]},
    () => { F().key=1; addClue('key'); setPhase(1); },
    {s:'key', t:'Hale believes Dad didn’t run — he was forced out. Dad’s workshop is hidden in the forest. To get through the dark, I need Dad’s old lantern from Tom.'},
  ];
}

function talkClara(){
  meet('clara');
  if (!F().news){
    dialog([
      {s:'clara', t:'You’re not from here. Nobody from here looks at the church like it might bite.'},
      {choice:[
        {t:'I’m trying to learn about Elias Vale.', then:[ {s:'clara', t:'Vale. The engineer. Now there’s a name that clears a room.'} ]},
        {t:'Hale said you keep the town’s memory.', then:[ {s:'clara', t:'Edmund is too kind. I keep the town’s paperwork. Memory is what people do to paperwork.'}, {s:'noah', t:'Then — Elias Vale. Does your paperwork remember him?'} ]},
      ]},
      {s:'narr', t:'She unfolds a yellowed newspaper clipping from her satchel — like she always carries it, just in case.'},
      {s:'clara', t:'Ashbourne Gazette, June 2006. The old railway office burned down in the night. Mara Voss, the railway clerk, died inside.'},
      {s:'clara', t:'Elias Vale — signal engineer, your father — went missing. The paper says he was “sought for questioning.” He never came back to answer.'},
      {s:'noah', t:'So this whole town thinks my father killed someone and ran.'},
      {s:'clara', t:'Some do. Others still carve his initials into their fences for good luck. This town made up its mind and then kept arguing about it for twenty years.'},
      {s:'clara', t:'Mara worked with your father every day. If he had a reason to be here, she’s part of it. Her grave is behind the church. And Tom Barrow at Hollow Farm — he and your father were close. Your father helped build that fence.'},
      () => { F().news=1; addClue('news'); },
      {s:'key', t:'In 2006 the railway office burned and Mara Voss died. Dad disappeared that same night — so the whole town blamed him.'},
      () => { if (F().hale1 && !has('carving')) D.queue.unshift({s:'clara', t:'If Hale needs proof — check the east fence at Tom’s farm. Your father carved things into everything he built.'}); },
      {s:'clara', t:'If you find anything about Mara — anything at all — come and tell me. She deserves someone still looking.'},
    ]);
  } else {
    const l=[];
    if (F().hale1 && !has('carving')) l.push({s:'clara', t:'The fence post at Hollow Farm, east side, by the big oak. South of the road, past the old lane.'});
    else if (has('grave') && !F().silas) l.push({s:'clara', t:'Mara’s brother Silas still lives out in Ashwood. He walks the trail at night. Be careful around him.'});
    else if (F().end) l.push({s:'clara', t:'The engine shed? It burned the same week as the office. The records from that month are… missing. All of them.'});
    else l.push({s:'clara', t:'Mara’s grave is behind the church, east of the steeple. Someone leaves flowers. It isn’t me.'});
    dialog(l);
  }
}

function talkTom(){
  meet('tom');
  if (!F().key){
    const l=[{s:'tom', t:'Farm’s private. If you’re selling something, I’m not buying.'}];
    if (has('carving')){ l.push(
      {s:'noah', t:'You and my father carved your initials into that fence post. E.V. and T.B. — and the word Lantern.'},
      {s:'narr', t:'Tom goes very still. He looks at the fence, then at Noah, then at the road — anywhere but back.'},
      {s:'tom', t:'You’re Elias’s boy. I can see it now.'},
      {s:'tom', t:'Go back to Hale. Tell him the word. He’ll explain more than I’m able to right now.'}
    ); }
    else l.push(
      {s:'tom', t:'Not interested in visitors. Check the fence if you like — it’s old.'},
      {s:'noah', t:'(There’s something on that east fence post. I should look more carefully.)'}
    );
    dialog(l);
  } else if (!F().lantern){
    dialog([
      {s:'tom', t:'Hale sent you. I can see it on you. He’s got that look he gives people — like they owe him a story.'},
      {choice:[
        {t:'Tell me about the summer of 2006.', then:[
          {s:'tom', t:'I told the police what I saw. That’s all there is.'},
          {s:'noah', t:'What did you see?'},
          {s:'tom', t:'Enough. Go home, son.'},
          {choice:[ {t:'“E.V. plus T.B. — Lantern.” You were his friend.', then: () => tomConfess()} ]},
        ]},
        {t:'“E.V. plus T.B. — Lantern.” You were his friend.', then: () => tomConfess()},
      ]},
    ]);
  } else {
    dialog([{s:'tom', t: F().end ? 'You found it, then. Whatever he left you. I hope it was worth twenty years.' : 'Trail forks past the big stump. Keep left. Your father always kept left.'}]);
  }
}
function tomConfess(){
  return [
    {s:'narr', t:'A long silence. A crow complains somewhere in the field.'},
    {s:'tom', t:'Lantern. God. He told you the word.'},
    {s:'tom', t:'We built half this farm together. He was the closest thing to a brother I ever had.'},
    {s:'tom', t:'The night the office burned — two men in suits came to my door before dawn. Railway company men. They told me what I’d witnessed. Told me word for word what my statement would say.'},
    {s:'tom', t:'I signed it. Said I saw Elias leave the building before the smoke. I saw nothing. I was in bed. They knew about the farm debts — I was scared, and I let them use that. I was a coward.'},
    {s:'tom', t:'Elias never wrote to me. Never blamed me. That’s the worst part.'},
    {choice:[
      {t:'Tell him about the letter', then:[
        () => { F().toldTom=1; },
        {s:'noah', t:'He wrote to me. Three days ago.'},
        {s:'tom', t:'…He’s alive.'},
        {s:'tom', t:'Then God help whoever lit that fire. And Noah — don’t you show that letter to Silas Voss.'} ]},
      {t:'Keep the letter secret', then:[
        {s:'noah', t:'I just need the lantern, Tom.'},
        {s:'tom', t:'Aye. Smart lad. Don’t trust what this town tells you. Me included.'} ]},
    ]},
    {s:'narr', t:'He goes inside and comes back with a dented brass lantern. He lights it for you with hands that won’t quite stop shaking.'},
    {s:'tom', t:'Ashwood trail starts north of the road, west of the village. Keep left. He always kept left.'},
    {s:'tom', t:'And Noah — the Ashen hate this light. Swing it at ’em and they burn twice as fast. Your father learned that the hard way.'},
    () => { F().lantern=1; addClue('lantern'); setPhase(2); },
    {s:'key', t:'Tom lied to the police. Railway men scared him into saying he saw Dad leave the fire. So Dad was framed! Now follow the forest trail to his workshop.'},
  ];
}

function talkSilas(){
  meet('silas');
  dialog([
    {s:'silas', t:'That lantern. I’d know it anywhere. I used to watch it bob along this path every night.'},
    {s:'noah', t:'Who are you?'},
    {s:'silas', t:'Silas Voss. My sister was Mara — the woman who died in the railway office fire. The fire your father was blamed for.'},
    {s:'noah', t:'Voss. Clara mentioned her. The clerk who died — that was your sister.'},
    {choice:[
      {t:'My father didn’t run. He was framed for it.', then:[
        {s:'silas', t:'That’s what Hale says. Hale says a lot of things from behind a counter.'},
        {s:'silas', t:'If Elias is really out there alive, he owes me an answer. Not you. Him.'} ]},
      {t:'I’m sorry about your sister.', then:[
        () => { F().kindSilas=1; },
        {s:'narr', t:'Something in his shoulders gives way, just slightly.'},
        {s:'silas', t:'Nobody in this town says her name anymore. Twenty years and she might as well be a rumour.'},
        {s:'silas', t:'She had a pocket watch. Wore it every single day. It was never found in the ashes. I always thought that was strange.'} ]},
      {t:'Get out of my way.', then:[
        {s:'silas', t:'Brave, with his lantern. Your father was brave too, right up until he wasn’t.'} ]},
    ]},
    {s:'silas', t:'Go on then. See what he left you. But if it explains anything about that night — you bring it to me. That’s not a request.'},
    () => { F().silas=1; F().silasGone=1; addClue('silas'); },
    {s:'key', t:'Silas is Mara’s brother. He still believes Dad let his sister die. Keep going to the workshop.'},
  ]);
}

function talkJune(){
  meet('june');
  if (cat.follow && !F().catHome){
    dialog([
      {s:'june', t:'Biscuit! You wicked, wonderful thing. Where did he find you?'},
      {s:'noah', t:'Across the river, judging the ducks.'},
      {s:'june', t:'I owe you. Here — this was pinned behind my counter for years. A postcard. I think it’s your father’s writing.'},
      {s:'narr', t:'Postmarked 2009, Harlow Cross. Four words: “Still keeping left. — E.”'},
      {s:'noah', t:'2009. The same year as the train photo. He was close. He was writing to people here.'},
      () => { F().catHome=1; cat.follow=false; cat.x=40*T; cat.y=25*T; cat.tx=cat.x; cat.ty=cat.y; addClue('postcard'); },
    ]);
    return;
  }
  if (!F().june){
    dialog([
      {s:'june', t:'Tea’s on the house for strangers. That’s the rule. Second cup, you pay.'},
      {choice:[
        {t:'Heard any good gossip?', then:[ {s:'june', t:'Lights in Ashwood at night. Pip swears it’s a ghost. I say it’s Silas Voss being Silas.'} ]},
        {t:'Did you know Elias Vale?', then:[ {s:'june', t:'Everyone knew Elias. He fixed my oven for a slice of pie. Then one morning he was gone and everyone pretended they never liked pie.'} ]},
      ]},
      {s:'june', t:'Oh — if you see a ginger cat with a bent ear, that’s Biscuit. She’s wandered off across the river again. Bring her home and I’ll make it worth your while.'},
      () => { F().june=1; },
    ]);
  } else {
    dialog([{s:'june', t: F().catHome ? 'Biscuit hasn’t left the windowsill since. Thank you, love.' : F().phase===2 ? 'Still no Biscuit. She likes the meadow east of the river, near the station.' : 'Biscuit likes the meadow across the bridge. South of the road, near the water.'}]);
  }
}

function talkPip(){
  meet('pip');
  if (F().phase<2) dialog([
    {s:'pip', t:'Shh, you’ll scare the fish. Not that there’s any fish.'},
    {s:'pip', t:'Are you here about the ghost? There’s a light that moves in Ashwood at night. Always heading toward the old workshop.'},
    {choice:[
      {t:'Have you ever followed it?', then:[ {s:'pip', t:'No way. Mum says the woods eat people. Well — she says people get lost. Same thing.'} ]},
      {t:'There’s no such thing as ghosts.', then:[ {s:'pip', t:'That’s exactly what a ghost would say.'} ]},
    ]},
  ]);
  else dialog([{s:'pip', t:'I’m not s’posed to be out. Don’t tell my mum. Look — the workshop windows! Someone lit a fire in there.'}]);
}

function actCarving(){
  if (has('carving')){ dialog([{s:'noah', t:'E.V. + T.B. — LANTERN. Dad and Tom, when they were young.'}]); return; }
  dialog([
    {s:'narr', t:'Carved deep into the post, worn smooth by twenty winters:'},
    {s:'narr', t:'E.V. + T.B. — LANTERN'},
    {s:'noah', t:'E.V. — Elias Vale. And T.B.… Tom Barrow. This is his farm. They were friends.'},
    () => { addClue('carving'); },
    {s:'key', t:'The secret word is LANTERN. Dad (E.V.) and Tom Barrow (T.B.) were best friends. Now tell Hale the word.'},
    () => { if (F().hale1) D.queue.unshift({s:'noah', t:'Lantern. That has to be the word Hale wants.'}); },
  ]);
}
function actGrave(){
  if (has('grave')){ dialog([{s:'narr', t:'MARA VOSS · 1974–2006 · “Lost to the fire, never to the town.”'}]); return; }
  dialog([
    {s:'narr', t:'MARA VOSS · 1974–2006 · “Lost to the fire, never to the town.”'},
    {s:'narr', t:'Fresh wildflowers lie at the base of the stone, tied with railway twine.'},
    {s:'noah', t:'The woman in the train photograph. That’s her. Dad knew her.'},
    {s:'noah', t:'And somebody still visits.'},
    () => addClue('grave'),
  ]);
}
function actWatch(){
  dialog([
    {s:'narr', t:'A pocket watch, half-buried in the forest moss. Stopped at 2:14.'},
    {s:'narr', t:'Engraved on the back: “E — keep time for me. M.”'},
    {s:'noah', t:'M. That’s Mara. She gave this to Dad.'},
    {s:'noah', t:'But Silas said her watch was never found in the ashes. Because it was never in that building.'},
    {s:'noah', t:'She gave it to Dad before she died. She knew something was going to happen that night.'},
    () => { F().watch=1; addClue('watch'); },
  ]);
}
function actDoor(){
  if (F().key && F().lantern && !F().wsDone && !F().end){ dialog([{s:'noah', t:'(Not with those things circling. I have to deal with the Ashen first.)'}]); return; }
  if (!F().key){ dialog([{s:'noah', t:'Locked. The lock is new — newer than the door.'}]); return; }
  if (F().wsOpened || F().end){ enterScene('workshop'); return; }
  dialog([{s:'noah', t:'The key fits. It turns like it’s been oiled recently.'}], () => { F().wsOpened=1; enterScene('workshop'); });
}

// ================= story: new characters =================
function talkRosa(){
  meet('rosa');
  const c=chap(), f=F();
  if (c===3 && f.wp && !f.letters){
    dialog([
      {s:'rosa', t:'Walter Pryce? Walt from the station? Oh, he’s my most regular customer.'},
      {s:'rosa', t:'One letter, first Monday of every month, for twenty years. Always the same address.'},
      {s:'noah', t:'Which address?'},
      {s:'rosa', t:'Ashcombe Holdings, Harlow Cross. I always thought he had a sweetheart in the office there.'},
      {s:'noah', t:'(Harlow Cross. Walt has been reporting to Ashcombe this whole time.)'},
      () => { f.letters=1; addClue('letters'); },
    ]); return;
  }
  if (c===3) { dialog([{s:'rosa', t: f.confess ? 'Walt rang the police from my counter. Hands shaking so badly I had to dial for him.' : 'Clara’s records will tell you who “W.P.” is. My postmarks might tell you who he writes to.'}]); return; }
  if (c===2) { dialog([{s:'rosa', t: has('postcard') ? 'Harlow Cross — that postmark on your father’s card. Funny. Ashcombe Holdings has its office in Harlow Cross too.' : 'Up at dawn, are we? Mr. Ashcombe was in at six sending a telegram. He never sends telegrams.'}]); return; }
  if (!f.rosa1){
    dialog([
      {s:'rosa', t:'Rosa Marsh, post office. If you need a stamp, a parcel, or the name of everyone who’s written to anyone in Ashbourne — I’m your woman.'},
      {choice:[
        {t:'Has anyone named Vale ever sent post here?', then:[ {s:'rosa', t:'Vale… there were postcards, years back. No return address. June at the café might still have one pinned up.'} ]},
        {t:'Where would I find the bookseller?', then:[ {s:'rosa', t:'Edmund Hale? West, in the square. Purple roof. He’ll pretend he’s closed. He isn’t.'} ]},
      ]},
      () => { f.rosa1=1; },
    ]);
  } else dialog([{s:'rosa', t:'Postmarks don’t lie, love. People do. Postmarks just sit there being right.'}]);
}

function talkBennet(){
  meet('bennet');
  const c=chap(), f=F();
  if (c===3) { dialog([{s:'bennet', t: f.confess ? 'Confession is the easy part, Noah. It’s the living with it afterwards that takes courage. Pray Walt finds some.' : 'Whatever you’re carrying tonight, son, set it down before it sets you down.'}]); return; }
  if (c===2) { dialog([{s:'bennet', t: f.ash1 && !f.culvertKnown ? 'Silas Voss is at Mara’s grave — he comes every sunrise. If anyone knows a way into that shed, it’s him. He’s spent twenty years looking.' : 'Morning, Noah. The graves are quiet at dawn. The living less so.'}]); return; }
  if (!f.bennet1){
    dialog([
      {s:'bennet', t:'Welcome to St. Aldric’s. I’m Reverend Bennet. You have a face I feel I should know.'},
      {s:'noah', t:'People keep saying that. My father was Elias Vale.'},
      {s:'bennet', t:'Ah. Then you’ll want to see Mara Voss’s grave, behind the church, before anyone tells you their version of it.'},
      {s:'bennet', t:'I buried her in 2006. Every week since, someone leaves wildflowers tied with railway twine. I’ve never once seen who.'},
      () => { f.bennet1=1; },
    ]);
  } else dialog([{s:'bennet', t:'Mara’s grave is behind the church, to the east. Mind the toy train by the far stones — someone left it years ago.'}]);
}

// ================= Chapter Two: The Ledger =================
function actWait(){
  dialog([
    {s:'narr', t:'You sit on the cold bench. The sky turns from grey to pink. The six o’clock train comes and goes.'},
    {s:'narr', t:'Nobody gets off.'},
    {s:'noah', t:'(Half past six. Seven. He isn’t coming.)'},
    {s:'narr', t:'Footsteps on the platform. Walt, the railway worker, holding a folded scrap of paper.'},
    {s:'walt', t:'Man in a grey coat came by before sunrise. Asked me to give you this. Didn’t leave a name.'},
    {s:'walt', t:'Didn’t need to. I’d know that walk anywhere, even after twenty years.'},
    {choice:[
      {t:'You saw him? Where did he go?', then:[ {s:'walt', t:'North, along the tracks. Then gone. Like he always was.'} ]},
      {t:'Why didn’t he wait for me?', then:[ {s:'walt', t:'Looked over his shoulder the whole time, lad. Like someone was watching the platform.'} ]},
    ]},
    {s:'narr', t:'The note, in the same handwriting as the letter:'},
    {s:'narr', t:'“They’re watching the platform. I couldn’t risk it. Get the ledger first — the old engine shed, north along the tracks. It’s under the inspection pit. Then I’ll find you. — E”'},
    () => { meet('walt'); F().note=1; addClue('note'); },
    {s:'key', t:'Dad is alive and close by — but someone is watching the station. He wants me to get Mara’s ledger from the old engine shed first.'},
    {s:'noah', t:'(The engine shed. North of the station, following the railway line.)'},
  ]);
}
function talkWalt2(){
  meet('walt');
  const f=F(), c=chap();
  if (c===2){
    if (!f.note){ dialog([{s:'walt', t:'Early for a train, lad. Unless you’re waiting for someone.'}, {s:'noah', t:'(I should sit on the bench and wait, like Dad asked.)'}]); return; }
    dialog([{s:'walt', t: f.ch2end ? 'You look like you’ve seen a ghost. Or a ledger.' : 'Shed’s north along the tracks. Ashcombe’s men keep the gate chained. Mind yourself.'}]); return;
  }
  // Chapter Three
  if (!f.wp){ dialog([{s:'walt', t:'Evening, lad. Quiet day? You look like you didn’t sleep.'}, {s:'noah', t:'(“Ask your friends at the station,” Ashcombe said. I need to know who W.P. is before I say anything. Clara has the old records.)'}]); return; }
  if (f.confess){ dialog([{s:'walt', t:'Go on. He’s waiting.'}]); return; }
  dialog([
    {s:'walt', t:'You’ve got that look again. Your father’s look. Like the world owes you an explanation.'},
    {s:'noah', t:'W.P. Walter Pryce. Signal keeper, 2006. Paid twenty-seven thousand pounds by Ashcombe Holdings to “clear the office records.”'},
    {s:'narr', t:'For a long moment Walt says nothing. Then he sits down on the bench, very slowly, like a much older man.'},
    {s:'walt', t:'They told me the office would be empty. Burn the files, take the money, nobody hurt. Mara was meant to be on the evening train.'},
    {s:'walt', t:'She came back for her copy of the books. I didn’t know she was in there. I swear on my life I didn’t know, not until the roof came down.'},
    {s:'walt', t:'Then Ashcombe’s men put it all on Elias. And I let them. I stood on this platform for twenty years watching that track, like he’d come back down it.'},
    {s:'walt', t:'This morning he did. And I wrote to Ashcombe and told him. Like I always do.'},
    {s:'noah', t:'You told them Dad was here.'},
    {s:'walt', t:'He’s at the end of the platform now. Told me to tell you that too. I’m tired of being the man who passes notes.'},
    {choice:[
      {t:'You’re going to tell the police everything. Tonight.', then:[ () => { F().waltChoice='police'; }, {s:'walt', t:'Aye. I’ll ring them myself. Should have done it before the ashes were cold.'} ]},
      {t:'Tell Silas. He deserves to hear it from you.', then:[ () => { F().waltChoice='silas'; }, {s:'walt', t:'…God help me. All right. Then the police. In that order.'} ]},
      {t:'I don’t know what to do with you, Walt.', then:[ () => { F().waltChoice='unsure'; }, {s:'walt', t:'Neither do I, lad. Neither do I. I’ll start with the truth and see where it gets me.'} ]},
    ]},
    () => { f.confess=1; addClue('confession'); },
    {s:'key', t:'Walt started the fire, paid by Ashcombe to destroy the records. He didn’t know Mara was inside. Dad was innocent all along.'},
    {s:'noah', t:'(The end of the platform. He’s here.)'},
  ]);
}
function actGate(){
  if (chap()===2 && !F().ash1){ dialog([{s:'narr', t:'A tall iron gate, chained and padlocked. The chain is new. Beyond it: the burned shell of the old engine shed.'}, {s:'noah', t:'(There’s a man in a good suit standing by the gate. Maybe I should talk to him.)'}]); return; }
  dialog([{s:'narr', t:'Chained shut. Through the bars you can see the shed’s black, broken roof.'}, {s:'noah', t: F().culvertKnown ? '(Silas said there’s a culvert under the west fence, by the river.)' : '(There has to be another way into that yard. Someone in town might know.)'}]);
}
function talkAshcombe(){
  meet('ashcombe');
  const f=F();
  if (!f.ash1){
    dialog([
      {s:'ashcombe', t:'An early riser. Admirable. You’re standing on private land, though.'},
      {s:'noah', t:'Is this the old engine shed?'},
      {s:'ashcombe', t:'It was. Now it’s mine. Ashcombe Holdings bought the whole branch line in 2007 — after the fire, the railway couldn’t sell it fast enough.'},
      {s:'ashcombe', t:'Victor Ashcombe. And you’re Elias Vale’s boy. You have his habit of staring at things you shouldn’t.'},
      {choice:[
        {t:'I’m just looking around.', then:[ {s:'ashcombe', t:'Then look around somewhere else. That shed is unsafe. Burned roof, rotten floor. People get hurt.'} ]},
        {t:'What do you know about my father?', then:[ {s:'ashcombe', t:'I know he cost this town a great deal. And I know men who dig in old ashes usually find something they wish they hadn’t.'} ]},
        {t:'Why would a property company want a burned shed?', then:[ {s:'ashcombe', t:'Land, Mr. Vale. Ashbourne will grow one day, and I like to be early. As you can see.'} ]},
      ]},
      {s:'ashcombe', t:'The gate stays locked. Good morning.'},
      () => { f.ash1=1; addClue('ashcombe'); },
      {s:'key', t:'Victor Ashcombe bought the railway land right after the fire. He owns the shed, keeps it locked — and he already knows who I am. Suspicious.'},
      {s:'noah', t:'(How did he know who I am? There has to be another way into that yard. Someone in town might know one.)'},
    ]);
  } else dialog([{s:'ashcombe', t:'Still here? The gate is still locked, Mr. Vale. It will be locked tomorrow, too.'}]);
}
function talkSilas2(){
  meet('silas');
  const f=F();
  if (chap()===3){ dialog([{s:'silas', t: f.confess && f.waltChoice==='silas' ? 'Walt came to me. Told me everything. I don’t know what I feel yet. But it isn’t hate for your father anymore.' : 'Twenty years of flowers. Maybe now someone will tell her what really happened.'}]); return; }
  if (f.culvertKnown){ dialog([{s:'silas', t:'West fence of the shed yard, by the river. The grate’s only tied with wire. Go.'}]); return; }
  dialog([
    {s:'narr', t:'Silas kneels at Mara’s grave, tying fresh wildflowers with a length of railway twine.'},
    {s:'silas', t:'So it’s you who’s been asking. I’m the one who leaves the flowers. Every week, twenty years.'},
    {s:'silas', t:'He didn’t come, did he? Elias. I saw you on that bench from the hill.'},
    ...(f.ash1 ? [{s:'noah', t:'He left a note. He wants me to get into the old engine shed. Ashcombe has it chained shut.'}] : [{s:'noah', t:'He left a note. He wants me to get into the old engine shed, north of the station.'}]),
    {s:'silas', t:'Then we want the same thing. I’ve been trying to get into that shed since the fire. Ashcombe guards it like a dog with a bone.'},
    {s:'silas', t:'There’s a storm culvert under the west fence, down by the river. I cut the grate years ago and tied it back with wire. Never had the nerve to crawl through.'},
    {choice:[
      {t:'Mara gave Dad her watch. I found it — it should be yours.', when: () => has('watch'), then:[
        () => { F().gaveWatch=1; },
        {s:'narr', t:'You hold out the watch. Silas takes it like it might break. His thumb finds the engraving.'},
        {s:'silas', t:'…“Keep time for me.” She always did. Even for him.'},
        {s:'silas', t:'Thank you, Noah. Go. Whatever’s in there, she wanted it found.'} ]},
      {t:'Why help me, if you blame my father?', then:[
        {s:'silas', t:'Because if the truth is in that shed, I want it more than you do.'},
        ...(f.kindSilas ? [{s:'silas', t:'And because you said her name, that night in the woods. Nobody else had in years.'}] : [{s:'silas', t:'And whatever you find, I see it next. That’s the price.'}]) ]},
    ]},
    () => { f.culvertKnown=1; },
    {s:'key', t:'Silas showed me a secret way into the shed yard: a rusty grate under the west fence, by the river.'},
    {s:'noah', t:'(A rusty grate under the west fence of the shed yard, by the river. Let’s go.)'},
  ]);
}
function actGrate(){
  if (!F().culvertKnown){ dialog([{s:'narr', t:'A rusted iron grate under the fence, tied shut with fresh-looking wire. Behind it, a dark culvert leads into the shed yard.'}, {s:'noah', t:'(Somebody tied this shut on purpose. I wonder who.)'}]); return; }
  dialog([
    {s:'narr', t:'You unwind the wire. It takes a while — Silas tied it like a man who didn’t trust himself.'},
    {s:'narr', t:'The grate swings open with a shriek of rust. The way into the shed yard is clear.'},
    () => { F().culvert=1; applyWorldState(); },
  ]);
}
const LEDGER = `BRANCH LINE ACCOUNTS — 2006
(copied by M. Voss)

March    Land valuation changed:
         £410,000 → £38,000
         Signed: H. Crane, Manager

April    Ashcombe Holdings → “signal
         maintenance”: £12,000.  Rec’d: W.P.

May      Ashcombe Holdings: £15,000.
         Rec’d: W.P.

12 June  Office records to be “cleared”
         before the audit. W.P. to see to it.

In the margin, in Mara’s hand:
“Told E. tonight. W.P. knows I have
a copy. Keeping it where the trains sleep.”`;
function actPit(){
  if (has('ledger')){ dialog([{s:'noah', t:'(The pit is empty now. The ledger is in my bag.)'}]); return; }
  dialog([
    {s:'narr', t:'Inside, the engine shed is a ruin: black beams, a roof full of sky, the smell of very old smoke.'},
    {s:'narr', t:'The inspection pit runs down the middle of the floor. At the bottom, under a loose plank, something wrapped in oilcloth.'},
  ], () => cutscene([{paper:true, t:LEDGER}], () => {
    addClue('ledger');
    dialog([
      {s:'key', t:'Mara’s ledger proves it: the railway land was sold to Ashcombe for a fraction of its value, and Ashcombe paid someone called “W.P.” to destroy the records two days before the fire.'},
      {s:'noah', t:'(W.P. Somebody was paid to “clear the records” two days before the fire. Not Dad. Someone called W.P.)'},
      {s:'narr', t:'A torch beam swings across the yard. Footsteps on gravel.'},
      {s:'ashcombe', t:'I did warn you about the floor, Mr. Vale.'},
      {s:'ashcombe', t:'That book is twenty years of nothing. A dead clerk’s scribbles. But I’m a generous man. Give it to me, take the nine o’clock train, and forget Ashbourne.'},
      {choice:[
        {t:'This proves what you did.', then:[ {s:'ashcombe', t:'It proves numbers were written down. Numbers can mean anything, in the right lawyer’s hands.'} ]},
        {t:'Who is W.P.?', then:[ {s:'ashcombe', t:'You’re the detective.'}, {s:'narr', t:'He smiles, very slightly.'}, {s:'ashcombe', t:'Try asking your friends at the station.'} ]},
        {t:'(Say nothing. Hold the ledger tighter.)', then:[ {s:'ashcombe', t:'Your father had that same silence. It didn’t help him either.'} ]},
      ]},
      {s:'ashcombe', t:'Keep it, then. I’ve survived worse than a notebook. Your father learned that the hard way.'},
      {s:'narr', t:'He walks away without hurrying. That frightens you more than if he’d run.'},
      () => { F().ch2end=1; save(); },
    ], () => setTimeout(() => showEnding(2), 400));
  }));
}

// chapter-two / three lines for existing characters
function talkHale2(){ meet('hale'); const f=F(), c=chap();
  if (c===2) dialog([{s:'hale', t: f.ash1 && !f.culvertKnown ? 'Ashcombe turned you away? Then talk to Silas Voss. He’s spent twenty years trying to get into that shed. He’s at Mara’s grave at sunrise — behind the church.' : f.ch2end ? 'You found her ledger. Mara would have liked you.' : 'The engine shed is north of the station, along the tracks. Ashcombe owns it now. Of course he does.'}]);
  else dialog([{s:'hale', t: f.confess ? 'Walt. I sold that man a newspaper every morning for twenty years.' : 'W.P.? Clara has the old railway staff lists. Start there.'}]);
}
function talkClara2(){ meet('clara'); const f=F(), c=chap();
  if (c===2){ dialog([{s:'clara', t: f.ash1 && !f.culvertKnown ? 'Locked out by Ashcombe? Silas Voss knows that yard better than anyone. Try Mara’s grave — he’s there every dawn.' : 'The engine shed burned the same week as the office. And every railway record from that month went missing. Every single one.'}]); return; }
  if (!f.wp){
    dialog([
      {s:'noah', t:'Clara — the ledger mentions someone called “W.P.” who was paid by Ashcombe. Do your records go back to 2006?'},
      {s:'clara', t:'Railway staff lists? I have every one since 1952. Give me a moment.'},
      {s:'narr', t:'She runs a finger down a brittle typed page, then stops.'},
      {s:'clara', t:'Signal box, 2006. Keeper: Walter Pryce.'},
      {s:'noah', t:'Walt. Walt from the station. The first person I spoke to in Ashbourne.'},
      {s:'clara', t:'After the fire, the railway let every other worker go. But they kept Walt on. Alone, at a station nobody uses. I always wondered who was paying for that.'},
      () => { f.wp=1; addClue('staff'); setPhase(6); },
      {s:'key', t:'W.P. is Walter Pryce — Walt, the friendly railway worker who greeted me at the station on day one!'},
      {s:'noah', t:'(It’s getting dark. I need to talk to Walt at the station. Rosa at the post office might know something too.)'},
    ]); return;
  }
  dialog([{s:'clara', t: f.confess ? 'I’m going to write it all down, Noah. Properly, this time. Mara deserves an accurate record.' : 'Be careful with Walt. Frightened men do frightened things.'}]);
}
function talkTom2(){ meet('tom'); const c=chap(), f=F();
  dialog([{s:'tom', t: c===2 ? 'Engine shed’s Ashcombe’s now. Don’t let him catch you near it, lad. He’s got a way of making men sign things.' : f.confess ? 'When they ask, I’ll stand up in front of the whole town and say what I didn’t see. Should have done it twenty years ago.' : 'Whatever you find, lad — I’ll back you. This time I will.'}]);
}
function talkJune2(){ meet('june'); const c=chap(), f=F();
  if (cat.follow && !f.catHome) return talkJune();
  dialog([{s:'june', t: c===2 ? 'Up at dawn? Tea’s still free. Mr. Ashcombe came in at five for a coffee. He never comes in. Something’s got him rattled.' : f.confess ? 'They say Walt’s confessed to something. In all my years I never once saw that man eat a slice of pie.' : 'Walt hasn’t come in for his supper tonight. First time in twenty years.'}]);
}
function talkPip2(){ meet('pip'); const c=chap();
  dialog([{s:'pip', t: c===2 ? 'I saw him! The ghost! A man in a grey coat walking the tracks at sunrise. He had a lantern just like yours!' : 'Mum says I can stay up and watch the night train. Is the ghost going to be on the platform? I bet he is.'}]);
}

// ================= Chapter Three finale =================
function talkElias(){
  meet('elias');
  const f=F();
  if (f.gameEnd){ dialog([{s:'elias', t:'Keep left, Noah. It always gets you home in the end.'}]); return; }
  dialog([
    {s:'narr', t:'At the very end of the platform, a man in a grey coat lifts a dented brass lantern. It’s the twin of yours.'},
    {s:'elias', t:'Noah.'},
    {s:'narr', t:'Twenty years of words you’ve practised. None of them come.'},
    {choice:[
      {t:'Why didn’t you come back?', then:[ {s:'elias', t:'Because they told me what would happen to you if I did. And every year I stayed away, it got harder to imagine you’d want me to.'} ]},
      {t:'You’re smaller than I remember.', then:[ {s:'elias', t:'You were six. Everyone was taller then. Except me — I was a coward of exactly average height.'} ]},
      {t:'Do you know what it was like, growing up without you?', then:[ {s:'elias', t:'No. And I won’t pretend I do. That’s yours, and I took it from you.'} ]},
    ]},
    {s:'noah', t:'I found Mara’s ledger. Walt confessed. It was never you.'},
    {s:'elias', t:'I know. I watched from the trees all day. Hale, Tom, Silas — you did in three days what I couldn’t do in twenty years.'},
    ...(f.gaveWatch ? [{s:'elias', t:'You gave Mara’s watch to Silas. Good. It was never really mine to keep.'}] : []),
    ...(f.toldWalt ? [{s:'elias', t:'You told Walt my name on your first day, didn’t you? He’s been writing to Ashcombe ever since. Don’t carry that. I trusted him too.'}] : []),
    {s:'elias', t:'I won’t ask you to forgive me. I don’t think I would, in your place.'},
    {choice:[
      {t:'Come home, Dad.', then:[ () => { F().ending='home'; }, {s:'narr', t:'He tries to answer. Instead he just nods, again and again, like a man who has forgotten how to stop.'} ]},
      {t:'I need time. But don’t you dare disappear again.', then:[ () => { F().ending='time'; }, {s:'elias', t:'Never again. You have my word — and this time, you know where to find me.'} ]},
      {t:'Tell me everything. From the very beginning.', then:[ () => { F().ending='story'; }, {s:'elias', t:'Then we’ll need a pot of tea. June’s café opens at seven.'} ]},
    ]},
    () => { f.gameEnd=1; addClue('reunion'); save(); },
  ], () => { F().ch3end=1; save(); setTimeout(() => showEnding(3), 300); });
}
function runFinale(){
  const f=F(), pages=[];
  pages.push({html:true, t: f.ending==='home' ? 'You walk him home along the dark road, two lanterns side by side. *Neither of you says much. Neither of you needs to.*'
    : f.ending==='time' ? 'You shake his hand on the platform, which is strange, and right. *Next week, you’ll write to him. He’ll write back.*'
    : 'At seven, June unlocks the café to find two men already waiting at the door. *They stay until closing.*'});
  pages.push({html:true, t: f.waltChoice==='police' ? 'Walt Pryce rang the county police that night and told them everything. *He pleaded guilty to every charge.*'
    : f.waltChoice==='silas' ? 'Walt went to Silas first, and then to the police. *Silas walked into the station beside him.*'
    : 'Walt sat on the bench until morning. *Then he caught the first train to the county police station, and told them everything.*'});
  pages.push({html:true, t:'Victor Ashcombe was tried in the spring. Nell Crane read her father’s confession aloud in court. *The branch line went back to the town — for one pound.*'});
  pages.push({html:true, t: (f.gaveWatch || f.kindSilas) ? 'Silas Voss stopped walking Ashwood at night. *Some mornings, he and your father leave the flowers at Mara’s grave together.*' : 'Silas never quite forgave your father. *But he stopped calling him a murderer, and in Ashbourne that counts for a great deal.*'});
  pages.push({html:true, t:'Tom Barrow testified at the inquiry. Edmund Hale finally sold a book — a history of the branch line, written by Clara Wynn.' + (f.catHome ? ' *Biscuit the cat attended every hearing from June’s windowsill.*' : '')});
  pages.push({html:true, t:'That winter, the Ashen stopped crawling out of the fields. *Some say the land had been waiting for the truth, too.*'});
  pages.push({html:true, t:'*Some letters take twenty years to arrive.*\n\nThe End.'});
  cutscene(pages, () => { save(); showEnding(4); });
}

function resetCombat(){ wInit(); todInit(); C.arrows=[]; C.says=[]; if (F().pet){ scout.x=P.x-14; scout.y=P.y; } C.enemies=[]; C.pickups=[]; C.fx=[]; C.texts=[]; C.wave=null; C.pkx=C.pky=0; C.lastSafe={x:86*T+8,y:30*T+10}; hpInit(); $('#bossbar').classList.remove('on'); refreshHearts();
  const f=F(); if (f.wsWave && !f.wsDone) f.wsWave=0; if (f.bossStarted && !f.bossDown) f.bossStarted=0; if (f.pfStarted && !f.pfDone) f.pfStarted=0; }
function applyWorldState(){
  solid[9*W+78] = F().culvert ? 0 : 1;
  const sp = SILAS_POS[chap()>=2 ? 1 : 0], si = npcs.find(n=>n.id==='silas'); si.x=sp.x; si.y=sp.y; si.home = chap()>=2 ? 'down' : 'right';
}

// ================= chapter flow & cards =================
let CARD = null;
function showCard(num, ttl, sub, done){
  CARD = done; mode='card';
  $('#chapcard .num').textContent=num; $('#chapcard .ttl').textContent=ttl; $('#chapcard .sub').textContent=sub;
  const el=$('#chapcard'); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); chime(); if (SETTINGS.skipStory) setTimeout(closeCard, 1100);
}
function closeCard(){ if (mode!=='card') return; $('#chapcard').classList.remove('on'); mode='play'; const d=CARD; CARD=null; if (d) d(); }
$('#chapcard').addEventListener('click', closeCard);
function startChapter(n){
  IN=null; $('#ending').classList.remove('on'); S0.tut=0; $('#tut').classList.remove('on');
  F().chap=n; applyWorldState(); resetCombat(); S0.hp=S0.maxhp; refreshHearts();
  if (n===2){
    F().phase=3; todInit(); S0.tod=5.3; S0.day=(S0.day||1)+1; P.x=86*T+8; P.y=35*T+10; P.dir='up'; camX=P.x-VW/2; camY=P.y-VH/2;
    beginPlay(); refreshHUD(); save(); setTimeout(sfxWhistle, 900);
    showCard('Chapter Two', 'The Ledger', 'Dawn. The old platform, where he promised he would be.', () => dialog([
      {s:'recap', t:'Dad was framed for the fire that killed Mara Voss. Mara’s ledger — the proof — is hidden in the old engine shed. Dad promised to meet me on the platform at dawn.'},
      {s:'noah', t:'(Dawn. The old platform. He said he would be here.)'},
      {s:'noah', t:'(I’ll sit on the bench and wait for him.)'},
    ]));
  } else if (n===3) {
    F().phase=5; todInit(); if (S0.tod<17) S0.tod=17.2; beginPlay(); refreshHUD(); save();
    showCard('Chapter Three', 'Keeping Left', 'The same day. The sun is going down over Ashbourne.', () => dialog([
      {s:'recap', t:'I have Mara’s ledger. It shows Victor Ashcombe paid someone called “W.P.” to destroy the railway records two days before the fire. Find out who W.P. is.'},
      {s:'noah', t:'(I have Mara’s ledger. Someone called “W.P.” was paid to clear the records before the fire.)'},
      {s:'noah', t:'(Ashcombe said to ask my “friends at the station.” But first I need to know who W.P. really is. Clara keeps the old railway records.)'},
    ]));
  } else {
    F().phase=6; todInit(); S0.tod=21.6;
    beginPlay(); enterScene('harlow', {x:4, y:10, dir:'right'}, true); refreshHUD(); save(); setTimeout(sfxWhistle, 700);
    showCard('Chapter Four', 'Harlow Cross', 'The night train. One last stop.', () => dialog([
      {s:'recap', t:'Walt confessed: he set the fire for Ashcombe’s money. I found Dad at last. But to put Ashcombe in prison, the police need the original ledger — locked in his office in Harlow Cross.'},
      {s:'narr', t:'The night train rattles into Harlow Cross: a smoky railway town of warehouses and black canals. Your father steps down beside you, lantern in hand.'},
      {s:'elias', t:'Mara’s copy proves the numbers. But a copy can be argued away. Ashcombe keeps the original books in his office safe.'},
      {s:'elias', t:'If he burns them tonight, he walks free. We end this before morning.'},
      {s:'elias', t:'There’s a county inspector on the platform — Marlowe. Walt rang him. Talk to him first.'},
    ]));
  }
}

// ================= cutscenes =================
let CUT = { pages:[], i:0, done:null, typing:false, shown:0 };
function cutscene(pages, done){ CUT={pages, i:0, done, shown:0}; mode='cut'; $('#cut').classList.add('on'); showCut(); if (SETTINGS.skipStory) setTimeout(skipCut, 30); }
function showCut(){
  const p=CUT.pages[CUT.i], el=$('#cut .card');
  el.className='card '+(p.paper?'paper':'narr'); el.innerHTML=''; CUT.full=p.t; CUT.shown=0; CUT.typing=true; CUT.html=p.html;
}
function cutNext(){
  if (CUT.typing){ CUT.shown=CUT.full.length; return; }
  CUT.i++; if (CUT.i>=CUT.pages.length){ $('#cut').classList.remove('on'); mode='play'; const d=CUT.done; CUT.done=null; if (d) d(); return; }
  showCut();
}
function tickCut(dt){
  if (mode!=='cut' || !CUT.typing) return;
  const b=Math.floor(CUT.shown); CUT.shown += dt*(CUT.pages[CUT.i].paper?46:40)*(TEXT_CPS[SETTINGS.text]/58);
  const n=Math.min(CUT.full.length, Math.floor(CUT.shown));
  const el=$('#cut .card');
  const txt = CUT.full.slice(0,n);
  if (CUT.html) el.innerHTML = txt.replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\*[^*]*$/,''); else el.textContent = txt;
  if (n!==b && n%4===0) beep(CUT.pages[CUT.i].paper?240:300, .02, 'square', .012);
  if (n>=CUT.full.length) CUT.typing=false;
}

const LETTER1 = `Noah,

You won’t remember my handwriting. I’m sorry for that, and for a great deal more.

You’re old enough now to know what happened. I did not set that fire. I left because staying would have put you in danger — from the same people who made sure the truth stayed buried.

Take the train to Ashbourne. Find the bookseller near the station — Edmund Hale. He’ll know you by my handwriting.

Don’t tell anyone else why you’ve come. Not until you know who to trust. Some people in that town are still afraid, and fear makes people do things they’re not proud of.

— Dad`;
const LETTER2 = `Noah —

If you’re reading this, Hale trusted you and Tom found his courage. Good.

I didn’t set that fire. Here is what actually happened.

Mara was the railway accounts clerk. She found that her supervisors had been falsifying the books — selling off the old branch-line land to a private developer without the council vote the law required. Thousands of pounds, quietly moved. She copied the ledger and was going to bring it to me the morning after she found it.

She never got to. Someone set the office on fire that night, with Mara inside. They put my name on it because I was the one who had been asking uncomfortable questions about the company accounts. Tom saw nothing — but they made him say he did.

I ran because they made it clear that if I stayed, you would be in danger too. You were six years old. I made the wrong choice and I have known it every day since.

The ledger Mara copied is hidden in the old engine shed — where the branch-line trains used to be kept before the line closed. It is the proof that none of this had to happen.

Come to the old platform at dawn. I will be there.

— Dad`;

function startNew(){
  S0 = NEW_STATE(); S0.tut=0; P.x=S0.x; P.y=S0.y; P.dir=S0.dir; cat.follow=false; cat.x=78*T; cat.y=47*T; cat.tx=cat.x; cat.ty=cat.y;
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  applyWorldState(); resetCombat(); lastObj='';
  $('#title').classList.remove('on');
  cutscene([
    {html:true, t:'You are *Noah Vale*, 22 years old.'},
    {html:true, t:'Twenty years ago, in the village of *Ashbourne*, the railway office burned down in the night.\n\nA woman named *Mara Voss* died inside.'},
    {html:true, t:'That same night, your father *Elias* disappeared.\n\nSo everyone believed *he* started the fire — and ran away. You were six. You grew up believing it too.'},
    {html:true, t:'Then, three days ago, a letter arrived.\n\n*From your father.*'},
    {paper:true, t:LETTER1},
    {html:true, t:'On the train, a stranger left a photo of your father on the seat beside you. On the back: *“Ashbourne, spring 2009”* — three years after he vanished.\n\nSo you bought a ticket.'},
    {html:true, t:'*Your mission:*\n\nGo to Ashbourne. Find out *who really started the fire* — and *where your father is now.*\n\nTalk to people. Collect clues. Follow the pink arrow.'},
  ], () => {
    beginPlay();
    showCard('Chapter One', 'The Letter', 'Ashbourne Station, late afternoon.', () => {
      dialog([
        {s:'noah', t:'(Ashbourne. Smaller than I pictured.)'},
        {s:'noah', t:'(The letter says to find a bookseller called Edmund Hale. I don’t know where his shop is.)'},
        {s:'noah', t:'(That railway worker on the platform might know. I’ll ask him.)'},
        () => { addClue('letter'); setTimeout(()=>addClue('photo'), 2200); },
      ], () => { S0.tut=1; tutT=0; });
    });
  });
}
function beginPlay(){ mode='play'; document.body.classList.add('playing'); $('#hud').style.display='block'; $('#topbtns').style.display='flex'; refreshHUD(); }

function runEnding(){
  const fd=$('#fade'); fd.classList.add('on');
  setTimeout(() => {
    fd.classList.remove('on');
    const pages = [
      {html:true, t:'Inside: dust on everything except the workbench. Fresh candle stubs. Someone has been here, and not long ago.'},
      {html:true, t:'On the wall, a hand-drawn map of Ashbourne. The old branch railway line is circled in pencil. And beside it, written small:\n\n*"Engine shed. North of the old platform, along the tracks. That\'s where she hid it."*'},
      {paper:true, t:LETTER2},
    ];
    if (F().watch) pages.push({html:true, t:'You set Mara’s watch on the workbench beside the letter. *2:14.* The hands still haven’t moved.'});
    if (F().toldWalt || F().toldTom) pages.push({html:true, t:'Outside, a whistle carries through the trees from the direction of the station. *Someone already knows you’re here.*'});
    else pages.push({html:true, t:'You kept the letter to yourself, as he asked. For tonight, at least, *nobody knows you’re here.*'});
    cutscene(pages, () => { F().end=1; addClue('workshop'); save();
      dialog([{s:'key', t:'Dad’s letter explains everything so far: Mara found out the railway’s books were faked so the land could be sold off cheaply. Someone set the fire to silence her — and blamed Dad.'},
              {s:'key', t:'Mara’s copy of the books, the ledger, is hidden in the old engine shed. Dad will meet me on the station platform at dawn.'}], () => showEnding(1)); });
  }, 900);
}
let endingNext = 0;
$('#roamBtn').addEventListener('click', () => { $('#ending').classList.remove('on'); if (endingNext) startChapter(endingNext); else { if (IN){ IN=null; P.x=86*T+8; P.y=30*T+10; camX=P.x-VW/2; camY=P.y-VH/2; } mode='play'; refreshHUD(); } });
$('#againBtn').addEventListener('click', () => { $('#ending').classList.remove('on'); startNew(); });
function showEnding(ch){
  mode='ending'; $('#ending').classList.add('on');
  const nClues=S0.clues.length, total=Object.keys(CLUES).length, people=Object.keys(PEOPLE).length;
  const T_ = { 1:['Chapter One complete','Next: Chapter Two — The Ledger','Continue to Chapter Two'],
               2:['Chapter Two complete','Next: Chapter Three — Keeping Left','Continue to Chapter Three'],
               3:['Chapter Three complete','Next: Chapter Four — Harlow Cross','Continue to Chapter Four'],
               4:['The End','The Letter — the complete story','Keep exploring'] }[ch];
  $('#endTitle').textContent=T_[0]; $('#endSub').textContent=T_[1]; $('#roamBtn').textContent=T_[2];
  endingNext = ch<4 ? ch+1 : 0;
  const tie = ch===4 ? ({home:'Came home', time:'Needs time', story:'The whole story'}[F().ending]||'—') : (F().kindSilas?'Mercy':'Distrust');
  $('#stats').innerHTML = `<div><b>${nClues}/${total}</b>Clues found</div><div><b>${S0.mems.length}/5</b>Memories</div><div><b>${S0.met.length}/${people}</b>People met</div><div><b>${tie}</b>${ch===4?'Your ending':'With Silas'}</div>`;
  const notes=[];
  if (!has('postcard')) notes.push('June’s missing cat may know something about 2009.');
  if (!F().watch) notes.push('Something in Ashwood still glints, waiting to be found.');
  if (!has('grave')) notes.push('Mara Voss is buried behind the church.');
  if (ch>=3 && !has('letters')) notes.push('Rosa at the post office knew Walt’s secret too.');
  $('#endNote').textContent = ch===4 ? (notes.length ? 'Thank you for playing. Still hidden in Ashbourne: ' + notes.join(' ') : 'Thank you for playing. You found every secret Ashbourne had.') :
    (notes.length ? 'Still hidden in Ashbourne: ' + notes.join(' ') : 'You found every secret Ashbourne was willing to give up — for now.');
}


// ================= the southern lands =================
function talkAgnes(){
  meet('agnes'); const f=F();
  if (!f.agnes1){
    dialog([
      {s:'agnes', t:'Well, look at you — a visitor who walked all the way to the Old Mill! I’m Agnes Mott. My family has ground Ashbourne’s flour for two hundred years.'},
      {s:'agnes', t:'You’ll want to be careful out here after dark. The Ashen came the summer of the fire — rose up out of the burned fields. They’re worst at the old Abbey across the river.'},
      {s:'agnes', t:'Here — take a warm loaf. Come back any day and I’ll have another for you.'},
      () => { f.agnes1=1; f.loafDay=S0.day; S0.hp=S0.maxhp; refreshHearts(); toast('Fresh bread', 'Fully healed'); },
      {s:'key', t:'Agnes the miller will heal you with fresh bread once a day. The Abbey ruins across the river are dangerous at night.'},
    ]); return;
  }
  if (f.loafDay !== S0.day){ dialog([{s:'agnes', t:'Fresh out of the oven. Eat it while it’s warm, love.'}], () => { f.loafDay=S0.day; S0.hp=S0.maxhp; refreshHearts(); toast('Fresh bread', 'Fully healed'); chime(); }); return; }
  dialog([{s:'agnes', t: LOOK()===2 ? 'Stay by the lamps tonight. The Ashen don’t like the mill wheel’s noise, but they don’t mind much else.' : 'That’s today’s loaf eaten! Come back tomorrow, and I’ll have another.'}]);
}
function talkNed(){
  meet('ned'); const f=F();
  if (!f.lureQuest){
    dialog([
      {s:'ned', t:'Shh — you’ll scare the fish. I’m Old Ned. Been fishing Willow Lake since before your grandad wore short trousers.'},
      {s:'ned', t:'Haven’t caught a thing in a week, mind. Lost my lucky lure up at the Abbey ruins — those shadow-dogs chased me clean out of there.'},
      {choice:[
        {t:'I’ll find it for you.', then:[ {s:'ned', t:'Would you? It’s a little brass fish, shiny as a new penny. Somewhere in the grass inside the old walls.'} ]},
        {t:'What’s at the Abbey?', then:[ {s:'ned', t:'Broken walls, an old altar, and Ashen after dark. Go in daylight if you’ve any sense. And while you’re there — find my lure?'} ]},
      ]},
      () => { f.lureQuest=1; },
      {s:'key', t:'Side quest: find Old Ned’s lucky brass lure in the Abbey ruins, across the river to the south-east. Go by day — it’s dangerous at night.'},
    ]); return;
  }
  if (f.lureFound && !f.lureDone){
    dialog([
      {s:'ned', t:'Is that — my lure! Ha! Look at her shine!'},
      {s:'ned', t:'Here, take these shards — the Ashen leave ’em all over the shore, and I’ve no use for ’em. You’ve made an old man very happy.'},
      () => { f.lureDone=1; addShards(20, P.x, P.y-24); chime(); },
    ]); return;
  }
  dialog([{s:'ned', t: f.lureDone ? 'Three trout this morning! The lure never fails. Neither do you, it seems.' : 'A little brass fish, inside the abbey walls. Mind the shadow-dogs.'}]);
}
function actLure(){ dialog([{s:'narr', t:'In the long grass by the old wall: a little brass fishing lure, shining like a new penny.'}, {s:'noah', t:'(Old Ned’s lucky lure. I should take it back to him at Willow Lake.)'}], () => { F().lureFound=1; toast('Found', 'Ned’s lucky lure'); chime(); }); }
function actChest(){
  if (F().abbeyChest){ dialog([{s:'narr', t:'The old chest is empty now.'}]); return; }
  dialog([{s:'narr', t:'An iron-bound chest, half sunk into the abbey floor. The lid groans open.'}, {s:'narr', t:'Inside: a pouch of ember shards, left by someone who never came back for them.'}], () => { F().abbeyChest=1; addShards(15, P.x, P.y-24); chime(); });
}
function actAltar(){
  dialog([
    {s:'narr', t:'A cracked stone altar. Carved into it, worn almost smooth: a lantern, and the words “Light carried is light shared.”'},
    {s:'narr', t:'Scratched underneath, much newer: “THE ASH REMEMBERS. 2006.”'},
    {s:'noah', t:'(Dad’s word was Lantern, too. And 2006 — the year of the fire. Somebody here knew.)'},
  ]);
}
