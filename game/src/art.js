'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Procedural art: one job, every sea creature and prop, drawn
   with canvas paths only. No image files, no network.
   Every helper draws in panel-local coordinates (600 x 540). */

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* Five-point star, used for starfish. */
function starPath(ctx, x, y, rOuter, rInner, points, rot) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = rot + (i * Math.PI) / points;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/* A fish: body, tail, stripes, eye. flip=true faces left. */
function drawFish(ctx, x, y, s, body, belly, stripes, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  /* Tail. */
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-44, -14);
  ctx.lineTo(-44, 14);
  ctx.closePath();
  ctx.fill();
  /* Body. */
  ctx.fillStyle = body;
  ellipse(ctx, 0, 0, 30, 16);
  /* Belly. */
  ctx.fillStyle = belly;
  ellipse(ctx, 2, 6, 24, 9);
  /* Stripes. */
  ctx.fillStyle = stripes;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.ellipse(-4 + i * 12, -2, 4, 14, 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  /* Eye. */
  ctx.fillStyle = '#ffffff';
  circle(ctx, 18, -4, 5);
  ctx.fillStyle = '#10202e';
  circle(ctx, 19, -4, 2.5);
  /* Fin. */
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-2, -14);
  ctx.quadraticCurveTo(8, -26, 14, -14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* A branching coral: trunk + arms, round caps, slight glow at tips. */
function drawCoral(ctx, x, y, h, color, tip, seed) {
  const rng = makeRng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  function branch(bx, by, ang, len, w) {
    if (len < 12 || w < 1) return;
    const ex = bx + Math.cos(ang) * len;
    const ey = by + Math.sin(ang) * len;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(ang + 0.3) * len * 0.5,
      by + Math.sin(ang + 0.3) * len * 0.5,
      ex, ey
    );
    ctx.stroke();
    const n = 2 + Math.floor(rng() * 2);
    for (let i = 0; i < n; i++) {
      branch(ex, ey, ang + (rng() - 0.5) * 1.7, len * rngRange(rng, 0.45, 0.65), w * 0.62);
    }
    if (len < 26) {
      ctx.fillStyle = tip;
      circle(ctx, ex, ey, 3.2);
    }
  }
  branch(0, 0, -Math.PI / 2, h, 11);
  ctx.restore();
}

/* A fan coral: flat, ribbed, like a sea fan. */
function drawFanCoral(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let i = -5; i <= 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * 0.85;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * w * 0.45, Math.sin(a) * h * 0.55, Math.cos(a) * w * 0.5, Math.sin(a) * h * 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  for (let r = 0.3; r < 1; r += 0.22) {
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.5 * r, -Math.PI - 0.15, -0.15);
    ctx.stroke();
  }
  ctx.restore();
}

/* Swaying seaweed blades. */
function drawSeaweed(ctx, x, y, blades, h, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  for (let i = 0; i < blades; i++) {
    const bx = (i - (blades - 1) / 2) * 13;
    const sway = (i % 2 === 0 ? 1 : -1) * 10;
    const bh = h * (0.75 + (i % 3) * 0.14);
    ctx.strokeStyle = color;
    ctx.lineWidth = 8 - (i % 3);
    ctx.beginPath();
    ctx.moveTo(bx, 0);
    ctx.quadraticCurveTo(bx + sway * 0.4, -bh * 0.55, bx + sway, -bh);
    ctx.stroke();
  }
  ctx.restore();
}

/* A starfish, color given. */
function drawStarfish(ctx, x, y, r, color, rot) {
  ctx.save();
  ctx.fillStyle = color;
  starPath(ctx, x, y, r, r * 0.45, 5, rot || -Math.PI / 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 5; i++) {
    const a = (rot || -Math.PI / 2) + (i * Math.PI * 2) / 5;
    circle(ctx, x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, r * 0.09);
  }
  ctx.restore();
}

