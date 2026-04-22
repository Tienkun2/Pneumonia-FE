"use client";

import { useUserSessions } from "@/hooks/use-user-sessions";
import { ManagementUserTable } from "@/components/users/management-user-table";
import { PageHeader } from "@/components/layout/page-header";
import { History, Search, ArrowLeft, Layers } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { User } from "@/types/user";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { USER_COLUMN_LABELS, USER_STATUS } from "@/constants/user";
import { SessionTable } from "./components/session-table";
import { useManagementUserTable } from "@/hooks/use-management-user-table";

export function UserSessionsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get("userId");
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sessionPage, setSessionPage] = useState(pageFromUrl);

  const { data: usersPage, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users-for-sessions"],
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
      params.set("page", "1"); // Reset page when changing user
      setSessionPage(1);
    } else {
      params.delete("userId");
      params.delete("page");
    }
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    setSessionPage(newPage);
    router.push(`?${params.toString()}`);
  };

  const { 
    sessions, 
    totalPages,
    isLoading: isSessionsLoading, 
    revokeSession, 
    isRevoking 
  } = useUserSessions(selectedUser?.id, sessionPage, 10);

  const {
      table,
      columns,
      globalFilter,
      setGlobalFilter,
  } = useManagementUserTable({
      data: users,
      onSelectUser: (user) => handleSelectUser(user),
      countField: "sessionCount",
      countLabel: "Tổng phiên",
      countIcon: Layers,
      actionLabel: "Quản lý phiên"
  });

  return (
    <div className="space-y-5 pb-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PageHeader 
        title={selectedUser ? `Lịch sử: ${selectedUser.displayName}` : "Lịch sử hoạt động"} 
        icon={History}
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
          <SessionTable 
             sessions={sessions} 
             onRevoke={(id) => revokeSession(id)}
             isRevoking={isRevoking}
             isLoading={isSessionsLoading}
             currentPage={sessionPage}
             totalPages={totalPages}
             onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
