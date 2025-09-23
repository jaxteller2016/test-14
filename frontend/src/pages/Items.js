import React, { useEffect, useMemo, useState } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

function Items() {
  const { items, total, fetchItems } = useData();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / limit)),
    [total, limit]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetchItems({ page, limit, q, signal: ctrl.signal })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [fetchItems, page, limit, q]);

  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
        }}
      >
        {item ? <Link to={"/items/" + item.id}>{item.name}</Link> : null}
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Items</h2>

      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
        aria-label="Items search and pagination"
      >
        <input
          aria-label="Search items"
          placeholder="Search..."
          value={q}
          onChange={(e) => {
            setPage(1); // reset to first page on new search
            setQ(e.target.value);
          }}
          style={{ padding: 8, flex: 1, minWidth: 200 }}
        />
        <label>
          Page size:{" "}
          <select
            aria-label="Page size"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </form>

      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Prev
        </button>{" "}
        <button
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          disabled={page >= pageCount || loading}
        >
          Next
        </button>{" "}
        <span aria-live="polite" style={{ marginLeft: 8 }}>
          Page {page} of {pageCount} • Total {total}
        </span>
      </div>

      {loading ? (
        <ul
          aria-busy="true"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {Array.from({ length: Math.min(limit, 10) }).map((_, i) => (
            <li
              key={i}
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                background: i % 2 ? "#f8f8f8" : "#f2f2f2",
                borderRadius: 4,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  width: "60%",
                  height: 12,
                  background: "#ddd",
                  borderRadius: 6,
                }}
              />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <List
          height={Math.min(480, Math.max(120, items.length * 48))}
          itemCount={items.length}
          itemSize={48}
          width={"100%"}
          style={{ border: "1px solid #eee", borderRadius: 4 }}
        >
          {Row}
        </List>
      )}
    </div>
  );
}

export default Items;
