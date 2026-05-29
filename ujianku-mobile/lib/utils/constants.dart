/// Konstanta aplikasi UjianKu
class AppConstants {
  AppConstants._();

  /// Nama aplikasi
  static const String appName = 'UjianKu';

  /// Versi aplikasi
  static const String appVersion = '1.0.0';

  /// Deskripsi aplikasi
  static const String appDescription = 'Platform Ujian Online';

  /// Durasi splash screen dalam milidetik
  static const int splashDuration = 2500;

  /// Jumlah maksimal pelanggaran sebelum diskualifikasi
  static const int maxViolations = 3;

  /// Durasi polling monitoring dalam detik
  static const int monitoringPollInterval = 5;

  /// Durasi idle sebelum dianggap tidak aktif (dalam menit)
  static const int idleTimeoutMinutes = 5;

  /// Nama penyimpanan lokal
  static const String storageKey = 'ujianku_storage';

  /// Maksimal ukuran file upload (dalam MB)
  static const int maxUploadSizeMB = 10;

  // === Teks UI ===

  /// Teks untuk berbagai status
  static const String textLogin = 'Masuk';
  static const String textLogout = 'Keluar';
  static const String textRegister = 'Daftar';
  static const String textSave = 'Simpan';
  static const String textCancel = 'Batal';
  static const String textConfirm = 'Konfirmasi';
  static const String textDelete = 'Hapus';
  static const String textEdit = 'Edit';
  static const String textClose = 'Tutup';
  static const String textRetry = 'Coba Lagi';
  static const String textLoading = 'Memuat...';
  static const String textNoData = 'Tidak ada data';
  static const String textError = 'Terjadi kesalahan';
  static const String textSuccess = 'Berhasil';
  static const String textWarning = 'Peringatan';
  static const String textSubmit = 'Kumpulkan';
  static const String textStartExam = 'Mulai Ujian';
  static const String textEndSession = 'Akhiri Sesi';

  // === Pesan Error ===

  static const String errorNetwork = 'Tidak dapat terhubung ke server';
  static const String errorTimeout = 'Waktu koneksi habis';
  static const String errorUnauthorized = 'Sesi telah berakhir, silakan login kembali';
  static const String errorServer = 'Terjadi kesalahan pada server';
  static const String errorUnknown = 'Terjadi kesalahan yang tidak diketahui';

  // === Validasi ===

  static const int minPasswordLength = 8;
  static const int tokenLength = 6;

  // === Rute ===
  // Catatan: Aplikasi mobile hanya mendukung role Siswa dan Pengawas.
  // Admin dan Guru harus login melalui website UjianKu.

  static const String routeSplash = '/';
  static const String routeLogin = '/login';
  static const String routeSiswaHome = '/siswa';
  static const String routePengawasHome = '/pengawas';
}
