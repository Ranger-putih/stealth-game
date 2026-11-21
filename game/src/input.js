// The Quiet Gallery — keyboard and mouse input.
//
// Tracks the keys the game cares about. WASD and the arrow keys move, Shift
// walks slow and quiet, E picks up an artifact, Enter starts the game, R
// restarts after being caught or after winning. Clicking also starts.

export class Input {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set(); // keys pressed since the last consume
    this.clicked = false;
    this.onKeyDown = (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }
      if (!event.repeat) this.pressed.add(key);
      this.keys.add(key);
    };
    this.onKeyUp = (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      this.keys.delete(key);
    };
    this.onMouseDown = () => {
      this.clicked = true;
    };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousedown', this.onMouseDown);
  }

  // True while the key is held down.
  down(key) {
    return this.keys.has(key);
  }

  // True once per press; clears after being read.
  consume(key) {
    if (this.pressed.has(key)) {
      this.pressed.delete(key);
      return true;
    }
    return false;
  }

  // True once per click; clears after being read.
  consumeClick() {
    if (this.clicked) {
      this.clicked = false;
      return true;
    }
    return false;
  }

  // Movement vector from WASD / arrows, normalized. Zero when idle.
  moveVector() {
    let x = 0;
    let y = 0;
    if (this.down('a') || this.down('ArrowLeft')) x -= 1;
    if (this.down('d') || this.down('ArrowRight')) x += 1;
    if (this.down('w') || this.down('ArrowUp')) y -= 1;
    if (this.down('s') || this.down('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  // Slow/quiet walk while either Shift key is held.
  get slow() {
    return this.down('Shift');
  }

  // Drop one-frame press records (used when changing screens).
  clearPresses() {
    this.pressed.clear();
    this.clicked = false;
  }
}
