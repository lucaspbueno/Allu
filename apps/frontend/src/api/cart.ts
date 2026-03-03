import { CART_API_BASE } from "@/config/api";
import type { Cart } from "@/types/cart";

export async function getCart(sessionId: string): Promise<Cart> {
  const res = await fetch(`${CART_API_BASE}/carts/${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error("Falha ao carregar carrinho");
  return res.json();
}

export interface AddItemPayload {
  productId: number;
  name: string;
  price: number;
  quantity?: number;
}

export async function addItem(sessionId: string, payload: AddItemPayload): Promise<Cart> {
  const body = {
    productId: payload.productId,
    name: payload.name,
    price: payload.price,
    quantity: payload.quantity ?? 1,
  };
  const res = await fetch(`${CART_API_BASE}/carts/${encodeURIComponent(sessionId)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Falha ao adicionar item ao carrinho");
  return res.json();
}

export async function updateQuantity(
  sessionId: string,
  productId: number,
  quantity: number
): Promise<Cart> {
  const res = await fetch(
    `${CART_API_BASE}/carts/${encodeURIComponent(sessionId)}/items/${productId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    }
  );
  if (res.status === 404) throw new Error("Item não encontrado no carrinho");
  if (!res.ok) throw new Error("Falha ao atualizar quantidade");
  return res.json();
}

export async function removeItem(sessionId: string, productId: number): Promise<Cart> {
  const res = await fetch(
    `${CART_API_BASE}/carts/${encodeURIComponent(sessionId)}/items/${productId}`,
    { method: "DELETE" }
  );
  if (res.status === 404) throw new Error("Item não encontrado no carrinho");
  if (!res.ok) throw new Error("Falha ao remover item");
  return res.json();
}
