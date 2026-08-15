import { cn } from "@/lib/utils";

/**
 * Seifecon brand mark — the official emblem from the Seifecon logo
 * (green house with energy-label bars and leaf, transparent background).
 * Lives at /public/logo-mark.png (raster) and /public/logo-mark.svg (vector).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt="Seifecon"
      className={cn(
        "h-12 w-auto shrink-0 drop-shadow-[0_0_14px_rgba(46,204,113,0.35)]",
        className,
      )}
    />
  );
}

export function Logo({
  className,
  withText = true,
  taglineClass = "hidden sm:block",
}: {
  className?: string;
  withText?: boolean;
  /** Visibility classes for the tagline; the navbar hides it on smaller screens. */
  taglineClass?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-[0.02em] text-foreground">
            Seif<span className="text-emerald">econ</span>
          </span>
          <span
            className={cn(
              "mt-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-muted",
              taglineClass,
            )}
          >
            Duurzaam bouwen. Slim besparen.
          </span>
        </span>
      )}
    </span>
  );
}
