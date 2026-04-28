"use client";

import { useEffect } from "react";
import { Bebas_Neue, Cormorant_Garamond, DM_Mono } from "next/font/google";
import { TransitionLink, useRouteTransition } from "@/components/route-transition";
import { buildColdWarMarkup, destroyColdWar, initSidePicker } from "./main";
import "./cold-war.css";

const cwDisplayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cw-display",
});

const cwBodyFont = Cormorant_Garamond({
  weight: ["300", "400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cw-body",
});

const cwDataFont = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-cw-data",
});

export default function ColdWarInGoldPage() {
  const markup = buildColdWarMarkup();
  const fontClassName = `${cwDisplayFont.variable} ${cwBodyFont.variable} ${cwDataFont.variable}`;
  const { markPageReady } = useRouteTransition();

  useEffect(() => {
    initSidePicker();
    markPageReady();

    return () => {
      destroyColdWar();
    };
  }, [markPageReady]);

  return (
    <main className={`cw-page-shell ${fontClassName}`}>
      <header className="cw-top-nav" aria-label="Cold War in Gold navigation">
        <TransitionLink
          href="/?menu=1"
          transition={{
            sourceLabel: 'HEAT 01',
            destinationLabel: 'HOME ARENA',
            title: 'Olympic Data Stories',
          }}
          className="cw-top-nav__link"
        >
          Back to home
        </TransitionLink>
      </header>
      <div
        id="cold-war-root"
        className="cw-side-picker-container"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </main>
  );
}
