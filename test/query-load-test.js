// === 🔧 쿼리 불러오기 에러 수정 테스트 ===

// 쿼리 불러오기 에러 테스트 실행
function runQueryLoadErrorTest() {
  console.log('🔧 === 쿼리 불러오기 에러 수정 테스트 시작 ===');
  
  const results = [];
  
  try {
    // 1. 함수 존재 확인
    testFunctionAvailability(results);
    
    // 2. DOM 구조 확인
    testDOMStructure(results);
    
    // 3. 쿼리 저장/불러오기 완전 테스트
    testCompleteQueryFlow(results);
    
    // 4. 에러 복구 테스트
    testErrorRecovery(results);
    
    // 결과 표시
    displayErrorTestResults(results);
    
  } catch (error) {
    console.error('❌ 에러 테스트 실행 중 오류:', error);
  }
}

// 1. 함수 존재 확인 테스트
function testFunctionAvailability(results) {
  console.log('🔍 필수 함수 존재 확인...');
  
  const requiredFunctions = [
    'createKeywordGroup',
    'updateSummary', 
    'buildSearchQuery',
    'collectKeywordGroups',
    'restoreKeywordGroups',
    'restoreDateFilter',
    'saveQueryToLocal',
    'loadLocalQueries'
  ];
  
  requiredFunctions.forEach(funcName => {
    const available = typeof window[funcName] === 'function';
    
    results.push({
      category: 'Function Availability',
      test: funcName,
      passed: available,
      message: available ? '함수 존재함' : '함수 누락됨'
    });
    
    if (!available) {
      console.warn(`⚠️ ${funcName} 함수를 찾을 수 없습니다.`);
    }
  });
}

// 2. DOM 구조 확인 테스트
function testDOMStructure(results) {
  console.log('🏗️ DOM 구조 확인...');
  
  const requiredElements = [
    { selector: '#keyword-container', name: '키워드 컨테이너' },
    { selector: '#date-filter-enabled', name: '날짜 필터 체크박스' },
    { selector: '#start-date', name: '시작 날짜 입력' },
    { selector: '#end-date', name: '종료 날짜 입력' },
    { selector: '#summary', name: '검색 요약 영역' }
  ];
  
  requiredElements.forEach(element => {
    const found = document.querySelector(element.selector);
    const exists = found !== null;
    
    results.push({
      category: 'DOM Structure',
      test: element.name,
      passed: exists,
      message: exists ? 'DOM 요소 존재함' : 'DOM 요소 누락됨'
    });
    
    if (!exists) {
      console.warn(`⚠️ ${element.name} (${element.selector})을 찾을 수 없습니다.`);
    }
  });
}

