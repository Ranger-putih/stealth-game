// The Quiet Gallery — game state and simulation.
//
// One frame of update: move the archivist (with wall collision), move each
// guard through its patrol / suspicion / chase states, grow or shrink the
// detection meter, and decide caught / win. Guards see through a translucent
// cone; walls, cases and statues block their sight. The archivist is harder
// to spot while walking slow, or while standing in a shadow zone.

import {
  WORLD_W, WORLD_H, WALLS, CASES, STATUES, SHADOWS, ARTIFACTS, EXIT,
  PLAYER_START, GUARDS, TUNING,
} from './config.js';

// ---- geometry helpers -------------------------------------------------------

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Does the segment (x1,y1)-(x2,y2) hit the rectangle r?
function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  if (dx === 0) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  if (dy === 0) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return true;
}

// Does the segment (x1,y1)-(x2,y2) hit the circle c?
function segmentHitsCircle(x1, y1, x2, y2, c) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - c.x;
  const fy = y1 - c.y;
  const a = dx * dx + dy * dy;
  if (a === 0) return Math.hypot(fx, fy) <= c.r;
  let t = -(fx * dx + fy * dy) / a;
  t = clamp(t, 0, 1);
  const px = x1 + dx * t;
  const py = y1 + dy * t;
  return Math.hypot(px - c.x, py - c.y) <= c.r;
}

// True when nothing solid stands between (x1,y1) and (x2,y2).
export function hasLineOfSight(x1, y1, x2, y2) {
  for (const w of WALLS) {
    if (segmentHitsRect(x1, y1, x2, y2, w)) return false;
  }
  for (const c of CASES) {
    if (segmentHitsRect(x1, y1, x2, y2, c)) return false;
  }
  for (const s of STATUES) {
    if (segmentHitsCircle(x1, y1, x2, y2, s)) return false;
  }
  return true;
}

function circleHitsRect(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < r * r;
}

function circleHitsCircle(cx, cy, r, c) {
  return Math.hypot(cx - c.x, cy - c.y) < r + c.r;
}

// True when a circle at (cx,cy) with radius r overlaps anything solid.
function collides(cx, cy, r) {
  if (cx - r < 0 || cx + r > WORLD_W || cy - r < 0 || cy + r > WORLD_H) return true;
  for (const w of WALLS) {
    if (circleHitsRect(cx, cy, r, w)) return true;
  }
  for (const c of CASES) {
    if (circleHitsRect(cx, cy, r, c)) return true;
  }
  for (const s of STATUES) {
    if (circleHitsCircle(cx, cy, r, s)) return true;
  }
  return false;
}

// Move a circle, sliding along walls: try x then y separately.
function moveCircle(body, dx, dy) {
  if (dx !== 0 && !collides(body.x + dx, body.y, body.r)) body.x += dx;
  if (dy !== 0 && !collides(body.x, body.y + dy, body.r)) body.y += dy;
}

function inShadow(x, y) {
  for (const s of SHADOWS) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return true;
  }
  return false;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// ---- state ------------------------------------------------------------------

export function createState() {
  return {
    screen: 'title', // title | play | caught | win
    time: 0, // seconds since the level started
    artifactsGot: 0,
    artifacts: ARTIFACTS.map((a) => ({ ...a, got: false })),
    player: {
      x: PLAYER_START.x,
      y: PLAYER_START.y,
      r: TUNING.playerRadius,
      face: -Math.PI / 2,
      moving: false,
      slow: false,
      hidden: false,
    },
    guards: GUARDS.map((g, i) => ({
      name: g.name,
      color: g.color,
      patrol: g.patrol,
      waypoint: 0,
      x: g.patrol[0].x,
      y: g.patrol[0].y,
      r: TUNING.guardRadius,
      dir: 0,
      state: 'patrol', // patrol | suspicious | alert
      meter: 0,
      lastSeen: null,
      lostTimer: 0,
      pause: 0,
      index: i,
    })),
    detection: 0, // the HUD meter: the highest guard meter
    footstepTimer: 0,
    message: '',
    messageTimer: 0,
    frozen: false, // screenshot mode: render a fixed scene, never advance
  };
}

// ---- update -----------------------------------------------------------------

export function update(state, input, sfx, dt) {
  if (state.screen === 'title') {
    if (input.consume('Enter') || input.consumeClick()) {
      state.screen = 'play';
      input.clearPresses();
      sfx.unlock();
    }
    return;
  }
  if (state.screen === 'caught' || state.screen === 'win') {
    if (input.consume('r') || input.consume('Enter') || input.consumeClick()) {
      const fresh = createState();
      fresh.screen = 'play';
      Object.assign(state, fresh);
      input.clearPresses();
    }
    return;
  }

  dt = Math.min(dt, 0.05);
  state.time += dt;

  // --- the archivist ---
  const p = state.player;
  const mv = input.moveVector();
  p.slow = input.slow;
  p.moving = mv.x !== 0 || mv.y !== 0;
  if (p.moving) {
    const speed = p.slow ? TUNING.playerSlow : TUNING.playerWalk;
    moveCircle(p, mv.x * speed * dt, mv.y * speed * dt);
    p.face = Math.atan2(mv.y, mv.x);
    state.footstepTimer -= dt;
    if (state.footstepTimer <= 0) {
      sfx.footstep(p.slow);
      state.footstepTimer = TUNING.footstepInterval * (p.slow ? 1.5 : 1);
    }
  }
  p.hidden = inShadow(p.x, p.y);

  // --- pick up an artifact with E ---
  if (input.consume('e')) {
    for (const a of state.artifacts) {
      if (!a.got && Math.hypot(a.x - p.x, a.y - p.y) <= TUNING.pickupRadius) {
        a.got = true;
        state.artifactsGot += 1;
        sfx.pickup();
        state.message = `${a.name} returned to its case — ${state.artifactsGot} of 3`;
        state.messageTimer = 2.5;
        break;
      }
    }
  }

  // --- the guards ---
  let worst = 0;
  for (const g of state.guards) {
    updateGuard(state, g, p, sfx, dt);
    if (g.meter > worst) worst = g.meter;
  }
  state.detection = worst;

  if (state.messageTimer > 0) state.messageTimer -= dt;

  // --- caught? ---
  for (const g of state.guards) {
    if (g.state === 'alert' && Math.hypot(g.x - p.x, g.y - p.y) <= TUNING.guardCatchRadius) {
      state.screen = 'caught';
      sfx.caught();
      return;
    }
  }

  // --- win: all three artifacts, then slip out the exit door ---
  if (state.artifactsGot === 3 && p.x >= EXIT.x && p.x <= EXIT.x + EXIT.w && p.y > WORLD_H - 60) {
    state.screen = 'win';
    sfx.win();
  }
}

