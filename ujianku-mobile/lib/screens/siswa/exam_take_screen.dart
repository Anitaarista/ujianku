import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/question.dart';
import '../../providers/exam_provider.dart';
import '../../utils/anti_cheat_detector.dart';
import '../../widgets/question_widget.dart';
import '../../widgets/countdown_timer.dart';

/// Halaman pengerjaan ujian (layar penuh, anti-cheat)
class ExamTakeScreen extends StatefulWidget {
  final String examId;

  const ExamTakeScreen({super.key, required this.examId});

  @override
  State<ExamTakeScreen> createState() => _ExamTakeScreenState();
}

class _ExamTakeScreenState extends State<ExamTakeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  int _remainingSeconds = 0;
  int _totalSeconds = 0;
  bool _isSubmitting = false;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    // Mencegah kembali (will be handled by pop scope)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<ExamProvider>();
      if (provider.currentExam != null) {
        setState(() {
          _totalSeconds = provider.currentExam!.duration * 60;
          _remainingSeconds = _totalSeconds;
        });
        _startCountdown();
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _startCountdown() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
        }
      });
      if (_remainingSeconds <= 0) {
        _autoSubmit();
        return false;
      }
      return true;
    });
  }

  Future<void> _autoSubmit() async {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Waktu ujian habis! Ujian dikumpulkan otomatis.'),
        backgroundColor: AppTheme.warning,
        duration: Duration(seconds: 5),
      ),
    );
    await _submitExam();
  }

  Future<void> _submitExam() async {
    if (_isSubmitting) return;

    setState(() => _isSubmitting = true);
    final success = await context.read<ExamProvider>().submitExam();
    if (!mounted) return;

    setState(() => _isSubmitting = false);

    if (success) {
      context.go('/siswa/exams/${widget.examId}/result');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<ExamProvider>().error ??
              'Gagal mengumpulkan ujian'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  void _showSubmitConfirmation() {
    final provider = context.read<ExamProvider>();
    final unanswered = provider.unansweredCount;
    final flagged = provider.flaggedCount;
    final total = provider.questions.length;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Kumpulkan Ujian?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
                'Pastikan semua jawaban sudah benar sebelum mengumpulkan.'),
            const SizedBox(height: 16),
            _SubmitInfoRow(
              icon: Icons.check_circle_outline,
              color: AppTheme.success,
              text: '${provider.answeredCount} dari $total soal dijawab',
            ),
            if (unanswered > 0)
              _SubmitInfoRow(
                icon: Icons.help_outline,
                color: AppTheme.warning,
                text: '$unanswered soal belum dijawab',
              ),
            if (flagged > 0)
              _SubmitInfoRow(
                icon: Icons.flag,
                color: AppTheme.accent,
                text: '$flagged soal ditandai untuk ditinjau',
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Periksa Lagi'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _submitExam();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text('Kumpulkan'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final examProvider = context.watch<ExamProvider>();
    final exam = examProvider.currentExam;
    final currentQuestion = examProvider.currentQuestion;
    final questions = examProvider.questions;
    final currentIndex = examProvider.currentQuestionIndex;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          _showExitWarning();
        }
      },
      child: AntiCheatWrapper(
        examId: widget.examId,
        onMaxViolationsReached: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                  'Anda didiskualifikasi karena terlalu banyak pelanggaran!'),
              backgroundColor: AppTheme.error,
              duration: Duration(seconds: 5),
            ),
          );
          _submitExam();
        },
        child: Scaffold(
          key: _scaffoldKey,
          endDrawer: _QuestionNavigationDrawer(
            questions: questions,
            currentIndex: currentIndex,
            onQuestionTap: (index) {
              examProvider.goToQuestion(index);
              _pageController.jumpToPage(index);
              _scaffoldKey.currentState?.closeEndDrawer();
            },
          ),
          appBar: AppBar(
            automaticallyImplyLeading: false,
            title: Row(
              children: [
                Expanded(
                  child: Text(
                    exam?.title ?? 'Ujian',
                    style: const TextStyle(fontSize: 16),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            actions: [
              // Countdown timer
              MiniCountdownTimer(
                remainingSeconds: _remainingSeconds,
                totalSeconds: _totalSeconds,
              ),
              const SizedBox(width: 8),
              // Tombol navigasi soal
              IconButton(
                icon: const Icon(Icons.grid_view),
                onPressed: () =>
                    _scaffoldKey.currentState?.openEndDrawer(),
                tooltip: 'Navigasi Soal',
              ),
            ],
          ),
          body: questions.isEmpty
              ? const Center(
                  child: CircularProgressIndicator(color: AppTheme.primary),
                )
              : Column(
                  children: [
                    // Progress bar
                    _ProgressBar(
                      answered: examProvider.answeredCount,
                      total: questions.length,
                      currentIndex: currentIndex,
                    ),

                    // Pertanyaan indicator
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Soal ${currentIndex + 1} dari ${questions.length}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          if (currentQuestion != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: currentQuestion.isEssay
                                    ? const Color(0xFFfef3c7)
                                    : const Color(0xFFdbeafe),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                currentQuestion.isEssay
                                    ? 'Esai'
                                    : 'Pilihan Ganda',
                                style: TextStyle(
                                  color: currentQuestion.isEssay
                                      ? const Color(0xFFd97706)
                                      : const Color(0xFF2563eb),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                    // Pertanyaan
                    Expanded(
                      child: PageView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: questions.length,
                        controller: _pageController,
                        itemBuilder: (context, index) {
                          final question = questions[index];
                          return QuestionWidget(
                            question: question,
                            selectedAnswer: question.selectedAnswer,
                            onAnswerSelected: (answer) {
                              if (question.isMultipleChoice) {
                                examProvider.selectAnswer(answer);
                              } else {
                                examProvider.submitEssayAnswer(answer);
                              }
                            },
                          );
                        },
                      ),
                    ),

                    // Navigasi bawah
                    _BottomNavigation(
                      currentIndex: currentIndex,
                      totalQuestions: questions.length,
                      isFlagged: currentQuestion?.isFlagged ?? false,
                      onPrevious: () {
                        examProvider.previousQuestion();
                        _pageController.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      onNext: () {
                        examProvider.nextQuestion();
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      onFlag: examProvider.toggleFlag,
                      onSubmit: _showSubmitConfirmation,
                      isSubmitting: _isSubmitting,
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  void _showExitWarning() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.warning_amber, color: AppTheme.warning),
            SizedBox(width: 8),
            Text('Peringatan!'),
          ],
        ),
        content: const Text(
          'Anda tidak diperbolehkan keluar dari halaman ujian. '
          'Melakukan hal ini akan dicatat sebagai pelanggaran.',
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style:
                ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text('Kembali ke Ujian'),
          ),
        ],
      ),
    );
  }
}

/// Progress bar pengerjaan
class _ProgressBar extends StatelessWidget {
  final int answered;
  final int total;
  final int currentIndex;

  const _ProgressBar({
    required this.answered,
    required this.total,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    final progress = total > 0 ? answered / total : 0.0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$answered/$total dijawab',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textSecondary,
                ),
              ),
              Text(
                '${(progress * 100).toStringAsFixed(0)}%',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppTheme.border,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(AppTheme.primary),
            ),
          ),
        ],
      ),
    );
  }
}

