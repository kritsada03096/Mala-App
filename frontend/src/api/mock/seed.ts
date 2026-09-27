import type { Product } from '../../types/product';
import type { ShopState } from './store';

const products: Product[] = [
  { id: 'p1', name: 'เนื้อวัวเสียบไม้', category: 'เนื้อ', price: 20, emoji: '🥩', active: true },
  { id: 'p2', name: 'เนื้อวัวพันเห็ดเข็มทอง', category: 'เนื้อ', price: 25, emoji: '🥓', active: true },
  { id: 'p3', name: 'หมูสามชั้น', category: 'หมู', price: 15, emoji: '🥓', active: true },
  { id: 'p4', name: 'สันคอหมู', category: 'หมู', price: 15, emoji: '🍖', active: true },
  { id: 'p5', name: 'ลูกชิ้นปลา', category: 'ลูกชิ้น', price: 10, emoji: '🍡', active: true },
  { id: 'p6', name: 'ไส้กรอกชีส', category: 'ลูกชิ้น', price: 15, emoji: '🌭', active: true },
  { id: 'p7', name: 'บรอกโคลี', category: 'ผัก', price: 10, emoji: '🥦', active: true },
  { id: 'p8', name: 'ข้าวโพดหวาน', category: 'ผัก', price: 10, emoji: '🌽', active: true },
  { id: 'p9', name: 'เห็ดออรินจิ', category: 'เห็ด', price: 10, emoji: '🍄', active: true },
  { id: 'p10', name: 'เห็ดเข็มทอง', category: 'เห็ด', price: 10, emoji: '🍄', active: true },
  { id: 'p11', name: 'ชาอู่หลง', category: 'เครื่องดื่ม', price: 25, emoji: '🍵', active: true },
  { id: 'p12', name: 'น้ำดื่ม', category: 'เครื่องดื่ม', price: 10, emoji: '💧', active: true },
];

export function createSeed(): ShopState {
  return {
    version: 1, products: structuredClone(products), orders: [], payments: [], receipts: [], transactions: [],
    stocks: products.map((p, i) => ({ productId: p.id, quantity: [80, 45, 100, 60, 90, 8, 35, 50, 7, 40, 24, 48][i], threshold: 10 })),
  };
}
