import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, FileText, Users, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function FooterRibbon({ patientId }) {
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const [lastAIUpdate, setLastAIUpdate] = useState(new Date())
  const [isBusy, setIsBusy] = useState(false)
  const queryClient = useQueryClient()

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data) => {
      // Simulate autosave API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    onMutate: () => {
      setSaveStatus('saving')
    },
    onSuccess: () => {
      setSaveStatus('saved')
      queryClient.invalidateQueries(['patient', patientId])
    },
    onError: () => {
      setSaveStatus('error')
      toast.error('Failed to auto-save changes')
    }
  })

  // Manual save mutation
  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      setIsBusy(true)
      // Simulate save note API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      return true
    },
    onSuccess: () => {
      toast.success('Note saved successfully')
      setSaveStatus('saved')
    },
    onError: () => {
      toast.error('Failed to save note')
    },
    onSettled: () => {
      setIsBusy(false)
    }
  })

  // Export PDF mutation
  const exportPDFMutation = useMutation({
    mutationFn: async () => {
      setIsBusy(true)
      // Simulate PDF export API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      return 'patient-report.pdf'
    },
    onSuccess: (filename) => {
      toast.success(`PDF exported: ${filename}`)
    },
    onError: () => {
      toast.error('Failed to export PDF')
    },
    onSettled: () => {
      setIsBusy(false)
    }
  })

  // Send to tumor board mutation
  const tumorBoardMutation = useMutation({
    mutationFn: async () => {
      setIsBusy(true)
      // Simulate tumor board submission API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      return true
    },
    onSuccess: () => {
      toast.success('Case submitted to tumor board')
    },
    onError: () => {
      toast.error('Failed to submit to tumor board')
    },
    onSettled: () => {
      setIsBusy(false)
    }
  })

  // Simulate auto-save trigger
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate data changes that trigger auto-save
      if (Math.random() > 0.8 && saveStatus === 'saved') {
        autoSaveMutation.mutate({ patientId, timestamp: new Date() })
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [patientId, saveStatus])

  // Update AI timestamp periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastAIUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Format timestamp
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Get save status display
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Saving...',
          className: 'bg-saffron/20 text-saffron'
        }
      case 'error':
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'Save failed',
          className: 'bg-clay/20 text-clay'
        }
      default:
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          text: 'Saved ✓',
          className: 'bg-sage/20 text-sage'
        }
    }
  }

  const saveStatusDisplay = getSaveStatusDisplay()

  return (
    <div className="h-[40px] flex items-center justify-between px-6 py-2">
      {/* Left: Auto-save Status */}
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={saveStatus}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Badge className={`${saveStatusDisplay.className} font-medium px-2 py-1 rounded-full flex items-center gap-1`}>
              {saveStatusDisplay.icon}
              {saveStatusDisplay.text}
            </Badge>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Center: Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveNoteMutation.mutate()}
          disabled={isBusy || saveNoteMutation.isLoading}
          className="h-8 px-3 text-xs hover:bg-sage/10 hover:border-sage/30"
        >
          {saveNoteMutation.isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Save className="h-3 w-3 mr-1" />
          )}
          Save Note
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => exportPDFMutation.mutate()}
          disabled={isBusy || exportPDFMutation.isLoading}
          className="h-8 px-3 text-xs hover:bg-sage/10 hover:border-sage/30"
        >
          {exportPDFMutation.isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <FileText className="h-3 w-3 mr-1" />
          )}
          Export PDF
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => tumorBoardMutation.mutate()}
          disabled={isBusy || tumorBoardMutation.isLoading}
          className="h-8 px-3 text-xs hover:bg-sage/10 hover:border-sage/30"
        >
          {tumorBoardMutation.isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Users className="h-3 w-3 mr-1" />
          )}
          Send to Tumor-Board
        </Button>
      </div>

      {/* Right: AI Update Timestamp */}
      <div className="flex items-center gap-2 text-xs text-cacao/60">
        <Clock className="h-3 w-3" />
        <span>Last AI update: {formatTimestamp(lastAIUpdate)}</span>
      </div>
    </div>
  )
} 