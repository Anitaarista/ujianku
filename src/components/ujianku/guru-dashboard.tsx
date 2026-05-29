'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, FileText, ClipboardCheck, Award,
  Bell, Search, LogOut, ChevronRight, Plus, Download,
  TrendingUp, Clock, Users, CheckCircle, XCircle, Edit,
  Trash2, Eye, MoreVertical, ArrowLeft, ArrowRight, Upload,
  GraduationCap, BarChart3, Settings, AlertTriangle, Star,
  Check, Filter, Copy, Shuffle, Lock, Unlock, Timer,
  BookMarked, Layers, Flag, Loader2, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  gradeDistributionData, getStatusColor, getDifficultyColor, formatDuration
} from './mock-data'

type GuruTab = 'dashboard' | 'bank-soal' | 'buat-ujian' | 'hasil-ujian' | 'nilai'

interface GuruDashboardProps {
  onBack: () => void
  user?: { id: string; name: string; email: string; role: string; avatar?: string }
  token?: string | null
}

// API Types
interface ApiBankSoal {
  id: string; mataPelajaranId: string; guruId: string; tipeSoal: string; tingkatKesulitan: string
  pertanyaan: string; opsiA: string | null; opsiB: string | null; opsiC: string | null; opsiD: string | null; opsiE: string | null
  jawabanBenar: string | null; pembahasan: string | null; poin: number; isPublic: boolean
  mataPelajaran: { id: string; nama: string; kode: string }
  guru: { id: string; name: string }
}

interface ApiExam {
  id: string; judul: string; deskripsi: string | null; mataPelajaranId: string; guruId: string
  durasi: number; tipeExam: string; token: string | null; status: string
  acakSoal: boolean; acakOpsi: boolean; showResult: boolean; antiCheat: boolean
  mataPelajaran: { id: string; nama: string; kode: string }
  guru: { id: string; name: string }
  examKelas: { kelas: { id: string; nama: string; tingkat: number } }[]
  _count: { participants: number; examSoal: number }
  stats?: { completedParticipants: number; averageScore: number | null }
}

interface ApiResult {
  id: string; examId: string; siswaId: string; status: string
  mulaiPada: string | null; selesaiPada: string | null; durasi: number | null
  nilai: number | null; nilaiEssay: number | null; totalNilai: number | null; attempt: number
  exam: { id: string; judul: string; tipeExam: string; status: string; mataPelajaran: { nama: string; kode: string } }
  siswa: { id: string; name: string; email: string; nipNis: string | null }
}

interface ApiMapel {
  id: string; kode: string; nama: string; kkm: number; kelompok: string | null
}

interface ApiKelas {
  id: string; nama: string; tingkat: number; tahunAjaran: string
  waliKelas: { id: string; name: string } | null
  _count: { siswaKelas: number }
}

const sidebarItems: { id: GuruTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bank-soal', label: 'Bank Soal', icon: BookOpen },
  { id: 'buat-ujian', label: 'Buat Ujian', icon: FileText },
  { id: 'hasil-ujian', label: 'Hasil Ujian', icon: ClipboardCheck },
  { id: 'nilai', label: 'Nilai & Rapor', icon: Award },
]

// API helper
async function apiFetch(url: string, token: string | null, options?: RequestInit) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { ...options, headers })
  return res.json()
}

export function GuruDashboard({ onBack, user, token }: GuruDashboardProps) {
  const [activeTab, setActiveTab] = useState<GuruTab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen bg-gray-50">
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
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'SN'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Guru'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

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
          {activeTab === 'dashboard' && <GuruOverview token={token} />}
          {activeTab === 'bank-soal' && <BankSoal token={token} searchQuery={searchQuery} />}
          {activeTab === 'buat-ujian' && <BuatUjian token={token} />}
          {activeTab === 'hasil-ujian' && <HasilUjian token={token} />}
          {activeTab === 'nilai' && <NilaiRapor token={token} />}
        </div>
      </main>
    </div>
  )
}

