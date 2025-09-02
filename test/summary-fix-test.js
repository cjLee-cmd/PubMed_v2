// === 🔧 미리보기 텍스트박스 수정 검증 테스트 ===

/**
 * 미리보기 텍스트박스 표시 문제 수정 검증
 * 이슈: updateSummary 함수가 직접 설정한 값을 덮어쓰는 문제
 */
function testSummaryFix() {
  console.log('🔧 === 미리보기 수정 검증 테스트 시작 ===');
  
  const results = [];
  let testsPassed = 0;
  let totalTests = 0;
  
  try {
    // 1. 테스트 쿼리 준비
    const testQuery = {
      name: 'Summary_Fix_Test',
      keywords: 'FIXED SUMMARY TEST',
      rawKeywords: [
        { groupIndex: 0, operator: 'AND', keywords: ['FIXED'] },
        { groupIndex: 1, operator: 'AND', keywords: ['SUMMARY'] },
        { groupIndex: 2, operator: 'AND', keywords: ['TEST'] }
      ],
      dateFilter: { enabled: false, startDate: '', endDate: '' },
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    // 2. 쿼리 저장
    try {
      saveQueryToLocal(testQuery);
      results.push({
        category: 'Setup',
        test: '테스트 쿼리 저장',
        passed: true,
        message: '저장 완료'
      });
    } catch (error) {
      results.push({
        category: 'Setup',
        test: '테스트 쿼리 저장',
        passed: false,
        message: `저장 실패: ${error.message}`
      });
    }
    
    // 3. UI 초기화
    clearTestUI();
    
    // 4. 미리보기 테스트박스 초기 상태 확인
    const summaryElement = document.getElementById('summary');
    if (!summaryElement) {
      results.push({
        category: 'Environment',
        test: 'Summary 요소 존재',
        passed: false,
        message: 'summary 요소를 찾을 수 없음'
      });
      return results;
    } else {
      results.push({
        category: 'Environment',
        test: 'Summary 요소 존재',
        passed: true,
        message: 'summary 요소 발견됨'
      });
    }
    
    // 5. 쿼리 불러오기 테스트 (키워드 그룹 복원 없음)
    console.log('📋 테스트 1: 키워드 그룹 없이 불러오기');
    try {
      summaryElement.value = ''; // 초기화
      
      window.dialogQueries = [testQuery];
      loadSelectedQuery(0);
      
      // 즉시 확인
      const immediateValue = summaryElement.value;
      
      // 약간 대기 후 확인
      setTimeout(() => {
        const delayedValue = summaryElement.value;
        const testPassed = delayedValue.includes('FIXED') || delayedValue.includes(testQuery.keywords);
        
        results.push({
          category: 'Summary Display',
          test: '키워드 그룹 없이 불러오기',
          passed: testPassed,
          message: testPassed ? 
            `성공: "${delayedValue}"` : 
            `실패: "${delayedValue}" (예상: "${testQuery.keywords}")`
        });
        
        // 6. 쿼리 불러오기 테스트 (키워드 그룹 복원 있음)
        console.log('📋 테스트 2: 키워드 그룹 복원 후 불러오기');
        testWithRestoredGroups(testQuery, results, () => {
          // 모든 테스트 완료 후 결과 표시
          displaySummaryFixResults(results);
        });
        
      }, 500);
      
    } catch (error) {
      results.push({
        category: 'Summary Display',
        test: '키워드 그룹 없이 불러오기',
        passed: false,
        message: `오류: ${error.message}`
      });
    }
    
  } catch (error) {
    console.error('❌ 수정 검증 테스트 실행 오류:', error);
    results.push({
      category: 'Test Execution',
      test: '전체 테스트 실행',
      passed: false,
      message: `실행 오류: ${error.message}`
    });
  }
  
  return results;
}

// 키워드 그룹 복원 후 테스트
function testWithRestoredGroups(testQuery, results, callback) {
  try {
    // UI 초기화
    clearTestUI();
    
    // 키워드 그룹 수동 생성 (복원 시뮬레이션)
    if (typeof createKeywordGroup === 'function') {
      createKeywordGroup();
      
      // 첫 번째 그룹에 값 설정
      const firstGroup = document.querySelector('.keyword-group');
      if (firstGroup) {
        const input = firstGroup.querySelector('input[type="text"]');
        if (input) {
          input.value = 'FIXED SUMMARY TEST';
          
          // 쿼리 불러오기
          const summaryElement = document.getElementById('summary');
          if (summaryElement) {
            summaryElement.value = ''; // 초기화
            
            window.dialogQueries = [testQuery];
            loadSelectedQuery(0);
            
            // 결과 확인
            setTimeout(() => {
              const finalValue = summaryElement.value;
              const hasKeywords = finalValue.includes('FIXED') || finalValue.includes('SUMMARY');
              const notEmpty = finalValue !== '' && finalValue !== '검색 조건이 없습니다.';
              const testPassed = hasKeywords && notEmpty;
              
              results.push({
                category: 'Summary Display',
                test: '키워드 그룹 복원 후 불러오기',
                passed: testPassed,
                message: testPassed ? 
                  `성공: "${finalValue}"` : 
                  `실패: "${finalValue}"`
              });
              
              if (callback) callback();
              
            }, 500);
          }
        }
      }
    } else {
      results.push({
        category: 'Summary Display',
        test: '키워드 그룹 복원 후 불러오기',
        passed: false,
        message: 'createKeywordGroup 함수 없음'
      });
      
      if (callback) callback();
    }
    
  } catch (error) {
    results.push({
      category: 'Summary Display',
      test: '키워드 그룹 복원 후 불러오기',
      passed: false,
      message: `오류: ${error.message}`
    });
    
    if (callback) callback();
  }
}

// UI 초기화
function clearTestUI() {
  try {
    const summaryElement = document.getElementById('summary');
    if (summaryElement) {
      summaryElement.value = '';
    }
    
    const keywordContainer = document.getElementById('keyword-container');
    if (keywordContainer) {
      keywordContainer.innerHTML = '';
    }
    
  } catch (error) {
    console.warn('⚠️ UI 초기화 중 오류:', error);
  }
}

// 결과 표시
function displaySummaryFixResults(results) {
  console.log('\n🔧 === 미리보기 수정 검증 결과 ===');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`📊 전체 결과: ${passedTests}/${totalTests} 통과 (${successRate}%)`);
  
  const categories = [...new Set(results.map(r => r.category))];
  
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
  
  // 최종 결론
  console.log('\n🎯 === 수정 검증 결론 ===');
  if (successRate >= 80) {
    console.log('✅ 미리보기 텍스트박스 수정이 성공적으로 작동합니다!');
  } else {
    console.log('❌ 추가 수정이 필요합니다.');
  }
  
  // HTML 결과 표시
  createSummaryFixHTML(results, passedTests, totalTests, successRate);
}

