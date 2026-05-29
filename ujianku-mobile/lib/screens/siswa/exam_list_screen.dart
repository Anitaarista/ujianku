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
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  bool _showSearch = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExamProvider>().loadExams();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Exam> _filterExams(List<Exam> exams) {
    var filtered = exams;
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered
          .where((e) =>
              e.title.toLowerCase().contains(query) ||
              e.subject.toLowerCase().contains(query) ||
              (e.teacherName?.toLowerCase().contains(query) ?? false))
          .toList();
    }
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final examProvider = context.watch<ExamProvider>();

    return Scaffold(
      appBar: AppBar(
        title: _showSearch
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Cari ujian...',
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: AppTheme.textHint),
                ),
                style: const TextStyle(fontSize: 16),
                onChanged: (value) {
                  setState(() => _searchQuery = value);
                },
              )
            : const Text('Daftar Ujian'),
        actions: [
          IconButton(
            icon: Icon(_showSearch ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                _showSearch = !_showSearch;
                if (!_showSearch) {
                  _searchQuery = '';
                  _searchController.clear();
                }
              });
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

          // Error state
          if (examProvider.error != null && !examProvider.isLoading)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.error.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.error.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AppTheme.error, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      examProvider.error!,
                      style: const TextStyle(color: AppTheme.error, fontSize: 13),
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.read<ExamProvider>().loadExams(),
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            ),

          // Daftar ujian
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => context.read<ExamProvider>().loadExams(),
              color: AppTheme.primary,
              child: examProvider.isLoading && examProvider.exams.isEmpty
                  ? const Center(
                      child: CircularProgressIndicator(color: AppTheme.primary),
                    )
                  : _filterExams(examProvider.exams).isEmpty
                      ? _EmptyExamList(
                          filter: _currentFilter,
                          isSearch: _searchQuery.isNotEmpty,
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
                          itemCount: _filterExams(examProvider.exams).length,
                          itemBuilder: (context, index) {
                            final exam =
                                _filterExams(examProvider.exams)[index];
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
  final bool isSearch;
  const _EmptyExamList({required this.filter, this.isSearch = false});

  @override
  Widget build(BuildContext context) {
    if (isSearch) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.search_off, size: 64, color: AppTheme.textHint),
              const SizedBox(height: 16),
              Text(
                'Ujian tidak ditemukan',
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
