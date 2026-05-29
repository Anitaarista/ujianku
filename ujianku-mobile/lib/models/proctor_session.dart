/// Model sesi pengawasan ujian
class ProctorSession {
  final String id;
  final String examId;
  final String examTitle;
  final String subject;
  final String className;
  final DateTime startTime;
  final DateTime endTime;
  final int totalStudents;
  final int activeStudents;
  final int violationCount;
  final SessionStatus status;
  final DateTime? createdAt;

  const ProctorSession({
    required this.id,
    required this.examId,
    required this.examTitle,
    required this.subject,
    required this.className,
    required this.startTime,
    required this.endTime,
    required this.totalStudents,
    this.activeStudents = 0,
    this.violationCount = 0,
    this.status = SessionStatus.scheduled,
    this.createdAt,
  });

  /// Apakah sesi sedang aktif
  bool get isActive => status == SessionStatus.active;

  /// Apakah sesi sudah selesai
  bool get isCompleted => status == SessionStatus.completed;

  /// Persentase siswa aktif
  double get activePercentage {
    if (totalStudents == 0) return 0;
    return (activeStudents / totalStudents) * 100;
  }

  /// Durasi tersisa
  Duration get remainingTime {
    if (!isActive) return Duration.zero;
    final remaining = endTime.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  /// Format waktu mulai
  String get startTimeFormatted {
    return '${startTime.hour.toString().padLeft(2, '0')}:${startTime.minute.toString().padLeft(2, '0')}';
  }

  /// Format waktu selesai
  String get endTimeFormatted {
    return '${endTime.hour.toString().padLeft(2, '0')}:${endTime.minute.toString().padLeft(2, '0')}';
  }

  factory ProctorSession.fromJson(Map<String, dynamic> json) {
    return ProctorSession(
      id: json['id']?.toString() ?? '',
      examId: json['exam_id']?.toString() ?? '',
      examTitle: json['exam_title'] ?? '',
      subject: json['subject'] ?? '',
      className: json['class_name'] ?? '',
      startTime: json['start_time'] != null
          ? DateTime.parse(json['start_time'])
          : DateTime.now(),
      endTime: json['end_time'] != null
          ? DateTime.parse(json['end_time'])
          : DateTime.now(),
      totalStudents: json['total_students'] ?? 0,
      activeStudents: json['active_students'] ?? 0,
      violationCount: json['violation_count'] ?? 0,
      status: _parseStatus(json['status']),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'])
          : null,
    );
  }

  static SessionStatus _parseStatus(dynamic status) {
    if (status is String) {
      switch (status.toLowerCase()) {
        case 'active':
          return SessionStatus.active;
        case 'completed':
          return SessionStatus.completed;
        default:
          return SessionStatus.scheduled;
      }
    }
    return SessionStatus.scheduled;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'exam_id': examId,
      'exam_title': examTitle,
      'subject': subject,
      'class_name': className,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'total_students': totalStudents,
      'active_students': activeStudents,
      'violation_count': violationCount,
      'status': status.name,
    };
  }

  ProctorSession copyWith({
    String? id,
    String? examId,
    String? examTitle,
    String? subject,
    String? className,
    DateTime? startTime,
    DateTime? endTime,
    int? totalStudents,
    int? activeStudents,
    int? violationCount,
    SessionStatus? status,
  }) {
    return ProctorSession(
      id: id ?? this.id,
      examId: examId ?? this.examId,
      examTitle: examTitle ?? this.examTitle,
      subject: subject ?? this.subject,
      className: className ?? this.className,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      totalStudents: totalStudents ?? this.totalStudents,
      activeStudents: activeStudents ?? this.activeStudents,
      violationCount: violationCount ?? this.violationCount,
      status: status ?? this.status,
    );
  }
}

/// Status sesi pengawasan
enum SessionStatus {
  scheduled,
  active,
  completed,
}

/// Status siswa dalam sesi pengawasan
class StudentSessionStatus {
  final String studentId;
  final String studentName;
  final String? avatar;
  final StudentConnectionStatus connectionStatus;
  final int violationCount;
  final DateTime? lastActivity;
  final double progressPercentage;
  final List<ViolationInfo> recentViolations;

  const StudentSessionStatus({
    required this.studentId,
    required this.studentName,
    this.avatar,
    this.connectionStatus = StudentConnectionStatus.active,
    this.violationCount = 0,
    this.lastActivity,
    this.progressPercentage = 0,
    this.recentViolations = const [],
  });

  /// Warna status siswa untuk monitoring
  StudentStatusColor get statusColor {
    if (connectionStatus == StudentConnectionStatus.disconnected) {
      return StudentStatusColor.red;
    }
    if (violationCount >= 2) {
      return StudentStatusColor.red;
    }
    if (violationCount == 1) {
      return StudentStatusColor.yellow;
    }
    return StudentStatusColor.green;
  }

  /// Label status dalam bahasa Indonesia
  String get statusLabel {
    switch (connectionStatus) {
      case StudentConnectionStatus.active:
        return 'Aktif';
      case StudentConnectionStatus.idle:
        return 'Idle';
      case StudentConnectionStatus.disconnected:
        return 'Terputus';
    }
  }

  factory StudentSessionStatus.fromJson(Map<String, dynamic> json) {
    return StudentSessionStatus(
      studentId: json['student_id']?.toString() ?? '',
      studentName: json['student_name'] ?? '',
      avatar: json['avatar'],
      connectionStatus: _parseConnectionStatus(json['connection_status']),
      violationCount: json['violation_count'] ?? 0,
      lastActivity: json['last_activity'] != null
          ? DateTime.tryParse(json['last_activity'])
          : null,
      progressPercentage: (json['progress_percentage'] ?? 0).toDouble(),
      recentViolations: json['recent_violations'] != null
          ? (json['recent_violations'] as List)
              .map((e) => ViolationInfo.fromJson(e))
              .toList()
          : [],
    );
  }

  static StudentConnectionStatus _parseConnectionStatus(dynamic status) {
    if (status is String) {
      switch (status.toLowerCase()) {
        case 'idle':
          return StudentConnectionStatus.idle;
        case 'disconnected':
          return StudentConnectionStatus.disconnected;
        default:
          return StudentConnectionStatus.active;
      }
    }
    return StudentConnectionStatus.active;
  }
}

/// Status koneksi siswa
enum StudentConnectionStatus {
  active,
  idle,
  disconnected,
}

/// Warna status siswa untuk tampilan monitoring
enum StudentStatusColor {
  green,
  yellow,
  red,
}

/// Info pelanggaran ringkas
class ViolationInfo {
  final String type;
  final DateTime time;

  const ViolationInfo({required this.type, required this.time});

  factory ViolationInfo.fromJson(Map<String, dynamic> json) {
    return ViolationInfo(
      type: json['type'] ?? '',
      time: json['time'] != null ? DateTime.parse(json['time']) : DateTime.now(),
    );
  }
}
