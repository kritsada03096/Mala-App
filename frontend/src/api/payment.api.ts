import type { Payment } from '../types/payment';
import { id, mutate } from './mock/store';
export const paymentApi = {
  confirm(orderId: string, method: Payment['method']) {
    return mutate(state => {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) throw new Error('ไม่พบออเดอร์');
      if (order.status === 'COMPLETED') return state.receipts.find(r => r.orderId === orderId)!;
      if (order.status !== 'WAITING_PAYMENT') throw new Error('ออเดอร์นี้ไม่สามารถชำระเงินได้');
      if (!['MOCK_QR', 'MOCK_CASH'].includes(method)) throw new Error('วิธีชำระเงินไม่ถูกต้อง');
      for (const item of order.items) {
        if ((state.stocks.find(s => s.productId === item.productId)?.quantity ?? 0) < item.quantity) throw new Error(`${item.name} มีสต็อกไม่เพียงพอ`);
      }
      const now = new Date().toISOString();
      const payment: Payment = { id: id(), orderId, amount: order.total, method, paidAt: now };
      state.payments.push(payment);
      order.status = 'PAID';
      const receipt = { id: id(), number: `RC-${String(state.receipts.length + 1).padStart(4, '0')}`, orderId, paymentId: payment.id, issuedAt: now };
      state.receipts.push(receipt);
      for (const item of order.items) {
        state.stocks.find(s => s.productId === item.productId)!.quantity -= item.quantity;
        state.transactions.unshift({ id: id(), productId: item.productId, quantity: -item.quantity, reason: `ขาย ${order.number}`, createdAt: now });
      }
      order.status = 'COMPLETED';
      return receipt;
    });
  },
};
