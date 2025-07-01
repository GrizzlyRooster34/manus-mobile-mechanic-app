/**
 * CancelJobModal Component
 * 
 * This component provides a modal interface for canceling a job with reason tracking
 * and confirmation flow.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CANCEL_REASONS = [
  { id: 'schedule_conflict', label: 'Schedule Conflict' },
  { id: 'found_another_mechanic', label: 'Found Another Mechanic' },
  { id: 'no_longer_needed', label: 'Service No Longer Needed' },
  { id: 'cost_concerns', label: 'Cost Concerns' },
  { id: 'vehicle_fixed', label: 'Vehicle Fixed by Other Means' },
  { id: 'other', label: 'Other Reason' }
];

const CancelJobModal = ({ visible, onClose, onCancel, isCustomer = true }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleCancel = async () => {
    // Validate input
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a cancellation reason');
      return;
    }
    
    if (selectedReason === 'other' && !otherReason.trim()) {
      Alert.alert('Error', 'Please provide details for your cancellation reason');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare cancellation data
      const cancellationData = {
        reason: selectedReason,
        reasonText: selectedReason === 'other' ? otherReason : CANCEL_REASONS.find(r => r.id === selectedReason)?.label,
        cancelledBy: isCustomer ? 'customer' : 'mechanic',
        cancelledAt: new Date().toISOString()
      };
      
      // Call the parent component's cancel handler
      await onCancel(cancellationData);
      
      // Reset form and close modal
      setSelectedReason(null);
      setOtherReason('');
      onClose();
    } catch (error) {
      console.error('Error cancelling job:', error);
      Alert.alert('Error', 'Failed to cancel job. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetAndClose = () => {
    setSelectedReason(null);
    setOtherReason('');
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Job</Text>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Please select a reason for cancellation:</Text>
            
            {CANCEL_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.id && styles.selectedReason
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason.id && styles.selectedReasonText
                ]}>
                  {reason.label}
                </Text>
                {selectedReason === reason.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
            
            {selectedReason === 'other' && (
              <TextInput
                style={styles.otherReasonInput}
                value={otherReason}
                onChangeText={setOtherReason}
                placeholder="Please specify your reason"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
            
            <Text style={styles.noteText}>
              Note: {isCustomer 
                ? 'Cancelling a job may affect your ability to quickly reschedule.' 
                : 'Please ensure the customer is notified about this cancellation.'}
            </Text>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={resetAndClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Go Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleCancel}
              disabled={loading || !selectedReason || (selectedReason === 'other' && !otherReason.trim())}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Cancellation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 15,
    maxHeight: '70%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  reasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedReason: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  reasonText: {
    fontSize: 16,
  },
  selectedReasonText: {
    color: '#fff',
    fontWeight: '500',
  },
  otherReasonInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 80,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default CancelJobModal;
