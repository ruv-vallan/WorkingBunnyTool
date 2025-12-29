import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, TeamSettings, UserPermissions } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  currentUser: User | null;
  users: User[];
  teamSettings: TeamSettings;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'permissions'>) => boolean;
  logout: () => void;
  updateProfile: (userId: string, data: Partial<User>) => void;
  findPassword: (email: string) => string | null;
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  updateUserRole: (userId: string, role: User['role']) => void;
  updateUserPermissions: (userId: string, permissions: Partial<UserPermissions>) => void;
  deleteUser: (userId: string) => void;
  updateTeamSettings: (settings: Partial<TeamSettings>) => void;
  canAccessProject: (userId: string, projectId: string) => boolean;
  canAccessPost: (userId: string, postId: string) => boolean;
  isAdmin: (userId?: string) => boolean;
}

const defaultPermissions: UserPermissions = {
  canManageTeam: false,
  canManageProjects: false,
  accessibleProjects: [],
  accessiblePosts: [],
};

const adminPermissions: UserPermissions = {
  canManageTeam: true,
  canManageProjects: true,
  accessibleProjects: [],
  accessiblePosts: [],
};

const defaultTeamSettings: TeamSettings = {
  id: 'team-1',
  name: 'BunnySpace',
  logo: '',
  primaryColor: '#0073ea',
  createdAt: new Date(),
};

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@bunnyspace.com',
    password: 'admin123',
    name: '관리자',
    role: 'admin',
    phone: '010-1234-5678',
    avatar: '',
    department: '경영진',
    bio: 'BunnySpace 관리자입니다.',
    createdAt: new Date(),
    permissions: adminPermissions,
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: defaultUsers,
      teamSettings: defaultTeamSettings,
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
          permissions: defaultPermissions,
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

      updateUserRole: (userId: string, role: User['role']) => {
        const permissions = role === 'admin' ? adminPermissions :
                           role === 'manager' ? { ...defaultPermissions, canManageProjects: true } :
                           defaultPermissions;
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, role, permissions } : u
          ),
        }));
      },

      updateUserPermissions: (userId: string, permissionUpdate: Partial<UserPermissions>) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, permissions: { ...u.permissions, ...permissionUpdate } }
              : u
          ),
          currentUser:
            state.currentUser?.id === userId
              ? { ...state.currentUser, permissions: { ...state.currentUser.permissions, ...permissionUpdate } }
              : state.currentUser,
        }));
      },

      deleteUser: (userId: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }));
      },

      updateTeamSettings: (settings: Partial<TeamSettings>) => {
        set((state) => ({
          teamSettings: { ...state.teamSettings, ...settings },
        }));
      },

      canAccessProject: (userId: string, projectId: string) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'manager') return true;
        if (user.permissions.accessibleProjects.length === 0) return true; // Empty means all access
        return user.permissions.accessibleProjects.includes(projectId);
      },

      canAccessPost: (userId: string, postId: string) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'manager') return true;
        if (user.permissions.accessiblePosts.length === 0) return true;
        return user.permissions.accessiblePosts.includes(postId);
      },

      isAdmin: (userId?: string) => {
        const id = userId || get().currentUser?.id;
        if (!id) return false;
        const user = get().users.find((u) => u.id === id);
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
