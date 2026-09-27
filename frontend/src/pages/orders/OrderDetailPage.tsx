import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import { orderApi } from '../../api/order.api';
import { PageHeading } from '../../components/PageHeading';
import { Status } from '../../components/Status';
import { Table } from '../../components/Table/Table';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import { currency } from '../../utils/currency';
import { dateTime } from '../../utils/date';
export function OrderDetailPage() {
  const { id } = useParams();
  const { order, receipt } = useOrder(id);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  if (!order) return <div className="empty"><h1>ไม่พบออเดอร์</h1><Link to="/orders">กลับไปออเดอร์ทั้งหมด</Link></div>;
  return <><PageHeading eyebrow="ORDER DETAILS" title={order.number} description={`สร้างเมื่อ ${dateTime(order.createdAt)}`}><Link className="button secondary" to="/orders">กลับรายการ</Link><Status value={order.status} /></PageHeading><div className="panel detail-panel"><div className="detail-meta"><div><small>ประเภท</small><b>{order.type === 'DINE_IN' ? `ทานที่ร้าน · โต๊ะ ${order.table}` : 'นำกลับบ้าน'}</b></div><div><small>ความเผ็ด</small><b>{order.spice}</b></div><div><small>หมายเหตุ</small><b>{order.note || '—'}</b></div></div><Table headers={['เมนู', 'ราคา / ชิ้น', 'จำนวน', 'รวม']}>{order.items.map(i => <tr key={i.productId}><td>{i.name}</td><td>{currency(i.price)}</td><td>{i.quantity}</td><td className="numeric">{currency(i.price * i.quantity)}</td></tr>)}</Table><div className="detail-total"><span>ยอดสุทธิ</span><strong>{currency(order.total)}</strong></div><div className="detail-actions">{order.status === 'WAITING_PAYMENT' && <><Button variant="danger" onClick={() => setConfirm(true)}>ยกเลิกออเดอร์</Button><Link className="button primary" to={`/payments/${order.id}`}>ไปชำระเงิน</Link></>}{receipt && <Link className="button primary" to={`/receipts/${receipt.id}`}>ดูใบเสร็จ</Link>}</div></div>{confirm && <Modal title={`ยกเลิก ${order.number}?`} onClose={() => setConfirm(false)}><p>ออเดอร์นี้จะถูกยกเลิก และคืนจำนวนสินค้าที่จองไว้ให้พร้อมขาย</p>{error && <p className="error" role="alert">{error}</p>}<div className="modal-actions"><Button variant="secondary" onClick={() => setConfirm(false)}>กลับ</Button><Button variant="danger" onClick={() => { try { orderApi.cancel(order.id); setConfirm(false); } catch (e) { setError((e as Error).message); } }}>ยืนยันยกเลิก</Button></div></Modal>}</>;
}
