// === 🔬 통합 테스트 및 검증 스크립트 ===

// 통합 테스트 실행 함수
async function runIntegrationTests() {
  console.log('🔬 === 쿼리 저장/불러오기 통합 테스트 시작 ===');
  
  const results = [];
  
  try {
    // 1. UI 요소 존재 확인
    await testUIElements(results);
    
    // 2. 쿼리 저장 기능 테스트
    await testQuerySaving(results);
    
    // 3. 쿼리 불러오기 기능 테스트  
    await testQueryLoading(results);
    
    // 4. 에러 처리 테스트
    await testErrorHandling(results);
    
    // 5. 브라우저 호환성 테스트
    await testBrowserCompatibility(results);
    
    // 결과 리포트 출력
    generateIntegrationReport(results);
    
  } catch (error) {
    console.error('❌ 통합 테스트 실행 중 오류:', error);
  }
}

// 1. UI 요소 존재 확인
async function testUIElements(results) {
  console.log('🎨 UI 요소 존재 확인...');
  
  const elements = [
    { name: '쿼리 저장 버튼', selector: '.save-query-btn' },
    { name: '쿼리 불러오기 버튼', selector: '.load-query-btn' },
    { name: '키워드 컨테이너', selector: '#keyword-container' },
    { name: '검색 요약 영역', selector: '#summary' },
    { name: '날짜 필터 체크박스', selector: '#date-filter-enabled' }
  ];
  
  let allElementsFound = true;
  
  elements.forEach(element => {
    const found = document.querySelector(element.selector);
    const exists = found !== null;
    
    results.push({
      category: 'UI Elements',
      test: element.name,
      passed: exists,
      message: exists ? '요소 발견됨' : '요소 누락됨'
    });
    
    if (!exists) {
      allElementsFound = false;
      console.warn(`⚠️ ${element.name} 누락: ${element.selector}`);
    }
  });
  
  console.log(allElementsFound ? '✅ 모든 UI 요소 확인됨' : '⚠️ 일부 UI 요소 누락됨');
}

