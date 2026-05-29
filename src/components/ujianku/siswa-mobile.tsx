'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, FileText, User, Clock, ChevronRight, Award,
  Bell, CheckCircle, XCircle, Flag, ArrowLeft, ArrowRight,
  AlertTriangle, Calendar, BookOpen, Star, BarChart3,
  Settings, LogOut, Timer, Zap, Target, Trophy
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PhoneFrame } from './phone-frame'
import { siswaUpcomingExams, siswaRecentResults, examQuestions, getStatusColor } from './mock-data'

type SiswaTab = 'home' | 'ujian' | 'exam-taking' | 'hasil' | 'profil'
type ExamTakingStep = 'intro' | 'taking' | 'result'

interface SiswaMobileProps {
  onBack: () => void
}

export function SiswaMobile({ onBack }: SiswaMobileProps) {
  const [activeTab, setActiveTab] = useState<SiswaTab>('home')
  const [examStep, setExamStep] = useState<ExamTakingStep>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flagged, setFlagged] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(5400) // 90 minutes in seconds
  const [showNavPanel, setShowNavPanel] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Timer for exam
  useEffect(() => {
    if (activeTab === 'exam-taking' && examStep === 'taking' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [activeTab, examStep, timeLeft])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const startExam = () => {
    setExamStep('taking')
    setTimeLeft(5400)
    setCurrentQuestion(0)
    setAnswers({})
    setFlagged({})
  }

  const submitExam = () => {
    setExamStep('result')
    setShowSubmitModal(false)
  }

  const bottomNavItems: { id: SiswaTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'ujian', label: 'Ujian', icon: FileText },
    { id: 'hasil', label: 'Hasil', icon: Award },
    { id: 'profil', label: 'Profil', icon: User },
  ]

  const renderContent = () => {
    if (activeTab === 'exam-taking') {
      if (examStep === 'intro') return <ExamIntro onStart={startExam} />
      if (examStep === 'taking') return (
        <ExamTaking
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          answers={answers}
          setAnswers={setAnswers}
          flagged={flagged}
          setFlagged={setFlagged}
          timeLeft={timeLeft}
          formatTime={formatTime}
          showNavPanel={showNavPanel}
          setShowNavPanel={setShowNavPanel}
          setShowSubmitModal={setShowSubmitModal}
        />
      )
      if (examStep === 'result') return <ExamResult answers={answers} onBack={() => setActiveTab('home')} />
    }
    if (activeTab === 'home') return <SiswaHome onOpenExam={() => { setActiveTab('exam-taking'); setExamStep('intro') }} />
    if (activeTab === 'ujian') return <SiswaUjianList onStartExam={() => { setActiveTab('exam-taking'); setExamStep('intro') }} />
    if (activeTab === 'hasil') return <SiswaHasil />
    if (activeTab === 'profil') return <SiswaProfil onBack={onBack} />
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 via-sky-50/30 to-slate-100 min-h-screen flex items-start justify-center pt-6 pb-6">
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl px-4">
        {/* Back button and title */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <button onClick={onBack} className="p-2 hover:bg-white/80 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tampilan Siswa</h2>
            <p className="text-xs text-gray-500">Mobile App Preview</p>
          </div>
          <Badge className="bg-sky-100 text-sky-700 ml-auto">Mobile</Badge>
        </div>

        <PhoneFrame title="UjianKu">
          {renderContent()}

          {/* Bottom Navigation - only show when not in exam */}
          {activeTab !== 'exam-taking' && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2 px-2 z-40">
              {bottomNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                    activeTab === item.id ? 'text-sky-600' : 'text-gray-400'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-sky-600' : ''}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </PhoneFrame>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-80 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Kirim Jawaban?</h3>
                <p className="text-sm text-gray-500 mb-1">Anda telah menjawab {Object.keys(answers).length} dari {examQuestions.length} soal</p>
                {Object.keys(answers).length < examQuestions.length && (
                  <p className="text-xs text-red-500 mb-4">Masih ada {examQuestions.length - Object.keys(answers).length} soal yang belum dijawab!</p>
                )}
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowSubmitModal(false)}>Kembali</Button>
                  <Button className="flex-1 bg-sky-600 hover:bg-sky-700" onClick={submitExam}>Kirim</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== SISWA HOME ====================
function SiswaHome({ onOpenExam }: { onOpenExam: () => void }) {
  return (
    <div className="pb-20 px-4 pt-2">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">Selamat datang 👋</p>
          <h2 className="text-xl font-bold text-gray-900">Rizky Pratama</h2>
        </div>
        <div className="relative">
          <div className="w-11 h-11 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            RP
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Ujian', value: '3', icon: FileText, color: 'text-sky-600 bg-sky-50' },
          { label: 'Rata-rata', value: '83.7', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Peringkat', value: '#5', icon: Trophy, color: 'text-amber-600 bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center`}>
            <stat.icon className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] opacity-70">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Exam */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">Ujian Mendatang</h3>
          <span className="text-xs text-sky-600 font-medium">Lihat Semua</span>
        </div>
        {siswaUpcomingExams.slice(0, 2).map((exam) => (
          <button
            key={exam.id}
            onClick={exam.status === 'Sedang berlangsung' ? onOpenExam : undefined}
            className="w-full text-left mb-2"
          >
            <div className={`p-3 rounded-xl border ${
              exam.status === 'Sedang berlangsung'
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <Badge className={`text-[10px] ${
                  exam.status === 'Sedang berlangsung'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {exam.status === 'Sedang berlangsung' ? '🔴 Berlangsung' : '⏳ Belum Mulai'}
                </Badge>
                {exam.status === 'Sedang berlangsung' && (
                  <span className="text-xs text-emerald-600 font-semibold">Masuk →</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900">{exam.judul}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.durasi} menit</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{exam.mapel}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Results */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">Hasil Terbaru</h3>
        </div>
        {siswaRecentResults.map((result) => (
          <div key={result.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              result.nilai >= 80 ? 'bg-emerald-100 text-emerald-700' :
              result.nilai >= 70 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {result.nilai}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{result.judul}</p>
              <p className="text-xs text-gray-500">{result.mapel} · {result.tanggal}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== SISWA UJIAN LIST ====================
function SiswaUjianList({ onStartExam }: { onStartExam: () => void }) {
  const [filter, setFilter] = useState('all')

  const exams = [
    ...siswaUpcomingExams.map(e => ({ ...e, type: e.status === 'Sedang berlangsung' ? 'ongoing' : e.status === 'Belum mulai' ? 'upcoming' : 'done' })),
  ]

  return (
    <div className="pb-20 px-4 pt-2">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Daftar Ujian</h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'ongoing', label: 'Berlangsung' },
          { id: 'upcoming', label: 'Belum Mulai' },
          { id: 'done', label: 'Selesai' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === tab.id ? 'bg-sky-100 text-sky-700' : 'bg-gray-50 text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exam Cards */}
      <div className="space-y-3">
        {exams
          .filter(e => filter === 'all' || e.type === filter)
          .map((exam) => (
            <button
              key={exam.id}
              onClick={exam.type === 'ongoing' ? onStartExam : undefined}
              className="w-full text-left"
            >
              <div className={`p-4 rounded-xl border ${
                exam.type === 'ongoing' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' :
                exam.type === 'upcoming' ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`text-[10px] ${
                    exam.type === 'ongoing' ? 'bg-emerald-100 text-emerald-700' :
                    exam.type === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {exam.type === 'ongoing' ? '🔴 Berlangsung' :
                     exam.type === 'upcoming' ? '⏳ Belum Mulai' : '✅ Selesai'}
                  </Badge>
                  {exam.type === 'ongoing' && (
                    <span className="text-xs font-semibold text-emerald-600">Masuk Ujian →</span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900">{exam.judul}</p>
                <p className="text-xs text-gray-500 mt-1">{exam.mapel}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(exam.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.durasi} menit</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Token: {exam.token}</span>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}

// ==================== EXAM INTRO ====================
function ExamIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="px-4 pt-4 pb-20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">UTS Matematika</h2>
        <p className="text-sm text-gray-500">Kelas XI IPA</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
        {[
          { label: 'Mata Pelajaran', value: 'Matematika', icon: BookOpen },
          { label: 'Jumlah Soal', value: '10 Soal', icon: FileText },
          { label: 'Durasi', value: '90 Menit', icon: Clock },
          { label: 'Tipe Ujian', value: 'UTS', icon: Target },
          { label: 'Token', value: 'MTK2024', icon: Zap },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-amber-800">Perhatian!</span>
        </div>
        <ul className="space-y-1.5 text-xs text-amber-700">
          <li>• Pastikan koneksi internet stabil</li>
          <li>• Jangan berpindah tab selama ujian berlangsung</li>
          <li>• Wajib mengaktifkan kamera untuk proctoring</li>
          <li>• Ujian akan otomatis terkumpul saat waktu habis</li>
          <li>• Soal dan opsi jawaban diacak</li>
        </ul>
      </div>

      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold" onClick={onStart}>
        Mulai Ujian
      </Button>
    </div>
  )
}

// ==================== EXAM TAKING ====================
function ExamTaking({
  currentQuestion, setCurrentQuestion, answers, setAnswers,
  flagged, setFlagged, timeLeft, formatTime, showNavPanel,
  setShowNavPanel, setShowSubmitModal
}: {
  currentQuestion: number
  setCurrentQuestion: (n: number) => void
  answers: Record<number, string>
  setAnswers: (a: Record<number, string>) => void
  flagged: Record<number, boolean>
  setFlagged: (f: Record<number, boolean>) => void
  timeLeft: number
  formatTime: (s: number) => string
  showNavPanel: boolean
  setShowNavPanel: (v: boolean) => void
  setShowSubmitModal: (v: boolean) => void
}) {
  const q = examQuestions[currentQuestion]
  const isLowTime = timeLeft < 600

  return (
    <div className="pb-4">
      {/* Timer Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Soal {currentQuestion + 1}/{examQuestions.length}</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isLowTime ? 'bg-red-100' : 'bg-emerald-50'}`}>
            <Timer className={`w-3.5 h-3.5 ${isLowTime ? 'text-red-600' : 'text-emerald-600'}`} />
            <span className={`text-sm font-bold font-mono ${isLowTime ? 'text-red-600' : 'text-emerald-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlagged({ ...flagged, [currentQuestion]: !flagged[currentQuestion] })}
              className={`p-1.5 rounded-lg ${flagged[currentQuestion] ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowNavPanel(!showNavPanel)}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-400"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Progress value={(Object.keys(answers).length / examQuestions.length) * 100} className="h-1 mt-1" />
      </div>

      {/* Question Content */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-lg">
            Soal {currentQuestion + 1}
          </span>
          <span className="text-xs text-gray-400">Poin: {q.poin}</span>
          {flagged[currentQuestion] && <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Flag className="w-3 h-3" />Ditandai</span>}
        </div>

        <p className="text-sm text-gray-800 leading-relaxed mb-5">{q.pertanyaan}</p>

        {/* Options */}
        <div className="space-y-2">
          {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
            const optValue = q[`opsi${opt}` as keyof typeof q]
            if (!optValue) return null
            const isSelected = answers[currentQuestion] === opt
            return (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [currentQuestion]: opt })}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {opt}
                  </div>
                  <span className="text-sm text-gray-700">{optValue}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />Sebelumnya
        </Button>
        {currentQuestion < examQuestions.length - 1 ? (
          <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            Selanjutnya<ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowSubmitModal(true)}>
            Selesai
          </Button>
        )}
      </div>

      {/* Question Navigation Panel */}
      <AnimatePresence>
        {showNavPanel && (
          <motion.div
            className="absolute inset-0 z-40 bg-white"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Navigasi Soal</h3>
                <button onClick={() => setShowNavPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-sky-500 rounded" />Dijawab</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-400 rounded" />Ditandai</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-200 rounded" />Belum</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {examQuestions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentQuestion(i); setShowNavPanel(false) }}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      currentQuestion === i ? 'ring-2 ring-sky-500 ring-offset-2' : ''
                    } ${
                      answers[i] ? 'bg-sky-500 text-white' :
                      flagged[i] ? 'bg-amber-400 text-white' :
                      'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Dijawab</span>
                  <span className="font-bold text-sky-600">{Object.keys(answers).length}/{examQuestions.length}</span>
                </div>
                <Progress value={(Object.keys(answers).length / examQuestions.length) * 100} className="h-2" />
                <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowSubmitModal(true)}>
                  Kumpulkan Jawaban
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== EXAM RESULT ====================
function ExamResult({ answers, onBack }: { answers: Record<number, string>; onBack: () => void }) {
  const correct = examQuestions.filter((q, i) => answers[i] === q.jawabanBenar).length
  const total = examQuestions.length
  const score = Math.round((correct / total) * 100)

  return (
    <div className="px-4 pt-6 pb-20">
      {/* Score Animation */}
      <motion.div
        className="text-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.2 }}
      >
        <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 ${
          score >= 75 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-red-400 to-orange-500'
        } shadow-lg`}>
          <div className="text-center text-white">
            <p className="text-3xl font-bold">{score}</p>
            <p className="text-xs opacity-80">dari 100</p>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-xl font-bold text-gray-900">
            {score >= 90 ? '🎉 Luar Biasa!' : score >= 75 ? '👏 Bagus!' : score >= 60 ? '💪 Cukup Baik' : '📚 Tetap Semangat!'}
          </h2>
          <p className="text-sm text-gray-500">UTS Matematika Kelas XI IPA</p>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Benar', value: correct, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Salah', value: total - correct - (total - Object.keys(answers).length), color: 'text-red-600 bg-red-50' },
          { label: 'Belum', value: total - Object.keys(answers).length, color: 'text-gray-600 bg-gray-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Answer Review */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">Tinjauan Jawaban</h3>
      <div className="space-y-3">
        {examQuestions.map((q, i) => {
          const userAnswer = answers[i]
          const isCorrect = userAnswer === q.jawabanBenar
          return (
            <div key={q.id} className={`p-3 rounded-xl border ${
              isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600">Soal {i + 1}</span>
                {isCorrect ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <p className="text-xs text-gray-700 mb-2 line-clamp-2">{q.pertanyaan}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Jawaban Anda:</span>
                <span className={isCorrect ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                  {userAnswer || 'Tidak dijawab'}
                </span>
                {!isCorrect && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">Benar:</span>
                    <span className="text-emerald-600 font-medium">{q.jawabanBenar}</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Button className="w-full mt-6 bg-sky-600 hover:bg-sky-700" onClick={onBack}>
        Kembali ke Beranda
      </Button>
    </div>
  )
}

// ==================== SISWA HASIL ====================
function SiswaHasil() {
  return (
    <div className="pb-20 px-4 pt-2">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Hasil Ujian</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">83.7</p>
          <p className="text-xs text-emerald-700">Rata-rata Nilai</p>
        </div>
        <div className="bg-sky-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-sky-600">3</p>
          <p className="text-xs text-sky-700">Ujian Selesai</p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {siswaRecentResults.map((result) => (
          <div key={result.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-lg font-bold ${result.nilai >= 80 ? 'text-emerald-600' : result.nilai >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {result.nilai}
              </span>
              <Badge variant="outline" className="text-[10px]">{result.mapel}</Badge>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{result.judul}</p>
            <p className="text-xs text-gray-500 mb-2">{result.tanggal}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3 h-3" />{result.benar} benar</span>
              <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" />{result.salah} salah</span>
            </div>
            <Progress value={(result.benar / result.totalSoal) * 100} className="h-1.5 mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== SISWA PROFIL ====================
function SiswaProfil({ onBack }: { onBack: () => void }) {
  return (
    <div className="pb-20 px-4 pt-2">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
          RP
        </div>
        <h2 className="text-lg font-bold text-gray-900">Rizky Pratama</h2>
        <p className="text-sm text-gray-500">NIS: 2024001</p>
        <p className="text-xs text-gray-400">XI IPA 1 · SMA Negeri 1 Jakarta</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Ujian', value: '12', icon: FileText },
          { label: 'Rata-rata', value: '83.7', icon: BarChart3 },
          { label: 'Peringkat', value: '#5', icon: Trophy },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <s.icon className="w-4 h-4 mx-auto text-gray-400 mb-1" />
            <p className="text-sm font-bold text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {[
          { label: 'Edit Profil', icon: User },
          { label: 'Notifikasi', icon: Bell },
          { label: 'Pengaturan', icon: Settings },
          { label: 'Keluar', icon: LogOut, danger: true },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.label === 'Keluar' ? onBack : undefined}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <item.icon className={`w-5 h-5 ${item.danger ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${item.danger ? 'text-red-600' : 'text-gray-700'}`}>{item.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
          </button>
        ))}
      </div>
    </div>
  )
}
