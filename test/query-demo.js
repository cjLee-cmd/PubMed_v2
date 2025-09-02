// === 🎬 쿼리 저장/불러오기 데모 ===

// 데모 실행 함수
function runQueryDemo() {
  console.log('🎬 === 쿼리 저장/불러오기 데모 시작 ===');
  
  // 데모 데이터 준비
  createDemoQueries();
  
  // 데모 UI 표시
  showDemoInterface();
}

// 데모용 쿼리 생성
function createDemoQueries() {
  const demoQueries = [
    {
      name: '암 연구 - 기본',
      keywords: 'cancer AND (treatment OR therapy)',
      rawKeywords: [
        {
          groupIndex: 0,
          operator: 'AND',
          keywords: ['cancer']
        },
        {
          groupIndex: 1,
          operator: 'OR',
          keywords: ['treatment', 'therapy']
        }
      ],
      dateFilter: {
        enabled: true,
        startDate: '2020-01-01',
        endDate: '2024-12-31'
      },
      createdDate: '2024-01-15T10:30:00.000Z',
      lastUsed: '2024-01-20T14:25:00.000Z'
    },
    {
      name: '신경과학 연구',
      keywords: 'neuroscience AND (brain OR neuron) AND research',
      rawKeywords: [
        {
          groupIndex: 0,
          operator: 'AND',
          keywords: ['neuroscience']
        },
        {
          groupIndex: 1,
          operator: 'OR',
          keywords: ['brain', 'neuron']
        },
        {
          groupIndex: 2,
          operator: 'AND',
          keywords: ['research']
        }
      ],
      dateFilter: {
        enabled: false
      },
      createdDate: '2024-01-10T09:15:00.000Z',
      lastUsed: '2024-01-18T16:45:00.000Z'
    },
    {
      name: 'AI 의료응용',
      keywords: '("artificial intelligence" OR "machine learning") AND (medical OR healthcare)',
      rawKeywords: [
        {
          groupIndex: 0,
          operator: 'OR',
          keywords: ['artificial intelligence', 'machine learning']
        },
        {
          groupIndex: 1,
          operator: 'AND',
          keywords: ['medical', 'healthcare']
        }
      ],
      dateFilter: {
        enabled: true,
        startDate: '2023-01-01',
        endDate: ''
      },
      createdDate: '2024-01-05T14:20:00.000Z',
      lastUsed: '2024-01-22T11:30:00.000Z'
    }
  ];
  
  // 로컬 파일 초기화
  initializeLocalQueryFile();
  
  // 기존 데모 쿼리 제거
  const existingQueries = loadLocalQueries();
  const filteredQueries = existingQueries.filter(q => 
    !['암 연구 - 기본', '신경과학 연구', 'AI 의료응용'].includes(q.name)
  );
  
  // 데모 쿼리 추가
  const allQueries = [...filteredQueries, ...demoQueries];
  
  // CSV로 저장
  const csvContent = generateQueryCSV(allQueries);
  localStorage.setItem(LOCAL_QUERY_FILE_KEY, csvContent);
  
  console.log(`🎭 데모 쿼리 ${demoQueries.length}개 생성됨`);
}

