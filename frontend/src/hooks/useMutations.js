import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast.jsx";

// API Base URL for backend endpoints
const API_BASE_URL = "http://localhost:8000";

// Patient mutations
export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (patientData) => {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create patient");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Add the new patient to the cache
      queryClient.setQueryData(["patients"], (old) => {
        return old ? [data, ...old] : [data];
      });

      // Set the individual patient cache
      queryClient.setQueryData(["patient", data.id], data);

      toast.success("Patient created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create patient: ${error.message}`);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, field, value }) => {
      // Handle bulk updates if field is 'all'
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patients")
        .update(updateData)
        .eq("id", patientId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Update the patient in the cache
      queryClient.setQueryData(["patient", variables.patientId], data);

      // Also update the patients list if it exists
      queryClient.setQueryData(["patients"], (old) => {
        if (!old) return old;
        return old.map((p) => (p.id === variables.patientId ? data : p));
      });

      toast.success("Field updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (patientId) => {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete patient");
      }

      return response.json();
    },
    onSuccess: (data, patientId) => {
      // Remove the patient from the patients list cache
      queryClient.setQueryData(["patients"], (old) => {
        return old ? old.filter((p) => p.id !== patientId) : old;
      });

      // Remove the individual patient cache
      queryClient.removeQueries(["patient", patientId]);

      // Remove all related queries for this patient
      const relatedQueryKeys = [
        ["patient-recordings", patientId],
        ["patient-histories", patientId],
        ["patient-previous-chemotherapy", patientId],
        ["patient-previous-radiotherapy", patientId],
        ["patient-previous-surgeries", patientId],
        ["patient-previous-other-treatments", patientId],
        ["patient-concomitant-medications", patientId],
        ["patient-baselines", patientId],
        ["patient-followups", patientId],
        ["patient-lab-results", patientId],
        ["patient-molecular-tests", patientId],
        ["patient-imaging-studies", patientId],
        ["audit-logs", patientId],
        ["patient-complete-data", patientId],
      ];

      relatedQueryKeys.forEach((queryKey) => {
        queryClient.removeQueries(queryKey);
      });

      toast.success("Patient and all related records deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete patient: ${error.message}`);
    },
  });
}

// Patient History mutations
export function useUpdatePatientHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ historyId, field, value }) => {
      // Handle bulk updates if field is 'all'
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_histories")
        .update(updateData)
        .eq("id", historyId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Update the patient histories in the cache
      queryClient.setQueryData(
        ["patient-histories", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((h) => (h.id === variables.historyId ? data : h));
        }
      );

      toast.success("History updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update history: ${error.message}`);
    },
  });
}

export function useCreatePatientHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, historyData }) => {
      const { data, error } = await supabase
        .from("patient_histories")
        .insert({ patient_id: patientId, ...historyData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      // Add the new history to the cache
      queryClient.setQueryData(
        ["patient-histories", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("History added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add history: ${error.message}`);
    },
  });
}

export function useDeletePatientHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ historyId, patientId }) => {
      const { error } = await supabase
        .from("patient_histories")
        .delete()
        .eq("id", historyId);

      if (error) {
        throw new Error(error.message);
      }

      return historyId;
    },
    onSuccess: (historyId, variables) => {
      queryClient.setQueryData(
        ["patient-histories", variables.patientId],
        (old) => {
          return old ? old.filter((h) => h.id !== historyId) : old;
        }
      );

      toast.success("History deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete history: ${error.message}`);
    },
  });
}

// Chemotherapy mutations
export function useUpdateChemotherapy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ chemoId, field, value }) => {
      // Handle bulk updates if field is 'all'
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_previous_chemotherapy")
        .update(updateData)
        .eq("id", chemoId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-previous-chemotherapy", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((c) => (c.id === variables.chemoId ? data : c));
        }
      );

      toast.success("Chemotherapy updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update chemotherapy: ${error.message}`);
    },
  });
}

export function useCreateChemotherapy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, chemoData }) => {
      const { data, error } = await supabase
        .from("patient_previous_chemotherapy")
        .insert({ patient_id: patientId, ...chemoData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-previous-chemotherapy", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Chemotherapy added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add chemotherapy: ${error.message}`);
    },
  });
}

