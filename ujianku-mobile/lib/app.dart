import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'providers/exam_provider.dart';
import 'providers/proctor_provider.dart';
import 'services/storage_service.dart';

/// Aplikasi utama UjianKu
class UjianKuApp extends StatefulWidget {
  const UjianKuApp({super.key});

  @override
  State<UjianKuApp> createState() => _UjianKuAppState();
}

class _UjianKuAppState extends State<UjianKuApp> {
  final StorageService _storage = StorageService();
  late GoRouter _router;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    // Inisialisasi storage
    await _storage.init();

    // Cek status autentikasi
    final isLoggedIn = await _storage.getToken() != null;
    final role = await _storage.getRole();

    String initialLocation;
    if (isLoggedIn && role != null) {
      switch (role.toLowerCase()) {
        case 'admin':
          initialLocation = '/admin';
          break;
        case 'guru':
          initialLocation = '/guru';
          break;
        case 'pengawas':
          initialLocation = '/pengawas';
          break;
        case 'siswa':
        default:
          initialLocation = '/siswa';
          break;
      }
    } else {
      initialLocation = '/';
    }

    _router = AppRoutes.createRouter(initialLocation: initialLocation);

    setState(() => _isInitialized = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          body: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary, AppTheme.primaryDark],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.school, color: Colors.white, size: 56),
                  SizedBox(height: 16),
                  CircularProgressIndicator(color: Colors.white),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ExamProvider()),
        ChangeNotifierProvider(create: (_) => ProctorProvider()),
      ],
      child: Builder(
        builder: (context) {
          return MaterialApp.router(
            debugShowCheckedModeBanner: false,
            title: 'UjianKu',
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.system,
            routerConfig: _router,
            builder: (context, child) {
              // Inisialisasi auth provider
              WidgetsBinding.instance.addPostFrameCallback((_) {
                context.read<AuthProvider>().checkAuth();
              });
              return child ?? const SizedBox.shrink();
            },
          );
        },
      ),
    );
  }
}
