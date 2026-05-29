/// Model pelanggaran ujian
class Violation {
  final String id;
  final String sessionId;
  final String studentId;
  final String studentName;
  final String? studentAvatar;
  final ViolationType type;
  final String description;
  final String? screenshotUrl;
  final DateTime timestamp;
  final ViolationSeverity severity;
  final bool isResolved;
  final String? resolvedBy;
  final String? resolution;

  const Violation({
    required this.id,
    required this.sessionId,
    required this.studentId,
    required this.studentName,
    this.studentAvatar,
    required this.type,
    required this.description,
    this.screenshotUrl,
    required this.timestamp,
    this.severity = ViolationSeverity.medium,
    this.isResolved = false,
    this.resolvedBy,
    this.resolution,
  });

  /// Label tipe pelanggaran dalam bahasa Indonesia
  String get typeLabel {
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

  /// Ikon tipe pelanggaran
  String get typeIcon {
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

  /// Warna tingkat keparahan
  int get severityColor {
    switch (severity) {
      case ViolationSeverity.low:
        return 0xFFf59e0b; // Amber
      case ViolationSeverity.medium:
        return 0xFFf97316; // Orange
      case ViolationSeverity.high:
        return 0xFFef4444; // Red
    }
  }

  /// Label tingkat keparahan
  String get severityLabel {
    switch (severity) {
      case ViolationSeverity.low:
        return 'Rendah';
      case ViolationSeverity.medium:
        return 'Sedang';
      case ViolationSeverity.high:
        return 'Tinggi';
    }
  }

  /// Format waktu pelanggaran
  String get timeFormatted {
    return '${timestamp.hour.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')}:${timestamp.second.toString().padLeft(2, '0')}';
  }

  factory Violation.fromJson(Map<String, dynamic> json) {
    return Violation(
      id: json['id']?.toString() ?? '',
      sessionId: json['session_id']?.toString() ?? '',
      studentId: json['student_id']?.toString() ?? '',
      studentName: json['student_name'] ?? '',
      studentAvatar: json['student_avatar'],
      type: _parseType(json['type']),
      description: json['description'] ?? '',
      screenshotUrl: json['screenshot_url'],
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      severity: _parseSeverity(json['severity']),
      isResolved: json['is_resolved'] ?? false,
      resolvedBy: json['resolved_by'],
      resolution: json['resolution'],
    );
  }

  static ViolationType _parseType(dynamic type) {
    if (type is String) {
      switch (type.toLowerCase()) {
        case 'app_switch':
          return ViolationType.appSwitch;
        case 'screenshot':
          return ViolationType.screenshot;
        case 'screen_capture':
          return ViolationType.screenCapture;
        case 'multiple_devices':
          return ViolationType.multipleDevices;
        case 'idle_too_long':
          return ViolationType.idleTooLong;
        case 'face_not_detected':
          return ViolationType.faceNotDetected;
        case 'tab_switch':
          return ViolationType.tabSwitch;
        default:
          return ViolationType.other;
      }
    }
    return ViolationType.other;
  }

  static ViolationSeverity _parseSeverity(dynamic severity) {
    if (severity is String) {
      switch (severity.toLowerCase()) {
        case 'low':
        case 'rendah':
          return ViolationSeverity.low;
        case 'high':
        case 'tinggi':
          return ViolationSeverity.high;
        default:
          return ViolationSeverity.medium;
      }
    }
    return ViolationSeverity.medium;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'session_id': sessionId,
      'student_id': studentId,
      'student_name': studentName,
      'student_avatar': studentAvatar,
      'type': type.name,
      'description': description,
      'screenshot_url': screenshotUrl,
      'timestamp': timestamp.toIso8601String(),
      'severity': severity.name,
      'is_resolved': isResolved,
      'resolved_by': resolvedBy,
      'resolution': resolution,
    };
  }
}

/// Tipe pelanggaran
enum ViolationType {
  appSwitch,
  screenshot,
  screenCapture,
  multipleDevices,
  idleTooLong,
  faceNotDetected,
  tabSwitch,
  other,
}

/// Tingkat keparahan pelanggaran
enum ViolationSeverity {
  low,
  medium,
  high,
}
