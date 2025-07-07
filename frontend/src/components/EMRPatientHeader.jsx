import React from 'react'
import { Calendar, Phone, User, Heart, Activity, Scale, Stethoscope } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { BMIBadge, CancerStageBadge, SmokingRiskBadge } from '@/components/ClinicalBadge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function EMRPatientHeader({ 
  patient, 
  baselines = [], 
  histories = [], 
  followups = [],
  isLoading = false,
  className = ''
}) {
  if (isLoading) {
    return <EMRPatientHeaderSkeleton />
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getPatientInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return `${first}${last}`
  }

  const getMainDiagnosis = (baselines) => {
    if (!baselines || baselines.length === 0) return null
    
    // Get the most recent baseline
    const recentBaseline = baselines.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0]
    
    return recentBaseline?.diagnosis || recentBaseline?.primary_diagnosis
  }

  const getECOGStatus = (followups) => {
    if (!followups || followups.length === 0) return null
    
    // Get most recent ECOG score
    const recentFollowup = followups.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0]
    
    return recentFollowup?.ecog_score
  }

  const getLatestVitals = (followups) => {
    if (!followups || followups.length === 0) return {}
    
    const recentFollowup = followups.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0]
    
    return {
      weight: recentFollowup?.weight,
      height: recentFollowup?.height,
      bloodPressure: recentFollowup?.blood_pressure,
      temperature: recentFollowup?.temperature
    }
  }

  const getSmokingHistory = (histories) => {
    if (!histories || histories.length === 0) return null
    
    const smokingHistory = histories.find(h => h.history_type === 'smoking')
    return smokingHistory
  }

  const getLatestTNM = (baselines) => {
    if (!baselines || baselines.length === 0) return null
    
    const recentBaseline = baselines.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0]
    
    if (recentBaseline?.tnm_t && recentBaseline?.tnm_n && recentBaseline?.tnm_m) {
      return {
        t: recentBaseline.tnm_t,
        n: recentBaseline.tnm_n,
        m: recentBaseline.tnm_m
      }
    }
    return null
  }

  const age = calculateAge(patient?.date_of_birth)
  const initials = getPatientInitials(patient?.first_name, patient?.last_name)
  const fullName = `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim()
  const mainDiagnosis = getMainDiagnosis(baselines)
  const ecogScore = getECOGStatus(followups)
  const vitals = getLatestVitals(followups)
  const smokingHistory = getSmokingHistory(histories)
  const tnm = getLatestTNM(baselines)

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPhone = (phone) => {
    if (!phone) return 'N/A'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const ECOGBadge = ({ score }) => {
    if (score === null || score === undefined) return null
    
    let color
    if (score === 0) color = 'bg-green-100 text-green-800'
    else if (score === 1) color = 'bg-blue-100 text-blue-800'
    else if (score === 2) color = 'bg-yellow-100 text-yellow-800'
    else if (score === 3) color = 'bg-orange-100 text-orange-800'
    else color = 'bg-red-100 text-red-800'
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${color} font-medium border-0 cursor-help`}>
              ECOG {score}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-semibold">ECOG Performance Status</div>
              <div className="mt-1">
                {score === 0 && "Fully active, no restrictions"}
                {score === 1 && "Restricted in strenuous activity"}
                {score === 2 && "Ambulatory, capable of self-care"}
                {score === 3 && "Capable of only limited self-care"}
                {score === 4 && "Completely disabled"}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card className={cn('border-l-4 border-l-blue-500 shadow-sm', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Patient Identity Section */}
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-800">{initials}</span>
              </div>
            </div>
            
            {/* Patient Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    ID: {patient?.id?.slice(-8)}
                  </Badge>
                  {patient?.case_number && (
                    <Badge variant="outline" className="text-xs">
                      Case: {patient.case_number}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Demographics Bar */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>DOB: {formatDate(patient?.date_of_birth)}</span>
                </div>
                {age && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{age} years old</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(patient?.phone_1 || patient?.phone)}</span>
                </div>
                {patient?.gender && (
                  <Badge variant="secondary" className="text-xs">
                    {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Clinical Actions */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Active Patient
            </Badge>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Clinical Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Diagnosis & Staging */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
              <Stethoscope className="h-4 w-4" />
              <span>Primary Diagnosis</span>
            </h3>
            <div className="space-y-1">
              {mainDiagnosis ? (
                <div className="text-sm font-medium text-gray-900">{mainDiagnosis}</div>
              ) : (
                <div className="text-sm text-gray-500">Not specified</div>
              )}
              {tnm && (
                <div className="flex items-center space-x-2">
                  <CancerStageBadge 
                    tnm_t={tnm.t} 
                    tnm_n={tnm.n} 
                    tnm_m={tnm.m} 
                    size="sm"
                  />
                  <span className="text-xs text-gray-500">
                    T{tnm.t} N{tnm.n} M{tnm.m}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Performance Status & Vitals */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>Performance & Vitals</span>
            </h3>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ECOGBadge score={ecogScore} />
                {vitals.weight && vitals.height && (
                  <BMIBadge weight={vitals.weight} height={vitals.height} size="sm" />
                )}
              </div>
              {vitals.bloodPressure && (
                <div className="text-xs text-gray-600">
                  BP: {vitals.bloodPressure}
                </div>
              )}
            </div>
          </div>
          
          {/* Risk Factors */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>Risk Factors</span>
            </h3>
            <div className="space-y-1">
              {smokingHistory && (
                <SmokingRiskBadge 
                  packsPerDay={smokingHistory.packs_per_day}
                  yearsSmoked={smokingHistory.years_smoked}
                  packYears={smokingHistory.pack_years}
                  size="sm"
                />
              )}
              {patient?.family_history && (
                <Badge variant="outline" className="text-xs">
                  Family History
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EMRPatientHeaderSkeleton() {
  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mb-3 animate-pulse"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 