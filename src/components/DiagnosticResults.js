/**
 * DiagnosticResults Component
 * 
 * This component displays the results of an AI-powered diagnostic analysis,
 * including likely causes, recommended tests, and estimated costs.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateTotalEstimatedCost } from '../services/diagnosticService';

const DiagnosticResults = ({ results, onSave, onClose }) => {
  const [expandedSection, setExpandedSection] = useState('likelyCauses');
  
  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'high':
        return '#f44336';
      case 'critical':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Share diagnostic results
  const handleShare = async () => {
    try {
      const totalCost = calculateTotalEstimatedCost(results);
      
      const shareText = `
Vehicle Diagnostic Results

Likely Issues:
${results.likelyCauses?.map(cause => `- ${cause.issue} (${cause.probability})`).join('\n') || 'No causes identified'}

Severity: ${results.severityLevel || 'Unknown'}

Estimated Cost: ${formatCurrency(totalCost.min)} - ${formatCurrency(totalCost.max)}

${results.additionalNotes ? `\nNotes: ${results.additionalNotes}` : ''}
      `.trim();
      
      await Share.share({
        message: shareText,
        title: 'Vehicle Diagnostic Results',
      });
    } catch (error) {
      console.error('Error sharing diagnostic results:', error);
    }
  };
  
  // Handle error state
  if (results.error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Diagnostic Error</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#f44336" />
          <Text style={styles.errorText}>{results.message}</Text>
          <Text style={styles.errorSubtext}>
            Please try again with more detailed symptoms
          </Text>
        </View>
      </View>
    );
  }
  
  // Calculate total cost
  const totalCost = calculateTotalEstimatedCost(results);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnostic Results</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.summaryContainer}>
          <View style={styles.severityContainer}>
            <Text style={styles.severityLabel}>Severity</Text>
            <View 
              style={[
                styles.severityBadge, 
                { backgroundColor: getSeverityColor(results.severityLevel) }
              ]}
            >
              <Text style={styles.severityText}>
                {results.severityLevel || 'Unknown'}
              </Text>
            </View>
          </View>
          
          <View style={styles.costContainer}>
            <Text style={styles.costLabel}>Est. Cost</Text>
            <Text style={styles.costRange}>
              {formatCurrency(totalCost.min)} - {formatCurrency(totalCost.max)}
            </Text>
          </View>
        </View>
        
        {/* Likely Causes Section */}
        <TouchableOpacity 
          style={[
            styles.sectionHeader, 
            expandedSection === 'likelyCauses' && styles.expandedSectionHeader
          ]} 
          onPress={() => toggleSection('likelyCauses')}
        >
          <Text style={styles.sectionTitle}>Most Likely Causes</Text>
          <Ionicons 
            name={expandedSection === 'likelyCauses' ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {expandedSection === 'likelyCauses' && (
          <View style={styles.sectionContent}>
            {results.likelyCauses?.length > 0 ? (
              results.likelyCauses.map((cause, index) => (
                <View key={index} style={styles.causeItem}>
                  <View style={styles.causeHeader}>
                    <Text style={styles.causeTitle}>{cause.issue}</Text>
                    <View 
                      style={[
                        styles.probabilityBadge, 
                        { 
                          backgroundColor: 
                            cause.probability?.toLowerCase() === 'high' ? '#4caf50' :
                            cause.probability?.toLowerCase() === 'medium' ? '#ff9800' : 
                            '#757575'
                        }
                      ]}
                    >
                      <Text style={styles.probabilityText}>
                        {cause.probability || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                  {cause.description && (
                    <Text style={styles.causeDescription}>{cause.description}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No causes identified</Text>
            )}
          </View>
        )}
        
        {/* Recommended Tests Section */}
        <TouchableOpacity 
          style={[
            styles.sectionHeader, 
            expandedSection === 'recommendedTests' && styles.expandedSectionHeader
          ]} 
          onPress={() => toggleSection('recommendedTests')}
        >
          <Text style={styles.sectionTitle}>Recommended Tests</Text>
          <Ionicons 
            name={expandedSection === 'recommendedTests' ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {expandedSection === 'recommendedTests' && (
          <View style={styles.sectionContent}>
            {results.recommendedTests?.length > 0 ? (
              results.recommendedTests.map((test, index) => (
                <View key={index} style={styles.testItem}>
                  <View style={styles.testHeader}>
                    <Text style={styles.testTitle}>{test.test}</Text>
                    <View 
                      style={[
                        styles.complexityBadge, 
                        { 
                          backgroundColor: 
                            test.complexity?.toLowerCase() === 'simple' ? '#4caf50' :
                            test.complexity?.toLowerCase() === 'moderate' ? '#ff9800' : 
                            '#f44336'
                        }
                      ]}
                    >
                      <Text style={styles.complexityText}>
                        {test.complexity || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                  {test.purpose && (
                    <Text style={styles.testPurpose}>{test.purpose}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No tests recommended</Text>
            )}
          </View>
        )}
        
        {/* Suggested Repairs Section */}
        <TouchableOpacity 
          style={[
            styles.sectionHeader, 
            expandedSection === 'suggestedRepairs' && styles.expandedSectionHeader
          ]} 
          onPress={() => toggleSection('suggestedRepairs')}
        >
          <Text style={styles.sectionTitle}>Suggested Repairs</Text>
          <Ionicons 
            name={expandedSection === 'suggestedRepairs' ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {expandedSection === 'suggestedRepairs' && (
          <View style={styles.sectionContent}>
            {results.suggestedRepairs?.length > 0 ? (
              results.suggestedRepairs.map((repair, index) => (
                <View key={index} style={styles.repairItem}>
                  <Text style={styles.repairTitle}>{repair.repair}</Text>
                  {repair.description && (
                    <Text style={styles.repairDescription}>{repair.description}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No repairs suggested</Text>
            )}
          </View>
        )}
        
        {/* Estimated Costs Section */}
        <TouchableOpacity 
          style={[
            styles.sectionHeader, 
            expandedSection === 'estimatedCosts' && styles.expandedSectionHeader
          ]} 
          onPress={() => toggleSection('estimatedCosts')}
        >
          <Text style={styles.sectionTitle}>Estimated Costs</Text>
          <Ionicons 
            name={expandedSection === 'estimatedCosts' ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {expandedSection === 'estimatedCosts' && (
          <View style={styles.sectionContent}>
            {results.estimatedCosts ? (
              <View style={styles.costsBreakdown}>
                <View style={styles.costRow}>
                  <Text style={styles.costCategory}>Parts:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(results.estimatedCosts.parts?.min || 0)} - {formatCurrency(results.estimatedCosts.parts?.max || 0)}
                  </Text>
                </View>
                
                <View style={styles.costRow}>
                  <Text style={styles.costCategory}>Labor:</Text>
                  <Text style={styles.costValue}>
                    {results.estimatedCosts.labor?.hours?.min || 0} - {results.estimatedCosts.labor?.hours?.max || 0} hours
                    {results.estimatedCosts.labor?.rate ? ` @ $${results.estimatedCosts.labor.rate}/hr` : ''}
                  </Text>
                </View>
                
                <View style={[styles.costRow, styles.totalCostRow]}>
                  <Text style={styles.totalCostCategory}>Total:</Text>
                  <Text style={styles.totalCostValue}>
                    {formatCurrency(totalCost.min)} - {formatCurrency(totalCost.max)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No cost estimates available</Text>
            )}
          </View>
        )}
        
        {/* Additional Notes Section */}
        {results.additionalNotes && (
          <>
            <TouchableOpacity 
              style={[
                styles.sectionHeader, 
                expandedSection === 'additionalNotes' && styles.expandedSectionHeader
              ]} 
              onPress={() => toggleSection('additionalNotes')}
            >
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Ionicons 
                name={expandedSection === 'additionalNotes' ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {expandedSection === 'additionalNotes' && (
              <View style={styles.sectionContent}>
                <Text style={styles.notesText}>{results.additionalNotes}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#2196f3" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryActionButton]} 
          onPress={onSave}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.primaryActionButtonText}>Save to Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  severityContainer: {
    alignItems: 'center',
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  costContainer: {
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  costRange: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedSectionHeader: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  causeItem: {
    marginBottom: 15,
  },
  causeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  causeTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  probabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  probabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  causeDescription: {
    fontSize: 14,
    color: '#666',
  },
  testItem: {
    marginBottom: 15,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  complexityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  complexityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testPurpose: {
    fontSize: 14,
    color: '#666',
  },
  repairItem: {
    marginBottom: 15,
  },
  repairTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  repairDescription: {
    fontSize: 14,
    color: '#666',
  },
  costsBreakdown: {
    width: '100%',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  costCategory: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalCostRow: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  totalCostCategory: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCostValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#2196f3',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  primaryActionButton: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  primaryActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default DiagnosticResults;
