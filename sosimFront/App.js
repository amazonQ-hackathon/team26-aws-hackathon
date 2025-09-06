import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import SplashScreen from './SplashScreen';
import FindAsset from './findAsset';
import AssetDetailInfo from './AssetDetailInfo';

// API 설정
const API_BASE_URL = 'https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com/prod';

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
  const [apiFilters, setApiFilters] = useState([]);
  const [historyProperties, setHistoryProperties] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  
  const fetchAllFilters = async () => {
    try {
      console.log('🔄 fetchAllFilters 호출됨 - 메인화면 데이터 새로고침');
      console.log('📋 사용자 필터 목록 조회 시작');
      
      const response = await fetch(`${API_BASE_URL}/v1/filters`, {
        method: 'GET',
        headers: {
          'X-User-Id': '1'
        }
      });
      
      console.log('📋 Filter List Response Status:', response.status);
      
      const filters = await response.json();
      
      if (response.ok) {
        setApiFilters(filters);
        console.log(`📋 총 ${filters.length}개 필터 발견`);
      }
      
    } catch (error) {
      console.error('❌ 필터 목록 조회 오류:', error);
    }
  };
  
  const fetchFilterHistory = async (filterId) => {
    try {
      console.log(`📜 필터 히스토리 조회 시작 - Filter ID: ${filterId}`);
      
      const response = await fetch(`${API_BASE_URL}/v1/filters/${filterId}/history?page=1&limit=20`, {
        method: 'GET',
        headers: {
          'X-User-Id': '1'
        }
      });
      
      console.log('📜 History Response Status:', response.status);
      
      const historyData = await response.json();
      
      if (response.ok) {
        console.log(`✅ 히스토리 조회 성공! 총 ${historyData.totalCount || 0}개 매물`);
        
        // 히스토리 데이터를 state에 저장
        setHistoryProperties(historyData.properties || []);
        
      } else {
        console.error('❌ 히스토리 조회 실패:', historyData);
      }
      
    } catch (error) {
      console.error('❌ 히스토리 조회 오류:', error);
    }
  };
  
  const handlePropertyClick = (propertyId) => {
    setClickedProperties(prev => new Set([...prev, propertyId]));
  };
  
  useEffect(() => {
    // 앱 시작 시 필터 목록 조회
    fetchAllFilters();
    // 오디오 권한 요청
    requestAudioPermission();
  }, []);
  
  const requestAudioPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '음성 인식을 위해 마이크 권한이 필요합니다.');
      }
    } catch (error) {
      console.error('오디오 권한 요청 오류:', error);
    }
  };
  
  const startRecording = async () => {
    try {
      setIsRecording(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('녹음 시작');
    } catch (error) {
      console.error('녹음 시작 오류:', error);
      setIsRecording(false);
    }
  };
  
  const logAudioFilePath = (audioUri) => {
    // file:// 접두사 제거하고 실제 파일 경로 추출
    const filePath = audioUri.replace('file://', '');
    console.log('📂 오디오 파일 전체 경로:', filePath);
    console.log('📱 시뮤레이터에서 파일 위치: Simulator > Device > Photos 에서 확인 가능');
  };
  
  const transcribeAudio = async (audioUri) => {
    console.log('🎤 음성 인식 시작...');
    console.log('📁 오디오 파일 경로:', audioUri);
    
    // 파일 경로 로그 출력
    logAudioFilePath(audioUri);
    
    // 데모용 텍스트 배열
    const demoTexts = [
      '강남역 근처 월세 50만원 이하 원룸 찾고 있어요',
      '서초구 전세 2억 이하 투룸 찾고 있습니다',
      '홍대입구역 근처 월세 80만원 이하 원룸 구해요',
      '역삼동 오피스텔 전세 1억 5천 이하 찾아요'
    ];
    
    // 랜덤 데모 텍스트 선택
    const randomIndex = Math.floor(Math.random() * demoTexts.length);
    const demoText = demoTexts[randomIndex];
    
    console.log('📝 음성 인식 결과 (데모):', demoText);
    Alert.alert('음성 인식 완료', `인식된 텍스트: "${demoText}"`);
    
    return demoText;
  };
  
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('녹음 완료:', uri);
      
      // 음성을 텍스트로 변환
      const transcribedText = await transcribeAudio(uri);

      console.log(transcribedText);
      
      setRecording(null);
    } catch (error) {
      console.error('녹음 중지 오류:', error);
    }
  };
  
  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showFindAsset) {
    return <FindAsset 
      visible={true} 
      onClose={() => setShowFindAsset(false)} 
      onRefresh={fetchAllFilters}
    />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>소심하지만 집은 구하고 싶어</Text>
        <Text style={styles.subtitle}>어떤 집을 찾고 계신가요?</Text>
      </View>
      
      <TouchableOpacity style={styles.questionSection} onPress={() => setShowFindAsset(true)}>
        <Text style={styles.questionText}>당신이 원하는 집을 알려주세요.</Text>
      </TouchableOpacity>
      
      <FlatList
        style={styles.section}
        data={apiFilters}
        keyExtractor={(item) => item.filterId.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>내 관심 조건</Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>등록된 관심조건이 없습니다</Text>
            <Text style={styles.emptySubtitle}>위의 버튼을 눌러 새로운 조건을 만들어보세요</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const conditions = item.conditions || {};
          const location = [conditions.local1, conditions.local2, conditions.local3].filter(Boolean).join(' ');
          
          // 가격 범위 표시
          let priceRange = '가격 제한 없음';
          if (conditions.priceMin && conditions.priceMax) {
            priceRange = `${conditions.priceMin}~${conditions.priceMax}만원`;
          } else if (conditions.priceMin) {
            priceRange = `${conditions.priceMin}만원 이상`;
          } else if (conditions.priceMax) {
            priceRange = `${conditions.priceMax}만원 이하`;
          }
          
          const direction = conditions.direction ? conditions.direction.join(', ') + '향' : '방향 제한 없음';
          const propertyType = conditions.propertyType === 'LEASE' ? '전세' : conditions.propertyType === 'RENT' ? '월세' : '매매';
          
          // 층수 조건
          let floorRange = '';
          if (conditions.floorMin && conditions.floorMax) {
            floorRange = `${conditions.floorMin}~${conditions.floorMax}층`;
          } else if (conditions.floorMin) {
            floorRange = `${conditions.floorMin}층 이상`;
          } else if (conditions.floorMax) {
            floorRange = `${conditions.floorMax}층 이하`;
          }
          
          return (
            <TouchableOpacity 
              style={styles.filterCard}
              onPress={() => {
                console.log(`💆 필터 카드 클릭: ${item.filterName} (ID: ${item.filterId})`);
                fetchFilterHistory(item.filterId);
                setSelectedFilter(item);
                setShowAssetDetail(true);
              }}
            >
              <View style={styles.filterHeader}>
                <Text style={styles.filterName}>{item.filterName}</Text>
                <View style={styles.filterType}>
                  <Text style={styles.filterTypeText}>{propertyType}</Text>
                </View>
              </View>
              <View style={styles.filterDetails}>
                <Text style={styles.filterLocation}>📍 {location || '지역 제한 없음'}</Text>
                <Text style={styles.filterPrice}>💰 {priceRange}</Text>
                <Text style={styles.filterDirection}>🧭 {direction}</Text>
                {floorRange && <Text style={styles.filterFloor}>🏢 {floorRange}</Text>}
                {conditions.approvalDateAfter && <Text style={styles.filterApproval}>📅 {conditions.approvalDateAfter} 이후 준공</Text>}
                <Text style={styles.filterCreated}>🕐 생성일: {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      
      <AssetDetailInfo 
        visible={showAssetDetail}
        onClose={() => setShowAssetDetail(false)}
        filterData={selectedFilter}
        clickedProperties={clickedProperties}
        onPropertyClick={handlePropertyClick}
        historyProperties={historyProperties}
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
  filterFloor: {
    fontSize: 14,
    color: '#666',
  },
  filterApproval: {
    fontSize: 14,
    color: '#666',
  },
  filterCreated: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B365D',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});