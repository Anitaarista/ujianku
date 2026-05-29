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

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final proctor = context.read<ProctorProvider>();
      if (proctor.activeSession != null) {
        _selectedSession = proctor.activeSession;
        proctor.startMonitoring(_selectedSession!.id);
      } else {
        proctor.loadSessions();
      }
    });
  }

  @override
  void dispose() {
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
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
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
        const SizedBox(height: 16),
        ...activeSessions.map((session) => _SessionSelectionCard(
              session: session,
              onTap: () {
                setState(() => _selectedSession = session);
                proctorProvider.startMonitoring(session.id);
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
            setState(() => _selectedSession = null);
          },
        ),

        // Grid status siswa
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
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
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
                ),
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
}

/// Bar info sesi
class _SessionInfoBar extends StatelessWidget {
  final ProctorSession session;
  final int activeCount;
  final int warningCount;
  final int dangerCount;
  final VoidCallback onChangeSession;

  const _SessionInfoBar({
    required this.session,
    required this.activeCount,
    required this.warningCount,
    required this.dangerCount,
    required this.onChangeSession,
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
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
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
              TextButton(
                onPressed: onChangeSession,
                child: const Text('Ganti Sesi', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _StatusPill(
                color: AppTheme.success,
                label: 'Aktif',
                count: activeCount,
              ),
              const SizedBox(width: 8),
              _StatusPill(
                color: AppTheme.warning,
                label: 'Peringatan',
                count: warningCount,
              ),
              const SizedBox(width: 8),
              _StatusPill(
                color: AppTheme.error,
                label: 'Bahaya',
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
  final String label;
  final int count;

  const _StatusPill({
    required this.color,
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
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
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
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppTheme.textHint),
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
                const Icon(Icons.warning_amber, color: AppTheme.warning, size: 18),
                const SizedBox(width: 8),
                const Text(
                  'Pelanggaran Terbaru',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const Spacer(),
                TextButton(
                  onPressed: onViewAll,
                  child: const Text('Lihat Semua', style: TextStyle(fontSize: 12)),
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
