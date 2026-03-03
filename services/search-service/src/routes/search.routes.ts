import { Router, Request, Response } from "express";
import { SearchService } from "../services/search.service";
import { SearchRepository } from "../repositories/search.repository";

export function createSearchRoutes(
  searchService: SearchService = new SearchService(new SearchRepository())
): Router {
  const router = Router();

  router.get("/suggestions", async (req: Request, res: Response) => {
    const q = ((req.query.q as string) || "").trim();
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 5));

    if (!q) {
      res.json({ data: [] });
      return;
    }

    const result = await searchService.suggest(q, limit);

    res.json(result);
  });

  router.get("/products", async (req: Request, res: Response) => {
    const q = ((req.query.q as string) || "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    if (!q) {
      res.json({ data: [], total: 0, page, limit, totalPages: 0 });
      return;
    }

    const result = await searchService.search(q, page, limit);

    res.json(result);
  });

  return router;
}

export const searchRoutes = createSearchRoutes();
