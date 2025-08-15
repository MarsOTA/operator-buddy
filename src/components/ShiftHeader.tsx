import React from "react";
import { totalUncoveredMinutes, formatHM } from "@/lib/coverage";
import { useAppStore, Shift, Slot } from "@/store/appStore";
import { Button } from "@/components/ui/button";

export default function ShiftHeader({
  shift,
}: {
  shift: Shift;
}) {
  const coverShift = useAppStore((s) => s.coverShift);

  const uncoveredMin = React.useMemo(() => {
    return totalUncoveredMinutes({
      shiftStart: shift.startTime,
      shiftEnd: shift.endTime,
      slots: shift.slots,
      slotKeyPrefix: `${shift.id}-`,
    });
  }, [shift]);

  const allSlotsAssigned = shift.slots.every((s) => !!s.operatorId);
  const showCover = allSlotsAssigned && uncoveredMin > 0;

  return (
    <div className="flex items-center justify-between py-2 border-b">
      <h3 className="text-lg font-semibold">
        Turno del {shift.date} {shift.startTime} – {shift.endTime}
      </h3>
      <div className="flex items-center gap-2">
        {uncoveredMin <= 0 ? (
          <span className="text-green-600 font-medium">OK</span>
        ) : (
          <>
            <span className="text-yellow-600 font-medium">
              ⚠ {formatHM(uncoveredMin)} scoperto
            </span>
            {showCover && (
              <Button
                size="sm"
                variant="default"
                onClick={() => coverShift(shift.id)}
              >
                + Copri
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
