import { Menu, Store } from 'lucide-react';
export function Header({ onMenu }: { onMenu: () => void }) {
  return <header className="header"><div className="header-left"><button className="mobile-only icon-button" onClick={onMenu} aria-label="เปิดเมนู"><Menu /></button><Store size={17} /><span>ระบบจัดการหน้าร้าน</span><span className="header-divider">/</span><b>MALA POS</b></div><div className="header-right"><span className="badge demo-badge">DEMO MODE</span><span className="header-date">{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div></header>;
}
