import { motion } from 'framer-motion'
import { RegimenSelector } from '@/components/treatment/RegimenSelector'
import { DrugInteractionPanel } from '@/components/treatment/DrugInteractionPanel'

export function TreatmentTab({ patientId }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full space-y-6"
    >
      {/* Regimen Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-cacao">Treatment Planning</h2>
        <RegimenSelector patientId={patientId} />
      </div>

      {/* Drug Interactions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-cacao">Drug Interactions & Safety</h2>
        <DrugInteractionPanel patientId={patientId} />
      </div>
    </motion.div>
  )
} 