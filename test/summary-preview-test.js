// === 🖼️ 미리보기 텍스트박스 업데이트 테스트 ===

/**
 * 쿼리 불러오기 시 '검색설정 미리보기' 텍스트박스 업데이트 테스트
 * 사용자 요청: "쿼리 불러오기를 하면, '검색설정 미리보기'텍스트 박스에 쿼리 내용이 표시되도록 수정 해."
 */
function runSummaryPreviewTest() {
  console.log('🖼️ === 미리보기 텍스트박스 업데이트 테스트 시작 ===');
  
  const results = [];
  let testsPassed = 0;
  let totalTests = 0;
  
  try {
    // 1단계: 환경 준비
    console.log('1️⃣ 테스트 환경 준비...');
    setupTestEnvironment();
    
    // 2단계: 테스트 쿼리 생성 및 저장
    console.log('2️⃣ 테스트 쿼리 생성...');
    const testQueries = createTestQueries();
    saveTestQueries(testQueries, results);
    
    // 3단계: 쿼리 불러오기 및 미리보기 테스트
    console.log('3️⃣ 미리보기 업데이트 테스트...');
    testSummaryPreviewUpdate(testQueries, results);
    
    // 4단계: 에지 케이스 테스트
    console.log('4️⃣ 에지 케이스 테스트...');
    testEdgeCases(results);
    
    // 결과 집계
    totalTests = results.length;
    testsPassed = results.filter(r => r.passed).length;
    
    displaySummaryTestResults(results, testsPassed, totalTests);
    
  } catch (error) {
    console.error('❌ 미리보기 테스트 실행 오류:', error);
    results.push({
      category: 'Summary Preview Test',
      test: '전체 테스트 실행',
      passed: false,
      message: `실행 오류: ${error.message}`
    });
  }
  
  return {
    passed: testsPassed,
    total: totalTests,
    success_rate: ((testsPassed / totalTests) * 100).toFixed(1),
    results: results
  };
}

// 테스트용 쿼리 데이터 생성
function createTestQueries() {
  return [
    {
      name: '미리보기_테스트_1',
      keywords: 'cancer AND treatment',
      rawKeywords: [
        { groupIndex: 0, operator: 'AND', keywords: ['cancer'] },
        { groupIndex: 1, operator: 'AND', keywords: ['treatment'] }
      ],
      dateFilter: { enabled: true, startDate: '2024-01-01', endDate: '2024-12-31' },
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    },
    {
      name: '미리보기_테스트_2',
      keywords: 'artificial intelligence OR machine learning',
      rawKeywords: [
        { groupIndex: 0, operator: 'OR', keywords: ['artificial intelligence'] },
        { groupIndex: 1, operator: 'OR', keywords: ['machine learning'] }
      ],
      dateFilter: { enabled: false, startDate: '', endDate: '' },
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    },
    {
      name: '복잡한_쿼리_테스트',
      keywords: '(diabetes AND (insulin OR medication)) AND clinical trial',
      rawKeywords: [
        { groupIndex: 0, operator: 'AND', keywords: ['diabetes'] },
        { groupIndex: 1, operator: 'OR', keywords: ['insulin', 'medication'] },
        { groupIndex: 2, operator: 'AND', keywords: ['clinical trial'] }
      ],
      dateFilter: { enabled: true, startDate: '2020-01-01', endDate: '2024-06-30' },
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    }
  ];
}

// 테스트 쿼리들을 저장
function saveTestQueries(testQueries, results) {
  try {
    testQueries.forEach(query => {
      try {
        saveQueryToLocal(query);
        results.push({
          category: 'Query Preparation',
          test: `테스트 쿼리 저장 - ${query.name}`,
          passed: true,
          message: '저장 완료'
        });
      } catch (error) {
        results.push({
          category: 'Query Preparation',
          test: `테스트 쿼리 저장 - ${query.name}`,
          passed: false,
          message: `저장 실패: ${error.message}`
        });
      }
    });
  } catch (error) {
    results.push({
      category: 'Query Preparation',
      test: '전체 쿼리 저장',
      passed: false,
      message: `저장 오류: ${error.message}`
    });
  }
}

