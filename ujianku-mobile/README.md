# UjianKu Mobile

Aplikasi mobile platform ujian online **UjianKu** untuk **Siswa** dan **Pengawas**, dibangun dengan Flutter.

## 🎯 Fitur

### Siswa (Student)
- 📋 Melihat daftar ujian dengan filter status
- ✏️ Mengerjakan ujian online dengan anti-cheat
- ⏱️ Countdown timer real-time
- 📊 Melihat hasil ujian dengan animasi skor
- 👤 Profil dan statistik

### Pengawas (Proctor)
- 🖥️ Monitoring real-time siswa (grid status warna)
- ⚠️ Deteksi dan pencatatan pelanggaran
- 🚨 Aksi terhadap siswa (peringatkan, diskualifikasi, izinkan kembali)
- 📈 Laporan sesi pengawasan
- 📤 Ekspor laporan PDF

### Anti-Cheat
- 📱 Deteksi perpindahan aplikasi (app switching)
- 📸 Deteksi screenshot
- ⚠️ Peringatan otomatis saat kembali ke aplikasi
- 🚫 Diskualifikasi otomatis setelah 3 pelanggaran

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| Flutter | Framework UI |
| Dart | Bahasa pemrograman |
| Provider | State management |
| GoRouter | Navigasi |
| HTTP | Komunikasi API |
| SharedPreferences | Penyimpanan lokal |
| Google Fonts | Tipografi (Inter + Poppins) |

## 🎨 Design System

- **Primary**: Emerald (#10b981)
- **Secondary**: Slate (#64748b)
- **Accent**: Amber (#f59e0b)
- **Typography**: Inter (body) + Poppins (headings)
- **Semua UI dalam Bahasa Indonesia**

## 🚀 Quick Start

```bash
# Install dependencies
flutter pub get

# Jalankan di emulator/perangkat
flutter run

# Build APK
flutter build apk --release
```

Lihat [SETUP.md](SETUP.md) untuk panduan lengkap.

## 📁 Struktur Project

```
lib/
├── main.dart                 # Entry point
├── app.dart                  # App widget & router
├── config/                   # Theme, API, Routes
├── models/                   # Data models
├── services/                 # API & storage services
├── providers/                # State management
├── screens/                  # UI screens
│   ├── siswa/                # Student screens
│   └── pengawas/             # Proctor screens
├── widgets/                  # Reusable widgets
└── utils/                    # Constants & helpers
```

## 📱 Screens

### Siswa
1. **Splash Screen** - Logo animasi
2. **Login** - Email/password + pilih role
3. **Beranda** - Statistik, ujian mendatang, hasil terbaru
4. **Daftar Ujian** - Filter (Semua/Berlangsung/Mendatang/Selesai)
5. **Detail Ujian** - Info, petunjuk, token, mulai
6. **Kerjakan Ujian** - Full-screen, countdown, navigasi soal, anti-cheat
7. **Hasil Ujian** - Animasi skor, rincian, status kelulusan
8. **Profil** - Info, statistik, pengaturan

### Pengawas
1. **Beranda** - Jadwal, sesi aktif, statistik
2. **Monitoring** - Grid status siswa (hijau/kuning/merah), pelanggaran live
3. **Detail Siswa** - Info, koneksi, riwayat pelanggaran, aksi
4. **Daftar Pelanggaran** - Filter, search, detail
5. **Laporan** - Statistik sesi, ekspor PDF, akhiri sesi

## 📄 Lisensi

Proprietary - UjianKu Team
