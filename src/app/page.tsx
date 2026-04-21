import Link from "next/link";
import { storySections } from "@/lib/sections";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10 md:py-10">
        <header className="grid gap-6 border-b border-border pb-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Olympic Data Story
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Datos olimpicos convertidos en historias visuales
            </h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted md:justify-self-end">
            Proyecto narrativo para concurso de visualizacion de datos con
            enfoque editorial. Selecciona una historia para abrir su pagina con
            scroll explicativo e interacciones.
          </p>
        </header>

        <section className="flex flex-1 items-center py-10 md:py-16">
          <ul className="w-full space-y-5">
            {storySections.map((section, index) => (
              <li key={section.slug}>
                <Link
                  href={`/${section.slug}`}
                  className="group grid gap-4 border-b border-border py-6 transition-colors hover:border-accent md:grid-cols-[auto_1fr_auto] md:items-end"
                >
                  <span className="text-xs tracking-[0.2em] text-muted md:pb-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-5xl">
                      {section.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted md:text-base">
                      {section.subtitle}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.25em] text-muted md:pb-2">
                    Enter
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-border pt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Base layout ready - next task: animated central menu
          </p>
        </footer>
      </main>
    </div>
  );
}
