import { create } from 'zustand';

interface AuthState {
  user: any | null;
  token: string | null;
  setUser: (user: any, token: string) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    set({ user, token });
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  },
  clearUser: () => {
    set({ user: null, token: null });
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  },
}));

// On app load, hydrate from localStorage
const user = localStorage.getItem('authUser');
const token = localStorage.getItem('authToken');
if (user && token) {
  useAuthStore.getState().setUser(JSON.parse(user), token);
}