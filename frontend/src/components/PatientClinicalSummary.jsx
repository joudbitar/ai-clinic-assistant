import React from 'react'
import { usePatientBaselines, useBaselineTumors, usePatientHistories } from '@/hooks/usePatients'
import { BMIBadge, CancerStageBadge, PackYearsBadge, SmokingRiskBadge } from '@/components/ClinicalBadge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export const PatientClinicalSummary = ({ patientId }) => {
  const { data: baselines, isLoading: baselinesLoading } = usePatientBaselines(patientId)
  const { data: histories, isLoading: historiesLoading } = usePatientHistories(patientId)
  
  // Get the most recent baseline
  const latestBaseline = baselines?.[0]
  
  // Get tumor data for the latest baseline
  const { data: tumors, isLoading: tumorsLoading } = useBaselineTumors(latestBaseline?.id)
  
  // Get smoking history
  const smokingHistory = histories?.find(h => h.history_type === 'smoking')
  
  if (baselinesLoading || historiesLoading || tumorsLoading) {
    return (
      <div className="flex gap-1">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>
    )
  }

  const badges = []

  // Add BMI badge if available
  if (latestBaseline?.weight && latestBaseline?.height) {
    badges.push(
      <BMIBadge 
        key="bmi"
        weight={parseFloat(latestBaseline.weight)} 
        height={parseFloat(latestBaseline.height)}
        size="sm"
      />
    )
  }

  // Add ECOG performance status
  if (latestBaseline?.ecog_performance_status !== null && latestBaseline?.ecog_performance_status !== undefined) {
    const ecogColors = {
      0: 'bg-green-100 text-green-800',
      1: 'bg-blue-100 text-blue-800', 
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800'
    }
    
    badges.push(
      <Badge 
        key="ecog" 
        className={`text-xs px-2 py-1 font-medium border-0 ${ecogColors[latestBaseline.ecog_performance_status] || 'bg-gray-100 text-gray-800'}`}
      >
        ECOG {latestBaseline.ecog_performance_status}
      </Badge>
    )
  }

  // Add cancer staging for tumors
  if (tumors && tumors.length > 0) {
    // Show staging for the most advanced tumor
    const tumorWithStaging = tumors.find(t => t.tnm_t && t.tnm_n && t.tnm_m)
    if (tumorWithStaging) {
      badges.push(
        <CancerStageBadge 
          key="cancer-stage"
          tnm_t={tumorWithStaging.tnm_t}
          tnm_n={tumorWithStaging.tnm_n} 
          tnm_m={tumorWithStaging.tnm_m}
          size="sm"
        />
      )
    }

    // Add tumor count badge
    badges.push(
      <Badge 
        key="tumor-count" 
        className="text-xs px-2 py-1 font-medium border-0 bg-purple-100 text-purple-800"
      >
        {tumors.length} tumor{tumors.length === 1 ? '' : 's'}
      </Badge>
    )
  }

  // Add smoking risk for smoking history - Use structured data if available
  if (smokingHistory) {
    // Priority: Use structured data if available
    if (smokingHistory.packs_per_day && smokingHistory.years_smoked) {
      badges.push(
        <SmokingRiskBadge 
          key="smoking-risk"
          packsPerDay={smokingHistory.packs_per_day}
          yearsSmoked={smokingHistory.years_smoked}
          packYears={smokingHistory.pack_years}
          size="sm"
        />
      )
    } else if (smokingHistory.description) {
      // Fallback to parsing description text
      badges.push(
        <PackYearsBadge 
          key="pack-years"
          description={smokingHistory.description}
          size="sm"
        />
      )
    }
  }

  // Add baseline date indicator
  if (latestBaseline) {
    const baselineDate = new Date(latestBaseline.baseline_date)
    const isRecent = (Date.now() - baselineDate.getTime()) < (90 * 24 * 60 * 60 * 1000) // 90 days
    
    badges.push(
      <Badge 
        key="baseline-date" 
        className={`text-xs px-2 py-1 font-medium border-0 ${isRecent ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}
      >
        Baseline {baselineDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </Badge>
    )
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-xs">
      {badges.length > 0 ? badges : (
        <Badge className="text-xs px-2 py-1 font-medium border-0 bg-gray-50 text-gray-500">
          No clinical data
        </Badge>
      )}
    </div>
  )
} 