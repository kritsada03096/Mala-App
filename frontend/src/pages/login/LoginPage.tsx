import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Flame, ArrowRight, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;
  function submit(event: FormEvent) { event.preventDefault(); try { login(username, password); navigate('/'); } catch (e) { setError((e as Error).message); } }
  return <div className="login-page"><section className="login-art"><div className="brand"><div className="brand-icon"><Flame size={32} /></div><strong>MALA<span>·</span></strong></div><div className="login-copy"><span className="eyebrow">A LITTLE SPICE. A LOT OF POSSIBILITIES.</span><h1>ร้านเล็ก ๆ<br />ความอร่อยที่ยิ่งใหญ่<span>.</span></h1><p>ทุกไม้ ทุกออเดอร์ ทุกความสุข<br />จัดการร้านหมาล่าของคุณได้ในที่เดียว</p><div className="skewer-art" aria-hidden="true"><span>🍢</span><span>🌶️</span><span>🍢</span></div></div><div className="login-art-footer"><UtensilsCrossed size={16} /> YOUR EVERYDAY SHOP COMPANION</div></section>
  <section className="login-form-wrap"><div className="login-form"><span className="badge demo-badge">DEMO WORKSPACE</span><h2>พร้อมเปิดร้านแล้วหรือยัง?</h2><p className="muted">เข้าสู่ระบบเพื่อเริ่มต้นวันอร่อย ๆ ของคุณ</p><form onSubmit={submit}><Input label="ชื่อผู้ใช้" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="กรอกชื่อผู้ใช้" required /><Input label="รหัสผ่าน" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="กรอกรหัสผ่าน" required />{error && <p className="error" role="alert">{error}</p>}<Button type="submit" className="full-width">เข้าสู่ระบบ <ArrowRight size={18} /></Button></form><div className="login-demo"><ShieldCheck size={22} /><div><b>ลองใช้งานได้เลย</b><p>ชื่อผู้ใช้ <code>demo</code> · รหัสผ่าน <code>mala1234</code></p><button type="button" className="text-button" onClick={() => { setUsername('demo'); setPassword('mala1234'); setError(''); }}>กรอกบัญชีทดลองให้ฉัน →</button></div></div><p className="login-disclaimer">โหมดทดลองใช้ข้อมูลจำลอง ไม่มีการเชื่อมต่อเซิร์ฟเวอร์<br />บัญชีทดลองนี้ยังไม่ใช้ JWT</p></div></section></div>;
}
