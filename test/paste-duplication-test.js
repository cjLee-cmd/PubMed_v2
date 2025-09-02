// === 📋 붙여넣기 중복 문제 테스트 ===

/**
 * 사용자 문제: 복잡한 쿼리 붙여넣기 시 중복된 내용이 저장되는 문제
 * 예시: 원본 -> 중복 내용으로 변환되는 문제 해결 검증
 */
function testPasteDuplication() {
  console.log('📋 === 붙여넣기 중복 문제 테스트 시작 ===');
  
  const results = [];
  
  try {
    // 테스트 케이스: 사용자가 신고한 복잡한 쿼리
    const testQueries = [
      {
        name: '사용자_신고_케이스',
        original: '(infliximab OR Remicade) AND (pregnancy OR adverse evnet) AND ("2025-09-01"[Date - Publication] : "2025-09-04"[Date - Publication])',
        description: '사용자가 신고한 실제 케이스'
      },
      {
        name: '복잡한_OR_조건',
        original: '(diabetes OR "diabetes mellitus" OR DM) AND (treatment OR therapy) AND ("2024-01-01"[Date - Publication] : "2024-12-31"[Date - Publication])',
        description: '복잡한 OR 조건과 날짜 필터'
      },
      {
        name: '중첩_괄호_쿼리',
        original: '((cancer OR tumor) AND (therapy OR treatment)) AND (clinical[Title/Abstract] OR trial[Title/Abstract])',
        description: '중첩된 괄호가 있는 쿼리'
      }
    ];
    
    console.log(`🧪 ${testQueries.length}개 케이스로 붙여넣기 테스트 진행`);
    
    // 각 쿼리에 대해 붙여넣기 테스트
    testQueries.forEach((testCase, index) => {
      console.log(`\n🔍 테스트 ${index + 1}: ${testCase.name}`);
      console.log(`📝 설명: ${testCase.description}`);
      console.log(`📄 원본: ${testCase.original}`);
      
      testSinglePasteCase(testCase, results);
    });
    
    // 결과 표시
    setTimeout(() => {
      displayPasteTestResults(results);
    }, 500);
    
  } catch (error) {
    console.error('❌ 붙여넣기 테스트 실행 오류:', error);
    results.push({
      category: 'Test Execution',
      test: '전체 테스트 실행',
      passed: false,
      message: `실행 오류: ${error.message}`
    });
  }
  
  return results;
}

// 개별 붙여넣기 케이스 테스트
function testSinglePasteCase(testCase, results) {
  try {
    // 1. 환경 초기화
    const summaryTextarea = document.getElementById('summary');
    if (!summaryTextarea) {
      results.push({
        category: testCase.name,
        test: 'Summary 요소 존재',
        passed: false,
        message: 'summary 요소를 찾을 수 없음'
      });
      return;
    }
    
    // 미리보기 텍스트박스 초기화
    summaryTextarea.value = '';
    
    // 키워드 컨테이너 초기화
    const keywordContainer = document.getElementById('keyword-container');
    if (keywordContainer) {
      keywordContainer.innerHTML = '';
    }
    
    results.push({
      category: testCase.name,
      test: '환경 초기화',
      passed: true,
      message: '초기화 완료'
    });
    
    // 2. 클립보드 시뮬레이션 (parseSummaryAndCreateGroups 직접 호출)
    try {
      console.log(`📋 붙여넣기 시뮬레이션: ${testCase.original}`);
      
      // parseSummaryAndCreateGroups 함수 호출 (실제 붙여넣기 로직)
      if (typeof parseSummaryAndCreateGroups === 'function') {
        parseSummaryAndCreateGroups(testCase.original);
        
        results.push({
          category: testCase.name,
          test: 'parseSummaryAndCreateGroups 실행',
          passed: true,
          message: '파싱 및 그룹 생성 완료'
        });
      } else {
        results.push({
          category: testCase.name,
          test: 'parseSummaryAndCreateGroups 실행',
          passed: false,
          message: 'parseSummaryAndCreateGroups 함수를 찾을 수 없음'
        });
        return;
      }
      
      // 3. 결과 검증
      setTimeout(() => {
        const finalValue = summaryTextarea.value;
        const originalLength = testCase.original.length;
        const finalLength = finalValue.length;
        
        console.log(`📊 결과 분석:`, {
          원본: testCase.original,
          결과: finalValue,
          원본길이: originalLength,
          결과길이: finalLength
        });
        
        // 중복 여부 확인
        const hasDuplication = finalLength > originalLength * 1.5; // 50% 이상 길어지면 중복 의심
        const exactMatch = finalValue.trim() === testCase.original.trim();
        
        results.push({
          category: testCase.name,
          test: '중복 방지 확인',
          passed: !hasDuplication,
          message: hasDuplication ? 
            `중복 발생 (원본: ${originalLength}자 → 결과: ${finalLength}자)` : 
            `중복 없음 (${finalLength}자)`
        });
        
        results.push({
          category: testCase.name,
          test: '내용 정확성',
          passed: exactMatch,
          message: exactMatch ? 
            '원본과 정확히 일치' : 
            `불일치: "${finalValue.substring(0, 100)}..."`
        });
        
        // 키워드 그룹 생성 확인
        const keywordGroups = document.querySelectorAll('.keyword-group');
        const hasGroups = keywordGroups.length > 0;
        
        results.push({
          category: testCase.name,
          test: '키워드 그룹 생성',
          passed: hasGroups,
          message: hasGroups ? 
            `${keywordGroups.length}개 그룹 생성됨` : 
            '키워드 그룹 생성 안됨'
        });
        
      }, 100);
      
    } catch (pasteError) {
      results.push({
        category: testCase.name,
        test: '붙여넣기 실행',
        passed: false,
        message: `붙여넣기 오류: ${pasteError.message}`
      });
    }
    
  } catch (error) {
    results.push({
      category: testCase.name,
      test: '전체 테스트',
      passed: false,
      message: `테스트 오류: ${error.message}`
    });
  }
}

