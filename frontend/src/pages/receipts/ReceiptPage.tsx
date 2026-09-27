import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Flame, Printer, Plus } from 'lucide-react';
import { useShop } from '../../api/mock/store';
import { PageHeading } from '../../components/PageHeading';
import { Table } from '../../components/Table/Table';
import { Button } from '../../components/Button/Button';
import { currency } from '../../utils/currency';
import { dateTime } from '../../utils/date';
export function ReceiptPage() {
  const { id } = useParams();
  const state = useShop();
  if (!id) return <><PageHeading eyebrow="ALL THE LITTLE DETAILS" title="ใบเสร็จ" description="รายการใบเสร็จจากการชำระเงินจำลอง" /><section className="panel"><Table headers={['เลขใบเสร็จ', 'ออเดอร์', 'วันที่', 'ยอดรวม', '']}>{[...state.receipts].reverse().map(r => { const order = state.orders.find(o => o.id === r.orderId)!; return <tr key={r.id}><td className="order-link">{r.number}</td><td>{order.number}</td><td>{dateTime(r.issuedAt)}</td><td className="numeric">{currency(order.total)}</td><td><Link className="text-link" to={`/receipts/${r.id}`}>ดูใบเสร็จ →</Link></td></tr>; })}</Table>{!state.receipts.length && <div className="empty"><h3>ยังไม่มีใบเสร็จ</h3><p>ใบเสร็จจะถูกสร้างหลังจำลองชำระเงินสำเร็จ</p></div>}</section></>;
  const receipt = state.receipts.find(r => r.id === id);
  const order = state.orders.find(o => o.id === receipt?.orderId);
  const payment = state.payments.find(p => p.id === receipt?.paymentId);
  if (!receipt || !order || !payment) return <div className="empty"><h1>ไม่พบใบเสร็จ</h1><Link to="/receipts">กลับรายการใบเสร็จ</Link></div>;
  return <div className="receipt-page"><div className="receipt-success no-print"><CheckCircle2 size={35} /><h1>เรียบร้อย พร้อมเสิร์ฟความอร่อย!</h1><p>ชำระเงินจำลองสำเร็จ · ตัดสต็อกแล้ว</p></div><article className="receipt-paper"><div className="receipt-brand"><Flame size={32} /><h2>MALA<span>·</span></h2><p>หมาล่า หน้าบ้าน · สาขาหลัก</p><b>ใบเสร็จทดลอง — ไม่ใช่ใบกำกับภาษี</b></div><div className="receipt-meta"><p><span>ใบเสร็จ</span><b>{receipt.number}</b></p><p><span>ออเดอร์</span><b>{order.number}</b></p><p><span>วันที่</span><span>{dateTime(receipt.issuedAt)}</span></p><p><span>ประเภท</span><span>{order.type === 'DINE_IN' ? `โต๊ะ ${order.table}` : 'กลับบ้าน'}</span></p></div><div className="receipt-items">{order.items.map(i => <div key={i.productId}><span>{i.name}<small>{i.quantity} × {currency(i.price)}</small></span><b>{currency(i.price * i.quantity)}</b></div>)}</div><div className="receipt-total"><b>รวมทั้งสิ้น</b><strong>{currency(order.total)}</strong></div><p className="receipt-method">{payment.method === 'MOCK_QR' ? 'QR Payment (จำลอง)' : 'เงินสด (จำลอง)'}</p><div className="receipt-thanks"><p>ขอบคุณที่มาเติมความเผ็ดด้วยกัน ♡</p><small>แล้วพบกันใหม่ในไม้ต่อไป</small><span>— DEMO · NO REAL PAYMENT —</span></div></article><div className="receipt-actions no-print"><Button variant="secondary" onClick={() => window.print()}><Printer size={17} />พิมพ์ใบเสร็จ</Button><Link to="/orders/new" className="button primary"><Plus size={17} />ออเดอร์ถัดไป</Link><Link to="/receipts" className="text-link">ใบเสร็จทั้งหมด</Link></div></div>;
}
