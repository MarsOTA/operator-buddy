import { create } from "zustand";

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  covered?: boolean;
};

type AppState = {
  shifts: Shift[];
  coverShift: (shiftId: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  shifts: [],
  coverShift: (shiftId) =>
    set((state) => ({
      shifts: state.shifts.map((s) =>
        s.id === shiftId ? { ...s, covered: true } : s
      ),
    })),
}));
