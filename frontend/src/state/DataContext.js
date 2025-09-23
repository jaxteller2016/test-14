import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(
    async ({ page = 1, limit = 20, q = "", signal } = {}) => {
      const url = new URL("http://localhost:3001/api/items");
      if (page) url.searchParams.set("page", String(page));
      if (limit) url.searchParams.set("limit", String(limit));
      if (q) url.searchParams.set("q", q);

      const res = await fetch(url.toString(), { signal });
      if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
      const json = await res.json(); // { items, total, page, pageSize }

      // Avoid setState on unmounted/aborted requests
      if (signal?.aborted) return json;

      setItems(json.items || []);
      setTotal(json.total || 0);
      return json;
    },
    []
  );

  return (
    <DataContext.Provider value={{ items, total, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
