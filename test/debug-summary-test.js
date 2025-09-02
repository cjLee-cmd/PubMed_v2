// === 🐛 미리보기 텍스트박스 디버깅 테스트 ===

/**
 * 미리보기 텍스트박스가 업데이트되지 않는 문제를 디버깅하는 테스트
 */
function debugSummaryTextbox() {
  console.log('🐛 === 미리보기 텍스트박스 디버깅 시작 ===');
  
  try {
    // 1. DOM 요소 존재 확인
    console.log('1️⃣ DOM 요소 존재 확인...');
    
    const summaryById = document.getElementById('summary');
    const summaryByClass = document.querySelector('.summary-textarea');
    const summaryByTag = document.querySelector('textarea');
    const allTextareas = document.querySelectorAll('textarea');
    
    console.log('DOM 요소 상태:', {
      'getElementById("summary")': !!summaryById,
      'querySelector(".summary-textarea")': !!summaryByClass,
      'querySelector("textarea")': !!summaryByTag,
      'total_textareas': allTextareas.length
    });
    
    if (summaryById) {
      console.log('✅ #summary 요소 발견:', {
        tagName: summaryById.tagName,
        id: summaryById.id,
        className: summaryById.className,
        placeholder: summaryById.placeholder,
        currentValue: summaryById.value,
        readOnly: summaryById.readOnly,
        disabled: summaryById.disabled
      });
    }
    
    // 2. 테스트 쿼리 생성 및 저장
    console.log('2️⃣ 테스트 쿼리 생성...');
    
    const testQuery = {
      name: '디버깅_테스트_쿼리',
      keywords: 'DEBUG TEST QUERY',
      rawKeywords: [
        { groupIndex: 0, operator: 'AND', keywords: ['DEBUG'] },
        { groupIndex: 1, operator: 'AND', keywords: ['TEST'] },
        { groupIndex: 2, operator: 'AND', keywords: ['QUERY'] }
      ],
      dateFilter: { enabled: false, startDate: '', endDate: '' },
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    // 쿼리 저장
    try {
      saveQueryToLocal(testQuery);
      console.log('✅ 테스트 쿼리 저장 완료');
    } catch (saveError) {
      console.error('❌ 테스트 쿼리 저장 실패:', saveError);
    }
    
    // 3. 직접 텍스트박스 업데이트 테스트
    console.log('3️⃣ 직접 텍스트박스 업데이트 테스트...');
    
    if (summaryById) {
      const beforeValue = summaryById.value;
      console.log('📋 업데이트 전 값:', beforeValue);
      
      summaryById.value = 'DIRECT UPDATE TEST';
      console.log('📋 직접 업데이트 후 값:', summaryById.value);
      
      // 잠깐 후 다시 확인
      setTimeout(() => {
        console.log('📋 100ms 후 값:', summaryById.value);
      }, 100);
    }
    
    // 4. loadSelectedQuery 함수로 테스트
    console.log('4️⃣ loadSelectedQuery 함수 테스트...');
    
    try {
      window.dialogQueries = [testQuery];
      
      // 함수 호출 전 상태
      const beforeLoad = summaryById ? summaryById.value : 'N/A';
      console.log('📋 loadSelectedQuery 호출 전:', beforeLoad);
      
      // 함수 호출
      loadSelectedQuery(0);
      
      // 함수 호출 후 즉시 상태
      const afterLoad = summaryById ? summaryById.value : 'N/A';
      console.log('📋 loadSelectedQuery 호출 직후:', afterLoad);
      
      // 조금 더 기다린 후 상태
      setTimeout(() => {
        const finalValue = summaryById ? summaryById.value : 'N/A';
        console.log('📋 loadSelectedQuery 500ms 후:', finalValue);
        
        // 최종 분석
        analyzeFinalState(testQuery, finalValue);
      }, 500);
      
    } catch (loadError) {
      console.error('❌ loadSelectedQuery 테스트 실패:', loadError);
    }
    
  } catch (error) {
    console.error('❌ 디버깅 테스트 전체 실패:', error);
  }
}

// 최종 상태 분석
function analyzeFinalState(expectedQuery, actualValue) {
  console.log('📊 === 최종 상태 분석 ===');
  
  const analysis = {
    예상값: expectedQuery.keywords,
    실제값: actualValue,
    일치여부: actualValue === expectedQuery.keywords,
    비어있음: actualValue === '' || actualValue === null || actualValue === undefined,
    부분일치: actualValue.includes('DEBUG') || actualValue.includes('TEST'),
  };
  
  console.log('분석 결과:', analysis);
  
  if (analysis.일치여부) {
    console.log('✅ 성공: 미리보기 텍스트박스가 정상적으로 업데이트됨');
  } else if (analysis.부분일치) {
    console.log('⚠️ 부분 성공: 일부 내용이 표시됨');
  } else if (analysis.비어있음) {
    console.log('❌ 실패: 미리보기 텍스트박스가 비어있음');
    suggestSolutions();
  } else {
    console.log('🤔 예상치 못한 상황: 다른 값이 표시됨');
    console.log('추가 조사가 필요합니다.');
  }
}

// 해결책 제안
function suggestSolutions() {
  console.log('💡 === 해결책 제안 ===');
  
  console.log('1. updateSummary 함수가 값을 덮어쓰고 있을 수 있음');
  console.log('2. 다른 이벤트 리스너가 값을 초기화하고 있을 수 있음');
  console.log('3. CSS나 다른 스크립트에서 값을 변경하고 있을 수 있음');
  console.log('4. textarea 요소가 readonly이거나 disabled 상태일 수 있음');
  console.log('5. 다른 script.js의 함수들이 간섭하고 있을 수 있음');
  
  // 추가 디버깅 정보 제공
  console.log('🔍 추가 디버깅 시도...');
  
  // 모든 이벤트 리스너 확인
  const summary = document.getElementById('summary');
  if (summary) {
    console.log('Summary 요소의 속성들:', {
      value: summary.value,
      defaultValue: summary.defaultValue,
      readOnly: summary.readOnly,
      disabled: summary.disabled,
      style_display: summary.style.display,
      style_visibility: summary.style.visibility
    });
  }
  
  // buildSearchQuery 함수 테스트
  try {
    if (typeof buildSearchQuery === 'function') {
      const currentQuery = buildSearchQuery();
      console.log('현재 buildSearchQuery() 결과:', currentQuery);
    }
  } catch (error) {
    console.log('buildSearchQuery 호출 실패:', error.message);
  }
}

// 수동 수정 함수
function manuallyFixSummary() {
  console.log('🔧 수동 수정 시도...');
  
  const summary = document.getElementById('summary');
  if (summary) {
    summary.value = 'DEBUG TEST QUERY - MANUAL FIX';
    summary.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ 수동 수정 완료:', summary.value);
  } else {
    console.error('❌ summary 요소를 찾을 수 없음');
  }
}

// 전역 함수로 노출
window.debugSummaryTextbox = debugSummaryTextbox;
window.manuallyFixSummary = manuallyFixSummary;

// 페이지 로드 5초 후 자동 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('🐛 디버깅 테스트 준비 완료 (5초 후 자동 실행)');
  setTimeout(() => {
    debugSummaryTextbox();
  }, 5000);
});