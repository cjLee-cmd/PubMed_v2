// === 🎯 최종 검증 테스트 - 전체 워크플로 검증 ===

/**
 * 전체 쿼리 저장/불러오기 워크플로 최종 검증 테스트
 * 실제 사용자 시나리오를 완벽 재현하여 모든 기능이 정상 작동하는지 확인
 */
function runFinalValidationTest() {
  console.log('🎯 === 최종 검증 테스트 시작 ===');
  
  const testResults = [];
  let testsPassed = 0;
  let totalTests = 0;
  
  try {
    // 1단계: 환경 준비 및 검증
    console.log('1️⃣ 환경 준비 및 검증...');
    setupTestEnvironment();
    
    // 2단계: 실제 데이터로 저장 테스트
    console.log('2️⃣ 실제 데이터 저장 테스트...');
    const saveResult = testRealDataSave();
    testResults.push(...saveResult.results);
    
    // 3단계: 저장된 데이터 불러오기 테스트
    console.log('3️⃣ 저장된 데이터 불러오기 테스트...');
    const loadResult = testRealDataLoad();
    testResults.push(...loadResult.results);
    
    // 4단계: 데이터 무결성 검증
    console.log('4️⃣ 데이터 무결성 검증...');
    const integrityResult = testDataIntegrity();
    testResults.push(...integrityResult.results);
    
    // 5단계: 에러 시나리오 테스트
    console.log('5️⃣ 에러 시나리오 테스트...');
    const errorResult = testErrorScenarios();
    testResults.push(...errorResult.results);
    
    // 결과 집계 및 표시
    totalTests = testResults.length;
    testsPassed = testResults.filter(r => r.passed).length;
    
    displayFinalResults(testResults, testsPassed, totalTests);
    
  } catch (error) {
    console.error('❌ 최종 검증 테스트 중 오류:', error);
    testResults.push({
      category: 'Final Validation',
      test: '전체 테스트 실행',
      passed: false,
      message: `테스트 실행 오류: ${error.message}`
    });
  }
  
  return {
    passed: testsPassed,
    total: totalTests,
    success_rate: ((testsPassed / totalTests) * 100).toFixed(1),
    results: testResults
  };
}

// 실제 데이터로 저장 테스트
function testRealDataSave() {
  console.log('💾 실제 데이터 저장 테스트...');
  const results = [];
  
  try {
    // 테스트용 복잡한 쿼리 데이터 생성
    const testQueries = [
      {
        name: '암 치료 연구',
        keywords: 'cancer AND (treatment OR therapy) AND clinical',
        rawKeywords: [
          { groupIndex: 0, operator: 'AND', keywords: ['cancer'] },
          { groupIndex: 1, operator: 'AND', keywords: ['treatment', 'therapy'] },
          { groupIndex: 2, operator: 'AND', keywords: ['clinical'] }
        ],
        dateFilter: {
          enabled: true,
          startDate: '2020-01-01',
          endDate: '2024-12-31'
        }
      },
      {
        name: 'AI 의료진단',
        keywords: 'artificial intelligence AND medical AND diagnosis',
        rawKeywords: [
          { groupIndex: 0, operator: 'AND', keywords: ['artificial intelligence'] },
          { groupIndex: 1, operator: 'OR', keywords: ['medical'] },
          { groupIndex: 2, operator: 'AND', keywords: ['diagnosis'] }
        ],
        dateFilter: {
          enabled: false,
          startDate: '',
          endDate: ''
        }
      }
    ];
    
    // 각 쿼리를 저장하고 결과 확인
    testQueries.forEach((query, index) => {
      try {
        // 쿼리를 UI에 설정
        setupQueryInUI(query);
        
        // 저장 함수 테스트 (실제로는 prompt가 뜨므로 내부 함수 직접 호출)
        const queryToSave = {
          name: query.name,
          keywords: buildSearchQuery(),
          rawKeywords: collectKeywordGroups(),
          dateFilter: collectDateFilter(),
          createdDate: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        };
        
        saveQueryToLocal(queryToSave);
        
        results.push({
          category: 'Real Data Save',
          test: `쿼리 저장 - ${query.name}`,
          passed: true,
          message: '정상 저장됨'
        });
        
      } catch (error) {
        results.push({
          category: 'Real Data Save',
          test: `쿼리 저장 - ${query.name}`,
          passed: false,
          message: `저장 실패: ${error.message}`
        });
      }
    });
    
  } catch (error) {
    results.push({
      category: 'Real Data Save',
      test: '전체 저장 테스트',
      passed: false,
      message: `저장 테스트 오류: ${error.message}`
    });
  }
  
  return { results };
}