// 2. 쿼리 저장 기능 테스트 (로컬 파일)
async function testQuerySaving(results) {
  console.log('💾 쿼리 저장 기능 테스트 (로컬 파일)...');
  
  try {
    // 테스트 데이터 설정
    setupTestQuery();
    
    // 로컬 파일 초기화 테스트
    initializeLocalQueryFile();
    const initStatus = localStorage.getItem(LOCAL_QUERY_FILE_KEY) !== null;
    
    results.push({
      category: 'Local Query Saving',
      test: '로컬 파일 초기화',
      passed: initStatus,
      message: initStatus ? '초기화 완료' : '초기화 실패'
    });
    
    // 쿼리 데이터 수집 테스트
    const keywordGroups = collectKeywordGroups();
    const dateFilter = collectDateFilter();
    
    const keywordsValid = Array.isArray(keywordGroups) && keywordGroups.length > 0;
    const dateFilterValid = dateFilter && typeof dateFilter.enabled === 'boolean';
    
    results.push({
      category: 'Local Query Saving',
      test: '키워드 그룹 수집',
      passed: keywordsValid,
      message: `${keywordGroups.length}개 그룹 수집됨`
    });
    
    results.push({
      category: 'Local Query Saving',
      test: '날짜 필터 수집',
      passed: dateFilterValid,
      message: `필터 활성화: ${dateFilter.enabled}`
    });
    
    // 로컬 저장 테스트
    const testQuery = {
      name: '통합테스트쿼리',
      keywords: 'integration AND test',
      rawKeywords: keywordGroups,
      dateFilter: dateFilter,
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    // 로컬 파일에 저장
    saveQueryToLocal(testQuery);
    
    // 저장 확인
    const savedQueries = loadLocalQueries();
    const saveSuccess = savedQueries.some(q => q.name === '통합테스트쿼리');
    
    results.push({
      category: 'Local Query Saving',
      test: '로컬 파일 저장',
      passed: saveSuccess,
      message: `저장 후 쿼리 수: ${savedQueries.length}개`
    });
    
    console.log('✅ 로컬 쿼리 저장 기능 테스트 완료');
    
  } catch (error) {
    results.push({
      category: 'Local Query Saving',
      test: '전체 저장 프로세스',
      passed: false,
      message: error.message
    });
    
    console.error('❌ 로컬 쿼리 저장 테스트 실패:', error);
  }
}

// 3. 쿼리 불러오기 기능 테스트 (로컬 파일)
async function testQueryLoading(results) {
  console.log('📂 쿼리 불러오기 기능 테스트 (로컬 파일)...');
  
  try {
    // 로컬 파일에서 쿼리 로드 테스트
    const localQueries = loadLocalQueries();
    const localLoadSuccess = Array.isArray(localQueries);
    
    results.push({
      category: 'Local Query Loading',
      test: '로컬 파일 로드',
      passed: localLoadSuccess,
      message: `로드된 쿼리 수: ${localQueries.length}개`
    });
    
    if (localQueries.length > 0) {
      const firstQuery = localQueries[0];
      
      // 데이터 구조 검증
      const structureValid = firstQuery.name &&
                             firstQuery.keywords &&
                             firstQuery.rawKeywords && 
                             Array.isArray(firstQuery.rawKeywords) &&
                             firstQuery.dateFilter &&
                             typeof firstQuery.dateFilter.enabled === 'boolean';
      
      results.push({
        category: 'Local Query Loading',
        test: '로컬 데이터 구조 검증',
        passed: structureValid,
        message: structureValid ? '구조 정상' : '구조 오류'
      });
      
      // 키워드 복원 가능성 테스트
      const keywordsRestorable = firstQuery.rawKeywords.length > 0 &&
                                firstQuery.rawKeywords[0].keywords &&
                                Array.isArray(firstQuery.rawKeywords[0].keywords);
      
      results.push({
        category: 'Local Query Loading',
        test: '키워드 데이터 복원 가능성',
        passed: keywordsRestorable,
        message: keywordsRestorable ? '복원 가능' : '복원 불가'
      });
      
      // 마지막 사용 시간 업데이트 테스트
      const originalLastUsed = firstQuery.lastUsed;
      updateQueryLastUsed(firstQuery.name, new Date().toISOString());
      
      const updatedQueries = loadLocalQueries();
      const updatedQuery = updatedQueries.find(q => q.name === firstQuery.name);
      const lastUsedUpdated = updatedQuery && updatedQuery.lastUsed !== originalLastUsed;
      
      results.push({
        category: 'Local Query Loading',
        test: '마지막 사용 시간 업데이트',
        passed: lastUsedUpdated,
        message: lastUsedUpdated ? '업데이트 성공' : '업데이트 실패'
      });
    }
    
    // 쿼리 삭제 테스트 (테스트 쿼리만)
    if (localQueries.some(q => q.name === '통합테스트쿼리')) {
      const deleteSuccess = deleteQuery('통합테스트쿼리');
      
      results.push({
        category: 'Local Query Loading',
        test: '쿼리 삭제',
        passed: deleteSuccess,
        message: deleteSuccess ? '삭제 성공' : '삭제 실패'
      });
    }
    
    console.log('✅ 로컬 쿼리 불러오기 기능 테스트 완료');
    
  } catch (error) {
    results.push({
      category: 'Local Query Loading',
      test: '전체 불러오기 프로세스',
      passed: false,
      message: error.message
    });
    
    console.error('❌ 로컬 쿼리 불러오기 테스트 실패:', error);
  }
}

// 4. 에러 처리 테스트
async function testErrorHandling(results) {
  console.log('🛡️ 에러 처리 테스트...');
  
  try {
    // 잘못된 CSV 파싱 테스트
    const invalidCSVs = [
      '', // 빈 문자열
      'incomplete,header', // 불완전한 헤더
      'QueryName,Keywords\n"test"', // 필드 부족
      'QueryName,Keywords\n"test","invalid json {{"' // 잘못된 JSON
    ];
    
    let errorHandlingWorking = true;
    
    invalidCSVs.forEach((csv, index) => {
      try {
        const result = parseQueryCSV(csv);
        // 에러가 발생하지 않고 빈 배열 반환하면 정상
        if (!Array.isArray(result)) {
          errorHandlingWorking = false;
        }
      } catch (error) {
        // 에러가 적절히 처리되면 정상
        console.log(`  ✅ 잘못된 CSV ${index + 1} 에러 처리됨:`, error.message);
      }
    });
    
    results.push({
      category: 'Error Handling',
      test: '잘못된 CSV 처리',
      passed: errorHandlingWorking,
      message: `${invalidCSVs.length}개 케이스 테스트`
    });
    
    // JSON 파싱 에러 처리 테스트
    const jsonResults = [
      safeJSONParse('invalid json', {}),
      safeJSONParse('', { default: true }),
      safeJSONParse(null, { null: true }),
      safeJSONParse(undefined, { undefined: true })
    ];
    
    const jsonErrorHandlingWorking = jsonResults.every(result => 
      result && typeof result === 'object'
    );
    
    results.push({
      category: 'Error Handling',
      test: 'JSON 파싱 에러 처리',
      passed: jsonErrorHandlingWorking,
      message: '모든 케이스 안전 처리됨'
    });
    
    console.log('✅ 에러 처리 테스트 완료');
    
  } catch (error) {
    results.push({
      category: 'Error Handling',
      test: '전체 에러 처리',
      passed: false,
      message: error.message
    });
    
    console.error('❌ 에러 처리 테스트 실패:', error);
  }
}

// 5. 브라우저 호환성 테스트
async function testBrowserCompatibility(results) {
  console.log('🌐 브라우저 호환성 테스트...');
  
  try {
    // 필수 API 지원 확인
    const apis = [
      { name: 'FileReader', available: typeof FileReader !== 'undefined' },
      { name: 'Blob', available: typeof Blob !== 'undefined' },
      { name: 'URL.createObjectURL', available: typeof URL !== 'undefined' && URL.createObjectURL },
      { name: 'JSON.parse/stringify', available: typeof JSON !== 'undefined' },
      { name: 'localStorage', available: typeof localStorage !== 'undefined' }
    ];
    
    apis.forEach(api => {
      results.push({
        category: 'Browser Compatibility',
        test: api.name,
        passed: api.available,
        message: api.available ? '지원됨' : '지원 안됨'
      });
    });
    
    // 브라우저 정보
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled
    };
    
    results.push({
      category: 'Browser Compatibility',
      test: '브라우저 정보',
      passed: true,
      message: `${browserInfo.platform} - ${browserInfo.language}`
    });
    
    console.log('✅ 브라우저 호환성 테스트 완료');
    
  } catch (error) {
    results.push({
      category: 'Browser Compatibility',
      test: '호환성 검사',
      passed: false,
      message: error.message
    });
    
    console.error('❌ 브라우저 호환성 테스트 실패:', error);
  }
}

