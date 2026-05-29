/// Model jawaban siswa untuk pertanyaan ujian
class Answer {
  final String id;
  final String questionId;
  final String examId;
  final String studentId;
  final String? selectedOption; // Label opsi: A, B, C, D, E
  final String? essayText;
  final bool isCorrect;
  final int? pointsEarned;
  final int? maxPoints;
  final DateTime? answeredAt;

  const Answer({
    required this.id,
    required this.questionId,
    required this.examId,
    required this.studentId,
    this.selectedOption,
    this.essayText,
    this.isCorrect = false,
    this.pointsEarned,
    this.maxPoints,
    this.answeredAt,
  });

  /// Apakah jawaban untuk pilihan ganda
  bool get isPg => selectedOption != null;

  /// Apakah jawaban untuk esai
  bool get isEssay => essayText != null;

  /// Membuat Answer dari JSON (respons API)
  factory Answer.fromJson(Map<String, dynamic> json) {
    return Answer(
      id: json['id']?.toString() ?? '',
      questionId: json['question_id']?.toString() ?? '',
      examId: json['exam_id']?.toString() ?? '',
      studentId: json['student_id']?.toString() ?? '',
      selectedOption: json['selected_option'],
      essayText: json['essay_text'],
      isCorrect: json['is_correct'] ?? false,
      pointsEarned: json['points_earned'],
      maxPoints: json['max_points'],
      answeredAt: json['answered_at'] != null
          ? DateTime.tryParse(json['answered_at'])
          : null,
    );
  }

  /// Mengubah Answer menjadi JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question_id': questionId,
      'exam_id': examId,
      'student_id': studentId,
      'selected_option': selectedOption,
      'essay_text': essayText,
      'is_correct': isCorrect,
      'points_earned': pointsEarned,
      'max_points': maxPoints,
      'answered_at': answeredAt?.toIso8601String(),
    };
  }

  Answer copyWith({
    String? id,
    String? questionId,
    String? examId,
    String? studentId,
    String? selectedOption,
    String? essayText,
    bool? isCorrect,
    int? pointsEarned,
    int? maxPoints,
    DateTime? answeredAt,
  }) {
    return Answer(
      id: id ?? this.id,
      questionId: questionId ?? this.questionId,
      examId: examId ?? this.examId,
      studentId: studentId ?? this.studentId,
      selectedOption: selectedOption ?? this.selectedOption,
      essayText: essayText ?? this.essayText,
      isCorrect: isCorrect ?? this.isCorrect,
      pointsEarned: pointsEarned ?? this.pointsEarned,
      maxPoints: maxPoints ?? this.maxPoints,
      answeredAt: answeredAt ?? this.answeredAt,
    );
  }
}

/// Model hasil ujian
class ExamResult {
  final String examId;
  final String examTitle;
  final String subject;
  final double totalScore;
  final double pgScore;
  final double essayScore;
  final int correctAnswers;
  final int incorrectAnswers;
  final int unanswered;
  final int totalQuestions;
  final double percentage;
  final String grade;
  final Duration timeTaken;
  final List<AnswerReview>? answerReviews;
  final DateTime? completedAt;

  const ExamResult({
    required this.examId,
    required this.examTitle,
    required this.subject,
    required this.totalScore,
    required this.pgScore,
    required this.essayScore,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.unanswered,
    required this.totalQuestions,
    required this.percentage,
    required this.grade,
    required this.timeTaken,
    this.answerReviews,
    this.completedAt,
  });

  /// Apakah lulus (nilai >= 70)
  bool get isPassed => totalScore >= 70;

  /// Label kelulusan
  String get passLabel => isPassed ? 'LULUS' : 'TIDAK LULUS';

  /// Warna status kelulusan
  int get passColor => isPassed ? 0xFF22c55e : 0xFFef4444;

  factory ExamResult.fromJson(Map<String, dynamic> json) {
    return ExamResult(
      examId: json['exam_id']?.toString() ?? '',
      examTitle: json['exam_title'] ?? '',
      subject: json['subject'] ?? '',
      totalScore: (json['total_score'] ?? 0).toDouble(),
      pgScore: (json['pg_score'] ?? 0).toDouble(),
      essayScore: (json['essay_score'] ?? 0).toDouble(),
      correctAnswers: json['correct_answers'] ?? 0,
      incorrectAnswers: json['incorrect_answers'] ?? 0,
      unanswered: json['unanswered'] ?? 0,
      totalQuestions: json['total_questions'] ?? 0,
      percentage: (json['percentage'] ?? 0).toDouble(),
      grade: json['grade'] ?? '',
      timeTaken: Duration(seconds: json['time_taken_seconds'] ?? 0),
      answerReviews: json['answer_reviews'] != null
          ? (json['answer_reviews'] as List)
              .map((e) => AnswerReview.fromJson(e))
              .toList()
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.tryParse(json['completed_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'exam_id': examId,
      'exam_title': examTitle,
      'subject': subject,
      'total_score': totalScore,
      'pg_score': pgScore,
      'essay_score': essayScore,
      'correct_answers': correctAnswers,
      'incorrect_answers': incorrectAnswers,
      'unanswered': unanswered,
      'total_questions': totalQuestions,
      'percentage': percentage,
      'grade': grade,
      'time_taken_seconds': timeTaken.inSeconds,
    };
  }
}

/// Review jawaban untuk detail hasil
class AnswerReview {
  final int questionNumber;
  final String questionText;
  final String? selectedOption;
  final String correctOption;
  final bool isCorrect;
  final String? explanation;

  const AnswerReview({
    required this.questionNumber,
    required this.questionText,
    this.selectedOption,
    required this.correctOption,
    required this.isCorrect,
    this.explanation,
  });

  factory AnswerReview.fromJson(Map<String, dynamic> json) {
    return AnswerReview(
      questionNumber: json['question_number'] ?? 0,
      questionText: json['question_text'] ?? '',
      selectedOption: json['selected_option'],
      correctOption: json['correct_option'] ?? '',
      isCorrect: json['is_correct'] ?? false,
      explanation: json['explanation'],
    );
  }
}
