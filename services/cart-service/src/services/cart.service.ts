import { Cart, CartItem } from ".prisma/cart-client";
import { CartRepository } from "../repositories/cart.repository";

export type CartWithItems = Cart & { items: CartItem[] };

export class CartService {
  constructor(private readonly repository: CartRepository) {}

  async getOrCreateCart(sessionId: string): Promise<CartWithItems> {
    let cart = await this.repository.findBySessionId(sessionId);
    if (!cart) {
      const created = await this.repository.create(sessionId);
      cart = { ...created, items: [] };
    }
    return cart;
  }

  async getCart(sessionId: string): Promise<CartWithItems | null> {
    return this.repository.findBySessionId(sessionId);
  }

  async addItem(
    sessionId: string,
    productId: number,
    name: string,
    price: number,
    quantity: number = 1
  ): Promise<CartWithItems> {
    const cart = await this.getOrCreateCart(sessionId);
    await this.repository.upsertItem(cart.id, productId, name, price, quantity);
    const updated = await this.repository.findBySessionId(sessionId);
    return updated!;
  }

  async updateQuantity(
    sessionId: string,
    productId: number,
    quantity: number
  ): Promise<CartWithItems | null> {
    const cart = await this.repository.findBySessionId(sessionId);
    if (!cart) return null;
    const item = await this.repository.updateItemQuantity(cart.id, productId, quantity);
    if (!item) return null;
    return this.repository.findBySessionId(sessionId);
  }

  async removeItem(sessionId: string, productId: number): Promise<CartWithItems | null> {
    const cart = await this.repository.findBySessionId(sessionId);
    if (!cart) return null;
    const removed = await this.repository.removeItem(cart.id, productId);
    if (!removed) return null;
    return this.repository.findBySessionId(sessionId);
  }
}
