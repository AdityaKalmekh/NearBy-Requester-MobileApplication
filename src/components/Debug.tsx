import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import Constants from 'expo-constants';
import Environment, { EnvironmentName, Environment as EnvironmentType } from '../utils/environment';
import { getEnvironmentInfo } from '../utils/expoConfig';

// Define prop types for components
interface DebugSectionProps {
  label: string;
  value: string | number | boolean | null | undefined;
  valueColor?: string;
}

// Debug section component with TypeScript
const DebugSection: React.FC<DebugSectionProps> = ({ 
  label, 
  value, 
  valueColor = '#666' 
}) => {
  const displayValue = value?.toString() || 'Not set';
  
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={[styles.value, { color: valueColor }]}>
        {displayValue}
      </Text>
    </View>
  );
};

// Main debugger component
const EnvironmentDebugger: React.FC = () => {
  // Get environment with proper typing
  const env: EnvironmentType = Environment;
  const envInfo = getEnvironmentInfo();
  
  // Get environment status color
  const getEnvironmentColor = (envName: EnvironmentName): string => {
    switch (envName) {
      case 'development':
        return '#007AFF'; // Blue
      case 'preview':
        return '#FF9500'; // Orange
      case 'production':
        return '#34C759'; // Green
      default:
        return '#666';
    }
  };

  // Network status indicator
  const getNetworkStatus = (): { status: string; color: string } => {
    if (env.isDevelopment) {
      return { status: 'Local Network Required', color: '#FF3B30' };
    } else {
      return { status: 'Internet Required', color: '#34C759' };
    }
  };

  const networkStatus = getNetworkStatus();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>🔍 Environment Debug Info</Text>
      
      {/* Current Environment Status */}
      <View style={[styles.statusCard, { borderLeftColor: getEnvironmentColor(env.name) }]}>
        <Text style={styles.statusTitle}>Current Environment</Text>
        <Text style={[styles.statusValue, { color: getEnvironmentColor(env.name) }]}>
          {env.name.toUpperCase()}
        </Text>
      </View>

      {/* Environment Details */}
      <Text style={styles.sectionHeader}>Environment Configuration</Text>
      
      <DebugSection 
        label="Environment Name" 
        value={env.name} 
        valueColor={getEnvironmentColor(env.name)}
      />
      
      <DebugSection 
        label="Backend URL" 
        value={env.backendUrl}
      />
      
      <DebugSection 
        label="Is Development" 
        value={env.isDevelopment}
        valueColor={env.isDevelopment ? '#34C759' : '#666'}
      />
      
      <DebugSection 
        label="Is Production" 
        value={env.isProduction}
        valueColor={env.isProduction ? '#34C759' : '#666'}
      />
      
      <DebugSection 
        label="Is Preview" 
        value={env.isPreview}
        valueColor={env.isPreview ? '#34C759' : '#666'}
      />

      {/* Network Status */}
      <View style={[styles.statusCard, { borderLeftColor: networkStatus.color }]}>
        <Text style={styles.statusTitle}>Network Status</Text>
        <Text style={[styles.statusValue, { color: networkStatus.color }]}>
          {networkStatus.status}
        </Text>
      </View>

      {/* React Native/Expo Info */}
      <Text style={styles.sectionHeader}>Runtime Information</Text>
      
      <DebugSection 
        label="Development Mode (__DEV__)" 
        value={envInfo.isDev}
        valueColor={envInfo.isDev ? '#FF9500' : '#34C759'}
      />
      
      <DebugSection 
        label="Execution Environment" 
        value={envInfo.executionEnvironment}
      />
      
      <DebugSection 
        label="Platform OS" 
        value={Constants.platform?.ios ? 'iOS' : 'Android'}
      />

      {/* Build Information */}
      <Text style={styles.sectionHeader}>Build Configuration</Text>
      
      <DebugSection 
        label="EAS Channel" 
        value={envInfo.easChannel}
      />
      
      <DebugSection 
        label="Updates URL" 
        value={envInfo.updatesUrl}
      />
      
      <DebugSection 
        label="App Version" 
        value={envInfo.appVersion}
      />

      {/* Environment Variables */}
      <Text style={styles.sectionHeader}>Environment Variables</Text>
      
      <DebugSection 
        label="process.env.APP_ENV" 
        value={envInfo.processAppEnv}
      />
      
      <DebugSection 
        label="process.env.EXPO_PUBLIC_APP_ENV" 
        value={envInfo.expoPublicAppEnv}
      />
      
      {/* Usage Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>📝 Instructions</Text>
        <Text style={styles.instructionsText}>
          • Development: Uses local backend ({env.isDevelopment ? '✅' : '❌'})
        </Text>
        <Text style={styles.instructionsText}>
          • Preview/Production: Uses remote backend ({!env.isDevelopment ? '✅' : '❌'})
        </Text>
        <Text style={styles.instructionsText}>
          • Remove this component before production build
        </Text>
      </View>
    </ScrollView>
  );
};

// Styles with proper TypeScript typing
interface Styles {
  container: ViewStyle;
  header: TextStyle;
  sectionHeader: TextStyle;
  section: ViewStyle;
  label: TextStyle;
  value: TextStyle;
  statusCard: ViewStyle;
  statusTitle: TextStyle;
  statusValue: TextStyle;
  instructionsCard: ViewStyle;
  instructionsTitle: TextStyle;
  instructionsText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default EnvironmentDebugger;