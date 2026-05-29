import '../config/api_config.dart';
import '../models/user.dart';
import 'api_service.dart';
import 'storage_service.dart';

/// Layanan autentikasi untuk login, logout, dan manajemen sesi
class AuthService {
  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();

  /// Login dengan email dan password
  Future<AuthResult> login({
    required String email,
    required String password,
    String? role,
  }) async {
    final response = await _api.post(
      ApiConfig.login,
      body: {
        'email': email,
        'password': password,
      },
    );

    if (response.success) {
      final data = response.body as Map<String, dynamic>?;

      // Simpan token
      final token = data?['token'] as String? ?? '';
      await _storage.saveToken(token);

      // Simpan data pengguna
      final userData = data?['user'] as Map<String, dynamic>? ?? {};
      final user = User.fromJson(userData);
      await _storage.saveUser(user);

      // Simpan role dari data user yang dikembalikan API
      final userRole = user.role.toLowerCase();
      await _storage.saveRole(userRole);

      return AuthResult(
        success: true,
        user: user,
        token: token,
        message: response.message,
      );
    }

    return AuthResult(
      success: false,
      message: response.message,
    );
  }

  /// Logout dan hapus sesi
  Future<void> logout() async {
    // Hapus data lokal saja (API tidak punya endpoint logout)
    await _storage.clearAll();
  }

  /// Mendapatkan profil pengguna saat ini
  Future<User?> getCurrentUser() async {
    // Coba dari penyimpanan lokal dulu
    final localUser = await _storage.getUser();
    if (localUser != null) return localUser;

    // Jika tidak ada, ambil dari API
    final response = await _api.get(ApiConfig.me);
    if (response.success && response.body != null) {
      final user = User.fromJson(response.body as Map<String, dynamic>);
      await _storage.saveUser(user);
      return user;
    }
    return null;
  }

  /// Memperbarui profil pengguna
  Future<AuthResult> updateProfile({required Map<String, dynamic> data}) async {
    final response = await _api.put('/siswa/profile', body: data);

    if (response.success && response.body != null) {
      final user = User.fromJson(response.body as Map<String, dynamic>);
      await _storage.saveUser(user);
      return AuthResult(
        success: true,
        user: user,
        message: response.message,
      );
    }

    return AuthResult(
      success: false,
      message: response.message,
    );
  }

  /// Cek apakah pengguna sudah login
  Future<bool> isLoggedIn() async {
    final token = await _storage.getToken();
    return token != null && token.isNotEmpty;
  }

  /// Mendapatkan role pengguna saat ini
  Future<String?> getCurrentRole() async {
    return await _storage.getRole();
  }

  /// Memperbarui token (re-login)
  Future<bool> refreshToken() async {
    // API tidak punya endpoint refresh token, hapus sesi dan minta login ulang
    await _storage.clearAll();
    return false;
  }
}

/// Hasil operasi autentikasi
class AuthResult {
  final bool success;
  final User? user;
  final String? token;
  final String message;

  const AuthResult({
    required this.success,
    this.user,
    this.token,
    this.message = '',
  });
}
