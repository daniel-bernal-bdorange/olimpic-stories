"use client";

import Image from "next/image";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { scalePoint } from "d3";
import { Bebas_Neue, Cormorant_Garamond, DM_Mono } from "next/font/google";
import { RouteTransitionReady, TransitionLink } from "@/components/route-transition";
import { athletes, categoryLabels, categoryPills, getOlympicHostCity, historicalEvents, introCopy, olympicYears, type Athlete, type HistoricalEvent, type MedalType, winterOlympicYears } from "./data";

const oneLifeDisplayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-onelife-display",
});

const oneLifeBodyFont = Cormorant_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-onelife-body",
});

const oneLifeDataFont = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-onelife-data",
});

const chartWidth = 1320;
const axisHeight = 56;
const eventBandHeight = 136;
const rowHeight = 92;
const entranceTransitionDurationMs = 700;
const rowEntranceBaseDelayMs = 180;
const rowEntranceStepMs = 140;
const pointEntranceOffsetMs = 240;
const pointEntranceStepMs = 70;
const detailPanelTransitionDurationMs = 500;
const categoryFilterTransitionDuration = 0.42;
const categoryFilterButtonDuration = 0.28;

const medalWeight: Record<MedalType, number> = {
  gold: 3,
  silver: 2,
  bronze: 1,
};

const medalLabel: Record<MedalType, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

type TooltipAlignment = "start" | "center" | "end";

type AthleteEditionPoint = {
  year: number;
  city: string;
  medals: Athlete["medals"];
  dominantMedal: MedalType | null;
  alignment: TooltipAlignment;
};

type CategoryFilter = (typeof categoryPills)[number];

type CategoryFilterBarProps = {
  activeCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  className?: string;
};

type PointVisual = {
  diameter: number;
  innerDiameter: number;
  outer: string;
  inner: string;
  copy: string;
  showInner: boolean;
};

type AthleteRowVisualState = {
  autoAlpha: number;
  scale: number;
  y: number;
};

const xScale = scalePoint<number>()
  .domain([...olympicYears])
  .range([28, chartWidth - 28])
  .padding(0.45);

function getLinePosition(year: number) {
  return xScale(year) ?? 0;
}

function getLinePercent(year: number) {
  return `${(getLinePosition(year) / chartWidth) * 100}%`;
}

function getTimelinePosition(year: number) {
  const exactPosition = xScale(year);

  if (exactPosition !== undefined) {
    return exactPosition;
  }

  const olympicYearList = [...olympicYears];
  const firstYear = olympicYearList[0];
  const lastYear = olympicYearList[olympicYearList.length - 1];

  if (year <= firstYear) {
    return getLinePosition(firstYear);
  }

  if (year >= lastYear) {
    return getLinePosition(lastYear);
  }

  for (let index = 0; index < olympicYearList.length - 1; index += 1) {
    const currentYear = olympicYearList[index];
    const nextYear = olympicYearList[index + 1];

    if (year > currentYear && year < nextYear) {
      const startX = getLinePosition(currentYear);
      const endX = getLinePosition(nextYear);
      const progress = (year - currentYear) / (nextYear - currentYear);

      return startX + (endX - startX) * progress;
    }
  }

  return 0;
}

function getDominantMedal(medals: Athlete["medals"]): MedalType | null {
  if (medals.length === 0) {
    return null;
  }

  return medals.reduce((best, current) => {
    if (!best) {
      return current.type;
    }

    return medalWeight[current.type] > medalWeight[best] ? current.type : best;
  }, null as MedalType | null);
}

function getTooltipAlignment(year: number): TooltipAlignment {
  const x = getLinePosition(year);

  if (x <= 112) {
    return "start";
  }

  if (x >= chartWidth - 112) {
    return "end";
  }

  return "center";
}

function getTooltipPositionClasses(alignment: TooltipAlignment): string {
  if (alignment === "start") {
    return "left-0 translate-y-2";
  }

  if (alignment === "end") {
    return "right-0 translate-y-2";
  }

  return "left-1/2 -translate-x-1/2 translate-y-2";
}

function getHistoricalEventTone(noGame?: boolean) {
  if (noGame) {
    return {
      stroke: "rgba(164, 75, 75, 0.5)",
      label: "rgba(214, 150, 150, 0.78)",
    };
  }

  return {
    stroke: "rgba(255,255,255,0.18)",
    label: "rgba(245,242,235,0.38)",
  };
}

function getHistoricalEventLabelOffset(event: HistoricalEvent) {
  return event.align === "left" ? -8 : 8;
}

function getHistoricalEventTextAnchor(event: HistoricalEvent) {
  return event.align === "left" ? "end" : "start";
}

function getEditorialNotePlacement(index: number) {
  return index % 2 === 0 ? "top" : "bottom";
}

function getEditorialTooltipClasses(placement: "top" | "bottom") {
  if (placement === "top") {
    return "top-[calc(100%+12px)] left-1/2 -translate-x-1/2";
  }

  return "bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2";
}

function getRowEntranceDelay(index: number) {
  return rowEntranceBaseDelayMs + index * rowEntranceStepMs;
}

function getPointEntranceDelay(rowIndex: number, pointIndex: number) {
  return getRowEntranceDelay(rowIndex) + pointEntranceOffsetMs + pointIndex * pointEntranceStepMs;
}

function getPointVisual(medal: MedalType | null): PointVisual {
  if (medal === "gold") {
    return {
      diameter: 16,
      innerDiameter: 10,
      outer: "border-[#c9a84c] bg-[#c9a84c]/16 group-hover:border-[#e6c66e] group-focus-visible:border-[#e6c66e] group-focus-visible:bg-[#c9a84c]/22",
      inner: "bg-[#d8bb68]",
      copy: "text-[#edd58f]",
      showInner: true,
    };
  }

  if (medal === "silver") {
    return {
      diameter: 14,
      innerDiameter: 8,
      outer: "border-slate-200/90 bg-slate-200/14 group-hover:border-slate-100 group-focus-visible:border-slate-100 group-focus-visible:bg-slate-200/20",
      inner: "bg-slate-200",
      copy: "text-slate-100",
      showInner: true,
    };
  }

  if (medal === "bronze") {
    return {
      diameter: 12,
      innerDiameter: 7,
      outer: "border-[#cd7f32]/90 bg-[#cd7f32]/14 group-hover:border-[#e0a36e] group-focus-visible:border-[#e0a36e] group-focus-visible:bg-[#cd7f32]/20",
      inner: "bg-[#c8885a]",
      copy: "text-[#e3b18d]",
      showInner: true,
    };
  }

  return {
    diameter: 8,
    innerDiameter: 0,
    outer: "border-[#3a3a3a] bg-transparent group-hover:border-white/55 group-focus-visible:border-white/55",
    inner: "bg-transparent",
    copy: "text-white/62",
    showInner: false,
  };
}

