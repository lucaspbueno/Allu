import { getCart, addItem, updateQuantity, removeItem } from "./cart";

jest.mock("@/config/api", () => ({ CART_API_BASE: "http://test.cart.api" }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const carrinhoFake = {
  id: 1,
  sessionId: "sess_abc",
  items: [
    {
      id: 1,
      cartId: 1,
      productId: 10,
      name: "Produto A",
      price: "29.90",
      quantity: 2,
    },
  ],
  createdAt: "",
  updatedAt: "",
};

describe("api/cart", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("getCart", () => {
    it("retorna o carrinho quando a API responde com sucesso", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(carrinhoFake),
      });

      const result = await getCart("sess_abc");

      expect(result).toEqual(carrinhoFake);
      expect(result.items).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith("http://test.cart.api/carts/sess_abc");
    });

    it("codifica sessionId na URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...carrinhoFake, sessionId: "sess/x" }),
      });

      await getCart("sess/x");

      expect(mockFetch).toHaveBeenCalledWith("http://test.cart.api/carts/sess%2Fx");
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(getCart("sess")).rejects.toThrow("Falha ao carregar carrinho");
    });
  });

  describe("addItem", () => {
    it("envia POST com productId, name, price e quantity e retorna carrinho", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(carrinhoFake),
      });

      const result = await addItem("sess_1", {
        productId: 5,
        name: "Item X",
        price: 19.9,
        quantity: 3,
      });

      expect(result).toEqual(carrinhoFake);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.cart.api/carts/sess_1/items",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: 5,
            name: "Item X",
            price: 19.9,
            quantity: 3,
          }),
        })
      );
    });

    it("usa quantity 1 quando não informada", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(carrinhoFake),
      });

      await addItem("sess_1", {
        productId: 5,
        name: "Item X",
        price: 19.9,
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.quantity).toBe(1);
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(addItem("sess", { productId: 1, name: "X", price: 10 })).rejects.toThrow(
        "Falha ao adicionar item ao carrinho"
      );
    });
  });

  describe("updateQuantity", () => {
    it("envia PATCH com quantity e retorna carrinho", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(carrinhoFake),
      });

      const result = await updateQuantity("sess_1", 10, 5);

      expect(result).toEqual(carrinhoFake);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.cart.api/carts/sess_1/items/10",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ quantity: 5 }),
        })
      );
    });

    it("lança erro quando o item não existe (404)", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(updateQuantity("sess", 999, 1)).rejects.toThrow(
        "Item não encontrado no carrinho"
      );
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(updateQuantity("sess", 1, 2)).rejects.toThrow("Falha ao atualizar quantidade");
    });
  });

  describe("removeItem", () => {
    it("envia DELETE e retorna carrinho", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(carrinhoFake),
      });

      const result = await removeItem("sess_1", 10);

      expect(result).toEqual(carrinhoFake);
      expect(mockFetch).toHaveBeenCalledWith("http://test.cart.api/carts/sess_1/items/10", {
        method: "DELETE",
      });
    });

    it("lança erro quando o item não existe (404)", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(removeItem("sess", 999)).rejects.toThrow("Item não encontrado no carrinho");
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(removeItem("sess", 1)).rejects.toThrow("Falha ao remover item");
    });
  });
});
