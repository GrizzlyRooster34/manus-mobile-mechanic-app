/**
 * PhotoUpload Component
 * 
 * This component allows users to upload photos during repair jobs,
 * with support for multiple images, captions, and categorization.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const PHOTO_CATEGORIES = [
  { id: 'before', label: 'Before Repair', color: '#ff9800' },
  { id: 'during', label: 'During Repair', color: '#2196f3' },
  { id: 'after', label: 'After Repair', color: '#4caf50' },
  { id: 'parts', label: 'Parts', color: '#9c27b0' },
  { id: 'damage', label: 'Damage', color: '#f44336' },
  { id: 'other', label: 'Other', color: '#607d8b' },
];

const PhotoUpload = ({ 
  requestId, 
  existingPhotos = [], 
  onUploadPhoto,
  onDeletePhoto,
  readOnly = false
}) => {
  const [photos, setPhotos] = useState(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('before');
  const [caption, setCaption] = useState('');
  
  useEffect(() => {
    setPhotos(existingPhotos);
  }, [existingPhotos]);
  
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow camera access to take photos');
      return false;
    }
    return true;
  };
  
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your photo library');
      return false;
    }
    return true;
  };
  
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };
  
  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const handleUpload = async (uri) => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category for the photo');
      return;
    }
    
    setUploading(true);
    
    try {
      // Create photo data object
      const photoData = {
        uri,
        category: selectedCategory,
        caption: caption.trim() || undefined,
        timestamp: new Date().toISOString(),
      };
      
      // In a real implementation, this would upload to Firebase Storage
      // For now, we'll simulate the upload and just call the callback
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = await onUploadPhoto(photoData);
      
      if (success) {
        // Clear caption after successful upload
        setCaption('');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeletePhoto = async (photoId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUploading(true);
            try {
              await onDeletePhoto(photoId);
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };
  
  const renderPhoto = ({ item }) => {
    const category = PHOTO_CATEGORIES.find(c => c.id === item.category) || PHOTO_CATEGORIES[5]; // Default to "Other"
    
    return (
      <View style={styles.photoItem}>
        <Image source={{ uri: item.uri }} style={styles.photoImage} />
        
        <View style={styles.photoDetails}>
          <View style={styles.photoHeader}>
            <View 
              style={[
                styles.categoryBadge, 
                { backgroundColor: category.color + '20' } // 20% opacity
              ]}
            >
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.label}
              </Text>
            </View>
            
            {!readOnly && (
              <TouchableOpacity
                onPress={() => handleDeletePhoto(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={16} color="#f44336" />
              </TouchableOpacity>
            )}
          </View>
          
          {item.caption && (
            <Text style={styles.photoCaption}>{item.caption}</Text>
          )}
          
          <Text style={styles.photoTimestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Photos</Text>
        <Text style={styles.subtitle}>
          {readOnly 
            ? 'View photos from this job' 
            : 'Upload photos to document the repair process'}
        </Text>
      </View>
      
      {!readOnly && (
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Add New Photo</Text>
          
          <View style={styles.categorySelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PHOTO_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    { backgroundColor: category.color + '20' }, // 20% opacity
                    selectedCategory === category.id && { backgroundColor: category.color + '40' } // 40% opacity when selected
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[styles.categoryOptionText, { color: category.color }]}>
                    {category.label}
                  </Text>
                  {selectedCategory === category.id && (
                    <Ionicons name="checkmark-circle" size={16} color={category.color} style={styles.categoryIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption (optional)"
            maxLength={100}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.uploadButton, styles.cameraButton]}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Ionicons name="camera" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.uploadButton, styles.galleryButton]}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="images" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          style={styles.photosList}
          contentContainerStyle={styles.photosListContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={32} color="#ccc" />
          <Text style={styles.emptyStateText}>No photos yet</Text>
        </View>
      )}
      
      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>Uploading photo...</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  uploadSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categorySelector: {
    marginBottom: 12,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryOptionText: {
    fontWeight: '500',
    fontSize: 14,
  },
  categoryIcon: {
    marginLeft: 4,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
  },
  cameraButton: {
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  galleryButton: {
    backgroundColor: '#2196f3',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  photosList: {
    maxHeight: 400,
  },
  photosListContent: {
    paddingBottom: 8,
  },
  photoItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photoImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoDetails: {
    padding: 12,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontWeight: '500',
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  photoCaption: {
    fontSize: 14,
    marginBottom: 8,
  },
  photoTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#2196f3',
  },
});

export default PhotoUpload;
