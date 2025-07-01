/**
 * Live Chat Widget Component
 * 
 * This component provides a live chat interface for customer support:
 * - Floating chat button and expandable chat window
 * - Real-time messaging with automated responses
 * - Integration with Chatbase AI assistant
 * - Message history and session management
 * - Escalation to human support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  createChatSession,
  sendMessage,
  getChatMessages,
  getChatSessions,
  closeChatSession,
  markMessagesAsRead,
  getUnreadMessageCount,
  initializeChatService,
} from '../services/chatService';

const LiveChatWidget = ({ 
  userId,
  userType = 'customer', // 'customer' or 'mechanic'
  userName,
  userEmail,
  jobId = null,
  vehicleInfo = null,
  position = 'bottom-right', // 'bottom-right', 'bottom-left'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [showSessionList, setShowSessionList] = useState(false);
  
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    initializeWidget();
  }, [userId]);
  
  useEffect(() => {
    if (currentSession) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [currentSession]);
  
  useEffect(() => {
    if (isExpanded && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isExpanded]);
  
  const initializeWidget = async () => {
    try {
      await initializeChatService();
      
      if (userId) {
        await loadSessions();
        await updateUnreadCount();
        
        // Check if widget should be visible
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error initializing chat widget:', error);
    }
  };
  
  const loadSessions = async () => {
    try {
      const userSessions = await getChatSessions(userId);
      setSessions(userSessions);
      
      // Set current session to the most recent active one
      const activeSession = userSessions.find(s => s.status === 'active');
      if (activeSession) {
        setCurrentSession(activeSession);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };
  
  const loadMessages = async () => {
    try {
      if (currentSession) {
        const sessionMessages = await getChatMessages(currentSession.id);
        setMessages(sessionMessages);
        
        // Mark messages as read
        const unreadMessageIds = sessionMessages
          .filter(msg => !msg.isRead && msg.sender !== 'user')
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead(currentSession.id, unreadMessageIds);
          await updateUnreadCount();
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  const updateUnreadCount = async () => {
    try {
      const count = await getUnreadMessageCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  };
  
  const startNewChat = async () => {
    try {
      setIsLoading(true);
      
      const sessionId = await createChatSession({
        userId,
        userType,
        userName,
        userEmail,
        jobId,
        vehicleInfo,
      });
      
      // Reload sessions to get the new one
      await loadSessions();
      
      // Find and set the new session as current
      const newSession = sessions.find(s => s.id === sessionId) || 
        { id: sessionId, userId, userType, userName, status: 'active' };
      
      setCurrentSession(newSession);
      setIsExpanded(true);
      setShowSessionList(false);
    } catch (error) {
      console.error('Error starting new chat:', error);
      Alert.alert('Error', 'Failed to start chat session');
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendUserMessage = async () => {
    try {
      if (!inputText.trim() || !currentSession) return;
      
      const messageText = inputText.trim();
      setInputText('');
      setIsTyping(true);
      
      // Add user message immediately for better UX
      const userMessage = {
        id: `temp_${Date.now()}`,
        sessionId: currentSession.id,
        sender: 'user',
        text: messageText,
        timestamp: Date.now(),
        isRead: true,
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send message to service
      await sendMessage(currentSession.id, 'user', {
        text: messageText,
      });
      
      // Reload messages to get any automated responses
      setTimeout(async () => {
        await loadMessages();
        setIsTyping(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message');
    }
  };
  
  const selectSession = (session) => {
    setCurrentSession(session);
    setShowSessionList(false);
    setIsExpanded(true);
  };
  
  const closeCurrentSession = async () => {
    try {
      if (currentSession) {
        await closeChatSession(currentSession.id);
        setCurrentSession(null);
        setMessages([]);
        setIsExpanded(false);
        await loadSessions();
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };
  
  const toggleWidget = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else if (currentSession) {
      setIsExpanded(true);
    } else if (sessions.length > 0) {
      setShowSessionList(true);
    } else {
      startNewChat();
    }
  };
  
  const renderMessage = (message, index) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'assistant' && message.isAutomated;
    
    return (
      <View
        key={message.id || index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.assistantMessageBubble,
            isSystem && styles.systemMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
            ]}
          >
            {message.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isUser ? styles.userMessageTime : styles.assistantMessageTime,
            ]}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderSessionList = () => (
    <Modal
      visible={showSessionList}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSessionList(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sessionListContainer}>
          <View style={styles.sessionListHeader}>
            <Text style={styles.sessionListTitle}>Chat History</Text>
            <TouchableOpacity onPress={() => setShowSessionList(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.sessionList}>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={startNewChat}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.newChatButtonText}>Start New Chat</Text>
            </TouchableOpacity>
            
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionItem}
                onPress={() => selectSession(session)}
              >
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>
                    {session.jobId ? `Job #${session.jobId}` : 'General Support'}
                  </Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.lastActivity).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.sessionStatus,
                  styles[`status${session.status}`],
                ]}>
                  <Text style={styles.sessionStatusText}>
                    {session.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  const renderChatWindow = () => (
    <Modal
      visible={isExpanded}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsExpanded(false)}
    >
      <KeyboardAvoidingView
        style={styles.chatModalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.chatWindow}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderTitle}>
                Heinicus Mobile Mechanic
              </Text>
              <Text style={styles.chatHeaderSubtitle}>
                {currentSession?.isAssignedToHuman ? 'Connected to mechanic' : 'Abacus AI Assistant'}
              </Text>
            </View>
            <View style={styles.chatHeaderActions}>
              {sessions.length > 1 && (
                <TouchableOpacity
                  style={styles.chatHeaderButton}
                  onPress={() => {
                    setIsExpanded(false);
                    setShowSessionList(true);
                  }}
                >
                  <Ionicons name="list" size={20} color="#666" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.chatHeaderButton}
                onPress={closeCurrentSession}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatHeaderButton}
                onPress={() => setIsExpanded(false)}
              >
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            
            {isTyping && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#2196f3" />
                <Text style={styles.typingText}>Assistant is typing...</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              multiline
              maxLength={500}
              onSubmitEditing={sendUserMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendUserMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#fff" : "#ccc"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
  
  if (!isVisible) return null;
  
  return (
    <>
      {/* Floating Chat Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          position === 'bottom-left' ? styles.bottomLeft : styles.bottomRight,
        ]}
        onPress={toggleWidget}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons 
              name={isExpanded ? "chevron-down" : "chatbubble"} 
              size={24} 
              color="#fff" 
            />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
      
      {/* Chat Window */}
      {renderChatWindow()}
      
      {/* Session List */}
      {renderSessionList()}
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatWindow: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    maxHeight: 600,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#2196f3',
    borderBottomRightRadius: 4,
  },
  assistantMessageBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  systemMessageBubble: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  assistantMessageTime: {
    color: '#999',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sessionListContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sessionListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sessionListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sessionList: {
    padding: 16,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  newChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusactive: {
    backgroundColor: '#4caf50',
  },
  statusclosed: {
    backgroundColor: '#999',
  },
  statusescalated: {
    backgroundColor: '#ff9800',
  },
  sessionStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default LiveChatWidget;

