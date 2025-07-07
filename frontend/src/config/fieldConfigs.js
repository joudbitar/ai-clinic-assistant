// Field configurations for different data types

export const patientFields = {
  demographics: [
    { key: "first_name", label: "First Name", type: "text", required: true },
    { key: "last_name", label: "Last Name", type: "text", required: true },
    { key: "father_name", label: "Father Name", type: "text" },
    { key: "mother_name", label: "Mother Name", type: "text" },
    { key: "date_of_birth", label: "Date of Birth", type: "date" },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "marital_status",
      label: "Marital Status",
      type: "select",
      options: [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
        { value: "divorced", label: "Divorced" },
        { value: "widowed", label: "Widowed" },
      ],
    },
  ],

  contact: [
    { key: "phone_1", label: "Primary Phone", type: "tel" },
    { key: "phone_2", label: "Secondary Phone", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "address", label: "Address", type: "textarea" },
  ],

  background: [
    { key: "country_of_birth", label: "Country of Birth", type: "text" },
    { key: "city_of_birth", label: "City of Birth", type: "text" },
    { key: "occupation", label: "Occupation", type: "text" },
    { key: "file_reference", label: "File Reference", type: "text" },
    { key: "case_number", label: "Case Number", type: "text" },
  ],

  medical: [
    {
      key: "referring_physician_name",
      label: "Referring Physician",
      type: "text",
    },
    {
      key: "referring_physician_phone_1",
      label: "Physician Phone",
      type: "tel",
    },
  ],
};

