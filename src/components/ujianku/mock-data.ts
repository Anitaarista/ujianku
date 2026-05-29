// UjianKu - Mock Data for Indonesian Online Exam Platform

export type Role = 'ADMIN' | 'GURU' | 'PENGAWAS' | 'SISWA'

export interface MockUser {
  id: string
  name: string
  email: string
  role: Role
  nipNis: string
  phone: string
  avatar: string
  isActive: boolean
}

export interface MockSekolah {
  id: string
  nama: string
  alamat: string
  npsn: string
  logo: string
  isActive: boolean
  totalKelas: number
  totalSiswa: number
}

export interface MockKelas {
  id: string
  nama: string
  tingkat: number
  tahunAjaran: string
  sekolahId: string
  waliKelas: string
  totalSiswa: number
}

export interface MockMapel {
  id: string
  kode: string
  nama: string
  kkm: number
  kelompok: string
  guru: string
}

export interface MockBankSoal {
  id: string
  mataPelajaran: string
  guru: string
  tipeSoal: string
  tingkatKesulitan: string
  pertanyaan: string
  opsiA?: string
  opsiB?: string
  opsiC?: string
  opsiD?: string
  opsiE?: string
  jawabanBenar?: string
  pembahasan?: string
  poin: number
  isPublic: boolean
}

export interface MockExam {
  id: string
  judul: string
  deskripsi: string
  mataPelajaran: string
  guru: string
  durasi: number
  tipeExam: string
  token: string
  status: string
  tanggalMulai: string
  tanggalSelesai: string
  acakSoal: boolean
  acakOpsi: boolean
  showResult: boolean
  antiCheat: boolean
  totalSoal: number
  totalPeserta: number
  kelas: string[]
}

export interface MockExamResult {
  id: string
  examId: string
  examJudul: string
  siswa: string
  kelas: string
  nilai: number
  nilaiEssay: number
  totalNilai: number
  durasi: number
  status: string
  selesaiPada: string
}

export interface MockViolation {
  id: string
  siswa: string
  exam: string
  tipe: string
  deskripsi: string
  waktu: string
  severity: 'low' | 'medium' | 'high'
}

export interface MockProctorSession {
  id: string
  exam: string
  kelas: string
  pengawas: string
  status: string
  totalSiswa: number
  aktifSiswa: number
  violations: number
}

export interface MockNotification {
  id: string
  judul: string
  pesan: string
  tipe: string
  isRead: boolean
  waktu: string
}

// ==================== USERS ====================
export const mockUsers: MockUser[] = [
  { id: 'u1', name: 'Dr. Ahmad Fauzi, M.Pd', email: 'ahmad.fauzi@ujianku.id', role: 'ADMIN', nipNis: '198503142010011001', phone: '081234567890', avatar: '', isActive: true },
  { id: 'u2', name: 'Siti Nurhaliza, S.Pd', email: 'siti.nurhaliza@ujianku.id', role: 'GURU', nipNis: '199001152015012003', phone: '081234567891', avatar: '', isActive: true },
  { id: 'u3', name: 'Budi Santoso, S.Pd', email: 'budi.santoso@ujianku.id', role: 'GURU', nipNis: '198705202012011004', phone: '081234567892', avatar: '', isActive: true },
  { id: 'u4', name: 'Dewi Kartika, M.Pd', email: 'dewi.kartika@ujianku.id', role: 'GURU', nipNis: '199203252014022005', phone: '081234567893', avatar: '', isActive: true },
  { id: 'u5', name: 'Rina Wulandari', email: 'rina.wulandari@ujianku.id', role: 'PENGAWAS', nipNis: '199108302016003006', phone: '081234567894', avatar: '', isActive: true },
  { id: 'u6', name: 'Agus Prasetyo', email: 'agus.prasetyo@ujianku.id', role: 'PENGAWAS', nipNis: '198912102017004007', phone: '081234567895', avatar: '', isActive: true },
  { id: 'u7', name: 'Rizky Pratama', email: 'rizky.pratama@siswa.sch.id', role: 'SISWA', nipNis: '2024001', phone: '081234567896', avatar: '', isActive: true },
  { id: 'u8', name: 'Anisa Rahma', email: 'anisa.rahma@siswa.sch.id', role: 'SISWA', nipNis: '2024002', phone: '081234567897', avatar: '', isActive: true },
  { id: 'u9', name: 'Fajar Nugroho', email: 'fajar.nugroho@siswa.sch.id', role: 'SISWA', nipNis: '2024003', phone: '081234567898', avatar: '', isActive: true },
  { id: 'u10', name: 'Putri Handayani', email: 'putri.handayani@siswa.sch.id', role: 'SISWA', nipNis: '2024004', phone: '081234567899', avatar: '', isActive: true },
  { id: 'u11', name: 'Dimas Arya Putra', email: 'dimas.arya@siswa.sch.id', role: 'SISWA', nipNis: '2024005', phone: '081234567800', avatar: '', isActive: true },
  { id: 'u12', name: 'Laila Fitriani', email: 'laila.fitriani@siswa.sch.id', role: 'SISWA', nipNis: '2024006', phone: '081234567801', avatar: '', isActive: true },
  { id: 'u13', name: 'Hendra Wijaya', email: 'hendra.wijaya@ujianku.id', role: 'GURU', nipNis: '198601052011011008', phone: '081234567802', avatar: '', isActive: true },
  { id: 'u14', name: 'Maya Sari, S.Pd', email: 'maya.sari@ujianku.id', role: 'GURU', nipNis: '199305122015022009', phone: '081234567803', avatar: '', isActive: false },
  { id: 'u15', name: 'Yusuf Ibrahim', email: 'yusuf.ibrahim@siswa.sch.id', role: 'SISWA', nipNis: '2024007', phone: '081234567804', avatar: '', isActive: true },
]

