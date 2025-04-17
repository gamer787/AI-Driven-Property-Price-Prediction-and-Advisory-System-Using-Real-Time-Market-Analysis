import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react-native';
import { auth } from '../../lib/firebase';
import { getPredictionHistory, PredictionHistory } from '../../lib/predictions';
import { format } from 'date-fns';

export default function HistoryScreen() {
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadHistory();
      } else {
        setHistory([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadHistory = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const predictions = await getPredictionHistory();
      setHistory(predictions);
    } catch (err) {
      setError('Failed to load prediction history');
      console.error('Error loading history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Clock size={48} color="#666" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!auth.currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <Clock size={48} color="#666" />
        <Text style={styles.emptyTitle}>Sign in to view history</Text>
        <Text style={styles.emptyText}>
          Your prediction history will appear here after you sign in
        </Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Clock size={48} color="#666" />
        <Text style={styles.emptyTitle}>No predictions yet</Text>
        <Text style={styles.emptyText}>
          Your AI predictions will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prediction History</Text>
      
      {history.map((item) => (
        <View key={item.id} style={styles.historyCard}>
          <Image
            source={{ uri: item.propertyImage }}
            style={styles.propertyImage}
          />
          
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={styles.date}>
                {format(item.createdAt?.toDate() || new Date(), 'MMM d, yyyy')}
              </Text>
              <View style={styles.predictionBadge}>
                {item.prediction.priceChange > 0 ? (
                  <TrendingUp size={16} color="#34C759" />
                ) : (
                  <TrendingDown size={16} color="#FF3B30" />
                )}
                <Text style={[
                  styles.predictionText,
                  { color: item.prediction.priceChange > 0 ? '#34C759' : '#FF3B30' }
                ]}>
                  {item.prediction.priceChange > 0 ? '+' : ''}
                  {item.prediction.priceChange}%
                </Text>
              </View>
            </View>

            <Text style={styles.propertyTitle}>{item.propertyTitle}</Text>
            <Text style={styles.propertyLocation}>{item.propertyLocation}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Price:</Text>
                <Text style={styles.detailValue}>{item.propertyPrice}</Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{item.propertyType}</Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Area:</Text>
                <Text style={styles.detailValue}>{item.propertyArea}</Text>
              </View>
            </View>

            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationLabel}>Recommendation:</Text>
              <Text style={[
                styles.recommendation,
                { color: item.prediction.recommendation === 'Buy Now' ? '#34C759' : '#FF3B30' }
              ]}>
                {item.prediction.recommendation}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  propertyImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  predictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  predictionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  recommendation: {
    fontSize: 16,
    fontWeight: '600',
  },
});