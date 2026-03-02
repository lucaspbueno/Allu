import { Product } from ".prisma/search-client";
import { SearchRepository, SuggestionItem } from "../repositories/search.repository";
import { cache } from "../lib/cache";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SearchService {
  constructor(private readonly repository: SearchRepository) {}

  async suggest(query: string, limit: number = 5): Promise<{ data: SuggestionItem[] }> {
    if (!query.trim()) return { data: [] };

    const cacheKey = `search:suggest:${query.toLowerCase()}:${limit}`;
    const cached = cache.get<{ data: SuggestionItem[] }>(cacheKey);

    if (cached) return cached;

    const data = await this.repository.suggest(query, limit);
    const result = { data };

    cache.set(cacheKey, result);

    return result;
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<Product>> {
    if (!query.trim()) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const cacheKey = `search:products:${query.toLowerCase()}:${page}:${limit}`;
    const cached = cache.get<PaginatedResult<Product>>(cacheKey);

    if (cached) return cached;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.search(query, skip, limit),
      this.repository.searchCount(query),
    ]);

    const result: PaginatedResult<Product> = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    cache.set(cacheKey, result);

    return result;
  }
}
