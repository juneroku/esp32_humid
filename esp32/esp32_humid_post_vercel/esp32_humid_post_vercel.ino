/******************************************************
 * KMITL-FIGHT HUMID (DHT11/22) → POST JSON ไป Vercel /api/ingest
 ******************************************************/
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

// ======== EDIT ตรงนี้ ========
const char* WIFI_SSID   = "ชื่อWiFi_2.4G";
const char* WIFI_PASS   = "รหัสWiFi";
const char* VERCEL_HOST = "esp32-humid.vercel.app";  // โดเมนล้วน: ไม่มี http:// และไม่มี / ท้าย
const char* INGEST_KEY  = "my-secret-123";           // ต้องตรงกับ Environment Variable บน Vercel
// =============================

// พิน DATA ของหัว TEMP/HUMID → ต่อเข้ากับ GPIO4
#define DHTPIN   4
// เลือกชนิดเซ็นเซอร์: DHT11 หรือ DHT22
#define DHTTYPE  DHT11  // ถ้าใช้ DHT22 ให้เปลี่ยนเป็น DHT22

DHT dht(DHTPIN, DHTTYPE);

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi connecting");
  uint8_t tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 40) { // ~20 วินาที
    delay(500);
    Serial.print(".");
    tries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("\nWiFi connected, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connect failed, retry in 3s");
  }
}

void ensureWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
}

// สร้าง JSON อย่างปลอดภัย (เลี่ยงปัญหาเครื่องหมายคำพูด)
String buildJson(float t, float h) {
  char buf[64];
  snprintf(buf, sizeof(buf), "{\"temp\":%.1f,\"hum\":%.1f}", t, h);
  return String(buf);
}

void setup() {
  Serial.begin(115200);
  delay(200);
  pinMode(DHTPIN, INPUT_PULLUP); // ช่วยดึงสัญญาณขึ้น
  dht.begin();
  connectWiFi();
}

void loop() {
  ensureWiFi();

  // อ่านเซ็นเซอร์
  float hum = dht.readHumidity();
  float tmp = dht.readTemperature(); // องศา C
  if (isnan(hum) || isnan(tmp)) {
    Serial.println("DHT read failed (NaN), retry in 3s");
    delay(3000);
    return;
  }
  Serial.printf("Temp: %.1f C  Hum: %.1f %%\n", tmp, hum);

  // เตรียม URL และ JSON
  String url  = String("https://") + VERCEL_HOST + "/api/ingest";
  String json = buildJson(tmp, hum);

  // ส่ง HTTPS แบบไม่ตรวจใบรับรอง (ปลอดภัยพอสำหรับงานทดสอบ/เดโม)
  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  if (!http.begin(client, url)) {
    Serial.println("http.begin() failed");
  } else {
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + INGEST_KEY);

    int code = http.POST((uint8_t*)json.c_str(), json.length());
    Serial.printf("POST %s -> %d\n", url.c_str(), code);

    if (code > 0) {
      String rsp = http.getString();
      Serial.println("Resp: " + rsp);
    }
    http.end();
  }

  // ส่งทุก ~15 วินาที
  delay(15000);
}
