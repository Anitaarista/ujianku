import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/answer.dart';
import '../../config/api_config.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../utils/helpers.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';

/// Halaman profil siswa
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _api = ApiService();
  bool _isLoadingStats = true;
  int _totalExams = 0;
  double _averageScore = 0.0;
  int _bestScore = 0;
  bool _notifications = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final response = await _api.get(ApiConfig.siswaResults);
      if (response.success && response.listBody != null) {
        final results = response.listBody!
            .map((e) => ExamResult.fromJson(e as Map<String, dynamic>))
            .toList();
        setState(() {
          _totalExams = results.length;
          if (results.isNotEmpty) {
            _averageScore = results
                    .map((r) => r.totalScore)
                    .reduce((a, b) => a + b) /
                results.length;
            _bestScore = results
                .map((r) => r.totalScore.round())
                .reduce((a, b) => a > b ? a : b);
          }
        });
      }
    } catch (_) {}
    setState(() => _isLoadingStats = false);
  }

  Future<void> _refreshProfile() async {
    await context.read<AuthProvider>().checkAuth();
    await _loadStats();
  }

  void _showEditProfileDialog() {
    final user = context.read<AuthProvider>().user;
    final nameController = TextEditingController(text: user?.name ?? '');
    final emailController = TextEditingController(text: user?.email ?? '');
    final nisnController = TextEditingController(text: user?.nisn ?? '');
    final schoolController = TextEditingController(text: user?.school ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Edit Profil'),
        content: SingleChildScrollView(
          child: SizedBox(
            width: MediaQuery.of(context).size.width * 0.85,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Lengkap',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  enabled: false, // Email usually can't be changed
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nisnController,
                  decoration: const InputDecoration(
                    labelText: 'NISN',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: schoolController,
                  decoration: const InputDecoration(
                    labelText: 'Sekolah',
                    prefixIcon: Icon(Icons.school_outlined),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final data = <String, dynamic>{};
              if (nameController.text.isNotEmpty) {
                data['name'] = nameController.text;
              }
              if (nisnController.text.isNotEmpty) {
                data['nisn'] = nisnController.text;
              }
              if (schoolController.text.isNotEmpty) {
                data['school'] = schoolController.text;
              }

              if (data.isNotEmpty) {
                final success = await this
                    .context
                    .read<AuthProvider>()
                    .updateProfile(data);
                if (this.mounted) {
                  ScaffoldMessenger.of(this.context).showSnackBar(
                    SnackBar(
                      content: Text(success
                          ? 'Profil berhasil diperbarui'
                          : 'Gagal memperbarui profil'),
                      backgroundColor:
                          success ? AppTheme.success : AppTheme.error,
                    ),
                  );
                }
              }
            },
            style:
                ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Keluar dari Akun?'),
        content:
            const Text('Anda akan keluar dari akun dan harus login kembali.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await this.context.read<AuthProvider>().logout();
              if (mounted) {
                this.context.go('/login');
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: _showEditProfileDialog,
            tooltip: 'Edit Profil',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshProfile,
        color: AppTheme.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Kartu profil
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    // Avatar with initials
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: Colors.white.withValues(alpha: 0.2),
                      child: Text(
                        user?.initials ?? 'S',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Nama
                    Text(
                      user?.name ?? 'Siswa',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    // Email
                    Text(
                      user?.email ?? '',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Badge role
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.school,
                              color: Colors.white, size: 16),
                          const SizedBox(width: 6),
                          Text(
                            user?.className ?? 'Siswa',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Info siswa
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Informasi Siswa',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (user?.nisn != null)
                      _ProfileInfoRow(
                        icon: Icons.badge_outlined,
                        label: 'NISN',
                        value: user!.nisn!,
                      ),
                    if (user?.className != null)
                      _ProfileInfoRow(
                        icon: Icons.class_outlined,
                        label: 'Kelas',
                        value: user!.className!,
                      ),
                    if (user?.school != null)
                      _ProfileInfoRow(
                        icon: Icons.school_outlined,
                        label: 'Sekolah',
                        value: user!.school!,
                      ),
                    _ProfileInfoRow(
                      icon: Icons.email_outlined,
                      label: 'Email',
                      value: user?.email ?? '-',
                    ),
                    _ProfileInfoRow(
                      icon: Icons.calendar_today_outlined,
                      label: 'Bergabung',
                      value: user?.createdAt != null
                          ? Helpers.formatDate(user!.createdAt!)
                          : '-',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Statistik belajar
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Statistik Belajar',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _isLoadingStats
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(16),
                              child: CircularProgressIndicator(
                                  color: AppTheme.primary),
                            ),
                          )
                        : Row(
                            children: [
                              _StatItem(
                                icon: Icons.check_circle_outline,
                                label: 'Ujian Selesai',
                                value: '$_totalExams',
                                color: AppTheme.success,
                              ),
                              const SizedBox(width: 12),
                              _StatItem(
                                icon: Icons.bar_chart_outlined,
                                label: 'Rata-rata',
                                value: _averageScore > 0
                                    ? _averageScore.toStringAsFixed(0)
                                    : '-',
                                color: AppTheme.primary,
                              ),
                              const SizedBox(width: 12),
                              _StatItem(
                                icon: Icons.emoji_events_outlined,
                                label: 'Nilai Tertinggi',
                                value: _bestScore > 0
                                    ? '$_bestScore'
                                    : '-',
                                color: AppTheme.accent,
                              ),
                            ],
                          ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Pengaturan
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Pengaturan',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      title: const Text('Notifikasi'),
                      subtitle: const Text('Terima notifikasi ujian'),
                      value: _notifications,
                      onChanged: (value) {
                        setState(() => _notifications = value);
                      },
                      contentPadding: EdgeInsets.zero,
                      activeColor: AppTheme.primary,
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.info_outline,
                          color: AppTheme.textSecondary),
                      title: const Text('Versi Aplikasi'),
                      trailing: Text(
                        AppConstants.appVersion,
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      contentPadding: EdgeInsets.zero,
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.privacy_tip_outlined,
                          color: AppTheme.textSecondary),
                      title: const Text('Kebijakan Privasi'),
                      trailing: const Icon(Icons.chevron_right,
                          color: AppTheme.textHint),
                      contentPadding: EdgeInsets.zero,
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Halaman kebijakan privasi segera hadir')),
                        );
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.help_outline,
                          color: AppTheme.textSecondary),
                      title: const Text('Bantuan'),
                      trailing: const Icon(Icons.chevron_right,
                          color: AppTheme.textHint),
                      contentPadding: EdgeInsets.zero,
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Halaman bantuan segera hadir')),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Tombol logout
              CustomButton(
                text: 'Keluar',
                icon: Icons.logout,
                variant: CustomButtonVariant.danger,
                isFullWidth: true,
                size: CustomButtonSize.large,
                onPressed: () => _showLogoutDialog(context),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

/// Baris info profil
class _ProfileInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ProfileInfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.textSecondary),
          const SizedBox(width: 12),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
            ),
          ),
          const Spacer(),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

/// Item statistik
class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
