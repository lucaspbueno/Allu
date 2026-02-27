import request from "supertest";
import { app } from "./index";

describe("GET /health", () => {
  it("retorna 200 e status ok com o nome do serviço", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", service: "catalog-service" });
  });
});