/// Navigasi bawah halaman ujian
class _BottomNavigation extends StatelessWidget {
  final int currentIndex;
  final int totalQuestions;
  final bool isFlagged;
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final VoidCallback onFlag;
  final VoidCallback onSubmit;
  final bool isSubmitting;

  const _BottomNavigation({
    required this.currentIndex,
    required this.totalQuestions,
    required this.isFlagged,
    required this.onPrevious,
    required this.onNext,
    required this.onFlag,
    required this.onSubmit,
    required this.isSubmitting,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(top: BorderSide(color: AppTheme.border)),
      ),
      child: Row(
        children: [
          // Tombol sebelumnya
          IconButton(
            onPressed: currentIndex > 0 ? onPrevious : null,
            icon: const Icon(Icons.arrow_back),
            color: AppTheme.primary,
            disabledColor: AppTheme.textHint,
          ),

          // Tombol tandai
          IconButton(
            onPressed: onFlag,
            icon: Icon(
              isFlagged ? Icons.flag : Icons.flag_outlined,
              color: isFlagged ? AppTheme.accent : AppTheme.textSecondary,
            ),
          ),

          const Spacer(),

          // Nomor soal
          Text(
            '${currentIndex + 1} / $totalQuestions',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),

          const Spacer(),

          // Tombol berikutnya atau kumpulkan
          if (currentIndex < totalQuestions - 1)
            IconButton(
              onPressed: onNext,
              icon: const Icon(Icons.arrow_forward),
              color: AppTheme.primary,
            )
          else
            ElevatedButton(
              onPressed: isSubmitting ? null : onSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Kumpulkan'),
            ),
        ],
      ),
    );
  }
}

