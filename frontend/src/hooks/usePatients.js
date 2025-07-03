import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// API Base URL for backend endpoints
const API_BASE_URL = "http://localhost:8000";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients`);

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      return response.json();
    },
  });
}

export function usePatient(patientId) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient");
      }

      return response.json();
    },
    enabled: !!patientId,
  });
}

export function usePatientRecordings(patientId) {
  return useQuery({
    queryKey: ["patient-recordings", patientId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/patients/${patientId}/recordings`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patient recordings");
      }

      return response.json();
    },
    enabled: !!patientId,
  });
}

export function useRecording(recordingId) {
  return useQuery({
    queryKey: ["recording", recordingId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/recordings/${recordingId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch recording");
      }

      return response.json();
    },
    enabled: !!recordingId,
  });
}

// New comprehensive patient data hooks

export function usePatientHistories(patientId) {
  return useQuery({
    queryKey: ["patient-histories", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_histories")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientPreviousChemotherapy(patientId) {
  return useQuery({
    queryKey: ["patient-previous-chemotherapy", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_previous_chemotherapy")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientPreviousRadiotherapy(patientId) {
  return useQuery({
    queryKey: ["patient-previous-radiotherapy", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_previous_radiotherapy")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientPreviousSurgeries(patientId) {
  return useQuery({
    queryKey: ["patient-previous-surgeries", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_previous_surgeries")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientPreviousOtherTreatments(patientId) {
  return useQuery({
    queryKey: ["patient-previous-other-treatments", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_previous_other_treatments")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientConcomitantMedications(patientId) {
  return useQuery({
    queryKey: ["patient-concomitant-medications", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_concomitant_medications")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientBaselines(patientId) {
  return useQuery({
    queryKey: ["patient-baselines", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_baselines")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function useBaseline(baselineId) {
  return useQuery({
    queryKey: ["baseline", baselineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_baselines")
        .select("*")
        .eq("id", baselineId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!baselineId,
  });
}

export function useBaselineTumors(baselineId) {
  return useQuery({
    queryKey: ["baseline-tumors", baselineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("baseline_tumors")
        .select("*")
        .eq("baseline_id", baselineId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!baselineId,
  });
}

// New hooks for missing tables

export function usePatientFollowups(patientId) {
  return useQuery({
    queryKey: ["patient-followups", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_followups")
        .select("*")
        .eq("patient_id", patientId)
        .order("followup_date", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientLabResults(patientId) {
  return useQuery({
    queryKey: ["patient-lab-results", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_lab_results")
        .select("*")
        .eq("patient_id", patientId)
        .order("test_date", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientMolecularTests(patientId) {
  return useQuery({
    queryKey: ["patient-molecular-tests", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_molecular_tests")
        .select("*")
        .eq("patient_id", patientId)
        .order("test_date", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientImagingStudies(patientId) {
  return useQuery({
    queryKey: ["patient-imaging-studies", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_imaging_studies")
        .select("*")
        .eq("patient_id", patientId)
        .order("study_date", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function useAuditLogs(patientId) {
  return useQuery({
    queryKey: ["audit-logs", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(100); // Limit to last 100 audit entries

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!patientId,
  });
}

export function usePatientCompleteData(patientId) {
  return useQuery({
    queryKey: ["patient-complete", patientId],
    queryFn: async () => {
      // Fetch all patient data in one go for comprehensive views
      const [
        patient,
        histories,
        chemotherapy,
        radiotherapy,
        surgeries,
        medications,
        baselines,
        followups,
        labResults,
        molecularTests,
        imagingStudies,
        recordings,
      ] = await Promise.all([
        supabase.from("patients").select("*").eq("id", patientId).single(),
        supabase
          .from("patient_histories")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_previous_chemotherapy")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_previous_radiotherapy")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_previous_surgeries")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_concomitant_medications")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_baselines")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_followups")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_lab_results")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_molecular_tests")
          .select("*")
          .eq("patient_id", patientId),
        supabase
          .from("patient_imaging_studies")
          .select("*")
          .eq("patient_id", patientId),
        supabase.from("recordings").select("*").eq("patient_id", patientId),
      ]);

      // Check for any errors
      const errorSources = [
        patient,
        histories,
        chemotherapy,
        radiotherapy,
        surgeries,
        medications,
        baselines,
        followups,
        labResults,
        molecularTests,
        imagingStudies,
        recordings,
      ];

      for (const source of errorSources) {
        if (source.error) {
          throw new Error(source.error.message);
        }
      }

      return {
        patient: patient.data,
        histories: histories.data,
        chemotherapy: chemotherapy.data,
        radiotherapy: radiotherapy.data,
        surgeries: surgeries.data,
        medications: medications.data,
        baselines: baselines.data,
        followups: followups.data,
        labResults: labResults.data,
        molecularTests: molecularTests.data,
        imagingStudies: imagingStudies.data,
        recordings: recordings.data,
      };
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes since this is a heavy query
  });
}
