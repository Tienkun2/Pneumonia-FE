"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Loader2 } from "lucide-react";
import { User as UserType } from "@/types/user";

interface ProfileHeaderProps {
  user: UserType;
  optimisticAvatar: string | null;
  isUploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({ user, optimisticAvatar, isUploadingAvatar, onAvatarUpload }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-slate-900 dark:to-slate-950 p-6 text-foreground shadow-sm transition-all">
      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-40" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <div className="relative flex flex-col items-center gap-6 md:flex-row">
        <div className="group relative">
          <div className="relative overflow-hidden rounded-full border-4 border-card shadow-xl transition-transform duration-500 group-hover:scale-105 h-24 w-24 bg-card">
            <Avatar className="h-full w-full">
              <AvatarImage src={optimisticAvatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
              <AvatarFallback className="bg-primary/10 dark:bg-white/20 text-2xl font-bold uppercase text-primary dark:text-white">
                {user.username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Loading Overlay */}
            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Uploading</span>
                </div>
              </div>
            )}
          </div>

          <label
            htmlFor="avatar-upload"
            className={`absolute bottom-0 right-0 rounded-full bg-background p-2 text-primary shadow-lg ring-2 ring-primary cursor-pointer hover:bg-muted transition-all active:scale-90 ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Camera className="h-5 w-5" />
            <input
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onAvatarUpload}
              disabled={isUploadingAvatar}
            />
          </label>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground transition-colors">
            {user.displayName || user.username}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 md:justify-start">
            <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground backdrop-blur-md">
              <User className="h-3.5 w-3.5" />
              @{user.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
