import { renderHook, waitFor, act } from "@testing-library/react";
import { useCatalogInfinite } from "./useCatalogInfinite";

const mockFetchProducts = jest.fn();
jest.mock("@/api/catalog", () => ({
  fetchProducts: (...args: unknown[]) => mockFetchProducts(...args),
}));

const produtoFake = {
  id: 1,
  name: "Produto Teste",
  description: "Desc",
  price: "19.90",
  imageUrl: "/img.jpg",
  category: "Categoria",
  stock: 10,
  active: true,
  createdAt: "",
  updatedAt: "",
};

describe("useCatalogInfinite", () => {
  beforeEach(() => {
    mockFetchProducts.mockReset();
  });

  describe("carregamento inicial", () => {
    it("carrega a primeira página ao montar e preenche products", async () => {
      mockFetchProducts.mockResolvedValueOnce({
        data: [produtoFake],
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      });

      const { result } = renderHook(() => useCatalogInfinite());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe("Produto Teste");
      expect(result.current.hasMore).toBe(false);
      expect(mockFetchProducts).toHaveBeenCalledWith(1, 12, undefined);
    });

    it("define hasMore true quando há mais páginas", async () => {
      mockFetchProducts.mockResolvedValueOnce({
        data: [produtoFake],
        total: 25,
        page: 1,
        limit: 12,
        totalPages: 3,
      });

      const { result } = renderHook(() => useCatalogInfinite());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);
    });
  });

  describe("loadMore", () => {
    it("busca a próxima página e concatena aos products", async () => {
      mockFetchProducts
        .mockResolvedValueOnce({
          data: [produtoFake],
          total: 2,
          page: 1,
          limit: 12,
          totalPages: 2,
        })
        .mockResolvedValueOnce({
          data: [{ ...produtoFake, id: 2, name: "Produto 2" }],
          total: 2,
          page: 2,
          limit: 12,
          totalPages: 2,
        });

      const { result } = renderHook(() => useCatalogInfinite());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toHaveLength(1);

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[1].name).toBe("Produto 2");
      expect(mockFetchProducts).toHaveBeenCalledTimes(2);
      expect(mockFetchProducts).toHaveBeenLastCalledWith(2, 12, undefined);
    });
  });

  describe("erro", () => {
    it("preenche error quando a API falha", async () => {
      mockFetchProducts.mockRejectedValueOnce(new Error("Falha na rede"));

      const { result } = renderHook(() => useCatalogInfinite());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Falha na rede");
      expect(result.current.products).toHaveLength(0);
    });
  });

  describe("categoria", () => {
    it("passa category para fetchProducts no carregamento inicial", async () => {
      mockFetchProducts.mockResolvedValueOnce({
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });

      renderHook(() => useCatalogInfinite("Eletrônicos"));

      await waitFor(() => {
        expect(mockFetchProducts).toHaveBeenCalledWith(1, 12, "Eletrônicos");
      });
    });
  });
});
