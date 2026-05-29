'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Award, User,
  Bell, Search, LogOut, ChevronRight,
  Clock, BookOpen, BarChart3, CheckCircle, XCircle,
  GraduationCap, Calendar, Target, Trophy, Zap,
  Loader2, AlertCircle, Star, TrendingUp, Timer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  getStatusColor
} from './mock-data'

type SiswaTab = 'dashboard' | 'ujian' | 'hasil' | 'profil'

interface SiswaDashboardProps {
  onBack: () => void
  user?: { id: string; name: string; email: string; role: string; avatar?: string }
  token?: string | null
}

// API Types
interface ApiExam {
  id: string
  judul: string
  deskripsi: string | null
  mataPelajaranId: string
  guruId: string
  durasi: number
  tipeExam: string
  token: string | null
  status: string
  acakSoal: boolean
  acakOpsi: boolean
  showResult: boolean
  antiCheat: boolean
  mataPelajaran: { id: string; nama: string; kode: string }
  guru: { id: string; name: string }
  examKelas: { kelas: { id: string; nama: string; tingkat: number } }[]
  _count: { participants: number; examSoal: number }
}

interface ApiResult {
  id: string
  examId: string
  siswaId: string
  status: string
  mulaiPada: string | null
  selesaiPada: string | null
  durasi: number | null
  nilai: number | null
  nilaiEssay: number | null
  totalNilai: number | null
  attempt: number
  exam: { id: string; judul: string; tipeExam: string; status: string; mataPelajaran: { nama: string; kode: string } }
}

interface ApiProfile {
  id: string
  name: string
  email: string
  nipNis: string | null
  phone: string | null
  avatar: string | null
  kelas: { id: string; nama: string; tingkat: number; sekolah: { nama: string } } | null
}

const sidebarItems: { id: SiswaTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ujian', label: 'Ujian Saya', icon: FileText },
  { id: 'hasil', label: 'Hasil Ujian', icon: Award },
  { id: 'profil', label: 'Profil', icon: User },
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

export function SiswaDashboard({ onBack, user, token }: SiswaDashboardProps) {
  const [activeTab, setActiveTab] = useState<SiswaTab>('dashboard')
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
              <span className="text-xs text-gray-500 block -mt-1">Siswa Panel</span>
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
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-teal-600' : ''}`} />
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-teal-400" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'SN'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Siswa'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
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
          {activeTab === 'dashboard' && <SiswaOverview token={token ?? null} />}
          {activeTab === 'ujian' && <UjianSaya token={token ?? null} searchQuery={searchQuery} />}
          {activeTab === 'hasil' && <HasilUjian token={token ?? null} />}
          {activeTab === 'profil' && <SiswaProfil token={token ?? null} user={user} />}
        </div>
      </main>
    </div>
  )
}

