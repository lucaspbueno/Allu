import { Decimal } from "@prisma/client/runtime/library";
import { SearchService } from "./search.service";
import { SearchRepository } from "../repositories/search.repository";
import { cache } from "../lib/cache";

jest.mock("../lib/cache", () => ({
  cache: {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    invalidate: jest.fn(),
  },
}));

const fakeProduct = {
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
};

const fakeSuggestion = { id: 1, name: "iPhone 15 Pro", category: "Smartphones" };

describe("SearchService", () => {
  let service: SearchService;
  let mockRepository: jest.Mocked<SearchRepository>;

  beforeEach(() => {
    mockRepository = {
      suggest: jest.fn(),
      search: jest.fn(),
      searchCount: jest.fn(),
    } as unknown as jest.Mocked<SearchRepository>;
    service = new SearchService(mockRepository);
    jest.clearAllMocks();
    (cache.get as jest.Mock).mockReturnValue(null);
  });

  describe("suggest", () => {
    it("retorna data vazia quando query é vazia ou só espaços", async () => {
      const result = await service.suggest("  ");

      expect(result).toEqual({ data: [] });
      expect(mockRepository.suggest).not.toHaveBeenCalled();
    });

    it("delega ao repository e retorna resultado", async () => {
      mockRepository.suggest.mockResolvedValue([fakeSuggestion]);

      const result = await service.suggest("iphone", 5);

      expect(mockRepository.suggest).toHaveBeenCalledWith("iphone", 5);
      expect(result).toEqual({ data: [fakeSuggestion] });
    });

    it("armazena no cache após consultar o repository", async () => {
      mockRepository.suggest.mockResolvedValue([fakeSuggestion]);

      await service.suggest("iphone", 5);

      expect(cache.set).toHaveBeenCalledWith("search:suggest:iphone:5", {
        data: [fakeSuggestion],
      });
    });

    it("retorna do cache sem chamar o repository quando há cache hit", async () => {
      (cache.get as jest.Mock).mockReturnValue({ data: [fakeSuggestion] });

      const result = await service.suggest("iphone", 5);

      expect(result).toEqual({ data: [fakeSuggestion] });
      expect(mockRepository.suggest).not.toHaveBeenCalled();
    });
  });

  describe("search", () => {
    it("retorna resultado vazio quando query é vazia ou só espaços", async () => {
      const result = await service.search("  ", 1, 20);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(mockRepository.search).not.toHaveBeenCalled();
    });

    it("delega ao repository e retorna resultado paginado", async () => {
      mockRepository.search.mockResolvedValue([fakeProduct]);
      mockRepository.searchCount.mockResolvedValue(1);

      const result = await service.search("apple", 1, 20);

      expect(mockRepository.search).toHaveBeenCalledWith("apple", 0, 20);
      expect(mockRepository.searchCount).toHaveBeenCalledWith("apple");
      expect(result).toMatchObject({
        data: [fakeProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it("calcula skip corretamente para página 2 com limit 10", async () => {
      mockRepository.search.mockResolvedValue([]);
      mockRepository.searchCount.mockResolvedValue(0);

      await service.search("x", 2, 10);

      expect(mockRepository.search).toHaveBeenCalledWith("x", 10, 10);
    });

    it("retorna do cache sem chamar o repository quando há cache hit", async () => {
      const cached = {
        data: [fakeProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      (cache.get as jest.Mock).mockReturnValue(cached);

      const result = await service.search("apple", 1, 20);

      expect(result).toEqual(cached);
      expect(mockRepository.search).not.toHaveBeenCalled();
      expect(mockRepository.searchCount).not.toHaveBeenCalled();
    });
  });
});
