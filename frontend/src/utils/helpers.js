export function regionalName(entity) {
  const dict = entity.regional_name || entity.regional_names || {};
  const vals = Object.values(dict);
  return vals.length ? vals[0] : null;
}

export function sourceTexts(entity) {
  return entity.source_text || entity.source_texts || [];
}

const BOUNDS = { latMin: 6, latMax: 37, lonMin: 68, lonMax: 97 };

export function project(lat, lon) {
  const x = ((lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin)) * 340 + 40;
  const y = (1 - (lat - BOUNDS.latMin) / (BOUNDS.latMax - BOUNDS.latMin)) * 420 + 30;
  return { x, y };
}