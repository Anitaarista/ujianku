'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Eye, AlertTriangle, FileText,
  Bell, Search, LogOut, ChevronRight,
  Clock, Users, Shield, CheckCircle, XCircle,
  GraduationCap, BarChart3, Activity, Flag, Timer,
  Loader2, AlertCircle, Ban, Camera, MonitorSmartphone,
  Download, TrendingUp, MoreVertical, StopCircle, Info
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
  getStatusColor, getViolationSeverityColor
} from './mock-data'

type PengawasTab = 'dashboard' | 'sesi' | 'pelanggaran' | 'laporan'

interface PengawasDashboardProps {
  onBack: () => void
  user?: { id: string; name: string; email: string; role: string; avatar?: string }
  token?: string | null
}

// API Types
interface ApiSession {
  id: string
  examId: string
  exam: { id: string; judul: string; mataPelajaran: { nama: string }; durasi: number }
  kelas: { id: string; nama: string; tingkat: number }
  status: string
  totalSiswa: number
  aktifSiswa: number
  violations: number
  startedAt: string | null
  endedAt: string | null
}

interface ApiViolation {
  id: string
  siswaId: string
  siswa: { id: string; name: string; nipNis: string | null }
  examId: string
  exam: { id: string; judul: string }
  tipe: string
  deskripsi: string
  severity: string
  waktu: string
  screenshot: string | null
}

interface ApiStudentMonitor {
  id: string
  name: string
  status: 'active' | 'warning' | 'danger'
  progress: number
  violations: number
  lastActivity: string
}

const sidebarItems: { id: PengawasTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sesi', label: 'Sesi Proctoring', icon: Eye },
  { id: 'pelanggaran', label: 'Pelanggaran', icon: AlertTriangle },
  { id: 'laporan', label: 'Laporan', icon: FileText },
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

export function PengawasDashboard({ onBack, user, token }: PengawasDashboardProps) {
  const [activeTab, setActiveTab] = useState<PengawasTab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">UjianKu</span>
              <span className="text-xs text-gray-500 block -mt-1">Pengawas Panel</span>
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
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-amber-600' : ''}`} />
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-amber-400" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'PW'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Pengawas'}</p>
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
          {activeTab === 'dashboard' && <PengawasOverview token={token ?? null} />}
          {activeTab === 'sesi' && <SesiProctoring token={token ?? null} searchQuery={searchQuery} />}
          {activeTab === 'pelanggaran' && <DaftarPelanggaran token={token ?? null} searchQuery={searchQuery} />}
          {activeTab === 'laporan' && <LaporanPengawasan token={token ?? null} />}
        </div>
      </main>
    </div>
  )
}

