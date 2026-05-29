/// Model pengguna aplikasi UjianKu
class User {
  final String id;
  final String name;
  final String email;
  final String role; // 'admin', 'guru', 'siswa', atau 'pengawas'
  final String? avatar;
  final String? nisn; // Nomor Induk Siswa Nasional (untuk siswa)
  final String? nip; // Nomor Induk Pegawai (untuk pengawas/guru)
  final String? className; // Kelas (untuk siswa)
  final String? school;
  final DateTime? createdAt;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.avatar,
    this.nisn,
    this.nip,
    this.className,
    this.school,
    this.createdAt,
  });

  /// Apakah pengguna adalah admin
  bool get isAdmin => role == 'admin';

  /// Apakah pengguna adalah guru
  bool get isGuru => role == 'guru';

  /// Apakah pengguna adalah siswa
  bool get isSiswa => role == 'siswa';

  /// Apakah pengguna adalah pengawas
  bool get isPengawas => role == 'pengawas';

  /// Inisial nama untuk avatar placeholder
  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  /// Membuat User dari JSON (respons API)
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'siswa',
      avatar: json['avatar'],
      nisn: json['nisn'],
      nip: json['nip'],
      className: json['class_name'] ?? json['className'],
      school: json['school'],
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'])
          : null,
    );
  }

  /// Mengubah User menjadi JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'avatar': avatar,
      'nisn': nisn,
      'nip': nip,
      'class_name': className,
      'school': school,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  /// Membuat salinan User dengan nilai yang diperbarui
  User copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? avatar,
    String? nisn,
    String? nip,
    String? className,
    String? school,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      avatar: avatar ?? this.avatar,
      nisn: nisn ?? this.nisn,
      nip: nip ?? this.nip,
      className: className ?? this.className,
      school: school ?? this.school,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
