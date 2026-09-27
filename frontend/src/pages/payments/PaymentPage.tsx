import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { QrCode, Banknote, ShieldCheck, Check } from 'lucide-react';
import { useOrder } from '../../hooks/useOrder';
import { paymentApi } from '../../api/payment.api';
import type { Payment } from '../../types/payment';
import { currency } from '../../utils/currency';
import { PageHeading } from '../../components/PageHeading';
import { Button } from '../../components/Button/Button';
export function PaymentPage() {
  const { orderId } = useParams();
  const { order, receipt } = useOrder(orderId);
  const navigate = useNavigate();
  const [method, setMethod] = useState<Payment['method']>('MOCK_QR');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!order) return <div className="empty"><h1>ไม่พบออเดอร์</h1><Link to="/orders">กลับรายการออเดอร์</Link></div>;
  if (receipt) return <Navigate to={`/receipts/${receipt.id}`} replace />;
  if (order.status !== 'WAITING_PAYMENT') return <div className="empty"><h1>ออเดอร์นี้ไม่สามารถชำระเงินได้</h1><Link to={`/orders/${order.id}`}>ดูออเดอร์</Link></div>;
  function pay() { if (!order || busy) return; setBusy(true); try { const r = paymentApi.confirm(order.id, method); navigate(`/receipts/${r.id}`, { replace: true }); } catch (e) { setError((e as Error).message); setBusy(false); } }
  return <><PageHeading eyebrow="A HAPPY ENDING" title="ชำระเงิน" description={`${order.number} · ${order.type === 'DINE_IN' ? `โต๊ะ ${order.table}` : 'กลับบ้าน'}`}><Link to={`/orders/${order.id}`} className="button secondary">กลับไปดูออเดอร์</Link></PageHeading><div className="payment-layout"><section className="panel payment-panel"><h2>เลือกวิธีชำระเงิน</h2><div className="segmented"><button className={method === 'MOCK_QR' ? 'selected' : ''} onClick={() => setMethod('MOCK_QR')}><QrCode size={18} />QR จำลอง</button><button className={method === 'MOCK_CASH' ? 'selected' : ''} onClick={() => setMethod('MOCK_CASH')}><Banknote size={18} />เงินสดจำลอง</button></div><div className="payment-amount"><small>ยอดชำระทั้งหมด</small><strong>{currency(order.total)}</strong></div>{method === 'MOCK_QR' ? <div className="mock-qr"><QrCode size={145} strokeWidth={1.4} /><span>DEMO ONLY</span><p>ภาพตัวอย่าง QR · สแกนชำระไม่ได้</p></div> : <div className="mock-qr cash"><Banknote size={100} strokeWidth={1} /><p>ทดลองรับชำระด้วยเงินสด</p></div>}<div className="info-note"><ShieldCheck size={21} /><p>นี่คือการชำระเงินจำลอง ไม่มีการโอนเงินจริง<br />กดปุ่มด้านล่างเพื่อทดสอบใบเสร็จและการตัดสต็อก</p></div>{error && <p className="error" role="alert">{error}</p>}<Button className="full-width" disabled={busy} onClick={pay}><Check size={18} />จำลองชำระเงินสำเร็จ</Button></section><section className="panel payment-summary"><h2>สรุปออเดอร์</h2>{order.items.map(i => <div className="summary-row" key={i.productId}><span>{i.name}<small>{i.quantity} × {currency(i.price)}</small></span><b>{currency(i.price * i.quantity)}</b></div>)}<div className="detail-total"><span>รวมสุทธิ</span><strong>{currency(order.total)}</strong></div><p className="muted">ระดับความเผ็ด: {order.spice}</p>{order.note && <p className="muted">หมายเหตุ: {order.note}</p>}</section></div></>;
}