// ==================== PENGAWAS OVERVIEW ====================
function PengawasOverview({ token }: { token: string | null }) {
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [violations, setViolations] = useState<ApiViolation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [sessionsRes, violationsRes] = await Promise.all([
          apiFetch('/api/v1/proctor/sessions?limit=10', token),
          apiFetch('/api/v1/proctor/violations?limit=5', token),
        ])
        if (sessionsRes.success) setSessions(sessionsRes.data?.data || [])
        if (violationsRes.success) setViolations(violationsRes.data?.data || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
  }

  const activeSessions = sessions.filter(s => s.status === 'AKTIF')
  const totalViolations = violations.length
  const highViolations = violations.filter(v => v.severity === 'high').length

  const stats = [
    { label: 'Sesi Aktif', value: activeSessions.length, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Sesi', value: sessions.length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pelanggaran', value: totalViolations, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Pelanggaran Tinggi', value: highViolations, icon: Flag, color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Live Status Banner */}
      {activeSessions.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 overflow-hidden relative">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-white">Sesi Pengawasan Aktif</span>
                </div>
                <p className="text-amber-100 text-sm">{activeSessions.length} sesi sedang berlangsung saat ini</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        </Card>
      )}

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
        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              Sesi Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada sesi aktif saat ini</p>
            ) : (
              activeSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{session.exam?.judul || '-'}</p>
                    <p className="text-xs text-gray-500">{session.kelas?.nama || '-'} · {session.aktifSiswa}/{session.totalSiswa} siswa</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.violations > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" />{session.violations}
                      </span>
                    )}
                    <Badge className="bg-amber-100 text-amber-700">Aktif</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Pelanggaran Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {violations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada pelanggaran terbaru</p>
            ) : (
              violations.slice(0, 5).map((violation) => (
                <div key={violation.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    violation.severity === 'high' ? 'bg-red-100 text-red-600' :
                    violation.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{violation.siswa?.name || '-'}</p>
                    <p className="text-xs text-gray-500 truncate">{violation.deskripsi}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getViolationSeverityColor(violation.severity)}`}>
                    {violation.severity === 'high' ? 'Tinggi' : violation.severity === 'medium' ? 'Sedang' : 'Rendah'}
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

// ==================== SESI PROCTORING ====================
function SesiProctoring({ token, searchQuery }: { token: string | null; searchQuery: string }) {
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [monitorData, setMonitorData] = useState<ApiStudentMonitor[]>([])

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/v1/proctor/sessions?limit=50', token)
      if (res.success) setSessions(res.data?.data || [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const handleViewSession = useCallback(async (sessionId: string) => {
    setSelectedSession(sessionId)
    try {
      const res = await apiFetch(`/api/v1/proctor/sessions/${sessionId}/monitor`, token)
      if (res.success) setMonitorData(res.data?.students || [])
    } catch {
      // silently handle
    }
  }, [token])

  const handleEndSession = useCallback(async (sessionId: string) => {
    if (!confirm('Yakin ingin mengakhiri sesi ini?')) return
    try {
      await apiFetch(`/api/v1/proctor/sessions/${sessionId}/end`, token, { method: 'POST' })
      fetchSessions()
      setSelectedSession(null)
    } catch {
      // silently handle
    }
  }, [token, fetchSessions])

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchQuery || session.exam?.judul?.toLowerCase().includes(searchQuery.toLowerCase()) || session.kelas?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || session.status === filter
    return matchesSearch && matchesFilter
  })

  // Session Detail View
  if (selectedSession) {
    const session = sessions.find(s => s.id === selectedSession)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" size="sm" onClick={() => setSelectedSession(null)} className="mb-2">
              ← Kembali ke Daftar Sesi
            </Button>
            <h2 className="text-lg font-bold text-gray-900">{session?.exam?.judul || 'Detail Sesi'}</h2>
            <p className="text-sm text-gray-500">{session?.kelas?.nama || '-'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700">Aktif</Badge>
            <Button variant="destructive" size="sm" onClick={() => handleEndSession(selectedSession)}>
              <StopCircle className="w-4 h-4 mr-2" />Akhiri Sesi
            </Button>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Siswa', value: session?.totalSiswa ?? 0, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Siswa Aktif', value: session?.aktifSiswa ?? 0, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pelanggaran', value: session?.violations ?? 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Durasi', value: `${session?.exam?.durasi ?? 0} mnt`, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Student Monitor Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monitoring Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            {monitorData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Pilih sesi untuk melihat data monitoring</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {monitorData.map((student) => (
                  <div key={student.id} className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer hover:shadow-md ${
                    student.status === 'active' ? 'border-emerald-200 bg-emerald-50/50' :
                    student.status === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                    'border-red-200 bg-red-50/50'
                  }`}>
                    <div className={`relative w-10 h-10 mx-auto mb-2`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        student.status === 'active' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                        student.status === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        'bg-gradient-to-br from-red-400 to-orange-500'
                      }`}>
                        {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        student.status === 'active' ? 'bg-emerald-500' :
                        student.status === 'warning' ? 'bg-amber-500 animate-pulse' :
                        'bg-red-500 animate-pulse'
                      }`} />
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate">{student.name}</p>
                    <Progress value={student.progress} className="h-1 mt-1.5" />
                    {student.violations > 0 && (
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] text-red-600 font-bold">{student.violations}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'AKTIF', label: 'Aktif' },
            { id: 'SELESAI', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-amber-100 text-amber-700 shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium">Belum ada sesi proctoring</p>
            <p className="text-sm">Sesi akan muncul saat ujian dimulai</p>
          </div>
        ) : (
          filteredSessions.map((session, i) => (
            <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`hover:shadow-md transition-shadow h-full ${session.status === 'AKTIF' ? 'border-amber-200' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status === 'AKTIF' ? 'Aktif' : 'Selesai'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleViewSession(session.id)}>
                      <Eye className="w-4 h-4 mr-1" />Monitor
                    </Button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{session.exam?.judul || '-'}</h3>
                  <p className="text-xs text-gray-500 mb-3">{session.exam?.mataPelajaran?.nama || '-'} · {session.exam?.durasi || 0} menit</p>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-900">{session.totalSiswa}</p>
                      <p className="text-[10px] text-gray-500">Total</p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-sm font-bold text-emerald-600">{session.aktifSiswa}</p>
                      <p className="text-[10px] text-emerald-600">Aktif</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="text-sm font-bold text-red-600">{session.violations}</p>
                      <p className="text-[10px] text-red-600">Pelanggaran</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{session.kelas?.nama || '-'}</span>
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

// ==================== DAFTAR PELANGGARAN ====================
function DaftarPelanggaran({ token, searchQuery }: { token: string | null; searchQuery: string }) {
  const [violations, setViolations] = useState<ApiViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/v1/proctor/violations?limit=50', token)
      if (res.success) setViolations(res.data?.data || [])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchViolations() }, [fetchViolations])

  const filteredViolations = violations.filter(v => {
    const matchesSearch = !searchQuery || v.siswa?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || v.exam?.judul?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || v.tipe === filterType
    const matchesSeverity = filterSeverity === 'all' || v.severity === filterSeverity
    return matchesSearch && matchesType && matchesSeverity
  })

  const highCount = violations.filter(v => v.severity === 'high').length
  const mediumCount = violations.filter(v => v.severity === 'medium').length
  const lowCount = violations.filter(v => v.severity === 'low').length

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
  }

  const severityData = [
    { name: 'Tinggi', value: highCount, fill: '#ef4444' },
    { name: 'Sedang', value: mediumCount, fill: '#f97316' },
    { name: 'Rendah', value: lowCount, fill: '#eab308' },
  ]

  return (
    <div className="space-y-6">
      {/* Severity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tinggi', value: highCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Sedang', value: mediumCount, icon: Flag, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Rendah', value: lowCount, icon: Info, color: 'text-yellow-600', bg: 'bg-yellow-50' },
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
        {/* Severity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Tingkat</CardTitle>
          </CardHeader>
          <CardContent>
            {highCount + mediumCount + lowCount > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {severityData.map((entry, index) => (
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

        {/* Violations Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Daftar Pelanggaran</CardTitle>
              <div className="flex items-center gap-2">
                <select className="h-8 rounded-lg border border-gray-200 px-2 text-xs bg-white" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                  <option value="all">Semua Tingkat</option>
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredViolations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Tidak ada pelanggaran</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Siswa</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Ujian</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Tipe</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Tingkat</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredViolations.map((v) => (
                      <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                              {v.siswa?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || '?'}
                            </div>
                            <span className="font-medium text-gray-900">{v.siswa?.name || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{v.exam?.judul || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">{v.tipe?.replace(/_/g, ' ') || '-'}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getViolationSeverityColor(v.severity)}`}>
                            {v.severity === 'high' ? 'Tinggi' : v.severity === 'medium' ? 'Sedang' : 'Rendah'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {v.waktu ? new Date(v.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
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

// ==================== LAPORAN PENGAWASAN ====================
function LaporanPengawasan({ token }: { token: string | null }) {
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [violations, setViolations] = useState<ApiViolation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [sessionsRes, violationsRes] = await Promise.all([
          apiFetch('/api/v1/proctor/sessions?limit=50', token),
          apiFetch('/api/v1/proctor/violations?limit=50', token),
        ])
        if (sessionsRes.success) setSessions(sessionsRes.data?.data || [])
        if (violationsRes.success) setViolations(violationsRes.data?.data || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
  }

  const totalSiswa = sessions.reduce((sum, s) => sum + (s.totalSiswa || 0), 0)
  const totalAktif = sessions.reduce((sum, s) => sum + (s.aktifSiswa || 0), 0)
  const totalViolations = violations.length

  // Group violations by type
  const violationByType: Record<string, number> = {}
  violations.forEach(v => {
    const type = v.tipe || 'OTHER'
    violationByType[type] = (violationByType[type] || 0) + 1
  })

  const violationTypeData = Object.entries(violationByType).map(([type, count]) => ({
    type: type.replace(/_/g, ' '),
    count
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sesi', value: sessions.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Siswa', value: totalSiswa, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Pelanggaran', value: totalViolations, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Siswa Diawasi', value: totalAktif, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violations by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pelanggaran berdasarkan Tipe</CardTitle>
          </CardHeader>
          <CardContent>
            {violationTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={violationTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis dataKey="type" type="category" width={120} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Jumlah" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>Belum ada data pelanggaran</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Summary Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Riwayat Sesi</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />Ekspor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Belum ada riwayat sesi</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Ujian</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Kelas</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Pelanggaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{session.exam?.judul || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{session.kelas?.nama || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(session.status)}>
                            {session.status === 'AKTIF' ? 'Aktif' : 'Selesai'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${session.violations > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {session.violations}
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
    </div>
  )
}
