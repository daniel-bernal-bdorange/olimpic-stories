'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Home Page Component - Triptych Layout Inspired by Obys
 * 
 * Layout de 4 columnas:
 * - Columna 1 (25%): Lista de secciones (nombre pequeño)
 * - Columnas 2-3 (50%): Carousel central con imágenes (scrollable)
 * - Columna 4 (25%): Descripción y CTA
 * 
 * Características:
 * - Mucho whitespace
 * - Header grande
 * - Imágenes pequeñas en stack con scroll visible
 * - Tipografía elegante y minimalista
 */

const storiesData = [
  {
    id: 'cold-war-in-gold',
    number: '01',
    title: 'COLD WAR IN GOLD',
    category: 'DATA STORY · 1952–2020',
    description: 'Dos superpotencias. Una sola tabla de clasificación. Cómo la Guerra Fría se libró en los marcadores olímpicos.',
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
    description: 'El deporte que practicas moldea el cuerpo que tienes. 28 centímetros separan al gimnasta del jugador de baloncesto.',
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
    category: 'DATA STORY · 1900–1936',
    description: 'Cricket, soga, polo, pelota vasca. Nueve deportes que los Juegos Olímpicos olvidaron para siempre.',
    slug: 'cementerio-olimpico',
    image: '/images/lost_sporgs.png',
    accentColor: 'var(--ring-green)',
    metadata: {
      label: 'LOST SPORTS',
      stats: ['9 FORGOTTEN SPORTS', '1900 — 1936', 'GBR DOMINATED ALL'],
    },
  },
  {
    id: 'one-life',
    number: '04',
    title: 'ONE LIFE, TEN GAMES',
    category: 'DATA STORY · 1964–2012',
    description: 'Un jinete canadiense compitió en diez Olimpiadas durante cuarenta años. Estas son las vidas más largas del deporte.',
    slug: '10-olimpiadas-una-vida',
    image: '/images/one_life_ten_games.png',
    accentColor: 'var(--ring-yellow)',
    metadata: {
      label: 'ONE LIFE, TEN GAMES',
      stats: ['10 OLYMPIC GAMES', '40 YEARS COMPETING', '6 EXTRAORDINARY LIVES'],
    },
  },
];

/**
 * Componente SVG de los 5 aros olímpicos
 */
const OlympicRings = () => (
  <svg
    viewBox="0 0 110 60"
    className="h-6 w-auto opacity-50 hover:opacity-100 transition-opacity duration-400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="15" cy="30" r="10" stroke="#0085c7" strokeWidth="3" />
    <circle cx="55" cy="30" r="10" stroke="#000000" strokeWidth="3" />
    <circle cx="95" cy="30" r="10" stroke="#d4271f" strokeWidth="3" />
    <circle cx="35" cy="50" r="10" stroke="#f4c300" strokeWidth="3" />
    <circle cx="75" cy="50" r="10" stroke="#009f3d" strokeWidth="3" />
  </svg>
);

/**
 * Header Grande
 */
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-border py-6">
    <div className="px-12 flex items-center justify-between">
      {/* Logo izquierda */}
      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="font-bebas text-white text-3xl tracking-wider">ODS</div>
        <div className="flex items-center gap-4">
          <div className="w-1 h-1 rounded-full bg-gold" />
          <div className="font-dm-mono text-sm text-muted tracking-widest">OLYMPIC DATA STORIES</div>
        </div>
      </div>

      {/* Aros derecha */}
      <OlympicRings />
    </div>
  </header>
);

/**
 * Columna Izquierda: Lista de Secciones (25%)
 * Nombres pequeños, minimalista
 */
const SectionsList = ({ 
  activeIndex, 
  onHover 
}: { 
  activeIndex: number; 
  onHover: (idx: number) => void;
}) => (
  <aside className="w-1/4 flex flex-col justify-center pt-24 px-8 space-y-12 bg-black">
    {storiesData.map((story, idx) => (
      <div
        key={story.id}
        onMouseEnter={() => onHover(idx)}
        className="group cursor-pointer"
      >
        {/* Número */}
        <div
          className={`font-dm-mono text-xs tracking-widest mb-1 transition-colors duration-300 ${
            activeIndex === idx ? 'text-gold' : 'text-muted'
          }`}
        >
          {story.number}
        </div>

        {/* Título muy pequeño */}
        <div
          className={`font-bebas text-sm tracking-wider mb-2 transition-colors duration-300 ${
            activeIndex === idx ? 'text-white' : 'text-gray-600'
          }`}
        >
          {story.title}
        </div>

        {/* Línea animada */}
        <div
          className="h-px transition-all duration-600 ease-out"
          style={{
            backgroundColor: activeIndex === idx ? 'var(--gold)' : 'transparent',
            width: activeIndex === idx ? '100%' : '0%',
          }}
        />
      </div>
    ))}
  </aside>
);

