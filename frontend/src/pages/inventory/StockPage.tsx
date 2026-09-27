import { useState, type FormEvent } from 'react';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import { useShop, available } from '../../api/mock/store';
import { stockApi } from '../../api/stock.api';
import { PageHeading } from '../../components/PageHeading';
import { Table } from '../../components/Table/Table';
import { Modal } from '../../components/Modal/Modal';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { dateTime } from '../../utils/date';
export function StockPage() {
  const state = useShop();
  const [search, setSearch] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('รับสินค้าเข้าร้าน');
  const [error, setError] = useState('');
  const selectedProduct = state.products.find(p => p.id === selected);
  const stocks = state.stocks.filter(s => state.products.find(p => p.id === s.productId)?.name.includes(search.trim()) && (!onlyLow || available(state, s.productId) <= s.threshold));
  function submit(event: FormEvent) {
    event.preventDefault(); if (!selected) return;
    try { stockApi.adjust(selected, Number(quantity), reason); setSelected(null); }
    catch (e) { setError((e as Error).message); }
  }
  return <><PageHeading eyebrow="READY FOR THE NEXT ORDER" title="จัดการสต็อก" description="เช็กของ เติมของ ให้ทุกเมนูพร้อมเสิร์ฟ"><span className="badge neutral"><Package size={15} />{state.stocks.length} รายการ</span></PageHeading><section className="panel"><div className="filter-bar"><div className="search-box"><Search size={18} /><input aria-label="ค้นหาสต็อก" placeholder="ค้นหาสินค้าในสต็อก" value={search} onChange={e => setSearch(e.target.value)} /></div><label className="checkbox-field"><input type="checkbox" checked={onlyLow} onChange={e => setOnlyLow(e.target.checked)} />เฉพาะสินค้าใกล้หมด</label></div><Table headers={['สินค้า', 'คงเหลือ', 'จองไว้', 'พร้อมขาย', 'สถานะ', '']}>{stocks.map(s => { const p = state.products.find(p => p.id === s.productId)!; const count = available(state, p.id); return <tr key={p.id}><td><div className="table-product"><span className="food-thumb">{p.emoji}</span><b>{p.name}</b></div></td><td>{s.quantity}</td><td>{s.quantity - count}</td><td className="numeric">{count}</td><td><span className={`badge ${count <= s.threshold ? 'warning' : 'success'}`}>{count === 0 ? 'หมด' : count <= s.threshold ? 'ใกล้หมด' : 'พร้อมขาย'}</span></td><td><Button variant="secondary" onClick={() => { setSelected(p.id); setQuantity(''); setReason('รับสินค้าเข้าร้าน'); setError(''); }}><SlidersHorizontal size={15} />ปรับสต็อก</Button></td></tr>; })}</Table>{!stocks.length && <div className="empty">ไม่มีสินค้าที่ตรงกับตัวกรอง</div>}</section><section className="panel transactions"><div className="panel-heading"><div><h2>ความเคลื่อนไหวล่าสุด</h2><p>การรับเข้า การปรับจำนวน และการขาย · 20 รายการล่าสุด</p></div></div><Table headers={['วันที่', 'สินค้า', 'จำนวน', 'เหตุผล']}>{state.transactions.slice(0, 20).map(t => <tr key={t.id}><td>{dateTime(t.createdAt)}</td><td>{state.products.find(p => p.id === t.productId)?.name}</td><td className={t.quantity > 0 ? 'text-green' : 'text-red'}>{t.quantity > 0 ? '+' : ''}{t.quantity}</td><td>{t.reason}</td></tr>)}</Table>{!state.transactions.length && <div className="empty compact">ยังไม่มีความเคลื่อนไหวสต็อก</div>}</section>{selected && <Modal title={`ปรับสต็อก · ${selectedProduct?.name}`} onClose={() => setSelected(null)}><form onSubmit={submit}><p className="muted">ใช้จำนวนบวกเพื่อรับเข้า หรือจำนวนลบเพื่อนำออก</p><Input label="จำนวนที่ปรับ (+ / -)" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} step="1" min="-100000" max="100000" required autoFocus /><Input label="เหตุผล" value={reason} onChange={e => setReason(e.target.value)} maxLength={200} required />{error && <p className="error" role="alert">{error}</p>}<div className="modal-actions"><Button type="button" variant="secondary" onClick={() => setSelected(null)}>ยกเลิก</Button><Button type="submit">บันทึกสต็อก</Button></div></form></Modal>}</>;
}