// 저장된 데이터 불러오기 테스트
function testRealDataLoad() {
  console.log('📂 저장된 데이터 불러오기 테스트...');
  const results = [];
  
  try {
    // 저장된 쿼리 목록 가져오기
    const savedQueries = loadLocalQueries();
    
    if (savedQueries.length === 0) {
      results.push({
        category: 'Real Data Load',
        test: '저장된 쿼리 목록',
        passed: false,
        message: '저장된 쿼리가 없음'
      });
      return { results };
    }
    
    results.push({
      category: 'Real Data Load',
      test: '저장된 쿼리 목록',
      passed: true,
      message: `${savedQueries.length}개 쿼리 발견`
    });
    
    // 각 저장된 쿼리를 불러와서 테스트
    savedQueries.forEach((query, index) => {
      try {
        // UI 초기화
        clearUI();
        
        // 쿼리 불러오기
        loadSelectedQuery(query);
        
        // 불러온 결과 검증
        const currentKeywords = buildSearchQuery();
        const keywordsMatch = currentKeywords.trim() !== '';
        
        results.push({
          category: 'Real Data Load',
          test: `쿼리 불러오기 - ${query.name}`,
          passed: keywordsMatch,
          message: keywordsMatch ? '정상 불러옴' : '키워드 복원 실패'
        });
        
        // 미리보기 텍스트박스 업데이트 검증
        const summaryTextarea = document.getElementById('summary');
        const summaryUpdated = summaryTextarea && summaryTextarea.value.trim() !== '';
        
        results.push({
          category: 'Real Data Load',
          test: `미리보기 표시 - ${query.name}`,
          passed: summaryUpdated,
          message: summaryUpdated ? '미리보기에 쿼리 표시됨' : '미리보기 업데이트 실패'
        });
        
      } catch (error) {
        results.push({
          category: 'Real Data Load',
          test: `쿼리 불러오기 - ${query.name}`,
          passed: false,
          message: `불러오기 실패: ${error.message}`
        });
      }
    });
    
  } catch (error) {
    results.push({
      category: 'Real Data Load',
      test: '전체 불러오기 테스트',
      passed: false,
      message: `불러오기 테스트 오류: ${error.message}`
    });
  }
  
  return { results };
}

// 데이터 무결성 검증
function testDataIntegrity() {
  console.log('🔍 데이터 무결성 검증...');
  const results = [];
  
  try {
    const savedQueries = loadLocalQueries();
    
    savedQueries.forEach(query => {
      // 필수 필드 존재 확인
      const hasName = query.name && query.name.trim() !== '';
      const hasKeywords = query.keywords && query.keywords.trim() !== '';
      const hasRawKeywords = Array.isArray(query.rawKeywords);
      const hasDateFilter = query.dateFilter && typeof query.dateFilter === 'object';
      
      results.push({
        category: 'Data Integrity',
        test: `필수 필드 - ${query.name}`,
        passed: hasName && hasKeywords && hasRawKeywords && hasDateFilter,
        message: hasName && hasKeywords && hasRawKeywords && hasDateFilter 
          ? '모든 필수 필드 존재' 
          : '누락된 필드 있음'
      });
      
      // 키워드 데이터 구조 검증
      if (hasRawKeywords) {
        const validStructure = query.rawKeywords.every(group => 
          group.hasOwnProperty('groupIndex') &&
          group.hasOwnProperty('operator') &&
          Array.isArray(group.keywords)
        );
        
        results.push({
          category: 'Data Integrity',
          test: `키워드 구조 - ${query.name}`,
          passed: validStructure,
          message: validStructure ? '키워드 구조 정상' : '키워드 구조 이상'
        });
      }
    });
    
  } catch (error) {
    results.push({
      category: 'Data Integrity',
      test: '데이터 무결성 검사',
      passed: false,
      message: `무결성 검사 오류: ${error.message}`
    });
  }
  
  return { results };
}

