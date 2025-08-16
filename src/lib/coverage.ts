// Funzione per formattare minuti in ore:minuti (es. 125 -> "2h 05m")
export function formatHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  }
  return `${m}m`;
}

// Calcolo minuti scoperti di un turno rispetto agli slot coperti
export function totalUncoveredMinutes({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix,
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: { id?: string; startTime?: string | null; endTime?: string | null }[];
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix: string;
}): number {
  // funzione di parsing HH:mm -> minuti
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const sStart = toMin(shiftStart);
  const sEnd = toMin(shiftEnd);

  // raccogli intervalli coperti dagli slot
  const intervals: [number, number][] = slots.map((slot, i) => {
    const key = `${slotKeyPrefix}${i}`;
    const st = slotTimes?.[key]?.start ?? slot.startTime ?? shiftStart;
    const en = slotTimes?.[key]?.end ?? slot.endTime ?? shiftEnd;
    return [toMin(st), toMin(en)];
  });

  // ordina per inizio
  intervals.sort((a, b) => a[0] - b[0]);

  let uncovered = 0;
  let cursor = sStart;

  for (const [st, en] of intervals) {
    if (st > cursor) {
      // buco tra cursor e st
      uncovered += st - cursor;
    }
    cursor = Math.max(cursor, en);
  }

  // eventuale buco finale dopo l'ultimo slot
  if (cursor < sEnd) {
    uncovered += sEnd - cursor;
  }

  return uncovered;
}
