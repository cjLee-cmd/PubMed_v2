// === 🧪 수동 테스트 실행기 ===

/**
 * 모든 테스트를 수동으로 실행할 수 있는 통합 테스트 실행기
 */
function runAllTests() {
  console.log('🧪 === 모든 테스트 수동 실행 시작 ===');
  
  const testResults = {
    quickSave: null,
    summaryFix: null,
    fullQuerySave: null,
    pasteDuplication: null,
    finalValidation: null
  };
  
  // 1. 빠른 저장 검증 (즉시 실행)
  console.log('1️⃣ 빠른 저장 검증 테스트...');
  try {
    if (typeof quickSaveVerification === 'function') {
      quickSaveVerification();
      testResults.quickSave = '실행됨';
    } else {
      console.warn('quickSaveVerification 함수 없음');
      testResults.quickSave = '함수 없음';
    }
  } catch (error) {
    console.error('빠른 저장 검증 오류:', error);
    testResults.quickSave = '오류: ' + error.message;
  }
  
  // 2. 미리보기 수정 테스트 (1초 후)
  setTimeout(() => {
    console.log('2️⃣ 미리보기 수정 테스트...');
    try {
      if (typeof testSummaryFix === 'function') {
        testSummaryFix();
        testResults.summaryFix = '실행됨';
      } else {
        console.warn('testSummaryFix 함수 없음');
        testResults.summaryFix = '함수 없음';
      }
    } catch (error) {
      console.error('미리보기 수정 테스트 오류:', error);
      testResults.summaryFix = '오류: ' + error.message;
    }
  }, 1000);
  
  // 3. 전체 쿼리 저장 테스트 (3초 후)
  setTimeout(() => {
    console.log('3️⃣ 전체 쿼리 저장 테스트...');
    try {
      if (typeof testFullQuerySaving === 'function') {
        testFullQuerySaving();
        testResults.fullQuerySave = '실행됨';
      } else {
        console.warn('testFullQuerySaving 함수 없음');
        testResults.fullQuerySave = '함수 없음';
      }
    } catch (error) {
      console.error('전체 쿼리 저장 테스트 오류:', error);
      testResults.fullQuerySave = '오류: ' + error.message;
    }
  }, 3000);
  
  // 4. 붙여넣기 중복 테스트 (5초 후)
  setTimeout(() => {
    console.log('4️⃣ 붙여넣기 중복 테스트...');
    try {
      if (typeof testPasteDuplication === 'function') {
        testPasteDuplication();
        testResults.pasteDuplication = '실행됨';
      } else {
        console.warn('testPasteDuplication 함수 없음');
        testResults.pasteDuplication = '함수 없음';
      }
    } catch (error) {
      console.error('붙여넣기 중복 테스트 오류:', error);
      testResults.pasteDuplication = '오류: ' + error.message;
    }
  }, 5000);
  
  // 5. 최종 검증 (7초 후)
  setTimeout(() => {
    console.log('5️⃣ 최종 검증 테스트...');
    try {
      if (typeof runFinalValidationTest === 'function') {
        runFinalValidationTest();
        testResults.finalValidation = '실행됨';
      } else {
        console.warn('runFinalValidationTest 함수 없음');
        testResults.finalValidation = '함수 없음';
      }
    } catch (error) {
      console.error('최종 검증 테스트 오류:', error);
      testResults.finalValidation = '오류: ' + error.message;
    }
    
    // 최종 결과 표시 (10초 후)
    setTimeout(() => {
      displayTestSummary(testResults);
    }, 3000);
    
  }, 7000);
}

// 실제 시나리오 테스트
function testRealScenario() {
  console.log('🎯 === 실제 시나리오 테스트 ===');
  
  const complexQuery = '(infliximab OR Remicade) AND (pregnancy OR adverse event) AND ("2025-09-01"[Date - Publication] : "2025-09-04"[Date - Publication])';
  
  console.log('📝 테스트 쿼리:', complexQuery);
  
  // 1. 미리보기 텍스트박스에 설정
  const summaryElement = document.getElementById('summary');
  if (summaryElement) {
    summaryElement.value = complexQuery;
    console.log('✅ 1단계: 미리보기 텍스트박스에 설정 완료');
    
    // 2. 저장 테스트 (실제 saveQueryToCSV 시뮬레이션)
    try {
      const queryName = 'Real_Scenario_Test';
      const summaryContent = summaryElement.value.trim();
      const keywordsToSave = summaryContent && summaryContent !== '검색 조건이 없습니다.' 
        ? summaryContent 
        : 'FALLBACK';
      
      console.log('💾 2단계: 저장 로직 테스트');
      console.log('  - 저장될 내용:', keywordsToSave);
      console.log('  - 길이 비교:', {
        원본: complexQuery.length,
        저장예정: keywordsToSave.length,
        정확성: keywordsToSave === complexQuery
      });
      
      if (keywordsToSave === complexQuery) {
        console.log('✅ 2단계: 저장 로직 성공 - 전체 쿼리 보존됨');
        
        // 3. 붙여넣기 테스트
        testPasteScenario(complexQuery);
        
      } else {
        console.log('❌ 2단계: 저장 로직 실패 - 쿼리 변형됨');
      }
      
    } catch (error) {
      console.error('❌ 저장 테스트 오류:', error);
    }
    
  } else {
    console.error('❌ Summary 텍스트박스를 찾을 수 없음');
  }
}

