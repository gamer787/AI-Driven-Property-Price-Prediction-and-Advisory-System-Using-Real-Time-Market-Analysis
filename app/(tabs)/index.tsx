import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MapPin, Building2, IndianRupee } from 'lucide-react-native';
import { router, Link } from 'expo-router';

const propertyTypes = ['1BHK', '2BHK', '3BHK', '4BHK', 'Villa'];

export default function HomeScreen() {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (location) searchParams.append('location', location);
    if (propertyType) searchParams.append('type', propertyType);
    if (budget) {
      const budgetValue = parseInt(budget.replace(/[^0-9]/g, ''));
      if (!isNaN(budgetValue)) {
        searchParams.append('maxPrice', budgetValue.toString());
      }
    }
    
    router.push({
      pathname: '/search',
      params: Object.fromEntries(searchParams)
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Dream Home</Text>
        <Text style={styles.subtitle}>Search properties with AI-powered insights</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <MapPin size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Enter location (e.g., Hyderabad)"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputContainer}>
          <IndianRupee size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Budget (e.g., 40L)"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.propertyTypeContainer}>
          <Building2 size={20} color="#666" style={styles.propertyTypeIcon} />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertyTypeList}
          >
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.propertyTypeButton,
                  propertyType === type && styles.propertyTypeButtonActive,
                ]}
                onPress={() => setPropertyType(type)}
              >
                <Text
                  style={[
                    styles.propertyTypeText,
                    propertyType === type && styles.propertyTypeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Properties</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Properties</Text>
        <Text style={styles.sectionSubtitle}>
          Start your search to see AI-powered recommendations
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: -20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  propertyTypeContainer: {
    marginBottom: 16,
  },
  propertyTypeIcon: {
    marginBottom: 8,
  },
  propertyTypeList: {
    flexDirection: 'row',
    gap: 8,
  },
  propertyTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  propertyTypeButtonActive: {
    backgroundColor: '#007AFF',
  },
  propertyTypeText: {
    fontSize: 14,
    color: '#666',
  },
  propertyTypeTextActive: {
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuredSection: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
  },
});