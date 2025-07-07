import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck, Info, X, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

// Mock interaction data
const mockInteractions = [
  {
    id: 1,
    drug1: 'Doxorubicin',
    drug2: 'Trastuzumab',
    severity: 'major',
    mechanism: 'Additive cardiotoxicity',
    clinicalEffect: 'Increased risk of congestive heart failure and cardiomyopathy',
    management: 'Monitor LVEF before each cycle. Consider echocardiogram every 3 months. Discontinue if LVEF drops >10% from baseline or <50%.',
    frequency: 'Common (15-20% incidence)',
    onset: 'Within 6-12 months',
    references: ['J Clin Oncol 2005;23:7811', 'Cancer 2010;116:218']
  },
  {
    id: 2,
    drug1: 'Cyclophosphamide',
    drug2: 'Warfarin',
    severity: 'moderate',
    mechanism: 'CYP2C9 inhibition',
    clinicalEffect: 'Increased anticoagulant effect, bleeding risk',
    management: 'Monitor INR more frequently (weekly). Consider dose reduction of warfarin by 10-25%.',
    frequency: 'Occasional (5-10% incidence)',
    onset: '2-7 days',
    references: ['Clin Pharmacol Ther 1999;65:445']
  },
  {
    id: 3,
    drug1: 'Paclitaxel',
    drug2: 'Ketoconazole',
    severity: 'moderate',
    mechanism: 'CYP3A4 inhibition',
    clinicalEffect: 'Increased paclitaxel levels, enhanced toxicity',
    management: 'Avoid concurrent use if possible. If unavoidable, reduce paclitaxel dose by 20% and monitor for neuropathy.',
    frequency: 'Rare (<5% incidence)',
    onset: 'Within hours',
    references: ['Cancer Res 1998;58:1665']
  }
]

// Mock current medications
const mockCurrentMeds = [
  { id: 1, name: 'Doxorubicin', dose: '60 mg/m²', frequency: 'q3 weeks', category: 'Chemotherapy' },
  { id: 2, name: 'Cyclophosphamide', dose: '600 mg/m²', frequency: 'q3 weeks', category: 'Chemotherapy' },
  { id: 3, name: 'Trastuzumab', dose: '6 mg/kg', frequency: 'q3 weeks', category: 'Targeted Therapy' },
  { id: 4, name: 'Warfarin', dose: '5 mg', frequency: 'daily', category: 'Anticoagulant' },
  { id: 5, name: 'Omeprazole', dose: '20 mg', frequency: 'daily', category: 'PPI' }
]

