import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView, FlatList, Linking } from 'react-native';

const { height } = Dimensions.get('window');

const mockMatches = [
  {
    propertyId: "zigbang_46139342",
    matchedAt: "2024-01-17T09:15:00Z",
    propertyInfo: {
      title: "강남구 논현동 신축 아파트",
      price: 45000,
      propertyType: "LEASE",
      local1: "서울시",
      local2: "강남구",
      local3: "논현동",
      floor: 8,
      direction: "남",
      approvalDate: "2020-03-15",
      sourceUrl: "https://m.zigbang.com/home/oneroom/items/44688230",
      crawledAt: "2024-01-17T09:10:00Z"
    }
  },
  {
    propertyId: "dabang_78234561",
    matchedAt: "2024-01-17T11:22:00Z",
    propertyInfo: {
      title: "서초구 반포동 리모델링 아파트",
      price: 38000,
      propertyType: "LEASE",
      local1: "서울시",
      local2: "서초구",
      local3: "반포동",
      floor: 12,
      direction: "동",
      approvalDate: "2018-08-20",
      sourceUrl: "https://dabang.com/rooms/78234561",
      crawledAt: "2024-01-17T11:20:00Z"
    }
  },
  {
    propertyId: "zigbang_92847365",
    matchedAt: "2024-01-17T14:45:00Z",
    propertyInfo: {
      title: "마포구 홍대입구 오피스텔",
      price: 800,
      propertyType: "RENT",
      local1: "서울시",
      local2: "마포구",
      local3: "서교동",
      floor: 6,
      direction: "서",
      approvalDate: "2019-12-10",
      sourceUrl: "https://zigbang.com/rooms/92847365",
      crawledAt: "2024-01-17T14:40:00Z"
    }
  },
  {
    propertyId: "naver_15639874",
    matchedAt: "2024-01-17T16:30:00Z",
    propertyInfo: {
      title: "송파구 잠실동 브랜드 아파트",
      price: 52000,
      propertyType: "LEASE",
      local1: "서울시",
      local2: "송파구",
      local3: "잠실동",
      floor: 15,
      direction: "남",
      approvalDate: "2021-05-18",
      sourceUrl: "https://land.naver.com/article/15639874",
      crawledAt: "2024-01-17T16:25:00Z"
    }
  },
  {
    propertyId: "dabang_44782139",
    matchedAt: "2024-01-17T18:10:00Z",
    propertyInfo: {
      title: "용산구 이태원동 복층 원룸",
      price: 1200,
      propertyType: "RENT",
      local1: "서울시",
      local2: "용산구",
      local3: "이태원동",
      floor: 3,
      direction: "북",
      approvalDate: "2017-03-25",
      sourceUrl: "https://dabang.com/rooms/44782139",
      crawledAt: "2024-01-17T18:05:00Z"
    }
  }
];

export default function AssetDetailInfo({ visible, onClose, filterData, clickedProperties, onPropertyClick }) {
  if (!visible) return null;
  
  const formatPrice = (price, type) => {
    if (type === 'RENT') {
      return `월세 ${price}만원`;
    }
    return `전세 ${price.toLocaleString()}만원`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>{filterData?.name || '필터 상세정보'} - 추천 매물 ({mockMatches.length}건)</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mockMatches}
            keyExtractor={(item) => item.propertyId}
            showsVerticalScrollIndicator={false}
            style={styles.matchesList}
            renderItem={({ item }) => {
              const isClicked = clickedProperties?.has(item.propertyId);
              return (
                <TouchableOpacity 
                  style={[
                    styles.propertyCard,
                    isClicked && styles.propertyCardClicked
                  ]}
                  onPress={() => onPropertyClick?.(item.propertyId)}
                >
                  <Text style={[
                    styles.propertyTitle,
                    isClicked && styles.propertyTitleClicked
                  ]}>
                    {item.propertyInfo.title}
                    {isClicked && ' ✓'}
                  </Text>
                  <Text style={styles.propertyPrice}>
                    {formatPrice(item.propertyInfo.price, item.propertyInfo.propertyType)}
                  </Text>
                  <View style={styles.propertyDetails}>
                    <Text style={styles.propertyDetail}>📍 {item.propertyInfo.local1} {item.propertyInfo.local2} {item.propertyInfo.local3}</Text>
                    <Text style={styles.propertyDetail}>🏢 {item.propertyInfo.floor}층 · 🧭 {item.propertyInfo.direction}향</Text>
                  </View>
                  <View style={styles.propertyMeta}>
                    <Text style={styles.propertyMetaText}>📅 사용승인: {item.propertyInfo.approvalDate}</Text>
                    <Text style={styles.propertyMetaText}>🔗 {item.propertyInfo.sourceUrl.includes('zigbang') ? '직방' : item.propertyInfo.sourceUrl.includes('dabang') ? '다방' : '네이버'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.sourceUrlContainer}
                    onPress={() => Linking.openURL(item.propertyInfo.sourceUrl)}
                  >
                    <Text style={styles.sourceUrlText}>🌐 {item.propertyInfo.sourceUrl}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B365D',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  content: {
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#1B365D',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#1B365D',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  matchesContainer: {
    flex: 1,
  },
  matchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B365D',
  },
  backButton: {
    fontSize: 16,
    color: '#1B365D',
    fontWeight: '600',
  },
  matchesList: {
    maxHeight: 300,
  },
  propertyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  propertyCardClicked: {
    backgroundColor: '#e8f4fd',
    borderWidth: 2,
    borderColor: '#1B365D',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 8,
  },
  propertyTitleClicked: {
    color: '#0066cc',
    fontWeight: '700',
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B365D',
    marginBottom: 8,
  },
  propertyDetails: {
    marginBottom: 8,
  },
  propertyDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  propertyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  propertyMetaText: {
    fontSize: 12,
    color: '#999',
  },
  sourceUrlContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sourceUrlText: {
    fontSize: 11,
    color: '#0066cc',
    fontFamily: 'monospace',
  },
});