// 테스트 결과 표시
function displayPasteTestResults(results) {
  console.log('\n📋 === 붙여넣기 중복 테스트 결과 ===');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
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
  
  // HTML 결과 표시
  createPasteTestHTML(results, passedTests, totalTests, successRate);
  
  // 최종 결론
  console.log('\n🎯 === 붙여넣기 테스트 결론 ===');
  const duplicationTests = results.filter(r => r.test === '중복 방지 확인');
  const noDuplicationCount = duplicationTests.filter(r => r.passed).length;
  
  if (noDuplicationCount === duplicationTests.length && duplicationTests.length > 0) {
    console.log('✅ 붙여넣기 중복 문제가 해결되었습니다!');
  } else {
    console.log('❌ 아직 중복 문제가 남아있습니다. 추가 수정이 필요합니다.');
  }
}

// HTML 결과 표시
function createPasteTestHTML(results, passed, total, successRate) {
  const resultDiv = document.createElement('div');
  resultDiv.id = 'paste-duplication-test-results';
  
  const statusColor = successRate >= 75 ? '#28a745' : '#dc3545';
  
  resultDiv.innerHTML = `
    <div style="position: fixed; top: 60px; left: 10px; background: white; border: 3px solid ${statusColor}; padding: 18px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 1000; max-width: 450px; max-height: 65vh; overflow-y: auto;">
      <h3 style="margin: 0 0 12px 0; color: ${statusColor}; text-align: center;">📋 붙여넣기 중복 테스트</h3>
      
      <div style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; color: ${statusColor};">${successRate}%</div>
        <div style="margin-top: 2px; color: #666; font-size: 12px;">성공률</div>
        <div style="margin-top: 6px; font-size: 13px;">
          <span style="color: green;"><strong>${passed}</strong> 통과</span> / 
          <span style="color: #666;"><strong>${total}</strong> 총 테스트</span>
        </div>
      </div>
      
      <div style="font-size: 11px; max-height: 300px; overflow-y: auto;">
        ${results.map(result => `
          <div style="margin-bottom: 6px; padding: 4px; border-left: 3px solid ${result.passed ? 'green' : 'red'}; background: ${result.passed ? '#d4edda' : '#f8d7da'}; border-radius: 3px;">
            <strong style="font-size: 10px; color: #666;">[${result.category}]</strong><br>
            <strong style="font-size: 11px;">${result.test}</strong><br>
            <span style="color: ${result.passed ? 'green' : 'red'}; font-size: 10px;">${result.message.length > 60 ? result.message.substring(0, 60) + '...' : result.message}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 12px; padding: 8px; background: ${successRate >= 75 ? '#d4edda' : '#f8d7da'}; border-radius: 4px; text-align: center; font-size: 12px;">
        <strong>
          ${successRate >= 75 ? '✅ 중복 문제 해결!' : '❌ 추가 수정 필요'}
        </strong>
      </div>
      
      <button onclick="this.parentElement.remove()" style="position: absolute; top: 6px; right: 10px; background: none; border: none; font-size: 16px; cursor: pointer; color: #999;">&times;</button>
    </div>
  `;
  
  // 기존 결과 제거
  const existing = document.getElementById('paste-duplication-test-results');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(resultDiv);
}

// 전역 함수로 노출
window.testPasteDuplication = testPasteDuplication;

// 페이지 로드 후 자동 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('📋 붙여넣기 중복 테스트 준비 완료 (35초 후 자동 실행)');
  setTimeout(() => {
    testPasteDuplication();
  }, 35000);
});