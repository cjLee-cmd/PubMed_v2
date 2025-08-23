# 소프트웨어 구조 문서 (SW-Structure)

버전: 1.0.0  
작성일: 2025-08-23  
대상: Acuzenic PubMed 검색 · 사용자 인증 · 결과 내보내기 웹 클라이언트  
스타일: 음슴체

---
## 1. 목적
전체 코드베이스 구조 / 컴포넌트 책임 / 데이터 및 제어 흐름 / 의존성 / 한계와 개선 포인트 정리함. 유지보수와 확장 설계 기준 자료로 활용 목적임.

---
## 2. 상위 개념 아키텍처
구성 3 레이어 유사 모델임 (정식 계층 분리는 아님):
1) Presentation (HTML + CSS + DOM 조작 JS)  
2) Application Logic (검색 로직, 키워드 관리, 인증 흐름, 저장 기능)  
3) Integration (NCBI E-utilities API 호출, 외부 라이브러리 SheetJS / html2pdf 로딩)

서버 백엔드 없음 → 모든 로직/상태 클라이언트(브라우저) 내 존재함.

---
## 3. 파일 체계 요약
| 분류 | 파일 | 역할 |
|------|------|------|
| 진입 | `index.html` | 로그인/회원가입/마스터 관리 UI 컨테이너 |
| 기능 | `main.html` | PubMed 검색/결과/내보내기 UI 컨테이너 |
| 설정 | `js/config.js` | 전역 CONFIG (API Key) 정의 |
| 인증 | `js/auth.js` | 사용자 DB(localStorage) + 세션(sessionStorage) + 마스터 패널 로직 |
| 인증 확장 | `js/main-auth.js` | main.html 페이지 접근 제어 및 헤더 사용자 표시, 게스트 안내 |
| 검색코어 | `js/script.js` | 키워드 그룹, 날짜 필터, 검색 파이프라인(esearch→esummary→efetch), 결과 렌더, 내보내기(JSON/Excel/PDF/CSV) |
| 스타일 | `css/login.css` | 인증 페이지 스타일 |
| 스타일 | `css/style.css` | 메인 검색/결과 레이아웃 스타일 |
| 리소스 | `assets/APTS_Logo.png` | 로고 |
| 문서 | `explain.md` | 기능 상세 설명서 |
| 문서 | `User Manual.md` | 사용자 매뉴얼 |
| 문서 | `SW-Structure.md` | (본 문서) 구조 설명 |

---
## 4. 주요 모듈 책임 (Responsibilities)
| 모듈 | 책임 핵심 |
|------|----------|
| config | 외부 API Key 보관 (현재 하드코딩) |
| auth | 사용자 생성/검증/삭제, Excel 입출력, 초기 마스터 보장 |
| main-auth | 세션 검사, 비로그인 안내 모달, 헤더 UI 동적 구성 |
| script (검색) | 키워드/날짜 입력 관리, 쿼리 문자열 생성, API 연쇄 호출, 결과 표/모달/토스트 관리 |
| export (script 내부) | JSON/Excel/CSV/PDF 변환/다운로드, 라이브러리 동적 로딩 처리 |
| ui helpers | 토스트, 컨텍스트 메뉴, 모달, 버튼 활성화, 파싱 역구성 |

---
## 5. 데이터 모델
### 5.1 사용자 (localStorage: `userDatabase`)
```json
{
  "username": "string",
  "password": "string(평문)",
  "name": "string",
  "email": "string",
  "role": "master|user|guest",
  "createdAt": "ISO8601"
}
```
정렬/인덱스 없음. 기본 배열 append. 삭제 시 splice.

### 5.2 세션 (sessionStorage: `currentUser`)
동일 구조. 탭별 세션 유지. 브라우저 종료 시 소멸.

### 5.3 검색 결과 (전역: `currentSearchResults`)
```json
{
  "pmid": "string",
  "title": "string",
  "authors": ["Author Name", ...],
  "source": "Journal Title",
  "pubdate": "YYYY-MM-DD|PubMed 형식 원문",
  "abstract": "string"
}
```

### 5.4 키워드 그룹 (DOM 기반 상태)
실제 데이터 구조 객체화 X. DOM `.keyword-group` 컬렉션 순회로 런타임 파생.

