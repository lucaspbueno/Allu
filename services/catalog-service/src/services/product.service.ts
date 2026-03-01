import { Product } from "@prisma/client";
import { ProductRepository, FindAllOptions } from "../repositories/product.repository";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async list(
    page: number = 1,
    limit: number = 20,
    category?: string
  ): Promise<PaginatedResult<Product>> {
    const skip = (page - 1) * limit;
    const options: FindAllOptions = { skip, take: limit, category };

    const [data, total] = await Promise.all([
      this.repository.findAll(options),
      this.repository.count(category),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }
}
