'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Scene definitions: one job, what each reef scene shows and
   where its differences hide.
   Every scene draws from ONE function: the left panel calls it
   with no mods, the right panel with every difference applied,
   so the panels are identical except for the differences.
   Panel space is 600 x 540. Diff coordinates are panel-local. */

/* Fill the panel with a vertical water gradient. */
function waterBackground(ctx, colors) {
  const g = ctx.createLinearGradient(0, 0, 0, 540);
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.55, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 540);
}

/* A wooden barrel, standing on the sand. */
function drawBarrel(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(-18, -26, 36, 52);
  ctx.fillStyle = '#9a6c40';
  ctx.beginPath();
  ctx.ellipse(0, -26, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(-18, -14, 36, 4);
  ctx.fillRect(-18, 8, 36, 4);
  ctx.restore();
}

/* A tiny pink shrimp, curled. */
function drawShrimp(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = '#ff9fb2';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.quadraticCurveTo(10, 10, 12, -6);
  ctx.quadraticCurveTo(12, -16, 4, -18);
  ctx.stroke();
  ctx.strokeStyle = '#ff9fb2';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(4, -18);
  ctx.lineTo(-6, -30);
  ctx.moveTo(6, -18);
  ctx.lineTo(10, -30);
  ctx.stroke();
  ctx.fillStyle = '#10202e';
  circle(ctx, 5, -17, 1.6);
  ctx.restore();
}

/* A sea cucumber lying on the sand. */
function drawSeaCucumber(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = -2; i <= 2; i++) {
    circle(ctx, i * 12, -4, 2.5);
  }
  ctx.restore();
}

/* Glowing plankton dots, seeded so both panels match. */
function drawPlankton(ctx, x, y, count, seed) {
  const rng = makeRng(seed);
  for (let i = 0; i < count; i++) {
    const px = x + (rng() - 0.5) * 70;
    const py = y + (rng() - 0.5) * 40;
    ctx.fillStyle = 'rgba(190,255,240,' + (0.5 + rng() * 0.5) + ')';
    ctx.shadowColor = '#7df9ff';
    ctx.shadowBlur = 8;
    circle(ctx, px, py, 2 + rng() * 2.5);
  }
  ctx.shadowBlur = 0;
}

/* Stalactites hanging from the top of a cave. */
function drawStalactites(ctx, count) {
  const xs = [120, 300, 480];
  ctx.fillStyle = '#2c4a6e';
  for (let i = 0; i < count; i++) {
    const x = xs[i];
    const h = 50 + (i % 2) * 22;
    ctx.beginPath();
    ctx.moveTo(x - 16, 0);
    ctx.lineTo(x + 16, 0);
    ctx.lineTo(x, h);
    ctx.closePath();
    ctx.fill();
  }
}

/* Cave walls framing the scene: dark rock on both sides. */
function drawCaveWalls(ctx) {
  ctx.fillStyle = '#0d2242';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(90, 0);
  ctx.quadraticCurveTo(60, 180, 80, 320);
  ctx.quadraticCurveTo(70, 440, 30, 540);
  ctx.lineTo(0, 540);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(600, 0);
  ctx.lineTo(510, 0);
  ctx.quadraticCurveTo(545, 200, 520, 340);
  ctx.quadraticCurveTo(540, 450, 570, 540);
  ctx.lineTo(600, 540);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(90, 0);
  ctx.quadraticCurveTo(60, 180, 80, 320);
  ctx.lineTo(30, 320);
  ctx.quadraticCurveTo(20, 160, 0, 60);
  ctx.closePath();
  ctx.fill();
}

