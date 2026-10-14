'use client';

/**
 * Bestanden die op de homepage zijn neergezet, worden in het geheugen van de
 * browser bewaard en bij het openen van het offerteformulier overgenomen.
 * Niets wordt opgeslagen of verstuurd voordat de bezoeker zelf verzendt.
 */
let pending: File[] = [];

export function setPendingFiles(files: File[]) {
  pending = files;
}

export function takePendingFiles(): File[] {
  const f = pending;
  pending = [];
  return f;
}
