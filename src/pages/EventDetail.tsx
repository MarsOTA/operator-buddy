import React from "react";
import { useAppStore } from "@/store/appStore";

const EventDetail: React.FC = () => {
  const shifts = useAppStore((state) => state.shifts);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dettagli Turni</h2>

      {Array.isArray(shifts) && shifts.length > 0 ? (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="rounded-xl border p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between">
                <p className="font-medium">{shift.name || "Turno"}</p>
                <p className="text-gray-500 text-sm">
                  {shift.start} – {shift.end}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Operatori assegnati:{" "}
                {shift.operatorIds?.length ?? 0}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          Nessun turno pianificato. Crea il primo turno.
        </p>
      )}
    </div>
  );
};

export default EventDetail;
