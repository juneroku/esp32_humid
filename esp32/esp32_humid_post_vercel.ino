// KMITL-FIGHT HUMID (DHT11/22) → POST JSON to Vercel API /api/ingest
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "DHT.h"

// ======== EDIT ========
const char* WIFI_SSID   = "Nammonnook_2.4G";
const char* WIFI_PASS   = "Nammonjai2547";
const char* VERCEL_HOST = "esp32-humid.vercel.app";
const char* INGEST_KEY  = "my-secret-123";
// ======================

#define DHTPIN 4
#define DHTTYPE DHT11   // or DHT22

DHT dht(DHTPIN, DHTTYPE);

void connectWiFi(){
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected, IP: " + WiFi.localIP().toString());
}

void setup(){
  Serial.begin(115200);
  pinMode(DHTPIN, INPUT_PULLUP);
  dht.begin();
  connectWiFi();
}

void loop(){
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) { Serial.println("DHT read failed"); delay(3000); return; }
  Serial.printf("Temp: %.1f C  Hum: %.1f %%\n", t, h);

  String url  = String("https://") + VERCEL_HOST + "/api/ingest";
  String json = String("{"temp":") + String(t,1) + ","hum":" + String(h,1) + "}";

  WiFiClientSecure client; client.setInsecure();
  HTTPClient http; http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + INGEST_KEY);
  int code = http.POST((uint8_t*)json.c_str(), json.length());
  Serial.printf("POST %s -> %d\n", url.c_str(), code);
  http.end();

  delay(15000);
}
