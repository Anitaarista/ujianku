import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/exam.dart';
import '../../providers/exam_provider.dart';
import '../../widgets/exam_card.dart';

/// Halaman daftar ujian siswa
class ExamListScreen extends StatefulWidget {
  const ExamListScreen({super.key});

  @override
  State<ExamListScreen> createState() => _ExamListScreenState();
}

class _ExamListScreenState extends State<ExamListScreen> {
  ExamFilter _currentFilter = ExamFilter.all;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExams();
    });
  }

  @override
  Widget build(BuildContext context) {
    final examProvider = context.watch<ExamProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daftar Ujian'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              showSearch(
                context: context,
                delegate: _ExamSearchDelegate(exams: examProvider.exams),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Tab filter
          _FilterTabs(
            currentFilter: _currentFilter,
            onFilterChanged: (filter) {
              setState(() => _currentFilter = filter);
              context.read<ExamProvider>().setFilter(filter);
            },
          ),

          // Daftar ujian
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => context.read<ExamProvider>().loadExams(),
              color: AppTheme.primary,
              child: examProvider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppTheme.primary),
                    )
                  : examProvider.exams.isEmpty
                      ? _EmptyExamList(filter: _currentFilter)
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
                          itemCount: examProvider.exams.length,
                          itemBuilder: (context, index) {
                            final exam = examProvider.exams[index];
                            return ExamCard(
                              exam: exam,
                              onTap: () =>
                                  context.push('/siswa/exams/${exam.id}'),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Tab filter ujian
class _FilterTabs extends StatelessWidget {
  final ExamFilter currentFilter;
  final ValueChanged<ExamFilter> onFilterChanged;

  const _FilterTabs({
    required this.currentFilter,
    required this.onFilterChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: ExamFilter.values.map((filter) {
            final isActive = filter == currentFilter;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(filter.label),
                selected: isActive,
                onSelected: (_) => onFilterChanged(filter),
                selectedColor: AppTheme.primary.withValues(alpha: 0.15),
                backgroundColor: AppTheme.background,
                side: BorderSide(
                  color: isActive ? AppTheme.primary : AppTheme.border,
                ),
                labelStyle: TextStyle(
                  color: isActive ? AppTheme.primary : AppTheme.textSecondary,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                  fontSize: 13,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

/// State kosong untuk daftar ujian
class _EmptyExamList extends StatelessWidget {
  final ExamFilter filter;
  const _EmptyExamList({required this.filter});

  @override
  Widget build(BuildContext context) {
    String message;
    IconData icon;

    switch (filter) {
      case ExamFilter.ongoing:
        message = 'Tidak ada ujian yang sedang berlangsung';
        icon = Icons.play_circle_outline;
        break;
      case ExamFilter.upcoming:
        message = 'Tidak ada ujian yang akan datang';
        icon = Icons.schedule;
        break;
      case ExamFilter.completed:
        message = 'Belum ada ujian yang selesai';
        icon = Icons.check_circle_outline;
        break;
      default:
        message = 'Belum ada ujian tersedia';
        icon = Icons.assignment_outlined;
    }

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

/// Delegate pencarian ujian
class _ExamSearchDelegate extends SearchDelegate {
  final List<Exam> exams;

  _ExamSearchDelegate({required this.exams});

  @override
  String get searchFieldLabel => 'Cari ujian...';

  @override
  TextStyle get searchFieldStyle => const TextStyle(fontSize: 16);

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () => query = '',
        ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () => close(context, null),
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    final results = exams
        .where((e) =>
            e.title.toLowerCase().contains(query.toLowerCase()) ||
            e.subject.toLowerCase().contains(query.toLowerCase()))
        .toList();

    if (results.isEmpty) {
      return Center(
        child: Text(
          'Tidak ditemukan ujian "$query"',
          style: TextStyle(color: AppTheme.textSecondary),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: results.length,
      itemBuilder: (context, index) {
        final exam = results[index];
        return ExamCard(
          exam: exam,
          onTap: () {
            close(context, null);
            context.push('/siswa/exams/${exam.id}');
          },
        );
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return buildResults(context);
  }
}
