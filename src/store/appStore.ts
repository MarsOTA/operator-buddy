import { create } from "zustand";

export type Slot = {
  id: string;
  operatorId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

export type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  slots: Slot[];
  notes?: string;
};

type AppState = {
  shifts: Shift[];
  coverShift: (shiftId: string) => void;
  updateShiftNotes: (shiftId: string, notes: string) => void;
};

// ✅ Fake seed per test
const seedShifts: Shift[] = [
  {
    id: "s1",
    date: "2025-08-16",
    startTime: "09:00",
    endTime: "13:00",
    notes: "Turno mattina",
    slots: [
      { id: "slot1", operatorId: "op1", startTime: "09:00", endTime: "11:00" },
      { id: "slot2", operatorId: "op2", startTime: "11:00", endTime: "13:00" },
    ],
  },
  {
    id: "s2",
    date: "2025-08-16",
    startTime: "14:00",
    endTime: "18:00",
    notes: "",
    slots: [
      { id: "slot3", operatorId: "op3", startTime: "14:00", endTime: "16:00" },
      { id: "slot4", operatorId: null, startTime: "16:00", endTime: "18:00" },
    ],
  },
];

export const useAppStore = create<AppState>((set) => ({
  shifts: seedShifts, // 👈 così non è mai vuoto
  coverShift: (shiftId) =>
    set((state) => {
      console.log("Copertura richiesta per turno:", shiftId);
      return state;
    }),
  updateShiftNotes: (shiftId, notes) =>
    set((state) => ({
      shifts: state.shifts.map((s) =>
        s.id === shiftId ? { ...s, notes } : s
      ),
    })),
}));
