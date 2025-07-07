import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import Fuse from 'fuse.js'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PatientCard } from './PatientCard'
import { usePatients } from '@/hooks/usePatients'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchPatientsPanel() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { data: patients = [], isLoading } = usePatients()

  // Fuse.js configuration for fuzzy search
  const fuse = useMemo(() => {
    if (!patients.length) return null
    
    return new Fuse(patients, {
      keys: [
        { name: 'first_name', weight: 0.3 },
        { name: 'last_name', weight: 0.3 },
        { name: 'clinical_status', weight: 0.2 },
        { name: 'cancer_type', weight: 0.2 }
      ],
      threshold: 0.4,
      includeMatches: true,
      includeScore: true,
    })
  }, [patients])

  // Filtered and highlighted results
  const searchResults = useMemo(() => {
    if (!debouncedQuery || !fuse) {
      return patients.map(patient => ({ item: patient, matches: [] }))
    }
    
    return fuse.search(debouncedQuery)
  }, [debouncedQuery, fuse, patients])

  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value)
  }, [])

  return (
    <div className="h-full min-h-[400px] rounded-3xl bg-almond/80 border border-almond/90 shadow-md shadow-black/5 p-6 flex flex-col">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage h-5 w-5" />
        <Input
          placeholder="Search patients…"
          value={query}
          onChange={handleQueryChange}
          className="pl-12 bg-parchment/50 border-sage/20 text-cacao placeholder:text-cacao/60 focus:border-sage focus:ring-sage/20 rounded-xl h-12 text-lg"
        />
      </div>

      {/* Results List */}
      <ScrollArea className="flex-1 max-h-[60vh]">
        <div className="space-y-4 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full"
              />
              <span className="ml-3 text-cacao/70">Loading patients...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {searchResults.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {searchResults.map((result, index) => (
                    <motion.div
                      key={result.item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 80,
                        damping: 15
                      }}
                    >
                      <PatientCard 
                        patient={result.item} 
                        matches={result.matches || []}
                        query={debouncedQuery}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-sage/60" />
                  </div>
                  <p className="text-cacao/70 text-lg">
                    {debouncedQuery ? 'No patients found' : 'Start typing to search patients'}
                  </p>
                  <p className="text-cacao/50 text-sm mt-2">
                    {debouncedQuery ? 'Try adjusting your search terms' : 'Search by name, condition, or status'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 