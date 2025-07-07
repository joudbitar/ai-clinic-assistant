import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchPatientsPanel } from '@/components/search/SearchPatientsPanel'
import { usePatients } from '@/hooks/usePatients'

function LandingPage() {
  const navigate = useNavigate()
  const [uiLanguage] = useState('en') // TODO: Get from settings context

  // Logo gentle animation on mount
  const logoVariants = {
    initial: { opacity: 0.8 },
    animate: {
      opacity: [0.8, 1, 0.95, 1],
      transition: {
        duration: 1.5,
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut"
      }
    }
  }

  return (
    <div 
      className="min-h-screen bg-parchment flex flex-col items-center justify-center p-6"
      dir={uiLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-12">
        <motion.div 
          className="flex flex-col leading-tight"
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <span className="text-4xl md:text-5xl font-semibold text-cacao tracking-tight">Dr. Sarah Johnson</span>
          <span className="text-sm font-light tracking-wider text-cacao/60">7akim.ai</span>
        </motion.div>
        
        <motion.div
          whileHover={{ rotate: 90, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-10 w-10 rounded-full bg-almond/70 border border-almond hover:bg-sage/20 hover:border-sage/50 transition-all duration-300"
            aria-label="Open Settings"
          >
            <Settings className="h-5 w-5 text-sage" />
          </Button>
        </motion.div>
      </header>

      {/* Main Content Grid */}
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1">
        {/* Add Patient Button - Slot A */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 80, damping: 15 }}
          className="md:col-span-1"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/add')}
            className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-2xl bg-gradient-to-br from-sage to-saffron text-cacao ring-1 ring-sage/30 hover:from-sage/90 hover:to-saffron/90 border border-sage/20 shadow-md shadow-black/5 transition-all duration-300 flex flex-col items-center justify-center gap-6 group"
            aria-label="Add New Patient"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
              <UserPlus className="h-16 w-16 text-cacao stroke-2 group-hover:scale-110 transition-transform duration-300" />
            </motion.div>
            <span className="text-2xl font-semibold text-cacao">
              Add Patient
            </span>
          </Button>
        </motion.div>

        {/* Search Patients Panel - Slots B-C */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 80, damping: 15 }}
          className="md:col-span-1 lg:col-span-2"
        >
          <SearchPatientsPanel />
        </motion.div>
      </main>

      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-24 bg-gradient-to-t from-sage/5 to-transparent rounded-full blur-2xl pointer-events-none" />
    </div>
  )
}

export default LandingPage 