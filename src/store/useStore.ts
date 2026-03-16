import { create } from 'zustand';
import { getToday } from '../utils';

interface AppState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const useStore = create<AppState>()((set) => ({
  selectedDate: getToday(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
