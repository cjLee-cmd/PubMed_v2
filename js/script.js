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
  // (이벤트 위임 로직은 search() 내에서 설정됨)

  // 함수 종료
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

  summary.textContent = formattedText || '검색 조건이 없습니다.';
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
  const rawQuery = summary.textContent.trim();
  if (!validateSearchQuery(rawQuery)) return;

  const apiKey = CONFIG.NCBI_API_KEY;
  const resultsEl = document.getElementById('results');
  resultsEl.innerHTML = `<p>🔍 검색 중입니다... "${rawQuery}"</p>`;

  // 날짜 필터가 포함된 검색 쿼리 생성
  let searchQuery = buildSearchQuery();
  
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
      return {
        pmid: id,
        title: item.title || '제목 없음',
        authors: (item.authors || []).map(a => a.name),
        source: item.source || '',
        pubdate: item.pubdate || '',
        abstract: abstractList[index] || '초록 없음'
      };
    });

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
  return `<tr class="result-row" data-pmid="${row.pmid}" data-abstract="${encodeURIComponent(row.abstract || '')}" data-title="${encodeURIComponent(row.title||'')}" data-authors="${encodeURIComponent(authors)}" data-source="${encodeURIComponent(row.source||'')}" data-pubdate="${encodeURIComponent(row.pubdate||'')}">`
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

  // (로컬 정의 제거됨) 전역 escapeHtml 유틸 사용

    resultsEl.innerHTML = buildTable(resultList) + '<div class="results-hint">Rows: '+resultList.length+'</div>';

    // Abstract 확장 이벤트 위임 (지속 바인딩)
    if(!resultsEl.__abstractHandlerBound){
      resultsEl.addEventListener('click', function(e){
        const btn = e.target.closest('button.abs-more-btn');
        if(!btn) return;
        const tr = btn.closest('tr');
        if(!tr) return;
        const data = {
          pmid: tr.getAttribute('data-pmid') || '',
          abstract: decodeURIComponent(tr.getAttribute('data-abstract')||''),
          title: decodeURIComponent(tr.getAttribute('data-title')||''),
          authors: decodeURIComponent(tr.getAttribute('data-authors')||''),
          source: decodeURIComponent(tr.getAttribute('data-source')||''),
          pubdate: decodeURIComponent(tr.getAttribute('data-pubdate')||'')
        };
        openAbstractModal(data);
      });
      resultsEl.__abstractHandlerBound = true;
    }

    ensureAbstractModal();
  } catch (error) {
    console.error(error);
    resultsEl.innerHTML = `<p style="color: red;">❌ 검색 중 오류가 발생했습니다.</p>`;
  }
}

