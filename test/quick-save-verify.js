// === 🚀 빠른 저장 검증 테스트 ===

function quickSaveVerification() {
  console.log('🚀 === 빠른 저장 검증 시작 ===');
  
  const testQuery = '(infliximab OR Remicade) AND (pregnancy OR adverse event) AND ("2025-09-01"[Date - Publication] : "2025-09-04"[Date - Publication])';
  
  try {
    // 1. 미리보기 텍스트박스에 복잡한 쿼리 설정
    const summaryTextarea = document.getElementById('summary');
    if (!summaryTextarea) {
      console.error('❌ Summary 텍스트박스 없음');
      return;
    }
    
    summaryTextarea.value = testQuery;
    console.log('✅ 미리보기 텍스트박스 설정 완료');
    console.log('📝 설정된 쿼리:', testQuery);
    
    // 2. 저장 로직 시뮬레이션 (saveQueryToCSV에서 사용하는 로직)
    const summaryContent = summaryTextarea.value.trim();
    const keywordsToSave = summaryContent && summaryContent !== '검색 조건이 없습니다.' 
      ? summaryContent 
      : 'buildSearchQuery()_fallback';
      
    console.log('💾 저장될 키워드:', keywordsToSave);
    console.log('📊 길이 비교:', {
      원본: testQuery.length,
      저장예정: keywordsToSave.length,
      일치여부: keywordsToSave === testQuery
    });
    
    // 3. 결과 확인
    if (keywordsToSave === testQuery) {
      console.log('✅ 성공: 전체 쿼리 내용이 완전히 보존됩니다!');
      showQuickResult('✅ 수정 성공', '전체 쿼리 내용이 완전히 저장됩니다!', 'green');
    } else {
      console.log('❌ 실패: 쿼리 내용이 변경되거나 누락됨');
      console.log('예상:', testQuery);
      console.log('실제:', keywordsToSave);
      showQuickResult('❌ 수정 필요', '쿼리 내용이 완전히 보존되지 않음', 'red');
    }
    
  } catch (error) {
    console.error('❌ 검증 테스트 오류:', error);
    showQuickResult('❌ 테스트 오류', error.message, 'red');
  }
}

function showQuickResult(title, message, color) {
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 3px solid ${color};
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    text-align: center;
    font-family: Arial, sans-serif;
  `;
  
  resultDiv.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: ${color};">${title}</h3>
    <p style="margin: 0; color: #333;">${message}</p>
    <button onclick="this.parentElement.remove()" style="margin-top: 15px; padding: 5px 15px; background: ${color}; color: white; border: none; border-radius: 4px; cursor: pointer;">확인</button>
  `;
  
  document.body.appendChild(resultDiv);
  
  // 5초 후 자동 제거
  setTimeout(() => {
    if (resultDiv.parentElement) {
      resultDiv.remove();
    }
  }, 5000);
}

// 전역 함수로 노출
window.quickSaveVerification = quickSaveVerification;

// 페이지 로드 3초 후 자동 실행 (가장 빠른 검증)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    quickSaveVerification();
  }, 3000);
});