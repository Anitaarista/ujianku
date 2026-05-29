import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/exam_provider.dart';
import '../../models/exam.dart';
import '../../utils/helpers.dart';
import '../../widgets/exam_card.dart';
import '../../widgets/countdown_timer.dart';
import '../../widgets/custom_button.dart';

/// Halaman beranda siswa
class SiswaHomeScreen extends StatefulWidget {
  const SiswaHomeScreen({super.key});

  @override
  State<SiswaHomeScreen> createState() => _SiswaHomeScreenState();
}

class _SiswaHomeScreenState extends State<SiswaHomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExams();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final examProvider = context.watch<ExamProvider>();
    final user = authProvider.user;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => context.read<ExamProvider>().loadExams(),
        color: AppTheme.primary,
        child: CustomScrollView(
          slivers: [
            // Header dengan greeting
            SliverToBoxAdapter(
              child: _HomeHeader(user: user),
            ),

            // Statistik ringkas
            SliverToBoxAdapter(
              child: _QuickStats(exams: examProvider.exams),
            ),

            // Ujian mendatang dengan countdown
            SliverToBoxAdapter(
              child: _UpcomingExamSection(exams: examProvider.exams),
            ),

            // Hasil terbaru
            SliverToBoxAdapter(
              child: _RecentResultsSection(exams: examProvider.exams),
            ),

            // Daftar ujian terbaru
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 24, 20, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Ujian Terbaru',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Daftar ujian
            examProvider.isLoading
                ? const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
                  )
                : examProvider.exams.isEmpty
                    ? SliverFillRemaining(
                        child: _EmptyState(
                          icon: Icons.assignment_outlined,
                          message: 'Belum ada ujian tersedia',
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final exam = examProvider.exams[index];
                              return ExamCard(
                                exam: exam,
                                onTap: () => context.push('/siswa/exams/${exam.id}'),
                              );
                            },
                            childCount: examProvider.exams.length > 5
                                ? 5
                                : examProvider.exams.length,
                          ),
                        ),
                      ),

            // Bottom padding
            const SliverToBoxAdapter(
              child: SizedBox(height: 100),
            ),
          ],
        ),
      ),
    );
  }
}

/// Header halaman beranda
class _HomeHeader extends StatelessWidget {
  final user;
  const _HomeHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 24),
      decoration: const BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                child: Text(
                  user?.initials ?? 'S',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 20,
                  ),
                ),
              ),
              const SizedBox(width: 16),

              // Greeting
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      Helpers.getGreeting(),
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      user?.name ?? 'Siswa',
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

              // Ikon notifikasi
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: IconButton(
                  icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tidak ada notifikasi baru')),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Statistik ringkas
class _QuickStats extends StatelessWidget {
  final List<Exam> exams;
  const _QuickStats({required this.exams});

  @override
  Widget build(BuildContext context) {
    final completedCount = exams.where((e) => e.isCompleted).length;
    final avgScore = 0.0; // TODO: dari API
    final rank = '-'; // TODO: dari API

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        children: [
          _StatCard(
            icon: Icons.check_circle_outline,
            label: 'Ujian Selesai',
            value: '$completedCount',
            color: AppTheme.success,
          ),
          const SizedBox(width: 12),
          _StatCard(
            icon: Icons.bar_chart_outlined,
            label: 'Rata-rata Nilai',
            value: avgScore > 0 ? avgScore.toStringAsFixed(0) : '-',
            color: AppTheme.primary,
          ),
          const SizedBox(width: 12),
          _StatCard(
            icon: Icons.emoji_events_outlined,
            label: 'Peringkat',
            value: rank,
            color: AppTheme.accent,
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
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
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
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 11,
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

/// Seksi ujian mendatang dengan countdown
class _UpcomingExamSection extends StatelessWidget {
  final List<Exam> exams;
  const _UpcomingExamSection({required this.exams});

  @override
  Widget build(BuildContext context) {
    final upcomingExam = exams
        .where((e) => e.isOngoing || e.isUpcoming)
        .firstOrNull;

    if (upcomingExam == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Ujian Berikutnya',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1e293b), Color(0xFF334155)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: upcomingExam.isOngoing
                            ? AppTheme.success.withValues(alpha: 0.2)
                            : AppTheme.accent.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        upcomingExam.isOngoing ? 'Berlangsung' : 'Mendatang',
                        style: TextStyle(
                          color: upcomingExam.isOngoing
                              ? AppTheme.success
                              : AppTheme.accent,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.access_time, color: Colors.white54, size: 18),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  upcomingExam.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  upcomingExam.subject,
                  style: const TextStyle(
                    color: Colors.white60,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _ExamInfoChip(
                      icon: Icons.calendar_today,
                      text: Helpers.formatDateShort(upcomingExam.startTime),
                    ),
                    const SizedBox(width: 16),
                    _ExamInfoChip(
                      icon: Icons.timer,
                      text: upcomingExam.durationFormatted,
                    ),
                    const SizedBox(width: 16),
                    _ExamInfoChip(
                      icon: Icons.quiz,
                      text: '${upcomingExam.totalQuestions} Soal',
                    ),
                  ],
                ),
                if (upcomingExam.isOngoing) ...[
                  const SizedBox(height: 16),
                  CountdownTimer(
                    totalSeconds: upcomingExam.duration * 60,
                    remainingSeconds: upcomingExam.remainingSeconds,
                    fontSize: 24,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Chip info ujian
class _ExamInfoChip extends StatelessWidget {
  final IconData icon;
  final String text;

  const _ExamInfoChip({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white54, size: 14),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(color: Colors.white54, fontSize: 12),
        ),
      ],
    );
  }
}

/// Seksi hasil terbaru
class _RecentResultsSection extends StatelessWidget {
  final List<Exam> exams;
  const _RecentResultsSection({required this.exams});

  @override
  Widget build(BuildContext context) {
    final completedExams = exams.where((e) => e.isCompleted).take(3).toList();
    if (completedExams.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Hasil Terbaru',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              TextButton(
                onPressed: () => context.go('/siswa/results'),
                child: const Text('Lihat Semua'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...completedExams.map((exam) => _ResultCard(exam: exam)),
        ],
      ),
    );
  }
}

/// Kartu hasil ujian
class _ResultCard extends StatelessWidget {
  final Exam exam;
  const _ResultCard({required this.exam});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.check_circle, color: AppTheme.primary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exam.title,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  exam.subject,
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          CustomButton(
            text: 'Lihat',
            variant: CustomButtonVariant.ghost,
            size: CustomButtonSize.small,
            onPressed: () => context.push('/siswa/exams/${exam.id}/result'),
          ),
        ],
      ),
    );
  }
}

/// State kosong
class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;

  const _EmptyState({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: AppTheme.textHint),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

