import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Settings, Download as DownloadIcon, RefreshCw, Info } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useConfigStore } from '@/store/config-store';
import { useTransferStore } from '@/store/transfer-store';
import { fetchAvailableFiles, downloadFile } from '@/utils/file-utils';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import FileItem from '@/components/FileItem';
import TransferItem from '@/components/TransferItem';
import SettingsModal from '@/components/SettingsModal';
import ServerInfoModal from '@/components/ServerInfoModal';
import colors from '@/constants/colors';

export default function DownloadScreen() {
  const { serverConfig } = useConfigStore();
  const { 
    availableFiles, 
    setAvailableFiles,
    toggleFileSelection,
    selectAllFiles,
    transferProgress,
    updateProgress,
    setTransferStatus,
    clearProgress
  } = useTransferStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [serverInfoVisible, setServerInfoVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if server config is set
  const isServerConfigured = serverConfig.ip !== '';
  
  // Selected files count
  const selectedCount = availableFiles.filter(file => file.selected).length;
  
  // Fetch available files from server
  const fetchFiles = async (showLoading = true) => {
    if (!isServerConfigured) {
      return;
    }
    
    if (showLoading) setIsLoading(true);
    
    try {
      const files = await fetchAvailableFiles(serverConfig);
      setAvailableFiles(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to connect to server. Please check your server settings and ensure the server is running.'
      );
      setAvailableFiles([]);
    } finally {
      if (showLoading) setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFiles(false);
  };
  
  // Download selected files
  const handleDownload = async () => {
    if (!isServerConfigured) {
      setSettingsVisible(true);
      return;
    }
    
    const filesToDownload = availableFiles.filter(file => file.selected);
    
    if (filesToDownload.length === 0) {
      Alert.alert('No Files', 'Please select files to download');
      return;
    }
    
    setIsDownloading(true);
    clearProgress();
    
    for (const file of filesToDownload) {
      try {
        // Initialize progress for this file
        setTransferStatus(file.name, 'downloading');
        
        // Download the file
        await downloadFile(
          file,
          serverConfig,
          (progress) => updateProgress(file.name, progress)
        );
        
        // Mark as success
        setTransferStatus(file.name, 'success');
      } catch (error) {
        console.error(`Error downloading ${file.name}:`, error);
        setTransferStatus(
          file.name, 
          'error', 
          error instanceof Error ? error.message : 'Download failed'
        );
      }
    }
    
    setIsDownloading(false);
  };
  
  // Toggle select all
  const handleToggleSelectAll = () => {
    const allSelected = availableFiles.every(file => file.selected);
    selectAllFiles(!allSelected);
  };
  
  // Show server info
  const showServerInfo = () => {
    if (!isServerConfigured) {
      setSettingsVisible(true);
      return;
    }
    
    setServerInfoVisible(true);
  };
  
  // Load files when server config changes
  useEffect(() => {
    if (isServerConfigured) {
      fetchFiles();
    }
  }, [serverConfig]);
  
  // Check if all files have been processed
  const allFilesProcessed = selectedCount > 0 && 
    availableFiles
      .filter(file => file.selected)
      .every(file => 
        transferProgress[file.name]?.status === 'success' || 
        transferProgress[file.name]?.status === 'error'
      );
  
  // Render file list or downloading progress
  const renderContent = () => {
    if (isDownloading || Object.keys(transferProgress).length > 0) {
      // Show transfer progress
      return (
        <ScrollView style={styles.fileList}>
          {availableFiles
            .filter(file => file.selected || transferProgress[file.name])
            .map((file) => (
              <TransferItem 
                key={file.name} 
                file={file} 
                progress={
                  transferProgress[file.name] || {
                    fileId: file.name,
                    progress: 0,
                    status: 'idle'
                  }
                } 
              />
            ))}
        </ScrollView>
      );
    }
    
    if (isLoading) {
      return (
        <EmptyState 
          message="Loading files..." 
          subMessage="Please wait while we fetch files from the server" 
        />
      );
    }
    
    if (!isServerConfigured) {
      return (
        <EmptyState 
          message="Server not configured" 
          subMessage="Tap the settings icon to configure your server" 
        />
      );
    }
    
    if (availableFiles.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState 
            message="No files available" 
            subMessage="Pull down to refresh or check your server" 
          />
        </ScrollView>
      );
    }
    
    return (
      <ScrollView
        style={styles.fileList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {availableFiles.map((file) => (
          <FileItem 
            key={file.name} 
            file={file} 
            selectable
            onPress={() => toggleFileSelection(file.name)}
          />
        ))}
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Download Files',
          headerRight: () => (
            <View style={styles.headerButtons}>
              {!isDownloading && availableFiles.length > 0 && (
                <TouchableOpacity 
                  onPress={handleRefresh}
                  style={styles.headerButton}
                  disabled={refreshing}
                >
                  <RefreshCw 
                    size={24} 
                    color={refreshing ? colors.textSecondary : colors.text} 
                  />
                </TouchableOpacity>
              )}
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
        {renderContent()}
      </View>
      
      <View style={styles.footer}>
        {availableFiles.length > 0 && !isDownloading && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {selectedCount} of {availableFiles.length} selected
            </Text>
            <TouchableOpacity onPress={handleToggleSelectAll}>
              <Text style={styles.selectAllText}>
                {availableFiles.every(file => file.selected) 
                  ? 'Deselect All' 
                  : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Button
          title={allFilesProcessed ? "Download More" : "Download Selected"}
          onPress={handleDownload}
          disabled={selectedCount === 0 || isDownloading}
          loading={isDownloading}
          icon={
            !isDownloading && (
              <DownloadIcon size={18} color="#FFFFFF" />
            )
          }
        />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
  selectAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});