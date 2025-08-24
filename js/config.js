// js/config.js
// NOTE: Gemini (Google Generative AI) API Key 역시 클라이언트 노출 금지. 프로덕션에서는 서버 프록시 사용 권장.
const CONFIG = {
  NCBI_API_KEY: '08124ae567c620f0d8c067fbdaceab202009',
  GEMINI_API_KEY: 'AIzaSyD-VpjTfzE2m1O87j-kGZdp1QkQd55evhQ', // 로컬 테스트용 placeholder
  GEMINI_MODEL: 'gemini-1.5-flash' // 속도 우선. 정확도 필요시 gemini-1.5-pro 등 교체 가능
};