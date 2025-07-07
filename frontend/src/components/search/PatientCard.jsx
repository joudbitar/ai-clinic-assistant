import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, AlertCircle, User, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function PatientCard({ patient, matches = [], query }) {
  const navigate = useNavigate()

  // Get status badge variant based on clinical status
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-clay/20 text-clay border-clay/30'
      case 'remission':
        return 'bg-sage/20 text-sage border-sage/30'
      case 'trial':
        return 'bg-saffron/20 text-saffron border-saffron/30'
      case 'stable':
        return 'bg-sage/20 text-sage border-sage/30'
      default:
        return 'bg-cacao/20 text-cacao border-cacao/30'
    }
  }

  // Get urgency indicator color using warm clay
  const getUrgencyColor = (nextAppointment) => {
    if (!nextAppointment) return 'bg-cacao/40'
    
    const today = new Date()
    const appointment = new Date(nextAppointment)
    const diffDays = Math.ceil((appointment - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) return 'bg-clay'
    if (diffDays <= 3) return 'bg-saffron'
    if (diffDays <= 7) return 'bg-sage'
    return 'bg-sage/60'
  }

  // Create highlighted text as React elements
  const createHighlightedText = (text, searchQuery) => {
    if (!searchQuery || !text) {
      return text
    }

    const parts = []
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      
      // Add highlighted match
      parts.push(
        <span key={match.index} className="font-semibold text-burgundy">
          {match[1]}
        </span>
      )
      
      lastIndex = match.index + match[1].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    
    return parts.length > 1 ? parts : text
  }

  // Create highlighted name with better logic
  const createHighlightedName = () => {
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
    
    if (!query) {
      return fullName
    }

    // Check if we have specific name matches from Fuse.js
    const firstNameMatch = matches.find(m => m.key === 'first_name')
    const lastNameMatch = matches.find(m => m.key === 'last_name')
    
    if (firstNameMatch || lastNameMatch) {
      const parts = []
      let firstName = patient.first_name || ''
      let lastName = patient.last_name || ''
      
      // Highlight first name if matched
      if (firstNameMatch && firstName) {
        const highlightedFirst = createHighlightedText(firstName, query)
        parts.push(highlightedFirst)
      } else {
        parts.push(firstName)
      }
      
      // Add space if both names exist
      if (firstName && lastName) {
        parts.push(' ')
      }
      
      // Highlight last name if matched
      if (lastNameMatch && lastName) {
        const highlightedLast = createHighlightedText(lastName, query)
        parts.push(highlightedLast)
      } else {
        parts.push(lastName)
      }
      
      return parts
    }
    
    // Fallback: highlight full name
    return createHighlightedText(fullName, query)
  }

  // Format next appointment
  const formatNextStep = (patient) => {
    if (patient.next_appointment) {
      const date = new Date(patient.next_appointment)
      return `Appointment ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    if (patient.treatment_cycle) {
      return `${patient.treatment_type} #${patient.treatment_cycle}`
    }
    return 'No upcoming appointments'
  }

  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
    >
      <Card
        className="p-4 bg-parchment/50 border-almond hover:bg-almond/60 hover:border-sage/30 hover:ring-2 hover:ring-sage/40 transition-all duration-300 cursor-pointer group shadow-md shadow-black/5"
        onClick={() => navigate(`/patients/${patient.id}`)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-sage/20">
                <AvatarImage src={patient.avatar_url} />
                <AvatarFallback className="bg-sage/20 text-sage font-semibold">
                  {getInitials(patient.first_name, patient.last_name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Urgency Indicator */}
              <div 
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-parchment ${getUrgencyColor(patient.next_appointment)}`}
                title="Urgency indicator"
              />
            </div>

            {/* Patient Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-cacao group-hover:text-sage transition-colors duration-300">
                    {createHighlightedName()}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-cacao/90">
                      {createHighlightedText(patient.cancer_type || 'Cancer type not specified', query)}
                    </span>
                    {patient.cancer_stage && (
                      <>
                        <span className="text-cacao/40">•</span>
                        <span className="text-sm text-cacao/90">
                          Stage {patient.cancer_stage}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Badge - Soft pill style */}
                <Badge className={`${getStatusVariant(patient.clinical_status)} font-medium px-3 py-1 rounded-full`}>
                  {patient.clinical_status || 'Unknown'}
                </Badge>
              </div>

              {/* Next Step */}
              <div className="flex items-center gap-2 text-sm text-cacao/60">
                <Clock className="h-4 w-4" />
                <span>{formatNextStep(patient)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 