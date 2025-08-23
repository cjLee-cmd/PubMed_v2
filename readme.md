# PubMed_v2 (Acuzenic PubMed Search Tool)

간단/경량 웹 기반 PubMed 논문 검색 + 결과 내보내기 + 로컬 사용자 관리 프로토타입임.

## ✨ 핵심 특징
- 키워드 그룹 + AND/OR 조합식 시각적 구성
- 발행일(날짜) 범위 필터 추가 가능
- 실시간 검색식 미리보기 & 역파싱 붙여넣기 지원
- PubMed E-utilities 3단계 호출 (esearch → esummary → efetch) 통합 결과 표시
- 결과 표 + Abstract 모달(더보기)
- JSON / Excel(XLSX) / PDF / (Fallback CSV) 내보내기
- 사용자 역할: guest / user / master (마스터는 사용자 Excel 관리)
- 완전 클라이언트 사이드 (서버 없음)

## 🗂 디렉터리 개요
```
index.html        # 로그인/회원가입/마스터 패널
main.html         # 검색 & 결과 UI
js/
  auth.js         # 인증/사용자 관리
  main-auth.js    # 메인 페이지 세션/헤더 처리
  script.js       # 검색·저장 핵심 로직
  config.js       # API Key (데모용 하드코딩)
css/
  login.css       # 인증 화면 스타일
  style.css       # 메인 UI 스타일
assets/           # 로고 등
explain.md        # 기능 상세
User Manual.md    # 사용자 매뉴얼
SW-Structure.md   # 구조/아키텍처 문서
```

## 🚀 빠른 시작 (로컬)
1. 저장소 클론 또는 ZIP 다운로드
2. `index.html` 브라우저로 직접 열기 (로컬 파일 접근 가능)
3. (선택) 회원가입 또는 master 계정(`master/master`) 로그인
4. `main.html`에서 키워드 입력 → Search → 결과 확인/내보내기

> Excel/PDF 기능은 CDN 외부 스크립트 로드 필요 → 인터넷 연결 필수.

## 🔍 검색 사용법 요약
1. 첫 키워드 입력 후 AND 또는 OR 누르면 새 그룹 자동 생성됨
2. 날짜 필터 체크 후 시작/종료일 설정 (선택)
3. Search → 상단 10개 결과 표시 (코드 retmax=10)
4. Abstract 길면 더보기 버튼으로 전체 확인

## 💾 내보내기 포맷
| 포맷 | 용도 | 비고 |
|------|------|------|
| JSON | 구조 보존/연계 | 원본 필드 유지 |
| Excel | 보고/정리 | SheetJS 사용, 길이 제한 컷 처리 |
| PDF | 공유/인쇄 | html2pdf.js 사용, 일부 축약 |
| CSV (Fallback) | Excel 실패 대비 | BOM 포함 (한글 안정) |

## 👤 사용자 역할
| 역할 | 설명 |
|------|------|
| guest | 로그인 없이 검색 및 내보내기 (세션 종료 시 상태 소멸) |
| user  | 회원가입 후 로그인 유지(세션 내) |
| master| 사용자 목록 Excel 관리 / 삭제 / 초기 템플릿 생성 |

## ⚠ 보안 주의 (프로토타입 한계)
- API Key 클라이언트 노출 (실서비스 시 백엔드 프록시 필요)
- 비밀번호 평문 localStorage 저장 (배포 금지; 해시/서버 인증 필수)
- 권한 검증 전적으로 클라이언트 의존 → 변조 가능

## 🛠 개선 로드맵 (요약)
1. 서버 인증 + 비밀번호 해시
2. 페이지네이션 & retmax 옵션 / 고급 쿼리 (괄호, NOT, 필드 태그)
3. 모듈화(ESM) + 빌드 파이프라인(Vite/Rollup)
4. 테스트 (Jest/Vitest + Playwright)
5. PDF 폰트 임베딩 및 전체 초록 선택 옵션
6. 검색 히스토리 저장 & 재실행 기능

## 📄 추가 문서
- `explain.md` : 상세 기능 기술 문서
- `User Manual.md` : 사용자 안내서
- `SW-Structure.md` : 내부 구조/아키텍처
- `README-LOGIN.md` : (기존) 로그인 관련 문서

## 🧪 간단 테스트 체크리스트
| 항목 | 기대 결과 |
|------|-----------|
| 키워드 2개 AND | Summary에 "" 포함 AND 표시 |
| 날짜 범위 설정 | Summary 끝에 날짜 구문 추가 |
| 결과 0건 | "검색 결과가 없습니다" 메시지 표시 |
| Excel 저장 | xlsx 파일 다운로드 |
| PDF 저장 | pdf 파일 다운로드 |
| Summary 붙여넣기 | 키워드 그룹 자동 재생성 |

## 📜 라이선스
`LICENSE.md` 참조.

## 🙋 문의/피드백
버그/요청 → 저장소 이슈 작성 권장.

끝.
