import { fetchSuggestions, fetchSearchProducts } from "./search";

jest.mock("@/config/api", () => ({ SEARCH_API_BASE: "http://test.search" }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("api/search", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchSuggestions", () => {
    it("retorna sugestões quando a API responde com sucesso", async () => {
      const data = [
        { id: 1, name: "iPhone", category: "Smartphones" },
        { id: 2, name: "iPad", category: "Tablets" },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data }),
      });

      const result = await fetchSuggestions("iph", 5);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe("iPhone");
      expect(result.data[0].category).toBe("Smartphones");
      expect(mockFetch).toHaveBeenCalledWith("http://test.search/search/suggestions?q=iph&limit=5");
    });

    it("usa limit padrão 5 quando não informado", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await fetchSuggestions("x");

      expect(mockFetch).toHaveBeenCalledWith("http://test.search/search/suggestions?q=x&limit=5");
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(fetchSuggestions("a")).rejects.toThrow("Falha ao carregar sugestões");
    });
  });

  describe("fetchSearchProducts", () => {
    it("retorna resultado paginado quando a API responde com sucesso", async () => {
      const data = [
        {
          id: 1,
          name: "Produto A",
          description: "Desc",
          price: "19.90",
          imageUrl: "/a.jpg",
          category: "X",
          stock: 10,
          active: true,
          createdAt: "",
          updatedAt: "",
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data,
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          }),
      });

      const result = await fetchSearchProducts("produto", 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Produto A");
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.search/search/products?q=produto&page=1&limit=20"
      );
    });

    it("usa page e limit padrão quando não informados", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          }),
      });

      await fetchSearchProducts("termo");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.search/search/products?q=termo&page=1&limit=20"
      );
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(fetchSearchProducts("x")).rejects.toThrow("Falha ao buscar produtos");
    });
  });
});
