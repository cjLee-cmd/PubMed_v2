// js/config.js
// NOTE: OpenAI 키는 클라이언트에 노출되므로 실제 운영 환경에서는 절대 직접 포함하지 말 것.
// 프록시 서버(or Edge Function) 통해 비공개 유지 권장.
const CONFIG = {
  NCBI_API_KEY: '08124ae567c620f0d8c067fbdaceab202009',
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE', // TODO: 사용자 로컬에서만 임시 설정
  OPENAI_MODEL: 'gpt-4o-mini' // 필요 시 변경 가능
};