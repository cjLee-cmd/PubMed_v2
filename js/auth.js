// 📄 파일명: js/auth.js - 로그인 및 사용자 관리 시스템

// 전역 변수
let currentUser = null;
let userDatabase = [];
let isMasterMode = false;

// 기본 마스터 사용자
const MASTER_USER = {
  username: 'master',
  password: 'master',
  name: 'Master Admin',
  email: 'master@acuzenic.com',
  role: 'master',
  createdAt: new Date().toISOString()
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  initializeAuth();
  setupEventListeners();
  loadUserDatabase();
});

// 인증 시스템 초기화
function initializeAuth() {
  // 세션 체크
  const savedUser = sessionStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    if (currentUser.role === 'master') {
      // 현재 페이지에 마스터 패널이 존재할 때만 표시 (index.html 전용)
      if (document.getElementById('master-panel')) {
        showMasterPanel();
      }
    } else if (currentUser.role !== 'guest') {
      // 일반 사용자(user)는 index.html 접근 시 main.html로 이동
      if (!location.pathname.endsWith('main.html')) {
        window.location.href = 'main.html';
      }
    } else {
      // 게스트는 index.html에서 회원가입/로그인 폼 접근 허용 (리다이렉트하지 않음)
      // 필요 시 자동으로 로그인 폼 보이도록 유지
      // 추가 UX: 게스트가 index.html에 오면 회원가입 폼 바로 보여주고 싶다면 아래 주석 해제
      // showRegisterForm();
    }
  }

  // LocalStorage에서 사용자 데이터베이스 로드
  const savedDatabase = localStorage.getItem('userDatabase');
  if (savedDatabase) {
    try {
      userDatabase = JSON.parse(savedDatabase);
    } catch (e) {
      console.error('사용자 데이터베이스 로드 실패:', e);
      userDatabase = [];
    }
  }

  // 마스터 사용자가 없으면 추가
  const masterExists = userDatabase.find(user => user.username === 'master');
  if (!masterExists) {
    userDatabase.push(MASTER_USER);
    saveUserDatabase();
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 로그인 폼
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // 회원가입 폼
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // 파일 업로드
  const fileInput = document.getElementById('userDataFile');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  // 키보드 이벤트 (Enter 키)
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const activeForm = document.querySelector('.login-form:not([style*="display: none"]), .register-form:not([style*="display: none"])');
      if (activeForm) {
        const submitBtn = activeForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.click();
        }
      }
    }
  });
}

// 로그인 처리
async function handleLogin(e) {
  e.preventDefault();
  showLoading(true);

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    // 입력값 검증
    if (!username || !password) {
      throw new Error('사용자 ID와 비밀번호를 모두 입력해주세요.');
    }

    // 사용자 인증
    const user = userDatabase.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('사용자 ID 또는 비밀번호가 잘못되었습니다.');
    }

    // 로그인 성공
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    showAlert('로그인 성공!', 'success');
    
    // 마스터 사용자인 경우 관리 패널 표시
    if (user.role === 'master') {
      setTimeout(() => {
        showMasterPanel();
      }, 1000);
    } else {
      // 일반 사용자는 메인 페이지로 이동
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 1000);
    }

  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// 회원가입 처리
