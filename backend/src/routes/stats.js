const express = require("express");
const path = require("path");
const router = express.Router();
const { getCachedStats } = require("../utils/stats");

const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// GET /api/stats
router.get("/", async (req, res, next) => {
  try {
    const stats = await getCachedStats(DATA_PATH);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