// ==================== SEKOLAH ====================
export const mockSekolah: MockSekolah[] = [
  { id: 's1', nama: 'SMA Negeri 1 Jakarta', alamat: 'Jl. Budi Utomo No. 7, Jakarta Pusat', npsn: '001001', logo: '', isActive: true, totalKelas: 24, totalSiswa: 864 },
  { id: 's2', nama: 'SMA Negeri 3 Bandung', alamat: 'Jl. Belitung No. 8, Bandung', npsn: '002001', logo: '', isActive: true, totalKelas: 18, totalSiswa: 648 },
  { id: 's3', nama: 'SMA Negeri 1 Surabaya', alamat: 'Jl. Mayjen Sungkono No. 1, Surabaya', npsn: '003001', logo: '', isActive: true, totalKelas: 21, totalSiswa: 756 },
]

// ==================== KELAS ====================
export const mockKelas: MockKelas[] = [
  { id: 'k1', nama: 'X IPA 1', tingkat: 10, tahunAjaran: '2024/2025', sekolahId: 's1', waliKelas: 'Siti Nurhaliza, S.Pd', totalSiswa: 36 },
  { id: 'k2', nama: 'X IPA 2', tingkat: 10, tahunAjaran: '2024/2025', sekolahId: 's1', waliKelas: 'Budi Santoso, S.Pd', totalSiswa: 36 },
  { id: 'k3', nama: 'XI IPA 1', tingkat: 11, tahunAjaran: '2024/2025', sekolahId: 's1', waliKelas: 'Dewi Kartika, M.Pd', totalSiswa: 34 },
  { id: 'k4', nama: 'XI IPA 2', tingkat: 11, tahunAjaran: '2024/2025', sekolahId: 's1', waliKelas: 'Hendra Wijaya', totalSiswa: 35 },
  { id: 'k5', nama: 'XII IPA 1', tingkat: 12, tahunAjaran: '2024/2025', sekolahId: 's1', waliKelas: 'Siti Nurhaliza, S.Pd', totalSiswa: 32 },
  { id: 'k6', nama: 'XII IPS 1', tingkat: 12, tahunAjaran: '2024/2025', sekolahId: 's1', waliKelas: 'Maya Sari, S.Pd', totalSiswa: 34 },
  { id: 'k7', nama: 'X IPA 1', tingkat: 10, tahunAjaran: '2024/2025', sekolahId: 's2', waliKelas: 'Budi Santoso, S.Pd', totalSiswa: 36 },
  { id: 'k8', nama: 'XI IPA 1', tingkat: 11, tahunAjaran: '2024/2025', sekolahId: 's2', waliKelas: 'Dewi Kartika, M.Pd', totalSiswa: 34 },
]

// ==================== MATA PELAJARAN ====================
export const mockMapel: MockMapel[] = [
  { id: 'mp1', kode: 'MTK', nama: 'Matematika', kkm: 75, kelompok: 'Wajib', guru: 'Siti Nurhaliza, S.Pd' },
  { id: 'mp2', kode: 'BIN', nama: 'Bahasa Indonesia', kkm: 75, kelompok: 'Wajib', guru: 'Budi Santoso, S.Pd' },
  { id: 'mp3', kode: 'BIG', nama: 'Bahasa Inggris', kkm: 70, kelompok: 'Wajib', guru: 'Dewi Kartika, M.Pd' },
  { id: 'mp4', kode: 'FIS', nama: 'Fisika', kkm: 75, kelompok: 'Peminatan', guru: 'Hendra Wijaya' },
  { id: 'mp5', kode: 'KIM', nama: 'Kimia', kkm: 75, kelompok: 'Peminatan', guru: 'Siti Nurhaliza, S.Pd' },
  { id: 'mp6', kode: 'BIO', nama: 'Biologi', kkm: 75, kelompok: 'Peminatan', guru: 'Budi Santoso, S.Pd' },
  { id: 'mp7', kode: 'EKO', nama: 'Ekonomi', kkm: 70, kelompok: 'Peminatan', guru: 'Maya Sari, S.Pd' },
  { id: 'mp8', kode: 'PKN', nama: 'Pendidikan Kewarganegaraan', kkm: 75, kelompok: 'Wajib', guru: 'Dewi Kartika, M.Pd' },
  { id: 'mp9', kode: 'SJO', nama: 'Sejarah Indonesia', kkm: 70, kelompok: 'Wajib', guru: 'Hendra Wijaya' },
  { id: 'mp10', kode: 'SBK', nama: 'Seni Budaya', kkm: 70, kelompok: 'Wajib', guru: 'Maya Sari, S.Pd' },
]

