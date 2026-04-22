"use client";

import { useDevices } from "@/hooks/use-devices";
import { DeviceItem } from "./components/device-item";
import { ManagementUserTable } from "@/components/users/management-user-table";
import { PageHeader } from "@/components/layout/page-header";
import { Smartphone, Search, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { User } from "@/types/user";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { USER_COLUMN_LABELS, USER_STATUS } from "@/constants/user";
import { useManagementUserTable } from "@/hooks/use-management-user-table";

export function UserDevicesAdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get("userId");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: usersPage, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users-for-devices"],
    queryFn: () => UserService.getUsers(1, 100),
  });

  const users = useMemo(() => usersPage?.data || [], [usersPage?.data]);

  // Sync selectedUser with URL param
  useEffect(() => {
    if (userIdFromUrl && users.length > 0) {
      const user = users.find(u => u.id === userIdFromUrl);
      if (user) setSelectedUser(user);
    } else if (!userIdFromUrl) {
      setSelectedUser(null);
    }
  }, [userIdFromUrl, users]);

  const handleSelectUser = (user: User | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (user) {
      params.set("userId", user.id);
    } else {
      params.delete("userId");
    }
    router.push(`?${params.toString()}`);
  };

  const { devices, isLoading: isDevicesLoading, revokeDevice, isRevoking } = useDevices(selectedUser?.id);

  const {
      table,
      columns,
      globalFilter,
      setGlobalFilter,
  } = useManagementUserTable({
      data: users,
      onSelectUser: (user) => handleSelectUser(user),
      countField: "deviceCount",
      countLabel: "Số thiết bị",
      countIcon: Smartphone,
      actionLabel: "Quản lý thiết bị"
  });

  return (
    <div className="space-y-5 pb-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader 
        title={selectedUser ? `Thiết bị của: ${selectedUser.displayName}` : "Quản lý thiết bị"} 
        icon={Smartphone}
      >
        {selectedUser && (
          <Button 
            variant="outline" 
            onClick={() => handleSelectUser(null)}
            className="h-9 rounded-xl font-bold border-border bg-card shadow-sm gap-2"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            QUAY LẠI
          </Button>
        )}
      </PageHeader>

      {!selectedUser ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                <input 
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Tìm kiếm người dùng..."
                    className="h-9 w-full rounded-xl border border-border/50 bg-card pl-9 pr-4 text-[13px] font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
             </div>

             <div className="flex items-center gap-3">
                <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Trạng thái"
                    options={[
                        { label: "Đang hoạt động", value: USER_STATUS.ACTIVE },
                        { label: "Chờ xác nhận", value: USER_STATUS.INACTIVE },
                    ]}
                />
                <DataTableViewOptions
                    table={table}
                    columnLabels={USER_COLUMN_LABELS}
                />
             </div>
          </div>

          <ManagementUserTable
            table={table} 
            columns={columns} 
            isLoading={isUsersLoading} 
          />
        </div>
      ) : (
        <div className="space-y-4">
           {isDevicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[100px] w-full rounded-2xl bg-card border border-border/50" />
                ))}
              </div>
           ) : devices.length === 0 ? (
            <div className="bg-card/40 backdrop-blur-md rounded-[32px] border border-dashed border-border/60 p-24 text-center">
               <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="h-8 w-8 text-primary/20" />
               </div>
               <h3 className="text-base font-bold mb-1 text-foreground">Chưa có thiết bị nào</h3>
               <p className="text-[13px] font-medium text-muted-foreground max-w-sm mx-auto italic">Người dùng này chưa thực hiện đăng nhập trên thiết bị nào hoặc các phiên đã hết hạn.</p>
            </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {devices.map((device) => (
                  <DeviceItem 
                    key={device.id} 
                    device={device} 
                    onDelete={revokeDevice} 
                    isDeleting={isRevoking}
                  />
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
}
