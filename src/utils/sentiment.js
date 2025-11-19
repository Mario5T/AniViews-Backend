const positive = ['good', 'great', 'amazing', 'love', 'best', 'awesome', 'fantastic'];
const negative = ['bad', 'boring', 'worst', 'hate', 'terrible', 'awful'];

export function classifySentiment(text = '') {
  const t = text.toLowerCase();
  let score = 0;
  positive.forEach(w => { if (t.includes(w)) score += 1; });
  negative.forEach(w => { if (t.includes(w)) score -= 1; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}
