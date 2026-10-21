'use client';

import { useEffect, useState } from 'react';

/** Fetches a signed anti-spam token once the form is on screen. */
export function useFormToken(kind: 'contact' | 'advertise') {
  const [token, setToken] = useState('');
  useEffect(() => {
    fetch(`/api/form-token/?kind=${kind}`)
      .then((r) => r.json())
      .then((d: { token?: string }) => setToken(d.token ?? ''))
      .catch(() => {});
  }, [kind]);
  return token;
}
