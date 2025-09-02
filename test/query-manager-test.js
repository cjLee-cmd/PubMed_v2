// === 🧪 쿼리 저장/불러오기 단위 테스트 ===

// 테스트 결과 저장
let testResults = [];

// 테스트 실행 함수
function runQueryManagerTests() {
  console.log('🧪 쿼리 저장/불러오기 단위 테스트 시작...');
  testResults = [];
  
  // 테스트 함수들 실행
  testCollectKeywordGroups();
  testCollectDateFilter();
  testGenerateQueryCSV();
  testParseCSVLine();
  testSafeJSONParse();
  testEscapeCSVField();
  testParseQueryCSV();
  testQuerySaveLoad();
  
  // 테스트 결과 출력
  displayTestResults();
}

// 테스트 결과 기록
function logTestResult(testName, passed, message = '') {
  const result = {
    name: testName,
    passed: passed,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  
  if (passed) {
    console.log(`✅ ${testName}: PASSED ${message ? '- ' + message : ''}`);
  } else {
    console.error(`❌ ${testName}: FAILED ${message ? '- ' + message : ''}`);
  }
}

// 1. collectKeywordGroups 테스트
function testCollectKeywordGroups() {
  const testName = 'collectKeywordGroups';
  
  try {
    // Mock DOM 요소들
    const mockContainer = createMockKeywordContainer();
    document.body.appendChild(mockContainer);
    
    // 실제 함수 호출
    const result = collectKeywordGroups();
    
    // 결과 검증
    const expected = [
      {
        groupIndex: 0,
        operator: 'AND',
        keywords: ['cancer', 'treatment']
      },
      {
        groupIndex: 1,
        operator: 'OR',
        keywords: ['therapy', 'medication']
      }
    ];
    
    const isValid = JSON.stringify(result) === JSON.stringify(expected);
    
    // 정리
    document.body.removeChild(mockContainer);
    
    logTestResult(testName, isValid, `수집된 그룹: ${result.length}개`);
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// 2. collectDateFilter 테스트
function testCollectDateFilter() {
  const testName = 'collectDateFilter';
  
  try {
    // Mock DOM 요소들
    const mockElements = createMockDateFilter();
    
    // 테스트 1: 날짜 필터 비활성화
    mockElements.checkbox.checked = false;
    let result = collectDateFilter();
    let isValid1 = result.enabled === false;
    
    // 테스트 2: 날짜 필터 활성화
    mockElements.checkbox.checked = true;
    mockElements.startDate.value = '2023-01-01';
    mockElements.endDate.value = '2024-12-31';
    
    result = collectDateFilter();
    let isValid2 = result.enabled === true && 
                   result.startDate === '2023-01-01' && 
                   result.endDate === '2024-12-31';
    
    // 정리
    document.body.removeChild(mockElements.container);
    
    logTestResult(testName, isValid1 && isValid2, '활성화/비활성화 모두 정상');
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// 3. generateQueryCSV 테스트
function testGenerateQueryCSV() {
  const testName = 'generateQueryCSV';
  
  try {
    const testQueries = [
      {
        name: '암 연구',
        keywords: 'cancer AND treatment',
        rawKeywords: [{ keywords: ['cancer', 'treatment'] }],
        dateFilter: { enabled: true, startDate: '2023-01-01' },
        createdDate: '2024-01-01T00:00:00.000Z',
        lastUsed: '2024-01-02T00:00:00.000Z'
      }
    ];
    
    const csv = generateQueryCSV(testQueries);
    const lines = csv.split('\n');
    
    // 헤더 검증
    const headers = lines[0].split(',');
    const expectedHeaders = ['QueryName', 'Keywords', 'RawKeywords', 'DateFilter', 'CreatedDate', 'LastUsed'];
    const headersValid = expectedHeaders.every(h => headers.includes(h));
    
    // 데이터 행 검증
    const dataRow = lines[1];
    const hasQueryName = dataRow.includes('"암 연구"');
    const hasKeywords = dataRow.includes('cancer AND treatment');
    
    const isValid = headersValid && hasQueryName && hasKeywords && lines.length === 2;
    
    logTestResult(testName, isValid, `생성된 CSV ${lines.length}줄`);
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// 4. parseCSVLine 테스트
function testParseCSVLine() {
  const testName = 'parseCSVLine';
  
  try {
    // 테스트 케이스들
    const testCases = [
      {
        input: '"field1","field2","field3"',
        expected: ['field1', 'field2', 'field3']
      },
      {
        input: '"field with ""quotes""","normal field"',
        expected: ['field with "quotes"', 'normal field']
      },
      {
        input: 'simple,fields,without,quotes',
        expected: ['simple', 'fields', 'without', 'quotes']
      }
    ];
    
    let allPassed = true;
    
    testCases.forEach((testCase, index) => {
      const result = parseCSVLine(testCase.input);
      const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
      
      if (!passed) {
        allPassed = false;
        console.log(`  케이스 ${index + 1} 실패:`, { 입력: testCase.input, 예상: testCase.expected, 실제: result });
      }
    });
    
    logTestResult(testName, allPassed, `${testCases.length}개 케이스 테스트`);
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// 5. safeJSONParse 테스트
function testSafeJSONParse() {
  const testName = 'safeJSONParse';
  
  try {
    // 정상 JSON
    let result1 = safeJSONParse('{"key": "value"}', {});
    let isValid1 = result1.key === 'value';
    
    // 잘못된 JSON - 기본값 반환
    let result2 = safeJSONParse('invalid json', { default: true });
    let isValid2 = result2.default === true;
    
    // 빈 문자열 - 기본값 반환
    let result3 = safeJSONParse('', { empty: true });
    let isValid3 = result3.empty === true;
    
    const allValid = isValid1 && isValid2 && isValid3;
    
    logTestResult(testName, allValid, '정상/오류/빈값 모두 처리');
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// 6. escapeCSVField 테스트
function testEscapeCSVField() {
  const testName = 'escapeCSVField';
  
  try {
    // 테스트 케이스들
    const testCases = [
      { input: 'normal text', expected: 'normal text' },
      { input: 'text with "quotes"', expected: 'text with ""quotes""' },
      { input: '', expected: '' },
      { input: null, expected: '' },
      { input: undefined, expected: '' }
    ];
    
    let allPassed = true;
    
    testCases.forEach((testCase, index) => {
      const result = escapeCSVField(testCase.input);
      const passed = result === testCase.expected;
      
      if (!passed) {
        allPassed = false;
        console.log(`  케이스 ${index + 1} 실패:`, { 입력: testCase.input, 예상: testCase.expected, 실제: result });
      }
    });
    
    logTestResult(testName, allPassed, `${testCases.length}개 케이스 테스트`);
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// 7. parseQueryCSV 테스트
function testParseQueryCSV() {
  const testName = 'parseQueryCSV';
  
  try {
    const testCSV = `QueryName,Keywords,RawKeywords,DateFilter,CreatedDate,LastUsed
"테스트 쿼리","cancer AND treatment","[{\\"keywords\\": [\\"cancer\\", \\"treatment\\"]}]","{\\"enabled\\": true}","2024-01-01T00:00:00.000Z","2024-01-02T00:00:00.000Z"`;
    
    const queries = parseQueryCSV(testCSV);
    
    const isValid = queries.length === 1 &&
                    queries[0].name === '테스트 쿼리' &&
                    queries[0].keywords === 'cancer AND treatment' &&
                    Array.isArray(queries[0].rawKeywords) &&
                    queries[0].dateFilter.enabled === true;
    
    logTestResult(testName, isValid, `파싱된 쿼리: ${queries.length}개`);
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// 8. 전체 저장/불러오기 플로우 테스트
function testQuerySaveLoad() {
  const testName = 'queryNativeFlow';
  
  try {
    // Mock DOM 환경 생성
    const mockEnv = createMockEnvironment();
    
    // 1. 키워드 그룹 데이터 수집
    const keywordGroups = collectKeywordGroups();
    
    // 2. 날짜 필터 데이터 수집
    const dateFilter = collectDateFilter();
    
    // 3. 쿼리 객체 생성
    const testQuery = {
      name: '통합 테스트',
      keywords: 'test AND query',
      rawKeywords: keywordGroups,
      dateFilter: dateFilter,
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    // 4. CSV 생성
    const csv = generateQueryCSV([testQuery]);
    
    // 5. CSV 파싱
    const parsedQueries = parseQueryCSV(csv);
    
    // 6. 데이터 무결성 검증
    const isValid = parsedQueries.length === 1 &&
                    parsedQueries[0].name === testQuery.name &&
                    parsedQueries[0].keywords === testQuery.keywords;
    
    // 정리
    document.body.removeChild(mockEnv.container);
    
    logTestResult(testName, isValid, '저장→파싱→복원 플로우');
    
  } catch (error) {
    logTestResult(testName, false, error.message);
  }
}

// Mock DOM 요소 생성 함수들
function createMockKeywordContainer() {
  const container = document.createElement('div');
  container.id = 'keyword-container';
  
  // 첫 번째 그룹
  const group1 = document.createElement('div');
  group1.className = 'keyword-group';
  
  const input1 = document.createElement('input');
  input1.className = 'keyword-input';
  input1.value = 'cancer';
  
  const input2 = document.createElement('input');
  input2.className = 'keyword-input';
  input2.value = 'treatment';
  
  const operator1 = document.createElement('select');
  operator1.className = 'group-operator';
  operator1.value = 'AND';
  
  group1.appendChild(input1);
  group1.appendChild(input2);
  group1.appendChild(operator1);
  
  // 두 번째 그룹
  const group2 = document.createElement('div');
  group2.className = 'keyword-group';
  
  const input3 = document.createElement('input');
  input3.className = 'keyword-input';
  input3.value = 'therapy';
  
  const input4 = document.createElement('input');
  input4.className = 'keyword-input';
  input4.value = 'medication';
  
  const operator2 = document.createElement('select');
  operator2.className = 'group-operator';
  operator2.value = 'OR';
  
  group2.appendChild(input3);
  group2.appendChild(input4);
  group2.appendChild(operator2);
  
  container.appendChild(group1);
  container.appendChild(group2);
  
  return container;
}

function createMockDateFilter() {
  const container = document.createElement('div');
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'date-filter-enabled';
  
  const startDate = document.createElement('input');
  startDate.type = 'date';
  startDate.id = 'start-date';
  
  const endDate = document.createElement('input');
  endDate.type = 'date';
  endDate.id = 'end-date';
  
  container.appendChild(checkbox);
  container.appendChild(startDate);
  container.appendChild(endDate);
  document.body.appendChild(container);
  
  return { container, checkbox, startDate, endDate };
}

function createMockEnvironment() {
  const container = document.createElement('div');
  
  // 키워드 컨테이너
  const keywordContainer = createMockKeywordContainer();
  container.appendChild(keywordContainer);
  
  // 날짜 필터
  const dateElements = createMockDateFilter();
  container.appendChild(dateElements.container);
  
  document.body.appendChild(container);
  
  return { container };
}

// 테스트 결과 출력
function displayTestResults() {
  console.log('\n🧪 === 쿼리 저장/불러오기 테스트 결과 ===');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`📊 전체 테스트: ${totalTests}개`);
  console.log(`✅ 통과: ${passedTests}개`);
  console.log(`❌ 실패: ${failedTests}개`);
  console.log(`📈 성공률: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ 실패한 테스트들:');
    testResults.filter(r => !r.passed).forEach(result => {
      console.log(`  - ${result.name}: ${result.message}`);
    });
  }
  
  // HTML 결과도 생성
  createTestResultHTML();
  
  return { totalTests, passedTests, failedTests };
}

// HTML 테스트 결과 생성
function createTestResultHTML() {
  const resultDiv = document.createElement('div');
  resultDiv.id = 'test-results';
  resultDiv.innerHTML = `
    <div style="position: fixed; top: 10px; right: 10px; background: white; border: 2px solid #ddd; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-width: 400px;">
      <h3 style="margin: 0 0 10px 0; color: #333;">🧪 테스트 결과</h3>
      <div style="font-size: 14px;">
        <div><strong>전체:</strong> ${testResults.length}개</div>
        <div style="color: green;"><strong>통과:</strong> ${testResults.filter(r => r.passed).length}개</div>
        <div style="color: red;"><strong>실패:</strong> ${testResults.filter(r => !r.passed).length}개</div>
        <div style="margin-top: 10px;">
          <strong>성공률:</strong> ${((testResults.filter(r => r.passed).length / testResults.length) * 100).toFixed(1)}%
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 5px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
    </div>
  `;
  
  // 기존 결과 제거
  const existing = document.getElementById('test-results');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(resultDiv);
}

// 자동 테스트 실행 (개발 모드에서)
if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
  console.log('🔧 개발 모드 - 3초 후 자동 테스트 실행');
  setTimeout(() => {
    if (typeof collectKeywordGroups === 'function') {
      runQueryManagerTests();
    }
  }, 3000);
}

// 전역 함수로 노출
window.runQueryManagerTests = runQueryManagerTests;