// ==================== BANK SOAL ====================
export const mockBankSoal: MockBankSoal[] = [
  {
    id: 'bs1', mataPelajaran: 'Matematika', guru: 'Siti Nurhaliza, S.Pd', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
    pertanyaan: 'Jika f(x) = 2x² - 3x + 1, maka f(3) = ...',
    opsiA: '10', opsiB: '11', opsiC: '12', opsiD: '13', opsiE: '14',
    jawabanBenar: 'A', pembahasan: 'f(3) = 2(3)² - 3(3) + 1 = 2(9) - 9 + 1 = 18 - 9 + 1 = 10', poin: 2, isPublic: true
  },
  {
    id: 'bs2', mataPelajaran: 'Matematika', guru: 'Siti Nurhaliza, S.Pd', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
    pertanyaan: 'Turunan dari f(x) = 3x³ - 2x² + 5x adalah ...',
    opsiA: '9x² - 4x + 5', opsiB: '9x² - 4x', opsiC: '3x² - 4x + 5', opsiD: '9x - 4', opsiE: '6x² - 4x + 5',
    jawabanBenar: 'A', pembahasan: "f'(x) = 9x² - 4x + 5 menggunakan aturan turunan", poin: 2, isPublic: true
  },
  {
    id: 'bs3', mataPelajaran: 'Matematika', guru: 'Siti Nurhaliza, S.Pd', tipeSoal: 'ESSAY', tingkatKesulitan: 'SULIT',
    pertanyaan: 'Tentukan luas daerah yang dibatasi oleh kurva y = x² - 4 dan y = x + 2!',
    jawabanBenar: 'Luas = 20.5 satuan luas', pembahasan: 'Cari titik potong: x² - 4 = x + 2 → x² - x - 6 = 0 → x = 3 atau x = -2. Luas = ∫₋₂³ [(x+2) - (x²-4)] dx = 20.5', poin: 5, isPublic: false
  },
  {
    id: 'bs4', mataPelajaran: 'Bahasa Indonesia', guru: 'Budi Santoso, S.Pd', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
    pertanyaan: 'Kata baku dari "aktifitas" adalah ...',
    opsiA: 'Aktivitas', opsiB: 'Aktifitas', opsiC: 'Aktivetas', opsiD: 'Aktipitas', opsiE: 'Aktipitas',
    jawabanBenar: 'A', pembahasan: 'Kata baku yang benar adalah "aktivitas" sesuai KBBI', poin: 1, isPublic: true
  },
  {
    id: 'bs5', mataPelajaran: 'Bahasa Indonesia', guru: 'Budi Santoso, S.Pd', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
    pertanyaan: 'Majas yang terdapat dalam kalimat "Hatinya sedang berbunga-bunga" adalah ...',
    opsiA: 'Majas Hiperbola', opsiB: 'Majas Personifikasi', opsiC: 'Majas Metafora', opsiD: 'Majas Simile', opsiE: 'Majas Ironi',
    jawabanBenar: 'C', pembahasan: 'Metafora adalah majas perbandingan langsung. Hati yang berbunga-bunga membandingkan kebahagiaan dengan bunga', poin: 2, isPublic: true
  },
  {
    id: 'bs6', mataPelajaran: 'Bahasa Inggris', guru: 'Dewi Kartika, M.Pd', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
    pertanyaan: 'Choose the correct sentence: ...',
    opsiA: 'She has been living here since 2010', opsiB: 'She have been living here since 2010', opsiC: 'She has living here since 2010', opsiD: 'She is living here since 2010', opsiE: 'She was living here since 2010',
    jawabanBenar: 'A', pembahasan: 'Present perfect continuous: Subject + has/have + been + V-ing. "She" uses "has"', poin: 2, isPublic: true
  },
  {
    id: 'bs7', mataPelajaran: 'Fisika', guru: 'Hendra Wijaya', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
    pertanyaan: 'Sebuah benda bermassa 2 kg bergerak dengan kecepatan 10 m/s. Energi kinetik benda tersebut adalah ...',
    opsiA: '50 J', opsiB: '100 J', opsiC: '200 J', opsiD: '20 J', opsiE: '500 J',
    jawabanBenar: 'B', pembahasan: 'Ek = ½mv² = ½ × 2 × 10² = 100 J', poin: 2, isPublic: true
  },
  {
    id: 'bs8', mataPelajaran: 'Fisika', guru: 'Hendra Wijaya', tipeSoal: 'BENAR_SALAH', tingkatKesulitan: 'MUDAH',
    pertanyaan: 'Cahaya merambat lurus dalam medium homogen.',
    jawabanBenar: 'Benar', pembahasan: 'Hukum perambatan cahaya lurus berlaku dalam medium homogen', poin: 1, isPublic: true
  },
  {
    id: 'bs9', mataPelajaran: 'Kimia', guru: 'Siti Nurhaliza, S.Pd', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
    pertanyaan: 'Larutan dengan pH = 3 memiliki konsentrasi H⁺ sebesar ...',
    opsiA: '10⁻³ M', opsiB: '10³ M', opsiC: '10⁻¹¹ M', opsiD: '3 M', opsiE: '10⁻³⁻ M',
    jawabanBenar: 'A', pembahasan: 'pH = -log[H⁺], sehingga [H⁺] = 10⁻ᵖᴴ = 10⁻³ M', poin: 2, isPublic: true
  },
  {
    id: 'bs10', mataPelajaran: 'Biologi', guru: 'Budi Santoso, S.Pd', tipeSoal: 'JAWABAN_SINGKAT', tingkatKesulitan: 'MUDAH',
    pertanyaan: 'Organel sel yang berfungsi sebagai pusat pengendali sel adalah ...',
    jawabanBenar: 'Inti sel / Nukleus', pembahasan: 'Nukleus mengandung DNA yang mengendalikan semua aktivitas sel', poin: 2, isPublic: true
  },
  {
    id: 'bs11', mataPelajaran: 'Ekonomi', guru: 'Maya Sari, S.Pd', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
    pertanyaan: 'Badan usaha yang dimiliki oleh pemerintah disebut ...',
    opsiA: 'BUMN', opsiB: 'BUMS', opsiC: 'Koperasi', opsiD: 'Firma', opsiE: 'CV',
    jawabanBenar: 'A', pembahasan: 'BUMN = Badan Usaha Milik Negara', poin: 1, isPublic: true
  },
  {
    id: 'bs12', mataPelajaran: 'Sejarah Indonesia', guru: 'Hendra Wijaya', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
    pertanyaan: 'Proklamasi kemerdekaan Indonesia dibacakan pada tanggal ...',
    opsiA: '17 Agustus 1945', opsiB: '18 Agustus 1945', opsiC: '1 Juni 1945', opsiD: '17 Agustus 1944', opsiE: '10 November 1945',
    jawabanBenar: 'A', pembahasan: 'Proklamasi dibacakan oleh Ir. Soekarno pada 17 Agustus 1945 di Jl. Pegangsaan Timur No. 56', poin: 1, isPublic: true
  },
]

