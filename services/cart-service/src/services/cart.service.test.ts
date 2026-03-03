import { Decimal } from "@prisma/client/runtime/library";
import { CartService } from "./cart.service";
import { CartRepository } from "../repositories/cart.repository";

const fakeCart = {
  id: 1,
  sessionId: "sess_abc",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  deletedAt: null,
  items: [
    {
      id: 1,
      cartId: 1,
      productId: 10,
      name: "iPhone 15 Pro",
      price: new Decimal("219.90"),
      quantity: 2,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
  ],
};

describe("CartService", () => {
  let service: CartService;
  let mockRepository: jest.Mocked<CartRepository>;

  beforeEach(() => {
    mockRepository = {
      findBySessionId: jest.fn(),
      create: jest.fn(),
      upsertItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
    } as unknown as jest.Mocked<CartRepository>;
    service = new CartService(mockRepository);
    jest.clearAllMocks();
  });

  describe("getOrCreateCart", () => {
    it("retorna carrinho existente quando encontrado", async () => {
      mockRepository.findBySessionId.mockResolvedValue(fakeCart);

      const result = await service.getOrCreateCart("sess_abc");

      expect(mockRepository.findBySessionId).toHaveBeenCalledWith("sess_abc");
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(fakeCart);
    });

    it("cria carrinho e retorna com items vazio quando não existe", async () => {
      mockRepository.findBySessionId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ ...fakeCart, id: 2, sessionId: "sess_novo" });

      const result = await service.getOrCreateCart("sess_novo");

      expect(mockRepository.create).toHaveBeenCalledWith("sess_novo");
      expect(result.items).toEqual([]);
      expect(result.sessionId).toBe("sess_novo");
    });
  });

  describe("getCart", () => {
    it("retorna carrinho quando encontrado", async () => {
      mockRepository.findBySessionId.mockResolvedValue(fakeCart);

      const result = await service.getCart("sess_abc");

      expect(mockRepository.findBySessionId).toHaveBeenCalledWith("sess_abc");
      expect(result).toEqual(fakeCart);
    });

    it("retorna null quando carrinho não existe", async () => {
      mockRepository.findBySessionId.mockResolvedValue(null);

      const result = await service.getCart("sess_inexistente");

      expect(result).toBeNull();
    });
  });

  describe("addItem", () => {
    it("obtém ou cria carrinho, faz upsert do item e retorna carrinho atualizado", async () => {
      mockRepository.findBySessionId
        .mockResolvedValueOnce({ ...fakeCart, items: [] })
        .mockResolvedValueOnce(fakeCart);
      mockRepository.upsertItem.mockResolvedValue(fakeCart.items[0] as never);

      const result = await service.addItem("sess_abc", 10, "iPhone", 219.9, 2);

      expect(mockRepository.upsertItem).toHaveBeenCalledWith(1, 10, "iPhone", 219.9, 2);
      expect(mockRepository.findBySessionId).toHaveBeenCalledTimes(2);
      expect(result).toEqual(fakeCart);
    });

    it("usa quantity 1 quando não informado", async () => {
      mockRepository.findBySessionId.mockResolvedValue(fakeCart);
      mockRepository.upsertItem.mockResolvedValue(fakeCart.items[0] as never);

      await service.addItem("sess_abc", 5, "Produto", 10);

      expect(mockRepository.upsertItem).toHaveBeenCalledWith(1, 5, "Produto", 10, 1);
    });
  });

  describe("updateQuantity", () => {
    it("retorna carrinho atualizado quando item existe", async () => {
      mockRepository.findBySessionId.mockResolvedValue(fakeCart);
      mockRepository.updateItemQuantity.mockResolvedValue({
        ...fakeCart.items[0],
        quantity: 5,
      } as never);
      mockRepository.findBySessionId.mockResolvedValue({
        ...fakeCart,
        items: [{ ...fakeCart.items[0], quantity: 5 }],
      });

      const result = await service.updateQuantity("sess_abc", 10, 5);

      expect(mockRepository.updateItemQuantity).toHaveBeenCalledWith(1, 10, 5);
      expect(result).not.toBeNull();
    });

    it("retorna null quando carrinho não existe", async () => {
      mockRepository.findBySessionId.mockResolvedValue(null);

      const result = await service.updateQuantity("sess_inexistente", 10, 1);

      expect(result).toBeNull();
      expect(mockRepository.updateItemQuantity).not.toHaveBeenCalled();
    });

    it("retorna null quando item não existe no carrinho", async () => {
      mockRepository.findBySessionId.mockResolvedValue(fakeCart);
      mockRepository.updateItemQuantity.mockResolvedValue(null);

      const result = await service.updateQuantity("sess_abc", 999, 1);

      expect(result).toBeNull();
    });
  });

  describe("removeItem", () => {
    it("retorna carrinho após remoção quando item existe", async () => {
      mockRepository.findBySessionId.mockResolvedValue(fakeCart);
      mockRepository.removeItem.mockResolvedValue(true);
      mockRepository.findBySessionId.mockResolvedValue({ ...fakeCart, items: [] });

      const result = await service.removeItem("sess_abc", 10);

      expect(mockRepository.removeItem).toHaveBeenCalledWith(1, 10);
      expect(result).not.toBeNull();
    });

    it("retorna null quando carrinho não existe", async () => {
      mockRepository.findBySessionId.mockResolvedValue(null);

      const result = await service.removeItem("sess_inexistente", 10);

      expect(result).toBeNull();
      expect(mockRepository.removeItem).not.toHaveBeenCalled();
    });

    it("retorna null quando item não foi removido", async () => {
      mockRepository.findBySessionId.mockResolvedValue(fakeCart);
      mockRepository.removeItem.mockResolvedValue(false);

      const result = await service.removeItem("sess_abc", 999);

      expect(result).toBeNull();
    });
  });
});
