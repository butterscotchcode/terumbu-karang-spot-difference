'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Seeded random: one job, deterministic decoration.
   Both panels of a scene share one seed, so the only pixels that
   differ between them are the differences themselves. */

/* Mulberry32: small, fast, deterministic. */
function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* A number in [min, max) from a rng. */
function rngRange(rng, min, max) {
  return min + rng() * (max - min);
}

/* Pick one item from an array with a rng. */
function rngPick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
