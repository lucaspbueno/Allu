import request from "supertest";
import express from "express";
import { createCartRoutes } from "./cart.routes";
import { CartService } from "../services/cart.service";

const fakeCart = {
  id: 1,
  sessionId: "sess_abc",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  deletedAt: null,
  items: [],
};

function createApp(mockService: Partial<CartService>) {
  const app = express();
  app.use(express.json());
  app.use("/carts", createCartRoutes(mockService as CartService));
  return app;
}

describe("GET /carts/:sessionId", () => {
  it("retorna 200 e carrinho quando sessionId é informado", async () => {
    const mockService = {
      getOrCreateCart: jest.fn().mockResolvedValue(fakeCart),
    };

    const res = await request(createApp(mockService)).get("/carts/sess_abc");

    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe("sess_abc");
    expect(mockService.getOrCreateCart).toHaveBeenCalledWith("sess_abc");
  });

  it("retorna 400 quando sessionId está vazio", async () => {
    const mockService = { getOrCreateCart: jest.fn() };

    const res = await request(createApp(mockService)).get("/carts/%20");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("sessionId é obrigatório");
    expect(mockService.getOrCreateCart).not.toHaveBeenCalled();
  });
});

describe("POST /carts/:sessionId/items", () => {
  it("retorna 200 e carrinho ao adicionar item com body válido", async () => {
    const mockService = {
      addItem: jest.fn().mockResolvedValue({ ...fakeCart, items: [{ id: 1, productId: 5 }] }),
    };

    const res = await request(createApp(mockService))
      .post("/carts/sess_abc/items")
      .send({ productId: 5, name: "Produto X", price: 99.9, quantity: 2 });

    expect(res.status).toBe(200);
    expect(mockService.addItem).toHaveBeenCalledWith("sess_abc", 5, "Produto X", 99.9, 2, undefined);
  });

  it("retorna 400 quando body não tem productId, name ou price", async () => {
    const mockService = { addItem: jest.fn() };

    const res = await request(createApp(mockService))
      .post("/carts/sess_abc/items")
      .send({ name: "X", price: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("obrigatórios");
    expect(mockService.addItem).not.toHaveBeenCalled();
  });

  it("usa quantity 1 quando não informado no body", async () => {
    const mockService = { addItem: jest.fn().mockResolvedValue(fakeCart) };

    await request(createApp(mockService))
      .post("/carts/sess_abc/items")
      .send({ productId: 1, name: "Y", price: 5 });

    expect(mockService.addItem).toHaveBeenCalledWith("sess_abc", 1, "Y", 5, 1, undefined);
  });

  it("passa imageUrl para addItem quando enviado no body", async () => {
    const mockService = { addItem: jest.fn().mockResolvedValue(fakeCart) };

    await request(createApp(mockService))
      .post("/carts/sess_abc/items")
      .send({ productId: 1, name: "Produto", price: 10, imageUrl: "https://exemplo.com/img.jpg" });

    expect(mockService.addItem).toHaveBeenCalledWith(
      "sess_abc",
      1,
      "Produto",
      10,
      1,
      "https://exemplo.com/img.jpg"
    );
  });
});

describe("PATCH /carts/:sessionId/items/:productId", () => {
  it("retorna 200 e carrinho ao atualizar quantidade", async () => {
    const mockService = { updateQuantity: jest.fn().mockResolvedValue(fakeCart) };

    const res = await request(createApp(mockService))
      .patch("/carts/sess_abc/items/10")
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(mockService.updateQuantity).toHaveBeenCalledWith("sess_abc", 10, 3);
  });

  it("retorna 404 quando carrinho ou item não encontrado", async () => {
    const mockService = { updateQuantity: jest.fn().mockResolvedValue(null) };

    const res = await request(createApp(mockService))
      .patch("/carts/sess_abc/items/999")
      .send({ quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Carrinho ou item não encontrado");
  });

  it("retorna 400 quando productId não é número", async () => {
    const mockService = { updateQuantity: jest.fn() };

    const res = await request(createApp(mockService))
      .patch("/carts/sess_abc/items/abc")
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
    expect(mockService.updateQuantity).not.toHaveBeenCalled();
  });
});

describe("DELETE /carts/:sessionId/items/:productId", () => {
  it("retorna 200 e carrinho após remover item", async () => {
    const mockService = { removeItem: jest.fn().mockResolvedValue(fakeCart) };

    const res = await request(createApp(mockService)).delete("/carts/sess_abc/items/10");

    expect(res.status).toBe(200);
    expect(mockService.removeItem).toHaveBeenCalledWith("sess_abc", 10);
  });

  it("retorna 404 quando carrinho ou item não encontrado", async () => {
    const mockService = { removeItem: jest.fn().mockResolvedValue(null) };

    const res = await request(createApp(mockService)).delete("/carts/sess_abc/items/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Carrinho ou item não encontrado");
  });

  it("retorna 400 quando productId não é número", async () => {
    const mockService = { removeItem: jest.fn() };

    const res = await request(createApp(mockService)).delete("/carts/sess_abc/items/xyz");

    expect(res.status).toBe(400);
    expect(mockService.removeItem).not.toHaveBeenCalled();
  });
});
