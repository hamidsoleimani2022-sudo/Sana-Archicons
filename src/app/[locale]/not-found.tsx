import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <span className="text-7xl font-extrabold text-gradient">404</span>
      <p className="mt-4 text-muted">Pagina niet gevonden / Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-ink"
      >
        Home
      </Link>
    </div>
  );
}
