import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../lib/prisma";
import type { DeepMockProxy } from "jest-mock-extended";
import type { PrismaClient } from ".prisma/search-client";
import { SearchRepository } from "./search.repository";

jest.mock("../lib/prisma");

const mockedPrisma = prisma as DeepMockProxy<PrismaClient>;

const fakeProduct = {
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

const fakeSuggestion = { id: 1, name: "iPhone 15 Pro", category: "Smartphones" };

describe("SearchRepository", () => {
  let repository: SearchRepository;

  beforeEach(() => {
    repository = new SearchRepository();
    jest.clearAllMocks();
  });

  describe("suggest", () => {
    it("retorna sugestões com where active e deletedAt null e contains case-insensitive", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([fakeSuggestion]);

      const result = await repository.suggest("iphone", 5);

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            active: true,
            deletedAt: null,
            name: { contains: "iphone", mode: "insensitive" },
          },
          take: 15,
          select: { id: true, name: true, category: true },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(fakeSuggestion);
    });

    it("aplica limit e retorna no máximo limit itens após ordenação", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([
        { id: 1, name: "A", category: "X" },
        { id: 2, name: "B", category: "X" },
        { id: 3, name: "C", category: "X" },
      ]);

      const result = await repository.suggest("x", 2);

      expect(result).toHaveLength(2);
    });
  });

  describe("search", () => {
    it("busca em name e description com OR e paginação", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([fakeProduct]);

      const result = await repository.search("apple", 0, 20);

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          active: true,
          deletedAt: null,
          OR: [
            { name: { contains: "apple", mode: "insensitive" } },
            { description: { contains: "apple", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 20,
        orderBy: { name: "asc" },
      });
      expect(result).toEqual([fakeProduct]);
    });

    it("aplica skip e take corretamente", async () => {
      mockedPrisma.product.findMany.mockResolvedValue([]);

      await repository.search("test", 10, 5);

      expect(mockedPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
    });
  });

  describe("searchCount", () => {
    it("retorna contagem com mesmo filtro OR que search", async () => {
      mockedPrisma.product.count.mockResolvedValue(3);

      const result = await repository.searchCount("mac");

      expect(mockedPrisma.product.count).toHaveBeenCalledWith({
        where: {
          active: true,
          deletedAt: null,
          OR: [
            { name: { contains: "mac", mode: "insensitive" } },
            { description: { contains: "mac", mode: "insensitive" } },
          ],
        },
      });
      expect(result).toBe(3);
    });
  });
});
