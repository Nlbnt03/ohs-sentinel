# OHS Sentinel — Vision and Sensor-Based Autonomous OHS Inspection

OHS Sentinel, iş sağlığı ve güvenliği (OHS) denetimlerini otomatikleştirmek için
geliştirilen, kamera ve sensör tabanlı **otonom bir mobil denetim robotu** ve
bu robotu izleyen **gerçek zamanlı web kontrol panelidir**. Robot, önceden
tanımlanmış rotalarda dolaşarak PPE (kişisel koruyucu donanım) ihlallerini
tespit eder, ortam tehlikelerini (gaz, gürültü, sıcaklık) izler ve olayları
anlık olarak operatör paneline iletir.

## Canlı Demo

Bu repo, projenin tanıtım web sitesini GitHub Pages üzerinden yayınlar:

👉 **https://nlbnt03.github.io/ohs-sentinel/**

> Not: Bu site, projenin tanıtım/portföy sayfasıdır. Robotun gerçek canlı
> kontrol paneli (Raspberry Pi'ye bağlı) ayrı bir uygulamada çalışır; bu
> sayfadaki dashboard görselleri gerçek sistemden alınmış ekran
> görüntüleridir.

## Proje Özeti

| | |
|---|---|
| **Ana bilgisayar** | Raspberry Pi 5, 8 GB |
| **Kamera** | Raspberry Pi Camera Module v2 |
| **Yapay zeka modeli** | YOLOv8n (PPE tespiti) |
| **Mikrodenetleyici** | Arduino UNO R3 |
| **Motor sürücü** | L298N Dual H-Bridge |
| **Şase** | 4WD Robot Chassis |
| **Engel tespiti** | 2× HC-SR04 |
| **Sıcaklık / Nem** | DHT22 |
| **Gaz / Hava kalitesi** | MQ-135 + MCP3008 |
| **Gürültü** | KY-038 |
| **İletişim** | MQTT, REST, WebSocket, USB Serial |

## Modüller

1. **Vision Based PPE Detection** — Raspberry Pi üzerinde YOLOv8n ile
   bareta/yelek/gözlük gibi ekipman ihlallerinin tespiti.
2. **Environmental Hazard Sensing** — Sıcaklık, nem, gaz ve gürültü
   seviyelerinin sürekli izlenmesi.
3. **Autonomous Navigation** — Önceden tanımlı waypoint'ler arasında otonom
   devriye, ultrasonik sensörlerle engel tespiti.
4. **Backend & API** — MQTT üzerinden gelen olayların FastAPI + SQLite ile
   toplanması, REST ve WebSocket üzerinden dağıtılması.
5. **OHS Monitoring Dashboard** — Canlı kat planı, robot konumu, sensör
   verileri, olay günlüğü ve manuel komut paneli (BAŞLAT / DURDUR / ALARM).

## Sistem Mimarisi

```
Pi Camera → YOLOv8n PPE Detection → MQTT Broker → FastAPI Backend
          → SQLite + WebSocket → OHS Monitoring Dashboard

DHT22 / MQ-135 / KY-038 → Environmental Sensor Module → GPIO/SPI
          → FastAPI Backend → Dashboard

Dashboard → START / STOP / ALARM komutları → Robot
```

## Bu Repo Hakkında

Bu repo, projenin **statik tanıtım web sitesini** içerir (saf
HTML/CSS/JS — herhangi bir derleme adımı gerektirmez).

```
.
├── index.html      # Sayfa içeriği ve bölümler
├── styles.css      # Görsel tasarım
├── script.js       # Etkileşimler, canlı dashboard simülasyonu
└── assets/         # Robot, takım ve dashboard ekran görüntüleri
```

### Yerelde Çalıştırma

Herhangi bir statik dosya sunucusu yeterlidir:

```bash
python3 -m http.server 8000
# http://localhost:8000 adresini aç
```

## Takım

| Modül | İsim | Görev |
|---|---|---|
| MOD-01 | Melik Ahmet Caymazoğlu | Vision Based PPE Detection |
| MOD-01 | Mert Certel | Vision Based PPE Detection |
| MOD-02 | Zehra Betül Güzel | Environmental Hazard Sensing |
| MOD-03 | Ahmet Faruk Kemal Keskinsoy | Autonomous Navigation |
| MOD-03 | Muhammed Emin Merdun | Autonomous Navigation |
| MOD-04 | Ömer Faruk Semih | Backend & API |
| MOD-04 | Yusuf Eren Nalbant | Backend & API |
| MOD-05 | İrem Akşun | OHS Monitoring Dashboard |
