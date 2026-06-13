import { cn } from "@/lib/utils";

/**
 * Sana Archicons brand mark — the actual emblem from the brand guide
 * (circuit "S", building outlines and AI chip), background made transparent.
 * Lives at /public/logo-mark.png.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt="Sana Archicons"
      className={cn("h-11 w-auto shrink-0", className)}
    />
  );
}

export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-tight text-foreground">
            SANA <span className="text-emerald">ARCHICONS</span>
          </span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-muted">
            Bouw · Energie · AI Consultancy
          </span>
        </span>
      )}
    </span>
  );
}
