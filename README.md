# The Letter — Chapter One: Ashbourne

A story-driven, top-down 2D pixel-art mystery adventure that runs entirely in the browser. No build step, no dependencies, no image or audio files: every sprite, building, portrait and piece of music is generated in code inside `index.html`.

Twenty years ago Noah's father, Elias Vale, vanished. Three days ago, he wrote to him. The letter sends Noah to the quiet countryside town of Ashbourne, where everyone remembers Elias differently, and the trail leads through the dark of Ashwood forest.


## Story

**Chapter One — The Letter.** Noah Vale arrives in Ashbourne after a letter from the father who vanished twenty years ago. A bookseller, a farmer's fence, a dark forest, and a hidden workshop.

**Chapter Two — The Ledger.** Dawn on the old platform. His father doesn't come, but a note does. A locked engine shed, a landowner with too many answers, and the ledger Mara Voss died protecting.

**Chapter Three — Keeping Left.** Who was "W.P."? The answer was at the station all along. Ends with a full finale and an epilogue shaped by your choices.

New players get a short guided tutorial, yellow **!** markers above whoever moves the story forward, and a **Story so far** tab in the journal.

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

## Combat — the Ashen

Since the fire, ash creatures crawl out of Ashbourne's fields and woods. The village and the station are always safe (and you heal there); everywhere else, especially after dark, you'll need to fight.

- **Ash Crawlers** (fast and weak), **Ember Wisps** (floating sparks), **Shade Hounds** (they crouch, then lunge — dodge!)
- Boss: **The Cinder Warden**, guarding the engine shed. Watch for the red circle before it slams.
- Walt gives you a walking stick; Dad's lantern makes every hit count double.
- Defeated Ashen drop ember shards ✦ — every 10 shards adds a heart.
- Attack: **Space / K** on keyboard, **⚔** on phones. **E** still talks and examines.
- Choose **Story**, **Normal** or **Hard** combat in Settings.

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
index.html   the whole game: HTML, CSS and JavaScript in one file
README.md
```

Fonts (Jersey 10 and VT323) load from Google Fonts, with monospace fallbacks.