/* A scallop shell, fanned ribs. */
function drawShell(ctx, x, y, s, color, open) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 26, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.sin((i / 3) * 1.1) * 24, -Math.cos((i / 3) * 1.1) * 24);
    ctx.stroke();
  }
  if (open) {
    ctx.fillStyle = '#fff6d8';
    ellipse(ctx, 0, -6, 14, 5);
    ctx.fillStyle = '#e8b4d8';
    circle(ctx, 0, -8, 5);
  }
  ctx.restore();
}

/* A rock: rounded grey blob with a darker base. */
function drawRock(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y - ry * 0.25, rx * 0.7, ry * 0.45, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

/* A bubble with a bright highlight. */
function drawBubble(ctx, x, y, r) {
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  circle(ctx, x - r * 0.35, y - r * 0.35, r * 0.28);
}

/* A rising column of bubbles, count given. */
function drawBubbleColumn(ctx, x, y, count, spread) {
  for (let i = 0; i < count; i++) {
    const bx = x + Math.sin(i * 1.3) * (spread || 6);
    const by = y - i * 26;
    drawBubble(ctx, bx, by, 7 - (i % 3));
  }
}

/* Sun rays from the top of the water. */
function drawSunRays(ctx, topX, count, alpha) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,220,' + alpha + ')';
  for (let i = 0; i < count; i++) {
    const x0 = topX + (i - count / 2) * 90;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0 + 34, 0);
    ctx.lineTo(x0 + 110, 540);
    ctx.lineTo(x0 + 40, 540);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/* Sandy floor with speckles (seeded, identical on both panels). */
function drawSandFloor(ctx, topY, light, dark, seed) {
  const rng = makeRng(seed);
  const g = ctx.createLinearGradient(0, topY, 0, 540);
  g.addColorStop(0, light);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, topY + 14);
  ctx.quadraticCurveTo(150, topY - 8, 300, topY + 8);
  ctx.quadraticCurveTo(450, topY + 20, 600, topY + 4);
  ctx.lineTo(600, 540);
  ctx.lineTo(0, 540);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(120,90,40,0.35)';
  for (let i = 0; i < 46; i++) {
    const px = rng() * 600;
    const py = topY + 20 + rng() * (540 - topY - 26);
    circle(ctx, px, py, 1 + rng() * 1.6);
  }
}

/* A sea turtle, swimming. */
function drawTurtle(ctx, x, y, s, shellColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  /* Flippers. */
  ctx.fillStyle = '#3f9e6b';
  ellipse(ctx, -34, 12, 20, 8);
  ellipse(ctx, 34, 12, 20, 8);
  ellipse(ctx, -30, -14, 16, 6);
  ellipse(ctx, 30, -14, 16, 6);
  /* Shell. */
  ctx.fillStyle = shellColor;
  ellipse(ctx, 0, 0, 46, 30);
  ctx.strokeStyle = '#e8d28a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 20, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.lineTo(34, 0);
  ctx.stroke();
  /* Head. */
  ctx.fillStyle = '#3f9e6b';
  ellipse(ctx, 56, -2, 14, 10);
  ctx.fillStyle = '#10202e';
  circle(ctx, 62, -5, 2.4);
  ctx.restore();
}

/* A jellyfish: glowing dome + wavy tentacles. */
function drawJellyfish(ctx, x, y, s, color, glow) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 26, Math.PI, 0);
  ctx.quadraticCurveTo(26, 10, 18, 8);
  ctx.quadraticCurveTo(9, 16, 0, 8);
  ctx.quadraticCurveTo(-9, 16, -18, 8);
  ctx.quadraticCurveTo(-26, 10, -26, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 9, 8);
    ctx.quadraticCurveTo(i * 9 + 6, 30, i * 9 - 4, 48);
    ctx.stroke();
  }
  ctx.restore();
}

/* A sea anemone with a clownfish tucked in. */
function drawAnemone(ctx, x, y, s, color, tentacles) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  for (let i = 0; i < tentacles; i++) {
    const a = -Math.PI / 2 + ((i / (tentacles - 1)) - 0.5) * 2.4;
    const len = 34 + (i % 3) * 7;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * len * 0.5, Math.sin(a) * len * 0.6, Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();
    ctx.fillStyle = '#ffe9a8';
    circle(ctx, Math.cos(a) * len, Math.sin(a) * len, 3);
  }
  ctx.fillStyle = '#7a4a2b';
  ellipse(ctx, 0, 4, 20, 8);
  ctx.restore();
}