async function handleRegister(e) {
  e.preventDefault();
  showLoading(true);

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const passwordConfirm = document.getElementById('reg-password-confirm').value;
  const email = document.getElementById('reg-email').value.trim();
  const name = document.getElementById('reg-name').value.trim();

  try {
    // 입력값 검증
    if (!username || !password || !passwordConfirm || !email || !name) {
      throw new Error('모든 필드를 입력해주세요.');
    }

    if (!isValidUsername(username)) {
      throw new Error('사용자 ID는 4-20자의 영문, 숫자만 사용 가능합니다.');
    }

    if (!isValidPassword(password)) {
      throw new Error('비밀번호는 8자 이상이어야 합니다.');
    }

    if (password !== passwordConfirm) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    if (!isValidEmail(email)) {
      throw new Error('올바른 이메일 주소를 입력해주세요.');
    }

    // 중복 사용자 체크
    if (userDatabase.find(u => u.username === username)) {
      throw new Error('이미 존재하는 사용자 ID입니다.');
    }

    if (userDatabase.find(u => u.email === email)) {
      throw new Error('이미 존재하는 이메일 주소입니다.');
    }

    // 새 사용자 생성
    const newUser = {
      username,
      password,
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    userDatabase.push(newUser);
    saveUserDatabase();

    showAlert('회원가입이 완료되었습니다!', 'success');
    
    // 로그인 폼으로 이동
    setTimeout(() => {
      showLoginForm();
    }, 1500);

  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// 게스트 모드 입장
function enterAsGuest() {
  showLoading(true);
  
  const guestUser = {
    username: 'guest',
    name: 'Guest User',
    role: 'guest'
  };
  
  currentUser = guestUser;
  sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
  
  showAlert('게스트 모드로 입장합니다.', 'success');
  
  setTimeout(() => {
    window.location.href = 'main.html';
  }, 1000);
}

// 폼 전환 함수들
function showLoginForm() {
  const lf = document.getElementById('login-form');
  const rf = document.getElementById('register-form');
  const mp = document.getElementById('master-panel');
  if (lf) lf.style.display = 'block';
  if (rf) rf.style.display = 'none';
  if (mp) mp.style.display = 'none';
  clearFormErrors();
}

function showRegisterForm() {
  const lf = document.getElementById('login-form');
  const rf = document.getElementById('register-form');
  const mp = document.getElementById('master-panel');
  if (lf) lf.style.display = 'none';
  if (rf) rf.style.display = 'block';
  if (mp) mp.style.display = 'none';
  clearFormErrors();
}

function showMasterPanel() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const masterPanel = document.getElementById('master-panel');
  
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  if (masterPanel) masterPanel.style.display = 'block';
  
  isMasterMode = true;
  displayUserList();
}

// 마스터 패널 기능들
function displayUserList() {
  const userListEl = document.getElementById('user-list');
  // main.html 등 해당 요소가 없으면 조용히 무시
  if (!userListEl) return;

  if (userDatabase.length === 0) {
    userListEl.innerHTML = '<p>등록된 사용자가 없습니다.</p>';
    return;
  }

  const userListHTML = userDatabase.map((user, index) => `
    <div class="user-item">
      <div class="user-info">
        <strong>${user.username} (${user.name})</strong>
        <small>${user.email} | ${user.role} | ${new Date(user.createdAt).toLocaleDateString('ko-KR')}</small>
      </div>
      ${user.role !== 'master' ? `<button onclick="deleteUser(${index})" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">삭제</button>` : ''}
    </div>
  `).join('');

  userListEl.innerHTML = userListHTML;
}

function deleteUser(index) {
  if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
    userDatabase.splice(index, 1);
    saveUserDatabase();
    displayUserList();
    showAlert('사용자가 삭제되었습니다.', 'success');
  }
}

// Excel 다운로드
function downloadUserData() {
  try {
    const workbook = XLSX.utils.book_new();
    
    // 사용자 데이터를 Excel 형식으로 변환
    const userData = userDatabase.map(user => ({
      '사용자ID': user.username,
      '이름': user.name,
      '이메일': user.email,
      '권한': user.role,
      '생성일': new Date(user.createdAt).toLocaleString('ko-KR'),
      '비밀번호': user.password // 실제 서비스에서는 보안상 제외해야 함
    }));

    const worksheet = XLSX.utils.json_to_sheet(userData);
    
    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 15 }, // 사용자ID
      { wch: 15 }, // 이름
      { wch: 25 }, // 이메일
      { wch: 10 }, // 권한
      { wch: 20 }, // 생성일
      { wch: 15 }  // 비밀번호
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    
    // 파일 다운로드
    const fileName = `acuzenic_users_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    showAlert('사용자 데이터가 다운로드되었습니다.', 'success');
  } catch (error) {
    console.error('Excel 다운로드 실패:', error);
    showAlert('Excel 다운로드에 실패했습니다.', 'error');
  }
}

// Excel 업로드
function uploadUserData() {
  loadUsersFromExcel();
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 데이터 검증 및 변환
      const importedUsers = jsonData.map(row => ({
        username: row['사용자ID'] || row['username'],
        name: row['이름'] || row['name'],
        email: row['이메일'] || row['email'],
        role: row['권한'] || row['role'] || 'user',
        password: row['비밀번호'] || row['password'] || 'changeme123',
        createdAt: row['생성일'] ? new Date(row['생성일']).toISOString() : new Date().toISOString()
      }));

      // 기존 데이터와 병합 (중복 제거)
      const existingUsernames = userDatabase.map(u => u.username);
      const newUsers = importedUsers.filter(u => !existingUsernames.includes(u.username));

      if (newUsers.length > 0) {
        userDatabase.push(...newUsers);
        saveUserDatabase();
        displayUserList();
        showAlert(`${newUsers.length}명의 새 사용자가 추가되었습니다.`, 'success');
      } else {
        showAlert('새로 추가된 사용자가 없습니다.', 'warning');
      }

    } catch (error) {
      console.error('Excel 파일 읽기 실패:', error);
      showAlert('Excel 파일을 읽는데 실패했습니다.', 'error');
    }
  };

  reader.readAsBinaryString(file);
  e.target.value = ''; // 파일 입력 초기화
}

// 유틸리티 함수들
function isValidUsername(username) {
  return /^[a-zA-Z0-9]{4,20}$/.test(username);
}

function isValidPassword(password) {
  return password.length >= 8;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveUserDatabase() {
  try {
    localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
  } catch (e) {
    console.error('사용자 데이터베이스 저장 실패:', e);
  }
}

function loadUserDatabase() {
  try {
    const saved = localStorage.getItem('userDatabase');
    if (saved) {
      userDatabase = JSON.parse(saved);
    }
  } catch (e) {
    console.error('사용자 데이터베이스 로드 실패:', e);
    userDatabase = [];
  }
}

// UI 헬퍼 함수들
function showLoading(show) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.style.display = show ? 'flex' : 'none';
  }
}

