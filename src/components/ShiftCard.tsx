import React from "react";
import ShiftHeader from "./ShiftHeader";

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

export default function ShiftCard({ shift }: { shift: Shift }) {
  // Stato locale per gli slot
  const [slots, setSlots] = React.useState<Slot[]>([
    {
      id: "1",
      operatorId: "op1",
      startTime: shift.startTime,
      endTime: "18:00",
    },
    {
      id: "2",
      operatorId: "op2",
      startTime: "18:00",
      endTime: shift.endTime,
    },
  ]);

  // Stato per modifiche manuali orari
  const [slotTimes, setSlotTimes] = React.useState<
    Record<string, { start?: string; end?: string }>
  >({});

  // Quando clicchi "Copri"
  function handleCover() {
    setSlots((prev) => [
      ...prev,
      {
        id: `cover-${Date.now()}`,
        operatorId: "copertura",
        startTime: shift.startTime,
        endTime: shift.endTime,
      },
    ]);
  }

  return (
    <div className="border rounded p-3 my-2">
      <ShiftHeader
        shift={shift}
        slots={slots}
        slotTimes={slotTimes}
        onCover={handleCover}
      />
      {/* Debug lista slot */}
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