const SCENES = [
  {
    id: 'lagoon',
    name: 'Laguna Dangkal',
    sub: 'Scene 1 dari 5 — air jernih, matahari menembus permukaan',
    timeLimit: 150,
    seed: 11,
    diffs: [
      { id: 'fish-extra', x: 480, y: 90, r: 26, label: 'ikan kuning kecil' },
      { id: 'star-color', x: 120, y: 470, r: 24, label: 'warna bintang laut' },
      { id: 'shell-gone', x: 300, y: 500, r: 26, label: 'kerang hilang' },
      { id: 'coral-extra', x: 548, y: 400, r: 26, label: 'karang kecil tambahan' },
      { id: 'bubble-more', x: 90, y: 78, r: 22, label: 'gelembung keempat' },
      { id: 'seaweed-tall', x: 100, y: 430, r: 24, label: 'rumput laut lebih tinggi' },
      { id: 'fish-stripe', x: 350, y: 200, r: 34, label: 'garis ikan bertambah' },
    ],
    draw: function drawLagoon(ctx, mods) {
      waterBackground(ctx, WATER.lagoon);
      drawSunRays(ctx, 300, 6, 0.16);
      drawSandFloor(ctx, 430, '#f2e2b8', '#d9c48f', 11);
      /* Seaweed cluster, left. */
      drawSeaweed(ctx, 60, 520, 5, 110, '#2e8b57');
      if (mods.has('seaweed-tall')) {
        ctx.strokeStyle = '#2e8b57';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(100, 520);
        ctx.quadraticCurveTo(112, 470, 100, 408);
        ctx.stroke();
      }
      /* Pink branching coral, right. */
      drawCoral(ctx, 520, 440, 95, '#ff7fa5', '#ffd1de', 12);
      if (mods.has('coral-extra')) drawCoral(ctx, 556, 442, 52, '#ff7fa5', '#ffd1de', 13);
      /* Big blue fish, centre. */
      drawFish(ctx, 350, 200, 1.1, '#3a9bd4', '#bfe6f5', '#1d6fa8', false);
      if (mods.has('fish-stripe')) {
        ctx.fillStyle = '#1d6fa8';
        ctx.beginPath();
        ctx.ellipse(362, 198, 4, 15, 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      /* Small yellow fish, upper left. */
      drawFish(ctx, 180, 120, 0.9, '#ffd23e', '#fff3b0', '#e8a91c', true);
      if (mods.has('fish-extra')) drawFish(ctx, 480, 90, 0.7, '#ffd23e', '#fff3b0', '#e8a91c', false);
      /* Bubble column, upper left. */
      drawBubbleColumn(ctx, 90, 150, mods.has('bubble-more') ? 4 : 3, 6);
      /* Starfish on the sand. */
      drawStarfish(ctx, 120, 470, 22, mods.has('star-color') ? '#b07fe8' : '#ff8c42', -0.4);
      /* Shell on the sand. */
      if (!mods.has('shell-gone')) drawShell(ctx, 300, 500, 1, '#ff9fb2', false);
      /* A lone rock with a tiny fan coral. */
      drawRock(ctx, 430, 505, 46, 22, '#8a8f96');
      drawFanCoral(ctx, 430, 500, 60, 70, '#e86aa8');
      /* Decorative fan coral + a tiny fish, identical on both panels. */
      drawFanCoral(ctx, 170, 512, 42, 52, '#c98ae8');
      drawFish(ctx, 520, 280, 0.6, '#ff9f5a', '#ffe8c8', '#d4712a', true);
    },
  },
  {
    id: 'garden',
    name: 'Taman Karang',
    sub: 'Scene 2 dari 5 — kebun karang warna-warni',
    timeLimit: 150,
    seed: 22,
    diffs: [
      { id: 'fan-color', x: 120, y: 380, r: 30, label: 'warna kipas karang' },
      { id: 'crab', x: 300, y: 460, r: 22, label: 'kepiting di batu' },
      { id: 'clown-extra', x: 232, y: 402, r: 20, label: 'ikan badut kedua' },
      { id: 'anemone-arm', x: 170, y: 392, r: 26, label: 'tentakel anemon' },
      { id: 'turtle-spot', x: 420, y: 170, r: 30, label: 'bintik di tempurung' },
      { id: 'star-move', x: 470, y: 490, r: 24, label: 'bintang laut pindah' },
      { id: 'school-count', x: 300, y: 120, r: 34, label: 'ikan kecil bertambah' },
      { id: 'clam-open', x: 80, y: 482, r: 24, label: 'kerang mutiara terbuka' },
    ],
    draw: function drawGarden(ctx, mods) {
      waterBackground(ctx, WATER.garden);
      drawSunRays(ctx, 200, 5, 0.12);
      drawSandFloor(ctx, 440, '#efe0ae', '#cbb27e', 22);
      /* Fan coral, left. */
      drawFanCoral(ctx, 120, 440, 90, 110, mods.has('fan-color') ? '#8a6fe8' : '#ff6fa5');
      /* Branching corals. */
      drawCoral(ctx, 480, 445, 100, '#ff8c42', '#ffd9b0', 23);
      drawCoral(ctx, 540, 445, 70, '#e86aa8', '#ffd1de', 24);
      /* Anemone + clownfish. */
      drawAnemone(ctx, 200, 430, 1, '#ff9fb2', mods.has('anemone-arm') ? 8 : 9);
      drawClownfish(ctx, 200, 392, 1, false);
      if (mods.has('clown-extra')) drawClownfish(ctx, 232, 402, 0.85, true);
      /* Turtle swimming across. */
      drawTurtle(ctx, 420, 180, 1, '#5a8a4a');
      if (mods.has('turtle-spot')) {
        ctx.fillStyle = '#e8d28a';
        circle(ctx, 408, 168, 5);
      }
      /* Rock with a crab that may appear. */
      drawRock(ctx, 300, 478, 52, 24, '#7d838a');
      if (mods.has('crab')) drawCrab(ctx, 300, 458, 0.9, '#e84a4a');
      /* Starfish that moved. */
      if (mods.has('star-move')) drawStarfish(ctx, 470, 490, 20, '#ffb03a', 0.3);
      else drawStarfish(ctx, 520, 490, 20, '#ffb03a', 0.3);
      /* Clam: shut in A, open with pearl in B. */
      drawClam(ctx, 80, 490, 1, mods.has('clam-open'), mods.has('clam-open'));
      /* School of tiny fish. */
      drawSchool(ctx, 300, 120, mods.has('school-count') ? 6 : 5, '#7fd4e8');
      /* Bubbles from the anemone. */
      drawBubbleColumn(ctx, 250, 380, 2, 4);
    },
  },
];

SCENES.push(
  {
    id: 'wreck',
    name: 'Bangkai Kapal',
    sub: 'Scene 3 dari 5 — kapal karam penuh harta',
    timeLimit: 135,
    seed: 33,
    diffs: [
      { id: 'porthole', x: 290, y: 437, r: 14, label: 'jendela kapal menyala' },
      { id: 'flag-gone', x: 317, y: 272, r: 16, label: 'bendera hilang' },
      { id: 'sail-torn', x: 345, y: 315, r: 26, label: 'layar robek' },
      { id: 'chest-coins', x: 470, y: 480, r: 30, label: 'koin harta bertambah' },
      { id: 'octopus-arms', x: 90, y: 290, r: 34, label: 'lengan gurita' },
      { id: 'eel-gone', x: 540, y: 440, r: 24, label: 'belut hilang' },
      { id: 'barrel-extra', x: 150, y: 460, r: 24, label: 'tong tambahan' },
      { id: 'seahorse-extra', x: 420, y: 250, r: 22, label: 'kuda laut muncul' },
      { id: 'wreck-coral', x: 250, y: 408, r: 20, label: 'karang di geladak' },
    ],
    draw: function drawWreckScene(ctx, mods) {
      waterBackground(ctx, WATER.wreck);
      drawSunRays(ctx, 420, 4, 0.09);
      drawSandFloor(ctx, 460, '#e6d5a8', '#b89a68', 33);
      /* The wreck, centre, hull resting on the sand. */
      drawWreck(ctx, 300, 415, 1, {
        portholeLit: !mods.has('porthole'),
        sailTorn: mods.has('sail-torn'),
        flagGone: mods.has('flag-gone'),
      });
      if (mods.has('wreck-coral')) drawCoral(ctx, 250, 415, 34, '#ff7fa5', '#ffd1de', 34);
      /* Octopus clinging to the left. */
      drawOctopus(ctx, 90, 300, 1, '#b06fd4', mods.has('octopus-arms') ? 7 : 8);
      /* Treasure chest, right. */
      drawChest(ctx, 480, 480, 1, true, mods.has('chest-coins') ? 12 : 8);
      /* Eel in a hole, far right rock. */
      drawRock(ctx, 545, 480, 40, 20, '#6d7278');
      if (!mods.has('eel-gone')) drawEel(ctx, 540, 462, 1);
      /* Barrel that may appear, left. */
      if (mods.has('barrel-extra')) drawBarrel(ctx, 150, 470, 1);
      /* Seahorse that may appear, mid-right. */
      if (mods.has('seahorse-extra')) drawSeahorse(ctx, 420, 250, 1, '#ffb03a');
      /* Seaweed by the hull. */
      drawSeaweed(ctx, 60, 520, 4, 80, '#2e7a4f');
      drawSeaweed(ctx, 560, 520, 4, 95, '#2e7a4f');
      /* Bubbles from the wreck. */
      drawBubbleColumn(ctx, 330, 330, 3, 5);
      /* A small fish circling the mast. */
      drawFish(ctx, 200, 150, 0.8, '#ffd23e', '#fff3b0', '#e8a91c', false);
    },
  },
  {
    id: 'cave',
    name: 'Gua Biru',
    sub: 'Scene 4 dari 5 — gua bercahaya, makin gelap makin sulit',
    timeLimit: 120,
    seed: 44,
    diffs: [
      { id: 'jelly-extra', x: 420, y: 120, r: 26, label: 'ubur-ubur kedua' },
      { id: 'crystal-color', x: 480, y: 450, r: 28, label: 'warna kristal' },
      { id: 'lure-off', x: 270, y: 260, r: 18, label: 'lampu anglerfish mati' },
      { id: 'stalactite-gone', x: 300, y: 60, r: 20, label: 'stalaktit hilang' },
      { id: 'cave-fish', x: 200, y: 380, r: 30, label: 'ikan gua bertambah' },
      { id: 'clam-pearl', x: 120, y: 480, r: 22, label: 'mutiara muncul' },
      { id: 'glow-off', x: 520, y: 470, r: 22, label: 'jamur bercahaya padam' },
      { id: 'vent-bubbles', x: 350, y: 420, r: 26, label: 'gelembung ventilasi' },
      { id: 'rock-crack', x: 60, y: 300, r: 24, label: 'retakan di batu' },
    ],
    draw: function drawCave(ctx, mods) {
      waterBackground(ctx, WATER.cave);
      drawCaveWalls(ctx);
      drawStalactites(ctx, mods.has('stalactite-gone') ? 2 : 3);
      /* Sandy floor inside the cave. */
      ctx.fillStyle = '#c9b489';
      ctx.beginPath();
      ctx.moveTo(30, 540);
      ctx.lineTo(570, 540);
      ctx.lineTo(570, 500);
      ctx.quadraticCurveTo(300, 480, 30, 505);
      ctx.closePath();
      ctx.fill();
      /* Jellyfish, glowing. */
      drawJellyfish(ctx, 150, 150, 1, '#b07fe8', true);
      if (mods.has('jelly-extra')) drawJellyfish(ctx, 420, 120, 0.8, '#7fd4e8', true);
      /* Crystal cluster, right. */
      drawCrystal(ctx, 480, 470, 1, mods.has('crystal-color') ? '#ff6fd8' : '#4fd8e8', true);
      /* Small glowing crystal, far right (its glow may go out). */
      drawCrystal(ctx, 520, 485, 0.55, '#8affc8', !mods.has('glow-off'));
      /* Anglerfish, centre. */
      drawAnglerfish(ctx, 300, 300, 1, !mods.has('lure-off'), 3);
      /* School of cave fish. */
      drawSchool(ctx, 200, 380, mods.has('cave-fish') ? 5 : 4, '#9fd8e8');
      /* Clam with a pearl that may appear. */
      drawClam(ctx, 120, 490, 1, true, mods.has('clam-pearl'));
      /* Vent bubbles, centre-right. */
      drawBubbleColumn(ctx, 350, 470, mods.has('vent-bubbles') ? 5 : 3, 6);
      /* Big rock with a crack that may appear. */
      drawRock(ctx, 60, 320, 44, 30, '#3d5a7a');
      if (mods.has('rock-crack')) {
        ctx.strokeStyle = 'rgba(10,20,40,0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(50, 300);
        ctx.lineTo(62, 314);
        ctx.lineTo(54, 326);
        ctx.lineTo(68, 338);
        ctx.stroke();
      }
      /* Faint light from the cave mouth, top centre. */
      const g = ctx.createRadialGradient(300, 0, 10, 300, 0, 220);
      g.addColorStop(0, 'rgba(190,230,255,0.35)');
      g.addColorStop(1, 'rgba(190,230,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(80, 0, 440, 220);
    },
  },
  {
    id: 'trench',
    name: 'Palung Dalam',
    sub: 'Scene 5 dari 5 — palung tergelap, buruan terakhir',
    timeLimit: 105,
    seed: 55,
    diffs: [
      { id: 'whale-barnacles', x: 292, y: 154, r: 14, label: 'teritip di paus' },
      { id: 'vent-plume', x: 480, y: 420, r: 26, label: 'asap ventilasi' },
      { id: 'glow-fish', x: 300, y: 330, r: 20, label: 'ikan bercahaya keempat' },
      { id: 'shrimp-extra', x: 420, y: 420, r: 20, label: 'udang muncul' },
      { id: 'angler-teeth', x: 465, y: 305, r: 20, label: 'gigi anglerfish' },
      { id: 'fan-deep-color', x: 80, y: 390, r: 26, label: 'warna kipas karang' },
      { id: 'plankton-count', x: 350, y: 100, r: 28, label: 'plankton bertambah' },
      { id: 'cucumber-extra', x: 250, y: 495, r: 22, label: 'teripang muncul' },
      { id: 'trench-bubbles', x: 520, y: 150, r: 24, label: 'gelembung palung' },
      { id: 'star-deep-color', x: 450, y: 500, r: 22, label: 'warna bintang laut' },
    ],
    draw: function drawTrench(ctx, mods) {
      waterBackground(ctx, WATER.trench);
      /* Whale silhouette, centre-top. */
      drawWhale(ctx, 300, 200, 1, mods.has('whale-barnacles') ? 3 : 2);
      /* Plankton dots, upper middle. */
      drawPlankton(ctx, 350, 100, mods.has('plankton-count') ? 9 : 6, 56);
      /* Glowing fish trio (or quartet). */
      drawFish(ctx, 150, 300, 0.55, '#7df9ff', '#d8fbff', '#3aa8b8', false);
      drawFish(ctx, 200, 340, 0.5, '#7df9ff', '#d8fbff', '#3aa8b8', true);
      drawFish(ctx, 250, 310, 0.55, '#7df9ff', '#d8fbff', '#3aa8b8', false);
      if (mods.has('glow-fish')) drawFish(ctx, 300, 330, 0.5, '#7df9ff', '#d8fbff', '#3aa8b8', true);
      /* Anglerfish, right. */
      drawAnglerfish(ctx, 450, 300, 0.9, true, mods.has('angler-teeth') ? 5 : 3);
      /* Vents on the trench floor. */
      drawVent(ctx, 120, 480, 1, true);
      drawVent(ctx, 480, 480, 1, !mods.has('vent-plume'));
      /* Fan coral, left. */
      drawFanCoral(ctx, 80, 470, 70, 80, mods.has('fan-deep-color') ? '#2ad4c8' : '#b07fe8');
      /* Trench floor. */
      ctx.fillStyle = '#1c2f4a';
      ctx.beginPath();
      ctx.moveTo(0, 540);
      ctx.lineTo(600, 540);
      ctx.lineTo(600, 505);
      ctx.quadraticCurveTo(300, 490, 0, 508);
      ctx.closePath();
      ctx.fill();
      /* Sea cucumber that may appear. */
      if (mods.has('cucumber-extra')) drawSeaCucumber(ctx, 250, 500, 1, '#8a6a4a');
      /* Shrimp that may appear. */
      if (mods.has('shrimp-extra')) drawShrimp(ctx, 420, 420, 1.2);
      /* Starfish on the floor. */
      drawStarfish(ctx, 450, 505, 20, mods.has('star-deep-color') ? '#ff8c42' : '#e84a4a', 0.2);
      /* Bubble column, right. */
      drawBubbleColumn(ctx, 520, 190, mods.has('trench-bubbles') ? 4 : 2, 5);
      /* Faint god-ray from far above. */
      const g = ctx.createLinearGradient(0, 0, 0, 300);
      g.addColorStop(0, 'rgba(160,210,255,0.12)');
      g.addColorStop(1, 'rgba(160,210,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(200, 0, 200, 300);
    },
  }
);
