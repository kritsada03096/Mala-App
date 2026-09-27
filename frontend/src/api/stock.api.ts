import { available, id, mutate } from './mock/store';
export const stockApi = {
  adjust(productId: string, quantity: number, reason: string) {
    if (!Number.isSafeInteger(quantity) || quantity === 0 || Math.abs(quantity) > 100000) throw new Error('ระบุจำนวนเต็มระหว่าง -100,000 ถึง 100,000 และไม่เท่ากับ 0');
    if (!reason.trim()) throw new Error('กรอกเหตุผลในการปรับสต็อก');
    mutate(state => {
      const stock = state.stocks.find(s => s.productId === productId);
      if (!stock) throw new Error('ไม่พบสต็อกสินค้า');
      if (available(state, productId) + quantity < 0) throw new Error('สต็อกไม่พอ หรือมีจำนวนที่จองไว้ในออเดอร์รอชำระ');
      if (stock.quantity + quantity > 10000000) throw new Error('จำนวนสต็อกเกินขีดจำกัดของโหมดทดลอง');
      stock.quantity += quantity;
      state.transactions.unshift({ id: id(), productId, quantity, reason: reason.trim().slice(0, 200), createdAt: new Date().toISOString() });
    });
  },
};
