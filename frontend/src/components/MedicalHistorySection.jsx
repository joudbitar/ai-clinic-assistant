import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Heart, 
  Cigarette, 
  Wine, 
  Users, 
  Scissors, 
  Pill, 
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Calendar,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Import sub-components (we'll create these next)
import RiskFactorsSection from './RiskFactorsSection'
import SurgeriesSection from './SurgeriesSection'
import MedicationsSection from './MedicationsSection'
import ClinicalDescriptionSection from './ClinicalDescriptionSection'

const MedicalHistorySection = ({ 
  patientId, 
  histories = [], 
  surgeries = [], 
  medications = [], 
  onUpdateHistory,
  onCreateHistory,
  onDeleteHistory,
  onUpdateSurgery,
  onCreateSurgery,
  onDeleteSurgery,
  onUpdateMedication,
  onCreateMedication,
  onDeleteMedication,
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState({
    riskFactors: true,
    surgeries: true,
    medications: true,
    clinicalDescription: true
  })

  // Organize histories by type
  const historyByType = {
    smoking: histories.filter(h => h.history_type === 'smoking'),
    alcohol: histories.filter(h => h.history_type === 'alcohol'),
    family: histories.filter(h => h.history_type === 'family'),
    medical: histories.filter(h => h.history_type === 'medical'),
    allergy: histories.filter(h => h.history_type === 'allergy'),
    social: histories.filter(h => h.history_type === 'social'),
    other: histories.filter(h => !['smoking', 'alcohol', 'family', 'medical', 'allergy', 'social'].includes(h.history_type))
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Calculate summary statistics
  const summaryStats = {
    totalHistories: histories.length,
    totalSurgeries: surgeries.length,
    totalMedications: medications.length,
    hasSmokingHistory: historyByType.smoking.length > 0,
    hasAlcoholHistory: historyByType.alcohol.length > 0,
    hasFamilyHistory: historyByType.family.length > 0,
    hasAllergies: historyByType.allergy.length > 0
  }

  // Get risk indicators for overview
  const getRiskIndicators = () => {
    const indicators = []
    
    // Smoking risk
    const smokingHistory = historyByType.smoking[0]
    if (smokingHistory && smokingHistory.pack_years > 20) {
      indicators.push({
        type: 'smoking',
        level: 'high',
        message: `High smoking risk: ${smokingHistory.pack_years} pack-years`,
        icon: Cigarette,
        color: 'bg-red-100 text-red-800'
      })
    }

    // Multiple surgeries
    if (surgeries.length > 3) {
      indicators.push({
        type: 'surgical',
        level: 'moderate',
        message: `Multiple surgical procedures: ${surgeries.length}`,
        icon: Scissors,
        color: 'bg-yellow-100 text-yellow-800'
      })
    }

    // Polypharmacy
    if (medications.length > 5) {
      indicators.push({
        type: 'medication',
        level: 'moderate',
        message: `Polypharmacy: ${medications.length} medications`,
        icon: Pill,
        color: 'bg-orange-100 text-orange-800'
      })
    }

    // Family history of cancer
    const cancerHistory = historyByType.family.filter(h => 
      h.condition && h.condition.toLowerCase().includes('cancer')
    )
    if (cancerHistory.length > 0) {
      indicators.push({
        type: 'family',
        level: 'moderate',
        message: `Family history of cancer: ${cancerHistory.length} relative(s)`,
        icon: Users,
        color: 'bg-purple-100 text-purple-800'
      })
    }

    return indicators
  }

  const riskIndicators = getRiskIndicators()

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Medical History
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                {summaryStats.totalHistories} histories
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Scissors className="h-3 w-3" />
                {summaryStats.totalSurgeries} surgeries
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Pill className="h-3 w-3" />
                {summaryStats.totalMedications} medications
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {/* Risk Indicators */}
        {riskIndicators.length > 0 && (
          <CardContent className="pt-0">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Clinical Attention Required:</p>
                  <div className="flex flex-wrap gap-2">
                    {riskIndicators.map((indicator, index) => (
                      <Badge key={index} className={cn("gap-1", indicator.color)}>
                        <indicator.icon className="h-3 w-3" />
                        {indicator.message}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="risk-factors" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Factors
          </TabsTrigger>
          <TabsTrigger value="surgeries" className="gap-2">
            <Scissors className="h-4 w-4" />
            Surgeries
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-2">
            <Pill className="h-4 w-4" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="clinical" className="gap-2">
            <Heart className="h-4 w-4" />
            Clinical Notes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Factors Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Risk Factors Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cigarette className="h-4 w-4" />
                    Smoking History
                  </span>
                  <Badge variant={summaryStats.hasSmokingHistory ? "destructive" : "outline"}>
                    {summaryStats.hasSmokingHistory ? "Present" : "None"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wine className="h-4 w-4" />
                    Alcohol History
                  </span>
                  <Badge variant={summaryStats.hasAlcoholHistory ? "secondary" : "outline"}>
                    {summaryStats.hasAlcoholHistory ? "Present" : "None"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Family History
                  </span>
                  <Badge variant={summaryStats.hasFamilyHistory ? "secondary" : "outline"}>
                    {historyByType.family.length} entries
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Allergies
                  </span>
                  <Badge variant={summaryStats.hasAllergies ? "destructive" : "outline"}>
                    {historyByType.allergy.length} known
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Recent surgeries */}
                {surgeries.slice(0, 2).map(surgery => (
                  <div key={surgery.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Scissors className="h-3 w-3" />
                      {surgery.procedure}
                    </span>
                    <span className="text-gray-500">
                      {surgery.date ? new Date(surgery.date).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                ))}
                
                {/* Recent medications */}
                {medications.slice(0, 2).map(medication => (
                  <div key={medication.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Pill className="h-3 w-3" />
                      {medication.name}
                    </span>
                    <span className="text-gray-500">
                      {medication.start_date ? new Date(medication.start_date).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                ))}

                {(surgeries.length === 0 && medications.length === 0) && (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Factors Tab */}
        <TabsContent value="risk-factors">
          <RiskFactorsSection
            patientId={patientId}
            histories={historyByType}
            onUpdate={onUpdateHistory}
            onCreate={onCreateHistory}
            onDelete={onDeleteHistory}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Surgeries Tab */}
        <TabsContent value="surgeries">
          <SurgeriesSection
            patientId={patientId}
            surgeries={surgeries}
            onUpdate={onUpdateSurgery}
            onCreate={onCreateSurgery}
            onDelete={onDeleteSurgery}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications">
          <MedicationsSection
            patientId={patientId}
            medications={medications}
            onUpdate={onUpdateMedication}
            onCreate={onCreateMedication}
            onDelete={onDeleteMedication}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Clinical Notes Tab */}
        <TabsContent value="clinical">
          <ClinicalDescriptionSection
            patientId={patientId}
            histories={historyByType}
            onUpdate={onUpdateHistory}
            onCreate={onCreateHistory}
            onDelete={onDeleteHistory}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MedicalHistorySection 