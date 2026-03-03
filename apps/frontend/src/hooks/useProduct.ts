import { useState, useEffect } from "react";
import { fetchProductById } from "@/api/catalog";
import type { Product } from "@/types/product";

export function useProduct(id: number | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null || id <= 0) {
      setProduct(null);
      setLoading(false);
      setError(id !== null ? "ID inválido" : null);
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);

    fetchProductById(id)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
