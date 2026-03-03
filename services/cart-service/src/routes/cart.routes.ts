import { Router, Request, Response } from "express";
import { CartService } from "../services/cart.service";
import { CartRepository } from "../repositories/cart.repository";

export function createCartRoutes(
  cartService: CartService = new CartService(new CartRepository())
): Router {
  const router = Router();

  router.get("/:sessionId", async (req: Request, res: Response) => {
    const sessionId = (req.params.sessionId || "").trim();
    if (!sessionId) {
      res.status(400).json({ error: "sessionId é obrigatório" });
      return;
    }
    const cart = await cartService.getOrCreateCart(sessionId);
    res.json(cart);
  });

  router.post("/:sessionId/items", async (req: Request, res: Response) => {
    const sessionId = (req.params.sessionId || "").trim();
    if (!sessionId) {
      res.status(400).json({ error: "sessionId é obrigatório" });
      return;
    }
    const { productId, name, price, quantity, imageUrl } = req.body ?? {};
    if (typeof productId !== "number" || typeof name !== "string" || typeof price !== "number") {
      res.status(400).json({
        error:
          "Corpo inválido: productId (number), name (string) e price (number) são obrigatórios",
      });
      return;
    }
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const imgUrl = typeof imageUrl === "string" ? imageUrl : undefined;
    const cart = await cartService.addItem(sessionId, productId, name, price, qty, imgUrl);
    res.status(200).json(cart);
  });

  router.patch("/:sessionId/items/:productId", async (req: Request, res: Response) => {
    const sessionId = (req.params.sessionId || "").trim();
    const productId = Number(req.params.productId);
    if (!sessionId || Number.isNaN(productId)) {
      res.status(400).json({ error: "sessionId e productId (número) são obrigatórios" });
      return;
    }
    const quantity = Math.max(0, Math.floor(Number(req.body?.quantity ?? 0)));
    const cart = await cartService.updateQuantity(sessionId, productId, quantity);
    if (!cart) {
      res.status(404).json({ error: "Carrinho ou item não encontrado" });
      return;
    }
    res.json(cart);
  });

  router.delete("/:sessionId/items/:productId", async (req: Request, res: Response) => {
    const sessionId = (req.params.sessionId || "").trim();
    const productId = Number(req.params.productId);
    if (!sessionId || Number.isNaN(productId)) {
      res.status(400).json({ error: "sessionId e productId (número) são obrigatórios" });
      return;
    }
    const cart = await cartService.removeItem(sessionId, productId);
    if (!cart) {
      res.status(404).json({ error: "Carrinho ou item não encontrado" });
      return;
    }
    res.json(cart);
  });

  return router;
}

export const cartRoutes = createCartRoutes();
