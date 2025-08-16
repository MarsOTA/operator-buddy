// src/components/ShiftHeader.tsx
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

export default function ShiftHeader({
  shift,
  slots,
  slotTimes,
  onCover,
}: {
  shift: Shift;
  slots: Slot[];
  slotTimes?: Record<string, { start?: string; end?: string }>;
  onCover: () => void;
}) {
  // Chiave per aggiornamenti reattivi
  const depsKey = React.useMemo(
    () =>
      slots
        .map((slot, i) => {
          const k = `${shift.id}-${i}`;
          const st = slotTimes?.[k]?.start ?? slot.startTime ?? shift.startTime;
          const en = slotTimes?.[k]?.end ?? slot.endTime ?? shift.endTime;
          return [slot.operatorId ?? "", st ?? "", en ?? ""].join("|");
        })
        .join("||"),
    [shift.id, shift.startTime, shift.endTime, slots, slotTimes]
  );

  // Calcolo minuti scoperti
  const uncoveredMin = React.useMemo(() => {
    return totalUncoveredMinutes({
      shiftStart: shift.startTime,
      shiftEnd: shift.endTime,
      slots,
      slotTimes,
      slotKeyPrefix: `${shift.id}-`,
    });
  }, [depsKey, shift.startTime, shift.endTime]);

  // Tutti slot assegnati?
  const allSlotsAssigned = slots.length > 0 && slots.every((s) => !!s.operatorId);
  const showCover = allSlotsAssigned && uncoveredMin > 0;

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
                onClick={onCover}
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