// ==================== EXAMS ====================
export const mockExams: MockExam[] = [
  {
    id: 'e1', judul: 'UTS Matematika Kelas XI IPA', deskripsi: 'Ujian Tengah Semester Ganjil Mata Pelajaran Matematika', mataPelajaran: 'Matematika', guru: 'Siti Nurhaliza, S.Pd',
    durasi: 90, tipeExam: 'UTS', token: 'MTK2024', status: 'ONGOING',
    tanggalMulai: '2025-03-10T08:00:00', tanggalSelesai: '2025-03-10T09:30:00',
    acakSoal: true, acakOpsi: true, showResult: false, antiCheat: true,
    totalSoal: 30, totalPeserta: 34, kelas: ['XI IPA 1', 'XI IPA 2']
  },
  {
    id: 'e2', judul: 'UAS Bahasa Indonesia Kelas X', deskripsi: 'Ujian Akhir Semester Ganjil Bahasa Indonesia', mataPelajaran: 'Bahasa Indonesia', guru: 'Budi Santoso, S.Pd',
    durasi: 120, tipeExam: 'UAS', token: 'BIN2024', status: 'PUBLISHED',
    tanggalMulai: '2025-03-15T08:00:00', tanggalSelesai: '2025-03-15T10:00:00',
    acakSoal: true, acakOpsi: false, showResult: true, antiCheat: true,
    totalSoal: 40, totalPeserta: 72, kelas: ['X IPA 1', 'X IPA 2']
  },
  {
    id: 'e3', judul: 'Quiz Fisika Bab 3', deskripsi: 'Quiz singkat materi Hukum Newton', mataPelajaran: 'Fisika', guru: 'Hendra Wijaya',
    durasi: 30, tipeExam: 'QUIZ', token: 'FIS3', status: 'SELESAI',
    tanggalMulai: '2025-03-05T10:00:00', tanggalSelesai: '2025-03-05T10:30:00',
    acakSoal: true, acakOpsi: true, showResult: true, antiCheat: false,
    totalSoal: 10, totalPeserta: 34, kelas: ['XI IPA 1']
  },
  {
    id: 'e4', judul: 'UTS Bahasa Inggris Kelas XII', deskripsi: 'Ujian Tengah Semester Bahasa Inggris', mataPelajaran: 'Bahasa Inggris', guru: 'Dewi Kartika, M.Pd',
    durasi: 90, tipeExam: 'UTS', token: 'BIG2024', status: 'DRAFT',
    tanggalMulai: '2025-03-20T08:00:00', tanggalSelesai: '2025-03-20T09:30:00',
    acakSoal: true, acakOpsi: true, showResult: false, antiCheat: true,
    totalSoal: 35, totalPeserta: 0, kelas: ['XII IPA 1']
  },
  {
    id: 'e5', judul: 'UAS Kimia Kelas XI', deskripsi: 'Ujian Akhir Semester Kimia', mataPelajaran: 'Kimia', guru: 'Siti Nurhaliza, S.Pd',
    durasi: 120, tipeExam: 'UAS', token: 'KIM2024', status: 'SELESAI',
    tanggalMulai: '2025-02-20T08:00:00', tanggalSelesai: '2025-02-20T10:00:00',
    acakSoal: true, acakOpsi: true, showResult: true, antiCheat: true,
    totalSoal: 40, totalPeserta: 69, kelas: ['XI IPA 1', 'XI IPA 2']
  },
  {
    id: 'e6', judul: 'Try Out SBMPTN 2025', deskripsi: 'Simulasi ujian masuk perguruan tinggi', mataPelajaran: 'Matematika', guru: 'Siti Nurhaliza, S.Pd',
    durasi: 120, tipeExam: 'TRYOUT', token: 'SBM2025', status: 'PUBLISHED',
    tanggalMulai: '2025-04-01T07:30:00', tanggalSelesai: '2025-04-01T09:30:00',
    acakSoal: true, acakOpsi: true, showResult: false, antiCheat: true,
    totalSoal: 50, totalPeserta: 200, kelas: ['XII IPA 1', 'XII IPS 1']
  },
]

