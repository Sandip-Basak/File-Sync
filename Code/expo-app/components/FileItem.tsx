import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileItem as FileItemType } from '@/types/file';
import { formatFileSize } from '@/utils/file-utils';
import { CheckCircle, Circle, File } from 'lucide-react-native';
import colors from '@/constants/colors';

interface FileItemProps {
  file: FileItemType;
  onPress?: () => void;
  selectable?: boolean;
}

export default function FileItem({ file, onPress, selectable = false }: FileItemProps) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.fileIcon}>
        <File size={24} color={colors.primary} />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
          {file.name}
        </Text>
        <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
      </View>
      {selectable && (
        <View style={styles.checkbox}>
          {file.selected ? (
            <CheckCircle size={24} color={colors.primary} />
          ) : (
            <Circle size={24} color={colors.textSecondary} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
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
  checkbox: {
    marginLeft: 8,
  },
});