// 에러 시나리오 테스트
function testErrorScenarios() {
  console.log('🚨 에러 시나리오 테스트...');
  const results = [];
  
  try {
    // 잘못된 데이터로 불러오기 시도
    const corruptedQuery = {
      name: 'Corrupted Query',
      keywords: null,
      rawKeywords: 'invalid structure',
      dateFilter: undefined
    };
    
    try {
      loadSelectedQuery(corruptedQuery);
      
      // 에러가 발생하지 않았다면, UI가 안전한 상태인지 확인
      const keywordGroups = document.querySelectorAll('.keyword-group');
      const hasMinimalStructure = keywordGroups.length >= 1;
      
      results.push({
        category: 'Error Scenarios',
        test: '손상된 데이터 복구',
        passed: hasMinimalStructure,
        message: hasMinimalStructure ? '안전하게 복구됨' : '복구 실패'
      });
      
    } catch (error) {
      results.push({
        category: 'Error Scenarios',
        test: '손상된 데이터 복구',
        passed: false,
        message: `복구 처리 실패: ${error.message}`
      });
    }
    
    // 빈 로컬 스토리지에서 불러오기 시도
    try {
      localStorage.removeItem(LOCAL_QUERY_FILE_KEY);
      const emptyQueries = loadLocalQueries();
      const isEmpty = Array.isArray(emptyQueries) && emptyQueries.length === 0;
      
      results.push({
        category: 'Error Scenarios',
        test: '빈 스토리지 처리',
        passed: isEmpty,
        message: isEmpty ? '빈 배열 반환됨' : '예상과 다른 결과'
      });
      
    } catch (error) {
      results.push({
        category: 'Error Scenarios',
        test: '빈 스토리지 처리',
        passed: false,
        message: `빈 스토리지 처리 실패: ${error.message}`
      });
    }
    
  } catch (error) {
    results.push({
      category: 'Error Scenarios',
      test: '전체 에러 시나리오',
      passed: false,
      message: `에러 시나리오 테스트 오류: ${error.message}`
    });
  }
  
  return { results };
}

// UI에 쿼리 설정
function setupQueryInUI(query) {
  // 키워드 컨테이너 초기화
  const container = document.getElementById('keyword-container');
  if (container) {
    container.innerHTML = '';
  }
  
  // 키워드 그룹 생성
  query.rawKeywords.forEach(group => {
    if (typeof createKeywordGroup === 'function') {
      createKeywordGroup();
      const groups = document.querySelectorAll('.keyword-group');
      if (groups.length > 0) {
        const lastGroup = groups[groups.length - 1];
        const input = lastGroup.querySelector('input[type="text"]');
        if (input) {
          input.value = group.keywords.join(' ');
        }
        
        // 연산자 설정
        const operatorButtons = lastGroup.querySelectorAll('button');
        operatorButtons.forEach(btn => {
          if (btn.textContent.trim() === group.operator) {
            btn.click();
          }
        });
      }
    }
  });
  
  // 날짜 필터 설정
  const dateCheckbox = document.getElementById('date-filter-enabled');
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  
  if (dateCheckbox) {
    dateCheckbox.checked = query.dateFilter.enabled;
  }
  if (startDate && query.dateFilter.startDate) {
    startDate.value = query.dateFilter.startDate;
  }
  if (endDate && query.dateFilter.endDate) {
    endDate.value = query.dateFilter.endDate;
  }
  
  // 요약 업데이트
  if (typeof updateSummary === 'function') {
    updateSummary();
  }
}

