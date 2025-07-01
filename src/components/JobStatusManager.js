/**
 * JobStatusManager Component
 * 
 * This component provides enhanced job status management with:
 * - Custom status creation
 * - Status history tracking
 * - Status change notifications
 * - Color-coded visual indicators
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Default status options
const DEFAULT_STATUSES = [
  { id: 'pending', label: 'Pending', color: '#ff9800', description: 'Service request received but not yet quoted' },
  { id: 'quoted', label: 'Quoted', color: '#2196f3', description: 'Quote provided, awaiting customer acceptance' },
  { id: 'accepted', label: 'Accepted', color: '#4caf50', description: 'Quote accepted, work scheduled' },
  { id: 'in_progress', label: 'In Progress', color: '#9c27b0', description: 'Work has begun on the vehicle' },
  { id: 'parts_needed', label: 'Parts Needed', color: '#795548', description: 'Waiting for parts to arrive' },
  { id: 'completed', label: 'Completed', color: '#607d8b', description: 'Service completed, awaiting payment' },
  { id: 'cancelled', label: 'Cancelled', color: '#f44336', description: 'Service request cancelled' },
];

const JobStatusManager = ({ 
  requestId, 
  currentStatus = 'pending', 
  statusHistory = [], 
  onUpdateStatus,
  customStatuses = [],
  isMechanic = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusDescription, setNewStatusDescription] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#2196f3');
  
  // Combine default and custom statuses
  const allStatuses = [...DEFAULT_STATUSES, ...customStatuses];
  
  // Find the current status object
  const statusObj = allStatuses.find(s => s.id === currentStatus) || DEFAULT_STATUSES[0];
  
  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    try {
      await onUpdateStatus(newStatus);
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCustomStatus = async () => {
    if (!newStatusLabel.trim()) {
      Alert.alert('Error', 'Status label is required');
      return;
    }
    
    setLoading(true);
    try {
      // Generate a unique ID based on the label
      const id = newStatusLabel.toLowerCase().replace(/\s+/g, '_');
      
      const newStatus = {
        id,
        label: newStatusLabel.trim(),
        color: newStatusColor,
        description: newStatusDescription.trim() || undefined,
        isCustom: true
      };
      
      // In a real implementation, this would save to Firebase
      // For now, we'll just close the modal
      
      setShowAddStatusModal(false);
      setNewStatusLabel('');
      setNewStatusDescription('');
      setNewStatusColor('#2196f3');
      
      // Alert the user that this is a demo feature
      Alert.alert(
        'Custom Status Created',
        'In the full implementation, this would save the custom status to your account.'
      );
    } catch (error) {
      console.error('Error adding custom status:', error);
      Alert.alert('Error', 'Failed to add custom status');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const renderStatusHistoryItem = ({ item }) => {
    const status = allStatuses.find(s => s.id === item.status) || { 
      id: item.status, 
      label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      color: '#999'
    };
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyItemHeader}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={styles.historyItemStatus}>{status.label}</Text>
          <Text style={styles.historyItemDate}>{formatDate(item.date)}</Text>
        </View>
        
        {item.note && (
          <Text style={styles.historyItemNote}>{item.note}</Text>
        )}
        
        <Text style={styles.historyItemUser}>
          Updated by: {item.updatedBy === 'mechanic' ? 'Mechanic' : 'Customer'}
        </Text>
      </View>
    );
  };
  
  // Available color options for custom statuses
  const colorOptions = [
    '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336', 
    '#607d8b', '#795548', '#009688', '#673ab7', '#3f51b5'
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusObj.color }]}>
          <Text style={styles.statusText}>{statusObj.label}</Text>
        </View>
      </View>
      
      {statusObj.description && (
        <Text style={styles.statusDescription}>{statusObj.description}</Text>
      )}
      
      {isMechanic && (
        <View style={styles.mechanicControls}>
          <Text style={styles.sectionTitle}>Update Status:</Text>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={allStatuses.filter(s => s.id !== 'cancelled')} // Exclude cancelled status (use cancel job feature instead)
            keyExtractor={(item) => item.id}
            style={styles.statusOptions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  { backgroundColor: item.color + '20' }, // 20% opacity
                  currentStatus === item.id && { backgroundColor: item.color + '40' } // 40% opacity when selected
                ]}
                onPress={() => handleUpdateStatus(item.id)}
                disabled={loading || currentStatus === item.id}
              >
                <Text style={[styles.statusOptionText, { color: item.color }]}>
                  {item.label}
                </Text>
                {currentStatus === item.id && (
                  <Ionicons name="checkmark-circle" size={16} color={item.color} style={styles.statusIcon} />
                )}
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addStatusButton}
                onPress={() => setShowAddStatusModal(true)}
                disabled={loading}
              >
                <Ionicons name="add-circle-outline" size={16} color="#666" />
                <Text style={styles.addStatusText}>Custom</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
      
      {statusHistory.length > 0 && (
        <View style={styles.historySection}>
          <TouchableOpacity 
            style={styles.historyHeader}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.sectionTitle}>Status History</Text>
            <Ionicons 
              name={showHistory ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showHistory && (
            <FlatList
              data={statusHistory}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderStatusHistoryItem}
              style={styles.historyList}
            />
          )}
        </View>
      )}
      
      {/* Add Custom Status Modal */}
      <Modal
        visible={showAddStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Status</Text>
              <TouchableOpacity onPress={() => setShowAddStatusModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              value={newStatusLabel}
              onChangeText={setNewStatusLabel}
              placeholder="Status Label (required)"
              maxLength={20}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              value={newStatusDescription}
              onChangeText={setNewStatusDescription}
              placeholder="Description (optional)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={100}
            />
            
            <Text style={styles.colorSelectorLabel}>Select Color:</Text>
            <View style={styles.colorSelector}>
              {colorOptions.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newStatusColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setNewStatusColor(color)}
                />
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddStatusModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalAddButton,
                  !newStatusLabel.trim() && styles.modalAddButtonDisabled
                ]}
                onPress={handleAddCustomStatus}
                disabled={!newStatusLabel.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalAddButtonText}>Add Status</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {loading && !showAddStatusModal && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196f3" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  mechanicControls: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptionText: {
    fontWeight: '500',
    fontSize: 14,
  },
  statusIcon: {
    marginLeft: 4,
  },
  addStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addStatusText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  historySection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyList: {
    marginTop: 8,
    maxHeight: 300,
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  historyItemStatus: {
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#666',
  },
  historyItemNote: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
    marginBottom: 4,
  },
  historyItemUser: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalTextarea: {
    minHeight: 80,
  },
  colorSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 4,
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  modalCancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  modalAddButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalAddButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  modalAddButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default JobStatusManager;
