// 📄 파일명: js/main-auth.js - 메인 페이지 인증 관리

// 메인 페이지 인증 상태 관리
window.currentUser = window.currentUser || null;

// 페이지 로드 시 인증 상태 확인
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  setupMainPageAuth();
});

// 인증 상태 확인
function checkAuthStatus() {
  const savedUser = sessionStorage.getItem('currentUser');
  
  if (!savedUser) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    showLoginRedirectDialog();
    return;
  }
  
  try {
    window.currentUser = JSON.parse(savedUser);
    displayUserInfo();
  } catch (e) {
    console.error('사용자 정보 파싱 실패:', e);
    sessionStorage.removeItem('currentUser');
    showLoginRedirectDialog();
  }
}

// 사용자 정보 표시
function displayUserInfo() {
  const userInfoEl = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (userInfoEl && window.currentUser) {
    let userDisplayName = window.currentUser.name || window.currentUser.username;
    let userRole = '';
    
    switch(window.currentUser.role) {
      case 'master':
        userRole = '🔧 마스터';
        break;
      case 'user':
        userRole = '👤 사용자';
        break;
      case 'guest':
        userRole = '👥 게스트';
        break;
      default:
        userRole = '👤 사용자';
    }
    
    userInfoEl.innerHTML = `
      <div class="user-display">
        <span class="user-role">${userRole}</span>
        <span class="user-name">${userDisplayName}</span>
      </div>
    `;
    
    // 로그아웃 버튼 표시
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
    }
    
    // 게스트 사용자인 경우 안내 메시지 표시
    if (window.currentUser.role === 'guest') {
      showGuestWelcomeMessage();
    }
  }
}

// 게스트 환영 메시지
function showGuestWelcomeMessage() {
  setTimeout(() => {
    const guestAlert = document.createElement('div');
    guestAlert.className = 'guest-alert';
    guestAlert.innerHTML = `
      <div class="guest-message">
        <h3>👥 게스트 모드로 접속하셨습니다</h3>
        <p>모든 기능을 사용할 수 있지만, 검색 기록은 저장되지 않습니다.</p>
        <div class="guest-actions">
          <button onclick="goToLogin()" class="btn-primary">회원가입 하기</button>
          <button onclick="closeGuestAlert()" class="btn-secondary">계속 사용</button>
        </div>
      </div>
    `;
    
    guestAlert.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    document.body.appendChild(guestAlert);
    
    // 5초 후 자동 닫기
    setTimeout(() => {
      closeGuestAlert();
    }, 5000);
  }, 1000);
}

// 로그인 페이지로 리다이렉트 다이얼로그
function showLoginRedirectDialog() {
  const redirectDialog = document.createElement('div');
  redirectDialog.className = 'login-redirect-dialog';
  redirectDialog.innerHTML = `
    <div class="redirect-message">
      <h2>🔐 로그인이 필요합니다</h2>
      <p>PubMed 검색 도구를 사용하려면 로그인해주세요.</p>
      <div class="redirect-actions">
        <button onclick="goToLogin()" class="btn-primary">로그인 페이지로 이동</button>
        <button onclick="enterAsGuestFromMain()" class="btn-guest">게스트로 계속</button>
      </div>
    </div>
  `;
  
  redirectDialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  document.body.appendChild(redirectDialog);
}

// 메인 페이지 인증 설정
function setupMainPageAuth() {
  // 헤더 스타일 업데이트
  updateHeaderStyles();
  
  // 검색 기능에 사용자 정보 추가
  if (typeof updateSummary === 'function') {
    const originalUpdateSummary = updateSummary;
    updateSummary = function() {
      originalUpdateSummary();
      // 사용자별 검색 제한 또는 특별 기능 추가 가능
    };
  }
}

// 헤더 스타일 업데이트
function updateHeaderStyles() {
  const header = document.querySelector('header');
  if (header) {
    // 기존 스타일을 유지하면서 새로운 클래스 추가
    header.classList.add('auth-enabled');
  }
  
  // CSS 스타일 동적 추가
  const style = document.createElement('style');
  style.textContent = `
    header.auth-enabled {
      display: flex;
      align-items: center;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .header-left img {
      height: 160px; /* 세로 2배 */
      width: auto; /* 비율 유지 */
      margin: 0;
      object-fit: contain;
      display: inline-block;
    }

    @media (max-width: 900px) { .header-left img { height: 130px; } }
    @media (max-width: 600px) { .header-left img { height: 100px; } }
    
    .header-left h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .user-display {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.9rem;
      color: #4b0082;
    }
    
    .user-role {
      font-weight: 600;
      font-size: 0.8rem;
    }
    
    .user-name {
      font-weight: 400;
      opacity: 0.8;
    }
    
    .logout-btn {
      background: rgba(255, 255, 255, 0.2);
      color: #4b0082;
      border: 1px solid rgba(75, 0, 130, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
    
    .guest-alert .guest-message,
    .login-redirect-dialog .redirect-message {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .guest-message h3,
    .redirect-message h2 {
      color: #4b0082;
      margin-bottom: 1rem;
    }
    
    .guest-message p,
    .redirect-message p {
      margin-bottom: 1.5rem;
      color: #666;
      line-height: 1.5;
    }
    
    .guest-actions,
    .redirect-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .guest-actions button,
    .redirect-actions button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: #4b0082;
      color: white;
    }
    
    .btn-primary:hover {
      background: #3d006b;
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: transparent;
      color: #4b0082;
      border: 1px solid #4b0082;
    }
    
    .btn-secondary:hover {
      background: #4b0082;
      color: white;
    }
    
    .btn-guest {
      background: #6c757d;
      color: white;
    }
    
    .btn-guest:hover {
      background: #5a6268;
    }
    
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
      
      .header-left {
        flex-direction: column;
        text-align: center;
      }
      
      .header-left h1 {
        font-size: 1.2rem;
      }
      
      .guest-actions,
      .redirect-actions {
        flex-direction: column;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// 유틸리티 함수들
function goToLogin() {
  window.location.href = 'index.html';
}

function enterAsGuestFromMain() {
  const guestUser = {
    username: 'guest',
    name: 'Guest User',
    role: 'guest'
  };
  
  window.currentUser = guestUser;
  sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
  
  // 다이얼로그 제거
  const dialog = document.querySelector('.login-redirect-dialog');
  if (dialog) {
    dialog.remove();
  }
  
  // 사용자 정보 표시
  displayUserInfo();
}

function closeGuestAlert() {
  const alert = document.querySelector('.guest-alert');
  if (alert) {
    alert.remove();
  }
}

function logout() {
  if (confirm('정말 로그아웃하시겠습니까?')) {
    window.currentUser = null;
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }
}

// 전역 함수 노출
window.goToLogin = goToLogin;
window.enterAsGuestFromMain = enterAsGuestFromMain;
window.closeGuestAlert = closeGuestAlert;
window.logout = logout;

// 검색 기능과 연동
document.addEventListener('DOMContentLoaded', function() {
  // 검색 실행 시 사용자 로깅 (옵션)
  if (typeof search === 'function') {
    const originalSearch = window.search;
    window.search = function() {
      // 사용자 활동 로깅 (필요한 경우)
      // User activity tracking removed for production
      return originalSearch();
    };
  }
});
