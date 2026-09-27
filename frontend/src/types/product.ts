export const categories = ['เนื้อ', 'หมู', 'ลูกชิ้น', 'ผัก', 'เห็ด', 'เครื่องดื่ม'] as const;
export type Category = typeof categories[number];
export interface Product {
  id: string; name: string; category: Category; price: number;
  emoji: string; active: boolean;
}
export interface Stock { productId: string; quantity: number; threshold: number }
export interface StockTransaction {
  id: string; productId: string; quantity: number; reason: string; createdAt: string;
}
