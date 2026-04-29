"use client";

import { useEffect, useRef, useState } from "react";
import { Bebas_Neue, Cormorant_Garamond, DM_Mono } from "next/font/google";
import { TransitionLink, useRouteTransition } from "@/components/route-transition";

const atlasDisplayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-atlas-display",
});

const atlasBodyFont = Cormorant_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-atlas-body",
});

const atlasDataFont = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-atlas-data",
});

type AtlasView = "male" | "female";
type SortMetric = "height" | "weight" | "bmi";

type AthleteProfile = {
  height: number;
  weight: number;
  bmi: number;
  detail: string;
};

type PreviewSport = {
  sport: string;
  male: AthleteProfile;
  female: AthleteProfile;
};

const atlasViews: Array<{ key: AtlasView; label: string }> = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

const initialAtlasView: AtlasView = "male";
const initialAtlasSort: SortMetric = "height";

const sortOptions: Array<{ key: SortMetric; label: string }> = [
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "bmi", label: "BMI" },
];

const atlasSportCount = 20;
const previewSports = [
  {
    sport: "Basketball",
    male: {
      height: 191.2,
      weight: 85.7,
      bmi: 23.4,
      detail: "The tallest Olympic profile, built around reach and floor coverage.",
    },
    female: {
      height: 182.1,
      weight: 74.3,
      bmi: 22.4,
      detail: "A long frame optimized for verticality, spacing and repeated jumps.",
    },
  },
  {
    sport: "Artistic Gymnastics",
    male: {
      height: 162.9,
      weight: 63.4,
      bmi: 23.9,
      detail: "Compact leverage keeps rotation fast without sacrificing control.",
    },
    female: {
      height: 154.6,
      weight: 47.8,
      bmi: 20.0,
      detail: "The shortest silhouette in the atlas, tuned for precision and airtime.",
    },
  },
  {
    sport: "Weightlifting",
    male: {
      height: 173.7,
      weight: 83.8,
      bmi: 27.8,
      detail: "The densest build in the sample, where mass concentrates into power.",
    },
    female: {
      height: 160.4,
      weight: 69.7,
      bmi: 27.1,
      detail: "Explosive strength sits in a shorter frame with unusually high density.",
    },
  },
  {
    sport: "Rowing",
    male: {
      height: 189.0,
      weight: 89.4,
      bmi: 25.0,
      detail: "Length and power combine to maximize stroke distance and rhythm.",
    },
    female: {
      height: 180.2,
      weight: 76.6,
      bmi: 23.6,
      detail: "A tall, efficient profile designed to convert reach into sustained force.",
    },
  },
] satisfies PreviewSport[];

function formatMetricValue(metric: SortMetric, value: number) {
  if (metric === "bmi") {
    return `BMI ${value.toFixed(1)}`;
  }

  return `${value.toFixed(1)} ${metric === "height" ? "CM" : "KG"}`;
}

function getContextCopy(view: AtlasView, metric: SortMetric) {
  const audience = view === "male" ? "male" : "female";

  if (metric === "height") {
    return `Sorting the ${audience} dataset by height exposes how each sport stretches or compresses the Olympic silhouette before the full D3 atlas loads.`;
  }

  if (metric === "weight") {
    return `Sorting the ${audience} dataset by weight surfaces where power adds visible mass and where technique keeps the body lighter without losing output.`;
  }

  return `Sorting the ${audience} dataset by BMI reveals the densest builds against the leanest frames, framing the analytical promise of the atlas at a glance.`;
}

