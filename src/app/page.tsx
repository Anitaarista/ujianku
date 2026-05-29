'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Shield, BookOpen, Eye, Lock, Mail, ArrowRight, Loader2, AlertCircle, Smartphone, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AdminDashboard } from '@/components/ujianku/admin-dashboard'
import { GuruDashboard } from '@/components/ujianku/guru-dashboard'

type View = 'login' | 'ADMIN' | 'GURU'

interface LoginUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

const API_BASE = '/api/v1'

const STORAGE_KEY_TOKEN = 'ujianku_token'
const STORAGE_KEY_USER = 'ujianku_user'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
      const storedUser = localStorage.getItem(STORAGE_KEY_USER)
      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser) as LoginUser
        // Only allow ADMIN and GURU on web
        if (user.role === 'ADMIN' || user.role === 'GURU') {
          setAuthToken(storedToken)
          setCurrentUser(user)
          setCurrentView(user.role as View)
        } else {
          localStorage.removeItem(STORAGE_KEY_TOKEN)
          localStorage.removeItem(STORAGE_KEY_USER)
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_TOKEN)
      localStorage.removeItem(STORAGE_KEY_USER)
    } finally {
      setInitializing(false)
    }
  }, [])

  const handleLogin = async (user: LoginUser, token: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    setCurrentUser(user)
    setAuthToken(token)
    setCurrentView(user.role as View)
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
    setCurrentUser(null)
    setAuthToken(null)
    setCurrentView('login')
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/25 animate-pulse">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        </div>
      </div>
    )
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

        // Block SISWA and PENGAWAS from web login
        if (user.role === 'SISWA' || user.role === 'PENGAWAS') {
          setError('Siswa/Pengawas harus login melalui aplikasi mobile UjianKu.')
          return
        }

        // Only allow ADMIN and GURU
        if (user.role !== 'ADMIN' && user.role !== 'GURU') {
          setError('Role tidak diizinkan untuk akses web. Gunakan aplikasi mobile UjianKu.')
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

  const features = [
    { icon: Shield, label: 'Keamanan Ujian', desc: 'Proctoring AI & anti-cheat system' },
    { icon: BookOpen, label: 'Bank Soal Terintegrasi', desc: 'Ribuan soal siap pakai' },
    { icon: Eye, label: 'Monitoring Real-time', desc: 'Pantau ujian secara langsung' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Dark Sidebar with Animated Gradient */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gray-950">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-gray-950 to-purple-900/30" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top - Logo */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">Ujian</span>
                <span className="text-violet-400">Ku</span>
              </span>
            </motion.div>
          </div>

          {/* Middle - Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-8">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-violet-300">Panel Admin & Guru</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                Kelola Ujian
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">dengan Mudah</span>
              </h1>

              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Platform ujian online terpadu untuk admin dan guru. Kelola bank soal, buat ujian, pantau hasil — semua dari satu dashboard.
              </p>

              <div className="space-y-5">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{feature.label}</p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom - Info about mobile app */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Siswa & Pengawas</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Siswa dan pengawas harus login melalui aplikasi mobile UjianKu yang tersedia di Google Play Store dan App Store.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile Header - only visible on mobile */}
        <div className="lg:hidden p-6 pb-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200/50">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-violet-600">Ujian</span>
              <span className="text-gray-900">Ku</span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-md"
          >
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Masuk ke akun Anda</h2>
              <p className="text-gray-500 text-sm">Masukkan kredensial untuk mengakses panel</p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                      {(error.includes('Siswa') || error.includes('Pengawas') || error.includes('mobile')) && (
                        <p className="text-xs text-red-600 mt-1">Download aplikasi UjianKu di Google Play Store atau App Store.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="nama@sekolah.id"
                    className="pl-11 h-12 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-violet-400 focus:ring-violet-400/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Masukkan password"
                    className="pl-11 h-12 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-violet-400 focus:ring-violet-400/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-200/50 transition-all text-sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Akses untuk Siswa & Pengawas</p>
                    <p className="text-xs text-gray-500 mt-0.5">Siswa/Pengawas harus login melalui aplikasi mobile UjianKu.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-12 py-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>&copy; 2025 UjianKu - Platform Ujian Online Indonesia</span>
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
