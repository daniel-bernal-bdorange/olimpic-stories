"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Bebas_Neue, Cormorant_Garamond, DM_Mono } from "next/font/google";
import { TransitionLink, useRouteTransition } from "@/components/route-transition";
import {
  lostSports,
  lostSportsEras,
  lostSportsHero,
  lostSportsIntro,
  lostSportsStoryMeta,
  lostSportsSummary,
  type LostSport,
  type LostSportEraKey,
} from "./data";

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

const lostSportsTimelineStart = lostSportsSummary.firstFeaturedYear;
const lostSportsTimelineEnd = lostSportsSummary.lastFeaturedYear;
const lostSportsTimelineSpan = Math.max(lostSportsTimelineEnd - lostSportsTimelineStart, 1);

function getVisibleSports(activeEra: LostSportEraKey) {
  if (activeEra === "all") {
    return lostSports;
  }

  return lostSports.filter((sport) => sport.era === activeEra);
}

function getLifetimeStyle(sport: LostSport): CSSProperties {
  const offset = ((sport.first - lostSportsTimelineStart) / lostSportsTimelineSpan) * 100;
  const width =
    sport.first === sport.last
      ? 8
      : Math.max(((sport.last - sport.first) / lostSportsTimelineSpan) * 100, 10);

  return {
    left: `${Math.min(offset, 92)}%`,
    width: `${Math.min(width, 100 - offset)}%`,
  };
}

