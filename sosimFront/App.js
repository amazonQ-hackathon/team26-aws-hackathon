import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './SplashScreen';
import FindAsset from './findAsset';
import AssetDetailInfo from './AssetDetailInfo';

const myFilters = [
  { id: 1, name: '강남 원룸 필터', type: '월세', location: '강남구', priceRange: '500-800만원', direction: '남향' },
  { id: 2, name: '홍대 오피스텔 필터', type: '전세', location: '마포구', priceRange: '1-2억', direction: '동향' },
  { id: 3, name: '신촌 투룸 필터', type: '월세', location: '서대문구', priceRange: '1000-1500만원', direction: '남향' },
  { id: 4, name: '역삼 아파트 필터', type: '전세', location: '강남구', priceRange: '3-5억', direction: '남향' },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showFindAsset, setShowFindAsset] = useState(false);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [clickedProperties, setClickedProperties] = useState(new Set());
  
  const handlePropertyClick = (propertyId) => {
    setClickedProperties(prev => new Set([...prev, propertyId]));
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showFindAsset) {
    return <FindAsset visible={true} onClose={() => setShowFindAsset(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Q-riosity</Text>
        <Text style={styles.subtitle}>어떤 집을 찾고 계신가요?</Text>
      </View>
      
      <TouchableOpacity style={styles.questionSection} onPress={() => setShowFindAsset(true)}>
        <Text style={styles.questionText}>당신이 원하는 집을 말해주세요.</Text>
      </TouchableOpacity>
      
      <FlatList
        style={styles.section}
        data={myFilters}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>내 검색 히스토리</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.filterCard}
            onPress={() => {
              setSelectedFilter(item);
              setShowAssetDetail(true);
            }}
          >
            <View style={styles.filterHeader}>
              <Text style={styles.filterName}>{item.name}</Text>
              <View style={styles.filterType}>
                <Text style={styles.filterTypeText}>{item.type}</Text>
              </View>
            </View>
            <View style={styles.filterDetails}>
              <Text style={styles.filterLocation}>📍 {item.location}</Text>
              <Text style={styles.filterPrice}>💰 {item.priceRange}</Text>
              <Text style={styles.filterDirection}>🧭 {item.direction}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      
      <AssetDetailInfo 
        visible={showAssetDetail}
        onClose={() => setShowAssetDetail(false)}
        filterData={selectedFilter}
        clickedProperties={clickedProperties}
        onPropertyClick={handlePropertyClick}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B365D',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  questionSection: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 25,
    paddingVertical: 30,
    backgroundColor: 'rgba(27, 54, 93, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B365D',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 8,
  },
  searchButtonText: {
    fontSize: 20,
  },
  section: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B365D',
    marginBottom: 16,
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B365D',
    flex: 1,
  },
  filterType: {
    backgroundColor: '#1B365D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterDetails: {
    gap: 6,
  },
  filterLocation: {
    fontSize: 14,
    color: '#666',
  },
  filterPrice: {
    fontSize: 14,
    color: '#666',
  },
  filterDirection: {
    fontSize: 14,
    color: '#666',
  },
});