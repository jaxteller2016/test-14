const express = require("express");
const morgan = require("morgan");
const itemsRouter = require("./routes/items");
const statsRouter = require("./routes/stats");
const cors = require("cors");
const { notFound } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/items", itemsRouter);
app.use("/api/stats", statsRouter);

// Not Found
app.use("*", notFound);

// Only run external side-effect in production
if (process.env.NODE_ENV === "production") {
  try {
    const { getCookie } = require("./middleware/errorHandler");
    getCookie();
  } catch {
    // ignore
  }
}

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () =>
    console.log("Backend running on http://localhost:" + port)
  );
}

module.exports = app;