export function useDeleteChemotherapy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ chemoId, patientId }) => {
      const { error } = await supabase
        .from("patient_previous_chemotherapy")
        .delete()
        .eq("id", chemoId);

      if (error) {
        throw new Error(error.message);
      }

      return chemoId;
    },
    onSuccess: (chemoId, variables) => {
      queryClient.setQueryData(
        ["patient-previous-chemotherapy", variables.patientId],
        (old) => {
          return old ? old.filter((c) => c.id !== chemoId) : old;
        }
      );

      toast.success("Chemotherapy deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete chemotherapy: ${error.message}`);
    },
  });
}

// Radiotherapy mutations
export function useUpdateRadiotherapy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ radioId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_previous_radiotherapy")
        .update(updateData)
        .eq("id", radioId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-previous-radiotherapy", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((r) => (r.id === variables.radioId ? data : r));
        }
      );

      toast.success("Radiotherapy updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update radiotherapy: ${error.message}`);
    },
  });
}

export function useCreateRadiotherapy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, radioData }) => {
      const { data, error } = await supabase
        .from("patient_previous_radiotherapy")
        .insert({ patient_id: patientId, ...radioData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-previous-radiotherapy", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Radiotherapy added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add radiotherapy: ${error.message}`);
    },
  });
}

export function useDeleteRadiotherapy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ radioId, patientId }) => {
      const { error } = await supabase
        .from("patient_previous_radiotherapy")
        .delete()
        .eq("id", radioId);

      if (error) {
        throw new Error(error.message);
      }

      return radioId;
    },
    onSuccess: (radioId, variables) => {
      queryClient.setQueryData(
        ["patient-previous-radiotherapy", variables.patientId],
        (old) => {
          return old ? old.filter((r) => r.id !== radioId) : old;
        }
      );

      toast.success("Radiotherapy deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete radiotherapy: ${error.message}`);
    },
  });
}

// Surgery mutations
export function useUpdateSurgery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ surgeryId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_previous_surgeries")
        .update(updateData)
        .eq("id", surgeryId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-previous-surgeries", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((s) => (s.id === variables.surgeryId ? data : s));
        }
      );

      toast.success("Surgery updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update surgery: ${error.message}`);
    },
  });
}

export function useCreateSurgery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, surgeryData }) => {
      const { data, error } = await supabase
        .from("patient_previous_surgeries")
        .insert({ patient_id: patientId, ...surgeryData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-previous-surgeries", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Surgery added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add surgery: ${error.message}`);
    },
  });
}

export function useDeleteSurgery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ surgeryId, patientId }) => {
      const { error } = await supabase
        .from("patient_previous_surgeries")
        .delete()
        .eq("id", surgeryId);

      if (error) {
        throw new Error(error.message);
      }

      return surgeryId;
    },
    onSuccess: (surgeryId, variables) => {
      queryClient.setQueryData(
        ["patient-previous-surgeries", variables.patientId],
        (old) => {
          return old ? old.filter((s) => s.id !== surgeryId) : old;
        }
      );

      toast.success("Surgery deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete surgery: ${error.message}`);
    },
  });
}

// Medication mutations
export function useUpdateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ medicationId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_concomitant_medications")
        .update(updateData)
        .eq("id", medicationId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-concomitant-medications", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((m) => (m.id === variables.medicationId ? data : m));
        }
      );

      toast.success("Medication updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update medication: ${error.message}`);
    },
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, medicationData }) => {
      const { data, error } = await supabase
        .from("patient_concomitant_medications")
        .insert({ patient_id: patientId, ...medicationData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-concomitant-medications", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Medication added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add medication: ${error.message}`);
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ medicationId, patientId }) => {
      const { error } = await supabase
        .from("patient_concomitant_medications")
        .delete()
        .eq("id", medicationId);

      if (error) {
        throw new Error(error.message);
      }

      return medicationId;
    },
    onSuccess: (medicationId, variables) => {
      queryClient.setQueryData(
        ["patient-concomitant-medications", variables.patientId],
        (old) => {
          return old ? old.filter((m) => m.id !== medicationId) : old;
        }
      );

      toast.success("Medication deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete medication: ${error.message}`);
    },
  });
}

// Baseline mutations
export function useCreateBaseline() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, baselineData }) => {
      const { data, error } = await supabase
        .from("patient_baselines")
        .insert({ patient_id: patientId, ...baselineData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-baselines", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Baseline added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add baseline: ${error.message}`);
    },
  });
}

