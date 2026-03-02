import request from "supertest";
import express from "express";
import { Decimal } from "@prisma/client/runtime/library";
import { createProductRoutes } from "./product.routes";
import { ProductService } from "../services/product.service";

const fakeProduto = {
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

function createApp(mockService: Partial<ProductService>) {
  const app = express();
  app.use(express.json());
  app.use("/products", createProductRoutes(mockService as ProductService));
  return app;
}

describe("GET /products", () => {
  it("retorna lista paginada de produtos", async () => {
    const mockService = {
      list: jest.fn().mockResolvedValue({
        data: [fakeProduto],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
    };

    const res = await request(createApp(mockService)).get("/products");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(mockService.list).toHaveBeenCalledWith(1, 20, expect.objectContaining({}));
  });

  it("repassa page, limit e category da query string", async () => {
    const mockService = {
      list: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      }),
    };

    await request(createApp(mockService)).get("/products?page=2&limit=5&category=Notebooks");

    expect(mockService.list).toHaveBeenCalledWith(
      2,
      5,
      expect.objectContaining({ category: "Notebooks" })
    );
  });

  it("limita o limit a 100 no máximo", async () => {
    const mockService = {
      list: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 }),
    };

    await request(createApp(mockService)).get("/products?limit=999");

    expect(mockService.list).toHaveBeenCalledWith(1, 100, expect.objectContaining({}));
  });

  it("garante page mínima 1", async () => {
    const mockService = {
      list: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    };

    await request(createApp(mockService)).get("/products?page=-5");

    expect(mockService.list).toHaveBeenCalledWith(1, 20, expect.objectContaining({}));
  });

  it("repassa search ao service", async () => {
    const mockService = {
      list: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    };

    await request(createApp(mockService)).get("/products?search=iphone");

    expect(mockService.list).toHaveBeenCalledWith(
      1,
      20,
      expect.objectContaining({ search: "iphone" })
    );
  });

  it("repassa minPrice e maxPrice numéricos ao service", async () => {
    const mockService = {
      list: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    };

    await request(createApp(mockService)).get("/products?minPrice=50&maxPrice=300");

    expect(mockService.list).toHaveBeenCalledWith(
      1,
      20,
      expect.objectContaining({ minPrice: 50, maxPrice: 300 })
    );
  });

  it("repassa sortBy e order válidos ao service", async () => {
    const mockService = {
      list: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    };

    await request(createApp(mockService)).get("/products?sortBy=price&order=asc");

    expect(mockService.list).toHaveBeenCalledWith(
      1,
      20,
      expect.objectContaining({ sortBy: "price", order: "asc" })
    );
  });

  it("retorna 400 para minPrice não numérico", async () => {
    const mockService = { list: jest.fn() };

    const res = await request(createApp(mockService)).get("/products?minPrice=abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("minPrice inválido");
    expect(mockService.list).not.toHaveBeenCalled();
  });

  it("retorna 400 para maxPrice não numérico", async () => {
    const mockService = { list: jest.fn() };

    const res = await request(createApp(mockService)).get("/products?maxPrice=abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("maxPrice inválido");
  });
});

describe("GET /products com cursor", () => {
  it("usa listCursor quando cursor é informado", async () => {
    const mockService = {
      listCursor: jest
        .fn()
        .mockResolvedValue({ data: [fakeProduto], nextCursor: null, hasMore: false }),
    };

    const res = await request(createApp(mockService)).get("/products?cursor=5&limit=3");

    expect(res.status).toBe(200);
    expect(res.body.hasMore).toBe(false);
    expect(mockService.listCursor).toHaveBeenCalledWith(3, expect.objectContaining({ cursor: 5 }));
  });

  it("retorna 400 para cursor não numérico", async () => {
    const mockService = { listCursor: jest.fn() };

    const res = await request(createApp(mockService)).get("/products?cursor=abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Cursor inválido");
    expect(mockService.listCursor).not.toHaveBeenCalled();
  });
});

describe("GET /products/categories", () => {
  it("retorna lista de categorias", async () => {
    const mockService = {
      getCategories: jest.fn().mockResolvedValue(["Acessórios", "Notebooks", "Smartphones"]),
    };

    const res = await request(createApp(mockService)).get("/products/categories");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(["Acessórios", "Notebooks", "Smartphones"]);
    expect(mockService.getCategories).toHaveBeenCalledTimes(1);
  });
});

describe("GET /products/:id", () => {
  it("retorna 200 e o produto quando encontrado", async () => {
    const mockService = {
      getById: jest.fn().mockResolvedValue(fakeProduto),
    };

    const res = await request(createApp(mockService)).get("/products/1");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(mockService.getById).toHaveBeenCalledWith(1);
  });

  it("retorna 404 quando produto não encontrado", async () => {
    const mockService = {
      getById: jest.fn().mockResolvedValue(null),
    };

    const res = await request(createApp(mockService)).get("/products/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Produto não encontrado");
  });

  it("retorna 400 para ID não numérico", async () => {
    const mockService = {
      getById: jest.fn(),
    };

    const res = await request(createApp(mockService)).get("/products/abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID inválido");
    expect(mockService.getById).not.toHaveBeenCalled();
  });
});
