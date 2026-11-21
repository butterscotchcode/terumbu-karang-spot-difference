'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Input: one job, mouse clicks and keyboard, mapped onto the
   game's buttons and panels. No game logic lives here beyond
   deciding what was clicked. */

function canvasCoords(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (CANVAS_W / rect.width),
    y: (clientY - rect.top) * (CANVAS_H / rect.height),
  };
}

function hitButton(buttons, x, y) {
  for (const b of buttons) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
  }
  return null;
}

function panelAt(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
  if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL_W) {
    return { name: 'left', x: x - PANEL_LEFT_X, y: y - PANEL_Y };
  }
  if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL_W) {
    return { name: 'right', x: x - PANEL_RIGHT_X, y: y - PANEL_Y };
  }
  return null;
}

function attachInput(canvas, state) {
  canvas.addEventListener('pointerdown', function (ev) {
    ensureAudio();
    const p = canvasCoords(canvas, ev.clientX, ev.clientY);
    const btn = hitButton(getButtons(), p.x, p.y);
    if (btn) {
      if (btn.id === 'start') startGame(state);
      else if (btn.id === 'hint') useHint(state);
      else if (btn.id === 'restart') startGame(state);
      return;
    }
    if (state.screen === 'sceneClear') {
      advanceScene(state);
      return;
    }
    if (state.screen !== 'playing') return;
    const panel = panelAt(p.x, p.y);
    if (!panel) return;
    clickPanel(state, panel.name, panel.x, panel.y);
  });

  window.addEventListener('keydown', function (ev) {
    if (ev.repeat) return;
    const key = ev.key.toLowerCase();
    if (key === 'h') {
      useHint(state);
    } else if (key === 'r') {
      startGame(state);
    } else if (key === 'enter' || key === ' ') {
      if (state.screen === 'title') startGame(state);
      else if (state.screen === 'sceneClear') advanceScene(state);
      else if (state.screen === 'end') startGame(state);
    }
  });
}
