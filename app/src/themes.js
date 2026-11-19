// Themes: each one is a colour grade for photos (a canvas filter plus a painted overlay)
// and a palette for the procedural scenes, so a whole cover hangs together in one mood.
// 'batik' is the Batik Vice signature: indigo mega mendung skies and gold kawung accents.

function gradientOverlay(stops, vertical = true) {
  return (ctx, x, y, w, h) => {
    const g = vertical ? ctx.createLinearGradient(0, y, 0, y + h) : ctx.createLinearGradient(x, 0, x + w, 0);
    for (const [at, colour] of stops) g.addColorStop(at, colour);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  };
}

function vignette(ctx, x, y, w, h, strength = 0.32) {
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, r * 0.45, x + w / 2, y + h / 2, r);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

export const THEMES = {
  vice: {
    label: 'Vice Sunset',
    filter: 'saturate(1.38) contrast(1.09) brightness(1.03)',
    sky: ['#31195c', '#7c2a86', '#d63d7f', '#ff7a59', '#ffc46b'],
    sun: '#ffe9a3',
    sunCore: '#fff7d6',
    sea: ['#2a7f9e', '#173f63'],
    land: '#241031',
    landFar: '#4a2160',
    accent: '#ff4f9a',
    accent2: '#22d3ee',
    band: '#ff4f9a',
    bandText: '#ffffff',
    titleFill: ['#ffffff', '#ffd9ec'],
    window: '#ffd76e',
    overlay(ctx, x, y, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      gradientOverlay([[0, 'rgba(255,110,90,0.55)'], [1, 'rgba(120,40,160,0.55)']])(ctx, x, y, w, h);
      ctx.restore();
      gradientOverlay([[0.55, 'rgba(255,80,140,0)'], [1, 'rgba(255,80,140,0.28)']])(ctx, x, y, w, h);
      vignette(ctx, x, y, w, h, 0.22);
    },
  },
  neon: {
    label: 'Neon Night',
    filter: 'saturate(1.3) contrast(1.2) brightness(0.92) hue-rotate(-6deg)',
    sky: ['#03040f', '#0b1038', '#231457', '#3d1166'],
    sun: '#67e8f9',
    sunCore: '#ecfeff',
    sea: ['#0e2a4a', '#060d24'],
    land: '#05060f',
    landFar: '#101736',
    accent: '#22d3ee',
    accent2: '#ff4fd8',
    band: '#22d3ee',
    bandText: '#04121a',
    titleFill: ['#ffffff', '#a5f3fc'],
    window: '#8be9ff',
    overlay(ctx, x, y, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      gradientOverlay([[0, 'rgba(40,80,255,0.6)'], [1, 'rgba(200,40,200,0.5)']])(ctx, x, y, w, h);
      ctx.restore();
      vignette(ctx, x, y, w, h, 0.42);
    },
  },
  batik: {
    label: 'Batik Vice',
    filter: 'saturate(1.22) contrast(1.07) sepia(0.22) brightness(1.01)',
    sky: ['#10163d', '#1d2a6e', '#31449c', '#8a5a24', '#d9a441'],
    sun: '#f5c65c',
    sunCore: '#ffe9ad',
    sea: ['#1d3a6e', '#101c42'],
    land: '#141033',
    landFar: '#232a5e',
    accent: '#d9a441',
    accent2: '#5f7fd9',
    band: '#d9a441',
    bandText: '#231303',
    titleFill: ['#fff6dd', '#f5c65c'],
    window: '#f5c65c',
    batikSky: true,
    overlay(ctx, x, y, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      gradientOverlay([[0, 'rgba(50,70,180,0.55)'], [1, 'rgba(217,164,65,0.5)']])(ctx, x, y, w, h);
      ctx.restore();
      gradientOverlay([[0.6, 'rgba(20,22,64,0)'], [1, 'rgba(20,22,64,0.3)']])(ctx, x, y, w, h);
      vignette(ctx, x, y, w, h, 0.26);
    },
  },
  golden: {
    label: 'Golden Hour',
    filter: 'saturate(1.18) contrast(1.05) brightness(1.08) sepia(0.32)',
    sky: ['#4a235a', '#9c3d54', '#e0653a', '#f59e4c', '#ffd98a'],
    sun: '#fff3b0',
    sunCore: '#fffbe8',
    sea: ['#b96a44', '#5e3358'],
    land: '#2e1633',
    landFar: '#5e2a4a',
    accent: '#ffb703',
    accent2: '#fb7185',
    band: '#ffb703',
    bandText: '#2b1503',
    titleFill: ['#ffffff', '#ffe9b0'],
    window: '#ffe9a3',
    overlay(ctx, x, y, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      gradientOverlay([[0, 'rgba(255,170,60,0.6)'], [1, 'rgba(160,60,60,0.45)']])(ctx, x, y, w, h);
      ctx.restore();
      vignette(ctx, x, y, w, h, 0.2);
    },
  },
  noir: {
    label: 'Noir',
    filter: 'grayscale(1) contrast(1.28) brightness(1.02)',
    sky: ['#0a0a0c', '#232329', '#4b4b55', '#8a8a96'],
    sun: '#e8e8ee',
    sunCore: '#ffffff',
    sea: ['#3d3d46', '#17171c'],
    land: '#060607',
    landFar: '#1c1c21',
    accent: '#e8e8ee',
    accent2: '#9a9aa6',
    band: '#e8e8ee',
    bandText: '#0a0a0c',
    titleFill: ['#ffffff', '#c9c9d4'],
    window: '#e8e8ee',
    overlay(ctx, x, y, w, h) {
      vignette(ctx, x, y, w, h, 0.5);
    },
  },
};

export const THEME_IDS = ['vice', 'batik', 'neon', 'golden', 'noir'];
