// 📄 파일명: js/script.js

const keywordContainer = document.getElementById('keyword-container');
const summary = document.getElementById('summary');

// 복사/붙여넣기 유틸리티 함수들
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('키워드가 클립보드에 복사되었습니다.');
  } catch (err) {
    console.error('복사 실패:', err);
    showToast('복사에 실패했습니다. 최신 브라우저를 사용해주세요.');
  }
}

async function pasteFromClipboard(inputElement) {
  try {
    const text = await navigator.clipboard.readText();
    inputElement.value = text;
    inputElement.dispatchEvent(new Event('input'));
    showToast('키워드가 붙여넣기되었습니다.');
  } catch (err) {
    console.error('붙여넣기 실패:', err);
    showToast('붙여넣기에 실패했습니다. Ctrl+V를 사용해보세요.');
  }
}

// 토스트 메시지 표시
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  
  document.body.appendChild(toast);
  
  // 애니메이션
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
}

// 컨텍스트 메뉴 표시
function showContextMenu(event, inputElement) {
  // 기존 컨텍스트 메뉴 제거
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    min-width: 120px;
  `;

  const copyItem = document.createElement('div');
  copyItem.textContent = '📋 복사';
  copyItem.style.cssText = `
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  `;
  copyItem.onmouseover = () => copyItem.style.background = '#f0f0f0';
  copyItem.onmouseout = () => copyItem.style.background = 'white';
  copyItem.onclick = () => {
    copyToClipboard(inputElement.value);
    menu.remove();
  };

  const pasteItem = document.createElement('div');
  pasteItem.textContent = '📄 붙여넣기';
  pasteItem.style.cssText = `
    padding: 10px 15px;
    cursor: pointer;
  `;
  pasteItem.onmouseover = () => pasteItem.style.background = '#f0f0f0';
  pasteItem.onmouseout = () => pasteItem.style.background = 'white';
  pasteItem.onclick = () => {
    pasteFromClipboard(inputElement);
    menu.remove();
  };

  menu.appendChild(copyItem);
  menu.appendChild(pasteItem);
  
  // 메뉴 위치 설정
  menu.style.left = event.pageX + 'px';
  menu.style.top = event.pageY + 'px';
  
  document.body.appendChild(menu);

  // 다른 곳 클릭시 메뉴 닫기
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    });
  }, 10);
}

function updateSummary() {
  const groups = document.querySelectorAll('.keyword-group');
  const parts = [];

  groups.forEach((group, index) => {
    const input = group.querySelector('input').value.trim();
    const activeBtn = group.querySelector('button.active');
    if (!input) return;
    const formatted = `"${input}"`;

    if (parts.length > 0) {
      const prevGroup = groups[index - 1];
      const prevBtn = prevGroup ? prevGroup.querySelector('button.active') : null;
      if (prevBtn) parts.push(prevBtn.textContent.toUpperCase());
    }
    parts.push(formatted);
  });

  let formattedText = '';
  for (let i = 0; i < parts.length; i++) {
    formattedText += parts[i];
    if (i < parts.length - 1) formattedText += ' ';
    if ((i + 1) % 5 === 0) formattedText += '\n';
  }

  // 날짜 필터 추가
  const dateFilterText = getDateFilterText();
  if (dateFilterText) {
    if (formattedText) {
      formattedText += ' AND ' + dateFilterText;
    } else {
      formattedText = dateFilterText;
    }
  }

  summary.value = formattedText || '검색 조건이 없습니다.';
}

// 날짜 필터 텍스트 생성
function getDateFilterText() {
  const enableDateFilter = document.getElementById('enable-date-filter').checked;
  if (!enableDateFilter) return '';

  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;

  if (!startDate && !endDate) return '';

  let dateText = '';
  if (startDate && endDate) {
    // 시작일과 종료일 모두 있는 경우
    dateText = `("${startDate}"[Date - Publication] : "${endDate}"[Date - Publication])`;
  } else if (startDate) {
    // 시작일만 있는 경우
    dateText = `"${startDate}"[Date - Publication] : 3000[Date - Publication]`;
  } else if (endDate) {
    // 종료일만 있는 경우
    dateText = `1800[Date - Publication] : "${endDate}"[Date - Publication]`;
  }

  return dateText;
}

function createKeywordGroup() {
  const group = document.createElement('div');
  group.className = 'keyword-group';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter keyword...';

  const andBtn = document.createElement('button');
  andBtn.textContent = 'AND';
  const orBtn = document.createElement('button');
  orBtn.textContent = 'OR';
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';

  // 복사/붙여넣기 버튼 추가
  const copyBtn = document.createElement('button');
  copyBtn.textContent = '📋';
  copyBtn.title = 'Copy keyword';
  copyBtn.onclick = () => copyToClipboard(input.value);

  const pasteBtn = document.createElement('button');
  pasteBtn.textContent = '📄';
  pasteBtn.title = 'Paste keyword';
  pasteBtn.onclick = () => pasteFromClipboard(input);

  [andBtn, orBtn].forEach(btn => {
    btn.onclick = () => {
      andBtn.classList.remove('active');
      orBtn.classList.remove('active');
      btn.classList.add('active');

      maybeAddNewGroup();
      updateSummary();
    };
  });

  deleteBtn.onclick = () => {
    group.remove();
    updateSummary();
  };

  input.oninput = () => {
    maybeAddNewGroup();
    updateSummary();
  };

  input.onpaste = () => {
    setTimeout(updateSummary, 100);
  };

  // 키보드 단축키 추가 (Ctrl+C, Ctrl+V)
  input.onkeydown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        copyToClipboard(input.value);
      } else if (e.key === 'v') {
        // 기본 브라우저 붙여넣기 동작을 허용하고 업데이트만 트리거
        setTimeout(() => {
          maybeAddNewGroup();
          updateSummary();
        }, 10);
      }
    }
  };

  // 컨텍스트 메뉴 비활성화 및 커스텀 메뉴 추가
  input.oncontextmenu = (e) => {
    e.preventDefault();
    showContextMenu(e, input);
  };

  function maybeAddNewGroup() {
    if (input.value && (andBtn.classList.contains('active') || orBtn.classList.contains('active'))) {
      const lastGroup = keywordContainer.lastElementChild;
      if (lastGroup === group) {
        createKeywordGroup();
      }
    }
  }

  group.appendChild(input);
  group.appendChild(copyBtn);
  group.appendChild(pasteBtn);
  group.appendChild(andBtn);
  group.appendChild(orBtn);
  group.appendChild(deleteBtn);
  keywordContainer.appendChild(group);
}

function validateSearchQuery(query) {
  const invalid = /\b(AND|OR)\b\s*$/i;
  const doubleOperators = /\b(AND|OR)\b\s+\b(AND|OR)\b/i;
  if (invalid.test(query) || doubleOperators.test(query)) {
    alert('검색 조건식에 오류가 있습니다. AND/OR 연산자의 위치를 확인하세요.');
    return false;
  }
  return true;
}

async function search() {
  const rawQuery = summary.value.trim();
  if (!validateSearchQuery(rawQuery)) return;

  const apiKey = CONFIG.NCBI_API_KEY;
  const resultsEl = document.getElementById('results');
  resultsEl.innerHTML = `<p>🔍 검색 중입니다... "${rawQuery}"</p>`;

  // 검색 쿼리 결정: 텍스트박스에 내용이 있으면 우선 사용, 없으면 buildSearchQuery() 사용
  let searchQuery;
  if (rawQuery && rawQuery !== '검색 조건이 없습니다.') {
    searchQuery = rawQuery; // 텍스트박스 내용 사용 (저장/불러오기된 쿼리 포함)
  } else {
    searchQuery = buildSearchQuery(); // 키워드 그룹에서 생성
  }
  
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=10&api_key=${apiKey}`;

  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) {
      resultsEl.innerHTML = `<p>🔎 검색 결과가 없습니다.</p>`;
      currentSearchResults = []; // 검색 결과 초기화
      updateSaveButtons(false); // 저장 버튼 비활성화
      return;
    }

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&api_key=${apiKey}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=text&rettype=abstract&api_key=${apiKey}`;
    const fetchRes = await fetch(fetchUrl);
    const abstractText = await fetchRes.text();
    const abstractList = abstractText.split(/\n\n(?=PMID: )/g);

    const resultList = ids.map((id, index) => {
      const item = summaryData.result[id];
      const abstract = abstractList[index] || '';
      return {
        pmid: id,
        title: item.title || '제목 없음',
        authors: (item.authors || []).map(a => a.name),
        source: item.source || '',
        pubdate: item.pubdate || '',
        abstract: abstract
      };
    }).filter(result => {
      // Abstract가 없거나 '초록 없음' 또는 빈 문자열인 경우 필터링
      const hasValidAbstract = result.abstract && 
        result.abstract.trim() !== '' && 
        result.abstract !== '초록 없음' &&
        !result.abstract.includes('Abstract not available') &&
        result.abstract.toLowerCase() !== 'no abstract available';
      return hasValidAbstract;
    });

    // Abstract가 있는 결과가 없을 경우 처리
    if (resultList.length === 0) {
      resultsEl.innerHTML = `<p>🔎 Abstract가 있는 검색 결과가 없습니다.</p>`;
      currentSearchResults = [];
      updateSaveButtons(false);
      return;
    }

    // Grid/Table 렌더링
    currentSearchResults = resultList;
    updateSaveButtons(true);

    const buildTable = (data) => {
      if (!data.length) return '<p>결과가 없습니다.</p>';
      const headers = [
        { key: 'pmid', label: 'PMID' },
        { key: 'title', label: 'Title' },
        { key: 'authors', label: 'Authors' },
        { key: 'source', label: 'Journal' },
        { key: 'pubdate', label: 'Date' },
        { key: 'abstract', label: 'Abstract' }
      ];
      let html = '<table class="results-table"><thead><tr>' + headers.map(h => `<th>${h.label}</th>`).join('') + '</tr></thead><tbody>';
      html += data.map(row => {
        const authors = Array.isArray(row.authors) ? row.authors.join(', ') : (row.authors || '');
        const abstractShort = (row.abstract || '').length > 180 ? (row.abstract.slice(0,180) + '...') : (row.abstract||'');
        const pmidLink = row.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${row.pmid}/" target="_blank" rel="noopener">${row.pmid}</a>` : '';
        return `<tr class="result-row" data-pmid="${row.pmid}" data-abstract="${encodeURIComponent(row.abstract || '')}">`
          + `<td>${pmidLink}</td>`
          + `<td>${escapeHtml(row.title || '')}</td>`
          + `<td>${escapeHtml(authors)}</td>`
          + `<td>${escapeHtml(row.source || '')}</td>`
          + `<td>${escapeHtml(row.pubdate || '')}</td>`
          + `<td>${escapeHtml(abstractShort)}${row.abstract && row.abstract.length>180 ? ' <button class="abs-more-btn" data-action="expand">더보기</button>' : ''}</td>`
          + `</tr>`;
      }).join('');
      html += '</tbody></table>';
      return html;
    };

    // XSS 방지를 위한 간단 escape
    function escapeHtml(str){
      return String(str).replace(/[&<>"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s]));
    }

    resultsEl.innerHTML = buildTable(resultList) + '<div class="results-hint">Rows: '+resultList.length+'</div>';

    // Abstract 확장 이벤트 위임
    resultsEl.addEventListener('click', function(e){
      const btn = e.target.closest('button.abs-more-btn');
      if(!btn) return;
      const tr = btn.closest('tr');
      if(!tr) return;
      const full = decodeURIComponent(tr.getAttribute('data-abstract'));
      openAbstractModal(full, tr.getAttribute('data-pmid'));
    }, { once: true });

    ensureAbstractModal();
  } catch (error) {
    console.error(error);
    resultsEl.innerHTML = `<p style="color: red;">❌ 검색 중 오류가 발생했습니다.</p>`;
  }
}