export default function AtlasCuerpoOlimpicoPage() {
  const atlasRootRef = useRef<HTMLDivElement | null>(null);
  const controlsBarRef = useRef<HTMLDivElement | null>(null);
  const controlsShellRef = useRef<HTMLDivElement | null>(null);
  const { markPageReady } = useRouteTransition();
  const [selectedView, setSelectedView] = useState<AtlasView>(initialAtlasView);
  const [selectedSort, setSelectedSort] = useState<SortMetric>(initialAtlasSort);
  const [controlsBarHeight, setControlsBarHeight] = useState(0);
  const [isControlsPinned, setIsControlsPinned] = useState(false);

  const selectedViewLabel = atlasViews.find(({ key }) => key === selectedView)?.label ?? "Male";
  const selectedSortLabel = sortOptions.find(({ key }) => key === selectedSort)?.label ?? "Height";
  const contextualCopy = getContextCopy(selectedView, selectedSort);
  const sortedPreviewSports = [...previewSports].sort(
    (left, right) => right[selectedView][selectedSort] - left[selectedView][selectedSort],
  );
  const maxMetricValue = sortedPreviewSports[0]?.[selectedView][selectedSort] ?? 1;

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};

    void import("./main")
      .then(({ destroyBodyAtlas, initBodyAtlas }) => {
        if (cancelled) {
          return;
        }

        initBodyAtlas(atlasRootRef.current, {
          sportCount: atlasSportCount,
          sort: initialAtlasSort,
          view: initialAtlasView,
        });
        dispose = () => {
          destroyBodyAtlas();
        };
        markPageReady();
      })
      .catch((error) => {
        console.error("Body Atlas init failed", error);
        markPageReady();
      });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [markPageReady]);

  useEffect(() => {
    void import("./main")
      .then(({ updateBodyAtlasControls }) => {
        updateBodyAtlasControls({
          sportCount: atlasSportCount,
          sort: selectedSort,
          view: selectedView,
        });
      })
      .catch((error) => {
        console.error("Body Atlas control sync failed", error);
      });
  }, [selectedSort, selectedView]);

  useEffect(() => {
    const controlsNode = controlsBarRef.current;

    if (!controlsNode) {
      return;
    }

    const syncHeight = () => {
      setControlsBarHeight(controlsNode.getBoundingClientRect().height);
    };

    syncHeight();

    const observer = new ResizeObserver(() => {
      syncHeight();
    });

    observer.observe(controlsNode);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const controlsShellNode = controlsShellRef.current;

    if (!controlsShellNode) {
      return;
    }

    let frameId = 0;

    const syncPinnedState = () => {
      frameId = 0;
      setIsControlsPinned(controlsShellNode.getBoundingClientRect().top <= 73);
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
  }, []);

  return (
    <main
      className={`${atlasDisplayFont.variable} ${atlasBodyFont.variable} ${atlasDataFont.variable} relative min-h-screen bg-[#050505] text-[#f5f2eb]`}
    >
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <TransitionLink
            href="/?menu=1"
            transition={{
              sourceLabel: "HEAT 02",
              destinationLabel: "HOME ARENA",
              title: "Olympic Data Stories",
            }}
            className="font-dm-mono rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:border-[#c9a84c] hover:text-white"
          >
            Volver a home
          </TransitionLink>

          <div className="text-right">
            <p
              className="text-[11px] uppercase tracking-[0.32em] text-[#c9a84c]"
              style={{ fontFamily: "var(--font-atlas-data)" }}
            >
              02 / Body Atlas
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
              Controles exploratorios y copy contextual
            </p>
          </div>
        </div>
      </header>

      <section
        className="relative flex min-h-screen items-end overflow-hidden"
        style={{
          backgroundColor: "#e7dfd2",
          backgroundImage:
            "linear-gradient(180deg, rgba(247,243,236,0.88) 0%, rgba(239,232,219,0.62) 34%, rgba(18,18,18,0.74) 100%), url('/images/body-atlas-texture.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,250,240,0.72),_rgba(201,168,76,0.18)_28%,_transparent_58%)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pb-14 pt-28 sm:px-8 sm:pb-18 lg:pb-24 lg:pt-32">
          <div className="max-w-4xl space-y-6">
            <p
              className="text-[11px] uppercase tracking-[0.35em] text-[#c9a84c]"
              style={{ fontFamily: "var(--font-atlas-data)" }}
            >
              02 / BODY ATLAS
            </p>

            <div className="space-y-2">
              <h1
                className="text-[clamp(4.5rem,16vw,11rem)] uppercase leading-[0.86] text-white"
                style={{ fontFamily: "var(--font-atlas-display)" }}
              >
                The Body
              </h1>
              <h2
                className="text-[clamp(4.5rem,16vw,11rem)] uppercase leading-[0.86] text-[#c9a84c]"
                style={{ fontFamily: "var(--font-atlas-display)" }}
              >
                The Sport Built
              </h2>
            </div>

            <div className="h-px w-40 bg-white/18 sm:w-56" />

            <div className="max-w-lg space-y-3">
              <p
                className="text-[clamp(3.5rem,8vw,5.5rem)] uppercase leading-none text-white"
                style={{ fontFamily: "var(--font-atlas-display)" }}
              >
                28.3 CM
              </p>
              <p
                className="text-xl italic text-white/72 sm:text-2xl"
                style={{ fontFamily: "var(--font-atlas-body)" }}
              >
                Separate the shortest Olympic silhouette from the tallest one on the floor.
              </p>
            </div>

            <p
              className="text-[11px] uppercase tracking-[0.3em] text-white/62"
              style={{ fontFamily: "var(--font-atlas-data)" }}
            >
              Click a sport to explore ↓
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,24rem)]">
            <div className="rounded-[2rem] border border-white/12 bg-black/38 p-6 shadow-[0_18px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm">
              <p
                className="text-[11px] uppercase tracking-[0.3em] text-white/54"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                Story frame
              </p>
              <p className="mt-4 max-w-2xl text-balance text-lg italic text-white/80 sm:text-xl" style={{ fontFamily: "var(--font-atlas-body)" }}>
                Body Atlas arranca como una pieza editorial exploratoria: hero inmersivo, controles persistentes y un escenario listo para conectar D3 sin tocar los estilos globales.
              </p>
            </div>

            <aside className="rounded-[2rem] border border-[#c9a84c]/30 bg-[#0d0d0d]/80 p-6">
              <p
                className="text-[11px] uppercase tracking-[0.3em] text-[#c9a84c]"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                Context panel
              </p>
              <div className="mt-4 space-y-3 text-white/74" style={{ fontFamily: "var(--font-atlas-data)" }}>
                <p>20 SPORTS IN DATASET</p>
                <p>2 DATA VIEWS</p>
                <p>3 SORT LENSES</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div
        ref={controlsShellRef}
        className="relative z-40"
        style={isControlsPinned && controlsBarHeight > 0 ? { height: controlsBarHeight } : undefined}
      >
        <div
          ref={controlsBarRef}
          className={`${isControlsPinned ? "fixed inset-x-0 top-[73px] border-y border-white/10 bg-black/88 backdrop-blur-xl" : "border-y border-white/10 bg-black/88 backdrop-blur-xl"}`}
        >
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <fieldset className="flex flex-wrap items-center gap-3" aria-label="Select athlete dataset">
              <legend
                className="text-[11px] uppercase tracking-[0.28em] text-white/48"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                View
              </legend>
              {atlasViews.map((option) => {
                const isActive = option.key === selectedView;

                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={isActive}
                    aria-controls="body-atlas-root"
                    aria-label={`Show ${option.label.toLowerCase()} athlete dataset`}
                    onClick={() => {
                      setSelectedView(option.key);
                    }}
                    className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      isActive
                        ? "bg-[#c9a84c] text-black"
                        : "border border-white/16 text-white/72 hover:border-[#c9a84c]/50 hover:text-white"
                    }`}
                    style={{ fontFamily: "var(--font-atlas-data)" }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </fieldset>

            <fieldset className="flex flex-wrap items-center gap-3" aria-label="Sort sports by metric">
              <legend
                className="text-[11px] uppercase tracking-[0.28em] text-white/48"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                Sort by
              </legend>
              {sortOptions.map((option) => {
                const isActive = option.key === selectedSort;

                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={isActive}
                    aria-controls="body-atlas-root"
                    aria-label={`Sort sports by ${option.label.toLowerCase()}`}
                    onClick={() => {
                      setSelectedSort(option.key);
                    }}
                    className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      isActive
                        ? "bg-white text-black"
                        : "border border-white/16 text-white/72 hover:border-[#c9a84c]/50 hover:text-white"
                    }`}
                    style={{ fontFamily: "var(--font-atlas-data)" }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </fieldset>

            <p
              aria-live="polite"
              className="text-[11px] uppercase tracking-[0.28em] text-white/48"
              style={{ fontFamily: "var(--font-atlas-data)" }}
            >
              Showing {atlasSportCount} sports
            </p>
          </div>

          <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
            <div className="space-y-2">
              <p
                className="text-[11px] uppercase tracking-[0.28em] text-[#c9a84c]"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                Active lens
              </p>
              <p
                aria-live="polite"
                className="text-sm uppercase tracking-[0.24em] text-white/72"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                {selectedViewLabel} athletes · sorted by {selectedSortLabel}
              </p>
            </div>

            <p
              aria-live="polite"
              className="max-w-4xl text-lg italic text-white/78 sm:text-xl"
              style={{ fontFamily: "var(--font-atlas-body)" }}
            >
              {contextualCopy}
            </p>
          </div>
        </div>
      </div>
      </div>

      <section className="relative bg-[#050505]">
        <div
          ref={atlasRootRef}
          id="body-atlas-root"
          className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-10 sm:px-8 lg:py-14"
        >
          <div className="max-w-3xl space-y-3">
            <p
              className="text-[11px] uppercase tracking-[0.28em] text-[#c9a84c]"
              style={{ fontFamily: "var(--font-atlas-data)" }}
            >
              Preview slice
            </p>
            <p className="text-xl italic text-white/72 sm:text-2xl" style={{ fontFamily: "var(--font-atlas-body)" }}>
              {selectedViewLabel} athletes ranked by {selectedSortLabel.toLowerCase()}. The live D3 atlas can now inherit the same control state and contextual framing.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedPreviewSports.map((item) => {
              const profile = item[selectedView];
              const metricValue = profile[selectedSort];
              const silhouetteHeight = `${Math.max(36, (metricValue / maxMetricValue) * 100)}%`;

              return (
                <article
                  key={item.sport}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#c9a84c]/40"
                >
                  <div className="flex min-h-56 items-end justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex h-48 items-end justify-center rounded-[1.5rem] border border-dashed border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.08))] px-6 pb-5">
                        <div className="w-14 rounded-t-full bg-[#c9a84c]/55 transition-[height] duration-500" style={{ height: silhouetteHeight }} />
                      </div>
                    </div>
                    <div className="w-28 text-right">
                      <p className="text-3xl uppercase text-white" style={{ fontFamily: "var(--font-atlas-display)" }}>
                        {formatMetricValue(selectedSort, metricValue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p
                      className="text-[11px] uppercase tracking-[0.28em] text-[#c9a84c]"
                      style={{ fontFamily: "var(--font-atlas-data)" }}
                    >
                      {item.sport}
                    </p>
                    <p className="text-lg italic text-white/68" style={{ fontFamily: "var(--font-atlas-body)" }}>
                      {profile.detail}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p
                  className="text-[11px] uppercase tracking-[0.28em] text-white/48"
                  style={{ fontFamily: "var(--font-atlas-data)" }}
                >
                  Next slice
                </p>
                <p className="text-2xl text-white sm:text-3xl" style={{ fontFamily: "var(--font-atlas-display)" }}>
                  Sticky controls are ready. The D3 silhouette grid can mount into this shell next.
                </p>
              </div>

              <TransitionLink
                href="/cementerio-olimpico"
                transition={{
                  sourceLabel: "HEAT 02",
                  destinationLabel: "HEAT 03",
                  title: "El Cementerio Olimpico",
                }}
                className="font-dm-mono w-fit rounded-full border border-[#c9a84c]/40 px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-[#f5f2eb] transition-colors hover:border-[#c9a84c] hover:bg-[#c9a84c]/10"
              >
                Siguiente historia
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