function getAthleteRowVisualState({
  rowIsVisible,
  isCategoryActive,
  isSelected,
  hasFocusedAthlete,
}: {
  rowIsVisible: boolean;
  isCategoryActive: boolean;
  isSelected: boolean;
  hasFocusedAthlete: boolean;
}): AthleteRowVisualState {
  if (!rowIsVisible) {
    return {
      autoAlpha: 0,
      scale: 0.975,
      y: 18,
    };
  }

  if (hasFocusedAthlete) {
    if (isSelected) {
      return {
        autoAlpha: 1,
        scale: 1,
        y: 0,
      };
    }

    return {
      autoAlpha: isCategoryActive ? 0.2 : 0.1,
      scale: isCategoryActive ? 0.992 : 0.985,
      y: isCategoryActive ? 2 : 6,
    };
  }

  if (isCategoryActive) {
    return {
      autoAlpha: 1,
      scale: 1,
      y: 0,
    };
  }

  return {
    autoAlpha: 0.2,
    scale: 0.992,
    y: 6,
  };
}

function getAthleteEditionPoints(athlete: Athlete): AthleteEditionPoint[] {
  return athlete.years.map((year) => {
    const medals = athlete.medals.filter((medal) => medal.year === year);

    return {
      year,
      city: getOlympicHostCity(year, athlete.season),
      medals,
      dominantMedal: getDominantMedal(medals),
      alignment: getTooltipAlignment(year),
    };
  });
}

function getPointAriaLabel(athlete: Athlete, point: AthleteEditionPoint): string {
  if (point.medals.length === 0) {
    return `${point.city} ${point.year}. ${athlete.name}, ${athlete.sport}. No medal this edition.`;
  }

  const summary = point.medals
    .map((medal) => `${medalLabel[medal.type]} medal in ${medal.event}`)
    .join(", ");

  return `${point.city} ${point.year}. ${athlete.name}, ${athlete.sport}. ${summary}.`;
}