// Abstract 모달 생성/표시
function ensureAbstractModal(){
  if(document.getElementById('abstract-modal')) return;
  const modal = document.createElement('div');
  modal.id='abstract-modal';
  modal.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:10000;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = '<div class="abstract-modal-content" style="background:#fff;max-width:800px;width:100%;max-height:80vh;overflow:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);padding:1.25rem;">\n  <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">\n    <h3 style="margin:0;font-size:1.05rem;">Abstract</h3>\n    <button data-close style="background:#8b00ff;color:#fff;border:none;border-radius:4px;padding:0.4rem 0.8rem;cursor:pointer;">닫기</button>\n  </div>\n  <pre id="abstract-full-text" style="white-space:pre-wrap;font-size:0.85rem;line-height:1.4;margin-top:0.75rem;"></pre>\n</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', (e)=>{ if(e.target===modal || e.target.hasAttribute('data-close')) closeAbstractModal(); });
}
function openAbstractModal(text, pmid){
  ensureAbstractModal();
  const modal = document.getElementById('abstract-modal');
  const pre = document.getElementById('abstract-full-text');
  if(pre) pre.textContent = (pmid?`PMID: ${pmid}\n\n`:'') + text;
  modal.style.display='flex';
}
function closeAbstractModal(){
  const modal = document.getElementById('abstract-modal');
  if(modal) modal.style.display='none';
}

