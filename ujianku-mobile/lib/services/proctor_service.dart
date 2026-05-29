import '../config/api_config.dart';
import '../models/proctor_session.dart';
import '../models/violation.dart';
import 'api_service.dart';

/// Layanan pengawasan untuk operasi terkait pengawas
class ProctorService {
  final ApiService _api = ApiService();

  /// Mendapatkan daftar sesi pengawasan
  Future<ProctorSessionsResult> getSessions() async {
    final response = await _api.get(ApiConfig.proctorSessions);

    if (response.success && response.listBody != null) {
      final sessions = response.listBody!
          .map((e) => ProctorSession.fromJson(e as Map<String, dynamic>))
          .toList();

      return ProctorSessionsResult(success: true, sessions: sessions);
    }

    return ProctorSessionsResult(
      success: false,
      message: response.message,
    );
  }

  /// Mendapatkan data monitoring sesi secara real-time
  Future<MonitoringResult> getMonitoringData(String sessionId) async {
    final response = await _api.get(ApiConfig.proctorMonitor(sessionId));

    if (response.success && response.body != null) {
      final data = response.body as Map<String, dynamic>;
      final students = (data['students'] as List<dynamic>?)
              ?.map((e) =>
                  StudentSessionStatus.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];

      final recentViolations = (data['recent_violations'] as List<dynamic>?)
              ?.map((e) => Violation.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];

      return MonitoringResult(
        success: true,
        students: students,
        recentViolations: recentViolations,
        activeCount: data['active_count'] as int? ?? 0,
        warningCount: data['warning_count'] as int? ?? 0,
        dangerCount: data['danger_count'] as int? ?? 0,
      );
    }

    return MonitoringResult(
      success: false,
      message: response.message,
    );
  }

  /// Mendapatkan detail siswa dalam sesi
  Future<StudentDetailResult> getStudentDetail({
    required String sessionId,
    required String studentId,
  }) async {
    final response = await _api.get(
      ApiConfig.proctorStudentDetail(sessionId, studentId),
    );

    if (response.success && response.body != null) {
      final data = response.body as Map<String, dynamic>;
      final studentStatus =
          StudentSessionStatus.fromJson(data['status'] as Map<String, dynamic>);
      final violations = (data['violations'] as List<dynamic>?)
              ?.map((e) => Violation.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];

      return StudentDetailResult(
        success: true,
        studentStatus: studentStatus,
        violations: violations,
      );
    }

    return StudentDetailResult(
      success: false,
      message: response.message,
    );
  }

  /// Memberi peringatan kepada siswa
  Future<bool> warnStudent({
    required String sessionId,
    required String studentId,
    String? message,
  }) async {
    final response = await _api.post(
      ApiConfig.proctorWarnStudent(sessionId, studentId),
      body: {'message': message ?? 'Peringatan dari pengawas'},
    );
    return response.success;
  }

  /// Diskualifikasi siswa
  Future<bool> disqualifyStudent({
    required String sessionId,
    required String studentId,
    required String reason,
  }) async {
    final response = await _api.post(
      ApiConfig.proctorDisqualifyStudent(sessionId, studentId),
      body: {'reason': reason},
    );
    return response.success;
  }

  /// Mengizinkan siswa kembali
  Future<bool> allowStudent({
    required String sessionId,
    required String studentId,
  }) async {
    final response = await _api.post(
      ApiConfig.proctorAllowStudent(sessionId, studentId),
    );
    return response.success;
  }

  /// Melaporkan pelanggaran
  Future<bool> reportViolation({
    required String sessionId,
    required String studentId,
    required String type,
    required String description,
    ViolationSeverity severity = ViolationSeverity.medium,
  }) async {
    final response = await _api.post(
      ApiConfig.proctorViolations,
      body: {
        'session_id': sessionId,
        'student_id': studentId,
        'type': type,
        'description': description,
        'severity': severity.name,
      },
    );
    return response.success;
  }

  /// Mendapatkan daftar pelanggaran
  Future<ViolationsResult> getViolations({
    String? sessionId,
    ViolationType? type,
    String? search,
    int page = 1,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
    };
    if (sessionId != null) queryParams['session_id'] = sessionId;
    if (type != null) queryParams['type'] = type.name;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;

    final response = await _api.get(
      ApiConfig.proctorViolations,
      queryParams: queryParams,
    );

    if (response.success && response.listBody != null) {
      final violations = response.listBody!
          .map((e) => Violation.fromJson(e as Map<String, dynamic>))
          .toList();

      return ViolationsResult(success: true, violations: violations);
    }

    return ViolationsResult(
      success: false,
      message: response.message,
    );
  }

  /// Mendapatkan laporan sesi
  Future<ReportResult> getSessionReport(String sessionId) async {
    final response = await _api.get(ApiConfig.proctorReport(sessionId));

    if (response.success && response.body != null) {
      final data = response.body as Map<String, dynamic>;
      return ReportResult(success: true, report: data);
    }

    return ReportResult(
      success: false,
      message: response.message,
    );
  }

  /// Mengakhiri sesi pengawasan
  Future<bool> endSession(String sessionId) async {
    final response = await _api.post(ApiConfig.proctorEndSession(sessionId));
    return response.success;
  }
}

/// Hasil daftar sesi pengawasan
class ProctorSessionsResult {
  final bool success;
  final List<ProctorSession> sessions;
  final String message;

  const ProctorSessionsResult({
    required this.success,
    this.sessions = const [],
    this.message = '',
  });
}

/// Hasil data monitoring
class MonitoringResult {
  final bool success;
  final List<StudentSessionStatus> students;
  final List<Violation> recentViolations;
  final int activeCount;
  final int warningCount;
  final int dangerCount;
  final String message;

  const MonitoringResult({
    required this.success,
    this.students = const [],
    this.recentViolations = const [],
    this.activeCount = 0,
    this.warningCount = 0,
    this.dangerCount = 0,
    this.message = '',
  });
}

/// Hasil detail siswa
class StudentDetailResult {
  final bool success;
  final StudentSessionStatus? studentStatus;
  final List<Violation> violations;
  final String message;

  const StudentDetailResult({
    required this.success,
    this.studentStatus,
    this.violations = const [],
    this.message = '',
  });
}

/// Hasil daftar pelanggaran
class ViolationsResult {
  final bool success;
  final List<Violation> violations;
  final String message;

  const ViolationsResult({
    required this.success,
    this.violations = const [],
    this.message = '',
  });
}

/// Hasil laporan
class ReportResult {
  final bool success;
  final Map<String, dynamic>? report;
  final String message;

  const ReportResult({
    required this.success,
    this.report,
    this.message = '',
  });
}
