import { Router, Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { ProductRepository } from "../repositories/product.repository";

const VALID_SORT_FIELDS = ["name", "price", "createdAt"] as const;
const VALID_ORDERS = ["asc", "desc"] as const;

type SortField = (typeof VALID_SORT_FIELDS)[number];
type SortOrder = (typeof VALID_ORDERS)[number];

export function createProductRoutes(
  productService: ProductService = new ProductService(new ProductRepository())
): Router {
  const router = Router();

  router.get("/categories", async (_req: Request, res: Response) => {
    const categories = await productService.getCategories();

    res.json({ data: categories });
  });

  router.get("/", async (req: Request, res: Response) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const category = (req.query.category as string) || undefined;
    const search = (req.query.search as string) || undefined;

    const minPriceRaw = req.query.minPrice as string | undefined;
    const maxPriceRaw = req.query.maxPrice as string | undefined;
    const minPrice = minPriceRaw !== undefined ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw !== undefined ? Number(maxPriceRaw) : undefined;

    if (minPrice !== undefined && Number.isNaN(minPrice)) {
      res.status(400).json({ error: "minPrice inválido" });
      return;
    }

    if (maxPrice !== undefined && Number.isNaN(maxPrice)) {
      res.status(400).json({ error: "maxPrice inválido" });
      return;
    }

    const sortByRaw = req.query.sortBy as string | undefined;
    const orderRaw = req.query.order as string | undefined;
    const sortBy = VALID_SORT_FIELDS.includes(sortByRaw as SortField)
      ? (sortByRaw as SortField)
      : undefined;
    const order = VALID_ORDERS.includes(orderRaw as SortOrder)
      ? (orderRaw as SortOrder)
      : undefined;

    const cursorRaw = req.query.cursor as string | undefined;

    if (cursorRaw !== undefined) {
      const cursor = Number(cursorRaw);

      if (Number.isNaN(cursor)) {
        res.status(400).json({ error: "Cursor inválido" });
        return;
      }

      const result = await productService.listCursor(limit, {
        category,
        search,
        minPrice,
        maxPrice,
        cursor: cursor > 0 ? cursor : undefined,
      });

      res.json(result);

      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const result = await productService.list(page, limit, {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      order,
    });

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
