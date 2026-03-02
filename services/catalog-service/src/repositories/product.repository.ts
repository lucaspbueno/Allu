import { Product, Prisma } from ".prisma/catalog-client";
import { prisma } from "../lib/prisma";

export interface FindAllOptions {
  skip?: number;
  take?: number;
  category?: string;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
}

export class ProductRepository {
  async findAll(options: FindAllOptions = {}): Promise<Product[]> {
    const { skip = 0, take = 20, category, orderBy } = options;
    const where: Prisma.ProductWhereInput = { active: true };

    if (category) where.category = category;

    return prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: orderBy ?? { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async count(category?: string): Promise<number> {
    const where: Prisma.ProductWhereInput = { active: true };

    if (category) where.category = category;

    return prisma.product.count({ where });
  }
}