export default function CementerioOlimpicoPage() {
  const lostSportsRootRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const filtersBarRef = useRef<HTMLDivElement | null>(null);
  const filtersShellRef = useRef<HTMLDivElement | null>(null);
  const archivePanelId = useId();
  const { markPageReady } = useRouteTransition();
  const [activeEra, setActiveEra] = useState<LostSportEraKey>("all");
  const [headerHeight, setHeaderHeight] = useState(73);
  const [filtersBarHeight, setFiltersBarHeight] = useState(0);
  const [isFiltersBarPinned, setIsFiltersBarPinned] = useState(false);

  const visibleSports = getVisibleSports(activeEra);
  const activeEraMeta = lostSportsEras.find((era) => era.key === activeEra) ?? lostSportsEras[0];

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

  useEffect(() => {
    const headerNode = headerRef.current;

    if (!headerNode) {
      return;
    }

    const syncHeight = () => {
      setHeaderHeight(headerNode.getBoundingClientRect().height);
    };

    syncHeight();

    const observer = new ResizeObserver(() => {
      syncHeight();
    });

    observer.observe(headerNode);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const filtersNode = filtersBarRef.current;

    if (!filtersNode) {
      return;
    }

    const syncHeight = () => {
      setFiltersBarHeight(filtersNode.getBoundingClientRect().height);
    };

    syncHeight();

    const observer = new ResizeObserver(() => {
      syncHeight();
    });

    observer.observe(filtersNode);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const filtersShellNode = filtersShellRef.current;

    if (!filtersShellNode) {
      return;
    }

    let frameId = 0;

    const syncPinnedState = () => {
      frameId = 0;
      setIsFiltersBarPinned(filtersShellNode.getBoundingClientRect().top <= headerHeight);
    };

    const requestSync = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(syncPinnedState);
    };

    requestSync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, [headerHeight]);

  return (
    <main
      className={`${lostSportsDisplayFont.variable} ${lostSportsBodyFont.variable} ${lostSportsDataFont.variable} bg-[var(--ls-bg)] text-[var(--ls-paper)]`}
      style={lostSportsTheme}
    >
      <div ref={lostSportsRootRef} className="relative isolate min-h-screen overflow-x-hidden">
        <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
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
          <div
            ref={filtersShellRef}
            className="relative z-40"
            style={isFiltersBarPinned && filtersBarHeight > 0 ? { height: filtersBarHeight } : undefined}
          >
            <div
              ref={filtersBarRef}
              className={`${isFiltersBarPinned ? "fixed inset-x-0 border-b border-white/10 bg-[linear-gradient(180deg,rgba(5,5,5,0.96),rgba(5,5,5,0.82))] shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl" : "border-b border-white/10 bg-[linear-gradient(180deg,rgba(5,5,5,0.96),rgba(5,5,5,0.82))] shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl"}`}
              style={isFiltersBarPinned ? { top: headerHeight } : undefined}
            >
              <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                  <p
                    className="text-[11px] uppercase tracking-[0.34em] text-[var(--ls-gold)]"
                    style={{ fontFamily: "var(--font-ls-data)" }}
                  >
                    Era filters
                  </p>
                  <p className="max-w-2xl text-sm italic text-[var(--ls-muted)] sm:text-base" style={{ fontFamily: "var(--font-ls-body)" }}>
                    Filter the graveyard by editorial era without losing the full archive counts defined in the brief.
                  </p>
                </div>

                <p
                  className="text-[11px] uppercase tracking-[0.26em] text-white/42"
                  style={{ fontFamily: "var(--font-ls-data)" }}
                >
                  {visibleSports.length} narrative cards visible · {activeEraMeta.totalCount} removed sports in archive
                </p>
              </div>

              <div
                className="mt-4 flex gap-3 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Filtrar deportes desaparecidos por era"
              >
                {lostSportsEras.map((era) => {
                  const isActive = era.key === activeEra;

                  return (
                    <button
                      key={era.key}
                      id={`lost-sports-tab-${era.key}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={archivePanelId}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveEra(era.key)}
                      className="group flex min-w-fit items-center gap-3 rounded-full border px-4 py-2.5 text-left transition-all duration-300"
                      style={{
                        fontFamily: "var(--font-ls-data)",
                        borderColor: isActive ? "rgba(201,168,76,0.72)" : "rgba(255,255,255,0.12)",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(201,168,76,0.28), rgba(201,168,76,0.12))"
                          : "rgba(255,255,255,0.03)",
                        color: isActive ? "var(--ls-paper-strong)" : "rgba(245,242,235,0.74)",
                        boxShadow: isActive ? "0 0 0 1px rgba(201,168,76,0.18) inset" : "none",
                      }}
                    >
                      <span className="text-[11px] uppercase tracking-[0.24em]">{era.label}</span>
                      <span
                        className="rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300"
                        style={{
                          backgroundColor: isActive ? "rgba(5,5,5,0.26)" : "rgba(255,255,255,0.06)",
                          color: isActive ? "var(--ls-paper-strong)" : "rgba(245,242,235,0.66)",
                        }}
                      >
                        {era.totalCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          </div>

          <div
            id={archivePanelId}
            role="tabpanel"
            aria-labelledby={`lost-sports-tab-${activeEra}`}
            className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"
          >
            <div className="grid gap-8 lg:grid-cols-[80px_minmax(0,1fr)] lg:items-start xl:gap-12">
              <div className="relative hidden lg:block" aria-hidden="true">
                <div data-ls-timeline-stage className="relative min-h-full w-full" />
              </div>

              <div data-ls-timeline-content className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(0,0.9fr)] xl:items-start">
                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
                  <p
                    className="text-[11px] uppercase tracking-[0.34em] text-[var(--ls-gold)]"
                    style={{ fontFamily: "var(--font-ls-data)" }}
                  >
                    {activeEraMeta.label}
                  </p>
                  <p className="mt-3 text-[2.8rem] uppercase leading-none text-[var(--ls-paper-strong)]" style={{ fontFamily: "var(--font-ls-display)" }}>
                    {activeEraMeta.totalCount}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/46" style={{ fontFamily: "var(--font-ls-data)" }}>
                    Removed sports in archive
                  </p>
                  <p className="mt-5 text-base italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.05rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
                    {activeEraMeta.description}
                  </p>

                  <div className="mt-6 rounded-[1.35rem] border border-white/8 bg-black/25 p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/44" style={{ fontFamily: "var(--font-ls-data)" }}>
                      Narrative coverage
                    </p>
                    <p className="mt-3 text-3xl uppercase leading-none text-[var(--ls-paper)]" style={{ fontFamily: "var(--font-ls-display)" }}>
                      {visibleSports.length}
                    </p>
                    <p className="mt-2 text-sm italic text-[var(--ls-subtle)]" style={{ fontFamily: "var(--font-ls-body)" }}>
                      Cards currently available in this editorial slice from {activeEraMeta.years}.
                    </p>
                  </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
                    <p
                      className="text-[11px] uppercase tracking-[0.32em] text-[var(--ls-gold)]"
                      style={{ fontFamily: "var(--font-ls-data)" }}
                    >
                      Archive note
                    </p>

                    <div className="mt-5 space-y-4 text-[1rem] italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.08rem]">
                      {lostSportsIntro.map((paragraph) => (
                        <p key={paragraph} style={{ fontFamily: "var(--font-ls-body)" }}>
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[1.35rem] border border-white/8 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/44" style={{ fontFamily: "var(--font-ls-data)" }}>
                        Timeline brief
                      </p>
                      <p className="mt-3 text-sm italic leading-relaxed text-[var(--ls-subtle)]" style={{ fontFamily: "var(--font-ls-body)" }}>
                        The left rail now tracks the visible disappearance years as a D3 timeline, with muted DM Mono labels and a gold active marker tied to the card closest to the viewport centre.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
                    <p
                      className="text-[11px] uppercase tracking-[0.3em] text-[var(--ls-gold)]"
                      style={{ fontFamily: "var(--font-ls-data)" }}
                    >
                      Dataset ledger
                    </p>

                    <p className="mt-4 text-base italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.06rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
                      {lostSportsSummary.featuredSportCount} narrative sports are now defined in one typed module, spanning {lostSportsSummary.firstFeaturedYear} to {lostSportsSummary.lastFeaturedYear}. The filter bar stays sticky while each pill keeps the full archive count requested by the brief, even when this editorial route only surfaces a curated subset.
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
                  <p
                    className="text-[11px] uppercase tracking-[0.3em] text-[var(--ls-gold)]"
                    style={{ fontFamily: "var(--font-ls-data)" }}
                  >
                    Dataset ledger
                  </p>

                  <p className="mt-4 text-base italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.06rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
                    {lostSportsSummary.featuredSportCount} narrative sports are now defined in one typed module, spanning {lostSportsSummary.firstFeaturedYear} to {lostSportsSummary.lastFeaturedYear}. The filter bar stays sticky while each pill keeps the full archive count requested by the brief, even when this editorial route only surfaces a curated subset.
                  </p>
                </div>

                {visibleSports.map((sport, index) => {
                  const isShiftedRight = index % 2 === 1;

                  return (
                    <article
                      key={sport.id}
                      data-ls-timeline-card
                      data-ls-year={sport.last}
                      className={`w-full rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition-colors duration-300 hover:border-[rgba(201,168,76,0.42)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] sm:p-7 lg:max-w-[85%] ${isShiftedRight ? "lg:ml-auto" : "lg:mr-auto"}`}
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-3">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-white/44" style={{ fontFamily: "var(--font-ls-data)" }}>
                            Last seen · {sport.last}
                          </p>
                          <h3 className="text-[clamp(2.8rem,8vw,4.4rem)] uppercase leading-[0.9] text-[var(--ls-paper-strong)]" style={{ fontFamily: "var(--font-ls-display)" }}>
                            {sport.sport}
                          </h3>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                            {sport.years} · {sport.editions} Olympic editions
                          </p>
                        </div>

                        <div className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3 text-left sm:min-w-[12rem] sm:text-right">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/42" style={{ fontFamily: "var(--font-ls-data)" }}>
                            Dominant nation
                          </p>
                          <p className="mt-2 text-2xl uppercase leading-none text-[var(--ls-paper)]" style={{ fontFamily: "var(--font-ls-display)" }}>
                            {sport.dominant}
                          </p>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                            {sport.dominance}% medal share
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-[1.35rem] border border-white/8 bg-black/20 p-4">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-white/38" style={{ fontFamily: "var(--font-ls-data)" }}>
                          <span>{lostSportsTimelineStart}</span>
                          <span>{lostSportsTimelineEnd}</span>
                        </div>

                        <div className="relative mt-4 h-3 rounded-full bg-white/8">
                          <div className="absolute inset-y-0 rounded-full bg-[linear-gradient(90deg,rgba(201,168,76,0.88),rgba(255,209,90,0.72))]" style={getLifetimeStyle(sport)} />
                        </div>
                      </div>

                      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                        <div className="space-y-4 rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-5">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                            Why it disappeared
                          </p>
                          <p className="text-[1.02rem] italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.08rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
                            {sport.disappeared}
                          </p>
                          <p className="text-sm italic text-[var(--ls-subtle)]" style={{ fontFamily: "var(--font-ls-body)" }}>
                            {sport.fact}
                          </p>
                        </div>

                        <div className="rounded-[1.35rem] border border-white/8 bg-black/25 p-5">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                            Medal table snapshot
                          </p>
                          <div className="mt-4 space-y-3">
                            {sport.medals.map((entry, medalIndex) => (
                              <div key={`${sport.id}-${entry.country}`} className="space-y-2">
                                <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-ls-data)" }}>
                                  <span className="text-white/72">{entry.country}</span>
                                  <span className="text-white/48">{entry.pct}%</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-white/8">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${entry.pct}%`,
                                      background:
                                        medalIndex === 0
                                          ? "linear-gradient(90deg, rgba(201,168,76,0.95), rgba(255,209,90,0.78))"
                                          : "rgba(245,242,235,0.36)",
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
