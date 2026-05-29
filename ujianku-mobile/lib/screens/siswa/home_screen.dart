import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/exam_provider.dart';
import '../../models/exam.dart';
import '../../models/answer.dart';
import '../../config/api_config.dart';
import '../../services/api_service.dart';
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
  final ApiService _api = ApiService();
  List<ExamResult> _recentResults = [];
  bool _isLoadingResults = false;
  double _averageScore = 0.0;
  int _totalExamsCompleted = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExams();
      _loadResults();
    });
  }

  Future<void> _loadResults() async {
    setState(() => _isLoadingResults = true);
    try {
      final response = await _api.get(ApiConfig.siswaResults);
      if (response.success && response.listBody != null) {
        final results = response.listBody!
            .map((e) => ExamResult.fromJson(e as Map<String, dynamic>))
            .toList();
        setState(() {
          _recentResults = results;
          _totalExamsCompleted = results.length;
          if (results.isNotEmpty) {
            _averageScore = results
                    .map((r) => r.totalScore)
                    .reduce((a, b) => a + b) /
                results.length;
          }
        });
      }
    } catch (_) {}
    setState(() => _isLoadingResults = false);
  }

  Future<void> _refreshAll() async {
    await Future.wait([
      context.read<ExamProvider>().loadExams(),
      _loadResults(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final examProvider = context.watch<ExamProvider>();
    final user = authProvider.user;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refreshAll,
        color: AppTheme.primary,
        child: CustomScrollView(
          slivers: [
            // Header dengan greeting
            SliverToBoxAdapter(
              child: _HomeHeader(user: user),
            ),

            // Statistik ringkas
            SliverToBoxAdapter(
              child: _QuickStats(
                upcomingCount: examProvider.exams
                    .where((e) => e.isUpcoming || e.isOngoing)
                    .length,
                completedCount: _totalExamsCompleted,
                averageScore: _averageScore,
              ),
            ),

            // Quick action buttons
            SliverToBoxAdapter(
              child: _QuickActions(),
            ),

            // Ujian mendatang dengan countdown
            SliverToBoxAdapter(
              child: _UpcomingExamSection(exams: examProvider.exams),
            ),

            // Hasil terbaru
            SliverToBoxAdapter(
              child: _RecentResultsSection(results: _recentResults),
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
                    child: Center(
                        child: CircularProgressIndicator(color: AppTheme.primary)),
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
                                onTap: () =>
                                    context.push('/siswa/exams/${exam.id}'),
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
  final dynamic user;
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
                  icon: const Icon(Icons.notifications_outlined,
                      color: Colors.white),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Tidak ada notifikasi baru')),
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
  final int upcomingCount;
  final int completedCount;
  final double averageScore;

  const _QuickStats({
    required this.upcomingCount,
    required this.completedCount,
    required this.averageScore,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        children: [
          _StatCard(
            icon: Icons.upcoming_outlined,
            label: 'Ujian Mendatang',
            value: '$upcomingCount',
            color: AppTheme.accent,
          ),
          const SizedBox(width: 12),
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
            value: averageScore > 0 ? averageScore.toStringAsFixed(0) : '-',
            color: AppTheme.primary,
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

/// Quick action buttons
class _QuickActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Aksi Cepat',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _QuickActionButton(
                  icon: Icons.assignment_outlined,
                  label: 'Lihat Ujian',
                  color: AppTheme.primary,
                  onTap: () => context.go('/siswa/exams'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _QuickActionButton(
                  icon: Icons.bar_chart_outlined,
                  label: 'Hasil Terakhir',
                  color: AppTheme.accent,
                  onTap: () => context.go('/siswa/results'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _QuickActionButton(
                  icon: Icons.person_outline,
                  label: 'Profil',
                  color: AppTheme.secondary,
                  onTap: () => context.go('/siswa/profile'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Quick action button
class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionButton({
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
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
            boxShadow: [
              BoxShadow(
                color: AppTheme.cardShadow,
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
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
    final upcomingExams =
        exams.where((e) => e.isOngoing || e.isUpcoming).take(3).toList();

    if (upcomingExams.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Ujian Mendatang',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              TextButton(
                onPressed: () => context.go('/siswa/exams'),
                child: const Text('Lihat Semua'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...upcomingExams.map((exam) => _UpcomingExamCard(exam: exam)),
        ],
      ),
    );
  }
}

/// Kartu ujian mendatang
class _UpcomingExamCard extends StatelessWidget {
  final Exam exam;
  const _UpcomingExamCard({required this.exam});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: exam.isOngoing
                      ? AppTheme.success.withValues(alpha: 0.2)
                      : AppTheme.accent.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  exam.isOngoing ? 'Berlangsung' : 'Mendatang',
                  style: TextStyle(
                    color: exam.isOngoing ? AppTheme.success : AppTheme.accent,
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
            exam.title,
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
            exam.subject,
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
                text: Helpers.formatDateShort(exam.startTime),
              ),
              const SizedBox(width: 16),
              _ExamInfoChip(
                icon: Icons.timer,
                text: exam.durationFormatted,
              ),
              const SizedBox(width: 16),
              _ExamInfoChip(
                icon: Icons.quiz,
                text: '${exam.totalQuestions} Soal',
              ),
            ],
          ),
          if (exam.isOngoing) ...[
            const SizedBox(height: 16),
            CountdownTimer(
              totalSeconds: exam.duration * 60,
              remainingSeconds: exam.remainingSeconds,
              fontSize: 24,
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.push('/siswa/exams/${exam.id}'),
              style: ElevatedButton.styleFrom(
                backgroundColor: exam.isOngoing
                    ? AppTheme.success
                    : Colors.white.withValues(alpha: 0.15),
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                exam.isOngoing ? 'Mulai Ujian' : 'Lihat Detail',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
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
  final List<ExamResult> results;
  const _RecentResultsSection({required this.results});

  @override
  Widget build(BuildContext context) {
    if (results.isEmpty) return const SizedBox.shrink();

    final displayResults = results.take(3).toList();

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
          ...displayResults.map((result) => _ResultCard(result: result)),
        ],
      ),
    );
  }
}

/// Kartu hasil ujian
class _ResultCard extends StatelessWidget {
  final ExamResult result;
  const _ResultCard({required this.result});

  @override
  Widget build(BuildContext context) {
    final scoreColor = Color(Helpers.getScoreColor(result.totalScore));

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
              color: scoreColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                result.totalScore.toStringAsFixed(0),
                style: TextStyle(
                  color: scoreColor,
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  result.examTitle,
                  style:
                      const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  result.subject,
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          CustomButton(
            text: 'Lihat',
            variant: CustomButtonVariant.ghost,
            size: CustomButtonSize.small,
            customColor: AppTheme.primary,
            onPressed: () =>
                context.push('/siswa/exams/${result.examId}/result'),
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
