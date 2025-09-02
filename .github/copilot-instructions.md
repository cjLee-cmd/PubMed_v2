# Copilot Project Instructions

This file provides codebase-specific guidance for AI coding agents working on this repository.
Keep responses concise, implement directly when possible, and follow the concrete patterns defined here.

## 1. Project Overview
Pure client-side PubMed search & basic auth demo hosted statically (e.g. GitHub Pages). No build system, no bundler. Assets loaded directly from HTML via script/link tags. All logic is in plain ES6 JavaScript under `js/`.

Key concerns:
- Security is intentionally lightweight (educational). Plain-text passwords & master account exist (DO NOT present as production-ready). Avoid adding server-dependent features unless requested.
- Large monolithic `script.js` (~1200+ lines) implements keyword builder, clipboard utilities, date filter, PubMed API calls, export (JSON/Excel/CSV), and UI state.
- Auth handled entirely in-browser using `localStorage` (user db) + `sessionStorage` (session) (`auth.js`, `main-auth.js`).

## 2. Directory & Roles
```
index.html        Login / register / master panel
main.html         Search interface + results & export
css/              Styles (login.css, style.css)
js/
  config.js       CONFIG.NCBI_API_KEY (public)
  auth.js         Login, register, Excel user import/export
  main-auth.js    Session enforcement & header UI on main page
  script.js       Search UI, keyword logic, PubMed API, export
assets/           Static images (logo)
Docs: README-LOGIN.md, SW_Technical_Specification.md, explain.md
```
No build/test toolchain present. Add new JS/CSS directly; keep paths relative from HTML.

## 3. Core Data Flows
- Search Flow: UI keywords -> build search query -> `esearch` (PMIDs) -> `esummary` (metadata) -> `efetch` (abstract text). Results assembled into array of objects `{ pmid, title, authors[], source, pubdate, abstract }` and displayed via `<pre>` JSON.
- Export Flow: `currentSearchResults` (global) -> JSON stringify OR transformed to Excel (SheetJS) OR CSV fallback.
- Auth Flow: `userDatabase` (localStorage JSON) mutated on register/import/delete. `currentUser` stored in sessionStorage for active page. Master user triggers management panel.

## 4. External Dependencies
- PubMed NCBI E-utilities (rate limits: 10 req/sec with key). Use three endpoints only; keep sequence or parallelize summary/fetch only if asked.
- SheetJS (XLSX) loaded via multiple CDN fallback in `main.html`. `index.html` uses single CDN. If adding export features ensure XLSX present (wrap in the existing `window.xlsxLoadPromise` pattern).

## 5. Patterns & Conventions
- DOM Access: Direct `document.getElementById / querySelector`; no framework. Defer init with `DOMContentLoaded` listeners. If extending initialization, consolidate rather than adding more nested `setTimeout` calls.
- State: Globals (`currentSearchResults`, `window.xlsxReady`, `currentUser`). When adding new state prefer a single `window.AppState` object rather than more scattered globals.
- String Assembly: Summary + query builder duplicated (`updateSummary`, `buildSearchQuery`). If modifying keyword logic, change both or refactor to shared utility.
- Defensive Coding: Use `textContent` over `innerHTML` for user inputs (XSS avoidance). Keep that invariant.
- Excel Export: Truncates long text to < 32760 chars; field set includes placeholders (DOI, Keywords, URL) that are currently empty. If removing/adding fields update both the transform and export headers.

## 6. Known Issues (Preserve Unless Tasked)
- Plain-text passwords & master account.
- Mixed field names (`source` vs `Journal` in export). Consistency improvement OK if coordinated.
- Potential function name mismatch: `diagnoseExcel()` vs `diagnoseExcelIssue()`. Fix if touched.
- Date format inconsistency (`-` vs `/`). If normalizing provide migration note in commit message.

## 7. Adding Features
- Keep zero-build: avoid bundlers unless explicitly approved.
- Add new JS modules as separate files in `js/` and include via `<script>` tag at end of HTML. Maintain load order: config -> auth/main-auth (if auth needed) -> functional modules -> `script.js` (or refactored modules).
- Prefer progressive enhancement: if XLSX load fails, maintain JSON/CSV fallbacks.
- Pagination: Use `retstart` & `retmax` parameters; store `lastSearchQuery` + offsets in a lightweight state object.

## 8. Refactoring Guidance
- Safe first split of `script.js`: extract (a) keyword UI + parsing, (b) PubMed API client, (c) export utilities.
- Ensure extracted modules do not rely on hoisting order—explicitly attach needed globals to `window`.
- Provide backwards compatibility shim (e.g. keep `search()` on `window`).

## 9. Auth File Changes
If editing `auth.js` / `main-auth.js`:
- Keep existing global function exposures (UI buttons depend on inline `onclick`). If removing inline handlers, migrate HTML to `addEventListener` AND remove attributes in same PR.
- NEVER include real secrets. Do not implement server calls without request.

## 10. Documentation Updates
- When altering behavior, update: `README-LOGIN.md` (auth), `explain.md` (feature), `SW_Technical_Specification.md` (architecture). Mention any removed exports or renamed fields.

## 11. Style & Lint
- No linter enforced. Keep formatting consistent with existing (2-space indent). Avoid large unrelated reformat diffs.

## 12. Commit / PR Guidance
- Describe user-visible changes (search, export, auth) + note any data shape adjustments.
- If touching export/query logic include before/after example queries or a sample exported row in description.

## 13. Quick Reference Examples
- PubMed query example generated: `"covid" AND "vaccine" AND ("2023/01/01"[Date - Publication] : "2023/12/31"[Date - Publication])`
- Result object sample: `{ pmid: "123456", title: "Sample", authors: ["A"], source: "Nature", pubdate: "2024", abstract: "..." }`

## 14. Out of Scope (Unless Requested)
- Server-side auth, encryption, backend persistence.
- Framework migration (React/Vue/etc.).
- Build pipeline introduction.

## 15. Custom Instruction
- Every Dialog Should Saved in markdown format. '.github/dialogs/'

---
Provide incremental, minimal-diff changes; ask for clarifications only when a requirement is ambiguous or conflicts with these patterns.
