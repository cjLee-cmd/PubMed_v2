# 로컬 개발 가이드

## 1. 개요
이 프로젝트는 순수 정적(HTML/CSS/JS) 구조로 구성되어 있어 간단한 정적 서버에서 실행 가능함.

## 2. 필수 조건
- 최신 브라우저 (Chrome, Edge, Firefox 등)
- (선택) Python 3.x 또는 Node.js (정적 서버 실행 목적)

## 3. 실행 옵션
### 3.1 VS Code Task 사용
1. VS Code에서 워크스페이스 열기
2. Command Palette (⇧⌘P) → "Run Task" 입력
3. 아래 중 하나 선택:
   - Serve (Python 8000)
   - Serve (Node 8000)
4. 브라우저에서 http://localhost:8000/index.html 접속

### 3.2 Python 내장 서버
```bash
python3 -m http.server 8000
```

### 3.3 Node http-server (전역 설치 없이 npx)
```bash
npx http-server -p 8000
```

## 4. 개발 편의 설정
- `.vscode/tasks.json` 에 두 가지 서버 태스크 정의됨
- 필요 시 포트 변경: tasks.json 또는 명령행 `8000` → 원하는 포트로 수정

## 5. AI(Gemini) 분석 기능 로컬 테스트
1. `js/config.js` 에 `GEMINI_API_KEY` 실제 키 임시 입력 (노출 위험 인지)
2. 로컬 서버 통해 `main.html` 접속 (file:// 직접 열기 시 CORS 이슈 가능성 줄이기 위해 http 사용 권장)
3. 검색 실행 → 초록 더보기 → [AI 분석] 클릭 → 4개 필드 추출 결과 확인
4. 키 제거 잊지 말 것 (커밋 금지)

## 6. 안전한 키 사용 권장 (프로덕션)
- 자체 서버(프록시) 구축 → 클라이언트에서 초록 텍스트 전달 → 서버에서 Gemini 호출 후 결과 반환
- Rate limit / 키 오용 방지 로깅 적용
- 응답 캐싱(같은 PMID+모델 조합 재사용)

## 7. 일반 개발 흐름
1. 새 기능 브랜치 생성: `git checkout -b feature/xxx`
2. 코드 수정 후 브라우저 새로고침으로 즉시 확인
3. 변경 스테이징 + 커밋: `git add . && git commit -m "feat: ..."`
4. 원격 푸시: `git push origin feature/xxx`
5. PR 생성 후 코드 리뷰

## 8. 문제 해결
| 증상 | 조치 |
|------|------|
| 서버 포트 충돌 | 다른 프로세스 종료 또는 포트 변경 (예: 8080) |
| Gemini 분석 실패 | API Key 확인 / 네트워크 / 콘솔 오류 메시지 확인 |
| Excel 다운로드 실패 | CDN 차단 여부 확인 / 네트워크 재시도 / CSV Fallback 확인 |
| PDF 한글 깨짐 | 다른 브라우저 시도 / 폰트 임베딩 향후 개선 예정 |

## 9. 권장 브라우저 콘솔 명령
| 목적 | 명령 |
|------|------|
| Excel 진단 | `diagnoseExcel()` |
| CSV 테스트 | `testCSVExport()` |
| Excel 테스트 | `testExcelExport()` |

## 10. 주의사항
- 민감 데이터/키 커밋 금지
- 브랜치 머지 전 rebase 또는 최신 main 병합
- 대량 API 호출 자제 (PubMed rate limit 고려)

끝.
