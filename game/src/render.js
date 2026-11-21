// The Quiet Gallery — drawing.
//
// Everything is drawn with plain Canvas 2D shapes: a wooden museum floor, dark
// shadow pools, glass display cases, marble statues, the archivist, the guards
// and their translucent yellow vision cones, the HUD and the title / caught /
// win screens. The camera either fits the whole floor (overview and win) or
// zooms to a point of interest (cone and cover shots, and normal play).

import {
  WORLD_W, WORLD_H, WALLS, CASES, STATUES, SHADOWS, ARTIFACTS, EXIT, TUNING,
} from './config.js';

const FLOOR_A = '#2e2620';
const FLOOR_B = '#332b24';

// Draw the whole game into ctx for a canvas of pixel size (cw, ch).
// camera: { zoom, cx, cy } — world point at the centre and the zoom factor.
export function render(ctx, cw, ch, state, camera) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#14100d';
  ctx.fillRect(0, 0, cw, ch);

  const base = Math.min(cw / WORLD_W, ch / WORLD_H);
  const scale = base * camera.zoom;
  const ox = cw / 2 - camera.cx * scale;
  const oy = ch / 2 - camera.cy * scale;

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  drawFloor(ctx);
  drawShadows(ctx);
  drawExit(ctx, state);
  drawArtifacts(ctx, state);
  drawCases(ctx);
  drawStatues(ctx);
  drawWalls(ctx);
  drawCones(ctx, state);
  drawGuards(ctx, state);
  drawPlayer(ctx, state);
  drawNoiseRing(ctx, state);

  ctx.restore();

  drawHud(ctx, cw, ch, state);
  if (state.screen === 'title') drawTitle(ctx, cw, ch);
  if (state.screen === 'caught') drawCaught(ctx, cw, ch, state);
  if (state.screen === 'win') drawWin(ctx, cw, ch, state);
  if (state.messageTimer > 0) drawMessage(ctx, cw, ch, state);
}

function drawFloor(ctx) {
  ctx.fillStyle = FLOOR_A;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  // Wooden floorboards.
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  for (let y = 32; y < WORLD_H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_W, y);
    ctx.stroke();
  }
  for (let x = 0; x < WORLD_W; x += 96) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_H);
    ctx.stroke();
  }
  // A worn red carpet down the Grand Hall.
  ctx.fillStyle = '#5d2320';
  ctx.fillRect(416, 16, 464, 688);
  ctx.strokeStyle = '#8a6a2f';
  ctx.lineWidth = 3;
  ctx.strokeRect(424, 24, 448, 672);
  // Room labels, painted on the floor.
  ctx.fillStyle = 'rgba(232,214,180,0.28)';
  ctx.font = 'italic 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('North Gallery', 200, 90);
  ctx.fillText('Grand Hall', 648, 80);
  ctx.fillText('East Wing', 1080, 640);
  ctx.fillText('West Wing', 200, 650);
}

