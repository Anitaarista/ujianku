import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/proctor_provider.dart';
import '../../models/proctor_session.dart';
import '../../widgets/student_status_card.dart';
import '../../widgets/violation_alert_card.dart';
import '../../widgets/countdown_timer.dart';
import '../../utils/helpers.dart';

/// Halaman monitoring real-time pengawas
class MonitoringScreen extends StatefulWidget {
  const MonitoringScreen({super.key});

  @override
  State<MonitoringScreen> createState() => _MonitoringScreenState();
}

class _MonitoringScreenState extends State<MonitoringScreen> {
  ProctorSession? _selectedSession;
  Timer? _autoRefreshTimer;
  bool _isGridView = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final proctor = context.read<ProctorProvider>();
      if (proctor.activeSession != null) {
        _selectedSession = proctor.activeSession;
        proctor.startMonitoring(_selectedSession!.id);
        _startAutoRefresh();
      } else {
        proctor.loadSessions();
      }
    });
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (_selectedSession != null && mounted) {
        context.read<ProctorProvider>().startMonitoring(_selectedSession!.id);
      }
    });
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    context.read<ProctorProvider>().stopMonitoring();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final proctorProvider = context.watch<ProctorProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Monitoring Ujian'),
        actions: [
          // Timer sesi
          if (_selectedSession != null && _selectedSession!.isActive)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: MiniCountdownTimer(
                remainingSeconds: _selectedSession!.remainingTime.inSeconds,
                totalSeconds: _selectedSession!.duration * 60,
              ),
            ),
          // Toggle grid/list view
          if (_selectedSession != null)
            IconButton(
              icon: Icon(_isGridView ? Icons.view_list : Icons.grid_view),
              onPressed: () => setState(() => _isGridView = !_isGridView),
              tooltip: _isGridView ? 'Tampilan List' : 'Tampilan Grid',
            ),
        ],
      ),
      body: _selectedSession == null
          ? _buildSessionSelector(proctorProvider)
          : _buildMonitoringView(proctorProvider),
    );
  }

  /// Pemilih sesi jika belum ada sesi aktif
  Widget _buildSessionSelector(ProctorProvider proctorProvider) {
    if (proctorProvider.isLoading) {
      return const Center(
          child: CircularProgressIndicator(color: AppTheme.primary));
    }

    final activeSessions = proctorProvider.sessions
        .where((s) => s.isActive || s.status == SessionStatus.scheduled)
        .toList();

    if (activeSessions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.link_off, size: 64, color: AppTheme.textHint),
              const SizedBox(height: 16),
              const Text(
                'Tidak ada sesi untuk dimonitor',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 16),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => proctorProvider.loadSessions(),
                icon: const Icon(Icons.refresh),
                label: const Text('Muat Ulang'),
              ),
            ],
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text(
          'Pilih Sesi untuk Monitoring',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        const Text(
          'Pilih sesi ujian yang ingin Anda awasi secara real-time',
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
        ),
        const SizedBox(height: 16),
        ...activeSessions.map((session) => _SessionSelectionCard(
              session: session,
              onTap: () {
                setState(() => _selectedSession = session);
                proctorProvider.startMonitoring(session.id);
                _startAutoRefresh();
              },
            )),
      ],
    );
  }

  /// Tampilan monitoring real-time
  Widget _buildMonitoringView(ProctorProvider proctorProvider) {
    return Column(
      children: [
        // Info bar sesi
        _SessionInfoBar(
          session: _selectedSession!,
          activeCount: proctorProvider.activeCount,
          warningCount: proctorProvider.warningCount,
          dangerCount: proctorProvider.dangerCount,
          onChangeSession: () {
            proctorProvider.stopMonitoring();
            _autoRefreshTimer?.cancel();
            setState(() => _selectedSession = null);
          },
          onEndSession: () => _showEndSessionDialog(proctorProvider),
        ),

        // Auto-refresh indicator
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
          color: AppTheme.primary.withValues(alpha: 0.05),
          child: Row(
            children: [
              Icon(Icons.autorenew, size: 14, color: AppTheme.primary.withValues(alpha: 0.7)),
              const SizedBox(width: 6),
              Text(
                'Auto-refresh setiap 30 detik',
                style: TextStyle(
                  color: AppTheme.primary.withValues(alpha: 0.7),
                  fontSize: 11,
                ),
              ),
              const Spacer(),
              if (proctorProvider.isMonitoring)
                SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppTheme.primary.withValues(alpha: 0.5),
                  ),
                ),
            ],
          ),
        ),

        // Grid / List status siswa
        Expanded(
          child: proctorProvider.students.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: AppTheme.primary),
                      SizedBox(height: 16),
                      Text(
                        'Memuat data siswa...',
                        style: TextStyle(color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                )
              : _isGridView
                  ? _buildStudentGrid(proctorProvider)
                  : _buildStudentList(proctorProvider),
        ),

        // Panel pelanggaran terbaru
        if (proctorProvider.recentViolations.isNotEmpty)
          _RecentViolationsPanel(
            violations: proctorProvider.recentViolations,
            onViewAll: () => context.go('/pengawas/violations'),
          ),
      ],
    );
  }

  /// Grid tampilan siswa
  Widget _buildStudentGrid(ProctorProvider proctorProvider) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 0.75,
      ),
      itemCount: proctorProvider.students.length,
      itemBuilder: (context, index) {
        final student = proctorProvider.students[index];
        return StudentStatusCard(
          student: student,
          onTap: () => context.push(
            '/pengawas/sessions/${_selectedSession!.id}/students/${student.studentId}',
          ),
        );
      },
    );
  }

  /// List tampilan siswa
  Widget _buildStudentList(ProctorProvider proctorProvider) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: proctorProvider.students.length,
      itemBuilder: (context, index) {
        final student = proctorProvider.students[index];
        final statusColor = _getStudentStatusColor(student.statusColor);

        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: InkWell(
            onTap: () => context.push(
              '/pengawas/sessions/${_selectedSession!.id}/students/${student.studentId}',
            ),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  // Avatar + status dot
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor:
                            statusColor.withValues(alpha: 0.15),
                        child: Text(
                          Helpers.getInitials(student.studentName),
                          style: TextStyle(
                            color: statusColor,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: statusColor,
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: Colors.white, width: 2),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 12),

                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          student.studentName,
                          style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 14),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Text(
                              student.statusLabel,
                              style: TextStyle(
                                color: statusColor,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            if (student.violationCount > 0) ...[
                              const SizedBox(width: 8),
                              Text(
                                '${student.violationCount} pelanggaran',
                                style: TextStyle(
                                  color: AppTheme.warning,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Progress
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${(student.progressPercentage * 100).toInt()}%',
                        style: TextStyle(
                          color: AppTheme.primary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      SizedBox(
                        width: 48,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: student.progressPercentage,
                            minHeight: 4,
                            backgroundColor: AppTheme.border,
                            valueColor: AlwaysStoppedAnimation<Color>(
                                AppTheme.primary),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Color _getStudentStatusColor(StudentStatusColor color) {
    switch (color) {
      case StudentStatusColor.green:
        return AppTheme.success;
      case StudentStatusColor.yellow:
        return AppTheme.warning;
      case StudentStatusColor.red:
        return AppTheme.error;
    }
  }

  /// Dialog konfirmasi akhiri sesi
  Future<void> _showEndSessionDialog(ProctorProvider proctorProvider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.stop_circle, color: AppTheme.error, size: 24),
            const SizedBox(width: 8),
            const Text('Akhiri Sesi?'),
          ],
        ),
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
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.error),
            child: const Text('Akhiri Sesi'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final success =
          await proctorProvider.endSession(_selectedSession!.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success
                ? 'Sesi berhasil diakhiri'
                : 'Gagal mengakhiri sesi'),
            backgroundColor: success ? AppTheme.success : AppTheme.error,
          ),
        );
        if (success) {
          _autoRefreshTimer?.cancel();
          setState(() => _selectedSession = null);
        }
      }
    }
  }
}

