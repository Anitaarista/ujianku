'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Shield, BookOpen, Eye, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AdminDashboard } from '@/components/ujianku/admin-dashboard'
import { GuruDashboard } from '@/components/ujianku/guru-dashboard'
import { SiswaDashboard } from '@/components/ujianku/siswa-dashboard'
import { PengawasDashboard } from '@/components/ujianku/pengawas-dashboard'

type View = 'login' | 'ADMIN' | 'GURU' | 'PENGAWAS' | 'SISWA'

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

  // On mount, check localStorage for existing session
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
      const storedUser = localStorage.getItem(STORAGE_KEY_USER)
      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser) as LoginUser
        setAuthToken(storedToken)
        setCurrentUser(user)
        setCurrentView(user.role as View)
      }
    } catch {
      // Invalid stored data, clear it
      localStorage.removeItem(STORAGE_KEY_TOKEN)
      localStorage.removeItem(STORAGE_KEY_USER)
    } finally {
      setInitializing(false)
    }
  }, [])

  const handleLogin = async (user: LoginUser, token: string) => {
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))

    setCurrentUser(user)
    setAuthToken(token)
    setCurrentView(user.role as View)
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)

    setCurrentUser(null)
    setAuthToken(null)
    setCurrentView('login')
  }

  // Show nothing while initializing from localStorage
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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

      {currentView === 'PENGAWAS' && currentUser && (
        <motion.div
          key="pengawas"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <PengawasDashboard onBack={handleLogout} user={currentUser} token={authToken} />
        </motion.div>
      )}

      {currentView === 'SISWA' && currentUser && (
        <motion.div
          key="siswa"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <SiswaDashboard onBack={handleLogout} user={currentUser} token={authToken} />
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
              <br />
              <span className="text-gray-600">Platform Ujian Online</span>
            </h1>

            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Kelola ujian, kerjakan soal, dan pantau hasil dari satu dashboard terpadu.
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
                  <p className="text-sm text-gray-500 mt-1">Masukkan kredensial Anda untuk melanjutkan</p>
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
