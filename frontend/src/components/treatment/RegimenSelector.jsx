import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, BookOpen, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

// Mock regimen data
const mockRegimens = [
  {
    id: 1,
    name: 'AC-T (Doxorubicin + Cyclophosphamide → Paclitaxel)',
    category: 'Neoadjuvant',
    nccnLevel: '1A',
    indication: 'Early-stage breast cancer',
    duration: '16 weeks',
    cycles: '4 AC + 4 T',
    efficacy: { pCR: 28, dfs: 85, os: 92 },
    contraindications: ['ECOG > 2', 'Severe cardiac dysfunction', 'Creatinine > 2.0'],
    monitoring: ['ECHO q3 cycles', 'CBC weekly', 'LFTs monthly'],
    sideEffects: ['Neuropathy', 'Alopecia', 'Nausea', 'Fatigue'],
    renalAdjustment: true,
    ecogRestriction: 2
  },
  {
    id: 2,
    name: 'TCH (Docetaxel + Carboplatin + Trastuzumab)',
    category: 'Adjuvant',
    nccnLevel: '1A',
    indication: 'HER2+ breast cancer',
    duration: '18 weeks',
    cycles: '6 TCH',
    efficacy: { pCR: 43, dfs: 89, os: 94 },
    contraindications: ['LVEF < 50%', 'ECOG > 1'],
    monitoring: ['ECHO q3 months', 'CBC weekly'],
    sideEffects: ['Cardiotoxicity', 'Diarrhea', 'Neuropathy'],
    renalAdjustment: false,
    ecogRestriction: 1
  },
  {
    id: 3,
    name: 'Dose Dense AC-T',
    category: 'Adjuvant',
    nccnLevel: '1A',
    indication: 'High-risk early breast cancer',
    duration: '12 weeks',
    cycles: '4 AC + 4 T (q2w)',
    efficacy: { pCR: 32, dfs: 88, os: 95 },
    contraindications: ['Age > 70', 'ECOG > 1', 'Prior anthracycline'],
    monitoring: ['G-CSF support', 'ECHO q2 cycles'],
    sideEffects: ['Severe fatigue', 'Infection risk', 'Cardiotoxicity'],
    renalAdjustment: true,
    ecogRestriction: 1
  },
  {
    id: 4,
    name: 'Olaparib Monotherapy',
    category: 'Targeted',
    nccnLevel: '1A',
    indication: 'BRCA+ metastatic breast cancer',
    duration: 'Until progression',
    cycles: 'Continuous',
    efficacy: { pfs: 7.0, orr: 59, os: 19.3 },
    contraindications: ['Pregnancy', 'Severe bone marrow suppression'],
    monitoring: ['CBC monthly', 'Consider CYP3A4 interactions'],
    sideEffects: ['Anemia', 'Nausea', 'Fatigue', 'Thrombocytopenia'],
    renalAdjustment: true,
    ecogRestriction: 2
  }
]

