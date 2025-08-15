import { create } from "zustand";

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  operatorIds: string[];
  notes?: string;
  covered?: boolean; // nuovo flag per segnare se coperto
}

export interface Operator {
  id: string;
  name: string;
}

interface AppState {
  shifts: Shift[];
  operators: Operator[];

  // azioni
  setShifts: (shifts: Shift[]) => void;
  addShift: (shift: Shift) => void;
  updateShift: (shift: Shift) => void;
  removeShift: (id: string) => void;

  setOperators: (ops: Operator[]) => void;

  // nuova azione per coprire turno
  coverShift: (shiftId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  shifts: [],
  operators: [],

  setShifts: (shifts) => set({ shifts }),

  addShift: (shift) =>
    set((state) => ({
      shifts: [...state.shifts, shift],
    })),

  updateShift: (shift) =>
    set((state) => ({
      shifts: state.shifts.map((s) => (s.id === shift.id ? shift : s)),
    })),

  removeShift: (id) =>
    set((state) => ({
      shifts: state.shifts.filter((s) => s.id !== id),
    })),

  setOperators: (ops) => set({ operators: ops }),

  coverShift: (shiftId) =>
    set((state) => ({
      shifts: state.shifts.map((s) =>
        s.id === shiftId ? { ...s, covered: true } : s
      ),
    })),
}));