export const historyFields = [
  {
    key: "history_type",
    label: "History Type",
    type: "select",
    required: true,
    options: [
      { value: "family", label: "Family History" },
      { value: "medical", label: "Medical History" },
      { value: "allergy", label: "Allergies" },
      { value: "social", label: "Social History" },
      { value: "smoking", label: "Smoking History" },
      { value: "alcohol", label: "Alcohol History" },
    ],
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    required: true,
  },
  { key: "onset_date", label: "Onset Date", type: "date" },
  {
    key: "severity",
    label: "Severity",
    type: "select",
    options: [
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "severe", label: "Severe" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
  // Structured smoking fields (only shown when history_type = 'smoking')
  {
    key: "packs_per_day",
    label: "Packs per Day",
    type: "number",
    step: "0.1",
    min: "0",
    placeholder: "e.g., 1.5",
    showForType: "smoking",
  },
  {
    key: "years_smoked",
    label: "Years Smoked",
    type: "number",
    min: "0",
    placeholder: "e.g., 15",
    showForType: "smoking",
  },
  {
    key: "pack_years",
    label: "Pack Years",
    type: "number",
    step: "0.1",
    readonly: true,
    showForType: "smoking",
    calculated: true,
  },
];

export const chemotherapyFields = [
  { key: "drug_name", label: "Drug Name", type: "text", required: true },
  { key: "dose", label: "Dose", type: "text" },
  { key: "frequency", label: "Frequency", type: "text" },
  { key: "start_date", label: "Start Date", type: "date" },
  { key: "end_date", label: "End Date", type: "date" },
  { key: "cycles", label: "Cycles", type: "number" },
  { key: "indication", label: "Indication", type: "text" },
  {
    key: "response",
    label: "Response",
    type: "select",
    options: [
      { value: "complete_response", label: "Complete Response" },
      { value: "partial_response", label: "Partial Response" },
      { value: "stable_disease", label: "Stable Disease" },
      { value: "progressive_disease", label: "Progressive Disease" },
    ],
  },
  { key: "side_effects", label: "Side Effects", type: "textarea" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const radiotherapyFields = [
  { key: "site", label: "Site", type: "text", required: true },
  { key: "dose", label: "Dose (Gy)", type: "number" },
  { key: "fractions", label: "Fractions", type: "number" },
  { key: "technique", label: "Technique", type: "text" },
  { key: "start_date", label: "Start Date", type: "date" },
  { key: "end_date", label: "End Date", type: "date" },
  { key: "indication", label: "Indication", type: "text" },
  {
    key: "response",
    label: "Response",
    type: "select",
    options: [
      { value: "complete_response", label: "Complete Response" },
      { value: "partial_response", label: "Partial Response" },
      { value: "stable_disease", label: "Stable Disease" },
      { value: "progressive_disease", label: "Progressive Disease" },
    ],
  },
  { key: "side_effects", label: "Side Effects", type: "textarea" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const surgeryFields = [
  { key: "procedure", label: "Procedure", type: "text", required: true },
  { key: "surgeon", label: "Surgeon", type: "text" },
  { key: "date", label: "Date", type: "date" },
  { key: "indication", label: "Indication", type: "text" },
  {
    key: "outcome",
    label: "Outcome",
    type: "select",
    options: [
      { value: "successful", label: "Successful" },
      { value: "partially_successful", label: "Partially Successful" },
      { value: "unsuccessful", label: "Unsuccessful" },
    ],
  },
  { key: "complications", label: "Complications", type: "textarea" },
  { key: "pathology", label: "Pathology", type: "textarea" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const medicationFields = [
  { key: "name", label: "Medication Name", type: "text", required: true },
  { key: "dose", label: "Dose", type: "text" },
  { key: "frequency", label: "Frequency", type: "text" },
  {
    key: "route",
    label: "Route",
    type: "select",
    options: [
      { value: "oral", label: "Oral" },
      { value: "iv", label: "IV" },
      { value: "im", label: "IM" },
      { value: "sc", label: "SC" },
      { value: "topical", label: "Topical" },
    ],
  },
  { key: "start_date", label: "Start Date", type: "date" },
  { key: "end_date", label: "End Date", type: "date" },
  { key: "indication", label: "Indication", type: "text" },
  {
    key: "prescribing_physician",
    label: "Prescribing Physician",
    type: "text",
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Enhanced baseline fields
export const baselineFields = [
  {
    key: "baseline_date",
    label: "Baseline Date",
    type: "date",
    required: true,
  },
  { key: "weight", label: "Weight (kg)", type: "number" },
  { key: "height", label: "Height (cm)", type: "number" },
  { key: "bmi", label: "BMI", type: "number" },
  {
    key: "ecog_performance_status",
    label: "ECOG Performance Status",
    type: "select",
    options: [
      { value: "0", label: "0 - Fully active" },
      { value: "1", label: "1 - Restricted strenuous activity" },
      { value: "2", label: "2 - Ambulatory, up >50% of day" },
      { value: "3", label: "3 - Limited activity, up <50% of day" },
      { value: "4", label: "4 - Completely disabled" },
    ],
  },
  { key: "vital_signs", label: "Vital Signs", type: "textarea" },
  {
    key: "physical_examination",
    label: "Physical Examination",
    type: "textarea",
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const tumorFields = [
  { key: "site", label: "Site", type: "text", required: true },
  { key: "size", label: "Size (cm)", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "histology", label: "Histology", type: "text" },
  {
    key: "grade",
    label: "Grade",
    type: "select",
    options: [
      { value: "g1", label: "Grade 1" },
      { value: "g2", label: "Grade 2" },
      { value: "g3", label: "Grade 3" },
      { value: "g4", label: "Grade 4" },
      { value: "gx", label: "Grade X" },
    ],
  },
  {
    key: "stage",
    label: "Stage",
    type: "select",
    options: [
      { value: "stage_0", label: "Stage 0" },
      { value: "stage_i", label: "Stage I" },
      { value: "stage_ii", label: "Stage II" },
      { value: "stage_iii", label: "Stage III" },
      { value: "stage_iv", label: "Stage IV" },
    ],
  },
  { key: "tnm_t", label: "TNM - T", type: "text" },
  { key: "tnm_n", label: "TNM - N", type: "text" },
  { key: "tnm_m", label: "TNM - M", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
];

// NEW: Follow-up fields
export const followupFields = [
  {
    key: "followup_date",
    label: "Follow-up Date",
    type: "date",
    required: true,
  },
  { key: "weight", label: "Weight (kg)", type: "number" },
  {
    key: "ecog_performance_status",
    label: "ECOG Performance Status",
    type: "select",
    options: [
      { value: "0", label: "0 - Fully active" },
      { value: "1", label: "1 - Restricted strenuous activity" },
      { value: "2", label: "2 - Ambulatory, up >50% of day" },
      { value: "3", label: "3 - Limited activity, up <50% of day" },
      { value: "4", label: "4 - Completely disabled" },
    ],
  },
  {
    key: "disease_status",
    label: "Disease Status",
    type: "select",
    options: [
      { value: "complete_response", label: "Complete Response" },
      { value: "partial_response", label: "Partial Response" },
      { value: "stable_disease", label: "Stable Disease" },
      { value: "progressive_disease", label: "Progressive Disease" },
      { value: "not_evaluable", label: "Not Evaluable" },
    ],
  },
  { key: "symptoms", label: "Symptoms", type: "textarea" },
  { key: "side_effects", label: "Side Effects", type: "textarea" },
  {
    key: "physical_examination",
    label: "Physical Examination",
    type: "textarea",
  },
  { key: "plan", label: "Plan", type: "textarea" },
  { key: "next_followup_date", label: "Next Follow-up Date", type: "date" },
  { key: "notes", label: "Notes", type: "textarea" },
];

// NEW: Lab result fields
export const labResultFields = [
  { key: "test_date", label: "Test Date", type: "date", required: true },
  { key: "test_name", label: "Test Name", type: "text", required: true },
  {
    key: "test_category",
    label: "Test Category",
    type: "select",
    options: [
      { value: "hematology", label: "Hematology" },
      { value: "chemistry", label: "Chemistry" },
      { value: "tumor_markers", label: "Tumor Markers" },
      { value: "liver_function", label: "Liver Function" },
      { value: "kidney_function", label: "Kidney Function" },
      { value: "coagulation", label: "Coagulation" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "result_value", label: "Result Value", type: "text" },
  { key: "result_unit", label: "Unit", type: "text" },
  { key: "reference_range", label: "Reference Range", type: "text" },
  {
    key: "result_status",
    label: "Result Status",
    type: "select",
    options: [
      { value: "normal", label: "Normal" },
      { value: "abnormal_low", label: "Abnormal Low" },
      { value: "abnormal_high", label: "Abnormal High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { key: "lab_facility", label: "Lab Facility", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
];

// NEW: Molecular test fields
export const molecularTestFields = [
  { key: "test_date", label: "Test Date", type: "date", required: true },
  { key: "test_name", label: "Test Name", type: "text", required: true },
  {
    key: "test_type",
    label: "Test Type",
    type: "select",
    options: [
      { value: "immunohistochemistry", label: "Immunohistochemistry" },
      { value: "fish", label: "FISH" },
      { value: "pcr", label: "PCR" },
      { value: "sequencing", label: "Sequencing" },
      { value: "mutation_analysis", label: "Mutation Analysis" },
      { value: "gene_expression", label: "Gene Expression" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "specimen_type", label: "Specimen Type", type: "text" },
  { key: "specimen_site", label: "Specimen Site", type: "text" },
  { key: "gene_tested", label: "Gene Tested", type: "text" },
  { key: "result", label: "Result", type: "text" },
  {
    key: "result_interpretation",
    label: "Result Interpretation",
    type: "select",
    options: [
      { value: "positive", label: "Positive" },
      { value: "negative", label: "Negative" },
      { value: "equivocal", label: "Equivocal" },
      { value: "not_interpretable", label: "Not Interpretable" },
    ],
  },
  { key: "percentage_positive", label: "Percentage Positive", type: "number" },
  { key: "lab_facility", label: "Lab Facility", type: "text" },
  { key: "pathologist", label: "Pathologist", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
];

// NEW: Imaging study fields
export const imagingStudyFields = [
  { key: "study_date", label: "Study Date", type: "date", required: true },
  {
    key: "study_type",
    label: "Study Type",
    type: "select",
    required: true,
    options: [
      { value: "ct", label: "CT Scan" },
      { value: "mri", label: "MRI" },
      { value: "pet", label: "PET Scan" },
      { value: "pet_ct", label: "PET-CT" },
      { value: "xray", label: "X-Ray" },
      { value: "ultrasound", label: "Ultrasound" },
      { value: "bone_scan", label: "Bone Scan" },
      { value: "mammography", label: "Mammography" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "body_part", label: "Body Part", type: "text" },
  {
    key: "contrast_used",
    label: "Contrast Used",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  { key: "findings", label: "Findings", type: "textarea" },
  { key: "impression", label: "Impression", type: "textarea" },
  {
    key: "response_assessment",
    label: "Response Assessment",
    type: "select",
    options: [
      { value: "complete_response", label: "Complete Response" },
      { value: "partial_response", label: "Partial Response" },
      { value: "stable_disease", label: "Stable Disease" },
      { value: "progressive_disease", label: "Progressive Disease" },
      { value: "not_evaluable", label: "Not Evaluable" },
      { value: "baseline", label: "Baseline" },
    ],
  },
  { key: "radiologist", label: "Radiologist", type: "text" },
  { key: "facility", label: "Facility", type: "text" },
  { key: "file_path", label: "File Path/URL", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return "Invalid Date";
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return "Invalid Date";
  }
};

export const formatPhone = (phone) => {
  if (!phone) return "N/A";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return phone;
};

// Validation functions
export const validateEmail = (email) => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : "Please enter a valid email address";
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 ? null : "Please enter a valid phone number";
};

export const validateRequired = (value) => {
  return value && value.trim() ? null : "This field is required";
};

export const validateNumber = (value) => {
  if (!value) return null;
  return !isNaN(value) ? null : "Please enter a valid number";
};

export const validateDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return !isNaN(date.getTime()) ? null : "Please enter a valid date";
};

// Utility function to calculate pack years
export const calculatePackYears = (packsPerDay, yearsSmoked) => {
  if (!packsPerDay || !yearsSmoked) return 0;
  const result = parseFloat(packsPerDay) * parseInt(yearsSmoked);
  return Math.round(result * 10) / 10; // Round to 1 decimal place
};

// Utility function to get smoking risk level
export const getSmokingRiskLevel = (packYears) => {
  if (packYears < 10)
    return { level: "Light", color: "bg-green-100 text-green-800" };
  if (packYears < 20)
    return { level: "Moderate", color: "bg-yellow-100 text-yellow-800" };
  if (packYears < 30)
    return { level: "Heavy", color: "bg-orange-100 text-orange-800" };
  return { level: "Very Heavy", color: "bg-red-100 text-red-800" };
};

// Enhanced field configurations for Medical History Section

// Risk Factors - Smoking History (using actual patient_histories table structure)
export const smokingHistoryFields = [
  {
    key: "history_type",
    label: "History Type",
    type: "hidden",
    default: "smoking",
  },
  {
    key: "description",
    label: "Smoking Details",
    type: "textarea",
    required: true,
    placeholder:
      "Current/former smoker, type of cigarettes, attempts to quit, etc.",
  },
  {
    key: "packs_per_day",
    label: "Packs per Day",
    type: "number",
    step: "0.1",
    min: "0",
    placeholder: "e.g., 1.5",
  },
  {
    key: "years_smoked",
    label: "Years Smoked",
    type: "number",
    min: "0",
    placeholder: "e.g., 15",
  },
  {
    key: "pack_years",
    label: "Pack Years",
    type: "number",
    step: "0.1",
    readonly: true,
    calculated: true,
  },
  {
    key: "onset_date",
    label: "Started Smoking",
    type: "date",
  },
  {
    key: "severity",
    label: "Severity",
    type: "select",
    options: [
      { value: "mild", label: "Light smoker" },
      { value: "moderate", label: "Moderate smoker" },
      { value: "severe", label: "Heavy smoker" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Risk Factors - Alcohol History (using actual patient_histories table structure)
export const alcoholHistoryFields = [
  {
    key: "history_type",
    label: "History Type",
    type: "hidden",
    default: "alcohol",
  },
  {
    key: "description",
    label: "Alcohol Use Details",
    type: "textarea",
    required: true,
    placeholder: "Current/former drinker, frequency, type of alcohol, etc.",
  },
  {
    key: "onset_date",
    label: "Started Drinking",
    type: "date",
  },
  {
    key: "severity",
    label: "Severity",
    type: "select",
    options: [
      { value: "mild", label: "Social drinker" },
      { value: "moderate", label: "Moderate drinker" },
      { value: "severe", label: "Heavy drinker" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Risk Factors - Family History (using actual patient_histories table structure)
export const familyHistoryFields = [
  {
    key: "history_type",
    label: "History Type",
    type: "hidden",
    default: "family",
  },
  {
    key: "description",
    label: "Family Medical History",
    type: "textarea",
    required: true,
    placeholder: "Family member, condition, age at diagnosis, etc.",
  },
  {
    key: "onset_date",
    label: "Date of Diagnosis",
    type: "date",
  },
  {
    key: "severity",
    label: "Severity",
    type: "select",
    options: [
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "severe", label: "Severe" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Clinical Description Fields (using actual patient_histories table structure)
export const clinicalDescriptionFields = [
  {
    key: "history_type",
    label: "History Type",
    type: "select",
    required: true,
    options: [
      { value: "medical", label: "Medical History" },
      { value: "allergy", label: "Allergies" },
      { value: "social", label: "Social History" },
      { value: "occupational", label: "Occupational History" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    required: true,
    placeholder: "Provide detailed description...",
  },
  { key: "onset_date", label: "Onset Date", type: "date" },
  {
    key: "severity",
    label: "Severity",
    type: "select",
    options: [
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "severe", label: "Severe" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Common medications list for autocomplete
export const commonMedications = [
  "Acetaminophen",
  "Advil",
  "Aleve",
  "Aspirin",
  "Atorvastatin",
  "Amlodipine",
  "Metformin",
  "Lisinopril",
  "Levothyroxine",
  "Metoprolol",
  "Omeprazole",
  "Simvastatin",
  "Losartan",
  "Hydrochlorothiazide",
  "Gabapentin",
  "Prednisone",
  "Insulin",
  "Warfarin",
  "Clopidogrel",
  "Furosemide",
  "Sertraline",
  "Escitalopram",
  "Tramadol",
  "Oxycodone",
  "Morphine",
  "Fentanyl",
  "Ondansetron",
  "Lorazepam",
  "Cyclobenzaprine",
  "Pantoprazole",
  "Ranitidine",
  "Ciprofloxacin",
  "Azithromycin",
  "Amoxicillin",
  "Doxycycline",
  "Prednisolone",
  "Methylprednisolone",
  // Cancer-specific medications
  "Carboplatin",
  "Cisplatin",
  "Oxaliplatin",
  "Paclitaxel",
  "Docetaxel",
  "Doxorubicin",
  "Cyclophosphamide",
  "5-Fluorouracil",
  "Gemcitabine",
  "Bevacizumab",
  "Trastuzumab",
  "Rituximab",
  "Pembrolizumab",
  "Nivolumab",
  "Ipilimumab",
  "Atezolizumab",
  "Durvalumab",
  "Cetuximab",
  "Panitumumab",
];

// Enhanced medication fields (using actual patient_concomitant_medications table structure)
export const enhancedMedicationFields = [
  {
    key: "name",
    label: "Medication Name",
    type: "text",
    required: true,
    autocomplete: commonMedications,
    placeholder: "Start typing medication name...",
  },
  {
    key: "dose",
    label: "Dose",
    type: "text",
    placeholder: "e.g., 500mg, 10 units",
  },
  {
    key: "frequency",
    label: "Frequency",
    type: "text",
    placeholder: "e.g., twice daily, as needed",
  },
  {
    key: "route",
    label: "Route",
    type: "text",
    placeholder: "e.g., oral, IV, IM",
  },
  { key: "start_date", label: "Start Date", type: "date" },
  { key: "end_date", label: "End Date", type: "date" },
  {
    key: "indication",
    label: "Indication",
    type: "text",
    placeholder: "What is this medication for?",
  },
  {
    key: "prescribing_physician",
    label: "Prescribing Physician",
    type: "text",
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

// Surgery procedure suggestions for autocomplete
export const commonSurgeries = [
  "Appendectomy",
  "Cholecystectomy",
  "Mastectomy",
  "Lumpectomy",
  "Hysterectomy",
  "Cesarean Section",
  "Hernia Repair",
  "Knee Replacement",
  "Hip Replacement",
  "Coronary Artery Bypass",
  "Angioplasty",
  "Cataract Surgery",
  "Tonsillectomy",
  "Gallbladder Surgery",
  "Colon Resection",
  "Liver Resection",
  "Lung Resection",
  "Nephrectomy",
  "Prostatectomy",
  "Thyroidectomy",
  "Splenectomy",
  "Pancreatectomy",
  "Esophagectomy",
  "Gastrectomy",
  "Colectomy",
  "Sigmoid Resection",
  "Right Hemicolectomy",
  "Left Hemicolectomy",
  "Low Anterior Resection",
  "Abdominoperineal Resection",
  "Whipple Procedure",
  "Hepatectomy",
  "Lobectomy",
  "Pneumonectomy",
  "Thoracotomy",
  "Craniotomy",
  "Laminectomy",
  "Arthroscopy",
  "ORIF",
  "Skin Graft",
  "Biopsy",
];

// Enhanced surgery fields (using actual patient_previous_surgeries table structure)
export const enhancedSurgeryFields = [
  {
    key: "procedure",
    label: "Procedure",
    type: "text",
    required: true,
    autocomplete: commonSurgeries,
    placeholder: "Start typing procedure name...",
  },
  {
    key: "surgeon",
    label: "Surgeon",
    type: "text",
    placeholder: "Dr. Last Name or Full Name",
  },
  { key: "date", label: "Date", type: "date" },
  {
    key: "indication",
    label: "Indication",
    type: "text",
    placeholder: "Reason for surgery",
  },
  {
    key: "outcome",
    label: "Outcome",
    type: "text",
    placeholder: "e.g., successful, partially successful, unsuccessful",
  },
  {
    key: "complications",
    label: "Complications",
    type: "textarea",
    placeholder: "Any complications during or after surgery",
  },
  {
    key: "pathology",
    label: "Pathology Results",
    type: "textarea",
    placeholder: "Pathology findings if applicable",
  },
  { key: "notes", label: "Additional Notes", type: "textarea" },
];

// Utility functions for medical history
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const formatMedicationDisplay = (medication) => {
  const parts = [];
  if (medication.name) parts.push(medication.name);
  if (medication.dose) parts.push(medication.dose);
  if (medication.frequency) parts.push(medication.frequency.replace(/_/g, " "));
  if (medication.route) parts.push(`(${medication.route.toUpperCase()})`);
  return parts.join(" ");
};

export const getRiskLevel = (type, value) => {
  switch (type) {
    case "smoking":
      if (value < 10)
        return { level: "Low", color: "bg-green-100 text-green-800" };
      if (value < 20)
        return { level: "Moderate", color: "bg-yellow-100 text-yellow-800" };
      if (value < 30)
        return { level: "High", color: "bg-orange-100 text-orange-800" };
      return { level: "Very High", color: "bg-red-100 text-red-800" };
    case "alcohol":
      if (value < 7)
        return { level: "Low", color: "bg-green-100 text-green-800" };
      if (value < 14)
        return { level: "Moderate", color: "bg-yellow-100 text-yellow-800" };
      return { level: "High", color: "bg-red-100 text-red-800" };
    default:
      return { level: "Unknown", color: "bg-gray-100 text-gray-800" };
  }
};

// Enhanced chemotherapy fields (using actual patient_previous_chemotherapy table structure)
export const enhancedChemotherapyFields = [
  {
    key: "drug_name",
    label: "Drug Name",
    type: "text",
    required: true,
    placeholder: "e.g., Carboplatin, Paclitaxel",
  },
  {
    key: "dose",
    label: "Dose",
    type: "text",
    placeholder: "e.g., 300mg/m²",
  },
  {
    key: "frequency",
    label: "Frequency",
    type: "text",
    placeholder: "e.g., every 3 weeks",
  },
  {
    key: "start_date",
    label: "Start Date",
    type: "date",
  },
  {
    key: "end_date",
    label: "End Date",
    type: "date",
  },
  {
    key: "cycles",
    label: "Number of Cycles",
    type: "number",
    min: "1",
    placeholder: "e.g., 6",
  },
  {
    key: "indication",
    label: "Indication",
    type: "text",
    placeholder: "Reason for chemotherapy",
  },
  {
    key: "response",
    label: "Response",
    type: "text",
    placeholder: "e.g., complete response, partial response, stable disease",
  },
  {
    key: "side_effects",
    label: "Side Effects",
    type: "textarea",
    placeholder: "Any side effects experienced",
  },
  { key: "notes", label: "Additional Notes", type: "textarea" },
];

// Enhanced radiotherapy fields (using actual patient_previous_radiotherapy table structure)
export const enhancedRadiotherapyFields = [
  {
    key: "site",
    label: "Treatment Site",
    type: "text",
    required: true,
    placeholder: "e.g., chest, pelvis, brain",
  },
  {
    key: "dose",
    label: "Total Dose (Gy)",
    type: "number",
    step: "0.1",
    placeholder: "e.g., 60",
  },
  {
    key: "fractions",
    label: "Number of Fractions",
    type: "number",
    placeholder: "e.g., 30",
  },
  {
    key: "technique",
    label: "Technique",
    type: "text",
    placeholder: "e.g., IMRT, 3D-CRT, VMAT",
  },
  {
    key: "start_date",
    label: "Start Date",
    type: "date",
  },
  {
    key: "end_date",
    label: "End Date",
    type: "date",
  },
  {
    key: "indication",
    label: "Indication",
    type: "text",
    placeholder: "Reason for radiotherapy",
  },
  {
    key: "response",
    label: "Response",
    type: "text",
    placeholder: "e.g., complete response, partial response, stable disease",
  },
  {
    key: "side_effects",
    label: "Side Effects",
    type: "textarea",
    placeholder: "Any side effects experienced",
  },
  { key: "notes", label: "Additional Notes", type: "textarea" },
];

// Enhanced other treatments fields (using actual patient_previous_other_treatments table structure)
export const enhancedOtherTreatmentFields = [
  {
    key: "treatment_type",
    label: "Treatment Type",
    type: "text",
    required: true,
    placeholder: "e.g., immunotherapy, targeted therapy, hormone therapy",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    required: true,
    placeholder: "Detailed description of the treatment",
  },
  {
    key: "start_date",
    label: "Start Date",
    type: "date",
  },
  {
    key: "end_date",
    label: "End Date",
    type: "date",
  },
  {
    key: "indication",
    label: "Indication",
    type: "text",
    placeholder: "Reason for treatment",
  },
  {
    key: "response",
    label: "Response",
    type: "text",
    placeholder: "e.g., complete response, partial response, stable disease",
  },
  {
    key: "side_effects",
    label: "Side Effects",
    type: "textarea",
    placeholder: "Any side effects experienced",
  },
  { key: "notes", label: "Additional Notes", type: "textarea" },
];

// Common chemotherapy drugs list for autocomplete
export const commonChemotherapyDrugs = [
  "Carboplatin",
  "Cisplatin",
  "Oxaliplatin",
  "Paclitaxel",
  "Docetaxel",
  "Nab-paclitaxel",
  "Doxorubicin",
  "Epirubicin",
  "Cyclophosphamide",
  "5-Fluorouracil",
  "Capecitabine",
  "Gemcitabine",
  "Pemetrexed",
  "Etoposide",
  "Topotecan",
  "Irinotecan",
  "Methotrexate",
  "Vincristine",
  "Vinblastine",
  "Vinorelbine",
  "Bleomycin",
  "Mitomycin C",
  "Dacarbazine",
  "Temozolomide",
  "Lomustine",
  "Carmustine",
  "Busulfan",
  "Melphalan",
  "Chlorambucil",
  "Bendamustine",
];

// Common radiotherapy techniques for autocomplete
export const commonRadiotherapyTechniques = [
  "3D Conformal Radiotherapy (3D-CRT)",
  "Intensity-Modulated Radiotherapy (IMRT)",
  "Volumetric Modulated Arc Therapy (VMAT)",
  "Stereotactic Body Radiotherapy (SBRT)",
  "Stereotactic Radiosurgery (SRS)",
  "Image-Guided Radiotherapy (IGRT)",
  "Proton Beam Therapy",
  "Brachytherapy",
  "External Beam Radiotherapy (EBRT)",
  "Tomotherapy",
  "CyberKnife",
  "Gamma Knife",
];

// Common other treatment types for autocomplete
export const commonOtherTreatments = [
  "Immunotherapy",
  "Targeted Therapy",
  "Hormone Therapy",
  "Biological Therapy",
  "Photodynamic Therapy",
  "Radiofrequency Ablation",
  "Cryotherapy",
  "Hyperthermia",
  "Gene Therapy",
  "Stem Cell Transplant",
  "Bone Marrow Transplant",
  "Palliative Care",
  "Pain Management",
  "Nutritional Support",
  "Physical Therapy",
];

// Utility functions for medical history