function showAlert(message, type = 'info') {
  const alertEl = document.getElementById('alert');
  const messageEl = document.getElementById('alert-message');
  
  if (alertEl && messageEl) {
    messageEl.textContent = message;
    alertEl.className = `alert ${type}`;
    alertEl.style.display = 'flex';
    
    // 3초 후 자동 숨김
    setTimeout(() => {
      hideAlert();
    }, 3000);
  }
}

function hideAlert() {
  const alertEl = document.getElementById('alert');
  if (alertEl) {
    alertEl.style.display = 'none';
  }
}

function clearFormErrors() {
  document.querySelectorAll('.form-group input').forEach(input => {
    input.classList.remove('error', 'success');
  });
}

// 메인 페이지로 이동
function goToMainPage() {
  if (currentUser) {
    window.location.href = 'main.html';
  } else {
    showAlert('먼저 로그인해주세요.', 'warning');
  }
}

// 로그아웃
function logout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  showAlert('로그아웃되었습니다.', 'success');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// 초기 엑셀 파일 생성
function createInitialExcelFile() {
  try {
    const workbook = XLSX.utils.book_new();
    
    // 기본 사용자 데이터 (마스터 + 샘플 사용자들)
    const initialUsers = [
      {
        '사용자ID': 'master',
        '이름': 'Master Admin',
        '이메일': 'master@acuzenic.com',
        '권한': 'master',
        '생성일': new Date().toLocaleString('ko-KR'),
        '비밀번호': 'master'
      },
      {
        '사용자ID': 'admin',
        '이름': '관리자',
        '이메일': 'admin@acuzenic.com',
        '권한': 'user',
        '생성일': new Date().toLocaleString('ko-KR'),
        '비밀번호': 'admin123'
      },
      {
        '사용자ID': 'user1',
        '이름': '사용자1',
        '이메일': 'user1@acuzenic.com',
        '권한': 'user',
        '생성일': new Date().toLocaleString('ko-KR'),
        '비밀번호': 'user123'
      },
      {
        '사용자ID': 'researcher',
        '이름': '연구원',
        '이메일': 'researcher@acuzenic.com',
        '권한': 'user',
        '생성일': new Date().toLocaleString('ko-KR'),
        '비밀번호': 'research123'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(initialUsers);
    
    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 15 }, // 사용자ID
      { wch: 15 }, // 이름
      { wch: 25 }, // 이메일
      { wch: 10 }, // 권한
      { wch: 20 }, // 생성일
      { wch: 15 }  // 비밀번호
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    
    // 파일 다운로드
    const fileName = `acuzenic_users_initial_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    showAlert('초기 사용자 엑셀 파일이 다운로드되었습니다.', 'success');
  } catch (error) {
    console.error('초기 엑셀 파일 생성 실패:', error);
    showAlert('초기 엑셀 파일 생성에 실패했습니다.', 'error');
  }
}

// 엑셀 파일에서 사용자 데이터 로드
function loadUsersFromExcel() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.xlsx,.xls';
  fileInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 데이터 검증 및 변환
        const loadedUsers = jsonData.map(row => ({
          username: row['사용자ID'] || row['username'],
          name: row['이름'] || row['name'],
          email: row['이메일'] || row['email'],
          role: row['권한'] || row['role'] || 'user',
          password: row['비밀번호'] || row['password'] || 'changeme123',
          createdAt: row['생성일'] ? new Date(row['생성일']).toISOString() : new Date().toISOString()
        }));

        // 유효성 검증
        const validUsers = loadedUsers.filter(user => 
          user.username && user.password && user.name && user.email
        );

        if (validUsers.length > 0) {
          // 기존 데이터 대체
          userDatabase = validUsers;
          saveUserDatabase();
          showAlert(`엑셀 파일에서 ${validUsers.length}명의 사용자를 로드했습니다.`, 'success');
          
          // 마스터 모드에서는 사용자 목록 업데이트
          if (isMasterMode) {
            displayUserList();
          }
        } else {
          showAlert('유효한 사용자 데이터를 찾을 수 없습니다.', 'error');
        }

      } catch (error) {
        console.error('엑셀 파일 읽기 실패:', error);
        showAlert('엑셀 파일을 읽는데 실패했습니다.', 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  fileInput.click();
}

// 전역 함수로 노출
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.enterAsGuest = enterAsGuest;
window.downloadUserData = downloadUserData;
window.uploadUserData = uploadUserData;
window.deleteUser = deleteUser;
window.hideAlert = hideAlert;
window.goToMainPage = goToMainPage;
window.logout = logout;
window.createInitialExcelFile = createInitialExcelFile;
window.loadUsersFromExcel = loadUsersFromExcel;
