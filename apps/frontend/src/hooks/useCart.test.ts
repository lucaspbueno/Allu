import { renderHook, waitFor, act } from "@testing-library/react";
import { useCart } from "./useCart";

const mockGetCart = jest.fn();
const mockAddItem = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock("@/api/cart", () => ({
  getCart: (...args: unknown[]) => mockGetCart(...args),
  addItem: (...args: unknown[]) => mockAddItem(...args),
  updateQuantity: (...args: unknown[]) => mockUpdateQuantity(...args),
  removeItem: (...args: unknown[]) => mockRemoveItem(...args),
}));

jest.mock("@/lib/cartSession", () => ({
  getOrCreateCartSessionId: () => "sess_test",
}));

const carrinhoVazio = {
  id: 1,
  sessionId: "sess_test",
  items: [],
  createdAt: "",
  updatedAt: "",
};

const carrinhoComItem = {
  id: 1,
  sessionId: "sess_test",
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

describe("useCart", () => {
  beforeEach(() => {
    mockGetCart.mockReset();
    mockAddItem.mockReset();
    mockUpdateQuantity.mockReset();
    mockRemoveItem.mockReset();
    mockGetCart.mockResolvedValue(carrinhoVazio);
  });

  describe("carregamento inicial", () => {
    it("chama getCart e preenche cart quando a API retorna sucesso", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoComItem);

      const { result } = renderHook(() => useCart());

      expect(result.current.loading).toBe(true);
      expect(result.current.cart).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.cart).toEqual(carrinhoComItem);
      expect(result.current.error).toBeNull();
      expect(mockGetCart).toHaveBeenCalledWith("sess_test");
    });

    it("preenche error quando getCart falha", async () => {
      mockGetCart.mockRejectedValueOnce(new Error("Falha ao carregar carrinho"));

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.cart).toBeNull();
      expect(result.current.error).toBe("Falha ao carregar carrinho");
    });
  });

  describe("refetch", () => {
    it("chama getCart novamente e atualiza cart", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoVazio).mockResolvedValueOnce(carrinhoComItem);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.cart?.items).toHaveLength(0);

      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGetCart).toHaveBeenCalledTimes(2);
        expect(result.current.cart?.items).toHaveLength(1);
      });
    });
  });

  describe("addItem", () => {
    it("chama addItem da API, atualiza cart e retorna carrinho", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoVazio);
      mockAddItem.mockResolvedValueOnce(carrinhoComItem);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updated: unknown = null;
      await act(async () => {
        updated = await result.current.addItem({
          productId: 10,
          name: "Produto A",
          price: 29.9,
          quantity: 2,
        });
      });

      expect(updated).toEqual(carrinhoComItem);
      expect(result.current.cart).toEqual(carrinhoComItem);
      expect(mockAddItem).toHaveBeenCalledWith("sess_test", {
        productId: 10,
        name: "Produto A",
        price: 29.9,
        quantity: 2,
      });
    });

    it("relança o erro quando addItem da API falha", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoVazio);
      mockAddItem.mockRejectedValueOnce(new Error("Falha ao adicionar"));

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.addItem({
          productId: 1,
          name: "X",
          price: 10,
        })
      ).rejects.toThrow("Falha ao adicionar");
    });
  });

  describe("updateQuantity", () => {
    it("chama updateQuantity da API e atualiza cart", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoComItem);
      const carrinhoAtualizado = {
        ...carrinhoComItem,
        items: [{ ...carrinhoComItem.items[0], quantity: 5 }],
      };
      mockUpdateQuantity.mockResolvedValueOnce(carrinhoAtualizado);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateQuantity(10, 5);
      });

      expect(result.current.cart).toEqual(carrinhoAtualizado);
      expect(mockUpdateQuantity).toHaveBeenCalledWith("sess_test", 10, 5);
    });

    it("relança o erro quando updateQuantity falha", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoComItem);
      mockUpdateQuantity.mockRejectedValueOnce(new Error("Item não encontrado no carrinho"));

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.updateQuantity(999, 1)).rejects.toThrow(
        "Item não encontrado no carrinho"
      );
    });
  });

  describe("removeItem", () => {
    it("chama removeItem da API e atualiza cart", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoComItem);
      mockRemoveItem.mockResolvedValueOnce(carrinhoVazio);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.removeItem(10);
      });

      expect(result.current.cart).toEqual(carrinhoVazio);
      expect(mockRemoveItem).toHaveBeenCalledWith("sess_test", 10);
    });

    it("relança o erro quando removeItem falha", async () => {
      mockGetCart.mockResolvedValueOnce(carrinhoComItem);
      mockRemoveItem.mockRejectedValueOnce(new Error("Falha ao remover"));

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.removeItem(10)).rejects.toThrow("Falha ao remover");
    });
  });
});
