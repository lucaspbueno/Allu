import { Decimal } from "@prisma/client/runtime/library";
import { ProductService } from "./product.service";
import { ProductRepository } from "../repositories/product.repository";
import { cache } from "../lib/cache";

jest.mock("../lib/cache", () => ({
  cache: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    invalidate: jest.fn(),
  },
}));

const fakeProdutos = [
  {
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
  },
  {
    id: 2,
    name: "MacBook Air M3",
    description: "Notebook Apple",
    price: new Decimal("349.90"),
    imageUrl: "https://placehold.co/400x400",
    category: "Notebooks",
    stock: 30,
    active: true,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    deletedAt: null,
  },
];

describe("ProductService", () => {
  let service: ProductService;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
      findAllCursor: jest.fn(),
      findCategories: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;

    service = new ProductService(mockRepository);
    jest.clearAllMocks();
    (cache.get as jest.Mock).mockReturnValue(null);
  });

  describe("list", () => {
    it("retorna resultado paginado com dados corretos", async () => {
      mockRepository.findAll.mockResolvedValue(fakeProdutos);
      mockRepository.count.mockResolvedValue(10);

      const result = await service.list(1, 20);

      expect(result).toMatchObject({
        data: fakeProdutos,
        total: 10,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it("calcula skip corretamente para página 3 com limit 5", async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(25);

      const result = await service.list(3, 5);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
      expect(result.totalPages).toBe(5);
    });

    it("repassa options ao repository (category, search, sortBy)", async () => {
      mockRepository.findAll.mockResolvedValue([fakeProdutos[0]]);
      mockRepository.count.mockResolvedValue(1);

      await service.list(1, 20, { category: "Smartphones", search: "iphone", sortBy: "price" });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ category: "Smartphones", search: "iphone", sortBy: "price" })
      );
      expect(mockRepository.count).toHaveBeenCalledWith(
        expect.objectContaining({ category: "Smartphones" })
      );
    });

    it("calcula totalPages arredondando para cima", async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(7);

      const result = await service.list(1, 3);

      expect(result.totalPages).toBe(3);
    });

    it("consulta o repository e armazena no cache quando há cache miss", async () => {
      mockRepository.findAll.mockResolvedValue(fakeProdutos);
      mockRepository.count.mockResolvedValue(2);

      await service.list(1, 20);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(cache.set).toHaveBeenCalledTimes(1);
    });

    it("retorna do cache sem consultar o repository quando há cache hit", async () => {
      const cachedResult = { data: fakeProdutos, total: 2, page: 1, limit: 20, totalPages: 1 };
      (cache.get as jest.Mock).mockReturnValue(cachedResult);

      const result = await service.list(1, 20);

      expect(result).toEqual(cachedResult);
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe("listCursor", () => {
    it("retorna resultado com cursor quando há mais itens", async () => {
      mockRepository.findAllCursor.mockResolvedValue({
        items: [fakeProdutos[0]],
        nextCursor: 5,
        hasMore: true,
      });

      const result = await service.listCursor(3, { cursor: 2 });

      expect(result).toEqual({ data: [fakeProdutos[0]], nextCursor: 5, hasMore: true });
      expect(mockRepository.findAllCursor).toHaveBeenCalledWith(
        expect.objectContaining({ take: 3, cursor: 2 })
      );
    });

    it("retorna nextCursor=null e hasMore=false na última página", async () => {
      mockRepository.findAllCursor.mockResolvedValue({
        items: fakeProdutos,
        nextCursor: null,
        hasMore: false,
      });

      const result = await service.listCursor(20);

      expect(result.nextCursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });

    it("usa cache em listCursor", async () => {
      const cachedResult = { data: fakeProdutos, nextCursor: null, hasMore: false };
      (cache.get as jest.Mock).mockReturnValue(cachedResult);

      const result = await service.listCursor(20);

      expect(result).toEqual(cachedResult);
      expect(mockRepository.findAllCursor).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("retorna produto quando encontrado", async () => {
      mockRepository.findById.mockResolvedValue(fakeProdutos[0]);

      const result = await service.getById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(fakeProdutos[0]);
    });

    it("retorna null quando produto não encontrado", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getById(999);

      expect(result).toBeNull();
    });

    it("armazena produto no cache quando encontrado", async () => {
      mockRepository.findById.mockResolvedValue(fakeProdutos[0]);

      await service.getById(1);

      expect(cache.set).toHaveBeenCalledWith("products:id:1", fakeProdutos[0]);
    });

    it("não armazena no cache quando produto não encontrado", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await service.getById(999);

      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe("getCategories", () => {
    it("retorna lista de categorias do repository", async () => {
      mockRepository.findCategories.mockResolvedValue(["Acessórios", "Notebooks", "Smartphones"]);

      const result = await service.getCategories();

      expect(result).toEqual(["Acessórios", "Notebooks", "Smartphones"]);
      expect(mockRepository.findCategories).toHaveBeenCalledTimes(1);
    });

    it("retorna do cache sem consultar o repository quando há cache hit", async () => {
      const cached = ["Smartphones", "Tablets"];
      (cache.get as jest.Mock).mockReturnValue(cached);

      const result = await service.getCategories();

      expect(result).toEqual(cached);
      expect(mockRepository.findCategories).not.toHaveBeenCalled();
    });
  });
});