// ==================== SISWA OVERVIEW ====================
function SiswaOverview({ token }: { token: string | null }) {
  const [exams, setExams] = useState<ApiExam[]>([])
  const [results, setResults] = useState<ApiResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [examsRes, resultsRes] = await Promise.all([
          apiFetch('/api/v1/siswa/exams?limit=10', token),
          apiFetch('/api/v1/siswa/results?limit=5', token),
        ])
        if (examsRes.success) setExams(examsRes.data?.data || [])
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
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
  }

  const upcomingExams = exams.filter(e => e.status === 'PUBLISHED' || e.status === 'ONGOING')
  const completedExams = exams.filter(e => e.status === 'SELESAI')
  const avgScore = results.filter(r => r.totalNilai !== null).length > 0
    ? results.filter(r => r.totalNilai !== null).reduce((sum, r) => sum + (r.totalNilai ?? 0), 0) / results.filter(r => r.totalNilai !== null).length
    : 0

  const stats = [
    { label: 'Ujian Mendatang', value: upcomingExams.length, icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Ujian Selesai', value: completedExams.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rata-rata Nilai', value: avgScore > 0 ? avgScore.toFixed(1) : '-', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Ujian', value: exams.length, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-teal-500 to-emerald-600 border-0 overflow-hidden relative">
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Selamat Datang! 👋</h2>
              <p className="text-teal-100 text-sm mt-1">Siap untuk ujian hari ini? Periksa jadwal ujianmu di bawah.</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      </Card>

      {/* Stats Grid */}
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
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Ujian Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada ujian mendatang</p>
            ) : (
              upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    exam.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-100 text-teal-600'
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

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Hasil Terbaru
            </CardTitle>
          </CardHeader>
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
                    <p className="text-sm font-semibold text-gray-900 truncate">{result.exam?.judul || '-'}</p>
                    <p className="text-xs text-gray-500">{result.exam?.mataPelajaran?.nama || '-'}</p>
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

// ==================== UJIAN SAYA ====================
function UjianSaya({ token, searchQuery }: { token: string | null; searchQuery: string }) {
  const [exams, setExams] = useState<ApiExam[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/v1/siswa/exams?limit=50', token)
      if (res.success) setExams(res.data?.data || [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchExams() }, [fetchExams])

  const filteredExams = exams.filter(exam => {
    const matchesSearch = !searchQuery || exam.judul.toLowerCase().includes(searchQuery.toLowerCase()) || exam.mataPelajaran?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || exam.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'ONGOING', label: 'Berlangsung' },
            { id: 'PUBLISHED', label: 'Belum Mulai' },
            { id: 'SELESAI', label: 'Selesai' },
            { id: 'DRAFT', label: 'Draft' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-teal-100 text-teal-700 shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium">Belum ada ujian</p>
            <p className="text-sm">Ujian yang ditugaskan akan muncul di sini</p>
          </div>
        ) : (
          filteredExams.map((exam, i) => (
            <motion.div key={exam.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getStatusColor(exam.status)}>
                      {exam.status === 'ONGOING' ? 'Berlangsung' : exam.status === 'PUBLISHED' ? 'Belum Mulai' : exam.status === 'SELESAI' ? 'Selesai' : 'Draft'}
                    </Badge>
                    {exam.token && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                        <Zap className="w-3 h-3" />{exam.token}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{exam.judul}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{exam.deskripsi || '-'}</p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-500" />
                      <span>{exam.mataPelajaran?.nama || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-500" />
                      <span>{exam.durasi} menit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-500" />
                      <span>{exam._count?.examSoal ?? 0} soal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    {exam.status === 'ONGOING' ? (
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                        Masuk Ujian
                      </Button>
                    ) : exam.status === 'PUBLISHED' ? (
                      <Button size="sm" variant="outline" className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50">
                        Lihat Detail
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1">
                        Lihat Detail
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// ==================== HASIL UJIAN ====================
function HasilUjian({ token }: { token: string | null }) {
  const [results, setResults] = useState<ApiResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await apiFetch('/api/v1/siswa/results?limit=50', token)
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
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
  }

  const avgScore = results.filter(r => r.totalNilai !== null).length > 0
    ? results.filter(r => r.totalNilai !== null).reduce((sum, r) => sum + (r.totalNilai ?? 0), 0) / results.filter(r => r.totalNilai !== null).length
    : 0
  const passedCount = results.filter(r => (r.totalNilai ?? 0) >= 75).length
  const failedCount = results.filter(r => (r.totalNilai ?? 0) < 75 && r.totalNilai !== null).length

  const gradeData = [
    { name: 'Lulus', value: passedCount, fill: '#10b981' },
    { name: 'Tidak Lulus', value: failedCount, fill: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Rata-rata Nilai', value: avgScore.toFixed(1), icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Lulus', value: passedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tidak Lulus', value: failedCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Kelulusan</CardTitle>
          </CardHeader>
          <CardContent>
            {passedCount + failedCount > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gradeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p>Belum ada data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Riwayat Hasil Ujian</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Belum ada hasil ujian</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Ujian</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Mata Pelajaran</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Nilai</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Durasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{result.exam?.judul || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{result.exam?.mataPelajaran?.nama || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${(result.totalNilai ?? 0) >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {result.totalNilai?.toFixed(1) ?? '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            (result.totalNilai ?? 0) >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {(result.totalNilai ?? 0) >= 75 ? 'Lulus' : 'Tidak Lulus'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {result.durasi ? `${Math.floor(result.durasi / 60)} menit` : '-'}
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
    </div>
  )
}

// ==================== SISWA PROFIL ====================
function SiswaProfil({ token, user }: { token: string | null; user?: { id: string; name: string; email: string; role: string; avatar?: string } }) {
  const [profile, setProfile] = useState<ApiProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await apiFetch('/api/v1/siswa/profile', token)
        if (res.success) setProfile(res.data || null)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
  }

  const displayName = profile?.name || user?.name || 'Siswa'
  const initials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('')

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-200/50">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-500">{profile?.email || user?.email || '-'}</p>
              <p className="text-xs text-gray-400 mt-1">
                {profile?.kelas ? `${profile.kelas.nama} · ${profile.kelas.sekolah?.nama || '-'}` : 'NIS: ' + (profile?.nipNis || '-')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Nama Lengkap', value: displayName },
            { label: 'Email', value: profile?.email || user?.email || '-' },
            { label: 'NIS', value: profile?.nipNis || '-' },
            { label: 'No. Telepon', value: profile?.phone || '-' },
            { label: 'Kelas', value: profile?.kelas?.nama || '-' },
            { label: 'Sekolah', value: profile?.kelas?.sekolah?.nama || '-' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistik Belajar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Ujian Dikerjakan', value: '-', icon: FileText, color: 'text-teal-600' },
              { label: 'Rata-rata Nilai', value: '-', icon: BarChart3, color: 'text-emerald-600' },
              { label: 'Peringkat', value: '-', icon: Trophy, color: 'text-amber-600' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
