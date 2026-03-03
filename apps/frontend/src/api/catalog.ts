import { CATALOG_API_BASE } from "@/config/api";
import type { PaginatedProducts } from "@/types/product";

const PAGE_SIZE = 12;

export async function fetchProducts(
  page: number = 1,
  limit: number = PAGE_SIZE,
  category?: string
): Promise<PaginatedProducts> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (category) params.set("category", category);

  const res = await fetch(`${CATALOG_API_BASE}/products?${params}`);

  if (!res.ok) throw new Error("Falha ao carregar produtos");

  return res.json();
}
