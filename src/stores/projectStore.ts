import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Post } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectState {
  projects: Project[];
  posts: Post[];
  selectedProjectId: string | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'order'>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'order'>) => Post;
  updatePost: (id: string, data: Partial<Post>) => void;
  deletePost: (id: string) => void;
  movePost: (postId: string, newProjectId: string) => void;
  reorderPosts: (posts: Post[]) => void;
  getPostsByProject: (projectId: string) => Post[];
  setSelectedProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      posts: [],
      selectedProjectId: null,

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: uuidv4(),
          createdAt: new Date(),
          order: get().projects.length,
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

      setSelectedProject: (id) => {
        set({ selectedProjectId: id });
      },
    }),
    {
      name: 'project-storage',
    }
  )
);
