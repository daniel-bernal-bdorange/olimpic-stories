"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { scaleLinear } from "d3";
import gsap from "gsap";
import { Bebas_Neue, Cormorant_Garamond, DM_Mono } from "next/font/google";
import { TransitionLink, useRouteTransition } from "@/components/route-transition";
import { lostSportsIconPaths } from "./lost-sports-icon-paths";
import {
  lostSports,
  lostSportsEras,
  lostSportsHero,
  lostSportsIntro,
  lostSportsStoryMeta,
  lostSportsSummary,
  lostSportsTimelineEntries,
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

const LIFE_BAR_START_YEAR = 1896;
const LIFE_BAR_END_YEAR = 2024;
const LIFE_BAR_VIEWBOX_WIDTH = 100;
const LIFE_BAR_VIEWBOX_HEIGHT = 8;
const LIFE_BAR_MIN_WIDTH = 1.6;
const DOMINANCE_CHART_BAR_START = 56;
const DOMINANCE_CHART_BAR_END = 252;
const DOMINANCE_CHART_WIDTH = 300;
const DOMINANCE_CHART_ROW_HEIGHT = 28;
const DOMINANCE_CHART_MIN_HEIGHT = 120;

function getLifeBarMetrics(first: number, last: number) {
  const totalSpan = LIFE_BAR_END_YEAR - LIFE_BAR_START_YEAR;
  const clampedFirst = Math.min(Math.max(first, LIFE_BAR_START_YEAR), LIFE_BAR_END_YEAR);
  const clampedLast = Math.min(Math.max(last, LIFE_BAR_START_YEAR), LIFE_BAR_END_YEAR);
  const start = ((clampedFirst - LIFE_BAR_START_YEAR) / totalSpan) * LIFE_BAR_VIEWBOX_WIDTH;
  const end = ((clampedLast - LIFE_BAR_START_YEAR) / totalSpan) * LIFE_BAR_VIEWBOX_WIDTH;
  const width = Math.max(end - start, LIFE_BAR_MIN_WIDTH);

  return {
    start,
    width: Math.min(width, LIFE_BAR_VIEWBOX_WIDTH - start),
  };
}

function LostSportLifecycleBar({ sport }: { sport: Pick<LostSport, "sport" | "first" | "last" | "iconKey" | "color"> }) {
  const { start, width } = getLifeBarMetrics(sport.first, sport.last);
  const center = start + width / 2;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-[1.2rem] border border-white/8 bg-black/18 px-3 py-3 sm:px-4">
        <div className="relative pt-9 sm:pt-10">
          <div
            className="absolute top-0 flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-white/10 bg-[color-mix(in_srgb,var(--ls-bg)_78%,white_6%)] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:scale-[1.05] sm:h-12 sm:w-12"
            style={{
              color: `var(${sport.color})`,
              left: `clamp(1.375rem, ${center}%, calc(100% - 1.375rem))`,
              transform: "translateX(-50%)",
            }}
          >
            <LostSportIcon iconKey={sport.iconKey} title={sport.sport} className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>

          <svg
            viewBox={`0 0 ${LIFE_BAR_VIEWBOX_WIDTH} ${LIFE_BAR_VIEWBOX_HEIGHT}`}
            className="block h-3 w-full"
            role="img"
            aria-label={`${sport.sport} Olympic lifecycle from ${sport.first} to ${sport.last}`}
            preserveAspectRatio="none"
          >
            <rect
              x="0"
              y="2.5"
              width={LIFE_BAR_VIEWBOX_WIDTH}
              height="3"
              rx="1.5"
              fill="rgba(245, 242, 235, 0.16)"
            />
            <rect x={start} y="1.75" width={width} height="4.5" rx="2.25" fill="var(--ls-gold)" />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-white/42" style={{ fontFamily: "var(--font-ls-data)" }}>
        <span>{LIFE_BAR_START_YEAR}</span>
        <span className="text-[var(--ls-gold)]">
          {sport.first} - {sport.last}
        </span>
        <span>{LIFE_BAR_END_YEAR}</span>
      </div>
    </div>
  );
}