function updateGuard(state, g, p, sfx, dt) {
  const dist = Math.hypot(p.x - g.x, p.y - g.y);
  const toPlayer = Math.atan2(p.y - g.y, p.x - g.x);
  const inCone = dist <= TUNING.coneRange
    && Math.abs(angleDiff(toPlayer, g.dir)) <= TUNING.coneHalfAngle;
  const seen = inCone && hasLineOfSight(g.x, g.y, p.x, p.y);

  // Grow the meter while the guard sees the archivist; let it fall otherwise.
  if (seen) {
    let rate = TUNING.detectBase * (1 - (dist / TUNING.coneRange) * 0.6);
    if (p.slow) rate *= TUNING.detectSlowMult;
    else if (p.moving) rate *= TUNING.detectRunMult;
    if (p.hidden) rate *= TUNING.detectShadowMult;
    g.meter = Math.min(TUNING.alertAt, g.meter + rate * dt);
    g.lastSeen = { x: p.x, y: p.y };
    g.lostTimer = 0;
  } else {
    g.meter = Math.max(0, g.meter - TUNING.detectDecay * dt);
    if (g.state === 'alert') {
      g.lostTimer += dt;
      if (g.lostTimer > TUNING.alertMemory) {
        g.state = 'suspicious';
        g.lostTimer = 0;
      }
    }
  }

  // State changes. An alerted guard keeps chasing for alertMemory seconds
  // after losing sight (the meter keeps falling meanwhile); only then does
  // she drop back to suspicious and walk over to look. Otherwise the meter
  // alone would drop her out of a chase the instant the archivist ducks
  // behind a case, and no chase would ever last.
  const wasState = g.state;
  if (g.state === 'alert') {
    if (g.lostTimer > TUNING.alertMemory) g.state = 'suspicious';
  } else if (g.meter >= TUNING.alertAt) {
    g.state = 'alert';
  } else if (g.meter >= TUNING.suspiciousAt) {
    g.state = 'suspicious';
  } else if (g.state !== 'patrol' && g.meter < TUNING.suspiciousAt * 0.5) {
    g.state = 'patrol';
  }
  if (g.state === 'alert' && wasState !== 'alert') sfx.alert();
  if (g.state === 'suspicious' && wasState === 'patrol') sfx.suspicious();

  // --- movement by state ---
  if (g.state === 'alert' && g.lastSeen) {
    // Chase the last place the archivist was seen.
    const d = Math.hypot(g.lastSeen.x - g.x, g.lastSeen.y - g.y);
    if (d > 8) {
      const step = TUNING.guardChase * dt;
      moveCircle(g, ((g.lastSeen.x - g.x) / d) * step, ((g.lastSeen.y - g.y) / d) * step);
      g.dir = Math.atan2(g.lastSeen.y - g.y, g.lastSeen.x - g.x);
    }
    return;
  }

  if (g.state === 'suspicious' && g.lastSeen) {
    // Walk over to look, then give up and go back to the patrol.
    const d = Math.hypot(g.lastSeen.x - g.x, g.lastSeen.y - g.y);
    if (d > 30) {
      const step = TUNING.guardSuspicious * dt;
      moveCircle(g, ((g.lastSeen.x - g.x) / d) * step, ((g.lastSeen.y - g.y) / d) * step);
      g.dir = Math.atan2(g.lastSeen.y - g.y, g.lastSeen.x - g.x);
    } else {
      g.pause += dt;
      g.dir += Math.sin(state.time * 1.4 + g.index * 2) * 0.9 * dt;
      if (g.pause > 2.5) {
        g.pause = 0;
        g.state = 'patrol';
        g.lastSeen = null;
      }
    }
    return;
  }

  // Patrol: walk the waypoints, pausing a beat at each corner to look around.
  if (g.pause > 0) {
    g.pause -= dt;
    g.dir += Math.sin(state.time * 0.8 + g.index) * 0.5 * dt;
    return;
  }
  const target = g.patrol[g.waypoint];
  const d = Math.hypot(target.x - g.x, target.y - g.y);
  if (d < 10) {
    g.waypoint = (g.waypoint + 1) % g.patrol.length;
    g.pause = 0.9;
    return;
  }
  const step = TUNING.guardPatrol * dt;
  moveCircle(g, ((target.x - g.x) / d) * step, ((target.y - g.y) / d) * step);
  g.dir = Math.atan2(target.y - g.y, target.x - g.x);
}
