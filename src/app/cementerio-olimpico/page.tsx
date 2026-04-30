"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Bebas_Neue, Cormorant_Garamond, DM_Mono } from "next/font/google";
import { TransitionLink, useRouteTransition } from "@/components/route-transition";
import { lostSportsEras, lostSportsHero, lostSportsIntro, lostSportsStoryMeta, lostSportsSummary } from "./data";

const lostSportsDisplayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ls-display",
});

const lostSportsBodyFont = Cormorant_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ls-body",
});

const lostSportsDataFont = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ls-data",
});

const lostSportsTheme = {
  "--ls-bg": "#050505",
  "--ls-paper": "#f5f2eb",
  "--ls-paper-strong": "#ffffff",
  "--ls-muted": "#b8b0a4",
  "--ls-subtle": "#7f786e",
  "--ls-line": "rgba(245, 242, 235, 0.16)",
  "--ls-gold": "#c9a84c",
  "--ls-gold-strong": "#ffd15a",
  "--ls-overlay": "rgba(5, 5, 5, 0.74)",
  "--ls-fog": "rgba(233, 225, 208, 0.18)",
} as CSSProperties;

export default function CementerioOlimpicoPage() {
  const lostSportsRootRef = useRef<HTMLDivElement | null>(null);
  const { markPageReady } = useRouteTransition();

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};

    void import("./main")
      .then(({ destroyLostSports, initLostSports }) => {
        if (cancelled) {
          return;
        }

        initLostSports(lostSportsRootRef.current);
        dispose = () => {
          destroyLostSports();
        };
        markPageReady();
      })
      .catch((error) => {
        console.error("Lost Sports init failed", error);
        markPageReady();
      });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [markPageReady]);

  return (
    <main
      className={`${lostSportsDisplayFont.variable} ${lostSportsBodyFont.variable} ${lostSportsDataFont.variable} bg-[var(--ls-bg)] text-[var(--ls-paper)]`}
      style={lostSportsTheme}
    >
      <div ref={lostSportsRootRef} className="relative isolate min-h-screen overflow-hidden">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <TransitionLink
              href="/?menu=1"
              transition={{
                sourceLabel: "HEAT 03",
                destinationLabel: "HOME ARENA",
                title: "Olympic Data Stories",
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:border-[#c9a84c] hover:text-white"
              
            >
              Volver a home
            </TransitionLink>

            <div className="text-left sm:text-right">
              <p
                className="text-[11px] uppercase tracking-[0.32em] text-[var(--ls-gold)]"
                style={{ fontFamily: "var(--font-ls-data)" }}
              >
                {lostSportsStoryMeta.currentSliceId} / {lostSportsStoryMeta.currentSliceTitle}
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                {lostSportsStoryMeta.currentSliceDescription}
              </p>
            </div>
          </div>
        </header>

        <section className="relative flex min-h-screen items-end overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(244, 237, 222, 0.16) 0%, rgba(244, 237, 222, 0.08) 28%, rgba(5, 5, 5, 0.44) 72%, rgba(5, 5, 5, 0.78) 100%), url('/images/lost_sports.png')",
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: "saturate(0.72) brightness(1.18) contrast(0.82)",
              transform: "scale(1.02)",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.14),_rgba(255,244,214,0.08)_24%,_transparent_48%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.9)_0%,rgba(5,5,5,0.74)_30%,rgba(5,5,5,0.42)_56%,rgba(5,5,5,0.78)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,244,224,0.08)_0%,transparent_18%,transparent_62%,rgba(5,5,5,0.16)_100%)]" />

          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:pb-24">
            <div className="max-w-3xl space-y-6 rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(5,5,5,0.78),rgba(5,5,5,0.42))] px-6 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-[6px] sm:px-8 sm:py-8">
              <p
                className="text-[11px] uppercase tracking-[0.35em] text-[var(--ls-gold)]"
                style={{ fontFamily: "var(--font-ls-data)" }}
              >
                {lostSportsHero.number}
              </p>

              <div className="space-y-2">
                <h1
                  className="text-[clamp(4.75rem,15vw,10.5rem)] uppercase leading-[0.85]"
                  style={{
                    fontFamily: "var(--font-ls-display)",
                    color: "var(--ls-paper-strong)",
                  }}
                >
                  {lostSportsHero.titleTop}
                </h1>
                <h2
                  className="text-[clamp(4.75rem,15vw,10.5rem)] uppercase leading-[0.85]"
                  style={{
                    fontFamily: "var(--font-ls-display)",
                    color: "var(--ls-gold-strong)",
                  }}
                >
                  {lostSportsHero.titleBottom}
                </h2>
              </div>

              <div className="h-px w-40 bg-[var(--ls-line)]" />

              <div className="grid gap-4 lg:grid-cols-[minmax(0,180px)_minmax(0,360px)] lg:items-end">
                <p
                  className="text-[clamp(5rem,14vw,8.5rem)] leading-none text-[var(--ls-paper)]"
                  style={{ fontFamily: "var(--font-ls-display)" }}
                >
                  {lostSportsHero.impactValue}
                </p>

                <div className="space-y-1 pb-2 text-[1.15rem] italic text-[var(--ls-muted)] sm:text-[1.28rem]">
                  {lostSportsHero.impactLines.map((line) => (
                    <p key={line} style={{ fontFamily: "var(--font-ls-body)" }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-[1rem] italic text-[var(--ls-subtle)] sm:text-[1.08rem]">
                {lostSportsHero.subLines.map((line) => (
                  <p key={line} style={{ fontFamily: "var(--font-ls-body)" }}>
                    {line}
                  </p>
                ))}
              </div>

              <button
                type="button"
                data-ls-scroll-cta
                className="group inline-flex items-center gap-3 pt-4 text-[11px] uppercase tracking-[0.3em] text-white/62 transition-colors hover:text-white"
                style={{ fontFamily: "var(--font-ls-data)" }}
              >
                <span>{lostSportsHero.ctaLabel}</span>
                <span className="text-[var(--ls-gold)] transition-transform duration-300 group-hover:translate-y-1">
                  ↓
                </span>
              </button>
            </div>
          </div>
        </section>

        <section data-ls-intro id="lost-sports-intro" className="relative border-t border-[var(--ls-line)] bg-[var(--ls-bg)]">
          <div className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-20 text-center sm:px-8 sm:py-24">
            <p
              className="text-[11px] uppercase tracking-[0.34em] text-[var(--ls-gold)]"
              style={{ fontFamily: "var(--font-ls-data)" }}
            >
              Archive note
            </p>

            <div className="mx-auto max-w-2xl space-y-5 text-[1.18rem] italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.34rem]">
              {lostSportsIntro.map((paragraph) => (
                <p key={paragraph} style={{ fontFamily: "var(--font-ls-body)" }}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mx-auto h-px w-24 bg-[var(--ls-line)]" />

            <div className="mx-auto w-full max-w-4xl rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.16)] sm:p-6">
              <p
                className="text-[11px] uppercase tracking-[0.3em] text-[var(--ls-gold)]"
                style={{ fontFamily: "var(--font-ls-data)" }}
              >
                Dataset ledger
              </p>

              <p className="mt-4 text-base italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.06rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
                {lostSportsSummary.featuredSportCount} narrative sports are now defined in one typed module, spanning {lostSportsSummary.firstFeaturedYear} to {lostSportsSummary.lastFeaturedYear}. The same source also carries the {lostSportsSummary.editorialEraCount} editorial eras and the {lostSportsSummary.totalRemovedSports} full-archive removals needed by the upcoming filter bar.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {lostSportsEras
                  .filter((era) => era.key !== "all")
                  .map((era) => (
                    <span
                      key={era.key}
                      className="rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white/72"
                      style={{ fontFamily: "var(--font-ls-data)" }}
                    >
                      {era.label} · {era.totalCount}
                    </span>
                  ))}
              </div>
            </div>

            <p
              className="mx-auto max-w-xl text-[11px] uppercase tracking-[0.28em] text-white/38"
              style={{ fontFamily: "var(--font-ls-data)" }}
            >
              The timeline, cards, and filters will now read from the same shared historical dataset instead of duplicating values in the route.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
