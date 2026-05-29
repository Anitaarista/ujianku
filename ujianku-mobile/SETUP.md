# UjianKu Mobile - Panduan Setup

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

1. **Flutter SDK** (versi 3.0.0 atau yang lebih baru)
   - [Panduan instalasi Flutter](https://docs.flutter.dev/get-started/install)
   - Cek instalasi: `flutter doctor`

2. **Dart SDK** (biasanya termasuk dalam Flutter SDK)
   - Versi 3.0.0 atau yang lebih baru

3. **IDE yang direkomendasikan**:
   - Visual Studio Code dengan ekstensi Flutter
   - Android Studio dengan plugin Flutter

4. **Untuk Android**:
   - Android SDK (API level 21 atau lebih tinggi)
   - Android Studio atau Android SDK Command-line Tools

5. **Untuk iOS** (hanya macOS):
   - Xcode 14 atau yang lebih baru
   - CocoaPods
   - Simulator iOS

## Cara Install Dependencies

1. Clone atau buka project:
   ```bash
   cd /home/z/my-project/ujianku-mobile
   ```

2. Install semua dependencies:
   ```bash
   flutter pub get
   ```

3. (Opsional) Jika ada masalah dengan dependencies:
   ```bash
   flutter pub upgrade
   ```

## Konfigurasi API URL

API URL perlu dikonfigurasi agar aplikasi dapat terhubung ke backend.

### Metode 1: Edit file konfigurasi

Buka file `lib/config/api_config.dart` dan ubah `baseUrl`:

```dart
class ApiConfig {
  static String baseUrl = 'https://domain-anda.com/api/v1';
  // ...
}
```

### Metode 2: Runtime configuration

Anda juga dapat mengubah URL saat runtime:

```dart
ApiConfig.updateBaseUrl('https://domain-anda.com/api/v1');
```

### Endpoint API yang diperlukan

Pastikan backend Anda menyediakan endpoint berikut:

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| GET | `/auth/profile` | Profil pengguna |
| POST | `/auth/logout` | Logout |
| GET | `/exams` | Daftar ujian |
| GET | `/exams/:id` | Detail ujian |
| POST | `/exams/:id/start` | Mulai ujian |
| GET | `/exams/:id/questions` | Daftar pertanyaan |
| POST | `/exams/:id/answer` | Kirim jawaban |
| POST | `/exams/:id/submit` | Kumpulkan ujian |
| GET | `/exams/:id/result` | Hasil ujian |
| GET | `/proctor/sessions` | Sesi pengawasan |
| GET | `/proctor/sessions/:id/monitor` | Data monitoring |
| POST | `/proctor/violations` | Laporkan pelanggaran |
| GET | `/proctor/violations` | Daftar pelanggaran |

## Menjalankan di Android

1. Pastikan emulator Android berjalan atau perangkat terhubung:
   ```bash
   flutter devices
   ```

2. Jalankan aplikasi:
   ```bash
   flutter run
   ```

3. Untuk menjalankan dengan mode release:
   ```bash
   flutter run --release
   ```

### Menjalankan di Emulator Android

1. Buka Android Studio
2. Klik **Device Manager**
3. Buat atau jalankan emulator (rekomendasi: Pixel 6, API 33)
4. Jalankan `flutter run`

## Menjalankan di iOS (Hanya macOS)

1. Install CocoaPods dependencies:
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. Jalankan di simulator:
   ```bash
   flutter run
   ```

3. Untuk perangkat fisik, diperlukan akun Apple Developer

## Build untuk Produksi

### Android APK

```bash
flutter build apk --release
```

File output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (Rekomendasi untuk Play Store)

```bash
flutter build appbundle --release
```

File output: `build/app/outputs/bundle/release/app-release.aab`

### iOS (Hanya macOS)

```bash
flutter build ios --release
```

Kemudian upload melalui Xcode ke App Store Connect.

## Struktur Project

```
ujianku-mobile/
├── pubspec.yaml              # Dependencies dan konfigurasi
├── lib/
│   ├── main.dart             # Titik masuk aplikasi
│   ├── app.dart              # Widget utama aplikasi
│   ├── config/               # Konfigurasi (tema, API, rute)
│   ├── models/               # Model data
│   ├── services/             # Layanan API dan penyimpanan
│   ├── providers/            # State management (Provider)
│   ├── screens/              # Halaman UI
│   │   ├── siswa/            # Halaman siswa
│   │   └── pengawas/         # Halaman pengawas
│   ├── widgets/              # Widget reusable
│   └── utils/                # Utilitas dan konstanta
```

## Fitur Utama

### Siswa
- Melihat daftar ujian
- Mengerjakan ujian dengan anti-cheat
- Melihat hasil ujian
- Profil dan pengaturan

### Pengawas
- Monitoring real-time siswa
- Deteksi pelanggaran
- Aksi terhadap siswa (peringatkan, diskualifikasi)
- Laporan sesi

## Troubleshooting

### Error: `flutter command not found`
Pastikan Flutter SDK sudah ditambahkan ke PATH.

### Error: `Could not resolve dependencies`
Jalankan `flutter pub get` atau `flutter pub upgrade`.

### Error: `No connected devices`
Pastikan emulator berjalan atau perangkat fisik terhubung. Jalankan `flutter devices` untuk melihat daftar perangkat.

### Error: Koneksi API gagal
- Periksa URL API di `lib/config/api_config.dart`
- Pastikan backend berjalan dan dapat diakses
- Periksa koneksi internet perangkat/emulator

## Catatan Penting

- Semua teks UI dalam **Bahasa Indonesia**
- Aplikasi menggunakan **Provider** untuk state management
- Navigasi menggunakan **GoRouter**
- Anti-cheat mendeteksi perpindahan aplikasi dan screenshot
- Token autentikasi disimpan di **SharedPreferences**