export function RegimenSelector({ patientId }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [ecogFilter, setEcogFilter] = useState('all')
  const [renalFilter, setRenalFilter] = useState('all')
  const [selectedRegimen, setSelectedRegimen] = useState(null)

  // Mock patient data for filtering
  const patientECOG = 1
  const patientCreatinine = 1.2
  const hasRenalImpairment = patientCreatinine > 1.5

  const filteredRegimens = mockRegimens.filter(regimen => {
    const matchesSearch = regimen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regimen.indication.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || regimen.category.toLowerCase() === categoryFilter
    
    const matchesECOG = ecogFilter === 'all' || 
                       (ecogFilter === 'suitable' && regimen.ecogRestriction >= patientECOG)
    
    const matchesRenal = renalFilter === 'all' || 
                        (renalFilter === 'safe' && (!hasRenalImpairment || regimen.renalAdjustment))

    return matchesSearch && matchesCategory && matchesECOG && matchesRenal
  })

  const handleSelectRegimen = (regimen) => {
    setSelectedRegimen(regimen)
    toast.success(`Selected regimen: ${regimen.name}`)
  }

  const getNccnLevelColor = (level) => {
    switch (level) {
      case '1A':
        return 'bg-sage/20 text-sage'
      case '1B':
        return 'bg-saffron/20 text-saffron'
      case '2A':
        return 'bg-clay/20 text-clay'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getCompatibilityBadge = (regimen) => {
    const ecogCompatible = regimen.ecogRestriction >= patientECOG
    const renalCompatible = !hasRenalImpairment || regimen.renalAdjustment
    
    if (ecogCompatible && renalCompatible) {
      return { text: 'Compatible', color: 'bg-sage/20 text-sage', icon: <CheckCircle2 className="h-3 w-3" /> }
    } else if (!ecogCompatible || !renalCompatible) {
      return { text: 'Caution', color: 'bg-saffron/20 text-saffron', icon: <AlertTriangle className="h-3 w-3" /> }
    } else {
      return { text: 'Review', color: 'bg-clay/20 text-clay', icon: <Clock className="h-3 w-3" /> }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="bg-parchment border-almond">
        <CardHeader>
          <CardTitle className="text-base font-medium text-cacao flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            NCCN Treatment Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cacao/60" />
              <Input
                placeholder="Search regimens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-cacao/70">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="neoadjuvant">Neoadjuvant</SelectItem>
                    <SelectItem value="adjuvant">Adjuvant</SelectItem>
                    <SelectItem value="targeted">Targeted</SelectItem>
                    <SelectItem value="palliative">Palliative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cacao/70">ECOG Compatibility</label>
                <Select value={ecogFilter} onValueChange={setEcogFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ECOG Levels</SelectItem>
                    <SelectItem value="suitable">Suitable for Patient (ECOG {patientECOG})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-cacao/70">Renal Function</label>
                <Select value={renalFilter} onValueChange={setRenalFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regimens</SelectItem>
                    <SelectItem value="safe">Safe for Current Function</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regimen List */}
      <div className="space-y-3">
        {filteredRegimens.map((regimen, index) => {
          const compatibility = getCompatibilityBadge(regimen)
          
          return (
            <motion.div
              key={regimen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-parchment border-almond hover:border-sage/30 transition-colors cursor-pointer ${
                selectedRegimen?.id === regimen.id ? 'ring-2 ring-sage/20 border-sage/50' : ''
              }`}
              onClick={() => handleSelectRegimen(regimen)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm text-cacao">{regimen.name}</h3>
                        <p className="text-xs text-cacao/70">{regimen.indication}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={compatibility.color + ' flex items-center gap-1'}>
                          {compatibility.icon}
                          {compatibility.text}
                        </Badge>
                        <Badge className={getNccnLevelColor(regimen.nccnLevel)}>
                          NCCN {regimen.nccnLevel}
                        </Badge>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-cacao/60">Duration:</span>
                        <p className="text-cacao font-medium">{regimen.duration}</p>
                      </div>
                      <div>
                        <span className="text-cacao/60">Cycles:</span>
                        <p className="text-cacao font-medium">{regimen.cycles}</p>
                      </div>
                      <div>
                        <span className="text-cacao/60">Category:</span>
                        <p className="text-cacao font-medium">{regimen.category}</p>
                      </div>
                      <div>
                        <span className="text-cacao/60">Efficacy:</span>
                        <p className="text-cacao font-medium">
                          {regimen.efficacy.pCR ? `pCR ${regimen.efficacy.pCR}%` : 
                           regimen.efficacy.pfs ? `PFS ${regimen.efficacy.pfs}m` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Side Effects */}
                    <div className="space-y-2">
                      <span className="text-xs text-cacao/60">Common side effects:</span>
                      <div className="flex flex-wrap gap-1">
                        {regimen.sideEffects.slice(0, 4).map((effect, idx) => (
                          <Badge key={idx} className="bg-almond/60 text-cacao/80 text-xs">
                            {effect}
                          </Badge>
                        ))}
                        {regimen.sideEffects.length > 4 && (
                          <Badge className="bg-almond/60 text-cacao/80 text-xs">
                            +{regimen.sideEffects.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {filteredRegimens.length === 0 && (
          <div className="text-center py-8 text-cacao/60">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No regimens found matching current filters</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setEcogFilter('all')
                setRenalFilter('all')
              }}
              className="mt-2 text-sage hover:bg-sage/10"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 