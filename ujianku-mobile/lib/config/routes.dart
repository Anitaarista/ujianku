import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../screens/splash_screen.dart';
import '../screens/login_screen.dart';
import '../screens/siswa/home_screen.dart';
import '../screens/siswa/exam_list_screen.dart';
import '../screens/siswa/exam_detail_screen.dart';
import '../screens/siswa/exam_take_screen.dart';
import '../screens/siswa/exam_result_screen.dart';
import '../screens/siswa/profile_screen.dart';
import '../screens/pengawas/home_screen.dart';
import '../screens/pengawas/monitoring_screen.dart';
import '../screens/pengawas/violation_list_screen.dart';
import '../screens/pengawas/student_detail_screen.dart';
import '../screens/pengawas/report_screen.dart';
import '../screens/admin/home_screen.dart';
import '../screens/guru/home_screen.dart';

/// Konfigurasi rute navigasi aplikasi UjianKu
class AppRoutes {
  // Nama rute
  static const String splash = '/';
  static const String login = '/login';

  // Rute Admin
  static const String adminHome = '/admin';

  // Rute Guru
  static const String guruHome = '/guru';

  // Rute Siswa
  static const String siswaHome = '/siswa';
  static const String siswaExamList = '/siswa/exams';
  static const String siswaExamDetail = '/siswa/exams/:id';
  static const String siswaExamTake = '/siswa/exams/:id/take';
  static const String siswaExamResult = '/siswa/exams/:id/result';
  static const String siswaProfile = '/siswa/profile';

  // Rute Pengawas
  static const String pengawasHome = '/pengawas';
  static const String pengawasMonitoring = '/pengawas/monitoring';
  static const String pengawasViolations = '/pengawas/violations';
  static const String pengawasStudentDetail =
      '/pengawas/sessions/:sessionId/students/:studentId';
  static const String pengawasReport = '/pengawas/sessions/:sessionId/report';

  /// Membuat GoRouter dengan semua rute terdefinisi
  static GoRouter createRouter({required String initialLocation}) {
    return GoRouter(
      initialLocation: initialLocation,
      debugLogDiagnostics: true,
      routes: [
        GoRoute(
          path: splash,
          builder: (context, state) => const SplashScreen(),
        ),
        GoRoute(
          path: login,
          builder: (context, state) => const LoginScreen(),
        ),

        // === Rute Admin ===
        ShellRoute(
          builder: (context, state, child) {
            return AdminShell(child: child);
          },
          routes: [
            GoRoute(
              path: '/admin',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: AdminHomeScreen(),
              ),
            ),
            GoRoute(
              path: '/admin/users',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: AdminUsersScreen(),
              ),
            ),
            GoRoute(
              path: '/admin/settings',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: AdminSettingsScreen(),
              ),
            ),
          ],
        ),

