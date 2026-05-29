import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

/// Provider untuk mengelola state autentikasi
class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final StorageService _storage = StorageService();

  User? _user;
  bool _isLoading = false;
  bool _isLoggedIn = false;
  String? _error;
  String _selectedRole = 'siswa';

  // Getter
  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  String? get error => _error;
  String get selectedRole => _selectedRole;
  bool get isSiswa => _user?.isSiswa ?? _selectedRole == 'siswa';
  bool get isPengawas => _user?.isPengawas ?? _selectedRole == 'pengawas';

  /// Mengatur role yang dipilih di halaman login
  void setSelectedRole(String role) {
    _selectedRole = role;
    notifyListeners();
  }

  /// Cek status autentikasi saat aplikasi dimulai
  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final loggedIn = await _authService.isLoggedIn();
      if (loggedIn) {
        _user = await _authService.getCurrentUser();
        final role = await _storage.getRole();
        if (role != null) _selectedRole = role;
        _isLoggedIn = _user != null;
      } else {
        _isLoggedIn = false;
        _user = null;
      }
    } catch (e) {
      _isLoggedIn = false;
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Login dengan email dan password
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(
        email: email,
        password: password,
      );

      if (result.success) {
        _user = result.user;
        _isLoggedIn = true;
        _selectedRole = result.user?.role ?? _selectedRole;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result.message;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Terjadi kesalahan: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
    } catch (_) {}

    _user = null;
    _isLoggedIn = false;
    _isLoading = false;
    notifyListeners();
  }

  /// Memperbarui profil
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.updateProfile(data: data);
      if (result.success) {
        _user = result.user;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result.message;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Terjadi kesalahan: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Bersihkan error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Bersihkan user (untuk validasi role yang salah)
  void clearUser() {
    _user = null;
    _isLoggedIn = false;
    _storage.clearAll();
    notifyListeners();
  }
}