// UI 초기화
function clearUI() {
  const container = document.getElementById('keyword-container');
  if (container) {
    container.innerHTML = '';
  }
  
  const dateCheckbox = document.getElementById('date-filter-enabled');
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  const summary = document.getElementById('summary');
  
  if (dateCheckbox) dateCheckbox.checked = false;
  if (startDate) startDate.value = '';
  if (endDate) endDate.value = '';
  if (summary) summary.value = '';
}

// 최종 결과 표시
function displayFinalResults(results, passed, total) {
  console.log('\n🎯 === 최종 검증 테스트 결과 ===');
  
  const successRate = ((passed / total) * 100).toFixed(1);
  const categories = [...new Set(results.map(r => r.category))];
  
  console.log(`📊 전체 결과: ${passed}/${total} 통과 (${successRate}%)`);
  
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    const categoryTotal = categoryResults.length;
    
    console.log(`\n📂 ${category}: ${categoryPassed}/${categoryTotal} 통과`);
    
    categoryResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.test}: ${result.message}`);
    });
  });
  
  // HTML 결과 표시
  createFinalResultHTML(results, passed, total, successRate);
  
  // 결론 및 권장사항
  console.log('\n🏁 === 최종 결론 ===');
  if (successRate >= 95) {
    console.log('✅ 모든 기능이 정상적으로 작동합니다. 실제 사용 가능합니다.');
  } else if (successRate >= 80) {
    console.log('⚠️ 대부분의 기능이 정상적으로 작동하지만 일부 개선이 필요합니다.');
  } else {
    console.log('❌ 주요 기능에 문제가 있습니다. 추가 수정이 필요합니다.');
  }
}

// HTML 결과 표시
function createFinalResultHTML(results, passed, total, successRate) {
  const resultDiv = document.createElement('div');
  resultDiv.id = 'final-validation-results';
  
  const statusColor = successRate >= 95 ? '#28a745' : successRate >= 80 ? '#ffc107' : '#dc3545';
  
  resultDiv.innerHTML = `
    <div style="position: fixed; top: 10px; right: 10px; background: white; border: 3px solid ${statusColor}; padding: 25px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px; max-height: 80vh; overflow-y: auto;">
      <h3 style="margin: 0 0 20px 0; color: ${statusColor}; text-align: center;">🎯 최종 검증 결과</h3>
      
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: ${statusColor};">${successRate}%</div>
        <div style="margin-top: 5px; color: #666;">성공률</div>
        <div style="margin-top: 10px;">
          <span style="color: green;"><strong>${passed}</strong> 통과</span> / 
          <span style="color: #666;"><strong>${total}</strong> 총 테스트</span>
        </div>
      </div>
      
      <div style="font-size: 14px;">
        ${results.map(result => `
          <div style="margin-bottom: 10px; padding: 8px; border-left: 4px solid ${result.passed ? 'green' : 'red'}; background: ${result.passed ? '#d4edda' : '#f8d7da'}; border-radius: 4px;">
            <strong>[${result.category}]</strong><br>
            ${result.test}: <span style="color: ${result.passed ? 'green' : 'red'};">${result.message}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: ${successRate >= 95 ? '#d4edda' : successRate >= 80 ? '#fff3cd' : '#f8d7da'}; border-radius: 8px; text-align: center;">
        <strong>
          ${successRate >= 95 ? '✅ 모든 기능 정상 작동' : successRate >= 80 ? '⚠️ 일부 개선 필요' : '❌ 추가 수정 필요'}
        </strong>
      </div>
      
      <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">&times;</button>
    </div>
  `;
  
  // 기존 결과 제거
  const existing = document.getElementById('final-validation-results');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(resultDiv);
}

// 전역 함수로 노출
window.runFinalValidationTest = runFinalValidationTest;

// 페이지 로드 후 자동 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 최종 검증 테스트 준비 완료 (15초 후 자동 실행)');
  setTimeout(() => {
    runFinalValidationTest();
  }, 15000);
});