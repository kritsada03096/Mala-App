# MALA · ระบบหน้าร้านหมาล่า

ต้นแบบ React + TypeScript + Vite พร้อม Go + Gin REST API สำหรับทดลองในเครื่อง
ยังไม่เชื่อม PostgreSQL, เซิร์ฟเวอร์ภายนอก หรือระบบรับชำระเงินจริง

## เริ่มใช้งานหน้าร้าน

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

เปิด **http://127.0.0.1:5173**

บัญชีทดลอง: **`demo` / `mala1234`** หรือกด “กรอกบัญชีทดลองให้ฉัน” ที่หน้าเข้าสู่ระบบ
บน macOS/Linux ใช้ `npm` แทน `npm.cmd` ได้ คำสั่ง `.cmd` ช่วยหลีกเลี่ยงข้อจำกัด PowerShell execution policy

หน้าบ้านใช้ mock API และ `localStorage` จึงทดลองได้โดยไม่ต้องเปิด backend
ข้อมูลออเดอร์ เมนู ใบเสร็จ และสต็อกยังอยู่หลังรีเฟรชหน้า; session ล็อกอินเก็บใน `sessionStorage`
ข้อมูลแยกตามเบราว์เซอร์และ origin (เช่น localhost กับ 127.0.0.1 ถือเป็นคนละชุด)

## สิ่งที่ทดลองได้

- ล็อกอิน / ออกจากระบบ และป้องกันหน้าที่ต้องเข้าสู่ระบบ
- Dashboard ยอดขายวันนี้ ออเดอร์รอชำระ เมนูขายดี และแจ้งเตือนสต็อก
- เพิ่ม/แก้ไขเมนู ราคา หมวดหมู่ และเปิด/ปิดขาย
- เลือกโต๊ะ 1–12 หรือกลับบ้าน เลือกเมนู จำนวน ความเผ็ด และหมายเหตุ
- ยืนยันออเดอร์ จองสินค้า และยกเลิกออเดอร์ที่ยังไม่ชำระ
- จำลอง QR / เงินสด สร้างใบเสร็จและตัดสต็อกครั้งเดียว
- พิมพ์ใบเสร็จ / บันทึก PDF ผ่าน Print ของเบราว์เซอร์
- ปรับสต็อกพร้อมเหตุผล ดูจำนวนที่จองและประวัติความเคลื่อนไหว
- หน้าจอรองรับ desktop / mobile พร้อมเมนูด้านข้างบนมือถือ

เริ่มต้นมี 12 เมนูใน 6 หมวดหมู่ สต็อกตัวอย่าง และไม่มีออเดอร์เก่าที่สร้างขึ้นมาเอง
เมนูใหม่เริ่มต้นสต็อก 0 ให้เพิ่มจำนวนที่หน้าจัดการสต็อกก่อนขาย

## Backend สำหรับทดสอบแยก

ต้องมี Go 1.24 ขึ้นไป เครื่องที่พัฒนาใช้ Go 1.27.0

```powershell
cd backend
go mod download
go run ./cmd/api
```

API ฟังที่ **http://127.0.0.1:8080** และจำกัดให้ bind เฉพาะ loopback ในโหมดทดลอง
เช็ก `GET /health` จะคืน `mode: memory-demo` และ `databaseConnected: false`

Backend มี REST API สำหรับ auth, categories, products, orders, simulated payments, receipts และ stocks
ใช้ Handler → Service → Repository และ repository แบบหน่วยความจำที่รองรับ transaction ภายในโปรเซส
คำนวณราคาใน service จากข้อมูลสินค้า ไม่ใช้ราคาที่ client ส่งมา
ใช้ JWT HS256 อายุ 8 ชั่วโมงและ bcrypt สำหรับบัญชีทดลอง มี ADMIN/STAFF middleware
ถ้าไม่กำหนด JWT_SECRET จะสุ่ม key ใหม่ทุกครั้งที่เริ่มโปรเซส

**หน้าบ้านกับ backend ยังเป็นโหมดทดลองแยกกัน**: หน้าบ้านไม่เรียก HTTP และไม่ใช้ JWT ในตอนนี้
ข้อมูล backend จะหายเมื่อหยุดโปรเซส ส่วนข้อมูลหน้าบ้านเก็บในเบราว์เซอร์
ดู endpoints และตัวอย่างเรียก API ใน [docs/api.md](docs/api.md)

