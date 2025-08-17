import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ID = string;

export interface Client {
  id: ID;
  name: string;
}

export interface Brand {
  id: ID;
  name: string;
}

export interface Operator {
  id: ID;
  name: string;
  role: string;
  availability: "Disponibile" | "Occupato" | "In ferie";
}

export interface EventItem {
  id: ID;
  title: string;
  clientId: ID;
  brandId: ID;
  address: string;
  activityCode?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface Task {
  id: ID;
  eventId: ID;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type ActivityType =
  | "doorman"
  | "presidio notturno e diurno"
  | "presidio notturno"
  | "presido diurno"
  | "gestione flussi ingresso e uscite"
  | "shooting"
  | "endorsement"
  | "GPG armata con auto"
  | "GPG armata senza auto";

export const ACTIVITY_TYPES: ActivityType[] = [
  "doorman",
  "presidio notturno e diurno",
  "presidio notturno",
  "presido diurno",
  "gestione flussi ingresso e uscite",
  "shooting",
  "endorsement",
  "GPG armata con auto",
  "GPG armata senza auto",
];

export interface Shift {
  id: ID;
  eventId: ID;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  operatorIds: ID[];  // slot (una riga per operatore)
  activityType?: ActivityType;
  teamLeaderId?: ID;
  requiredOperators: number; // ⚠️ CAPIENZA FISSA DEL TURNO
  notes?: string;
}

interface AppState {
  clients: Client[];
  brands: Brand[];
  operators: Operator[];
  events: EventItem[];
  shifts: Shift[];
  tasks: Task[];

  createEvent: (data: Omit<EventItem, "id">) => EventItem;
  updateEvent: (id: ID, data: Partial<EventItem>) => void;
  getEventById: (id: ID) => EventItem | undefined;

  createShift: (data: Omit<Shift, "id" | "operatorIds"> & { operatorIds?: ID[] }) => Shift;
  assignOperators: (shiftId: ID, operatorIds: ID[]) => void;
  setOperatorSlot: (shiftId: ID, slotIndex: number, operatorId: ID) => void;
  addSlotToShift: (shiftId: ID, startTime?: string, endTime?: string) => void;
  removeOperator: (shiftId: ID, operatorId: ID) => void;
  replaceOperator: (shiftId: ID, oldOperatorId: ID, newOperatorId: ID) => void;
  setTeamLeader: (shiftId: ID, operatorId: ID) => void;
  updateShiftNotes: (shiftId: ID, notes: string) => void;
  updateShiftTime: (shiftId: ID, data: { startTime?: string; endTime?: string }) => void;
  updateShiftActivityType: (shiftId: ID, activityType: ActivityType | undefined) => void;
  deleteShift: (shiftId: ID) => void;
  getShiftsByEvent: (eventId: ID) => Shift[];
  updateEventAddress: (eventId: ID, address: string) => void;
  updateEventActivityCode: (eventId: ID, activityCode: string) => void;

  createTask: (data: Omit<Task, "id" | "createdAt" | "completed">) => Task;
  updateTask: (id: ID, data: Partial<Pick<Task, "title" | "completed">>) => void;
  deleteTask: (id: ID) => void;
  getTasksByEvent: (eventId: ID) => Task[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

const initialClients: Client[] = [
  { id: "c1", name: "Alfa Group" },
  { id: "c2", name: "Beta S.p.A." },
  { id: "c3", name: "Gamma SRL" },
];

const initialBrands: Brand[] = [
  { id: "b1", name: "BrandX" },
  { id: "b2", name: "BrandY" },
  { id: "b3", name: "BrandZ" },
];

const initialOperators: Operator[] = [
  { id: "o1", name: "Mario Rossi", role: "Guardia", availability: "Disponibile" },
  { id: "o2", name: "Luca Bianchi", role: "Supervisore", availability: "Disponibile" },
  { id: "o3", name: "Anna Verdi", role: "Guardia", availability: "Occupato" },
  { id: "o4", name: "Sara Neri", role: "Addetto Accoglienza", availability: "Disponibile" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: initialClients,
      brands: initialBrands,
      operators: initialOperators,
      events: [],
      shifts: [],
      tasks: [],

      createEvent: (data) => {
        const newEvent: EventItem = { id: uid(), ...data };
        set((state) => ({ events: [newEvent, ...state.events] }));
        return newEvent;
      },

      updateEvent: (id, data) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }));
      },

      getEventById: (id) => get().events.find((e) => e.id === id),

      // Crea turno: requiredOperators è fisso; operatorIds viene dal chiamante (es. array di "" lungo requiredOperators)
      createShift: ({ eventId, date, startTime, endTime, operatorIds = [], activityType, teamLeaderId, requiredOperators, notes }) => {
        const newShift: Shift = {
          id: uid(),
          eventId,
          date,
          startTime,
          endTime,
          operatorIds,
          activityType,
          teamLeaderId,
          requiredOperators,
          notes
        };
        set((state) => ({ shifts: [newShift, ...state.shifts] }));
        return newShift;
      },

      // Mantengo per retro-compatibilità (aggiunge in coda eventuali id, deduplicando)
      assignOperators: (shiftId, operatorIds) => {
        set((state) => ({
          shifts: state.shifts.map((s) =>
            s.id === shiftId
              ? { ...s, operatorIds: Array.from(new Set([...s.operatorIds, ...operatorIds])) }
              : s
          ),
        }));
      },

      // Setta/crea lo slot all'indice e assegna l'operatore ("" per svuotare)
      setOperatorSlot: (shiftId, slotIndex, operatorId) => {
        set((state) => ({
          shifts: state.shifts.map((s) => {
            if (s.id !== shiftId) return s;
            const next = [...s.operatorIds];
            while (next.length <= slotIndex) next.push("");
            next[slotIndex] = operatorId; // "" per rimuovere assegnazione
            // se rimuovi il TL
            const newTL = s.teamLeaderId && next.includes(s.teamLeaderId) ? s.teamLeaderId : undefined;
            return { ...s, operatorIds: next, teamLeaderId: newTL };
          }),
        }));
      },

      // ➕ Aggiungi una riga (slot) VUOTA: NON modificare requiredOperators
      addSlotToShift: (shiftId, _startTime?: string, _endTime?: string) => {
        set((state) => ({
          shifts: state.shifts.map((s) => {
            if (s.id !== shiftId) return s;
            const newOperatorIds = [...s.operatorIds, ""];
            return {
              ...s,
              operatorIds: newOperatorIds, // capienza resta quella fissata in requiredOperators
            };
          }),
        }));
      },

      // 🗑️ Rimuovi assegnazione dell'operatore (senza eliminare la riga)
      removeOperator: (shiftId, operatorId) => {
        set((state) => ({
          shifts: state.shifts.map((s) => {
            if (s.id !== shiftId) return s;
            const idx = s.operatorIds.findIndex((id) => id === operatorId);
            if (idx === -1) return s;
            const next = [...s.operatorIds];
            next[idx] = ""; // libera lo slot
            const newTL = s.teamLeaderId === operatorId ? undefined : s.teamLeaderId;
            return { ...s, operatorIds: next, teamLeaderId: newTL };
          }),
        }));
      },

      replaceOperator: (shiftId, oldOperatorId, newOperatorId) => {
        set((state) => ({
          shifts: state.shifts.map((s) =>
            s.id === shiftId
              ? {
                  ...s,
                  operatorIds: s.operatorIds.map((id) => (id === oldOperatorId ? newOperatorId : id)),
                  teamLeaderId: s.teamLeaderId === oldOperatorId ? newOperatorId : s.teamLeaderId,
                }
              : s
          ),
        }));
      },

      setTeamLeader: (shiftId, operatorId) => {
        set((state) => ({
          shifts: state.shifts.map((s) => {
            if (s.id !== shiftId) return s;
            // se non assegnato nello shift → rimuovi TL
            if (!operatorId || !s.operatorIds.includes(operatorId)) {
              return { ...s, teamLeaderId: undefined };
            }
            return { ...s, teamLeaderId: operatorId };
          }),
        }));
      },

      updateShiftNotes: (shiftId, notes) => {
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === shiftId ? { ...s, notes } : s)),
        }));
      },

      updateShiftTime: (shiftId, data) => {
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === shiftId ? { ...s, ...data } : s)),
        }));
      },

      updateShiftActivityType: (shiftId, activityType) => {
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === shiftId ? { ...s, activityType } : s)),
        }));
      },

      deleteShift: (shiftId) => {
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== shiftId),
        }));
      },

      getShiftsByEvent: (eventId) => get().shifts.filter((s) => s.eventId === eventId),

      updateEventAddress: (eventId, address) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, address } : e)),
        }));
      },

      updateEventActivityCode: (eventId, activityCode) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, activityCode } : e)),
        }));
      },

      createTask: (data) => {
        const newTask: Task = {
          id: uid(),
          ...data,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      getTasksByEvent: (eventId) =>
        get()
          .tasks.filter((t) => t.eventId === eventId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }),
    { name: "security-agency-store" }
  )
);
