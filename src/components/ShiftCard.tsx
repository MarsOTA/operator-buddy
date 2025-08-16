// src/components/ShiftCard.tsx
import React from "react";
import ShiftHeader from "./ShiftHeader";
import { toMinutes } from "../lib/coverage";

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Slot = {
  id?: string;
  operatorId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

// Trova il primo gap reale (considerando concorrenza semplice: unione intervalli)
function findFirstGap(shift: Shift, slots: Slot[]): { start: string; end: string } | null {
  const S = toMinutes(shift.startTime);
  const E = toMinutes(shift.endTime);

  const intervals: [number, number][] = (slots || [])
    .filter((s) => s.startTime && s.endTime)
    .map((s) => [toMinutes(s.startTime!), toMinutes(s.endTime!)])
    .map(([a, b]) => [Math.max(a, S), Math.min(b, E)])
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);

  let cursor = S;
  for (const [st, en] of intervals) {
    if (st > cursor) {
      return { start: mmToHHMM(cursor), end: mmToHHMM(st) };
    }
    cursor = Math.max(cursor, en);
  }
  if (cursor < E) return { start: mmToHHMM(cursor), end: mmToHHMM(E) };
  return null;
}

function mmToHHMM(x: number): string {
  const h = String(Math.floor(x / 60)).padStart(2, "0");
  const m = String(x % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export default function ShiftCard({ shift }: { shift: Shift }) {
  // Esempio iniziale con gap 18:00–21:00 (tutti assegnati ma buco esiste)
  const [slots, setSlots] = React.useState<Slot[]>([
    { id: "1", operatorId: "op1", startTime: shift.startTime, endTime: "18:00" },
    { id: "2", operatorId: "op2", startTime: shift.startTime, endTime: "18:00" },
  ]);

  const [slotTimes] = React.useState<Record<string, { start?: string; end?: string }>>({});

  function handleCover() {
    const gap = findFirstGap(shift, slots);
    const start = gap?.start ?? shift.startTime;
    const end = gap?.end ?? shift.endTime;

    setSlots((prev) => [
      ...prev,
      {
        id: `cover-${Date.now()}`,
        operatorId: "copertura", // puoi lasciarlo vuoto se preferisci
        startTime: start,
        endTime: end,
      },
    ]);
  }

  return (
    <div className="border rounded p-3 my-2">
      <ShiftHeader shift={shift} slots={slots} slotTimes={slotTimes} onCover={handleCover} />
      <ul className="mt-2 text-sm text-gray-600">
        {slots.map((s) => (
          <li key={s.id}>
            {s.operatorId ?? "—"}: {s.startTime} – {s.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
}
