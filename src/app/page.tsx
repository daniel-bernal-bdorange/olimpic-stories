'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RouteTransitionReady, useRouteTransition } from '@/components/route-transition';

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

const storiesData: StoryItem[] = [
  {
    id: 'cold-war-in-gold',
    number: '01',
    title: 'COLD WAR IN GOLD',
    category: 'DATA STORY · 1952–2020',
    description: 'Two superpowers. One scoreboard. How the Cold War was fought on Olympic scoreboards.',
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
    description: 'The sport you play shapes the body you have. 28 centimetres separate the gymnast from the basketball player.',
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
    category: 'DATA STORY · 1900–2012',
    description: 'Cricket, tug of war, polo, Basque pelota. Thirty-two sports the Olympic Games forgot forever.',
    slug: 'cementerio-olimpico',
    image: '/images/lost_sporgs.png',
    accentColor: 'var(--ring-green)',
    metadata: {
      label: 'LOST SPORTS',
      stats: ['32 FORGOTTEN SPORTS', '1900 — 2012', 'PARIS WAS THE WORST'],
    },
  },
  {
    id: 'one-life',
    number: '04',
    title: 'ONE LIFE, TEN GAMES',
    category: 'DATA STORY · 1948–2022',
    description: 'A Canadian equestrian competed in ten Olympics over forty years. These are the longest careers in sport.',
    slug: '10-olimpiadas-una-vida',
    image: '/images/one_life_ten_games.png',
    accentColor: 'var(--ring-yellow)',
    metadata: {
      label: 'ONE LIFE, TEN GAMES',
      stats: ['10 OLYMPIC GAMES', '40 YEARS COMPETING', '10 EXTRAORDINARY LIVES'],
    },
  },
];

const OlympicRings = () => (
  <Image
    src="/images/Olympic_rings_without_rims.png"
    alt="Olympic rings"
    width={160}
    height={54}
    className="h-10 w-auto opacity-100 transition-opacity duration-400"
    priority
  />
);

const chromeTextureStyle = {
  backgroundImage:
    "linear-gradient(180deg, rgba(7, 7, 8, 0.92) 0%, rgba(12, 12, 14, 0.78) 100%), url('/images/carbonfiber.png')",
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#09090b',
  backgroundBlendMode: 'multiply',
} as const;

const headerChromeStyle = {
  background: 'transparent',
  backdropFilter: 'none',
} as const;

const panelSurfaceStyle = {
  background:
    'linear-gradient(180deg, rgba(20, 20, 23, 0.56) 0%, rgba(12, 12, 14, 0.38) 100%)',
  borderColor: 'rgba(201, 168, 76, 0.12)',
  backdropFilter: 'blur(8px)',
} as const;

const mainStageStyle = {
  background:
    "radial-gradient(circle at top left, rgba(201, 168, 76, 0.12), transparent 30%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.08), transparent 28%), linear-gradient(180deg, rgba(8, 8, 10, 0.62) 0%, rgba(15, 15, 17, 0.56) 100%), url('/images/fondo-home.png')",
  backgroundSize: 'cover, cover, cover, 420px auto',
  backgroundPosition: 'left top, right top, center, center',
  backgroundRepeat: 'no-repeat, no-repeat, no-repeat, repeat',
} as const;

const centerPanelStyle = {
  background:
    'radial-gradient(circle at top left, rgba(201, 168, 76, 0.16), transparent 30%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.12), transparent 28%), linear-gradient(180deg, rgba(8, 8, 10, 0.98) 0%, rgba(15, 15, 17, 0.96) 100%)',
} as const;

type DevelopmentStats = {
  totalCommits: number;
  activeDays: number;
  calendarDays: number;
  storyCount: number;
  firstCommitDate: string;
  lastCommitDate: string;
  latestCommitSubject: string;
  source: 'git' | 'fallback';
};

const defaultDevelopmentStats: DevelopmentStats = {
  totalCommits: 61,
  activeDays: 8,
  calendarDays: 15,
  storyCount: 4,
  firstCommitDate: '2026-04-21',
  lastCommitDate: '2026-05-05',
  latestCommitSubject: 'feat: polish home and story editorial presentation',
  source: 'fallback',
};

const devNumberFormatter = new Intl.NumberFormat('en-US');

