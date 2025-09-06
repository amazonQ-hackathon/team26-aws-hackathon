import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Animated, ActivityIndicator } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';

// API 설정 - 실제 API Gateway URL로 변경하세요
const API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com';

const { height } = Dimensions.get('window');

const transactionTypes = [
  { id: 'LEASE', label: '전세' },
  { id: 'RENT', label: '월세' },
];

export default function FindAsset({ visible, onClose }) {
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState([]);
  const [selectedDirections, setSelectedDirections] = useState([]);
  const [selectedApprovalDate, setSelectedApprovalDate] = useState(null);
  const [depositValue, setDepositValue] = useState(0);
  const [monthlyValue, setMonthlyValue] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [local1, setLocal1] = useState('');
  const [local2, setLocal2] = useState('');
  const [local3, setLocal3] = useState('');
  const [floorMin, setFloorMin] = useState('');
  const [floorMax, setFloorMax] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const depositTranslateX = new Animated.Value(0);
  const monthlyTranslateX = new Animated.Value(0);

  const approvalDateOptions = [
    { id: 1, label: '전체' },
    { id: 2, label: '5년 이내' },
    { id: 3, label: '10년 이내' },
    { id: 4, label: '15년 이내' },
    { id: 5, label: '15년 이상' },
  ];

  const SLIDER_WIDTH = 250;
  const MAX_DEPOSIT = 10000; // 1억
  const MAX_MONTHLY = 500; // 500만원

  const formatPrice = (value) => {
    if (value >= 10000) return '무제한';
    if (value >= 1000) return `${Math.floor(value / 1000)}천만원`;
    return `${value}만원`;
  };

  const toggleTransactionType = (typeId) => {
    setSelectedTransactionTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };



  const selectApprovalDate = (optionId) => {
    setSelectedApprovalDate(optionId);
  };

  const toggleDirection = (direction) => {
    setSelectedDirections(prev => 
      prev.includes(direction) 
        ? prev.filter(d => d !== direction)
        : [...prev, direction]
    );
  };

  const getApprovalDateMin = () => {
    const dateMap = {
      2: '2019-01-01', // 5년 이내
      3: '2014-01-01', // 10년 이내
      4: '2009-01-01', // 15년 이내
      5: '1900-01-01'  // 15년 이상
    };
    return dateMap[selectedApprovalDate] || null;
  };

  const handleApply = async () => {
    setIsLoading(true);
    
    const apiParams = {
      filterName: filterName || '내 필터',
      conditions: {
        ...(depositValue > 0 && { priceMin: depositValue }),
        ...(selectedDirections.length > 0 && { direction: selectedDirections.map(d => d.charAt(0)) }),
        ...(getApprovalDateMin() && { approvalDateMin: getApprovalDateMin() }),
        ...(local1 && { local1 }),
        ...(local2 && { local2 }),
        ...(selectedTransactionTypes.length > 0 && { propertyType: selectedTransactionTypes[0] }),
        ...(floorMin && { floorMin: parseInt(floorMin) }),
        ...(floorMax && { floorMax: parseInt(floorMax) })
      }
    };
    
    console.log('API Parameters:', JSON.stringify(apiParams, null, 2));
    
    // Mock API 시뮬레이션
    try {
      // 1. 필터 등록 Mock Response
      const mockCreateResult = { filterId: Math.floor(Math.random() * 1000) + 1 };
      console.log('Filter Create Response (Mock):', mockCreateResult);
      console.log('Filter created successfully with ID:', mockCreateResult.filterId);
      
      // 2. 필터 목록 조회 Mock Response
      const mockListResult = [
        {
          filterId: mockCreateResult.filterId,
          filterName: apiParams.filterName,
          conditions: apiParams.conditions,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          filterId: 1,
          filterName: '강남 전세 필터',
          conditions: {
            priceMin: 20000,
            priceMax: 80000,
            direction: ['남', '동'],
            local1: '서울시',
            local2: '강남구',
            propertyType: 'LEASE'
          },
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          filterId: 2,
          filterName: '홍대 월세 필터',
          conditions: {
            priceMax: 5000,
            local2: '마포구',
            propertyType: 'RENT'
          },
          isActive: true,
          createdAt: '2024-01-16T14:20:00Z'
        }
      ];
      
      console.log('Filter List Response (Mock):', mockListResult);
      console.log('Total filters:', mockListResult.length);
      
      mockListResult.forEach((filter, index) => {
        console.log(`Filter ${index + 1}:`, {
          id: filter.filterId,
          name: filter.filterName,
          active: filter.isActive,
          created: filter.createdAt
        });
      });
      
    } catch (error) {
      console.error('Mock API Error:', error);
    }
    
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 2000);
  };



  if (!visible) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>원하는 집 찾기</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 필터명</Text>
            <TextInput 
              style={styles.filterNameInput}
              placeholder="필터 이름을 입력하세요"
              value={filterName}
              onChangeText={setFilterName}
            />
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 거래유형</Text>
            <View style={styles.checkboxContainer}>
            {transactionTypes.map((type) => (
              <TouchableOpacity 
                key={type.id} 
                style={styles.checkboxItem} 
                onPress={() => toggleTransactionType(type.id)}
              >
                <View style={[
                  styles.checkbox, 
                  selectedTransactionTypes.includes(type.id) && styles.checkboxSelected
                ]}>
                  {selectedTransactionTypes.includes(type.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
            </View>
          </View>
          

          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 보증금</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.priceLabel}>{formatPrice(depositValue)} ~ 무제한</Text>
              <View style={styles.sliderTrack}>
                <PanGestureHandler
                  onGestureEvent={Animated.event(
                    [{ nativeEvent: { translationX: depositTranslateX } }],
                    { 
                      useNativeDriver: false,
                      listener: (event) => {
                        const clampedX = Math.max(0, Math.min(SLIDER_WIDTH - 20, event.nativeEvent.translationX));
                        depositTranslateX.setValue(clampedX);
                        const percentage = clampedX / (SLIDER_WIDTH - 20);
                        const newValue = Math.round(percentage * MAX_DEPOSIT / 100) * 100;
                        setDepositValue(newValue);
                      }
                    }
                  )}
                  onHandlerStateChange={(event) => {
                    if (event.nativeEvent.state === 5) {
                      // Keep thumb at current position
                    }
                  }}
                >
                  <Animated.View style={[styles.sliderThumb, { transform: [{ translateX: depositTranslateX }] }]} />
                </PanGestureHandler>
              </View>
            </View>
          </View>
          
          <View style={[styles.sectionContainer, !selectedTransactionTypes.includes('RENT') && styles.disabledSection]}>
            <Text style={[styles.sectionTitle, !selectedTransactionTypes.includes('RENT') && styles.disabledText]}>• 월세</Text>
            <View style={styles.sliderContainer}>
              <Text style={[styles.priceLabel, !selectedTransactionTypes.includes('RENT') && styles.disabledText]}>
                {!selectedTransactionTypes.includes('RENT') ? '월세 선택 시 활성' : `${formatPrice(monthlyValue)} ~ 무제한`}
              </Text>
              <View style={[styles.sliderTrack, !selectedTransactionTypes.includes('RENT') && styles.disabledTrack]}>
                {selectedTransactionTypes.includes('RENT') && (
                  <PanGestureHandler
                    onGestureEvent={Animated.event(
                      [{ nativeEvent: { translationX: monthlyTranslateX } }],
                      { 
                        useNativeDriver: false,
                        listener: (event) => {
                          const clampedX = Math.max(0, Math.min(SLIDER_WIDTH - 20, event.nativeEvent.translationX));
                          monthlyTranslateX.setValue(clampedX);
                          const percentage = clampedX / (SLIDER_WIDTH - 20);
                          const newValue = Math.round(percentage * MAX_MONTHLY / 10) * 10;
                          setMonthlyValue(newValue);
                        }
                      }
                    )}
                    onHandlerStateChange={(event) => {
                      if (event.nativeEvent.state === 5) {
                        // Keep thumb at current position
                      }
                    }}
                  >
                    <Animated.View style={[styles.sliderThumb, { transform: [{ translateX: monthlyTranslateX }] }]} />
                  </PanGestureHandler>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 방향</Text>
            <View style={styles.checkboxContainer}>
              {['동향', '서향', '남향', '북향'].map((direction, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.checkboxItem}
                  onPress={() => toggleDirection(direction)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedDirections.includes(direction) && styles.checkboxSelected
                  ]}>
                    {selectedDirections.includes(direction) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{direction}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 지역</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.locationInput} 
                placeholder="시" 
                value={local1}
                onChangeText={setLocal1}
              />
              <TextInput 
                style={styles.locationInput} 
                placeholder="군/구" 
                value={local2}
                onChangeText={setLocal2}
              />
              <TextInput 
                style={styles.locationInput} 
                placeholder="동" 
                value={local3}
                onChangeText={setLocal3}
              />
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 층수</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.floorInput} 
                placeholder="최소" 
                keyboardType="numeric" 
                value={floorMin}
                onChangeText={setFloorMin}
              />
              <Text style={styles.separator}>~</Text>
              <TextInput 
                style={styles.floorInput} 
                placeholder="최대" 
                keyboardType="numeric" 
                value={floorMax}
                onChangeText={setFloorMax}
              />
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 사용승인일</Text>
            <View style={styles.approvalDateContainer}>
              {approvalDateOptions.map((option) => (
                <TouchableOpacity 
                  key={option.id} 
                  style={[
                    styles.approvalDateItem,
                    selectedApprovalDate === option.id && styles.approvalDateSelected
                  ]}
                  onPress={() => selectApprovalDate(option.id)}
                >
                  <Text style={[
                    styles.approvalDateText,
                    selectedApprovalDate === option.id && styles.approvalDateTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>적용하기</Text>
          </TouchableOpacity>
      </ScrollView>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1B365D" />
            <Text style={styles.loadingText}>필터를 적용하고 있습니다...</Text>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1B365D',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B365D',
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#1B365D',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1B365D',
    borderColor: '#1B365D',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sliderContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: '#1B365D',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
    width: 250,
    alignSelf: 'center',
    position: 'relative',
  },

  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#1B365D',
    borderRadius: 10,
    top: -7,
  },
  disabledSection: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  disabledTrack: {
    backgroundColor: '#f0f0f0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginHorizontal: 4,
  },
  floorInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  separator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 12,
  },
  approvalDateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  approvalDateItem: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 10,
    alignItems: 'center',
  },
  approvalDateSelected: {
    backgroundColor: '#1B365D',
    borderColor: '#1B365D',
  },
  approvalDateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  approvalDateTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  filterNameInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#1B365D',
    fontWeight: '600',
  },
});