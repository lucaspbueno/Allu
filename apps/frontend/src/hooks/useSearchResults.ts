import { useState, useEffect } from "react";
import { fetchSearchProducts } from "@/api/search";
import type { Product } from "@/types/product";

const PAGE_SIZE = 20;

export function useSearchResults(query: string | null) {
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query?.trim() ?? "";
    if (!trimmed) {
      setData([]);
      setTotal(0);
      setTotalPages(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetchSearchProducts(trimmed, 1, PAGE_SIZE)
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erro ao buscar");
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return { data, total, page, totalPages, loading, error };
}