        // === Rute Guru ===
        ShellRoute(
          builder: (context, state, child) {
            return GuruShell(child: child);
          },
          routes: [
            GoRoute(
              path: '/guru',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: GuruHomeScreen(),
              ),
            ),
            GoRoute(
              path: '/guru/bank-soal',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: GuruBankSoalScreen(),
              ),
            ),
            GoRoute(
              path: '/guru/exams',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: GuruExamsScreen(),
              ),
            ),
            GoRoute(
              path: '/guru/results',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: GuruResultsScreen(),
              ),
            ),
          ],
        ),

        // === Rute Siswa ===
        ShellRoute(
          builder: (context, state, child) {
            return SiswaShell(child: child);
          },
          routes: [
            GoRoute(
              path: '/siswa',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: SiswaHomeScreen(),
              ),
            ),
            GoRoute(
              path: '/siswa/exams',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ExamListScreen(),
              ),
            ),
            GoRoute(
              path: '/siswa/results',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ExamResultScreen(examId: 'latest'),
              ),
            ),
            GoRoute(
              path: '/siswa/profile',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ProfileScreen(),
              ),
            ),
          ],
        ),

        // Rute ujian siswa tanpa shell (layar penuh)
        GoRoute(
          path: '/siswa/exams/:id',
          builder: (context, state) {
            final examId = state.pathParameters['id']!;
            return ExamDetailScreen(examId: examId);
          },
        ),
        GoRoute(
          path: '/siswa/exams/:id/take',
          builder: (context, state) {
            final examId = state.pathParameters['id']!;
            return ExamTakeScreen(examId: examId);
          },
        ),
        GoRoute(
          path: '/siswa/exams/:id/result',
          builder: (context, state) {
            final examId = state.pathParameters['id']!;
            return ExamResultScreen(examId: examId);
          },
        ),

        // === Rute Pengawas ===
        ShellRoute(
          builder: (context, state, child) {
            return PengawasShell(child: child);
          },
          routes: [
            GoRoute(
              path: '/pengawas',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: PengawasHomeScreen(),
              ),
            ),
            GoRoute(
              path: '/pengawas/monitoring',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: MonitoringScreen(),
              ),
            ),
            GoRoute(
              path: '/pengawas/violations',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ViolationListScreen(),
              ),
            ),
            GoRoute(
              path: '/pengawas/reports',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ReportScreen(sessionId: ''),
              ),
            ),
          ],
        ),

        // Rute pengawas tanpa shell
        GoRoute(
          path: '/pengawas/sessions/:sessionId/students/:studentId',
          builder: (context, state) {
            final sessionId = state.pathParameters['sessionId']!;
            final studentId = state.pathParameters['studentId']!;
            return StudentDetailScreen(
              sessionId: sessionId,
              studentId: studentId,
            );
          },
        ),
        GoRoute(
          path: '/pengawas/sessions/:sessionId/report',
          builder: (context, state) {
            final sessionId = state.pathParameters['sessionId']!;
            return ReportScreen(sessionId: sessionId);
          },
        ),
      ],
    );
  }
}

/// Shell navigasi untuk Admin dengan bottom navigation bar
class AdminShell extends StatelessWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex(context),
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'Users',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            activeIcon: Icon(Icons.settings),
            label: 'Pengaturan',
          ),
        ],
      ),
    );
  }

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location == '/admin') return 0;
    if (location.contains('/admin/users')) return 1;
    if (location.contains('/admin/settings')) return 2;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/admin');
        break;
      case 1:
        context.go('/admin/users');
        break;
      case 2:
        context.go('/admin/settings');
        break;
    }
  }
}

/// Shell navigasi untuk Guru dengan bottom navigation bar
class GuruShell extends StatelessWidget {
  final Widget child;
  const GuruShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex(context),
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.library_books_outlined),
            activeIcon: Icon(Icons.library_books),
            label: 'Bank Soal',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Ujian',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart_outlined),
            activeIcon: Icon(Icons.bar_chart),
            label: 'Hasil',
          ),
        ],
      ),
    );
  }

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location == '/guru') return 0;
    if (location.contains('/guru/bank-soal')) return 1;
    if (location.contains('/guru/exams')) return 2;
    if (location.contains('/guru/results')) return 3;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/guru');
        break;
      case 1:
        context.go('/guru/bank-soal');
        break;
      case 2:
        context.go('/guru/exams');
        break;
      case 3:
        context.go('/guru/results');
        break;
    }
  }
}

/// Shell navigasi untuk Siswa dengan bottom navigation bar
class SiswaShell extends StatelessWidget {
  final Widget child;
  const SiswaShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex(context),
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Ujian',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart_outlined),
            activeIcon: Icon(Icons.bar_chart),
            label: 'Hasil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location == '/siswa') return 0;
    if (location.contains('/siswa/exams')) return 1;
    if (location.contains('/siswa/results')) return 2;
    if (location.contains('/siswa/profile')) return 3;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/siswa');
        break;
      case 1:
        context.go('/siswa/exams');
        break;
      case 2:
        context.go('/siswa/results');
        break;
      case 3:
        context.go('/siswa/profile');
        break;
    }
  }
}

