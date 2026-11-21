// The Quiet Gallery — level layout and tuning constants.
//
// One museum floor, seen from above. The world is 1280 by 720 units. Walls and
// display cases block movement and block a guard's line of sight; statues block
// both too. Shadow zones are dark floor where a guard spots the archivist much
// more slowly. All positions are fixed, so every playthrough starts the same.

export const WORLD_W = 1280;
export const WORLD_H = 720;
export const WALL = 16;

// Outer border walls (top, right, bottom, left), with a gap in the bottom wall
// where the exit door sits.
export const WALLS = [
  { x: 0, y: 0, w: WORLD_W, h: WALL },
  { x: WORLD_W - WALL, y: 0, w: WALL, h: WORLD_H },
  { x: 0, y: WORLD_H - WALL, w: 560, h: WALL },
  { x: 640, y: WORLD_H - WALL, w: WORLD_W - 640, h: WALL },
  { x: 0, y: 0, w: WALL, h: WORLD_H },
  // Interior partition walls: the Grand Hall divider, the East Wing divider,
  // and two short gallery walls that make the patrol routes interesting.
  { x: 400, y: WALL, w: WALL, h: 284 },
  { x: 880, y: 420, w: WALL, h: 284 },
  { x: 560, y: 220, w: 320, h: WALL },
  { x: 120, y: 460, w: 280, h: WALL },
];

// Display cases: glass-topped plinths the archivist can duck behind. They are
// cover — a guard cannot see through them.
export const CASES = [
  { x: 200, y: 150, w: 92, h: 52, label: 'Coins' },
  { x: 560, y: 120, w: 92, h: 52, label: 'Vases' },
  { x: 1000, y: 150, w: 92, h: 52, label: 'Masks' },
  { x: 620, y: 380, w: 92, h: 52, label: 'Scrolls' },
  { x: 1020, y: 480, w: 92, h: 52, label: 'Relics' },
  { x: 240, y: 560, w: 92, h: 52, label: 'Maps' },
];

// Statues on round plinths: solid cover, round so sight slides around them.
export const STATUES = [
  { x: 320, y: 360, r: 26, name: 'Owl' },
  { x: 760, y: 540, r: 26, name: 'Fox' },
  { x: 1120, y: 330, r: 26, name: 'Heron' },
];

// Shadow zones: pools of dark floor under unlit arches. Standing in one makes
// the detection meter rise far more slowly.
export const SHADOWS = [
  { x: 80, y: 80, w: 180, h: 140 },
  { x: 960, y: 560, w: 220, h: 120 },
  { x: 480, y: 520, w: 160, h: 120 },
];

// The three borrowed artifacts to return to their cases.
export const ARTIFACTS = [
  { id: 'sun', name: 'Sun Disk', x: 1080, y: 100 },
  { id: 'jade', name: 'Jade Mask', x: 700, y: 640 },
  { id: 'moon', name: 'Moon Scroll', x: 150, y: 300 },
];

// The exit door: a gap in the bottom wall, bottom-left. It only opens once all
// three artifacts are back in their cases.
export const EXIT = { x: 560, y: WORLD_H - WALL, w: 80, h: WALL };

// Where the night archivist starts: just inside the exit door.
export const PLAYER_START = { x: 600, y: 660 };

// The three night guards and their patrol loops (waypoints, in order).
export const GUARDS = [
  {
    name: 'Mara',
    color: '#e8b64c',
    patrol: [
      { x: 480, y: 200 },
      { x: 800, y: 200 },
      { x: 800, y: 420 },
      { x: 480, y: 420 },
    ],
  },
  {
    name: 'Bram',
    color: '#7fb3e8',
    patrol: [
      { x: 980, y: 200 },
      { x: 1180, y: 200 },
      { x: 1180, y: 560 },
      { x: 980, y: 560 },
    ],
  },
  {
    name: 'Ilsa',
    color: '#c98ae8',
    patrol: [
      { x: 140, y: 120 },
      { x: 340, y: 120 },
      { x: 340, y: 560 },
      { x: 140, y: 560 },
    ],
  },
];

// Tuning: speeds are units per second, detection is meter points per second.
export const TUNING = {
  playerWalk: 170,
  playerSlow: 92,
  guardPatrol: 56,
  guardSuspicious: 78,
  guardChase: 152,
  guardCatchRadius: 26,
  playerRadius: 13,
  guardRadius: 14,
  coneRange: 265,
  coneHalfAngle: 0.61, // ~35 degrees each side
  detectBase: 58, // meter per second, point-blank in the light, walking
  detectSlowMult: 0.55, // walking slow and quiet
  detectRunMult: 1.5, // moving at full speed (noisy)
  detectShadowMult: 0.42, // standing in a shadow zone
  detectDecay: 26, // meter per second while unseen
  suspiciousAt: 35, // meter where a guard grows suspicious (?)
  alertAt: 100, // meter where a guard gives chase (!)
  alertMemory: 3.0, // seconds a guard keeps chasing after losing sight
  pickupRadius: 34,
  footstepInterval: 0.42, // seconds between footstep sounds while moving
};