/**
 * Columnas Centrales: Carousel (50%)
 * Imágenes pequeñas, scrollables, viendo todas simultáneamente
 */
const CarouselCenter = ({ activeIndex }: { activeIndex: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-1/2 flex flex-col justify-center items-center px-6 bg-black">
      {/* Espacio en blanco arriba */}
      <div className="flex-1" />

      {/* Contenedor scrollable con todas las imágenes visibles */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-gold scrollbar-track-transparent"
      >
        <div className="space-y-6 pb-12">
          {storiesData.map((story, idx) => {
            const isActive = idx === activeIndex;
            const scale = isActive ? 1 : 0.85;
            const opacity = isActive ? 1 : 0.6;

            return (
              <div
                key={story.id}
                className="flex justify-center transition-all duration-500 ease-out"
                style={{
                  transform: `scale(${scale})`,
                  opacity: opacity,
                }}
              >
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover"
                    style={{
                      filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)',
                    }}
                  />

                  {/* Gradient overlay solo en activa */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                  )}

                  {/* Número de imagen en esquina */}
                  <div className="absolute bottom-3 left-3 font-dm-mono text-xs text-white bg-black/60 px-3 py-1 rounded">
                    {story.number}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Espacio en blanco abajo */}
      <div className="flex-1" />
    </section>
  );
};

/**
 * Columna Derecha: Descripción (25%)
 * Información de la sección activa
 */
const DescriptionPanel = ({ activeIndex }: { activeIndex: number }) => {
  const story = storiesData[activeIndex];

  return (
    <aside className="w-1/4 flex flex-col justify-center px-8 space-y-8 bg-black">
      {/* Metadata */}
      <div>
        <div className="font-dm-mono text-xs tracking-widest text-gold mb-4">
          {story.metadata.label}
        </div>
        <div className="border-b border-gold/30 mb-6" />

        {/* Stats */}
        <div className="space-y-3">
          {story.metadata.stats.map((stat, idx) => (
            <div key={idx} className="font-dm-mono text-xs text-foreground leading-relaxed">
              {stat}
            </div>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <p className="text-sm text-foreground leading-relaxed font-light mb-6">
          {story.description}
        </p>

        {/* CTA */}
        <Link
          href={`/${story.slug}`}
          className="inline-flex items-center gap-2 font-dm-mono text-xs tracking-widest text-white hover:text-gold transition-colors duration-300 group"
        >
          <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--gold)' }}>
            →
          </span>
          EXPLORE
        </Link>
      </div>
    </aside>
  );
};

/**
 * Footer
 */
const Footer = () => (
  <footer className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-border">
    <div className="h-10 px-8 flex items-center justify-between text-xs text-muted font-dm-mono tracking-widest">
      <span>© 2026</span>
      <span>4 DATA STORIES</span>
      <span>SCROLL TO VIEW ALL</span>
    </div>
  </footer>
);

/**
 * Componente principal Home
 */
export default function Home() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Maneja eventos de scroll wheel
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;

      e.preventDefault();

      if (e.deltaY > 0) {
        setActiveStoryIndex((prev) =>
          prev < storiesData.length - 1 ? prev + 1 : prev
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
      className="relative w-screen h-screen overflow-hidden bg-black"
    >
      {/* HEADER */}
      <Header />

      {/* MAIN - Layout de 4 columnas */}
      <main className="flex pt-28 pb-10 h-full">
        {/* COLUMNA 1: Secciones (25%) */}
        <SectionsList
          activeIndex={activeStoryIndex}
          onHover={setActiveStoryIndex}
        />

        {/* COLUMNAS 2-3: Carousel Central (50%) */}
        <CarouselCenter activeIndex={activeStoryIndex} />

        {/* COLUMNA 4: Descripción (25%) */}
        <DescriptionPanel activeIndex={activeStoryIndex} />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
