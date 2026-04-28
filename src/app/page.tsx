'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type StoryItem = {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  slug: string;
  image: string;
  accentColor: string;
  metadata: {
    label: string;
    stats: string[];
  };
};

type TransitionState = {
  destinationSlug: string;
  destinationTitle: string;
  destinationNumber: string;
  sourceNumber?: string;
};

const storiesData: StoryItem[] = [
  {
    id: 'cold-war-in-gold',
    number: '01',
    title: 'COLD WAR IN GOLD',
    category: 'DATA STORY · 1952-2020',
    description: 'Dos superpotencias. Una sola tabla de clasificacion. Como la Guerra Fria se libro en los marcadores olimpicos.',
    slug: 'cold-war-in-gold',
    image: '/images/cold_war_in_gold.jpg',
    accentColor: 'var(--ring-red)',
    metadata: {
      label: 'COLD WAR IN GOLD',
      stats: ['68 YEARS OF DATA', '16 OLYMPIC GAMES', '2 SUPERPOWERS'],
    },
  },
  {
    id: 'body-atlas',
    number: '02',
    title: 'BODY ATLAS',
    category: 'DATA STORY · 15 SPORTS',
    description: 'El deporte que practicas moldea el cuerpo que tienes. 28 centimetros separan al gimnasta del jugador de baloncesto.',
    slug: 'atlas-cuerpo-olimpico',
    image: '/images/Body_atlas.png',
    accentColor: 'var(--ring-blue)',
    metadata: {
      label: 'BODY ATLAS',
      stats: ['15 SPORTS ANALYZED', '100K+ ATHLETES', '28CM DIFFERENCE'],
    },
  },
  {
    id: 'lost-sports',
    number: '03',
    title: 'LOST SPORTS',
    category: 'DATA STORY · 1900-1936',
    description: 'Cricket, soga, polo, pelota vasca. Nueve deportes que los Juegos Olimpicos olvidaron para siempre.',
    slug: 'cementerio-olimpico',
    image: '/images/lost_sporgs.png',
    accentColor: 'var(--ring-green)',
    metadata: {
      label: 'LOST SPORTS',
      stats: ['9 FORGOTTEN SPORTS', '1900 - 1936', 'GBR DOMINATED ALL'],
    },
  },
  {
    id: 'one-life',
    number: '04',
    title: 'ONE LIFE, TEN GAMES',
    category: 'DATA STORY · 1964-2012',
    description: 'Un jinete canadiense compitio en diez Olimpiadas durante cuarenta anos. Estas son las vidas mas largas del deporte.',
    slug: '10-olimpiadas-una-vida',
    image: '/images/one_life_ten_games.png',
    accentColor: 'var(--ring-yellow)',
    metadata: {
      label: 'ONE LIFE, TEN GAMES',
      stats: ['10 OLYMPIC GAMES', '40 YEARS COMPETING', '6 EXTRAORDINARY LIVES'],
    },
  },
];

const OlympicRings = () => (
  <svg
    viewBox="0 0 110 60"
    className="h-10 w-auto opacity-100 hover:opacity-100 transition-opacity duration-400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="15" cy="30" r="10" stroke="#0085c7" strokeWidth="2.5" />
    <circle cx="55" cy="30" r="10" stroke="#000000" strokeWidth="2.5" />
    <circle cx="95" cy="30" r="10" stroke="#d4271f" strokeWidth="2.5" />
    <circle cx="35" cy="50" r="10" stroke="#f4c300" strokeWidth="2.5" />
    <circle cx="75" cy="50" r="10" stroke="#009f3d" strokeWidth="2.5" />
  </svg>
);

const Header = ({ isVisible }: { isVisible: boolean }) => (
  <header
    className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gold/20 py-4 sm:py-6 lg:py-8 transition-opacity duration-500"
    style={{
      backgroundImage: "url('/images/carbonfiber.png')",
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'rgba(244, 244, 245, 0.7)',
      backgroundBlendMode: 'multiply',
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
    }}
  >
    <div className="px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-6 group cursor-pointer">
        <div className="flex flex-col">
          <div className="font-bebas text-zinc-100 text-3xl sm:text-4xl lg:text-5xl tracking-wider leading-none">ODS</div>
          <div className="font-dm-mono text-xs text-amber-200 tracking-widest mt-1">OLYMPIC DATA</div>
        </div>
        <div className="h-8 sm:h-12 w-px bg-amber-200/50" />
        <div className="flex flex-col">
          <div className="font-bebas text-lg sm:text-xl lg:text-2xl text-zinc-100 tracking-wider">OLYMPIC</div>
          <div className="font-dm-mono text-[10px] sm:text-xs text-zinc-300 tracking-widest">DATA STORIES</div>
        </div>
      </div>

      <div className="hidden sm:block">
        <OlympicRings />
      </div>
    </div>
  </header>
);

