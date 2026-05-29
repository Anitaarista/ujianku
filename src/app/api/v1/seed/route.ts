import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-helper';

// GET: Seeds the database with demo data
export async function GET() {
  try {
    // Clean existing data
    await db.$transaction([
      db.proctorViolation.deleteMany(),
      db.proctorSession.deleteMany(),
      db.jawaban.deleteMany(),
      db.examParticipant.deleteMany(),
      db.examSoal.deleteMany(),
      db.examKelas.deleteMany(),
      db.exam.deleteMany(),
      db.bankSoal.deleteMany(),
      db.subjectTeacher.deleteMany(),
      db.siswaKelas.deleteMany(),
      db.notification.deleteMany(),
      db.kelas.deleteMany(),
      db.mataPelajaran.deleteMany(),
      db.sekolah.deleteMany(),
      db.user.deleteMany(),
      db.examAnalytics.deleteMany(),
    ]);

    const hashedAdminPassword = hashPassword('admin123');
    const hashedGuruPassword = hashPassword('guru123');
    const hashedPengawasPassword = hashPassword('pengawas123');
    const hashedSiswaPassword = hashPassword('siswa123');

    // ==================== CREATE USERS ====================
    const admin = await db.user.create({
      data: {
        email: 'admin@ujianku.id',
        password: hashedAdminPassword,
        name: 'Administrator',
        role: 'ADMIN',
        nipNis: 'ADM001',
        phone: '081234567890',
      },
    });

    const guru1 = await db.user.create({
      data: {
        email: 'budi.santoso@ujianku.id',
        password: hashedGuruPassword,
        name: 'Budi Santoso, S.Pd.',
        role: 'GURU',
        nipNis: 'NIP198501012010011001',
        phone: '081234567891',
      },
    });

    const guru2 = await db.user.create({
      data: {
        email: 'siti.rahayu@ujianku.id',
        password: hashedGuruPassword,
        name: 'Siti Rahayu, M.Pd.',
        role: 'GURU',
        nipNis: 'NIP198602022011012002',
        phone: '081234567892',
      },
    });

    const guru3 = await db.user.create({
      data: {
        email: 'ahmad.hidayat@ujianku.id',
        password: hashedGuruPassword,
        name: 'Ahmad Hidayat, S.Pd.',
        role: 'GURU',
        nipNis: 'NIP198703032012011003',
        phone: '081234567893',
      },
    });

    const pengawas1 = await db.user.create({
      data: {
        email: 'dewi.lestari@ujianku.id',
        password: hashedPengawasPassword,
        name: 'Dewi Lestari, S.Pd.',
        role: 'PENGAWAS',
        nipNis: 'NIP198904042013012004',
        phone: '081234567894',
      },
    });

    const pengawas2 = await db.user.create({
      data: {
        email: 'rudi.hartono@ujianku.id',
        password: hashedPengawasPassword,
        name: 'Rudi Hartono, S.Pd.',
        role: 'PENGAWAS',
        nipNis: 'NIP199005052014011005',
        phone: '081234567895',
      },
    });

    // Create 10 students
    const siswaData = [
      { name: 'Andi Pratama', nis: '2024001', email: 'andi@ujianku.id' },
      { name: 'Bella Safitri', nis: '2024002', email: 'bella@ujianku.id' },
      { name: 'Cahyo Nugroho', nis: '2024003', email: 'cahyo@ujianku.id' },
      { name: 'Dina Permata', nis: '2024004', email: 'dina@ujianku.id' },
      { name: 'Eko Suryanto', nis: '2024005', email: 'eko@ujianku.id' },
      { name: 'Fitri Handayani', nis: '2024006', email: 'fitri@ujianku.id' },
      { name: 'Galih Prasetyo', nis: '2024007', email: 'galih@ujianku.id' },
      { name: 'Hana Kusuma', nis: '2024008', email: 'hana@ujianku.id' },
      { name: 'Irfan Maulana', nis: '2024009', email: 'irfan@ujianku.id' },
      { name: 'Juli Ratnasari', nis: '2024010', email: 'juli@ujianku.id' },
    ];

    const siswaUsers = await Promise.all(
      siswaData.map((s) =>
        db.user.create({
          data: {
            email: s.email,
            password: hashedSiswaPassword,
            name: s.name,
            role: 'SISWA',
            nipNis: s.nis,
          },
        })
      )
    );

    // ==================== CREATE SEKOLAH ====================
    const sekolah = await db.sekolah.create({
      data: {
        nama: 'SMA Negeri 1 Jakarta',
        alamat: 'Jl. Budi Utomo No. 7, Jakarta Pusat',
        npsn: '001001',
        logo: null,
      },
    });

    // ==================== CREATE KELAS ====================
    const kelas10 = await db.kelas.create({
      data: {
        nama: 'X IPA 1',
        tingkat: 10,
        tahunAjaran: '2024/2025',
        sekolahId: sekolah.id,
        waliKelasId: guru1.id,
      },
    });

    const kelas11 = await db.kelas.create({
      data: {
        nama: 'XI IPA 1',
        tingkat: 11,
        tahunAjaran: '2024/2025',
        sekolahId: sekolah.id,
        waliKelasId: guru2.id,
      },
    });

    const kelas12 = await db.kelas.create({
      data: {
        nama: 'XII IPA 1',
        tingkat: 12,
        tahunAjaran: '2024/2025',
        sekolahId: sekolah.id,
        waliKelasId: guru3.id,
      },
    });

    // ==================== ASSIGN SISWA TO KELAS ====================
    // Students 1-4 to kelas 10, 5-7 to kelas 11, 8-10 to kelas 12
    const tahunAjaran = '2024/2025';
    await Promise.all([
      ...siswaUsers.slice(0, 4).map((s) =>
        db.siswaKelas.create({
          data: { siswaId: s.id, kelasId: kelas10.id, tahunAjaran },
        })
      ),
      ...siswaUsers.slice(4, 7).map((s) =>
        db.siswaKelas.create({
          data: { siswaId: s.id, kelasId: kelas11.id, tahunAjaran },
        })
      ),
      ...siswaUsers.slice(7, 10).map((s) =>
        db.siswaKelas.create({
          data: { siswaId: s.id, kelasId: kelas12.id, tahunAjaran },
        })
      ),
    ]);

    // ==================== CREATE MATA PELAJARAN ====================
    const mataPelajaranList = [
      { kode: 'MTK', nama: 'Matematika', kkm: 75, kelompok: 'Wajib' },
      { kode: 'BIN', nama: 'Bahasa Indonesia', kkm: 75, kelompok: 'Wajib' },
      { kode: 'FIS', nama: 'Fisika', kkm: 70, kelompok: 'Peminatan' },
      { kode: 'KIM', nama: 'Kimia', kkm: 70, kelompok: 'Peminatan' },
      { kode: 'BIO', nama: 'Biologi', kkm: 70, kelompok: 'Peminatan' },
    ];

    const mataPelajaran = await Promise.all(
      mataPelajaranList.map((mp) =>
        db.mataPelajaran.create({ data: mp })
      )
    );

    const [mtk, bin, fis, kim, bio] = mataPelajaran;

    // ==================== CREATE SUBJECT TEACHERS ====================
    await Promise.all([
      db.subjectTeacher.create({
        data: { guruId: guru1.id, mataPelajaranId: mtk.id, kelasId: kelas10.id, tahunAjaran },
      }),
      db.subjectTeacher.create({
        data: { guruId: guru1.id, mataPelajaranId: mtk.id, kelasId: kelas11.id, tahunAjaran },
      }),
      db.subjectTeacher.create({
        data: { guruId: guru2.id, mataPelajaranId: bin.id, kelasId: kelas10.id, tahunAjaran },
      }),
      db.subjectTeacher.create({
        data: { guruId: guru2.id, mataPelajaranId: bin.id, kelasId: kelas12.id, tahunAjaran },
      }),
      db.subjectTeacher.create({
        data: { guruId: guru3.id, mataPelajaranId: fis.id, kelasId: kelas11.id, tahunAjaran },
      }),
      db.subjectTeacher.create({
        data: { guruId: guru3.id, mataPelajaranId: fis.id, kelasId: kelas12.id, tahunAjaran },
      }),
    ]);

    // ==================== CREATE BANK SOAL ====================
    // Matematika questions (by guru1)
    const mtkQuestions = await Promise.all([
      db.bankSoal.create({
        data: {
          mataPelajaranId: mtk.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Hasil dari 15 × 8 + 12 ÷ 4 adalah...',
          opsiA: '123', opsiB: '126', opsiC: '120', opsiD: '128', opsiE: '130',
          jawabanBenar: 'A', pembahasan: '15 × 8 = 120, 12 ÷ 4 = 3, 120 + 3 = 123', poin: 2, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: mtk.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Nilai dari √144 adalah...',
          opsiA: '11', opsiB: '12', opsiC: '13', opsiD: '14', opsiE: '15',
          jawabanBenar: 'B', pembahasan: '12 × 12 = 144, sehingga √144 = 12', poin: 2, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: mtk.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Jika f(x) = 2x² - 3x + 1, maka f(2) = ...',
          opsiA: '3', opsiB: '5', opsiC: '7', opsiD: '9', opsiE: '11',
          jawabanBenar: 'A', pembahasan: 'f(2) = 2(4) - 3(2) + 1 = 8 - 6 + 1 = 3', poin: 3, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: mtk.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Turunan dari f(x) = 3x³ - 2x² + 5x - 7 adalah...',
          opsiA: '9x² - 4x + 5', opsiB: '9x² - 4x - 5', opsiC: '3x² - 2x + 5', opsiD: '9x² + 4x + 5', opsiE: '6x² - 4x + 5',
          jawabanBenar: 'A', pembahasan: "f'(x) = 9x² - 4x + 5", poin: 3, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: mtk.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Integral dari ∫(2x + 3)dx adalah...',
          opsiA: 'x² + 3x + C', opsiB: '2x² + 3x + C', opsiC: 'x² + 3 + C', opsiD: '2x + 3 + C', opsiE: 'x² + 6x + C',
          jawabanBenar: 'A', pembahasan: '∫(2x + 3)dx = x² + 3x + C', poin: 4, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: mtk.id, guruId: guru1.id, tipeSoal: 'ESSAY', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Tentukan luas daerah yang dibatasi oleh kurva y = x² dan y = 2x. Jelaskan langkah-langkah penyelesaiannya!',
          jawabanBenar: 'Luas = ∫₀² (2x - x²)dx = [x² - x³/3]₀² = 4 - 8/3 = 4/3 satuan luas', pembahasan: 'Cari titik potong: x² = 2x → x = 0 atau x = 2. Luas = ∫₀² (2x - x²)dx', poin: 5, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: mtk.id, guruId: guru1.id, tipeSoal: 'BENAR_SALAH', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Segitiga dengan sisi 3, 4, 5 merupakan segitiga siku-siku.',
          opsiA: 'Benar', opsiB: 'Salah', opsiC: null, opsiD: null, opsiE: null,
          jawabanBenar: 'A', pembahasan: '3² + 4² = 9 + 16 = 25 = 5² (memenuhi teorema Pythagoras)', poin: 2, isPublic: true,
        },
      }),
    ]);

    // Bahasa Indonesia questions (by guru2)
    const binQuestions = await Promise.all([
      db.bankSoal.create({
        data: {
          mataPelajaranId: bin.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Kata baku dari "aktifitas" adalah...',
          opsiA: 'Aktifitas', opsiB: 'Aktivitas', opsiC: 'Aktipitas', opsiD: 'Aktipitas', opsiE: 'Aktivutas',
          jawabanBenar: 'B', pembahasan: 'Kata baku yang benar adalah "aktivitas"', poin: 2, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bin.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Majas yang membandingkan dua hal secara langsung disebut...',
          opsiA: 'Metafora', opsiB: 'Personifikasi', opsiC: 'Hiperbola', opsiD: 'Simile', opsiE: 'Litotes',
          jawabanBenar: 'A', pembahasan: 'Metafora adalah majas yang membandingkan dua hal secara langsung tanpa kata pembanding', poin: 2, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bin.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Kalimat yang mengandung konjungsi kausalitas adalah...',
          opsiA: 'Ia pergi ke pasar karena ibu sakit', opsiB: 'Saya belajar dan adik bermain', opsiC: 'Meskipun hujan, ia tetap berangkat', opsiD: 'Buku itu tebal namun menarik', opsiE: 'Ayah dan ibu pergi ke kantor',
          jawabanBenar: 'A', pembahasan: '"karena" menunjukkan hubungan sebab-akibat (kausalitas)', poin: 3, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bin.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Bagian struktur teks persuasi yang berisi pengenalan masalah disebut...',
          opsiA: 'Orientasi', opsiB: 'Argumentasi', opsiC: 'Eksposisi', opsiD: 'Rekomendasi', opsiE: 'Penutup',
          jawabanBenar: 'A', pembahasan: 'Orientasi adalah bagian awal yang memperkenalkan masalah', poin: 3, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bin.id, guruId: guru2.id, tipeSoal: 'ESSAY', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Buatlah paragraf persuasi tentang pentingnya membaca buku! Minimal 5 kalimat.',
          jawabanBenar: 'Paragraf persuasi harus mengandung: orientasi, argumentasi, dan rekomendasi', pembahasan: 'Paragraf persuasi bertujuan meyakinkan pembaca', poin: 5, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bin.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Unsur intrinsik cerpen yang berisi pesan moral disebut...',
          opsiA: 'Tema', opsiB: 'Amanat', opsiC: 'Alur', opsiD: 'Sudut pandang', opsiE: 'Latar',
          jawabanBenar: 'B', pembahasan: 'Amanat adalah pesan moral yang ingin disampaikan pengarang', poin: 3, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bin.id, guruId: guru2.id, tipeSoal: 'BENAR_SALAH', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Cerita fiksi selalu berdasarkan kejadian nyata.',
          opsiA: 'Benar', opsiB: 'Salah', opsiC: null, opsiD: null, opsiE: null,
          jawabanBenar: 'B', pembahasan: 'Cerita fiksi adalah cerita rekaan/tidak nyata', poin: 2, isPublic: true,
        },
      }),
    ]);

    // Fisika questions (by guru3)
    const fisQuestions = await Promise.all([
      db.bankSoal.create({
        data: {
          mataPelajaranId: fis.id, guruId: guru3.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Satuan SI untuk gaya adalah...',
          opsiA: 'Joule', opsiB: 'Newton', opsiC: 'Pascal', opsiD: 'Watt', opsiE: 'Volt',
          jawabanBenar: 'B', pembahasan: 'Newton (N) adalah satuan SI untuk gaya', poin: 2, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: fis.id, guruId: guru3.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Sebuah benda bermassa 5 kg didorong dengan gaya 20 N. Percepatan benda adalah... m/s²',
          opsiA: '2', opsiB: '3', opsiC: '4', opsiD: '5', opsiE: '10',
          jawabanBenar: 'C', pembahasan: 'a = F/m = 20/5 = 4 m/s²', poin: 3, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: fis.id, guruId: guru3.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Energi kinetik benda bermassa 2 kg yang bergerak dengan kecepatan 4 m/s adalah... joule',
          opsiA: '8', opsiB: '12', opsiC: '16', opsiD: '20', opsiE: '24',
          jawabanBenar: 'C', pembahasan: 'Ek = ½mv² = ½ × 2 × 16 = 16 joule', poin: 3, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: fis.id, guruId: guru3.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Hukum Ohm dinyatakan dengan rumus...',
          opsiA: 'V = I × R', opsiB: 'P = I × V', opsiC: 'F = m × a', opsiD: 'W = F × s', opsiE: 'E = ½mv²',
          jawabanBenar: 'A', pembahasan: 'Hukum Ohm: V = I × R, di mana V = tegangan, I = arus, R = hambatan', poin: 3, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: fis.id, guruId: guru3.id, tipeSoal: 'ESSAY', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Jelaskan perbedaan antara gelombang transversal dan gelombang longitudinal! Berikan contoh masing-masing.',
          jawabanBenar: 'Gelombang transversal: arah getar tegak lurus arah rambat (contoh: gelombang cahaya). Gelombang longitudinal: arah getar sejajar arah rambat (contoh: gelombang suara).', pembahasan: 'Perbedaan utama terletak pada arah getar partikel terhadap arah rambat gelombang', poin: 5, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: fis.id, guruId: guru3.id, tipeSoal: 'BENAR_SALAH', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Cahaya merambat lebih cepat di udara dibandingkan di vakum.',
          opsiA: 'Benar', opsiB: 'Salah', opsiC: null, opsiD: null, opsiE: null,
          jawabanBenar: 'B', pembahasan: 'Cahaya merambat paling cepat di vakum (3 × 10⁸ m/s)', poin: 2, isPublic: true,
        },
      }),
    ]);

    // Kimia questions (by guru1)
    const kimQuestions = await Promise.all([
      db.bankSoal.create({
        data: {
          mataPelajaranId: kim.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Simbol kimia untuk emas adalah...',
          opsiA: 'Ag', opsiB: 'Au', opsiC: 'Fe', opsiD: 'Cu', opsiE: 'Al',
          jawabanBenar: 'B', pembahasan: 'Au (Aurum) adalah simbol kimia untuk emas', poin: 2, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: kim.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Jumlah elektron pada atom Karbon (Z=6) adalah...',
          opsiA: '4', opsiB: '6', opsiC: '8', opsiD: '12', opsiE: '14',
          jawabanBenar: 'B', pembahasan: 'Atom netral memiliki jumlah elektron = nomor atom (Z). Karbon Z=6, elektron=6', poin: 3, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: kim.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Reaksi antara asam dan basa menghasilkan garam dan air disebut reaksi...',
          opsiA: 'Oksidasi', opsiB: 'Reduksi', opsiC: 'Netralisasi', opsiD: 'Precipitasi', opsiE: 'Kombustion',
          jawabanBenar: 'C', pembahasan: 'Reaksi netralisasi: asam + basa → garam + air', poin: 3, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: kim.id, guruId: guru1.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Molaritas larutan yang mengandung 40 gram NaOH (Mr=40) dalam 500 mL larutan adalah... M',
          opsiA: '1', opsiB: '2', opsiC: '0.5', opsiD: '4', opsiE: '0.2',
          jawabanBenar: 'B', pembahasan: 'M = n/V = (40/40) / 0.5 = 1/0.5 = 2 M', poin: 4, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: kim.id, guruId: guru1.id, tipeSoal: 'JAWABAN_SINGKAT', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Tuliskan rumus kimia dari asam sulfat!',
          jawabanBenar: 'H₂SO₄', pembahasan: 'Asam sulfat memiliki rumus kimia H₂SO₄', poin: 3, isPublic: true,
        },
      }),
    ]);

    // Biologi questions (by guru2)
    const bioQuestions = await Promise.all([
      db.bankSoal.create({
        data: {
          mataPelajaranId: bio.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Organel sel yang berfungsi sebagai pusat pengendali sel adalah...',
          opsiA: 'Mitokondria', opsiB: 'Nukleus', opsiC: 'Ribosom', opsiD: 'Lisosom', opsiE: 'Golgi',
          jawabanBenar: 'B', pembahasan: 'Nukleus (inti sel) mengandung DNA yang mengendalikan aktivitas sel', poin: 2, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bio.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Proses fotosintesis menghasilkan...',
          opsiA: 'Glukosa dan O₂', opsiB: 'Glukosa dan CO₂', opsiC: 'O₂ dan CO₂', opsiD: 'Air dan CO₂', opsiE: 'Glukosa dan H₂O',
          jawabanBenar: 'A', pembahasan: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (glukosa dan oksigen)', poin: 3, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bio.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: 'Fase pembelahan sel di mana kromosom berada di bidang ekuator disebut...',
          opsiA: 'Profase', opsiB: 'Metafase', opsiC: 'Anafase', opsiD: 'Telofase', opsiE: 'Interfase',
          jawabanBenar: 'B', pembahasan: 'Pada metafase, kromosom berada di bidang ekuator (tengah sel)', poin: 3, isPublic: false,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bio.id, guruId: guru2.id, tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SULIT',
          pertanyaan: 'Enzim yang berperan dalam replikasi DNA adalah...',
          opsiA: 'Amilase', opsiB: 'DNA Polimerase', opsiC: 'Lipase', opsiD: 'Katalase', opsiE: 'Protease',
          jawabanBenar: 'B', pembahasan: 'DNA Polimerase adalah enzim utama dalam replikasi DNA', poin: 4, isPublic: true,
        },
      }),
      db.bankSoal.create({
        data: {
          mataPelajaranId: bio.id, guruId: guru2.id, tipeSoal: 'BENAR_SALAH', tingkatKesulitan: 'MUDAH',
          pertanyaan: 'Mitokondria dikenal sebagai "pembangkit listrik" sel.',
          opsiA: 'Benar', opsiB: 'Salah', opsiC: null, opsiD: null, opsiE: null,
          jawabanBenar: 'A', pembahasan: 'Mitokondria menghasilkan ATP (energi) melalui respirasi seluler', poin: 2, isPublic: true,
        },
      }),
    ]);

    // ==================== CREATE EXAMS ====================
    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    // Exam 1: DRAFT - UTS Matematika
    const exam1 = await db.exam.create({
      data: {
        judul: 'UTS Matematika Kelas X Semester 1',
        deskripsi: 'Ujian Tengah Semester Matematika untuk kelas X IPA 1',
        mataPelajaranId: mtk.id,
        guruId: guru1.id,
        durasi: 90,
        tipeExam: 'UTS',
        token: 'MTK2024',
        status: 'DRAFT',
        tanggalMulai: new Date(now.getTime() + 7 * oneDay),
        tanggalSelesai: new Date(now.getTime() + 7 * oneDay + 2 * oneHour),
        acakSoal: true,
        acakOpsi: true,
        showResult: false,
        antiCheat: true,
        maxAttempt: 1,
        passingGrade: 70,
        examKelas: {
          create: { kelasId: kelas10.id },
        },
        examSoal: {
          create: mtkQuestions.slice(0, 5).map((q, i) => ({
            bankSoalId: q.id,
            urutan: i + 1,
          })),
        },
      },
    });

    // Exam 2: PUBLISHED - UAS Bahasa Indonesia
    const exam2 = await db.exam.create({
      data: {
        judul: 'UAS Bahasa Indonesia Kelas XII Semester 1',
        deskripsi: 'Ujian Akhir Semester Bahasa Indonesia untuk kelas XII IPA 1',
        mataPelajaranId: bin.id,
        guruId: guru2.id,
        durasi: 120,
        tipeExam: 'UAS',
        token: 'BIN2024',
        status: 'PUBLISHED',
        tanggalMulai: new Date(now.getTime() + oneDay),
        tanggalSelesai: new Date(now.getTime() + oneDay + 2 * oneHour),
        acakSoal: true,
        acakOpsi: false,
        showResult: false,
        antiCheat: true,
        maxAttempt: 1,
        passingGrade: 75,
        examKelas: {
          create: { kelasId: kelas12.id },
        },
        examSoal: {
          create: binQuestions.slice(0, 5).map((q, i) => ({
            bankSoalId: q.id,
            urutan: i + 1,
          })),
        },
      },
    });

    // Exam 3: ONGOING - Quiz Fisika
    const exam3 = await db.exam.create({
      data: {
        judul: 'Quiz Fisika - Hukum Newton',
        deskripsi: 'Quiz singkat tentang Hukum Newton untuk kelas XI IPA 1',
        mataPelajaranId: fis.id,
        guruId: guru3.id,
        durasi: 45,
        tipeExam: 'QUIZ',
        token: null,
        status: 'ONGOING',
        tanggalMulai: new Date(now.getTime() - oneHour),
        tanggalSelesai: new Date(now.getTime() + 2 * oneHour),
        acakSoal: true,
        acakOpsi: true,
        showResult: true,
        antiCheat: true,
        maxAttempt: 2,
        passingGrade: 60,
        examKelas: {
          create: { kelasId: kelas11.id },
        },
        examSoal: {
          create: fisQuestions.slice(0, 4).map((q, i) => ({
            bankSoalId: q.id,
            urutan: i + 1,
          })),
        },
      },
    });

    // ==================== CREATE PROCTOR SESSIONS ====================
    const proctorSession = await db.proctorSession.create({
      data: {
        examId: exam3.id,
        pengawasId: pengawas1.id,
        kelasId: kelas11.id,
        status: 'AKTIF',
        catatan: 'Pengawasan quiz fisika kelas XI',
      },
    });

    // ==================== CREATE SOME PARTICIPATIONS ====================
    // Simulate that some students have started the ongoing quiz
    const participant1 = await db.examParticipant.create({
      data: {
        examId: exam3.id,
        siswaId: siswaUsers[4].id, // Eko
        status: 'MULAI',
        mulaiPada: new Date(now.getTime() - 30 * 60 * 1000),
        attempt: 1,
      },
    });

    const participant2 = await db.examParticipant.create({
      data: {
        examId: exam3.id,
        siswaId: siswaUsers[5].id, // Fitri
        status: 'SELESAI',
        mulaiPada: new Date(now.getTime() - 40 * 60 * 1000),
        selesaiPada: new Date(now.getTime() - 5 * 60 * 1000),
        durasi: 2100,
        nilai: 80,
        totalNilai: 80,
        attempt: 1,
      },
    });

    // Add some answers for participant2 (completed)
    const exam3Soal = await db.examSoal.findMany({
      where: { examId: exam3.id },
    });

    const answers = [
      { bankSoalId: exam3Soal[0]?.bankSoalId, jawaban: 'B', isCorrect: true, poin: 2 },
      { bankSoalId: exam3Soal[1]?.bankSoalId, jawaban: 'C', isCorrect: true, poin: 3 },
      { bankSoalId: exam3Soal[2]?.bankSoalId, jawaban: 'A', isCorrect: false, poin: 0 },
      { bankSoalId: exam3Soal[3]?.bankSoalId, jawaban: 'A', isCorrect: true, poin: 3 },
    ];

    await Promise.all(
      answers
        .filter((a) => a.bankSoalId)
        .map((a) =>
          db.jawaban.create({
            data: {
              participantId: participant2.id,
              bankSoalId: a.bankSoalId!,
              jawaban: a.jawaban,
              isCorrect: a.isCorrect,
              poin: a.poin,
              waktuJawab: new Date(now.getTime() - 10 * 60 * 1000),
            },
          })
        )
    );

    // Add an answer for participant1 (still in progress)
    if (exam3Soal[0]) {
      await db.jawaban.create({
        data: {
          participantId: participant1.id,
          bankSoalId: exam3Soal[0].bankSoalId,
          jawaban: 'B',
          isCorrect: true,
          poin: 2,
          waktuJawab: new Date(now.getTime() - 25 * 60 * 1000),
        },
      });
    }

    // ==================== CREATE VIOLATIONS ====================
    await db.proctorViolation.create({
      data: {
        sessionId: proctorSession.id,
        siswaId: siswaUsers[4].id, // Eko
        tipe: 'TAB_SWITCH',
        deskripsi: 'Siswa berpindah tab browser selama ujian berlangsung',
        waktu: new Date(now.getTime() - 20 * 60 * 1000),
      },
    });

    // ==================== CREATE NOTIFICATIONS ====================
    await Promise.all([
      db.notification.create({
        data: {
          userId: siswaUsers[4].id,
          judul: 'Quiz Fisika Dimulai',
          pesan: 'Quiz Fisika - Hukum Newton telah dimulai. Segera kerjakan!',
          tipe: 'exam',
        },
      }),
      db.notification.create({
        data: {
          userId: siswaUsers[5].id,
          judul: 'Hasil Quiz Tersedia',
          pesan: 'Nilai Quiz Fisika - Hukum Newton Anda: 80',
          tipe: 'result',
        },
      }),
      db.notification.create({
        data: {
          userId: admin.id,
          judul: 'Sistem Siap Digunakan',
          pesan: 'Database telah di-seed dengan data demo. Semua fitur siap digunakan.',
          tipe: 'announcement',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Database berhasil di-seed dengan data demo',
        summary: {
          users: {
            admin: 1,
            guru: 3,
            pengawas: 2,
            siswa: 10,
          },
          sekolah: 1,
          kelas: 3,
          mataPelajaran: 5,
          bankSoal: mtkQuestions.length + binQuestions.length + fisQuestions.length + kimQuestions.length + bioQuestions.length,
          exams: {
            draft: 1,
            published: 1,
            ongoing: 1,
          },
          proctorSessions: 1,
          violations: 1,
        },
        credentials: {
          admin: { email: 'admin@ujianku.id', password: 'admin123' },
          guru: { email: 'budi.santoso@ujianku.id', password: 'guru123' },
          pengawas: { email: 'dewi.lestari@ujianku.id', password: 'pengawas123' },
          siswa: { email: 'andi@ujianku.id', password: 'siswa123' },
        },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Gagal men-seed database: ' + String(error) } },
      { status: 500 }
    );
  }
}
