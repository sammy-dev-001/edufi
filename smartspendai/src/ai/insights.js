export function getWeeklyCategorySpike(transactions, now = new Date()) {
  const toISODate = (d) => new Date(d).toISOString();
  const ms = 24 * 60 * 60 * 1000;
  const last7Start = new Date(now.getTime() - 7 * ms);
  const prevStart = new Date(now.getTime() - 35 * ms);
  const prevEnd = new Date(now.getTime() - 7 * ms);

  const isExpense = (t) => t.amount < 0;
  const abs = (x) => Math.abs(x);

  const inRange = (d, start, end) => new Date(d) >= start && new Date(d) < end;

  const sums = (start, end) => {
    const map = new Map();
    for (const t of transactions) {
      if (!isExpense(t)) continue;
      if (!inRange(t.date, start, end)) continue;
      const prev = map.get(t.category) || 0;
      map.set(t.category, prev + abs(t.amount));
    }
    return map;
  };

  const last = sums(last7Start, now);
  const prev = sums(prevStart, prevEnd);

  let best = null;
  for (const [cat, lastVal] of last.entries()) {
    const prevVal = prev.get(cat) || 0;
    if (prevVal <= 0) continue;
    const pct = (lastVal - prevVal / 4) / (prevVal / 4);
    if (!isFinite(pct)) continue;
    if (!best || pct > best.pct) best = { category: cat, pct, lastVal, prevVal };
  }

  if (!best || best.pct <= 0.15) return null;
  return { category: best.category, changePct: Math.round(best.pct * 100) };
}
