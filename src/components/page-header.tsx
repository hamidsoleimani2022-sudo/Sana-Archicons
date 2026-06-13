export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line/50">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-emerald/15 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:py-20">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-muted">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
