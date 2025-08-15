import React, { useState } from "react";
import { useAppStore, Shift } from "@/store/appStore";
import ShiftHeader from "@/components/ShiftHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

export default function EventDetail() {
  const shifts = useAppStore((s) => s.shifts);
  const updateShiftNotes = useAppStore((s) => s.updateShiftNotes);

  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  const handleSaveNotes = (shiftId: string) => {
    updateShiftNotes(shiftId, tempNotes);
    setEditingNotes(null);
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
  };

  const sortedShifts = [...shifts].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <main className="p-4 space-y-6">
      {sortedShifts.map((shift: Shift) => (
        <div key={shift.id} className="border rounded-lg shadow-sm">
          <ShiftHeader shift={shift} />
          <div className="p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Operatore</th>
                  <th className="px-2 py-1 text-left">Orario</th>
                  <th className="px-2 py-1 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {shift.slots && shift.slots.length > 0 ? (
                  shift.slots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="px-2 py-1">{slot.operatorId ?? "-"}</td>
                      <td className="px-2 py-1">
                        {(slot.startTime ?? shift.startTime) +
                          " - " +
                          (slot.endTime ?? shift.endTime)}
                      </td>
                      <td className="px-2 py-1">
                        {shift.notes && shift.notes.trim() !== "" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNotes(shift.id);
                              setTempNotes(shift.notes || "");
                            }}
                            aria-label="Visualizza/Modifica note"
                            title={shift.notes}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-2 py-2 text-center text-muted-foreground">
                      Nessun operatore assegnato
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {sortedShifts.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
          Nessun turno pianificato. Crea il primo turno.
        </div>
      )}

      {/* Dialog per modificare note */}
      <Dialog open={!!editingNotes} onOpenChange={() => setEditingNotes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Note Turno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              placeholder="Inserisci note per il turno"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEditNotes}>
                Annulla
              </Button>
              <Button
                onClick={() =>
                  editingNotes && handleSaveNotes(editingNotes)
                }
              >
                Salva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