/* A small clownfish. */
function drawClownfish(ctx, x, y, s, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.fillStyle = '#ff7f2a';
  ellipse(ctx, 0, 0, 20, 11);
  ctx.fillStyle = '#ff7f2a';
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(-28, -9);
  ctx.lineTo(-28, 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-8, -11, 4, 22);
  ctx.fillRect(6, -10, 3, 20);
  ctx.fillStyle = '#10202e';
  circle(ctx, 13, -3, 2.2);
  ctx.restore();
}

/* An octopus: dome head + wavy arms. */
function drawOctopus(ctx, x, y, s, color, arms) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < arms; i++) {
    const spread = (i / (arms - 1) - 0.5) * 110;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.quadraticCurveTo(spread * 0.5, 34, spread, 52 + (i % 2) * 8);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -6, 26, Math.PI, 0);
  ctx.quadraticCurveTo(26, 12, 12, 12);
  ctx.lineTo(-12, 12);
  ctx.quadraticCurveTo(-26, 12, -26, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  circle(ctx, -10, -12, 5);
  circle(ctx, 10, -12, 5);
  ctx.fillStyle = '#10202e';
  circle(ctx, -9, -12, 2.5);
  circle(ctx, 11, -12, 2.5);
  ctx.restore();
}

/* A treasure chest, open or shut, with gold coins. */
function drawChest(ctx, x, y, s, open, coins) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  /* Coins spilling. */
  ctx.fillStyle = '#ffd23e';
  for (let i = 0; i < coins; i++) {
    const cx = -30 + (i % 5) * 13;
    const cy = 16 - Math.floor(i / 5) * 9;
    circle(ctx, cx, cy, 6);
  }
  ctx.strokeStyle = '#c8932a';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < coins; i++) {
    const cx = -30 + (i % 5) * 13;
    const cy = 16 - Math.floor(i / 5) * 9;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  /* Box. */
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-34, -6, 68, 30);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(-34, -6, 68, 8);
  ctx.fillStyle = '#ffd23e';
  ctx.fillRect(-4, -2, 8, 26);
  if (open) {
    ctx.fillStyle = '#5d3a1e';
    ctx.beginPath();
    ctx.moveTo(-34, -6);
    ctx.quadraticCurveTo(-34, -34, 0, -34);
    ctx.quadraticCurveTo(34, -34, 34, -6);
    ctx.lineTo(24, -6);
    ctx.quadraticCurveTo(24, -24, 0, -24);
    ctx.quadraticCurveTo(-24, -24, -24, -6);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#5d3a1e';
    ctx.beginPath();
    ctx.moveTo(-34, -6);
    ctx.quadraticCurveTo(-34, -28, 0, -28);
    ctx.quadraticCurveTo(34, -28, 34, -6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/* A small crab on a rock. */
function drawCrab(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 10, 6);
    ctx.lineTo(i * 16, 16);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ellipse(ctx, 0, 0, 18, 11);
  ctx.fillStyle = color;
  circle(ctx, -20, -8, 6);
  circle(ctx, 20, -8, 6);
  ctx.fillStyle = '#10202e';
  circle(ctx, -7, -6, 2);
  circle(ctx, 7, -6, 2);
  ctx.restore();
}

/* A seahorse, upright, curled tail. */
function drawSeahorse(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(14, 6, 6, -8);
  ctx.quadraticCurveTo(0, -20, -6, -26);
  ctx.stroke();
  /* Head. */
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-6, -26);
  ctx.quadraticCurveTo(-20, -30, -18, -20);
  ctx.quadraticCurveTo(-12, -14, -4, -18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#10202e';
  circle(ctx, -13, -24, 2);
  /* Back fin. */
  ctx.fillStyle = '#ffb3c8';
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.quadraticCurveTo(20, -2, 12, 8);
  ctx.closePath();
  ctx.fill();
  /* Belly stripes. */
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-2, 8 - i * 7);
    ctx.lineTo(8, 6 - i * 7);
    ctx.stroke();
  }
  ctx.restore();
}

