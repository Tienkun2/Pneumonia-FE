import { RolePermissionView } from "@/features/roles/role-permission-view";

interface RolePermissionsPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  const resolvedParams = await params;
  const roleName = decodeURIComponent(resolvedParams.name);
  
  return <RolePermissionView roleName={roleName} />;
}
