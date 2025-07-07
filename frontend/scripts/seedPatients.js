// Sample Patient Seed Script for Dashboard Testing
// Run with: node scripts/seedPatients.js

const samplePatients = [
  {
    id: 1,
    first_name: 'Sarah',
    last_name: 'Johnson',
    date_of_birth: '1965-03-15',
    gender: 'Female',
    phone_1: '(555) 123-4567',
    email: 'sarah.johnson@email.com',
    case_number: 'BC-2024-001',
    clinical_status: 'Active',
    ecog_score: 1,
    allergies: ['Penicillin', 'Shellfish'],
    next_appointment: '2024-02-15',
    avatar_url: null,
    emergency_contact: 'John Johnson (555) 123-4568',
    // Dashboard-specific data
    diagnosis: {
      primary: 'Invasive Ductal Carcinoma',
      stage: 'IIB',
      grade: '2',
      er_status: 'Positive',
      pr_status: 'Positive',
      her2_status: 'Negative'
    },
    currentTreatment: {
      regimen: 'AC-T',
      cycle: 3,
      totalCycles: 8,
      nextAppointment: '2024-02-15'
    }
  },
  {
    id: 2,
    first_name: 'Maria',
    last_name: 'Garcia',
    date_of_birth: '1972-07-22',
    gender: 'Female',
    phone_1: '(555) 987-6543',
    email: 'maria.garcia@email.com',
    case_number: 'BC-2024-002',
    clinical_status: 'Stable',
    ecog_score: 0,
    allergies: [],
    next_appointment: '2024-02-20',
    avatar_url: null,
    emergency_contact: 'Carlos Garcia (555) 987-6544',
    diagnosis: {
      primary: 'Invasive Lobular Carcinoma',
      stage: 'IIIA',
      grade: '3',
      er_status: 'Positive',
      pr_status: 'Negative',
      her2_status: 'Positive'
    },
    currentTreatment: {
      regimen: 'TCH',
      cycle: 5,
      totalCycles: 6,
      nextAppointment: '2024-02-20'
    }
  },
  {
    id: 3,
    first_name: 'Jennifer',
    last_name: 'Chen',
    date_of_birth: '1958-11-08',
    gender: 'Female',
    phone_1: '(555) 456-7890',
    email: 'jennifer.chen@email.com',
    case_number: 'BC-2024-003',
    clinical_status: 'Critical',
    ecog_score: 2,
    allergies: ['NSAIDS'],
    next_appointment: '2024-02-12',
    avatar_url: null,
    emergency_contact: 'David Chen (555) 456-7891',
    diagnosis: {
      primary: 'Triple Negative Breast Cancer',
      stage: 'IV',
      grade: '3',
      er_status: 'Negative',
      pr_status: 'Negative',
      her2_status: 'Negative'
    },
    currentTreatment: {
      regimen: 'Pembrolizumab + Chemotherapy',
      cycle: 2,
      totalCycles: 'Ongoing',
      nextAppointment: '2024-02-12'
    }
  }
]

console.log('Sample Dashboard Patient Data:')
console.log('==============================')
console.log('')

samplePatients.forEach((patient, index) => {
  console.log(`Patient ${index + 1}: ${patient.first_name} ${patient.last_name}`)
  console.log(`  Dashboard URL: /dashboard/${patient.id}`)
  console.log(`  Status: ${patient.clinical_status}`)
  console.log(`  Current Treatment: ${patient.currentTreatment.regimen}`)
  console.log('')
})

console.log('Usage:')
console.log('1. Start the development server: npm run dev')
console.log('2. Navigate to: http://localhost:5174/dashboard/1')
console.log('3. Try different tabs: /dashboard/1/diagnosis, /dashboard/1/treatment, etc.')
console.log('')
console.log('Available tabs:')
console.log('- diagnosis (default)')
console.log('- treatment') 
console.log('- imaging')
console.log('- comms')

// If running in a real environment with database, you would:
// 1. Connect to your database
// 2. Insert these patients using your ORM/query builder
// 3. Handle any authentication/authorization

// Example for Supabase (commented out):
/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function seedPatients() {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert(samplePatients)
      
    if (error) throw error
    
    console.log('Patients seeded successfully:', data)
  } catch (error) {
    console.error('Error seeding patients:', error)
  }
}

seedPatients()
*/ 