// 3. 완전한 쿼리 저장/불러오기 테스트
function testCompleteQueryFlow(results) {
  console.log('🔄 완전한 쿼리 플로우 테스트...');
  
  try {
    // 테스트 환경 설정
    setupTestEnvironment();
    
    // 테스트 쿼리 생성
    const testQuery = {
      name: '에러수정테스트',
      keywords: 'error AND fix AND test',
      rawKeywords: [
        {
          groupIndex: 0,
          operator: 'AND',
          keywords: ['error']
        },
        {
          groupIndex: 1,
          operator: 'AND', 
          keywords: ['fix']
        },
        {
          groupIndex: 2,
          operator: 'AND',
          keywords: ['test']
        }
      ],
      dateFilter: {
        enabled: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      },
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    // 로컬 저장 테스트
    try {
      saveQueryToLocal(testQuery);
      results.push({
        category: 'Complete Flow',
        test: '쿼리 로컬 저장',
        passed: true,
        message: '저장 성공'
      });
    } catch (saveError) {
      results.push({
        category: 'Complete Flow',
        test: '쿼리 로컬 저장',
        passed: false,
        message: saveError.message
      });
    }
    
    // 로컬 불러오기 테스트
    try {
      const savedQueries = loadLocalQueries();
      const testQueryExists = savedQueries.some(q => q.name === '에러수정테스트');
      
      results.push({
        category: 'Complete Flow',
        test: '쿼리 로컬 불러오기',
        passed: testQueryExists,
        message: testQueryExists ? '불러오기 성공' : '저장된 쿼리 없음'
      });
    } catch (loadError) {
      results.push({
        category: 'Complete Flow',
        test: '쿼리 로컬 불러오기',
        passed: false,
        message: loadError.message
      });
    }
    
    // 키워드 그룹 복원 테스트
    try {
      restoreKeywordGroups(testQuery.rawKeywords);
      
      // 복원된 키워드 그룹 확인
      const groups = document.querySelectorAll('.keyword-group');
      const hasGroups = groups.length >= testQuery.rawKeywords.length;
      
      results.push({
        category: 'Complete Flow',
        test: '키워드 그룹 복원',
        passed: hasGroups,
        message: `${groups.length}개 그룹 복원됨`
      });
      
      // 첫 번째 그룹의 값 확인
      if (groups.length > 0) {
        const firstInput = groups[0].querySelector('input[type="text"]');
        const hasValue = firstInput && firstInput.value === 'error';
        
        results.push({
          category: 'Complete Flow',
          test: '키워드 값 복원',
          passed: hasValue,
          message: hasValue ? '값 정상 복원' : '값 복원 실패'
        });
      }
      
    } catch (restoreError) {
      results.push({
        category: 'Complete Flow',
        test: '키워드 그룹 복원',
        passed: false,
        message: restoreError.message
      });
    }
    
    // 날짜 필터 복원 테스트
    try {
      restoreDateFilter(testQuery.dateFilter);
      
      const dateCheckbox = document.getElementById('date-filter-enabled');
      const startDate = document.getElementById('start-date');
      
      const dateRestored = dateCheckbox && dateCheckbox.checked &&
                          startDate && startDate.value === '2024-01-01';
      
      results.push({
        category: 'Complete Flow',
        test: '날짜 필터 복원',
        passed: dateRestored,
        message: dateRestored ? '날짜 필터 정상 복원' : '날짜 필터 복원 실패'
      });
      
    } catch (dateError) {
      results.push({
        category: 'Complete Flow',
        test: '날짜 필터 복원',
        passed: false,
        message: dateError.message
      });
    }
    
    // 미리보기 텍스트박스 업데이트 테스트
    try {
      // loadSelectedQuery 함수로 전체 쿼리 불러오기 테스트
      window.dialogQueries = [testQuery];
      loadSelectedQuery(0);
      
      // 미리보기 텍스트박스 확인
      const summaryTextarea = document.getElementById('summary');
      const summaryHasContent = summaryTextarea && summaryTextarea.value.trim() !== '';
      const summaryMatchesKeywords = summaryTextarea && summaryTextarea.value.includes('error');
      
      results.push({
        category: 'Complete Flow',
        test: '미리보기 텍스트박스 업데이트',
        passed: summaryHasContent && summaryMatchesKeywords,
        message: summaryHasContent && summaryMatchesKeywords ? 
          '미리보기에 쿼리 내용 정상 표시' : 
          '미리보기 업데이트 실패'
      });
      
    } catch (summaryError) {
      results.push({
        category: 'Complete Flow',
        test: '미리보기 텍스트박스 업데이트',
        passed: false,
        message: `미리보기 업데이트 오류: ${summaryError.message}`
      });
    }
    
  } catch (error) {
    results.push({
      category: 'Complete Flow',
      test: '전체 플로우',
      passed: false,
      message: error.message
    });
  }
}

// 4. 에러 복구 테스트
function testErrorRecovery(results) {
  console.log('🛡️ 에러 복구 테스트...');
  
  try {
    // 잘못된 데이터로 복원 시도
    const badData = {
      name: 'BadQuery',
      rawKeywords: null, // 잘못된 데이터
      dateFilter: undefined // 잘못된 데이터
    };
    
    // 키워드 그룹 복원 에러 처리 테스트
    try {
      restoreKeywordGroups(badData.rawKeywords);
      
      // 에러가 발생했어도 기본 그룹이 생성되었는지 확인
      const groups = document.querySelectorAll('.keyword-group');
      const hasBasicGroup = groups.length >= 1;
      
      results.push({
        category: 'Error Recovery',
        test: '잘못된 키워드 데이터 복구',
        passed: hasBasicGroup,
        message: hasBasicGroup ? '기본 그룹 생성됨' : '복구 실패'
      });
      
    } catch (keywordRecoveryError) {
      results.push({
        category: 'Error Recovery',
        test: '잘못된 키워드 데이터 복구',
        passed: false,
        message: keywordRecoveryError.message
      });
    }
    
    // 날짜 필터 복원 에러 처리 테스트  
    try {
      restoreDateFilter(badData.dateFilter);
      
      // 에러가 발생했어도 기본 상태로 설정되었는지 확인
      const dateCheckbox = document.getElementById('date-filter-enabled');
      const stateReset = dateCheckbox && !dateCheckbox.checked;
      
      results.push({
        category: 'Error Recovery',
        test: '잘못된 날짜 데이터 복구',
        passed: stateReset,
        message: stateReset ? '기본 상태로 복구됨' : '복구 실패'
      });
      
    } catch (dateRecoveryError) {
      results.push({
        category: 'Error Recovery',
        test: '잘못된 날짜 데이터 복구',
        passed: false,
        message: dateRecoveryError.message
      });
    }
    
  } catch (error) {
    results.push({
      category: 'Error Recovery',
      test: '에러 복구 전체',
      passed: false,
      message: error.message
    });
  }
}

// 테스트 환경 설정
function setupTestEnvironment() {
  // 키워드 컨테이너 확인/생성
  let container = document.getElementById('keyword-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'keyword-container';
    document.body.appendChild(container);
  }
  
  // 날짜 필터 요소들 확인/생성
  const dateElements = ['date-filter-enabled', 'start-date', 'end-date'];
  dateElements.forEach(id => {
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement('input');
      element.id = id;
      element.type = id === 'date-filter-enabled' ? 'checkbox' : 'date';
      document.body.appendChild(element);
    }
  });
  
  // 검색 요약 영역 확인/생성
  let summary = document.getElementById('summary');
  if (!summary) {
    summary = document.createElement('textarea');
    summary.id = 'summary';
    document.body.appendChild(summary);
  }
}

