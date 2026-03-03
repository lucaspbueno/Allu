import { Cart, CartItem } from ".prisma/cart-client";
import { prisma } from "../lib/prisma";

export class CartRepository {
  async findBySessionId(sessionId: string): Promise<(Cart & { items: CartItem[] }) | null> {
    return prisma.cart.findFirst({
      where: { sessionId, deletedAt: null },
      include: {
        items: { where: { deletedAt: null }, orderBy: { id: "asc" } },
      },
    });
  }

  async create(sessionId: string): Promise<Cart> {
    return prisma.cart.create({
      data: { sessionId },
    });
  }

  async upsertItem(
    cartId: number,
    productId: number,
    name: string,
    price: number,
    quantity: number = 1
  ): Promise<CartItem> {
    return prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, name, price, quantity },
      update: { quantity, deletedAt: null },
    });
  }

  async updateItemQuantity(
    cartId: number,
    productId: number,
    quantity: number
  ): Promise<CartItem | null> {
    const updated = await prisma.cartItem.updateMany({
      where: { cartId, productId, deletedAt: null },
      data: { quantity },
    });
    if (updated.count === 0) return null;
    return prisma.cartItem.findFirst({
      where: { cartId, productId, deletedAt: null },
    });
  }

  async removeItem(cartId: number, productId: number): Promise<boolean> {
    const result = await prisma.cartItem.updateMany({
      where: { cartId, productId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }
}
