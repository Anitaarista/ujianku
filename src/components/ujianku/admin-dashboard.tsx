'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, School, BookMarked, BarChart3, Settings,
  Bell, Search, LogOut, ChevronRight, Plus, Filter, Download,
  TrendingUp, TrendingDown, UserPlus, MoreVertical, Edit, Trash2,
  CheckCircle, XCircle, GraduationCap, FileText, Activity,
  Shield, Eye, Calendar, Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  mockUsers, mockSekolah, mockKelas, mockMapel, mockExams,
  examActivityData, gradeDistributionData, subjectScoreData, participantTrendData,
  getStatusColor, getDifficultyColor
} from './mock-data'

type AdminTab = 'dashboard' | 'users' | 'sekolah' | 'mapel' | 'analytics' | 'settings'

interface AdminDashboardProps {
  onBack: () => void
  user?: { id: string; name: string; email: string; role: string; avatar?: string }
  token?: string | null
}

const sidebarItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Manajemen User', icon: Users },
  { id: 'sekolah', label: 'Sekolah & Kelas', icon: School },
  { id: 'mapel', label: 'Mata Pelajaran', icon: BookMarked },
  { id: 'analytics', label: 'Laporan & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

export function AdminDashboard({ onBack, user, token }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState<string>('all')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">UjianKu</span>
              <span className="text-xs text-gray-500 block -mt-1">Admin Panel</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-violet-50 text-violet-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-violet-600' : ''}`} />
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-violet-400" />}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AF'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Dr. Ahmad Fauzi'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'Administrator'}</p>
            </div>
            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'users' && <UserManagement searchQuery={searchQuery} userFilter={userFilter} setUserFilter={setUserFilter} />}
          {activeTab === 'sekolah' && <SekolahKelas />}
          {activeTab === 'mapel' && <MataPelajaran />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </main>
    </div>
  )
}