// ==================== EXAM RESULTS ====================
export const mockExamResults: MockExamResult[] = [
  { id: 'r1', examId: 'e3', examJudul: 'Quiz Fisika Bab 3', siswa: 'Rizky Pratama', kelas: 'XI IPA 1', nilai: 85, nilaiEssay: 0, totalNilai: 85, durasi: 1620, status: 'SELESAI', selesaiPada: '2025-03-05T10:25:00' },
  { id: 'r2', examId: 'e3', examJudul: 'Quiz Fisika Bab 3', siswa: 'Anisa Rahma', kelas: 'XI IPA 1', nilai: 92, nilaiEssay: 0, totalNilai: 92, durasi: 1440, status: 'SELESAI', selesaiPada: '2025-03-05T10:22:00' },
  { id: 'r3', examId: 'e3', examJudul: 'Quiz Fisika Bab 3', siswa: 'Fajar Nugroho', kelas: 'XI IPA 1', nilai: 78, nilaiEssay: 0, totalNilai: 78, durasi: 1800, status: 'SELESAI', selesaiPada: '2025-03-05T10:30:00' },
  { id: 'r4', examId: 'e3', examJudul: 'Quiz Fisika Bab 3', siswa: 'Putri Handayani', kelas: 'XI IPA 1', nilai: 95, nilaiEssay: 0, totalNilai: 95, durasi: 1200, status: 'SELESAI', selesaiPada: '2025-03-05T10:18:00' },
  { id: 'r5', examId: 'e5', examJudul: 'UAS Kimia Kelas XI', siswa: 'Rizky Pratama', kelas: 'XI IPA 1', nilai: 76, nilaiEssay: 18, totalNilai: 76, durasi: 5400, status: 'SELESAI', selesaiPada: '2025-02-20T09:45:00' },
  { id: 'r6', examId: 'e5', examJudul: 'UAS Kimia Kelas XI', siswa: 'Anisa Rahma', kelas: 'XI IPA 1', nilai: 88, nilaiEssay: 20, totalNilai: 88, durasi: 6120, status: 'SELESAI', selesaiPada: '2025-02-20T09:58:00' },
  { id: 'r7', examId: 'e5', examJudul: 'UAS Kimia Kelas XI', siswa: 'Fajar Nugroho', kelas: 'XI IPA 1', nilai: 62, nilaiEssay: 12, totalNilai: 62, durasi: 7200, status: 'TIMEOUT', selesaiPada: '2025-02-20T10:00:00' },
  { id: 'r8', examId: 'e5', examJudul: 'UAS Kimia Kelas XI', siswa: 'Putri Handayani', kelas: 'XI IPA 1', nilai: 91, nilaiEssay: 22, totalNilai: 91, durasi: 5100, status: 'SELESAI', selesaiPada: '2025-02-20T09:33:00' },
  { id: 'r9', examId: 'e5', examJudul: 'UAS Kimia Kelas XI', siswa: 'Dimas Arya Putra', kelas: 'XI IPA 2', nilai: 70, nilaiEssay: 15, totalNilai: 70, durasi: 6600, status: 'SELESAI', selesaiPada: '2025-02-20T09:55:00' },
  { id: 'r10', examId: 'e5', examJudul: 'UAS Kimia Kelas XI', siswa: 'Laila Fitriani', kelas: 'XI IPA 2', nilai: 83, nilaiEssay: 19, totalNilai: 83, durasi: 5700, status: 'SELESAI', selesaiPada: '2025-02-20T09:40:00' },
]

