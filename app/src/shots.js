// Fixed scenes for screenshots: ?shot=cover shows only the finished cover, full-bleed;
// ?shot=editor shows the editor with a sample photo loaded and a cover composed. Extra
// params pick the layout, theme, hero framing and words: layout, theme, photo (a sample
// name), caption (the title), subtitle, oy and zoom for the hero panel's photo framing.
// window.__shotReady is set once the scene is painted, so captures never catch a blank.

export async function runShot(shot, query, apply) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const opts = {
    layout: query.get('layout') || undefined,
    theme: query.get('theme') || undefined,
    title: query.get('caption') ?? undefined,
    subtitle: query.get('subtitle') ?? undefined,
    oy: query.has('oy') ? Number(query.get('oy')) : undefined,
    zoom: query.has('zoom') ? Number(query.get('zoom')) : undefined,
  };
  await apply(shot, `samples/${query.get('photo') ?? 'pier'}.jpg`, opts);
  try { await document.fonts.ready; } catch { /* lettering falls back, still painted */ }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
