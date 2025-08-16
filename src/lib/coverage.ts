// src/lib/coverage.ts

export function toMinutes(t: string | null | undefined): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatHM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

type Slot = {
  id?: string;
  operatorId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

type SlotTimes = Record<string, { start?: string; end?: string }>;

export function totalUncoveredMinutes({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Slot[];
  slotTimes?: SlotTimes;
  slotKeyPrefix?: string;
}): number {
  const shiftStartMin = toMinutes(shiftStart);
  const shiftEndMin = toMinutes(shiftEnd);

  const intervals: [number, number][] = (slots || []).map((slot, i) => {
    const key = `${slotKeyPrefix}${i}`;
    const st = slotTimes?.[key]?.start ?? slot.startTime ?? shiftStart;
    const en = slotTimes?.[key]?.end ?? slot.endTime ?? shiftEnd;
    return [toMinutes(st), toMinutes(en)];
  });

  if (intervals.length === 0) return Math.max(shiftEndMin - shiftStartMin, 0);

  intervals.sort((a, b) => a[0] - b[0]);

  // merge e somma copertura
  let covered = 0;
  let cs = Math.max(intervals[0][0], shiftStartMin);
  let ce = Math.min(intervals[0][1], shiftEndMin);

  for (let i = 1; i < intervals.length; i++) {
    const s = Math.max(intervals[i][0], shiftStartMin);
    const e = Math.min(intervals[i][1], shiftEndMin);
    if (s <= ce) {
      ce = Math.max(ce, e);
    } else {
      covered += Math.max(ce - cs, 0);
      cs = s;
      ce = e;
    }
  }
  covered += Math.max(ce - cs, 0);

  const total = Math.max(shiftEndMin - shiftStartMin, 0);
  return Math.max(total - covered, 0);
}
