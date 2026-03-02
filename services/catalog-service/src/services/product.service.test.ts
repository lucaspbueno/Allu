import { Decimal } from "@prisma/client/runtime/library";
import { ProductService } from "./product.service";
import { ProductRepository } from "../repositories/product.repository";

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
    } as unknown as jest.Mocked<ProductRepository>;
    service = new ProductService(mockRepository);
  });

  describe("list", () => {
    it("retorna resultado paginado com dados corretos", async () => {
      mockRepository.findAll.mockResolvedValue(fakeProdutos);
      mockRepository.count.mockResolvedValue(10);

      const result = await service.list(1, 20);

      expect(result).toEqual({
        data: fakeProdutos,
        total: 10,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        category: undefined,
      });
    });

    it("calcula skip corretamente para página 3 com limit 5", async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(25);

      const result = await service.list(3, 5);

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        category: undefined,
      });
      expect(result.totalPages).toBe(5);
    });

    it("repassa filtro de categoria ao repository", async () => {
      mockRepository.findAll.mockResolvedValue([fakeProdutos[0]]);
      mockRepository.count.mockResolvedValue(1);

      const result = await service.list(1, 20, "Smartphones");

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ category: "Smartphones" })
      );
      expect(mockRepository.count).toHaveBeenCalledWith("Smartphones");
      expect(result.data).toHaveLength(1);
    });

    it("calcula totalPages arredondando para cima", async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(7);

      const result = await service.list(1, 3);

      expect(result.totalPages).toBe(3);
    });
  });

  describe("getById", () => {
    it("retorna produto quando encontrado", async () => {
      mockRepository.findById.mockResolvedValue(fakeProdutos[0]);

      const result = await service.getById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(fakeProdutos[0]);
    });

    it("retorna null quando não encontrado", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getById(999);

      expect(result).toBeNull();
    });
  });
});