// 키워드와 날짜 필터를 조합한 검색 쿼리 생성
function buildSearchQuery() {
  const groups = document.querySelectorAll('.keyword-group');
  const keywordParts = [];

  // 키워드 부분 생성
  groups.forEach((group, index) => {
    const input = group.querySelector('input').value.trim();
    const activeBtn = group.querySelector('button.active');
    if (!input) return;
    const formatted = `"${input}"`;

    if (keywordParts.length > 0) {
      const prevGroup = groups[index - 1];
      const prevBtn = prevGroup ? prevGroup.querySelector('button.active') : null;
      if (prevBtn) keywordParts.push(prevBtn.textContent.toUpperCase());
    }
    keywordParts.push(formatted);
  });

  let query = keywordParts.join(' ');

  // 날짜 필터 추가
  const enableDateFilter = document.getElementById('enable-date-filter').checked;
  if (enableDateFilter) {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate || endDate) {
      let dateQuery = '';
      
      if (startDate && endDate) {
        // 범위 검색: YYYY/MM/DD 형식으로 변환
        const startFormatted = startDate.replace(/-/g, '/');
        const endFormatted = endDate.replace(/-/g, '/');
        dateQuery = `("${startFormatted}"[Date - Publication] : "${endFormatted}"[Date - Publication])`;
      } else if (startDate) {
        // 시작일 이후
        const startFormatted = startDate.replace(/-/g, '/');
        dateQuery = `"${startFormatted}"[Date - Publication] : 3000[Date - Publication]`;
      } else if (endDate) {
        // 종료일 이전
        const endFormatted = endDate.replace(/-/g, '/');
        dateQuery = `1800[Date - Publication] : "${endFormatted}"[Date - Publication]`;
      }

      if (dateQuery) {
        if (query) {
          query += ' AND ' + dateQuery;
        } else {
          query = dateQuery;
        }
      }
    }
  }

  return query;
}

createKeywordGroup();

// 날짜 필터 기능 초기화
function initializeDateFilter() {
  const enableDateFilterCheckbox = document.getElementById('enable-date-filter');
  const dateFilterInputs = document.getElementById('date-filter-inputs');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  // 체크박스 변경 이벤트
  enableDateFilterCheckbox.addEventListener('change', function() {
    if (this.checked) {
      dateFilterInputs.classList.add('enabled');
    } else {
      dateFilterInputs.classList.remove('enabled');
      // 체크박스 해제 시 날짜 입력값 초기화
      startDateInput.value = '';
      endDateInput.value = '';
    }
    updateSummary(); // 요약 업데이트
  });

  // 날짜 입력 변경 이벤트
  startDateInput.addEventListener('change', updateSummary);
  endDateInput.addEventListener('change', updateSummary);
}

// Summary 박스 복사/붙여넣기 기능 초기화
function initializeSummaryFeatures() {
  const summaryElement = document.getElementById('summary');
  const copySummaryBtn = document.querySelector('.copy-summary-btn');
  const pasteSummaryBtn = document.querySelector('.paste-summary-btn');
  const validateQueryBtn = document.querySelector('.validate-query-btn');

  // 복사 버튼 이벤트
  copySummaryBtn.onclick = () => {
    const summaryText = summaryElement.value || '';
    copyToClipboard(summaryText);
  };

  // 붙여넣기 버튼 이벤트
  pasteSummaryBtn.onclick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        // 붙여넣은 텍스트를 파싱하여 키워드 그룹들을 생성
        parseSummaryAndCreateGroups(text);
        showToast('검색 조건이 붙여넣기되었습니다.');
      }
    } catch (err) {
      console.error('붙여넣기 실패:', err);
      showToast('붙여넣기에 실패했습니다. 수동으로 입력해주세요.');
    }
  };

  // 쿼리 검증 버튼 이벤트
  validateQueryBtn.onclick = () => {
    const queryText = summaryElement.value.trim();
    if (!queryText) {
      showValidationModal('에러', '검증할 쿼리가 없습니다. 검색 조건을 입력해주세요.', false);
      return;
    }
    
    // 성능 테스트 실행
    const performanceResults = runPerformanceTests(queryText);
    
    if (performanceResults.validation.isValid) {
      const performanceInfo = `검증 완료
      
🔍 검증 성능:
- 검증 시간: ${performanceResults.validation.time}ms
- 메모리 사용량: ${performanceResults.memory.used}MB
- 쿼리 복잡도: ${performanceResults.complexity.score}/100

📊 성능 등급: ${performanceResults.performance.grade}
⚡ 처리 속도: ${performanceResults.performance.speed}`;
      
      showValidationModal('검증 완료', performanceInfo, true);
    } else {
      const errorInfo = `에러 발생:
${performanceResults.validation.errors.join('\n')}

🔍 검증 성능:
- 검증 시간: ${performanceResults.validation.time}ms
- 메모리 사용량: ${performanceResults.memory.used}MB
- 쿼리 복잡도: ${performanceResults.complexity.score}/100`;
      
      showValidationModal('에러', errorInfo, false);
    }
  };

  // 컨텍스트 메뉴 추가
  summaryElement.oncontextmenu = (e) => {
    e.preventDefault();
    showSummaryContextMenu(e, summaryElement);
  };

  // 키보드 단축키 (summary 박스에 포커스가 있을 때)
  summaryElement.tabIndex = 0; // 포커스 가능하게 만들기
  summaryElement.onkeydown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        const summaryText = summaryElement.value || '';
        copyToClipboard(summaryText);
      } else if (e.key === 'v') {
        pasteSummaryBtn.click();
      }
    }
  };
}

