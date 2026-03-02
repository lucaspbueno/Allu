import { SimpleCache } from "./cache";

describe("SimpleCache", () => {
  let sut: SimpleCache;

  beforeEach(() => {
    sut = new SimpleCache(100);
  });

  describe("get / set", () => {
    it("retorna null para chave inexistente", () => {
      expect(sut.get("chave-qualquer")).toBeNull();
    });

    it("retorna o valor armazenado antes do TTL expirar", () => {
      sut.set("chave", { id: 1 });

      expect(sut.get<{ id: number }>("chave")).toEqual({ id: 1 });
    });

    it("retorna null após o TTL expirar", async () => {
      sut.set("chave", "valor");

      await new Promise((r) => setTimeout(r, 150));

      expect(sut.get("chave")).toBeNull();
    });

    it("sobrescreve entrada existente ao chamar set novamente", () => {
      sut.set("chave", "primeiro");
      sut.set("chave", "segundo");

      expect(sut.get("chave")).toBe("segundo");
    });
  });

  describe("invalidate", () => {
    it("remove todas as entradas quando pattern não é informado", () => {
      sut.set("a:1", 1);
      sut.set("a:2", 2);
      sut.set("b:1", 3);

      sut.invalidate();

      expect(sut.size).toBe(0);
    });

    it("remove somente chaves que contêm o pattern", () => {
      sut.set("products:list:1", 1);
      sut.set("products:id:5", 2);
      sut.set("categories:all", 3);

      sut.invalidate("products");

      expect(sut.get("categories:all")).toBe(3);
      expect(sut.get("products:list:1")).toBeNull();
      expect(sut.get("products:id:5")).toBeNull();
    });
  });

  describe("size", () => {
    it("retorna zero para cache vazio", () => {
      expect(sut.size).toBe(0);
    });

    it("reflete o número de entradas armazenadas", () => {
      sut.set("a", 1);
      sut.set("b", 2);

      expect(sut.size).toBe(2);
    });
  });
});
