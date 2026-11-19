# ViceFrame — GTA-Style Cover Art Maker (with Batik Vice)

ViceFrame turns your own photos into GTA-style multi-panel cover art, entirely in the
browser: pick a layout, drop in up to five photos, frame each panel, choose a colour
grade, write your title, and export a PNG in the common post sizes. Everything is
computed locally on canvas — photos are read from your machine and never uploaded, and
the app works fully offline from its own files.

Its signature look is **Batik Vice**, an Indonesian theme: mega mendung cloud bands
across an indigo sky, kawung flower strips on the hero panel and parang motifs in the
title band, all drawn procedurally in code alongside the Vice City sunsets, palm
silhouettes, skylines and neon signs. No Rockstar artwork, logos or fonts are used;
every scene is original canvas drawing.

## Features

- **Five poster layouts** — Classic Grid (big hero panel, five scene panels), Duo Split
  (two heroes under a title band), Solo Hero, Wide Banner and Collage 5 — with white
  GTA-style gutters.
- **Real photo handling** — load 1–5 photos (file picker, drag-and-drop, or the two
  bundled samples), click a panel to select it, click a photo to place it, drag inside
  the panel to reposition, zoom per panel (slider or scroll wheel), Fill/Fit framing.
- **Procedural scenes** — panels without a photo are painted in code: sunset beach,
  skyline, palms, neon street, harbour and strip scenes in the theme's palette.
- **Five colour grades** — Vice Sunset, Neon Night, Batik Vice, Golden Hour and Noir,
  applied to photos with canvas filters and painted overlays, and to scenes as palettes.
- **Cover lettering** — editable title and caption line in Anton, auto-fitted, with the
  heavy outline and hard shadow of a game cover; the caption sits on a skewed stripe.
- **One-click PNG export** at 1080×1080, 1080×1350, 1920×1080 and 1080×1920.
- **Batik overlay per panel** — mega mendung wash plus a kawung strip, on any panel;
  the Batik Vice theme dresses the hero automatically.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

Open http://localhost:8080 in desktop Chrome. There is no build step and no network
request: `app/index.html` and its ES modules, the font and the samples are all local
files. Fixed scenes for screenshots are available through query parameters, e.g.
`?shot=cover&layout=classic&theme=batik&photo=boulevard&caption=Batik%20Vice` renders
only the finished cover, and `?shot=editor&photo=pier` opens the editor with a sample
loaded; `shots.json` lists the four scenes used for `screenshots/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory (or `/output` when
`MAKEFUN_OUTPUT_DIR` is unset) and writes `dossier.json` there with the vendored
make.fun library (`vendor/makefun-app.ts`, the kit's copy, unchanged).

## Screenshots

- `screenshots/1-cover.jpg` — Classic Grid cover, Vice Sunset, the pier sample.
- `screenshots/2-editor.jpg` — the editor at 1280×720 with the boulevard sample loaded.
- `screenshots/3-cover.jpg` — Classic Grid cover in the Batik Vice theme (portrait).
- `screenshots/4-cover.jpg` — Wide Banner cover, Neon Night, the pier sample.

## Fonts and samples

The cover lettering uses **Anton** by Vernon Adams, licensed under the SIL Open Font
License 1.1: the font file is `app/fonts/Anton-Regular.ttf` and its license text is
`app/fonts/OFL.txt`. If the font cannot load, the app falls back to a heavy system
stack (`'Archivo Black', 'Arial Black', sans-serif`). The two sample photos in
`app/samples/` were made with an image model for make.fun and are free to use.

## License

MIT — see `LICENSE`. Copyright (c) 2026 mrn0p3c.