// 테스트 결과 표시
function displayErrorTestResults(results) {
  console.log('\n🔧 === 에러 수정 테스트 결과 ===');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.passed).length;
    const total = categoryResults.length;
    
    console.log(`\n📂 ${category}: ${passed}/${total} 통과`);
    
    categoryResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.test}: ${result.message}`);
    });
  });
  
  const totalTests = results.length;
  const totalPassed = results.filter(r => r.passed).length;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  console.log(`\n📊 전체 결과: ${totalPassed}/${totalTests} 통과 (${successRate}%)`);
  
  // HTML 결과 표시
  createErrorTestResultHTML(results);
  
  return {
    totalTests,
    totalPassed,
    successRate: parseFloat(successRate),
    results
  };
}

// HTML 결과 표시
function createErrorTestResultHTML(results) {
  const resultDiv = document.createElement('div');
  resultDiv.id = 'error-test-results';
  
  const totalPassed = results.filter(r => r.passed).length;
  const successRate = ((totalPassed / results.length) * 100).toFixed(1);
  
  resultDiv.innerHTML = `
    <div style="position: fixed; top: 50px; left: 10px; background: white; border: 2px solid #dc3545; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-width: 400px; max-height: 600px; overflow-y: auto;">
      <h3 style="margin: 0 0 15px 0; color: #dc3545;">🔧 에러 수정 테스트</h3>
      
      <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
        <div><strong>전체:</strong> ${results.length}개 테스트</div>
        <div style="color: ${totalPassed === results.length ? 'green' : 'orange'};"><strong>통과:</strong> ${totalPassed}개</div>
        <div style="color: red;"><strong>실패:</strong> ${results.length - totalPassed}개</div>
        <div style="margin-top: 5px; font-size: 16px;"><strong>성공률:</strong> ${successRate}%</div>
      </div>
      
      <div style="font-size: 13px;">
        ${results.map(result => `
          <div style="margin-bottom: 8px; padding: 5px; border-left: 3px solid ${result.passed ? 'green' : 'red'}; background: ${result.passed ? '#d4edda' : '#f8d7da'};">
            <strong>${result.test}</strong><br>
            <span style="color: #666;">${result.message}</span>
          </div>
        `).join('')}
      </div>
      
      <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 5px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
    </div>
  `;
  
  // 기존 결과 제거
  const existing = document.getElementById('error-test-results');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(resultDiv);
}

// 전역 함수로 노출
window.runQueryLoadErrorTest = runQueryLoadErrorTest;

// 개발 모드에서 자동 실행
if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
  console.log('🔧 개발 모드 - 에러 수정 테스트 자동 실행 예약 (10초 후)');
  setTimeout(() => {
    runQueryLoadErrorTest();
  }, 10000);
}