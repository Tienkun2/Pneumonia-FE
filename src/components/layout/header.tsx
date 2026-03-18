"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { logoutThunk } from "@/store/slices/auth-slice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";

export function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const breadcrumbs = useBreadcrumb();

  const displayName = "Bác sĩ";
  const displayEmail = "bacsi@phoinhidong.com";

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk());
      toast.success("Đăng xuất thành công");
      router.push("/auth/login");
    } catch (e) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-white px-6 border-b border-gray-200">
      
      {/* Breadcrumbs (Left) */}
      <nav className="flex items-center text-sm font-medium text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <div key={crumb.href} className="flex items-center">
              {isLast ? (
                <span className="text-gray-900 line-clamp-1">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-900 transition-colors line-clamp-1"
                >
                  {crumb.label}
                </Link>
              )}
              {!isLast && <span className="mx-2 text-gray-400">/</span>}
            </div>
          );
        })}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-6">
        {/* Search */}
        <div className="flex items-center gap-4 max-w-sm hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm bệnh nhi..."
              className="w-full pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 h-9"
            />
          </div>
        </div>

        {/* Date */}
        <div className="hidden flex-col items-end text-sm md:flex">
          <span className="font-medium text-gray-700 capitalize">
            {currentDate}
          </span>
          <span className="text-xs text-gray-500">
            Phòng khám Phổi Nhi Đồng
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-600 hover:text-blue-600"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-10 w-10 rounded-full border border-gray-200">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-gray-500">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem>Hồ sơ cá nhân</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt hệ thống</DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:bg-red-50 cursor-pointer"
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}