import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { User } from '../types/user';
const AuthContext = createContext<{ user: User | null; login: (username: string, password: string) => void; logout: () => void } | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(authApi.current);
  return <AuthContext.Provider value={{ user, login: (u, p) => setUser(authApi.login(u, p)), logout: () => { authApi.logout(); setUser(null); } }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}
