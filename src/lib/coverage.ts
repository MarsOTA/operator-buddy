// src/lib/coverage.ts

// converte "HH:mm" in minuti
export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// converte minuti in formato Hh Mm
export function formatHM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h}h ` : ""}${m}m`;
}

interface Slot {
  id?: string;
  operatorId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

interface SlotTimes {
  [key: string]: { start?: string; end?: string };
}

export function totalUncoveredMinutes({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix,
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Slot[];
  slotTimes?: SlotTimes;
  slotKeyPrefix: string;
}): number {
  const sStart = toMinutes(shiftStart);
  const sEnd = toMinutes(shiftEnd);

  // lista di intervalli coperti
  const intervals = slots
    .map((slot, i) => {
      const key = `${slotKeyPrefix}${i}`;
      const st =
        slotTimes?.[key]?.start ??
        slot.startTime ??
        shiftStart;
      const en =
        slotTimes?.[key]?.end ??
        slot.endTime ??
        shiftEnd;

      if (!st || !en) return null;
      return [toMinutes(st), toMinutes(en)] as [number, number];
    })
    .filter((x): x is [number, number] => !!x)
    .sort((a, b) => a[0] - b[0]);

  if (intervals.length === 0) return sEnd - sStart;

  let uncovered = 0;
  let current = sStart;

  for (const [st, en] of intervals) {
    if (st > current) {
      uncovered += st - current;
    }
    if (en > current) {
      current = en;
    }
  }

  if (current < sEnd) {
    uncovered += sEnd - current;
  }

  return uncovered;
}
