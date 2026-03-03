export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  name: string;
  price: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id: number;
  sessionId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}
