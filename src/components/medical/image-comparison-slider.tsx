"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageComparisonSliderProps {
  readonly imageA: string; // Left image (underneath or clipped)
  readonly imageB: string; // Right image (top, clipped)
  readonly labelA?: string;
  readonly labelB?: string;
  readonly className?: string;
  readonly aspectRatio?: "square" | "video" | "auto";
}

export function ImageComparisonSlider({
  imageA,
  imageB,
  labelA = "Ảnh gốc",
  labelB = "Bản đồ nhiệt AI",
  className,
  aspectRatio = "auto",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up event listeners on window to ensure smooth dragging even if pointer leaves container
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden select-none border border-border/40 rounded-2xl bg-slate-950 w-full group",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && "aspect-[16/9]",
        aspectRatio === "auto" && "aspect-[4/3]",
        className
      )}
    >
      {/* Image B: Right / Background (Shows when slider moves left) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageB}
          alt={labelB}
          fill
          className="object-contain"
          unoptimized
        />
        {/* Right Label Badge */}
        <div
          className={cn(
            "absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-opacity duration-350 pointer-events-none",
            isDragging ? "opacity-20" : "opacity-100"
          )}
        >
          {labelB}
        </div>
      </div>

      {/* Image A: Left / Foreground (Clipped overlay) */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={imageA}
          alt={labelA}
          fill
          className="object-contain"
          unoptimized
        />
        {/* Left Label Badge */}
        <div
          className={cn(
            "absolute bottom-4 left-4 z-20 bg-primary/80 backdrop-blur-md text-primary-foreground px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-opacity duration-350 pointer-events-none",
            isDragging ? "opacity-20" : "opacity-100"
          )}
        >
          {labelA}
        </div>
      </div>

      {/* Divider Line & Handle */}
      <div
        className="absolute inset-y-0 z-30 w-[2px] bg-white cursor-ew-resize flex items-center justify-center pointer-events-auto"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Glowing aura around divider */}
        <div className="absolute inset-y-0 -left-1.5 -right-1.5 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Drag Handle Button */}
        <div
          className={cn(
            "w-9 h-9 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl transition-transform duration-200 active:scale-95 pointer-events-none",
            isDragging ? "scale-110 border-primary" : "group-hover:scale-105"
          )}
        >
          <MoveHorizontal className={cn("h-4 w-4 transition-colors", isDragging ? "text-primary" : "text-white")} />
        </div>
      </div>

      {/* Click-to-move overlay */}
      <div
        className="absolute inset-0 z-0 cursor-ew-resize"
        onClick={(e) => handleMove(e.clientX)}
      />
    </div>
  );
}
