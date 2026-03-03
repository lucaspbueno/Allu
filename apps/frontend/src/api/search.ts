import { SEARCH_API_BASE } from "@/config/api";
import type { SearchResult, SuggestionItem } from "@/types/search";

export async function fetchSuggestions(
  q: string,
  limit: number = 5
): Promise<{ data: SuggestionItem[] }> {
  const params = new URLSearchParams({ q: q.trim(), limit: String(limit) });
  const res = await fetch(`${SEARCH_API_BASE}/search/suggestions?${params}`);
  if (!res.ok) throw new Error("Falha ao carregar sugestões");
  return res.json();
}

export async function fetchSearchProducts(
  q: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResult> {
  const params = new URLSearchParams({
    q: q.trim(),
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${SEARCH_API_BASE}/search/products?${params}`);
  if (!res.ok) throw new Error("Falha ao buscar produtos");
  return res.json();
}
