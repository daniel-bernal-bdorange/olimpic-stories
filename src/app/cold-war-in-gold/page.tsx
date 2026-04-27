"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./cold-war.css";

export default function ColdWarInGoldPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let mounted = true;

    void import("./main").then(({ initColdWar }) => {
      if (!mounted || !containerRef.current) {
        return;
      }

      initColdWar(containerRef.current);
    });

    return () => {
      mounted = false;
      void import("./main").then(({ destroyColdWar }) => {
        destroyColdWar();
      });
    };
  }, []);

  return (
    <main className="cw-page-shell">
      <header className="cw-top-nav" aria-label="Cold War in Gold navigation">
        <Link href="/?menu=1" className="cw-top-nav__link">
          Back to home
        </Link>
      </header>
      <div ref={containerRef} id="cold-war-root" />
    </main>
  );
}
