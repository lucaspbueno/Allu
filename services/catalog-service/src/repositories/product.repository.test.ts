import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../lib/prisma";
import type { DeepMockProxy } from "jest-mock-extended";
import type { PrismaClient } from ".prisma/catalog-client";
import { ProductRepository } from "./product.repository";

jest.mock("../lib/prisma");

const mockedPrisma = prisma as DeepMockProxy<PrismaClient>;

const fakeProduto = {
  id: 1,
  name: "iPhone 15 Pro",
  description: "Smartphone Apple",
  price: new Decimal("219.90"),
  imageUrl: "https://placehold.co/400x400",
  category: "Smartphones",
  stock: 50,
  active: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  deletedAt: null,
};

const fakeProduto2 = { ...fakeProduto, id: 2, name: "MacBook Air M3", category: "Notebooks" };

describe("ProductRepository", () => {
  let repository: ProductRepository;

  beforeEach(() => {
    repository = new ProductRepository();
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("retorna lista de produtos ativos com filtros padrão", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([fakeProduto]);

      const result = await repository.findAll();

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith({
        where: { active: true, deletedAt: null },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual([fakeProduto]);
    });

    it("filtra por categoria quando informada", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([]);

      await repository.findAll({ category: "Notebooks" });

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true, deletedAt: null, category: "Notebooks" },
        })
      );
    });

    it("filtra por nome com busca parcial (case-insensitive) quando search informado", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([]);

      await repository.findAll({ search: "iphone" });

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: "iphone", mode: "insensitive" },
          }),
        })
      );
    });

    it("aplica filtro de preço mínimo e máximo", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([]);

      await repository.findAll({ minPrice: 50, maxPrice: 300 });

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 50, lte: 300 },
          }),
        })
      );
    });

    it("ordena por campo e direção personalizados", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([]);

      await repository.findAll({ sortBy: "price", order: "asc" });

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { price: "asc" } })
      );
    });

    it("aplica skip e take customizados", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([]);

      await repository.findAll({ skip: 10, take: 5 });

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
    });
  });

  describe("findAllCursor", () => {
    it("retorna itens, nextCursor e hasMore=true quando há mais itens", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([fakeProduto, fakeProduto2]);

      const result = await repository.findAllCursor({ take: 1 });

      expect(result.hasMore).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBe(fakeProduto.id);
    });

    it("retorna hasMore=false e nextCursor=null quando não há mais itens", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([fakeProduto]);

      const result = await repository.findAllCursor({ take: 5 });

      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
      expect(result.items).toHaveLength(1);
    });

    it("passa cursor e skip=1 ao Prisma quando cursor é informado", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([]);

      await repository.findAllCursor({ take: 5, cursor: 3 });

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: 3 },
          skip: 1,
        })
      );
    });
  });

  describe("findById", () => {
    it("retorna produto ativo quando encontrado", async () => {
      mockedPrisma.product.findFirst.mockResolvedValue(fakeProduto);

      const result = await repository.findById(1);

      expect(mockedPrisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: 1, active: true, deletedAt: null },
      });
      expect(result).toEqual(fakeProduto);
    });

    it("retorna null quando produto não encontrado", async () => {
      mockedPrisma.product.findFirst.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it("retorna null para produto inativo ou deletado", async () => {
      mockedPrisma.product.findFirst.mockResolvedValue(null);

      const result = await repository.findById(1);

      expect(mockedPrisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: 1, active: true, deletedAt: null },
      });
      expect(result).toBeNull();
    });
  });

  describe("count", () => {
    it("retorna contagem de produtos ativos", async () => {
      mockedPrisma.product.count.mockResolvedValue(10);

      const result = await repository.count();

      expect(mockedPrisma.product.count).toHaveBeenCalledWith({
        where: { active: true, deletedAt: null },
      });
      expect(result).toBe(10);
    });

    it("filtra contagem por categoria", async () => {
      mockedPrisma.product.count.mockResolvedValue(3);

      const result = await repository.count({ category: "Acessórios" });

      expect(mockedPrisma.product.count).toHaveBeenCalledWith({
        where: { active: true, deletedAt: null, category: "Acessórios" },
      });
      expect(result).toBe(3);
    });

    it("filtra contagem com search e faixa de preço", async () => {
      mockedPrisma.product.count.mockResolvedValue(2);

      await repository.count({ search: "apple", minPrice: 100 });

      expect(mockedPrisma.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: "apple", mode: "insensitive" },
            price: { gte: 100 },
          }),
        })
      );
    });
  });

  describe("findCategories", () => {
    it("retorna lista de categorias distintas e ordenadas", async () => {
      mockedPrisma.product.groupBy.mockResolvedValue([
        { category: "Acessórios" },
        { category: "Notebooks" },
        { category: "Smartphones" },
      ] as never);

      const result = await repository.findCategories();

      expect(mockedPrisma.product.groupBy).toHaveBeenCalledWith({
        by: ["category"],
        where: { active: true, deletedAt: null },
        orderBy: { category: "asc" },
      });
      expect(result).toEqual(["Acessórios", "Notebooks", "Smartphones"]);
    });
  });
});
