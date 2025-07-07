import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Calendar, AlertTriangle, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

export function PatientHeader({ patientId, patient, isLoading }) {
  const [demographicsOpen, setDemographicsOpen] = useState(false)

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Format next visit date
  const formatNextVisit = (dateString) => {
    if (!dateString) return 'No upcoming visits'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    })
  }

  // Get ECOG status color
  const getECOGColor = (score) => {
    if (score <= 1) return 'bg-sage/20 text-sage'
    if (score <= 2) return 'bg-saffron/20 text-saffron'
    return 'bg-clay/20 text-clay'
  }

  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="h-[90px] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="h-[90px] flex items-center justify-center px-6">
        <div className="flex items-center gap-2 text-cacao/60">
          <AlertTriangle className="h-5 w-5" />
          <span>Patient not found</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[90px] flex items-center justify-between px-6">
      {/* Patient Identity */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-sage/20">
          <AvatarImage src={patient.avatar_url} />
          <AvatarFallback className="bg-sage/20 text-sage font-semibold text-lg">
            {getInitials(patient.first_name, patient.last_name)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-cacao">
              {patient.first_name} {patient.last_name}
            </h1>
            <Dialog open={demographicsOpen} onOpenChange={setDemographicsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-sage/10"
                  aria-label="View full demographics"
                >
                  <ChevronDown className="h-4 w-4 text-sage" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Patient Demographics</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-cacao/70">Full Name</label>
                      <p className="text-cacao">{patient.first_name} {patient.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cacao/70">Date of Birth</label>
                      <p className="text-cacao">{patient.date_of_birth || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cacao/70">Age</label>
                      <p className="text-cacao">{calculateAge(patient.date_of_birth)} years old</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cacao/70">Gender</label>
                      <p className="text-cacao">{patient.gender || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-cacao/70">Phone</label>
                      <p className="text-cacao">{patient.phone_1 || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cacao/70">Email</label>
                      <p className="text-cacao">{patient.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cacao/70">MRN</label>
                      <p className="text-cacao">{patient.case_number || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-cacao/70">Emergency Contact</label>
                      <p className="text-cacao">{patient.emergency_contact || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-2 text-sm text-cacao/70">
            <span>{calculateAge(patient.date_of_birth)} y/o</span>
            <span>•</span>
            <span>{patient.gender || 'Gender not specified'}</span>
            <span>•</span>
            <span>MRN: {patient.case_number || 'Not assigned'}</span>
          </div>
        </div>
      </div>

      {/* Quick Status Chips */}
      <div className="flex items-center gap-3">
        {/* ECOG Status */}
        {patient.ecog_score !== undefined && (
          <Badge className={`${getECOGColor(patient.ecog_score)} font-medium px-3 py-1 rounded-full`}>
            ECOG {patient.ecog_score}
          </Badge>
        )}

        {/* Allergies */}
        {patient.allergies && patient.allergies.length > 0 && (
          <Badge className="bg-clay/20 text-clay font-medium px-3 py-1 rounded-full">
            {patient.allergies.length} Allergies
          </Badge>
        )}

        {/* Next Visit */}
        <Badge className="bg-sage/20 text-sage font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatNextVisit(patient.next_appointment)}
        </Badge>
      </div>
    </div>
  )
} 