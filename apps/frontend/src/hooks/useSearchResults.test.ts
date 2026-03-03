import { renderHook, waitFor } from "@testing-library/react";
import { useSearchResults } from "./useSearchResults";

const mockFetchSearchProducts = jest.fn();
jest.mock("@/api/search", () => ({
  fetchSearchProducts: (...args: unknown[]) => mockFetchSearchProducts(...args),
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

describe("useSearchResults", () => {
  beforeEach(() => {
    mockFetchSearchProducts.mockReset();
  });

  describe("query nula ou vazia", () => {
    it("retorna data vazia quando query é null", () => {
      const { result } = renderHook(() => useSearchResults(null));

      expect(result.current.data).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(mockFetchSearchProducts).not.toHaveBeenCalled();
    });

    it("retorna data vazia quando query é string vazia", () => {
      const { result } = renderHook(() => useSearchResults(""));

      expect(result.current.data).toEqual([]);
      expect(mockFetchSearchProducts).not.toHaveBeenCalled();
    });
  });

  describe("query preenchida", () => {
    it("busca e preenche data, total e totalPages", async () => {
      mockFetchSearchProducts.mockResolvedValueOnce({
        data: [produtoFake],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const { result } = renderHook(() => useSearchResults("teste"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].name).toBe("Produto Teste");
      expect(result.current.total).toBe(1);
      expect(result.current.totalPages).toBe(1);
      expect(mockFetchSearchProducts).toHaveBeenCalledWith("teste", 1, 20);
    });

    it("preenche error quando a API falha", async () => {
      mockFetchSearchProducts.mockRejectedValueOnce(new Error("Erro de rede"));

      const { result } = renderHook(() => useSearchResults("termo"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Erro de rede");
      expect(result.current.data).toEqual([]);
    });
  });
});
