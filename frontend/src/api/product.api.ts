import { categories, type Product } from '../types/product';
import { id, mutate } from './mock/store';
export const productApi = {
  save(input: Omit<Product, 'id'>, productId?: string) {
    if (!input.name.trim() || input.name.trim().length > 80) throw new Error('กรอกชื่อเมนูไม่เกิน 80 ตัวอักษร');
    if (!Number.isFinite(input.price) || input.price <= 0 || input.price > 100000 || Math.abs(Math.round(input.price * 100) - input.price * 100) > 0.000001) throw new Error('ราคาต้องมากกว่า 0 ไม่เกิน 100,000 บาท และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
    if (!categories.includes(input.category)) throw new Error('เลือกหมวดหมู่ให้ถูกต้อง');
    return mutate(state => {
      const product = { ...input, price: Math.round(input.price * 100) / 100, name: input.name.trim(), emoji: input.emoji || '🍢', id: productId ?? id() };
      if (productId) {
        const index = state.products.findIndex(p => p.id === productId);
        if (index < 0) throw new Error('ไม่พบเมนู');
        state.products[index] = product;
      } else { state.products.push(product); state.stocks.push({ productId: product.id, quantity: 0, threshold: 10 }); }
      return product;
    });
  },
};
