import { redirect } from "next/navigation";

export default function MedicalPage() {
  redirect("/medical/patient-mgmt/patient-list");
}
