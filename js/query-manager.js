// === 🔖 쿼리 저장/불러오기 시스템 ===

// 로컬 Query.csv 파일 키
const LOCAL_QUERY_FILE_KEY = 'pubmed_query_csv_data';

// 로컬 Query.csv 초기화
function initializeLocalQueryFile() {
  const existingData = localStorage.getItem(LOCAL_QUERY_FILE_KEY);
  if (!existingData) {
    const headers = 'QueryName,Keywords,RawKeywords,DateFilter,CreatedDate,LastUsed\n';
    localStorage.setItem(LOCAL_QUERY_FILE_KEY, headers);
  }
}

// 쿼리 저장 함수 (로컬 파일에 추가)
function saveQueryToCSV() {
  try {
    const queryName = prompt('쿼리 이름을 입력하세요:', '새 검색 쿼리');
    if (!queryName || queryName.trim() === '') {
      showToast('⚠️ 쿼리 이름을 입력해주세요.');
      return;
    }
    
    // 로컬 파일 초기화 (필요시)
    initializeLocalQueryFile();
    
    // 중복 이름 체크
    const existingQueries = loadLocalQueries();
    const duplicateName = existingQueries.some(q => q.name === queryName.trim());
    
    if (duplicateName) {
      const overwrite = confirm(`'${queryName}' 이름의 쿼리가 이미 존재합니다. 덮어쓰시겠습니까?`);
      if (!overwrite) {
        showToast('⚠️ 저장이 취소되었습니다.');
        return;
      }
    }
    
    // 현재 검색 조건 수집 (미리보기 텍스트박스 우선)
    const summaryTextarea = document.getElementById('summary');
    const summaryContent = summaryTextarea ? summaryTextarea.value.trim() : '';
    
    // 미리보기 텍스트박스에 내용이 있으면 우선 사용, 없으면 buildSearchQuery() 사용
    const keywordsToSave = summaryContent && summaryContent !== '검색 조건이 없습니다.' 
      ? summaryContent 
      : buildSearchQuery();
    
    const currentQuery = {
      name: queryName.trim(),
      keywords: keywordsToSave,
      rawKeywords: collectKeywordGroups(),
      dateFilter: collectDateFilter(),
      createdDate: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    // Query saved successfully
    
    // 로컬 Query.csv 파일에 저장
    saveQueryToLocal(currentQuery);
    
    showToast(`✅ 쿼리 '${queryName}' 로컬 파일에 저장 완료!`);
    
    // Query stored locally
    
  } catch (error) {
    console.error('❌ 쿼리 저장 실패:', error);
    showToast('❌ 쿼리 저장에 실패했습니다.');
  }
}

// 키워드 그룹 정보 수집 (실제 DOM 구조에 맞촌)
function collectKeywordGroups() {
  const groups = document.querySelectorAll('.keyword-group');
  const groupData = [];
  
  groups.forEach((group, index) => {
    const input = group.querySelector('input[type="text"]');
    const andBtn = group.querySelector('button');
    const orBtn = group.querySelectorAll('button')[3]; // AND, OR 버튼 순서
    
    if (input && input.value.trim()) {
      let operator = 'AND'; // 기본값
      
      // 활성화된 버튼 확인
      if (andBtn && andBtn.classList.contains('active')) {
        operator = 'AND';
      } else if (orBtn && orBtn.classList.contains('active')) {
        operator = 'OR';
      }
      
      groupData.push({
        groupIndex: index,
        operator: operator,
        keywords: [input.value.trim()]
      });
    }
  });
  
  return groupData;
}

// 날짜 필터 정보 수집
function collectDateFilter() {
  const dateEnabled = document.getElementById('date-filter-enabled')?.checked || false;
  
  if (!dateEnabled) {
    return { enabled: false };
  }
  
  const startDate = document.getElementById('start-date')?.value || '';
  const endDate = document.getElementById('end-date')?.value || '';
  
  return {
    enabled: true,
    startDate: startDate,
    endDate: endDate
  };
}

// CSV 형식으로 변환
function generateQueryCSV(queries) {
  const headers = ['QueryName', 'Keywords', 'RawKeywords', 'DateFilter', 'CreatedDate', 'LastUsed'];
  
  const csvRows = [headers.join(',')];
  
  queries.forEach(query => {
    const row = [
      `"${escapeCSVField(query.name)}"`,
      `"${escapeCSVField(query.keywords)}"`,
      `"${escapeCSVField(JSON.stringify(query.rawKeywords))}"`,
      `"${escapeCSVField(JSON.stringify(query.dateFilter))}"`,
      `"${escapeCSVField(query.createdDate)}"`,
      `"${escapeCSVField(query.lastUsed)}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

// CSV 필드 이스케이프 처리
function escapeCSVField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // 따옴표를 두 개로 이스케이프
  return str.replace(/"/g, '""');
}

// CSV 파일 다운로드
function downloadCSV(content, filename) {
  try {
    const blob = new Blob(['\uFEFF' + content], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    // CSV download completed
    
  } catch (error) {
    console.error('❌ CSV 다운로드 실패:', error);
    throw error;
  }
}

// 로컬 파일에 쿼리 저장
function saveQueryToLocal(newQuery) {
  try {
    // 기존 쿼리들 로드
    const existingQueries = loadLocalQueries();
    
    // 중복 이름이 있으면 제거 (덮어쓰기)
    const filteredQueries = existingQueries.filter(q => q.name !== newQuery.name);
    
    // 새 쿼리 추가
    filteredQueries.push(newQuery);
    
    // 생성 날짜순으로 정렬 (최신순)
    filteredQueries.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    
    // CSV 형식으로 변환
    const csvContent = generateQueryCSV(filteredQueries);
    
    // 로컬스토리지에 저장
    localStorage.setItem(LOCAL_QUERY_FILE_KEY, csvContent);
    
    // Local CSV updated
    
  } catch (error) {
    console.error('❌ 로컬 파일 저장 실패:', error);
    throw new Error('로컬 파일에 저장할 수 없습니다.');
  }
}

// 로컬 파일에서 쿼리 로드
function loadLocalQueries() {
  try {
    const csvContent = localStorage.getItem(LOCAL_QUERY_FILE_KEY);
    
    if (!csvContent) {
      return [];
    }
    
    // CSV 파싱
    const queries = parseQueryCSV(csvContent);
    
    // CSV loaded successfully
    
    return queries;
    
  } catch (error) {
    console.error('❌ 로컬 파일 로드 실패:', error);
    return [];
  }
}

// 쿼리 불러오기 함수 (로컬 파일에서)
function loadQueryFromCSV() {
  try {
    // 로컬 파일에서 쿼리 로드
    const queries = loadLocalQueries();
    
    if (queries.length === 0) {
      showToast('⚠️ 저장된 쿼리가 없습니다. 먼저 쿼리를 저장해주세요.');
      return;
    }
    
    // 쿼리 선택 대화상자 표시
    showQuerySelectionDialog(queries);
    
    // Query list loaded
    
  } catch (error) {
    console.error('❌ 쿼리 불러오기 실패:', error);
    showToast('❌ 저장된 쿼리를 불러올 수 없습니다.');
  }
}

// CSV 파싱 함수
function parseQueryCSV(csvContent) {
  try {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      throw new Error('CSV 파일이 비어있거나 헤더가 없습니다.');
    }
    
    const headers = parseCSVLine(lines[0]);
    const expectedHeaders = ['QueryName', 'Keywords', 'RawKeywords', 'DateFilter', 'CreatedDate', 'LastUsed'];
    
    // 헤더 검증
    const hasValidHeaders = expectedHeaders.every(header => 
      headers.some(h => h.toLowerCase() === header.toLowerCase())
    );
    
    if (!hasValidHeaders) {
      console.warn('⚠️ CSV 헤더 불일치, 기본 파싱 시도');
    }
    
    const queries = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length < 6) {
          console.warn(`⚠️ 라인 ${i + 1}: 필드 부족, 건너뜀`);
          continue;
        }
        
        const query = {
          name: values[0] || `쿼리 ${i}`,
          keywords: values[1] || '',
          rawKeywords: safeJSONParse(values[2], []),
          dateFilter: safeJSONParse(values[3], { enabled: false }),
          createdDate: values[4] || new Date().toISOString(),
          lastUsed: values[5] || new Date().toISOString()
        };
        
        queries.push(query);
        
      } catch (lineError) {
        console.warn(`⚠️ 라인 ${i + 1} 파싱 실패:`, lineError.message);
      }
    }
    
    if (DEBUG_MODE) {
      console.log(`📋 ${queries.length}개 쿼리 파싱 완료:`, queries);
    }
    
    return queries;
    
  } catch (error) {
    console.error('❌ CSV 파싱 전체 실패:', error);
    throw error;
  }
}

// CSV 라인 파싱 (따옴표 처리)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 이스케이프된 따옴표
        current += '"';
        i += 2;
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  result.push(current);
  return result;
}

// 안전한 JSON 파싱
function safeJSONParse(jsonString, defaultValue) {
  try {
    if (!jsonString || jsonString.trim() === '') {
      return defaultValue;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('⚠️ JSON 파싱 실패:', jsonString, error.message);
    return defaultValue;
  }
}

// 쿼리 선택 대화상자 표시
function showQuerySelectionDialog(queries) {
  // 기존 대화상자 제거
  const existingDialog = document.querySelector('.query-selection-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }
  
  // 대화상자 생성
  const dialog = document.createElement('div');
  dialog.className = 'query-selection-dialog';
  dialog.innerHTML = `
    <div class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>🔖 저장된 쿼리 선택</h3>
          <button class="dialog-close" onclick="closeQueryDialog()">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="query-list">
            ${queries.map((query, index) => `
              <div class="query-item" data-index="${index}">
                <div class="query-info">
                  <div class="query-name">${escapeHTML(query.name)}</div>
                  <div class="query-preview">${escapeHTML(query.keywords.substring(0, 100))}${query.keywords.length > 100 ? '...' : ''}</div>
                  <div class="query-date">생성: ${formatDate(query.createdDate)} | 최근사용: ${formatDate(query.lastUsed)}</div>
                </div>
                <div class="query-actions">
                  <button class="load-query-btn" onclick="loadSelectedQuery(${index})">
                    📂 불러오기
                  </button>
                  <button class="delete-query-btn" onclick="deleteSelectedQuery(${index})" title="쿼리 삭제">
                    🗑️
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 스타일 추가
  if (!document.querySelector('#query-dialog-styles')) {
    const styles = document.createElement('style');
    styles.id = 'query-dialog-styles';
    styles.textContent = `
      .query-selection-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
      }
      .dialog-overlay {
        background: rgba(0,0,0,0.5);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dialog-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        max-height: 80%;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      .dialog-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .dialog-header h3 {
        margin: 0;
        color: #333;
      }
      .dialog-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }
      .dialog-close:hover {
        color: #333;
      }
      .dialog-body {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
      }
      .query-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
        margin-bottom: 10px;
        background: #f9f9f9;
      }
      .query-info {
        flex: 1;
      }
      .query-name {
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }
      .query-preview {
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
      }
      .query-date {
        font-size: 12px;
        color: #999;
      }
      .query-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .load-query-btn {
        background: #007cba;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .load-query-btn:hover {
        background: #005a87;
      }
      .delete-query-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .delete-query-btn:hover {
        background: #c82333;
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(dialog);
  
  // 전역 변수에 쿼리 저장
  window.dialogQueries = queries;
}

// HTML 이스케이프
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 날짜 형식 변환
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  } catch (error) {
    return dateString;
  }
}

// 쿼리 대화상자 닫기
function closeQueryDialog() {
  const dialog = document.querySelector('.query-selection-dialog');
  if (dialog) {
    dialog.remove();
  }
  delete window.dialogQueries;
}

// 선택된 쿼리 삭제
function deleteSelectedQuery(index) {
  try {
    if (!window.dialogQueries || !window.dialogQueries[index]) {
      throw new Error('쿼리 데이터를 찾을 수 없습니다.');
    }
    
    const query = window.dialogQueries[index];
    
    // 삭제 확인
    const confirmed = confirm(`'${query.name}' 쿼리를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (!confirmed) {
      return;
    }
    
    // 쿼리 삭제
    const success = deleteQuery(query.name);
    
    if (success) {
      // 대화상자에서 해당 쿼리 제거
      window.dialogQueries.splice(index, 1);
      
      // 대화상자가 비어있으면 닫기
      if (window.dialogQueries.length === 0) {
        closeQueryDialog();
        showToast('✅ 모든 쿼리가 삭제되었습니다.');
        return;
      }
      
      // 대화상자 새로고침
      const remainingQueries = window.dialogQueries;
      closeQueryDialog();
      setTimeout(() => {
        showQuerySelectionDialog(remainingQueries);
      }, 100);
      
      showToast(`🗑️ 쿼리 '${query.name}' 삭제 완료`);
    }
    
  } catch (error) {
    console.error('❌ 쿼리 삭제 실패:', error);
    showToast('❌ 쿼리 삭제에 실패했습니다.');
  }
}

// 선택된 쿼리 불러오기 (개선된 에러 처리)
function loadSelectedQuery(index) {
  try {
    if (!window.dialogQueries || !window.dialogQueries[index]) {
      throw new Error('쿼리 데이터를 찾을 수 없습니다.');
    }
    
    const query = window.dialogQueries[index];
    
    // Loading query
    
    // 필수 함수 존재 확인
    if (typeof createKeywordGroup !== 'function') {
      throw new Error('createKeywordGroup 함수를 찾을 수 없습니다. script.js가 먼저 로드되었는지 확인하세요.');
    }
    
    if (typeof updateSummary !== 'function') {
      console.warn('⚠️ updateSummary 함수를 찾을 수 없습니다.');
    }
    
    // 키워드 그룹 복원 (안전한 실행)
    try {
      restoreKeywordGroups(query.rawKeywords);
      // Keywords restored
    } catch (keywordError) {
      console.error('❌ 키워드 그룹 복원 실패:', keywordError);
      showToast('⚠️ 키워드 복원 중 오류가 발생했습니다.');
    }
    
    // 날짜 필터 복원 (안전한 실행)
    try {
      restoreDateFilter(query.dateFilter);
      // Date filter restored
    } catch (dateError) {
      console.error('❌ 날짜 필터 복원 실패:', dateError);
    }
    
    // 검색 조건 미리보기 업데이트 (수정된 접근법)
    console.log('🔍 미리보기 업데이트 시작 - 쿼리 데이터:', {
      name: query.name,
      keywords: query.keywords,
      hasKeywords: !!query.keywords
    });
    
    try {
      // 요약 텍스트박스 찾기
      const summaryTextarea = document.getElementById('summary');
      
      if (!summaryTextarea) {
        console.error('❌ #summary 텍스트박스를 찾을 수 없습니다!');
        return;
      }
      
      // 키워드 그룹이 복원되었는지 확인
      const keywordGroups = document.querySelectorAll('.keyword-group');
      const hasRestoredGroups = keywordGroups.length > 0 && 
        Array.from(keywordGroups).some(group => {
          const input = group.querySelector('input[type="text"]');
          return input && input.value.trim() !== '';
        });
      
      console.log('🔍 키워드 그룹 복원 상태:', {
        그룹수: keywordGroups.length,
        복원됨: hasRestoredGroups
      });
      
      if (hasRestoredGroups) {
        // 키워드 그룹이 복원된 경우: updateSummary 함수 사용
        console.log('✅ 키워드 그룹 복원됨 - updateSummary 호출');
        if (typeof updateSummary === 'function') {
          updateSummary();
          console.log('✅ updateSummary 완료');
        }
      } else {
        // 키워드 그룹이 복원되지 않은 경우: 직접 키워드 표시
        console.log('⚠️ 키워드 그룹 복원 안됨 - 직접 키워드 표시');
        if (query.keywords) {
          summaryTextarea.value = query.keywords;
          console.log('✅ 직접 키워드 표시 완료:', query.keywords);
        }
      }
      
      // 최종 확인 (약간의 지연 후)
      setTimeout(() => {
        const finalValue = summaryTextarea.value;
        console.log('⏰ 최종 미리보기 상태:', {
          값: finalValue,
          비어있음: !finalValue || finalValue === '검색 조건이 없습니다.',
          예상키워드포함: query.keywords && finalValue.includes(query.keywords.split(' ')[0])
        });
        
        // 만약 아직도 비어있거나 기본 메시지라면 강제로 키워드 설정
        if (!finalValue || finalValue === '검색 조건이 없습니다.' || finalValue.trim() === '') {
          if (query.keywords) {
            console.log('🔧 강제 키워드 설정 실행');
            summaryTextarea.value = query.keywords;
          }
        }
      }, 300);
      
    } catch (updateError) {
      console.error('❌ 검색 조건 업데이트 실패:', updateError);
      
      // 최종 fallback - 단순히 키워드만 표시
      try {
        const summaryTextarea = document.getElementById('summary');
        if (summaryTextarea && query.keywords) {
          summaryTextarea.value = query.keywords;
          console.log('🆘 Fallback: 키워드 직접 표시');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback도 실패:', fallbackError);
      }
    }
    
    // 마지막 사용 시간 업데이트
    try {
      query.lastUsed = new Date().toISOString();
      updateQueryLastUsed(query.name, query.lastUsed);
    } catch (timeError) {
      console.warn('⚠️ 사용 시간 업데이트 실패:', timeError);
    }
    
    closeQueryDialog();
    
    showToast(`✅ 쿼리 '${query.name}' 불러오기 완료!`);
    
    if (DEBUG_MODE) {
      console.log('🔖 쿼리 불러오기 완료:', query.name);
    }
    
  } catch (error) {
    console.error('❌ 쿼리 불러오기 전체 실패:', error);
    showToast(`❌ 쿼리 불러오기 실패: ${error.message}`);
    
    // 대화상자는 유지 (사용자가 다른 쿼리 시도 가능)
    if (DEBUG_MODE) {
      console.error('전체 에러 상세:', {
        error: error,
        query: window.dialogQueries ? window.dialogQueries[index] : 'N/A',
        availableFunctions: {
          createKeywordGroup: typeof createKeywordGroup !== 'undefined',
          updateSummary: typeof updateSummary !== 'undefined',
          buildSearchQuery: typeof buildSearchQuery !== 'undefined'
        }
      });
    }
  }
}

// 쿼리 마지막 사용 시간 업데이트
function updateQueryLastUsed(queryName, lastUsed) {
  try {
    const queries = loadLocalQueries();
    const targetQuery = queries.find(q => q.name === queryName);
    
    if (targetQuery) {
      targetQuery.lastUsed = lastUsed;
      
      // CSV 형식으로 변환 후 저장
      const csvContent = generateQueryCSV(queries);
      localStorage.setItem(LOCAL_QUERY_FILE_KEY, csvContent);
      
      if (DEBUG_MODE) {
        console.log(`📅 쿼리 '${queryName}' 사용 시간 업데이트됨`);
      }
    }
    
  } catch (error) {
    console.error('❌ 사용 시간 업데이트 실패:', error);
  }
}

// 키워드 그룹 복원 (실제 DOM 구조에 맞촌)
function restoreKeywordGroups(rawKeywords) {
  try {
    // 기존 키워드 그룹 초기화
    const container = document.getElementById('keyword-container');
    container.innerHTML = '';
    
    if (!Array.isArray(rawKeywords) || rawKeywords.length === 0) {
      createKeywordGroup(); // script.js의 함수 사용
      return;
    }
    
    rawKeywords.forEach((groupData, groupIndex) => {
      createKeywordGroup(); // script.js의 함수 사용
      
      const groups = document.querySelectorAll('.keyword-group');
      const currentGroup = groups[groups.length - 1];
      
      if (!currentGroup) {
        console.warn('⚠️ 그룹을 찾을 수 없음:', groupIndex);
        return;
      }
      
      // 키워드 입력 (첫 번째 키워드만 사용)
      const input = currentGroup.querySelector('input[type="text"]');
      if (input && Array.isArray(groupData.keywords) && groupData.keywords.length > 0) {
        input.value = groupData.keywords[0]; // 첫 번째 키워드만
      }
      
      // 연산자 설정 (버튼 활성화)
      const buttons = currentGroup.querySelectorAll('button');
      if (buttons.length >= 4) {
        const andBtn = buttons[2]; // AND 버튼
        const orBtn = buttons[3];  // OR 버튼
        
        // 기존 활성 상태 제거
        andBtn.classList.remove('active');
        orBtn.classList.remove('active');
        
        // 저장된 연산자에 따라 활성화
        if (groupData.operator === 'OR') {
          orBtn.classList.add('active');
        } else {
          andBtn.classList.add('active'); // 기본값 AND
        }
      }
    });
    
    if (DEBUG_MODE) {
      console.log('🔄 키워드 그룹 복원 완료');
    }
    
  } catch (error) {
    console.error('❌ 키워드 그룹 복원 실패:', error);
    // 실패 시 기본 그룹 추가
    try {
      createKeywordGroup();
    } catch (fallbackError) {
      console.error('❌ 기본 그룹 생성도 실패:', fallbackError);
    }
  }
}

// 날짜 필터 복원 (간소화된 버전)
function restoreDateFilter(dateFilter) {
  try {
    const dateEnabledCheckbox = document.getElementById('date-filter-enabled');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (!dateFilter || !dateFilter.enabled) {
      if (dateEnabledCheckbox) dateEnabledCheckbox.checked = false;
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      
      // toggleDateFilter 함수가 없을 경우 직접 처리
      const dateFields = document.querySelectorAll('#start-date, #end-date');
      dateFields.forEach(field => {
        if (field) field.disabled = true;
      });
      return;
    }
    
    if (dateEnabledCheckbox) {
      dateEnabledCheckbox.checked = true;
      
      // 날짜 필드 활성화
      const dateFields = document.querySelectorAll('#start-date, #end-date');
      dateFields.forEach(field => {
        if (field) field.disabled = false;
      });
    }
    
    if (startDateInput && dateFilter.startDate) {
      startDateInput.value = dateFilter.startDate;
    }
    
    if (endDateInput && dateFilter.endDate) {
      endDateInput.value = dateFilter.endDate;
    }
    
    if (DEBUG_MODE) {
      console.log('📅 날짜 필터 복원 완료:', dateFilter);
    }
    
  } catch (error) {
    console.error('❌ 날짜 필터 복원 실패:', error);
  }
}

// 로컬 Query.csv 파일 상태 표시
function displayLocalQueryStatus() {
  const queries = loadLocalQueries();
  const statusText = queries.length > 0 ? 
    `📁 로컬 저장된 쿼리: ${queries.length}개` : 
    `📁 저장된 쿼리 없음`;
    
  // 상태 표시 (콘솔 또는 UI에)
  if (DEBUG_MODE) {
    console.log(statusText);
  }
  
  return statusText;
}

// 쿼리 삭제 함수 (추가 기능)
function deleteQuery(queryName) {
  try {
    const queries = loadLocalQueries();
    const filteredQueries = queries.filter(q => q.name !== queryName);
    
    if (filteredQueries.length === queries.length) {
      showToast('⚠️ 해당 쿼리를 찾을 수 없습니다.');
      return false;
    }
    
    const csvContent = generateQueryCSV(filteredQueries);
    localStorage.setItem(LOCAL_QUERY_FILE_KEY, csvContent);
    
    showToast(`🗑️ 쿼리 '${queryName}' 삭제 완료`);
    
    if (DEBUG_MODE) {
      console.log(`🗑️ 쿼리 삭제됨: ${queryName}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 쿼리 삭제 실패:', error);
    showToast('❌ 쿼리 삭제에 실패했습니다.');
    return false;
  }
}

// 쿼리 기능 초기화
function initializeQueryFeatures() {
  try {
    console.log('🔖 쿼리 저장/불러오기 기능 초기화 중...');
    
    // 로컬 Query.csv 파일 초기화
    initializeLocalQueryFile();
    
    // 상태 표시
    displayLocalQueryStatus();
    
    if (DEBUG_MODE) {
      console.log('✅ 쿼리 기능 초기화 완료');
    }
    
  } catch (error) {
    console.error('❌ 쿼리 기능 초기화 실패:', error);
  }
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeQueryFeatures);
} else {
  initializeQueryFeatures();
}