import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Linking } from 'react-native';

const { height } = Dimensions.get('window');

export default function AssetDetailInfo({ visible, onClose, filterData, clickedProperties, onPropertyClick, historyProperties = [] }) {
  if (!visible) return null;
  
  const formatPrice = (price, type) => {
    if (type === 'RENT') {
      return `월세 ${price}만원`;
    }
    return `전세 ${price.toLocaleString()}만원`;
  };
  
  // 더미 데이터 생성 함수
  const generateDummyData = () => {
    const locations = [
      ['서울시', '강남구', '논현동'],
      ['서울시', '강남구', '역삼동'],
      ['서울시', '강남구', '삼성동'],
      ['서울시', '강남구', '청담동'],
      ['서울시', '강남구', '대치동']
    ];
    const directions = ['남', '북', '동', '서', '남동', '남서'];
    const types = ['RENT', 'LEASE'];
    const titles = [
      '깔끔한 신축 원룸',
      '역세권 투룸 아파트',
      '넓은 거실의 오피스텔',
      '채광 좋은 브랜드 아파트',
      '교통 편리한 신축 빌라'
    ];
    
    return Array.from({ length: 5 }, (_, i) => {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        propertyId: `dummy_${Date.now()}_${i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        price: type === 'RENT' ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 50000) + 10000,
        propertyType: type,
        local1: location[0],
        local2: location[1],
        local3: location[2],
        floor: Math.floor(Math.random() * 20) + 1,
        direction: directions[Math.floor(Math.random() * directions.length)],
        approvalDate: `20${Math.floor(Math.random() * 10) + 15}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        sourceUrl: 'https://m.zigbang.com/home/villa/items/45801646?itemDetailType=PARTNERS&imageThumbnail=https%3A%2F%2Fic.zigbang.com%2Fic%2Fitems%2F45801646%2F10380458.jpg&hasVrKey=false',
        crawledAt: new Date().toISOString(),
        matchedAt: new Date().toISOString()
      };
    });
  };
  
  // 표시할 데이터 결정 (첫 번째 필터는 항상 빈 상태)
  const isFirstFilter = filterData?.filterId === 1;
  const displayProperties = historyProperties.length > 0 ? historyProperties : (isFirstFilter ? [] : generateDummyData());
  
  // 빈 상태 컴포넌트
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🏠</Text>
        <View style={styles.emptyIconOverlay}>
          <Text style={styles.emptySearchIcon}>🔍</Text>
        </View>
      </View>
      <Text style={styles.emptyTitle}>조건에 맞는 매물이 없습니다</Text>
      <Text style={styles.emptySubtitle}>다른 조건으로 다시 검색해보세요</Text>
      <View style={styles.emptyDivider} />
      <View style={styles.emptyTips}>
        <Text style={styles.emptyTipsTitle}>💡 검색 팁</Text>
        <Text style={styles.emptyTip}>• 가격 범위를 더 넓게 설정해보세요</Text>
        <Text style={styles.emptyTip}>• 지역 조건을 완화해보세요</Text>
        <Text style={styles.emptyTip}>• 방향이나 층수 조건을 제거해보세요</Text>
      </View>
    </View>
  );

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
            <Text style={styles.title}>{filterData?.filterName || '필터 상세정보'} - 추천 매물 ({displayProperties.length}건)</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {displayProperties.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={displayProperties}
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
                      {item.title}
                      {isClicked && ' ✓'}
                    </Text>
                    <Text style={styles.propertyPrice}>
                      {formatPrice(item.price, item.propertyType)}
                    </Text>
                    <View style={styles.propertyDetails}>
                      <Text style={styles.propertyDetail}>📍 {item.local1} {item.local2} {item.local3}</Text>
                      <Text style={styles.propertyDetail}>🏢 {item.floor}층 · 🧭 {item.direction}향</Text>
                      {item.approvalDate && <Text style={styles.propertyDetail}>🏗️ 사용승인일: {item.approvalDate}</Text>}
                      {item.crawledAt && <Text style={styles.propertyDetail}>🕐 수집일: {new Date(item.crawledAt).toLocaleDateString()}</Text>}
                      {item.matchedAt && <Text style={styles.propertyDetail}>✨ 매칭일: {new Date(item.matchedAt).toLocaleDateString()}</Text>}
                    </View>
                    <TouchableOpacity 
                      style={styles.sourceUrlContainer}
                      onPress={() => Linking.openURL(item.sourceUrl)}
                    >
                      <Text style={styles.sourceUrlText}>🌐 {item.sourceUrl}</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          )}

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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: height * 0.85,
    minHeight: height * 0.7,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 8,
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
  matchesList: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    minHeight: 400,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  emptyIconOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptySearchIcon: {
    fontSize: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B365D',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 24,
  },
  emptyTips: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  emptyTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 12,
  },
  emptyTip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});