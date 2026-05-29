import 'package:intl/intl.dart';

/// Fungsi pembantu untuk aplikasi UjianKu
class Helpers {
  Helpers._();

  /// Format tanggal dalam bahasa Indonesia
  static String formatDate(DateTime date) {
    final months = [
      '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return '${date.day} ${months[date.month]} ${date.year}';
  }

  /// Format tanggal singkat
  static String formatDateShort(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  /// Format waktu (HH:mm)
  static String formatTime(DateTime date) {
    return DateFormat('HH:mm').format(date);
  }

  /// Format tanggal dan waktu lengkap
  static String formatDateTime(DateTime date) {
    return '${formatDate(date)} ${formatTime(date)}';
  }

  /// Format durasi dari menit ke string
  static String formatDuration(int minutes) {
    if (minutes < 60) return '$minutes menit';
    final hours = minutes ~/ 60;
    final remainingMinutes = minutes % 60;
    if (remainingMinutes == 0) return '$hours jam';
    return '$hours jam $remainingMinutes menit';
  }

  /// Format durasi dari detik ke string (untuk countdown timer)
  static String formatCountdown(int totalSeconds) {
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;

    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:'
          '${minutes.toString().padLeft(2, '0')}:'
          '${seconds.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
  }

  /// Format angka dengan pemisah ribuan
  static String formatNumber(double number) {
    return NumberFormat.decimalPattern('id_ID').format(number);
  }

  /// Format persentase
  static String formatPercentage(double value) {
    return '${value.toStringAsFixed(1)}%';
  }

  /// Inisial nama untuk avatar
  static String getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  /// Warna berdasarkan skor
  static int getScoreColor(double score) {
    if (score >= 80) return 0xFF22c55e; // Hijau
    if (score >= 60) return 0xFFf59e0b; // Kuning
    return 0xFFef4444; // Merah
  }

  /// Label grade berdasarkan skor
  static String getGradeLabel(double score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  }

  /// Warna status ujian
  static int getExamStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'ongoing':
      case 'berlangsung':
        return 0xFF10b981; // Emerald
      case 'completed':
      case 'selesai':
        return 0xFF64748b; // Slate
      default:
        return 0xFFf59e0b; // Amber (upcoming)
    }
  }

  /// Warna tingkat keparahan pelanggaran
  static int getViolationColor(int count) {
    if (count >= 2) return 0xFFef4444; // Merah
    if (count == 1) return 0xFFf59e0b; // Kuning
    return 0xFF22c55e; // Hijau
  }

  /// Validasi email
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  /// Validasi password (minimal 8 karakter)
  static bool isValidPassword(String password) {
    return password.length >= 8;
  }

  /// Truncate teks jika terlalu panjang
  static String truncate(String text, {int maxLength = 50}) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }

  /// Relatif waktu (contoh: "5 menit yang lalu")
  static String timeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays} hari yang lalu';
    }
    if (difference.inHours > 0) {
      return '${difference.inHours} jam yang lalu';
    }
    if (difference.inMinutes > 0) {
      return '${difference.inMinutes} menit yang lalu';
    }
    return 'Baru saja';
  }

  /// Salam berdasarkan waktu
  static String getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }
}
