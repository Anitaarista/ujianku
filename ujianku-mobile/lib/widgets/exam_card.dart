import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/exam.dart';
import '../utils/helpers.dart';

/// Kartu ujian untuk ditampilkan di daftar ujian
class ExamCard extends StatelessWidget {
  final Exam exam;
  final VoidCallback? onTap;

  const ExamCard({
    super.key,
    required this.exam,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
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
              // Baris atas: judul dan badge status
              Row(
                children: [
                  Expanded(
                    child: Text(
                      exam.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _StatusBadge(status: exam.status),
                ],
              ),
              const SizedBox(height: 8),

              // Mata pelajaran
              Row(
                children: [
                  Icon(Icons.book_outlined, size: 16, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    exam.subject,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Info detail
              Row(
                children: [
                  _InfoChip(
                    icon: Icons.calendar_today_outlined,
                    label: Helpers.formatDateShort(exam.startTime),
                  ),
                  const SizedBox(width: 12),
                  _InfoChip(
                    icon: Icons.timer_outlined,
                    label: exam.durationFormatted,
                  ),
                  const SizedBox(width: 12),
                  _InfoChip(
                    icon: Icons.quiz_outlined,
                    label: '${exam.totalQuestions} Soal',
                  ),
                ],
              ),

              // Token required indicator
              if (exam.requiresToken) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFfef3c7),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.vpn_key_outlined, size: 14, color: Color(0xFFd97706)),
                      const SizedBox(width: 4),
                      Text(
                        'Memerlukan Token',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: const Color(0xFFd97706),
                              fontWeight: FontWeight.w500,
                            ),
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

/// Badge status ujian
class _StatusBadge extends StatelessWidget {
  final ExamStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;

    switch (status) {
      case ExamStatus.ongoing:
        bgColor = const Color(0xFFd1fae5);
        textColor = const Color(0xFF059669);
        break;
      case ExamStatus.completed:
        bgColor = const Color(0xFFf1f5f9);
        textColor = const Color(0xFF64748b);
        break;
      case ExamStatus.upcoming:
        bgColor = const Color(0xFFfef3c7);
        textColor = const Color(0xFFd97706);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status == ExamStatus.ongoing
            ? 'Berlangsung'
            : status == ExamStatus.completed
                ? 'Selesai'
                : 'Mendatang',
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

/// Chip informasi ringkas
class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppTheme.textHint),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}