function LostSportIcon({ iconKey, title, className = "h-12 w-12 sm:h-14 sm:w-14" }: { iconKey: string; title: string; className?: string }) {
  const tracedPaths = lostSportsIconPaths[iconKey as keyof typeof lostSportsIconPaths];
  const sharedProps = {
    viewBox: "0 0 96 96",
    className,
    role: "img",
    "aria-label": `${title} icon`,
  };

  if (!tracedPaths) {
    return (
      <svg {...sharedProps}>
        <circle cx="48" cy="48" r="26" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="45" y="28" width="6" height="24" rx="3" fill="currentColor" />
        <circle cx="48" cy="64" r="4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path d={tracedPaths.join(" ")} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

function LostSportDominanceChart({ sport }: { sport: Pick<LostSport, "sport" | "medals"> }) {
  const contentHeight = Math.max(sport.medals.length * DOMINANCE_CHART_ROW_HEIGHT, DOMINANCE_CHART_ROW_HEIGHT);
  const chartHeight = Math.max(contentHeight, DOMINANCE_CHART_MIN_HEIGHT);
  const contentOffsetY = (chartHeight - contentHeight) / 2;
  const scale = scaleLinear().domain([0, 100]).range([0, DOMINANCE_CHART_BAR_END - DOMINANCE_CHART_BAR_START]);

  return (
    <div className="rounded-[1.3rem] border border-white/8 bg-black/24 px-4 py-4 sm:px-5">
      <svg
        viewBox={`0 0 ${DOMINANCE_CHART_WIDTH} ${chartHeight}`}
        className="block h-[120px] w-full"
        role="img"
        aria-label={`Dominance chart for ${sport.sport}`}
        preserveAspectRatio="none"
      >
        {sport.medals.map((entry, index) => {
          const rowY = contentOffsetY + index * DOMINANCE_CHART_ROW_HEIGHT + 4;
          const barWidth = Math.max(scale(entry.pct), 10);
          const isLead = index === 0;

          return (
            <g key={`${sport.sport}-${entry.country}`} transform={`translate(0 ${rowY})`}>
              <text
                x="0"
                y="11"
                fill="rgba(245,242,235,0.78)"
                fontFamily="var(--font-ls-data)"
                fontSize="10"
                letterSpacing="0.18em"
              >
                {entry.country}
              </text>
              <rect
                x={DOMINANCE_CHART_BAR_START}
                y="1"
                width={DOMINANCE_CHART_BAR_END - DOMINANCE_CHART_BAR_START}
                height="12"
                rx="6"
                fill="rgba(245,242,235,0.1)"
              />
              <rect
                x={DOMINANCE_CHART_BAR_START}
                y="1"
                width={barWidth}
                height="12"
                rx="6"
                fill={isLead ? "var(--ls-gold)" : "rgba(184,176,164,0.78)"}
              />
              <text
                x="264"
                y="11"
                fill={isLead ? "var(--ls-paper-strong)" : "rgba(245,242,235,0.72)"}
                fontFamily="var(--font-ls-data)"
                fontSize="10"
                letterSpacing="0.16em"
              >
                {entry.pct}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type LostSportCardProps = {
  sport: LostSport;
  index: number;
  expanded: boolean;
  isEraActive: boolean;
  onToggle: (id: LostSport["id"]) => void;
};

function LostSportCard({ sport, index, expanded, isEraActive, onToggle }: LostSportCardProps) {
  const detailsId = useId();
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const isShiftedRight = index % 2 === 1;

  useEffect(() => {
    const node = detailsRef.current;

    if (!node) {
      return;
    }

    gsap.killTweensOf(node);

    if (expanded) {
      gsap.set(node, { display: "block", height: "auto", autoAlpha: 1 });
      const nextHeight = node.getBoundingClientRect().height;

      gsap.fromTo(
        node,
        { height: 0, autoAlpha: 0 },
        {
          height: nextHeight,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "height",
          onComplete: () => window.dispatchEvent(new Event("resize")),
        }
      );

      return () => {
        gsap.killTweensOf(node);
      };
    }

    if (node.style.display === "none") {
      return;
    }

    const currentHeight = node.getBoundingClientRect().height;

    if (currentHeight === 0) {
      gsap.set(node, { display: "none", height: 0, autoAlpha: 0 });
      return;
    }

    gsap.fromTo(
      node,
      { height: currentHeight, autoAlpha: 1 },
      {
        height: 0,
        autoAlpha: 0,
        duration: 0.42,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(node, { display: "none" });
          window.dispatchEvent(new Event("resize"));
        },
      }
    );

    return () => {
      gsap.killTweensOf(node);
    };
  }, [expanded]);

  return (
    <article
      data-ls-timeline-card
      data-ls-timeline-id={sport.id}
      data-ls-card-reveal
      data-ls-era-card
      data-ls-era={sport.era}
      data-ls-card-side={isShiftedRight ? "right" : "left"}
      data-ls-year={sport.last}
      className={`group relative w-full overflow-hidden rounded-[1.9rem] border bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition-[border-color,background-color,box-shadow] duration-300 hover:border-[rgba(201,168,76,0.42)] hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.068),rgba(255,255,255,0.03))] hover:shadow-[0_30px_90px_rgba(0,0,0,0.34)] sm:p-7 lg:max-w-[84%] ${expanded ? "border-[rgba(201,168,76,0.48)] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_36px_110px_rgba(0,0,0,0.34)]" : "border-white/10"} ${isShiftedRight ? "lg:ml-auto" : "lg:mr-auto"}`}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[var(--ls-gold)] transition-transform duration-300 group-hover:scale-x-100" style={{ transform: expanded ? "scaleX(1)" : undefined }} />
      <div className="absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(201,168,76,0.5),transparent)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.14),transparent_34%)] transition-opacity duration-300 group-hover:opacity-100" style={{ opacity: expanded ? 1 : undefined }} />

      <button
        type="button"
        disabled={!isEraActive}
        onClick={() => onToggle(sport.id)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="relative z-10 block w-full text-left outline-none"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,152px)_minmax(0,1fr)_minmax(0,220px)] lg:items-center lg:gap-7">
          <div className="rounded-[1.35rem] border border-white/8 bg-black/24 px-4 py-4 transition-colors duration-300 group-hover:bg-black/30 lg:px-5 lg:py-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/42" style={{ fontFamily: "var(--font-ls-data)" }}>
              Last seen
            </p>
            <p className="mt-3 text-[clamp(3rem,7vw,4.3rem)] uppercase leading-none text-[var(--ls-paper-strong)]" style={{ fontFamily: "var(--font-ls-display)" }}>
              {sport.last}
            </p>
            <div className="mt-4 h-px w-14 bg-[var(--ls-line)]" />
            <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
              {sport.years}
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/40" style={{ fontFamily: "var(--font-ls-data)" }}>
                  Olympic obituary
                </p>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/58" style={{ fontFamily: "var(--font-ls-data)" }}>
                  {expanded ? "Expanded file" : "Click to expand"}
                </span>
              </div>
              <h3
                className="text-[clamp(2.8rem,8vw,4.8rem)] uppercase leading-[0.9] text-[var(--ls-paper-strong)]"
                style={{
                  fontFamily: "var(--font-ls-display)",
                  color: "var(--ls-paper-strong)",
                }}
              >
                {sport.sport}
              </h3>
            </div>

            <p className="max-w-2xl text-[1.04rem] italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.12rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
              Archived after {sport.editions} Olympic editions. {sport.disappeared}
            </p>

            <div className="flex flex-wrap gap-2.5">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/62 transition-colors duration-300 group-hover:bg-white/[0.05]" style={{ fontFamily: "var(--font-ls-data)" }}>
                Range · {sport.years}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/62 transition-colors duration-300 group-hover:bg-white/[0.05]" style={{ fontFamily: "var(--font-ls-data)" }}>
                Editions · {sport.editions}
              </span>
              <span
                className="rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition-[background-color,border-color,transform] duration-300 group-hover:-translate-y-0.5"
                style={{
                  fontFamily: "var(--font-ls-data)",
                  borderColor: `color-mix(in srgb, var(${sport.color}) 45%, rgba(255,255,255,0.1))`,
                  color: `var(${sport.color})`,
                  backgroundColor: `color-mix(in srgb, var(${sport.color}) 12%, rgba(255,255,255,0.02))`,
                }}
              >
                Lead share · {sport.dominance}%
              </span>
            </div>

            <LostSportLifecycleBar sport={sport} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4 transition-colors duration-300 group-hover:bg-white/[0.05]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40" style={{ fontFamily: "var(--font-ls-data)" }}>
                Dominant nation
              </p>
              <p className="mt-2 text-3xl uppercase leading-none text-[var(--ls-paper)]" style={{ fontFamily: "var(--font-ls-display)" }}>
                {sport.dominant}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                {sport.dominance}% medal share
              </p>
            </div>
          </div>
        </div>
      </button>

      <div
        ref={detailsRef}
        id={detailsId}
        aria-hidden={!expanded}
        className="relative z-10 overflow-hidden"
        style={{ display: expanded ? "block" : "none" }}
      >
        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:items-start">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                  Why it disappeared
                </p>
                <p className="mt-3 max-w-3xl text-[1.08rem] italic leading-relaxed text-[var(--ls-paper)] sm:text-[1.16rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
                  {sport.disappeared}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                  Fun fact
                </p>
                <p className="mt-3 max-w-3xl text-[1.02rem] italic leading-relaxed text-[var(--ls-muted)] sm:text-[1.08rem]" style={{ fontFamily: "var(--font-ls-body)" }}>
                  {sport.fact}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--ls-gold)]" style={{ fontFamily: "var(--font-ls-data)" }}>
                Who dominated
              </p>
              <div className="mt-4">
                <LostSportDominanceChart sport={sport} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => onToggle(sport.id)}
              className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/70 transition-colors duration-300 hover:border-[rgba(201,168,76,0.38)] hover:text-white"
              style={{ fontFamily: "var(--font-ls-data)" }}
            >
              Collapse ↑
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function getVisibleSports(activeEra: LostSportEraKey) {
  if (activeEra === "all") {
    return lostSports;
  }

  return lostSports.filter((sport) => sport.era === activeEra);
}

export default function CementerioOlimpicoPage() {
  const lostSportsRootRef = useRef<HTMLDivElement | null>(null);
  const lostSportsMainRef = useRef<null | typeof import("./main")>(null);
  const activeEraRef = useRef<LostSportEraKey>("all");
  const headerRef = useRef<HTMLElement | null>(null);
  const filtersBarRef = useRef<HTMLDivElement | null>(null);
  const filtersShellRef = useRef<HTMLDivElement | null>(null);
  const archivePanelId = useId();
  const { markPageReady } = useRouteTransition();
  const [activeEra, setActiveEra] = useState<LostSportEraKey>("all");
  const [expandedSportId, setExpandedSportId] = useState<LostSport["id"] | null>(lostSports[0]?.id ?? null);
  const [headerHeight, setHeaderHeight] = useState(73);
  const [filtersBarHeight, setFiltersBarHeight] = useState(0);
  const [isFiltersBarPinned, setIsFiltersBarPinned] = useState(false);

  const focusedSports = getVisibleSports(activeEra);
  const orderedLostSports = lostSportsTimelineEntries.reduce<LostSport[]>((sports, entry) => {
    if (!entry.hasCard || entry.cardId === null) {
      return sports;
    }

    const sport = lostSports.find((candidate) => candidate.id === entry.cardId);

    if (sport) {
      sports.push(sport);
    }

    return sports;
  }, []);
  const activeEraMeta = lostSportsEras.find((era) => era.key === activeEra) ?? lostSportsEras[0];

  useEffect(() => {
    activeEraRef.current = activeEra;
  }, [activeEra]);

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};

    void import("./main")
      .then((module) => {
        if (cancelled) {
          return;
        }

        lostSportsMainRef.current = module;
        module.initLostSports(lostSportsRootRef.current);
        module.setLostSportsEra(lostSportsRootRef.current, activeEraRef.current);
        dispose = () => {
          lostSportsMainRef.current = null;
          module.destroyLostSports();
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
    lostSportsMainRef.current?.setLostSportsEra(lostSportsRootRef.current, activeEra);
  }, [activeEra]);

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
                  {focusedSports.length} cards in era focus · {activeEraMeta.totalCount} removed sports in archive
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
            <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-12">
              <div className="relative hidden lg:block">
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
                      {focusedSports.length}
                    </p>
                    <p className="mt-2 text-sm italic text-[var(--ls-subtle)]" style={{ fontFamily: "var(--font-ls-body)" }}>
                      Sports matching the current era focus inside the full cemetery from {activeEraMeta.years}.
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
                        The left rail now acts as the archive ledger: full timeline entries on the left, editorial obituary cards on the right, and a gold active marker tied to the nearest featured card in view.
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
                {orderedLostSports.map((sport, index) => {
                  const isEraActive = activeEra === "all" || sport.era === activeEra;

                  return (
                    <LostSportCard
                      key={sport.id}
                      sport={sport}
                      index={index}
                      expanded={expandedSportId === sport.id}
                      isEraActive={isEraActive}
                      onToggle={(id) => setExpandedSportId((current) => (current === id ? null : id))}
                    />
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