// ==================== VIOLATIONS ====================
export const mockViolations: MockViolation[] = [
  { id: 'v1', siswa: 'Fajar Nugroho', exam: 'UTS Matematika Kelas XI IPA', tipe: 'TAB_SWITCH', deskripsi: 'Siswa berpindah tab sebanyak 3 kali', waktu: '2025-03-10T08:15:00', severity: 'medium' },
  { id: 'v2', siswa: 'Dimas Arya Putra', exam: 'UTS Matematika Kelas XI IPA', tipe: 'FACE_NOT_DETECTED', deskripsi: 'Wajah tidak terdeteksi selama 30 detik', waktu: '2025-03-10T08:22:00', severity: 'high' },
  { id: 'v3', siswa: 'Rizky Pratama', exam: 'UTS Matematika Kelas XI IPA', tipe: 'COPY_PASTE', deskripsi: 'Siswa mencoba copy-paste pada halaman ujian', waktu: '2025-03-10T08:35:00', severity: 'low' },
  { id: 'v4', siswa: 'Dimas Arya Putra', exam: 'UTS Matematika Kelas XI IPA', tipe: 'MULTIPLE_FACES', deskripsi: 'Terdeteksi lebih dari 1 wajah di depan layar', waktu: '2025-03-10T08:40:00', severity: 'high' },
  { id: 'v5', siswa: 'Yusuf Ibrahim', exam: 'UTS Matematika Kelas XI IPA', tipe: 'LEAVE_FULLSCREEN', deskripsi: 'Siswa keluar dari mode fullscreen', waktu: '2025-03-10T08:50:00', severity: 'low' },
  { id: 'v6', siswa: 'Fajar Nugroho', exam: 'UTS Matematika Kelas XI IPA', tipe: 'PHONE_DETECTED', deskripsi: 'Terdeteksi handphone di frame kamera', waktu: '2025-03-10T09:05:00', severity: 'high' },
  { id: 'v7', siswa: 'Laila Fitriani', exam: 'UAS Bahasa Indonesia Kelas X', tipe: 'TAB_SWITCH', deskripsi: 'Siswa berpindah tab 1 kali', waktu: '2025-03-15T08:28:00', severity: 'low' },
  { id: 'v8', siswa: 'Yusuf Ibrahim', exam: 'UAS Bahasa Indonesia Kelas X', tipe: 'SUSPICIOUS_BEHAVIOR', deskripsi: 'Gerakan kepala mencurigakan, seperti melihat ke bawah', waktu: '2025-03-15T09:10:00', severity: 'medium' },
]

// ==================== PROCTOR SESSIONS ====================
export const mockProctorSessions: MockProctorSession[] = [
  { id: 'ps1', exam: 'UTS Matematika Kelas XI IPA', kelas: 'XI IPA 1', pengawas: 'Rina Wulandari', status: 'AKTIF', totalSiswa: 34, aktifSiswa: 28, violations: 4 },
  { id: 'ps2', exam: 'UTS Matematika Kelas XI IPA', kelas: 'XI IPA 2', pengawas: 'Agus Prasetyo', status: 'AKTIF', totalSiswa: 35, aktifSiswa: 30, violations: 1 },
  { id: 'ps3', exam: 'UAS Bahasa Indonesia Kelas X', kelas: 'X IPA 1', pengawas: 'Rina Wulandari', status: 'AKTIF', totalSiswa: 36, aktifSiswa: 32, violations: 1 },
  { id: 'ps4', exam: 'UAS Bahasa Indonesia Kelas X', kelas: 'X IPA 2', pengawas: 'Agus Prasetyo', status: 'AKTIF', totalSiswa: 36, aktifSiswa: 33, violations: 1 },
]

// ==================== NOTIFICATIONS ====================
export const mockNotifications: MockNotification[] = [
  { id: 'n1', judul: 'Ujian Dimulai', pesan: 'UTS Matematika Kelas XI IPA telah dimulai', tipe: 'exam', isRead: false, waktu: '5 menit lalu' },
  { id: 'n2', judul: 'Pelanggaran Terdeteksi', pesan: 'Fajar Nugroho terdeteksi berpindah tab 3 kali', tipe: 'violation', isRead: false, waktu: '15 menit lalu' },
  { id: 'n3', judul: 'Ujian Selesai', pesan: 'Quiz Fisika Bab 3 telah selesai dikerjakan semua siswa', tipe: 'result', isRead: true, waktu: '2 jam lalu' },
  { id: 'n4', judul: 'Nilai Dipublikasikan', pesan: 'Nilai UAS Kimia Kelas XI telah dipublikasikan', tipe: 'result', isRead: true, waktu: '1 hari lalu' },
  { id: 'n5', judul: 'Pengumuman', pesan: 'Jadwal UAS Semester Genjang telah dirilis', tipe: 'announcement', isRead: true, waktu: '3 hari lalu' },
]