const SectionsList = ({
  activeIndex,
  onHover,
  onSelect,
}: {
  activeIndex: number;
  onHover: (idx: number) => void;
  onSelect: (slug: string) => void;
}) => (
  <aside className="w-full lg:w-1/4 flex lg:flex-col lg:justify-center pt-6 lg:pt-20 px-4 sm:px-8 gap-4 lg:space-y-12 lg:gap-0 bg-white overflow-x-auto">
    {storiesData.map((story, idx) => (
      <div
        key={story.id}
        onMouseEnter={() => onHover(idx)}
        onClick={() => onSelect(story.slug)}
        className="group cursor-pointer min-w-[12rem] lg:min-w-0"
      >
        <div
          className={`font-dm-mono text-xs tracking-widest mb-1 transition-colors duration-300 ${
            activeIndex === idx ? 'text-gold-accent' : 'text-muted'
          }`}
        >
          {story.number}
        </div>

        <div
          className={`font-bebas tracking-wider mb-3 transition-colors duration-300 ${
            activeIndex === idx ? 'text-foreground' : 'text-gray-400'
          }`}
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 3.2rem)',
            lineHeight: '1.1',
          }}
        >
          {story.title}
        </div>

        <div
          className="transition-all duration-600 ease-out"
          style={{
            borderLeft: activeIndex === idx ? '3px solid var(--gold-accent)' : '3px solid transparent',
            borderBottom: activeIndex === idx ? '2px solid var(--gold-accent)' : '2px solid transparent',
            width: '100%',
            paddingLeft: activeIndex === idx ? '12px' : '0',
          }}
        />
      </div>
    ))}
  </aside>
);

