import { create } from 'zustand';
import { FileItem, TransferProgress } from '@/types/file';

interface TransferState {
  // Upload state
  selectedFiles: FileItem[];
  setSelectedFiles: (files: FileItem[]) => void;
  clearSelectedFiles: () => void;
  
  // Download state
  availableFiles: FileItem[];
  setAvailableFiles: (files: FileItem[]) => void;
  toggleFileSelection: (fileName: string) => void;
  selectAllFiles: (selected: boolean) => void;
  
  // Progress tracking
  transferProgress: Record<string, TransferProgress>;
  updateProgress: (fileId: string, progress: number) => void;
  setTransferStatus: (fileId: string, status: TransferProgress["status"], error?: string) => void;
  clearProgress: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  // Upload state
  selectedFiles: [],
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  clearSelectedFiles: () => set({ selectedFiles: [] }),
  
  // Download state
  availableFiles: [],
  setAvailableFiles: (files) => set({ availableFiles: files }),
  toggleFileSelection: (fileName) => 
    set((state) => ({
      availableFiles: state.availableFiles.map(file => 
        file.name === fileName 
          ? { ...file, selected: !file.selected } 
          : file
      )
    })),
  selectAllFiles: (selected) => 
    set((state) => ({
      availableFiles: state.availableFiles.map(file => ({ ...file, selected }))
    })),
  
  // Progress tracking
  transferProgress: {},
  updateProgress: (fileId, progress) => 
    set((state) => ({
      transferProgress: {
        ...state.transferProgress,
        [fileId]: {
          ...state.transferProgress[fileId],
          fileId,
          progress
        }
      }
    })),
  setTransferStatus: (fileId, status, error) => 
    set((state) => ({
      transferProgress: {
        ...state.transferProgress,
        [fileId]: {
          ...state.transferProgress[fileId],
          fileId,
          status,
          error
        }
      }
    })),
  clearProgress: () => set({ transferProgress: {} }),
}));