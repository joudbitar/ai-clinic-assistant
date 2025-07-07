import { motion } from 'framer-motion'
import { TimelineDifferentials } from '@/components/diagnosis/TimelineDifferentials'
import { GenomicVariantTable } from '@/components/diagnosis/GenomicVariantTable'

export function DiagnosisTab({ patientId }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="grid md:grid-cols-2 gap-6 h-full">
        {/* Left: Timeline & Differentials */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-cacao">Timeline & Differentials</h2>
          <TimelineDifferentials patientId={patientId} />
        </div>

        {/* Right: Genomic Variants */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-cacao">Genomic Analysis</h2>
          <GenomicVariantTable patientId={patientId} />
        </div>
      </div>
    </motion.div>
  )
} 