export function useUpdateBaseline() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ baselineId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_baselines")
        .update(updateData)
        .eq("id", baselineId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Update baseline in cache
      queryClient.setQueryData(["baseline", variables.baselineId], data);

      // Update baselines list
      queryClient.setQueryData(
        ["patient-baselines", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((b) => (b.id === variables.baselineId ? data : b));
        }
      );

      toast.success("Baseline updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update baseline: ${error.message}`);
    },
  });
}

export function useDeleteBaseline() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ baselineId, patientId }) => {
      const { error } = await supabase
        .from("patient_baselines")
        .delete()
        .eq("id", baselineId);

      if (error) {
        throw new Error(error.message);
      }

      return baselineId;
    },
    onSuccess: (baselineId, variables) => {
      queryClient.setQueryData(
        ["patient-baselines", variables.patientId],
        (old) => {
          return old ? old.filter((b) => b.id !== baselineId) : old;
        }
      );

      toast.success("Baseline deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete baseline: ${error.message}`);
    },
  });
}

// Tumor mutations
export function useUpdateTumor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tumorId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("baseline_tumors")
        .update(updateData)
        .eq("id", tumorId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["baseline-tumors", data.baseline_id], (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === variables.tumorId ? data : t));
      });

      toast.success("Tumor updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update tumor: ${error.message}`);
    },
  });
}

export function useCreateTumor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ baselineId, tumorData }) => {
      const { data, error } = await supabase
        .from("baseline_tumors")
        .insert({ baseline_id: baselineId, ...tumorData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["baseline-tumors", data.baseline_id], (old) => {
        return old ? [data, ...old] : [data];
      });

      toast.success("Tumor added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add tumor: ${error.message}`);
    },
  });
}

export function useDeleteTumor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tumorId, baselineId }) => {
      const { error } = await supabase
        .from("baseline_tumors")
        .delete()
        .eq("id", tumorId);

      if (error) {
        throw new Error(error.message);
      }

      return tumorId;
    },
    onSuccess: (tumorId, variables) => {
      queryClient.setQueryData(
        ["baseline-tumors", variables.baselineId],
        (old) => {
          return old ? old.filter((t) => t.id !== tumorId) : old;
        }
      );

      toast.success("Tumor deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete tumor: ${error.message}`);
    },
  });
}

// NEW: Follow-up mutations
export function useCreateFollowup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, followupData }) => {
      const { data, error } = await supabase
        .from("patient_followups")
        .insert({ patient_id: patientId, ...followupData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-followups", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Follow-up added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add follow-up: ${error.message}`);
    },
  });
}

export function useUpdateFollowup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ followupId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_followups")
        .update(updateData)
        .eq("id", followupId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-followups", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((f) => (f.id === variables.followupId ? data : f));
        }
      );

      toast.success("Follow-up updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update follow-up: ${error.message}`);
    },
  });
}

export function useDeleteFollowup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ followupId, patientId }) => {
      const { error } = await supabase
        .from("patient_followups")
        .delete()
        .eq("id", followupId);

      if (error) {
        throw new Error(error.message);
      }

      return followupId;
    },
    onSuccess: (followupId, variables) => {
      queryClient.setQueryData(
        ["patient-followups", variables.patientId],
        (old) => {
          return old ? old.filter((f) => f.id !== followupId) : old;
        }
      );

      toast.success("Follow-up deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete follow-up: ${error.message}`);
    },
  });
}

// NEW: Lab results mutations
export function useCreateLabResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, labData }) => {
      const { data, error } = await supabase
        .from("patient_lab_results")
        .insert({ patient_id: patientId, ...labData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-lab-results", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Lab result added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add lab result: ${error.message}`);
    },
  });
}

export function useUpdateLabResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ labId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_lab_results")
        .update(updateData)
        .eq("id", labId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-lab-results", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((l) => (l.id === variables.labId ? data : l));
        }
      );

      toast.success("Lab result updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update lab result: ${error.message}`);
    },
  });
}

export function useDeleteLabResult() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ labId, patientId }) => {
      const { error } = await supabase
        .from("patient_lab_results")
        .delete()
        .eq("id", labId);

      if (error) {
        throw new Error(error.message);
      }

      return labId;
    },
    onSuccess: (labId, variables) => {
      queryClient.setQueryData(
        ["patient-lab-results", variables.patientId],
        (old) => {
          return old ? old.filter((l) => l.id !== labId) : old;
        }
      );

      toast.success("Lab result deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete lab result: ${error.message}`);
    },
  });
}

