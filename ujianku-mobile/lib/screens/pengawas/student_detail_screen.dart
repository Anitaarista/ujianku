import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/proctor_provider.dart';
import '../../models/proctor_session.dart';
import '../../models/violation.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';

/// Halaman detail siswa dalam sesi pengawasan — data real dari API
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
  Timer? _refreshTimer;
  bool _isActionLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
      _startAutoRefresh();
    });
  }

  void _loadData() {
    context.read<ProctorProvider>().getStudentDetail(
          sessionId: widget.sessionId,
          studentId: widget.studentId,
        );
  }

  void _startAutoRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) _loadData();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final proctorProvider = context.watch<ProctorProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Siswa'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: proctorProvider.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primary))
          : proctorProvider.studentDetail == null
              ? _buildError(proctorProvider)
              : _buildContent(proctorProvider),
    );
  }

  Widget _buildError(ProctorProvider proctorProvider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.error),
            const SizedBox(height: 16),
            Text(
              proctorProvider.error ?? 'Gagal memuat data siswa',
              style:
                  const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Coba Lagi',
              variant: CustomButtonVariant.outline,
              onPressed: _loadData,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(ProctorProvider proctorProvider) {
    final student = proctorProvider.studentDetail!;
    final violations = proctorProvider.studentViolations;
    final statusColor = _getStatusColor(student.statusColor);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Kartu info siswa ──
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
                // Avatar
                CircleAvatar(
                  radius: 40,
                  backgroundColor: Colors.white.withValues(alpha: 0.15),
                  child: Text(
                    Helpers.getInitials(student.studentName),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 24,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  student.studentName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                // Status badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _getStatusLabel(student),
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                // Violation count
                if (student.violationCount > 0)
                  Text(
                    '${student.violationCount} pelanggaran tercatat',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 13,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ── Status koneksi & progress ──
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
                  'Status & Progress',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                ),
                const SizedBox(height: 14),
                // Connection status
                Row(
                  children: [
                    Icon(
                      student.connectionStatus == StudentConnectionStatus.active
                          ? Icons.wifi
                          : student.connectionStatus ==
                                  StudentConnectionStatus.idle
                              ? Icons.wifi_off
                              : Icons.signal_wifi_off,
                      color: student.connectionStatus ==
                              StudentConnectionStatus.active
                          ? AppTheme.success
                          : AppTheme.warning,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      student.connectionStatus ==
                              StudentConnectionStatus.active
                          ? 'Terhubung'
                          : student.connectionStatus ==
                                  StudentConnectionStatus.idle
                              ? 'Idle'
                              : 'Terputus',
                    ),
                    const Spacer(),
                    Text(
                      'Aktivitas terakhir: ${student.lastActivity != null ? Helpers.timeAgo(student.lastActivity!) : '-'}',
                      style: const TextStyle(
                          color: AppTheme.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Progress
                Row(
                  children: [
                    const Icon(Icons.assignment,
                        color: AppTheme.primary, size: 20),
                    const SizedBox(width: 8),
                    const Text('Progress'),
                    const Spacer(),
                    Text(
                      '${(student.progressPercentage * 100).toInt()}%',
                      style: const TextStyle(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: student.progressPercentage,
                    minHeight: 8,
                    backgroundColor: AppTheme.border,
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Riwayat pelanggaran ──
          Row(
            children: [
              const Text(
                'Riwayat Pelanggaran',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              if (violations.isNotEmpty)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${violations.length}',
                    style: const TextStyle(
                      color: AppTheme.error,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          if (violations.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.success.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppTheme.success.withValues(alpha: 0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_outline,
                      color: AppTheme.success, size: 24),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Tidak ada pelanggaran. Siswa mengerjakan ujian dengan jujur.',
                      style: TextStyle(
                          color: AppTheme.success,
                          fontSize: 13,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            )
          else
            ...violations.map((v) => _ViolationHistoryCard(violation: v)),

          const SizedBox(height: 32),

          // ── Tindakan pengawas ──
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
                  isLoading: _isActionLoading,
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
                  isLoading: _isActionLoading,
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
            isLoading: _isActionLoading,
            onPressed: () => _allowStudent(),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Color _getStatusColor(StudentStatusColor color) {
    switch (color) {
      case StudentStatusColor.green:
        return AppTheme.success;
      case StudentStatusColor.yellow:
        return AppTheme.warning;
      case StudentStatusColor.red:
        return AppTheme.error;
    }
  }

  String _getStatusLabel(StudentSessionStatus student) {
    if (student.connectionStatus == StudentConnectionStatus.disconnected) {
      return 'Terputus';
    }
    if (student.violationCount >= 2) {
      return 'Diskualifikasi';
    }
    if (student.violationCount == 1) {
      return 'Peringatan';
    }
    return 'Aktif';
  }

  Future<void> _warnStudent() async {
    setState(() => _isActionLoading = true);
    final success = await context.read<ProctorProvider>().warnStudent(
          sessionId: widget.sessionId,
          studentId: widget.studentId,
          message: 'Peringatan dari pengawas: Harap fokus pada ujian!',
        );
    if (mounted) {
      setState(() => _isActionLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              Text(success ? 'Peringatan terkirim' : 'Gagal mengirim peringatan'),
          backgroundColor: success ? AppTheme.success : AppTheme.error,
        ),
      );
      if (success) _loadData();
    }
  }

  Future<void> _disqualifyStudent() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.block, color: AppTheme.error, size: 24),
            const SizedBox(width: 8),
            const Text('Diskualifikasi Siswa?'),
          ],
        ),
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
            style:
                ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Diskualifikasi'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      setState(() => _isActionLoading = true);
      final success =
          await context.read<ProctorProvider>().disqualifyStudent(
                sessionId: widget.sessionId,
                studentId: widget.studentId,
                reason: 'Pelanggaran berulang',
              );
      if (mounted) {
        setState(() => _isActionLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                success ? 'Siswa didiskualifikasi' : 'Gagal mendiskualifikasi'),
            backgroundColor: success ? AppTheme.success : AppTheme.error,
          ),
        );
        if (success) _loadData();
      }
    }
  }

  Future<void> _allowStudent() async {
    setState(() => _isActionLoading = true);
    final success = await context.read<ProctorProvider>().allowStudent(
          sessionId: widget.sessionId,
          studentId: widget.studentId,
        );
    if (mounted) {
      setState(() => _isActionLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              success ? 'Siswa diizinkan kembali' : 'Gagal mengizinkan siswa'),
          backgroundColor: success ? AppTheme.success : AppTheme.error,
        ),
      );
      if (success) _loadData();
    }
  }
}

/// Kartu riwayat pelanggaran
class _ViolationHistoryCard extends StatelessWidget {
  final Violation violation;
  const _ViolationHistoryCard({required this.violation});

  @override
  Widget build(BuildContext context) {
    final severityColor = Color(violation.severityColor);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: severityColor.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: severityColor.withValues(alpha: 0.25),
        ),
      ),
      child: Row(
        children: [
          // Icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: severityColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                violation.typeIcon,
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        violation.typeLabel,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: severityColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        violation.severityLabel,
                        style: TextStyle(
                          color: severityColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  violation.description,
                  style: const TextStyle(
                      color: AppTheme.textSecondary, fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),

          // Time
          const SizedBox(width: 8),
          Text(
            violation.timeFormatted,
            style: const TextStyle(color: AppTheme.textHint, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