---
## 6. 상태 관리 전략
| 상태 유형 | 저장 위치 | 지속성 | 비고 |
|-----------|-----------|--------|------|
| 사용자 DB | localStorage | 지속 | 비밀번호 평문 → 보안 취약 |
| 세션 사용자 | sessionStorage | 탭생명주기 | role 기반 UI 전환 |
| 검색 조건 | DOM Inputs | 세션 | 붙여넣기 역파싱 지원 |
| 검색 결과 | 전역 변수 + DOM table | 휘발 | 새 검색 시 덮어씀 |
| 라이브러리 로드 여부 | window.xlsxReady / Promise | 세션 | Excel/PDF 의존 |

---
## 7. 제어 흐름 (주요 시나리오)
### 7.1 인증 시퀀스 (의사 다이어그램)
```
사용자 → index.html 로드
  → auth.initializeAuth()
    → localStorage.userDatabase 로드
    → master 사용자 존재 확인/추가
  → 로그인 submit
    → handleLogin() → 사용자 배열 탐색 → 매칭 실패시 오류 → 성공 시 sessionStorage 저장
    → role == master ? master 패널 표시 : main.html 리다이렉트
```

### 7.2 PubMed 검색 시퀀스
```
사용자 → 키워드/AND/OR/날짜 입력
  → Search 클릭
    → buildSearchQuery() -> 문자열 생성
    → validateSearchQuery()
    → fetch esearch (idlist)
      → idlist 비어있으면 결과 없음 처리 종료
      → fetch esummary (메타데이터)
      → fetch efetch (abstract text)
    → 세 응답 병합 → currentSearchResults 세팅
    → 표 렌더 + 저장 버튼 활성화
```

### 7.3 결과 내보내기 (Excel)
```
사용자 → Excel 버튼
  → saveAsExcel() 호출
    → xlsxLoadPromise await
    → 데이터 sanitize + json_to_sheet
    → auto width 계산 -> writeFile -> 토스트
    → 실패 시 saveAsCSV() fallback
```

### 7.4 PDF 내보내기
```
사용자 → PDF 버튼
  → ensureHtml2Pdf() (CDN 다중시도)
  → HTML 컨테이너 구성 (헤더 메타 + 테이블)
  → html2pdf().from(node).set(opts).save()
  → 토스트 표시
```

---
## 8. 유효성 및 방어 로직
| 범주 | 방법 | 한계 |
|------|------|------|
| 검색식 논리 | 정규식으로 말미 AND/OR, 연속 연산자 차단 | 괄호 중첩/NOT 미지원 |
| XSS | 결과 렌더 시 escapeHtml() | 붙여넣기 역파싱 단계 부분 미검증 가능성 |
| 라이브러리 로드 | 다중 CDN 시도 → 실패 alert | 네트워크 지연/중간 실패 재시도 지연 제어 없음 |
| Excel Cell Overflow | 길이 > 32760 절단 | 데이터 손실 표시 '(cut)' 문자열 외 메타 없음 |
| 에러 표면화 | window error/unhandledrejection → results 영역 메시지 | 사용자 친화적 분류/코드 없음 |

---
## 9. 의존성
| 종류 | 항목 | 사용 목적 |
|------|------|----------|
| 외부 CDN | SheetJS (xlsx) | Excel 내보내기/가공 |
| 외부 CDN | html2pdf.js | PDF 생성 |
| Web API | fetch | HTTP 요청 |
| Web API | navigator.clipboard | 복사/붙여넣기 기능 |
| Web API | Blob / URL.createObjectURL | 다운로드 파일 생성 |
| Web API | sessionStorage/localStorage | 상태/데이터 영속 |

서드파티 패키지 번들링/버전 잠금 없음 → CDN 가용성 의존 높음.

---
## 10. 성능 고려 사항
| 영역 | 현재 | 잠재 이슈 | 개선 후보 |
|------|------|-----------|-----------|
| API 호출 | 순차 3회 | 레이턴시 누적 | esummary + efetch 병렬화 |
| 렌더링 | 결과 10행 테이블 | 대량 확장 시 메모리/DOM 부하 | pagination / 가상 스크롤 |
| Excel/PDF | 전체 메모리 변환 | 대형 결과 시 OOM 위험 | 스트리밍/청크 처리 |
| 키워드 파싱 | 간단 split/정규식 | 복잡 괄호/구문 확장 어려움 | 토큰화 파서 도입 |

