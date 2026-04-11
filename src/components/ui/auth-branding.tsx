import Image from "next/image";

export default function AuthBranding() {
  return (
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(199,89%,48%)] to-[hsl(222.2,47.4%,20%)] opacity-95" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl opacity-30" />

        <Image
          src="/images/background_new.png"
          alt="Medical background"
          fill
          className="object-cover opacity-10 mix-blend-overlay"
          priority
        />
      </div>
      <div className="relative z-20 flex items-center gap-4 text-lg font-medium">
        <div className="h-12 w-12 bg-white rounded-xl p-1.5 shadow-2xl border border-white/20 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-100" />
          <Image 
            src="/images/PlumoX_Logo.png" 
            alt="PlumoX Logo" 
            fill 
            className="object-contain p-1 relative z-10"
            unoptimized
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-black leading-none tracking-tighter uppercase drop-shadow-sm">PlumoX</h1>
          <p className="text-[9px] text-blue-100/60 font-bold tracking-[0.2em] mt-1.5 leading-none">
            HỆ THỐNG CHẨN ĐOÁN THÔNG MINH
          </p>
        </div>
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-4">
          <p className="text-xl font-light italic leading-relaxed text-blue-50/90 max-w-md">
            &ldquo;Tận tâm chăm sóc sức khỏe hô hấp cho mọi thế hệ. Hệ thống hỗ trợ bác sĩ đưa ra quyết định chẩn đoán chính xác và kịp thời.&rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  );
}
