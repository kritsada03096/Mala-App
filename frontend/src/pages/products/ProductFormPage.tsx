import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useShop } from '../../api/mock/store';
import { productApi } from '../../api/product.api';
import { categories, type Category } from '../../types/product';
import { PageHeading } from '../../components/PageHeading';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
export function ProductFormPage() {
  const { id } = useParams();
  const { products } = useShop();
  const product = products.find(p => p.id === id);
  const navigate = useNavigate();
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [category, setCategory] = useState<Category>(product?.category ?? 'เนื้อ');
  const [emoji, setEmoji] = useState(product?.emoji ?? '🍢');
  const [active, setActive] = useState(product?.active ?? true);
  const [error, setError] = useState('');
  if (id && !product) return <div className="empty"><h1>ไม่พบเมนู</h1><Link to="/products">กลับรายการเมนู</Link></div>;
  function submit(event: FormEvent) {
    event.preventDefault();
    try { productApi.save({ name, price: Number(price), category, emoji, active }, id); navigate('/products'); }
    catch (e) { setError((e as Error).message); }
  }
  return <><PageHeading eyebrow="A NEW FAVORITE" title={id ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'} description="กำหนดชื่อ ราคา และหมวดหมู่ให้พร้อมขาย"><Link to="/products" className="button secondary">กลับรายการ</Link></PageHeading><form className="panel product-form" onSubmit={submit}><div className="form-preview" aria-hidden="true">{emoji}</div><Input label="ชื่อเมนู" value={name} onChange={e => setName(e.target.value)} maxLength={80} required /><div className="form-grid"><label className="field"><span>หมวดหมู่</span><select value={category} onChange={e => setCategory(e.target.value as Category)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><Input label="ราคา (บาท)" type="number" value={price} onChange={e => setPrice(e.target.value)} min="0.01" max="100000" step="0.01" required /></div><label className="field"><span>รูปแทนเมนู</span><select value={emoji} onChange={e => setEmoji(e.target.value)}>{['🍢', '🥩', '🥓', '🍖', '🍡', '🌭', '🥦', '🌽', '🍄', '🍵', '💧'].map(e => <option key={e}>{e}</option>)}</select></label><label className="checkbox-field"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />เปิดขายเมนูนี้</label>{!id && <p className="info-note">เมนูใหม่เริ่มต้นด้วยสต็อก 0 ชิ้น เพิ่มจำนวนได้ที่หน้าจัดการสต็อก</p>}{error && <p className="error" role="alert">{error}</p>}<div className="detail-actions"><Link className="button secondary" to="/products">ยกเลิก</Link><Button type="submit">บันทึกเมนู</Button></div></form></>;
}