---
## 11. 확장 포인트
| 대상 | 제안 |
|------|------|
| 인증 | 서버 API / JWT / 암호 해시 / 권한 미들웨어 |
| 검색 | retmax UI 옵션 + Lazy Load (retstart) |
| 고급 쿼리 | 괄호 그룹, NOT, 필드 선택(MeSH, [TIAB], [MH]) |
| 결과 뷰 | 열 선택/정렬/필터, 하이라이트(키워드 매칭) |
| 로그 | 검색 히스토리 저장 + 재실행 기능 |
| 보안 | CSP, SRI, API Key 제거 (프록시) |
| i18n | 다국어 리소스 JSON 분리 |
| 테스트 | Unit (함수), E2E (검색 플로우), 스냅샷(PDF/Excel 헤더) |
| 접근성 | ARIA 라벨, 키보드 트랩, 모달 ESC 지원 |

---
## 12. 리스크 분석
| 번호 | 리스크 | 영향 | 우선순위 | 완화 전략 |
|------|--------|------|----------|-----------|
| R1 | API Key 노출 | 남용/쿼터 소진 | 높음 | 서버 프록시/환경변수 빌드 |
| R2 | 비밀번호 평문 저장 | 계정 탈취 | 높음 | 해시+서버 검증 |
| R3 | CDN 의존 | 기능 마비 | 중간 | 다중 캐시/자체 호스팅 |
| R4 | 검색 확장성 부족 | 사용자 불만 | 중간 | 페이지네이션/캐시 |
| R5 | 초록 파싱 취약 | 데이터 불일치 | 낮음 | XML 기반 파싱 |
| R6 | XSS 부분 검증 부족 | 보안 취약 | 중간 | 파서 단계 escape/검증 통합 |

---
## 13. 코드 품질 관찰 포인트
| 항목 | 현상 | 개선 |
|------|------|------|
| 전역 변수 | currentSearchResults, DEBUG_MODE 등 산재 | IIFE/모듈 패턴 or ES Module 전환 |
| 함수 길이 | search(), saveAsExcel() 비교적 장형 | 세부 책임 분리 (fetch 단계, 변환 단계) |
| 하드코딩 | retmax=10, 셀 제한 값 | 설정 상수 Config 분리 |
| 중복 로직 | 키워드 그룹 생성 & withValue 변형 | 공통 팩토리 + 옵션 사용 |
| 에러 처리 | 콘솔 + 토스트/alert 혼재 | 통합 ErrorHandler 모듈 |

---
## 14. 개선 로드맵(우선순위)
1) 보안 기초: 비밀번호 해시 + API Key 비공개화
2) 검색 UX 확장: retmax 옵션 + 페이지네이션 + 고급 쿼리 UI
3) 구조 재편: ES Module 도입, 빌드 파이프라인(Vite/Rollup) 적용
4) 테스트 체계: 핵심 함수 단위 테스트 + E2E(Playwright) 구성
5) 접근성/국제화: ARIA, 다국어 번들
6) 성능: 병렬 호출 + Lazy/Infinite Scroll 반영
7) 품질 자동화: ESLint + Prettier + Git Hook

---
## 15. 의사 코드 (핵심 흐름 추상화)
```pseudo
Function searchFlow():
  query <- buildSearchQuery()
  if not validate(query): showError; return
  ids <- callEsearch(query, limit=retmax)
  if ids empty: showNoResult; return
  [summaryMap, abstracts] <- parallel(
     callEsummary(ids),
     callEfetch(ids)
  )  // (미래개선: 현재는 순차)
  results <- merge(summaryMap, abstracts)
  renderTable(results)
  enableExportButtons()
```

```pseudo
Function exportExcel(results):
  ensureXLSXLoaded()
  sheetData <- sanitize(results, maxCell)
  ws <- jsonToSheet(sheetData)
  autoFit(ws)
  writeFile(wb)
```

---
## 16. 유지보수 체크리스트
| 변경 유형 | 점검 항목 |
|----------|-----------|
| API 확장 | 호출 URL, 파라미터 인코딩, rate limit 관리 |
| UI 수정 | 키워드 그룹 DOM 구조 → 파싱/복사 로직 영향 여부 |
| 저장 기능 | 라이브러리 버전 호환성 / 브라우저 Blob 지원 |
| 보안 강화 | 저장소 마이그레이션(plain→hash) 스크립트 필요 |
| 성능 개선 | fetch 병렬화 시 에러 재시도/partial failure 처리 |

---
## 17. 결론
현 구현은 순수 클라이언트 프로토타입으로 간단/직관 장점 있음. 다만 보안·확장성·고급 검색/성능 영역에서 구조적 개선 여지 큼. 본 구조 문서 기반 단계적 모듈화 및 서버 컴포넌트 도입 진행 권장함.

끝.
