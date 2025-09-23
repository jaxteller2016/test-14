const fs = require("fs");
const fsp = fs.promises;

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function computeStatsFromItems(items) {
  return {
    total: items.length,
    averagePrice: mean(items.map((i) => Number(i.price) || 0)),
  };
}

async function readItems(filePath) {
  const raw = await fsp.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

// Per-file cache + watcher
const cache = new Map(); // filePath -> stats
const watchers = new Map(); // filePath -> fs.FSWatcher

async function refresh(filePath) {
  const items = await readItems(filePath);
  const stats = computeStatsFromItems(items);
  cache.set(filePath, stats);
  return stats;
}

async function getCachedStats(filePath) {
  if (!watchers.has(filePath)) {
    // Establish a watcher once
    try {
      const watcher = fs.watch(filePath, { persistent: false }, async () => {
        try {
          await refresh(filePath);
        } catch {
          cache.delete(filePath);
        }
      });
      watchers.set(filePath, watcher);
    } catch {
      // ignore watcher errors; will recompute on next call if missing
    }
  }

  if (!cache.has(filePath)) {
    await refresh(filePath);
  }
  return cache.get(filePath);
}

module.exports = { mean, computeStatsFromItems, readItems, getCachedStats };