// ==================== CHART DATA ====================
export const examActivityData = [
  { bulan: 'Jan', ujian: 12, peserta: 240 },
  { bulan: 'Feb', ujian: 18, peserta: 380 },
  { bulan: 'Mar', ujian: 25, peserta: 520 },
  { bulan: 'Apr', ujian: 15, peserta: 310 },
  { bulan: 'Mei', ujian: 30, peserta: 650 },
  { bulan: 'Jun', ujian: 22, peserta: 470 },
  { bulan: 'Jul', ujian: 5, peserta: 80 },
  { bulan: 'Agu', ujian: 8, peserta: 150 },
  { bulan: 'Sep', ujian: 20, peserta: 420 },
  { bulan: 'Okt', ujian: 28, peserta: 580 },
  { bulan: 'Nov', ujian: 35, peserta: 720 },
  { bulan: 'Des', ujian: 32, peserta: 680 },
]

export const gradeDistributionData = [
  { range: '0-40', jumlah: 5, fill: '#ef4444' },
  { range: '41-55', jumlah: 12, fill: '#f97316' },
  { range: '56-70', jumlah: 25, fill: '#f59e0b' },
  { range: '71-85', jumlah: 38, fill: '#10b981' },
  { range: '86-100', jumlah: 20, fill: '#22c55e' },
]

export const subjectScoreData = [
  { mapel: 'MTK', rataRata: 72 },
  { mapel: 'BIN', rataRata: 78 },
  { mapel: 'BIG', rataRata: 68 },
  { mapel: 'FIS', rataRata: 71 },
  { mapel: 'KIM', rataRata: 74 },
  { mapel: 'BIO', rataRata: 76 },
  { mapel: 'EKO', rataRata: 80 },
  { mapel: 'PKN', rataRata: 82 },
]

export const participantTrendData = [
  { minggu: 'M1', hadir: 30, absen: 4, diskualifikasi: 0 },
  { minggu: 'M2', hadir: 32, absen: 2, diskualifikasi: 0 },
  { minggu: 'M3', hadir: 28, absen: 5, diskualifikasi: 1 },
  { minggu: 'M4', hadir: 33, absen: 2, diskualifikasi: 0 },
  { minggu: 'M5', hadir: 34, absen: 1, diskualifikasi: 1 },
  { minggu: 'M6', hadir: 31, absen: 3, diskualifikasi: 0 },
]

// ==================== EXAM QUESTIONS FOR TAKING EXAM ====================
export const examQuestions = [
  {
    id: 'q1', nomor: 1, pertanyaan: 'Jika f(x) = 2x² - 3x + 1, maka f(3) = ...',
    opsiA: '10', opsiB: '11', opsiC: '12', opsiD: '13', opsiE: '14',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 2
  },
  {
    id: 'q2', nomor: 2, pertanyaan: 'Turunan dari f(x) = 3x³ - 2x² + 5x adalah ...',
    opsiA: '9x² - 4x + 5', opsiB: '9x² - 4x', opsiC: '3x² - 4x + 5', opsiD: '9x - 4', opsiE: '6x² - 4x + 5',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 2
  },
  {
    id: 'q3', nomor: 3, pertanyaan: 'Integral dari ∫(2x + 3)dx adalah ...',
    opsiA: 'x² + 3x + C', opsiB: '2x² + 3x + C', opsiC: 'x² + 3 + C', opsiD: '2x + 3 + C', opsiE: 'x² + 3x',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 2
  },
  {
    id: 'q4', nomor: 4, pertanyaan: 'Jika log 2 = 0,301 dan log 3 = 0,477, maka log 6 = ...',
    opsiA: '0,778', opsiB: '0,602', opsiC: '0,954', opsiD: '0,903', opsiE: '0,845',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 2
  },
  {
    id: 'q5', nomor: 5, pertanyaan: 'Nilai limit: lim(x→2) (x² - 4)/(x - 2) = ...',
    opsiA: '4', opsiB: '2', opsiC: '0', opsiD: '8', opsiE: 'Tidak ada',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 2
  },
  {
    id: 'q6', nomor: 6, pertanyaan: 'Diketahui matriks A = [[2,3],[1,4]], determinan matriks A adalah ...',
    opsiA: '5', opsiB: '8', opsiC: '11', opsiD: '-5', opsiE: '3',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 3
  },
  {
    id: 'q7', nomor: 7, pertanyaan: 'Jumlah 20 suku pertama deret aritmetika dengan suku pertama 3 dan beda 5 adalah ...',
    opsiA: '1010', opsiB: '1000', opsiC: '990', opsiD: '1020', opsiE: '1030',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 3
  },
  {
    id: 'q8', nomor: 8, pertanyaan: 'Persamaan lingkaran dengan pusat (3, -2) dan jari-jari 5 adalah ...',
    opsiA: '(x-3)² + (y+2)² = 25', opsiB: '(x+3)² + (y-2)² = 25', opsiC: '(x-3)² + (y-2)² = 5', opsiD: '(x+3)² + (y+2)² = 25', opsiE: '(x-3)² + (y+2)² = 5',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 3
  },
  {
    id: 'q9', nomor: 9, pertanyaan: 'Jika sin θ = 3/5 dan θ sudut lancip, maka cos θ = ...',
    opsiA: '4/5', opsiB: '3/5', opsiC: '5/3', opsiD: '5/4', opsiE: '2/5',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 2
  },
  {
    id: 'q10', nomor: 10, pertanyaan: 'Vektor u = (3, -1, 2) dan v = (1, 4, -3). Hasil dot product u·v = ...',
    opsiA: '-11', opsiB: '11', opsiC: '-7', opsiD: '7', opsiE: '13',
    jawabanBenar: 'A', dijawab: null, ditandai: false, poin: 3
  },
]

