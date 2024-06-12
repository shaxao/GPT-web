export const models = ["gpt-4o", "gpt-4", "gpt-3.5-turbo", "gpt-3.5-tubo-0301", "gpt-3.5-turbo-0613", "gpt-3.5-turbo-1106", "gpt3.5-turbo-16k", "gpt-3.5-turbo-16k-0613", "gpt3.5-turbo-instnut", "gpt-4-0314", "gpt-4-0613", "gpt-4-1106-preview", "gpt-4-32k", "gpt-4-vision-preview", "gpt-4-turbo", "dall-e-3", "stable-diffusion", "SparkDesk-v3.5", "gemini-pro", "gemini-pro-v", "glm-4-all", "qwen-turbo", "qwen-plus", "qwen-max"];
// 后端路由
export const baseUrl = "http://localhost";
// 语音处理默认使用chat2api
export const audioUrl = 'https://api.oaifree.com';
export const audioKey = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJzZXNzaW9uX2lkIjoiM1RfMTc5RnJMbzgtMk5QOFZxTVJlSjlyOXFiTVhtM3AiLCJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhbmRyZXduYXNyOThAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy1Rc2xSUVNzT0R4QmRya29FS1VaWHRGTEkiLCJ1c2VyX2lkIjoidXNlci13S2pCOGtFRmJXc3ZEZm5SUTlRVEVsVWcifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6ImF1dGgwfDYzOGQyYWU3MTM1ZjYxYWI1YTFhYmUxYiIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MTc1NTY4OTIsImV4cCI6MTcxODQyMDg5Miwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MiLCJhenAiOiJwZGxMSVgyWTcyTUlsMnJoTGhURTlWVjliTjkwNWtCaCJ9.RGqVVMyCYHetWCyxhb7r0IC7MTuxqD1ggdahXnvSBFxpW4JWaBSJDbQAbJMGy1zgKe1U23BD5gk9AnwErkyWxQ9f8ZDyX2lOB5vLf8C8meHTFnEWZ3GAzku8hovywFQrJVxmUuRMLEvIUe2VIP99YdZPoNzCnmWozblIUJRHXYSexWXfjEVkMbToj3G0g10XgpDltb53dMScPGxu-AGYSZHPwRgC-v_r1PjKhjsjby2I-6Pca5KjFimlFSgWCAuB6ZQ_8grQNs_Vs7js7Dgc8KBme0fuFLqErCG5Qk2BSu1QPG5ZGbcW2lepeVxgSo_T85YV5poGIO_IuWcgOLxP9A';
// local中保存api信息
export const API_URL = 'apiUrl';
export const API_KEY = 'apiKey';
export const AUTH_TOKEN = 'auth_token';
// cookie中存储用户信息
export const USER_NAME = 'user_name';
export const USER_EAMIL = 'user_email';
// local中存储图片base64
export const USER_AVATAR = 'user_avatar';
// https://chat.oaifree.com/dad04481-fa3f-494e-b90c-b822128073e5
// gpts数据默认从此直接获取，聊天接口需要在设置页面进行设置，前端尚未写，但是选中默认获取gizmoID作为模型名直接发送，根据API中转自行定义修改，从chatBox.getAttribute('gizmo');获取
let openaiBaseUrl = "https://chat.oaifree.com/dad04481-fa3f-494e-b90c-b822128073e5";
let authToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJzZXNzaW9uX2lkIjoiM1RfMTc5RnJMbzgtMk5QOFZxTVJlSjlyOXFiTVhtM3AiLCJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhbmRyZXduYXNyOThAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy1Rc2xSUVNzT0R4QmRya29FS1VaWHRGTEkiLCJ1c2VyX2lkIjoidXNlci13S2pCOGtFRmJXc3ZEZm5SUTlRVEVsVWcifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6ImF1dGgwfDYzOGQyYWU3MTM1ZjYxYWI1YTFhYmUxYiIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MTc1NTY4OTIsImV4cCI6MTcxODQyMDg5Miwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MiLCJhenAiOiJwZGxMSVgyWTcyTUlsMnJoTGhURTlWVjliTjkwNWtCaCJ9.RGqVVMyCYHetWCyxhb7r0IC7MTuxqD1ggdahXnvSBFxpW4JWaBSJDbQAbJMGy1zgKe1U23BD5gk9AnwErkyWxQ9f8ZDyX2lOB5vLf8C8meHTFnEWZ3GAzku8hovywFQrJVxmUuRMLEvIUe2VIP99YdZPoNzCnmWozblIUJRHXYSexWXfjEVkMbToj3G0g10XgpDltb53dMScPGxu-AGYSZHPwRgC-v_r1PjKhjsjby2I-6Pca5KjFimlFSgWCAuB6ZQ_8grQNs_Vs7js7Dgc8KBme0fuFLqErCG5Qk2BSu1QPG5ZGbcW2lepeVxgSo_T85YV5poGIO_IuWcgOLxP9A";
let fileExplare = '';
let activeSessionId = null; // 当前活跃会话的标识符
let currentActiveChatBox = null;

