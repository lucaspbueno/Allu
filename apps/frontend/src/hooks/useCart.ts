import { useState, useEffect, useCallback } from "react";
import {
  getCart,
  addItem as apiAddItem,
  updateQuantity as apiUpdateQuantity,
  removeItem as apiRemoveItem,
} from "@/api/cart";
import type { Cart } from "@/types/cart";
import type { AddItemPayload } from "@/api/cart";
import { getOrCreateCartSessionId } from "@/lib/cartSession";

export function useCart() {
  const [sessionId] = useState(() => getOrCreateCartSessionId());
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getCart(sessionId)
      .then(setCart)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar carrinho"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addItem = useCallback(
    async (payload: AddItemPayload) => {
      if (!sessionId) return null;
      setError(null);
      try {
        const updated = await apiAddItem(sessionId, payload);
        setCart(updated);
        return updated;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao adicionar";
        setError(msg);
        throw e;
      }
    },
    [sessionId]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!sessionId) return null;
      setError(null);
      try {
        const updated = await apiUpdateQuantity(sessionId, productId, quantity);
        setCart(updated);
        return updated;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao atualizar";
        setError(msg);
        throw e;
      }
    },
    [sessionId]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      if (!sessionId) return null;
      setError(null);
      try {
        const updated = await apiRemoveItem(sessionId, productId);
        setCart(updated);
        return updated;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao remover";
        setError(msg);
        throw e;
      }
    },
    [sessionId]
  );

  return {
    cart,
    loading,
    error,
    refetch,
    addItem,
    updateQuantity,
    removeItem,
  };
}
