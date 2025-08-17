// src/pages/ShiftInsertPage.tsx

import React from "react";
import ShiftPlanningForm from "@/components/events/ShiftPlanningForm";
import { useAppStore } from "@/store/appStore";
import { Users, Clock, ListChecks } from "lucide-react";

const ShiftInsertPage = () => {
  const operatorsCount = useAppStore((s) =>
    s.shifts.reduce((acc, sh) => acc + sh.operatorIds.filter(id => id).length, 0)
  );
  const assignedHours = useAppStore((s) =>
    s.shifts.reduce((acc, sh) => {
      const h =
        (new Date(`2000-01-01T${sh.endTime}`).getTime() -
          new Date(`2000-01-01T${sh.startTime}`).getTime()) /
        (1000 * 60 * 60);
      const assigned = sh.operatorIds.filter(id => id).length;
      return acc + h * assigned;
    }, 0).toFixed(1)
  );
  const totalEventHours = useAppStore((s) =>
    s.shifts.reduce((acc, sh) => {
      const h =
        (new Date(`2000-01-01T${sh.endTime}`).getTime() -
          new Date(`2000-01-01T${sh.startTime}`).getTime()) /
        (1000 * 60 * 60);
      return acc + h * sh.requiredOperators;
    }, 0).toFixed(1)
  );

  return (
    <main className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Colonna contatori */}
      <div className="space-y-4">
        <div className="bg-accent/20 rounded-lg p-4 border border-accent/40 flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Operatori assegnati</p>
            <p className="text-xl font-semibold text-primary">{operatorsCount}</p>
          </div>
        </div>
        <div className="bg-accent/20 rounded-lg p-4 border border-accent/40 flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Ore assegnate</p>
            <p className="text-xl font-semibold text-primary">{assignedHours}</p>
          </div>
        </div>
        <div className="bg-accent/20 rounded-lg p-4 border border-accent/40 flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Ore evento</p>
            <p className="text-xl font-semibold text-primary">{totalEventHours}</p>
          </div>
        </div>
      </div>

      {/* Colonna form */}
      <div className="md:col-span-2">
        <ShiftPlanningForm onSubmit={(values) => {
          // Inserisci qui il createShift come fai ora
        }} />
      </div>
    </main>
  );
};

export default ShiftInsertPage;
