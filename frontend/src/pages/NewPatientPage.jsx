import { useNavigate } from 'react-router-dom'
import { CreatePatientDialog } from '@/components/CreatePatientDialog'

export default function NewPatientPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <CreatePatientDialog 
          autoOpen={true} 
          onClose={() => navigate('/')} 
          standalone={true}
        />
      </div>
    </div>
  )
} 