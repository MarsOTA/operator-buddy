import * as XLSX from 'xlsx';

interface ProcessedEvent {
  id: string;
  title: string;
  date: string;
  clientName: string;
  brandName: string;
  shifts: {
    startTime: string;
    endTime: string;
    activityType: string | null;
    role: string | null;
    pauseHours: number;
    operatorIds: string[];
  }[];
}

interface Operator {
  id: string;
  name: string;
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

const formatDateDDMMYY = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  } catch {
    return dateStr;
  }
};

export function exportEventsToExcel(
  events: ProcessedEvent[],
  selectedEventIds: string[],
  operators: Operator[]
) {
  const eventsToExport = events.filter(ev => selectedEventIds.includes(ev.id));

  if (eventsToExport.length === 0) {
    return;
  }

  const rows = eventsToExport.flatMap(event => 
    event.shifts.flatMap(shift => {
      if (shift.operatorIds.length === 0) {
        return [{
          Data: formatDateDDMMYY(event.date),
          Evento: event.title,
          Cliente: event.clientName,
          Brand: event.brandName,
          "Ora Inizio": shift.startTime,
          "Ora Fine": shift.endTime,
          "Tipologia Attività": shift.activityType || "—",
          Mansione: shift.role || "—",
          Operatore: "(non assegnato)",
          "Ore Pausa": shift.pauseHours || 0,
          "Ore Effettive": calcEffectiveHours(
            shift.startTime, 
            shift.endTime, 
            shift.pauseHours
          ).toFixed(2),
        }];
      }

      return shift.operatorIds.map(operatorId => {
        const operator = operators.find(op => op.id === operatorId);
        return {
          Data: formatDateDDMMYY(event.date),
          Evento: event.title,
          Cliente: event.clientName,
          Brand: event.brandName,
          "Ora Inizio": shift.startTime,
          "Ora Fine": shift.endTime,
          "Tipologia Attività": shift.activityType || "—",
          Mansione: shift.role || "—",
          Operatore: operator?.name || "—",
          "Ore Pausa": shift.pauseHours || 0,
          "Ore Effettive": calcEffectiveHours(
            shift.startTime, 
            shift.endTime, 
            shift.pauseHours
          ).toFixed(2),
        };
      });
    })
  );

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 10 }, // Data
    { wch: 25 }, // Evento
    { wch: 20 }, // Cliente
    { wch: 15 }, // Brand
    { wch: 10 }, // Inizio
    { wch: 10 }, // Fine
    { wch: 15 }, // Attività
    { wch: 15 }, // Mansione
    { wch: 20 }, // Operatore
    { wch: 8 },  // Pausa
    { wch: 10 }, // Ore Eff.
  ];

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Programmazione');
  XLSX.writeFile(wb, `programmazione_eventi_${dateStr}.xlsx`);
}
