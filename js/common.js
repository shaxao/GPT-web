export const models = ["gpt-4o", "gpt-4", "gpt-3.5-turbo", "gpt-3.5-tubo-0301", "gpt-3.5-turbo-0613", "gpt-3.5-turbo-1106", "gpt3.5-turbo-16k", "gpt-3.5-turbo-16k-0613", "gpt3.5-turbo-instnut", "gpt-4-0314", "gpt-4-0613", "gpt-4-1106-preview", "gpt-4-32k", "gpt-4-vision-preview", "gpt-4-turbo", "dall-e-3", "stable-diffusion", "SparkDesk-v3.5", "gemini-pro", "gemini-pro-v", "glm-4-all", "qwen-turbo", "qwen-plus", "qwen-max"];
// 后端路由
export const baseUrl = "/api";
// 语音处理默认使用chat2api
export const audioUrl = 'https://api.oaifree.com';
export const audioKey = '';
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
let authToken = "";
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
