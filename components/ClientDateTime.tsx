'use client';

import React from 'react';

const emptySubscribe = () => () => {};

/**
 * Hydration-safe client detector using standard React useSyncExternalStore.
 * Guarantees server snapshot is false and client snapshot is true without cascading render warnings.
 */
export function useIsClient(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface ClientTimeProps {
  timestamp: number;
  className?: string;
}

/**
 * Renders timestamp safely without Next.js SSR hydration mismatches.
 * Renders deterministic UTC string during SSR and initial client hydration,
 * then cleanly renders localized time once client is active.
 */
export const ClientTime: React.FC<ClientTimeProps> = ({ timestamp, className }) => {
  const isClient = useIsClient();

  if (!isClient) {
    const d = new Date(timestamp);
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return <span className={className} suppressHydrationWarning>{`${hh}:${mm}:${ss}`}</span>;
  }

  let local = '';
  try {
    local = new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    const d = new Date(timestamp);
    local = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
  }

  return <span className={className} suppressHydrationWarning>{local}</span>;
};

interface ClientDateProps {
  timestamp: number;
  className?: string;
}

/**
 * Renders date safely without Next.js SSR hydration mismatches.
 */
export const ClientDate: React.FC<ClientDateProps> = ({ timestamp, className }) => {
  const isClient = useIsClient();

  if (!isClient) {
    const d = new Date(timestamp);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return <span className={className} suppressHydrationWarning>{`${yyyy}-${mm}-${dd}`}</span>;
  }

  let local = '';
  try {
    local = new Date(timestamp).toLocaleDateString();
  } catch {
    const d = new Date(timestamp);
    local = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }

  return <span className={className} suppressHydrationWarning>{local}</span>;
};
