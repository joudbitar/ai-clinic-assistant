import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContextMenu } from '@/components/ui/context-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PatientCard } from './PatientCard'
import { usePatients } from '@/hooks/usePatients'
import { useDeletePatient } from '@/hooks/useMutations'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchPatientsPanel() {
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const debouncedQuery = useDebounce(query, 300)
  const { data: patients = [], isLoading } = usePatients()
  const deletePatient = useDeletePatient()
  const navigate = useNavigate()
  const PATIENTS_PER_PAGE = 10 // Increased from 3 for more patients

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
    setCurrentPage(1) // Reset to first page on new search
  }, [])

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const handlePatientClick = (patientId) => {
    navigate(`/patients/${patientId}`)
  }

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      await deletePatient.mutateAsync(patientToDelete.id)
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setPatientToDelete(null)
  }

  return (
    <>
      <div 
        className="h-full min-h-[200px] rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-200 p-4 flex flex-col"
        style={{ border: '1px solid #d1d5db' }}
      >
        {/* Compact Header */}
        <div className="flex items-center gap-3 mb-3">
          <Search className="h-5 w-5 text-gray-500" />
          <h2 className="text-md font-semibold text-gray-900">Search Patients</h2>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Input
            placeholder="Search patients..."
            value={query}
            onChange={handleQueryChange}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500/20 rounded-lg h-9 text-sm"
          />
        </div>

        {/* Compact Results List */}
        <ScrollArea className="flex-1 -mr-2 pr-2">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {searchResults.length > 0 ? (
                  <>
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {paginatedResults.map((result) => (
                        <ContextMenu
                          key={result.item.id}
                          items={[
                            {
                              label: "Delete Patient",
                              icon: <Trash2 className="h-4 w-4" />,
                              destructive: true,
                              onClick: () => handleDeleteClick(result.item)
                            }
                          ]}
                        >
                          <div
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handlePatientClick(result.item.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {result.item.first_name?.[0]}{result.item.last_name?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {result.item.first_name} {result.item.last_name}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {result.item.cancer_type || 'Type not specified'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                {result.item.clinical_status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </ContextMenu>
                      ))}
                    </motion.div>
                    
                    {/* Compact Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className="text-xs text-gray-700 hover:text-blue-600 disabled:opacity-50 p-1 h-auto"
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" />
                          Prev
                        </Button>
                        <span className="text-xs text-gray-600">
                          {currentPage}/{totalPages}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="text-xs text-gray-700 hover:text-blue-600 disabled:opacity-50 p-1 h-auto"
                        >
                          Next
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <Search className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {debouncedQuery ? 'No patients found' : 'Start typing to search'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Patient"
        description={
          patientToDelete
            ? `Are you sure you want to delete ${patientToDelete.first_name} ${patientToDelete.last_name}? This will permanently remove the patient and ALL related records including consultations, medical history, treatments, and recordings. This action cannot be undone.`
            : "Are you sure you want to delete this patient?"
        }
        confirmText="Delete Patient"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={deletePatient.isPending}
      />
    </>
  )
} 