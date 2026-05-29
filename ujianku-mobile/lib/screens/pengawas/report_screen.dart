import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/proctor_provider.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';

/// Halaman laporan sesi pengawasan
class ReportScreen extends StatefulWidget {
  final String sessionId;

  const ReportScreen({super.key, required this.sessionId});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  @override
  void initState() {
    super.initState();
    if (widget.sessionId.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<ProctorProvider>().loadSessionReport(widget.sessionId);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final proctorProvider = context.watch<ProctorProvider>();
    final report = proctorProvider.report;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan Sesi'),
        actions: [
          if (widget.sessionId.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.picture_as_pdf),
              onPressed: _exportPdf,
              tooltip: 'Ekspor PDF',
            ),
        ],
      ),
      body: widget.sessionId.isEmpty
          ? _buildNoSession()
          : proctorProvider.isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : report == null
                  ? _buildError()
                  : _buildReport(report),
    );
  }

  Widget _buildNoSession() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.assessment_outlined, size: 64, color: AppTheme.textHint),
            const SizedBox(height: 16),
            const Text(
              'Pilih sesi untuk melihat laporan',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Lihat Jadwal',
              variant: CustomButtonVariant.outline,
              onPressed: () => context.go('/pengawas'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.error),
            const SizedBox(height: 16),
            const Text(
              'Gagal memuat laporan',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Coba Lagi',
              variant: CustomButtonVariant.outline,
              onPressed: () => context
                  .read<ProctorProvider>()
                  .loadSessionReport(widget.sessionId),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReport(Map<String, dynamic> report) {
    // Data dari report (placeholder jika data belum ada dari API)
    final totalStudents = report['total_students'] as int? ?? 0;
    final completedStudents = report['completed_students'] as int? ?? 0;
    final activeStudents = report['active_students'] as int? ?? 0;
    final disqualifiedStudents = report['disqualified_students'] as int? ?? 0;
    final totalViolations = report['total_violations'] as int? ?? 0;
    final completionRate = report['completion_rate'] as double? ?? 0.0;
    final examTitle = report['exam_title'] as String? ?? 'Ujian';
    final subject = report['subject'] as String? ?? '';
    final className = report['class_name'] as String? ?? '';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ringkasan sesi
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ringkasan Sesi',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  examTitle,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '$subject - $className',
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Statistik utama
          const Text(
            'Statistik',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _ReportStatCard(
                label: 'Total Siswa',
                value: '$totalStudents',
                icon: Icons.people_outline,
                color: AppTheme.primary,
              ),
              const SizedBox(width: 12),
              _ReportStatCard(
                label: 'Selesai',
                value: '$completedStudents',
                icon: Icons.check_circle_outline,
                color: AppTheme.success,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _ReportStatCard(
                label: 'Aktif',
                value: '$activeStudents',
                icon: Icons.play_circle_outline,
                color: AppTheme.accent,
              ),
              const SizedBox(width: 12),
              _ReportStatCard(
                label: 'Diskualifikasi',
                value: '$disqualifiedStudents',
                icon: Icons.block,
                color: AppTheme.error,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Tingkat penyelesaian
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
                  'Tingkat Penyelesaian',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: completionRate / 100,
                          minHeight: 12,
                          backgroundColor: AppTheme.border,
                          valueColor:
                              const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      '${completionRate.toStringAsFixed(1)}%',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Pelanggaran
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: totalViolations > 0
                  ? AppTheme.error.withValues(alpha: 0.05)
                  : AppTheme.success.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: totalViolations > 0
                    ? AppTheme.error.withValues(alpha: 0.2)
                    : AppTheme.success.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  totalViolations > 0
                      ? Icons.warning_amber
                      : Icons.check_circle,
                  color: totalViolations > 0 ? AppTheme.error : AppTheme.success,
                  size: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Pelanggaran',
                        style: TextStyle(
                          color: totalViolations > 0
                              ? AppTheme.error
                              : AppTheme.success,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '$totalViolations pelanggaran tercatat',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '$totalViolations',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: totalViolations > 0 ? AppTheme.error : AppTheme.success,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Tombol aksi
          if (widget.sessionId.isNotEmpty) ...[
            CustomButton(
              text: 'Ekspor Laporan PDF',
              icon: Icons.picture_as_pdf,
              variant: CustomButtonVariant.outline,
              isFullWidth: true,
              onPressed: _exportPdf,
            ),
            const SizedBox(height: 12),
            CustomButton(
              text: 'Akhiri Sesi',
              icon: Icons.stop_circle,
              variant: CustomButtonVariant.danger,
              isFullWidth: true,
              onPressed: _endSession,
            ),
          ],
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  void _exportPdf() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Fitur ekspor PDF segera hadir'),
        backgroundColor: AppTheme.accent,
      ),
    );
  }

  Future<void> _endSession() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Akhiri Sesi Pengawasan?'),
        content: const Text(
          'Sesi akan diakhiri dan semua siswa yang masih mengerjakan ujian '
          'akan dikumpulkan otomatis. Tindakan ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Akhiri Sesi'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final success = await context
          .read<ProctorProvider>()
          .endSession(widget.sessionId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Sesi berhasil diakhiri' : 'Gagal mengakhiri sesi'),
            backgroundColor: success ? AppTheme.success : AppTheme.error,
          ),
        );
        if (success) context.go('/pengawas');
      }
    }
  }
}

/// Kartu statistik laporan
class _ReportStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _ReportStatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 24,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 12,
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
