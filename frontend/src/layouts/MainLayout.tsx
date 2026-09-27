import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getStorageWarning, useShop } from '../api/mock/store';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
export function MainLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  useShop();
  if (!user) return <Navigate to="/login" replace />;
  return <div className="app-shell"><a className="skip-link" href="#main">ข้ามไปเนื้อหา</a><Sidebar open={open} onClose={() => setOpen(false)} /><div className="workspace"><Header onMenu={() => setOpen(true)} /><main id="main">{getStorageWarning() && <div className="error" role="alert">{getStorageWarning()}</div>}<Outlet /></main><footer className="app-footer"><span>MALA POS <span className="muted">/</span> made for a little more spice.</span><span>ข้อมูลจัดเก็บในเบราว์เซอร์นี้</span></footer></div></div>;
}
