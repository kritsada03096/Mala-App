import type { OrderStatus } from '../types/order';
export const statusLabels: Record<OrderStatus, string> = { WAITING_PAYMENT: 'รอชำระเงิน', PAID: 'ชำระแล้ว', COMPLETED: 'เสร็จสิ้น', CANCELLED: 'ยกเลิก' };
export function Status({ value }: { value: OrderStatus }) { return <span className={`badge status-${value}`}><i />{statusLabels[value]}</span>; }
