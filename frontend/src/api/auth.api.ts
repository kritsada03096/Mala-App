import type { User } from '../types/user';
const KEY = 'mala-shop.demo-session';
export const authApi = {
  login(username: string, password: string): User {
    if (username.trim() !== 'demo' || password !== 'mala1234') throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    const user: User = { id: 'demo', name: 'พนักงานทดลอง', username: 'demo', role: 'ADMIN' };
    sessionStorage.setItem(KEY, JSON.stringify(user));
    return user;
  },
  current(): User | null {
    try { const user = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as User | null; return user?.id === 'demo' ? user : null; }
    catch { return null; }
  },
  logout() { sessionStorage.removeItem(KEY); },
};
