import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { runAllAnalyses } from '../../lib/ml';
import { Brain, TrendingUp, TrendingDown, Target, LineChart, Layers } from 'lucide-react-native';

export default function AnalysisScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeData = async () => {
      try {
        const analysisResults = runAllAnalyses();
        setResults(analysisResults);
      } catch (error) {
        console.error('Error running analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Brain size={48} color="#007AFF" />
        <Text style={styles.loadingText}>Running ML Analysis...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ML Model Analysis</Text>
      <Text style={styles.subtitle}>
        Comprehensive property analysis using multiple ML models
      </Text>

      {/* SVM Results */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Target size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>SVM Classification</Text>
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Recommendation:</Text>
          <View style={[
            styles.recommendationBadge,
            { backgroundColor: results.svm.prediction === 'Buy Now' ? '#34C759' : '#FF9500' }
          ]}>
            <Text style={styles.recommendationText}>{results.svm.prediction}</Text>
          </View>
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Confidence:</Text>
          <Text style={styles.value}>{(results.svm.confidence * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Feature Analysis:</Text>
          {Object.entries(results.svm.features).map(([key, value]: [string, any]) => (
            <View key={key} style={styles.featureItem}>
              <Text style={styles.featureLabel}>
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </Text>
              <Text style={styles.featureValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Linear Regression Results */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <LineChart size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Linear Regression</Text>
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Price Prediction:</Text>
          <Text style={styles.value}>₹{results.linearRegression.prediction.toFixed(2)} Lakhs</Text>
        </View>
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Feature Importance:</Text>
          {Object.entries(results.linearRegression.featureImportance).map(([key, value]: [string, any]) => (
            <View key={key} style={styles.featureItem}>
              <Text style={styles.featureLabel}>{key}:</Text>
              <View style={styles.importanceBar}>
                <View 
                  style={[
                    styles.importanceFill,
                    { width: `${(value * 100).toFixed(1)}%` }
                  ]} 
                />
                <Text style={styles.importanceText}>
                  {(value * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* K-means Results */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Layers size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>K-means Clustering</Text>
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Property Segment:</Text>
          <View style={[styles.segmentBadge, { 
            backgroundColor: 
              results.kmeans.cluster === 0 ? '#34C759' : 
              results.kmeans.cluster === 1 ? '#FF9500' : '#FF3B30'
          }]}>
            <Text style={styles.segmentText}>
              {results.kmeans.cluster === 0 ? 'Premium' :
               results.kmeans.cluster === 1 ? 'Mid-Range' : 'Budget'}
            </Text>
          </View>
        </View>
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Cluster Features:</Text>
          {Object.entries(results.kmeans.features).map(([key, value]: [string, any]) => (
            <View key={key} style={styles.featureItem}>
              <Text style={styles.featureLabel}>
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </Text>
              <Text style={styles.featureValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Random Forest Results */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TrendingUp size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Random Forest Analysis</Text>
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.label}>Price Prediction:</Text>
          <Text style={styles.value}>₹{results.randomForest.prediction.toFixed(2)} Lakhs</Text>
        </View>
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>Feature Importance:</Text>
          {Object.entries(results.randomForest.featureImportance).map(([key, value]: [string, any]) => (
            <View key={key} style={styles.featureItem}>
              <Text style={styles.featureLabel}>{key}:</Text>
              <View style={styles.importanceBar}>
                <View 
                  style={[
                    styles.importanceFill,
                    { width: `${(value * 100).toFixed(1)}%` }
                  ]} 
                />
                <Text style={styles.importanceText}>
                  {(value * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  recommendationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  segmentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  featureList: {
    marginTop: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  featureItem: {
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  featureValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  importanceBar: {
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  importanceFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    opacity: 0.2,
  },
  importanceText: {
    position: 'absolute',
    right: 8,
    top: 4,
    fontSize: 12,
    color: '#1a1a1a',
  },
});