import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchPatientsPanel } from '@/components/search/SearchPatientsPanel'
import { NotificationArea } from '@/components/NotificationArea'
import { RecordConsultationModal } from '@/components/RecordConsultationModal'
import { usePatients } from '@/hooks/usePatients'

function LandingPage() {
  const navigate = useNavigate()
  const [uiLanguage] = useState('en') // TODO: Get from settings context
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-6"
      dir={uiLanguage === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="w-full max-w-7xl flex items-center justify-between mb-8">
        <motion.div 
          className="flex flex-col leading-tight"
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <span className="text-4xl md:text-5xl font-semibold text-gray-800 tracking-tight">Dr. Sarah Johnson</span>
          <span className="text-sm font-light tracking-wider text-gray-600">7akim.ai</span>
        </motion.div>
        
        <motion.div
          whileHover={{ rotate: 90, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-10 w-10 rounded-full bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300"
            aria-label="Open Settings"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </motion.div>
      </header>

      {/* Main Content Grid */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left Column - Record Button + Search */}
        <div className="space-y-6">
          {/* Record Consultation Button - Wider and Shorter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 80, damping: 15 }}
          >
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(true)}
              className="w-full h-24 rounded-2xl bg-white text-black shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-4 group"
              style={{ border: '1px solid #d1d5db' }}
              aria-label="Record a Consultation"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              >
                <Mic className="h-8 w-8 text-black stroke-2 group-hover:scale-110 transition-transform duration-300" />
              </motion.div>
              <span className="text-xl font-semibold text-black">
                Record a Consultation
              </span>
            </Button>
          </motion.div>

          {/* Search Patients Panel - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 80, damping: 15 }}
          >
            <SearchPatientsPanel />
          </motion.div>
        </div>

        {/* Right Column - Notification Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 80, damping: 15 }}
        >
          <NotificationArea />
        </motion.div>
      </main>

      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-24 bg-gradient-to-t from-gray-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />
      
      {/* Record Consultation Modal */}
      <RecordConsultationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

export default LandingPage 