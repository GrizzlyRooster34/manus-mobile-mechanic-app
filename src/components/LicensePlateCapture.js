/**
 * License Plate Capture Component
 * 
 * This component provides license plate capture and vehicle lookup functionality:
 * - Camera and gallery image capture options
 * - OCR processing to extract plate numbers
 * - Vehicle information lookup and display
 * - Integration with vehicle garage system
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  processLicensePlateCapture,
  formatLicensePlate,
  getSupportedStates,
} from '../services/licensePlateService';

const LicensePlateCapture = ({
  visible,
  onClose,
  onVehicleFound,
  title = 'Scan License Plate',
  subtitle = 'Capture a photo of the license plate to auto-fill vehicle information',
}) => {
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedPlate, setExtractedPlate] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [step, setStep] = useState('capture'); // capture, processing, results
  
  const handleCapture = async (method) => {
    try {
      setLoading(true);
      setStep('processing');
      
      const result = await processLicensePlateCapture(method);
      
      if (result) {
        setCapturedImage(result.imageUri);
        setExtractedPlate(result.licensePlate);
        setVehicleInfo(result);
        setStep('results');
        
        if (result.year && result.make && result.model) {
          Alert.alert('Success', result.message || 'Vehicle information found!');
        } else {
          Alert.alert('Partial Success', result.message || 'License plate read, but vehicle details not found.');
        }
      } else {
        setStep('capture');
        Alert.alert('Cancelled', 'License plate capture was cancelled.');
      }
    } catch (error) {
      console.error('Error capturing license plate:', error);
      setStep('capture');
      Alert.alert('Error', error.message || 'Failed to process license plate. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseVehicle = () => {
    if (vehicleInfo && onVehicleFound) {
      onVehicleFound(vehicleInfo);
    }
    handleClose();
  };
  
  const handleRetry = () => {
    setCapturedImage(null);
    setExtractedPlate('');
    setVehicleInfo(null);
    setStep('capture');
  };
  
  const handleClose = () => {
    setCapturedImage(null);
    setExtractedPlate('');
    setVehicleInfo(null);
    setStep('capture');
    onClose();
  };
  
  const renderCaptureStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.instructionsContainer}>
        <Ionicons name="camera" size={48} color="#2196f3" />
        <Text style={styles.instructionsTitle}>Capture License Plate</Text>
        <Text style={styles.instructionsText}>
          Take a clear photo of the license plate. Make sure the plate is well-lit and all characters are visible.
        </Text>
      </View>
      
      <View style={styles.captureOptions}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => handleCapture('camera')}
          disabled={loading}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.captureButtonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.captureButton, styles.galleryButton]}
          onPress={() => handleCapture('gallery')}
          disabled={loading}
        >
          <Ionicons name="images" size={24} color="#2196f3" />
          <Text style={[styles.captureButtonText, styles.galleryButtonText]}>
            Choose from Gallery
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.supportedStatesContainer}>
        <Text style={styles.supportedStatesTitle}>Supported States:</Text>
        <Text style={styles.supportedStatesText}>
          {getSupportedStates().map(state => state.name).join(', ')}
        </Text>
      </View>
    </View>
  );
  
  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.processingTitle}>Processing License Plate</Text>
        <Text style={styles.processingText}>
          Reading license plate and looking up vehicle information...
        </Text>
      </View>
      
      {capturedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
        </View>
      )}
    </View>
  );
  
  const renderResultsStep = () => (
    <ScrollView style={styles.stepContainer}>
      {capturedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
        </View>
      )}
      
      <View style={styles.resultsContainer}>
        <View style={styles.plateResultContainer}>
          <Text style={styles.plateResultLabel}>License Plate:</Text>
          <Text style={styles.plateResultValue}>
            {formatLicensePlate(extractedPlate)}
          </Text>
        </View>
        
        {vehicleInfo && vehicleInfo.year && vehicleInfo.make && vehicleInfo.model ? (
          <View style={styles.vehicleInfoContainer}>
            <Text style={styles.vehicleInfoTitle}>Vehicle Information</Text>
            
            <View style={styles.vehicleInfoGrid}>
              <View style={styles.vehicleInfoItem}>
                <Text style={styles.vehicleInfoLabel}>Year:</Text>
                <Text style={styles.vehicleInfoValue}>{vehicleInfo.year}</Text>
              </View>
              
              <View style={styles.vehicleInfoItem}>
                <Text style={styles.vehicleInfoLabel}>Make:</Text>
                <Text style={styles.vehicleInfoValue}>{vehicleInfo.make}</Text>
              </View>
              
              <View style={styles.vehicleInfoItem}>
                <Text style={styles.vehicleInfoLabel}>Model:</Text>
                <Text style={styles.vehicleInfoValue}>{vehicleInfo.model}</Text>
              </View>
              
              {vehicleInfo.color && (
                <View style={styles.vehicleInfoItem}>
                  <Text style={styles.vehicleInfoLabel}>Color:</Text>
                  <Text style={styles.vehicleInfoValue}>{vehicleInfo.color}</Text>
                </View>
              )}
              
              {vehicleInfo.vin && (
                <View style={styles.vehicleInfoItem}>
                  <Text style={styles.vehicleInfoLabel}>VIN:</Text>
                  <Text style={styles.vehicleInfoValue}>
                    {vehicleInfo.vin.slice(-6)}...
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.useVehicleButton}
                onPress={handleUseVehicle}
              >
                <Text style={styles.useVehicleButtonText}>Use This Vehicle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noVehicleInfoContainer}>
            <Ionicons name="information-circle" size={48} color="#ff9800" />
            <Text style={styles.noVehicleInfoTitle}>Limited Information</Text>
            <Text style={styles.noVehicleInfoText}>
              We could read the license plate but couldn't find detailed vehicle information. 
              You can still use the license plate number and enter vehicle details manually.
            </Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.usePlateButton}
                onPress={handleUseVehicle}
              >
                <Text style={styles.usePlateButtonText}>Use License Plate</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          
          {step === 'capture' && renderCaptureStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'results' && renderResultsStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  captureOptions: {
    marginBottom: 32,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196f3',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  galleryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  galleryButtonText: {
    color: '#2196f3',
  },
  supportedStatesContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  supportedStatesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  supportedStatesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  processingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  resultsContainer: {
    flex: 1,
  },
  plateResultContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  plateResultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  plateResultValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  vehicleInfoContainer: {
    marginBottom: 24,
  },
  vehicleInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  vehicleInfoGrid: {
    marginBottom: 24,
  },
  vehicleInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vehicleInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  vehicleInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  noVehicleInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  noVehicleInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff9800',
    marginTop: 16,
    marginBottom: 8,
  },
  noVehicleInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  useVehicleButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  useVehicleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  usePlateButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  usePlateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LicensePlateCapture;