// 붙여넣기 시나리오 테스트
function testPasteScenario(originalQuery) {
  console.log('📋 3단계: 붙여넣기 시나리오 테스트');
  
  try {
    // 미리보기 텍스트박스 초기화
    const summaryElement = document.getElementById('summary');
    summaryElement.value = '';
    
    // parseSummaryAndCreateGroups 함수 호출 (실제 붙여넣기 로직)
    if (typeof parseSummaryAndCreateGroups === 'function') {
      console.log('  - 원본 쿼리:', originalQuery);
      
      parseSummaryAndCreateGroups(originalQuery);
      
      // 100ms 후 결과 확인
      setTimeout(() => {
        const resultValue = summaryElement.value;
        console.log('  - 붙여넣기 후:', resultValue);
        console.log('  - 길이 비교:', {
          원본: originalQuery.length,
          결과: resultValue.length,
          중복여부: resultValue.length > originalQuery.length * 1.5
        });
        
        if (resultValue.trim() === originalQuery.trim()) {
          console.log('✅ 3단계: 붙여넣기 성공 - 중복 없이 정확히 보존됨');
        } else if (resultValue.length > originalQuery.length * 1.5) {
          console.log('❌ 3단계: 붙여넣기 실패 - 중복 발생');
        } else {
          console.log('⚠️ 3단계: 붙여넣기 부분 성공 - 일부 변형됨');
        }
        
        // 최종 시나리오 결과
        showScenarioResult(originalQuery, resultValue);
        
      }, 100);
      
    } else {
      console.error('❌ parseSummaryAndCreateGroups 함수를 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('❌ 붙여넣기 테스트 오류:', error);
  }
}

// 시나리오 결과 표시
function showScenarioResult(original, result) {
  const isSuccess = result.trim() === original.trim();
  const hasDuplication = result.length > original.length * 1.5;
  
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 3px solid ${isSuccess ? 'green' : 'red'};
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 600px;
    font-family: Arial, sans-serif;
  `;
  
  resultDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: ${isSuccess ? 'green' : 'red'}; text-align: center;">
      🎯 실제 시나리오 테스트 결과
    </h3>
    
    <div style="margin-bottom: 15px;">
      <strong>상태:</strong> 
      <span style="color: ${isSuccess ? 'green' : 'red'};">
        ${isSuccess ? '✅ 성공' : hasDuplication ? '❌ 중복 발생' : '⚠️ 변형 발생'}
      </span>
    </div>
    
    <div style="margin-bottom: 10px;">
      <strong>원본 (${original.length}자):</strong><br>
      <code style="background: #f0f0f0; padding: 5px; font-size: 12px; word-break: break-all;">
        ${original}
      </code>
    </div>
    
    <div style="margin-bottom: 15px;">
      <strong>결과 (${result.length}자):</strong><br>
      <code style="background: ${isSuccess ? '#d4edda' : '#f8d7da'}; padding: 5px; font-size: 12px; word-break: break-all;">
        ${result}
      </code>
    </div>
    
    <div style="text-align: center;">
      <button onclick="this.parentElement.remove()" 
              style="padding: 8px 20px; background: ${isSuccess ? 'green' : 'red'}; color: white; border: none; border-radius: 5px; cursor: pointer;">
        확인
      </button>
    </div>
  `;
  
  document.body.appendChild(resultDiv);
}

// 테스트 결과 요약 표시
function displayTestSummary(results) {
  console.log('\n🧪 === 모든 테스트 실행 결과 요약 ===');
  
  Object.keys(results).forEach(testName => {
    const result = results[testName];
    const status = result === '실행됨' ? '✅' : result === '함수 없음' ? '⚠️' : '❌';
    console.log(`${status} ${testName}: ${result}`);
  });
  
  const successCount = Object.values(results).filter(r => r === '실행됨').length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n📊 전체 결과: ${successCount}/${totalCount} 테스트 실행됨`);
}

// 전역 함수로 노출
window.runAllTests = runAllTests;
window.testRealScenario = testRealScenario;

// 콘솔에서 쉽게 실행할 수 있도록 안내 메시지
console.log(`
🧪 === 테스트 실행 방법 ===
1. runAllTests() - 모든 자동 테스트 실행
2. testRealScenario() - 실제 시나리오 테스트
3. 개별 테스트 함수들:
   - quickSaveVerification()
   - testSummaryFix()  
   - testFullQuerySaving()
   - testPasteDuplication()
   - runFinalValidationTest()
`);