// NEW: Molecular test mutations
export function useCreateMolecularTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, testData }) => {
      const { data, error } = await supabase
        .from("patient_molecular_tests")
        .insert({ patient_id: patientId, ...testData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-molecular-tests", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Molecular test added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add molecular test: ${error.message}`);
    },
  });
}

export function useUpdateMolecularTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ testId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_molecular_tests")
        .update(updateData)
        .eq("id", testId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-molecular-tests", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((t) => (t.id === variables.testId ? data : t));
        }
      );

      toast.success("Molecular test updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update molecular test: ${error.message}`);
    },
  });
}

export function useDeleteMolecularTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ testId, patientId }) => {
      const { error } = await supabase
        .from("patient_molecular_tests")
        .delete()
        .eq("id", testId);

      if (error) {
        throw new Error(error.message);
      }

      return testId;
    },
    onSuccess: (testId, variables) => {
      queryClient.setQueryData(
        ["patient-molecular-tests", variables.patientId],
        (old) => {
          return old ? old.filter((t) => t.id !== testId) : old;
        }
      );

      toast.success("Molecular test deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete molecular test: ${error.message}`);
    },
  });
}

// NEW: Imaging study mutations
export function useCreateImagingStudy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, imagingData }) => {
      const { data, error } = await supabase
        .from("patient_imaging_studies")
        .insert({ patient_id: patientId, ...imagingData })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-imaging-studies", data.patient_id],
        (old) => {
          return old ? [data, ...old] : [data];
        }
      );

      toast.success("Imaging study added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add imaging study: ${error.message}`);
    },
  });
}

export function useUpdateImagingStudy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ imagingId, field, value }) => {
      const updateData = field === "all" ? value : { [field]: value };

      const { data, error } = await supabase
        .from("patient_imaging_studies")
        .update(updateData)
        .eq("id", imagingId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["patient-imaging-studies", data.patient_id],
        (old) => {
          if (!old) return old;
          return old.map((i) => (i.id === variables.imagingId ? data : i));
        }
      );

      toast.success("Imaging study updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update imaging study: ${error.message}`);
    },
  });
}

export function useDeleteImagingStudy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ imagingId, patientId }) => {
      const { error } = await supabase
        .from("patient_imaging_studies")
        .delete()
        .eq("id", imagingId);

      if (error) {
        throw new Error(error.message);
      }

      return imagingId;
    },
    onSuccess: (imagingId, variables) => {
      queryClient.setQueryData(
        ["patient-imaging-studies", variables.patientId],
        (old) => {
          return old ? old.filter((i) => i.id !== imagingId) : old;
        }
      );

      toast.success("Imaging study deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete imaging study: ${error.message}`);
    },
  });
}

// Baseline Tumor mutations
export const useCreateBaselineTumor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ baselineId, tumorData }) => {
      const response = await fetch(
        `${API_BASE_URL}/baselines/${baselineId}/tumors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tumorData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create tumor");
      }

      return response.json();
    },
    onSuccess: (_, { baselineId }) => {
      queryClient.invalidateQueries({
        queryKey: ["baseline-tumors", baselineId],
      });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Tumor added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add tumor: ${error.message}`);
    },
  });
};

export const useUpdateBaselineTumor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tumorId, field, value }) => {
      const response = await fetch(`${API_BASE_URL}/tumors/${tumorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update tumor");
      }

      return response.json();
    },
    onSuccess: (data, { tumorId }) => {
      // Get baseline_id from the updated tumor to invalidate the right query
      const tumor = data.tumor;
      if (tumor?.baseline_id) {
        queryClient.invalidateQueries({
          queryKey: ["baseline-tumors", tumor.baseline_id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Tumor updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update tumor: ${error.message}`);
    },
  });
};

export const useDeleteBaselineTumor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tumorId, baselineId }) => {
      const response = await fetch(`${API_BASE_URL}/tumors/${tumorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete tumor");
      }

      return response.json();
    },
    onSuccess: (_, { baselineId }) => {
      queryClient.invalidateQueries({
        queryKey: ["baseline-tumors", baselineId],
      });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Tumor deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete tumor: ${error.message}`);
    },
  });
};
