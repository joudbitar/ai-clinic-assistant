import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Mock timeline data
const mockTimelineData = [
  {
    id: 1,
    date: '2024-01-15',
    type: 'Initial Presentation',
    description: 'Patient presented with palpable left breast mass',
    details: 'Patient reports noticing a 2cm mass in left upper outer quadrant 3 weeks ago. No pain, nipple discharge, or skin changes.',
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-01-18',
    type: 'Imaging',
    description: 'Mammography and breast ultrasound completed',
    details: 'BI-RADS 4B lesion. Ultrasound shows 2.1 x 1.8 cm hypoechoic mass with irregular margins.',
    status: 'completed'
  },
  {
    id: 3,
    date: '2024-01-22',
    type: 'Biopsy',
    description: 'Core needle biopsy performed',
    details: 'Ultrasound-guided 14G core biopsy x6 samples. Marker clip placed.',
    status: 'completed'
  },
  {
    id: 4,
    date: '2024-01-25',
    type: 'Pathology',
    description: 'Invasive ductal carcinoma confirmed',
    details: 'Grade 2 invasive ductal carcinoma. ER+ (95%), PR+ (80%), HER2- (IHC 1+). Ki-67: 25%',
    status: 'completed'
  },
  {
    id: 5,
    date: '2024-02-01',
    type: 'Staging Workup',
    description: 'CT chest/abdomen/pelvis and bone scan',
    details: 'No evidence of distant metastases. Single enlarged axillary lymph node.',
    status: 'in-progress'
  }
]

// Mock differential diagnoses
const mockDifferentials = [
  {
    id: 1,
    diagnosis: 'Invasive Ductal Carcinoma',
    probability: 95,
    status: 'confirmed',
    evidence: ['Pathology confirmation', 'Imaging characteristics', 'Clinical presentation']
  },
  {
    id: 2,
    diagnosis: 'Invasive Lobular Carcinoma',
    probability: 3,
    status: 'ruled-out',
    evidence: ['Pathology shows ductal features']
  },
  {
    id: 3,
    diagnosis: 'Fibroadenoma',
    probability: 1,
    status: 'ruled-out',
    evidence: ['Irregular margins on imaging', 'Malignant pathology']
  },
  {
    id: 4,
    diagnosis: 'Phyllodes Tumor',
    probability: 1,
    status: 'ruled-out',
    evidence: ['Pathology shows carcinoma']
  }
]

export function TimelineDifferentials({ patientId }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [expandedDifferentials, setExpandedDifferentials] = useState(true)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-sage/20 text-sage'
      case 'in-progress':
        return 'bg-saffron/20 text-saffron'
      case 'pending':
        return 'bg-clay/20 text-clay'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'bg-clay/20 text-clay'
    if (probability >= 50) return 'bg-saffron/20 text-saffron'
    if (probability >= 20) return 'bg-sage/20 text-sage'
    return 'bg-gray-100 text-gray-600'
  }

  const getDifferentialStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-sage/20 text-sage border-sage/30'
      case 'ruled-out':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'considering':
        return 'bg-saffron/20 text-saffron border-saffron/30'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Timeline Section */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Clinical Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTimelineData.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative pl-6 pb-4 ${index !== mockTimelineData.length - 1 ? 'border-l-2 border-almond ml-2' : ''}`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full ${
                  event.status === 'completed' ? 'bg-sage' : 
                  event.status === 'in-progress' ? 'bg-saffron' : 'bg-clay'
                }`} />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-cacao/60" />
                      <span className="text-xs text-cacao/60">{event.date}</span>
                      <Badge className={`${getStatusColor(event.status)} text-xs`}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-cacao">{event.type}</h4>
                    <p className="text-xs text-cacao/70 mt-1">{event.description}</p>
                    
                    {event.details && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                        className="mt-2 h-6 px-2 text-xs hover:bg-sage/10"
                      >
                        {selectedEvent === event.id ? (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3 w-3 mr-1" />
                            Show Details
                          </>
                        )}
                      </Button>
                    )}
                    
                    {selectedEvent === event.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 bg-almond/30 rounded-lg"
                      >
                        <p className="text-xs text-cacao/80">{event.details}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add new event button */}
            <Button variant="outline" size="sm" className="w-full mt-4 text-xs hover:bg-sage/10">
              <Plus className="h-3 w-3 mr-2" />
              Add Timeline Event
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Differential Diagnoses */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <Collapsible open={expandedDifferentials} onOpenChange={setExpandedDifferentials}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Differential Diagnoses
                </CardTitle>
                {expandedDifferentials ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {mockDifferentials.map((differential, index) => (
                    <motion.div
                      key={differential.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border-2 ${getDifferentialStatusColor(differential.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{differential.diagnosis}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getProbabilityColor(differential.probability)} text-xs`}>
                            {differential.probability}%
                          </Badge>
                          <Badge className={`${getDifferentialStatusColor(differential.status)} text-xs`}>
                            {differential.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-cacao/60">Supporting evidence:</p>
                        <ul className="text-xs text-cacao/70 space-y-1">
                          {differential.evidence.map((evidence, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-sage">•</span>
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>
    </div>
  )
} 