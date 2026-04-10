import { PatientDetail } from "@/features/patients/patient-detail";

interface PatientDetailPageProps {
  params: {
    id: string;
  };
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  return <PatientDetail patientId={params.id} />;
}
