import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Composer } from "@/components/composer";
import { InstallCard } from "@/components/install-card";
import { SimMark } from "@/components/sim-mark";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/brand";
import { parseLpa, type LpaProfile } from "@/lib/lpa";
import { loadHistory, pushHistory, type HistoryEntry } from "@/lib/history";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [profile, setProfile] = useState<LpaProfile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const onProfile = useCallback((next: LpaProfile) => {
    setProfile(next);
    setHistory(pushHistory(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-fg">
            <SimMark size={28} className="shrink-0" />
            <span className="text-sm font-semibold leading-tight tracking-tight">{APP_NAME}</span>
          </Link>
          <a href="#how" className="shrink-0 text-sm text-muted hover:text-fg">
            How this works
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-4 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-16">
        <section className="flex flex-col gap-6 lg:pt-4">
          <p className="text-sm text-muted">Made by Winston</p>
          <h1 className="font-display text-4xl font-medium leading-tight tracking-tight text-fg sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted">
            I kept getting stuck trying to scan an eSIM QR that was already on my phone. So I made
            this. Put the QR in, and I turn it into a link you open on the phone that needs the plan.
            Tap install — iPhone or Android does the rest.
          </p>
          <ul className="flex flex-col gap-3 text-sm text-muted">
            <li className="flex gap-3">
              <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
              I don’t upload your QR. It stays in this browser.
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
              iPhone needs iOS 17.4+. Android needs 10+ with Google services. If one-tap fails, the
              QR and the two codes are still there.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          {profile ? (
            <div className="flex flex-col gap-5">
              <Button
                type="button"
                variant="ghost"
                className="self-start"
                onClick={() => setProfile(null)}
              >
                <ArrowLeft className="size-4" />
                Do another one
              </Button>
              <InstallCard profile={profile} />
            </div>
          ) : (
            <Composer onProfile={onProfile} />
          )}
        </section>
      </main>

      {!profile && history.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-8">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted">Recent</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {history.map((entry) => (
              <li key={entry.raw}>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseLpa(entry.raw);
                    if (parsed) onProfile(parsed);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-3 text-left hover:border-border-strong"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-fg">{entry.smdp}</span>
                    <span className="block truncate font-mono text-xs text-muted">
                      {entry.matchingId}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-subtle">Open</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="how" className="border-t border-border">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Put the QR in",
              body: "Screenshot from the carrier email is fine. Or paste the LPA string if you already have it.",
            },
            {
              step: "2",
              title: "Open it on the right phone",
              body: "Send the link to the phone that needs data, or just open it there. Nothing gets stored on a server — the code lives in the URL.",
            },
            {
              step: "3",
              title: "Tap Install",
              body: "Your phone opens its own eSIM setup with the plan already filled in. I don’t install anything. Apple and Google do.",
            },
          ].map((item) => (
            <article key={item.step} className="flex flex-col gap-2">
              <p className="font-mono text-xs text-accent">{item.step}</p>
              <h2 className="text-lg font-medium text-fg">{item.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-xs leading-relaxed text-subtle sm:flex-row sm:justify-between">
          <p>Made by Winston. Phone has to be unlocked and actually support eSIM.</p>
          <p>I only build the link. The install itself is handled by iOS or Android.</p>
        </div>
      </footer>
    </div>
  );
}
