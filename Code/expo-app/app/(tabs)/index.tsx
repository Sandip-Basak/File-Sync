import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  Platform,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Settings, Upload as UploadIcon, Info } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useConfigStore } from '@/store/config-store';
import { useTransferStore } from '@/store/transfer-store';
import { uploadFile } from '@/utils/file-utils';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import FileItem from '@/components/FileItem';
import TransferItem from '@/components/TransferItem';
import SettingsModal from '@/components/SettingsModal';
import ServerInfoModal from '@/components/ServerInfoModal';
import colors from '@/constants/colors';

export default function UploadScreen() {
  const { serverConfig } = useConfigStore();
  const { 
    selectedFiles, 
    setSelectedFiles, 
    clearSelectedFiles,
    transferProgress,
    updateProgress,
    setTransferStatus,
    clearProgress
  } = useTransferStore();
  
  const [isUploading, setIsUploading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [serverInfoVisible, setServerInfoVisible] = useState(false);
  
  // Check if server config is set
  const isServerConfigured = serverConfig.ip !== '';
  
  // Pick files from device
  const pickFiles = async () => {
    try {
      if (Platform.OS === 'web') {
        // Use document picker for web
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          multiple: true,
          copyToCacheDirectory: true
        });
        
        if (result.canceled) return;
        
        const files = result.assets.map(asset => ({
          name: asset.name,
          size: asset.size || 0,
          uri: asset.uri,
          type: asset.mimeType
        }));
        
        setSelectedFiles(files);
        clearProgress();
      } else {
        // Use document picker for native
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          multiple: true,
          copyToCacheDirectory: true
        });
        
        if (result.canceled) return;
        
        const files = result.assets.map(asset => ({
          name: asset.name,
          size: asset.size || 0,
          uri: asset.uri,
          type: asset.mimeType
        }));
        
        setSelectedFiles(files);
        clearProgress();
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };
  
  // Upload selected files
  const handleUpload = async () => {
    if (!isServerConfigured) {
      setSettingsVisible(true);
      return;
    }
    
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select files to upload');
      return;
    }
    
    setIsUploading(true);
    
    for (const file of selectedFiles) {
      try {
        // Initialize progress for this file
        setTransferStatus(file.name, 'uploading');
        
        // Upload the file
        await uploadFile(
          file,
          serverConfig,
          (progress) => updateProgress(file.name, progress)
        );
        
        // Mark as success
        setTransferStatus(file.name, 'success');
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setTransferStatus(
          file.name, 
          'error', 
          error instanceof Error ? error.message : 'Upload failed'
        );
      }
    }
    
    setIsUploading(false);
  };
  
  // Clear selected files
  const handleClear = () => {
    clearSelectedFiles();
    clearProgress();
  };
  
  // Show server info
  const showServerInfo = () => {
    if (!isServerConfigured) {
      setSettingsVisible(true);
      return;
    }
    
    setServerInfoVisible(true);
  };
  
  // Check if all files have been processed
  const allFilesProcessed = selectedFiles.length > 0 && 
    selectedFiles.every(file => 
      transferProgress[file.name]?.status === 'success' || 
      transferProgress[file.name]?.status === 'error'
    );
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Upload Files',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={showServerInfo}
                style={styles.headerButton}
              >
                <Info size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSettingsVisible(true)}
                style={styles.headerButton}
              >
                <Settings size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <View style={styles.content}>
        {selectedFiles.length === 0 ? (
          <EmptyState 
            message="No Files Selected" 
            subMessage="Tap the button below to select files to upload" 
          />
        ) : (
          <ScrollView style={styles.fileList}>
            {selectedFiles.map((file) => {
              const progress = transferProgress[file.name];
              
              if (progress) {
                return (
                  <TransferItem 
                    key={file.name} 
                    file={file} 
                    progress={progress} 
                  />
                );
              }
              
              return (
                <FileItem 
                  key={file.name} 
                  file={file} 
                />
              );
            })}
          </ScrollView>
        )}
      </View>
      
      <View style={styles.footer}>
        {selectedFiles.length > 0 && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Select Files"
            onPress={pickFiles}
            variant="outline"
            style={styles.button}
            disabled={isUploading}
            icon={<UploadIcon size={18} color={colors.primary} />}
          />
          
          <Button
            title={allFilesProcessed ? "Upload Again" : "Upload"}
            onPress={handleUpload}
            style={styles.button}
            disabled={selectedFiles.length === 0 || isUploading}
            loading={isUploading}
            icon={
              !isUploading && (
                <UploadIcon size={18} color="#FFFFFF" />
              )
            }
          />
        </View>
      </View>
      
      <SettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
      />
      
      <ServerInfoModal
        visible={serverInfoVisible}
        onClose={() => setServerInfoVisible(false)}
        serverConfig={serverConfig}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  fileList: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  clearText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});