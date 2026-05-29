import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

/// Layanan penyimpanan lokal menggunakan SharedPreferences
class StorageService {
  static final StorageService _singleton = StorageService._internal();
  factory StorageService() => _singleton;
  StorageService._internal();

  SharedPreferences? _prefs;

  /// Inisialisasi SharedPreferences
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  /// Memastikan _prefs sudah diinisialisasi
  SharedPreferences get _prefsInstance {
    if (_prefs == null) {
      throw Exception('StorageService belum diinisialisasi. Panggil init() terlebih dahulu.');
    }
    return _prefs!;
  }

  // === Kunci Penyimpanan ===
  static const String _keyToken = 'auth_token';
  static const String _keyUser = 'user_data';
  static const String _keyRole = 'user_role';
  static const String _keyDarkMode = 'dark_mode';
  static const String _keyNotifications = 'notifications_enabled';
  static const String _keyLastExamId = 'last_exam_id';
  static const String _keyOnboardingDone = 'onboarding_done';

  // === Token Autentikasi ===

  /// Simpan token autentikasi
  Future<bool> saveToken(String token) async {
    return await _prefsInstance.setString(_keyToken, token);
  }

  /// Ambil token autentikasi
  Future<String?> getToken() async {
    return _prefsInstance.getString(_keyToken);
  }

  /// Hapus token autentikasi
  Future<bool> removeToken() async {
    return await _prefsInstance.remove(_keyToken);
  }

  // === Data Pengguna ===

  /// Simpan data pengguna
  Future<bool> saveUser(User user) async {
    final userJson = jsonEncode(user.toJson());
    return await _prefsInstance.setString(_keyUser, userJson);
  }

  /// Ambil data pengguna
  Future<User?> getUser() async {
    final userJson = _prefsInstance.getString(_keyUser);
    if (userJson == null) return null;
    try {
      final userData = jsonDecode(userJson) as Map<String, dynamic>;
      return User.fromJson(userData);
    } catch (_) {
      return null;
    }
  }

  /// Hapus data pengguna
  Future<bool> removeUser() async {
    return await _prefsInstance.remove(_keyUser);
  }

  // === Role Pengguna ===

  /// Simpan role pengguna
  Future<bool> saveRole(String role) async {
    return await _prefsInstance.setString(_keyRole, role);
  }

  /// Ambil role pengguna
  Future<String?> getRole() async {
    return _prefsInstance.getString(_keyRole);
  }

  // === Pengaturan ===

  /// Simpan pengaturan mode gelap
  Future<bool> saveDarkMode(bool isDarkMode) async {
    return await _prefsInstance.setBool(_keyDarkMode, isDarkMode);
  }

  /// Ambil pengaturan mode gelap
  Future<bool> getDarkMode() async {
    return _prefsInstance.getBool(_keyDarkMode) ?? false;
  }

  /// Simpan pengaturan notifikasi
  Future<bool> saveNotificationsEnabled(bool enabled) async {
    return await _prefsInstance.setBool(_keyNotifications, enabled);
  }

  /// Ambil pengaturan notifikasi
  Future<bool> getNotificationsEnabled() async {
    return _prefsInstance.getBool(_keyNotifications) ?? true;
  }

  // === Data Lain ===

  /// Simpan ID ujian terakhir
  Future<bool> saveLastExamId(String examId) async {
    return await _prefsInstance.setString(_keyLastExamId, examId);
  }

  /// Ambil ID ujian terakhir
  Future<String?> getLastExamId() async {
    return _prefsInstance.getString(_keyLastExamId);
  }

  /// Simpan status onboarding selesai
  Future<bool> saveOnboardingDone() async {
    return await _prefsInstance.setBool(_keyOnboardingDone, true);
  }

  /// Cek apakah onboarding sudah selesai
  Future<bool> isOnboardingDone() async {
    return _prefsInstance.getBool(_keyOnboardingDone) ?? false;
  }

  // === Bersihkan Data ===

  /// Hapus semua data tersimpan
  Future<void> clearAll() async {
    await _prefsInstance.remove(_keyToken);
    await _prefsInstance.remove(_keyUser);
    await _prefsInstance.remove(_keyRole);
    await _prefsInstance.remove(_keyLastExamId);
    // Pertahankan pengaturan dan onboarding
  }

  /// Hapus semua data termasuk pengaturan
  Future<void> clearAllData() async {
    await _prefsInstance.clear();
  }
}
