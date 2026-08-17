const STATE_NAMES = Object.freeze({
  'uttar pradesh': 'Uttar Pradesh',
  punjab: 'Punjab',
  bihar: 'Bihar',
});

export function normalizeStateName(state) {
  if (typeof state !== 'string') {
    return null;
  }

  const normalized = state.trim().toLowerCase();

  return STATE_NAMES[normalized] || null;
}