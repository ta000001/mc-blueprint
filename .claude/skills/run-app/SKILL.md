---
name: run-app
description: Launch and drive the 設計図 / Voxel Blueprint app (a static PWA). Use when asked to run, start, open, or verify the app.
---

# Running 設計図 — Voxel Blueprint

This project is a **static Progressive Web App** (plain HTML/CSS/JS in the
repo root: `index.html`, `manifest.webmanifest`, `sw.js`). It uses a
Service Worker and a web manifest, so it **must be served over HTTP** — do
not open `index.html` via `file://` (the Service Worker won't register).

There is no build step. Just serve the repo root and open it in a browser.

## Launch

From the repo root (`C:\work\mc-blueprint`):

```
python -m http.server 8000
```

Then open: `http://localhost:8000/index.html`

- Python 3 is available on this machine as `python` (verify with
  `python --version`).
- Run the server with `run_in_background: true` so it keeps serving; stop
  it with Ctrl+C (or kill the background task) when done.
- If port 8000 is taken, use another (e.g. 8001) and adjust the URL.

## Smoke test (confirm it's up)

```
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/index.html   # expect 200
```

To confirm the served version, grep the response for the version string:

```
curl -s http://localhost:8000/index.html | grep -o "APP_VERSION = '.*'"
```

## Open in the default browser (Windows)

```
cmd.exe /c start http://localhost:8000/index.html
```

## Driving / verifying a change

The app has three tabs: **space** (3D voxel view), **plan** (2D grid),
**json** (export). To verify a change, open the app, switch to the
relevant tab, and interact:

- 3D view mouse controls: **left-drag = rotate**, **right-drag = pan**,
  **wheel = zoom**, **left-click = place/break block**.
- Touch: 1 finger = pan, 2 fingers = rotate + pinch-zoom.

The current app version is shown top-left as `vX.Y`.

## Caching gotcha

The Service Worker caches assets (`sw.js` cache name = `blueprint-vX.Y`).
After editing source, **hard-reload** the browser (Ctrl+Shift+R) to pick up
changes, otherwise the old cached version is served.

## Version bumps

When releasing a change, bump the version in **all three** places so the
cache invalidates and the in-app label updates:

- `index.html` — `const APP_VERSION = '...'`
- `manifest.webmanifest` — `"version": "..."`
- `sw.js` — `const CACHE = 'blueprint-v...'`
