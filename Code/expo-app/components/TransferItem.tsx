import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileItem, TransferProgress } from '@/types/file';
import { formatFileSize } from '@/utils/file-utils';
import ProgressBar from './ProgressBar';
import { AlertCircle, CheckCircle, File, XCircle } from 'lucide-react-native';
import colors from '@/constants/colors';

interface TransferItemProps {
  file: FileItem;
  progress: TransferProgress;
}

export default function TransferItem({ file, progress }: TransferItemProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'success':
        return <CheckCircle size={20} color={colors.success} />;
      case 'error':
        return <XCircle size={20} color={colors.error} />;
      case 'uploading':
      case 'downloading':
        return null;
      default:
        return <File size={20} color={colors.primary} />;
    }
  };
  
  const getStatusColor = () => {
    switch (progress.status) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'uploading':
      case 'downloading':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };
  
  const getStatusText = () => {
    switch (progress.status) {
      case 'uploading':
        return 'Uploading...';
      case 'downloading':
        return 'Downloading...';
      case 'success':
        return 'Completed';
      case 'error':
        return progress.error || 'Failed';
      default:
        return 'Waiting...';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {file.name}
          </Text>
          <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
        </View>
        <View style={styles.statusIcon}>
          {getStatusIcon()}
        </View>
      </View>
      
      {(progress.status === 'uploading' || progress.status === 'downloading') && (
        <ProgressBar 
          progress={progress.progress} 
          color={getStatusColor()} 
        />
      )}
      
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
      
      {progress.status === 'error' && progress.error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color={colors.error} />
          <Text style={styles.errorText}>{progress.error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
});