# PubMed 검색 · 사용자 인증 · 결과 내보내기 통합 도구 설명서 (음슴체)

## 1. 개요
웹 기반 PubMed 논문 검색 + 사용자 인증 + 결과 다중 포맷 저장 지원 도구임. NCBI E-utilities (esearch / esummary / efetch) 연계하여 최대 3단계 호출로 메타데이터 + 초록 수집함. 검색식 동적 구성, 날짜 필터, 키워드 그룹 AND/OR 논리 조합 가능함. 결과는 표 렌더링, JSON/Excel/PDF 저장 지원함. 게스트 / 사용자 / 마스터 권한 구분 존재함.

## 2. 전체 구조
디렉터리 구성 요약함:
- index.html: 로그인/회원가입/마스터 관리 진입 페이지임
- main.html: 검색 UI + 결과 패널 페이지임
- js/config.js: 전역 설정 및 NCBI API Key 보관함
- js/auth.js: 로그인 · 회원관리 · 마스터 패널 로직 담음
- js/main-auth.js: 메인 페이지 접근 시 세션 상태 확인 · UI 표시 제어 담당함
- js/script.js: 검색 키워드 그룹, 날짜 필터, PubMed API 연동, 결과 테이블 렌더링, 저장 기능, PDF/Excel/CSV 내보내기, 클립보드/컨텍스트 메뉴, 모달, 토스트 등 핵심 기능 포함함
- css/login.css: 인증/로그인 화면 스타일
- css/style.css: 메인 검색 및 결과 레이아웃 스타일
- assets/APTS_Logo.png: 로고 이미지

## 3. 실행 흐름 요약
1) 사용자가 index.html 접속함 → sessionStorage에 currentUser 없으면 로그인/회원가입/게스트 선택 가능함
2) 로그인 성공 시 role이 user 또는 guest면 main.html로 이동함. master면 index.html 내 마스터 패널 표시 가능함
3) main.html 로드 시 main-auth.js가 세션 검사 → 없으면 로그인 리다이렉트 다이얼로그 출력함 → 게스트 계속 / 로그인 이동 선택 가능함
4) script.js 초기화: 키워드 그룹 1개 생성 → 날짜 필터 및 저장 기능 초기화 → XLSX, html2pdf 필요 시 동적 로드
5) 사용자 키워드 입력 + AND/OR 지정 → summary 영역 실시간 갱신 → 날짜 필터 체크 시 논문 발행일 range 조건 추가됨
6) Search 버튼 클릭 → buildSearchQuery()가 검색식 조립 → validateSearchQuery() 검증 → esearch → PMID 목록 획득 → esummary → 메타데이터 → efetch → 초록 텍스트 → 통합 후 표 렌더링
7) 결과 배열 currentSearchResults에 저장됨 → JSON/Excel/PDF 버튼 활성화됨
8) 사용자 필요 시 내보내기 (JSON / Excel / PDF / 실패 시 CSV fallback) 수행함

## 4. 주요 기능 상세

### 4.1 키워드 그룹 관리
- 동적 div.keyword-group 반복 구조임
- 각 그룹: input + 📋(copy) + 📄(paste) + AND 버튼 + OR 버튼 + Delete 버튼 포함함
- 사용자가 키워드 입력 후 연산자 활성화하면 마지막 그룹일 때 새 그룹 자동 생성함 (maybeAddNewGroup())
- 공백 또는 미입력 그룹은 검색식 포함 제외함
- 그룹 간 연산자는 앞선 그룹 버튼(active) 기준으로 삽입됨
- 연산자 누락 또는 잘못된 배치 방지 위해 validateSearchQuery() 후단 검증 수행함

### 4.2 검색 조건 Summary
- updateSummary()가 모든 그룹 순회하여 "키워드" 형태로 문자열 구성함
- 5개 토큰마다 줄바꿈 → 가독성 확보함
- 날짜 필터 활성 시 AND (date clause) 자동 병합됨
- summary 영역 자체 컨텍스트 메뉴(복사/붙여넣기) 제공함
- 붙여넣기 시 parseSummaryAndCreateGroups()로 역파싱하여 UI 재구성함 (키워드/연산자/날짜 조건 복원함)

### 4.3 날짜 필터
- enable-date-filter 체크 시 date-filter-inputs 활성화됨
- 시작일/종료일 각각 YYYY-MM-DD 수집 → PubMed 구문용 YYYY/MM/DD로 변환하여 "( "시작"[Date - Publication] : "종료"[Date - Publication])" 패턴 구성함
- 단일 시작일만: "시작"~3000, 단일 종료일만: 1800~"종료" 범위 사용함
- Summary 및 실제 검색 쿼리 모두 동일 규칙 적용함
- 붙여넣기 역파싱 정규식으로 복구 지원함

### 4.4 PubMed API 파이프라인
단계별:
1) esearch.fcgi → term=검색식, retmax=10 제한 (확장 가능) → idlist 수신함
2) esummary.fcgi → id=comma-joined → result[id] 메타데이터 (title, authors[], source, pubdate 등) 수신함
3) efetch.fcgi → rettype=abstract 텍스트 → \n\n + 'PMID:' 경계로 분리하여 각 초록 매칭함
매핑 후 { pmid, title, authors[], source, pubdate, abstract } 객체 배열 생성함

