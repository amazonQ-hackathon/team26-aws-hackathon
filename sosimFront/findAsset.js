import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Animated, ActivityIndicator } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import ConditionInput from './ConditionInput';

// API 설정
const API_BASE_URL = 'https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com/prod';

const { height } = Dimensions.get('window');

const transactionTypes = [
  { id: 'LEASE', label: '전세' },
  { id: 'RENT', label: '월세' },
];

export default function FindAsset({ visible, onClose, onRefresh }) {
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState([]);
  const [selectedDirections, setSelectedDirections] = useState([]);
  const [selectedApprovalDate, setSelectedApprovalDate] = useState(null);
  const [depositMin, setDepositMin] = useState('');
  const [depositMax, setDepositMax] = useState('');
  const [monthlyMin, setMonthlyMin] = useState('');
  const [monthlyMax, setMonthlyMax] = useState('');
  const [filterName, setFilterName] = useState('');
  const [local1, setLocal1] = useState('');
  const [local2, setLocal2] = useState('');
  const [local3, setLocal3] = useState('');
  const [floorMin, setFloorMin] = useState('');
  const [floorMax, setFloorMax] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConditionInput, setShowConditionInput] = useState(false);

  const approvalDateOptions = [
    { id: 1, label: '전체' },
    { id: 2, label: '5년 이내' },
    { id: 3, label: '10년 이내' },
    { id: 4, label: '15년 이내' },
    { id: 5, label: '15년 이상' },
  ];



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



  const fetchHistory = async (filterId, filterName, conditions) => {
    try {
      console.log('📜 히스토리 매물 조회 시작 - Filter ID:', filterId);
      
      const historyResponse = await fetch(`${API_BASE_URL}/v1/filters/${filterId}/history?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'X-User-Id': '1'
        }
      });
      
      console.log('📥 History Response Status:', historyResponse.status);
      
      const historyResult = await historyResponse.json();
      console.log('📥 History Response:', historyResult);
      
      if (historyResponse.ok) {
        console.log('✅ 히스토리 조회 성공!');
        console.log(`🏠 총 ${historyResult.totalCount || 0}개 매물 발견`);
        console.log(`📊 현재 페이지: ${historyResult.currentPage}/${historyResult.totalPages}`);
        
        
          console.log('📄 매물 목록:');
          historyResult.properties.forEach((property, index) => {
            console.log(`  ${index + 1}. ${property.title}`);
            console.log(`     가격: ${property.price}만원 | 위치: ${property.local2} ${property.local3}`);
            console.log(`     층수: ${property.floor}층 | 방향: ${property.direction}향`);
            console.log(`     URL: ${property.sourceUrl}`);
          });
          
          console.log(filterId); 
          console.log(historyResult.properties);

      } else {
        console.error('❌ 히스토리 조회 실패:', historyResult);
      }
      
    } catch (error) {
      console.error('❌ 히스토리 조회 오류:', error);
    }
  };

  const handleApply = async () => {
    setIsLoading(true);
    
    const apiParams = {
      filterName: filterName || '내 필터',
      conditions: {
        ...(depositMin && { depositMin: parseInt(depositMin) }),
        ...(depositMax && { depositMax: parseInt(depositMax) }),
        ...(monthlyMin && { monthlyMin: parseInt(monthlyMin) }),
        ...(monthlyMax && { monthlyMax: parseInt(monthlyMax) }),
        ...(selectedDirections.length > 0 && { direction: selectedDirections.map(d => d.charAt(0)) }),
        ...(getApprovalDateMin() && { approvalDateMin: getApprovalDateMin() }),
        ...(local1 && { local1 }),
        ...(local2 && { local2 }),
        ...(selectedTransactionTypes.length > 0 && { propertyType: selectedTransactionTypes[0] }),
        ...(floorMin && { floorMin: parseInt(floorMin) }),
        ...(floorMax && { floorMax: parseInt(floorMax) })
      }
    };
    
    console.log('📤 API Request:', JSON.stringify(apiParams, null, 2));
    
    try {
      console.log('🌐 API URL:', `${API_BASE_URL}/v1/filters`);
      console.log('📋 Headers:', {
        'Content-Type': 'application/json',
        'X-User-Id': '1'
      });
      
      const response = await fetch(`${API_BASE_URL}/v1/filters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': '1'
        },
        body: JSON.stringify(apiParams)
      });
      
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', response.headers);
      
      if (response.status === 403) {
        console.error('❌ 403 Forbidden - 권한 문제 또는 CORS 설정 확인 필요');
        console.error('🔍 가능한 원인:');
        console.error('  1. API Gateway CORS 설정');
        console.error('  2. X-User-Id 헤더 인증 문제');
        console.error('  3. Lambda 함수 권한 설정');
      }
      
      const result = await response.json();
  
      console.log('📥 API Response:', result); 

      if (response.ok) {
        console.log('✅ Filter created successfully with ID:', result.filterId);
        
        // 필터 생성 후 히스토리 매물 조회
        await fetchHistory(result.filterId, apiParams.filterName, apiParams.conditions);
        
        // 메인화면 데이터 새로고침
        if (onRefresh) {
          console.log('🔄 findAsset handleApply 성공 - 메인화면 새로고침 요청');
          onRefresh();
        }
      } else {
        console.error('❌ API Error:', result);
      }
      
    } catch (error) {
      console.error('❌ Network Error:', error);
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
            <TouchableOpacity 
              style={styles.bannerContainer}
              onPress={() => setShowConditionInput(true)}
            >
              <Text style={styles.bannerText}>🏠 원하는 조건을 적어보세요 🏠</Text>
              <Text style={styles.bannerSubtext}>자세한 조건일수록 더 정확한 매물을 찾을 수 있어요</Text>
            </TouchableOpacity>
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
            <Text style={styles.sectionTitle}>• 보증금 (단위 : 만원)</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.priceInput} 
                placeholder="최소" 
                keyboardType="numeric" 
                value={depositMin}
                onChangeText={setDepositMin}
              />
              <Text style={styles.separator}>~</Text>
              <TextInput 
                style={styles.priceInput} 
                placeholder="최대" 
                keyboardType="numeric" 
                value={depositMax}
                onChangeText={setDepositMax}
              />
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>• 월세 (단위 : 만원)</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.priceInput} 
                placeholder="최소" 
                keyboardType="numeric" 
                value={monthlyMin}
                onChangeText={setMonthlyMin}
              />
              <Text style={styles.separator}>~</Text>
              <TextInput 
                style={styles.priceInput} 
                placeholder="최대" 
                keyboardType="numeric" 
                value={monthlyMax}
                onChangeText={setMonthlyMax}
              />
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
      
      <ConditionInput 
        visible={showConditionInput}
        onClose={() => setShowConditionInput(false)}
        onSuccess={() => {
          if (onRefresh) {
            onRefresh();
          }
        }}
      />
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
  priceInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'center',
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
  bannerContainer: {
    marginTop: 15,
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  bannerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  bannerSubtext: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
});