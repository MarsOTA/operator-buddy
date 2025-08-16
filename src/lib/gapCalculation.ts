// src/lib/gapCalculation.ts
import { toMinutes } from "./coverage";

export interface Gap {
  start: string;
  end: string;
  duration: number;
}

/**
 * Calcola i gap (intervalli non coperti) in un turno
 */
export function calculateGaps({
  shiftStart,
  shiftEnd,
  coveredIntervals,
}: {
  shiftStart: string;
  shiftEnd: string;
  coveredIntervals: { start: string; end: string }[];
}): Gap[] {
  const sStart = toMinutes(shiftStart);
  const sEnd = toMinutes(shiftEnd);

  // ordina gli intervalli coperti
  const sorted = coveredIntervals
    .map((ci) => [toMinutes(ci.start), toMinutes(ci.end)] as [number, number])
    .filter(([st, en]) => st < en)
    .sort((a, b) => a[0] - b[0]);

  const gaps: Gap[] = [];
  let current = sStart;

  for (const [st, en] of sorted) {
    if (st > current) {
      gaps.push({
        start: minutesToTime(current),
        end: minutesToTime(st),
        duration: st - current,
      });
    }
    if (en > current) current = en;
  }

  if (current < sEnd) {
    gaps.push({
      start: minutesToTime(current),
      end: minutesToTime(sEnd),
      duration: sEnd - current,
    });
  }

  return gaps;
}

// converte minuti in stringa "HH:mm"
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
