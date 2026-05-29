'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, FileText, ClipboardCheck, Award,
  Bell, Search, LogOut, ChevronRight, Plus, Download,
  TrendingUp, Clock, Users, CheckCircle, XCircle, Edit,
  Trash2, Eye, MoreVertical, ArrowLeft, ArrowRight, Upload,
  GraduationCap, BarChart3, Settings, AlertTriangle, Star,
  Check, Filter, Copy, Shuffle, Lock, Unlock, Timer,
  BookMarked, Layers, Flag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  mockBankSoal, mockExams, mockExamResults, mockKelas, mockMapel,
  gradeDistributionData, getStatusColor, getDifficultyColor, formatDuration
} from './mock-data'

type GuruTab = 'dashboard' | 'bank-soal' | 'buat-ujian' | 'hasil-ujian' | 'nilai'

interface GuruDashboardProps {
  onBack: () => void
}

const sidebarItems: { id: GuruTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bank-soal', label: 'Bank Soal', icon: BookOpen },
  { id: 'buat-ujian', label: 'Buat Ujian', icon: FileText },
  { id: 'hasil-ujian', label: 'Hasil Ujian', icon: ClipboardCheck },
  { id: 'nilai', label: 'Nilai & Rapor', icon: Award },
]

export function GuruDashboard({ onBack }: GuruDashboardProps) {
  const [activeTab, setActiveTab] = useState<GuruTab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">UjianKu</span>
              <span className="text-xs text-gray-500 block -mt-1">Guru Panel</span>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-600' : ''}`} />
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              SN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Siti Nurhaliza, S.Pd</p>
              <p className="text-xs text-gray-500">Guru Matematika</p>
            </div>
            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-bold text-gray-900">
            {sidebarItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari..." className="pl-9 w-64 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && <GuruOverview />}
          {activeTab === 'bank-soal' && <BankSoal searchQuery={searchQuery} />}
          {activeTab === 'buat-ujian' && <BuatUjian />}
          {activeTab === 'hasil-ujian' && <HasilUjian />}
          {activeTab === 'nilai' && <NilaiRapor />}
        </div>
      </main>
    </div>
  )
}

