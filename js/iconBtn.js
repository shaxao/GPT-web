import { getActiveSessionId, AUTH_TOKEN, baseUrl, USER_NAME, USER_EAMIL, USER_AVATAR, setCookie, getCookie, clearCookie, saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './common.js'
import { postResults, fetchResults, fetchWithTimeout, loadImage } from './utils/request.js';
const biggerIcon = document.getElementById("biggerBtn");
const shareBtn = document.getElementById("shareBtn");
const registerBtn = document.getElementById("registerBtn");

function openModal(type) {
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');
  const container = document.getElementById('modalContainer');

  if (type === 'register') {
    title.textContent = '注册账号';
    content.innerHTML = `
    <form id="registrationForm" class="w-full">
    <label for="username" class=" block mb-2 text-token-text-secondary">用户名 (3-6个字符或数字):</label>
    <input type="text" name="username" id="username" required pattern="[A-Za-z0-9]{3,6}"
      class="w-full mb-4 rounded-xl border bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary"
      placeholder="输入用户名">
    <div id="usernameExists" class="text-red-500"></div>

    <label for="email" class="block mb-2 text-token-text-secondary">邮箱:</label>
    <input type="email" name="email" id="email" required
      class="w-full mb-4 rounded-xl border bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary"
      placeholder="输入邮箱">
    <div id="emailExists" class="text-red-500"></div>

    <label for="verificationCode" class="block mb-2 text-token-text-secondary">验证码:</label>
    <div class="flex items-center gap-4 mb-4">
      <input type="text" name="verfityCode" id="verificationCode" required
        class="flex-grow rounded-xl border bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary"
        placeholder="输入验证码">
      <button id='verfityBtn' type="button" class="btn btn-primary rounded-xl px-4 py-2 text-base font-bold">发送验证码</button>
    </div>

    <label for="password" class="block mb-2 text-token-text-secondary">密码
      (8-12数字、大小写字母):</label>
    <input type="password" name="password" id="password" required pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,12}"
      class="w-full  mb-4 rounded-xl border bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary"
      placeholder="输入密码">

    <div class="flex justify-center">
      <button type="submit" class="btn btn-primary rounded-xl px-4 py-3 text-base font-bold w-1/5">注册</button>
    </div>
    <p class="mt-3 text-sm text-token-text-tertiary text-center">已有账号? <a href="#"
        class="underline hover:text-token-text-quaternary">点击登录</a></p>
  </form>
    `;
  } else if (type === 'updateLink') {
    title.textContent = '更新指向聊天的公共链接';
    content.innerHTML = `
    <div class="w-full">
    <p class="mb-6 text-token-text-secondary">
      <span>您的姓名以及您在共享后添加的任何消息都将予以保密处理。
      </span>
    </p>
  </div>
  <div
    class="mb-2 flex items-center justify-between rounded-2xl border border-token-border-medium bg-token-main-surface-primary p-2 text-token-text-secondary last:mb-2 juice:rounded-full">
    <div class="relative ml-1 flex-grow">
      <input type="text" id="shareValue" readonly=""
        class="w-full rounded-xl border-0 bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary"
        value="https://chatgpt.com/share/...">
      <div
        class="pointer-events-none absolute bottom-0 right-0 top-0 w-12 bg-gradient-to-l from-token-main-surface-primary">
      </div>
    </div>
    <button id="copyShareButton"
      class="btn relative btn-primary ml-4 mr-0 mt-0 rounded-xl px-4 py-3 text-base font-bold" as="button">
      <div id="copyContent" class="flex w-full gap-2 items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
          class="icon-md">
          <path fill="currentColor" fill-rule="evenodd"
            d="M18.293 5.707a4.657 4.657 0 0 0-6.586 0l-1 1a1 1 0 0 1-1.414-1.414l1-1a6.657 6.657 0 1 1 9.414 9.414l-1 1a1 1 0 0 1-1.414-1.414l1-1a4.657 4.657 0 0 0 0-6.586m-2.586 2.586a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414l6-6a1 1 0 0 1 1.414 0m-9 1a1 1 0 0 1 0 1.414l-1 1a4.657 4.657 0 0 0 6.586 6.586l1-1a1 1 0 0 1 1.414 1.414l-1 1a6.657 6.657 0 1 1-9.414-9.414l1-1a1 1 0 0 1 1.414 0"
            clip-rule="evenodd"></path>
        </svg>复制链接
      </div>
    </button>
  </div>
  <div class="w-full">
    <p class="mb-3 text-sm text-token-text-tertiary">实际啥都没有。经费不足，页面暂无。
    </p>
  </div>
    `;
  } else if (type === 'login') {
    title.textContent = '登录';
    content.innerHTML = `
    <form id="loginForm" class="w-full">
      <label for="loginUsername" class="block mb-2 text-token-text-secondary">用户名:</label>
      <input type="text" id="loginUsername" name="username" required
        class="w-full mb-4 rounded-xl border bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary"
        placeholder="输入用户名">

      <label for="loginPassword" class="block mb-2 text-token-text-secondary">密码:</label>
      <input type="password" id="loginPassword" name="password" required
        class="w-full mb-4 rounded-xl border bg-token-main-surface-primary px-2 py-2.5 text-lg text-token-text-tertiary"
        placeholder="输入密码">

      <div class="flex justify-center">
        <button type="submit" class="btn btn-primary rounded-xl px-4 py-3 text-base font-bold w-1/5">登录</button>
      </div>
      <p class="mt-3 text-sm text-token-text-tertiary text-center">没有账号? <a href="#"
          class="underline hover:text-token-text-quaternary">注册新账号</a></p>
    </form>

    `;
  }

  container.style.display = 'block';
}

// showLogin();

/**
 * 登录模块是否显示
 */
function showLogin() {
  if (getCookie(AUTH_TOKEN) === null || getCookie(AUTH_TOKEN) === '') {
    document.getElementById('avLoginUser').style.display = 'none';
    document.getElementById('unLoginDiv').style.display = 'block';
  } else {
    document.getElementById('unLoginDiv').style.display = 'none';
    document.getElementById('user-set').style.height = '40px';
    document.getElementById('avLoginUser').style.display = 'block';
    document.querySelector('.login-menu-text').textContent = getCookie(USER_EAMIL);
    document.querySelector('.user-name').textContent = getCookie(USER_NAME);
    document.querySelector('.user-img').src = loadFromLocalStorage(USER_AVATAR);
  }
}

/**
 * 退出登录
 */
document.getElementById('logOut').addEventListener('click', async function () {
  try {
    const data = await postResults(`${baseUrl}/api/user/logout`, getCookie(AUTH_TOKEN));
    if (data.code == 200) {
      clearCookie(AUTH_TOKEN);
      clearCookie(USER_EAMIL);
      clearCookie(USER_NAME);
      clearLocalStorage(USER_AVATAR);
      document.getElementById('avLoginUser').style.display = 'none';
      document.getElementById('unLoginDiv').style.display = 'block';
      document.getElementById('user-set').style.height = '170px';
      showAlert(data.msg, true);
    } else {
      showAlert(data.msg, false);
    }

  } catch (error) {
    showAlert('请求错误: ' + error, false);
  }
});


function closeAlert() {
  const closeAlert = document.getElementById('closeAlert');
  closeAlert.addEventListener('click', () => {
    const alertBox = document.getElementById('customAlert');
    alertBox.classList.remove('open');
  })
  closeAlert.click();
}

let alertTimeout;
export function showAlert(message, isSuccess, duration = 3000) {
  const alertBox = document.getElementById('customAlert');
  const alertMessage = document.getElementById('alertMessage');
  alertMessage.textContent = message;
  alertBox.classList.add('open');
  if (isSuccess) {
    alertBox.classList.add('alert-success');
    alertBox.classList.remove('alert-failure');
  } else {
    alertBox.classList.add('alert-failure');
    alertBox.classList.remove('alert-success');
  }
  // 自动关闭弹窗
  if (alertTimeout) {
    clearTimeout(alertTimeout);
  }

  // 设置新的定时器
  alertTimeout = setTimeout(() => {
    closeAlert();
  }, duration);
}


/**
 * 关闭模态框
 */
function closeModal() {
  document.getElementById('modalContainer').style.display = 'none';
}

document.getElementById('closeModalButton').addEventListener('click', closeModal);


/**
 * 注册模块
 */
registerBtn.addEventListener('click', function (event) {
  event.stopPropagation();
  openModal('register');
  document.getElementById('registrationForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const jsonData = {};

    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    fetch(`${baseUrl}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    })
      .then(response => response.json())
      .then(data => {
        // console.log('Response data:', data);
        if (data.code === 200) {
          // console.log('Auth token:', data.data.token);
          // 清空表单
          showAlert('注册成功', true);
          document.getElementById('registrationForm').reset();
          // console.log('token:', getToken("auth_token"));
        }
      })
      .catch(error => showAlert('请求失败: ' + error, false));
  });
  document.getElementById('verfityBtn').addEventListener('click', function () {
    this.disabled = true;
    let timeLeft = 60;
    const email = document.getElementById('email').value;
    this.textContent = `${timeLeft} 秒后重新发送`;
    const interval = setInterval(() => {
      timeLeft -= 1;
      this.textContent = `${timeLeft} 秒后重新发送`;
      if (timeLeft <= 0) {
        clearInterval(interval);
        this.textContent = '发送验证码';
        this.disabled = false;
      }
    }, 1000);
    const url = new URL(`${baseUrl}/api/user/email/code?email=${email}`);
    fetch(url, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        if (data.code === 500 || data.code === 400) {
          showAlert(data.msg, false);
        } else {
          showAlert(data.msg, true);
        }
      })
      .catch(error => showAlert('请求失败: ' + error, false));
  });

  document.getElementById('username').addEventListener('input', debounce(function () {
    checkAvailability(this.value, 'username');
  }, 500));

  document.getElementById('email').addEventListener('input', debounce(function () {
    checkAvailability(this.value, 'email');
  }, 500));
});

function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

function checkAvailability(value, type) {
  const url = new URL(`${baseUrl}/api/user/${type}`);
  url.search = new URLSearchParams({ [type]: value }).toString();

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 500 || data.code === 400) {
        document.getElementById(`${type}Exists`).textContent = data.msg;
      } else {
        document.getElementById(`${type}Exists`).textContent = '';
      }
    })
    .catch(error => console.error('Error:', error));
}


/**
 * 登录模块
 */

document.getElementById('loginBtn').addEventListener('click', function (event) {
  event.stopPropagation();
  openModal('login');
  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetchWithTimeout(`${baseUrl}/login`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        // console.log('Response data:', data);
        if (data.code === 200) {
          // console.log('Auth token:', data.data.token);
          setCookie(AUTH_TOKEN, data.data.token, 7);
          closeModal();
          document.getElementById('unLoginDiv').style.display = 'none';
          document.getElementById('user-set').style.height = '40px';
          document.getElementById('avLoginUser').style.display = 'block';
          document.querySelector('.login-menu-text').textContent = data.data.email;
          document.querySelector('.user-name').textContent = data.data.username;
          document.querySelector('.user-img').src = data.data.avatar;
          showAlert(data.data.status, true)
          setCookie(USER_EAMIL, data.data.email, 7);
          setCookie(USER_NAME, data.data.username, 7);
          saveToLocalStorage(USER_AVATAR, data.data.avatar);
          location.reload();
          // console.log('token:', getToken("auth_token"));
        } else {
          showAlert(data.msg, false);
          return;
        }
      })
      .catch(error => showAlert('请求失败: ' + error, false));
  });

});




/**
 * 分享模块
 */
shareBtn.addEventListener('click', function (event) {
  event.stopPropagation();
  openModal('updateLink');
  const shareValue = document.getElementById("shareValue");
  const sessionId = getActiveSessionId();
  shareValue.value = `${baseUrl}/share/${sessionId}`;
  const copyBtn = document.getElementById("copyShareButton");
  copyBtn.addEventListener('click', function () {
    const shareValue = document.getElementById("shareValue");
    navigator.clipboard.writeText(shareValue.value).then(function () {
      const copyContent = document.getElementById("copyContent");
      copyContent.textContent = '已复制';
      copyBtn.style.backgroundColor = 'rgba(75, 75, 75, 1)';
      setTimeout(function () {
        copyBtn.style.backgroundColor = 'rgba(13, 13, 13, 1)';
        copyContent.textContent = '复制链接';
      }, 2000);
      console.log('shareValue', shareValue.value);
    }).catch(function (err) {
      console.error('Could not copy text: ', err);
    });

  });
});




/**
 * 会话头部按钮
 */
// biggerIcon.addEventListener('click', function () {
//   biggerIcon.src = "../svg/smaller.svg";
//   const rootStyle = document.documentElement.style;
//   if (rootStyle.getPropertyValue('--home-width') !== '100vw') {
//     // 设置 CSS 变量为全屏尺寸
//     document.querySelector(".home").style.borderRadius = "0";
//     rootStyle.setProperty('--home-width', '100vw');
//     rootStyle.setProperty('--home-height', '100%');
//     rootStyle.setProperty('--home-max-width', '100vw');
//     rootStyle.setProperty('--home-max-height', '100%');

//     // 隐藏滚动条
//     document.body.style.overflow = 'hidden';
//   } else {
//     document.querySelector(".home").style.borderRadius = "10px";
//     biggerIcon.src = "../svg/bigger.svg";
//     // 恢复到初始尺寸
//     rootStyle.setProperty('--home-width', '90vw');
//     rootStyle.setProperty('--home-height', 'auto');
//     rootStyle.setProperty('--home-max-width', '1200px');
//     rootStyle.setProperty('--home-max-height', '90vh');
//     // 显示滚动条
//     document.body.style.overflow = '';
//   }
// });

