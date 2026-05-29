# UjianKu - Platform Ujian Online Indonesia

## 📋 Deskripsi Proyek

UjianKu adalah platform ujian online terpadu yang mendukung 4 peran pengguna dengan pembagian platform yang jelas:

| Role | Platform | Teknologi |
|------|----------|-----------|
| **Admin** | Website (Desktop) | Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui |
| **Guru** | Website (Desktop) | Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui |
| **Pengawas** | Mobile App | Flutter + Dart |
| **Siswa** | Mobile App | Flutter + Dart |

**Backend API**: Terverifikasi dalam website Next.js, akan terhubung ke mobile app saat domain dikonfigurasi.

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────┐
│                   WEBSITE                        │
│            (Next.js Full-Stack)                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │  Admin    │  │  Guru    │  │  REST API v1  │ │
│  │Dashboard  │  │Dashboard │  │  (/api/v1/*)  │ │
│  └──────────┘  └──────────┘  └───────┬───────┘ │
│                                      │           │
│  ┌─────────────────────────────┐     │           │
│  │    Prisma ORM + SQLite      │◄────┘           │
│  └─────────────────────────────┘                 │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS (domain TBD)
                       ▼
         ┌─────────────────────────┐
         │    FLUTTER MOBILE APP   │
         │                         │
         │  ┌────────┐ ┌────────┐ │
         │  │ Siswa  │ │Pengawas│ │
         │  │  App   │ │  App   │ │
         │  └────────┘ └────────┘ │
         └─────────────────────────┘
```

---

## 📁 Struktur Proyek

### Website (Next.js) - `/home/z/my-project/`

```
src/
├── app/
│   ├── page.tsx                    # Landing page + role selector
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── api/v1/                     # REST API
│       ├── auth/                   # Login, me, register
│       ├── exams/                  # Exam CRUD + taking
│       ├── bank-soal/              # Question bank
│       ├── proctor/                # Proctoring sessions & violations
│       ├── admin/                  # Admin management
│       ├── guru/                   # Guru-specific data
│       ├── siswa/                  # Siswa-specific data
│       └── seed/                   # Database seeder
├── components/
│   ├── ujianku/
│   │   ├── landing.tsx             # Landing page component
│   │   ├── admin-dashboard.tsx     # Admin dashboard with 6 tabs
│   │   ├── guru-dashboard.tsx      # Guru dashboard with 5 tabs
│   │   ├── siswa-mobile.tsx        # Siswa mobile UI in phone frame
│   │   ├── pengawas-mobile.tsx     # Pengawas mobile UI in phone frame
│   │   ├── phone-frame.tsx         # Phone mockup frame
│   │   └── mock-data.ts            # Demo data
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── db.ts                       # Prisma client
│   ├── utils.ts                    # Utilities
│   └── auth-helper.ts              # Auth helper (token, hash)
├── prisma/
│   └── schema.prisma               # Database schema
└── hooks/                          # Custom hooks
```

### Mobile App (Flutter) - `/home/z/my-project/ujianku-mobile/`

```
lib/
├── main.dart                       # App entry point
├── app.dart                        # App configuration
├── config/
│   ├── theme.dart                  # Design system
│   ├── api_config.dart             # API URL config
│   └── routes.dart                 # GoRouter navigation
├── models/                         # Data models
├── services/                       # API services
├── providers/                      # State management
├── screens/
│   ├── splash_screen.dart
│   ├── login_screen.dart
│   ├── siswa/                      # 6 Siswa screens
│   └── pengawas/                   # 5 Pengawas screens
├── widgets/                        # Reusable widgets
└── utils/
    └── anti_cheat_detector.dart    # Anti-cheat system
```

---

## 🔑 Akun Demo

Akses seed data melalui: `GET /api/v1/seed`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ujianku.id | admin123 |
| Guru | budi.santoso@ujianku.id | guru123 |
| Pengawas | dewi.lestari@ujianku.id | pengawas123 |
| Siswa | andi@ujianku.id | siswa123 |

---

## 🎯 Fitur per Role

### Admin (Website)
- Dashboard overview dengan statistik & chart
- Manajemen User (CRUD, filter, pagination)
- Manajemen Sekolah & Kelas
- Manajemen Mata Pelajaran
- Laporan & Analytics (chart distribusi nilai)
- Pengaturan Sistem

### Guru (Website)
- Dashboard dengan statistik pengajar
- Bank Soal (CRUD, filter, import/export)
- Buat Ujian (5-step wizard)
- Hasil Ujian (tabel, chart, export)
- Nilai & Rapor (per kelas, per siswa)

### Pengawas (Mobile App)
- Jadwal pengawasan hari ini
- Monitoring ujian LIVE (grid siswa real-time)
- Deteksi pelanggaran (tab switch, face detection, dll)
- Daftar pelanggaran dengan filter
- Laporan pengawasan & export

### Siswa (Mobile App)
- Home dengan countdown ujian
- Daftar ujian dengan status filter
- Kerjakan ujian (full-screen, anti-cheat)
- Hasil ujian dengan pembahasan
- Profil & statistik

---

## 🛡️ Anti-Cheat Features

- Deteksi app switching (background/foreground)
- Blokir screenshot attempt
- Tab change detection (web)
- Face detection monitoring
- Multiple face detection
- Full-screen enforcement
- Copy/paste blocking
- Auto-disqualification after 3 violations

---

## 🔌 API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/register` - Register (admin only)

### Exams
- `GET /api/v1/exams` - List exams
- `POST /api/v1/exams` - Create exam
- `GET /api/v1/exams/[id]` - Exam detail
- `POST /api/v1/exams/[id]/start` - Start exam
- `GET /api/v1/exams/[id]/questions` - Get questions
- `POST /api/v1/exams/[id]/answer` - Submit answer
- `POST /api/v1/exams/[id]/submit` - Submit exam
- `GET /api/v1/exams/[id]/result` - Get result

### Bank Soal
- `GET /api/v1/bank-soal` - List questions
- `POST /api/v1/bank-soal` - Create question
- `GET /api/v1/bank-soal/[id]` - Get question
- `PUT /api/v1/bank-soal/[id]` - Update question
- `DELETE /api/v1/bank-soal/[id]` - Delete question

### Proctor
- `GET /api/v1/proctor/sessions` - List sessions
- `POST /api/v1/proctor/sessions` - Create session
- `GET /api/v1/proctor/sessions/[id]` - Session detail
- `GET /api/v1/proctor/sessions/[id]/monitor` - Live monitoring
- `POST /api/v1/proctor/sessions/[id]/end` - End session
- `GET /api/v1/proctor/violations` - List violations
- `POST /api/v1/proctor/violations` - Report violation

### Admin
- `GET /api/v1/admin/users` - List users
- `POST /api/v1/admin/users` - Create user
- `GET /api/v1/admin/analytics` - System analytics

### Guru
- `GET /api/v1/guru/exams` - Guru's exams
- `GET /api/v1/guru/bank-soal` - Guru's questions
- `GET /api/v1/guru/results` - Exam results

### Siswa
- `GET /api/v1/siswa/exams` - Available exams
- `GET /api/v1/siswa/results` - Student results
- `GET /api/v1/siswa/profile` - Student profile

---

## 🚀 Cara Menjalankan

### Website
```bash
cd /home/z/my-project
bun install
bun run db:push          # Push database schema
curl localhost:3000/api/v1/seed  # Seed demo data
bun run dev              # Start dev server
```

### Mobile App (Flutter)
```bash
cd /home/z/my-project/ujianku-mobile
flutter pub get           # Install dependencies
# Edit lib/config/api_config.dart to set API URL
flutter run               # Run on emulator/device
```

---

## 🎨 Design System

- **Primary**: Emerald #10b981 (growth/education)
- **Secondary**: Slate #64748b
- **Accent**: Amber #f59e0b
- **Typography**: Inter (body) + Geist (UI)
- **Spacing**: 8-point grid
- **Framework**: Material 3 (Flutter) + shadcn/ui (Web)

---

## 📊 Database Schema

15 models:
- User, Sekolah, Kelas, SiswaKelas, MataPelajaran, SubjectTeacher
- BankSoal, Exam, ExamSoal, ExamKelas
- ExamParticipant, Jawaban
- ProctorSession, ProctorViolation
- ExamAnalytics, Notification
