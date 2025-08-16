import React from "react";
import { totalUncoveredMinutes, formatHM } from "@/lib/coverage";

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

type SlotTimes = Record<string, { start?: string; end?: string }>;

// util locali per non dipendere da altre export
const toMin = (t?: string | null) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const mmToHHMM = (x: number) => {
  const h = String(Math.floor(x / 60)).padStart(2, "0");
  const m = String(x % 60).padStart(2, "0");
  return `${h}:${m}`;
};

/** calcola il PRIMO buco reale (considera slotTimes come override) */
function getFirstGap(
  shift: Shift,
  slots: Slot[],
  slotTimes?: SlotTimes,
  slotKeyPrefix = ""
): { start: string; end: string } | null {
  const S = toMin(shift.startTime);
  const E = toMin(shift.endTime);

  // intervalli effettivi (slotTimes > slot > shift)
  const intervals: [number, number][] = (slots || [])
    .map((s, i) => {
      const key = `${slotKeyPrefix}${i}`;
      const st = slotTimes?.[key]?.start ?? s.startTime ?? shift.startTime;
      const en = slotTimes?.[key]?.end ?? s.endTime ?? shift.endTime;
      return [Math.max(toMin(st), S), Math.min(toMin(en), E)] as [number, number];
    })
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);

  let cursor = S;
  for (const [st, en] of intervals) {
    if (st > cursor) return { start: mmToHHMM(cursor), end: mmToHHMM(st) };
    cursor = Math.max(cursor, en);
  }
  if (cursor < E) return { start: mmToHHMM(cursor), end: mmToHHMM(E) };
  return null;
}

export default function ShiftHeader({
  shift,
  slots,
  slotTimes,
  onCover,
}: {
  shift: Shift;
  slots: Slot[];
  slotTimes?: SlotTimes;
  // ora accetta opzionalmente il range del buco
  onCover: (range?: { start: string; end: string }) => void;
}) {
  // dipendenze per ricalcolo
  const depsKey = React.useMemo(
    () =>
      (slots || [])
        .map((slot, i) => {
          const k = `${shift.id}-${i}`;
          const st = slotTimes?.[k]?.start ?? slot.startTime ?? shift.startTime;
          const en = slotTimes?.[k]?.end ?? slot.endTime ?? shift.endTime;
          return [slot.operatorId ?? "", st ?? "", en ?? ""].join("|");
        })
        .join("||"),
    [shift.id, shift.startTime, shift.endTime, slots, slotTimes]
  );

  // minuti scoperti totali (per badge)
  const uncoveredMin = React.useMemo(() => {
    return totalUncoveredMinutes({
      shiftStart: shift.startTime,
      shiftEnd: shift.endTime,
      slots,
      slotTimes,
      slotKeyPrefix: `${shift.id}-`,
    });
  }, [depsKey, shift.startTime, shift.endTime]);

  // mostra "Copri" solo se tutti assegnati e rimangono minuti scoperti
  const allAssigned = (slots?.length ?? 0) > 0 && (slots || []).every((s) => !!s.operatorId);
  const showCover = allAssigned && uncoveredMin > 0;

  // quando clicchi Copri calcolo qui il primo buco e lo passo al parent
  const handleCoverClick = React.useCallback(() => {
    const gap = getFirstGap(shift, slots || [], slotTimes, `${shift.id}-`);
    onCover(gap || { start: shift.startTime, end: shift.endTime });
  }, [shift, slots, slotTimes, onCover]);

  return (
    <div className="flex items-center justify-between py-2 border-b">
      <h3 className="text-base font-medium">
        Turno del {shift.date} {shift.startTime} – {shift.endTime}
      </h3>
      <div className="flex items-center gap-2">
        {uncoveredMin <= 0 ? (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            OK
          </span>
        ) : (
          <>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              ⚠ {formatHM(uncoveredMin)} scoperto
            </span>
            {showCover && (
              <button
                type="button"
                className="px-3 py-1 text-sm font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleCoverClick}
              >
                + Copri
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
