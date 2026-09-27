export type OrderStatus = 'WAITING_PAYMENT' | 'PAID' | 'COMPLETED' | 'CANCELLED';
export interface OrderItem { productId: string; name: string; price: number; quantity: number }
export interface Order {
  id: string; number: string; type: 'DINE_IN' | 'TAKEAWAY'; table: string;
  items: OrderItem[]; total: number; status: OrderStatus;
  spice: string; note: string; createdAt: string;
}
export interface CreateOrder {
  type: Order['type']; table: string; spice: string; note: string;
  items: { productId: string; quantity: number }[];
}
