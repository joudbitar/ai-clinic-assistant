import { motion } from 'framer-motion'
import { PatientCommunicationEditor } from '@/components/communications/PatientCommunicationEditor'

export function PatientCommsTab({ patientId }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-cacao">Patient Communications</h2>
        <PatientCommunicationEditor patientId={patientId} />
      </div>
    </motion.div>
  )
} 