`.env.example` เป็นแม่แบบ โปรแกรมอ่าน environment ของโปรเซส ไม่โหลด `.env` อัตโนมัติ
หากต้องการตั้งค่าเองใน PowerShell ให้ใช้ `$env:APP_ADDR = '127.0.0.1:8081'`
และตั้ง `$env:JWT_SECRET` ให้เป็นค่าสุ่มอย่างน้อย 32 bytes โดยไม่ commit secret

## ตรวจสอบ

```powershell
cd frontend
npm.cmd run build
npm.cmd test

# ใช้ Edge ที่ติดตั้งอยู่บน Windows
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm.cmd run test:e2e

# หรือใช้ Chromium ของ Playwright แทน
# npx.cmd playwright install chromium
# Remove-Item Env:PLAYWRIGHT_CHANNEL -ErrorAction SilentlyContinue
# npm.cmd run test:e2e

cd ../backend
go test ./...
go vet ./...
go build -o bin/mala-api.exe ./cmd/api
```

Unit tests ตรวจการคิดเงินทศนิยม การจอง/คืนสต็อก ชำระซ้ำ การย้อนคืนเมื่อเกิดข้อผิดพลาด และการบันทึกข้อมูล
Go tests ตรวจ JWT, HTTP endpoints และ concurrent orders/payments ด้วย
Playwright เปิด dev server ที่ port 4173 ชั่วคราวและทดสอบขั้นตอนใช้งานจริงทั้ง desktop และ mobile

## โครงสร้าง

```text
Mala-App/
├── frontend/           React UI, mock API, unit tests, browser tests
│   └── src/
│       ├── api/        mock adapters และ data store
│       ├── components/ Button, Modal, Table, Input, Loading
│       ├── layouts/    Sidebar, Header, MainLayout
│       ├── pages/      login, dashboard, products, orders, payments, receipts, inventory
│       ├── hooks/
│       ├── types/
│       ├── utils/
│       └── router/
├── backend/
│   ├── cmd/api/
│   ├── internal/       config, database, middleware, model, repository, service, handler, router
│   └── migrations/     SQL สำหรับ PostgreSQL ในระยะถัดไป
├── database/           วิธีเตรียม PostgreSQL / DBeaver ภายหลัง
├── docs/               API contract และสถาปัตยกรรม
└── docker-compose.yml  PostgreSQL ภายใต้ profile future-db เท่านั้น
```

SQL และ Docker เตรียมไว้เฉย ๆ ยังไม่ได้รัน migration หรือสร้างฐานข้อมูล
ดู [database/README.md](database/README.md) และ [docs/architecture.md](docs/architecture.md)

## ขอบเขตของรุ่นทดลอง

- QR เป็นภาพแทนตัวอย่าง สแกนจ่ายไม่ได้ ปุ่มชำระเงินเป็นการจำลองโดยพนักงาน
- PAID เป็นสถานะภายใน transaction ก่อน COMPLETED จึงแสดงผลสุดท้ายเป็น COMPLETED เมื่อสำเร็จ
- ยอดขายและใบเสร็จเป็นข้อมูลทดลอง ไม่ใช่ใบกำกับภาษี ไม่มีการคำนวณภาษี/ส่วนลด
- ใช้หน้าขายเพียงแท็บเดียวในการทดลอง; localStorage ไม่มี transaction ข้ามแท็บหรือข้ามเครื่อง
- การล็อกอินฝั่งหน้าเว็บเป็นเพียง demo session ผู้ใช้สามารถแก้ข้อมูลใน devtools ได้
- ยังไม่มีการเชื่อม frontend ↔ Go, PostgreSQL repository, payment gateway, refresh token หรือ production deployment
- ข้อมูลหน้าบ้านสามารถเริ่มใหม่โดยลบ key `mala-shop.demo.v1` ใน DevTools → Application → Local Storage แล้วรีเฟรช (ข้อมูลทดลองเดิมจะหาย)
- ใช้ Git ใน repo นี้ได้ตามปกติ ยังไม่ได้ commit หรือ push ไป GitHub
