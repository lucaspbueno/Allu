import type { Product } from "./product";

export interface SuggestionItem {
  id: number;
  name: string;
  category: string;
}

export interface SearchResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