### 4.5 결과 렌더링
- 표 헤더: PMID / Title / Authors / Journal / Date / Abstract
- Abstract 180자 초과 시 더보기 버튼 노출 → 모달(openAbstractModal)로 전체 표시함
- XSS 최소 방어: escapeHtml()로 &,<,>," 치환함
- 행 data-* 속성에 pmid, abstract 저장 → 모달 확장 시 사용함

### 4.6 저장 기능
- JSON: pretty JSON Blob 다운로드 (파일명 pubmed_search_results_YYYYMMDD_HHMM.json)
- Excel: SheetJS json_to_sheet → 컬럼 너비 추정 후 Results 시트로 저장함
- PDF: html2pdf 로더 ensureHtml2Pdf() → 동적 테이블 + 메타데이터(생성시각, 사용자, 쿼리, 레코드 수) 렌더 후 pdf 저장함
- CSV Fallback: Excel 오류 또는 라이브러리 로드 실패 시 saveAsCSV() 수행함
- 버튼 상태 updateSaveButtons()로 검색결과 존재 여부 반영함
- Excel 셀 길이 제한 보호: MAX_CELL=32760 → 초과 시 (cut) 처리함

### 4.7 클립보드 · 컨텍스트 메뉴 · 단축키
- navigator.clipboard 우선, 실패 시 안내 토스트만 (legacy execCommand fallback 최소화)
- 각 입력 및 summary 우클릭 시 커스텀 메뉴 표시 (복사/붙여넣기)
- 입력/summary 영역에서 Ctrl/Cmd + C/V 지원함
- 모든 성공/실패 상태 showToast()로 2초 표시함

### 4.8 사용자 인증/권한
- auth.js: localStorage 기반 userDatabase 유지 + sessionStorage 기반 세션 유지함
- 계정 필드: username / password / name / email / role / createdAt
- 기본 MASTER_USER 자동 보장함 (username=master)
- master: index.html 내 마스터 패널 접근 + 사용자 Excel 내보내기/가져오기 + 삭제 가능함
- user: main.html 접근 가능, 관리 기능 없음
- guest: main.html 접근 가능, 검색 가능, 지속 데이터 저장 없음 (명시적 기록 기능 현재 미구현)
- main-auth.js: main.html 진입 시 세션 검사 후 미로그인 → 다이얼로그 띄워 선택 제공함

### 4.9 사용자 데이터 Excel 입출력 (관리자)
- downloadUserData(): 현재 userDatabase를 'Users' 시트로 변환, (비밀번호 포함 → 실제 서비스에서는 제거 필요함)
- uploadUserData(): 파일 입력 → XLSX.sheet_to_json → 중복 username 제외 후 병합함
- createInitialExcelFile(): 마스터+샘플 사용자 4명 포함 템플릿 생성함
- loadUsersFromExcel(): 기존 데이터 통째로 교체(대체) 모드 함수 존재함

### 4.10 오류 및 예외 처리
- 전역 window.error / unhandledrejection 핸들러 설치 → results 패널에 간단 메시지 출력함
- 검색 네트워크 실패 시 빨간 경고 메시지 표시함
- Excel 라이브러리 CDN 다중 fallback 로딩 (main.html 내 인라인 스크립트) → 실패 시 alert 안내함
- PDF 라이브러리(html2pdf)도 복수 CDN 시도함

### 4.11 접근성 & UX 고려
- 버튼 title / 토스트로 피드백 제공함
- 포커스 가능한 summary(tabIndex=0) 설정함
- 모달 ESC 닫기 미구현 (향후 개선 가능) → 현재 배경 클릭/닫기 버튼 지원함
- 반응형: 헤더 이미지 크기 media query로 축소, 컨테이너 flex 구성

## 5. 보안/프라이버시 현황
- API Key 공개 상태(config.js 하드코딩) → 실제 프로덕션에서는 서버 프록시 또는 환경변수 치환 필요함
- 사용자 패스워드 평문 저장(localStorage) → 해시 미적용 위험 큼
- 역할 검증 클라이언트 단독 수행 → 변조 가능성 존재함 (서버 검증 부재)
- XSS: 키워드 입력값 표 렌더링 시 escapeHtml() 적용 → 기본적 방어, 그러나 summary 붙여넣기 파싱 단계도 추가 검증 여지 있음
- CSRF: 서버 상호작용 부재라 영향 낮음
- 데이터 유실: 로컬 스토리지 의존 → 브라우저 삭제 시 소실됨

## 6. 한계 및 제약
- 검색 결과 retmax=10 고정 → 대량 분석에는 부족함
- esummary / efetch 순차 호출 → 병렬 최적화/에러 부분 재시도 로직 없음
- 초록 매칭: 단순 분할(\n\n + PMID 패턴) → 포맷 변화 시 오동작 가능함
- 다국어/한글 인코딩 PDF 내 폰트 임베딩 미적용 → 특정 글자 깨짐 가능성 있음
- 사용자 감사 로그/활동 기록 없음
- 검색식 고급 필드(MeSH, 필드 태그 등) UI 미지원

