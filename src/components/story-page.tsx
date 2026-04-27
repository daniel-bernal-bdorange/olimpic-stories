import Link from "next/link";
import { storySections } from "@/lib/sections";
import { PageReveal } from "@/components/page-reveal";

type StoryPageProps = {
  title: string;
  subtitle: string;
  description: string;
  slug: string;
};

export function StoryPage({ title, subtitle, description, slug }: StoryPageProps) {
  const currentIndex = storySections.findIndex((story) => story.slug === slug);
  const previousStory = currentIndex > 0 ? storySections[currentIndex - 1] : null;
  const nextStory = currentIndex >= 0 && currentIndex < storySections.length - 1
    ? storySections[currentIndex + 1]
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12 text-foreground">
      <PageReveal />
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/?menu=1"
          className="inline-flex w-fit rounded-full border border-zinc-300 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
        >
          Volver a home
        </Link>

        {previousStory ? (
          <Link
            href={`/${previousStory.slug}`}
            className="inline-flex w-fit rounded-full border border-zinc-300 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
          >
            Historia anterior
          </Link>
        ) : null}

        {nextStory ? (
          <Link
            href={`/${nextStory.slug}`}
            className="inline-flex w-fit rounded-full border border-amber-500 bg-amber-100 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-900 transition-colors hover:bg-amber-200"
          >
            Historia siguiente
          </Link>
        ) : null}
      </div>

      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.15em] text-zinc-500">
          {subtitle}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          {title}
        </h1>
      </header>

      <section className="space-y-5 text-zinc-700">
        <p>{description}</p>
        <p>
          Proximo paso: sustituir este bloque por secciones de scroll narrativo,
          visualizaciones interactivas y texto explicativo basado en tus datos.
        </p>
      </section>

      <section className="space-y-4 border-t border-zinc-200 pt-6">
        <p className="font-dm-mono text-xs uppercase tracking-[0.24em] text-zinc-500">
          Cambiar de historia via home
        </p>
        <div className="flex flex-wrap gap-3">
          {storySections
            .filter((story) => story.slug !== slug)
            .map((story) => (
              <Link
                key={story.slug}
                href={`/${story.slug}`}
                className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
              >
                {story.title}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
