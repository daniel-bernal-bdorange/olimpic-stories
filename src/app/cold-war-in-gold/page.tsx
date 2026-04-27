"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buildSidePickerMarkup, initSidePicker } from "./main";
import "./cold-war.css";

export default function ColdWarInGoldPage() {
  const markup = buildSidePickerMarkup();

  useEffect(() => {
    initSidePicker();
  }, []);

  return (
    <main className="cw-page-shell">
      <header className="cw-top-nav" aria-label="Cold War in Gold navigation">
        <Link href="/?menu=1" className="cw-top-nav__link">
          Back to home
        </Link>
      </header>
      <div
        id="cold-war-root"
        className="cw-side-picker-container"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </main>
  );
}
