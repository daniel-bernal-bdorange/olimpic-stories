'use client';

import { useEffect, useRef } from 'react';

/**
 * Overlay negro que cubre la página en el momento de mount y luego se desliza
 * hacia arriba revelando el contenido. Produce la segunda mitad de la transición
 * de concurso: entrada -> navigate (cubierto) -> reveal.
 */
export function PageReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Esperar un frame para que el DOM pinte antes de iniciar la salida
    const raf = requestAnimationFrame(() => {
      const timer = window.setTimeout(() => {
        ref.current?.classList.add('page-reveal--active');
      }, 60);
      return () => window.clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div ref={ref} className="page-reveal" aria-hidden="true" />;
}
