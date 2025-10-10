import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import CreateEventModal from "@/components/events/CreateEventModal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Shift } from "@/store/appStore";

const calcEffectiveHours = (start: string, end: string, pauseHours: number = 0): number => {
  try {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    let diff = (endMin - startMin) / 60;
    if (diff < 0) diff = 0;
    return Math.max(0, diff - pauseHours);
  } catch {
    return 0;
  }
};

const safeItDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT");
  } catch {
    return iso;
  }
};

const EventsList = () => {
  const navigate = useNavigate();
  const events = useAppStore((s) => s.events);
  const brands = useAppStore((s) => s.brands);
  const operators = useAppStore((s) => s.operators);
  const getShiftsByEvent = useAppStore((s) => s.getShiftsByEvent);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const eventData = useMemo(() => {
    return events.map((ev) => {
      const brand = brands.find((b) => b.id === ev.brandId)?.name || "—";
      const shifts = getShiftsByEvent(ev.id).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
      
      // Calcolo totale operatori assegnati
      const totalOperators = shifts.reduce((sum, shift) => sum + shift.operatorIds.length, 0);
      
      // Calcolo ore fatturate (somma ore effettive)
      const totalBilledHours = shifts.reduce((sum, shift) => {
        const hours = calcEffectiveHours(shift.startTime, shift.endTime, shift.pauseHours ?? 0);
        return sum + hours;
      }, 0);
      
      // Calcolo ore assegnate (ore effettive × numero operatori)
      const totalAssignedHours = shifts.reduce((sum, shift) => {
        const hours = calcEffectiveHours(shift.startTime, shift.endTime, shift.pauseHours ?? 0);
        return sum + (hours * shift.operatorIds.length);
      }, 0);
      
      return {
        id: ev.id,
        title: ev.title,
        brand,
        totalOperators,
        totalBilledHours: totalBilledHours.toFixed(2),
        totalAssignedHours: totalAssignedHours.toFixed(2),
        shifts,
      };
    });
  }, [events, brands, getShiftsByEvent]);

  return (
    <main className="container py-8">
      <Helmet>
        <title>Lista Eventi | Gestionale Sicurezza</title>
        <meta name="description" content="Elenco eventi con cliente e data. Crea e gestisci eventi dell'agenzia di sicurezza." />
        <link rel="canonical" href="/events" />
      </Helmet>

      <section className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Lista Eventi</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus />
          Crea evento
        </Button>
      </section>

      {eventData.length === 0 ? (
        <section className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          Nessun evento. Crea il primo evento.
        </section>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {eventData.map((ev) => (
            <AccordionItem key={ev.id} value={ev.id} className="rounded-lg border border-border overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-accent/30 hover:bg-accent/50 transition-colors [&[data-state=open]]:bg-accent">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 w-full items-center text-sm pr-2">
                  <div className="font-medium text-left truncate">{ev.title}</div>
                  <div className="w-32 text-left text-muted-foreground truncate">{ev.brand}</div>
                  <div className="w-24 text-center">{ev.totalOperators}</div>
                  <div className="w-24 text-center">{ev.totalBilledHours}</div>
                  <div className="w-24 text-center">{ev.totalAssignedHours}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                {ev.shifts.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    Nessun turno per questo evento.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                          <th>Data</th>
                          <th>Ora inizio</th>
                          <th>Ora fine</th>
                          <th>Tipologia attività</th>
                          <th>Mansione</th>
                          <th>Operatori</th>
                          <th className="text-center">N° op.</th>
                          <th className="text-center">Ore pausa</th>
                          <th className="text-right">Ore eff.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ev.shifts.map((shift) => {
                          const assignedOperators = shift.operatorIds
                            .map(id => operators.find(op => op.id === id)?.name)
                            .filter(Boolean)
                            .join(", ") || "—";
                          const isUnassigned = shift.operatorIds.length === 0;
                          const effectiveHours = calcEffectiveHours(shift.startTime, shift.endTime, shift.pauseHours ?? 0);
                          
                          return (
                            <tr 
                              key={shift.id} 
                              className={`[&>td]:px-3 [&>td]:py-2 border-t transition-colors ${
                                isUnassigned ? 'bg-orange-100 hover:bg-orange-200' : 'hover:bg-muted/50'
                              }`}
                            >
                              <td className="whitespace-nowrap">{safeItDate(shift.date)}</td>
                              <td className="whitespace-nowrap">{shift.startTime}</td>
                              <td className="whitespace-nowrap">{shift.endTime}</td>
                              <td className="whitespace-nowrap">{shift.activityType ?? "—"}</td>
                              <td className="whitespace-nowrap">{shift.role ?? "—"}</td>
                              <td className={`${isUnassigned ? 'font-semibold text-orange-800' : ''}`}>
                                {assignedOperators}
                                {isUnassigned && <span className="ml-1 text-xs text-orange-600">(non assegnato)</span>}
                              </td>
                              <td className="text-center">{shift.operatorIds.length}</td>
                              <td className="text-center">{shift.pauseHours ?? 0}</td>
                              <td className="text-right">{effectiveHours.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/events/${ev.id}`)}
                  >
                    Vedi dettagli evento
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
      <CreateEventModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </main>
  );
};

export default EventsList;
