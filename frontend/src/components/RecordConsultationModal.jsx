import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, X, UserPlus, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import Fuse from 'fuse.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePatients } from '@/hooks/usePatients'
import { useCreatePatient } from '@/hooks/useMutations'
import { useDebounce } from '@/hooks/useDebounce'

export function RecordConsultationModal({ isOpen, onClose }) {
  const [step, setStep] = useState('select') // 'select' | 'search'
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const { data: patients = [], isLoading } = usePatients()
  const createPatientMutation = useCreatePatient()
  const navigate = useNavigate()
  const PATIENTS_PER_PAGE = 8

  // Fuse.js configuration for fuzzy search
  const fuse = useMemo(() => {
    if (!patients.length) return null
    
    return new Fuse(patients, {
      keys: [
        { name: 'first_name', weight: 0.4 },
        { name: 'last_name', weight: 0.4 },
        { name: 'clinical_status', weight: 0.1 },
        { name: 'cancer_type', weight: 0.1 }
      ],
      threshold: 0.3,
      includeMatches: true,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true,
    })
  }, [patients])

  // Filtered and highlighted results
  const searchResults = useMemo(() => {
    if (!debouncedQuery || !fuse) {
      return patients.map(patient => ({ item: patient, matches: [] }))
    }
    
    return fuse.search(debouncedQuery)
  }, [debouncedQuery, fuse, patients])

  // Pagination calculations
  const totalPages = Math.ceil(searchResults.length / PATIENTS_PER_PAGE)
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * PATIENTS_PER_PAGE,
    currentPage * PATIENTS_PER_PAGE
  )

  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleClose = () => {
    setStep('select')
    setQuery('')
    setCurrentPage(1)
    setIsCreating(false)
    onClose()
  }

  const handleNewPatient = async () => {
    setIsCreating(true)
    try {
      // Create a minimal patient record that will be filled during the consultation
      const currentDate = new Date()
      const timestamp = currentDate.toISOString().slice(0, 16).replace('T', ' ')
      const tempPatient = {
        first_name: 'New Patient',
        last_name: timestamp,
        date_of_birth: '1900-01-01', // Placeholder that won't show realistic age
        phone_1: '', // Will be updated during consultation
      }
      
      const newPatient = await createPatientMutation.mutateAsync(tempPatient)
      handleClose()
      navigate(`/patients/${newPatient.id}/record`)
    } catch (error) {
      console.error('Failed to create new patient:', error)
      setIsCreating(false)
    }
  }

  const handleExistingPatient = () => {
    setStep('search')
  }

  const handlePatientSelect = (patient) => {
    handleClose()
    navigate(`/patients/${patient.id}/record`)
  }

  const handleBack = () => {
    setStep('select')
    setQuery('')
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {step === 'search' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="p-1 h-8 w-8 rounded-full hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <h2 className="text-xl font-semibold text-gray-900">
                  {step === 'select' ? 'Record Consultation' : 'Select Patient'}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-1 h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'select' ? (
                /* Step 1: Choose patient type */
                <div className="space-y-4">
                  <p className="text-gray-600 text-center mb-6">
                    Choose how you'd like to record this consultation
                  </p>
                  
                  <Button
                    onClick={handleExistingPatient}
                    className="w-full h-16 rounded-xl bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-4 group"
                  >
                    <Users className="h-6 w-6 text-gray-700 group-hover:text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold">Existing Patient</div>
                      <div className="text-sm text-gray-500 group-hover:text-blue-600">
                        Search and select a patient
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={handleNewPatient}
                    disabled={isCreating}
                    className="w-full h-16 rounded-xl bg-white text-gray-900 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"
                        />
                        <div className="text-left">
                          <div className="font-semibold">Creating Patient...</div>
                          <div className="text-sm text-gray-500">
                            Please wait
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-6 w-6 text-gray-700 group-hover:text-green-600" />
                        <div className="text-left">
                          <div className="font-semibold">New Patient</div>
                          <div className="text-sm text-gray-500 group-hover:text-green-600">
                            Create a new patient record
                          </div>
                        </div>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                /* Step 2: Search patients */
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients by name..."
                      value={query}
                      onChange={handleQueryChange}
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg"
                      autoFocus
                    />
                  </div>

                  {/* Results */}
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                          <span className="ml-2 text-sm text-gray-600">Loading...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          {paginatedResults.map((result) => (
                            <motion.div
                              key={result.item.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                              onClick={() => handlePatientSelect(result.item)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                                  {result.item.first_name?.[0]}{result.item.last_name?.[0]}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">
                                    {result.item.first_name} {result.item.last_name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {result.item.cancer_type || 'Type not specified'}
                                  </p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                  {result.item.clinical_status || 'Unknown'}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                          
                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="text-sm"
                              >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                              </Button>
                              <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="text-sm"
                              >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Search className="h-8 w-8 text-gray-400 mb-3" />
                          <p className="text-gray-600">
                            {debouncedQuery ? 'No patients found' : 'Start typing to search patients'}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 