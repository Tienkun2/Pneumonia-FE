import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VisitService } from "@/services/visit-service";
import { CreateVisitPayload } from "@/types/visit";

export const usePatientVisits = (patientId: string) => {
  return useQuery({
    queryKey: ["visits", patientId],
    queryFn: () => VisitService.getPatientVisits(patientId),
    enabled: !!patientId,
  });
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVisitPayload) => VisitService.createVisit(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visits", variables.patientId] });
    },
  });
};