// 전역 XSS 방지 유틸 (표 렌더 + AI 분석 공용)
function escapeHtml(str){
  return String(str).replace(/[&<>"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s]));
}

// ===== 새 모달 생성/표시 (보고서형 디자인) =====
function ensureAbstractModal(){
  let modal = document.getElementById('abstract-modal');
  if(modal) return;
  modal = document.createElement('div');
  modal.id='abstract-modal';
  modal.className='abstract-modal';
  modal.innerHTML = `
    <div class="abstract-dialog" role="dialog" aria-modal="true">
      <div class="abstract-header">
        <div class="header-main">
          <div class="pmid-badge" id="abstract-pmid"></div>
          <h3 id="abstract-title" class="abstract-title">Abstract Detail</h3>
        </div>
        <div class="header-actions">
          <button id="ai-analyze-btn" class="btn btn-ai">AI 분석</button>
          <button data-close class="btn btn-close" aria-label="닫기">닫기 ✕</button>
        </div>
      </div>
      <div class="abstract-meta-grid">
        <div><label>Authors</label><div id="abstract-authors" class="meta-val"></div></div>
        <div><label>Journal</label><div id="abstract-source" class="meta-val"></div></div>
        <div><label>Date</label><div id="abstract-pubdate" class="meta-val"></div></div>
      </div>
      <div id="ai-analysis-box" class="ai-analysis-box" style="display:none;">
        <div class="ai-status">🔍 AI 분석 준비됨 (Gemini)</div>
        <div class="ai-content" id="ai-analysis-content"></div>
      </div>
      <div class="abstract-text-wrapper">
        <pre id="abstract-full-text" class="abstract-text"></pre>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e)=>{ if(e.target===modal || e.target.hasAttribute('data-close')) closeAbstractModal(); });
}
function openAbstractModal(data){
  ensureAbstractModal();
  const modal = document.getElementById('abstract-modal');
  modal.style.display='flex';
  const { pmid, abstract, title, authors, source, pubdate } = data;
  const pmidEl = document.getElementById('abstract-pmid');
  const titleEl = document.getElementById('abstract-title');
  const authorsEl = document.getElementById('abstract-authors');
  const sourceEl = document.getElementById('abstract-source');
  const pubEl = document.getElementById('abstract-pubdate');
  const pre = document.getElementById('abstract-full-text');
  if(pmidEl) pmidEl.innerHTML = pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${escapeHtml(pmid)}/" target="_blank" rel="noopener">PMID ${escapeHtml(pmid)}</a>` : '';
  if(titleEl) titleEl.textContent = title || 'Abstract Detail';
  if(authorsEl) authorsEl.textContent = authors || '';
  if(sourceEl) sourceEl.textContent = source || '';
  if(pubEl) pubEl.textContent = pubdate || '';
  if(pre) pre.textContent = abstract || '';

  const aiBox = document.getElementById('ai-analysis-box');
  const aiBtn = document.getElementById('ai-analyze-btn');
  const aiContent = document.getElementById('ai-analysis-content');
  if(aiBox && aiBtn && aiContent){
    aiBox.style.display='none';
    aiContent.textContent='';
    aiBtn.disabled = false;
    aiBtn.textContent='AI 분석';
    aiBtn.onclick = async ()=>{
      aiBtn.disabled = true;
      aiBox.style.display='block';
      const statusEl = aiBox.querySelector('.ai-status');
      if(statusEl) statusEl.textContent='⏳ Gemini 분석 중...';
      try {
        const analysis = await analyzeAbstractWithGemini(abstract||'');
        if(statusEl) statusEl.textContent='✅ 분석 완료';
        aiContent.innerHTML = renderAIAnalysis(analysis);
      } catch(err){
        console.error('AI 분석 실패', err);
        if(statusEl) statusEl.textContent='❌ 분석 실패';
        aiContent.textContent = (err && err.message) ? err.message : '분석 중 오류 발생';
      } finally {
        aiBtn.disabled = false; aiBtn.textContent='재분석';
      }
    };
  }
}
function closeAbstractModal(){
  const modal = document.getElementById('abstract-modal');
  if(modal) modal.style.display='none';
}

// ====== Gemini 기반 초록 분석 ======
const GEMINI_PROMPT_PREFIX = `다음 문헌 초록을 분석하여, 약물 이상사례 보고서에 필요한 4가지 핵심 정보를 JSON 문자열로만 출력. \n필수 키: patient_info, reporter_info, adverse_event_info, suspected_drug_info. \n각 값은 한국어 요약 1~3문장. 정보 없으면 'N/A'. 다른 텍스트 금지.\n초록:\n`;

async function analyzeAbstractWithGemini(abstractText){
  if(!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY.startsWith('YOUR_')){
    throw new Error('Gemini API Key 미설정 (config.js 수정 필요)');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(CONFIG.GEMINI_MODEL || 'gemini-1.5-flash')}:generateContent?key=${encodeURIComponent(CONFIG.GEMINI_API_KEY)}`;
  const body = {
    contents: [
      { role:'user', parts:[{ text: GEMINI_PROMPT_PREFIX + abstractText }] }
    ],
    generationConfig: { temperature:0.1 }
  };
  const res = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  if(!res.ok){
    const t = await res.text();
    throw new Error('Gemini 응답 오류: '+res.status+' '+t.slice(0,200));
  }
  const data = await res.json();
  const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
  if(!text) throw new Error('Gemini 응답 파싱 실패');
  let cleaned = text.trim();
  // 코드블록 감싸짐 제거
  cleaned = cleaned.replace(/^```json\n?/i,'').replace(/```$/,'').trim();
  let parsed; try { parsed = JSON.parse(cleaned); } catch(e){ throw new Error('JSON 파싱 실패: '+e.message); }
  return parsed;
}

function renderAIAnalysis(obj){
  const safe = (s)=>!s||typeof s!=='string' ? 'N/A' : escapeHtml(s);
  return `<div class="ai-grid">`
    + `<div><strong>① 환자 정보</strong><br>${safe(obj.patient_info)}</div>`
    + `<div><strong>② 보고자 정보</strong><br>${safe(obj.reporter_info)}</div>`
    + `<div><strong>③ 이상사례 정보</strong><br>${safe(obj.adverse_event_info)}</div>`
    + `<div><strong>④ 의심 의약품 정보</strong><br>${safe(obj.suspected_drug_info)}</div>`
    + `</div>`
    + `<div style="margin-top:.5rem;font-size:.65rem;opacity:.7;">AI 자동 추출 결과이며 원문 임상적 검증 필요함.</div>`;
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

  // 복사 버튼 이벤트
  copySummaryBtn.onclick = () => {
    const summaryText = summaryElement.textContent || summaryElement.innerText;
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
        const summaryText = summaryElement.textContent || summaryElement.innerText;
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
    const summaryText = summaryElement.textContent || summaryElement.innerText;
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
  
  // 마지막에 빈 그룹 하나 추가
  createKeywordGroup();
  updateSummary();
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

// 테스트용 샘플 데이터 생성 (개발용)
function createSampleData() {
  return [
    {
      pmid: '12345678',
      title: '테스트 논문 제목 1',
      authors: ['김철수', '이영희', '박민수'],
      source: 'Nature Medicine',
      pubdate: '2024-01-15',
      abstract: '이것은 테스트용 초록입니다. Excel 내보내기 기능을 테스트하기 위한 샘플 데이터입니다.'
    },
    {
      pmid: '87654321',
      title: 'Sample Research Paper 2',
      authors: ['John Smith', 'Jane Doe'],
      source: 'Science Journal',
      pubdate: '2024-02-20',
      abstract: 'This is a sample abstract for testing Excel export functionality.'
    }
  ];
}

// Excel 진단 함수 (콘솔에서 호출 가능)
window.diagnoseExcel = function() {
  if (DEBUG_MODE) console.log('🔍 Excel 진단을 시작합니다...');
  const result = diagnoseExcelIssue();
  if (DEBUG_MODE) {
    console.table(result);
    console.log('🔍 브라우저 지원 현황:', result.browserSupport);
  }
  return result;
};

// CSV 테스트 함수 (콘솔에서 호출 가능)
window.testCSVExport = function() {
  if (DEBUG_MODE) console.log('📊 CSV 내보내기 테스트를 시작합니다...');
  const sampleData = createSampleData();
  currentSearchResults = sampleData;
  updateSaveButtons(true);
  saveAsCSV(sampleData);
  if (DEBUG_MODE) console.log('✅ CSV 테스트 완료');
};

// Excel 테스트 함수 (개발용 - 콘솔에서 호출 가능)
window.testExcelExport = function() {
  if (DEBUG_MODE) console.log('📈 Excel 내보내기 테스트를 시작합니다...');
  const sampleData = createSampleData();
  currentSearchResults = sampleData;
  updateSaveButtons(true);
  saveAsExcel(sampleData);
  if (DEBUG_MODE) console.log('✅ Excel 테스트 완료');
};

// 종합 테스트 함수 (콘솔에서 호출 가능)
window.runFullTest = function() {
  if (DEBUG_MODE) console.log('🚀 전체 내보내기 테스트를 시작합니다...');
  
  // 1. 진단
  if (DEBUG_MODE) console.log('1️⃣ 진단 단계');
  const diagnostics = diagnoseExcel();
  
  // 2. CSV 테스트
  if (DEBUG_MODE) console.log('2️⃣ CSV 테스트');
  testCSVExport();
  
  // 3. Excel 테스트 (XLSX가 로드된 경우만)
  if (diagnostics.xlsxLoaded) {
    if (DEBUG_MODE) console.log('3️⃣ Excel 테스트');
    setTimeout(() => testExcelExport(), 1000);
  } else {
    if (DEBUG_MODE) console.warn('⚠️ XLSX 라이브러리가 로드되지 않아 Excel 테스트를 건너뜁니다.');
  }
  
  if (DEBUG_MODE) console.log('🎯 전체 테스트 완료 예정');
};

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
  const searchQuery = buildSearchQuery();

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

// EOF guard: ensure no unclosed blocks