import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil } from 'lucide-react';
import { useShop, available } from '../../api/mock/store';
import { categories } from '../../types/product';
import { PageHeading } from '../../components/PageHeading';
import { Table } from '../../components/Table/Table';
import { currency } from '../../utils/currency';
export function ProductListPage() {
  const state = useShop();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  const products = state.products.filter(p => p.name.includes(search.trim()) && (category === 'ทั้งหมด' || p.category === category));
  return <><PageHeading eyebrow="THE GOOD STUFF" title="เมนู / สินค้า" description="ทุกไม้ที่ลูกค้ารัก จัดการได้จากที่นี่"><Link className="button primary" to="/products/new"><Plus size={18} />เพิ่มเมนู</Link></PageHeading><section className="panel"><div className="filter-bar"><div className="search-box"><Search size={18} /><input aria-label="ค้นหาสินค้า" placeholder="ค้นหาชื่อเมนู" value={search} onChange={e => setSearch(e.target.value)} /></div><select aria-label="กรองหมวดหมู่สินค้า" value={category} onChange={e => setCategory(e.target.value)}>{['ทั้งหมด', ...categories].map(c => <option key={c}>{c}</option>)}</select></div><Table headers={['เมนู', 'หมวดหมู่', 'ราคา', 'พร้อมขาย', 'สถานะ', '']}>{products.map(p => <tr key={p.id}><td><div className="table-product"><span className="food-thumb">{p.emoji}</span><b>{p.name}</b></div></td><td>{p.category}</td><td className="numeric">{currency(p.price)}</td><td>{available(state, p.id)} ชิ้น</td><td><span className={`badge ${p.active ? 'success' : 'neutral'}`}>{p.active ? 'เปิดขาย' : 'ปิดขาย'}</span></td><td><Link className="icon-button" to={`/products/${p.id}/edit`} aria-label={`แก้ไข ${p.name}`}><Pencil size={17} /></Link></td></tr>)}</Table>{!products.length && <div className="empty">ไม่พบเมนูที่ค้นหา</div>}</section></>;
}