const Header = ({ isVisible }: { isVisible: boolean }) => (
  <header
    className="absolute inset-x-0 top-0 z-20 transition-opacity duration-500"
    style={{
      ...headerChromeStyle,
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
    }}
  >
    <div
      className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8"
      style={{
        borderColor: 'rgba(201, 168, 76, 0.18)',
        boxShadow: '0 18px 40px rgba(0, 0, 0, 0.28)',
      }}
    >
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
  <aside
    className="w-full lg:w-1/4 flex lg:flex-col lg:justify-center pt-6 lg:pt-20 px-4 sm:px-8 gap-4 lg:space-y-12 lg:gap-0 overflow-x-auto border-b lg:border-b-0 lg:border-r"
    style={panelSurfaceStyle}
  >
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
            activeIndex === idx ? 'text-zinc-100' : 'text-zinc-500'
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
    <section
      className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 overflow-hidden border-b lg:border-b-0 lg:border-r"
      style={centerPanelStyle}
    >
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
    <aside
      className="w-full lg:w-1/4 flex flex-col justify-center px-4 sm:px-8 py-4 lg:py-0 space-y-6 lg:space-y-8 border-b lg:border-b-0"
      style={panelSurfaceStyle}
    >
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
                <div className="font-bebas" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.8rem)', color: '#f5f2eb', lineHeight: '1' }}>
                  {number}
                </div>
                <div className="font-dm-mono text-xs text-zinc-500 tracking-widest mt-1">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm text-zinc-300 leading-relaxed font-light mb-6">
          {story.description}
        </p>

        <button
          type="button"
          onClick={() => onExplore(story.slug)}
          className="inline-flex items-center gap-2 font-dm-mono text-xs tracking-widest text-zinc-100 hover:text-gold-accent transition-colors duration-300 group cursor-pointer"
        >
          <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--gold-accent)' }}>
            {'->'}
          </span>
          EXPLORE STORY
        </button>
      </div>
    </aside>
  );
};

const Footer = () => (
  <footer className="border-t" style={{ ...chromeTextureStyle, borderColor: 'rgba(201, 168, 76, 0.18)' }}>
    <div className="h-10 px-4 sm:px-8 flex items-center justify-between text-[10px] sm:text-xs text-zinc-300 font-dm-mono tracking-widest">
      <span>1896 — 2024</span>
      <span className="hidden sm:inline">4 DATA STORIES</span>
      <span>↓ SCROLL TO NAVIGATE</span>
    </div>
  </footer>
);

const DevStatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2.5">
    <div className="font-bebas text-[1.65rem] leading-none tracking-[0.08em] text-zinc-50">
      {value}
    </div>
    <div className="mt-1.5 font-dm-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
      {label}
    </div>
  </div>
);