// 테스트용 쿼리 설정
function setupTestQuery() {
  // 키워드 컨테이너가 없으면 생성
  let container = document.getElementById('keyword-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'keyword-container';
    document.body.appendChild(container);
  }
  
  // 기존 그룹 제거
  container.innerHTML = '';
  
  // 테스트 그룹 생성
  const group = document.createElement('div');
  group.className = 'keyword-group';
  
  const input1 = document.createElement('input');
  input1.className = 'keyword-input';
  input1.value = 'integration';
  
  const input2 = document.createElement('input');
  input2.className = 'keyword-input';
  input2.value = 'test';
  
  const operator = document.createElement('select');
  operator.className = 'group-operator';
  const option = document.createElement('option');
  option.value = 'AND';
  option.selected = true;
  operator.appendChild(option);
  
  group.appendChild(input1);
  group.appendChild(input2);
  group.appendChild(operator);
  container.appendChild(group);
  
  // 날짜 필터 요소들이 없으면 생성
  let dateCheckbox = document.getElementById('date-filter-enabled');
  if (!dateCheckbox) {
    dateCheckbox = document.createElement('input');
    dateCheckbox.type = 'checkbox';
    dateCheckbox.id = 'date-filter-enabled';
    dateCheckbox.checked = true;
    document.body.appendChild(dateCheckbox);
  }
  
  let startDate = document.getElementById('start-date');
  if (!startDate) {
    startDate = document.createElement('input');
    startDate.type = 'date';
    startDate.id = 'start-date';
    startDate.value = '2023-01-01';
    document.body.appendChild(startDate);
  }
  
  let endDate = document.getElementById('end-date');
  if (!endDate) {
    endDate = document.createElement('input');
    endDate.type = 'date';
    endDate.id = 'end-date';
    endDate.value = '2024-12-31';
    document.body.appendChild(endDate);
  }
}

