/// Konfigurasi API untuk aplikasi UjianKu
class ApiConfig {
  /// URL dasar API backend
  /// Ganti dengan domain yang sesuai setelah deployment
  static String baseUrl = 'https://your-domain.com/api/v1';

  /// Timeout koneksi dalam detik
  static const int connectTimeout = 15;

  /// Timeout menerima data dalam detik
  static const int receiveTimeout = 30;

  /// Endpoint autentikasi
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';
  static const String refreshToken = '/auth/refresh';

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
  static String proctorMonitor(String id) => '/proctor/sessions/$id/monitor';
  static String proctorSessionStudents(String id) =>
      '/proctor/sessions/$id/students';
  static const String proctorViolations = '/proctor/violations';
  static String proctorStudentDetail(String sessionId, String studentId) =>
      '/proctor/sessions/$sessionId/students/$studentId';
  static String proctorWarnStudent(String sessionId, String studentId) =>
      '/proctor/sessions/$sessionId/students/$studentId/warn';
  static String proctorDisqualifyStudent(String sessionId, String studentId) =>
      '/proctor/sessions/$sessionId/students/$studentId/disqualify';
  static String proctorAllowStudent(String sessionId, String studentId) =>
      '/proctor/sessions/$sessionId/students/$studentId/allow';
  static String proctorReport(String sessionId) =>
      '/proctor/sessions/$sessionId/report';
  static String proctorEndSession(String sessionId) =>
      '/proctor/sessions/$sessionId/end';

  /// Metode untuk memperbarui URL dasar
  static void updateBaseUrl(String newUrl) {
    baseUrl = newUrl;
  }
}