function CategoryFilterBar({ activeCategory, onSelectCategory, className = "" }: CategoryFilterBarProps) {
  const filterBarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const filterBar = filterBarRef.current;

    if (!filterBar) {
      return;
    }

    const filterButtons = Array.from(filterBar.querySelectorAll<HTMLButtonElement>("[data-one-life-filter-pill]"));

    for (const button of filterButtons) {
      const isActive = button.dataset.category === activeCategory;

      gsap.killTweensOf(button);
      gsap.to(button, {
        duration: categoryFilterButtonDuration,
        ease: "power2.out",
        overwrite: true,
        scale: isActive ? 1.02 : 1,
        y: isActive ? -1 : 0,
        boxShadow: isActive ? "0 14px 28px rgba(201,168,76,0.18)" : "0 0 0 rgba(0,0,0,0)",
      });
    }

    return () => {
      for (const button of filterButtons) {
        gsap.killTweensOf(button);
      }
    };
  }, [activeCategory]);

  return (
    <section ref={filterBarRef} className={className}>
      <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-5 py-3 sm:px-8 lg:px-12">
        {categoryPills.map((category) => {
          const isActive = activeCategory === category;
          const count = category === "all"
            ? athletes.length
            : athletes.filter((athlete) => athlete.category === category).length;

          return (
            <button
              key={category}
              type="button"
              data-one-life-filter-pill
              data-category={category}
              aria-pressed={isActive}
              onClick={() => onSelectCategory(category)}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.26em] transition-[color,border-color,background-color,transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] ${
                isActive
                  ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                  : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
              }`}
              style={{ fontFamily: "var(--font-onelife-data)" }}
            >
              {categoryLabels[category]} · {count}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getAthleteTotalMedals(athlete: Athlete) {
  return athlete.medals.length;
}

function getAthleteInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type AthleteMiniTimelineProps = {
  athlete: Athlete;
};

function AthleteMiniTimeline({ athlete }: AthleteMiniTimelineProps) {
  const editionPoints = getAthleteEditionPoints(athlete);

  return (
    <div className="pb-2">
      <div className="relative rounded-[24px] border border-white/10 bg-black/20 px-3 py-5 sm:px-5">
        <div className="absolute left-7 right-7 top-[74px] h-px bg-white/10" aria-hidden="true" />

        <div
          className="relative grid gap-2 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${editionPoints.length}, minmax(0, 1fr))` }}
        >
          {editionPoints.map((point) => {
            const pointVisual = getPointVisual(point.dominantMedal);
            const pointEditorialNotes = athlete.editorialNotes.filter((note) => note.year === point.year);

            return (
              <button
                key={`${athlete.id}-detail-${point.year}`}
                type="button"
                aria-label={getPointAriaLabel(athlete, point)}
                className="group relative flex min-w-0 flex-col items-center bg-transparent text-center focus-visible:outline-none"
              >
                <span
                  className="text-[9px] uppercase tracking-[0.14em] text-white/56 sm:text-[10px] sm:tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-onelife-data)" }}
                >
                  {point.year}
                </span>

                <span className="mt-3 flex h-8 items-center justify-center">
                  <span
                    className={`flex items-center justify-center rounded-full border transition duration-200 group-hover:scale-110 group-focus-visible:scale-110 ${pointVisual.outer}`}
                    style={{ width: pointVisual.diameter * 1.35, height: pointVisual.diameter * 1.35 }}
                  >
                    {pointVisual.showInner ? (
                      <span
                        className={`rounded-full ${pointVisual.inner}`}
                        style={{ width: Math.max(pointVisual.innerDiameter * 1.2, 8), height: Math.max(pointVisual.innerDiameter * 1.2, 8) }}
                      />
                    ) : null}
                  </span>
                </span>

                <span
                  className="mt-3 line-clamp-2 max-w-[7ch] text-[9px] italic leading-tight text-white/48 sm:max-w-[8ch] sm:text-[10px]"
                  style={{ fontFamily: "var(--font-onelife-body)" }}
                >
                  {point.city}
                </span>

                {pointEditorialNotes.length > 0 ? (
                  <span
                    className="mt-2 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#d8bb68]"
                    style={{ fontFamily: "var(--font-onelife-data)" }}
                  >
                    Key year
                  </span>
                ) : (
                  <span className="mt-2 h-[25px]" aria-hidden="true" />
                )}

                <span
                  className={`pointer-events-none absolute bottom-[calc(100%+18px)] z-20 w-60 rounded-[18px] border border-white/12 bg-[rgba(8,8,8,0.96)] px-4 py-3 text-left opacity-0 shadow-[0_20px_55px_rgba(0,0,0,0.45)] transition duration-200 ${getTooltipPositionClasses(point.alignment)} group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.28em] text-[#c9a84c]"
                    style={{ fontFamily: "var(--font-onelife-data)" }}
                  >
                    {point.city} {point.year}
                  </p>

                  <div className="mt-3 space-y-2">
                    {point.medals.length === 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                        <p
                          className="text-[11px] uppercase tracking-[0.22em] text-white/78"
                          style={{ fontFamily: "var(--font-onelife-data)" }}
                        >
                          Participation only
                        </p>
                      </div>
                    ) : (
                      point.medals.map((medal) => {
                        const medalTone = getPointVisual(medal.type);

                        return (
                          <div key={`${athlete.id}-${point.year}-detail-${medal.type}-${medal.event}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                            <p
                              className={`text-[11px] uppercase tracking-[0.22em] ${medalTone.copy}`}
                              style={{ fontFamily: "var(--font-onelife-data)" }}
                            >
                              {medalLabel[medal.type]} medal
                            </p>
                            <p
                              className="mt-1 text-xs italic leading-relaxed text-white/78"
                              style={{ fontFamily: "var(--font-onelife-body)" }}
                            >
                              {medal.event}
                            </p>
                          </div>
                        );
                      })
                    )}

                    {pointEditorialNotes.map((note) => (
                      <div key={`${athlete.id}-${point.year}-detail-note-${note.label}`} className="rounded-2xl border border-[#c9a84c]/25 bg-[#c9a84c]/8 px-3 py-2">
                        <p
                          className="text-[11px] uppercase tracking-[0.22em] text-[#d8bb68]"
                          style={{ fontFamily: "var(--font-onelife-data)" }}
                        >
                          Editorial note
                        </p>
                        <p
                          className="mt-1 text-xs italic leading-relaxed text-white/80"
                          style={{ fontFamily: "var(--font-onelife-body)" }}
                        >
                          {note.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type AthleteDetailPanelProps = {
  athlete: Athlete;
  isActive: boolean;
  onClose: () => void;
  onExited: () => void;
  reduceMotion?: boolean;
};

function AthleteDetailPanel({ athlete, isActive, onClose, onExited, reduceMotion = false }: AthleteDetailPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const firstYear = athlete.years[0];
  const lastYear = athlete.years[athlete.years.length - 1];
  const firstCity = getOlympicHostCity(firstYear, athlete.season);
  const lastCity = getOlympicHostCity(lastYear, athlete.season);
  const medalCount = getAthleteTotalMedals(athlete);
  const panelIsOpen = reduceMotion ? isActive : isOpen;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsOpen(isActive);
    });

    let exitTimer: number | undefined;

    if (!isActive) {
      exitTimer = window.setTimeout(() => {
        onExited();
      }, detailPanelTransitionDurationMs);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);

      if (exitTimer !== undefined) {
        window.clearTimeout(exitTimer);
      }
    };
  }, [isActive, onExited, reduceMotion]);

  return (
    <div
      className={`mt-3 grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        panelIsOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
      style={{ gridTemplateRows: panelIsOpen ? "1fr" : "0fr" }}
    >
      <div className="min-h-0">
        <section
          id={`athlete-detail-${athlete.id}`}
          className="rounded-[28px] border border-[#c9a84c]/22 bg-[linear-gradient(180deg,rgba(201,168,76,0.08)_0%,rgba(255,255,255,0.02)_14%,rgba(8,8,8,0.82)_100%)] px-4 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:px-6 sm:py-5 lg:px-8"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/14 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:border-[#c9a84c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]"
              style={{ fontFamily: "var(--font-onelife-data)" }}
            >
              Close detail
            </button>
          </div>

          <div className="mt-4 grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start">
            <div className="rounded-[24px] border border-white/10 bg-[#111111] p-3">
              <div className="relative h-[300px] overflow-hidden rounded-[20px] border border-white/10 border-l-[3px] border-l-[#c9a84c] bg-[#161616]">
                {athlete.photo ? (
                  <Image
                    src={athlete.photo}
                    alt={`${athlete.name} portrait`}
                    fill
                    sizes="(max-width: 1279px) 100vw, 240px"
                    className="object-cover object-top transition duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[4rem] uppercase tracking-[0.05em] text-[#c9a84c]" style={{ fontFamily: "var(--font-onelife-display)" }}>
                    {getAthleteInitials(athlete.name)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="border-b border-white/10 pb-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-[0.3em] text-[#c9a84c]"
                      style={{ fontFamily: "var(--font-onelife-data)" }}
                    >
                      {athlete.country}
                    </p>
                    <h3
                      className="mt-3 text-[clamp(2.8rem,7vw,5.25rem)] uppercase leading-[0.86] tracking-[0.04em] text-white"
                      style={{ fontFamily: "var(--font-onelife-display)", color: "#ffffff" }}
                    >
                      {athlete.name}
                    </h3>
                    <p
                      className="mt-2 text-lg italic leading-relaxed text-white/78"
                      style={{ fontFamily: "var(--font-onelife-body)" }}
                    >
                      {athlete.sport}
                    </p>
                  </div>
 
                  <p
                    className="max-w-lg text-sm italic leading-relaxed text-[#d8bb68]"
                    style={{ fontFamily: "var(--font-onelife-body)" }}
                  >
                    {athlete.note}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 border-b border-white/10 py-5 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/52" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    Editions
                  </p>
                  <p className="mt-3 text-[2.8rem] uppercase leading-none text-white" style={{ fontFamily: "var(--font-onelife-display)" }}>
                    {athlete.editions}
                  </p>
                </div>
                <div className="rounded-[20px] border border-[#c9a84c]/16 bg-[#c9a84c]/6 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/52" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    Years span
                  </p>
                  <p className="mt-3 text-[2.8rem] uppercase leading-none text-[#c9a84c]" style={{ fontFamily: "var(--font-onelife-display)" }}>
                    {athlete.span}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/52" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    Medals
                  </p>
                  <p className="mt-3 text-[2.8rem] uppercase leading-none text-white" style={{ fontFamily: "var(--font-onelife-display)" }}>
                    {medalCount}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/52" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    First game
                  </p>
                  <p className="mt-3 text-[2.1rem] uppercase leading-none text-white" style={{ fontFamily: "var(--font-onelife-display)" }}>
                    {firstYear}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/56" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    {firstCity}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/52" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    Last game
                  </p>
                  <p className="mt-3 text-[2.1rem] uppercase leading-none text-white" style={{ fontFamily: "var(--font-onelife-display)" }}>
                    {lastYear}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/56" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    {lastCity}
                  </p>
                </div>
              </div>

              <div className="border-b border-white/10 py-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a84c]" style={{ fontFamily: "var(--font-onelife-data)" }}>
                      Mini timeline
                    </p>
                    <p className="mt-2 text-sm italic leading-relaxed text-white/64" style={{ fontFamily: "var(--font-onelife-body)" }}>
                      A focused view of the same Olympic life, expanded enough to read each return.
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <AthleteMiniTimeline athlete={athlete} />
                </div>
              </div>

              <div className="pt-5">
                <p
                  className="text-[10px] uppercase tracking-[0.24em] text-white/48"
                  style={{ fontFamily: "var(--font-onelife-data)" }}
                >
                  Biography
                </p>
                <p className="mt-3 max-w-3xl text-[1.05rem] italic leading-relaxed text-white/80 sm:text-[1.12rem]" style={{ fontFamily: "var(--font-onelife-body)" }}>
                  {athlete.bio}
                </p>
                <div className="mt-4 rounded-[20px] border border-[#c9a84c]/20 bg-[#c9a84c]/8 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#d8bb68]" style={{ fontFamily: "var(--font-onelife-data)" }}>
                    Editorial note
                  </p>
                  <p className="mt-2 text-sm italic leading-relaxed text-white/82" style={{ fontFamily: "var(--font-onelife-body)" }}>
                    {athlete.note}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function TenOlympicsOneLifePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [renderedAthleteId, setRenderedAthleteId] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const athleteRowsRef = useRef<HTMLDivElement | null>(null);
  const [showPinnedFilterBar, setShowPinnedFilterBar] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showTimelineRows, setShowTimelineRows] = useState(false);
  const focusedAthleteId = selectedAthleteId ?? renderedAthleteId;

  const requestAthleteSelection = (nextAthleteId: string | null) => {
    setSelectedAthleteId(nextAthleteId);

    if (nextAthleteId) {
      setRenderedAthleteId(nextAthleteId);
      return;
    }

    if (prefersReducedMotion) {
      setRenderedAthleteId(null);
    }
  };

  const handleSelectCategory = (category: CategoryFilter) => {
    setActiveCategory(category);
    setSelectedAthleteId((current) => {
      if (!current) {
        return null;
      }

      const athlete = athletes.find((entry) => entry.id === current);

      if (!athlete) {
        if (prefersReducedMotion) {
          setRenderedAthleteId(null);
        }

        return null;
      }

      if (category === "all" || athlete.category === category) {
        return current;
      }

      if (prefersReducedMotion) {
        setRenderedAthleteId(null);
      }

      return null;
    });
  };

  useEffect(() => {
    const updatePinnedFilterBar = () => {
      const hero = heroRef.current;

      if (!hero) {
        return;
      }

      const headerOffset = window.innerWidth >= 640 ? 73 : 92;
      const heroBottom = hero.getBoundingClientRect().bottom;

      setShowPinnedFilterBar(heroBottom <= headerOffset);
    };

    updatePinnedFilterBar();
    window.addEventListener("scroll", updatePinnedFilterBar, { passive: true });
    window.addEventListener("resize", updatePinnedFilterBar);

    return () => {
      window.removeEventListener("scroll", updatePinnedFilterBar);
      window.removeEventListener("resize", updatePinnedFilterBar);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncMotionPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncMotionPreference);

      return () => {
        mediaQuery.removeEventListener("change", syncMotionPreference);
      };
    }

    mediaQuery.addListener(syncMotionPreference);

    return () => {
      mediaQuery.removeListener(syncMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const athleteRows = athleteRowsRef.current;

    if (!athleteRows) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShowTimelineRows(true);
        observer.disconnect();
      },
      { threshold: 0.16 },
    );

    observer.observe(athleteRows);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const athleteRows = athleteRowsRef.current;

    if (!athleteRows) {
      return;
    }

    const rowIsVisible = showTimelineRows || prefersReducedMotion;

    if (!rowIsVisible && !prefersReducedMotion) {
      return;
    }

    const rowWrappers = Array.from(athleteRows.querySelectorAll<HTMLElement>("[data-one-life-athlete-row]"));
    const hasFocusedAthlete = focusedAthleteId !== null;

    for (const rowWrapper of rowWrappers) {
      const athleteId = rowWrapper.dataset.athleteId;
      const athleteCategory = rowWrapper.dataset.category as CategoryFilter | undefined;
      const rowState = getAthleteRowVisualState({
        rowIsVisible,
        isCategoryActive: activeCategory === "all" || athleteCategory === activeCategory,
        isSelected: athleteId === focusedAthleteId,
        hasFocusedAthlete,
      });

      gsap.killTweensOf(rowWrapper);

      if (prefersReducedMotion) {
        gsap.set(rowWrapper, rowState);
        continue;
      }

      gsap.to(rowWrapper, {
        ...rowState,
        duration: categoryFilterTransitionDuration,
        ease: "power2.out",
        overwrite: true,
      });
    }

    return () => {
      for (const rowWrapper of rowWrappers) {
        gsap.killTweensOf(rowWrapper);
      }
    };
  }, [activeCategory, focusedAthleteId, prefersReducedMotion, showTimelineRows]);

  return (
    <main
      className={`${oneLifeDisplayFont.variable} ${oneLifeBodyFont.variable} ${oneLifeDataFont.variable} relative min-h-screen overflow-x-clip bg-[#070707] text-[#f5f2eb]`}
      style={{ backgroundColor: "#070707" }}
    >
      <RouteTransitionReady />

      {showPinnedFilterBar ? (
        <CategoryFilterBar
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          className="fixed inset-x-0 top-[92px] z-40 border-y border-white/10 bg-black/66 shadow-[0_14px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:top-[73px]"
        />
      ) : null}

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/44 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <TransitionLink
            href="/?menu=1"
            transition={{
              sourceLabel: "HEAT 04",
              destinationLabel: "HOME ARENA",
              title: "Olympic Data Stories",
            }}
            className="rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:border-[#c9a84c] hover:text-white"
          >
            Volver a home
          </TransitionLink>

          <div className="text-left sm:text-right">
            <p
              className="text-[11px] uppercase tracking-[0.32em] text-[#c9a84c]"
              style={{ fontFamily: "var(--font-onelife-data)" }}
            >
              04 / One Life, Ten Games
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-white/78">
              Longevidad competitiva y tiempo olimpico
            </p>
          </div>
        </div>
      </header>

      <section ref={heroRef} className="relative isolate mt-[92px] flex h-[calc(100svh-92px)] items-end overflow-hidden px-5 pb-6 pt-8 sm:mt-[73px] sm:h-[calc(100svh-73px)] sm:px-8 sm:pb-8 sm:pt-10 lg:px-12 lg:pb-10 lg:pt-14">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(201,168,76,0.14),transparent_36%),linear-gradient(90deg,rgba(7,7,7,0.72)_0%,rgba(7,7,7,0.46)_42%,rgba(7,7,7,0.58)_72%,rgba(7,7,7,0.8)_100%)]" />
          </div>

          <div className="absolute inset-y-0 right-0 hidden w-[45vw] lg:block">
            <Image
              src="/images/one-life/athletes/ian-millar.webp"
              alt="Ian Millar portrait"
              fill
              priority
              sizes="45vw"
              className="object-cover object-top opacity-34 grayscale"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 42%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 42%)",
              }}
            />
          </div>

          <div className="relative mx-auto flex w-full max-w-7xl items-end">
            <div className="max-w-2xl pt-6 sm:pt-8 lg:pt-10">
              <p
                className="mb-4 text-[11px] uppercase tracking-[0.34em] text-[#c9a84c] sm:mb-6"
                style={{ fontFamily: "var(--font-onelife-data)" }}
              >
                04 / ONE LIFE, TEN GAMES
              </p>
              <h1
                className="max-w-[10ch] text-[clamp(4.35rem,15vw,11rem)] uppercase leading-[0.84] tracking-[0.03em] text-[#f5f2eb]"
                style={{ fontFamily: "var(--font-onelife-display)", color: "#f5f2eb" }}
              >
                One Life
                <span className="block text-[#c9a84c]">Ten Games</span>
              </h1>
              <div className="my-6 h-px w-40 bg-white/18 sm:my-8" />

              <div className="space-y-3 sm:space-y-4">
                <p
                  className="text-[clamp(3.4rem,8vw,6.25rem)] uppercase leading-none text-white"
                  style={{ fontFamily: "var(--font-onelife-display)" }}
                >
                  40
                </p>
                <p
                  className="max-w-md text-xl italic leading-relaxed text-white/82 sm:text-2xl"
                  style={{ fontFamily: "var(--font-onelife-body)" }}
                >
                  years between first and last Olympic Games.
                </p>
              </div>

              <p
                className="mt-6 max-w-md text-lg italic leading-relaxed text-white/78 sm:mt-8 sm:text-[1.15rem]"
                style={{ fontFamily: "var(--font-onelife-body)" }}
              >
                One Canadian equestrian. Ten Olympic Games. One silver medal.
              </p>

              <p
                className="mt-6 text-[11px] uppercase tracking-[0.3em] text-white/74 sm:mt-10"
                style={{ fontFamily: "var(--font-onelife-data)" }}
              >
                Explore the lives below
              </p>
            </div>
          </div>
      </section>

      <CategoryFilterBar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        className="relative z-10 border-y border-white/10 bg-black/64 shadow-[0_14px_36px_rgba(0,0,0,0.16)]"
      />

      <section
        className="px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(7,7,7,0.16) 0%, rgba(7,7,7,0.28) 12%, rgba(7,7,7,0.46) 100%), url('/images/one-life/one-life-bg.webp')",
          backgroundAttachment: "fixed, fixed",
          backgroundPosition: "center top, left top",
          backgroundRepeat: "no-repeat, repeat",
          backgroundSize: "100% 100%, 320px auto",
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-[1.15rem] italic leading-relaxed text-white/78 sm:text-[1.3rem]"
            style={{ fontFamily: "var(--font-onelife-body)" }}
          >
            {introCopy.join(" ")}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(12,12,12,0.46)] shadow-[0_24px_120px_rgba(0,0,0,0.28)] backdrop-blur-[4px]">
          <div className="border-b border-white/10 px-5 py-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.32em] text-[#c9a84c]"
                  style={{ fontFamily: "var(--font-onelife-data)" }}
                >
                  Horizontal timeline
                </p>
                <h2
                  className="mt-2 text-4xl uppercase tracking-[0.04em] text-white sm:text-5xl"
                  style={{ fontFamily: "var(--font-onelife-display)", color: "#ffffff" }}
                >
                  Lives Stretched Across Editions
                </h2>
              </div>

              <p
                className="max-w-md text-sm italic leading-relaxed text-white/74"
                style={{ fontFamily: "var(--font-onelife-body)" }}
              >
                Rows, thumbnails, Olympic editions, and world events now share the same horizontal field so each career reads as a life stretched against history.
              </p>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full">
              <div
                className="mb-4 grid items-end gap-4 lg:grid-cols-[220px_minmax(0,1fr)]"
                style={{ gridTemplateColumns: `minmax(0, 1fr)` }}
              >
                <div className="flex h-full flex-col justify-end px-4 pb-3">
                  <p
                    className="text-[11px] uppercase tracking-[0.28em] text-white/72"
                    style={{ fontFamily: "var(--font-onelife-data)" }}
                  >
                    Athlete rows
                  </p>
                  <p
                    className="mt-2 max-w-[15ch] text-xs italic leading-relaxed text-white/56"
                    style={{ fontFamily: "var(--font-onelife-body)" }}
                  >
                    Portrait, discipline, span, and an Olympic rhythm shared by all lives below.
                  </p>
                </div>
                <div className="relative">
                  <svg
                    width="100%"
                    height={eventBandHeight + axisHeight}
                    viewBox={`0 0 ${chartWidth} ${eventBandHeight + axisHeight}`}
                    preserveAspectRatio="none"
                    className="w-full"
                  >
                    <rect x={0} y={0} width={chartWidth} height={eventBandHeight + axisHeight} fill="rgba(255,255,255,0.02)" rx={24} />

                    {historicalEvents.map((event) => {
                      const x = getTimelinePosition(event.year);
                      const isNoGameEvent = "noGame" in event && event.noGame;
                      const tone = getHistoricalEventTone(isNoGameEvent);
                      const labelOffset = getHistoricalEventLabelOffset(event);
                      const labelY = eventBandHeight - 12;

                      return (
                        <g key={`${event.year}-${event.label}`} transform={`translate(${x}, 0)`}>
                          <line
                            x1={0}
                            x2={0}
                            y1={eventBandHeight - 18}
                            y2={eventBandHeight + axisHeight}
                            stroke={tone.stroke}
                            strokeWidth={1}
                            strokeDasharray="4 5"
                          />
                          <text
                            x={labelOffset}
                            y={labelY}
                            fill={tone.label}
                            fontSize={9}
                            letterSpacing="0.18em"
                            textAnchor={getHistoricalEventTextAnchor(event)}
                            transform={`rotate(-90 ${labelOffset} ${labelY})`}
                            style={{ fontFamily: "var(--font-onelife-data)", textTransform: "uppercase" }}
                          >
                            {event.label}
                          </text>
                        </g>
                      );
                    })}

                    <line x1={0} x2={chartWidth} y1={eventBandHeight + axisHeight - 20} y2={eventBandHeight + axisHeight - 20} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

                    {olympicYears.map((year) => {
                      const x = getLinePosition(year);
                      const isWinterYear = winterOlympicYears.has(year);

                      return (
                        <g key={year} transform={`translate(${x}, 0)`}>
                          <line x1={0} x2={0} y1={eventBandHeight + 18} y2={eventBandHeight + axisHeight} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                          <circle cx={0} cy={eventBandHeight + axisHeight - 20} r={isWinterYear ? 3 : 4} fill={isWinterYear ? "rgba(201,168,76,0.55)" : "rgba(245,242,235,0.82)"} />
                          <text
                            x={0}
                            y={eventBandHeight + 18}
                            textAnchor="middle"
                            fill={isWinterYear ? "rgba(245,242,235,0.44)" : "rgba(245,242,235,0.7)"}
                            fontSize={10}
                            letterSpacing="0.24em"
                            style={{ fontFamily: "var(--font-onelife-data)", textTransform: "uppercase" }}
                          >
                            {year}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {olympicYears.map((year) => {
                    const isWinterYear = winterOlympicYears.has(year);
                    const hostCity = getOlympicHostCity(year, isWinterYear ? "winter" : "summer");
                    const alignment = getTooltipAlignment(year);

                    return (
                      <button
                        key={`edition-tooltip-${year}`}
                        type="button"
                        aria-label={`${year} ${hostCity}${isWinterYear ? ", Winter Games" : ", Summer Games"}`}
                        className="group absolute z-10 h-16 w-14 -translate-x-1/2 bg-transparent focus-visible:outline-none"
                        style={{ left: getLinePercent(year), top: eventBandHeight - 6 }}
                      >
                        <span
                          className={`pointer-events-none absolute bottom-[calc(100%-6px)] z-20 w-40 rounded-[18px] border border-white/12 bg-[rgba(8,8,8,0.96)] px-3 py-2 text-left opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.4)] transition duration-200 ${getTooltipPositionClasses(alignment)} group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}
                        >
                          <p
                            className="text-[10px] uppercase tracking-[0.28em] text-[#c9a84c]"
                            style={{ fontFamily: "var(--font-onelife-data)" }}
                          >
                            {year}
                          </p>
                          <p
                            className="mt-1 text-sm italic leading-relaxed text-white/82"
                            style={{ fontFamily: "var(--font-onelife-body)" }}
                          >
                            {hostCity}
                          </p>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div ref={athleteRowsRef} className="space-y-3">
                {athletes.map((athlete, athleteIndex) => {
                  const isRowActive = activeCategory === "all" || athlete.category === activeCategory;
                  const isRowSelected = athlete.id === focusedAthleteId;
                  const isPanelRendered = athlete.id === renderedAthleteId;
                  const firstYear = athlete.years[0];
                  const lastYear = athlete.years[athlete.years.length - 1];
                  const editionPoints = getAthleteEditionPoints(athlete);
                  const rowIsVisible = showTimelineRows || prefersReducedMotion;
                  const rowDelay = prefersReducedMotion ? 0 : getRowEntranceDelay(athleteIndex);

                  return (
                    <div
                      key={athlete.id}
                      data-one-life-athlete-row
                      data-athlete-id={athlete.id}
                      data-category={athlete.category}
                      className="space-y-3"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={isRowSelected}
                        aria-controls={isRowSelected ? `athlete-detail-${athlete.id}` : undefined}
                        onClick={(event) => {
                          const target = event.target;

                          if (target instanceof HTMLElement && target.closest("[data-ignore-row-selection='true']")) {
                            return;
                          }

                          requestAthleteSelection(selectedAthleteId === athlete.id ? null : athlete.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }

                          event.preventDefault();
                        requestAthleteSelection(selectedAthleteId === athlete.id ? null : athlete.id);
                        }}
                        className={`group/row relative grid cursor-pointer items-center gap-4 rounded-[22px] border px-3 py-2 transition-[border-color,background-color,transform,box-shadow,filter] ease-out hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] lg:grid-cols-[220px_minmax(0,1fr)] ${
                          isRowSelected
                            ? "border-[#c9a84c]/55 bg-[#c9a84c]/10 shadow-[0_22px_44px_rgba(201,168,76,0.12)]"
                            : isRowActive
                              ? "border-white/8 bg-white/[0.03] hover:border-[#c9a84c]/45 hover:bg-white/[0.05] hover:shadow-[0_18px_40px_rgba(201,168,76,0.08)]"
                              : "border-white/5 bg-white/[0.015] hover:border-white/18 hover:bg-white/[0.03]"
                        } ${rowIsVisible ? "translate-y-0 blur-0 opacity-100" : "translate-y-5 blur-[2px] opacity-0"}`}
                        style={{
                          transitionDelay: `${rowIsVisible ? rowDelay : 0}ms`,
                          transitionDuration: `${entranceTransitionDurationMs}ms`,
                        }}
                      >
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,rgba(201,168,76,0.08)_0%,rgba(201,168,76,0.03)_36%,rgba(255,255,255,0)_100%)] opacity-0 transition-opacity duration-300 group-hover/row:opacity-100"
                        />

                        <div className="relative z-10 flex items-center gap-4 px-2 transition-transform duration-300 group-hover/row:translate-x-1">
                          <div className={`relative h-11 w-11 overflow-hidden rounded-full border transition-colors duration-300 ${
                            isRowSelected
                              ? "border-[#c9a84c]/70"
                              : isRowActive
                                ? "border-white/18 group-hover/row:border-[#c9a84c]/70"
                                : "border-white/10 group-hover/row:border-white/28"
                          }`}>
                            <Image
                              src={athlete.photo}
                              alt={athlete.name}
                              fill
                              sizes="44px"
                              className={`object-cover object-top transition duration-300 ${
                                isRowSelected
                                  ? "grayscale-0"
                                  : isRowActive
                                    ? "grayscale group-hover/row:grayscale-0"
                                    : "grayscale-[100%] group-hover/row:grayscale-[35%]"
                              }`}
                              style={{ objectPosition: athlete.thumbnailPhotoPosition ?? "center top" }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`truncate text-[13px] uppercase tracking-[0.18em] ${isRowSelected ? "text-white" : isRowActive ? "text-white/82" : "text-white/62"}`}
                              style={{ fontFamily: "var(--font-onelife-data)" }}
                            >
                              {athlete.name}
                            </p>
                            <p className={`truncate text-sm italic ${isRowSelected ? "text-white/82" : isRowActive ? "text-white/72" : "text-white/52"}`} style={{ fontFamily: "var(--font-onelife-body)" }}>
                              {athlete.sport} · {athlete.country}
                            </p>
                            <p
                              className={`mt-1 text-[10px] uppercase tracking-[0.24em] ${isRowSelected ? "text-[#d8bb68]" : isRowActive ? "text-[#c9a84c]/88" : "text-white/34"}`}
                              style={{ fontFamily: "var(--font-onelife-data)" }}
                            >
                              {athlete.editions} editions · {athlete.span} years
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 w-full overflow-visible" style={{ height: rowHeight }}>
                          <svg
                            width="100%"
                            height={rowHeight}
                            viewBox={`0 0 ${chartWidth} ${rowHeight}`}
                            preserveAspectRatio="none"
                            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                          >
                            {olympicYears.map((year) => {
                              const x = getLinePosition(year);

                              return (
                                <line
                                  key={`${athlete.id}-${year}`}
                                  x1={x}
                                  x2={x}
                                  y1={0}
                                  y2={rowHeight}
                                  stroke="rgba(255,255,255,0.05)"
                                  strokeWidth={1}
                                />
                              );
                            })}
                            <line
                              x1={getLinePosition(firstYear)}
                              x2={getLinePosition(lastYear)}
                              y1={rowHeight / 2}
                              y2={rowHeight / 2}
                              strokeWidth={1.25}
                              strokeLinecap="round"
                              className={`transition-[stroke] duration-300 ${
                                isRowSelected
                                  ? "stroke-[#c9a84c]"
                                  : isRowActive
                                    ? "stroke-[#3a3a3a] group-hover/row:stroke-[#c9a84c]/70"
                                    : "stroke-white/10 group-hover/row:stroke-white/25"
                              }`}
                            />
                            <text
                              x={getLinePosition(firstYear)}
                              y={18}
                              fontSize={10}
                              letterSpacing="0.16em"
                              className="fill-[rgba(245,242,235,0.38)] transition-[fill] duration-300 group-hover/row:fill-[rgba(245,242,235,0.62)]"
                              style={{ fontFamily: "var(--font-onelife-data)", textTransform: "uppercase" }}
                            >
                              {firstYear}
                            </text>
                            <text
                              x={getLinePosition(lastYear)}
                              y={18}
                              textAnchor="end"
                              fontSize={10}
                              letterSpacing="0.16em"
                              className="fill-[rgba(201,168,76,0.85)] transition-[fill] duration-300 group-hover/row:fill-[rgba(237,213,143,1)]"
                              style={{ fontFamily: "var(--font-onelife-data)", textTransform: "uppercase" }}
                            >
                              {lastYear}
                            </text>
                          </svg>

                          {editionPoints.map((point, pointIndex) => {
                            const pointVisual = getPointVisual(point.dominantMedal);
                            const pointEditorialNotes = athlete.editorialNotes.filter((note) => note.year === point.year);
                            const pointDelay = prefersReducedMotion ? 0 : getPointEntranceDelay(athleteIndex, pointIndex);

                            return (
                              <button
                                key={`${athlete.id}-${point.year}`}
                                type="button"
                                aria-label={getPointAriaLabel(athlete, point)}
                                data-ignore-row-selection="true"
                                className={`group absolute top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center bg-transparent transition-[transform,opacity] ease-out focus-visible:outline-none ${
                                  rowIsVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.7]"
                                }`}
                                style={{
                                  left: getLinePercent(point.year),
                                  transitionDelay: `${rowIsVisible ? pointDelay : 0}ms`,
                                  transitionDuration: `${entranceTransitionDurationMs}ms`,
                                }}
                              >
                                <span
                                  className={`flex items-center justify-center rounded-full border transition duration-200 group-hover/row:scale-110 ${pointVisual.outer}`}
                                  style={{ width: pointVisual.diameter, height: pointVisual.diameter }}
                                >
                                  {pointVisual.showInner ? (
                                    <span
                                      className={`rounded-full ${pointVisual.inner}`}
                                      style={{ width: pointVisual.innerDiameter, height: pointVisual.innerDiameter }}
                                    />
                                  ) : null}
                                </span>

                                <span
                                  className={`pointer-events-none absolute bottom-[calc(100%+18px)] z-20 w-64 rounded-[20px] border border-white/12 bg-[rgba(8,8,8,0.96)] px-4 py-3 text-left opacity-0 shadow-[0_20px_55px_rgba(0,0,0,0.45)] transition duration-200 ${getTooltipPositionClasses(point.alignment)} group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}
                                >
                                  <p
                                    className="text-[10px] uppercase tracking-[0.28em] text-[#c9a84c]"
                                    style={{ fontFamily: "var(--font-onelife-data)" }}
                                  >
                                    {point.city} {point.year}
                                  </p>
                                  <div className="mt-3 h-px w-full bg-white/10" />
                                  <p
                                    className="mt-3 text-[1.75rem] uppercase leading-none text-white"
                                    style={{ fontFamily: "var(--font-onelife-display)" }}
                                  >
                                    {athlete.name}
                                  </p>
                                  <p
                                    className="mt-1 text-sm italic leading-relaxed text-white/78"
                                    style={{ fontFamily: "var(--font-onelife-body)" }}
                                  >
                                    {athlete.sport} · {athlete.country}
                                  </p>

                                  <div className="mt-3 space-y-2">
                                    {point.medals.length === 0 ? (
                                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                                        <p
                                          className="text-[11px] uppercase tracking-[0.22em] text-white/78"
                                          style={{ fontFamily: "var(--font-onelife-data)" }}
                                        >
                                          Participation only
                                        </p>
                                        <p
                                          className="mt-1 text-xs italic leading-relaxed text-white/72"
                                          style={{ fontFamily: "var(--font-onelife-body)" }}
                                        >
                                          No medal this edition.
                                        </p>
                                      </div>
                                    ) : (
                                      point.medals.map((medal) => {
                                        const medalTone = getPointVisual(medal.type);

                                        return (
                                          <div key={`${athlete.id}-${point.year}-${medal.type}-${medal.event}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                                            <p
                                              className={`text-[11px] uppercase tracking-[0.22em] ${medalTone.copy}`}
                                              style={{ fontFamily: "var(--font-onelife-data)" }}
                                            >
                                              {medalLabel[medal.type]} medal
                                            </p>
                                            <p
                                              className="mt-1 text-xs italic leading-relaxed text-white/78"
                                              style={{ fontFamily: "var(--font-onelife-body)" }}
                                            >
                                              {medal.event}
                                            </p>
                                          </div>
                                        );
                                      })
                                    )}

                                    {pointEditorialNotes.map((note) => (
                                      <div key={`${athlete.id}-${point.year}-${note.label}`} className="rounded-2xl border border-[#c9a84c]/25 bg-[#c9a84c]/8 px-3 py-2">
                                        <p
                                          className="text-[11px] uppercase tracking-[0.22em] text-[#d8bb68]"
                                          style={{ fontFamily: "var(--font-onelife-data)" }}
                                        >
                                          Editorial note
                                        </p>
                                        <p
                                          className="mt-1 text-xs italic leading-relaxed text-white/80"
                                          style={{ fontFamily: "var(--font-onelife-body)" }}
                                        >
                                          {note.label}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </span>
                              </button>
                            );
                          })}

                          {athlete.editorialNotes.map((note, index) => {
                            const placement = getEditorialNotePlacement(index);

                            return (
                              <button
                                key={`${athlete.id}-${note.year}-${note.label}`}
                                type="button"
                                aria-label={`${athlete.name}. Editorial note for ${note.year}. ${note.label}`}
                                data-ignore-row-selection="true"
                                className={`group absolute z-10 -translate-x-1/2 rounded-full border border-[#c9a84c]/40 bg-[rgba(10,10,10,0.92)] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[#d8bb68] shadow-[0_14px_30px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] ${placement === "top" ? "top-1" : "bottom-1"}`}
                                style={{ left: getLinePercent(note.year), fontFamily: "var(--font-onelife-data)" }}
                              >
                                {note.year}
                                <span
                                  className={`pointer-events-none absolute z-20 w-60 rounded-[18px] border border-[#c9a84c]/20 bg-[rgba(8,8,8,0.96)] px-4 py-3 text-left opacity-0 shadow-[0_20px_55px_rgba(0,0,0,0.45)] transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${getEditorialTooltipClasses(placement)}`}
                                >
                                  <p
                                    className="text-[10px] uppercase tracking-[0.28em] text-[#c9a84c]"
                                    style={{ fontFamily: "var(--font-onelife-data)" }}
                                  >
                                    Key year {note.year}
                                  </p>
                                  <p
                                    className="mt-2 text-sm italic leading-relaxed text-white/80"
                                    style={{ fontFamily: "var(--font-onelife-body)" }}
                                  >
                                    {note.label}
                                  </p>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {isPanelRendered ? (
                        <AthleteDetailPanel
                          key={athlete.id}
                          athlete={athlete}
                          isActive={selectedAthleteId === athlete.id}
                          onClose={() => requestAthleteSelection(null)}
                          onExited={() => {
                            setRenderedAthleteId((current) => current === athlete.id ? null : current);
                          }}
                          reduceMotion={prefersReducedMotion}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p
            className="text-[1.3rem] italic leading-relaxed text-white/76 sm:text-[1.5rem]"
            style={{ fontFamily: "var(--font-onelife-body)" }}
          >
            Forty years is not a career. It is a life measured in four-year intervals, in the rhythm of cities and flags that sometimes change between editions.
          </p>
        </div>
      </section>
    </main>
  );
}
