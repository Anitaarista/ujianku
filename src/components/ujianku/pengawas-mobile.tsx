'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Shield, AlertTriangle, FileText, User,
  Clock, ChevronRight, Bell, Eye, EyeOff,
  AlertCircle, CheckCircle, XCircle, ArrowLeft,
  Download, Search, MoreVertical, Camera,
  MonitorSmartphone, Volume2, Ban, Info,
  Users, Activity, Flag, Timer, TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PhoneFrame } from './phone-frame'
import {
  mockProctorSessions, mockViolations, proctorStudentStatus,
  getViolationSeverityColor
} from './mock-data'

type PengawasTab = 'home' | 'monitoring' | 'pelanggaran' | 'laporan'

interface PengawasMobileProps {
  onBack: () => void
}

export function PengawasMobile({ onBack }: PengawasMobileProps) {
  const [activeTab, setActiveTab] = useState<PengawasTab>('home')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [monitoringTime, setMonitoringTime] = useState(2700) // 45 min elapsed

  useEffect(() => {
    if (activeTab === 'monitoring') {
      const timer = setInterval(() => setMonitoringTime(t => t + 1), 1000)
      return () => clearInterval(timer)
    }
  }, [activeTab])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const bottomNavItems: { id: PengawasTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'monitoring', label: 'Monitoring', icon: Eye },
    { id: 'pelanggaran', label: 'Pelanggaran', icon: AlertTriangle },
    { id: 'laporan', label: 'Laporan', icon: FileText },
  ]

  const renderContent = () => {
    if (activeTab === 'home') return <PengawasHome onNavigate={setActiveTab} />
    if (activeTab === 'monitoring') return (
      <MonitoringUjian
        monitoringTime={monitoringTime}
        formatTime={formatTime}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
      />
    )
    if (activeTab === 'pelanggaran') return <DaftarPelanggaran />
    if (activeTab === 'laporan') return <LaporanPengawasan />
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 via-amber-50/20 to-slate-100 min-h-screen flex items-start justify-center pt-6 pb-6">
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl px-4">
        {/* Back button and title */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <button onClick={onBack} className="p-2 hover:bg-white/80 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tampilan Pengawas</h2>
            <p className="text-xs text-gray-500">Mobile App Preview</p>
          </div>
          <Badge className="bg-amber-100 text-amber-700 ml-auto">Mobile</Badge>
        </div>

        <PhoneFrame title="UjianKu Pengawas">
          {renderContent()}

          {/* Bottom Navigation */}
          {activeTab !== 'monitoring' && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2 px-2 z-40">
              {bottomNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                    activeTab === item.id ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-amber-600' : ''}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </PhoneFrame>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-80 max-h-[80vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <StudentDetail
                studentId={selectedStudent}
                onClose={() => setSelectedStudent(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== PENGAWAS HOME ====================
function PengawasHome({ onNavigate }: { onNavigate: (tab: PengawasTab) => void }) {
  const todaySessions = mockProctorSessions.filter(s => s.status === 'AKTIF')

  return (
    <div className="pb-20 px-4 pt-2">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">Selamat datang 👋</p>
          <h2 className="text-xl font-bold text-gray-900">Rina Wulandari</h2>
        </div>
        <div className="relative">
          <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            RW
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
      </div>

      {/* Live Status */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 mb-5 text-white shadow-lg shadow-amber-200/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-bold">Sesi Pengawasan Aktif</span>
        </div>
        <p className="text-xs opacity-90 mb-1">UTS Matematika Kelas XI IPA</p>
        <p className="text-xs opacity-80">Kelas XI IPA 1 · 28/34 siswa aktif</p>
        <Button
          className="mt-3 bg-white text-amber-700 hover:bg-white/90 text-xs font-bold h-8"
          onClick={() => onNavigate('monitoring')}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />Buka Monitoring
        </Button>
      </div>

      {/* Today's Schedule */}
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Jadwal Hari Ini</h3>
        {todaySessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl border border-gray-100 p-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Aktif</Badge>
              <span className="text-xs text-gray-400">08:00 - 09:30</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{session.exam}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.aktifSiswa}/{session.totalSiswa}</span>
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{session.violations} pelanggaran</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {[
          { label: 'Total Sesi', value: '24', icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Pelanggaran', value: '7', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Siswa Diawasi', value: '198', icon: Users, color: 'text-sky-600 bg-sky-50' },
          { label: 'Diskualifikasi', value: '2', icon: Ban, color: 'text-gray-600 bg-gray-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-3`}>
            <stat.icon className="w-4 h-4 mb-1" />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] opacity-70">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Violations */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Pelanggaran Terbaru</h3>
        {mockViolations.slice(0, 3).map((v) => (
          <div key={v.id} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-100 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              v.severity === 'high' ? 'bg-red-100' : v.severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
            }`}>
              <AlertTriangle className={`w-4 h-4 ${
                v.severity === 'high' ? 'text-red-600' : v.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{v.siswa}</p>
              <p className="text-[10px] text-gray-500 truncate">{v.deskripsi}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getViolationSeverityColor(v.severity)}`}>
              {v.severity === 'high' ? 'Tinggi' : v.severity === 'medium' ? 'Sedang' : 'Rendah'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== MONITORING UJIAN (LIVE) ====================
function MonitoringUjian({
  monitoringTime, formatTime, selectedStudent, setSelectedStudent
}: {
  monitoringTime: number
  formatTime: (s: number) => string
  selectedStudent: string | null
  setSelectedStudent: (v: string | null) => void
}) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'warning' | 'danger'>('all')

  const filteredStudents = proctorStudentStatus.filter(s => {
    if (filterStatus === 'all') return true
    return s.status === filterStatus
  })

  const activeCount = proctorStudentStatus.filter(s => s.status === 'active').length
  const warningCount = proctorStudentStatus.filter(s => s.status === 'warning').length
  const dangerCount = proctorStudentStatus.filter(s => s.status === 'danger').length

  return (
    <div className="pb-4">
      {/* Header with timer */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-gray-500">Monitoring Ujian</p>
            <p className="text-sm font-bold text-gray-900">UTS Matematika XI IPA</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full">
            <Timer className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-sm font-bold font-mono text-amber-700">{formatTime(monitoringTime)}</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3 mt-2">
          {[
            { status: 'all' as const, count: proctorStudentStatus.length, color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
            { status: 'active' as const, count: activeCount, color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
            { status: 'warning' as const, count: warningCount, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
            { status: 'danger' as const, count: dangerCount, color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
          ].map((f) => (
            <button
              key={f.status}
              onClick={() => setFilterStatus(f.status)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                filterStatus === f.status ? f.color : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
              {f.status === 'all' ? 'Semua' : f.status === 'active' ? 'Aktif' : f.status === 'warning' ? 'Peringatan' : 'Bahaya'} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Student Grid */}
      <div className="px-3 pt-3">
        <div className="grid grid-cols-3 gap-2">
          {filteredStudents.map((student) => (
            <motion.button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className="text-center"
              whileTap={{ scale: 0.95 }}
            >
              <div className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                student.status === 'active' ? 'border-emerald-200 bg-emerald-50/50' :
                student.status === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                'border-red-200 bg-red-50/50'
              }`}>
                {/* Status dot */}
                <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ${
                  student.status === 'active' ? 'bg-emerald-500' :
                  student.status === 'warning' ? 'bg-amber-500 animate-pulse' :
                  'bg-red-500 animate-pulse'
                }`} />

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1 ${
                  student.status === 'active' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                  student.status === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                  'bg-gradient-to-br from-red-400 to-orange-500'
                }`}>
                  {student.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>

                <p className="text-[9px] font-medium text-gray-700 truncate w-full px-1">{student.nama.split(' ')[0]}</p>

                {/* Progress */}
                <div className="w-10 mt-1">
                  <Progress value={student.progress} className="h-1" />
                </div>
                {student.violations > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                    <span className="text-[8px] text-red-600 font-bold">{student.violations}</span>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Violations Feed */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-red-500" /> Pelanggaran Terkini
          </h3>
          {mockViolations.slice(0, 3).map((v) => (
            <motion.div
              key={v.id}
              className={`flex items-center gap-2 p-2.5 rounded-xl mb-1.5 ${
                v.severity === 'high' ? 'bg-red-50 border border-red-100' :
                v.severity === 'medium' ? 'bg-orange-50 border border-orange-100' :
                'bg-yellow-50 border border-yellow-100'
              }`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                v.severity === 'high' ? 'bg-red-200' :
                v.severity === 'medium' ? 'bg-orange-200' : 'bg-yellow-200'
              }`}>
                {v.tipe === 'TAB_SWITCH' ? <MonitorSmartphone className="w-3.5 h-3.5 text-red-700" /> :
                 v.tipe === 'FACE_NOT_DETECTED' ? <Camera className="w-3.5 h-3.5 text-orange-700" /> :
                 v.tipe === 'COPY_PASTE' ? <Volume2 className="w-3.5 h-3.5 text-yellow-700" /> :
                 v.tipe === 'MULTIPLE_FACES' ? <Users className="w-3.5 h-3.5 text-red-700" /> :
                 <AlertTriangle className="w-3.5 h-3.5 text-gray-700" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-900">{v.siswa}</p>
                <p className="text-[9px] text-gray-500 truncate">{v.deskripsi}</p>
              </div>
              <span className="text-[9px] text-gray-400 whitespace-nowrap">5m</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== STUDENT DETAIL MODAL ====================
function StudentDetail({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const student = proctorStudentStatus.find(s => s.id === studentId)
  if (!student) return null

  const studentViolations = mockViolations.filter(v =>
    v.siswa === student.nama
  )

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Detail Siswa</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">✕</button>
      </div>

      {/* Student Info */}
      <div className="text-center mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 ${
          student.status === 'active' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
          student.status === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
          'bg-gradient-to-br from-red-400 to-orange-500'
        }`}>
          {student.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <p className="text-sm font-bold text-gray-900">{student.nama}</p>
        <Badge className={`text-[10px] mt-1 ${
          student.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
          student.status === 'warning' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {student.status === 'active' ? '✅ Aktif' : student.status === 'warning' ? '⚠️ Peringatan' : '🚨 Bahaya'}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Progress Pengerjaan</span>
          <span className="font-bold text-gray-900">{student.progress}%</span>
        </div>
        <Progress value={student.progress} className="h-2" />
        <p className="text-[10px] text-gray-400 mt-1">Aktivitas terakhir: {student.lastActivity}</p>
      </div>

      {/* Violations */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-900 mb-2">Pelanggaran ({student.violations})</p>
        {studentViolations.length > 0 ? studentViolations.map((v) => (
          <div key={v.id} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-gray-900">{v.tipe.replace('_', ' ')}</p>
              <p className="text-[9px] text-gray-500">{v.deskripsi}</p>
            </div>
          </div>
        )) : (
          <p className="text-xs text-gray-400 text-center py-2">Tidak ada pelanggaran</p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-sm h-9">
          <AlertCircle className="w-4 h-4 mr-2" />Berikan Peringatan
        </Button>
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 text-sm h-9">
          <Ban className="w-4 h-4 mr-2" />Diskualifikasi
        </Button>
      </div>
    </div>
  )
}

// ==================== DAFTAR PELANGGARAN ====================
function DaftarPelanggaran() {
  const [filterType, setFilterType] = useState('all')

  const violationTypes = [...new Set(mockViolations.map(v => v.tipe))]

  const filtered = mockViolations.filter(v =>
    filterType === 'all' || v.tipe === filterType
  )

  return (
    <div className="pb-20 px-4 pt-2">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Daftar Pelanggaran</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-red-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-red-600">{mockViolations.filter(v => v.severity === 'high').length}</p>
          <p className="text-[10px] text-red-500">Tinggi</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-orange-600">{mockViolations.filter(v => v.severity === 'medium').length}</p>
          <p className="text-[10px] text-orange-500">Sedang</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-yellow-600">{mockViolations.filter(v => v.severity === 'low').length}</p>
          <p className="text-[10px] text-yellow-500">Rendah</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
            filterType === 'all' ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'
          }`}
        >
          Semua
        </button>
        {violationTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
              filterType === type ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Violations List */}
      <div className="space-y-2">
        {filtered.map((v) => (
          <div key={v.id} className="bg-white rounded-xl border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getViolationSeverityColor(v.severity)}`}>
                {v.severity === 'high' ? '🔥 Tinggi' : v.severity === 'medium' ? '⚠️ Sedang' : '⚡ Rendah'}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(v.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                {v.siswa.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{v.siswa}</p>
                <p className="text-[10px] text-gray-500">{v.exam}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[9px]">{v.tipe.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5">{v.deskripsi}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== LAPORAN PENGAWASAN ====================
function LaporanPengawasan() {
  return (
    <div className="pb-20 px-4 pt-2">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Laporan Pengawasan</h2>

      {/* Session Summary */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 mb-4 text-white shadow-lg">
        <p className="text-xs opacity-80 mb-1">Sesi Terakhir</p>
        <p className="text-sm font-bold mb-2">UTS Matematika Kelas XI IPA</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/20 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">34</p>
            <p className="text-[10px] opacity-80">Peserta</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">4</p>
            <p className="text-[10px] opacity-80">Pelanggaran</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Statistik Sesi</h3>
        {[
          { label: 'Peserta Hadir', value: 30, total: 34, color: 'bg-emerald-500' },
          { label: 'Selesai', value: 28, total: 34, color: 'bg-sky-500' },
          { label: 'Timeout', value: 2, total: 34, color: 'bg-amber-500' },
          { label: 'Diskualifikasi', value: 0, total: 34, color: 'bg-red-500' },
          { label: 'Tidak Hadir', value: 4, total: 34, color: 'bg-gray-400' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 mb-2 last:mb-0">
            <span className="text-xs text-gray-600 w-24">{stat.label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${(stat.value / stat.total) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-900 w-6 text-right">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Violation Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Ringkasan Pelanggaran</h3>
        {[
          { type: 'Tab Switch', count: 2, icon: MonitorSmartphone, color: 'text-red-600 bg-red-50' },
          { type: 'Wajah Tidak Terdeteksi', count: 1, icon: Camera, color: 'text-orange-600 bg-orange-50' },
          { type: 'Copy Paste', count: 1, icon: Volume2, color: 'text-yellow-600 bg-yellow-50' },
        ].map((v) => (
          <div key={v.type} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${v.color}`}>
              <v.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">{v.type}</p>
            </div>
            <span className="text-sm font-bold text-gray-900">{v.count}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-sm h-10">
          <Download className="w-4 h-4 mr-2" />Ekspor Laporan
        </Button>
        <Button variant="outline" className="w-full text-sm h-10">
          <FileText className="w-4 h-4 mr-2" />Bagikan Laporan
        </Button>
      </div>
    </div>
  )
}
