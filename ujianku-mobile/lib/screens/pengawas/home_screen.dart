import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/proctor_provider.dart';
import '../../models/proctor_session.dart';
import '../../models/violation.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';

/// Halaman beranda pengawas — dashboard lengkap
class PengawasHomeScreen extends StatefulWidget {
  const PengawasHomeScreen({super.key});

  @override
  State<PengawasHomeScreen> createState() => _PengawasHomeScreenState();
}

class _PengawasHomeScreenState extends State<PengawasHomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final proctor = context.read<ProctorProvider>();
      proctor.loadSessions();
      proctor.loadViolations();
    });
  }

  Future<void> _refresh() async {
    final proctor = context.read<ProctorProvider>();
    await proctor.loadSessions();
    await proctor.loadViolations();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final proctorProvider = context.watch<ProctorProvider>();
    final user = authProvider.user;
    final activeSession = proctorProvider.activeSession;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: AppTheme.primary,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // ── Header ──
            SliverToBoxAdapter(
              child: _PengawasHeader(user: user),
            ),

            // ── Sesi aktif ──
            SliverToBoxAdapter(
              child: _ActiveSessionCard(
                session: activeSession,
                onMonitor: () {
                  if (activeSession != null) {
                    proctorProvider.selectSession(activeSession);
                    context.go('/pengawas/monitoring');
                  }
                },
              ),
            ),

            // ── Statistik hari ini ──
            SliverToBoxAdapter(
              child: _TodayStats(sessions: proctorProvider.sessions),
            ),

            // ── Quick Actions ──
            SliverToBoxAdapter(
              child: _QuickActions(
                onNewSession: () => context.go('/pengawas/monitoring'),
                onViolations: () => context.go('/pengawas/violations'),
                onReports: () => context.go('/pengawas/reports'),
              ),
            ),

            // ── Pelanggaran terbaru ──
            if (proctorProvider.violations.isNotEmpty)
              SliverToBoxAdapter(
                child: _RecentViolations(
                  violations: proctorProvider.violations,
                  onViewAll: () => context.go('/pengawas/violations'),
                ),
              ),

            // ── Jadwal hari ini ──
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Row(
                  children: [
                    Text(
                      'Jadwal Hari Ini',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Spacer(),
                  ],
                ),
              ),
            ),

            // ── Daftar sesi ──
            proctorProvider.isLoading
                ? const SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(color: AppTheme.primary),
                    ),
                  )
                : proctorProvider.error != null
                    ? SliverFillRemaining(
                        child: _ErrorState(
                          message: proctorProvider.error!,
                          onRetry: () => proctorProvider.loadSessions(),
                        ),
                      )
                    : proctorProvider.sessions.isEmpty
                        ? const SliverFillRemaining(
                            child: Center(
                              child: Padding(
                                padding: EdgeInsets.all(40),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.event_busy,
                                        size: 64, color: AppTheme.textHint),
                                    SizedBox(height: 16),
                                    Text(
                                      'Tidak ada jadwal hari ini',
                                      style: TextStyle(
                                        color: AppTheme.textSecondary,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          )
                        : SliverPadding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            sliver: SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  final session =
                                      proctorProvider.sessions[index];
                                  return _SessionCard(
                                    session: session,
                                    onTap: () {
                                      proctorProvider
                                          .selectSession(session);
                                      if (session.isActive) {
                                        context.go('/pengawas/monitoring');
                                      } else if (session.isCompleted) {
                                        context.go(
                                          '/pengawas/sessions/${session.id}/report',
                                        );
                                      }
                                    },
                                  );
                                },
                                childCount: proctorProvider.sessions.length,
                              ),
                            ),
                          ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Header pengawas
