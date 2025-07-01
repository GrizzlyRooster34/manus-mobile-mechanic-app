/**
 * Rating and Review Form Component
 * 
 * This component allows users to submit a rating and review for a completed job.
 * - Star rating input (1-5 stars)
 * - Text area for comments
 * - Integration with the ratingReviewService to submit data
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { submitReview } from '../services/ratingReviewService';

const RatingReviewForm = ({
  visible,
  onClose,
  jobId,
  customerId,
  mechanicId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a star rating.');
      return;
    }

    setIsLoading(true);
    try {
      const reviewData = {
        jobId,
        customerId,
        mechanicId,
        rating,
        comment,
      };
      await submitReview(reviewData);
      Alert.alert('Success', 'Your review has been submitted!');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Service</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>How would you rate your experience?</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={40}
                  color={rating >= star ? '#FFD700' : '#ccc'}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subtitle}>Any additional comments?</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your feedback..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading || rating === 0}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  commentInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RatingReviewForm;