export function DrugInteractionPanel({ patientId }) {
  const [dismissedInteractions, setDismissedInteractions] = useState(new Set())
  const [selectedSeverity, setSelectedSeverity] = useState('all')

  // Custom hook for interaction alerts
  const useInteractionAlerts = () => {
    useEffect(() => {
      const majorInteractions = mockInteractions.filter(
        interaction => interaction.severity === 'major' && !dismissedInteractions.has(interaction.id)
      )

      majorInteractions.forEach(interaction => {
        toast.error(`Major Drug Interaction: ${interaction.drug1} + ${interaction.drug2}`, {
          description: interaction.clinicalEffect,
          duration: 10000,
          action: {
            label: 'View Details',
            onClick: () => console.log('Show interaction details:', interaction)
          }
        })
      })
    }, [dismissedInteractions])
  }

  useInteractionAlerts()

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'major':
        return 'bg-clay/20 text-clay border-clay/30'
      case 'moderate':
        return 'bg-saffron/20 text-saffron border-saffron/30'
      case 'minor':
        return 'bg-sage/20 text-sage border-sage/30'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'major':
        return <AlertTriangle className="h-4 w-4" />
      case 'moderate':
        return <Info className="h-4 w-4" />
      case 'minor':
        return <ShieldCheck className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const handleDismissInteraction = (interactionId) => {
    setDismissedInteractions(prev => new Set([...prev, interactionId]))
  }

  const filteredInteractions = mockInteractions.filter(interaction => {
    const matchesSeverity = selectedSeverity === 'all' || interaction.severity === selectedSeverity
    const notDismissed = !dismissedInteractions.has(interaction.id)
    return matchesSeverity && notDismissed
  })

  const severityCounts = {
    major: mockInteractions.filter(i => i.severity === 'major' && !dismissedInteractions.has(i.id)).length,
    moderate: mockInteractions.filter(i => i.severity === 'moderate' && !dismissedInteractions.has(i.id)).length,
    minor: mockInteractions.filter(i => i.severity === 'minor' && !dismissedInteractions.has(i.id)).length
  }

  return (
    <div className="space-y-4">
      {/* Summary Alert */}
      {severityCounts.major > 0 && (
        <Alert className="border-clay/30 bg-clay/10">
          <AlertTriangle className="h-4 w-4 text-clay" />
          <AlertDescription className="text-clay">
            <strong>{severityCounts.major} major drug interaction{severityCounts.major > 1 ? 's' : ''} detected</strong> 
            {' '}that require immediate attention and monitoring.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Medications */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Current Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockCurrentMeds.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-almond/20 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-cacao">{med.name}</h4>
                    <p className="text-xs text-cacao/70">{med.dose} - {med.frequency}</p>
                  </div>
                  <Badge className="bg-sage/20 text-sage text-xs">
                    {med.category}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-cacao">Filter by severity:</span>
        <div className="flex gap-2">
          {['all', 'major', 'moderate', 'minor'].map((severity) => (
            <Button
              key={severity}
              variant={selectedSeverity === severity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeverity(severity)}
              className={`text-xs ${selectedSeverity === severity ? 'bg-sage text-white' : 'hover:bg-sage/10'}`}
            >
              {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
              {severity !== 'all' && severityCounts[severity] > 0 && (
                <Badge className="ml-1 bg-white/20 text-current text-xs">
                  {severityCounts[severity]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Interactions List */}
      <div className="space-y-3">
        {filteredInteractions.map((interaction, index) => (
          <motion.div
            key={interaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-parchment border-almond">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getSeverityColor(interaction.severity)} flex items-center gap-1 border`}>
                          {getSeverityIcon(interaction.severity)}
                          {interaction.severity.toUpperCase()}
                        </Badge>
                        <h3 className="font-medium text-sm text-cacao">
                          {interaction.drug1} + {interaction.drug2}
                        </h3>
                      </div>
                      <p className="text-xs text-cacao/70">{interaction.mechanism}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissInteraction(interaction.id)}
                      className="h-6 w-6 p-0 hover:bg-clay/10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Clinical Effect */}
                  <div className="p-3 bg-almond/30 rounded-lg">
                    <h4 className="font-medium text-xs text-cacao/80 mb-1">Clinical Effect</h4>
                    <p className="text-xs text-cacao">{interaction.clinicalEffect}</p>
                  </div>

                  {/* Management */}
                  <div className="p-3 bg-sage/10 rounded-lg">
                    <h4 className="font-medium text-xs text-cacao/80 mb-1">Management</h4>
                    <p className="text-xs text-cacao">{interaction.management}</p>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-cacao/60">Frequency:</span>
                      <p className="text-cacao font-medium">{interaction.frequency}</p>
                    </div>
                    <div>
                      <span className="text-cacao/60">Onset:</span>
                      <p className="text-cacao font-medium">{interaction.onset}</p>
                    </div>
                  </div>

                  {/* References */}
                  {interaction.references && interaction.references.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-cacao/60">References:</span>
                      <div className="flex flex-wrap gap-1">
                        {interaction.references.map((ref, idx) => (
                          <Badge key={idx} className="bg-almond/60 text-cacao/80 text-xs">
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredInteractions.length === 0 && (
          <div className="text-center py-8 text-cacao/60">
            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-sage opacity-50" />
            <p className="text-sm">
              {dismissedInteractions.size > 0 
                ? 'No active interactions with current filters'
                : 'No drug interactions detected'}
            </p>
            {dismissedInteractions.size > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDismissedInteractions(new Set())}
                className="mt-2 text-sage hover:bg-sage/10"
              >
                Show Dismissed Interactions
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 