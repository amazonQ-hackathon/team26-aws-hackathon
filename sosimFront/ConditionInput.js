import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, Alert, ActivityIndicator } from 'react-native';

const { height } = Dimensions.get('window');

// API 설정
const API_BASE_URL = 'https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com/prod';

// 프론트 파싱 함수
const parseConditionText = (text) => {
  const conditions = {};
  let filterName = '';
  
  // 거래유형 파싱
  if (text.includes('전세')) {
    conditions.propertyType = 'LEASE'; 
    filterName += '전세 ';
  } else if (text.includes('월세')) {
    conditions.propertyType = 'RENT';
    filterName += '월세 ';
  }
  
  // 지역 파싱
  const locationRegex = /(\S+구|\S+동|\S+시)/g;
  const locations = text.match(locationRegex);
  if (locations) {
    if (locations[0].includes('구')) {
      conditions.local2 = locations[0];
      filterName += locations[0] + ' ';
    } else if (locations[0].includes('동')) {
      conditions.local3 = locations[0];
      filterName += locations[0] + ' ';
    }
  }
  
  // 가격 파싱
  const priceRegex = /(\d+)억|(\d+)만원/g;
  let match;
  while ((match = priceRegex.exec(text)) !== null) {
    if (match[1]) { // 억 단위
      const price = parseInt(match[1]) * 10000;
      if (text.includes('이하') || text.includes('미만')) {
        conditions.priceMax = price;
        filterName += `${match[1]}억 이하 `;
      } else if (text.includes('이상')) {
        conditions.priceMin = price;
        filterName += `${match[1]}억 이상 `;
      }
    } else if (match[2]) { // 만원 단위
      const price = parseInt(match[2]);
      if (text.includes('이하') || text.includes('미만')) {
        conditions.priceMax = price;
        filterName += `${match[2]}만원 이하 `;
      } else if (text.includes('이상')) {
        conditions.priceMin = price;
        filterName += `${match[2]}만원 이상 `;
      }
    }
  }
  
  // 방향 파싱
  const directions = [];
  if (text.includes('남향')) {
    directions.push('남');
    filterName += '남향 ';
  }
  if (text.includes('북향')) {
    directions.push('북');
    filterName += '북향 ';
  }
  if (text.includes('동향')) {
    directions.push('동');
    filterName += '동향 ';
  }
  if (text.includes('서향')) {
    directions.push('서');
    filterName += '서향 ';
  }
  if (directions.length > 0) {
    conditions.direction = directions;
  }
  
  // 층수 파싱
  const floorRegex = /(\d+)층/g;
  const floors = [];
  while ((match = floorRegex.exec(text)) !== null) {
    floors.push(parseInt(match[1]));
  }
  if (floors.length > 0) {
    if (text.includes('이상')) {
      conditions.floorMin = Math.min(...floors);
    } else if (text.includes('이하')) {
      conditions.floorMax = Math.max(...floors);
    }
  }
  
  return {
    conditions,
    filterName: filterName.trim() || '사용자 필터'
  };
};

export default function ConditionInput({ visible, onClose, onSuccess }) {
  const [conditionText, setConditionText] = useState('');
  const [depositMin, setDepositMin] = useState('');
  const [depositMax, setDepositMax] = useState('');
  const [monthlyMin, setMonthlyMin] = useState('');
  const [monthlyMax, setMonthlyMax] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!conditionText.trim()) {
      Alert.alert('알림', '조건을 입력해주세요.');
      return;
    }

    if (isLoading) {
      console.log('⚠️ 이미 처리 중입니다. 중복 호출 방지.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📝 조건 파싱 API 호출 시작...');
      console.log('입력된 조건:', conditionText);
      
      // 프론트에서 미리 파싱
      const parsed = parseConditionText(conditionText);
      
      // 보증금/월세 입력값 추가
      if (depositMin) parsed.conditions.depositMin = parseInt(depositMin);
      if (depositMax) parsed.conditions.depositMax = parseInt(depositMax);
      if (monthlyMin) parsed.conditions.monthlyMin = parseInt(monthlyMin);
      if (monthlyMax) parsed.conditions.monthlyMax = parseInt(monthlyMax);
      
      console.log('🔍 프론트 파싱 결과:');
      console.log('  파싱된 조건:', JSON.stringify(parsed.conditions, null, 2));
      console.log('  생성된 필터명:', parsed.filterName);
      console.log('  보증금 범위:', depositMin, '~', depositMax);
      console.log('  월세 범위:', monthlyMin, '~', monthlyMax);
      
      const response = await fetch(`${API_BASE_URL}/v1/filters/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': '1'
        },
        body: JSON.stringify({
          type: 'text',
          content: conditionText.trim(),
          // 프론트 파싱 결과도 함께 전송
          frontendParsed: parsed
        })
      });
      
      console.log('📝 Parse Response Status:', response.status);
      
      const result = await response.json();
      console.log('📝 Parse Response:', result);
      
      if (response.ok) {
        console.log('✅ 파싱 성공!');
        console.log('📊 파싱 결과 상세:');
        
        // 파싱된 조건들 출력
        if (result.conditions) {
          console.log('  파싱된 조건들:');
          Object.entries(result.conditions).forEach(([key, value]) => {
            console.log(`    ${key}: ${JSON.stringify(value)}`);
          });
        }
        
        // 필터명 출력
        if (result.filterName) {
          console.log(`  생성된 필터명: ${result.filterName}`);
        }
        
        Alert.alert('성공', '조건이 성공적으로 처리되었습니다!');
        setConditionText('');
        setDepositMin('');
        setDepositMax('');
        setMonthlyMin('');
        setMonthlyMax('');
        onClose();
        // 메인화면 데이터 새로고침
        if (onSuccess) {
          console.log('🔄 ConditionInput onSuccess 호출 - 메인화면 새로고침 요청');
          onSuccess();
        } else {
          console.log('⚠️ onSuccess 콜백이 없습니다!');
        }
      } else {
        console.log('❌ 파싱 실패!');
        console.log(`  오류 코드: ${response.status}`);
        console.log(`  오류 메시지: ${result.message || '알 수 없는 오류'}`);
        
        if (result.details) {
          console.log(`  상세 정보: ${JSON.stringify(result.details)}`);
        }
        
        Alert.alert('오류', result.message || '조건 처리 중 오류가 발생했습니다.');
      }
      
    } catch (error) {
      console.error('❌ 조건 파싱 오류:', error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

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
            <Text style={styles.title}>원하는 조건을 아무렇게나 적어보세요</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceTitle}>보증금 (단위 : 만원)</Text>
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
              
              <Text style={styles.priceTitle}>월세 (단위 : 만원)</Text>
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
            
            <TextInput
              style={styles.textInput}
              placeholder="예: 강남역 근처 월세 50만원 이하 원룸"
              value={conditionText}
              onChangeText={setConditionText}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              style={[styles.submitButton, (isLoading || !conditionText.trim()) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading || !conditionText.trim()}
              activeOpacity={isLoading ? 1 : 0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>조건 입력 완료</Text>
              )}
            </TouchableOpacity>
          </View>
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
    minHeight: height * 0.4,
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
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B365D',
    flex: 1,
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  content: {
    flex: 1,
  },
  priceInputContainer: {
    marginBottom: 20,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 8,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
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
  separator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 12,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 120,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#1B365D',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
});