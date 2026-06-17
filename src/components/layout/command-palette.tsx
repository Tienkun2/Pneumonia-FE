"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutThunk } from "@/store/slices/auth-slice";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  BookOpen,
  Settings,
  User,
  PlusCircle,
  ArrowLeftRight,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

export function CommandPalette() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { patients } = useAppSelector((state) => state.patient);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tìm kiếm nhanh hoặc dùng lệnh... (Ctrl + K)" />
      <CommandList className="max-h-[450px]">
        <CommandEmpty>Không tìm thấy kết quả nào.</CommandEmpty>
        
        {/* Navigation Group */}
        <CommandGroup heading="Truy cập nhanh">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>Ctrl+D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/medical/patient-mgmt/patient-list"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Quản lý Bệnh nhân</span>
            <CommandShortcut>Ctrl+P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/medical/ai-diagnosis"))}>
            <Stethoscope className="mr-2 h-4 w-4" />
            <span>Thực hiện Chẩn đoán</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/medical/ai-diagnosis/history"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Lịch sử Kết quả</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/medical/ai-diagnosis/comparison"))}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            <span>So sánh Tiến triển</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/knowledge"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Thư viện Kiến thức</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Dynamic Search Results */}
        {patients.length > 0 && (
           <CommandGroup heading="Bệnh nhân gần đây">
              {patients.slice(0, 5).map(p => (
                 <CommandItem key={p.id} onSelect={() => runCommand(() => router.push(`/medical/patient-mgmt/patient-list/${p.id}`))}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{p.fullName}</span>
                    <CommandShortcut className="text-[10px]">{p.code}</CommandShortcut>
                 </CommandItem>
              ))}
           </CommandGroup>
        )}

        <CommandSeparator />

        {/* Action Group */}
        <CommandGroup heading="Hành động & Cài đặt">
          <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/system/settings/config"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Cấu hình hệ thống</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            router.push("/medical/patient-mgmt/patient-list");
            toast.info("Vui lòng nhấn nút 'Thêm bệnh nhân' tại trang quản lý.");
          })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Thêm bệnh nhân mới</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            const next = theme === "dark" ? "light" : "dark";
            setTheme(next);
            toast.success(next === "dark" ? "Đã chuyển sang Dark Mode" : "Đã chuyển sang Light Mode");
          })}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === "dark" ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* System Group */}
        <CommandGroup heading="Tài khoản">
           <CommandItem onSelect={() => runCommand(async () => {
              await dispatch(logoutThunk());
              router.push("/auth/login");
              toast.success("Đã đăng xuất");
           })}>
            <LogOut className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-red-500">Đăng xuất khỏi hệ thống</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
