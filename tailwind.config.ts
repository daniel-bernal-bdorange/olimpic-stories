import type { Config } from 'tailwindcss';

/**
 * Configuración de Tailwind CSS para Olympic Data Stories
 * 
 * Define:
 * - Sistema de tipografía (Bebas Neue, DM Mono, Geist)
 * - Paleta de colores personalizada
 * - Animaciones custom
 * - Utilidades específicas del proyecto
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Sistema de tipografía personalizado
      fontFamily: {
        // Bebas Neue para títulos (tipografía condensada de lujo)
        bebas: ['var(--font-bebas)', 'sans-serif'],
        // DM Mono para labels y metadata (monoespaciada profesional)
        'dm-mono': ['var(--font-dm-mono)', 'monospace'],
        // Fuentes por defecto (Geist)
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      // Paleta de colores extendida
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        gold: 'var(--gold)',
        'gold-light': 'var(--gold-light)',
        // Colores de acento por story
        'ring-red': 'var(--ring-red)',
        'ring-blue': 'var(--ring-blue)',
        'ring-green': 'var(--ring-green)',
        'ring-yellow': 'var(--ring-yellow)',
      },

      // Animaciones personalizadas
      animation: {
        // Reveal circular desde el centro (para clip-path)
        'clip-reveal': 'clipReveal 0.7s cubic-bezier(0.77, 0, 0.175, 1) forwards',
        // Fade in suave
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        // Desliz del arrow en CTAs
        'arrow-slide': 'arrowSlide 0.3s ease-out',
      },

      keyframes: {
        clipReveal: {
          from: {
            clipPath: 'circle(0% at 50% 50%)',
          },
          to: {
            clipPath: 'circle(150% at 50% 50%)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        arrowSlide: {
          from: {
            transform: 'translateX(0)',
          },
          to: {
            transform: 'translateX(4px)',
          },
        },
      },

      // Espaciado personalizado
      spacing: {
        15: '3.75rem', // 60px - altura del header
      },

      // Transiciones por defecto
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
    },
  },
  plugins: [],
};

export default config;
