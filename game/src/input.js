// Keyboard and mouse state. Movement keys, run, sneak and restart are
// read as a plain snapshot each frame; coin throws arrive as clicks
// carrying a world position.

export function createInput(canvas) {
  const keys = new Set();
  const clicks = [];
  let mouse = { x: 0, y: 0 };

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  function toWorld(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  canvas.addEventListener('mousemove', (event) => { mouse = toWorld(event); });
  canvas.addEventListener('mousedown', (event) => {
    const point = toWorld(event);
    clicks.push(point);
    mouse = point;
  });

  return {
    axis() {
      let x = 0;
      let y = 0;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;
      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },
    running() { return keys.has('shift'); },
    sneaking() { return keys.has('c') || keys.has('control'); },
    pressed(key) { return keys.has(key); },
    takeClicks() { return clicks.splice(0, clicks.length); },
    mousePosition() { return mouse; },
  };
}
