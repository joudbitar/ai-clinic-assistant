import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQueryClient } from '@tanstack/react-query'
import { PatientHeader } from '@/components/PatientHeader'
import { ContextPane } from '@/components/ContextPane'
import { FooterRibbon } from '@/components/FooterRibbon'
import { DiagnosisTab } from './tabs/DiagnosisTab'
import { TreatmentTab } from './tabs/TreatmentTab'
import { ImagingTab } from './tabs/ImagingTab'
import { PatientCommsTab } from './tabs/PatientCommsTab'
import { usePatient } from '@/hooks/usePatients'

const tabs = [
  { id: 'diagnosis', label: 'Diagnosis', component: DiagnosisTab },
  { id: 'treatment', label: 'Treatment', component: TreatmentTab },
  { id: 'imaging', label: 'Imaging', component: ImagingTab },
  { id: 'comms', label: 'Patient Comms', component: PatientCommsTab },
]

export default function Dashboard() {
  const { patientId, tab = 'diagnosis' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [uiLang] = useState('en') // TODO: Get from settings context
  const [contextPaneCollapsed, setContextPaneCollapsed] = useState(false)

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = usePatient(patientId)

  // Handle tab changes with URL updates
  const handleTabChange = (newTab) => {
    navigate(`/dashboard/${patientId}/${newTab}`, { replace: true })
  }

  // Prefetch data on tab hover
  const handleTabHover = (tabId) => {
    // Prefetch relevant data based on tab
    switch (tabId) {
      case 'diagnosis':
        queryClient.prefetchQuery(['patient-timeline', patientId])
        queryClient.prefetchQuery(['genomic-variants', patientId])
        break
      case 'treatment':
        queryClient.prefetchQuery(['treatment-regimens', patientId])
        queryClient.prefetchQuery(['drug-interactions', patientId])
        break
      case 'imaging':
        queryClient.prefetchQuery(['imaging', patientId])
        queryClient.prefetchQuery(['pathology', patientId])
        break
      case 'comms':
        queryClient.prefetchQuery(['patient-communications', patientId])
        break
      default:
        break
    }
  }

  // Get active tab component
  const ActiveTabComponent = tabs.find(t => t.id === tab)?.component || DiagnosisTab

  return (
    <div 
      className="min-h-screen bg-parchment flex flex-col"
      dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Patient Header - Sticky */}
      <div className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-almond">
        <PatientHeader patientId={patientId} patient={patient} isLoading={patientLoading} />
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-almond bg-almond/30">
        <div className="container mx-auto px-4">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="h-12 bg-transparent border-none p-0 w-full justify-start">
              {tabs.map((tabItem) => (
                <TabsTrigger
                  key={tabItem.id}
                  value={tabItem.id}
                  onMouseEnter={() => handleTabHover(tabItem.id)}
                  className="relative px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-sage data-[state=active]:bg-transparent data-[state=active]:text-sage hover:text-sage transition-colors duration-200"
                >
                  {tabItem.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Primary Canvas - 72% */}
        <main className={`transition-all duration-300 ${contextPaneCollapsed ? 'w-full' : 'w-full lg:w-[72%]'} p-6`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ActiveTabComponent patientId={patientId} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Context Pane - 28% */}
        <motion.aside
          initial={false}
          animate={{ 
            width: contextPaneCollapsed ? 0 : '28%',
            opacity: contextPaneCollapsed ? 0 : 1 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden lg:block border-l border-almond bg-almond/20 overflow-hidden"
        >
          <ContextPane 
            activeTab={tab} 
            patientId={patientId} 
            onToggleCollapse={() => setContextPaneCollapsed(!contextPaneCollapsed)}
            isCollapsed={contextPaneCollapsed}
          />
        </motion.aside>
      </div>

      {/* Footer Ribbon - Sticky */}
      <div className="sticky bottom-0 z-40 bg-parchment/95 backdrop-blur-sm border-t border-almond">
        <FooterRibbon patientId={patientId} />
      </div>
    </div>
  )
} 