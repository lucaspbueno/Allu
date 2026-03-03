import { fetchProducts, fetchProductById } from "./catalog";

jest.mock("@/config/api", () => ({ CATALOG_API_BASE: "http://test.api" }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("api/catalog", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchProducts", () => {
    it("retorna dados paginados quando a API responde com sucesso", async () => {
      const data = [
        {
          id: 1,
          name: "Produto A",
          description: "Desc",
          price: "10.00",
          imageUrl: "/a.jpg",
          category: "X",
          stock: 5,
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
            limit: 12,
            totalPages: 1,
          }),
      });

      const result = await fetchProducts(1, 12);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("Produto A");
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
      expect(result.totalPages).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith("http://test.api/products?page=1&limit=12");
    });

    it("inclui category na URL quando informada", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [],
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,
          }),
      });

      await fetchProducts(2, 10, "Eletrônicos");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://test.api/products?page=2&limit=10&category=Eletr%C3%B4nicos"
      );
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(fetchProducts(1)).rejects.toThrow("Falha ao carregar produtos");
    });
  });

  describe("fetchProductById", () => {
    it("retorna o produto quando a API responde com sucesso", async () => {
      const product = {
        id: 5,
        name: "Produto X",
        description: "Descrição",
        price: "99.90",
        imageUrl: "/x.jpg",
        category: "Y",
        stock: 10,
        active: true,
        createdAt: "",
        updatedAt: "",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(product),
      });

      const result = await fetchProductById(5);

      expect(result).toEqual(product);
      expect(result.name).toBe("Produto X");
      expect(mockFetch).toHaveBeenCalledWith("http://test.api/products/5");
    });

    it("lança erro quando o produto não existe (404)", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(fetchProductById(999)).rejects.toThrow("Produto não encontrado");
    });

    it("lança erro quando a resposta não é ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(fetchProductById(1)).rejects.toThrow("Falha ao carregar produto");
    });
  });
});
