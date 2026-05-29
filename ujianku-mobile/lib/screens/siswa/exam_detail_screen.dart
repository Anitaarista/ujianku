import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/exam_provider.dart';
import '../../utils/helpers.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/countdown_timer.dart';

/// Halaman detail ujian sebelum memulai
class ExamDetailScreen extends StatefulWidget {
  final String examId;

  const ExamDetailScreen({super.key, required this.examId});

  @override
  State<ExamDetailScreen> createState() => _ExamDetailScreenState();
}

class _ExamDetailScreenState extends State<ExamDetailScreen> {
  final _tokenController = TextEditingController();
  bool _agreedToRules = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExamDetail(widget.examId);
    });
  }

  @override
  void dispose() {
    _tokenController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final examProvider = context.watch<ExamProvider>();
    final exam = examProvider.currentExam;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Ujian'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: examProvider.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : exam == null
              ? _buildErrorState(examProvider.error)
              : _buildContent(exam),
    );
  }

  Widget _buildErrorState(String? error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.error),
            const SizedBox(height: 16),
            Text(
              error ?? 'Gagal memuat detail ujian',
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            CustomButton(
              text: 'Coba Lagi',
              variant: CustomButtonVariant.outline,
              onPressed: () => context.read<ExamProvider>().loadExamDetail(widget.examId),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(dynamic exam) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Kartu info utama
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    exam.statusLabel,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  exam.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  exam.subject,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Info detail
          _InfoRow(
            icon: Icons.calendar_today_outlined,
            label: 'Tanggal',
            value: Helpers.formatDateTime(exam.startTime),
          ),
          _InfoRow(
            icon: Icons.timer_outlined,
            label: 'Durasi',
            value: exam.durationFormatted,
          ),
          _InfoRow(
            icon: Icons.quiz_outlined,
            label: 'Total Soal',
            value: '${exam.totalQuestions} soal',
          ),
          if (exam.totalPg > 0)
            _InfoRow(
              icon: Icons.list_alt,
              label: 'Pilihan Ganda',
              value: '${exam.totalPg} soal',
            ),
          if (exam.totalEssay > 0)
            _InfoRow(
              icon: Icons.edit_note,
              label: 'Esai',
              value: '${exam.totalEssay} soal',
            ),
          if (exam.teacherName != null)
            _InfoRow(
              icon: Icons.person_outline,
              label: 'Guru',
              value: exam.teacherName!,
            ),
          if (exam.className != null)
            _InfoRow(
              icon: Icons.class_outlined,
              label: 'Kelas',
              value: exam.className!,
            ),

          // Countdown jika ujian berlangsung
          if (exam.isOngoing) ...[
            const SizedBox(height: 24),
            Center(
              child: CountdownTimer(
                totalSeconds: exam.duration * 60,
                remainingSeconds: exam.remainingSeconds,
                fontSize: 28,
                showLabel: true,
              ),
            ),
          ],

          const SizedBox(height: 24),

          // Petunjuk ujian
          if (exam.instructions != null && exam.instructions!.isNotEmpty) ...[
            const Text(
              'Petunjuk Ujian',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: Text(
                exam.instructions!,
                style: const TextStyle(fontSize: 14, height: 1.6),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Peraturan umum
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFfef3c7).withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFfcd34d)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.warning_amber, color: Color(0xFFd97706), size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Peraturan Ujian',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFd97706),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _RuleItem('Tidak diperbolehkan keluar dari aplikasi selama ujian'),
                _RuleItem('Tidak diperbolehkan membuka aplikasi lain'),
                _RuleItem('Tidak diperbolehkan mengambil screenshot'),
                _RuleItem('Pelanggaran 3x akan mengakibatkan diskualifikasi'),
                _RuleItem('Waktu ujian akan terus berjalan meskipun aplikasi ditutup'),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Input token (jika diperlukan)
          if (exam.requiresToken) ...[
            const Text(
              'Token Ujian',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _tokenController,
              decoration: InputDecoration(
                hintText: 'Masukkan token ujian',
                prefixIcon: const Icon(Icons.vpn_key_outlined),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.paste),
                  onPressed: () async {
                    // TODO: paste from clipboard
                  },
                ),
              ),
              textCapitalization: TextCapitalization.characters,
              maxLength: 6,
            ),
            const SizedBox(height: 16),
          ],

          // Checkbox persetujuan
          CheckboxListTile(
            value: _agreedToRules,
            onChanged: (value) {
              setState(() => _agreedToRules = value ?? false);
            },
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
            title: const Text(
              'Saya memahami dan setuju dengan peraturan ujian',
              style: TextStyle(fontSize: 14),
            ),
          ),
          const SizedBox(height: 16),

          // Tombol mulai ujian
          CustomButton(
            text: 'Mulai Ujian',
            icon: Icons.play_arrow,
            isFullWidth: true,
            size: CustomButtonSize.large,
            isLoading: examProvider.isLoading,
            onPressed: _canStartExam(exam) ? () => _startExam(exam) : null,
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  bool _canStartExam(dynamic exam) {
    if (!_agreedToRules) return false;
    if (exam.requiresToken && _tokenController.text.isEmpty) return false;
    if (!exam.isOngoing && !exam.isUpcoming) return false;
    return true;
  }

  Future<void> _startExam(dynamic exam) async {
    final success = await context.read<ExamProvider>().startExam(
          exam.id,
          token: exam.requiresToken ? _tokenController.text : null,
        );

    if (!mounted) return;

    if (success) {
      context.go('/siswa/exams/${exam.id}/take');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<ExamProvider>().error ?? 'Gagal memulai ujian'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }
}

/// Baris informasi
class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.textSecondary),
          const SizedBox(width: 12),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

/// Item peraturan
class _RuleItem extends StatelessWidget {
  final String text;
  const _RuleItem(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('•  ', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFFd97706))),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