// Summary용 컨텍스트 메뉴
function showSummaryContextMenu(event, summaryElement) {
  // 기존 컨텍스트 메뉴 제거
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    min-width: 140px;
  `;

  const copyItem = document.createElement('div');
  copyItem.textContent = '📋 검색 조건 복사';
  copyItem.style.cssText = `
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  `;
  copyItem.onmouseover = () => copyItem.style.background = '#f0f0f0';
  copyItem.onmouseout = () => copyItem.style.background = 'white';
  copyItem.onclick = () => {
    const summaryText = summaryElement.value || '';
    copyToClipboard(summaryText);
    menu.remove();
  };

  const pasteItem = document.createElement('div');
  pasteItem.textContent = '📄 검색 조건 붙여넣기';
  pasteItem.style.cssText = `
    padding: 10px 15px;
    cursor: pointer;
  `;
  pasteItem.onmouseover = () => pasteItem.style.background = '#f0f0f0';
  pasteItem.onmouseout = () => pasteItem.style.background = 'white';
  pasteItem.onclick = () => {
    document.querySelector('.paste-summary-btn').click();
    menu.remove();
  };

  menu.appendChild(copyItem);
  menu.appendChild(pasteItem);
  
  // 메뉴 위치 설정
  menu.style.left = event.pageX + 'px';
  menu.style.top = event.pageY + 'px';
  
  document.body.appendChild(menu);

  // 다른 곳 클릭시 메뉴 닫기
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    });
  }, 10);
}

// 붙여넣은 텍스트를 파싱하여 키워드 그룹 생성
function parseSummaryAndCreateGroups(text) {
  // 기존 키워드 그룹들 제거
  const keywordContainer = document.getElementById('keyword-container');
  keywordContainer.innerHTML = '';

  // 날짜 필터 초기화
  const enableDateFilter = document.getElementById('enable-date-filter');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const dateFilterInputs = document.getElementById('date-filter-inputs');
  
  enableDateFilter.checked = false;
  dateFilterInputs.classList.remove('enabled');
  startDateInput.value = '';
  endDateInput.value = '';

  // 텍스트를 파싱하여 키워드와 연산자, 날짜 필터 추출
  const cleanText = text.replace(/\n/g, ' ').trim();
  
  // 날짜 필터 패턴 감지 및 제거
  const dateFilterPattern = /\("(\d{4}-\d{2}-\d{2})"\[Date - Publication\] : "(\d{4}-\d{2}-\d{2})"\[Date - Publication\]\)|"(\d{4}-\d{2}-\d{2})"\[Date - Publication\] : 3000\[Date - Publication\]|1800\[Date - Publication\] : "(\d{4}-\d{2}-\d{2})"\[Date - Publication\]/g;
  
  let dateMatch;
  let keywordText = cleanText;
  
  while ((dateMatch = dateFilterPattern.exec(cleanText)) !== null) {
    if (dateMatch[1] && dateMatch[2]) {
      // 범위 필터
      startDateInput.value = dateMatch[1];
      endDateInput.value = dateMatch[2];
      enableDateFilter.checked = true;
      dateFilterInputs.classList.add('enabled');
    } else if (dateMatch[3]) {
      // 시작일만
      startDateInput.value = dateMatch[3];
      enableDateFilter.checked = true;
      dateFilterInputs.classList.add('enabled');
    } else if (dateMatch[4]) {
      // 종료일만
      endDateInput.value = dateMatch[4];
      enableDateFilter.checked = true;
      dateFilterInputs.classList.add('enabled');
    }
    
    // 날짜 필터 부분을 텍스트에서 제거
    keywordText = keywordText.replace(dateMatch[0], '').replace(/ AND $/, '').replace(/^ AND /, '').trim();
  }

  // 키워드 부분 파싱
  if (keywordText) {
    const parts = keywordText.split(/\s+/);
    
    let currentKeyword = '';
    let currentOperator = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('"') && part.endsWith('"')) {
        // 따옴표로 둘러싸인 키워드
        currentKeyword = part.slice(1, -1);
        createKeywordGroupWithValue(currentKeyword, currentOperator);
        currentOperator = '';
      } else if (part.toUpperCase() === 'AND' || part.toUpperCase() === 'OR') {
        // 연산자
        currentOperator = part.toUpperCase();
      }
    }
  }
  
  // 미리보기 텍스트박스에 원본 텍스트 설정 (중복 방지)
  const summaryElement = document.getElementById('summary');
  if (summaryElement) {
    summaryElement.value = text; // 원본 텍스트 그대로 유지
  }
  
  // 마지막에 빈 그룹 하나 추가 (updateSummary 호출 안 함)
  createKeywordGroup();
}

// 값과 연산자가 설정된 키워드 그룹 생성
function createKeywordGroupWithValue(keyword, operator) {
  const group = document.createElement('div');
  group.className = 'keyword-group';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter keyword...';
  input.value = keyword;

  const andBtn = document.createElement('button');
  andBtn.textContent = 'AND';
  const orBtn = document.createElement('button');
  orBtn.textContent = 'OR';
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';

  // 복사/붙여넣기 버튼 추가
  const copyBtn = document.createElement('button');
  copyBtn.textContent = '📋';
  copyBtn.title = 'Copy keyword';
  copyBtn.onclick = () => copyToClipboard(input.value);

  const pasteBtn = document.createElement('button');
  pasteBtn.textContent = '📄';
  pasteBtn.title = 'Paste keyword';
  pasteBtn.onclick = () => pasteFromClipboard(input);

  // 연산자 설정
  if (operator === 'AND') {
    andBtn.classList.add('active');
  } else if (operator === 'OR') {
    orBtn.classList.add('active');
  }

  [andBtn, orBtn].forEach(btn => {
    btn.onclick = () => {
      andBtn.classList.remove('active');
      orBtn.classList.remove('active');
      btn.classList.add('active');
      updateSummary();
    };
  });

  deleteBtn.onclick = () => {
    group.remove();
    updateSummary();
  };

  input.oninput = () => {
    updateSummary();
  };

  input.onpaste = () => {
    setTimeout(updateSummary, 100);
  };

  // 키보드 단축키 추가 (Ctrl+C, Ctrl+V)
  input.onkeydown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        copyToClipboard(input.value);
      } else if (e.key === 'v') {
        setTimeout(() => {
          updateSummary();
        }, 10);
      }
    }
  };

  // 컨텍스트 메뉴 비활성화 및 커스텀 메뉴 추가
  input.oncontextmenu = (e) => {
    e.preventDefault();
    showContextMenu(e, input);
  };

  group.appendChild(input);
  group.appendChild(copyBtn);
  group.appendChild(pasteBtn);
  group.appendChild(andBtn);
  group.appendChild(orBtn);
  group.appendChild(deleteBtn);
  
  const keywordContainer = document.getElementById('keyword-container');
  keywordContainer.appendChild(group);
}

// Summary 기능 초기화
initializeSummaryFeatures();

// 저장 기능 관련 전역 변수
let currentSearchResults = [];
let savedQueries = []; // 저장된 쿼리 목록

// 저장 기능 초기화 (강화된 오류 진단)
function initializeSaveFeatures() {
  console.log('🔍 저장 기능 초기화 시작...');
  
  const saveJsonBtn = document.querySelector('.save-json-btn');
  const saveExcelBtn = document.querySelector('.save-excel-btn');
  const savePdfBtn = document.querySelector('.save-pdf-btn');

  // 상세한 진단 정보
  console.log('🎯 버튼 요소 확인:', {
    jsonBtn: !!saveJsonBtn,
    excelBtn: !!saveExcelBtn,
    jsonBtnStatus: saveJsonBtn ? 'found' : 'missing',
    excelBtnStatus: saveExcelBtn ? 'found' : 'missing'
  });

  if (!saveJsonBtn || !saveExcelBtn || !savePdfBtn) {
    console.error('❌ 저장 버튼을 찾을 수 없습니다.');
    console.log('🔍 DOM 상태 확인:', {
      readyState: document.readyState,
      bodyExists: !!document.body,
      resultsControlsExists: !!document.querySelector('.results-controls')
    });
    
    // 3초 후 재시도
    console.log('⏱️ 3초 후 재시도...');
    setTimeout(() => {
      console.log('🔄 저장 기능 재초기화 시도');
      initializeSaveFeatures();
    }, 3000);
    return;
  }

  console.log('✅ 버튼 요소 발견 - 이벤트 등록 시작');
  
  // Debug 버튼 제거됨

  // JSON 저장 버튼 이벤트
  saveJsonBtn.onclick = () => {
    if (currentSearchResults.length > 0) {
      saveAsJson(currentSearchResults);
    } else {
      showToast('저장할 검색 결과가 없습니다.');
    }
  };

  // Excel 저장 버튼 이벤트 (강화된 진단)
  saveExcelBtn.onclick = async () => {
    if (DEBUG_MODE) {
      console.log('📊 Excel 버튼 클릭됨');
      console.log('📋 현재 상태:', {
        dataLength: currentSearchResults.length,
        xlsxLoaded: typeof XLSX !== 'undefined',
        xlsxReady: window.xlsxReady,
        buttonDisabled: saveExcelBtn.disabled
      });
    }
    
    // 버튼이 비활성화된 경우 경고
    if (saveExcelBtn.disabled) {
      if (DEBUG_MODE) console.warn('⚠️ Excel 버튼이 비활성화되어 있습니다.');
      showToast('먼저 검색을 실행해주세요.');
      return;
    }
    
    if (currentSearchResults.length > 0) {
      if (DEBUG_MODE) console.log('✅ 데이터 있음 - Excel 저장 진행');
      
      // Async function call with error handling
      try {
        await saveAsExcel(currentSearchResults);
      } catch (error) {
        console.error('Excel 저장 오류:', error);
        showToast('Excel 저장 중 오류가 발생했습니다. CSV로 다운로드합니다.');
        saveAsCSV(currentSearchResults);
      }
    } else {
      if (DEBUG_MODE) console.warn('⚠️ 저장할 데이터가 없음');
      showToast('저장할 검색 결과가 없습니다. 먼저 검색을 실행해주세요.');
    }
  };

  // PDF 저장 버튼 이벤트
  savePdfBtn.onclick = async () => {
    if (savePdfBtn.disabled) { showToast('먼저 검색을 실행해주세요.'); return; }
    if (!currentSearchResults.length) { showToast('저장할 검색 결과가 없습니다.'); return; }
    try {
      await saveAsPDF(currentSearchResults);
    } catch (e) {
      console.error('PDF 저장 오류:', e);
      showToast('PDF 저장 중 오류가 발생했습니다.');
    }
  };

  if (DEBUG_MODE) console.log('저장 기능 초기화 완료');
}

// JSON 형태로 저장
function saveAsJson(data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pubmed_search_results_${getFormattedDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('JSON 파일이 다운로드되었습니다.');
  } catch (error) {
    console.error('JSON 저장 실패:', error);
    showToast('JSON 저장에 실패했습니다.');
  }
}

// Excel 진단 도구
function diagnoseExcelIssue() {
  const diagnostics = {
    xlsxLoaded: typeof XLSX !== 'undefined',
    xlsxVersion: typeof XLSX !== 'undefined' ? XLSX.version : 'N/A',
    dataAvailable: currentSearchResults && currentSearchResults.length > 0,
    dataLength: currentSearchResults ? currentSearchResults.length : 0,
    browserSupport: {
      blob: typeof Blob !== 'undefined',
      url: typeof URL !== 'undefined',
      download: 'download' in document.createElement('a')
    }
  };
  
  console.log('🔍 Excel 진단 결과:', diagnostics);
  return diagnostics;
}

// 간단한 CSV 대안 함수
function saveAsCSV(data) {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      showToast('저장할 데이터가 없습니다.');
      return;
    }

    // CSV 헤더
    const headers = ['번호', 'PMID', '제목', '저자', '출처', '발행일', '초록'];
    
    // CSV 데이터 생성
    const csvData = data.map((item, index) => [
      index + 1,
      `"${(item.pmid || '').replace(/"/g, '""')}"`,
      `"${(item.title || '제목 없음').replace(/"/g, '""')}"`,
      `"${(Array.isArray(item.authors) ? item.authors.join(', ') : (item.authors || '저자 정보 없음')).replace(/"/g, '""')}"`,
      `"${(item.source || '출처 없음').replace(/"/g, '""')}"`,
      `"${(item.pubdate || '').replace(/"/g, '""')}"`,
      `"${(item.abstract || '초록 없음').replace(/"/g, '""').substring(0, 1000)}"` // CSV는 길이 제한
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // BOM 추가 (한글 깨짐 방지)
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 파일 다운로드
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const fileName = `pubmed_results_${dateStr}_${timeStr}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    showToast(`CSV 파일이 다운로드되었습니다: ${fileName}`);
    
  } catch (error) {
    console.error('CSV 저장 오류:', error);
    showToast('CSV 저장에도 실패했습니다.');
  }
}

// Debug mode flag - set to false for production
const DEBUG_MODE = false;

// 전역 에러 핸들러 (진단용)
if (!window.__globalErrorHandlerAdded) {
  window.__globalErrorHandlerAdded = true;
  window.addEventListener('error', (e) => {
    console.error('[GlobalError]', e.message, e.filename, e.lineno + ':' + e.colno, e.error);
    try {
      const panel = document.getElementById('results');
      if (panel) {
        const msg = `⚠️ 스크립트 오류 발생:\n${e.message}\n(${e.filename}:${e.lineno})`;
        const existing = panel.textContent || '';
        panel.textContent = msg + (existing ? '\n\n' + existing : '');
      }
    } catch(_) { /* noop */ }
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[UnhandledPromiseRejection]', e.reason);
    try {
      const panel = document.getElementById('results');
      if (panel) {
        const msg = `⚠️ 비동기 오류(unhandled rejection):\n${e.reason && e.reason.message ? e.reason.message : e.reason}`;
        const existing = panel.textContent || '';
        panel.textContent = msg + (existing ? '\n\n' + existing : '');
      }
    } catch(_) { /* noop */ }
  });
}

// Simplified Excel export: directly use the JSON rendered in results panel (minimal transformation)
async function saveAsExcel(data) {
  try {
    // 1) Ensure XLSX is loaded
    if (window.xlsxLoadPromise) {
      try { await window.xlsxLoadPromise; } catch { showToast('XLSX 로드 실패'); return; }
    }
    if (typeof XLSX === 'undefined') { showToast('XLSX 미로드'); return; }

    // 2) If no data passed, parse from results <pre>
    if (!data) {
      const resultsEl = document.getElementById('results');
      if (!resultsEl) { showToast('결과 영역 없음'); return; }
      // Expect <pre>{json}</pre>
      const pre = resultsEl.querySelector('pre');
      if (!pre) { showToast('JSON 결과가 없습니다'); return; }
      try {
        data = JSON.parse(pre.textContent.trim());
      } catch (e) {
        console.error('JSON 파싱 실패:', e);
        showToast('JSON 파싱 실패');
        return;
      }
    }

    if (!Array.isArray(data) || data.length === 0) { showToast('내보낼 데이터 없음'); return; }

    // 3) Excel 셀 제한(32767) 보호용 단순 트렁케이션
    const MAX_CELL = 32760; // 약간 여유
    const sanitize = (v) => {
      if (v == null) return '';
      const s = Array.isArray(v) ? v.join(', ') : String(v);
      return s.length > MAX_CELL ? s.slice(0, MAX_CELL - 7) + '...(cut)' : s;
    };

    // 4) 그대로 필드 유지 (원본 JSON 구조 존중)
    const sheetData = data.map((row, idx) => {
      const out = {};
      for (const k of Object.keys(row)) {
        out[k] = sanitize(row[k]);
      }
      // 행 번호 추가 (선택)
      out._row = idx + 1;
      return out;
    });

    const ws = XLSX.utils.json_to_sheet(sheetData);
    // 컬럼 자동 너비 산출 (간단 추정)
    const cols = Object.keys(sheetData[0]);
    ws['!cols'] = cols.map(c => ({ wch: Math.min(60, Math.max(10, (sheetData[0][c]||'').toString().length, 12)) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    const filename = `pubmed_results_${getFormattedDate()}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast('Excel 다운로드 완료');
  } catch (err) {
    console.error('단순 Excel 내보내기 오류:', err);
    showToast('Excel 내보내기 실패');
  }
}

