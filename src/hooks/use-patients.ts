import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PatientService } from "@/services/patient-service";
import { CreatePatientPayload } from "@/types/patient";

export const usePatients = (page: number, size: number) => {
  return useQuery({
    queryKey: ["patients", page, size],
    queryFn: () => PatientService.getPatients(page, size),
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => PatientService.getPatientById(id),
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => PatientService.createPatient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
