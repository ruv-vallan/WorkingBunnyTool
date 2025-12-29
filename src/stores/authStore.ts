import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => boolean;
  logout: () => void;
  updateProfile: (userId: string, data: Partial<User>) => void;
  findPassword: (email: string) => string | null;
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  updateUserRole: (userId: string, role: string) => void;
  deleteUser: (userId: string) => void;
}

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@teamflow.com',
    password: 'admin123',
    name: '관리자',
    role: '관리자',
    phone: '010-1234-5678',
    avatar: '',
    department: '경영진',
    bio: '팀플로우 관리자입니다.',
    createdAt: new Date(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: defaultUsers,
      isAuthenticated: false,

      login: (email: string, password: string) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      register: (userData) => {
        const exists = get().users.some((u) => u.email === userData.email);
        if (exists) return false;

        const newUser: User = {
          ...userData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
          isAuthenticated: true,
        }));
        return true;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },

      updateProfile: (userId: string, data: Partial<User>) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, ...data } : u
          ),
          currentUser:
            state.currentUser?.id === userId
              ? { ...state.currentUser, ...data }
              : state.currentUser,
        }));
      },

      findPassword: (email: string) => {
        const user = get().users.find((u) => u.email === email);
        if (user) {
          return user.password;
        }
        return null;
      },

      getAllUsers: () => get().users,

      getUserById: (id: string) => get().users.find((u) => u.id === id),

      updateUserRole: (userId: string, role: string) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, role } : u
          ),
        }));
      },

      deleteUser: (userId: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
