const fs = require("fs");
const path = require("path");
const os = require("os");

const srcData = path.join(__dirname, "../../data/items.json");
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "items-test-"));
const tmpData = path.join(tmpDir, "items.json");
fs.copyFileSync(srcData, tmpData);

// Must set before requiring the app so routes pick it up
process.env.DATA_PATH = tmpData;
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../src/index");

describe("Items API", () => {
  test("GET /api/items returns paginated result with defaults", async () => {
    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page", 1);
    expect(res.body).toHaveProperty("pageSize", 20);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test("GET /api/items supports limit and page", async () => {
    const res = await request(app).get("/api/items?limit=2&page=2");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.page).toBe(2);
    expect(res.body.pageSize).toBe(2);
  });

  test("GET /api/items supports search q", async () => {
    const res = await request(app).get("/api/items?q=desk");
    expect(res.status).toBe(200);
    const names = res.body.items.map((i) => i.name.toLowerCase());
    expect(names.some((n) => n.includes("desk"))).toBe(true);
  });

  test("GET /api/items validates limit", async () => {
    const res = await request(app).get("/api/items?limit=-1");
    expect(res.status).toBe(400);
  });

  test("GET /api/items/:id returns item", async () => {
    const res = await request(app).get("/api/items/1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", 1);
  });

  test("GET /api/items/:id not found", async () => {
    const res = await request(app).get("/api/items/999999");
    expect(res.status).toBe(404);
  });

  test("POST /api/items validates payload", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ name: "", category: "x", price: 10 });
    expect(res.status).toBe(400);
  });

  test("POST /api/items creates item", async () => {
    const payload = { name: "Test Item", category: "Testing", price: 42 };
    const res = await request(app).post("/api/items").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toMatchObject(payload);
  });
});
