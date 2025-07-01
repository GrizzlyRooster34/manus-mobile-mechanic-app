/**
 * MechanicNotes Component
 * 
 * This component provides a private notes system for mechanics to add notes
 * to service requests that are only visible to mechanics.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MechanicNotes = ({ 
  requestId, 
  existingNotes = [], 
  onAddNote, 
  onDeleteNote,
  readOnly = false
}) => {
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      Alert.alert('Error', 'Note cannot be empty');
      return;
    }
    
    setLoading(true);
    
    try {
      const noteData = {
        text: newNote.trim(),
        createdAt: new Date().toISOString(),
      };
      
      const success = await onAddNote(noteData);
      
      if (success) {
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onDeleteNote(noteId);
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  
  const toggleNoteExpansion = (noteId) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const renderNote = ({ item }) => {
    const isExpanded = expandedNoteId === item.id;
    const noteText = item.text;
    const shouldTruncate = noteText.length > 100 && !isExpanded;
    const displayText = shouldTruncate ? noteText.substring(0, 100) + '...' : noteText;
    
    return (
      <View style={styles.noteItem}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
          {!readOnly && (
            <TouchableOpacity
              onPress={() => handleDeleteNote(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#f44336" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.noteText}>{displayText}</Text>
        
        {noteText.length > 100 && (
          <TouchableOpacity
            onPress={() => toggleNoteExpansion(item.id)}
            style={styles.expandButton}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Show less' : 'Show more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mechanic Notes</Text>
        <Text style={styles.subtitle}>Private notes visible only to mechanics</Text>
      </View>
      
      {!readOnly && (
        <View style={styles.addNoteSection}>
          <TextInput
            style={styles.noteInput}
            value={newNote}
            onChangeText={setNewNote}
            placeholder="Add a private note about this job..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <TouchableOpacity
            style={[
              styles.addButton,
              (!newNote.trim() || loading) && styles.disabledButton
            ]}
            onPress={handleAddNote}
            disabled={!newNote.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="add" size={18} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Add Note</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {existingNotes.length > 0 ? (
        <FlatList
          data={existingNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          style={styles.notesList}
          contentContainerStyle={styles.notesListContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={32} color="#ccc" />
          <Text style={styles.emptyStateText}>No notes yet</Text>
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
  },
  header: {
    marginBottom: 12,
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
  addNoteSection: {
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  notesList: {
    maxHeight: 300,
  },
  notesListContent: {
    paddingBottom: 8,
  },
  noteItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    color: '#2196f3',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});

export default MechanicNotes;
