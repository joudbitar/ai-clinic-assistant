import { motion } from 'framer-motion'
import { ImageCarousel } from '@/components/imaging/ImageCarousel'
import { PathologySummaryCard } from '@/components/imaging/PathologySummaryCard'

export function ImagingTab({ patientId }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full space-y-6"
    >
      {/* Image Carousel */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-cacao">Medical Imaging</h2>
        <ImageCarousel patientId={patientId} />
      </div>

      {/* Pathology Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-cacao">Pathology Summary</h2>
        <PathologySummaryCard patientId={patientId} />
      </div>
    </motion.div>
  )
} 