const CarouselCenter = ({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (slug: string) => void;
}) => {
  return (
    <section className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 bg-white overflow-hidden">
      <div className="relative w-full max-w-sm sm:max-w-md h-72 sm:h-80 lg:h-96">
        {storiesData.map((story, idx) => {
          const position = idx - activeIndex;

          let yTranslate = 0;
          let scale = 0.7;
          let opacity = 0.5;
          let zIndex = 10;

          if (position === 0) {
            yTranslate = 0;
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (position === -1) {
            yTranslate = -180;
            scale = 0.7;
            opacity = 0.6;
            zIndex = 20;
          } else if (position === 1) {
            yTranslate = 180;
            scale = 0.7;
            opacity = 0.6;
            zIndex = 20;
          } else {
            yTranslate = position > 0 ? 600 : -600;
            scale = 0.6;
            opacity = 0;
            zIndex = 5;
          }

          return (
            <div
              key={story.id}
              onClick={() => onSelect(story.slug)}
              className={`absolute inset-0 transition-all duration-700 ease-out rounded-lg overflow-hidden shadow-2xl cursor-pointer ${position !== 0 ? 'hidden sm:block' : ''}`}
              style={{
                transform: `translateY(${yTranslate}px) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover"
                style={{
                  filter: position === 0 ? 'grayscale(0%)' : 'grayscale(100%)',
                }}
              />

              {position === 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
              )}

              <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                <div className="font-bebas text-sm text-white bg-black/70 px-3 py-1 rounded tracking-wide">
                  {story.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const DescriptionPanel = ({
  activeIndex,
  onExplore,
}: {
  activeIndex: number;
  onExplore: (slug: string) => void;
}) => {
  const story = storiesData[activeIndex];

  return (
    <aside className="w-full lg:w-1/4 flex flex-col justify-center px-4 sm:px-8 py-4 lg:py-0 space-y-6 lg:space-y-8 bg-white">
      <div>
        <div className="font-dm-mono text-xs tracking-widest text-gold-accent mb-4">
          {story.metadata.label}
        </div>
        <div className="border-b border-gold-accent/30 mb-6" />

        <div className="space-y-6">
          {story.metadata.stats.map((stat, idx) => {
            const parts = stat.includes(' - ') ? stat.split(' - ') : stat.split(' ');
            const number = parts[0];
            const label = parts.slice(1).join(' ') || stat;
            return (
              <div key={idx}>
                <div className="font-bebas" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.8rem)', color: '#18181b', lineHeight: '1' }}>
                  {number}
                </div>
                <div className="font-dm-mono text-xs text-gray-500 tracking-widest mt-1">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm text-foreground leading-relaxed font-light mb-6">
          {story.description}
        </p>

        <button
          type="button"
          onClick={() => onExplore(story.slug)}
          className="inline-flex items-center gap-2 font-dm-mono text-xs tracking-widest text-foreground hover:text-gold-accent transition-colors duration-300 group cursor-pointer"
        >
          <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--gold-accent)' }}>
            {'->'}
          </span>
          ENTER STORY
        </button>
      </div>
    </aside>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gold/20" style={{ backgroundImage: "url('/images/carbonfiber.png')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundColor: 'rgba(244, 244, 245, 0.7)', backgroundBlendMode: 'multiply' }}>
    <div className="h-10 px-4 sm:px-8 flex items-center justify-between text-[10px] sm:text-xs text-zinc-200 font-dm-mono tracking-widest">
      <span>© 2026</span>
      <span className="hidden sm:inline">4 DATA STORIES</span>
      <span>SCROLL TO VIEW ALL</span>
    </div>
  </footer>
);

const CompetitionTransition = ({
  transition,
}: {
  transition: TransitionState | null;
}) => {
  if (!transition) {
    return null;
  }

  const sourceLabel = transition.sourceNumber ? `HEAT ${transition.sourceNumber}` : 'HOME ARENA';
  const destinationLabel = `HEAT ${transition.destinationNumber}`;

  return (
    <div className="competition-transition" role="status" aria-live="polite">
      <div className="competition-transition__scanline" />
      <div className="competition-transition__score" />
      <div className="competition-transition__content">
        <p className="competition-transition__eyebrow">QUALIFICATION TRANSFER</p>
        <h2 className="competition-transition__title">
          {sourceLabel}
          <span>{destinationLabel}</span>
        </h2>
        <p className="competition-transition__subtitle">{transition.destinationTitle}</p>
        <div className="competition-transition__rings" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showHeader, setShowHeader] = useState(false);
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const hasAutoTriggeredRef = useRef(false);

  const startTransition = useCallback(
    (destinationSlug: string, sourceSlug?: string) => {
      if (transitionTimeoutRef.current !== null) {
        return;
      }

      const destinationStory = storiesData.find((story) => story.slug === destinationSlug);
      if (!destinationStory) {
        return;
      }

      const sourceStory = sourceSlug ? storiesData.find((story) => story.slug === sourceSlug) : undefined;

      setTransition({
        destinationSlug,
        destinationTitle: destinationStory.title,
        destinationNumber: destinationStory.number,
        sourceNumber: sourceStory?.number,
      });

      transitionTimeoutRef.current = window.setTimeout(() => {
        router.push(`/${destinationSlug}`);
      }, 1000);
    },
    [router],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get('menu') === '1') {
      // Saltar la portada hero y mostrar directamente el menú de historias
      window.scrollTo({ top: window.innerHeight, behavior: 'instant' });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setShowHeader(scrollTop > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop < window.innerHeight) {
        return;
      }

      e.preventDefault();

      if (e.deltaY > 0) {
        setActiveStoryIndex((prev) =>
          prev < storiesData.length - 1 ? prev + 1 : prev,
        );
      } else {
        setActiveStoryIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const targetSlug = searchParams.get('target');
    if (!targetSlug || hasAutoTriggeredRef.current) {
      return;
    }

    const targetIndex = storiesData.findIndex((story) => story.slug === targetSlug);
    if (targetIndex < 0) {
      return;
    }

    hasAutoTriggeredRef.current = true;

    const fromSlug = searchParams.get('from') || undefined;
    const autoTimer = window.setTimeout(() => {
      startTransition(targetSlug, fromSlug);
    }, 520);

    return () => window.clearTimeout(autoTimer);
  }, [startTransition]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      <section className="relative w-full h-screen flex flex-col items-center justify-center bg-white bg-cover bg-center" style={{ backgroundImage: "url('/images/hero_bg.png')" }}>
        <div className="absolute inset-0 bg-white/65" />

        <div className="relative z-10 text-center">
          <h1 className="font-bebas text-foreground tracking-wider" style={{ fontSize: 'clamp(4rem, 16vw, 16rem)', lineHeight: '0.9' }}>
            OLYMPIC
          </h1>
          <h2 className="font-bebas text-foreground tracking-wider" style={{ fontSize: 'clamp(4rem, 16vw, 16rem)', lineHeight: '0.9' }}>
            DATA
          </h2>
          <h3 className="font-bebas text-foreground tracking-wider" style={{ fontSize: 'clamp(4rem, 16vw, 16rem)', lineHeight: '0.9' }}>
            STORIES
          </h3>
          <p className="font-dm-mono text-muted tracking-widest text-xs mt-8">SCROLL TO EXPLORE</p>
        </div>
      </section>

      <div className="relative w-full">
        <Header isVisible={showHeader} />

        <main className="flex flex-col lg:flex-row pt-20 sm:pt-24 lg:pt-32 pb-10 min-h-screen lg:h-screen relative z-10 bg-white">
          <SectionsList
            activeIndex={activeStoryIndex}
            onHover={setActiveStoryIndex}
            onSelect={(slug) => startTransition(slug)}
          />

          <CarouselCenter
            activeIndex={activeStoryIndex}
            onSelect={(slug) => startTransition(slug)}
          />

          <DescriptionPanel
            activeIndex={activeStoryIndex}
            onExplore={(slug) => startTransition(slug)}
          />
        </main>

        <Footer />
      </div>

      <CompetitionTransition transition={transition} />
    </div>
  );
}