// HTML 결과 표시
function createSummaryFixHTML(results, passed, total, successRate) {
  const resultDiv = document.createElement('div');
  resultDiv.id = 'summary-fix-test-results';
  
  const statusColor = successRate >= 80 ? '#28a745' : '#dc3545';
  
  resultDiv.innerHTML = `
    <div style="position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: white; border: 3px solid ${statusColor}; padding: 20px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 1000; max-width: 500px;">
      <h3 style="margin: 0 0 15px 0; color: ${statusColor}; text-align: center;">🔧 미리보기 수정 검증</h3>
      
      <div style="margin-bottom: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;">
        <div style="font-size: 18px; font-weight: bold; color: ${statusColor};">${successRate}%</div>
        <div style="margin-top: 3px; color: #666;">성공률</div>
        <div style="margin-top: 8px;">
          <span style="color: green;"><strong>${passed}</strong> 통과</span> / 
          <span style="color: #666;"><strong>${total}</strong> 총 테스트</span>
        </div>
      </div>
      
      <div style="font-size: 12px;">
        ${results.map(result => `
          <div style="margin-bottom: 6px; padding: 5px; border-left: 3px solid ${result.passed ? 'green' : 'red'}; background: ${result.passed ? '#d4edda' : '#f8d7da'}; border-radius: 3px;">
            <strong>${result.test}</strong><br>
            <span style="color: ${result.passed ? 'green' : 'red'}; font-size: 11px;">${result.message}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 15px; padding: 10px; background: ${successRate >= 80 ? '#d4edda' : '#f8d7da'}; border-radius: 6px; text-align: center;">
        <strong>
          ${successRate >= 80 ? '✅ 수정 성공!' : '❌ 추가 수정 필요'}
        </strong>
      </div>
      
      <button onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 12px; background: none; border: none; font-size: 18px; cursor: pointer; color: #999;">&times;</button>
    </div>
  `;
  
  // 기존 결과 제거
  const existing = document.getElementById('summary-fix-test-results');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(resultDiv);
}

// 전역 함수로 노출
window.testSummaryFix = testSummaryFix;

// 페이지 로드 후 자동 실행 (다른 테스트 이후)
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 미리보기 수정 검증 테스트 준비 완료 (25초 후 자동 실행)');
  setTimeout(() => {
    testSummaryFix();
  }, 25000);
});