// ==================== PROCTOR STUDENT STATUS ====================
export const proctorStudentStatus = [
  { id: 'ps1', nama: 'Rizky Pratama', status: 'active' as const, violations: 0, progress: 75, lastActivity: '2 menit lalu' },
  { id: 'ps2', nama: 'Anisa Rahma', status: 'active' as const, violations: 0, progress: 82, lastActivity: '1 menit lalu' },
  { id: 'ps3', nama: 'Fajar Nugroho', status: 'warning' as const, violations: 2, progress: 45, lastActivity: '5 menit lalu' },
  { id: 'ps4', nama: 'Putri Handayani', status: 'active' as const, violations: 0, progress: 90, lastActivity: 'baru saja' },
  { id: 'ps5', nama: 'Dimas Arya Putra', status: 'danger' as const, violations: 3, progress: 30, lastActivity: '8 menit lalu' },
  { id: 'ps6', nama: 'Laila Fitriani', status: 'active' as const, violations: 0, progress: 68, lastActivity: '1 menit lalu' },
  { id: 'ps7', nama: 'Yusuf Ibrahim', status: 'warning' as const, violations: 1, progress: 55, lastActivity: '4 menit lalu' },
  { id: 'ps8', nama: 'Ahmad Rizaldi', status: 'active' as const, violations: 0, progress: 72, lastActivity: '2 menit lalu' },
  { id: 'ps9', nama: 'Sari Indah', status: 'active' as const, violations: 0, progress: 88, lastActivity: 'baru saja' },
  { id: 'ps10', nama: 'Bayu Pratama', status: 'active' as const, violations: 0, progress: 60, lastActivity: '3 menit lalu' },
  { id: 'ps11', nama: 'Dina Amelia', status: 'active' as const, violations: 0, progress: 78, lastActivity: '1 menit lalu' },
  { id: 'ps12', nama: 'Galih Setiawan', status: 'active' as const, violations: 0, progress: 65, lastActivity: '2 menit lalu' },
]

// ==================== SISWA HOME DATA ====================
export const siswaUpcomingExams = [
  { id: 'se1', judul: 'UTS Matematika Kelas XI IPA', mapel: 'Matematika', tanggal: '2025-03-10T08:00:00', durasi: 90, status: 'Sedang berlangsung', token: 'MTK2024' },
  { id: 'se2', judul: 'UAS Bahasa Indonesia Kelas X', mapel: 'Bahasa Indonesia', tanggal: '2025-03-15T08:00:00', durasi: 120, status: 'Belum mulai', token: 'BIN2024' },
  { id: 'se3', judul: 'UTS Bahasa Inggris Kelas XII', mapel: 'Bahasa Inggris', tanggal: '2025-03-20T08:00:00', durasi: 90, status: 'Belum mulai', token: 'BIG2024' },
  { id: 'se4', judul: 'Try Out SBMPTN 2025', mapel: 'Matematika', tanggal: '2025-04-01T07:30:00', durasi: 120, status: 'Belum mulai', token: 'SBM2025' },
]

export const siswaRecentResults = [
  { id: 'sr1', judul: 'Quiz Fisika Bab 3', mapel: 'Fisika', nilai: 85, totalSoal: 10, benar: 8, salah: 2, tanggal: '5 Mar 2025' },
  { id: 'sr2', judul: 'UAS Kimia Kelas XI', mapel: 'Kimia', nilai: 76, totalSoal: 40, benar: 28, salah: 12, tanggal: '20 Feb 2025' },
  { id: 'sr3', judul: 'Quiz Matematika Bab 2', mapel: 'Matematika', nilai: 90, totalSoal: 15, benar: 13, salah: 2, tanggal: '15 Feb 2025' },
]

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) return `${hours} jam ${minutes} menit`
  if (minutes > 0) return `${minutes} menit ${secs} detik`
  return `${secs} detik`
}

// Status badge helpers
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ONGOING': case 'AKTIF': case 'Sedang berlangsung': return 'bg-emerald-100 text-emerald-700'
    case 'PUBLISHED': case 'Belum mulai': return 'bg-blue-100 text-blue-700'
    case 'SELESAI': return 'bg-slate-100 text-slate-700'
    case 'DRAFT': return 'bg-amber-100 text-amber-700'
    case 'DISKUALIFIKASI': return 'bg-red-100 text-red-700'
    case 'TIMEOUT': return 'bg-orange-100 text-orange-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'MUDAH': return 'bg-green-100 text-green-700'
    case 'SEDANG': return 'bg-amber-100 text-amber-700'
    case 'SULIT': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function getViolationSeverityColor(severity: string): string {
  switch (severity) {
    case 'low': return 'bg-yellow-100 text-yellow-700'
    case 'medium': return 'bg-orange-100 text-orange-700'
    case 'high': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
