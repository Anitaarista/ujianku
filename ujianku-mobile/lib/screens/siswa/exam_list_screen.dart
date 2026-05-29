import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/exam.dart';
import '../../providers/exam_provider.dart';
import '../../widgets/exam_card.dart';

/// Halaman daftar ujian siswa — PRO-MAX UI/UX
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
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: _showSearch
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Cari ujian...',
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: Colors.grey[500]),
                ),
                style: const TextStyle(
                  fontSize: 16,
                  color: Color(0xFF1A1A2E),
                  fontWeight: FontWeight.w500,
                ),
                onChanged: (value) {
                  setState(() => _searchQuery = value);
                },
              )
            : const Text(
                'Daftar Ujian',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A2E),
                ),
              ),
        actions: [
          IconButton(
            icon: Icon(_showSearch ? Icons.close : Icons.search,
                color: Colors.grey[700]),
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
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline, color: Colors.red[700], size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      examProvider.error!,
                      style: TextStyle(
                        color: Colors.red[700],
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.read<ExamProvider>().loadExams(),
                    child: const Text('Coba Lagi',
                        style: TextStyle(fontWeight: FontWeight.w600)),
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
                backgroundColor: Colors.white,
                side: BorderSide(
                  color: isActive ? AppTheme.primary : Colors.grey[300]!,
                ),
                labelStyle: TextStyle(
                  color: isActive ? AppTheme.primary : Colors.grey[700],
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
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
              Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'Ujian tidak ditemukan',
                style: TextStyle(
                  color: Colors.grey[700],
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                'Coba kata kunci lain',
                style: TextStyle(color: Colors.grey[500], fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    String message;
    String subtitle;
    IconData icon;

    switch (filter) {
      case ExamFilter.ongoing:
        message = 'Tidak ada ujian berlangsung';
        subtitle = 'Ujian yang sedang aktif akan muncul di sini';
        icon = Icons.play_circle_outline;
        break;
      case ExamFilter.upcoming:
        message = 'Tidak ada ujian mendatang';
        subtitle = 'Ujian terjadwal akan muncul di sini';
        icon = Icons.schedule;
        break;
      case ExamFilter.completed:
        message = 'Belum ada ujian selesai';
        subtitle = 'Ujian yang sudah dikerjakan akan muncul di sini';
        icon = Icons.check_circle_outline;
        break;
      default:
        message = 'Belum ada ujian tersedia';
        subtitle = 'Ujian akan muncul ketika tersedia untuk Anda';
        icon = Icons.assignment_outlined;
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                color: Colors.grey[700],
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: TextStyle(color: Colors.grey[500], fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