function drawShadows(ctx) {
  for (const s of SHADOWS) {
    ctx.fillStyle = 'rgba(8,8,20,0.55)';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(120,120,200,0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(160,160,220,0.5)';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('shadow', s.x + s.w / 2, s.y + s.h / 2 + 5);
  }
}

function drawExit(ctx, state) {
  const open = state.artifactsGot === 3;
  ctx.fillStyle = open ? '#3f7a44' : '#5a4632';
  ctx.fillRect(EXIT.x, EXIT.y - 6, EXIT.w, EXIT.h + 6);
  ctx.strokeStyle = open ? '#a9e6ae' : '#c9a86a';
  ctx.lineWidth = 2;
  ctx.strokeRect(EXIT.x, EXIT.y - 6, EXIT.w, EXIT.h + 6);
  ctx.fillStyle = open ? '#d8f5da' : '#e8d6b4';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT — OPEN' : 'EXIT — LOCKED', EXIT.x + EXIT.w / 2, EXIT.y - 14);
}

function drawArtifacts(ctx, state) {
  for (const a of state.artifacts) {
    if (a.got) {
      // A returned artifact: a small gold case where it belongs.
      ctx.fillStyle = '#8a6a2f';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd970';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 6, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    // A waiting artifact: a glowing pedestal with its name. The glow is driven
    // by the frozen game clock, so a screenshot scene never changes.
    const pulse = 0.55 + 0.25 * Math.sin(state.time * 2.4);
    ctx.fillStyle = `rgba(255,215,112,${pulse})`;
    ctx.beginPath();
    ctx.arc(a.x, a.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4f1d';
    ctx.beginPath();
    ctx.arc(a.x, a.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd970';
    ctx.beginPath();
    ctx.arc(a.x, a.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(a.name, a.x, a.y - 30);
  }
}

function drawCases(ctx) {
  for (const c of CASES) {
    ctx.fillStyle = '#4a3a26';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(180,220,255,0.35)';
    ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = '#e8d6b4';
    ctx.font = '12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
  }
}

function drawStatues(ctx) {
  for (const s of STATUES) {
    ctx.fillStyle = '#5a5148';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfc4b4';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a332c';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.name[0], s.x, s.y + 5);
  }
}

function drawWalls(ctx) {
  ctx.fillStyle = '#17120e';
  for (const w of WALLS) ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.strokeStyle = '#8a6a2f';
  ctx.lineWidth = 2;
  for (const w of WALLS) ctx.strokeRect(w.x, w.y, w.w, w.h);
}

function drawCones(ctx, state) {
  for (const g of state.guards) {
    const range = TUNING.coneRange;
    const half = TUNING.coneHalfAngle;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.arc(g.x, g.y, range, g.dir - half, g.dir + half);
    ctx.closePath();
    const hot = g.state === 'alert';
    ctx.fillStyle = hot ? 'rgba(255,80,60,0.30)' : 'rgba(255,214,90,0.22)';
    ctx.fill();
    ctx.strokeStyle = hot ? 'rgba(255,120,90,0.5)' : 'rgba(255,214,90,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawGuards(ctx, state) {
  for (const g of state.guards) {
    // Body: a dark uniform with a coloured sash, facing its patrol direction.
    ctx.fillStyle = '#1d2733';
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = g.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r - 2, 0, Math.PI * 2);
    ctx.stroke();
    // A small torch dot showing which way the guard faces.
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.dir) * (g.r + 5), g.y + Math.sin(g.dir) * (g.r + 5), 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Name and state mark.
    ctx.fillStyle = '#e8e0d0';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name, g.x, g.y - g.r - 16);
    if (g.state === 'suspicious') {
      ctx.fillStyle = '#ffd65a';
      ctx.font = 'bold 26px Georgia, serif';
      ctx.fillText('?', g.x, g.y - g.r - 30);
    } else if (g.state === 'alert') {
      ctx.fillStyle = '#ff5a40';
      ctx.font = 'bold 28px Georgia, serif';
      ctx.fillText('!', g.x, g.y - g.r - 30);
    }
    // A thin meter arc over an alerted guard.
    if (g.meter > 1) {
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (g.meter / 100));
      ctx.stroke();
      ctx.strokeStyle = g.state === 'alert' ? '#ff5a40' : '#ffd65a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (g.meter / 100));
      ctx.stroke();
    }
  }
}

function drawPlayer(ctx, state) {
  const p = state.player;
  // A soft ring when the archivist is hidden in shadow.
  if (p.hidden) {
    ctx.strokeStyle = 'rgba(140,140,255,0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(170,170,255,0.85)';
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('hidden', p.x, p.y - p.r - 12);
  }
  ctx.fillStyle = '#2f6b4f';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b8e6c8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r - 1, 0, Math.PI * 2);
  ctx.stroke();
  // Facing tick.
  ctx.strokeStyle = '#b8e6c8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(p.face) * (p.r + 6), p.y + Math.sin(p.face) * (p.r + 6));
  ctx.stroke();
}

function drawNoiseRing(ctx, state) {
  const p = state.player;
  if (!p.moving || p.slow || state.screen !== 'play') return;
  const t = (Date.now() % 900) / 900;
  ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - t)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 24 + t * 46, 0, Math.PI * 2);
  ctx.stroke();
}

// ---- HUD and screens ----------------------------------------------------------

