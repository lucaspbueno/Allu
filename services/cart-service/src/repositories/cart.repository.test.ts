import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../lib/prisma";
import type { DeepMockProxy } from "jest-mock-extended";
import type { PrismaClient } from ".prisma/cart-client";
import { CartRepository } from "./cart.repository";

jest.mock("../lib/prisma");

const mockedPrisma = prisma as DeepMockProxy<PrismaClient>;

const fakeCart = {
  id: 1,
  sessionId: "sess_abc",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  deletedAt: null,
};

const fakeItem = {
  id: 1,
  cartId: 1,
  productId: 10,
  name: "iPhone 15 Pro",
  price: new Decimal("219.90"),
  quantity: 2,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  deletedAt: null,
};

describe("CartRepository", () => {
  let repository: CartRepository;

  beforeEach(() => {
    repository = new CartRepository();
    jest.clearAllMocks();
  });

  describe("findBySessionId", () => {
    it("retorna carrinho com itens quando encontrado", async () => {
      mockedPrisma.cart.findFirst.mockResolvedValue({ ...fakeCart, items: [fakeItem] });

      const result = await repository.findBySessionId("sess_abc");

      expect(mockedPrisma.cart.findFirst).toHaveBeenCalledWith({
        where: { sessionId: "sess_abc", deletedAt: null },
        include: {
          items: { where: { deletedAt: null }, orderBy: { id: "asc" } },
        },
      });
      expect(result).toEqual({ ...fakeCart, items: [fakeItem] });
    });

    it("retorna null quando sessão não existe", async () => {
      mockedPrisma.cart.findFirst.mockResolvedValue(null);

      const result = await repository.findBySessionId("sess_inexistente");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("cria carrinho com sessionId informado", async () => {
      mockedPrisma.cart.create.mockResolvedValue(fakeCart);

      const result = await repository.create("sess_novo");

      expect(mockedPrisma.cart.create).toHaveBeenCalledWith({
        data: { sessionId: "sess_novo" },
      });
      expect(result).toEqual(fakeCart);
    });
  });

  describe("upsertItem", () => {
    it("chama upsert com cartId_productId, create e update com deletedAt null", async () => {
      mockedPrisma.cartItem.upsert.mockResolvedValue(fakeItem);

      await repository.upsertItem(1, 10, "Produto X", 99.9, 3);

      expect(mockedPrisma.cartItem.upsert).toHaveBeenCalledWith({
        where: { cartId_productId: { cartId: 1, productId: 10 } },
        create: { cartId: 1, productId: 10, name: "Produto X", price: 99.9, quantity: 3 },
        update: { quantity: 3, name: "Produto X", price: 99.9, deletedAt: null },
      });
    });

    it("inclui imageUrl no create e update quando informado", async () => {
      mockedPrisma.cartItem.upsert.mockResolvedValue({ ...fakeItem, imageUrl: "https://img/1.jpg" });

      await repository.upsertItem(1, 10, "Produto X", 99.9, 2, "https://img/1.jpg");

      expect(mockedPrisma.cartItem.upsert).toHaveBeenCalledWith({
        where: { cartId_productId: { cartId: 1, productId: 10 } },
        create: { cartId: 1, productId: 10, name: "Produto X", price: 99.9, quantity: 2, imageUrl: "https://img/1.jpg" },
        update: expect.objectContaining({ quantity: 2, imageUrl: "https://img/1.jpg" }),
      });
    });

    it("usa quantity 1 quando não informado", async () => {
      mockedPrisma.cartItem.upsert.mockResolvedValue({ ...fakeItem, quantity: 1 });

      await repository.upsertItem(1, 5, "Nome", 10, 1);

      expect(mockedPrisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ quantity: 1 }),
          update: expect.objectContaining({ quantity: 1 }),
        })
      );
    });
  });

  describe("updateItemQuantity", () => {
    it("atualiza quantidade e retorna item quando encontrado", async () => {
      mockedPrisma.cartItem.updateMany.mockResolvedValue({ count: 1 });
      mockedPrisma.cartItem.findFirst.mockResolvedValue({ ...fakeItem, quantity: 5 });

      const result = await repository.updateItemQuantity(1, 10, 5);

      expect(mockedPrisma.cartItem.updateMany).toHaveBeenCalledWith({
        where: { cartId: 1, productId: 10, deletedAt: null },
        data: { quantity: 5 },
      });
      expect(result).toEqual({ ...fakeItem, quantity: 5 });
    });

    it("retorna null quando nenhum item for atualizado", async () => {
      mockedPrisma.cartItem.updateMany.mockResolvedValue({ count: 0 });

      const result = await repository.updateItemQuantity(1, 999, 1);

      expect(result).toBeNull();
      expect(mockedPrisma.cartItem.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("removeItem", () => {
    it("atualiza deletedAt e retorna true quando item existe", async () => {
      mockedPrisma.cartItem.updateMany.mockResolvedValue({ count: 1 });

      const result = await repository.removeItem(1, 10);

      expect(mockedPrisma.cartItem.updateMany).toHaveBeenCalledWith({
        where: { cartId: 1, productId: 10, deletedAt: null },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
      expect(result).toBe(true);
    });

    it("retorna false quando nenhum item for atualizado", async () => {
      mockedPrisma.cartItem.updateMany.mockResolvedValue({ count: 0 });

      const result = await repository.removeItem(1, 999);

      expect(result).toBe(false);
    });
  });
});