// ==================== DASHBOARD OVERVIEW ====================
function DashboardOverview() {
  const stats = [
    { label: 'Total Siswa', value: '2,568', change: '+12.5%', trend: 'up', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Guru', value: '156', change: '+3.2%', trend: 'up', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total Ujian', value: '487', change: '+28.4%', trend: 'up', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Soal', value: '12,450', change: '+5.7%', trend: 'up', icon: BookMarked, color: 'text-sky-600', bg: 'bg-sky-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                      <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                      <span className="text-xs text-gray-400">vs bulan lalu</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Aktivitas Ujian Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={examActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ujian" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Ujian" />
                <Line type="monotone" dataKey="peserta" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Peserta" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Tambah Guru Baru', icon: UserPlus, color: 'text-violet-600 bg-violet-50' },
              { label: 'Buat Ujian Baru', icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Lihat Laporan', icon: BarChart3, color: 'text-amber-600 bg-amber-50' },
              { label: 'Kelola Sekolah', icon: Building2, color: 'text-sky-600 bg-sky-50' },
            ].map((action) => (
              <button key={action.label} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}

            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Ujian Berlangsung</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-900">UTS Matematika XI IPA</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">28 dari 34 siswa sedang mengerjakan</p>
              <Progress value={82} className="mt-2 h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exams Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Ujian Terbaru</CardTitle>
            <Button variant="outline" size="sm">Lihat Semua</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Judul Ujian</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Mata Pelajaran</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Guru</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Peserta</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{exam.judul}</td>
                    <td className="py-3 px-4 text-gray-600">{exam.mataPelajaran}</td>
                    <td className="py-3 px-4 text-gray-600">{exam.guru}</td>
                    <td className="py-3 px-4 text-gray-600">{exam.totalPeserta}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                        {exam.status === 'ONGOING' ? 'Berlangsung' : exam.status === 'PUBLISHED' ? 'Terbit' : exam.status === 'SELESAI' ? 'Selesai' : exam.status === 'DRAFT' ? 'Draft' : exam.status}
                      </span>
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

// ==================== USER MANAGEMENT ====================
function UserManagement({ searchQuery, userFilter, setUserFilter }: { searchQuery: string; userFilter: string; setUserFilter: (v: string) => void }) {
  const filteredUsers = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = userFilter === 'all' || u.role === userFilter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'ADMIN', 'GURU', 'PENGAWAS', 'SISWA'].map((role) => (
            <button
              key={role}
              onClick={() => setUserFilter(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                userFilter === role
                  ? 'bg-violet-100 text-violet-700 shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {role === 'all' ? 'Semua' : role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Ekspor</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700"><Plus className="w-4 h-4 mr-2" />Tambah User</Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    <div className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Nama</div>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">NIP/NIS</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Peran</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{user.nipNis}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'GURU' ? 'bg-emerald-100 text-emerald-700' :
                        user.role === 'PENGAWAS' ? 'bg-amber-100 text-amber-700' :
                        'bg-sky-100 text-sky-700'
                      }`}>
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Edit className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Eye className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Menampilkan {filteredUsers.length} dari {mockUsers.length} pengguna</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
              <Button variant="outline" size="sm" className="bg-violet-50 text-violet-700 border-violet-200">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Selanjutnya</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== SEKOLAH & KELAS ====================
function SekolahKelas() {
  return (
    <div className="space-y-6">
      {/* Sekolah Cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Daftar Sekolah</h2>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700"><Plus className="w-4 h-4 mr-2" />Tambah Sekolah</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockSekolah.map((sekolah) => (
          <Card key={sekolah.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {sekolah.nama.split(' ').slice(-1)[0][0]}
                </div>
                <Badge variant={sekolah.isActive ? 'default' : 'secondary'} className={sekolah.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                  {sekolah.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{sekolah.nama}</h3>
              <p className="text-xs text-gray-500 mb-3">{sekolah.alamat}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <School className="w-4 h-4" />
                  <span>{sekolah.totalKelas} Kelas</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span>{sekolah.totalSiswa} Siswa</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="flex-1">Detail</Button>
                <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kelas Table */}
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg font-bold text-gray-900">Daftar Kelas</h2>
        <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />Tambah Kelas</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Nama Kelas</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Tingkat</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Tahun Ajaran</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Wali Kelas</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Jumlah Siswa</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mockKelas.map((kelas) => (
                  <tr key={kelas.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{kelas.nama}</td>
                    <td className="py-3 px-4 text-gray-600">Kelas {kelas.tingkat}</td>
                    <td className="py-3 px-4 text-gray-600">{kelas.tahunAjaran}</td>
                    <td className="py-3 px-4 text-gray-600">{kelas.waliKelas}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={(kelas.totalSiswa / 40) * 100} className="w-16 h-1.5" />
                        <span className="text-gray-600">{kelas.totalSiswa}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-4 h-4 text-gray-500" /></button>
                      </div>
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

// ==================== MATA PELAJARAN ====================
function MataPelajaran() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Daftar Mata Pelajaran</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Ekspor</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700"><Plus className="w-4 h-4 mr-2" />Tambah Mapel</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockMapel.map((mapel) => (
          <Card key={mapel.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                    mapel.kelompok === 'Wajib' ? 'bg-gradient-to-br from-violet-400 to-purple-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'
                  }`}>
                    {mapel.kode.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mapel.nama}</h3>
                    <p className="text-xs text-gray-500">Kode: {mapel.kode}</p>
                  </div>
                </div>
                <Badge variant="outline" className={mapel.kelompok === 'Wajib' ? 'border-violet-200 text-violet-700' : 'border-amber-200 text-amber-700'}>
                  {mapel.kelompok}
                </Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">KKM</span>
                  <span className="font-semibold text-gray-900">{mapel.kkm}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Guru Pengampu</span>
                  <span className="text-gray-700 font-medium">{mapel.guru}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="flex-1">Detail</Button>
                <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm"><UserPlus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ==================== ANALYTICS ====================
function Analytics() {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Rata-rata Nilai', value: '76.8', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Passing Rate', value: '82%', icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
          { label: 'Ujian Selesai', value: '423', icon: CheckCircle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Pelanggaran', value: '47', icon: Shield, color: 'text-red-600 bg-red-50' },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Distribusi Nilai</CardTitle>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Ekspor</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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

        {/* Subject Score Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rata-rata Nilai per Mata Pelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mapel" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="rataRata" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Rata-rata" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Participant Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren Partisipasi Mingguan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={participantTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="minggu" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Hadir" />
              <Bar dataKey="absen" stackId="a" fill="#f59e0b" name="Absen" />
              <Bar dataKey="diskualifikasi" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} name="Diskualifikasi" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-Class Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analisis per Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Kelas</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Rata-rata</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Lulus</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Tidak Lulus</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing Rate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { kelas: 'X IPA 1', rata: 78.5, lulus: 30, tidak: 6, rate: 83 },
                  { kelas: 'X IPA 2', rata: 75.2, lulus: 28, tidak: 8, rate: 78 },
                  { kelas: 'XI IPA 1', rata: 80.1, lulus: 32, tidak: 2, rate: 94 },
                  { kelas: 'XI IPA 2', rata: 74.8, lulus: 27, tidak: 8, rate: 77 },
                  { kelas: 'XII IPA 1', rata: 82.3, lulus: 30, tidak: 2, rate: 94 },
                  { kelas: 'XII IPS 1', rata: 71.6, lulus: 24, tidak: 10, rate: 71 },
                ].map((row) => (
                  <tr key={row.kelas} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.kelas}</td>
                    <td className="py-3 px-4 text-gray-600">{row.rata}</td>
                    <td className="py-3 px-4 text-emerald-600 font-medium">{row.lulus}</td>
                    <td className="py-3 px-4 text-red-600 font-medium">{row.tidak}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={row.rate} className="w-20 h-1.5" />
                        <span className="text-gray-600 text-xs">{row.rate}%</span>
                      </div>
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

// ==================== SYSTEM SETTINGS ====================
function SystemSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengaturan Umum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Nama Platform', value: 'UjianKu', type: 'text' },
            { label: 'Logo', value: '', type: 'file' },
            { label: 'Bahasa Default', value: 'Indonesia', type: 'select' },
            { label: 'Zona Waktu', value: 'Asia/Jakarta (WIB)', type: 'select' },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                <p className="text-xs text-gray-500">Konfigurasi {setting.label.toLowerCase()} platform</p>
              </div>
              <Input className="w-64" defaultValue={setting.value} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Exam Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengaturan Ujian Default</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Durasi Default (menit)', value: '90' },
            { label: 'Maksimum Percobaan', value: '1' },
            { label: 'Passing Grade Default (%)', value: '75' },
            { label: 'Anti-Cheat Default', value: 'Aktif' },
            { label: 'Acak Soal Default', value: 'Aktif' },
            { label: 'Acak Opsi Default', value: 'Aktif' },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <p className="text-sm font-medium text-gray-900">{setting.label}</p>
              <Input className="w-40" defaultValue={setting.value} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Ujian Dibuat', template: 'Ujian "{judul}" telah dibuat dan dijadwalkan pada {tanggal}' },
            { label: 'Ujian Dimulai', template: 'Ujian "{judul}" telah dimulai. Token: {token}' },
            { label: 'Nilai Dipublikasikan', template: 'Nilai ujian "{judul}" telah dipublikasikan. Nilai Anda: {nilai}' },
            { label: 'Pelanggaran', template: 'Pelanggaran terdeteksi: {deskripsi} pada ujian "{judul}"' },
          ].map((notif) => (
            <div key={notif.label} className="py-3 border-b border-gray-50 last:border-0">
              <p className="text-sm font-medium text-gray-900 mb-1">{notif.label}</p>
              <Input className="w-full" defaultValue={notif.template} />
            </div>
          ))}
          <Button className="bg-violet-600 hover:bg-violet-700">Simpan Pengaturan</Button>
        </CardContent>
      </Card>
    </div>
  )
}
