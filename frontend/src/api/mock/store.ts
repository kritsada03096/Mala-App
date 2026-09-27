import { useSyncExternalStore } from 'react';
import type { Product, Stock, StockTransaction } from '../../types/product';
import type { Order } from '../../types/order';
import type { Payment, Receipt } from '../../types/payment';
import { createSeed } from './seed';

export interface ShopState {
  version: 1; products: Product[]; stocks: Stock[]; orders: Order[];
  payments: Payment[]; receipts: Receipt[]; transactions: StockTransaction[];
}
const KEY = 'mala-shop.demo.v1';
let state: ShopState | undefined;
const listeners = new Set<() => void>();
let storageWarning = '';
export function getState(): ShopState {
  if (!state) {
    try {
      const raw = localStorage.getItem(KEY);
      const saved = raw ? JSON.parse(raw) as ShopState : null;
      if (saved?.version === 1 && ['products', 'stocks', 'orders', 'payments', 'receipts', 'transactions'].every(k => Array.isArray(saved[k as keyof ShopState]))) state = saved;
      else state = createSeed();
    } catch { state = createSeed(); storageWarning = 'อ่านข้อมูลที่บันทึกไม่ได้ กำลังใช้ข้อมูลเริ่มต้น'; }
  }
  return state;
}
export function mutate<T>(fn: (draft: ShopState) => T): T {
  const draft = structuredClone(getState());
  const result = fn(draft);
  try { localStorage.setItem(KEY, JSON.stringify(draft)); storageWarning = ''; }
  catch { storageWarning = 'บันทึกลงเบราว์เซอร์ไม่ได้ ข้อมูลจะอยู่ถึงตอนปิดหรือรีเฟรชหน้านี้เท่านั้น'; }
  state = draft;
  listeners.forEach(fn => fn());
  return result;
}
export function useShop() {
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; }, getState);
}
export const getStorageWarning = () => storageWarning;
export const id = () => crypto.randomUUID();
export function available(state: ShopState, productId: string) {
  const reserved = state.orders.filter(o => o.status === 'WAITING_PAYMENT' || o.status === 'PAID')
    .flatMap(o => o.items).filter(i => i.productId === productId).reduce((n, i) => n + i.quantity, 0);
  return (state.stocks.find(s => s.productId === productId)?.quantity ?? 0) - reserved;
}
// Other tabs receive committed snapshots. Use one checkout tab in this demo; a real backend must provide database transactions.
if (typeof window !== 'undefined') window.addEventListener('storage', (event) => {
  if (event.key === KEY) { state = undefined; listeners.forEach(fn => fn()); }
});
