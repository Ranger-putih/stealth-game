// The Quiet Gallery — deterministic screenshot scenes.
//
// Each ?shot= mode freezes the game into one fixed scene: guard and player
// positions, facing directions, detection meters and the clock are all set to
// exact values, and the simulation never advances, so a screenshot taken at
// any moment renders the same picture. The camera for each shot is chosen
// here too: the overview and the win fit the whole floor, the cone and cover
// shots zoom in on one moment of sneaking.

import { WORLD_W, WORLD_H } from './config.js';

const FULL_VIEW = { zoom: 1, cx: WORLD_W / 2, cy: WORLD_H / 2 };

// Freeze a guard into a pose: position, facing, state and meter.
function poseGuard(guard, x, y, dir, stateName, meter) {
  guard.x = x;
  guard.y = y;
  guard.dir = dir;
  guard.state = stateName;
  guard.meter = meter;
  guard.lastSeen = null;
  guard.lostTimer = 0;
  guard.pause = 0;
}

export function setupShot(state, name) {
  state.frozen = true;
  state.screen = 'play';
  const p = state.player;
  p.moving = false;
  p.slow = false;

  if (name === 'overview') {
    // The whole floor at a glance: all three guards mid-patrol with their
    // cones out, the archivist mid-level, one artifact already returned.
    state.time = 134; // 02:14
    state.artifacts[2].got = true;
    state.artifactsGot = 1;
    p.x = 648;
    p.y = 360;
    p.face = -Math.PI / 2;
    p.hidden = false;
    poseGuard(state.guards[0], 640, 200, 0, 'patrol', 0);
    poseGuard(state.guards[1], 1080, 380, Math.PI / 2, 'patrol', 0);
    poseGuard(state.guards[2], 240, 340, -Math.PI / 2, 'patrol', 0);
    state.detection = 0;
    return { ...FULL_VIEW };
  }

  if (name === 'cone') {
    // A near miss: Mara's cone reaches the archivist at its very edge and she
    // has just grown suspicious — the "?" is up and the meter reads 62.
    state.time = 97; // 01:37
    p.x = 797;
    p.y = 424;
    p.face = -2.48; // looking back toward Mara
    p.hidden = false;
    poseGuard(state.guards[0], 640, 300, 0.12, 'suspicious', 62);
    poseGuard(state.guards[1], 1080, 380, Math.PI / 2, 'patrol', 0);
    poseGuard(state.guards[2], 240, 340, -Math.PI / 2, 'patrol', 0);
    state.guards[0].lastSeen = { x: p.x, y: p.y };
    state.detection = 62;
    return { zoom: 1.9, cx: 720, cy: 360 };
  }

  if (name === 'cover') {
    // Hiding behind the Scrolls case while Mara's cone sweeps past the other
    // way: the archivist is in the case's blind spot, meter falling, "hidden".
    state.time = 203; // 03:23
    state.artifacts[0].got = true;
    state.artifactsGot = 1;
    p.x = 648;
    p.y = 452;
    p.face = -Math.PI / 2;
    p.hidden = true; // tucked behind the case, out of the cone's reach
    poseGuard(state.guards[0], 700, 320, -Math.PI / 2, 'patrol', 18);
    poseGuard(state.guards[1], 1080, 380, Math.PI / 2, 'patrol', 0);
    poseGuard(state.guards[2], 240, 340, -Math.PI / 2, 'patrol', 0);
    state.detection = 18;
    return { zoom: 1.9, cx: 660, cy: 390 };
  }

  if (name === 'win') {
    // The end of a perfect night: all three artifacts returned, the archivist
    // at the open exit door, the win screen up.
    state.time = 277; // 04:37
    for (const a of state.artifacts) a.got = true;
    state.artifactsGot = 3;
    p.x = 600;
    p.y = 672;
    p.face = Math.PI / 2;
    p.hidden = false;
    poseGuard(state.guards[0], 640, 200, 0, 'patrol', 0);
    poseGuard(state.guards[1], 1080, 380, Math.PI / 2, 'patrol', 0);
    poseGuard(state.guards[2], 240, 340, -Math.PI / 2, 'patrol', 0);
    state.detection = 0;
    state.screen = 'win';
    return { ...FULL_VIEW };
  }

  // Unknown shot name: fall back to the plain title screen.
  state.frozen = false;
  state.screen = 'title';
  return { ...FULL_VIEW };
}
