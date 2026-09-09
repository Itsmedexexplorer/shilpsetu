import type { ReactNode } from "react";

export function PhoneCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-ivory lg:flex lg:items-center lg:justify-center lg:gap-16 lg:bg-forest-deep lg:px-16 lg:py-14">
      <aside className="hidden max-w-xl lg:block">
        <div className="motif-band mb-8 h-1.5 w-28 rounded-full" />
        <h1 className="font-display text-[4rem] leading-[0.95] font-extrabold text-ivory">
          SHILPSETU <span className="text-terracotta">AI</span>
        </h1>
        <p className="mt-5 text-xl text-ivory/75">
          From Craft to Commerce in 60 Seconds.
        </p>
        <p className="mt-6 max-w-md text-ivory/55">
          We are not building another marketplace. We are building the AI layer that
          makes an artisan marketplace-ready.
        </p>
        <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-ivory/80">
          {[
            ["Photo", "Studio-grade in seconds"],
            ["Voice", "No typing required"],
            ["Price", "Fair, explainable"],
          ].map(([t, s]) => (
            <div key={t} className="border-t-2 border-terracotta/60 pt-3">
              <p className="font-display text-lg font-extrabold">{t}</p>
              <p className="mt-1 text-xs opacity-70">{s}</p>
            </div>
          ))}
        </div>
      </aside>

      <div className="lg:rounded-[3rem] lg:border lg:border-white/15 lg:bg-black/40 lg:p-3 lg:shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="relative min-h-[100dvh] w-full overflow-hidden bg-ivory lg:h-[860px] lg:max-h-[86vh] lg:min-h-0 lg:w-[400px] lg:rounded-[2.4rem]">
          <div className="flex min-h-[100dvh] flex-col lg:h-full lg:min-h-0 lg:overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
