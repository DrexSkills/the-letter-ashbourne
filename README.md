# The Letter — Chapter One: Ashbourne

A story-driven, top-down 2D pixel-art mystery adventure that runs entirely in the browser. No build step, no dependencies, no image or audio files: every sprite, building, portrait and piece of music is generated in code inside `index.html`.

Twenty years ago Noah's father, Elias Vale, vanished. Three days ago, he wrote to him. The letter sends Noah to the quiet countryside town of Ashbourne, where everyone remembers Elias differently, and the trail leads through the dark of Ashwood forest.

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
