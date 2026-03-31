import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  X, 
  RefreshCcw, 
  Maximize, 
  SlidersHorizontal,
  Download,
  Search
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageViewerProps {
  readonly src?: string;
  readonly alt?: string;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

export function ImageViewer({
  src,
  alt = "Medical image",
  open,
  onOpenChange,
}: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isNegative, setIsNegative] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!src) return null;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setIsNegative(false);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `XRAY_${new Date().getTime()}.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-hidden border-none bg-black">
        <DialogHeader className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 flex flex-row items-center justify-between pointer-events-none">
          <DialogTitle className="text-white font-bold tracking-tight flex items-center gap-2 pointer-events-auto">
            <Search className="h-5 w-5 text-blue-400" />
            Trình xem ảnh X-Quang chuyên dụng
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange?.(false)}
            className="text-white hover:bg-white/10 rounded-full pointer-events-auto"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="relative flex h-full items-center justify-center overflow-hidden cursor-move">
          <div
            className="relative transition-all duration-200 ease-out"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${isNegative ? 'invert(1)' : ''}`,
              width: "80%",
              height: "80%",
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          
          {/* DICOM Overlay Info */}
          <div className="absolute top-20 left-6 text-emerald-400 font-mono text-xs space-y-1 pointer-events-none opacity-70">
            <p>NAME: ANONYMOUS</p>
            <p>STUDY: CHEST X-RAY</p>
            <p>MODE: DIGITAL RADIOGRAPHY</p>
            <p>ZOOM: {Math.round(zoom * 100)}%</p>
          </div>
          
          <div className="absolute bottom-24 right-6 text-emerald-400 font-mono text-xs text-right pointer-events-none opacity-70">
             <p>B: {brightness}% | C: {contrast}%</p>
             <p>{isNegative ? "MODE: NEGATIVE" : "MODE: STANDARD"}</p>
          </div>
        </div>

        {/* Professional Controls Bar */}
        <TooltipProvider>
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Adjustment Sliders */}
            <div className="flex gap-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
               <div className="flex flex-col gap-2 min-w-[120px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ sáng</span>
                  <Slider 
                    value={[brightness]} 
                    min={50} 
                    max={200} 
                    onValueChange={([v]) => setBrightness(v)}
                    className="w-full"
                  />
               </div>
               <div className="w-px h-8 bg-white/10 self-center" />
               <div className="flex flex-col gap-2 min-w-[120px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ tương phản</span>
                  <Slider 
                    value={[contrast]} 
                    min={50} 
                    max={200} 
                    onValueChange={([v]) => setContrast(v)}
                  />
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl self-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/10 h-10 w-10">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thu nhỏ</TooltipContent>
              </Tooltip>

              <div className="px-2 text-xs font-bold text-blue-400 min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/10 h-10 w-10">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Phóng to</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-white/10 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsNegative(!isNegative)} 
                    className={`h-10 w-10 ${isNegative ? 'text-blue-400 bg-blue-500/10' : 'text-white hover:bg-white/10'}`}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Âm bản</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleRotate} className="text-white hover:bg-white/10 h-10 w-10">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xoay 90°</TooltipContent>
              </Tooltip>

              <div className="w-px h-5 bg-white/10 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={downloadImage} className="text-white hover:bg-white/10 h-10 w-10">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tải ảnh gốc</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleReset} className="text-red-400 hover:bg-red-500/10 h-10 w-10">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Đặt lại</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>

        {/* Toggle Controls Visibility */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowControls(!showControls)}
          className="absolute bottom-6 right-6 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
