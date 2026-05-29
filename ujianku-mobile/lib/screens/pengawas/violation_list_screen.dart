import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/proctor_provider.dart';
import '../../models/violation.dart';
import '../../widgets/violation_alert_card.dart';

/// Halaman daftar pelanggaran
class ViolationListScreen extends StatefulWidget {
  const ViolationListScreen({super.key});

  @override
  State<ViolationListScreen> createState() => _ViolationListScreenState();
}

class _ViolationListScreenState extends State<ViolationListScreen> {
  ViolationType? _selectedType;
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProctorProvider>().loadViolations();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final proctorProvider = context.watch<ProctorProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daftar Pelanggaran'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari nama siswa...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                          context.read<ProctorProvider>().loadViolations();
                        },
                      )
                    : null,
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value);
              },
              onSubmitted: (value) {
                context.read<ProctorProvider>().loadViolations(search: value);
              },
            ),
          ),

          // Filter chips
          if (_selectedType != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Chip(
                    label: Text(_selectedType!.name),
                    onDeleted: () {
                      setState(() => _selectedType = null);
                      context.read<ProctorProvider>().loadViolations();
                    },
                    deleteIconColor: AppTheme.primary,
                  ),
                ],
              ),
            ),

          // Daftar pelanggaran
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => context.read<ProctorProvider>().loadViolations(
                    type: _selectedType,
                    search: _searchQuery.isNotEmpty ? _searchQuery : null,
                  ),
              color: AppTheme.primary,
              child: proctorProvider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppTheme.primary),
                    )
                  : proctorProvider.violations.isEmpty
                      ? _EmptyViolations()
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                          itemCount: proctorProvider.violations.length,
                          itemBuilder: (context, index) {
                            final violation = proctorProvider.violations[index];
                            return ViolationAlertCard(
                              violation: violation,
                              onTap: () => _showViolationDetail(violation),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Filter Pelanggaran'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ViolationType.values.map((type) {
            return ListTile(
              title: Text(_getViolationTypeLabel(type)),
              leading: Text(_getViolationTypeIcon(type)),
              selected: _selectedType == type,
              onTap: () {
                setState(() => _selectedType = type);
                Navigator.pop(context);
                context.read<ProctorProvider>().loadViolations(type: type);
              },
            );
          }).toList(),
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() => _selectedType = null);
              Navigator.pop(context);
              context.read<ProctorProvider>().loadViolations();
            },
            child: const Text('Semua Tipe'),
          ),
        ],
      ),
    );
  }

  void _showViolationDetail(Violation violation) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) {
          return SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Text(
                      violation.typeIcon,
                      style: const TextStyle(fontSize: 32),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            violation.typeLabel,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            violation.severityLabel,
                            style: TextStyle(
                              color: Color(violation.severityColor),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const Text('Siswa', style: TextStyle(fontWeight: FontWeight.w500, color: AppTheme.textSecondary)),
                const SizedBox(height: 4),
                Text(violation.studentName, style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 16),
                const Text('Deskripsi', style: TextStyle(fontWeight: FontWeight.w500, color: AppTheme.textSecondary)),
                const SizedBox(height: 4),
                Text(violation.description),
                const SizedBox(height: 16),
                const Text('Waktu', style: TextStyle(fontWeight: FontWeight.w500, color: AppTheme.textSecondary)),
                const SizedBox(height: 4),
                Text(violation.timeFormatted),
                if (violation.isResolved) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.success.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: AppTheme.success, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'Ditangani oleh ${violation.resolvedBy ?? "pengawas"}',
                          style: const TextStyle(color: AppTheme.success, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  String _getViolationTypeLabel(ViolationType type) {
    switch (type) {
      case ViolationType.appSwitch:
        return 'Pindah Aplikasi';
      case ViolationType.screenshot:
        return 'Screenshot';
      case ViolationType.screenCapture:
        return 'Rekam Layar';
      case ViolationType.multipleDevices:
        return 'Perangkat Ganda';
      case ViolationType.idleTooLong:
        return 'Tidak Aktif';
      case ViolationType.faceNotDetected:
        return 'Wajah Tidak Terdeteksi';
      case ViolationType.tabSwitch:
        return 'Pindah Tab';
      case ViolationType.other:
        return 'Lainnya';
    }
  }

  String _getViolationTypeIcon(ViolationType type) {
    switch (type) {
      case ViolationType.appSwitch:
        return '📱';
      case ViolationType.screenshot:
        return '📸';
      case ViolationType.screenCapture:
        return '🎥';
      case ViolationType.multipleDevices:
        return '📲';
      case ViolationType.idleTooLong:
        return '⏰';
      case ViolationType.faceNotDetected:
        return '👤';
      case ViolationType.tabSwitch:
        return '🔀';
      case ViolationType.other:
        return '⚠️';
    }
  }
}

/// State kosong untuk daftar pelanggaran
class _EmptyViolations extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle_outline, size: 64, color: AppTheme.success),
            const SizedBox(height: 16),
            const Text(
              'Tidak Ada Pelanggaran',
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Semua siswa mengerjakan ujian dengan jujur',
              style: TextStyle(color: AppTheme.textHint, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