// 날짜 포맷팅 함수 (파일명용)
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}_${hour}${minute}`;
}

// 저장 버튼 활성화/비활성화
function updateSaveButtons(hasResults) {
  const saveJsonBtn = document.querySelector('.save-json-btn');
  const saveExcelBtn = document.querySelector('.save-excel-btn');
  const savePdfBtn = document.querySelector('.save-pdf-btn');
  
  if (saveJsonBtn && saveExcelBtn && savePdfBtn) {
    saveJsonBtn.disabled = !hasResults;
    saveExcelBtn.disabled = !hasResults;
    savePdfBtn.disabled = !hasResults;
  }
}

// DOM 준비 완료 후 초기화 (안전한 초기화)
document.addEventListener('DOMContentLoaded', function() {
  if (DEBUG_MODE) console.log('📄 DOM 로드 완료 - 저장 기능 초기화 시작');
  
  // 저장 기능 초기화
  setTimeout(() => {
    initializeSaveFeatures();
    if (DEBUG_MODE) console.log('💾 저장 기능 초기화 완료');
  }, 100);
  
  // 날짜 필터 기능 초기화
  setTimeout(() => {
    initializeDateFilter();
    if (DEBUG_MODE) console.log('📅 날짜 필터 초기화 완료');
  }, 150);
});

// 백업 초기화 (이미 DOM이 로드된 경우)
if (document.readyState === 'loading') {
  if (DEBUG_MODE) console.log('⏳ DOM 로드 대기 중...');
} else {
  if (DEBUG_MODE) console.log('✅ DOM 이미 로드됨 - 즉시 초기화');
  setTimeout(() => {
    initializeSaveFeatures();
    initializeDateFilter();
  }, 50);
}

// Production code - debug functions removed

// ===== PDF 내보내기 기능 =====
// html2pdf 동적 로더 (한 번만 로드)
let __pdfLibLoading = null;
function ensureHtml2Pdf() {
  if (typeof html2pdf !== 'undefined') return Promise.resolve();
  if (__pdfLibLoading) return __pdfLibLoading;
  const cdns = [
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    'https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js'
  ];
  __pdfLibLoading = new Promise((resolve, reject) => {
    let idx = 0;
    const tryNext = () => {
      if (idx >= cdns.length) { reject(new Error('html2pdf 로드 실패')); return; }
      const s = document.createElement('script');
      s.src = cdns[idx];
      s.onload = () => { if (typeof html2pdf !== 'undefined') resolve(); else { idx++; tryNext(); } };
      s.onerror = () => { idx++; tryNext(); };
      document.head.appendChild(s);
    };
    tryNext();
  });
  return __pdfLibLoading;
}

async function saveAsPDF(data) {
  await ensureHtml2Pdf();
  if (!Array.isArray(data) || !data.length) throw new Error('데이터 없음');

  // 사용자 / 검색 메타데이터
  let loginId = 'Guest';
  try {
    const stored = sessionStorage.getItem('currentUser');
    if (stored) loginId = JSON.parse(stored).username || loginId;
  } catch(_){}
  const now = new Date();
  const todayStr = now.toISOString().slice(0,10);
  const printDateTime = now.toLocaleString();
  
  // 검색 쿼리 가져오기: 텍스트박스 내용 우선, 없으면 buildSearchQuery() 사용
  const summaryTextarea = document.getElementById('summary');
  const summaryContent = summaryTextarea ? summaryTextarea.value.trim() : '';
  const searchQuery = (summaryContent && summaryContent !== '검색 조건이 없습니다.') 
    ? summaryContent 
    : buildSearchQuery();

  // 결과 테이블 HTML 생성 (간결/미려 스타일)
  const tableHeaders = ['PMID','Title','Authors','Journal','Date','Abstract'];
  const rowsHtml = data.map(r => {
    const authors = Array.isArray(r.authors)? r.authors.join(', ') : (r.authors||'');
    const absShort = (r.abstract||'').length>500 ? r.abstract.slice(0,500)+'…' : (r.abstract||'');
    return `<tr>
      <td style="font-weight:600;">${r.pmid||''}</td>
      <td>${escapeForPdf(r.title||'')}</td>
      <td>${escapeForPdf(authors)}</td>
      <td>${escapeForPdf(r.source||'')}</td>
      <td>${escapeForPdf(r.pubdate||'')}</td>
      <td style="font-size:0.7rem; line-height:1.25;">${escapeForPdf(absShort)}</td>
    </tr>`; }).join('');

  const container = document.createElement('div');
  container.style.cssText = 'font-family:\'Noto Sans KR\', Arial, sans-serif; color:#222; width:100%;';
  container.innerHTML = `
  <div style="border-bottom:2px solid #6a1b9a; margin-bottom:12px; padding-bottom:6px;">
    <div style="font-size:1.1rem; font-weight:700; color:#4b0082;">PubMed Search Report</div>
    <div style="display:flex; gap:1.5rem; font-size:0.7rem; margin-top:4px; color:#555;">
      <span>Generated: <strong>${printDateTime}</strong></span>
      <span>Search Date: <strong>${todayStr}</strong></span>
      <span>User: <strong>${loginId}</strong></span>
      <span>Records: <strong>${data.length}</strong></span>
    </div>
  </div>
  <div style="margin-bottom:10px;">
    <div style="font-size:0.75rem; font-weight:600; color:#333; margin-bottom:4px;">Search Query</div>
    <div style="background:#f5f0ff; border:1px solid #e0d4f7; border-radius:4px; padding:6px 8px; font-size:0.65rem; white-space:pre-wrap; line-height:1.3;">${escapeForPdf(searchQuery||'(none)')}</div>
  </div>
  <table style="width:100%; border-collapse:collapse; font-size:0.6rem;">
    <thead>
      <tr style="background:#ede7f6;">
        ${tableHeaders.map(h=>`<th style=\"border:1px solid #d1c4e9; padding:4px 6px; text-align:left; font-size:0.65rem; font-weight:700;\">${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div style="margin-top:12px; border-top:1px solid #ccc; padding-top:6px; font-size:0.55rem; text-align:right; color:#666;">
    Printed on ${printDateTime}
  </div>`;

  // html2pdf 옵션 (용지 A4, 여백 등)
  const opt = {
    margin:       [10,10,10,10],
    filename:     `pubmed_report_${todayStr}.pdf`,
    image:        { type: 'jpeg', quality: 0.95 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().from(container).set(opt).save();
  showToast('PDF 다운로드 완료');
}

function escapeForPdf(str){
  return String(str).replace(/[&<>]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[s]));
}

// PubMed 쿼리 검증 함수
function validatePubMedQuery(query) {
  const errors = [];
  let isValid = true;

  // 기본 검증: 빈 쿼리
  if (!query || query.trim() === '') {
    errors.push('빈 쿼리입니다.');
    isValid = false;
    return { isValid, errors };
  }

  // 괄호 균형 검증
  const openBrackets = (query.match(/\(/g) || []).length;
  const closeBrackets = (query.match(/\)/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`괄호 불균형: 여는 괄호(${openBrackets}개), 닫는 괄호(${closeBrackets}개)`);
    isValid = false;
  }

  // 따옴표 균형 검증
  const quotes = (query.match(/"/g) || []).length;
  if (quotes % 2 !== 0) {
    errors.push(`따옴표 불균형: ${quotes}개 (짝수여야 함)`);
    isValid = false;
  }

  // Boolean 연산자 검증
  const invalidBooleanPattern = /(AND\s+AND|OR\s+OR|NOT\s+NOT|\bAND\s*$|\bOR\s*$|^\s*AND|\^\s*OR)/i;
  if (invalidBooleanPattern.test(query)) {
    errors.push('잘못된 Boolean 연산자 사용');
    isValid = false;
  }

  // 연속된 연산자 검증
  const consecutiveOperators = /(AND\s+OR|OR\s+AND|NOT\s+AND|NOT\s+OR)\s+/i;
  if (consecutiveOperators.test(query)) {
    errors.push('연속된 Boolean 연산자 사용');
    isValid = false;
  }

  // 필드 태그 검증
  const fieldTags = query.match(/\[([^\]]+)\]/g) || [];
  const validFields = ['Title', 'Author', 'Abstract', 'MeSH Terms', 'Publication Date', 'Journal', 'DOI', 'PMID', 'All Fields', 'tiab', 'au', 'mh', 'dp', 'ta', 'doi', 'Date - Publication'];
  
  fieldTags.forEach(tag => {
    const field = tag.slice(1, -1); // 대괄호 제거
    if (!validFields.some(validField => validField.toLowerCase() === field.toLowerCase())) {
      errors.push(`알 수 없는 필드 태그: ${tag}`);
      isValid = false;
    }
  });

  // 날짜 형식 검증 (YYYY, YYYY/MM, YYYY/MM/DD)
  const datePattern = /(\d{4}(?:\/\d{2}(?:\/\d{2})?)?)/g;
  const dates = query.match(datePattern) || [];
  dates.forEach(date => {
    const parts = date.split('/');
    const year = parseInt(parts[0]);
    const month = parts[1] ? parseInt(parts[1]) : null;
    const day = parts[2] ? parseInt(parts[2]) : null;
    
    if (year < 1900 || year > new Date().getFullYear() + 5) {
      errors.push(`유효하지 않은 연도: ${year}`);
      isValid = false;
    }
    if (month && (month < 1 || month > 12)) {
      errors.push(`유효하지 않은 월: ${month}`);
      isValid = false;
    }
    if (day && (day < 1 || day > 31)) {
      errors.push(`유효하지 않은 일: ${day}`);
      isValid = false;
    }
  });

  // 특수문자 검증 (PubMed에서 문제가 될 수 있는 문자들)
  const problematicChars = /[<>{}\\]/;
  if (problematicChars.test(query)) {
    errors.push('문제가 될 수 있는 특수문자 포함: < > { } \\');
    isValid = false;
  }

  // 쿼리 길이 검증 (PubMed 제한)
  if (query.length > 8000) {
    errors.push(`쿼리가 너무 깁니다 (${query.length}자, 최대 8000자)`);
    isValid = false;
  }

  return { isValid, errors };
}

// 검증 결과 모달 표시
function showValidationModal(title, message, isSuccess) {
  // 기존 모달 제거
  const existingModal = document.querySelector('.validation-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // 모달 생성
  const modal = document.createElement('div');
  modal.className = 'validation-modal';
  modal.innerHTML = `
    <div class="validation-modal-content">
      <div class="validation-modal-header ${isSuccess ? 'success' : 'error'}">
        <h3>${title}</h3>
        <span class="validation-modal-close">&times;</span>
      </div>
      <div class="validation-modal-body">
        <pre>${message}</pre>
      </div>
      <div class="validation-modal-footer">
        <button class="validation-modal-ok-btn">OK</button>
      </div>
    </div>
  `;

  // 모달 스타일
  const style = document.createElement('style');
  style.textContent = `
    .validation-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .validation-modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .validation-modal-header {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .validation-modal-header.success {
      background-color: #d4edda;
      color: #155724;
    }
    .validation-modal-header.error {
      background-color: #f8d7da;
      color: #721c24;
    }
    .validation-modal-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }
    .validation-modal-close {
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .validation-modal-close:hover {
      color: #000;
    }
    .validation-modal-body {
      padding: 1.5rem;
    }
    .validation-modal-body pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
      font-family: inherit;
      line-height: 1.4;
    }
    .validation-modal-footer {
      padding: 1rem;
      border-top: 1px solid #eee;
      text-align: right;
    }
    .validation-modal-ok-btn {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .validation-modal-ok-btn:hover {
      background-color: #45a049;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(modal);

  // 이벤트 리스너
  const closeModal = () => {
    modal.remove();
    style.remove();
  };

  modal.querySelector('.validation-modal-close').onclick = closeModal;
  modal.querySelector('.validation-modal-ok-btn').onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // ESC 키로 모달 닫기
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

// 성능 테스트 실행 함수
function runPerformanceTests(query) {
  const startTime = performance.now();
  let memoryBefore = 0;
  
  // 메모리 사용량 측정 (가능한 경우)
  if (performance.memory) {
    memoryBefore = performance.memory.usedJSHeapSize;
  }
  
  // 쿼리 검증 실행
  const validationResult = validatePubMedQuery(query);
  
  const endTime = performance.now();
  const validationTime = (endTime - startTime).toFixed(2);
  
  let memoryAfter = 0;
  if (performance.memory) {
    memoryAfter = performance.memory.usedJSHeapSize;
  }
  
  // 메모리 사용량 계산 (MB 단위)
  const memoryUsed = performance.memory 
    ? ((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(2)
    : 'N/A';
  
  // 쿼리 복잡도 계산
  const complexityScore = calculateQueryComplexity(query);
  
  // 성능 등급 계산
  const performanceGrade = calculatePerformanceGrade(validationTime, complexityScore);
  
  return {
    validation: {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      time: validationTime
    },
    memory: {
      used: memoryUsed,
      supported: !!performance.memory
    },
    complexity: {
      score: complexityScore,
      level: getComplexityLevel(complexityScore)
    },
    performance: {
      grade: performanceGrade.grade,
      speed: performanceGrade.speed
    }
  };
}

// 쿼리 복잡도 계산
function calculateQueryComplexity(query) {
  let score = 0;
  
  // 기본 점수
  score += Math.min(query.length / 10, 20); // 길이 (최대 20점)
  
  // Boolean 연산자 개수
  const booleanOps = (query.match(/\b(AND|OR|NOT)\b/gi) || []).length;
  score += booleanOps * 5; // 연산자당 5점
  
  // 괄호 중첩 깊이
  const maxNesting = calculateMaxNesting(query);
  score += maxNesting * 10; // 중첩당 10점
  
  // 필드 태그 개수
  const fieldTags = (query.match(/\[[^\]]+\]/g) || []).length;
  score += fieldTags * 3; // 필드당 3점
  
  // 따옴표로 감싼 구문 개수
  const quotedPhrases = (query.match(/"[^"]+"/g) || []).length;
  score += quotedPhrases * 2; // 구문당 2점
  
  // 와일드카드 개수
  const wildcards = (query.match(/\*/g) || []).length;
  score += wildcards * 1; // 와일드카드당 1점
  
  return Math.min(Math.round(score), 100); // 최대 100점
}

// 괄호 최대 중첩 깊이 계산
function calculateMaxNesting(query) {
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (let char of query) {
    if (char === '(') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === ')') {
      currentDepth--;
    }
  }
  
  return maxDepth;
}

// 복잡도 레벨 반환
function getComplexityLevel(score) {
  if (score <= 20) return '간단';
  if (score <= 40) return '보통';
  if (score <= 70) return '복잡';
  return '매우 복잡';
}

// 성능 등급 계산
function calculatePerformanceGrade(timeMs, complexityScore) {
  const time = parseFloat(timeMs);
  let grade = 'A+';
  let speed = '매우 빠름';
  
  // 복잡도를 고려한 성능 평가
  const expectedTime = complexityScore * 0.1 + 1; // 복잡도에 따른 예상 시간
  const performanceRatio = time / expectedTime;
  
  if (performanceRatio > 3) {
    grade = 'D';
    speed = '느림';
  } else if (performanceRatio > 2) {
    grade = 'C';
    speed = '보통';
  } else if (performanceRatio > 1.5) {
    grade = 'B';
    speed = '빠름';
  } else if (performanceRatio > 1) {
    grade = 'A';
    speed = '매우 빠름';
  }
  
  return { grade, speed };
}