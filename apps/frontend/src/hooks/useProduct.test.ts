import { renderHook, waitFor } from "@testing-library/react";
import { useProduct } from "./useProduct";

const mockFetchProductById = jest.fn();
jest.mock("@/api/catalog", () => ({
  fetchProductById: (...args: unknown[]) => mockFetchProductById(...args),
}));

const produtoFake = {
  id: 1,
  name: "Produto Teste",
  description: "Desc",
  price: "29.90",
  imageUrl: "/img.jpg",
  category: "Categoria",
  stock: 5,
  active: true,
  createdAt: "",
  updatedAt: "",
};

describe("useProduct", () => {
  beforeEach(() => {
    mockFetchProductById.mockReset();
  });

  describe("id nulo ou inválido", () => {
    it("retorna product null e error null quando id é null", () => {
      const { result } = renderHook(() => useProduct(null));

      expect(result.current.product).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetchProductById).not.toHaveBeenCalled();
    });

    it("retorna error quando id é menor ou igual a zero", () => {
      const { result } = renderHook(() => useProduct(0));

      expect(result.current.product).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("ID inválido");
      expect(mockFetchProductById).not.toHaveBeenCalled();
    });
  });

  describe("id válido", () => {
    it("busca e preenche product quando a API retorna sucesso", async () => {
      mockFetchProductById.mockResolvedValueOnce(produtoFake);

      const { result } = renderHook(() => useProduct(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.product).toEqual(produtoFake);
      expect(result.current.error).toBeNull();
      expect(mockFetchProductById).toHaveBeenCalledWith(1);
    });

    it("preenche error quando a API falha", async () => {
      mockFetchProductById.mockRejectedValueOnce(new Error("Produto não encontrado"));

      const { result } = renderHook(() => useProduct(999));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.product).toBeNull();
      expect(result.current.error).toBe("Produto não encontrado");
    });
  });
});
