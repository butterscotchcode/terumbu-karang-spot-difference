'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Game state: one job, the rules — scenes, timer, score, hints.
   No drawing here, no DOM here: pure state transitions. */

function totalDiffsAll() {
  return SCENES.reduce(function (n, s) { return n + s.diffs.length; }, 0);
}

function createGame() {
  return {
    screen: 'title', /* title | playing | sceneClear | end */
    sceneIndex: 0,
    found: [], /* diff ids found in the current scene */
    totalFound: 0,
    score: 0,
    timeLeft: 0,
    hintsLeft: HINTS_PER_SCENE,
    hint: null, /* { diff, until } — a pulsing ring, not an auto-find */
    wrongMarks: [], /* { x, y, panel, until } */
    pops: [], /* { diff, at } — marker pop animation start times */
    message: '',
    messageUntil: 0,
    sceneClearAt: 0,
    sceneBonus: 0,
    endReason: '', /* complete | timeout */
    endScore: 0,
    demo: false, /* staging mode: timer frozen, for screenshots */
    now: 0,
  };
}

function currentScene(state) {
  return SCENES[state.sceneIndex];
}

function remainingInScene(state) {
  return currentScene(state).diffs.length - state.found.length;
}

function allDiffIds(scene) {
  return scene.diffs.map(function (d) { return d.id; });
}

function startGame(state) {
  state.screen = 'playing';
  state.sceneIndex = 0;
  state.totalFound = 0;
  state.score = 0;
  startScene(state);
}

function startScene(state) {
  const scene = currentScene(state);
  state.screen = 'playing';
  state.found = [];
  state.timeLeft = scene.timeLimit;
  state.hintsLeft = HINTS_PER_SCENE;
  state.hint = null;
  state.wrongMarks = [];
  state.pops = [];
  state.message = scene.name + ' — cari ' + scene.diffs.length + ' perbedaan!';
  state.messageUntil = state.now + 2500;
}

/* A click inside a panel, panel-local coords. Returns what happened. */
function clickPanel(state, panel, x, y) {
  if (state.screen !== 'playing') return 'none';
  const scene = currentScene(state);
  for (const diff of scene.diffs) {
    if (state.found.indexOf(diff.id) >= 0) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.push(diff.id);
      state.totalFound++;
      state.score += FIND_SCORE;
      state.pops.push({ diff: diff, at: state.now });
      state.message = 'Ketemu! +' + FIND_SCORE + ' — ' + diff.label;
      state.messageUntil = state.now + 1800;
      sfxFound();
      if (state.found.length === scene.diffs.length) {
        state.sceneBonus = Math.round(state.timeLeft) * SCENE_TIME_BONUS_PER_SECOND;
        state.score += state.sceneBonus;
        state.screen = 'sceneClear';
        state.sceneClearAt = state.now;
        sfxSceneClear();
      }
      return 'found';
    }
  }
  /* Wrong spot: small penalty, red mark, time lost. */
  state.score = Math.max(0, state.score - WRONG_CLICK_SCORE_PENALTY);
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_TIME_PENALTY);
  state.wrongMarks.push({ x: x, y: y, panel: panel, until: state.now + 700 });
  state.message = 'Bukan di situ! -' + WRONG_CLICK_TIME_PENALTY + ' detik';
  state.messageUntil = state.now + 1500;
  sfxWrong();
  return 'wrong';
}

/* Spend a hint: pulse a ring around one unfound difference. */
function useHint(state) {
  if (state.screen !== 'playing') return false;
  if (state.hintsLeft <= 0) {
    state.message = 'Hint habis untuk scene ini!';
    state.messageUntil = state.now + 1500;
    return false;
  }
  const scene = currentScene(state);
  const unfound = scene.diffs.filter(function (d) { return state.found.indexOf(d.id) < 0; });
  if (unfound.length === 0) return false;
  state.hintsLeft--;
  state.score = Math.max(0, state.score - HINT_COST);
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  state.hint = { diff: pick, until: state.now + 3000 };
  state.message = 'Hint: lihat lingkaran kuning! -' + HINT_COST + ' poin';
  state.messageUntil = state.now + 2000;
  sfxHint();
  return true;
}

/* Advance from the scene-clear overlay to the next scene (or the end). */
function advanceScene(state) {
  if (state.screen !== 'sceneClear') return;
  if (state.sceneIndex + 1 >= SCENES.length) {
    state.screen = 'end';
    state.endReason = 'complete';
    state.endScore = state.score;
    return;
  }
  state.sceneIndex++;
  startScene(state);
}

/* Per-frame tick: countdown, expiry of marks, auto-advance. */
function tickGame(state, dtMs) {
  if (state.screen === 'playing' && !state.demo) {
    state.timeLeft -= dtMs / 1000;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'end';
      state.endReason = 'timeout';
      state.endScore = state.score;
      sfxTimeout();
    }
  }
  if (state.screen === 'sceneClear' && state.now - state.sceneClearAt > 2200) {
    advanceScene(state);
  }
  state.wrongMarks = state.wrongMarks.filter(function (m) { return m.until > state.now; });
  state.pops = state.pops.filter(function (p) { return state.now - p.at < 900; });
  if (state.hint && state.hint.until <= state.now) state.hint = null;
}

/* Stars on the end screen: 1 per 12 finds, up to 3, plus a bonus star for a full clear. */
function endStars(state) {
  if (state.endReason !== 'complete') return state.totalFound >= 30 ? 2 : state.totalFound >= 15 ? 1 : 0;
  return 3;
}
