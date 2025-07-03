import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Search, Plus, Eye, Mic } from 'lucide-react'
import { usePatients } from '@/hooks/usePatients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CreatePatientDialog } from '@/components/CreatePatientDialog'
import { PatientClinicalSummary } from '@/components/PatientClinicalSummary'

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: patients, isLoading, isError, error } = usePatients()

  const filteredPatients = patients?.filter(patient => {
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
    const phone = patient.phone_1 || patient.phone || ''
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm) ||
           (patient.date_of_birth || '').includes(searchTerm)
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

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load patients'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Patients</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/record">
            <Button variant="outline" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Record Consultation</span>
            </Button>
          </Link>
          <CreatePatientDialog />
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name, phone, or date of birth..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `${filteredPatients.length} Patient${filteredPatients.length === 1 ? '' : 's'}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Clinical Status</TableHead>
                  <TableHead>File Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(patient.date_of_birth)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {calculateAge(patient.date_of_birth)} years
                      </div>
                    </TableCell>
                    <TableCell>{patient.phone_1 || patient.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <PatientClinicalSummary patientId={patient.id} />
                    </TableCell>
                    <TableCell>{patient.file_reference || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center space-x-2 justify-end">
                        <Link to={`/record?patientId=${patient.id}`}>
                          <Button variant="outline" size="sm">
                            <Mic className="h-4 w-4 mr-2" />
                            Record
                          </Button>
                        </Link>
                        <Link to={`/patients/${patient.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? `No patients match "${searchTerm}"`
                  : "Get started by adding your first patient"
                }
              </p>
              <CreatePatientDialog />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 