'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Boot: one job, start the loop and stage demo states.
   Demo params (for the maker's own screenshots, never for play):
     ?demo=cover  scene 1, 4 of 7 found, timer frozen at 120s
     ?demo=reef   scene 3, 5 of 9 found, timer frozen at 90s
     ?demo=deep   scene 5, 2 of 10 found, timer frozen at 40s
     ?demo=end    the end screen, all scenes cleared
     ?scene=N&found=0,2&time=90   generic staging (0-based indexes)
   In demo mode the timer never runs down. */

function parseDemo(state) {
  const q = new URLSearchParams(window.location.search);
  const demo = q.get('demo');
  if (!demo && !q.has('scene')) return;
  state.demo = true;
  startGame(state);
  if (demo === 'cover') {
    stageScene(state, 0, [0, 1, 2, 3], 120);
  } else if (demo === 'reef') {
    stageScene(state, 2, [0, 1, 2, 3, 4], 90);
  } else if (demo === 'deep') {
    stageScene(state, 4, [0, 1], 40);
  } else if (demo === 'end') {
    state.sceneIndex = SCENES.length - 1;
    state.screen = 'end';
    state.endReason = 'complete';
    state.totalFound = totalDiffsAll();
    state.score = 3850;
    state.endScore = 3850;
  } else if (q.has('scene')) {
    const idx = Math.max(0, Math.min(SCENES.length - 1, parseInt(q.get('scene'), 10) || 0));
    const found = (q.get('found') || '').split(',').filter(Boolean).map(Number);
    const time = parseInt(q.get('time'), 10) || 90;
    stageScene(state, idx, found, time);
  }
}

/* Put the game into a staged mid-play state for a screenshot. */
function stageScene(state, sceneIndex, foundIndexes, timeLeft) {
  state.sceneIndex = sceneIndex;
  startScene(state);
  const scene = currentScene(state);
  state.found = foundIndexes
    .filter(function (i) { return i >= 0 && i < scene.diffs.length; })
    .map(function (i) { return scene.diffs[i].id; });
  state.totalFound = SCENES.slice(0, sceneIndex).reduce(function (n, s) { return n + s.diffs.length; }, 0) + state.found.length;
  state.score = state.totalFound * FIND_SCORE;
  state.timeLeft = timeLeft;
  state.pops = state.found.map(function (id) {
    return { diff: scene.diffs.find(function (d) { return d.id === id; }), at: -1000 };
  });
  state.message = '';
}

function boot() {
  const canvas = document.getElementById('game');
  const context = canvas.getContext('2d');
  setCanvas(canvas, context);
  const state = createGame();
  attachInput(canvas, state);
  parseDemo(state);
  /* Exposed for debugging in the browser console. */
  window.__reef = state;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(100, now - last);
    last = now;
    state.now = now;
    tickGame(state, dt);
    render(state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

document.addEventListener('DOMContentLoaded', boot);
