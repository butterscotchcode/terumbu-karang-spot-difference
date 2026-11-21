'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Rendering: one job, everything the player sees — HUD, the two
   panels, markers, buttons, title / clear / end screens.
   Panel space is 600 x 540; the canvas is 1280 x 720. */

let canvas = null;
let ctx = null;

/* Clickable regions on the current screen, for input.js. */
let buttons = [];

function setCanvas(c, context) {
  canvas = c;
  ctx = context;
}

function getButtons() {
  return buttons;
}

function roundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* Format seconds as M:SS. */
function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/* Draw one panel: the scene, with `mods` applied. Clipped to its frame. */
function drawPanel(scene, mods, px) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(px, PANEL_Y);
  scene.draw(ctx, mods);
  ctx.restore();
  /* Frame. */
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 4;
  ctx.strokeRect(px + 2, PANEL_Y + 2, PANEL_W - 4, PANEL_H - 4);
}

/* A found marker: green ring + check, on both panels. */
function drawMarker(diff, px, popAge) {
  const x = px + diff.x;
  const y = PANEL_Y + diff.y;
  let r = diff.r + 7;
  if (popAge !== null && popAge < 300) {
    const k = popAge / 300;
    r = (diff.r + 7) * (0.6 + 0.55 * k);
  }
  ctx.save();
  ctx.shadowColor = MARKER_RING;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = MARKER_RING;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  /* Check mark. */
  ctx.strokeStyle = MARKER_CHECK;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.35);
  ctx.lineTo(x + r * 0.5, y - r * 0.35);
  ctx.stroke();
  ctx.restore();
}

/* The top bar: title, scene, the BIG remaining counter, score, timer. */
function drawHud(state) {
  const scene = currentScene(state);
  /* Bar background. */
  ctx.fillStyle = '#062a44';
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, HUD_H - 4, CANVAS_W, 4);
  /* Title, left. */
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(GAME_TITLE, 20, 24);
  ctx.fillStyle = '#9fd8e8';
  ctx.font = '15px Verdana, sans-serif';
  ctx.fillText(scene.name + '  •  Scene ' + (state.sceneIndex + 1) + ' dari ' + SCENES.length, 20, 52);
  /* Remaining counter, centre — the biggest text on screen. */
  const remaining = remainingInScene(state);
  const total = scene.diffs.length;
  ctx.textAlign = 'center';
  ctx.fillStyle = remaining === 0 ? '#2fe673' : '#ffd23e';
  ctx.font = 'bold 40px Verdana, sans-serif';
  ctx.fillText('SISA ' + remaining + ' / ' + total, CANVAS_W / 2, 30);
  ctx.fillStyle = '#cfe9f2';
  ctx.font = '14px Verdana, sans-serif';
  ctx.fillText('perbedaan belum ketemu', CANVAS_W / 2, 58);
  /* Score, right. */
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.fillText('SKOR ' + state.score, CANVAS_W - 20, 24);
  ctx.fillStyle = '#9fd8e8';
  ctx.font = '15px Verdana, sans-serif';
  ctx.fillText(fmtTime(state.timeLeft) + '  •  ' + state.totalFound + '/' + totalDiffsAll() + ' ketemu', CANVAS_W - 20, 52);
  /* Timer bar under the HUD. */
  const frac = Math.max(0, Math.min(1, state.timeLeft / scene.timeLimit));
  ctx.fillStyle = '#0a1c2e';
  ctx.fillRect(0, HUD_H, CANVAS_W, 10);
  ctx.fillStyle = frac > 0.5 ? '#2fe673' : frac > 0.2 ? '#ffd23e' : '#ff5252';
  ctx.fillRect(0, HUD_H, CANVAS_W * frac, 10);
  if (state.timeLeft <= 10 && state.screen === 'playing') {
    ctx.fillStyle = 'rgba(255,82,82,' + (0.25 + 0.2 * Math.sin(state.now / 120)) + ')';
    ctx.fillRect(0, HUD_H, CANVAS_W, 10);
  }
}

/* Bottom bar: hint button, scene dots, message line. */
function drawBottomBar(state) {
  ctx.fillStyle = '#062a44';
  ctx.fillRect(0, BOTTOM_Y, CANVAS_W, BOTTOM_H);
  /* Hint button. */
  const hb = { id: 'hint', x: 20, y: BOTTOM_Y + 14, w: 190, h: 44 };
  ctx.fillStyle = state.hintsLeft > 0 ? '#ffd23e' : '#5a6a76';
  roundRectPath(hb.x, hb.y, hb.w, hb.h, 10);
  ctx.fill();
  ctx.fillStyle = '#10202e';
  ctx.font = 'bold 19px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HINT  (' + state.hintsLeft + ')  -' + HINT_COST, hb.x + hb.w / 2, hb.y + hb.h / 2 + 1);
  /* Scene dots. */
  const cx = CANVAS_W / 2;
  for (let i = 0; i < SCENES.length; i++) {
    ctx.fillStyle = i < state.sceneIndex ? '#2fe673' : i === state.sceneIndex ? '#ffd23e' : '#3a5a72';
    circle(ctx, cx - 60 + i * 30, BOTTOM_Y + 22, i === state.sceneIndex ? 9 : 7);
  }
  /* Message line. */
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Verdana, sans-serif';
  ctx.textAlign = 'center';
  if (state.message && state.messageUntil > state.now) {
    ctx.fillText(state.message, cx, BOTTOM_Y + 52);
  } else {
    ctx.fillStyle = '#9fb8c8';
    ctx.fillText('Klik perbedaan pada gambar kanan — atau kiri, keduanya bisa!', cx, BOTTOM_Y + 52);
  }
  buttons = [hb];
}

