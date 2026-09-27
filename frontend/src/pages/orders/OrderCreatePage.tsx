import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, ShoppingBag, UtensilsCrossed, Trash2, ArrowRight, ShoppingBasket } from 'lucide-react';
import { available, useShop } from '../../api/mock/store';
import { orderApi } from '../../api/order.api';
import { categories } from '../../types/product';
import type { Order } from '../../types/order';
import { currency } from '../../utils/currency';
import { Button } from '../../components/Button/Button';
import { PageHeading } from '../../components/PageHeading';

export function OrderCreatePage() {
  const state = useShop();
  const navigate = useNavigate();
  const [category, setCategory] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [type, setType] = useState<Order['type']>('DINE_IN');
  const [table, setTable] = useState('');
  const [spice, setSpice] = useState('เผ็ดกลาง');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const products = state.products.filter(p => p.active && (category === 'ทั้งหมด' || p.category === category) && p.name.includes(search.trim()));
  const items = state.products.filter(p => cart[p.id] > 0);
  const total = items.reduce((sum, p) => sum + Math.round(p.price * 100) * cart[p.id], 0) / 100;
  function change(productId: string, delta: number) {
    setCart(current => ({ ...current, [productId]: Math.max(0, Math.min(available(state, productId), (current[productId] ?? 0) + delta)) }));
    setError('');
  }
  function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const order = orderApi.create({ type, table, spice, note, items: items.map(p => ({ productId: p.id, quantity: cart[p.id] })) });
      navigate(`/payments/${order.id}`);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  return <><PageHeading eyebrow="LET'S MAKE IT SPICY" title="สร้างออเดอร์" description="เลือกความอร่อย แล้วเติมลงตะกร้าได้เลย"><span className="badge neutral">{state.products.filter(p => p.active).length} เมนูพร้อมเสิร์ฟ</span></PageHeading>
    <div className="pos-layout"><section className="menu-catalog"><div className="search-box"><Search size={18} /><input aria-label="ค้นหาเมนู" placeholder="ค้นหาเมนูที่อยากอร่อย…" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="category-tabs" aria-label="หมวดหมู่เมนู">{['ทั้งหมด', ...categories].map(c => <button key={c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="product-grid">{products.map(p => { const remaining = available(state, p.id); return <button className={`product-card ${cart[p.id] ? 'in-cart' : ''}`} key={p.id} onClick={() => change(p.id, 1)} disabled={remaining <= (cart[p.id] ?? 0)} aria-label={`เพิ่ม ${p.name}`}><div className={`product-art category-${categories.indexOf(p.category)}`}><span>{p.emoji}</span>{cart[p.id] > 0 && <b className="cart-count">{cart[p.id]}</b>}<small>{remaining === 0 ? 'หมดชั่วคราว' : `พร้อมขาย ${remaining}`}</small></div><div className="product-info"><small>{p.category}</small><h3>{p.name}</h3><div><strong>{currency(p.price)}</strong><span className="add-circle"><Plus size={17} /></span></div></div></button>; })}</div>{!products.length && <div className="empty">ไม่พบเมนูที่ค้นหา</div>}</section>
      <aside className="cart panel"><div className="cart-heading"><h2><ShoppingBasket size={20} />ออเดอร์ของคุณ</h2><span className="badge neutral">{items.reduce((n, p) => n + cart[p.id], 0)} ชิ้น</span></div><div className="cart-body"><div className="segmented"><button className={type === 'DINE_IN' ? 'selected' : ''} onClick={() => setType('DINE_IN')}><UtensilsCrossed size={16} />ทานที่ร้าน</button><button className={type === 'TAKEAWAY' ? 'selected' : ''} onClick={() => setType('TAKEAWAY')}><ShoppingBag size={16} />กลับบ้าน</button></div>{type === 'DINE_IN' && <label className="field"><span>เลือกโต๊ะ</span><select value={table} onChange={e => setTable(e.target.value)}><option value="">เลือกโต๊ะ 1–12</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1)}>โต๊ะ {i + 1}</option>)}</select></label>}<div className="cart-items">{items.length ? items.map(p => <div className="cart-item" key={p.id}><span className="food-thumb">{p.emoji}</span><div className="cart-item-details"><b>{p.name}</b><small>{currency(p.price)} / ชิ้น</small><div className="quantity-control"><button aria-label={`ลด ${p.name}`} onClick={() => change(p.id, -1)}><Minus size={13} /></button><span>{cart[p.id]}</span><button aria-label={`เพิ่มจำนวน ${p.name}`} disabled={cart[p.id] >= available(state, p.id)} onClick={() => change(p.id, 1)}><Plus size={13} /></button></div></div><div className="cart-item-end"><strong>{currency(p.price * cart[p.id])}</strong><button className="icon-button" aria-label={`ลบ ${p.name}`} onClick={() => setCart(c => ({ ...c, [p.id]: 0 }))}><Trash2 size={15} /></button></div></div>) : <div className="empty compact"><ShoppingBasket size={30} /><h3>เติมความอร่อยลงตะกร้า</h3><p>แตะเมนูเพื่อเริ่มออเดอร์</p></div>}</div><label className="field"><span>ระดับความเผ็ด</span><select value={spice} onChange={e => setSpice(e.target.value)}>{['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดกลาง', 'เผ็ดมาก'].map(s => <option key={s}>{s}</option>)}</select></label><label className="field"><span>หมายเหตุ <small className="muted">(ถ้ามี)</small></span><textarea value={note} onChange={e => setNote(e.target.value)} maxLength={300} placeholder="เช่น ไม่ใส่ผงชูรส แยกน้ำจิ้ม" rows={2} /></label></div><div className="cart-summary"><div><span>รวมทั้งหมด</span><strong>{currency(total)}</strong></div><p>ราคาสุทธิ ไม่มีค่าบริการเพิ่มเติม</p>{error && <p className="error" role="alert">{error}</p>}<Button className="full-width" disabled={!items.length || busy || (type === 'DINE_IN' && !table)} onClick={submit}>ยืนยันออเดอร์ <ArrowRight size={17} /></Button></div></aside></div></>;
}