export function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; Secure; SameSite=Strict";
}

export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

// 从 localStorage 读取的函数
export function loadFromLocalStorage(key) {
  return localStorage.getItem(key);
}

export function clearLocalStorage(key) {
  localStorage.removeItem(key);
}


export function clearCookie(name) {
  setCookie(name, "", 0);
}

/**
  * 滚轮监控
  */

// 创建按钮元素
export function scrollChat() {
  let scrollButton = document.createElement('button');
  scrollButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
        class="icon-md m-1 text-token-text-primary">
        <path fill="currentColor" fill-rule="evenodd"
        d="M12 21a1 1 0 0 1-.707-.293l-7-7a1 1 0 1 1 1.414-1.414L11 17.586V4a1 1 0 1 1 2 0v13.586l5.293-5.293a1 1 0 0 1 1.414 1.414l-7 7A1 1 0 0 1 12 21"
        clip-rule="evenodd"></path>
    </svg>`;
  scrollButton.classList.add('cursor-pointer', 'absolute', 'z-10', 'rounded-full', 'bg-clip-padding', 'border', 'text-token-text-secondary', 'border-token-border-light', 'right-1/2', 'juice:translate-x-1/2', 'bg-token-main-surface-primary', 'bottom-5');
  scrollButton.style.display = 'none';
  const inputArea = document.querySelector('.input-area');
  const rect = inputArea.getBoundingClientRect();
  scrollButton.style.bottom = `${window.innerHeight - rect.top + 20}px`;;
  // 添加按钮到容器
  const chatBox = getCurrentActiveChatBox();
  const chatContent = document.getElementById('chat-content');
  chatBox.appendChild(scrollButton);

  // 按钮点击事件：滚动到chat-content的底部
  scrollButton.addEventListener('click', function () {
    chatContent.scrollTo({
      top: chatContent.scrollHeight,
      behavior: 'smooth'
    });
  });

  // 检测滚动条位置，以判断是否显示按钮
  chatContent.addEventListener('scroll', function () {
    // console.log('scrool', chatContent.scrollHeight);
    // console.log('chatContent', chatContent.scrollTop);
    // console.log('chatBox', chatContent.clientHeight);
    const isAtBottom = chatContent.scrollHeight - (chatContent.scrollTop + chatContent.clientHeight) < 1;
    scrollButton.style.display = isAtBottom ? 'none' : 'block';
  });
}




export function setOpenaiBaseUrl(openaiBaseUrl) {
  openaiBaseUrl = openaiBaseUrl;
}

export function getOpenaiBaseUrl() {
  return openaiBaseUrl;
}

export function setAuthToken(authToken) {
  authToken = authToken;
}

export function getAuthToken() {
  return authToken;
}

export function setActiveSessionId(sessionId) {
  activeSessionId = sessionId;
}

export function setCurrentActiveChatBox(chatBox) {
  currentActiveChatBox = chatBox;
}

export function getActiveSessionId() {
  return activeSessionId;
}

export function getCurrentActiveChatBox() {
  return currentActiveChatBox;
}

export function setFileExplare(value) {
  fileExplare = value;
}

export function getFileExplare() {
  return fileExplare;
}

export class Message {
  constructor() {
    this.messageId = '';
    this.parentId = '';
    this.content = '';
    this.conversationId = '';
    this.model = '';
    this.gizmo = '';
    this.contentType = '';
    this.firstFlag = false;
  }
}

export class GlobalModeSet {
  constructor() {
    this.models = models;
    this.promot = [];
    this.webProxyUrl = "",
      this.accessToken = "";
    this.tempertaure = 0.35;
    this.topP = 0.9;
    this.maxTokens = 4000;
    this.presencePenalty = 0;
    this.frequencyPenalty = 0;
    this.baseUrl = "";
    this.apiKey = "";
  }
}
