import React, { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import OperatorAssignDialog from "@/components/events/OperatorAssignDialog";
import { FileText } from "lucide-react";

// funzione per trovare il primo intervallo scoperto
function firstUncoveredInterval(slots: { start: string; end: string }[], shiftStart: string, shiftEnd: string) {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const fromMinutes = (m: number) => {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const start = toMinutes(shiftStart);
  const end = toMinutes(shiftEnd);

  // ordino gli slot
  const sorted = slots
    .map(s => ({ start: toMinutes(s.start), end: toMinutes(s.end) }))
    .sort((a, b) => a.start - b.start);

  let current = start;

  for (const s of sorted) {
    if (s.start > current) {
      return { start: fromMinutes(current), end: fromMinutes(s.start) };
    }
    if (s.end > current) {
      current = s.end;
    }
  }

  if (current < end) {
    return { start: fromMinutes(current), end: fromMinutes(end) };
  }

  return null;
}

const EventDetail: React.FC = () => {
  const { shifts, operators } = useAppStore();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<string | null>(null);

  const handleSaveNotes = (id: string) => {
    useAppStore.getState().updateShiftNotes(id, tempNotes);
    setEditingNotes(null);
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
  };

  const handleAssign = (shiftId: string) => {
    setCurrentShift(shiftId);
    setAssignOpen(true);
  };

  // handler per copertura buco
  const handleCoverClick = (shiftId: string, uncovered: { start: string; end: string }) => {
    useAppStore.getState().addShiftSlot(shiftId, {
      start: uncovered.start,
      end: uncovered.end,
      operatorId: null,
    });
  };

  return (
    <main className="p-6 space-y-6">
      <section>
        <div className="space-y-6">
          {shifts.map(shift => {
            const uncovered = firstUncoveredInterval(
              shift.slots.map(s => ({ start: s.startTime, end: s.endTime })),
              shift.startTime,
              shift.endTime
            );

            return (
              <div key={shift.id} className="border rounded-lg p-4 space-y-4">
                <h2 className="font-semibold">
                  Turno del {shift.date} {shift.startTime} – {shift.endTime}
                </h2>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Ora Inizio</th>
                      <th className="p-2 text-left">Ora Fine</th>
                      <th className="p-2 text-left">Operatore</th>
                      <th className="p-2 text-left">TL</th>
                      <th className="p-2 text-left">Note</th>
                      <th className="p-2 text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shift.slots.map(slot => (
                      <tr key={slot.id} className="border-b">
                        <td className="p-2">{slot.startTime}</td>
                        <td className="p-2">{slot.endTime}</td>
                        <td className="p-2">
                          {slot.operatorId
                            ? operators.find(o => o.id === slot.operatorId)?.name
                            : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAssign(shift.id)}
                              >
                                Assegna
                              </Button>
                            )}
                        </td>
                        <td className="p-2">{slot.isTL ? "✓" : "-"}</td>
                        <td className="p-2">
                          {slot.notes && slot.notes.trim() !== "" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingNotes(slot.id);
                                setTempNotes(slot.notes || "");
                              }}
                              title={slot.notes}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          ) : "-"}
                        </td>
                        <td className="p-2">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {uncovered && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                    ⚠️ Turno scoperto dalle {uncovered.start} alle {uncovered.end}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCoverClick(shift.id, uncovered)}
                    >
                      Copri
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {shifts.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
              Nessun turno pianificato. Crea il primo turno.
            </div>
          )}
        </div>
      </section>

      {/* Dialog note */}
      <Dialog open={!!editingNotes} onOpenChange={() => setEditingNotes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Note Turno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={tempNotes}
              onChange={e => setTempNotes(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEditNotes}>
                Annulla
              </Button>
              <Button onClick={() => editingNotes && handleSaveNotes(editingNotes)}>
                Salva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OperatorAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        operators={
          currentShift
            ? operators.filter(op =>
                !shifts.find(s => s.id === currentShift)?.slots.some(slot => slot.operatorId === op.id)
              )
            : operators
        }
        onConfirm={opId => {
          if (currentShift) {
            useAppStore.getState().assignOperator(currentShift, opId);
            setAssignOpen(false);
          }
        }}
      />
    </main>
  );
};

export default EventDetail;