/* A glowing crystal cluster. */
function drawCrystal(ctx, x, y, s, color, glow) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
  }
  const shards = [[-16, 0, 26], [0, -6, 44], [16, 0, 30], [8, 4, 18]];
  shards.forEach(function (sh) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(sh[0] - 7, sh[1] + 14);
    ctx.lineTo(sh[0], sh[1] - sh[2]);
    ctx.lineTo(sh[0] + 7, sh[1] + 14);
    ctx.closePath();
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(-2, -48);
  ctx.lineTo(2, -48);
  ctx.lineTo(4, -12);
  ctx.lineTo(-2, -12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* An anglerfish: dark body, glowing lure. */
function drawAnglerfish(ctx, x, y, s, lureOn, teeth) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  /* Lure stalk + glow. */
  ctx.strokeStyle = '#2a2f45';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, -16);
  ctx.quadraticCurveTo(-22, -34, -30, -40);
  ctx.stroke();
  if (lureOn) {
    ctx.shadowColor = '#7df9ff';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#aefcff';
    circle(ctx, -30, -40, 6);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#3a4157';
    circle(ctx, -30, -40, 4);
  }
  /* Body. */
  ctx.fillStyle = '#232838';
  ellipse(ctx, 0, 0, 30, 22);
  /* Mouth + teeth. */
  ctx.fillStyle = '#0c0e18';
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.quadraticCurveTo(28, 6, 26, 12);
  ctx.quadraticCurveTo(14, 16, 8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < teeth; i++) {
    const tx = 14 + i * 5;
    ctx.beginPath();
    ctx.moveTo(tx, 6);
    ctx.lineTo(tx + 2.5, 12);
    ctx.lineTo(tx + 5, 6);
    ctx.closePath();
    ctx.fill();
  }
  /* Eye. */
  ctx.fillStyle = '#ffd23e';
  circle(ctx, 12, -8, 4);
  ctx.fillStyle = '#10202e';
  circle(ctx, 13, -8, 2);
  /* Tail. */
  ctx.fillStyle = '#232838';
  ctx.beginPath();
  ctx.moveTo(-28, 0);
  ctx.lineTo(-44, -10);
  ctx.lineTo(-44, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* A whale silhouette in the deep, with barnacles on its back. */
function drawWhale(ctx, x, y, s, barnacles) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#1b3a5c';
  /* Body. */
  ctx.beginPath();
  ctx.moveTo(-150, 0);
  ctx.quadraticCurveTo(-120, -52, -30, -48);
  ctx.quadraticCurveTo(80, -44, 130, -10);
  ctx.quadraticCurveTo(150, 4, 128, 14);
  ctx.quadraticCurveTo(60, 44, -40, 40);
  ctx.quadraticCurveTo(-120, 36, -150, 0);
  ctx.closePath();
  ctx.fill();
  /* Tail fluke. */
  ctx.beginPath();
  ctx.moveTo(-148, -2);
  ctx.quadraticCurveTo(-190, -34, -205, -30);
  ctx.quadraticCurveTo(-185, -6, -178, 4);
  ctx.quadraticCurveTo(-190, 22, -204, 26);
  ctx.quadraticCurveTo(-180, 34, -150, 12);
  ctx.closePath();
  ctx.fill();
  /* Belly. */
  ctx.fillStyle = '#274b73';
  ctx.beginPath();
  ctx.moveTo(-120, 18);
  ctx.quadraticCurveTo(-20, 44, 110, 12);
  ctx.quadraticCurveTo(40, 40, -60, 36);
  ctx.closePath();
  ctx.fill();
  /* Eye. */
  ctx.fillStyle = '#dfeefc';
  circle(ctx, 96, -14, 5);
  ctx.fillStyle = '#0a1420';
  circle(ctx, 97, -14, 2.5);
  /* Barnacles. */
  ctx.fillStyle = '#c8d4de';
  for (let i = 0; i < barnacles; i++) {
    circle(ctx, -60 + i * 26, -46 + (i % 2) * 5, 4);
  }
  ctx.restore();
}

/* A hydrothermal vent chimney with a smoke plume. */
function drawVent(ctx, x, y, s, plume) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#3d3a4a';
  ctx.beginPath();
  ctx.moveTo(-16, 40);
  ctx.lineTo(-10, -30);
  ctx.lineTo(-4, -44);
  ctx.lineTo(6, -44);
  ctx.lineTo(12, -30);
  ctx.lineTo(18, 40);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#57536b';
  ctx.beginPath();
  ctx.moveTo(-10, -30);
  ctx.lineTo(-4, -44);
  ctx.lineTo(6, -44);
  ctx.lineTo(12, -30);
  ctx.closePath();
  ctx.fill();
  if (plume) {
    ctx.fillStyle = 'rgba(210,220,235,0.5)';
    const puffs = [[0, -58, 10], [-8, -78, 13], [6, -96, 16], [-4, -118, 19]];
    puffs.forEach(function (p) {
      circle(ctx, p[0], p[1], p[2]);
    });
  }
  ctx.restore();
}

