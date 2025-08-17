export const toMinutes = (hhmm: string) => {
  const [h, m] = (hhmm || "").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const formatHM = (mins: number) => {
  const v = Math.max(0, mins);
  const h = Math.floor(v / 60), m = v % 60;
  return h > 0 ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
};

// Interfaccia per i gap
export interface Gap {
  start: string;
  end: string;
  durationMinutes: number;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Funzione per trovare i gap reali nel turno
export function findGapsInShift({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
}): Gap[] {
  if (slots.length === 0) {
    return [{
      start: shiftStart,
      end: shiftEnd,
      durationMinutes: toMinutes(shiftEnd) - toMinutes(shiftStart)
    }];
  }

  // Raccogli tutti gli intervalli coperti
  const coveredIntervals: Array<{ start: number; end: number }> = [];
  slots.forEach((slot, idx) => {
    if (!slot?.operatorId) return;
    const key = `${slotKeyPrefix}${idx}`;
    const start = slotTimes?.[key]?.start ?? slot.startTime ?? shiftStart;
    const end = slotTimes?.[key]?.end ?? slot.endTime ?? shiftEnd;
    
    const startMins = toMinutes(start);
    const endMins = toMinutes(end);
    
    if (startMins < endMins) {
      coveredIntervals.push({ start: startMins, end: endMins });
    }
  });

  if (coveredIntervals.length === 0) {
    return [{
      start: shiftStart,
      end: shiftEnd,
      durationMinutes: toMinutes(shiftEnd) - toMinutes(shiftStart)
    }];
  }

  // Ordina per orario di inizio
  coveredIntervals.sort((a, b) => a.start - b.start);

  // Unisci intervalli sovrapposti
  const mergedIntervals: Array<{ start: number; end: number }> = [];
  for (const interval of coveredIntervals) {
    if (mergedIntervals.length === 0 || mergedIntervals[mergedIntervals.length - 1].end < interval.start) {
      mergedIntervals.push(interval);
    } else {
      mergedIntervals[mergedIntervals.length - 1].end = Math.max(
        mergedIntervals[mergedIntervals.length - 1].end,
        interval.end
      );
    }
  }

  // Trova i gap
  const gaps: Gap[] = [];
  const shiftStartMins = toMinutes(shiftStart);
  const shiftEndMins = toMinutes(shiftEnd);

  // Gap prima del primo intervallo
  if (mergedIntervals[0].start > shiftStartMins) {
    gaps.push({
      start: shiftStart,
      end: formatTime(mergedIntervals[0].start),
      durationMinutes: mergedIntervals[0].start - shiftStartMins
    });
  }

  // Gap tra gli intervalli
  for (let i = 0; i < mergedIntervals.length - 1; i++) {
    const gapStart = mergedIntervals[i].end;
    const gapEnd = mergedIntervals[i + 1].start;
    if (gapStart < gapEnd) {
      gaps.push({
        start: formatTime(gapStart),
        end: formatTime(gapEnd),
        durationMinutes: gapEnd - gapStart
      });
    }
  }

  // Gap dopo l'ultimo intervallo
  if (mergedIntervals[mergedIntervals.length - 1].end < shiftEndMins) {
    gaps.push({
      start: formatTime(mergedIntervals[mergedIntervals.length - 1].end),
      end: shiftEnd,
      durationMinutes: shiftEndMins - mergedIntervals[mergedIntervals.length - 1].end
    });
  }

  return gaps;
}

// Funzione per ottenere il primo gap
export function getFirstGap({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
}): Gap | null {
  const gaps = findGapsInShift({ shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix });
  return gaps.length > 0 ? gaps[0] : null;
}

// VERSIONE CORRETTA: Calcola il tempo totale scoperto basandosi sui gap reali
export function totalUncoveredMinutes({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
}): number {
  const gaps = findGapsInShift({ shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix });
  return gaps.reduce((total, gap) => total + gap.durationMinutes, 0);
}

// Funzione legacy mantenuta per compatibilità (ora deprecata ma funzionante)
export function uncoveredForSlot({
  slot,
  shiftStart,
  shiftEnd,
  slotTime,
}: {
  slot: {
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  };
  shiftStart: string;
  shiftEnd: string;
  slotTime?: { start?: string; end?: string };
}): number {
  // NOTA: Questa funzione è ora deprecata perché non gestisce correttamente 
  // le sovrapposizioni. Usa totalUncoveredMinutes per calcoli accurati.
  if (!slot?.operatorId) return 0;
  const start = slotTime?.start ?? slot.startTime ?? shiftStart;
  const end   = slotTime?.end   ?? slot.endTime   ?? shiftEnd;
  const slotDur = Math.max(0, toMinutes(end) - toMinutes(start));
  const fullDur = Math.max(0, toMinutes(shiftEnd) - toMinutes(shiftStart));
  return Math.max(0, fullDur - slotDur);
}
