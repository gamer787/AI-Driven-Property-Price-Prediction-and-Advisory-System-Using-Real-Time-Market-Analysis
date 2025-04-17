import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Platform } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { Heart, TrendingUp, TrendingDown, IndianRupee, Filter, Search as SearchIcon } from 'lucide-react-native';
import { getPricePrediction } from '../../lib/ai';
import { savePrediction } from '../../lib/predictions';
import { searchProperties, Property } from '../../lib/properties'; 
import { useLocalSearchParams } from 'expo-router';

export default function SearchScreen() {
  const { location, type, minPrice, maxPrice } = useLocalSearchParams<{
    location?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
  }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [predictions, setPredictions] = useState<Record<string, any>>({});

  useEffect(() => {
    const searchParams = {
      location: location as string,
      type: type as string,
      minPrice: minPrice ? parseInt(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
    };

    const results = searchProperties(searchParams);
    setProperties(results);
    setIsLoading(false);
  }, [location, type, minPrice, maxPrice]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const getPredictionForProperty = async (property: Property) => {
    if (predictions[property.id]) return;

    try {
      const prediction = await getPricePrediction(property);
      await savePrediction(property, prediction);
      setPredictions(prev => ({
        ...prev,
        [property.id]: prediction,
      }));
    } catch (error) {
      console.error('Error getting prediction:', error);
    }
  };

  const renderPriceChart = (propertyId: string) => {
    const prediction = predictions[propertyId];
    if (!prediction) return null;
    
    // Don't render charts on web platform
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webChartPlaceholder}>
          <Text style={styles.webChartText}>
            Price trend: {prediction.priceChange > 0 ? '+' : ''}{prediction.priceChange}% in 6 months
          </Text>
        </View>
      );
    }

    const data = [
      { x: 'Now', y: 100 },
      { x: '2mo', y: 100 + (prediction.priceChange / 3) },
      { x: '4mo', y: 100 + (prediction.priceChange * 2/3) },
      { x: '6mo', y: 100 + prediction.priceChange },
    ];

    return (
      <View style={styles.chartContainer}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={200}
          padding={{ top: 10, bottom: 30, left: 40, right: 40 }}>
          <VictoryAxis 
            standalone={false}
            tickFormat={(t) => t}
            style={{
              tickLabels: { fontSize: 10, padding: 5 },
              axis: { stroke: '#666' },
              grid: { stroke: 'none' }
            }}
          />
          <VictoryAxis
            dependentAxis
            standalone={false}
            tickFormat={(t) => `${t}%`}
            style={{
              tickLabels: { fontSize: 10, padding: 5 },
              axis: { stroke: '#666' },
              grid: { stroke: 'none' }
            }}
          />
          <VictoryLine
            standalone={false}
            data={data}
            style={{
              data: { 
                stroke: prediction.priceChange > 0 ? "#34C759" : "#FF3B30",
                strokeWidth: 2
              }
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding properties...</Text>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <SearchIcon size={48} color="#666" />
          <Text style={styles.noResultsTitle}>No properties found</Text>
          <Text style={styles.noResultsText}>
            Try adjusting your search criteria
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#007AFF" />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
          
          {properties.map(property => {
        const prediction = predictions[property.id];
        const isFavorite = favorites.has(property.id);

        return (
          <View key={property.id} style={styles.propertyCard}>
            <Image
              source={{ uri: property.image }}
              style={styles.propertyImage}
            />
            
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(property.id)}
            >
              <Heart
                size={24}
                color={isFavorite ? '#FF3B30' : '#fff'}
                fill={isFavorite ? '#FF3B30' : 'none'}
              />
            </TouchableOpacity>

            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <Text style={styles.propertyLocation}>{property.location}</Text>
              
              <View style={styles.priceContainer}>
                <IndianRupee size={16} color="#1a1a1a" />
                <Text style={styles.propertyPrice}>{property.price}</Text>
              </View>

              <View style={styles.propertyDetails}>
                <Text style={styles.propertyType}>{property.type}</Text>
                <Text style={styles.propertyArea}>{property.area}</Text>
              </View>

              {!prediction ? (
                <TouchableOpacity
                  style={styles.getPredictionButton}
                  onPress={() => getPredictionForProperty(property)}
                >
                  <Text style={styles.getPredictionButtonText}>
                    Get AI Prediction
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.predictionContainer}>
                  <View style={styles.predictionHeader}>
                    {prediction.priceChange > 0 ? (
                      <TrendingUp size={20} color="#34C759" />
                    ) : (
                      <TrendingDown size={20} color="#FF3B30" />
                    )}
                    <Text style={[
                      styles.predictionText,
                      { color: prediction.priceChange > 0 ? '#34C759' : '#FF3B30' }
                    ]}>
                      {prediction.priceChange > 0 ? '+' : ''}{prediction.priceChange}% in 6 months
                    </Text>
                  </View>
                  
                  {renderPriceChart(property.id)}
                  
                  <View style={styles.recommendationContainer}>
                    <Text style={styles.recommendationLabel}>Recommendation:</Text>
                    <Text style={[
                      styles.recommendation,
                      { color: prediction.recommendation === 'Buy Now' ? '#34C759' : '#FF3B30' }
                    ]}>
                      {prediction.recommendation}
                    </Text>
                  </View>
                  
                  <View style={styles.pointsContainer}>
                    <View style={styles.pointsGrid}>
                      {prediction.points.map((point, index) => (
                        <View key={index} style={styles.pointCard}>
                          <View style={[
                            styles.pointBullet,
                            { backgroundColor: index < 4 ? '#34C759' : '#007AFF' }
                          ]} />
                          <Text style={styles.pointText}>{point}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <Text style={styles.reasoningLabel}>Market Analysis:</Text>
                  <Text style={styles.reasoning}>{prediction.reasoning}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}</>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
    height: 200,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  propertyType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  propertyArea: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  getPredictionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  getPredictionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  predictionContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chartContainer: {
    marginVertical: 8,
  },
  webChartPlaceholder: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  webChartText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  recommendation: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  pointsContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  pointsGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  pointCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  reasoningLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reasoning: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
});