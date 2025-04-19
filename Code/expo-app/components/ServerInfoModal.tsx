import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import { X, Server, Info, AlertTriangle } from 'lucide-react-native';
import Button from './Button';
import colors from '@/constants/colors';
import { ServerConfig } from '@/types/file';

interface ServerInfoModalProps {
  visible: boolean;
  onClose: () => void;
  serverConfig: ServerConfig;
}

export default function ServerInfoModal({ 
  visible, 
  onClose,
  serverConfig 
}: ServerInfoModalProps) {
  const serverUrl = `http://${serverConfig.ip}:${serverConfig.port}`;
  
  const openServerDocs = () => {
    // This URL should point to your server documentation
    Linking.openURL('https://github.com/yourusername/filesync-server');
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Server Information</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.serverInfoContainer}>
              <Server size={24} color={colors.primary} />
              <Text style={styles.serverUrl}>{serverUrl}</Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Required Endpoints</Text>
              <View style={styles.endpoint}>
                <Text style={styles.endpointMethod}>GET</Text>
                <Text style={styles.endpointPath}>/files</Text>
                <Text style={styles.endpointDesc}>List available files</Text>
              </View>
              <View style={styles.endpoint}>
                <Text style={styles.endpointMethod}>POST</Text>
                <Text style={styles.endpointPath}>/upload</Text>
                <Text style={styles.endpointDesc}>Upload files</Text>
              </View>
              <View style={styles.endpoint}>
                <Text style={styles.endpointMethod}>GET</Text>
                <Text style={styles.endpointPath}>/download/:filename</Text>
                <Text style={styles.endpointDesc}>Download a file</Text>
              </View>
            </View>
            
            <View style={styles.warningContainer}>
              <AlertTriangle size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Make sure your server is running and configured correctly.
                Both devices must be on the same network.
              </Text>
            </View>
            
            <View style={styles.tipContainer}>
              <Info size={20} color={colors.info} />
              <Text style={styles.tipText}>
                If you're having trouble connecting, try the following:
                {'\n\n'}
                • Check that both devices are on the same Wi-Fi network
                {'\n'}
                • Verify the server is running and accessible
                {'\n'}
                • Ensure your firewall allows connections on the specified port
                {'\n'}
                • Try using your computer's local IP address (usually starts with 192.168...)
                {'\n\n'}
                <Text style={styles.important}>Important: The server must expect a form field named "files" for uploads</Text>
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Close"
              onPress={onClose}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginBottom: 20,
  },
  serverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  serverUrl: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 12,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  endpoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
  },
  endpointMethod: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    width: 50,
  },
  endpointPath: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  endpointDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 100,
    textAlign: 'right',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  important: {
    fontWeight: 'bold',
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
});