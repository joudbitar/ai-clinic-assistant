import { useState, useEffect } from 'react'
import { Search, Plus, User, Calendar, Phone, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreatePatientDialog } from '@/components/CreatePatientDialog'
import { usePatients } from '@/hooks/usePatients'

export function PatientSelector({ selectedPatient, onPatientSelect }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const { data: patients, isLoading } = usePatients()
  
  const filteredPatients = patients?.filter(patient => {
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
    const phone = patient.phone_1 || patient.phone || ''
    const searchLower = searchTerm.toLowerCase()
    
    return fullName.toLowerCase().includes(searchLower) ||
           phone.includes(searchTerm) ||
           (patient.date_of_birth || '').includes(searchTerm) ||
           (patient.case_number || '').toLowerCase().includes(searchLower)
  }) || []
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return 'Invalid Date'
    }
  }
  
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
  
  const handlePatientSelect = (patient) => {
    onPatientSelect(patient)
    setShowResults(false)
    setSearchTerm('')
  }
  
  const handleSearchFocus = () => {
    setShowResults(true)
  }
  
  const handleSearchBlur = () => {
    // Delay hiding results to allow for clicking on results
    setTimeout(() => {
      setShowResults(false)
    }, 200)
  }
  
  useEffect(() => {
    if (searchTerm.length > 0) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [searchTerm])
  
  return (
    <div className="space-y-4">
      {/* Selected Patient Display */}
      {selectedPatient && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {`${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() || 'N/A'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Age {calculateAge(selectedPatient.date_of_birth)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{selectedPatient.phone_1 || selectedPatient.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPatientSelect(null)}
                >
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Patient Search */}
      {!selectedPatient && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name, phone, or case number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pl-10"
            />
          </div>
          
          {/* Search Results */}
          {showResults && (
            <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-64 overflow-y-auto">
              <CardContent className="p-2">
                {isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading patients...
                  </div>
                ) : filteredPatients.length > 0 ? (
                  <div className="space-y-1">
                    {filteredPatients.slice(0, 10).map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Age {calculateAge(patient.date_of_birth)} • {patient.phone_1 || patient.phone || 'N/A'}
                            </div>
                          </div>
                          {patient.case_number && (
                            <Badge variant="outline" className="text-xs">
                              {patient.case_number}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredPatients.length > 10 && (
                      <div className="text-center py-2 text-sm text-muted-foreground">
                        +{filteredPatients.length - 10} more results
                      </div>
                    )}
                  </div>
                ) : searchTerm.length > 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No patients found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Start typing to search patients
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Create New Patient */}
      {!selectedPatient && (
        <div className="flex items-center justify-center space-x-2 pt-2">
          <span className="text-sm text-muted-foreground">Can't find the patient?</span>
          <CreatePatientDialog />
        </div>
      )}
    </div>
  )
} 