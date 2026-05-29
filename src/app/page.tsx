'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Shield, BookOpen, Eye, Lock, Mail, ArrowRight, Loader2, AlertCircle, Monitor, Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AdminDashboard } from '@/components/ujianku/admin-dashboard'
import { GuruDashboard } from '@/components/ujianku/guru-dashboard'
import { SiswaMobile } from '@/components/ujianku/siswa-mobile'
import { PengawasMobile } from '@/components/ujianku/pengawas-mobile'

type View = 'login' | 'ADMIN' | 'GURU' | 'SISWA' | 'PENGAWAS'

interface LoginUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

const API_BASE = '/api/v1'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const handleLogin = async (user: LoginUser, token: string) => {
    setCurrentUser(user)
    setAuthToken(token)
    const role = user.role as 'ADMIN' | 'GURU' | 'PENGAWAS' | 'SISWA'
    setCurrentView(role)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthToken(null)
    setCurrentView('login')
  }

  return (
    <AnimatePresence mode="wait">
      {currentView === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginPage onLogin={handleLogin} />
        </motion.div>
      )}

      {currentView === 'ADMIN' && currentUser && (
        <motion.div
          key="admin"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AdminDashboard onBack={handleLogout} user={currentUser} token={authToken} />
        </motion.div>
      )}

      {currentView === 'GURU' && currentUser && (
        <motion.div
          key="guru"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GuruDashboard onBack={handleLogout} user={currentUser} token={authToken} />
        </motion.div>
      )}

      {currentView === 'SISWA' && (
        <motion.div
          key="siswa"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <SiswaMobile onBack={handleLogout} />
        </motion.div>
      )}

      {currentView === 'PENGAWAS' && (
        <motion.div
          key="pengawas"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <PengawasMobile onBack={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==================== LOGIN PAGE ====================

function LoginPage({ onLogin }: { onLogin: (user: LoginUser, token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success) {
        const { token, user } = data.data

        // Web only allows Admin & Guru
        if (user.role === 'PENGAWAS' || user.role === 'SISWA') {
          setError(`${user.role === 'PENGAWAS' ? 'Pengawas' : 'Siswa'} harus login melalui aplikasi mobile UjianKu. Silakan download di Play Store atau App Store.`)
          setLoading(false)
          return
        }

        onLogin(user, token)
      } else {
        setError(data.error?.message || 'Login gagal. Periksa email dan password Anda.')
      }
    } catch {
      setError('Tidak dapat terhubung ke server. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (role: 'admin' | 'guru') => {
    const credentials = {
      admin: { email: 'admin@ujianku.id', password: 'admin123' },
      guru: { email: 'budi.santoso@ujianku.id', password: 'guru123' },
    }
    setEmail(credentials[role].email)
    setPassword(credentials[role].password)

    // Auto-submit
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials[role]),
      })
      const data = await res.json()
      if (data.success) {
        onLogin(data.data.user, data.data.token)
      } else {
        setError('Demo login gagal. Coba seed database terlebih dahulu: /api/v1/seed')
      }
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col">
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm font-medium text-emerald-700">Platform Ujian Online Indonesia</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">UjianKu</span>
              {' '}Panel<br />
              <span className="text-gray-600">Admin & Guru</span>
            </h1>

            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Kelola ujian, bank soal, dan pantau hasil siswa dari satu dashboard terpadu. 
              Platform aman dengan proctoring berbasis AI.
            </p>

            <div className="space-y-4">
              {[
                { icon: Shield, label: 'Keamanan Ujian', desc: 'Proctoring AI & anti-cheat' },
                { icon: BookOpen, label: 'Bank Soal Terintegrasi', desc: 'Ribuan soal siap pakai' },
                { icon: Eye, label: 'Monitoring Real-time', desc: 'Pantau ujian secara langsung' },
              ].map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{feature.label}</p>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-xl border-gray-200/60">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50 mx-auto mb-4">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Masuk ke UjianKu</h2>
                  <p className="text-sm text-gray-500 mt-1">Panel Admin & Guru</p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="nama@sekolah.id"
                        className="pl-10 h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Masukkan password"
                        className="pl-10 h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-200/50"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Masuk <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-500">Demo Quick Login</span>
                  </div>
                </div>

                {/* Quick Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => quickLogin('admin')}
                    disabled={loading}
                    className="flex items-center gap-3 p-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Admin</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Monitor className="w-3 h-3" />
                        <span>Web</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => quickLogin('guru')}
                    disabled={loading}
                    className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Guru</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Monitor className="w-3 h-3" />
                        <span>Web</span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Mobile App Notice */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Pengawas & Siswa</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Login untuk Pengawas dan Siswa hanya tersedia di aplikasi mobile UjianKu. 
                        Download di Play Store atau App Store.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-sm text-gray-500">
          <span>&copy; 2025 UjianKu - Platform Ujian Online Indonesia</span>
          <span>v2.1.0</span>
        </div>
      </footer>
    </div>
  )
}
