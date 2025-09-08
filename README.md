# KMITL-FIGHT HUMID → Vercel (Direct)

ใช้หัว TEMP/HUMID บนบอร์ด (จ่าย V และ G ในบอร์ดแล้ว) ดึงเฉพาะขา **DATA** ไปยัง GPIO ของ ESP32
จากนั้น ESP32 จะ POST ข้อมูลไปยัง Vercel API เพื่อแสดงผลบนเว็บ

## การต่อแบบง่ายที่สุด (เส้นเดียว)
- HUMID **DATA → GPIO4** ของ ESP32
- ไม่ต้องต่อไฟเพิ่ม (V/G ได้จากบอร์ดอยู่แล้ว)
- ถ้าใช้ GPIO อื่น ให้แก้ `#define DHTPIN` ในโค้ด ESP32

## ตั้งค่า Vercel
- โปรเจกต์เว็บอยู่ใน `web/`
- ตั้ง ENV `INGEST_KEY` ให้ตรงกับในโค้ด ESP32
- (ทางเลือก) ตั้งค่า Vercel Blob: `BLOB_WRITE_URL`, `BLOB_READ_URL`, `BLOB_TOKEN`

## ทดสอบ
```bash
curl -X POST "https://<your-app>.vercel.app/api/ingest"       -H "Authorization: Bearer <INGEST_KEY>"       -H "Content-Type: application/json"       -d '{"temp":30.3,"hum":60}'
```
แล้วเปิด `https://<your-app>.vercel.app/api/latest`
