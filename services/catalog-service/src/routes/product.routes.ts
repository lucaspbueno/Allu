import { Router, Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { ProductRepository } from "../repositories/product.repository";

export function createProductRoutes(
  productService: ProductService = new ProductService(new ProductRepository())
): Router {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const category = req.query.category as string | undefined;

    const result = await productService.list(page, limit, category);
    res.json(result);
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    const product = await productService.getById(id);
    if (!product) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }
    res.json(product);
  });

  return router;
}

export const productRoutes = createProductRoutes();
