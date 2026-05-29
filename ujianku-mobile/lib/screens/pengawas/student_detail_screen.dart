import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/proctor_provider.dart';
import '../../models/proctor_session.dart';
import '../../models/violation.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';

/// Halaman detail siswa — PRO-MAX UI/UX
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
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Detail Siswa',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: Color(0xFF1A1A2E),
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh, color: Colors.grey[700]),
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
            Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
            const SizedBox(height: 16),
            Text(
              proctorProvider.error ?? 'Gagal memuat data siswa',
              style: TextStyle(
                  color: Colors.grey[700], fontSize: 14, fontWeight: FontWeight.w500),
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
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: Colors.white.withValues(alpha: 0.15),
                  child: Text(
                    Helpers.getInitials(student.studentName),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
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
                    fontWeight: FontWeight.w800,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
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
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                if (student.violationCount > 0) ...[
                  const SizedBox(height: 8),
                  Text(
                    '${student.violationCount} pelanggaran tercatat',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 13,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Status koneksi & progress
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey[200]!),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Status & Progress',
                  style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      color: Color(0xFF1A1A2E)),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Icon(
                      student.connectionStatus ==
                              StudentConnectionStatus.active
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
                      style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1A2E)),
                    ),
                    const Spacer(),
                    Text(
                      'Aktivitas terakhir: ${student.lastActivity != null ? Helpers.timeAgo(student.lastActivity!) : '-'}',
                      style: TextStyle(
                          color: Colors.grey[600], fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.assignment,
                        color: AppTheme.primary, size: 20),
                    const SizedBox(width: 8),
                    const Text('Progress',
                        style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E))),
                    const Spacer(),
                    Text(
                      '${(student.progressPercentage * 100).toInt()}%',
                      style: const TextStyle(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w800,
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
                    backgroundColor: Colors.grey[200],
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Riwayat pelanggaran
          Row(
            children: [
              const Text(
                'Riwayat Pelanggaran',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1A1A2E)),
              ),
              const Spacer(),
              if (violations.isNotEmpty)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${violations.length}',
                    style: const TextStyle(
                      color: AppTheme.error,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
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
              child: Row(
                children: [
                  const Icon(Icons.check_circle_outline,
                      color: AppTheme.success, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Tidak ada pelanggaran. Siswa mengerjakan ujian dengan jujur.',
                      style: TextStyle(
                          color: AppTheme.success,
                          fontSize: 13,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            )
          else
            ...violations.map((v) => _ViolationHistoryCard(violation: v)),

          const SizedBox(height: 32),

          // Tindakan pengawas
          const Text(
            'Tindakan',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A1A2E)),
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
            Icon(Icons.block, color: Colors.red[700], size: 24),
            const SizedBox(width: 8),
            const Text('Diskualifikasi Siswa?',
                style: TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        content: Text(
          'Tindakan ini tidak dapat dibatalkan. Siswa akan dikeluarkan dari ujian.',
          style: TextStyle(color: Colors.grey[700]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Batal',
                style: TextStyle(
                    color: Colors.grey[600], fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style:
                ElevatedButton.styleFrom(backgroundColor: AppTheme.error),
            child: const Text('Diskualifikasi',
                style: TextStyle(fontWeight: FontWeight.w700)),
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: severityColor.withValues(alpha: 0.25),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: severityColor.withValues(alpha: 0.1),
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        violation.typeLabel,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, color: Color(0xFF1A1A2E)),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: severityColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        violation.severityLabel,
                        style: TextStyle(
                          color: severityColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  violation.description,
                  style: TextStyle(
                      color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.w400),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            violation.timeFormatted,
            style: TextStyle(color: Colors.grey[500], fontSize: 12),
          ),
        ],
      ),
    );
  }
}
