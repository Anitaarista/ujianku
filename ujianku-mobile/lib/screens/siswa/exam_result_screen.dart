import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/exam_provider.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';

/// Halaman hasil ujian
class ExamResultScreen extends StatefulWidget {
  final String examId;

  const ExamResultScreen({super.key, required this.examId});

  @override
  State<ExamResultScreen> createState() => _ExamResultScreenState();
}

class _ExamResultScreenState extends State<ExamResultScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scoreAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _scoreAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExamResult(widget.examId);
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final examProvider = context.watch<ExamProvider>();
    final result = examProvider.examResult;

    // Mulai animasi saat data hasil sudah dimuat
    if (result != null && !_animationController.isCompleted) {
      _animationController.forward();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hasil Ujian'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/siswa'),
        ),
      ),
      body: examProvider.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : result == null
              ? _buildError(examProvider.error)
              : _buildResult(result),
    );
  }

  Widget _buildError(String? error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.error),
            const SizedBox(height: 16),
            Text(
              error ?? 'Gagal memuat hasil ujian',
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Coba Lagi',
              variant: CustomButtonVariant.outline,
              onPressed: () => context.read<ExamProvider>().loadExamResult(widget.examId),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResult(dynamic result) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Kartu skor utama
          _ScoreCard(
            result: result,
            scoreAnimation: _scoreAnimation,
          ),
          const SizedBox(height: 24),

          // Status kelulusan
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Color(result.passColor).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Color(result.passColor).withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  result.isPassed ? Icons.check_circle : Icons.cancel,
                  color: Color(result.passColor),
                  size: 28,
                ),
                const SizedBox(width: 12),
                Text(
                  result.passLabel,
                  style: TextStyle(
                    color: Color(result.passColor),
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Statistik detail
          Row(
            children: [
              _StatBox(
                label: 'Benar',
                value: '${result.correctAnswers}',
                color: AppTheme.success,
              ),
              const SizedBox(width: 12),
              _StatBox(
                label: 'Salah',
                value: '${result.incorrectAnswers}',
                color: AppTheme.error,
              ),
              const SizedBox(width: 12),
              _StatBox(
                label: 'Belum Dijawab',
                value: '${result.unanswered}',
                color: AppTheme.textHint,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Rincian skor
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
                  'Rincian Skor',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                _ScoreRow(
                  label: 'Skor Pilihan Ganda',
                  score: result.pgScore,
                  icon: Icons.list_alt,
                ),
                const SizedBox(height: 12),
                _ScoreRow(
                  label: 'Skor Esai',
                  score: result.essayScore,
                  icon: Icons.edit_note,
                ),
                const Divider(height: 24),
                _ScoreRow(
                  label: 'Total Skor',
                  score: result.totalScore,
                  icon: Icons.summarize,
                  isBold: true,
                ),
                const SizedBox(height: 8),
                _ScoreRow(
                  label: 'Persentase',
                  score: result.percentage,
                  icon: Icons.percent,
                  isPercentage: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Info waktu
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.timer_outlined, color: AppTheme.textSecondary),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Waktu Pengerjaan',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        Helpers.formatDuration(result.timeTaken.inMinutes),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Tombol kembali
          CustomButton(
            text: 'Kembali ke Beranda',
            icon: Icons.home,
            isFullWidth: true,
            size: CustomButtonSize.large,
            onPressed: () => context.go('/siswa'),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

/// Kartu skor utama dengan animasi
class _ScoreCard extends StatelessWidget {
  final dynamic result;
  final Animation<double> scoreAnimation;

  const _ScoreCard({required this.result, required this.scoreAnimation});

  @override
  Widget build(BuildContext context) {
    final scoreColor = Color(Helpers.getScoreColor(result.totalScore));

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            scoreColor.withValues(alpha: 0.1),
            scoreColor.withValues(alpha: 0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: scoreColor.withValues(alpha: 0.2)),
      ),
      child: Column(
        children: [
          // Judul ujian
          Text(
            result.examTitle,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            result.subject,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          // Lingkaran skor animasi
          AnimatedBuilder(
            animation: scoreAnimation,
            builder: (context, child) {
              return SizedBox(
                width: 160,
                height: 160,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CircularProgressIndicator(
                      value: (result.percentage / 100) * scoreAnimation.value,
                      strokeWidth: 12,
                      backgroundColor: scoreColor.withValues(alpha: 0.1),
                      valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                    ),
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            (result.totalScore * scoreAnimation.value)
                                .toStringAsFixed(0),
                            style: TextStyle(
                              fontSize: 44,
                              fontWeight: FontWeight.w800,
                              color: scoreColor,
                            ),
                          ),
                          Text(
                            Helpers.getGradeLabel(result.totalScore),
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                              color: scoreColor.withValues(alpha: 0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

/// Kotak statistik
class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatBox({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: color,
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

/// Baris skor
class _ScoreRow extends StatelessWidget {
  final String label;
  final double score;
  final IconData icon;
  final bool isBold;
  final bool isPercentage;

  const _ScoreRow({
    required this.label,
    required this.score,
    required this.icon,
    this.isBold = false,
    this.isPercentage = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppTheme.textSecondary),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isBold ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ),
        Text(
          isPercentage ? '${score.toStringAsFixed(1)}%' : score.toStringAsFixed(1),
          style: TextStyle(
            fontSize: 16,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
            color: isBold ? AppTheme.primary : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}