/// Drawer navigasi soal
class _QuestionNavigationDrawer extends StatelessWidget {
  final List<Question> questions;
  final int currentIndex;
  final ValueChanged<int> onQuestionTap;

  const _QuestionNavigationDrawer({
    required this.questions,
    required this.currentIndex,
    required this.onQuestionTap,
  });

  @override
  Widget build(BuildContext context) {
    final answered = questions.where((q) => q.isAnswered).length;
    final flagged = questions.where((q) => q.isFlagged).length;

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: AppTheme.primaryGradient,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Navigasi Soal',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _NavStat(
                          label: 'Dijawab',
                          value: '$answered',
                          color: AppTheme.success),
                      const SizedBox(width: 16),
                      _NavStat(
                          label: 'Ditandai',
                          value: '$flagged',
                          color: AppTheme.accent),
                      const SizedBox(width: 16),
                      _NavStat(
                        label: 'Belum',
                        value: '${questions.length - answered}',
                        color: AppTheme.textHint,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Grid nomor soal
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.all(20),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                ),
                itemCount: questions.length,
                itemBuilder: (context, index) {
                  final question = questions[index];
                  final isCurrent = index == currentIndex;

                  Color bgColor;
                  Color textColor;
                  Color borderColor;

                  if (isCurrent) {
                    bgColor = AppTheme.primary;
                    textColor = Colors.white;
                    borderColor = AppTheme.primary;
                  } else if (question.isAnswered && question.isFlagged) {
                    bgColor = AppTheme.accent.withValues(alpha: 0.2);
                    textColor = AppTheme.accent;
                    borderColor = AppTheme.accent;
                  } else if (question.isFlagged) {
                    bgColor = AppTheme.accent.withValues(alpha: 0.1);
                    textColor = AppTheme.accent;
                    borderColor = AppTheme.accent;
                  } else if (question.isAnswered) {
                    bgColor = AppTheme.success.withValues(alpha: 0.15);
                    textColor = AppTheme.success;
                    borderColor = AppTheme.success;
                  } else {
                    bgColor = AppTheme.background;
                    textColor = AppTheme.textSecondary;
                    borderColor = AppTheme.border;
                  }

                  return GestureDetector(
                    onTap: () => onQuestionTap(index),
                    child: Container(
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: borderColor, width: 1.5),
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            color: textColor,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // Tombol kumpulkan di drawer
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    // Access parent state to show submit confirmation
                    final state =
                        context.findAncestorStateOfType<_ExamTakeScreenState>();
                    state?._showSubmitConfirmation();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Kumpulkan Ujian',
                    style: TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                ),
              ),
            ),

            // Legenda
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppTheme.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _LegendItem(color: AppTheme.success, label: 'Dijawab'),
                  _LegendItem(color: AppTheme.accent, label: 'Ditandai'),
                  _LegendItem(color: AppTheme.textHint, label: 'Belum'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Statistik navigasi
class _NavStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _NavStat(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 18)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }
}

/// Item legenda
class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(3),
            border: Border.all(color: color),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11)),
      ],
    );
  }
}

/// Baris info submit
class _SubmitInfoRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String text;

  const _SubmitInfoRow(
      {required this.icon, required this.color, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 8),
          Text(text, style: TextStyle(fontSize: 14, color: color)),
        ],
      ),
    );
  }
}