/* A shipwreck: broken hull, mast, sail. */
function drawWreck(ctx, x, y, s, opts) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  /* Hull. */
  ctx.fillStyle = '#5a3a22';
  ctx.beginPath();
  ctx.moveTo(-150, 0);
  ctx.lineTo(150, 0);
  ctx.lineTo(120, 44);
  ctx.lineTo(-110, 44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7a5230';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-140 + i * 72, 8, 62, 5);
  }
  /* Portholes. */
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = opts.portholeLit ? '#ffd23e' : '#2a1c10';
    circle(ctx, -90 + i * 80, 22, 9);
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-90 + i * 80, 22, 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  /* Mast. */
  ctx.strokeStyle = '#4a2f18';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -150);
  ctx.stroke();
  /* Sail (torn when opts.sailTorn). */
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(0, -146);
  ctx.lineTo(opts.sailTorn ? 62 : 88, -96);
  ctx.lineTo(0, -58);
  ctx.closePath();
  ctx.fill();
  if (opts.sailTorn) {
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.moveTo(70, -104);
    ctx.lineTo(88, -96);
    ctx.lineTo(74, -80);
    ctx.closePath();
    ctx.fill();
  }
  /* Flag. */
  if (!opts.flagGone) {
    ctx.fillStyle = '#e33e3e';
    ctx.beginPath();
    ctx.moveTo(0, -150);
    ctx.lineTo(34, -142);
    ctx.lineTo(0, -134);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/* A moray eel peeking from a hole. */
function drawEel(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = '#4a7a5c';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.quadraticCurveTo(-14, -14, 4, -34);
  ctx.quadraticCurveTo(14, -46, 8, -56);
  ctx.stroke();
  ctx.fillStyle = '#4a7a5c';
  ellipse(ctx, 8, -58, 9, 7);
  ctx.fillStyle = '#ffffff';
  circle(ctx, 10, -60, 2.4);
  ctx.fillStyle = '#10202e';
  circle(ctx, 11, -60, 1.2);
  ctx.restore();
}

/* A tiny school of fish: count given. */
function drawSchool(ctx, x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const fx = x + (i % 3) * 26 - 26;
    const fy = y + Math.floor(i / 3) * 20 - 10 + (i % 2) * 8;
    drawFish(ctx, fx, fy, 0.32, color, '#cfe9f2', color, i % 2 === 0);
  }
}

/* A clam with a pearl inside, open or shut. */
function drawClam(ctx, x, y, s, open, pearl) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#b98ad4';
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.quadraticCurveTo(0, open ? -30 : -8, 26, 0);
  ctx.quadraticCurveTo(0, 12, -26, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5fb0';
  ctx.beginPath();
  ctx.moveTo(-26, 2);
  ctx.quadraticCurveTo(0, 16, 26, 2);
  ctx.quadraticCurveTo(0, 22, -26, 2);
  ctx.closePath();
  ctx.fill();
  if (open && pearl) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    circle(ctx, 0, -8, 6);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
