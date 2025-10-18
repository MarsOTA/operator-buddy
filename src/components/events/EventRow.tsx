import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EventRowProps {
  event: {
    id: string;
    title: string;
    date: string;
    dateFormatted: string;
    clientName: string;
    brandName: string;
    totalOperators: number;
    totalAssignedHours: string;
    shifts: Array<{
      id: string;
      startTime: string;
      endTime: string;
      activityType: string | null;
      role: string | null;
      pauseHours: number;
      operatorIds: string[];
    }>;
  };
  operators: Array<{ id: string; name: string }>;
  isSelected: boolean;
  onToggleSelect: (eventId: string) => void;
}

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

export default function EventRow({
  event,
  operators,
  isSelected,
  onToggleSelect,
}: EventRowProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value={event.id} className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline bg-accent/30 hover:bg-accent/50 transition-colors [&[data-state=open]]:bg-accent">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] sm:grid-cols-[auto_120px_1fr_auto_auto_auto] gap-3 sm:gap-4 w-full items-center text-sm pr-2">
              {/* Checkbox */}
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(event.id)}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              />

              {/* Data */}
              <div className="font-medium text-left whitespace-nowrap">
                {event.dateFormatted}
              </div>

              {/* Nome evento - cliccabile */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/events/${event.id}`);
                }}
                className="font-semibold text-left text-primary hover:underline truncate"
              >
                {event.title}
              </button>

              {/* Cliente */}
              <div className="hidden sm:block text-left text-muted-foreground truncate min-w-[120px]">
                {event.clientName}
              </div>

              {/* N° operatori */}
              <div className="text-center whitespace-nowrap">
                <span className="font-medium">{event.totalOperators}</span>
                <span className="text-xs text-muted-foreground ml-1">op.</span>
              </div>

              {/* Ore assegnate */}
              <div className="text-center whitespace-nowrap">
                <span className="font-medium">{event.totalAssignedHours}</span>
                <span className="text-xs text-muted-foreground ml-1">h</span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4 pt-2">
            {event.shifts.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Nessun turno per questo evento.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                      <th>Ora inizio</th>
                      <th>Ora fine</th>
                      <th>Tipologia attività</th>
                      <th>Mansione</th>
                      <th>Operatore</th>
                      <th className="text-center">Ore pausa</th>
                      <th className="text-right">Ore eff.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.shifts.flatMap((shift) => {
                      const isUnassigned = shift.operatorIds.length === 0;
                      const effectiveHours = calcEffectiveHours(shift.startTime, shift.endTime, shift.pauseHours ?? 0);

                      if (isUnassigned) {
                        return (
                          <tr
                            key={shift.id}
                            className="[&>td]:px-3 [&>td]:py-2 border-t transition-colors bg-orange-100 hover:bg-orange-200"
                          >
                            <td className="whitespace-nowrap">{shift.startTime}</td>
                            <td className="whitespace-nowrap">{shift.endTime}</td>
                            <td className="whitespace-nowrap">{shift.activityType ?? "—"}</td>
                            <td className="whitespace-nowrap">{shift.role ?? "—"}</td>
                            <td className="font-semibold text-orange-800">
                              <span className="text-xs text-orange-600">(non assegnato)</span>
                            </td>
                            <td className="text-center">{shift.pauseHours ?? 0}</td>
                            <td className="text-right">{effectiveHours.toFixed(2)}</td>
                          </tr>
                        );
                      }

                      return shift.operatorIds.map((operatorId) => {
                        const operatorName = operators.find(op => op.id === operatorId)?.name || "—";
                        return (
                          <tr
                            key={`${shift.id}-${operatorId}`}
                            className="[&>td]:px-3 [&>td]:py-2 border-t transition-colors hover:bg-muted/50"
                          >
                            <td className="whitespace-nowrap">{shift.startTime}</td>
                            <td className="whitespace-nowrap">{shift.endTime}</td>
                            <td className="whitespace-nowrap">{shift.activityType ?? "—"}</td>
                            <td className="whitespace-nowrap">{shift.role ?? "—"}</td>
                            <td>{operatorName}</td>
                            <td className="text-center">{shift.pauseHours ?? 0}</td>
                            <td className="text-right">{effectiveHours.toFixed(2)}</td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                Vedi dettagli evento
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
