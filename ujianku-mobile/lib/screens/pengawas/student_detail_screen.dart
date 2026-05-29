import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/proctor_provider.dart';
import '../../models/proctor_session.dart';
import '../../models/violation.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';

/// Halaman detail siswa dalam sesi pengawasan
class StudentDetailScreen extends StatefulWidget {
  final String sessionId;
  final String studentId;

  const StudentDetailScreen({
    super.key,
    required this.sessionId,
    required this.studentId,
  });

  @override
  State<StudentDetailScreen> createState() => _StudentDetailScreenState();
}

class _StudentDetailScreenState extends State<StudentDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProctorProvider>().getStudentDetail(
            sessionId: widget.sessionId,
            studentId: widget.studentId,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final proctorProvider = context.watch<ProctorProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Siswa'),
      ),
      body: proctorProvider.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _buildContent(proctorProvider),
    );
  }

  Widget _buildContent(ProctorProvider proctorProvider) {
    // Data placeholder (dalam implementasi nyata, dari proctorProvider)
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Kartu info siswa
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1e293b), Color(0xFF334155)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: Colors.white.withValues(alpha: 0.15),
                  child: const Icon(Icons.person, color: Colors.white, size: 36),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Nama Siswa',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.circle, color: AppTheme.success, size: 8),
                      SizedBox(width: 8),
                      Text(
                        'Aktif',
                        style: TextStyle(
                          color: AppTheme.success,
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

          // Status koneksi
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Status Koneksi',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.wifi, color: AppTheme.success, size: 20),
                    const SizedBox(width: 8),
                    const Text('Terhubung'),
                    const Spacer(),
                    Text(
                      'Aktivitas terakhir: Baru saja',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.assignment, color: AppTheme.primary, size: 20),
                    const SizedBox(width: 8),
                    const Text('Progress'),
                    const Spacer(),
                    Text(
                      '15/30 soal (50%)',
                      style: TextStyle(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: const LinearProgressIndicator(
                    value: 0.5,
                    minHeight: 8,
                    backgroundColor: AppTheme.border,
                    valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Riwayat pelanggaran
          const Text(
            'Riwayat Pelanggaran',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ...List.generate(2, (index) {
            final violations = [
              ('Pindah Aplikasi', 'Siswa berpindah ke aplikasi lain', '10:30:15', ViolationSeverity.medium),
              ('Screenshot', 'Kemungkinan mengambil screenshot', '10:35:22', ViolationSeverity.low),
            ];
            final v = violations[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Color(v.$4 == ViolationSeverity.high
                        ? 0xFFef4444
                        : v.$4 == ViolationSeverity.medium
                            ? 0xFFf97316
                            : 0xFFf59e0b)
                    .withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Color(v.$4 == ViolationSeverity.high
                          ? 0xFFef4444
                          : v.$4 == ViolationSeverity.medium
                              ? 0xFFf97316
                              : 0xFFf59e0b)
                      .withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          v.$1,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        Text(
                          v.$2,
                          style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    v.$3,
                    style: TextStyle(color: AppTheme.textHint, fontSize: 12),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 32),

          // Aksi pengawas
          const Text(
            'Tindakan',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  text: 'Peringatkan',
                  icon: Icons.warning_amber,
                  variant: CustomButtonVariant.outline,
                  size: CustomButtonSize.small,
                  onPressed: () => _warnStudent(),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: CustomButton(
                  text: 'Diskualifikasi',
                  icon: Icons.block,
                  variant: CustomButtonVariant.danger,
                  size: CustomButtonSize.small,
                  onPressed: () => _disqualifyStudent(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          CustomButton(
            text: 'Izinkan Kembali',
            icon: Icons.check_circle_outline,
            variant: CustomButtonVariant.ghost,
            isFullWidth: true,
            size: CustomButtonSize.small,
            onPressed: () => _allowStudent(),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Future<void> _warnStudent() async {
    final success = await context.read<ProctorProvider>().warnStudent(
          sessionId: widget.sessionId,
          studentId: widget.studentId,
          message: 'Peringatan dari pengawas: Harap fokus pada ujian!',
        );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Peringatan terkirim' : 'Gagal mengirim peringatan'),
          backgroundColor: success ? AppTheme.success : AppTheme.error,
        ),
      );
    }
  }

  Future<void> _disqualifyStudent() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Diskualifikasi Siswa?'),
        content: const Text(
          'Tindakan ini tidak dapat dibatalkan. Siswa akan dikeluarkan dari ujian.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Diskualifikasi'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final success = await context.read<ProctorProvider>().disqualifyStudent(
            sessionId: widget.sessionId,
            studentId: widget.studentId,
            reason: 'Pelanggaran berulang',
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Siswa didiskualifikasi' : 'Gagal mendiskualifikasi'),
            backgroundColor: success ? AppTheme.success : AppTheme.error,
          ),
        );
        if (success) Navigator.pop(context);
      }
    }
  }

  Future<void> _allowStudent() async {
    final success = await context.read<ProctorProvider>().allowStudent(
          sessionId: widget.sessionId,
          studentId: widget.studentId,
        );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Siswa diizinkan kembali' : 'Gagal mengizinkan siswa'),
          backgroundColor: success ? AppTheme.success : AppTheme.error,
        ),
      );
    }
  }
}
