import { RolePermissionView } from "@/features/roles/role-permission-view";

interface RolePermissionsPageProps {
  params: {
    name: string;
  };
}

export default function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  const roleName = decodeURIComponent(params.name);
  
  return <RolePermissionView roleName={roleName} />;
}
