import { useQuery } from "@tanstack/react-query";
import { getPatientById } from "../services/patient.service";

export const usePatient = (id: number) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });
};
