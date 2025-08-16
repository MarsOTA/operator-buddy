// src/lib/coverage.ts

export function toMinutes(t: string | null | undefined): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function formatHM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface Params {
  shiftStart: string;
  shiftEnd: string;
  slots: { id?: string; operatorId?: string | null; startTime?: string | null; endTime?: string | null }[];
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
}

export function totalUncoveredMinutes({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
}: Params): number {
  const shiftStartMin = toMinutes(shiftStart);
  const shiftEndMin = toMinutes(shiftEnd);

  // prendo gli intervalli reali degli slot (priorità a slotTimes)
  const intervals = slots.map((slot, i) => {
    const key = `${slotKeyPrefix}${i}`;
    const st = slotTimes?.[key]?.start ?? slot.startTime ?? shiftStart;
    const en = slotTimes?.[key]?.end ?? slot.endTime ?? shiftEnd;
    return [toMinutes(st), toMinutes(en)];
  });

  if (intervals.length === 0) {
    return shiftEndMin - shiftStartMin;
  }

  // ordina intervalli
  intervals.sort((a, b) => a[0] - b[0]);

  // merge intervalli coperti
  let covered = 0;
  let currentStart = intervals[0][0];
  let currentEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    if (s <= currentEnd) {
      currentEnd = Math.max(currentEnd, e);
    } else {
      covered += currentEnd - currentStart;
      currentStart = s;
      currentEnd = e;
    }
  }
  covered += currentEnd - currentStart;

  // minuti totali scoperti
  const total = shiftEndMin - shiftStartMin;
  return Math.max(total - covered, 0);
}
