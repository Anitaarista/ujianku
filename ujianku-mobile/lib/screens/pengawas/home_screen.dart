import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/proctor_provider.dart';
import '../../models/proctor_session.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';

/// Halaman beranda pengawas
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
      context.read<ProctorProvider>().loadSessions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final proctorProvider = context.watch<ProctorProvider>();
    final user = authProvider.user;
    final activeSession = proctorProvider.activeSession;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => context.read<ProctorProvider>().loadSessions(),
        color: AppTheme.primary,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: _PengawasHeader(user: user),
            ),

            // Sesi aktif
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

            // Statistik hari ini
            SliverToBoxAdapter(
              child: _TodayStats(sessions: proctorProvider.sessions),
            ),

            // Jadwal hari ini
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Text(
                  'Jadwal Hari Ini',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),

            // Daftar sesi
            proctorProvider.isLoading
                ? const SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(color: AppTheme.primary),
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
                                Icon(Icons.event_busy, size: 64, color: AppTheme.textHint),
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
                              final session = proctorProvider.sessions[index];
                              return _SessionCard(
                                session: session,
                                onTap: () {
                                  proctorProvider.selectSession(session);
                                  if (session.isActive) {
                                    context.go('/pengawas/monitoring');
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

/// Header pengawas
class _PengawasHeader extends StatelessWidget {
  final user;
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
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Tidak ada sesi pengawasan yang sedang berlangsung',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
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
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
                  text: '${session!.activeStudents}/${session!.totalStudents} siswa',
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

/// Statistik hari ini
class _TodayStats extends StatelessWidget {
  final List<ProctorSession> sessions;
  const _TodayStats({required this.sessions});

  @override
  Widget build(BuildContext context) {
    final totalSessions = sessions.length;
    final totalViolations = sessions.fold<int>(0, (sum, s) => sum + s.violationCount);
    final totalStudents = sessions.fold<int>(0, (sum, s) => sum + s.totalStudents);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: _StatCard(
              icon: Icons.assignment_outlined,
              label: 'Total Sesi',
              value: '$totalSessions',
              color: AppTheme.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              icon: Icons.people_outline,
              label: 'Total Siswa',
              value: '$totalStudents',
              color: AppTheme.accent,
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
        ],
      ),
    );
  }
}

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
            style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.w700),
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

/// Kartu sesi pengawasan
class _SessionCard extends StatelessWidget {
  final ProctorSession session;
  final VoidCallback? onTap;

  const _SessionCard({required this.session, this.onTap});

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    String statusLabel;

    switch (session.status) {
      case SessionStatus.active:
        statusColor = AppTheme.success;
        statusLabel = 'Berlangsung';
        break;
      case SessionStatus.completed:
        statusColor = AppTheme.secondary;
        statusLabel = 'Selesai';
        break;
      case SessionStatus.scheduled:
        statusColor = AppTheme.accent;
        statusLabel = 'Terjadwal';
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
                  Expanded(
                    child: Text(
                      session.examTitle,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
              const SizedBox(height: 8),
              Text(
                '${session.subject} - ${session.className}',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.people_outline, size: 16, color: AppTheme.textHint),
                  const SizedBox(width: 4),
                  Text('${session.totalStudents} siswa',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  const SizedBox(width: 16),
                  Icon(Icons.schedule, size: 16, color: AppTheme.textHint),
                  const SizedBox(width: 4),
                  Text(
                    '${session.startTimeFormatted} - ${session.endTimeFormatted}',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                ],
              ),
              if (session.violationCount > 0) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.warning_amber, size: 16, color: AppTheme.warning),
                    const SizedBox(width: 4),
                    Text(
                      '${session.violationCount} pelanggaran',
                      style: TextStyle(fontSize: 12, color: AppTheme.warning),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
