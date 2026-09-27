import { NavLink } from 'react-router-dom';
import { Flame, LayoutDashboard, UtensilsCrossed, ClipboardList, Package, ReceiptText, LogOut, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
const links = [
  { path: '/', label: 'ภาพรวมร้าน', icon: LayoutDashboard },
  { path: '/orders', label: 'ออเดอร์ทั้งหมด', icon: ClipboardList },
  { path: '/products', label: 'เมนู / สินค้า', icon: UtensilsCrossed },
  { path: '/inventory', label: 'จัดการสต็อก', icon: Package },
  { path: '/receipts', label: 'ใบเสร็จ', icon: ReceiptText },
];
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  return <><button hidden={!open} className="sidebar-overlay" aria-label="ปิดเมนู" onClick={onClose} /><aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="brand"><div className="brand-icon"><Flame size={28} /></div><div><strong>MALA<span>·</span></strong><small>อร่อยเผ็ด จัดการง่าย</small></div><button className="mobile-only icon-button" onClick={onClose} aria-label="ปิดเมนู"><X /></button></div>
    <div className="branch"><span className="branch-mark">ม</span><div><b>หมาล่า หน้าบ้าน</b><small>สาขาหลัก · ระบบหน้าร้าน</small></div><span className="online-dot" /></div>
    <NavLink className="button primary new-order" to="/orders/new" onClick={onClose}><Plus size={18} />สร้างออเดอร์</NavLink>
    <p className="nav-label">WORKSPACE</p>
    <nav>{links.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={onClose}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="demo-note"><span className="demo-dot" />พื้นที่ทดลองใช้งาน<p>ข้อมูลจำลอง พร้อมให้ลองขาย<br />ยังไม่มีการรับชำระเงินจริง</p></div>
    <div className="user"><span className="avatar">พ</span><div><b>{user?.name}</b><small>ผู้ดูแลร้าน</small></div><button onClick={logout} className="icon-button" aria-label="ออกจากระบบ"><LogOut size={18} /></button></div></div>
  </aside></>;
}
