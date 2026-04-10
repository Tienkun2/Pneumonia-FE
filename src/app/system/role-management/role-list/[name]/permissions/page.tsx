import { RolePermissionView } from "@/features/roles/role-permission-view";

interface RolePermissionsPageProps {
  params: {
    name: string;
  };
}

export default function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  // name is URL encoded, need to decode it for better display if needed
  const roleName = decodeURIComponent(params.name);
  
  return <RolePermissionView roleName={roleName} />;
}
