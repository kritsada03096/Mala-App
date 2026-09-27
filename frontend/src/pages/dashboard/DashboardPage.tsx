import { Link } from 'react-router-dom';
import { ArrowUpRight, Banknote, ClipboardList, Clock3, Package, Plus, ArrowRight, Flame } from 'lucide-react';
import { useShop, available } from '../../api/mock/store';
import { currency } from '../../utils/currency';
import { dateTime, isToday } from '../../utils/date';
import { Status } from '../../components/Status';
import { PageHeading } from '../../components/PageHeading';
import { Table } from '../../components/Table/Table';
export function DashboardPage() {
  const state = useShop();
  const today = state.orders.filter(o => isToday(o.createdAt));
  const revenue = state.payments.filter(p => isToday(p.paidAt)).reduce((n, p) => n + p.amount, 0);
  const waiting = state.orders.filter(o => o.status === 'WAITING_PAYMENT');
  const low = state.stocks.filter(s => available(state, s.productId) <= s.threshold);
  const sold = new Map<string, number>();
  today.filter(o => o.status === 'COMPLETED').flatMap(o => o.items).forEach(i => sold.set(i.productId, (sold.get(i.productId) ?? 0) + i.quantity));
  const popular = [...sold].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const metrics = [
    { title: 'ยอดขายวันนี้', value: currency(revenue), note: 'จากรายการที่ชำระเงินแล้ว', icon: Banknote, color: 'red' },
    { title: 'ออเดอร์วันนี้', value: today.filter(o => o.status !== 'CANCELLED').length, note: 'ไม่รวมออเดอร์ที่ยกเลิก', icon: ClipboardList, color: 'orange' },
    { title: 'รอชำระเงิน', value: waiting.length, note: 'ออเดอร์ที่รอรับชำระทั้งหมด', icon: Clock3, color: 'blue' },
    { title: 'สินค้าใกล้หมด', value: low.length, note: 'รายการที่ควรเติมสต็อก', icon: Package, color: 'green' },
  ];
  return <><PageHeading eyebrow="YOUR SHOP, AT A GLANCE" title="ภาพรวมร้าน" description="สวัสดีครับ วันนี้มาเติมความอร่อยให้ลูกค้ากัน"><Link to="/orders/new" className="button primary"><Plus size={18} />สร้างออเดอร์ใหม่</Link></PageHeading>
    <section className="welcome-banner"><div><span className="eyebrow">GOOD FOOD. GOOD MOOD.</span><h2>ทุกความอร่อย เริ่มต้นที่ไม้แรก</h2><p>จัดการออเดอร์ให้คล่อง แล้วให้ความเผ็ดทำหน้าที่ของมัน</p><Link to="/orders/new">พร้อมรับออเดอร์แล้ว <ArrowRight size={16} /></Link></div><div className="banner-illustration" aria-hidden="true"><span className="stamp">麻<br />辣</span><span className="banner-pepper">🌶️</span><span className="banner-skewer">🍢</span><span className="tiny-spark">✦</span></div></section>
    <div className="metric-grid">{metrics.map(({ title, value, note, icon: Icon, color }) => <article className="metric-card" key={title}><div className="metric-top"><span>{title}</span><span className={`metric-icon ${color}`}><Icon size={19} /></span></div><strong>{value}</strong><small>{note}</small></article>)}</div>
    <div className="dashboard-grid"><section className="panel recent-orders"><div className="panel-heading"><div><h2>ออเดอร์ล่าสุด</h2><p>ติดตามทุกความอร่อยของร้าน</p></div><Link className="text-link" to="/orders">ดูทั้งหมด <ArrowUpRight size={16} /></Link></div>{state.orders.length ? <Table headers={['ออเดอร์', 'ประเภท', 'ยอดรวม', 'สถานะ', '']}>
      {state.orders.slice(0, 5).map(o => <tr key={o.id}><td><Link className="order-link" to={`/orders/${o.id}`}>{o.number}</Link><small>{dateTime(o.createdAt)}</small></td><td>{o.type === 'DINE_IN' ? `โต๊ะ ${o.table}` : 'กลับบ้าน'}</td><td className="numeric">{currency(o.total)}</td><td><Status value={o.status} /></td><td><Link to={`/orders/${o.id}`} aria-label={`ดู ${o.number}`}><ArrowRight size={17} /></Link></td></tr>)}</Table> : <div className="empty"><span className="empty-icon"><ClipboardList size={28} /></span><h3>ออเดอร์แรกของวัน รอคุณอยู่</h3><p>เริ่มสร้างออเดอร์ แล้วติดตามรายการทั้งหมดได้ที่นี่</p><Link to="/orders/new" className="button secondary"><Plus size={16} />เริ่มรับออเดอร์</Link></div>}</section>
    <section className="panel popular"><div className="panel-heading"><div><h2><Flame size={18} />เมนูขายดีวันนี้</h2><p>เมนูโปรดประจำร้าน</p></div></div>{popular.length ? <div className="popular-list">{popular.map(([productId, count], index) => { const p = state.products.find(p => p.id === productId)!; return <div className="popular-item" key={productId}><span className="rank">0{index + 1}</span><span className="food-thumb">{p.emoji}</span><div><b>{p.name}</b><small>{p.category}</small></div><strong>{count}<small>ชิ้น</small></strong></div>; })}</div> : <div className="empty compact"><span className="empty-food">🍢</span><h3>เมนูไหนจะเป็นดาวเด่น?</h3><p>อันดับจะปรากฏเมื่อมีออเดอร์<br />ที่ชำระเงินสำเร็จวันนี้</p></div>}</section></div>
    <section className="panel stock-alert"><div className="panel-heading"><div><h2><Package size={18} />เช็กสต็อกอีกนิด ขายต่อได้ยาว ๆ</h2><p>จำนวนพร้อมขาย หลังหักที่จองไว้ในออเดอร์</p></div><Link to="/inventory" className="text-link">จัดการสต็อก <ArrowUpRight size={16} /></Link></div><div className="stock-alert-grid">{low.length ? low.slice(0, 4).map(s => { const p = state.products.find(p => p.id === s.productId)!; return <Link to="/inventory" className="stock-alert-item" key={s.productId}><span className="food-thumb">{p.emoji}</span><div><b>{p.name}</b><small>เกณฑ์แจ้งเตือน {s.threshold} ชิ้น</small></div><span className="badge warning">เหลือ {available(state, p.id)}</span></Link>; }) : <p className="muted">สต็อกพร้อมขายทุกรายการ</p>}</div></section>
  </>;
}
