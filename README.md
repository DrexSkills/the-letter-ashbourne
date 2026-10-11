# The Letter — Chapter One: Ashbourne

A story-driven, top-down 2D pixel-art mystery adventure that runs entirely in the browser. No build step, no dependencies, no image or audio files: every sprite, building, portrait and piece of music is generated in code.

Twenty years ago Noah's father, Elias Vale, vanished. Three days ago, he wrote to him. The letter sends Noah to the quiet countryside town of Ashbourne, where everyone remembers Elias differently, and the trail leads through the dark of Ashwood forest.


## Story

**Chapter One — The Letter.** Noah Vale arrives in Ashbourne after a letter from the father who vanished twenty years ago. A bookseller, a farmer's fence, a dark forest, and a hidden workshop.

**Chapter Two — The Ledger.** Dawn on the old platform. His father doesn't come, but a note does. A locked engine shed, a landowner with too many answers, and the ledger Mara Voss died protecting.

**Chapter Three — Keeping Left.** Who was "W.P."? The answer was at the station all along.

**Chapter Four — Harlow Cross.** The night train to a smoky canal town. Find the original ledger in Ashcombe's safe, face the Ashen Heart, and end it — with an epilogue shaped by your choices.

New players get a short guided tutorial, yellow **!** markers above whoever moves the story forward, and a **Story so far** tab in the journal.

## The world

- **The southern lands:** take the road south out of town to **Willow Lake** (Old Ned's fishing pier and a side quest), **the Old Mill** (Agnes bakes a loaf that heals you once a day) and the **Abbey ruins** across the river — dangerous after dark.

- **Atmosphere:** drifting cloud shadows, falling leaves, birds, golden sun rays at dawn and dusk, forest fog, and passing rain showers with their own sound (turn weather off in Settings).

- **Go inside:** Hale's Books, June's Café, the post office, Greta's forge, St. Aldric's church, Dad's workshop and the engine shed — each with things to find.
- **Daily routines:** townsfolk move around through the day and go indoors at night (you can visit them inside). Whoever your goal needs always waits for you.
- **Sound:** footsteps that change on grass, paths, stone and wood; creaking doors; the train whistle; the church bell.
- **Achievements:** 23 to unlock, from finishing chapters to bonking every townsperson.

## Play

Open `index.html` in any modern browser, or enable GitHub Pages for this repository and play it online.

| Action | Keyboard | Mobile |
| --- | --- | --- |
| Walk | WASD / arrow keys | Joystick (touch the left side of the screen) |
| Run | Shift | Push the joystick to the edge, or hold Run |
| Talk / examine | E, Space or Enter | E button |
| Map | M | Map button or tap the minimap |
| Journal | J | Journal button |
| Pause menu | Esc or P | Menu button |

## Combat, levels & night

Since the fire, ash creatures called **the Ashen** crawl out of the fields — **but only at night**. A full day/night cycle runs in real time (about 11 minutes a day). The village and station are always safe and you heal there; sleep at June's café to skip to morning.

- **Fighting animations:** see your stick, sword or axe sweep with a motion trail, draw and release the bow, feel each hit with a tiny hit-stop, damage numbers and sparks; enemies wind up, snap, swoop and lunge, flash when hit, and crumble into ash when defeated.
- **Enemies:** Ash Crawlers, Ember Wisps, Shade Hounds (they lunge — dodge!), and the **Cinder Warden** boss.
- **Levels:** defeating Ashen earns XP. Every level gives an extra heart and stronger hits.
- **Weapons:** Walt gives you a walking stick. **Greta the blacksmith** trades ember shards ✦ for an **Iron sword** (fast), a **Hunting bow** (arrows) and a **Woodsman's axe** (wide, heavy swings). Dad's lantern makes every hit stronger.
- **Pet:** a stray dog hides near the bridge. Win him over with a meat pie from June's café and **Scout** will fight the Ashen with you.
- **Just for fun:** you can bonk the townsfolk too. They have opinions about it.
- **Controls:** Space/K attack · Q or 1–4 switch weapon · H how to play. On phones: the attack button and ⇄.
- **Story mode (recommended):** The Letter is a story game. Just want the action? Every conversation has a **Skip ⏭** button, and the journal's Story tab keeps a summary.
- **Hide UI:** press **U** or tap **Hide** to clear the goal box, buttons and minimap off the screen; tap **Show UI** to bring them back.
- **Difficulty:** Story, Normal or Hard in Settings.
## Playing on a phone

- Turn your phone sideways — the game is laid out for landscape and zooms in for small screens.
- **Add it to your home screen** to play full screen like an app: on iPhone, tap Share ⬆ then *Add to Home Screen*; on Android, tap ⋮ then *Add to Home screen* / *Install app* (or use the button on the title screen).
- Tap anywhere once to turn on the sound. On iPhone, sound works even with the silent switch on.
- Drag on the left side of the screen to walk; tap **E** to talk and examine.

## Features

- A full chapter of story with seven characters, pixel portraits, typewriter dialogue and choices that change later scenes
- Twelve clues and five hidden memories, tracked in Noah's journal
- Afternoon, dusk and night lighting that changes with the story, with lantern light in the forest
- Calm generative background music that shifts with the time of day and location
- World map, minimap and objective marker
- Settings for music and sound volume, text speed, pixel size, minimap and marker
- Autosave in the browser (localStorage)

## Project structure

```
index.html        the page: layout, menus and the order the scripts load in
css/style.css     all the styling
js/               the game code, split by topic — files load in number order (14 files)
  01-core.js         constants, helpers, the Ashbourne world map, houses and trees
  02-characters.js   character looks, the sprite drawer and portraits
  03-state.js        save state, clues, memories, people, townsfolk, things to examine
  04-worldmap.js     world map screen, minimap and the phone joystick
  05-input-audio.js  keyboard/touch input, settings, music and basic sounds
  06-dialogue.js     the dialogue box, choices, skipping, clues and memories
  07-story.js        every conversation in chapters one to three, cutscenes
  08-hud-journal.js  goals, the goal box, the journal and items
  09-world.js        area names, collisions, interacting, camera, phone extras
  10-combat.js       the Ashen, fighting, bosses, weapons, levels, day/night, Scout, Greta
  11-scenes.js       building interiors and Chapter Four (Harlow Cross)
  12-systems.js      sound effects, daily routines, achievements, drawing interiors
  13-atmosphere.js   cloud shadows, leaves, birds, sun rays, fog, rain and dust
  14-main.js         tutorial, main loop, drawing the world, menus and start-up
build.py          optional: bundles everything into one file, dist/the-letter.html
sw.js, manifest.webmanifest, icons   for "Add to Home Screen"
```

**Editing tips:** dialogue lives in `js/07-story.js` (chapters 1–3) and `js/11-scenes.js` (chapter 4). Change the look of the game in `css/style.css`. Edit with a plain code editor like VS Code so quotes don't turn "curly".

To run it locally, serve the folder (for example `python3 -m http.server`) and open http://localhost:8000. To make a single shareable file, run `python3 build.py`.
