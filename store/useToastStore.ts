import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  visible: boolean;
  type: ToastType;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: '',
  visible: false,
  type: 'success',
  show: (message, type = 'success') => set({ message, visible: true, type }),
  hide: () => set({ visible: false }),
}));
