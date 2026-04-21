import Link from "next/link";
import { storySections } from "@/lib/sections";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-10 text-neutral-50">
      <main className="w-full max-w-5xl">
        <p className="mb-10 text-xs uppercase tracking-[0.3em] text-neutral-400">
          Olympic Data Story
        </p>
        <ul className="space-y-6">
          {storySections.map((section) => (
            <li key={section.slug}>
              <Link
                href={`/${section.slug}`}
                className="group block border-b border-neutral-700 pb-6 transition-colors hover:border-neutral-200"
              >
                <h2 className="text-3xl font-semibold tracking-tight text-neutral-100 transition-colors group-hover:text-white md:text-5xl">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-neutral-400 md:text-base">
                  {section.subtitle}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
