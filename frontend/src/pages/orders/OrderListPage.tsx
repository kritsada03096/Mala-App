import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ArrowRight } from 'lucide-react';
import { useShop } from '../../api/mock/store';
import { PageHeading } from '../../components/PageHeading';
import { Table } from '../../components/Table/Table';
import { Status, statusLabels } from '../../components/Status';
import { currency } from '../../utils/currency';
import { dateTime } from '../../utils/date';
export function OrderListPage() {
  const { orders } = useShop();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const filtered = orders.filter(o => (status === 'ALL' || o.status === status) && `${o.number} ${o.table}`.toLowerCase().includes(search.toLowerCase().trim()));
  return <><PageHeading eyebrow="EVERY ORDER MATTERS" title="ออเดอร์ทั้งหมด" description="ติดตามและจัดการออเดอร์ของร้านในที่เดียว"><Link to="/orders/new" className="button primary"><Plus size={18} />สร้างออเดอร์</Link></PageHeading><section className="panel"><div className="filter-bar"><div className="search-box"><Search size={18} /><input aria-label="ค้นหาออเดอร์" placeholder="ค้นหาเลขออเดอร์ / โต๊ะ" value={search} onChange={e => setSearch(e.target.value)} /></div><select aria-label="กรองสถานะออเดอร์" value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">ทุกสถานะ</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><Table headers={['เลขออเดอร์', 'วันที่', 'ประเภท', 'จำนวน', 'ยอดรวม', 'สถานะ', '']}>
    {filtered.map(o => <tr key={o.id}><td><Link className="order-link" to={`/orders/${o.id}`}>{o.number}</Link></td><td>{dateTime(o.createdAt)}</td><td>{o.type === 'DINE_IN' ? `โต๊ะ ${o.table}` : 'กลับบ้าน'}</td><td>{o.items.reduce((n, i) => n + i.quantity, 0)} ชิ้น</td><td className="numeric">{currency(o.total)}</td><td><Status value={o.status} /></td><td><Link to={`/orders/${o.id}`} aria-label={`ดู ${o.number}`}><ArrowRight size={17} /></Link></td></tr>)}</Table>{!filtered.length && <div className="empty"><h3>ยังไม่มีออเดอร์ที่ตรงกับรายการนี้</h3><p>สร้างออเดอร์ใหม่ หรือเปลี่ยนตัวกรองเพื่อดูรายการ</p></div>}</section></>;
}
