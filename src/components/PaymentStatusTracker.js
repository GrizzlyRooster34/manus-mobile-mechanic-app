/**
 * PaymentStatusTracker Component
 * 
 * This component provides payment status tracking and management for service requests.
 * It allows updating payment status, viewing payment history, and sending payment reminders.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PAYMENT_STATUSES = [
  { id: 'unpaid', label: 'Unpaid', color: '#f44336' },
  { id: 'pending', label: 'Payment Pending', color: '#ff9800' },
  { id: 'partial', label: 'Partially Paid', color: '#2196f3' },
  { id: 'paid', label: 'Paid', color: '#4caf50' },
  { id: 'refunded', label: 'Refunded', color: '#9c27b0' },
];

const PaymentStatusTracker = ({ 
  requestId, 
  currentStatus = 'unpaid', 
  paymentHistory = [], 
  onUpdateStatus,
  isMechanic = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [showHistory, setShowHistory] = useState(false);
  
  // Find the current status object
  const statusObj = PAYMENT_STATUSES.find(s => s.id === currentStatus) || PAYMENT_STATUSES[0];
  
  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    try {
      await onUpdateStatus(newStatus);
      setSelectedStatus(newStatus);
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendReminder = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call a function to send a payment reminder
      // For now, we'll just show an alert
      Alert.alert('Success', 'Payment reminder sent to customer');
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      Alert.alert('Error', 'Failed to send payment reminder');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusObj.color }]}>
          <Text style={styles.statusText}>{statusObj.label}</Text>
        </View>
      </View>
      
      {isMechanic && (
        <View style={styles.mechanicControls}>
          <Text style={styles.sectionTitle}>Update Payment Status:</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusOptions}>
            {PAYMENT_STATUSES.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.statusOption,
                  { backgroundColor: status.color + '20' }, // 20% opacity
                  selectedStatus === status.id && { backgroundColor: status.color + '40' } // 40% opacity when selected
                ]}
                onPress={() => handleUpdateStatus(status.id)}
                disabled={loading || currentStatus === status.id}
              >
                <Text style={[styles.statusOptionText, { color: status.color }]}>
                  {status.label}
                </Text>
                {selectedStatus === status.id && (
                  <Ionicons name="checkmark-circle" size={16} color={status.color} style={styles.statusIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {(currentStatus === 'unpaid' || currentStatus === 'partial') && (
            <TouchableOpacity
              style={styles.reminderButton}
              onPress={handleSendReminder}
              disabled={loading}
            >
              <Ionicons name="mail" size={16} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Payment Reminder'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {paymentHistory.length > 0 && (
        <View style={styles.historySection}>
          <TouchableOpacity 
            style={styles.historyHeader}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.sectionTitle}>Payment History</Text>
            <Ionicons 
              name={showHistory ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showHistory && (
            <View style={styles.historyList}>
              {paymentHistory.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyItemStatus}>
                      {PAYMENT_STATUSES.find(s => s.id === item.status)?.label || item.status}
                    </Text>
                    <Text style={styles.historyItemDate}>{formatDate(item.date)}</Text>
                  </View>
                  {item.amount && (
                    <Text style={styles.historyItemAmount}>
                      ${parseFloat(item.amount).toFixed(2)}
                    </Text>
                  )}
                  {item.note && (
                    <Text style={styles.historyItemNote}>{item.note}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      
      {loading && (
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
    marginBottom: 12,
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
  reminderButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
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
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyItemStatus: {
    fontWeight: '500',
    fontSize: 14,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#666',
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  historyItemNote: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
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
});

export default PaymentStatusTracker;
