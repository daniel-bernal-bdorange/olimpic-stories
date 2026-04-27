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

/**
 * Header Grande
 */
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
    }}>
    <div className="px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
      {/* Logo izquierda */}
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

      {/* Aros derecha */}
      <div className="hidden sm:block">
        <OlympicRings />
      </div>
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
  <aside className="w-full lg:w-1/4 flex lg:flex-col lg:justify-center pt-6 lg:pt-20 px-4 sm:px-8 gap-4 lg:space-y-12 lg:gap-0 bg-white overflow-x-auto">
    {storiesData.map((story, idx) => (
      <div
        key={story.id}
        onMouseEnter={() => onHover(idx)}
        className="group cursor-pointer min-w-[12rem] lg:min-w-0"
      >
        {/* Número */}
        <div
          className={`font-dm-mono text-xs tracking-widest mb-1 transition-colors duration-300 ${
            activeIndex === idx ? 'text-gold-accent' : 'text-muted'
          }`}
        >
          {story.number}
        </div>

        {/* Título grande */}
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

        {/* Border left y underline animados */}
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

/**
 * Columnas Centrales: Carrusel Vertical (50%)
 * 
 * Carrusel tipo stack vertical:
 * - Imagen anterior: pequeña arriba (peek)
 * - Imagen activa: grande en centro (100%)
 * - Imagen siguiente: pequeña abajo (peek)
 * 
 * Transiciones suaves con translateY y escala
 */
const CarouselCenter = ({ activeIndex }: { activeIndex: number }) => {
  return (
    <section className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 bg-white overflow-hidden">
      {/* Contenedor del carrusel vertical */}
      <div className="relative w-full max-w-sm sm:max-w-md h-72 sm:h-80 lg:h-96">
        {/* Renderizar todas las imágenes con posiciones relativas */}
        {storiesData.map((story, idx) => {
          // Calcular posición relativa a la imagen activa
          const position = idx - activeIndex;

          // Configuración visual basada en la posición
          let yTranslate = 0;
          let scale = 0.7;
          let opacity = 0.5;
          let zIndex = 10;

          if (position === 0) {
            // Imagen activa - centro
            yTranslate = 0;
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (position === -1) {
            // Imagen anterior - arriba (pequeña)
            yTranslate = -180;
            scale = 0.7;
            opacity = 0.6;
            zIndex = 20;
          } else if (position === 1) {
            // Imagen siguiente - abajo (pequeña)
            yTranslate = 180;
            scale = 0.7;
            opacity = 0.6;
            zIndex = 20;
          } else {
            // Imágenes más lejanas - ocultas
            yTranslate = position > 0 ? 600 : -600;
            scale = 0.6;
            opacity = 0;
            zIndex = 5;
          }

          return (
            <div
              key={story.id}
              className={`absolute inset-0 transition-all duration-700 ease-out rounded-lg overflow-hidden shadow-2xl ${position !== 0 ? 'hidden sm:block' : ''}`}
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

              {/* Gradient overlay solo en imagen activa */}
              {position === 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
              )}

              {/* Número y Título en esquina inferior izquierda */}
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

/**
 * Columna Derecha: Descripción (25%)
 * Información de la sección activa
 */
const DescriptionPanel = ({ activeIndex }: { activeIndex: number }) => {
  const story = storiesData[activeIndex];

  return (
    <aside className="w-full lg:w-1/4 flex flex-col justify-center px-4 sm:px-8 py-4 lg:py-0 space-y-6 lg:space-y-8 bg-white">
      {/* Metadata */}
      <div>
        <div className="font-dm-mono text-xs tracking-widest text-gold-accent mb-4">
          {story.metadata.label}
        </div>
        <div className="border-b border-gold-accent/30 mb-6" />

        {/* Stats - 2 líneas cada uno */}
        <div className="space-y-6">
          {story.metadata.stats.map((stat, idx) => {
            const parts = stat.split(' — ') || stat.split(' · ');
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

      {/* Descripción */}
      <div>
        <p className="text-sm text-foreground leading-relaxed font-light mb-6">
          {story.description}
        </p>

        {/* CTA */}
        <Link
          href={`/${story.slug}`}
          className="inline-flex items-center gap-2 font-dm-mono text-xs tracking-widest text-foreground hover:text-gold-accent transition-colors duration-300 group"
        >
          <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--gold-accent)' }}>
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
  <footer className="bg-white border-t border-gold/20" style={{ backgroundImage: "url('/images/carbonfiber.png')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundColor: 'rgba(244, 244, 245, 0.7)', backgroundBlendMode: 'multiply' }}>
    <div className="h-10 px-4 sm:px-8 flex items-center justify-between text-[10px] sm:text-xs text-zinc-200 font-dm-mono tracking-widest">
      <span>© 2026</span>
      <span className="hidden sm:inline">4 DATA STORIES</span>
      <span>SCROLL TO VIEW ALL</span>
    </div>
  </footer>
);

/**
 * Componente principal Home
 */
export default function Home() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [showHeader, setShowHeader] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Scroll al top cuando carga la página
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Maneja el scroll para mostrar/ocultar header
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      // Mostrar header cuando se sale de la portada (altura de la ventana)
      setShowHeader(scrollTop > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Maneja eventos de scroll wheel
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;

      // Solo navegar entre stories si no estamos en la portada
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop < window.innerHeight) {
        // En la portada, dejar scroll normal
        return;
      }

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
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      {/* PORTADA A PANTALLA COMPLETA */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center bg-white bg-cover bg-center" style={{ backgroundImage: "url('/images/hero_bg.png')" }}>
        {/* Overlay más transparente */}
        <div className="absolute inset-0 bg-white/65" />
        
        {/* Contenido centrado */}
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative w-full">
        {/* HEADER */}
        <Header isVisible={showHeader} />

        {/* MAIN - Layout de 4 columnas */}
        <main className="flex flex-col lg:flex-row pt-20 sm:pt-24 lg:pt-32 pb-10 min-h-screen lg:h-screen relative z-10 bg-white">
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
    </div>
  );
}
