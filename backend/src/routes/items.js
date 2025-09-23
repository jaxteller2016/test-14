const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const fsp = fs.promises;

const DEFAULT_DATA_PATH = path.join(__dirname, "../../../data/items.json");
const DATA_PATH = process.env.DATA_PATH || DEFAULT_DATA_PATH;

// Async utilities
async function readData() {
  const raw = await fsp.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeData(data) {
  await fsp.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

function parsePositiveInt(value, defaultValue) {
  if (value === undefined) return defaultValue;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    const err = new Error("Invalid query parameter");
    err.status = 400;
    throw err;
  }
  return n;
}

// GET /api/items
router.get("/", async (req, res, next) => {
  try {
    const { q = "", page, limit } = req.query;
    const pageNum = parsePositiveInt(page, 1);
    const pageSize = parsePositiveInt(limit, 20);

    const data = await readData();

    let results = data;
    if (q) {
      const needle = String(q).toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          (item.category || "").toLowerCase().includes(needle)
      );
    }

    const total = results.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;
    const items = results.slice(start, end);

    res.json({ items, total, page: pageNum, pageSize });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const err = new Error("Invalid id");
      err.status = 400;
      throw err;
    }
    const data = await readData();
    const item = data.find((i) => i.id === id);
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    const { name, category, price } = req.body || {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      const err = new Error("Invalid payload");
      err.status = 400;
      throw err;
    }

    const data = await readData();
    const item = {
      id: Date.now(),
      name: name.trim(),
      category: category.trim(),
      price,
    };
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
