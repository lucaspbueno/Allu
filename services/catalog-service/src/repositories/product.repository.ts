import { Product, Prisma } from ".prisma/catalog-client";
import { prisma } from "../lib/prisma";

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface FindAllOptions extends ProductFilters {
  skip?: number;
  take?: number;
  sortBy?: "name" | "price" | "createdAt";
  order?: "asc" | "desc";
  cursor?: number;
}

export class ProductRepository {
  private buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { active: true, deletedAt: null };
    const { category, search, minPrice, maxPrice } = filters;

    if (category) where.category = category;

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const hasMinPrice = minPrice !== undefined;
    const hasMaxPrice = maxPrice !== undefined;

    if (hasMinPrice || hasMaxPrice) {
      where.price = {
        ...(hasMinPrice && { gte: minPrice }),
        ...(hasMaxPrice && { lte: maxPrice }),
      };
    }

    return where;
  }

  async findAll(options: FindAllOptions = {}): Promise<Product[]> {
    const { skip = 0, take = 20, sortBy = "createdAt", order = "desc", ...filters } = options;

    return prisma.product.findMany({
      where: this.buildWhere(filters),
      skip,
      take,
      orderBy: { [sortBy]: order },
    });
  }

  async findAllCursor(options: FindAllOptions = {}): Promise<{
    items: Product[];
    nextCursor: number | null;
    hasMore: boolean;
  }> {
    const { take = 20, cursor, ...filters } = options;

    const items = await prisma.product.findMany({
      where: this.buildWhere(filters),
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { id: "asc" },
    });

    const hasMore = items.length > take;
    const data = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { items: data, nextCursor, hasMore };
  }

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findFirst({ where: { id, active: true, deletedAt: null } });
  }

  async count(filters: ProductFilters = {}): Promise<number> {
    return prisma.product.count({ where: this.buildWhere(filters) });
  }

  async findCategories(): Promise<string[]> {
    const result = await prisma.product.groupBy({
      by: ["category"],
      where: { active: true, deletedAt: null },
      orderBy: { category: "asc" },
    });
    return result.map((r) => r.category);
  }
}
