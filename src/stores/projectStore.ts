import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Post, PostType, DocumentBlock, BoardColumn, BoardItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface DocumentData {
  postId: string;
  blocks: DocumentBlock[];
}

interface BoardData {
  postId: string;
  columns: BoardColumn[];
  items: BoardItem[];
}

interface ProjectState {
  projects: Project[];
  posts: Post[];
  documentData: DocumentData[];
  boardData: BoardData[];
  selectedProjectId: string | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'order' | 'accessibleBy'>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'order' | 'accessibleBy'>) => Post;
  updatePost: (id: string, data: Partial<Post>) => void;
  deletePost: (id: string) => void;
  movePost: (postId: string, newProjectId: string) => void;
  reorderPosts: (posts: Post[]) => void;
  getPostsByProject: (projectId: string) => Post[];
  getPostsByType: (projectId: string, type: PostType) => Post[];
  getPostById: (postId: string) => Post | undefined;
  setSelectedProject: (id: string | null) => void;
  updateProjectAccess: (projectId: string, userIds: string[]) => void;
  updatePostAccess: (postId: string, userIds: string[]) => void;
  // Document data
  getDocumentBlocks: (postId: string) => DocumentBlock[];
  updateDocumentBlocks: (postId: string, blocks: DocumentBlock[]) => void;
  // Board data
  getBoardColumns: (postId: string) => BoardColumn[];
  getBoardItems: (postId: string) => BoardItem[];
  updateBoardColumns: (postId: string, columns: BoardColumn[]) => void;
  updateBoardItems: (postId: string, items: BoardItem[]) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      posts: [],
      documentData: [],
      boardData: [],
      selectedProjectId: null,

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: uuidv4(),
          createdAt: new Date(),
          order: get().projects.length,
          accessibleBy: [],
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        return newProject;
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          posts: state.posts.filter((p) => p.projectId !== id),
          selectedProjectId:
            state.selectedProjectId === id ? null : state.selectedProjectId,
        }));
      },

      reorderProjects: (projects) => {
        set({ projects });
      },

      addPost: (postData) => {
        const projectPosts = get().posts.filter(
          (p) => p.projectId === postData.projectId
        );
        const newPost: Post = {
          ...postData,
          id: uuidv4(),
          createdAt: new Date(),
          order: projectPosts.length,
          accessibleBy: [],
        };
        set((state) => ({
          posts: [...state.posts, newPost],
        }));
        return newPost;
      },

      updatePost: (id, data) => {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        }));
      },

      movePost: (postId, newProjectId) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, projectId: newProjectId } : p
          ),
        }));
      },

      reorderPosts: (posts) => {
        set({ posts });
      },

      getPostsByProject: (projectId) => {
        return get()
          .posts.filter((p) => p.projectId === projectId)
          .sort((a, b) => a.order - b.order);
      },

      getPostsByType: (projectId, type) => {
        return get()
          .posts.filter((p) => p.projectId === projectId && p.type === type)
          .sort((a, b) => a.order - b.order);
      },

      getPostById: (postId) => {
        return get().posts.find((p) => p.id === postId);
      },

      setSelectedProject: (id) => {
        set({ selectedProjectId: id });
      },

      updateProjectAccess: (projectId, userIds) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, accessibleBy: userIds } : p
          ),
        }));
      },

      updatePostAccess: (postId, userIds) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, accessibleBy: userIds } : p
          ),
        }));
      },

      // Document data management
      getDocumentBlocks: (postId) => {
        const doc = get().documentData.find((d) => d.postId === postId);
        return doc?.blocks || [];
      },

      updateDocumentBlocks: (postId, blocks) => {
        set((state) => {
          const existingIndex = state.documentData.findIndex((d) => d.postId === postId);
          if (existingIndex >= 0) {
            const newDocData = [...state.documentData];
            newDocData[existingIndex] = { postId, blocks };
            return { documentData: newDocData };
          } else {
            return { documentData: [...state.documentData, { postId, blocks }] };
          }
        });
      },

      // Board data management
      getBoardColumns: (postId) => {
        const board = get().boardData.find((b) => b.postId === postId);
        return board?.columns || [];
      },

      getBoardItems: (postId) => {
        const board = get().boardData.find((b) => b.postId === postId);
        return board?.items || [];
      },

      updateBoardColumns: (postId, columns) => {
        set((state) => {
          const existingIndex = state.boardData.findIndex((b) => b.postId === postId);
          if (existingIndex >= 0) {
            const newBoardData = [...state.boardData];
            newBoardData[existingIndex] = { ...newBoardData[existingIndex], columns };
            return { boardData: newBoardData };
          } else {
            return { boardData: [...state.boardData, { postId, columns, items: [] }] };
          }
        });
      },

      updateBoardItems: (postId, items) => {
        set((state) => {
          const existingIndex = state.boardData.findIndex((b) => b.postId === postId);
          if (existingIndex >= 0) {
            const newBoardData = [...state.boardData];
            newBoardData[existingIndex] = { ...newBoardData[existingIndex], items };
            return { boardData: newBoardData };
          } else {
            return { boardData: [...state.boardData, { postId, columns: [], items }] };
          }
        });
      },
    }),
    {
      name: 'project-storage',
    }
  )
);
