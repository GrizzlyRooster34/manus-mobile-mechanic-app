/**
 * DiagnosticForm Component
 * 
 * This component provides a user interface for entering vehicle symptoms
 * and generating AI-powered diagnostic suggestions.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { generateDiagnostic } from '../services/diagnosticService';

const DiagnosticForm = ({ vehicleInfo, serviceRequestId, onDiagnosticComplete }) => {
  const [symptoms, setSymptoms] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Error', 'Please describe the symptoms');
      return;
    }
    
    if (!apiKey.trim() && showApiKeyInput) {
      Alert.alert('Error', 'Please enter your OpenAI API key');
      return;
    }
    
    try {
      setLoading(true);
      
      const diagnosticData = {
        vehicleInfo,
        symptoms,
        additionalInfo: additionalInfo.trim(),
        serviceRequestId
      };
      
      const results = await generateDiagnostic(diagnosticData, apiKey);
      
      if (onDiagnosticComplete) {
        onDiagnosticComplete(results);
      }
    } catch (error) {
      console.error('Error generating diagnostic:', error);
      Alert.alert('Error', `Failed to generate diagnostic: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <View style={styles.vehicleInfoContainer}>
          <Text style={styles.vehicleInfoText}>
            {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
          </Text>
          {vehicleInfo.engine && (
            <Text style={styles.vehicleInfoDetail}>
              Engine: {vehicleInfo.engine}
            </Text>
          )}
          {vehicleInfo.mileage && (
            <Text style={styles.vehicleInfoDetail}>
              Mileage: {vehicleInfo.mileage.toLocaleString()} miles
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <Text style={styles.fieldDescription}>
          Describe the symptoms in detail (sounds, smells, performance issues, etc.)
        </Text>
        <TextInput
          style={styles.textArea}
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="Example: Car makes a grinding noise when braking, and the steering wheel vibrates"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <Text style={styles.fieldDescription}>
          Any other relevant details (recent repairs, when symptoms started, etc.)
        </Text>
        <TextInput
          style={styles.textArea}
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          placeholder="Example: Started after driving through heavy rain last week"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
      
      {showApiKeyInput && (
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>OpenAI API Key</Text>
          <Text style={styles.fieldDescription}>
            Enter your OpenAI API key to use the diagnostic assistant
          </Text>
          <TextInput
            style={styles.apiKeyInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            secureTextEntry
          />
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.apiKeyToggle}
          onPress={() => setShowApiKeyInput(!showApiKeyInput)}
        >
          <Ionicons
            name={showApiKeyInput ? 'key' : 'key-outline'}
            size={20}
            color="#666"
          />
          <Text style={styles.apiKeyToggleText}>
            {showApiKeyInput ? 'Hide API Key' : 'Enter API Key'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, (!symptoms.trim() || (showApiKeyInput && !apiKey.trim())) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading || !symptoms.trim() || (showApiKeyInput && !apiKey.trim())}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Generate Diagnostic</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  vehicleInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vehicleInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  vehicleInfoDetail: {
    fontSize: 14,
    color: '#666',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  apiKeyInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  apiKeyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 15,
  },
  apiKeyToggleText: {
    color: '#666',
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default DiagnosticForm;
