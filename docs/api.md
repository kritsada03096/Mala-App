# Local demo REST API

Base URL: `http://127.0.0.1:8080/api/v1`

ทุก endpoint ยกเว้น `/health` และ `/auth/login` ต้องมี `Authorization: Bearer <token>`
Success body: `{ "data": ... }`; error body: `{ "error": "..." }`
วันที่เป็น ISO 8601 UTC, ราคาที่รับ/ส่งเป็นบาททศนิยมไม่เกินสองตำแหน่ง
ภายใน Go เก็บเงินเป็นจำนวนเต็มหน่วยสตางค์เพื่อหลีกเลี่ยง floating-point errors

| Method | Path | ผลลัพธ์ / การทำงาน |
| --- | --- | --- |
| GET | `/health` (ไม่มี `/api/v1`) | สถานะและโหมดหน่วยความจำ |
| POST | `/auth/login` | JWT, user, expiresIn |
| GET | `/categories` | รายชื่อหมวดหมู่ |
| GET | `/products` | สินค้าทั้งหมด รวมที่ปิดขาย |
| POST | `/products` | สร้างสินค้าและสต็อก 0 (ADMIN) |
| PUT | `/products/:id` | แก้ไขสินค้า (ADMIN) |
| GET | `/orders` | ออเดอร์ล่าสุดก่อน |
| POST | `/orders` | คำนวณราคาและสร้าง WAITING_PAYMENT |
| GET | `/orders/:id` | รายละเอียดออเดอร์ |
| POST | `/orders/:id/cancel` | ยกเลิกเฉพาะ WAITING_PAYMENT |
| POST | `/orders/:id/payments/demo-confirm` | จำลองชำระและคืน receipt; เรียกซ้ำไม่ตัดสต็อกซ้ำ |
| GET | `/receipts` | ใบเสร็จทั้งหมด |
| GET | `/receipts/:id` | รายละเอียดใบเสร็จ อ้างถึง order/payment |
| GET | `/stocks` | productId, quantity, threshold, available |
| POST | `/stocks/:id/adjust` | ปรับจำนวนพร้อมเหตุผล (ADMIN; id คือ productId) |
| GET | `/stock-transactions` | ประวัติสต็อกล่าสุดก่อน |

HTTP status: 200 success, 201 created, 400 invalid input/state, 401 authentication,
403 role denied, 404 not found. Request body จำกัด 1 MiB
Pagination ยังไม่อยู่ในรุ่นทดลอง

## ตัวอย่าง PowerShell

เปิด backend ก่อน จากนั้นรันในอีก Terminal:

```powershell
$baseUrl = 'http://127.0.0.1:8080/api/v1'
$loginBody = @{ username = 'demo'; password = 'mala1234' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType 'application/json' -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.data.token)" }
Invoke-RestMethod -Uri "$baseUrl/products" -Headers $headers

$orderBody = @{
    type = 'DINE_IN'
    table = '1'
    spice = 'เผ็ดกลาง'
    note = ''
    items = @(@{ productId = 'p1'; quantity = 2 })
} | ConvertTo-Json -Depth 4
$order = Invoke-RestMethod -Method Post -Uri "$baseUrl/orders" -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($orderBody))

# จำลองรับชำระ ไม่มีการโอนเงินจริง
$orderId = $order.data.id
$receipt = Invoke-RestMethod -Method Post -Uri "$baseUrl/orders/$orderId/payments/demo-confirm" -Headers $headers -ContentType 'application/json' -Body '{"method":"MOCK_QR"}'
$receipt.data
```

## Request bodies

สินค้า (POST/PUT เป็นการส่งค่าทั้งชุด):

```json
{ "name": "หมูสามชั้น", "category": "หมู", "price": 15, "emoji": "🥓", "active": true }
```

ออเดอร์ส่งเฉพาะ productId และ quantity ของแต่ละรายการ ไม่ส่ง unit price หรือ total:

```json
{
  "type": "TAKEAWAY",
  "table": "",
  "spice": "เผ็ดน้อย",
  "note": "แยกน้ำจิ้ม",
  "items": [{ "productId": "p1", "quantity": 2 }]
}
```

ปรับสต็อก:

```json
{ "quantity": 10, "reason": "รับสินค้าเข้าร้าน" }
```

จำนวนลบหมายถึงนำออก และต้องไม่ทำให้จำนวนคงเหลือต่ำกว่าที่จองไว้
วิธีชำระเงินรองรับเฉพาะ `MOCK_QR` และ `MOCK_CASH`
การเชื่อม gateway จริงต้องเปลี่ยน endpoint นี้เป็นขั้นตอนยืนยันจากฝั่ง provider ที่ตรวจสอบได้
