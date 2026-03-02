import { Product } from ".prisma/catalog-client";
import { ProductRepository, ProductFilters } from "../repositories/product.repository";
import { cache } from "../lib/cache";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface ListOptions extends ProductFilters {
  sortBy?: "name" | "price" | "createdAt";
  order?: "asc" | "desc";
}

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async list(
    page: number = 1,
    limit: number = 20,
    options: ListOptions = {}
  ): Promise<PaginatedResult<Product>> {
    const cacheKey = `products:list:${JSON.stringify({ page, limit, ...options })}`;
    const cached = cache.get<PaginatedResult<Product>>(cacheKey);

    if (cached) return cached;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findAll({ skip, take: limit, ...options }),
      this.repository.count(options),
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

  async listCursor(
    limit: number = 20,
    options: ProductFilters & { cursor?: number } = {}
  ): Promise<CursorPaginatedResult<Product>> {
    const cacheKey = `products:cursor:${JSON.stringify({ limit, ...options })}`;
    const cached = cache.get<CursorPaginatedResult<Product>>(cacheKey);

    if (cached) return cached;

    const { items, nextCursor, hasMore } = await this.repository.findAllCursor({
      take: limit,
      ...options,
    });

    const result: CursorPaginatedResult<Product> = { data: items, nextCursor, hasMore };

    cache.set(cacheKey, result);

    return result;
  }

  async getById(id: number): Promise<Product | null> {
    const cacheKey = `products:id:${id}`;
    const cached = cache.get<Product>(cacheKey);

    if (cached) return cached;

    const product = await this.repository.findById(id);

    if (product) cache.set(cacheKey, product);

    return product;
  }

  async getCategories(): Promise<string[]> {
    const cacheKey = "products:categories";
    const cached = cache.get<string[]>(cacheKey);

    if (cached) return cached;

    const categories = await this.repository.findCategories();

    cache.set(cacheKey, categories);

    return categories;
  }
}