/* Wrong-click red X marks, fading. */
function drawWrongMarks(state) {
  for (const m of state.wrongMarks) {
    const px = m.panel === 'left' ? PANEL_LEFT_X : PANEL_RIGHT_X;
    const x = px + m.x;
    const y = PANEL_Y + m.y;
    const a = Math.max(0, (m.until - state.now) / 700);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12);
    ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
    ctx.restore();
  }
}

/* The hint pulse ring on both panels. */
function drawHint(state) {
  if (!state.hint) return;
  const d = state.hint.diff;
  const pulse = 1 + 0.18 * Math.sin(state.now / 140);
  for (const px of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
    ctx.save();
    ctx.strokeStyle = HINT_RING;
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(px + d.x, PANEL_Y + d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/* The two panels during play, with all markers. */
function drawPlaying(state) {
  const scene = currentScene(state);
  const rightMods = new Set(allDiffIds(scene));
  const emptyMods = new Set();
  drawPanel(scene, emptyMods, PANEL_LEFT_X);
  drawPanel(scene, rightMods, PANEL_RIGHT_X);
  /* Panel labels. */
  ctx.fillStyle = 'rgba(6,42,68,0.85)';
  roundRectPath(PANEL_LEFT_X + 10, PANEL_Y + 10, 74, 30, 8);
  ctx.fill();
  roundRectPath(PANEL_RIGHT_X + 10, PANEL_Y + 10, 74, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KIRI', PANEL_LEFT_X + 47, PANEL_Y + 26);
  ctx.fillText('KANAN', PANEL_RIGHT_X + 47, PANEL_Y + 26);
  /* Found markers on both panels. */
  const popById = {};
  for (const p of state.pops) popById[p.diff.id] = state.now - p.at;
  for (const id of state.found) {
    const diff = scene.diffs.find(function (d) { return d.id === id; });
    if (!diff) continue;
    const age = id in popById ? popById[id] : null;
    drawMarker(diff, PANEL_LEFT_X, age);
    drawMarker(diff, PANEL_RIGHT_X, age);
  }
  drawHint(state);
  drawWrongMarks(state);
  drawHud(state);
  drawBottomBar(state);
}

/* Title screen: the reef, the name, how to play, start button. */
function drawTitle(state) {
  const scene = SCENES[0];
  drawPanel(scene, new Set(), PANEL_LEFT_X);
  drawPanel(scene, new Set(allDiffIds(scene)), PANEL_RIGHT_X);
  /* Dim the panels behind the card. */
  ctx.fillStyle = 'rgba(3,20,36,0.55)';
  ctx.fillRect(0, PANEL_Y, CANVAS_W, PANEL_H);
  /* Card. */
  const cw = 860;
  const ch = 430;
  const cx = (CANVAS_W - cw) / 2;
  const cy = PANEL_Y + (PANEL_H - ch) / 2;
  ctx.fillStyle = '#062a44';
  roundRectPath(cx, cy, cw, ch, 18);
  ctx.fill();
  ctx.strokeStyle = '#2fa8c9';
  ctx.lineWidth = 3;
  roundRectPath(cx, cy, cw, ch, 18);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 54px Verdana, sans-serif';
  ctx.fillText(GAME_TITLE, CANVAS_W / 2, cy + 62);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.fillText('Cari Perbedaannya', CANVAS_W / 2, cy + 112);
  ctx.fillStyle = '#cfe9f2';
  ctx.font = '18px Verdana, sans-serif';
  ctx.fillText('Dua gambar terumbu karang nyaris sama — 5 scene, 43 perbedaan tersembunyi.', CANVAS_W / 2, cy + 162);
  ctx.fillText('Klik perbedaan di gambar mana pun. Hint membantu, klik salah mengurangi waktu.', CANVAS_W / 2, cy + 192);
  ctx.fillText('Makin dalam menyelam, makin sulit dan makin cepat waktunya.', CANVAS_W / 2, cy + 222);
  ctx.fillStyle = '#9fd8e8';
  ctx.font = '16px Verdana, sans-serif';
  ctx.fillText('H = hint   •   R = mulai ulang   •   klik juga bisa', CANVAS_W / 2, cy + 268);
  /* Start button. */
  const sb = { id: 'start', x: CANVAS_W / 2 - 160, y: cy + 300, w: 320, h: 62 };
  ctx.fillStyle = '#2fe673';
  roundRectPath(sb.x, sb.y, sb.w, sb.h, 14);
  ctx.fill();
  ctx.fillStyle = '#062a44';
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.fillText('MULAI BERBURU', CANVAS_W / 2, sb.y + sb.h / 2 + 1);
  drawHudTitleBar(state);
  buttons = [sb];
}

/* A slim title bar on non-play screens so the game name stays visible. */
function drawHudTitleBar(state) {
  ctx.fillStyle = '#062a44';
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(GAME_TITLE + ' — ' + GAME_SUBTITLE, 20, 30);
  ctx.fillStyle = '#9fd8e8';
  ctx.font = '15px Verdana, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('5 scene  •  43 perbedaan  •  tanpa modal, murni ketelitian', CANVAS_W - 20, 30);
}

/* Scene-clear overlay. */
function drawSceneClear(state) {
  drawPlaying(state);
  ctx.fillStyle = 'rgba(3,20,36,0.6)';
  ctx.fillRect(0, PANEL_Y, CANVAS_W, PANEL_H);
  const scene = currentScene(state);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2fe673';
  ctx.font = 'bold 52px Verdana, sans-serif';
  ctx.fillText('Scene Selesai!', CANVAS_W / 2, 300);
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Verdana, sans-serif';
  ctx.fillText(scene.name + ' — semua ' + scene.diffs.length + ' perbedaan ketemu', CANVAS_W / 2, 360);
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 28px Verdana, sans-serif';
  ctx.fillText('Bonus waktu +' + state.sceneBonus + ' poin', CANVAS_W / 2, 410);
  ctx.fillStyle = '#cfe9f2';
  ctx.font = '18px Verdana, sans-serif';
  ctx.fillText(state.sceneIndex + 1 >= SCENES.length ? 'Klik untuk melihat hasil akhir' : 'Scene berikutnya segera dimulai — klik untuk lanjut', CANVAS_W / 2, 470);
}

/* End screen: score, finds, stars, play again. */
function drawEnd(state) {
  drawHudTitleBar(state);
  const cw = 860;
  const ch = 460;
  const cx = (CANVAS_W - cw) / 2;
  const cy = 130;
  ctx.fillStyle = '#062a44';
  roundRectPath(cx, cy, cw, ch, 18);
  ctx.fill();
  ctx.strokeStyle = '#2fa8c9';
  ctx.lineWidth = 3;
  roundRectPath(cx, cy, cw, ch, 18);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (state.endReason === 'complete') {
    ctx.fillStyle = '#2fe673';
    ctx.font = 'bold 48px Verdana, sans-serif';
    ctx.fillText('Semua Terumbu Dijelajahi!', CANVAS_W / 2, cy + 64);
  } else {
    ctx.fillStyle = '#ff5252';
    ctx.font = 'bold 48px Verdana, sans-serif';
    ctx.fillText('Waktu Habis!', CANVAS_W / 2, cy + 64);
  }
  /* Stars. */
  const stars = endStars(state);
  ctx.font = '52px Verdana, sans-serif';
  let starLine = '';
  for (let i = 0; i < 3; i++) starLine += i < stars ? '★' : '☆';
  ctx.fillStyle = '#ffd23e';
  ctx.fillText(starLine, CANVAS_W / 2, cy + 140);
  /* Numbers. */
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Verdana, sans-serif';
  ctx.fillText('SKOR AKHIR  ' + state.endScore, CANVAS_W / 2, cy + 216);
  ctx.fillStyle = '#cfe9f2';
  ctx.font = '22px Verdana, sans-serif';
  ctx.fillText(state.totalFound + ' dari ' + totalDiffsAll() + ' perbedaan ditemukan  •  ' + SCENES.length + ' scene', CANVAS_W / 2, cy + 262);
  ctx.fillStyle = '#9fd8e8';
  ctx.font = '18px Verdana, sans-serif';
  ctx.fillText(state.endReason === 'complete'
    ? 'Kamu menemukan semuanya — mata elang terumbu karang!'
    : 'Coba lagi — perbedaan yang tersisa masih menunggu.', CANVAS_W / 2, cy + 300);
  /* Play again button. */
  const rb = { id: 'restart', x: CANVAS_W / 2 - 150, y: cy + 340, w: 300, h: 60 };
  ctx.fillStyle = '#2fe673';
  roundRectPath(rb.x, rb.y, rb.w, rb.h, 14);
  ctx.fill();
  ctx.fillStyle = '#062a44';
  ctx.font = 'bold 24px Verdana, sans-serif';
  ctx.fillText('MAIN LAGI', CANVAS_W / 2, rb.y + rb.h / 2 + 1);
  buttons = [rb];
}

/* Top-level draw for one frame. */
function render(state) {
  ctx.fillStyle = '#062a44';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  buttons = [];
  if (state.screen === 'title') drawTitle(state);
  else if (state.screen === 'playing') drawPlaying(state);
  else if (state.screen === 'sceneClear') drawSceneClear(state);
  else if (state.screen === 'end') drawEnd(state);
}