/// Bar info sesi
class _SessionInfoBar extends StatelessWidget {
  final ProctorSession session;
  final int activeCount;
  final int warningCount;
  final int dangerCount;
  final VoidCallback onChangeSession;
  final VoidCallback onEndSession;

  const _SessionInfoBar({
    required this.session,
    required this.activeCount,
    required this.warningCount,
    required this.dangerCount,
    required this.onChangeSession,
    required this.onEndSession,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(bottom: BorderSide(color: AppTheme.border)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session.examTitle,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 15),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '${session.className} - ${session.startTimeFormatted} s/d ${session.endTimeFormatted}',
                      style: const TextStyle(
                          color: AppTheme.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'change') onChangeSession();
                  if (value == 'end') onEndSession();
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'change',
                    child: Row(
                      children: [
                        Icon(Icons.swap_horiz, size: 18),
                        SizedBox(width: 8),
                        Text('Ganti Sesi'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'end',
                    child: Row(
                      children: [
                        Icon(Icons.stop_circle,
                            size: 18, color: AppTheme.error),
                        SizedBox(width: 8),
                        Text('Akhiri Sesi',
                            style: TextStyle(color: AppTheme.error)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _StatusPill(
                color: AppTheme.success,
                emoji: '🟢',
                label: 'Aktif',
                count: activeCount,
              ),
              const SizedBox(width: 8),
              _StatusPill(
                color: AppTheme.warning,
                emoji: '🟡',
                label: 'Peringatan',
                count: warningCount,
              ),
              const SizedBox(width: 8),
              _StatusPill(
                color: AppTheme.error,
                emoji: '🔴',
                label: 'Diskualifikasi',
                count: dangerCount,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Pill status
class _StatusPill extends StatelessWidget {
  final Color color;
  final String emoji;
  final String label;
  final int count;

  const _StatusPill({
    required this.color,
    required this.emoji,
    required this.label,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 10)),
          const SizedBox(width: 4),
          Text(
            '$count $label',
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

/// Kartu pemilihan sesi
class _SessionSelectionCard extends StatelessWidget {
  final ProctorSession session;
  final VoidCallback onTap;

  const _SessionSelectionCard({required this.session, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: session.isActive
                      ? AppTheme.success.withValues(alpha: 0.1)
                      : AppTheme.accent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  session.isActive ? Icons.play_circle : Icons.schedule,
                  color: session.isActive ? AppTheme.success : AppTheme.accent,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session.examTitle,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      '${session.className} - ${session.totalStudents} siswa',
                      style: const TextStyle(
                          color: AppTheme.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${session.startTimeFormatted} - ${session.endTimeFormatted}',
                      style: const TextStyle(
                          color: AppTheme.textHint, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: session.isActive
                      ? AppTheme.success.withValues(alpha: 0.1)
                      : AppTheme.accent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  session.isActive ? 'LIVE' : 'Terjadwal',
                  style: TextStyle(
                    color: session.isActive
                        ? AppTheme.success
                        : AppTheme.accent,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Panel pelanggaran terbaru
class _RecentViolationsPanel extends StatelessWidget {
  final List violations;
  final VoidCallback onViewAll;

  const _RecentViolationsPanel({
    required this.violations,
    required this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxHeight: 200),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(top: BorderSide(color: AppTheme.border)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                const Icon(Icons.warning_amber,
                    color: AppTheme.warning, size: 18),
                const SizedBox(width: 8),
                const Text(
                  'Pelanggaran Terbaru',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const Spacer(),
                TextButton(
                  onPressed: onViewAll,
                  child:
                      const Text('Lihat Semua', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ),
          Flexible(
            child: ListView.builder(
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: violations.length > 3 ? 3 : violations.length,
              itemBuilder: (context, index) {
                return ViolationAlertCard(violation: violations[index]);
              },
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
