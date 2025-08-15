import React from "react";
import { totalUncoveredMinutes, formatHM } from "@/lib/coverage";
import { useAppStore } from "@/store/appStore";

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
}: {
  shift: Shift;
  slots: Slot[];
  slotTimes?: Record<string, { start?: string; end?: string }>;
}) {
  const coverShift = useAppStore((s) => s.coverShift);

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

  const uncoveredMin = React.useMemo(() => {
    return totalUncoveredMinutes({
      shiftStart: shift.startTime,
      shiftEnd: shift.endTime,
      slots,
      slotTimes,
      slotKeyPrefix: `${shift.id}-`,
    });
  }, [depsKey, shift.startTime, shift.endTime]);

  const allSlotsAssigned = slots.every((s) => !!s.operatorId);
  const showCover = allSlotsAssigned && uncoveredMin > 0;

  return (
    <div className="flex items-center justify-between py-2 border-b border-border">
      <h3 className="text-lg font-semibold">
        {`Turno del ${shift.date} ${shift.startTime} – ${shift.endTime}`}
      </h3>
      <div className="flex items-center gap-2">
        {uncoveredMin <= 0 ? (
          <span className="px-2 py-1 rounded bg-green-500 text-white text-sm">
            Coperto
          </span>
        ) : (
          <>
            <span className="px-2 py-1 rounded bg-yellow-500 text-white text-sm">
              ⚠ {formatHM(uncoveredMin)} scoperto
            </span>
            {showCover && (
              <button
                type="button"
                className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => coverShift(shift.id)}
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
