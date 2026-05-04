import Image from "next/image";
import { scalePoint } from "d3";
import { Bebas_Neue, Cormorant_Garamond, DM_Mono } from "next/font/google";
import { RouteTransitionReady, TransitionLink } from "@/components/route-transition";
import { athletes, categoryLabels, categoryPills, getOlympicHostCity, introCopy, olympicYears, type Athlete, type MedalType, winterOlympicYears } from "./data";

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

const labelColumnWidth = 220;
const chartWidth = 1320;
const axisHeight = 54;
const rowHeight = 68;

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

const xScale = scalePoint<number>()
  .domain([...olympicYears])
  .range([28, chartWidth - 28])
  .padding(0.45);

function getLinePosition(year: number) {
  return xScale(year) ?? 0;
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

function getPointToneClasses(medal: MedalType | null): { outer: string; inner: string; copy: string } {
  if (medal === "gold") {
    return {
      outer: "border-[#c9a84c]/70 bg-[#c9a84c]/14 group-hover:border-[#e6c66e] group-focus-visible:border-[#e6c66e] group-focus-visible:bg-[#c9a84c]/18",
      inner: "bg-[#d8bb68]",
      copy: "text-[#edd58f]",
    };
  }

  if (medal === "silver") {
    return {
      outer: "border-slate-200/70 bg-slate-200/12 group-hover:border-slate-100 group-focus-visible:border-slate-100 group-focus-visible:bg-slate-200/18",
      inner: "bg-slate-200",
      copy: "text-slate-100",
    };
  }

  if (medal === "bronze") {
    return {
      outer: "border-[#ba7b4d]/75 bg-[#ba7b4d]/14 group-hover:border-[#cf9368] group-focus-visible:border-[#cf9368] group-focus-visible:bg-[#ba7b4d]/18",
      inner: "bg-[#c8885a]",
      copy: "text-[#e3b18d]",
    };
  }

  return {
    outer: "border-white/30 bg-black/70 group-hover:border-white/60 group-focus-visible:border-white/60 group-focus-visible:bg-black/88",
    inner: "bg-white/62",
    copy: "text-white/62",
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

export default function TenOlympicsOneLifePage() {
  return (
    <main
      className={`${oneLifeDisplayFont.variable} ${oneLifeBodyFont.variable} ${oneLifeDataFont.variable} min-h-screen bg-[#070707] text-[#f5f2eb]`}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(7,7,7,0.82) 0%, rgba(7,7,7,0.96) 14%, rgba(7,7,7,0.98) 100%), url('/images/one-life/one-life-bg.webp')",
        backgroundAttachment: "fixed",
        backgroundPosition: "center top",
        backgroundSize: "cover",
      }}
    >
      <RouteTransitionReady />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/65 backdrop-blur-xl">
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
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">
              Longevidad competitiva y tiempo olimpico
            </p>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:min-h-screen lg:px-12 lg:pb-24 lg:pt-36">
        <div className="absolute inset-0">
          <Image
            src="/images/one-life/one-life-cover.webp"
            alt="Olympic podium still life"
            fill
            priority
            className="object-cover object-left opacity-18"
            style={{
              maskImage: "linear-gradient(to right, black 0%, black 54%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, black 0%, black 54%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(201,168,76,0.16),transparent_36%),linear-gradient(90deg,rgba(7,7,7,0.94)_0%,rgba(7,7,7,0.78)_44%,rgba(7,7,7,0.9)_74%,rgba(7,7,7,0.96)_100%)]" />
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

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p
              className="mb-6 text-[11px] uppercase tracking-[0.34em] text-[#c9a84c]"
              style={{ fontFamily: "var(--font-onelife-data)" }}
            >
              04 / ONE LIFE, TEN GAMES
            </p>
            <h1
              className="max-w-[10ch] text-[clamp(5rem,16vw,11rem)] uppercase leading-[0.84] tracking-[0.03em] text-[#f5f2eb]"
              style={{ fontFamily: "var(--font-onelife-display)" }}
            >
              One Life
              <span className="block text-[#c9a84c]">Ten Games</span>
            </h1>
            <div className="my-8 h-px w-40 bg-white/18" />

            <div className="space-y-4">
              <p
                className="text-[clamp(4rem,8vw,6.25rem)] uppercase leading-none text-white"
                style={{ fontFamily: "var(--font-onelife-display)" }}
              >
                40
              </p>
              <p
                className="max-w-md text-xl italic leading-relaxed text-white/64 sm:text-2xl"
                style={{ fontFamily: "var(--font-onelife-body)" }}
              >
                years between first and last Olympic Games.
              </p>
            </div>

            <p
              className="mt-8 max-w-md text-lg italic leading-relaxed text-white/58 sm:text-[1.15rem]"
              style={{ fontFamily: "var(--font-onelife-body)" }}
            >
              One Canadian equestrian. Ten Olympic Games. One silver medal.
            </p>

            <p
              className="mt-10 text-[11px] uppercase tracking-[0.3em] text-white/45"
              style={{ fontFamily: "var(--font-onelife-data)" }}
            >
              Explore the lives below
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-[73px] z-40 border-y border-white/10 bg-black/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-5 py-3 sm:px-8 lg:px-12">
          {categoryPills.map((category) => {
            const count = category === "all"
              ? athletes.length
              : athletes.filter((athlete) => athlete.category === category).length;

            return (
              <button
                key={category}
                type="button"
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.26em] transition-colors ${
                  category === "all"
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

      <section className="px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-[1.15rem] italic leading-relaxed text-white/54 sm:text-[1.3rem]"
            style={{ fontFamily: "var(--font-onelife-body)" }}
          >
            {introCopy.join(" ")}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(12,12,12,0.82)] shadow-[0_24px_120px_rgba(0,0,0,0.45)]">
          <div className="border-b border-white/10 px-5 py-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.32em] text-[#c9a84c]"
                  style={{ fontFamily: "var(--font-onelife-data)" }}
                >
                  Timeline shell
                </p>
                <h2
                  className="mt-2 text-4xl uppercase tracking-[0.04em] text-white sm:text-5xl"
                  style={{ fontFamily: "var(--font-onelife-display)" }}
                >
                  Lives Stretched Across Editions
                </h2>
              </div>

              <p
                className="max-w-md text-sm italic leading-relaxed text-white/50"
                style={{ fontFamily: "var(--font-onelife-body)" }}
              >
                The span stays visible, but each point now reveals the city, the athlete, and whether that return ended in a medal or just another appearance.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto px-4 py-6 sm:px-6 lg:px-8">
            <div style={{ minWidth: labelColumnWidth + chartWidth + 24 }}>
              <div
                className="mb-3 grid items-end gap-4"
                style={{ gridTemplateColumns: `${labelColumnWidth}px ${chartWidth}px` }}
              >
                <div className="px-4">
                  <p
                    className="text-[11px] uppercase tracking-[0.28em] text-white/35"
                    style={{ fontFamily: "var(--font-onelife-data)" }}
                  >
                    Athlete
                  </p>
                </div>
                <svg width={chartWidth} height={axisHeight} className="overflow-visible">
                  {olympicYears.map((year) => {
                    const x = getLinePosition(year);
                    const isWinterYear = winterOlympicYears.has(year);

                    return (
                      <g key={year} transform={`translate(${x}, 0)`}>
                        <line x1={0} x2={0} y1={28} y2={axisHeight} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                        <text
                          x={0}
                          y={16}
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
              </div>

              <div className="space-y-3">
                {athletes.map((athlete) => {
                  const firstYear = athlete.years[0];
                  const lastYear = athlete.years[athlete.years.length - 1];
                  const editionPoints = getAthleteEditionPoints(athlete);

                  return (
                    <div
                      key={athlete.id}
                      className="grid items-center gap-4 rounded-[22px] border border-white/6 bg-white/[0.02] px-3 py-2 transition-colors hover:border-[#c9a84c]/40 hover:bg-white/[0.04]"
                      style={{ gridTemplateColumns: `${labelColumnWidth}px ${chartWidth}px` }}
                    >
                      <div className="flex items-center gap-4 px-2">
                        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/15">
                          <Image
                            src={athlete.photo}
                            alt={athlete.name}
                            fill
                            sizes="44px"
                            className="object-cover object-top grayscale transition duration-300 group-hover:grayscale-0"
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="truncate text-[13px] uppercase tracking-[0.18em] text-white/78"
                            style={{ fontFamily: "var(--font-onelife-data)" }}
                          >
                            {athlete.name}
                          </p>
                          <p className="truncate text-sm italic text-white/42" style={{ fontFamily: "var(--font-onelife-body)" }}>
                            {athlete.sport} · {athlete.country}
                          </p>
                        </div>
                      </div>

                      <div className="relative overflow-visible" style={{ width: chartWidth, height: rowHeight }}>
                        <svg width={chartWidth} height={rowHeight} className="pointer-events-none absolute inset-0 overflow-visible">
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
                            stroke="rgba(255,255,255,0.22)"
                            strokeWidth={1.5}
                          />
                          <text
                            x={getLinePosition(firstYear)}
                            y={18}
                            fill="rgba(245,242,235,0.38)"
                            fontSize={10}
                            letterSpacing="0.16em"
                            style={{ fontFamily: "var(--font-onelife-data)", textTransform: "uppercase" }}
                          >
                            {firstYear}
                          </text>
                          <text
                            x={getLinePosition(lastYear)}
                            y={18}
                            textAnchor="end"
                            fill="rgba(201,168,76,0.85)"
                            fontSize={10}
                            letterSpacing="0.16em"
                            style={{ fontFamily: "var(--font-onelife-data)", textTransform: "uppercase" }}
                          >
                            {lastYear}
                          </text>
                        </svg>

                        {editionPoints.map((point) => {
                          const pointTone = getPointToneClasses(point.dominantMedal);

                          return (
                            <button
                              key={`${athlete.id}-${point.year}`}
                              type="button"
                              aria-label={getPointAriaLabel(athlete, point)}
                              className="group absolute top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center bg-transparent focus-visible:outline-none"
                              style={{ left: getLinePosition(point.year) }}
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full border transition duration-200 ${pointTone.outer}`}
                              >
                                <span className={`h-2.5 w-2.5 rounded-full ${pointTone.inner}`} />
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
                                  className="mt-1 text-sm italic leading-relaxed text-white/56"
                                  style={{ fontFamily: "var(--font-onelife-body)" }}
                                >
                                  {athlete.sport} · {athlete.country}
                                </p>

                                <div className="mt-3 space-y-2">
                                  {point.medals.length === 0 ? (
                                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                                      <p
                                        className="text-[11px] uppercase tracking-[0.22em] text-white/58"
                                        style={{ fontFamily: "var(--font-onelife-data)" }}
                                      >
                                        Participation only
                                      </p>
                                      <p
                                        className="mt-1 text-xs italic leading-relaxed text-white/52"
                                        style={{ fontFamily: "var(--font-onelife-body)" }}
                                      >
                                        No medal this edition.
                                      </p>
                                    </div>
                                  ) : (
                                    point.medals.map((medal) => {
                                      const medalTone = getPointToneClasses(medal.type);

                                      return (
                                        <div key={`${athlete.id}-${point.year}-${medal.type}-${medal.event}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                                          <p
                                            className={`text-[11px] uppercase tracking-[0.22em] ${medalTone.copy}`}
                                            style={{ fontFamily: "var(--font-onelife-data)" }}
                                          >
                                            {medalLabel[medal.type]} medal
                                          </p>
                                          <p
                                            className="mt-1 text-xs italic leading-relaxed text-white/58"
                                            style={{ fontFamily: "var(--font-onelife-body)" }}
                                          >
                                            {medal.event}
                                          </p>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p
            className="text-[1.3rem] italic leading-relaxed text-white/52 sm:text-[1.5rem]"
            style={{ fontFamily: "var(--font-onelife-body)" }}
          >
            Forty years is not a career. It is a life measured in four-year intervals, in the rhythm of cities and flags that sometimes change between editions.
          </p>
        </div>
      </section>
    </main>
  );
}
