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

export const useAppStore = create<AppState>((set) => ({
  shifts: [],
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
