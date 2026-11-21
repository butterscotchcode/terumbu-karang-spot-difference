'use strict';
/* Terumbu Karang — Cari Perbedaannya.
   Shared constants: canvas size, layout, scoring, palette.
   One job: the numbers every other file agrees on. */

const GAME_TITLE = 'TERUMBU KARANG';
const GAME_SUBTITLE = 'Cari Perbedaannya';

const CANVAS_W = 1280;
const CANVAS_H = 720;

/* Layout: HUD on top, two panels side by side, bottom bar. */
const HUD_H = 76;
const PANEL_W = 600;
const PANEL_H = 540;
const PANEL_Y = 88;
const PANEL_LEFT_X = 20;
const PANEL_RIGHT_X = 660;
const BOTTOM_Y = 640;
const BOTTOM_H = 72;

/* Scoring and penalties. */
const FIND_SCORE = 100;
const HINT_COST = 25;
const HINTS_PER_SCENE = 3;
const WRONG_CLICK_SCORE_PENALTY = 5;
const WRONG_CLICK_TIME_PENALTY = 3;
const SCENE_TIME_BONUS_PER_SECOND = 5;

/* Marker look. */
const MARKER_RING = '#2fe673';
const MARKER_CHECK = '#ffffff';
const HINT_RING = '#ffd23e';

/* Water palettes, one per scene (shallow to deep). */
const WATER = {
  lagoon: ['#8fd8ea', '#35a9cb', '#0f7194'],
  garden: ['#7fd0e6', '#2b9ec6', '#0d5f86'],
  wreck: ['#6fb9d6', '#227ba6', '#0a4468'],
  cave: ['#4f8fc9', '#1d5f9e', '#071f4d'],
  trench: ['#2c5f8f', '#123a63', '#020c22'],
};