/// Shell navigasi untuk Pengawas dengan bottom navigation bar
class PengawasShell extends StatelessWidget {
  final Widget child;
  const PengawasShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex(context),
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.monitor_outlined),
            activeIcon: Icon(Icons.monitor),
            label: 'Monitoring',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.warning_amber_outlined),
            activeIcon: Icon(Icons.warning),
            label: 'Pelanggaran',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assessment_outlined),
            activeIcon: Icon(Icons.assessment),
            label: 'Laporan',
          ),
        ],
      ),
    );
  }

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location == '/pengawas') return 0;
    if (location.contains('/pengawas/monitoring')) return 1;
    if (location.contains('/pengawas/violations')) return 2;
    if (location.contains('/pengawas/reports')) return 3;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/pengawas');
        break;
      case 1:
        context.go('/pengawas/monitoring');
        break;
      case 2:
        context.go('/pengawas/violations');
        break;
      case 3:
        context.go('/pengawas/reports');
        break;
    }
  }
}

// ============================================================
// Placeholder screens for Admin sub-routes
// ============================================================

/// Placeholder untuk Admin Users screen
class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _api = ApiService();
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _users = [];

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final response = await _api.get('/admin/users');
      if (response.success && response.listBody != null) {
        _users = (response.listBody!).map((e) => e as Map<String, dynamic>).toList();
      } else {
        _error = response.message;
      }
    } catch (e) {
      _error = 'Gagal memuat data: ${e.toString()}';
    }
    setState(() { _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manajemen Pengguna')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppTheme.textSecondary)),
                      const SizedBox(height: 12),
                      ElevatedButton(onPressed: _loadUsers, child: const Text('Coba Lagi')),
                    ],
                  ),
                )
              : _users.isEmpty
                  ? const Center(child: Text('Belum ada pengguna'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _users.length,
                      itemBuilder: (context, index) {
                        final user = _users[index];
                        final name = user['name'] ?? 'Tanpa Nama';
                        final email = user['email'] ?? '';
                        final role = (user['role'] ?? 'siswa').toString();

                        Color roleColor;
                        String roleLabel;
                        switch (role.toLowerCase()) {
                          case 'admin':
                            roleColor = AppTheme.accent;
                            roleLabel = 'Admin';
                            break;
                          case 'guru':
                            roleColor = const Color(0xFF8b5cf6);
                            roleLabel = 'Guru';
                            break;
                          case 'pengawas':
                            roleColor = AppTheme.primary;
                            roleLabel = 'Pengawas';
                            break;
                          default:
                            roleColor = AppTheme.secondary;
                            roleLabel = 'Siswa';
                        }

                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor: roleColor.withValues(alpha: 0.1),
                                  child: Text(
                                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                                    style: TextStyle(color: roleColor, fontWeight: FontWeight.w700),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                      Text(email, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: roleColor.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    roleLabel,
                                    style: TextStyle(color: roleColor, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}

/// Placeholder untuk Admin Settings screen
class AdminSettingsScreen extends StatelessWidget {
  const AdminSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.school_outlined),
              title: const Text('Pengaturan Sekolah'),
              subtitle: const Text('Kelola informasi sekolah'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Fitur segera hadir')),
                );
              },
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.security_outlined),
              title: const Text('Keamanan'),
              subtitle: const Text('Pengaturan keamanan sistem'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Fitur segera hadir')),
                );
              },
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.notifications_outlined),
              title: const Text('Notifikasi'),
              subtitle: const Text('Pengaturan notifikasi'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Fitur segera hadir')),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          Card(
            color: AppTheme.error.withValues(alpha: 0.05),
            child: ListTile(
              leading: const Icon(Icons.logout, color: AppTheme.error),
              title: const Text('Keluar', style: TextStyle(color: AppTheme.error)),
              subtitle: const Text('Logout dari akun admin'),
              onTap: () async {
                await context.read<AuthProvider>().logout();
                if (context.mounted) context.go('/login');
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// Placeholder screens for Guru sub-routes
// ============================================================

/// Placeholder untuk Guru Bank Soal screen
class GuruBankSoalScreen extends StatefulWidget {
  const GuruBankSoalScreen({super.key});

  @override
  State<GuruBankSoalScreen> createState() => _GuruBankSoalScreenState();
}

class _GuruBankSoalScreenState extends State<GuruBankSoalScreen> {
  final _api = ApiService();
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _bankSoal = [];

  @override
  void initState() {
    super.initState();
    _loadBankSoal();
  }

  Future<void> _loadBankSoal() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final response = await _api.get('/guru/bank-soal');
      if (response.success && response.listBody != null) {
        _bankSoal = (response.listBody!).map((e) => e as Map<String, dynamic>).toList();
      } else {
        _error = response.message;
      }
    } catch (e) {
      _error = 'Gagal memuat data: ${e.toString()}';
    }
    setState(() { _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bank Soal')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppTheme.textSecondary)),
                      const SizedBox(height: 12),
                      ElevatedButton(onPressed: _loadBankSoal, child: const Text('Coba Lagi')),
                    ],
                  ),
                )
              : _bankSoal.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.library_books_outlined, size: 64, color: AppTheme.textHint),
                          const SizedBox(height: 16),
                          const Text('Belum ada bank soal', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _bankSoal.length,
                      itemBuilder: (context, index) {
                        final item = _bankSoal[index];
                        final name = item['name'] ?? item['title'] ?? 'Bank Soal';
                        final subject = item['subject'] ?? item['subject_name'] ?? '';
                        final questionCount = item['total_soal'] ?? item['question_count'] ?? 0;

                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF8b5cf6).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.library_books, color: Color(0xFF8b5cf6)),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 2),
                                      Text(
                                        '$subject • $questionCount Soal',
                                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Fitur tambah soal segera hadir')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

/// Placeholder untuk Guru Exams screen
class GuruExamsScreen extends StatefulWidget {
  const GuruExamsScreen({super.key});

  @override
  State<GuruExamsScreen> createState() => _GuruExamsScreenState();
}

class _GuruExamsScreenState extends State<GuruExamsScreen> {
  final _api = ApiService();
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _exams = [];

  @override
  void initState() {
    super.initState();
    _loadExams();
  }

  Future<void> _loadExams() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final response = await _api.get('/guru/exams');
      if (response.success && response.listBody != null) {
        _exams = (response.listBody!).map((e) => e as Map<String, dynamic>).toList();
      } else {
        _error = response.message;
      }
    } catch (e) {
      _error = 'Gagal memuat data: ${e.toString()}';
    }
    setState(() { _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daftar Ujian')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppTheme.textSecondary)),
                      const SizedBox(height: 12),
                      ElevatedButton(onPressed: _loadExams, child: const Text('Coba Lagi')),
                    ],
                  ),
                )
              : _exams.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.assignment_outlined, size: 64, color: AppTheme.textHint),
                          const SizedBox(height: 16),
                          const Text('Belum ada ujian', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _exams.length,
                      itemBuilder: (context, index) {
                        final exam = _exams[index];
                        final title = exam['title'] ?? exam['name'] ?? 'Ujian';
                        final subject = exam['subject'] ?? exam['subject_name'] ?? '';
                        final status = (exam['status'] ?? '').toString().toLowerCase();
                        final totalQ = exam['total_questions'] ?? exam['question_count'] ?? 0;

                        Color statusColor;
                        String statusLabel;
                        switch (status) {
                          case 'ongoing':
                          case 'active':
                            statusColor = AppTheme.success;
                            statusLabel = 'Berlangsung';
                            break;
                          case 'completed':
                            statusColor = AppTheme.secondary;
                            statusLabel = 'Selesai';
                            break;
                          case 'draft':
                            statusColor = AppTheme.textHint;
                            statusLabel = 'Draft';
                            break;
                          default:
                            statusColor = AppTheme.accent;
                            statusLabel = 'Terjadwal';
                        }

                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: statusColor.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(Icons.assignment, color: statusColor),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                                      Text(
                                        '$subject • $totalQ Soal',
                                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: statusColor.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    statusLabel,
                                    style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Fitur buat ujian segera hadir')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

/// Placeholder untuk Guru Results screen
class GuruResultsScreen extends StatelessWidget {
  const GuruResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hasil Ujian')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.bar_chart_outlined, size: 64, color: AppTheme.textHint),
            const SizedBox(height: 16),
            const Text(
              'Hasil Ujian',
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Fitur ini segera hadir',
              style: TextStyle(
                color: AppTheme.textHint,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