// 통합 테스트 리포트 생성
function generateIntegrationReport(results) {
  console.log('\n🔬 === 통합 테스트 리포트 ===');
  
  // 카테고리별 결과 정리
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
  
  // 전체 통계
  const totalTests = results.length;
  const totalPassed = results.filter(r => r.passed).length;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  console.log(`\n📊 전체 결과: ${totalPassed}/${totalTests} 통과 (${successRate}%)`);
  
  // HTML 리포트도 생성
  createIntegrationReportHTML(results, categories);
  
  return {
    totalTests,
    totalPassed,
    successRate: parseFloat(successRate),
    results
  };
}

// HTML 통합 리포트 생성
function createIntegrationReportHTML(results, categories) {
  const reportDiv = document.createElement('div');
  reportDiv.id = 'integration-report';
  
  const totalPassed = results.filter(r => r.passed).length;
  const successRate = ((totalPassed / results.length) * 100).toFixed(1);
  
  reportDiv.innerHTML = `
    <div style="position: fixed; bottom: 10px; right: 10px; background: white; border: 2px solid #ddd; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-width: 500px; max-height: 400px; overflow-y: auto;">
      <h3 style="margin: 0 0 15px 0; color: #333;">🔬 통합 테스트 리포트</h3>
      
      <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
        <div><strong>전체:</strong> ${results.length}개 테스트</div>
        <div style="color: green;"><strong>통과:</strong> ${totalPassed}개</div>
        <div style="color: red;"><strong>실패:</strong> ${results.length - totalPassed}개</div>
        <div style="margin-top: 5px; font-size: 16px;"><strong>성공률:</strong> ${successRate}%</div>
      </div>
      
      ${categories.map(category => {
        const categoryResults = results.filter(r => r.category === category);
        const categoryPassed = categoryResults.filter(r => r.passed).length;
        
        return `
          <div style="margin-bottom: 10px;">
            <h4 style="margin: 0 0 5px 0; color: #555;">${category} (${categoryPassed}/${categoryResults.length})</h4>
            ${categoryResults.map(result => `
              <div style="font-size: 13px; margin-left: 10px; color: ${result.passed ? 'green' : 'red'};">
                ${result.passed ? '✅' : '❌'} ${result.test}: ${result.message}
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
      
      <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 5px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
    </div>
  `;
  
  // 기존 리포트 제거
  const existing = document.getElementById('integration-report');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(reportDiv);
}

// 전역 함수로 노출
window.runIntegrationTests = runIntegrationTests;

// 페이지 로드 완료 후 자동 실행 (DEBUG 모드)
if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
  setTimeout(() => {
    console.log('🔧 개발 모드 - 통합 테스트 자동 실행');
    runIntegrationTests();
  }, 5000);
}