'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Landing } from '@/components/ujianku/landing'
import { AdminDashboard } from '@/components/ujianku/admin-dashboard'
import { GuruDashboard } from '@/components/ujianku/guru-dashboard'
import { SiswaMobile } from '@/components/ujianku/siswa-mobile'
import { PengawasMobile } from '@/components/ujianku/pengawas-mobile'

type View = 'landing' | 'ADMIN' | 'GURU' | 'PENGAWAS' | 'SISWA'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing')

  const handleSelectRole = (role: 'ADMIN' | 'GURU' | 'PENGAWAS' | 'SISWA') => {
    setCurrentView(role)
  }

  const handleBack = () => {
    setCurrentView('landing')
  }

  return (
    <AnimatePresence mode="wait">
      {currentView === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Landing onSelectRole={handleSelectRole} />
        </motion.div>
      )}

      {currentView === 'ADMIN' && (
        <motion.div
          key="admin"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AdminDashboard onBack={handleBack} />
        </motion.div>
      )}

      {currentView === 'GURU' && (
        <motion.div
          key="guru"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GuruDashboard onBack={handleBack} />
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
          <SiswaMobile onBack={handleBack} />
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
          <PengawasMobile onBack={handleBack} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