// ==================== GURU OVERVIEW ====================
function GuruOverview() {
  const stats = [
    { label: 'Total Soal', value: '156', change: '+12', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ujian Aktif', value: '3', change: '+1', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Siswa Aktif', value: '103', change: '', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Rata-rata Nilai', value: '78.5', change: '+2.3', icon: BarChart3, color: 'text-sky-600', bg: 'bg-sky-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-emerald-600 mt-1">
                        <TrendingUp className="w-3 h-3 inline mr-1" />{stat.change} dari bulan lalu
                      </p>
                    )}
                  </div>
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ujian Mendatang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockExams.filter(e => e.status === 'PUBLISHED' || e.status === 'ONGOING').map((exam) => (
              <div key={exam.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  exam.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {exam.status === 'ONGOING' ? <Timer className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{exam.judul}</p>
                  <p className="text-xs text-gray-500">{exam.mataPelajaran} · {exam.durasi} menit · {exam.totalSoal} soal</p>
                </div>
                <Badge className={getStatusColor(exam.status)}>
                  {exam.status === 'ONGOING' ? 'Berlangsung' : 'Terbit'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hasil Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockExamResults.slice(0, 5).map((result) => (
              <div key={result.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  result.totalNilai >= 75 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-red-400 to-orange-500'
                }`}>
                  {result.totalNilai}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{result.siswa}</p>
                  <p className="text-xs text-gray-500">{result.examJudul}</p>
                </div>
                <span className={`text-xs font-medium ${result.totalNilai >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.totalNilai >= 75 ? 'Lulus' : 'Tidak Lulus'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== BANK SOAL ====================
function BankSoal({ searchQuery }: { searchQuery: string }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterMapel, setFilterMapel] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = mockBankSoal.filter(s => {
    const matchSearch = s.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase())
    const matchMapel = filterMapel === 'all' || s.mataPelajaran === filterMapel
    const matchDiff = filterDifficulty === 'all' || s.tingkatKesulitan === filterDifficulty
    const matchType = filterType === 'all' || s.tipeSoal === filterType
    return matchSearch && matchMapel && matchDiff && matchType
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white"
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
          >
            <option value="all">Semua Mapel</option>
            {[...new Set(mockBankSoal.map(s => s.mataPelajaran))].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="all">Semua Tingkat</option>
            <option value="MUDAH">Mudah</option>
            <option value="SEDANG">Sedang</option>
            <option value="SULIT">Sulit</option>
          </select>
          <select
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Semua Tipe</option>
            <option value="PILIHAN_GANDA">Pilihan Ganda</option>
            <option value="ESSAY">Essay</option>
            <option value="BENAR_SALAH">Benar/Salah</option>
            <option value="JAWABAN_SINGKAT">Jawaban Singkat</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />Impor</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Ekspor</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />Tambah Soal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Soal', value: mockBankSoal.length, color: 'text-emerald-600' },
          { label: 'Pilihan Ganda', value: mockBankSoal.filter(s => s.tipeSoal === 'PILIHAN_GANDA').length, color: 'text-violet-600' },
          { label: 'Essay', value: mockBankSoal.filter(s => s.tipeSoal === 'ESSAY').length, color: 'text-amber-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((soal, i) => (
          <motion.div
            key={soal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{soal.mataPelajaran}</Badge>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(soal.tingkatKesulitan)}`}>
                      {soal.tingkatKesulitan}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {soal.tipeSoal === 'PILIHAN_GANDA' ? 'PG' : soal.tipeSoal === 'ESSAY' ? 'Essay' : soal.tipeSoal === 'BENAR_SALAH' ? 'B/S' : 'Singkat'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Poin: {soal.poin}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed mb-3 line-clamp-3">{soal.pertanyaan}</p>
                {soal.opsiA && (
                  <div className="space-y-1 mb-3">
                    {[soal.opsiA, soal.opsiB, soal.opsiC, soal.opsiD].filter(Boolean).map((opsi, idx) => (
                      <div key={idx} className={`text-xs p-1.5 rounded ${String.fromCharCode(65 + idx) === soal.jawabanBenar ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600'}`}>
                        {String.fromCharCode(65 + idx)}. {opsi}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Oleh: {soal.guru}</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Copy className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Tambah Soal Baru</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Mata Pelajaran</label>
                    <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm">
                      {mockMapel.map(m => <option key={m.id}>{m.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Tipe Soal</label>
                    <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm">
                      <option>Pilihan Ganda</option>
                      <option>Essay</option>
                      <option>Benar/Salah</option>
                      <option>Jawaban Singkat</option>
                      <option>Menjodohkan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tingkat Kesulitan</label>
                  <div className="flex gap-2">
                    {['Mudah', 'Sedang', 'Sulit'].map((d) => (
                      <button key={d} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        d === 'Sedang' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Pertanyaan</label>
                  <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[100px]" placeholder="Tulis pertanyaan..." />
                </div>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <input type="radio" name="correct" className="accent-emerald-600" />
                      <span className="text-sm font-medium text-gray-600 w-6">Opsi {opt}:</span>
                      <Input className="flex-1" placeholder={`Masukkan opsi ${opt}...`} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Pembahasan</label>
                  <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px]" placeholder="Tulis pembahasan..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Poin</label>
                    <Input type="number" defaultValue={2} />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded accent-emerald-600" />
                      Publikasikan soal
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddModal(false)}>Simpan Soal</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== BUAT UJIAN ====================
function BuatUjian() {
  const [step, setStep] = useState(1)
  const [examList, setExamList] = useState(true)

  if (examList) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Daftar Ujian</h2>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setExamList(false)}>
            <Plus className="w-4 h-4 mr-2" />Buat Ujian Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {mockExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{exam.judul}</h3>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status === 'ONGOING' ? 'Berlangsung' : exam.status === 'PUBLISHED' ? 'Terbit' : exam.status === 'SELESAI' ? 'Selesai' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{exam.deskripsi}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{exam.mataPelajaran}</span>
                      <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{exam.durasi} menit</span>
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{exam.totalSoal} soal</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{exam.totalPeserta} peserta</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {exam.acakSoal && <span className="flex items-center gap-1 text-xs text-gray-400"><Shuffle className="w-3 h-3" />Acak Soal</span>}
                      {exam.acakOpsi && <span className="flex items-center gap-1 text-xs text-gray-400"><Shuffle className="w-3 h-3" />Acak Opsi</span>}
                      {exam.antiCheat && <span className="flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3 h-3" />Anti-Cheat</span>}
                      {exam.showResult && <span className="flex items-center gap-1 text-xs text-gray-400"><Eye className="w-3 h-3" />Tampilkan Hasil</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Wizard mode
  const steps = [
    { num: 1, label: 'Info Dasar', icon: FileText },
    { num: 2, label: 'Pilih Soal', icon: BookOpen },
    { num: 3, label: 'Pengaturan', icon: Settings },
    { num: 4, label: 'Assign Kelas', icon: Users },
    { num: 5, label: 'Review', icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                step === s.num ? 'bg-emerald-50 text-emerald-700 shadow-sm' :
                step > s.num ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num ? 'bg-emerald-600 text-white' :
                step > s.num ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Dasar Ujian</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Judul Ujian</label>
                <Input placeholder="Contoh: UTS Matematika Kelas XI IPA" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Deskripsi</label>
                <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px]" placeholder="Deskripsi ujian..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mata Pelajaran</label>
                  <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm">
                    {mockMapel.map(m => <option key={m.id}>{m.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tipe Ujian</label>
                  <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm">
                    <option>UTS</option><option>UAS</option><option>Quiz</option><option>Tugas</option><option>Try Out</option><option>Praktikum</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Durasi (menit)</label>
                  <Input type="number" defaultValue={90} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Token Ujian</label>
                  <Input placeholder="Opsional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal Mulai</label>
                  <Input type="datetime-local" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal Selesai</label>
                  <Input type="datetime-local" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Soal dari Bank Soal</h2>
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Cari soal..." className="max-w-xs" />
                <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm">
                  <option>Semua Mapel</option>
                  <option>Matematika</option>
                  <option>Fisika</option>
                </select>
                <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm">
                  <option>Semua Tingkat</option>
                  <option>Mudah</option>
                  <option>Sedang</option>
                  <option>Sulit</option>
                </select>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mockBankSoal.map((soal) => (
                  <div key={soal.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="mt-1 accent-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2">{soal.pertanyaan}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{soal.mataPelajaran}</Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(soal.tingkatKesulitan)}`}>{soal.tingkatKesulitan}</span>
                        <span className="text-xs text-gray-400">Poin: {soal.poin}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Ujian</h2>
              {[
                { label: 'Acak Urutan Soal', desc: 'Soal akan ditampilkan dalam urutan acak untuk setiap siswa', icon: Shuffle, defaultChecked: true },
                { label: 'Acak Opsi Jawaban', desc: 'Opsi jawaban pilihan ganda akan diacak', icon: Shuffle, defaultChecked: true },
                { label: 'Anti-Cheat', desc: 'Aktifkan deteksi tab switch, copy-paste, dan face detection', icon: Lock, defaultChecked: true },
                { label: 'Tampilkan Hasil Langsung', desc: 'Siswa dapat melihat nilai setelah selesai', icon: Eye, defaultChecked: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                      <setting.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked={setting.defaultChecked} className="accent-emerald-600 w-5 h-5" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Passing Grade (%)</label>
                <Input type="number" defaultValue={75} className="w-32" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Maksimum Percobaan</label>
                <Input type="number" defaultValue={1} className="w-32" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Assign ke Kelas</h2>
              <p className="text-sm text-gray-500 mb-4">Pilih kelas yang akan mengerjakan ujian ini</p>
              {mockKelas.filter(k => k.tingkat >= 10).map((kelas) => (
                <label key={kelas.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="accent-emerald-600 w-5 h-5" defaultChecked={kelas.tingkat === 11} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{kelas.nama}</p>
                    <p className="text-xs text-gray-500">Wali Kelas: {kelas.waliKelas} · {kelas.totalSiswa} siswa</p>
                  </div>
                  <Badge variant="outline">{kelas.totalSiswa} siswa</Badge>
                </label>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Review & Publikasi</h2>
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Ujian siap dipublikasikan</span>
                  </div>
                  <p className="text-sm text-emerald-700">Pastikan semua pengaturan sudah benar sebelum mempublikasikan ujian.</p>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Judul', value: 'UTS Matematika Kelas XI IPA' },
                  { label: 'Mata Pelajaran', value: 'Matematika' },
                  { label: 'Tipe', value: 'UTS' },
                  { label: 'Durasi', value: '90 menit' },
                  { label: 'Jumlah Soal', value: '30 soal' },
                  { label: 'Token', value: 'MTK2024' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-sm text-gray-600">Acak Soal</span>
                <CheckCircle className="w-4 h-4 text-emerald-500 ml-4" /><span className="text-sm text-gray-600">Acak Opsi</span>
                <CheckCircle className="w-4 h-4 text-emerald-500 ml-4" /><span className="text-sm text-gray-600">Anti-Cheat</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Kelas yang ditugaskan:</p>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700">XI IPA 1</Badge>
                  <Badge className="bg-emerald-100 text-emerald-700">XI IPA 2</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : setExamList(true)}>
              <ArrowLeft className="w-4 h-4 mr-2" />{step > 1 ? 'Sebelumnya' : 'Kembali'}
            </Button>
            {step < 5 ? (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(step + 1)}>
                Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setExamList(true)}>
                Publikasikan Ujian <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== HASIL UJIAN ====================
function HasilUjian() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white">
          <option>Semua Ujian</option>
          {mockExams.map(e => <option key={e.id} value={e.id}>{e.judul}</option>)}
        </select>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Ekspor ke Excel</Button>
      </div>

      {/* Grade Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribusi Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={gradeDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                {gradeDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Siswa</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Kelas</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Ujian</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Nilai PG</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Nilai Essay</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Nilai</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Durasi</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mockExamResults.map((result) => (
                  <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{result.siswa}</td>
                    <td className="py-3 px-4 text-gray-600">{result.kelas}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{result.examJudul}</td>
                    <td className="py-3 px-4 text-gray-600">{result.nilai}</td>
                    <td className="py-3 px-4 text-gray-600">{result.nilaiEssay || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${result.totalNilai >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.totalNilai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{formatDuration(result.durasi)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        result.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {result.status === 'SELESAI' ? 'Selesai' : 'Timeout'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedExam(result.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== NILAI & RAPOR ====================
function NilaiRapor() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white">
          <option>Semua Kelas</option>
          {mockKelas.map(k => <option key={k.id}>{k.nama}</option>)}
        </select>
        <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white">
          <option>Semester Ganjil 2024/2025</option>
          <option>Semester Genap 2023/2024</option>
        </select>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Cetak Rapor</Button>
      </div>

      {/* Class Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan Nilai per Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Kelas</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Matematika</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">B. Indonesia</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">B. Inggris</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Fisika</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Kimia</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Rata-rata</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { kelas: 'X IPA 1', mtk: 78, bin: 82, big: 71, fis: 75, kim: 77, avg: 76.6 },
                  { kelas: 'X IPA 2', mtk: 74, bin: 79, big: 68, fis: 72, kim: 73, avg: 73.2 },
                  { kelas: 'XI IPA 1', mtk: 82, bin: 85, big: 76, fis: 80, kim: 81, avg: 80.8 },
                  { kelas: 'XI IPA 2', mtk: 76, bin: 80, big: 70, fis: 74, kim: 75, avg: 75.0 },
                  { kelas: 'XII IPA 1', mtk: 84, bin: 87, big: 78, fis: 82, kim: 83, avg: 82.8 },
                ].map((row) => (
                  <tr key={row.kelas} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.kelas}</td>
                    {[row.mtk, row.bin, row.big, row.fis, row.kim].map((val, i) => (
                      <td key={i} className="py-3 px-4">
                        <span className={`font-medium ${val >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{val}</span>
                      </td>
                    ))}
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900">{row.avg}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Student Grade Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { nama: 'Rizky Pratama', kelas: 'XI IPA 1', nilai: [85, 88, 78, 82, 80], avg: 82.6 },
          { nama: 'Anisa Rahma', kelas: 'XI IPA 1', nilai: [92, 90, 85, 88, 91], avg: 89.2 },
          { nama: 'Fajar Nugroho', kelas: 'XI IPA 1', nilai: [78, 72, 65, 70, 68], avg: 70.6 },
          { nama: 'Putri Handayani', kelas: 'XI IPA 1', nilai: [95, 92, 88, 90, 93], avg: 91.6 },
          { nama: 'Dimas Arya Putra', kelas: 'XI IPA 2', nilai: [70, 75, 62, 68, 72], avg: 69.4 },
          { nama: 'Laila Fitriani', kelas: 'XI IPA 2', nilai: [83, 86, 79, 82, 85], avg: 83.0 },
        ].map((student) => (
          <Card key={student.nama} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  student.avg >= 80 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                  student.avg >= 70 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                  'bg-gradient-to-br from-red-400 to-orange-500'
                }`}>
                  {student.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student.nama}</p>
                  <p className="text-xs text-gray-500">{student.kelas}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className={`text-lg font-bold ${student.avg >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{student.avg}</p>
                  <p className="text-xs text-gray-500">Rata-rata</p>
                </div>
              </div>
              <div className="space-y-2">
                {student.nilai.map((n, i) => {
                  const mapel = ['MTK', 'BIN', 'BIG', 'FIS', 'KIM'][i]
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">{mapel}</span>
                      <Progress value={n} className="flex-1 h-1.5" />
                      <span className={`text-xs font-medium w-8 text-right ${n >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{n}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
