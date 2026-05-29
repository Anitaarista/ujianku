/// Model pertanyaan ujian
class Question {
  final String id;
  final String examId;
  final int number;
  final QuestionType type;
  final String text;
  final String? imageUrl;
  final List<QuestionOption>? options;
  final int? points;
  final AnswerStatus answerStatus;
  final String? selectedAnswer;
  final bool isFlagged;

  const Question({
    required this.id,
    required this.examId,
    required this.number,
    this.type = QuestionType.multipleChoice,
    required this.text,
    this.imageUrl,
    this.options,
    this.points,
    this.answerStatus = AnswerStatus.unanswered,
    this.selectedAnswer,
    this.isFlagged = false,
  });

  /// Apakah pertanyaan sudah dijawab
  bool get isAnswered => answerStatus == AnswerStatus.answered;

  /// Apakah pertanyaan bertipe pilihan ganda
  bool get isMultipleChoice => type == QuestionType.multipleChoice;

  /// Apakah pertanyaan bertipe esai
  bool get isEssay => type == QuestionType.essay;

  /// Membuat Question dari JSON (respons API)
  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id']?.toString() ?? '',
      examId: json['exam_id']?.toString() ?? '',
      number: json['number'] ?? 0,
      type: _parseType(json['type']),
      text: json['text'] ?? '',
      imageUrl: json['image_url'],
      options: json['options'] != null
          ? (json['options'] as List)
              .map((e) => QuestionOption.fromJson(e))
              .toList()
          : null,
      points: json['points'],
      answerStatus: _parseAnswerStatus(json['answer_status']),
      selectedAnswer: json['selected_answer'],
      isFlagged: json['is_flagged'] ?? false,
    );
  }

  static QuestionType _parseType(dynamic type) {
    if (type is String) {
      switch (type.toLowerCase()) {
        case 'essay':
        case 'esai':
          return QuestionType.essay;
        default:
          return QuestionType.multipleChoice;
      }
    }
    return QuestionType.multipleChoice;
  }

  static AnswerStatus _parseAnswerStatus(dynamic status) {
    if (status is String) {
      switch (status.toLowerCase()) {
        case 'answered':
          return AnswerStatus.answered;
        case 'flagged':
          return AnswerStatus.flagged;
        default:
          return AnswerStatus.unanswered;
      }
    }
    return AnswerStatus.unanswered;
  }

  /// Mengubah Question menjadi JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'exam_id': examId,
      'number': number,
      'type': type.name,
      'text': text,
      'image_url': imageUrl,
      'options': options?.map((e) => e.toJson()).toList(),
      'points': points,
      'answer_status': answerStatus.name,
      'selected_answer': selectedAnswer,
      'is_flagged': isFlagged,
    };
  }

  Question copyWith({
    String? id,
    String? examId,
    int? number,
    QuestionType? type,
    String? text,
    String? imageUrl,
    List<QuestionOption>? options,
    int? points,
    AnswerStatus? answerStatus,
    String? selectedAnswer,
    bool? isFlagged,
  }) {
    return Question(
      id: id ?? this.id,
      examId: examId ?? this.examId,
      number: number ?? this.number,
      type: type ?? this.type,
      text: text ?? this.text,
      imageUrl: imageUrl ?? this.imageUrl,
      options: options ?? this.options,
      points: points ?? this.points,
      answerStatus: answerStatus ?? this.answerStatus,
      selectedAnswer: selectedAnswer ?? this.selectedAnswer,
      isFlagged: isFlagged ?? this.isFlagged,
    );
  }
}

/// Tipe pertanyaan
enum QuestionType {
  multipleChoice,
  essay,
}

/// Status jawaban
enum AnswerStatus {
  unanswered,
  answered,
  flagged,
}

/// Opsi pertanyaan pilihan ganda
class QuestionOption {
  final String label; // A, B, C, D, E
  final String text;
  final bool isCorrect; // Hanya digunakan saat review jawaban

  const QuestionOption({
    required this.label,
    required this.text,
    this.isCorrect = false,
  });

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      label: json['label'] ?? '',
      text: json['text'] ?? '',
      isCorrect: json['is_correct'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'text': text,
      'is_correct': isCorrect,
    };
  }
}