const DevelopmentEasterEgg = () => {
  const [stats, setStats] = useState(defaultDevelopmentStats);
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOpen = isPinned || isHovered;

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        const response = await fetch('/api/dev-stats', {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const nextStats = (await response.json()) as Partial<DevelopmentStats>;
        setStats((currentStats) => ({
          ...currentStats,
          ...nextStats,
        }));
      } catch {
        // Keep the latest snapshot if Git data is unavailable at runtime.
      }
    }

    loadStats();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isPinned) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(event.target)) {
        setIsPinned(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isPinned]);

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-40 sm:bottom-4 sm:right-4 lg:bottom-5 lg:right-5">
      <div
        ref={containerRef}
        className="pointer-events-auto relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="dev-log-tooltip"
          onClick={() => setIsPinned((currentValue) => !currentValue)}
          className="group inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-black/55 px-3 py-1.5 text-left backdrop-blur-xl transition-colors duration-300 hover:border-amber-200/40 focus-visible:border-amber-200/60 focus-visible:outline-none"
          style={{ boxShadow: '0 14px 30px rgba(0, 0, 0, 0.24)' }}
        >
          <span className="font-dm-mono text-[8px] uppercase tracking-[0.22em] text-amber-100/85 sm:text-[9px]">
            Dev Statistics
          </span>
          <span className="h-3.5 w-px bg-amber-200/25" />
          <span className="font-bebas text-lg leading-none tracking-[0.08em] text-zinc-50 sm:text-xl">
            {devNumberFormatter.format(stats.totalCommits)}
          </span>
        </button>

        <div
          id="dev-log-tooltip"
          className={`absolute bottom-full right-0 mb-2.5 w-[min(18rem,calc(100vw-1.5rem))] rounded-[1.2rem] border border-amber-200/18 bg-[linear-gradient(180deg,rgba(8,8,10,0.96)_0%,rgba(15,15,17,0.94)_100%)] p-3.5 text-zinc-100 shadow-[0_24px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-250 sm:p-4 ${
            isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-dm-mono text-[9px] uppercase tracking-[0.2em] text-amber-200/80 sm:text-[10px]">
                Dev Statistics
              </p>
              <p className="mt-1.5 font-bebas text-[1.45rem] leading-none tracking-[0.08em] text-zinc-50">
                PIT WALL
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-1.5 py-1 font-dm-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
              {stats.source === 'git' ? 'LIVE GIT' : 'SNAPSHOT'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <DevStatCard value={devNumberFormatter.format(stats.totalCommits)} label="Commits" />
            <DevStatCard value={devNumberFormatter.format(stats.activeDays)} label="Active Days" />
            <DevStatCard value={devNumberFormatter.format(stats.calendarDays)} label="Calendar Days" />
            <DevStatCard value={devNumberFormatter.format(stats.storyCount)} label="Stories Live" />
          </div>

          <div className="mt-3 rounded-xl border border-white/8 bg-black/20 px-2.5 py-2.5">
            <p className="font-dm-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
              Build Window
            </p>
            <p className="mt-1.5 font-dm-mono text-[11px] tracking-[0.14em] text-zinc-200 sm:text-xs">
              {stats.firstCommitDate} → {stats.lastCommitDate}
            </p>
          </div>

          <div className="mt-2.5 rounded-xl border border-white/8 bg-black/20 px-2.5 py-2.5">
            <p className="font-dm-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
              Latest Commit
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-200">
              {stats.latestCommitSubject}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { startTransition: beginRouteTransition } = useRouteTransition();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showHeader, setShowHeader] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startTransition = useCallback(
    (destinationSlug: string) => {
      const destinationStory = storiesData.find((story) => story.slug === destinationSlug);
      if (!destinationStory) {
        return;
      }

      beginRouteTransition({
        href: `/${destinationSlug}`,
        sourceLabel: 'HOME ARENA',
        destinationLabel: `HEAT ${destinationStory.number}`,
        title: destinationStory.title,
      });
    },
    [beginRouteTransition],
  );

  useLayoutEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldOpenMenu = searchParams.get('menu') === '1';

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (shouldOpenMenu) {
      // Saltar la portada hero y mostrar directamente el menú de historias
      window.scrollTo({ top: window.innerHeight, behavior: 'instant' });

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('menu');
      const nextLocation = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      window.history.replaceState(window.history.state, '', nextLocation);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    storiesData.forEach((story) => {
      router.prefetch(`/${story.slug}`);
    });
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const menuStart = window.innerHeight;
      setShowHeader(scrollTop >= menuStart);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-x-hidden text-zinc-100"
      style={{
        background:
          'radial-gradient(circle at top, rgba(201, 168, 76, 0.12), transparent 24%), linear-gradient(180deg, #050506 0%, #0c0c0f 100%)',
      }}
    >
      <RouteTransitionReady />
      <DevelopmentEasterEgg />
      <section
        className="relative w-full h-screen flex flex-col items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero_bg.png')" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 6, 7, 0.58) 0%, rgba(6, 6, 7, 0.36) 35%, rgba(6, 6, 7, 0.72) 100%), radial-gradient(circle at 50% 30%, rgba(201, 168, 76, 0.18), transparent 30%)',
          }}
        />
        <div className="absolute inset-x-4 top-6 z-10 sm:inset-x-8 lg:inset-x-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-200/20 bg-black/25 px-4 py-2 font-dm-mono text-[10px] tracking-[0.34em] text-amber-100/80 uppercase backdrop-blur-md sm:text-xs">
            Home Arena
          </div>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="font-bebas text-zinc-100 tracking-[0.08em]" style={{ fontSize: 'clamp(4rem, 16vw, 16rem)', lineHeight: '0.9' }}>
            OLYMPIC
          </h1>
          <h2 className="font-bebas tracking-[0.08em] text-amber-200" style={{ fontSize: 'clamp(4rem, 16vw, 16rem)', lineHeight: '0.9' }}>
            DATA STORIES
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Four stories. 128 years of data.
          </p>
          <p className="mt-3 font-dm-mono text-[11px] tracking-[0.34em] text-zinc-400 uppercase sm:text-xs">
            1896 — 2024
          </p>
          <p className="font-dm-mono text-amber-200/80 tracking-[0.34em] text-xs mt-8">SCROLL TO EXPLORE</p>
        </div>
      </section>

      <div className="relative w-full">
        <Header isVisible={showHeader} />

        <main
          className="flex flex-col lg:flex-row pt-20 sm:pt-24 lg:pt-32 min-h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-2.5rem)] relative z-10 border-y"
          style={{
            ...mainStageStyle,
            borderColor: 'rgba(201, 168, 76, 0.16)',
          }}
        >
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
    </div>
  );
}
