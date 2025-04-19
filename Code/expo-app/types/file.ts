export interface FileItem {
    name: string;
    size: number;
    type?: string;
    uri?: string;
    selected?: boolean;
  }
  
  export interface ServerConfig {
    ip: string;
    port: string;
  }
  
  export interface TransferProgress {
    fileId: string;
    progress: number;
    status: 'idle' | 'uploading' | 'downloading' | 'success' | 'error';
    error?: string;
  }