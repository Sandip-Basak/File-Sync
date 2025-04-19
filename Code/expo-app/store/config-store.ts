import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServerConfig } from '@/types/file';

interface ConfigState {
  serverConfig: ServerConfig;
  setServerConfig: (config: ServerConfig) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      serverConfig: {
        ip: '',
        port: '5000',
      },
      setServerConfig: (config) => set({ serverConfig: config }),
    }),
    {
      name: 'filesync-config',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);