// 미리보기 텍스트박스 업데이트 테스트
function testSummaryPreviewUpdate(testQueries, results) {
  try {
    const savedQueries = loadLocalQueries();
    const testQueryNames = testQueries.map(q => q.name);
    const relevantQueries = savedQueries.filter(q => testQueryNames.includes(q.name));
    
    relevantQueries.forEach(query => {
      try {
        // UI 초기화
        clearTestUI();
        
        // 미리보기 텍스트박스 초기 상태 확인
        const summaryTextarea = document.getElementById('summary');
        if (!summaryTextarea) {
          throw new Error('summary 텍스트박스를 찾을 수 없습니다');
        }
        
        const initialValue = summaryTextarea.value;
        console.log(`📋 초기 미리보기 상태: "${initialValue}"`);
        
        // 쿼리 불러오기 (실제 loadSelectedQuery 함수 사용)
        window.dialogQueries = [query];
        loadSelectedQuery(0);
        
        // 불러온 후 미리보기 텍스트박스 상태 확인
        const updatedValue = summaryTextarea.value;
        console.log(`📋 업데이트 후 미리보기: "${updatedValue}"`);
        
        // 테스트 조건들
        const hasContent = updatedValue.trim() !== '';
        const changedFromInitial = updatedValue !== initialValue;
        const containsExpectedKeywords = query.keywords && updatedValue.includes(query.keywords.split(' ')[0]);
        
        const testPassed = hasContent && changedFromInitial;
        
        results.push({
          category: 'Summary Preview Update',
          test: `미리보기 업데이트 - ${query.name}`,
          passed: testPassed,
          message: testPassed ? 
            `정상 업데이트: "${updatedValue.substring(0, 50)}..."` : 
            `업데이트 실패 - 내용: "${updatedValue}"`
        });
        
        // 키워드 포함 여부 별도 테스트
        results.push({
          category: 'Summary Preview Content',
          test: `내용 일치성 - ${query.name}`,
          passed: containsExpectedKeywords,
          message: containsExpectedKeywords ? 
            '예상 키워드 포함됨' : 
            `예상 키워드 누락: ${query.keywords}`
        });
        
        // 대기 시간 (다음 테스트 전)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          category: 'Summary Preview Update',
          test: `미리보기 업데이트 - ${query.name}`,
          passed: false,
          message: `오류: ${error.message}`
        });
      }
    });
    
  } catch (error) {
    results.push({
      category: 'Summary Preview Update',
      test: '전체 미리보기 테스트',
      passed: false,
      message: `테스트 오류: ${error.message}`
    });
  }
}

// 에지 케이스 테스트
function testEdgeCases(results) {
  try {
    // 1. 빈 키워드 쿼리 테스트
    const emptyQuery = {
      name: '빈_쿼리_테스트',
      keywords: '',
      rawKeywords: [],
      dateFilter: { enabled: false, startDate: '', endDate: '' }
    };
    
    try {
      clearTestUI();
      window.dialogQueries = [emptyQuery];
      loadSelectedQuery(0);
      
      const summaryTextarea = document.getElementById('summary');
      const finalValue = summaryTextarea ? summaryTextarea.value : '';
      
      results.push({
        category: 'Edge Cases',
        test: '빈 키워드 쿼리 처리',
        passed: true, // 에러가 발생하지 않으면 통과
        message: `빈 키워드 안전 처리됨: "${finalValue}"`
      });
      
    } catch (error) {
      results.push({
        category: 'Edge Cases',
        test: '빈 키워드 쿼리 처리',
        passed: false,
        message: `빈 키워드 처리 실패: ${error.message}`
      });
    }
    
    // 2. 매우 긴 키워드 쿼리 테스트
    const longKeywords = 'very long keyword '.repeat(20).trim();
    const longQuery = {
      name: '긴_키워드_테스트',
      keywords: longKeywords,
      rawKeywords: [{ groupIndex: 0, operator: 'AND', keywords: [longKeywords] }],
      dateFilter: { enabled: false, startDate: '', endDate: '' }
    };
    
    try {
      clearTestUI();
      window.dialogQueries = [longQuery];
      loadSelectedQuery(0);
      
      const summaryTextarea = document.getElementById('summary');
      const hasLongContent = summaryTextarea && summaryTextarea.value.length > 100;
      
      results.push({
        category: 'Edge Cases',
        test: '긴 키워드 쿼리 처리',
        passed: hasLongContent,
        message: hasLongContent ? 
          `긴 키워드 정상 표시 (${summaryTextarea.value.length}자)` : 
          '긴 키워드 표시 실패'
      });
      
    } catch (error) {
      results.push({
        category: 'Edge Cases',
        test: '긴 키워드 쿼리 처리',
        passed: false,
        message: `긴 키워드 처리 실패: ${error.message}`
      });
    }
    
  } catch (error) {
    results.push({
      category: 'Edge Cases',
      test: '에지 케이스 전체',
      passed: false,
      message: `에지 케이스 테스트 오류: ${error.message}`
    });
  }
}

