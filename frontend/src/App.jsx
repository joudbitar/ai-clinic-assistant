import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/hooks/useToast.jsx'
import { Toaster } from '@/components/ui/toaster'
import PatientsPage from './pages/PatientsPage'
import PatientDetailPage from './pages/PatientDetailPage'
import RecordingDetailPage from './pages/RecordingDetailPage'
import BaselineDetailPage from './pages/BaselineDetailPage'
import RecordConsultationPage from './pages/RecordConsultationPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Navigate to="/patients" replace />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/:patientId" element={<PatientDetailPage />} />
              <Route path="/baselines/:baselineId" element={<BaselineDetailPage />} />
              <Route path="/recordings/:recordingId" element={<RecordingDetailPage />} />
              <Route path="/record" element={<RecordConsultationPage />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}