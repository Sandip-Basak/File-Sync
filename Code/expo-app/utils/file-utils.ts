import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { FileItem, ServerConfig } from '@/types/file';
import * as MediaLibrary from 'expo-media-library';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getServerUrl = (config: ServerConfig): string => {
  return `http://${config.ip}:${config.port}`;
};

export const fetchAvailableFiles = async (config: ServerConfig): Promise<FileItem[]> => {
  try {
    const response = await fetch(`${getServerUrl(config)}/files`);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const files = await response.json();
    return files.map((file: any) => ({
      name: file.name,
      size: file.size,
      selected: false
    }));
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

export const uploadFile = async (
  file: FileItem, 
  config: ServerConfig,
  onProgress: (progress: number) => void
): Promise<void> => {
  try {
    const formData = new FormData();
    
    // Create a file object that the server can understand
    const fileToUpload = {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream'
    };
    
    // IMPORTANT: Use "files" instead of "file" as the form field name
    // This matches what the server expects
    formData.append('files', fileToUpload as any);
    
    // Log the request details for debugging
    console.log('Uploading file:', {
      url: `${getServerUrl(config)}/upload`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      formFieldName: 'files' // Log the form field name we're using
    });
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${getServerUrl(config)}/upload`);
    
    // Set up progress tracking
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };
    
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('Upload successful:', xhr.responseText);
          resolve();
        } else {
          console.error('Upload failed:', xhr.status, xhr.responseText);
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText || ''}`));
        }
      };
      
      xhr.onerror = (e) => {
        console.error('Network error during upload:', e);
        reject(new Error('Network error occurred during upload'));
      };
      
      // Handle timeout
      xhr.ontimeout = () => {
        console.error('Upload request timed out');
        reject(new Error('Upload request timed out'));
      };
      
      // Send the FormData
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const downloadFile = async (
  file: FileItem,
  config: ServerConfig,
  onProgress: (progress: number) => void
): Promise<string> => {
  try {
    const downloadUrl = `${getServerUrl(config)}/download/${encodeURIComponent(file.name)}`;
    const fileUri = `${FileSystem.documentDirectory}${file.name}`;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite * 100;
        onProgress(progress);
      }
    );
    
    const result = await downloadResumable.downloadAsync();
    if (result && result.uri) {



      // ChatGPT Code
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        const asset = await MediaLibrary.createAssetAsync(result.uri);
        await MediaLibrary.createAlbumAsync("FileSync Downloads", asset, false);
      }



      return result.uri;
    }
    return fileUri;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export const getDownloadedFiles = async (): Promise<FileItem[]> => {
  if (Platform.OS === 'web') {
    return []; // Web doesn't support FileSystem.documentDirectory listing
  }
  
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || '');
    const fileDetails = await Promise.all(
      files.map(async (fileName) => {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        return {
          name: fileName,
          size: fileInfo.exists ? fileInfo.size || 0 : 0,
          uri: fileUri
        };
      })
    );
    
    return fileDetails;
  } catch (error) {
    console.error('Error getting downloaded files:', error);
    return [];
  }
};