// ==================== GURU OVERVIEW ====================
function GuruOverview({ token }: { token: string | null }) {
  const [exams, setExams] = useState<ApiExam[]>([])
  const [results, setResults] = useState<ApiResult[]>([])
  const [summary, setSummary] = useState<{ totalQuestions: number; byType: { type: string; count: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [examsRes, bankSoalRes, resultsRes] = await Promise.all([
          apiFetch('/api/v1/guru/exams?limit=10', token),
          apiFetch('/api/v1/guru/bank-soal?limit=1', token),
          apiFetch('/api/v1/guru/results?limit=5', token),
        ])
        if (examsRes.success) setExams(examsRes.data?.data || [])
        if (bankSoalRes.success) setSummary(bankSoalRes.data?.summary || null)
        if (resultsRes.success) setResults(resultsRes.data?.data || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  }

  const totalSoal = summary?.totalQuestions ?? 0
  const ujianAktif = exams.filter(e => e.status === 'PUBLISHED' || e.status === 'ONGOING').length
  const avgScore = results.filter(r => r.totalNilai !== null).reduce((sum, r) => sum + (r.totalNilai ?? 0), 0) / (results.filter(r => r.totalNilai !== null).length || 1)

  const stats = [
    { label: 'Total Soal', value: totalSoal, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ujian Aktif', value: ujianAktif, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Ujian', value: exams.length, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Rata-rata Nilai', value: avgScore.toFixed(1), icon: BarChart3, color: 'text-sky-600', bg: 'bg-sky-50' },
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
                    <p className="text-xs text-gray-400 mt-1">Data real-time</p>
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
        <Card>
          <CardHeader><CardTitle className="text-base">Ujian Mendatang</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {exams.filter(e => e.status === 'PUBLISHED' || e.status === 'ONGOING').length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada ujian mendatang</p>
            ) : (
              exams.filter(e => e.status === 'PUBLISHED' || e.status === 'ONGOING').map((exam) => (
                <div key={exam.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    exam.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {exam.status === 'ONGOING' ? <Timer className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{exam.judul}</p>
                    <p className="text-xs text-gray-500">{exam.mataPelajaran?.nama || '-'} · {exam.durasi} menit · {exam._count?.examSoal ?? 0} soal</p>
                  </div>
                  <Badge className={getStatusColor(exam.status)}>
                    {exam.status === 'ONGOING' ? 'Berlangsung' : 'Terbit'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Hasil Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {results.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada hasil ujian</p>
            ) : (
              results.slice(0, 5).map((result) => (
                <div key={result.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    (result.totalNilai ?? 0) >= 75 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-red-400 to-orange-500'
                  }`}>
                    {result.totalNilai?.toFixed(0) ?? '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{result.siswa?.name || '-'}</p>
                    <p className="text-xs text-gray-500">{result.exam?.judul || '-'}</p>
                  </div>
                  <span className={`text-xs font-medium ${(result.totalNilai ?? 0) >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(result.totalNilai ?? 0) >= 75 ? 'Lulus' : 'Tidak Lulus'}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== BANK SOAL ====================
function BankSoal({ token, searchQuery }: { token: string | null; searchQuery: string }) {
  const [soalList, setSoalList] = useState<ApiBankSoal[]>([])
  const [mapelList, setMapelList] = useState<ApiMapel[]>([])
  const [summary, setSummary] = useState<{ totalQuestions: number; byType: { type: string; count: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newSoal, setNewSoal] = useState({
    mataPelajaranId: '', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
    pertanyaan: '', opsiA: '', opsiB: '', opsiC: '', opsiD: '', opsiE: '',
    jawabanBenar: 'A', pembahasan: '', poin: 2, isPublic: false
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '50' })
      if (searchQuery) params.set('search', searchQuery)
      if (filterDifficulty !== 'all') params.set('difficulty', filterDifficulty)
      if (filterType !== 'all') params.set('type', filterType)
      const [soalRes, mapelRes] = await Promise.all([
        apiFetch(`/api/v1/guru/bank-soal?${params}`, token),
        apiFetch('/api/v1/admin/mata-pelajaran?limit=50', token),
      ])
      if (soalRes.success) {
        setSoalList(soalRes.data?.data || [])
        setSummary(soalRes.data?.summary || null)
      }
      if (mapelRes.success) setMapelList(mapelRes.data?.data || [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [token, searchQuery, filterDifficulty, filterType])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddSoal = async () => {
    if (!newSoal.mataPelajaranId || !newSoal.pertanyaan) return
    try {
      setSaving(true)
      const res = await apiFetch('/api/v1/bank-soal', token, {
        method: 'POST',
        body: JSON.stringify(newSoal),
      })
      if (res.success) {
        setShowAddModal(false)
        setNewSoal({
          mataPelajaranId: '', tipeSoal: 'PILIHAN_GANDA', tingkatKesulitan: 'SEDANG',
          pertanyaan: '', opsiA: '', opsiB: '', opsiC: '', opsiD: '', opsiE: '',
          jawabanBenar: 'A', pembahasan: '', poin: 2, isPublic: false
        })
        fetchData()
      }
    } catch {
      // silently handle
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSoal = async (id: string) => {
    if (!confirm('Yakin ingin menghapus soal ini?')) return
    try {
      await apiFetch(`/api/v1/bank-soal/${id}`, token, { method: 'DELETE' })
      fetchData()
    } catch {
      // silently handle
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  }

  const totalSoal = summary?.totalQuestions ?? soalList.length
  const pgCount = summary?.byType?.find(b => b.type === 'PILIHAN_GANDA')?.count ?? 0
  const essayCount = summary?.byType?.find(b => b.type === 'ESSAY')?.count ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
            <option value="all">Semua Tingkat</option>
            <option value="MUDAH">Mudah</option>
            <option value="SEDANG">Sedang</option>
            <option value="SULIT">Sulit</option>
          </select>
          <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Semua Tipe</option>
            <option value="PILIHAN_GANDA">Pilihan Ganda</option>
            <option value="ESSAY">Essay</option>
            <option value="BENAR_SALAH">Benar/Salah</option>
            <option value="JAWABAN_SINGKAT">Jawaban Singkat</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Ekspor</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />Tambah Soal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Soal', value: totalSoal, color: 'text-emerald-600' },
          { label: 'Pilihan Ganda', value: pgCount, color: 'text-violet-600' },
          { label: 'Essay', value: essayCount, color: 'text-amber-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {soalList.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">Belum ada soal</div>
        ) : (
          soalList.map((soal, i) => (
            <motion.div key={soal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{soal.mataPelajaran?.nama || '-'}</Badge>
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
                    <span className="text-xs text-gray-400">Oleh: {soal.guru?.name || '-'}</span>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Copy className="w-3.5 h-3.5 text-gray-400" /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-3.5 h-3.5 text-gray-400" /></button>
                      <button onClick={() => handleDeleteSoal(soal.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Tambah Soal Baru</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Mata Pelajaran</label>
                    <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={newSoal.mataPelajaranId} onChange={(e) => setNewSoal({ ...newSoal, mataPelajaranId: e.target.value })}>
                      <option value="">Pilih Mapel</option>
                      {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Tipe Soal</label>
                    <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={newSoal.tipeSoal} onChange={(e) => setNewSoal({ ...newSoal, tipeSoal: e.target.value })}>
                      <option value="PILIHAN_GANDA">Pilihan Ganda</option>
                      <option value="ESSAY">Essay</option>
                      <option value="BENAR_SALAH">Benar/Salah</option>
                      <option value="JAWABAN_SINGKAT">Jawaban Singkat</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tingkat Kesulitan</label>
                  <div className="flex gap-2">
                    {(['MUDAH', 'SEDANG', 'SULIT'] as const).map((d) => (
                      <button key={d} onClick={() => setNewSoal({ ...newSoal, tingkatKesulitan: d })} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        newSoal.tingkatKesulitan === d ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>{d === 'MUDAH' ? 'Mudah' : d === 'SEDANG' ? 'Sedang' : 'Sulit'}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Pertanyaan</label>
                  <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[100px]" placeholder="Tulis pertanyaan..." value={newSoal.pertanyaan} onChange={(e) => setNewSoal({ ...newSoal, pertanyaan: e.target.value })} />
                </div>
                {newSoal.tipeSoal === 'PILIHAN_GANDA' && (
                  <div className="space-y-2">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <input type="radio" name="correct" checked={newSoal.jawabanBenar === opt} onChange={() => setNewSoal({ ...newSoal, jawabanBenar: opt })} className="accent-emerald-600" />
                        <span className="text-sm font-medium text-gray-600 w-6">Opsi {opt}:</span>
                        <Input className="flex-1" placeholder={`Masukkan opsi ${opt}...`} value={newSoal[`opsi${opt}` as keyof typeof newSoal] as string} onChange={(e) => setNewSoal({ ...newSoal, [`opsi${opt}`]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Pembahasan</label>
                  <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px]" placeholder="Tulis pembahasan..." value={newSoal.pembahasan} onChange={(e) => setNewSoal({ ...newSoal, pembahasan: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Poin</label>
                    <Input type="number" value={newSoal.poin} onChange={(e) => setNewSoal({ ...newSoal, poin: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={newSoal.isPublic} onChange={(e) => setNewSoal({ ...newSoal, isPublic: e.target.checked })} className="rounded accent-emerald-600" />
                      Publikasikan soal
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddSoal} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Soal
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== BUAT UJIAN ====================
function BuatUjian({ token }: { token: string | null }) {
  const [exams, setExams] = useState<ApiExam[]>([])
  const [mapelList, setMapelList] = useState<ApiMapel[]>([])
  const [kelasList, setKelasList] = useState<ApiKelas[]>([])
  const [soalList, setSoalList] = useState<ApiBankSoal[]>([])
  const [loading, setLoading] = useState(true)
  const [examList, setExamList] = useState(true)
  const [step, setStep] = useState(1)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [examsRes, mapelRes, kelasRes, soalRes] = await Promise.all([
          apiFetch('/api/v1/guru/exams?limit=50', token),
          apiFetch('/api/v1/admin/mata-pelajaran?limit=50', token),
          apiFetch('/api/v1/admin/kelas?limit=50', token),
          apiFetch('/api/v1/guru/bank-soal?limit=50', token),
        ])
        if (examsRes.success) setExams(examsRes.data?.data || [])
        if (mapelRes.success) setMapelList(mapelRes.data?.data || [])
        if (kelasRes.success) setKelasList(kelasRes.data?.data || [])
        if (soalRes.success) setSoalList(soalRes.data?.data || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  }

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
          {exams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada ujian</div>
          ) : (
            exams.map((exam) => (
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
                      <p className="text-sm text-gray-500 mb-2">{exam.deskripsi || '-'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{exam.mataPelajaran?.nama || '-'}</span>
                        <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{exam.durasi} menit</span>
                        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{exam._count?.examSoal ?? 0} soal</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{exam._count?.participants ?? 0} peserta</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {exam.acakSoal && <span className="flex items-center gap-1 text-xs text-gray-400"><Shuffle className="w-3 h-3" />Acak Soal</span>}
                        {exam.acakOpsi && <span className="flex items-center gap-1 text-xs text-gray-400"><Shuffle className="w-3 h-3" />Acak Opsi</span>}
                        {exam.antiCheat && <span className="flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3 h-3" />Anti-Cheat</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  const steps = [
    { num: 1, label: 'Info Dasar', icon: FileText },
    { num: 2, label: 'Pilih Soal', icon: BookOpen },
    { num: 3, label: 'Pengaturan', icon: Settings },
    { num: 4, label: 'Assign Kelas', icon: Users },
    { num: 5, label: 'Review', icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <button onClick={() => setStep(s.num)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === s.num ? 'bg-emerald-50 text-emerald-700 shadow-sm' : step > s.num ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s.num ? 'bg-emerald-600 text-white' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
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
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Judul Ujian</label><Input placeholder="Contoh: UTS Matematika Kelas XI IPA" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Deskripsi</label><textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px]" placeholder="Deskripsi ujian..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Mata Pelajaran</label>
                  <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm">{mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}</select>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tipe Ujian</label>
                  <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm"><option>UTS</option><option>UAS</option><option>QUIZ</option><option>TUGAS</option><option>TRYOUT</option><option>PRAKTIKUM</option></select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Durasi (menit)</label><Input type="number" defaultValue={90} /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Token Ujian</label><Input placeholder="Opsional" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal Mulai</label><Input type="datetime-local" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal Selesai</label><Input type="datetime-local" /></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Soal dari Bank Soal</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {soalList.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Belum ada soal di bank soal</p>
                ) : (
                  soalList.map((soal) => (
                    <div key={soal.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="mt-1 accent-emerald-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 line-clamp-2">{soal.pertanyaan}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{soal.mataPelajaran?.nama || '-'}</Badge>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(soal.tingkatKesulitan)}`}>{soal.tingkatKesulitan}</span>
                          <span className="text-xs text-gray-400">Poin: {soal.poin}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center"><setting.icon className="w-5 h-5 text-gray-600" /></div>
                    <div><p className="text-sm font-medium text-gray-900">{setting.label}</p><p className="text-xs text-gray-500">{setting.desc}</p></div>
                  </div>
                  <input type="checkbox" defaultChecked={setting.defaultChecked} className="accent-emerald-600 w-5 h-5" />
                </div>
              ))}
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Passing Grade (%)</label><Input type="number" defaultValue={75} className="w-32" /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Maksimum Percobaan</label><Input type="number" defaultValue={1} className="w-32" /></div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Assign ke Kelas</h2>
              <p className="text-sm text-gray-500 mb-4">Pilih kelas yang akan mengerjakan ujian ini</p>
              {kelasList.filter(k => k.tingkat >= 10).map((kelas) => (
                <label key={kelas.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="accent-emerald-600 w-5 h-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{kelas.nama}</p>
                    <p className="text-xs text-gray-500">Wali Kelas: {kelas.waliKelas?.name || '-'} · {kelas._count?.siswaKelas ?? 0} siswa</p>
                  </div>
                  <Badge variant="outline">{kelas._count?.siswaKelas ?? 0} siswa</Badge>
                </label>
              ))}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Review & Publikasi</h2>
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-emerald-600" /><span className="font-semibold text-emerald-800">Ujian siap dipublikasikan</span></div>
                  <p className="text-sm text-emerald-700">Pastikan semua pengaturan sudah benar sebelum mempublikasikan ujian.</p>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : setExamList(true)}>
              <ArrowLeft className="w-4 h-4 mr-2" />{step > 1 ? 'Sebelumnya' : 'Kembali'}
            </Button>
            {step < 5 ? (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(step + 1)}>Selanjutnya <ArrowRight className="w-4 h-4 ml-2" /></Button>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setExamList(true)}>Publikasikan Ujian <CheckCircle className="w-4 h-4 ml-2" /></Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== HASIL UJIAN ====================
function HasilUjian({ token }: { token: string | null }) {
  const [results, setResults] = useState<ApiResult[]>([])
  const [exams, setExams] = useState<ApiExam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [resultsRes, examsRes] = await Promise.all([
          apiFetch('/api/v1/guru/results?limit=50', token),
          apiFetch('/api/v1/guru/exams?limit=50', token),
        ])
        if (resultsRes.success) setResults(resultsRes.data?.data || [])
        if (examsRes.success) setExams(examsRes.data?.data || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white">
          <option>Semua Ujian</option>
          {exams.map(e => <option key={e.id} value={e.id}>{e.judul}</option>)}
        </select>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Ekspor ke Excel</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Distribusi Nilai</CardTitle></CardHeader>
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Siswa</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Ujian</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Nilai PG</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Nilai Essay</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Nilai</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Durasi</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">Belum ada hasil ujian</td></tr>
                ) : (
                  results.map((result) => (
                    <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {result.siswa?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '?'}
                          </div>
                          <span className="font-medium text-gray-900">{result.siswa?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{result.exam?.judul || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{result.nilai !== null ? result.nilai.toFixed(1) : '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{result.nilaiEssay !== null ? result.nilaiEssay.toFixed(1) : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${(result.totalNilai ?? 0) >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {result.totalNilai !== null ? result.totalNilai.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{result.durasi ? formatDuration(result.durasi) : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status === 'SELESAI' ? 'Selesai' : result.status === 'TIMEOUT' ? 'Waktu Habis' : result.status === 'DISKUALIFIKASI' ? 'Diskualifikasi' : result.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== NILAI & RAPOR ====================
function NilaiRapor({ token }: { token: string | null }) {
  const [results, setResults] = useState<ApiResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await apiFetch('/api/v1/guru/results?limit=100', token)
        if (res.success) setResults(res.data?.data || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  }

  const totalResults = results.filter(r => r.totalNilai !== null)
  const avgScore = totalResults.length > 0 ? totalResults.reduce((sum, r) => sum + (r.totalNilai ?? 0), 0) / totalResults.length : 0
  const passingRate = totalResults.length > 0 ? (totalResults.filter(r => (r.totalNilai ?? 0) >= 75).length / totalResults.length) * 100 : 0
  const highestScore = totalResults.length > 0 ? Math.max(...totalResults.map(r => r.totalNilai ?? 0)) : 0
  const lowestScore = totalResults.length > 0 ? Math.min(...totalResults.map(r => r.totalNilai ?? 0)) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Rata-rata Nilai', value: avgScore.toFixed(1), icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Passing Rate', value: `${passingRate.toFixed(0)}%`, icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
          { label: 'Nilai Tertinggi', value: highestScore.toFixed(1), icon: Star, color: 'text-amber-600 bg-amber-50' },
          { label: 'Nilai Terendah', value: lowestScore.toFixed(1), icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Rekap Nilai Siswa</CardTitle></CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Belum ada data nilai</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Siswa</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Ujian</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Nilai</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{result.siswa?.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{result.exam?.judul || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${(result.totalNilai ?? 0) >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {result.totalNilai !== null ? result.totalNilai.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${(result.totalNilai ?? 0) >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {(result.totalNilai ?? 0) >= 75 ? 'Lulus' : 'Tidak Lulus'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
