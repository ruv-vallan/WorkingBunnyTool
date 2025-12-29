import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DriveFile } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface DriveState {
  files: DriveFile[];
  currentFolderId: string | null;
  selectedFileIds: string[];
  uploadFile: (file: Omit<DriveFile, 'id' | 'uploadedAt'>) => DriveFile;
  createFolder: (name: string, parentId: string | null, userId: string) => DriveFile;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  moveFile: (id: string, newParentId: string | null) => void;
  setCurrentFolder: (folderId: string | null) => void;
  toggleFileSelection: (fileId: string) => void;
  clearSelection: () => void;
  getFilesInFolder: (folderId: string | null) => DriveFile[];
  getFileById: (id: string) => DriveFile | undefined;
  getFolderPath: (folderId: string | null) => DriveFile[];
}

export const useDriveStore = create<DriveState>()(
  persist(
    (set, get) => ({
      files: [],
      currentFolderId: null,
      selectedFileIds: [],

      uploadFile: (fileData) => {
        const newFile: DriveFile = {
          ...fileData,
          id: uuidv4(),
          uploadedAt: new Date(),
        };
        set((state) => ({
          files: [...state.files, newFile],
        }));
        return newFile;
      },

      createFolder: (name, parentId, userId) => {
        const newFolder: DriveFile = {
          id: uuidv4(),
          name,
          type: 'folder',
          parentId,
          uploadedBy: userId,
          uploadedAt: new Date(),
        };
        set((state) => ({
          files: [...state.files, newFolder],
        }));
        return newFolder;
      },

      deleteFile: (id) => {
        const deleteRecursively = (fileId: string, allFiles: DriveFile[]): string[] => {
          const children = allFiles.filter((f) => f.parentId === fileId);
          return [
            fileId,
            ...children.flatMap((c) => deleteRecursively(c.id, allFiles)),
          ];
        };

        set((state) => {
          const idsToDelete = deleteRecursively(id, state.files);
          return {
            files: state.files.filter((f) => !idsToDelete.includes(f.id)),
            selectedFileIds: state.selectedFileIds.filter(
              (fid) => !idsToDelete.includes(fid)
            ),
          };
        });
      },

      renameFile: (id, name) => {
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, name } : f)),
        }));
      },

      moveFile: (id, newParentId) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, parentId: newParentId } : f
          ),
        }));
      },

      setCurrentFolder: (folderId) => {
        set({ currentFolderId: folderId, selectedFileIds: [] });
      },

      toggleFileSelection: (fileId) => {
        set((state) => ({
          selectedFileIds: state.selectedFileIds.includes(fileId)
            ? state.selectedFileIds.filter((id) => id !== fileId)
            : [...state.selectedFileIds, fileId],
        }));
      },

      clearSelection: () => {
        set({ selectedFileIds: [] });
      },

      getFilesInFolder: (folderId) => {
        return get()
          .files.filter((f) => f.parentId === folderId)
          .sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
          });
      },

      getFileById: (id) => {
        return get().files.find((f) => f.id === id);
      },

      getFolderPath: (folderId) => {
        const path: DriveFile[] = [];
        let currentId = folderId;
        while (currentId) {
          const folder = get().files.find((f) => f.id === currentId);
          if (folder) {
            path.unshift(folder);
            currentId = folder.parentId;
          } else {
            break;
          }
        }
        return path;
      },
    }),
    {
      name: 'drive-storage',
    }
  )
);
