# Vice Cover Studio

![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/Alf212/vice-cover-studio-3/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/Alf212/vice-cover-studio-3/reward.svg)

**Your photos, made into GTA-style cover art.** Vice Cover Studio is a small
offline web app that turns a person's own photos and a caption into
multi-panel poster cover art — the classic collage of panels, bold sunset
lettering and a Vice City colour grade — and exports it as a PNG ready to
post. It is an entry in the
[Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on
[make.fun](https://make.fun).

Everything runs on your own machine: open `app/index.html` in a desktop
browser and the app works with no network at all. Your photos are read
locally and drawn on a canvas in the page; they are never uploaded.

## What it does

- **Any photo** — drop in one photo or several, from your files or the
  built-in samples, and fill the panels with one photo spread across them
  or a different photo in each.
- **Four collage layouts** — Classic Five, Hero Trio, Grid Four and Story
  Strips, each drawn for square, portrait and wide covers.
- **Crop and position every panel** — click a panel, drag its photo into
  place, scroll or slide to zoom.
- **Four colour grades** — Vice Sunset, Neon Nights, Golden Hour and Clean
  Print, with a strength slider.
- **Your words** — a title and a caption, lettered in Anton (a bundled
  font under the SIL Open Font License) with a sunset gradient fill.
- **Post sizes in one click** — export a PNG at 1080 × 1080, 1080 × 1350
  or 1920 × 1080.

## Screenshots

- `screenshots/1-cover.jpg` — a wide cover the app exported (1920 × 1080,
  Classic Five, Vice Sunset).
- `screenshots/2-editor.jpg` — the editor with the sample photos loaded.
- `screenshots/3-cover-portrait.jpg` — a portrait cover it exported
  (1080 × 1350, Hero Trio, Neon Nights).
- `screenshots/4-editor-neon.jpg` — the editor making that portrait cover.

## Run it

Serve the folder any way you like, or use the bundled server:

```sh
node serve.ts   # then open http://localhost:8080
```

Opening `app/index.html` straight from disk works too.

## Hand it in (make.fun plumbing)

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored `vendor/makefun-app.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Credits and license

The two beach samples (`boulevard.jpg`, `pier.jpg`) were made for make.fun
with an image model and are free to use; `starlet.jpg` and `neon-drive.jpg`
were made the same way for this entry. The Anton font is © The Anton
Project Authors, licensed under the SIL Open Font License 1.1 (see
`app/fonts/OFL.txt`). All artwork, lettering and code here are original —
no Rockstar Games logo, artwork or fonts.

MIT — see `LICENSE`.
