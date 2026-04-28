import { RouteTransitionReady, TransitionLink } from "@/components/route-transition";
import { storySections } from "@/lib/sections";

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
  const sourceLabel = currentIndex >= 0 ? `HEAT ${String(currentIndex + 1).padStart(2, '0')}` : 'CURRENT STORY';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12 text-foreground">
      <RouteTransitionReady />
      <div className="flex flex-wrap items-center gap-3">
        <TransitionLink
          href="/?menu=1"
          transition={{
            sourceLabel,
            destinationLabel: 'HOME ARENA',
            title: 'Olympic Data Stories',
          }}
          className="inline-flex w-fit rounded-full border border-zinc-300 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
        >
          Volver a home
        </TransitionLink>

        {previousStory ? (
          <TransitionLink
            href={`/${previousStory.slug}`}
            transition={{
              sourceLabel,
              destinationLabel: `HEAT ${String(currentIndex).padStart(2, '0')}`,
              title: previousStory.title,
            }}
            className="inline-flex w-fit rounded-full border border-zinc-300 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
          >
            Historia anterior
          </TransitionLink>
        ) : null}

        {nextStory ? (
          <TransitionLink
            href={`/${nextStory.slug}`}
            transition={{
              sourceLabel,
              destinationLabel: `HEAT ${String(currentIndex + 2).padStart(2, '0')}`,
              title: nextStory.title,
            }}
            className="inline-flex w-fit rounded-full border border-amber-500 bg-amber-100 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-900 transition-colors hover:bg-amber-200"
          >
            Historia siguiente
          </TransitionLink>
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
              <TransitionLink
                key={story.slug}
                href={`/${story.slug}`}
                transition={{
                  sourceLabel,
                  destinationLabel: `HEAT ${String(storySections.findIndex((section) => section.slug === story.slug) + 1).padStart(2, '0')}`,
                  title: story.title,
                }}
                className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
              >
                {story.title}
              </TransitionLink>
            ))}
        </div>
      </section>
    </main>
  );
}
