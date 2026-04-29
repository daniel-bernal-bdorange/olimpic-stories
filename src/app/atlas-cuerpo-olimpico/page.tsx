"use client";

import { useEffect, useRef } from "react";
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

const sortOptions = ["Height", "Weight", "BMI"];
const previewSports = [
  { sport: "Basketball", metric: "191.2 CM", detail: "Tallest Olympic profile" },
  { sport: "Artistic Gymnastics", metric: "162.9 CM", detail: "Shortest baseline" },
  { sport: "Weightlifting", metric: "BMI 27.8", detail: "Highest mass density" },
];

export default function AtlasCuerpoOlimpicoPage() {
  const atlasRootRef = useRef<HTMLDivElement | null>(null);
  const { markPageReady } = useRouteTransition();

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};

    void import("./main")
      .then(({ destroyBodyAtlas, initBodyAtlas }) => {
        if (cancelled) {
          return;
        }

        initBodyAtlas(atlasRootRef.current);
        dispose = () => {
          destroyBodyAtlas();
        };
        markPageReady();
      })
      .catch(() => {
        markPageReady();
      });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [markPageReady]);

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
              Shell cliente y hero base
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
                <p>15 SPORTS ANALYZED</p>
                <p>100K+ ATHLETES</p>
                <p>LAYOUT READY FOR D3</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-[#050505]">
        <div className="sticky top-[73px] z-40 border-b border-white/10 bg-black/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-[11px] uppercase tracking-[0.28em] text-white/48"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                View
              </span>
              <button
                type="button"
                className="rounded-full bg-[#c9a84c] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-black"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                Male
              </button>
              <button
                type="button"
                className="rounded-full border border-white/16 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/72"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                Female
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-[11px] uppercase tracking-[0.28em] text-white/48"
                style={{ fontFamily: "var(--font-atlas-data)" }}
              >
                Sort by
              </span>
              {sortOptions.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={index === 0 ? "rounded-full bg-white px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-black" : "rounded-full border border-white/16 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/72"}
                  style={{ fontFamily: "var(--font-atlas-data)" }}
                >
                  {option}
                </button>
              ))}
            </div>

            <p
              className="text-[11px] uppercase tracking-[0.28em] text-white/48"
              style={{ fontFamily: "var(--font-atlas-data)" }}
            >
              Showing 20 sports
            </p>
          </div>
        </div>

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
              Body atlas shell
            </p>
            <p className="text-xl italic text-white/72 sm:text-2xl" style={{ fontFamily: "var(--font-atlas-body)" }}>
              Showing average height and weight of Olympic athletes by sport. Data from 100,000+ athletes across 128 years of competition.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {previewSports.map((item) => (
              <article
                key={item.sport}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex min-h-56 items-end justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex h-48 items-end justify-center rounded-[1.5rem] border border-dashed border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.08))] px-6 pb-5">
                      <div className="h-full w-14 rounded-t-full bg-[#c9a84c]/55" />
                    </div>
                  </div>
                  <div className="w-28 text-right">
                    <p className="text-3xl uppercase text-white" style={{ fontFamily: "var(--font-atlas-display)" }}>
                      {item.metric}
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
                    {item.detail}
                  </p>
                </div>
              </article>
            ))}
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