class _PengawasHeader extends StatelessWidget {
  final dynamic user;
  const _PengawasHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1e293b), Color(0xFF334155)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white.withValues(alpha: 0.15),
            child: Text(
              user?.initials ?? 'P',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 20,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  Helpers.getGreeting(),
                  style: const TextStyle(color: Colors.white60, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  user?.name ?? 'Pengawas',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shield_outlined, color: AppTheme.primary, size: 16),
                SizedBox(width: 4),
                Text(
                  'Pengawas',
                  style: TextStyle(
                    color: AppTheme.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Kartu sesi aktif
class _ActiveSessionCard extends StatelessWidget {
  final ProctorSession? session;
  final VoidCallback? onMonitor;

  const _ActiveSessionCard({this.session, this.onMonitor});

  @override
  Widget build(BuildContext context) {
    if (session == null) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: const Row(
            children: [
              Icon(Icons.monitor_outlined, size: 32, color: AppTheme.textHint),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tidak Ada Sesi Aktif',
                      style:
                          TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Tidak ada sesi pengawasan yang sedang berlangsung',
                      style:
                          TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.circle, color: Colors.white, size: 8),
                      SizedBox(width: 6),
                      Text(
                        'Sesi Aktif',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Icon(Icons.fiber_manual_record,
                    color: Colors.white.withValues(alpha: 0.5), size: 12),
                const SizedBox(width: 4),
                Text(
                  'LIVE',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.8),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              session!.examTitle,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              session!.subject,
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _SessionInfoChip(
                  icon: Icons.people_outline,
                  text:
                      '${session!.activeStudents}/${session!.totalStudents} siswa',
                ),
                const SizedBox(width: 16),
                _SessionInfoChip(
                  icon: Icons.warning_amber,
                  text: '${session!.violationCount} pelanggaran',
                ),
                const SizedBox(width: 16),
                _SessionInfoChip(
                  icon: Icons.schedule,
                  text: session!.startTimeFormatted,
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onMonitor,
                icon: const Icon(Icons.monitor, size: 18),
                label: const Text('Mulai Monitoring'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primary,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Chip info sesi
class _SessionInfoChip extends StatelessWidget {
  final IconData icon;
  final String text;

  const _SessionInfoChip({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white54, size: 14),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(color: Colors.white54, fontSize: 12)),
      ],
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Statistik hari ini
class _TodayStats extends StatelessWidget {
  final List<ProctorSession> sessions;
  const _TodayStats({required this.sessions});

  @override
  Widget build(BuildContext context) {
    final activeSessions =
        sessions.where((s) => s.isActive).length;
    final totalViolations =
        sessions.fold<int>(0, (sum, s) => sum + s.violationCount);
    final totalMonitored =
        sessions.fold<int>(0, (sum, s) => sum + s.activeStudents);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: _StatCard(
              icon: Icons.play_circle_outline,
              label: 'Sesi Aktif',
              value: '$activeSessions',
              color: AppTheme.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              icon: Icons.warning_amber,
              label: 'Pelanggaran',
              value: '$totalViolations',
              color: AppTheme.error,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              icon: Icons.people_outline,
              label: 'Dimonitor',
              value: '$totalMonitored',
              color: AppTheme.accent,
            ),
          ),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Kartu statistik
class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.15)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
                color: color, fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Quick action buttons
class _QuickActions extends StatelessWidget {
  final VoidCallback onNewSession;
  final VoidCallback onViolations;
  final VoidCallback onReports;

  const _QuickActions({
    required this.onNewSession,
    required this.onViolations,
    required this.onReports,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Aksi Cepat',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.add_circle_outline,
                  label: 'Mulai Sesi Baru',
                  color: AppTheme.primary,
                  onTap: onNewSession,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.warning_amber,
                  label: 'Pelanggaran',
                  color: AppTheme.warning,
                  onTap: onViolations,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.assessment_outlined,
                  label: 'Laporan',
                  color: AppTheme.accent,
                  onTap: onReports,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withValues(alpha: 0.15)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Recent violations summary
class _RecentViolations extends StatelessWidget {
  final List<Violation> violations;
  final VoidCallback onViewAll;

  const _RecentViolations({
    required this.violations,
    required this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    final recent = violations.take(3).toList();

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'Pelanggaran Terbaru',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const Spacer(),
              TextButton(
                onPressed: onViewAll,
                child: const Text('Lihat Semua', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...recent.map((v) => _ViolationSummaryCard(violation: v)),
        ],
      ),
    );
  }
}

class _ViolationSummaryCard extends StatelessWidget {
  final Violation violation;
  const _ViolationSummaryCard({required this.violation});

  @override
  Widget build(BuildContext context) {
    final severityColor = Color(violation.severityColor);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: severityColor.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: severityColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Text(violation.typeIcon, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  violation.studentName,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 13),
                ),
                Text(
                  violation.typeLabel,
                  style: TextStyle(
                    color: severityColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: severityColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
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
              const SizedBox(height: 4),
              Text(
                violation.timeFormatted,
                style: const TextStyle(
                    color: AppTheme.textHint, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Kartu sesi pengawasan
class _SessionCard extends StatelessWidget {
  final ProctorSession session;
  final VoidCallback? onTap;

  const _SessionCard({required this.session, this.onTap});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (session.status) {
      case SessionStatus.active:
        statusColor = AppTheme.success;
        statusLabel = 'Berlangsung';
        statusIcon = Icons.play_circle;
        break;
      case SessionStatus.completed:
        statusColor = AppTheme.secondary;
        statusLabel = 'Selesai';
        statusIcon = Icons.check_circle;
        break;
      case SessionStatus.scheduled:
        statusColor = AppTheme.accent;
        statusLabel = 'Terjadwal';
        statusIcon = Icons.schedule;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(statusIcon, color: statusColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      session.examTitle,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 15),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      statusLabel,
                      style: TextStyle(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.only(left: 52),
                child: Text(
                  '${session.subject} - ${session.className}',
                  style:
                      const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                ),
              ),
              const SizedBox(height: 10),
              Padding(
                padding: const EdgeInsets.only(left: 52),
                child: Row(
                  children: [
                    Icon(Icons.people_outline,
                        size: 16, color: AppTheme.textHint),
                    const SizedBox(width: 4),
                    Text('${session.totalStudents} siswa',
                        style: const TextStyle(
                            fontSize: 12, color: AppTheme.textSecondary)),
                    const SizedBox(width: 16),
                    Icon(Icons.schedule, size: 16, color: AppTheme.textHint),
                    const SizedBox(width: 4),
                    Text(
                      '${session.startTimeFormatted} - ${session.endTimeFormatted}',
                      style: const TextStyle(
                          fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
              ),
              if (session.violationCount > 0) ...[
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsets.only(left: 52),
                  child: Row(
                    children: [
                      Icon(Icons.warning_amber,
                          size: 16, color: AppTheme.warning),
                      const SizedBox(width: 4),
                      Text(
                        '${session.violationCount} pelanggaran',
                        style: TextStyle(
                            fontSize: 12, color: AppTheme.warning),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ────────────────────────────────────────────────────────────────
/// Error state widget
class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.error),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                  color: AppTheme.textSecondary, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Coba Lagi',
              variant: CustomButtonVariant.outline,
              onPressed: onRetry,
            ),
          ],
        ),
      ),
    );
  }
}