## 7. 향후 개선 아이디어
1) API 키 서버 프록시화 + Rate Limit 보호 적용 필요함
2) 비밀번호 bcrypt 등 해시 저장 + 로그인 시도 제한 도입함
3) 검색 페이지네이션 도입(retstart + retmax 가변) 및 무한 스크롤 지원함
4) esummary/efetch 병렬 호출 + 실패 재시도(backoff) 로직 추가함
5) 초록 텍스트 구조적 XML 파싱 적용(efetch rettype=xml) → 저자/저널 필드 정밀화함
6) 고급 검색식 UI (괄호 그룹핑, NOT, 필드 선택) 추가함
7) 모달 ESC/키보드 포커스 트랩 추가 → 접근성 강화함
8) 결과 내보내기시 사용자/쿼리 메타 JSON 헤더 삽입
9) PDF 글꼴 서브셋 임베딩(Noto Sans KR) → 국제화 인쇄 품질 개선함
10) 요약 영역 실시간 구문 강조(syntax highlight) 도입함
11) 테스트 자동화 (Vitest/Jest + Playwright) 도입하여 회귀 방지함
12) Service Worker 캐시 전략 도입으로 오프라인 가능성 확장함

## 8. 파일별 세부 역할
| 파일 | 역할 요약 |
|------|-----------|
| index.html | 인증/등록/마스터 패널 진입 UI |
| main.html | 검색/결과/저장 UI 컨테이너 + XLSX 로더 |
| js/config.js | API 키 및 전역 설정 객체 선언 |
| js/auth.js | 회원가입, 로그인, 사용자 CRUD, Excel 입출력, 세션 관리 |
| js/main-auth.js | 메인 페이지 세션 검증, 헤더 UI, 게스트/리다이렉트 다이얼로그 |
| js/script.js | 키워드/날짜 필터, 검색 파이프라인, 결과 렌더, 저장(JSON/Excel/PDF/CSV), 모달, 토스트, 컨텍스트 메뉴 |
| css/login.css | 로그인/회원가입/마스터 패널 스타일 |
| css/style.css | 메인 레이아웃, 결과 테이블, 패널, 버튼 스타일 |

## 9. 함수 핵심 목록 (요약)
- copyToClipboard(text) / pasteFromClipboard(el)
- showToast(msg)
- createKeywordGroup(), createKeywordGroupWithValue(val, op)
- updateSummary(), buildSearchQuery(), parseSummaryAndCreateGroups(text)
- getDateFilterText(), initializeDateFilter()
- validateSearchQuery(query)
- search() → esearch → esummary → efetch → 통합
- saveAsJson(data), saveAsExcel(data), saveAsPDF(data), saveAsCSV(data)
- ensureHtml2Pdf(), loadXLSXLibrary()(main.html 인라인)
- initializeSaveFeatures(), updateSaveButtons(flag)
- ensureAbstractModal(), openAbstractModal(txt, pmid)
- Auth: initializeAuth(), handleLogin(), handleRegister(), enterAsGuest(), displayUserList(), downloadUserData(), uploadUserData(), createInitialExcelFile(), loadUsersFromExcel(), checkAuthStatus(), displayUserInfo()

## 10. 사용 시나리오 예
1) 신규 사용자 → index.html → 회원가입 → 로그인 → main.html 이동 → 키워드 + 날짜 → Search → 결과 확인 → Excel 저장
2) 마스터 → index.html 로그인 (master/master) → 사용자 Excel 템플릿 생성 → 외부에서 사용자 목록 편집 → 업로드 → 사용자 관리 후 main.html 이동
3) 게스트 → index.html → 게스트 입장 → main.html → 간단 검색 후 PDF로 공유

## 11. 빠른 컨벤션 요약
- 모든 키워드 검색어는 큰따옴표로 감쌈 → PubMed 정확도 향상 목적
- 날짜 범위는 Publication Date 필드 사용함
- 결과 수 기본 10건 (script.js retmax)
- 파일명 규칙: pubmed_results_YYYYMMDD_HHMM.(확장자)
- 로컬 저장소 키: userDatabase (전체 사용자), sessionStorage: currentUser

## 12. 배포/운영 주의
- 정적 호스팅( GitHub Pages 등 ) 가능함 → 단 API Key 노출됨
- 민감도 낮은 테스트/프로토타입 목적 사용 권장함
- 상용 전환 시 백엔드 게이트웨이 + 인증 토큰 + 암호화 저장 도입 필수임

## 13. 요약
간단하지만 검색식 작성 UX 강화 + 다중 포맷 결과 내보내기 + 로컬 인증/권한 구분 포함한 경량 PubMed 클라이언트임. 프로토타입 수준 구조로 빠른 실험/내부 시연 적합함. 보안·확장성·대량 처리·고급 검색 지원 영역은 향후 개선 대상임.

끝.