// 데모 인터페이스 표시
function showDemoInterface() {
  // 기존 데모 인터페이스 제거
  const existingDemo = document.querySelector('.query-demo-interface');
  if (existingDemo) {
    existingDemo.remove();
  }
  
  const demoDiv = document.createElement('div');
  demoDiv.className = 'query-demo-interface';
  demoDiv.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 3px solid #007cba; padding: 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 2000; max-width: 500px; text-align: center;">
      <h2 style="margin: 0 0 20px 0; color: #007cba;">🎬 쿼리 저장/불러오기 데모</h2>
      
      <div style="margin-bottom: 20px; text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">📋 데모 내용:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          <li><strong>3개 샘플 쿼리</strong> 자동 생성됨</li>
          <li><strong>로컬 저장</strong> - 다운로드 없이 브라우저에 저장</li>
          <li><strong>순차 저장</strong> - 기존 쿼리에 추가</li>
          <li><strong>불러오기</strong> - 선택 대화상자로 쉬운 선택</li>
          <li><strong>삭제 기능</strong> - 개별 쿼리 삭제 가능</li>
        </ul>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #333;">🎯 사용 방법:</h4>
        <div style="text-align: left; font-size: 14px; color: #666; line-height: 1.5;">
          1. <strong>💾 저장</strong> 버튼으로 현재 검색 조건 저장<br>
          2. <strong>📂 불러오기</strong> 버튼으로 저장된 쿼리 선택<br>
          3. 쿼리 목록에서 <strong>🗑️</strong> 버튼으로 개별 삭제
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button onclick="loadQueryFromCSV()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px;">
          📂 데모 쿼리 보기
        </button>
        <button onclick="showQueryStatus()" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px;">
          📊 상태 확인
        </button>
        <button onclick="closeDemoInterface()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px;">
          닫기
        </button>
      </div>
      
      <div style="margin-top: 15px; font-size: 12px; color: #999;">
        💡 Tip: 개발자 콘솔에서 더 자세한 로그를 확인할 수 있습니다.
      </div>
    </div>
  `;
  
  document.body.appendChild(demoDiv);
  
  // 3초 후 자동으로 쿼리 목록 표시
  setTimeout(() => {
    console.log('🎭 3초 후 자동으로 쿼리 목록 표시...');
    // 데모 인터페이스는 유지하고 추가로 쿼리 목록 표시
  }, 3000);
}

// 데모 인터페이스 닫기
function closeDemoInterface() {
  const demo = document.querySelector('.query-demo-interface');
  if (demo) {
    demo.remove();
  }
}

// 쿼리 상태 표시
function showQueryStatus() {
  const queries = loadLocalQueries();
  const statusMessage = `📊 현재 상태:\n\n` +
    `• 저장된 쿼리: ${queries.length}개\n` +
    `• 로컬스토리지 키: ${LOCAL_QUERY_FILE_KEY}\n` +
    `• 브라우저: ${navigator.userAgent.split(' ')[0]}\n\n` +
    (queries.length > 0 ? 
      `최근 쿼리:\n${queries.slice(0, 3).map(q => `• ${q.name}`).join('\n')}` :
      '저장된 쿼리가 없습니다.');
  
  alert(statusMessage);
  
  if (DEBUG_MODE) {
    console.log('📊 쿼리 상태:', {
      totalQueries: queries.length,
      storageKey: LOCAL_QUERY_FILE_KEY,
      queries: queries.map(q => ({ name: q.name, created: q.createdDate }))
    });
  }
}

// 로컬스토리지 초기화 (데모용)
function resetQueryStorage() {
  const confirmed = confirm('⚠️ 모든 저장된 쿼리를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.');
  
  if (confirmed) {
    localStorage.removeItem(LOCAL_QUERY_FILE_KEY);
    showToast('🗑️ 모든 쿼리가 삭제되었습니다.');
    
    // 데모 쿼리 재생성 옵션
    const recreate = confirm('데모 쿼리를 다시 생성하시겠습니까?');
    if (recreate) {
      createDemoQueries();
      showToast('🎭 데모 쿼리가 다시 생성되었습니다.');
    }
  }
}

// 전역 함수로 노출
window.runQueryDemo = runQueryDemo;
window.closeDemoInterface = closeDemoInterface;
window.showQueryStatus = showQueryStatus;
window.resetQueryStorage = resetQueryStorage;

// 개발 모드에서 자동 실행 (페이지 로드 후 5초)
if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
  console.log('🎬 개발 모드 - 5초 후 쿼리 데모 자동 실행');
  setTimeout(() => {
    if (typeof initializeLocalQueryFile === 'function') {
      runQueryDemo();
    }
  }, 7000);
}