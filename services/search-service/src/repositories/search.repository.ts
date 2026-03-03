import { Product } from ".prisma/search-client";
import { prisma } from "../lib/prisma";

export interface SuggestionItem {
  id: number;
  name: string;
  category: string;
}

export class SearchRepository {
  async suggest(query: string, limit: number = 5): Promise<SuggestionItem[]> {
    const items = await prisma.product.findMany({
      where: {
        active: true,
        deletedAt: null,
        name: { contains: query, mode: "insensitive" },
      },
      take: limit * 3,
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    });

    const lq = query.toLowerCase();

    return items
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const score = (n: string) => (n === lq ? 0 : n.startsWith(lq) ? 1 : 2);
        const diff = score(aName) - score(bName);

        return diff !== 0 ? diff : aName.localeCompare(bName);
      })
      .slice(0, limit);
  }

  async search(query: string, skip: number = 0, take: number = 20): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        active: true,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      skip,
      take,
      orderBy: { name: "asc" },
    });
  }

  async searchCount(query: string): Promise<number> {
    return prisma.product.count({
      where: {
        active: true,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  }
}
