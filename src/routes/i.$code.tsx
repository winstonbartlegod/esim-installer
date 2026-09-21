import { createFileRoute, Link } from "@tanstack/react-router";
import { InstallCard } from "@/components/install-card";
import { SimMark } from "@/components/sim-mark";
import { APP_NAME } from "@/lib/brand";
import { decodeShareCode, parseLpa } from "@/lib/lpa";

export const Route = createFileRoute("/i/$code")({
  component: InstallPage,
});

function InstallPage() {
  const { code } = Route.useParams();
  const raw = decodeShareCode(code);
  const profile = raw ? parseLpa(raw) : null;

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-14 max-w-lg items-center justify-between gap-3 px-4 py-2">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-fg">
            <SimMark size={28} className="shrink-0" />
            <span className="text-sm font-semibold leading-tight tracking-tight">{APP_NAME}</span>
          </Link>
          <Link to="/" className="shrink-0 text-sm text-muted hover:text-fg">
            Do another one
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {profile ? (
          <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
            <InstallCard profile={profile} />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-6">
            <h1 className="text-xl font-medium text-fg">This link isn’t valid</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              I couldn’t read an eSIM profile from the URL. Go back and drop the original QR again.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
            >
              Back
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
