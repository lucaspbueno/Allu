const CART_SESSION_KEY = "allu_cart_session_id";

export function getOrCreateCartSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CART_SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(CART_SESSION_KEY, id);
  }
  return id;
}
