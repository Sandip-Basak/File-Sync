import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Modal, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { X } from 'lucide-react-native';
import Button from './Button';
import colors from '@/constants/colors';
import { useConfigStore } from '@/store/config-store';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { serverConfig, setServerConfig } = useConfigStore();
  
  const [ip, setIp] = useState(serverConfig.ip);
  const [port, setPort] = useState(serverConfig.port);
  const [ipError, setIpError] = useState('');
  const [portError, setPortError] = useState('');
  
  const validateIp = (value: string) => {
    if (!value) {
      setIpError('IP address is required');
      return false;
    }
    
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (!ipRegex.test(value)) {
      setIpError('Invalid IP address format');
      return false;
    }
    
    setIpError('');
    return true;
  };
  
  const validatePort = (value: string) => {
    if (!value) {
      setPortError('Port is required');
      return false;
    }
    
    const portNumber = parseInt(value, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      setPortError('Port must be between 1 and 65535');
      return false;
    }
    
    setPortError('');
    return true;
  };
  
  const handleSave = () => {
    const isIpValid = validateIp(ip);
    const isPortValid = validatePort(port);
    
    if (isIpValid && isPortValid) {
      setServerConfig({ ip, port });
      
      // Test connection to server
      testConnection({ ip, port });
      
      onClose();
    }
  };
  
  const testConnection = async (config: { ip: string, port: string }) => {
    try {
      const url = `http://${config.ip}:${config.port}/files`;
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Short timeout to quickly detect if server is unreachable
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log('Server connection successful');
      } else {
        console.warn('Server responded with status:', response.status);
        Alert.alert(
          'Warning',
          `Server responded with status ${response.status}. There might be issues with file transfers.`
        );
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to the server. Please check the IP address, port, and ensure the server is running.'
      );
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Server Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.form}>
            <Text style={styles.label}>Server IP Address</Text>
            <TextInput
              style={[styles.input, ipError ? styles.inputError : null]}
              value={ip}
              onChangeText={setIp}
              placeholder="192.168.0.101"
              keyboardType="numeric"
              autoCapitalize="none"
            />
            {ipError ? <Text style={styles.errorText}>{ipError}</Text> : null}
            
            <Text style={styles.label}>Port</Text>
            <TextInput
              style={[styles.input, portError ? styles.inputError : null]}
              value={port}
              onChangeText={setPort}
              placeholder="5000"
              keyboardType="numeric"
            />
            {portError ? <Text style={styles.errorText}>{portError}</Text> : null}
            
            <Text style={styles.helpText}>
              Enter the IP address and port of the computer running the FileSync server.
              Both devices must be connected to the same Wi-Fi network.
            </Text>
            
            <Text style={styles.serverNote}>
              Note: Make sure your server is configured to accept file uploads and has the
              correct endpoints (/upload, /files, /download/:filename).
            </Text>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Save"
              onPress={handleSave}
              style={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  serverNote: {
    fontSize: 14,
    color: colors.warning,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
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