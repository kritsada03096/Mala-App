import type { CreateOrder } from '../types/order';
import { available, id, mutate } from './mock/store';
export const orderApi = {
  create(input: CreateOrder) {
    return mutate(state => {
      if (!input.items.length || input.items.length > 200) throw new Error('เลือกอย่างน้อย 1 เมนู และไม่เกิน 200 เมนู');
      if (!['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'].includes(input.spice)) throw new Error('เลือกระดับความเผ็ดให้ถูกต้อง');
      if (!['DINE_IN', 'TAKEAWAY'].includes(input.type)) throw new Error('เลือกประเภทออเดอร์');
      if (input.type === 'DINE_IN' && !/^([1-9]|1[0-2])$/.test(input.table)) throw new Error('เลือกโต๊ะ 1–12');
      if (new Set(input.items.map(i => i.productId)).size !== input.items.length) throw new Error('เมนูซ้ำในออเดอร์');
      const items = input.items.map(item => {
        const product = state.products.find(p => p.id === item.productId && p.active);
        if (!product) throw new Error('มีเมนูที่ไม่พร้อมขาย กรุณาเลือกใหม่');
        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100000) throw new Error('จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 100,000');
        if (available(state, product.id) < item.quantity) throw new Error(`${product.name} มีสต็อกไม่เพียงพอ`);
        return { ...item, name: product.name, price: product.price };
      });
      const order = {
        id: id(), number: `ML-${String(state.orders.length + 1).padStart(4, '0')}`,
        type: input.type, table: input.type === 'DINE_IN' ? input.table : '', items,
        total: items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100,
        status: 'WAITING_PAYMENT' as const, spice: input.spice, note: input.note.slice(0, 300), createdAt: new Date().toISOString(),
      };
      state.orders.unshift(order);
      return order;
    });
  },
  cancel(orderId: string) {
    mutate(state => {
      const order = state.orders.find(o => o.id === orderId);
      if (!order || order.status !== 'WAITING_PAYMENT') throw new Error('ยกเลิกได้เฉพาะออเดอร์ที่ยังไม่ชำระเงิน');
      order.status = 'CANCELLED';
    });
  },
};
