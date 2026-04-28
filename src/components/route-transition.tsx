'use client';

import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

type TransitionPhase = 'idle' | 'covering' | 'holding' | 'revealing';

export type TransitionDescriptor = {
  href: string;
  eyebrow?: string;
  sourceLabel?: string;
  destinationLabel?: string;
  title?: string;
};

type RouteTransitionContextValue = {
  startTransition: (descriptor: TransitionDescriptor) => void;
  markPageReady: () => void;
  isTransitioning: boolean;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

const COVER_DURATION_MS = 360;
const REVEAL_DURATION_MS = 720;
const SPINNER_DELAY_MS = 420;
const FAILSAFE_RESET_MS = 8000;

function getPathnameFromHref(href: string) {
  if (typeof window === 'undefined') {
    return href.split('?')[0] || '/';
  }

  return new URL(href, window.location.origin).pathname;
}

export function RouteTransitionProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [showSpinner, setShowSpinner] = useState(false);
  const [descriptor, setDescriptor] = useState<TransitionDescriptor | null>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const pendingPathnameRef = useRef<string | null>(null);
  const navigateTimerRef = useRef<number | null>(null);
  const spinnerTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);

  const clearTimer = (timerRef: React.MutableRefObject<number | null>) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTransition = useCallback(() => {
    clearTimer(navigateTimerRef);
    clearTimer(spinnerTimerRef);
    clearTimer(revealTimerRef);
    clearTimer(failsafeTimerRef);
    pendingHrefRef.current = null;
    pendingPathnameRef.current = null;
    setShowSpinner(false);
    setDescriptor(null);
    setPhase('idle');
  }, []);

  const startTransition = useCallback(
    (nextDescriptor: TransitionDescriptor) => {
      if (pendingHrefRef.current) {
        return;
      }

      pendingHrefRef.current = nextDescriptor.href;
      pendingPathnameRef.current = getPathnameFromHref(nextDescriptor.href);
      setDescriptor(nextDescriptor);
      setShowSpinner(false);
      setPhase('covering');

      spinnerTimerRef.current = window.setTimeout(() => {
        setShowSpinner(true);
      }, SPINNER_DELAY_MS);

      navigateTimerRef.current = window.setTimeout(() => {
        setPhase('holding');
        router.push(nextDescriptor.href);
      }, COVER_DURATION_MS);

      failsafeTimerRef.current = window.setTimeout(() => {
        resetTransition();
      }, FAILSAFE_RESET_MS);
    },
    [resetTransition, router],
  );

  const markPageReady = useCallback(() => {
    const pendingPathname = pendingPathnameRef.current;
    if (!pendingPathname || pendingPathname !== pathname) {
      return;
    }

    clearTimer(navigateTimerRef);
    clearTimer(spinnerTimerRef);
    setShowSpinner(false);

    requestAnimationFrame(() => {
      setPhase('revealing');
      revealTimerRef.current = window.setTimeout(() => {
        resetTransition();
      }, REVEAL_DURATION_MS);
    });
  }, [pathname, resetTransition]);

  useEffect(() => {
    const pendingPathname = pendingPathnameRef.current;
    if (!pendingPathname) {
      return;
    }

    if (pendingPathname !== pathname) {
      return;
    }

    clearTimer(navigateTimerRef);
    setPhase('holding');
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearTimer(navigateTimerRef);
      clearTimer(spinnerTimerRef);
      clearTimer(revealTimerRef);
      clearTimer(failsafeTimerRef);
    };
  }, []);

  const contextValue = useMemo<RouteTransitionContextValue>(
    () => ({
      startTransition,
      markPageReady,
      isTransitioning: phase !== 'idle',
    }),
    [markPageReady, phase, startTransition],
  );

  const sourceLabel = descriptor?.sourceLabel ?? 'CURRENT VIEW';
  const destinationLabel = descriptor?.destinationLabel ?? 'NEXT STORY';
  const eyebrow = descriptor?.eyebrow ?? 'QUALIFICATION TRANSFER';
  const title = descriptor?.title ?? 'Preparing the next page';

  return (
    <RouteTransitionContext.Provider value={contextValue}>
      {children}
      <div
        className={`route-transition${phase === 'idle' ? '' : ' is-active'} route-transition--${phase}`}
        role="status"
        aria-live="polite"
        aria-hidden={phase === 'idle'}
      >
        <div className="route-transition__scanline" />
        <div className="route-transition__score" />
        <div className="route-transition__content">
          <p className="route-transition__eyebrow">{eyebrow}</p>
          <h2 className="route-transition__title">
            {sourceLabel}
            <span>{destinationLabel}</span>
          </h2>
          <p className="route-transition__subtitle">{title}</p>
          <div className="route-transition__rings" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          {showSpinner ? <div className="route-transition__spinner" aria-hidden="true" /> : null}
        </div>
      </div>
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);

  if (!context) {
    throw new Error('useRouteTransition must be used within RouteTransitionProvider');
  }

  return context;
}

type TransitionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  transition?: Omit<TransitionDescriptor, 'href'>;
};

export function TransitionLink({ href, className, children, transition }: TransitionLinkProps) {
  const { startTransition, isTransitioning } = useRouteTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    startTransition({ href, ...transition });
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      aria-disabled={isTransitioning}
    >
      {children}
    </Link>
  );
}

export function RouteTransitionReady() {
  const { markPageReady } = useRouteTransition();

  useEffect(() => {
    markPageReady();
  }, [markPageReady]);

  return null;
}