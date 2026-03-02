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

describe("ProductRepository", () => {
  let repository: ProductRepository;

  beforeEach(() => {
    repository = new ProductRepository();
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("retorna lista de produtos ativos com paginação padrão", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([fakeProduto]);

      const result = await repository.findAll();

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith({
        where: { active: true },
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
          where: { active: true, category: "Notebooks" },
        })
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

  describe("findById", () => {
    it("retorna produto ativo quando encontrado", async () => {
      mockedPrisma.product.findFirst.mockResolvedValue(fakeProduto);

      const result = await repository.findById(1);

      expect(mockedPrisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: 1, active: true },
      });
      expect(result).toEqual(fakeProduto);
    });

    it("retorna null quando produto não encontrado", async () => {
      mockedPrisma.product.findFirst.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it("retorna null para produto inativo", async () => {
      mockedPrisma.product.findFirst.mockResolvedValue(null);

      const result = await repository.findById(1);

      expect(mockedPrisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: 1, active: true },
      });
      expect(result).toBeNull();
    });
  });

  describe("count", () => {
    it("retorna contagem de produtos ativos", async () => {
      mockedPrisma.product.count.mockResolvedValue(10);

      const result = await repository.count();

      expect(mockedPrisma.product.count).toHaveBeenCalledWith({
        where: { active: true },
      });
      expect(result).toBe(10);
    });

    it("filtra contagem por categoria", async () => {
      mockedPrisma.product.count.mockResolvedValue(3);

      const result = await repository.count("Acessórios");

      expect(mockedPrisma.product.count).toHaveBeenCalledWith({
        where: { active: true, category: "Acessórios" },
      });
      expect(result).toBe(3);
    });
  });
});
