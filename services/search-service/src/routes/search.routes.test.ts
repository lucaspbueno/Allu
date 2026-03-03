import request from "supertest";
import express from "express";
import { createSearchRoutes } from "./search.routes";
import { SearchService } from "../services/search.service";

function createApp(mockService: Partial<SearchService>) {
  const app = express();
  app.use(express.json());
  app.use("/search", createSearchRoutes(mockService as SearchService));
  return app;
}

describe("GET /search/suggestions", () => {
  it("retorna 200 e lista de sugestões quando q é informado", async () => {
    const mockService = {
      suggest: jest.fn().mockResolvedValue({
        data: [{ id: 1, name: "iPhone 15 Pro", category: "Smartphones" }],
      }),
    };

    const res = await request(createApp(mockService)).get("/search/suggestions?q=iphone");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("iPhone 15 Pro");
    expect(mockService.suggest).toHaveBeenCalledWith("iphone", 5);
  });

  it("repassa limit da query (limitado a 20)", async () => {
    const mockService = {
      suggest: jest.fn().mockResolvedValue({ data: [] }),
    };

    await request(createApp(mockService)).get("/search/suggestions?q=mac&limit=10");

    expect(mockService.suggest).toHaveBeenCalledWith("mac", 10);
  });

  it("retorna data vazia quando q está vazio", async () => {
    const mockService = { suggest: jest.fn() };

    const res = await request(createApp(mockService)).get("/search/suggestions?q=");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
    expect(mockService.suggest).not.toHaveBeenCalled();
  });

  it("usa limit padrão 5 quando limit não é informado", async () => {
    const mockService = {
      suggest: jest.fn().mockResolvedValue({ data: [] }),
    };

    await request(createApp(mockService)).get("/search/suggestions?q=test");

    expect(mockService.suggest).toHaveBeenCalledWith("test", 5);
  });
});

describe("GET /search/products", () => {
  it("retorna 200 e resultado paginado quando q é informado", async () => {
    const mockService = {
      search: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    };

    const res = await request(createApp(mockService)).get("/search/products?q=apple");

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
    expect(mockService.search).toHaveBeenCalledWith("apple", 1, 20);
  });

  it("repassa page e limit da query", async () => {
    const mockService = {
      search: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      }),
    };

    await request(createApp(mockService)).get("/search/products?q=test&page=2&limit=10");

    expect(mockService.search).toHaveBeenCalledWith("test", 2, 10);
  });

  it("retorna data vazia e total 0 quando q está vazio", async () => {
    const mockService = { search: jest.fn() };

    const res = await request(createApp(mockService)).get("/search/products?q=");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(mockService.search).not.toHaveBeenCalled();
  });

  it("limita limit a 100 no máximo", async () => {
    const mockService = {
      search: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      }),
    };

    await request(createApp(mockService)).get("/search/products?q=x&limit=999");

    expect(mockService.search).toHaveBeenCalledWith("x", 1, 100);
  });

  it("garante page mínima 1", async () => {
    const mockService = {
      search: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    };

    await request(createApp(mockService)).get("/search/products?q=x&page=-1");

    expect(mockService.search).toHaveBeenCalledWith("x", 1, 20);
  });
});
