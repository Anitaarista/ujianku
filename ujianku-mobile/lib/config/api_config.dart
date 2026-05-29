/// Konfigurasi API untuk aplikasi UjianKu
class ApiConfig {
  /// URL dasar API backend
  /// Domain production UjianKu
  static String baseUrl = 'https://ujianku-admin.space-z.ai/api/v1';

  /// Timeout koneksi dalam detik
  static const int connectTimeout = 15;

  /// Timeout menerima data dalam detik
  static const int receiveTimeout = 30;

  /// Endpoint autentikasi
  static const String login = '/auth/login';
  static const String me = '/auth/me';
  static const String register = '/auth/register';

  /// Endpoint ujian (siswa)
  static const String exams = '/exams';
  static String examDetail(String id) => '/exams/$id';
  static String examStart(String id) => '/exams/$id/start';
  static String examQuestions(String id) => '/exams/$id/questions';
  static String examAnswer(String id) => '/exams/$id/answer';
  static String examSubmit(String id) => '/exams/$id/submit';
  static String examResult(String id) => '/exams/$id/result';

  /// Endpoint pengawas
  static const String proctorSessions = '/proctor/sessions';
  static String proctorSessionDetail(String id) => '/proctor/sessions/$id';
  static String proctorMonitor(String id) => '/proctor/sessions/$id/monitor';
  static String proctorEndSession(String sessionId) =>
      '/proctor/sessions/$sessionId/end';
  static const String proctorViolations = '/proctor/violations';

  /// Endpoint siswa
  static const String siswaExams = '/siswa/exams';
  static const String siswaResults = '/siswa/results';
  static const String siswaProfile = '/siswa/profile';

  /// Endpoint guru
  static const String guruExams = '/guru/exams';
  static const String guruBankSoal = '/guru/bank-soal';
  static const String guruResults = '/guru/results';

  /// Metode untuk memperbarui URL dasar
  static void updateBaseUrl(String newUrl) {
    baseUrl = newUrl;
  }
}
