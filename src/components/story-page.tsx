import Link from "next/link";

type StoryPageProps = {
  title: string;
  subtitle: string;
  description: string;
};

export function StoryPage({ title, subtitle, description }: StoryPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-12 text-neutral-100">
      <Link
        href="/"
        className="w-fit text-sm uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-200"
      >
        Volver al menu
      </Link>

      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.15em] text-neutral-500">
          {subtitle}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          {title}
        </h1>
      </header>

      <section className="space-y-5 text-neutral-300">
        <p>{description}</p>
        <p>
          Proximo paso: sustituir este bloque por secciones de scroll narrativo,
          visualizaciones interactivas y texto explicativo basado en tus datos.
        </p>
      </section>
    </main>
  );
}
