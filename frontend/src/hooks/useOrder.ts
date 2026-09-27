import { useShop } from '../api/mock/store';
export function useOrder(id?: string) {
  const state = useShop();
  return { order: state.orders.find(o => o.id === id), receipt: state.receipts.find(r => r.orderId === id), state };
}