function drawHud(ctx, cw, ch, state) {
  // Top bar.
  ctx.fillStyle = 'rgba(10,8,6,0.82)';
  ctx.fillRect(0, 0, cw, 44);
  ctx.fillStyle = '#e8d6b4';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE QUIET GALLERY', 14, 28);
  ctx.font = '15px Georgia, serif';
  ctx.fillText(`Artifacts  ${state.artifactsGot} / 3`, 250, 28);
  // Detection meter.
  const mx = 420;
  const mw = 220;
  ctx.fillStyle = '#3a2a22';
  ctx.fillRect(mx, 14, mw, 16);
  const frac = state.detection / 100;
  ctx.fillStyle = frac >= 1 ? '#ff5a40' : frac >= 0.35 ? '#ffd65a' : '#7fb069';
  ctx.fillRect(mx, 14, mw * frac, 16);
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, 14, mw, 16);
  ctx.fillStyle = '#e8d6b4';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(state.detection >= 100 ? 'SPOTTED!' : state.detection >= 35 ? 'Suspicious…' : 'Unseen', mx + mw + 10, 27);
  // Clock and objective.
  const mm = Math.floor(state.time / 60);
  const ss = Math.floor(state.time % 60);
  ctx.textAlign = 'right';
  ctx.fillText(`${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, cw - 14, 28);
  ctx.textAlign = 'center';
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#c9b48a';
  const objective = state.artifactsGot < 3
    ? `Return the ${3 - state.artifactsGot} remaining artifact${3 - state.artifactsGot === 1 ? '' : 's'} to their cases`
    : 'All artifacts returned — slip out the exit, unseen';
  ctx.fillText(objective, cw / 2, ch - 12);
  // Controls hint.
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(232,214,180,0.75)';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('WASD / arrows move · Shift walk slow · E pick up · R restart', 14, ch - 12);
}

function drawMessage(ctx, cw, ch, state) {
  ctx.fillStyle = 'rgba(10,8,6,0.8)';
  const w = Math.min(cw - 40, 560);
  ctx.fillRect((cw - w) / 2, 56, w, 30);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.message, cw / 2, 76);
}

function dim(ctx, cw, ch) {
  ctx.fillStyle = 'rgba(8,6,5,0.78)';
  ctx.fillRect(0, 0, cw, ch);
}

function drawTitle(ctx, cw, ch) {
  dim(ctx, cw, ch);
  ctx.fillStyle = '#ffd970';
  ctx.font = 'bold 54px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE QUIET GALLERY', cw / 2, ch / 2 - 90);
  ctx.fillStyle = '#e8d6b4';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('A night archivist. Three borrowed artifacts. Three watchful guards.', cw / 2, ch / 2 - 48);
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Sneak through the museum after hours. Stay out of the yellow cones,', cw / 2, ch / 2 + 4);
  ctx.fillText('hide behind cases and statues, duck into the shadows — and be quiet.', cw / 2, ch / 2 + 28);
  ctx.fillStyle = '#b8e6c8';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('WASD / arrows to move · Shift to walk slow · E to pick up · R to restart', cw / 2, ch / 2 + 70);
  ctx.fillStyle = '#ffd970';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('Click or press Enter to begin', cw / 2, ch / 2 + 116);
}

function drawCaught(ctx, cw, ch, state) {
  dim(ctx, cw, ch);
  ctx.fillStyle = '#ff5a40';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAUGHT!', cw / 2, ch / 2 - 40);
  ctx.fillStyle = '#e8d6b4';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('A guard caught you in the lamplight. The night is not over yet.', cw / 2, ch / 2 + 4);
  ctx.fillText(`Artifacts returned: ${state.artifactsGot} of 3`, cw / 2, ch / 2 + 36);
  ctx.fillStyle = '#ffd970';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('Press R or click to try again', cw / 2, ch / 2 + 84);
}

function drawWin(ctx, cw, ch, state) {
  dim(ctx, cw, ch);
  ctx.fillStyle = '#ffd970';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAWN BREAKS', cw / 2, ch / 2 - 60);
  ctx.fillStyle = '#e8d6b4';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('All three artifacts are back in their cases — and nobody saw a thing.', cw / 2, ch / 2 - 16);
  const mm = Math.floor(state.time / 60);
  const ss = Math.floor(state.time % 60);
  ctx.fillText(`Finished in ${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} — unseen from door to door.`, cw / 2, ch / 2 + 16);
  ctx.fillStyle = '#b8e6c8';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('Press R or click to play again', cw / 2, ch / 2 + 64);
}
