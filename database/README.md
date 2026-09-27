# PostgreSQL — เตรียมไว้สำหรับระยะถัดไป

ตอนนี้ไม่มีการเชื่อมต่อฐานข้อมูล และยังไม่ได้รัน SQL migrations
แหล่ง SQL หลักอยู่ที่ `backend/migrations/` เท่านั้น เพื่อไม่ให้ schema ซ้ำกันสองที่

รันเรียง `001_create_users.sql` → `002_create_products.sql` → `003_create_orders.sql`
ในฐานข้อมูลใหม่เมื่อพร้อมเชื่อมต่อ PostgreSQL จะได้ตาราง:

- users, roles
- categories, products
- stocks, stock_transactions
- orders, order_items
- payments, receipts

เมื่อต้องการใช้ฐานข้อมูลในเครื่องภายหลัง:

```powershell
# รันจาก root; ไม่จำเป็นสำหรับแอป demo
$env:POSTGRES_PASSWORD = 'ตั้งรหัสผ่านสำหรับเครื่องของคุณ'
docker compose --profile future-db up -d
```

ตั้งค่า DBeaver: PostgreSQL, host `127.0.0.1`, port `5432`, database `mala_shop`, user `mala`, password ตามที่ตั้ง
จากนั้นเปิด SQL scripts และ execute ตามลำดับ ไม่มีการ migrate อัตโนมัติ
หาก volume เคยถูกสร้างแล้ว การเปลี่ยน environment password จะไม่เปลี่ยนรหัสผ่านในฐานข้อมูลเดิม

ขั้นตอนเชื่อม Go ในอนาคต: ใช้ PostgreSQL repository และ transaction แทน Memory Store,
ล็อกแถวสต็อกตามลำดับ product ID ให้คงที่ก่อนตรวจจำนวนพร้อมขายและบันทึกออเดอร์
การชำระเงิน การสร้างใบเสร็จ และการตัดสต็อกต้องอยู่ใน transaction เดียวกัน
ค่าราคาและชื่อใน order_items เป็น snapshot ไม่เปลี่ยนตามเมนูภายหลัง
SQL constraints ป้องกันค่าติดลบและ payment ซ้ำ แต่กติกาสถานะและยอดรวมยังต้องตรวจใน service
