'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, BookOpen, Eye, GraduationCap, Monitor, Smartphone, ArrowRight } from 'lucide-react'

interface LandingProps {
  onSelectRole: (role: 'ADMIN' | 'GURU' | 'PENGAWAS' | 'SISWA') => void
}

const roles = [
  {
    id: 'ADMIN' as const,
    name: 'Admin',
    subtitle: 'Administrator',
    description: 'Mengelola seluruh sistem, pengguna, sekolah, dan laporan analitik platform',
    icon: Shield,
    platform: 'Web / Desktop',
    platformIcon: Monitor,
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    hoverShadow: 'hover:shadow-violet-200/50',
  },
  {
    id: 'GURU' as const,
    name: 'Guru',
    subtitle: 'Pengajar',
    description: 'Membuat soal, mengelola bank soal, membuat ujian, dan menilai hasil siswa',
    icon: BookOpen,
    platform: 'Web / Desktop',
    platformIcon: Monitor,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    hoverShadow: 'hover:shadow-emerald-200/50',
  },
  {
    id: 'PENGAWAS' as const,
    name: 'Pengawas',
    subtitle: 'Proktor',
    description: 'Memantau ujian secara real-time, mendeteksi pelanggaran, dan mengelola sesi pengawasan',
    icon: Eye,
    platform: 'Mobile App',
    platformIcon: Smartphone,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    hoverShadow: 'hover:shadow-amber-200/50',
  },
  {
    id: 'SISWA' as const,
    name: 'Siswa',
    subtitle: 'Peserta Ujian',
    description: 'Mengerjakan ujian online, melihat hasil, dan meninjau jawaban dengan pembahasan',
    icon: GraduationCap,
    platform: 'Mobile App',
    platformIcon: Smartphone,
    gradient: 'from-sky-500 to-blue-600',
    bgGradient: 'from-sky-50 to-blue-50',
    borderColor: 'border-sky-200',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    hoverShadow: 'hover:shadow-sky-200/50',
  },
]

export function Landing({ onSelectRole }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-emerald-600">Ujian</span>
              <span className="text-gray-900">Ku</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Platform Aktif</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm font-medium text-emerald-700">Platform Ujian Online Indonesia</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">UjianKu</span>
            {' '}Platform Ujian
            <br />
            <span className="text-gray-600">Online Terpadu</span>
          </motion.h1>

          <motion.p
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Solusi lengkap untuk penyelenggaraan ujian online dengan proctoring berbasis AI,
            bank soal terintegrasi, dan analitik real-time
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center gap-8 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { value: '2,500+', label: 'Siswa Aktif' },
              { value: '150+', label: 'Guru Terdaftar' },
              { value: '500+', label: 'Ujian Dilaksanakan' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Peran Anda</h2>
          <p className="text-gray-500">Masuk ke dashboard sesuai peran Anda di platform UjianKu</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`relative group bg-gradient-to-br ${role.bgGradient} border ${role.borderColor} rounded-2xl p-6 text-left transition-all duration-300 ${role.hoverShadow} hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${role.iconBg} rounded-2xl flex items-center justify-center`}>
                  <role.icon className={`w-7 h-7 ${role.iconColor}`} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/80 rounded-full px-3 py-1">
                  <role.platformIcon className="w-3 h-3" />
                  <span>{role.platform}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-0.5">{role.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{role.subtitle}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{role.description}</p>

              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                <span>Masuk Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between text-sm text-gray-500">
          <span>&copy; 2025 UjianKu - Platform Ujian Online Indonesia</span>
          <span>v2.1.0</span>
        </div>
      </footer>
    </div>
  )
}
