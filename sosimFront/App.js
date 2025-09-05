import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './SplashScreen';
import FindAsset from './findAsset';

const propertyTypes = [
  { id: 1, name: '원룸', icon: '🏠', color: '#FF6B6B' },
  { id: 2, name: '오피스텔', icon: '🏢', color: '#4ECDC4' },
  { id: 3, name: '아파트', icon: '🏬', color: '#45B7D1' },
  { id: 4, name: '주택', icon: '🏡', color: '#96CEB4' },
];

const recentProperties = [
  { id: 1, title: '강남역 원룸', price: '월세 500/50', area: '20㎡' },
  { id: 2, title: '홍대입구 오피스텔', price: '월세 1000/80', area: '35㎡' },
  { id: 3, title: '역삼동 아파트', price: '전세 3억', area: '84㎡' },
  { id: 4, title: '이태원역 원룸', price: '월세 700/60', area: '25㎡' },
  { id: 5, title: '신촌역 오피스텔', price: '월세 1200/100', area: '42㎡' },
  { id: 6, title: '종로3가 원룸', price: '월세 600/40', area: '18㎡' },
  { id: 7, title: '강남구 아파트', price: '전세 5억', area: '102㎡' },
  { id: 8, title: '마포구 주택', price: '매매 8억', area: '120㎡' },
  { id: 9, title: '서초동 오피스텔', price: '월세 1500/120', area: '50㎡' },
  { id: 10, title: '영등포구 원룸', price: '월세 800/70', area: '30㎡' },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showFindAsset, setShowFindAsset] = useState(false);

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
        
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="지역, 역명 검색"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity style={styles.questionSection} onPress={() => setShowFindAsset(true)}>
        <Text style={styles.questionText}>당신이 원하는 집을 말해주세요.</Text>
      </TouchableOpacity>
      
      <FlatList
        style={styles.section}
        data={recentProperties}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>실시간 추천 매물</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.propertyCard}>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle}>{item.title}</Text>
              <Text style={styles.propertyPrice}>{item.price}</Text>
              <Text style={styles.propertyArea}>{item.area}</Text>
            </View>
          </TouchableOpacity>
        )}
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
  propertyCard: {
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
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B365D',
    marginBottom: 4,
  },
  propertyArea: {
    fontSize: 14,
    color: '#666',
  },
});