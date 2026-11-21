// The Quiet Gallery — bootstrap and game loop.
//
// Reads the URL: ?shot=overview | cone | cover | win renders one frozen,
// deterministic scene for screenshots; no ?shot= plays the game normally with
// a title screen. The camera fits the whole floor in overview / win shots and
// zooms to the action in the cone / cover shots and in normal play (it follows
// the archivist at a gentle zoom).

import { WORLD_W, WORLD_H } from './config.js';
import { SoundFX } from './audio.js';
import { Input } from './input.js';
import { createState, update } from './world.js';
import { render } from './render.js';
import { setupShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');

const state = createState();
const input = new Input();
const sfx = new SoundFX();

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

// The camera: zoom and the world point at the centre of the screen.
let camera = { zoom: 1, cx: WORLD_W / 2, cy: WORLD_H / 2 };

if (shotName) {
  camera = setupShot(state, shotName);
} else {
  camera = { zoom: 1.35, cx: state.player.x, cy: state.player.y };
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// The camera follows the archivist in normal play, eased so it never snaps.
function followCamera(dt) {
  const target = { zoom: 1.35, cx: state.player.x, cy: state.player.y };
  const k = 1 - Math.pow(0.001, dt);
  camera.zoom += (target.zoom - camera.zoom) * k;
  camera.cx += (target.cx - camera.cx) * k;
  camera.cy += (target.cy - camera.cy) * k;
  // Keep the view inside the floor.
  const vw = canvas.width / camera.zoom / Math.min(canvas.width / WORLD_W, canvas.height / WORLD_H);
  const vh = canvas.height / camera.zoom / Math.min(canvas.width / WORLD_W, canvas.height / WORLD_H);
  camera.cx = Math.max(vw / 2, Math.min(WORLD_W - vw / 2, camera.cx));
  camera.cy = Math.max(vh / 2, Math.min(WORLD_H - vh / 2, camera.cy));
}

let last = performance.now();

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (!state.frozen) {
    update(state, input, sfx, dt);
    if (state.screen === 'play' && !shotName) followCamera(dt);
  }

  render(ctx, canvas.width, canvas.height, state, camera);

  // Announce the screen for screen readers.
  const label = state.screen === 'title'
    ? 'The Quiet Gallery, title screen. Press Enter to begin.'
    : state.screen === 'caught'
      ? `Caught! ${state.artifactsGot} of 3 artifacts returned. Press R to try again.`
      : state.screen === 'win'
        ? 'You won. All three artifacts returned, unseen. Press R to play again.'
        : `${state.artifactsGot} of 3 artifacts. Detection ${Math.round(state.detection)} percent.`;
  if (statusLine.textContent !== label) statusLine.textContent = label;

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
