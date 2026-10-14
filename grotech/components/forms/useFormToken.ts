'use client';

import { useCallback, useEffect, useState } from 'react';

/** Haalt een ondertekend formuliertoken op (spam-bescherming). */
export function useFormToken(kind: 'quote' | 'contact') {
  const [token, setToken] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/form-token?kind=${kind}`, { cache: 'no-store' });
      if (res.ok) setToken((await res.json()).token);
    } catch {}
  }, [kind]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { token, refresh };
}
