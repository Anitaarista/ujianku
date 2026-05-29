/// Model ujian untuk aplikasi UjianKu
class Exam {
  final String id;
  final String title;
  final String subject;
  final String? description;
  final DateTime startTime;
  final DateTime endTime;
  final int duration; // dalam menit
  final int totalQuestions;
  final int totalPg;
  final int totalEssay;
  final ExamStatus status;
  final bool requiresToken;
  final String? token;
  final String? className;
  final String? teacherName;
  final String? instructions;
  final DateTime? createdAt;

  const Exam({
    required this.id,
    required this.title,
    required this.subject,
    this.description,
    required this.startTime,
    required this.endTime,
    required this.duration,
    required this.totalQuestions,
    this.totalPg = 0,
    this.totalEssay = 0,
    this.status = ExamStatus.upcoming,
    this.requiresToken = false,
    this.token,
    this.className,
    this.teacherName,
    this.instructions,
    this.createdAt,
  });

  /// Apakah ujian sedang berlangsung
  bool get isOngoing => status == ExamStatus.ongoing;

  /// Apakah ujian belum dimulai
  bool get isUpcoming => status == ExamStatus.upcoming;

  /// Apakah ujian sudah selesai
  bool get isCompleted => status == ExamStatus.completed;

  /// Durasi tersisa dalam detik
  int get remainingSeconds {
    if (!isOngoing) return 0;
    final remaining = endTime.difference(DateTime.now());
    return remaining.inSeconds > 0 ? remaining.inSeconds : 0;
  }

  /// Format durasi (contoh: "90 menit")
  String get durationFormatted => '$duration menit';

  /// Format tanggal mulai
  String get startTimeFormatted {
    return '${startTime.day}/${startTime.month}/${startTime.year} ${startTime.hour.toString().padLeft(2, '0')}:${startTime.minute.toString().padLeft(2, '0')}';
  }

  /// Label status dalam bahasa Indonesia
  String get statusLabel {
    switch (status) {
      case ExamStatus.upcoming:
        return 'Mendatang';
      case ExamStatus.ongoing:
        return 'Berlangsung';
      case ExamStatus.completed:
        return 'Selesai';
    }
  }

  /// Membuat Exam dari JSON (respons API)
  factory Exam.fromJson(Map<String, dynamic> json) {
    return Exam(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      subject: json['subject'] ?? '',
      description: json['description'],
      startTime: json['start_time'] != null
          ? DateTime.parse(json['start_time'])
          : DateTime.now(),
      endTime: json['end_time'] != null
          ? DateTime.parse(json['end_time'])
          : DateTime.now(),
      duration: json['duration'] ?? 0,
      totalQuestions: json['total_questions'] ?? 0,
      totalPg: json['total_pg'] ?? 0,
      totalEssay: json['total_essay'] ?? 0,
      status: _parseStatus(json['status']),
      requiresToken: json['requires_token'] ?? false,
      token: json['token'],
      className: json['class_name'] ?? json['className'],
      teacherName: json['teacher_name'] ?? json['teacherName'],
      instructions: json['instructions'],
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'])
          : null,
    );
  }

  static ExamStatus _parseStatus(dynamic status) {
    if (status is String) {
      switch (status.toLowerCase()) {
        case 'ongoing':
        case 'berlangsung':
          return ExamStatus.ongoing;
        case 'completed':
        case 'selesai':
          return ExamStatus.completed;
        default:
          return ExamStatus.upcoming;
      }
    }
    return ExamStatus.upcoming;
  }

  /// Mengubah Exam menjadi JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subject': subject,
      'description': description,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'duration': duration,
      'total_questions': totalQuestions,
      'total_pg': totalPg,
      'total_essay': totalEssay,
      'status': status.name,
      'requires_token': requiresToken,
      'token': token,
      'class_name': className,
      'teacher_name': teacherName,
      'instructions': instructions,
    };
  }

  Exam copyWith({
    String? id,
    String? title,
    String? subject,
    String? description,
    DateTime? startTime,
    DateTime? endTime,
    int? duration,
    int? totalQuestions,
    int? totalPg,
    int? totalEssay,
    ExamStatus? status,
    bool? requiresToken,
    String? token,
    String? className,
    String? teacherName,
    String? instructions,
  }) {
    return Exam(
      id: id ?? this.id,
      title: title ?? this.title,
      subject: subject ?? this.subject,
      description: description ?? this.description,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      duration: duration ?? this.duration,
      totalQuestions: totalQuestions ?? this.totalQuestions,
      totalPg: totalPg ?? this.totalPg,
      totalEssay: totalEssay ?? this.totalEssay,
      status: status ?? this.status,
      requiresToken: requiresToken ?? this.requiresToken,
      token: token ?? this.token,
      className: className ?? this.className,
      teacherName: teacherName ?? this.teacherName,
      instructions: instructions ?? this.instructions,
    );
  }
}

/// Status ujian
enum ExamStatus {
  upcoming,
  ongoing,
  completed,
}

/// Filter ujian untuk tampilan daftar
enum ExamFilter {
  all('Semua'),
  ongoing('Berlangsung'),
  upcoming('Mendatang'),
  completed('Selesai');

  final String label;
  const ExamFilter(this.label);
}