// 테스트용 UI 초기화
function clearTestUI() {
  try {
    const summaryTextarea = document.getElementById('summary');
    if (summaryTextarea) {
      summaryTextarea.value = '';
    }
    
    const keywordContainer = document.getElementById('keyword-container');
    if (keywordContainer) {
      keywordContainer.innerHTML = '';
    }
    
    const dateCheckbox = document.getElementById('date-filter-enabled');
    if (dateCheckbox) {
      dateCheckbox.checked = false;
    }
    
    const startDate = document.getElementById('start-date');
    if (startDate) {
      startDate.value = '';
    }
    
    const endDate = document.getElementById('end-date');
    if (endDate) {
      endDate.value = '';
    }
    
  } catch (error) {
    console.warn('⚠️ UI 초기화 중 오류:', error);
  }
}

// 테스트 결과 표시
function displaySummaryTestResults(results, passed, total) {
  console.log('\n🖼️ === 미리보기 텍스트박스 업데이트 테스트 결과 ===');
  
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
  createSummaryTestHTML(results, passed, total, successRate);
  
  // 결론
  console.log('\n🎯 === 미리보기 기능 테스트 결론 ===');
  if (successRate >= 90) {
    console.log('✅ 미리보기 텍스트박스 업데이트 기능이 완벽하게 작동합니다!');
  } else if (successRate >= 70) {
    console.log('⚠️ 미리보기 기능이 대부분 정상 작동하지만 일부 개선이 필요합니다.');
  } else {
    console.log('❌ 미리보기 기능에 문제가 있습니다. 추가 수정이 필요합니다.');
  }
}

// HTML 결과 표시 생성
function createSummaryTestHTML(results, passed, total, successRate) {
  const resultDiv = document.createElement('div');
  resultDiv.id = 'summary-preview-test-results';
  
  const statusColor = successRate >= 90 ? '#28a745' : successRate >= 70 ? '#ffc107' : '#dc3545';
  
  resultDiv.innerHTML = `
    <div style="position: fixed; bottom: 10px; left: 10px; background: white; border: 3px solid ${statusColor}; padding: 20px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 1000; max-width: 450px; max-height: 70vh; overflow-y: auto;">
      <h3 style="margin: 0 0 15px 0; color: ${statusColor}; text-align: center;">🖼️ 미리보기 업데이트 테스트</h3>
      
      <div style="margin-bottom: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; color: ${statusColor};">${successRate}%</div>
        <div style="margin-top: 3px; color: #666;">성공률</div>
        <div style="margin-top: 8px; font-size: 14px;">
          <span style="color: green;"><strong>${passed}</strong> 통과</span> / 
          <span style="color: #666;"><strong>${total}</strong> 총 테스트</span>
        </div>
      </div>
      
      <div style="font-size: 12px;">
        ${results.map(result => `
          <div style="margin-bottom: 8px; padding: 6px; border-left: 3px solid ${result.passed ? 'green' : 'red'}; background: ${result.passed ? '#d4edda' : '#f8d7da'}; border-radius: 4px;">
            <strong style="font-size: 11px; color: #666;">[${result.category}]</strong><br>
            <strong>${result.test}</strong><br>
            <span style="color: ${result.passed ? 'green' : 'red'}; font-size: 11px;">${result.message}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 15px; padding: 10px; background: ${successRate >= 90 ? '#d4edda' : successRate >= 70 ? '#fff3cd' : '#f8d7da'}; border-radius: 6px; text-align: center; font-size: 13px;">
        <strong>
          ${successRate >= 90 ? '✅ 미리보기 기능 완벽 작동!' : successRate >= 70 ? '⚠️ 일부 개선 필요' : '❌ 추가 수정 필요'}
        </strong>
      </div>
      
      <button onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 12px; background: none; border: none; font-size: 18px; cursor: pointer; color: #999;">&times;</button>
    </div>
  `;
  
  // 기존 결과 제거
  const existing = document.getElementById('summary-preview-test-results');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(resultDiv);
}

// 전역 함수로 노출
window.runSummaryPreviewTest = runSummaryPreviewTest;

// 페이지 로드 후 자동 실행 (다른 테스트들과 시간 차이를 두어 실행)
document.addEventListener('DOMContentLoaded', function() {
  console.log('🖼️ 미리보기 테스트 준비 완료 (20초 후 자동 실행)');
  setTimeout(() => {
    runSummaryPreviewTest();
  }, 20000);
});