import { useState, useEffect, useCallback } from "react";
import { fetchProducts } from "@/api/catalog";
import type { Product } from "@/types/product";

const PAGE_SIZE = 12;

export function useCatalogInfinite(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasMore = nextPage <= totalPages;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts(nextPage, PAGE_SIZE, category);
      setProducts((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]));
      setTotalPages(res.totalPages);
      setNextPage((p) => p + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [nextPage, loading, hasMore, category]);

  useEffect(() => {
    setProducts([]);
    setNextPage(1);
    setTotalPages(1);
    setLoading(true);
    setError(null);
    let cancelled = false;
    fetchProducts(1, PAGE_SIZE, category)
      .then((res) => {
        if (!cancelled) {
          setProducts(res.data);
          setTotalPages(res.totalPages);
          setNextPage(2);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return { products, loading, hasMore, error, loadMore };
}
