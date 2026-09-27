import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateOrder } from '../../types/order';

async function setup() {
  const { getState, available, mutate } = await import('./store');
  const { orderApi } = await import('../order.api');
  const { paymentApi } = await import('../payment.api');
  const { stockApi } = await import('../stock.api');
  const { productApi } = await import('../product.api');
  return { getState, available, mutate, orderApi, paymentApi, stockApi, productApi };
}
const input = (quantity = 2): CreateOrder => ({ type: 'DINE_IN', table: '1', spice: 'เผ็ดกลาง', note: '', items: [{ productId: 'p1', quantity }] });
beforeEach(() => {
  vi.resetModules();
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) });
});
describe('demo sales workflow', () => {
  it('reserves stock, settles once, creates a receipt and retains historical prices', async () => {
    const api = await setup();
    const order = api.orderApi.create(input());
    expect(order.total).toBe(40);
    expect(api.available(api.getState(), 'p1')).toBe(78);
    expect(api.getState().stocks[0].quantity).toBe(80);
    const product = api.getState().products[0];
    api.productApi.save({ ...product, price: 99 }, product.id);
    const receipt = api.paymentApi.confirm(order.id, 'MOCK_QR');
    expect(api.paymentApi.confirm(order.id, 'MOCK_QR').id).toBe(receipt.id);
    expect(api.getState().orders[0].status).toBe('COMPLETED');
    expect(api.getState().payments).toHaveLength(1);
    expect(api.getState().payments[0].amount).toBe(40);
    expect(api.getState().receipts).toHaveLength(1);
    expect(api.getState().transactions).toHaveLength(1);
    expect(api.getState().stocks[0].quantity).toBe(78);
    expect(api.available(api.getState(), 'p1')).toBe(78);
  });
  it('prevents overselling and removing reserved stock, then releases a cancelled reservation', async () => {
    const api = await setup();
    const order = api.orderApi.create(input(80));
    expect(() => api.orderApi.create(input(1))).toThrow();
    expect(() => api.stockApi.adjust('p1', -1, 'damaged')).toThrow();
    api.orderApi.cancel(order.id);
    expect(api.available(api.getState(), 'p1')).toBe(80);
    expect(() => api.paymentApi.confirm(order.id, 'MOCK_CASH')).toThrow();
    expect(api.getState().payments).toHaveLength(0);
  });
  it('rejects invalid quantities, missing tables, duplicate products and inactive products', async () => {
    const api = await setup();
    for (const quantity of [0, -1, 1.5, NaN, Infinity]) expect(() => api.orderApi.create(input(quantity))).toThrow();
    expect(() => api.orderApi.create({ ...input(), table: '' })).toThrow();
    expect(() => api.orderApi.create({ ...input(), items: [...input().items, ...input().items] })).toThrow();
    const product = api.getState().products[0];
    api.productApi.save({ ...product, active: false }, product.id);
    expect(() => api.orderApi.create(input())).toThrow();
    expect(api.getState().orders).toHaveLength(0);
  });
  it('rolls back the entire checkout when a stock check fails', async () => {
    const api = await setup();
    const order = api.orderApi.create(input(2));
    api.mutate(state => { state.stocks[0].quantity = 1; });
    expect(() => api.paymentApi.confirm(order.id, 'MOCK_CASH')).toThrow();
    expect(api.getState().orders[0].status).toBe('WAITING_PAYMENT');
    expect(api.getState().payments).toHaveLength(0);
    expect(api.getState().receipts).toHaveLength(0);
    expect(api.getState().transactions).toHaveLength(0);
  });
  it('handles decimal prices accurately and new products start with zero stock', async () => {
    const api = await setup();
    const p = api.productApi.save({ name: 'ทดสอบ', category: 'ผัก', emoji: '🥦', price: 19.99, active: true });
    expect(api.available(api.getState(), p.id)).toBe(0);
    api.stockApi.adjust(p.id, 3, 'รับสินค้า');
    const order = api.orderApi.create({ ...input(), type: 'TAKEAWAY', table: '', items: [{ productId: p.id, quantity: 3 }] });
    expect(order.total).toBe(59.97);
    expect(() => api.productApi.save({ ...p, price: 1.001 })).toThrow();
    expect(() => api.productApi.save({ ...p, price: -1 })).toThrow();
  });
  it('restores the complete saved state after reloading modules', async () => {
    const api = await setup();
    const order = api.orderApi.create(input());
    api.paymentApi.confirm(order.id, 'MOCK_QR');
    vi.resetModules();
    const reloaded = await setup();
    expect(reloaded.getState().orders[0].id).toBe(order.id);
    expect(reloaded.getState().stocks[0].quantity).toBe(78);
    expect(reloaded.getState().receipts).toHaveLength(1);
  });
});
